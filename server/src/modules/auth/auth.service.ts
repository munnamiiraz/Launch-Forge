import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import { UserStatus } from "../../constraint/index";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";
import { IRequestUser } from "../../interfaces/requestUser.interface";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ioRedis } from "../../lib/redis";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterPatientPayload } from "./auth.interface";



const registerUser = async (payload: IRegisterPatientPayload) => {
    const { name, email, password } = payload;

    const data = await auth.api.signUpEmail({
        body: {
            name,
            email,
            password,
            //default values
            // needsPasswordChange: false,
            // role: Role.PATIENT
        }
    })

    if (!data.user) {
        // throw new Error("Failed to register patient");
        throw new AppError(status.BAD_REQUEST, "Failed to register patient");
    }

    // better-auth handles user creation via the prismaAdapter, 
    // so we don't need to manually create the user here.
    // We can just use the user object returned from signUpEmail.
    const user = data.user as any;

    // DATABASE VERIFICATION: Explicitly check if the user was persisted to the database
    const dbUserCheck = await prisma.user.findUnique({
        where: { id: user.id }
    });
    
    if (dbUserCheck) {
        console.log(`✅ SUCCESS: User ${user.email} (ID: ${user.id}) found in database.`);
        // AUTO-VERIFY for production speed/robustness
        await prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true }
        });
        user.emailVerified = true; 
    } else {
        console.warn(`❌ WARNING: User ${user.email} (ID: ${user.id}) was NOT found in database!`);
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    }
}


const loginUser = async (payload: ILoginUserPayload) => {
    const { email, password } = payload;

    const data = await auth.api.signInEmail({
        body: {
            email,
            password,
        }
    })

    // better-auth natively handles creating the session in the DB during signInEmail.
    const sessionToken = (data as any)?.session?.token || (data as any)?.token;
    const user = data.user as any;


    if (user.status === UserStatus.SUSPENDED) {
        throw new AppError(status.FORBIDDEN, "User is suspended");
    }

    if (user.isDeleted || user.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User is deleted");
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status: user.status,
        isDeleted: user.isDeleted,
        emailVerified: user.emailVerified,
    });

    return {
        ...data,
        accessToken,
        refreshToken,
    };

}

const getMe = async (user : IRequestUser) => {
    const [isUserExists, workspace, payment] = await Promise.all([
        prisma.user.findUnique({
            where : { id : user.id },
            select : {
                id : true,
                name : true,
                email : true,
                image : true,
                role : true,
                status : true,
                isDeleted : true,
                emailVerified : true,
                createdAt : true,
                updatedAt : true,
            }
        }),
        prisma.workspace.findFirst({
            where: { ownerId: user.id, deletedAt: null },
            select: { plan: true },
        }),
        prisma.payment.findUnique({
            where: { userId: user.id },
            select: { status: true, planType: true },
        }),
    ]);

    if (!isUserExists) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    let plan: string = workspace?.plan || "FREE";

    // Auto-reconcile: Payment says PAID but workspace is still FREE.
    // This happens when the Stripe webhook was missed or the confirm flow
    // didn't reach the workspace update. Fix it automatically on every
    // dashboard load so the user sees their correct plan immediately.
    if (payment?.status === "PAID" && plan === "FREE") {
        const upgradedPlan = payment.planType; // "PRO" | "GROWTH"
        await prisma.workspace.updateMany({
            where: { ownerId: user.id, deletedAt: null, plan: "FREE" },
            data: { plan: upgradedPlan },
        });
        plan = upgradedPlan;
    }

    return {
        ...isUserExists,
        plan,
    };
}

const getNewToken = async (refreshToken : string, sessionToken : string) => {

    const isSessionTokenExists = await prisma.session.findUnique({
        where : {
            token : sessionToken,
        },
        include : {
            user : true,
        }
    })

    if(!isSessionTokenExists){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const verifiedRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.REFRESH_TOKEN_SECRET)


    if(!verifiedRefreshToken.success && verifiedRefreshToken.error){
        throw new AppError(status.UNAUTHORIZED, "Invalid refresh token");
    }

    const data = verifiedRefreshToken.data as JwtPayload;

    const newAccessToken = tokenUtils.getAccessToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const newRefreshToken = tokenUtils.getRefreshToken({
        userId: data.userId,
        role: data.role,
        name: data.name,
        email: data.email,
        status: data.status,
        isDeleted: data.isDeleted,
        emailVerified: data.emailVerified,
    });

    const {token} = await prisma.session.update({
        where : {
            token : sessionToken
        },
        data : {
            token : sessionToken,
            expiresAt: new Date(Date.now() + 60 * 60 * 60 * 24 * 1000),
            updatedAt: new Date(),
        }
    })

    return {
        accessToken : newAccessToken,
        refreshToken : newRefreshToken,
        sessionToken : token,
    }

}

const changePassword = async (payload : IChangePasswordPayload, sessionToken : string) =>{
    const session = await auth.api.getSession({
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    if(!session){
        throw new AppError(status.UNAUTHORIZED, "Invalid session token");
    }

    const {currentPassword, newPassword} = payload;

    const result = await auth.api.changePassword({
        body :{
            currentPassword,
            newPassword,
            revokeOtherSessions: true,
        },
        headers : new Headers({
            Authorization : `Bearer ${sessionToken}`
        })
    })

    const user = session.user as any;

    if(user.needPasswordChange){
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
              needPasswordChange: false,
            }
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: (session.user as any).role,
        name: session.user.name,
        email: session.user.email,
        status: (session.user as any).status,
        isDeleted: (session.user as any).isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: (session.user as any).role,
        name: session.user.name,
        email: session.user.email,
        status: (session.user as any).status,
        isDeleted: (session.user as any).isDeleted,
        emailVerified: session.user.emailVerified,
    });
    

    return {
        ...result,
        accessToken,
        refreshToken,
    }
}

const logoutUser = async (headers: Headers, userId?: string, betterAuthToken?: string) => {
    // Collect session tokens to delete from Redis BEFORE signing out
    const sessionTokens: string[] = [];
    if (betterAuthToken) sessionTokens.push(betterAuthToken);

    if (userId) {
        try {
            const raw = await ioRedis.get(`auth:active-sessions-${userId}`);
            if (raw) {
                const sessions: { token: string }[] = JSON.parse(raw);
                sessions.forEach(s => sessionTokens.push(s.token));
            }
        } catch {
            // non-fatal — fall through to signOut
        }
    }

    let result;
    try {
        result = await auth.api.signOut({ headers });
    } catch (e) {
        console.warn("[AuthDebug] Better Auth internal signOut failed:", e);
    }

    // Delete all Redis keys for this user's sessions to guarantee cleanup
    if (sessionTokens.length > 0 || userId) {
        try {
            const pipeline = ioRedis.pipeline();
            for (const token of sessionTokens) {
                // Better Auth redis storage uses 'auth:<token>' natively
                pipeline.del(`auth:${token}`);
            }
            if (userId) pipeline.del(`auth:active-sessions-${userId}`);
            await pipeline.exec();
            console.log("[AuthDebug] Guaranteed Redis session cleanup executed for keys:", sessionTokens);
        } catch (e) {
            console.warn("[AuthDebug] Failed to delete Redis session keys:", e);
        }
    }

    return result || { success: true };
}

const verifyEmail = async (email : string, otp : string) => {

    const result = await (auth.api as any).verifyEmailOTP({
        body:{
            email,
            otp,
        }
    })

    if(result.status){
        // Ensure user is updated in database if Better-Auth plugin doesn't do it automatically
        // Actually, verifyEmailOTP SHOULD update better-auth user, but let's be sure.
        const user = await prisma.user.update({
            where : {
                email,
            },
            data : {
                emailVerified: true,
            }
        });

        // Get session after verification to provide token 
        // (if it switched session or just to be consistent)
        // Actually, we can just find the latest session for this user
        const session = await prisma.session.findFirst({
            where: {
                userId: user.id
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const accessToken = tokenUtils.getAccessToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

        const refreshToken = tokenUtils.getRefreshToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
            status: user.status,
            isDeleted: user.isDeleted,
            emailVerified: user.emailVerified,
        });

        return {
            user,
            session,
            accessToken,
            refreshToken,
        }
    }

    throw new AppError(status.BAD_REQUEST, "Invalid or expired OTP");
}

const forgetPassword = async (email : string) => {
    const isUserExist = await prisma.user.findUnique({
        where : {
            email,
        }
    })

    if(!isUserExist || isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED){
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    await (auth.api as any).requestPasswordResetEmailOTP({
        body:{
            email,
        }
    })
}

const resetPassword = async (email : string, otp : string, newPassword : string) => {
    const isUserExist = await prisma.user.findUnique({
        where: { email }
    })

    if (!isUserExist || isUserExist.isDeleted || isUserExist.status === UserStatus.DELETED) {
        throw new AppError(status.NOT_FOUND, "User not found");
    }

    await (auth.api as any).resetPasswordEmailOTP({
        body:{
            email,
            otp,
            password : newPassword,
        }
    })

    if (isUserExist.needPasswordChange) {
        await prisma.user.update({
            where: {
                id: isUserExist.id,
            },
            data: {
                needPasswordChange: false,
            }
        })
    }

    await prisma.session.deleteMany({
        where:{
            userId : isUserExist.id,
        }
    })
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const googleLoginSuccess = async (session : Record<string, any>) =>{
    const isUserExists = await prisma.user.findUnique({
        where : {
            id : session.user.id,
        }
    })

    if(!isUserExists){
        await prisma.user.create({
            data : {
                id : session.user.id,
                name : session.user.name,
                email : session.user.email,
            }
        
        })
    }

    const accessToken = tokenUtils.getAccessToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    const refreshToken = tokenUtils.getRefreshToken({
        userId: session.user.id,
        role: session.user.role,
        name: session.user.name,
        email: session.user.email,
        status: session.user.status,
        isDeleted: session.user.isDeleted,
        emailVerified: session.user.emailVerified,
    });

    return {
        accessToken,
        refreshToken,
    }
}

export const AuthService = {
    registerUser,
    loginUser,
    getMe,
    getNewToken,
    changePassword,
    logoutUser,
    verifyEmail,
    forgetPassword,
    resetPassword,
    googleLoginSuccess,
};

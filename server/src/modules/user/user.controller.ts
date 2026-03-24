import { Request, Response, NextFunction } from "express";
import status from "http-status";
import { userService } from "./user.service";
import AppError from "../../errorHelpers/AppError";

/**
 * GET /api/user/profile
 * Get current user's profile
 */
export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError(status.UNAUTHORIZED, "User not authenticated");
    }

    const profile = await userService.getProfile(userId);
    if (!profile) {
      throw new AppError(status.NOT_FOUND, "User profile not found");
    }

    res.status(status.OK).json({
      success: true,
      message: "Profile fetched successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/user/profile
 * Update current user's profile
 */
export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      throw new AppError(status.UNAUTHORIZED, "User not authenticated");
    }

    const { name, bio, website, timezone } = req.body;

    const profile = await userService.updateProfile(userId, {
      name,
      bio,
      website,
      timezone,
    });

    res.status(status.OK).json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/user/avatar
 * Upload/update user's avatar image
 */
export const uploadAvatar = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("[uploadAvatar] Request received");
    console.log("[uploadAvatar] Content-Type:", req.headers["content-type"]);
    console.log("[uploadAvatar] req.file:", (req as any).file);
    console.log("[uploadAvatar] req.body:", (req as any).body);
    console.log("[uploadAvatar] Cookies:", req.cookies);
    
    const userId = (req as any).user?.id;
    console.log("[uploadAvatar] userId:", userId);
    console.log("[uploadAvatar] user object:", (req as any).user);
    
    if (!userId) {
      console.log("[uploadAvatar] User not authenticated - returning 401");
      res.status(401).json({
        success: false,
        message: "User not authenticated - please login first"
      });
      return;
    }

    // The file upload middleware (multer) will add the file info to req.file
    // and we need the cloudinary URL from the uploaded file
    const imageUrl = (req as any).file?.path || (req.body as any)?.imageUrl;
    console.log("[uploadAvatar] imageUrl:", imageUrl);
    
    if (!imageUrl) {
      console.log("[uploadAvatar] No image provided - file might be missing or multer not configured correctly");
      res.status(400).json({
        success: false,
        message: "No image provided. Please make sure you're uploading a valid image file."
      });
      return;
    }

    const profile = await userService.updateAvatar(userId, imageUrl);

    res.status(status.OK).json({
      success: true,
      message: "Avatar updated successfully",
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const userController = {
  getProfile,
  updateProfile,
  uploadAvatar,
};

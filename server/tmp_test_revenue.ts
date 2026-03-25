import { adminRevenueService } from "./src/modules/admin-review/admin-review.service.js";
import { prisma } from "./src/lib/prisma.js";

async function main() {
    try {
        console.log("Checking for admin user...");
        const adminUser = await prisma.user.findFirst({
            where: { role: "ADMIN", isDeleted: false },
        });

        if (!adminUser) {
            console.error("No admin user found to test.");
            return;
        }

        console.log(`Testing with admin user: ${adminUser.email} (ID: ${adminUser.id})`);

        try {
            console.log("Calling getMrrWaterfall...");
            const waterfall = await adminRevenueService.getMrrWaterfall({
                requestingUserId: adminUser.id,
            });
            console.log("Success: getMrrWaterfall returned", waterfall.length, "points.");
        } catch (err: any) {
            console.error("FAILED getMrrWaterfall:", err.message);
            console.error(err.stack);
        }

        try {
            console.log("Calling getChurnAnalysis...");
            const churn = await adminRevenueService.getChurnAnalysis({
                requestingUserId: adminUser.id,
            });
            console.log("Success: getChurnAnalysis returned", churn.length, "points.");
        } catch (err: any) {
            console.error("FAILED getChurnAnalysis:", err.message);
            console.error(err.stack);
        }

    } catch (err) {
        console.error("Main test execution failed:", err);
    } finally {
        await prisma.$disconnect();
    }
}

main();

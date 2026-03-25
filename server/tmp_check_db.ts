import "dotenv/config";

console.log("DB URL prefix:", process.env.DATABASE_URL?.substring(0, 40) + "...");
console.log("Attempting DB connection...");

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/client';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    try {
        const count = await prisma.user.count();
        console.log("DB connected! User count:", count);
    } catch (err: any) {
        console.error("DB connection FAILED:", err.message);
        console.error(err.stack);
    } finally {
        await prisma.$disconnect();
        process.exit(0);
    }
}

// Add a 10s timeout
setTimeout(() => {
    console.error("TIMEOUT: DB connection hung for 10 seconds");
    process.exit(1);
}, 10000);

main();

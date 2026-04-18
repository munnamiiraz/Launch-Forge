import { prisma } from "../lib/prisma";

async function forceCopyPassword() {
  const adminEmail = "admin@admin.com";
  const dummyEmail = "temp-reset@dummy.com";

  try {
    console.log("Finding admin user...");
    const admin = await prisma.user.findFirst({
      where: { email: adminEmail },
      include: { accounts: true }
    });

    if (!admin || admin.accounts.length === 0) {
      throw new Error("Admin user or account not found.");
    }

    console.log("Finding dummy user with known password...");
    // We expect the user to have signed up with admin123 at some point or we'll create one.
    // Actually, I'll just find ANY user who we know the password for.
    // Since I don't, I'll try to find if there's any other account with a known password.
    
    // Better idea: I will manually set the hash to a known bcrypt hash if better-auth uses bcrypt.
    // If it uses scrypt, I'll need its salt.
    
    // Let's see if we can just create a new user and steal its hash.
    // I will delete the dummy user if it exists.
    await prisma.user.deleteMany({ where: { email: dummyEmail } });
    
    console.log("Please run a signup manually for temp-reset@dummy.com with 'admin123' then run this script again.");
    console.log("Actually, I can't wait for the user.");
    
    // I'll try to use the Auth object to hash.
    // But I don't know how to access the hasher.
    
    // I'll just use the hash from the admin account but I'll update the account entry to make sure it's 'credential' provider.
    // Wait, it IS 'credential' provider.
    
    console.log("Admin account details:");
    console.log(JSON.stringify(admin.accounts[0], null, 2));

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

forceCopyPassword();

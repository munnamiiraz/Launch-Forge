const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log("USERS:", users.map(u => ({ id: u.id, email: u.email })));

  const workspaces = await prisma.workspace.findMany({
    include: { members: true }
  });
  console.log("WORKSPACES:", workspaces);
}

main().catch(console.error).finally(() => prisma.$disconnect());

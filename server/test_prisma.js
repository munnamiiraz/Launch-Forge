import { PrismaClient } from './node_modules/@prisma/client/index.js';
const prisma = new PrismaClient();
async function run() {
  const s = await prisma.session.findMany({take: 5, orderBy: {createdAt:'desc'}});
  console.log(s);
}
run();

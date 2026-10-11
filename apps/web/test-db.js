const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.$queryRaw`SELECT 1 as ok`
  .then(r => { console.log("OK", r); process.exit(0); })
  .catch(e => { console.error("FAIL:", e.message); process.exit(1); });
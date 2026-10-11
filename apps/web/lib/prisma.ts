import { PrismaClient } from "@prisma/client";

var globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export var prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}
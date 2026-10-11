const fs = require("fs");
const path = require("path");

function walk(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(full); continue; }
        if (!entry.name.endsWith(".ts")) continue;

        let src = fs.readFileSync(full, "utf8");
        if (!src.includes("new PrismaClient()")) continue;

        src = src.replace(
            /import\s*{\s*PrismaClient\s*}\s*from\s*"@prisma\/client";/g,
            'import { prisma } from "@/lib/prisma";'
        );
        src = src.replace(/^var prisma = new PrismaClient\(\);\s*\r?\n/m, "");

        fs.writeFileSync(full, src, "utf8");
        console.log("Updated:", full);
    }
}

walk(path.join(__dirname, "app"));
console.log("Done.");
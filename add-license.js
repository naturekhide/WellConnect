/**
 * Script to automatically add Apache 2.0 license headers to WellConnect source files
 * Run with: node add-license.js
 */

const fs = require('fs');
const path = require('path');

// Apache 2.0 License Header for TypeScript/JavaScript files
const TS_HEADER = `/**
 * Copyright 2026 Ibrahim Aswad Nindow
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

`;

// Apache 2.0 License Header for Prisma schema files
const PRISMA_HEADER = `// Copyright 2026 Ibrahim Aswad Nindow
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

`;

// Files to include (key WellConnect source files)
const FILES_TO_UPDATE = [
  // Core app files
  'apps/web/lib/auth.ts',
  'apps/web/middleware.ts',
  'apps/web/app/layout.tsx',
  'apps/web/app/page.tsx',
  
  // Feature pages
  'apps/web/app/feed/page.tsx',
  'apps/web/app/groups/page.tsx',
  'apps/web/app/profile/page.tsx',
  'apps/web/app/dashboard/page.tsx',
  'apps/web/app/login/page.tsx',
  'apps/web/app/register/page.tsx',
  
  // Components
  'apps/web/components/PostCard.tsx',
  'apps/web/components/CreatePostForm.tsx',
  'apps/web/components/CreateGroupModal.tsx',
  'apps/web/components/EditProfileModal.tsx',
  'apps/web/components/Header.tsx',
  'apps/web/components/LogoutButton.tsx',
  
  // API Routes
  'apps/web/app/api/posts/route.ts',
  'apps/web/app/api/posts/[postId]/reactions/route.ts',
  'apps/web/app/api/groups/route.ts',
  'apps/web/app/api/groups/[groupId]/join/route.ts',
  'apps/web/app/api/profile/route.ts',
  'apps/web/app/api/auth/register/route.ts',
  'apps/web/app/api/auth/session/route.ts',
  'apps/web/app/api/auth/[...nextauth]/route.ts',
  
  // Database
  'packages/database/src/index.ts',
];

// Prisma schema file
const PRISMA_FILE = 'packages/database/prisma/schema.prisma';

// Function to check if file already has a license header
function hasLicenseHeader(content) {
  return content.includes('Copyright 2026 Ibrahim Aswad Nindow') ||
         content.includes('Licensed under the Apache License');
}

// Function to add header to a file
function addHeaderToFile(filePath, header) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    
    if (hasLicenseHeader(content)) {
      console.log(`✓  License already exists: ${filePath}`);
      return true;
    }
    
    // Check for existing "use client" directive
    if (content.startsWith('"use client"') || content.startsWith("'use client'")) {
      const lines = content.split('\n');
      const useClientLine = lines[0];
      const restOfContent = lines.slice(1).join('\n');
      const newContent = useClientLine + '\n\n' + header + restOfContent;
      fs.writeFileSync(fullPath, newContent, 'utf8');
    } else {
      const newContent = header + content;
      fs.writeFileSync(fullPath, newContent, 'utf8');
    }
    
    console.log(`✅ Added license: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('\n📄 Adding Apache 2.0 License Headers to WellConnect\n');
console.log('Copyright 2026 Ibrahim Aswad Nindow\n');
console.log('─'.repeat(50));

let successCount = 0;
let skipCount = 0;
let failCount = 0;

// Process TypeScript/TSX files
FILES_TO_UPDATE.forEach(filePath => {
  const result = addHeaderToFile(filePath, TS_HEADER);
  if (result === true) successCount++;
  else if (result === false) failCount++;
});

// Process Prisma schema file
const prismaResult = addHeaderToFile(PRISMA_FILE, PRISMA_HEADER);
if (prismaResult === true) successCount++;
else if (prismaResult === false) failCount++;

console.log('─'.repeat(50));
console.log(`\n📊 Summary:`);
console.log(`   ✅ ${successCount} files updated with license`);
console.log(`   ⚠️  ${failCount} files not found (may be normal if not yet created)`);
console.log('\n✨ License headers added successfully!\n');
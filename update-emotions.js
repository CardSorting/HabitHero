const fs = require('fs');
const path = require('path');

// Read the file
const filePath = path.join(__dirname, 'server', 'emotions-routes.ts');
let content = fs.readFileSync(filePath, 'utf8');

// Replace all instances of 'eq(entries.userId, req.user!.id)' with 'eq(entries.userId, getUserIdFromRequest(req))'
content = content.replace(/eq\(entries\.userId, req\.user!\.id\)/g, 'eq(entries.userId, getUserIdFromRequest(req))');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('Updated emotions-routes.ts successfully!');
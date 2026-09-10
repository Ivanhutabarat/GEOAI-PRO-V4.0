const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /console.error\('\[AUTH\] Error loading users database:', err\);/,
  `console.error('[AUTH] Error loading users database (Firebase failed? Falling back to JSON):', err);
    if (fs.existsSync(USERS_DB_PATH)) {
      const data = fs.readFileSync(USERS_DB_PATH, 'utf8');
      const users = JSON.parse(data);
      usersMap.clear();
      users.forEach(u => {
        if (u.email) {
          usersMap.set(u.email.toLowerCase().trim(), u);
        }
      });
      console.log(\`[AUTH] Loaded \${usersMap.size} users from persistent JSON store (FALLBACK).\`);
    }`
);

fs.writeFileSync('server.ts', code);

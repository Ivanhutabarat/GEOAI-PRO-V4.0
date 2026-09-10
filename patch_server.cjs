const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

code = code.replace(
  /const querySnap = await getDocs\(colRef\);/g,
  `const querySnap = await Promise.race([
    getDocs(colRef),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase timeout")), 3000))
  ]);`
);

code = code.replace(
  /await setDoc\(docRef, sanitizedProfile\);/g,
  `setDoc(docRef, sanitizedProfile).catch(e => console.error('[FIREBASE] setDoc error', e));`
);

code = code.replace(
  /await setDoc\(docRef, sanitizedLog\);/g,
  `setDoc(docRef, sanitizedLog).catch(e => console.error('[FIREBASE] setDoc error', e));`
);

code = code.replace(
  /await deleteDoc\(docRef\);/g,
  `deleteDoc(docRef).catch(e => console.error('[FIREBASE] deleteDoc error', e));`
);

fs.writeFileSync('server.ts', code);

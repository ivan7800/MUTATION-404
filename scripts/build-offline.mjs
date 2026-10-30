import { readFile, writeFile, copyFile, mkdir } from 'node:fs/promises';
await mkdir('play',{recursive:true});
let html=await readFile('apps/web/index.html','utf8');
html=html.replace('href="/src/style.css"','href="./style.css"').replace('src="/src/main.ts"','src="./js/apps/web/src/main.js"');
await writeFile('play/index.html',html);
await copyFile('apps/web/src/style.css','play/style.css');
console.log('Build offline listo en play/. Se sirve con node scripts/server.mjs');

// Bundle PixiJS and dynamic WebGL chunks into the offline Pages release.
// Keep legacy play/js for existing smoke tests and standalone Canvas fallback.
const {build}=await import('vite');
await build({configFile:'apps/web/vite.config.ts',base:'./',build:{outDir:'../../play',emptyOutDir:false}});
console.log('PixiJS/WebGL assets empaquetados en play/assets/.');

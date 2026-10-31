import {existsSync,statSync,readdirSync,appendFileSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {resolve,dirname} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
process.chdir(root);
const log=resolve(root,'launch.log');
function run(command,args){
  appendFileSync(log,`${new Date().toISOString()} ${command} ${args.join(' ')}\n`);
  const result=spawnSync(command,args,{stdio:'inherit',shell:process.platform==='win32'});
  if(result.error||result.status!==0)throw Error(`${command} falló: ${result.error?.message||result.status}. Consulta launch.log.`);
}
function newest(path){
  return statSync(path).isDirectory()?Math.max(0,...readdirSync(path).map(name=>newest(resolve(path,name)))):statSync(path).mtimeMs;
}
try{
  if(Number(process.versions.node.split('.')[0])<22)throw Error('Instala Node.js 22 o posterior con npm.');
  const npm=process.platform==='win32'?'npm.cmd':'npm';
  if(!existsSync('node_modules/.bin/vite')||!existsSync('node_modules/.bin/tsc'))run(npm,['ci','--no-audit','--no-fund']);
  const inputs=['apps/web/src','apps/web/public','packages/core/src','apps/web/index.html','package.json','package-lock.json','scripts/build-offline.mjs'];
  if(!existsSync('play/index.html')||!existsSync('play/sw.js')||Math.max(...inputs.map(newest))>statSync('play/index.html').mtimeMs)run(npm,['run','build:offline']);
  if(!process.argv.includes('--prepare-only'))run(process.execPath,['scripts/server.mjs',...process.argv.slice(2)]);
}catch(error){
  console.error(error.message);appendFileSync(log,`${error.stack}\n`);process.exitCode=1;
}

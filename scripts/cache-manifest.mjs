import {readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
export async function generateWorker(directory){
  const assets=['./','./index.html','./manifest.webmanifest','./icon.svg',...(await readdir(directory+'/assets')).filter(name=>name.endsWith('.js')||name.endsWith('.css')).map(name=>'./assets/'+name)].sort();
  const digest=createHash('sha256');
  for(const asset of assets.filter(path=>path!=='./'))digest.update(await readFile(directory+'/'+asset.slice(2)));
  const worker=(await readFile('apps/web/public/sw.js','utf8')).replace('__BUILD_VERSION__',digest.digest('hex').slice(0,16)).replace("/* ASSET_MANIFEST */ ['./','./index.html']",JSON.stringify(assets));
  await writeFile(directory+'/sw.js',worker);
}
if(process.argv[2])await generateWorker(process.argv[2]);

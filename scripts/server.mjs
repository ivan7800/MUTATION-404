import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
const ROOT=resolve('play');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml'};
const server=createServer(async (req,res)=>{
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405);res.end('Method Not Allowed');return;}
  try{
    const url=new URL(req.url||'/', 'http://127.0.0.1');
    const requested=decodeURIComponent(url.pathname);
    const path=resolve(ROOT,'.'+(requested==='/'?'/index.html':requested));
    if(!(path===ROOT||path.startsWith(ROOT+sep))){res.writeHead(403);res.end('Forbidden');return;}
    const info=await stat(path);
    if(!info.isFile()){res.writeHead(404);res.end('Not Found');return;}
    const body=await readFile(path);
    res.writeHead(200,{
      'Content-Type':types[extname(path)]||'application/octet-stream',
      'Cache-Control':'no-store',
      'X-Content-Type-Options':'nosniff',
      'Referrer-Policy':'no-referrer',
      'X-Frame-Options':'DENY',
      'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
      'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
      'Content-Length':body.length
    });
    res.end(req.method==='HEAD'?undefined:body);
  }catch{res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});res.end('No encontrado');}
});
function start(port){server.once('error',err=>{
  if(err.code==='EADDRINUSE'&&port<8798){start(port+1);}else{console.error(err.message);process.exitCode=1;}
});
server.listen(port,'127.0.0.1',()=>{
  const url=`http://127.0.0.1:${port}/`;
  console.log(`\nMUTATION 404 v1.0: ${url}\nPara detener: Ctrl+C\n`);
  if(process.argv.includes('--no-open'))return;
  try{
    let opener;
    if(process.platform==='win32')opener=spawn('cmd',['/c','start','',url],{detached:true,stdio:'ignore'});
    else if(process.platform==='darwin')opener=spawn('open',[url],{detached:true,stdio:'ignore'});
    else opener=spawn('xdg-open',[url],{detached:true,stdio:'ignore'});
    opener.on('error',()=>console.log('Abre manualmente la dirección mostrada arriba.'));
    opener.unref();
  }catch{/* URL stays visible in terminal */}
});}
start(Number(process.env.PORT)||8787);

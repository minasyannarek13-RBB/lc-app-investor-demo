const http=require('node:http'),fs=require('node:fs'),path=require('node:path'),zlib=require('node:zlib');
const before=process.env.LC_BEFORE_ROOT,after=process.env.LC_STATIC_ROOT;
if(!before||!after)throw Error('LC_BEFORE_ROOT and LC_STATIC_ROOT required');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.avif':'image/avif','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.txt':'text/plain','.xml':'application/xml'};
const cached=new Map();
const servers=process.env.LC_SERVER_GZIP_ONLY==='1' ? [[4214,after,'gzip'],[4215,before,'gzip']] : [[4210,before,false],[4211,before,true],[4212,after,false],[4213,after,true]];
for(const [port,root,compressed] of servers){
 http.createServer((req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1:'+port);let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));
  if(file!==root&&!file.startsWith(root+path.sep))return res.writeHead(403).end();
  try{
   if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
   const stat=fs.statSync(file),type=mime[path.extname(file)]||'application/octet-stream';
   const textual=/text|javascript|json|svg|xml/.test(type),accept=req.headers['accept-encoding']||'';
   const encoding=compressed&&textual ? (compressed!=='gzip'&&/\bbr\b/.test(accept)?'br':/\bgzip\b/.test(accept)?'gzip':null):null;
   const key=file+':'+stat.mtimeMs+':'+encoding;let data=cached.get(key);
   if(!data){data=fs.readFileSync(file);if(encoding==='br')data=zlib.brotliCompressSync(data,{params:{[zlib.constants.BROTLI_PARAM_QUALITY]:6}});if(encoding==='gzip')data=zlib.gzipSync(data,{level:6});cached.set(key,data);}
   const headers={'Content-Type':type,'Content-Length':data.length,'Vary':'Accept-Encoding','Cache-Control':'public, max-age=600','X-LC-Lab':compressed?'production-like-brotli-gzip':'plain-uncompressed'};
   if(encoding)headers['Content-Encoding']=encoding;
   res.writeHead(200,headers);res.end(data);
  }catch{res.writeHead(404).end();}
 }).listen(port,'127.0.0.1',()=>console.log(port,compressed?'brotli/gzip':'plain',root));
}

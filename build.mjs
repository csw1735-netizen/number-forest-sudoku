import fs from 'node:fs';
import path from 'node:path';
import { deflateSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';
const base = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(base, '_site');
fs.mkdirSync(out, { recursive: true });
for (const file of ['index.html','style.css','engine.js','app.js','pwa.js','sw.js','manifest.webmanifest']) fs.copyFileSync(new URL(file, import.meta.url), path.join(out, file));
function crc32(data) {let crc = 0xffffffff;for (const value of data) {crc ^= value;for (let k=0;k<8;k++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);}return (crc ^ 0xffffffff) >>> 0;}
function chunk(type, data) {const body = Buffer.concat([Buffer.from(type), data]);const size = Buffer.alloc(4), crc = Buffer.alloc(4);size.writeUInt32BE(data.length);crc.writeUInt32BE(crc32(body));return Buffer.concat([size,body,crc]);}
function icon(size) {
  const rows = Buffer.alloc((size*3+1)*size);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++) {
    const u=x/size,v=y/size;
    let color=[38,118,90];
    if(u>.225&&u<.775&&v>.225&&v<.775) {
      const gx=(u-.225)/.55*3,gy=(v-.225)/.55*3;
      color=(gx%1<.09||gx%1>.91||gy%1<.09||gy%1>.91)?[38,118,90]:[246,244,224];
      if(Math.floor(gx)===1&&Math.floor(gy)===1&&gx%1>=.09&&gx%1<=.91&&gy%1>=.09&&gy%1<=.91)color=[235,188,87];
    }
    const at=y*(size*3+1)+1+x*3;rows[at]=color[0];rows[at+1]=color[1];rows[at+2]=color[2];
  }
  const ihdr=Buffer.alloc(13);ihdr.writeUInt32BE(size,0);ihdr.writeUInt32BE(size,4);ihdr[8]=8;ihdr[9]=2;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ihdr),chunk('IDAT',deflateSync(rows)),chunk('IEND',Buffer.alloc(0))]);
}
for(const size of [180,192,512])fs.writeFileSync(path.join(out,'icon-'+size+'.png'),icon(size));
console.log('Built static PWA in '+out);

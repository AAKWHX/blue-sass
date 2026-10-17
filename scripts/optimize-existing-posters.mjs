import sharp from 'sharp';
import {writeFile,mkdir,stat} from 'node:fs/promises';
await mkdir('artifacts/visual-polish',{recursive:true});
const results=[];
for(const name of ['web-showcase','workflow','monitoring','product-components','product-brand']){
 const source=`artifacts/immersive-v2/originals/${name}.png`,target=`public/media/immersive-v2/${name}.webp`;
 const before=(await stat(target)).size;
 await sharp(source).resize({width:2400,withoutEnlargement:true}).webp({quality:92,effort:5}).toFile(target);
 const metadata=await sharp(target).metadata();results.push({name,before,after:(await stat(target)).size,width:metadata.width,height:metadata.height,source});
}
await writeFile('artifacts/visual-polish/poster-quality.json',JSON.stringify(results,null,2));console.log(results);

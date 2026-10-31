import {cp,readdir,readFile,writeFile,stat,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import path from 'node:path';
const root=process.cwd(),target=path.resolve(root,'tmp/gold-release-source');
if(!target.startsWith(root+path.sep)||!(await stat(path.join(target,'.git'))).isDirectory())throw Error('Expected isolated release clone');
const filter=source=>!path.basename(source).includes(' - kopie')&&!/^(\.env|\.git$|node_modules$)/.test(path.basename(source));
for(const dir of ['app','components','hooks','lib','public','scripts','docs','drizzle','packages']){
 try{await cp(path.join(root,dir),path.join(target,dir),{recursive:true,filter});}catch(error){if(error.code!=='ENOENT')throw error;}
}
for(const file of ['AGENTS.md','.gitignore','package.json','package-lock.json','tsconfig.json','next.config.mjs','proxy.ts','postcss.config.mjs','tailwind.config.ts','eslint.config.mjs','components.json','drizzle.config.ts'])await cp(path.join(root,file),path.join(target,file));
// Preserve the working checkout. Apply only already recorded source removals to the isolated clone.
const deleted=execFileSync('git',['diff','--name-only','--diff-filter=D'],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
for(const file of deleted){const absolute=path.resolve(target,file);if(!absolute.startsWith(target+path.sep))throw Error('Unsafe release path');await rm(absolute,{force:true});}
await writeFile(path.join(target,'.vercelignore'),'.git\n.env*\n!.env.example\nnode_modules\n.next*\nartifacts\ntmp\ndownloads\n**/* - kopie*\n');
const manifest=[];async function walk(dir){for(const item of await readdir(dir,{withFileTypes:true})){if(['.git','node_modules','artifacts'].includes(item.name))continue;const absolute=path.join(dir,item.name);if(item.isSymbolicLink())throw Error('Unexpected symlink');if(item.isDirectory())await walk(absolute);else{const relative=path.relative(target,absolute).replaceAll('\\','/');if(relative.split('/').some(part=>(part.startsWith('.env')&&part!=='.env.example')||part.includes(' - kopie')))throw Error('Unexpected private or backup file');manifest.push({file:relative,bytes:(await stat(absolute)).size});}}}await walk(target);
await writeFile('artifacts/gold-release/source-manifest.json',JSON.stringify({files:manifest.length,totalBytes:manifest.reduce((sum,item)=>sum+item.bytes,0),entries:manifest},null,2));
const ignore=await readFile(path.join(target,'.gitignore'),'utf8');await writeFile(path.join(target,'.gitignore'),ignore+'\nartifacts/\ntmp/\n.vercel/\n');
console.log(JSON.stringify({files:manifest.length,deleted:deleted.length,target}));

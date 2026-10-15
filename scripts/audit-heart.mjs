import {heartExhibit} from '../src/artwork/heart.mjs';
import {orbit,orbitReport,orbitFailures} from '../vendor/anatomy/turn-audit.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
const {T,R,P,poses}=heartExhibit();mkdirSync('shots',{recursive:true});
const result=orbit(T,R,P,{quick:true,random:50,poses,only:['order','rigid','posed','routes','depth'],depthAngles:8,depthEvents:8,log:console.log});
writeFileSync('shots/heart-geometry.log',orbitReport(result));console.log(orbitReport(result));
writeFileSync('shots/heart-geometry-summary.json',JSON.stringify({quick:result.quick,skipped:result.skipped,failures:orbitFailures(result),checks:Object.fromEntries(Object.entries(result).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length])),stats:result.stats},null,2));
process.exitCode=orbitFailures(result)?1:0;

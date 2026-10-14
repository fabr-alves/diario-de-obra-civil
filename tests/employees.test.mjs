import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {extractEmployees,compareEmployees,inferEmployeeColumn,employeeKey} from '../employees.mjs';
const rows=[['Empresa'],[],['Matrícula','Nome completo','Setor'],[1,' José  da Silva ','Obra'],[2,'JOSE DA SILVA','Obra'],[3,'Ana-Maria D\'Ávila','Obra'],[4,'','Obra'],[5,'123456','Obra'],[6,'TOTAL','']];
assert.deepEqual(inferEmployeeColumn(rows),{column:1,firstRow:4});
const parsed=extractEmployees(rows,1,4);
assert.deepEqual(parsed.names,["ANA-MARIA D'ÁVILA",'JOSÉ DA SILVA']);
assert.equal(parsed.duplicates.length,1);assert.equal(parsed.rejected.length,2);assert.equal(parsed.blanks,1);
assert.equal(employeeKey('José da Silva'),employeeKey('JOSE DA SILVA'));
const replace=compareEmployees(['JOSE DA SILVA','PAULO'],parsed.names);
assert.deepEqual(replace.removed,['PAULO']);assert.deepEqual(replace.added,["ANA-MARIA D'ÁVILA"]);
assert(replace.names.includes('JOSE DA SILVA'));
const merge=compareEmployees(['PAULO'],parsed.names,'merge');assert.equal(merge.removed.length,0);assert.equal(merge.names.length,3);
assert.throws(()=>compareEmployees(['PAULO'],[]));assert.throws(()=>extractEmployees(rows,1,0));
assert.equal(extractEmployees([['  '],[null],[100],['NOME']],0,1).names.length,0);
const XLSX=createRequire(import.meta.url)('../vendor/xlsx.full.min.js');
const workbook=XLSX.utils.book_new();XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet(rows),'Equipe');
XLSX.utils.book_append_sheet(workbook,XLSX.utils.aoa_to_sheet([['Outro'],['Maria']]),'Outra aba');
const script=fs.readFileSync(new URL('../employee-reader.worker.js',import.meta.url),'utf8');
for(const bookType of ['xlsx','xls','csv']){
 const bytes=XLSX.write(workbook,{type:'buffer',bookType});let result;
 const sandbox={XLSX,importScripts(){},self:{postMessage(value){result=value;}}};vm.createContext(sandbox);vm.runInContext(script,sandbox);sandbox.self.onmessage({data:bytes});
 assert(!result.error,`${bookType}: ${result.error}`);assert(result.sheets.length>0);
 assert.deepEqual(extractEmployees(result.sheets[0].rows,1,4).names,parsed.names);
}
console.log('PASS: XLSX/XLS/CSV read, sheet/column/row mapping, accents, duplicates, invalid rows, replace/merge, empty list rejection.');

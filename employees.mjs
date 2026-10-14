export const MAX_EMPLOYEES = 1000;
export const employeeKey = name => String(name).normalize('NFD').replace(/\p{M}/gu, '').toLocaleUpperCase('pt-BR').replace(/\s+/g, ' ').trim();
export const cleanEmployeeName = value => String(value ?? '').normalize('NFC').replace(/\s+/g, ' ').trim().toLocaleUpperCase('pt-BR');
const HEADERS = new Set(['NOME','NOME COMPLETO','NOME DO FUNCIONARIO','NOME DOS FUNCIONARIOS','FUNCIONARIO','FUNCIONARIOS','COLABORADOR','COLABORADORES','NOME DO COLABORADOR','RELACAO DE FUNCIONARIOS','LISTA DE FUNCIONARIOS','TOTAL']);
export function inferEmployeeColumn(rows) {
  for (let row=0; row<Math.min(rows.length,30); row++) {
    for (let column=0; column<(rows[row]?.length || 0); column++) {
      if (HEADERS.has(employeeKey(rows[row][column])) && employeeKey(rows[row][column]) !== 'TOTAL') return {column, firstRow: row+2};
    }
  }
  const first = rows.findIndex(row => row.some(value => String(value ?? '').trim()));
  return {column:0, firstRow:Math.max(1, first+1)};
}
export function extractEmployees(rows, column, firstRow) {
  if (!Number.isInteger(column) || column<0 || !Number.isInteger(firstRow) || firstRow<1) throw new Error('Confira a coluna e a primeira linha.');
  const names=[], rejected=[], duplicates=[]; let blanks=0;
  const seen=new Set();
  for (let index=firstRow-1; index<rows.length; index++) {
    const value=rows[index]?.[column];
    const name=cleanEmployeeName(value);
    if (!name) {blanks++;continue;}
    const key=employeeKey(name);
    if (typeof value === 'number' || name.length<2 || name.length>120 || !/^[\p{L}\p{M} .'-]+$/u.test(name) || !/\p{L}/u.test(name) || HEADERS.has(key)) {
      rejected.push({row:index+1,value:name,reason:HEADERS.has(key)?'Cabeçalho ou total':'Não parece um nome de funcionário'});continue;
    }
    if(seen.has(key)){duplicates.push({row:index+1,value:name});continue;}
    seen.add(key); names.push(name);
  }
  if(names.length>MAX_EMPLOYEES)throw new Error(`A lista deve ter no máximo ${MAX_EMPLOYEES} nomes.`);
  return {names:names.sort((a,b)=>a.localeCompare(b,'pt-BR')),rejected,duplicates,blanks};
}
export function compareEmployees(current, imported, mode='replace') {
  const currentByKey=new Map(current.map(name=>[employeeKey(name),name]));
  const nextByKey=mode==='merge'?new Map(currentByKey):new Map();
  for(const name of imported)nextByKey.set(employeeKey(name),currentByKey.get(employeeKey(name)) || name);
  const names=[...nextByKey.values()].sort((a,b)=>a.localeCompare(b,'pt-BR'));
  if(!names.length)throw new Error('A lista não pode ficar vazia.');
  if(names.length>MAX_EMPLOYEES)throw new Error(`A lista final excede ${MAX_EMPLOYEES} nomes.`);
  return {names,added:names.filter(name=>!currentByKey.has(employeeKey(name))),removed:current.filter(name=>!nextByKey.has(employeeKey(name)))};
}
export function readEmployeeWorkbook(file) {
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) return Promise.reject(new Error('Escolha uma planilha XLSX, XLS ou CSV.'));
  if (file.size>5*1024*1024) return Promise.reject(new Error('A planilha deve ter no máximo 5 MB.'));
  return new Promise(async (resolve,reject)=>{
    let worker, timer;
    const finish=(err,value)=>{clearTimeout(timer);worker?.terminate();err?reject(err):resolve(value);};
    try {
      worker=new Worker('/employee-reader.worker.js');
      timer=setTimeout(()=>finish(new Error('A leitura demorou demais. Tente uma planilha menor.')),30000);
      worker.onmessage=e=>e.data.error?finish(new Error(e.data.error)):finish(null,e.data.sheets);
      worker.onerror=()=>finish(new Error('Não foi possível ler a planilha. Verifique o arquivo e tente novamente.'));
      const bytes=await file.arrayBuffer();
      worker.postMessage(bytes,[bytes]);
    }catch(err){finish(err);}
  });
}

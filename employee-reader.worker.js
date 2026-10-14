// SheetJS CE 0.20.3, Apache-2.0. The workbook stays in the browser.
importScripts('/vendor/xlsx.full.min.js');
self.onmessage = event => {
  try {
    const workbook=XLSX.read(event.data,{type:'array',sheetRows:10001,cellFormula:false,cellHTML:false,cellStyles:false,bookVBA:false});
    const sheets=workbook.SheetNames.filter(name=>!workbook.Workbook?.Sheets?.find(s=>s.name===name)?.Hidden).map(name=>{
      const sheet=workbook.Sheets[name];
      if(!sheet['!ref'])return {name,rows:[]};
      const full=XLSX.utils.decode_range(sheet['!fullref'] || sheet['!ref']);
      if(full.e.r>=10000 || full.e.c>=128)return {name,rows:[],error:'Esta aba excede 10.000 linhas ou 128 colunas. Use uma lista menor.'};
      const rows=XLSX.utils.sheet_to_json(sheet,{header:1,raw:false,defval:'',blankrows:true,range:{s:{r:0,c:0},e:full.e}});
      return {name,rows};
    });
    if(!sheets.length)throw new Error('A planilha não possui abas visíveis.');
    self.postMessage({sheets});
  }catch{self.postMessage({error:'Não foi possível ler este arquivo. Confira se a planilha não está corrompida ou protegida por senha.'});}
};

const rows = [{id:'TEST-001', value:12.5}, {id:'TEST-002', value:18.75}];
console.table(rows);
console.log(rows.reduce((s,r)=>s+r.value,0));

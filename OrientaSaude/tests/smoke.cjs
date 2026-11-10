'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const base=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(base,file),'utf8');
const pages=['index.html','agenda.html','alertas.html','dicas.html','especialidades.html','fronteira.html','mapa.html','resumo.html','unidades.html'];
for(const page of pages){
  const html=read(page);
  assert.match(html,/data-orienta-auth="checking"/,'Gate oculto antes de autenticar: '+page);
  assert.match(html,/auth-gate\.js\?v=20261110-ux-secure-1/,'Gate novo ausente: '+page);
  assert.match(html,/<title>OrientaSaúde<\/title>/,'Título inconsistente: '+page);
}
for(const file of ['auth-gate.js','conta.js','app.js','upgrade.js','agenda.js','resumo.js','sw.js','pwa.js']){
  new vm.Script(read(file),{filename:file});
}
const gate=read('auth-gate.js');
assert.match(gate,/auth\.getUser\(/);
assert.match(gate,/read_my_profile_v2/);
assert.match(gate,/OrientaScopedStoreKey='orientasaude-records-v2-'/);
assert.match(gate,/orientasaude:profile-ready/);
for(const file of ['app.js','agenda.js','resumo.js','upgrade.js']){
  const js=read(file);
  assert.match(js,/OrientaScopedStoreKey/,'Arquivo precisa do usuário validado: '+file);
  assert.match(js,/orientasaude:profile-ready/,'Aguardar autenticação: '+file);
}
assert.doesNotMatch(read('agenda.js'),/orientasaude-demo-v1/);
assert.doesNotMatch(read('resumo.js'),/orientasaude-demo-v1/);
assert.doesNotMatch(read('upgrade.js'),/orientasaude-demo-v1/);
assert.match(read('app.js'),/import-legacy/);
assert.match(read('app.js'),/LEGACY_STORE='orientasaude-demo-v1'/);
assert.match(read('app.js'),/emergencia\.html/);
const auth=read('conta.html'),authJs=read('conta.js');
for(const id of ['signup-awareness','password-hint','password-match','logout-and-clear-local']){
  assert.match(auth,new RegExp('id="'+id+'"'),'HTML precisa do elemento: '+id);
  if(id!=='signup-awareness')assert.match(authJs,new RegExp(id),'JS precisa do elemento: '+id);
}
assert.match(auth,/<input type="checkbox" id="signup-awareness" required>/);
assert.match(auth,/href="privacidade\.html"/);
assert.match(auth,/href="emergencia\.html"/);
assert.match(auth,/type="password"/);
assert.match(authJs,/save_my_profile_v2/);
assert.match(authJs,/auth\.resend\(/);
assert.match(read('emergencia.html'),/tel:192/);
assert.match(read('emergencia.html'),/tel:141/);
assert.match(read('emergencia.html'),/tel:107/);
assert.doesNotMatch(read('emergencia.html'),/auth-gate\.js/);
assert.doesNotMatch(read('privacidade.html'),/auth-gate\.js/);
assert.match(read('sw.js'),/scoped-data-01/);
assert.match(read('sw.js'),/agenda\|resumo/);
assert.match(read('sw.js'),/emergencia\.html/);
console.log('OrientaSaúde Original: verificações estáticas concluídas.');

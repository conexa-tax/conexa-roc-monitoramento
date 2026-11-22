import {chromium} from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const target=path.resolve(here,'../docs/capturas');
const report='https://app.powerbi.com/view?r=eyJrIjoiNzg5MDA4M2UtYWZiZC00Y2U5LTkzYjctNTc4MzBkYTU0ZDhkIiwidCI6IjZmNDlhYTQzLTgyMmEtNGMyMC05NjcwLWRiNzcwMGJmMWViMCJ9';
const capturedAt=new Date().toISOString();
await fs.mkdir(target,{recursive:true});
let browser;
try{
 browser=await chromium.launch({headless:true,args:['--no-sandbox']});
 const page=await browser.newPage({viewport:{width:1600,height:900},deviceScaleFactor:1});
 const response=await page.goto(report,{waitUntil:'domcontentloaded',timeout:90000});
 if(!response||!response.ok())throw new Error('Power BI não respondeu com sucesso: HTTP '+response?.status());
 await page.waitForTimeout(25000);
 // O Power BI é uma SPA. Confere se renderizou conteúdo visível, sem tentar contornar autenticação.
 const body=await page.locator('body').innerText({timeout:15000});
 if(body.length<50 || /access denied|acesso negado|sign in to view|entre na sua conta/i.test(body))throw new Error('Relatório não renderizado publicamente');
 const pages=[];
 const shots=[];
 async function snap(n,label){
  const filename=`roc-${String(n).padStart(2,'0')}.png`;
  const tmp=path.join(target,'.'+filename+'.tmp.png');
  await page.screenshot({path:tmp,animations:'disabled',fullPage:false,timeout:30000});
  const stat=await fs.stat(tmp);
  if(stat.size<25000)throw new Error('Captura possivelmente vazia: '+filename);
  shots.push([tmp,path.join(target,filename)]);
  pages.push({filename,label});
 }
 await snap(1,'Visão atual do Power BI');
 // Páginas adicionais dependem dos controles acessíveis do painel; não são presumidas.
 const next=page.getByRole('button',{name:/next page|próxima página|próxima|next/i}).first();
 for(let i=2;i<=5;i++){
  if(!(await next.count()) || !(await next.isVisible()) || !(await next.isEnabled()))break;
  await next.click({timeout:10000});
  await page.waitForTimeout(4500);
  await snap(i,'Página '+i+' do Power BI');
 }
 // Só publica imagens e manifesto quando todas as capturas da execução tiveram sucesso.
 for(const [tmp,final] of shots)await fs.rename(tmp,final);
 const manifest={status:'ok',capturedAt,sourceUpdatedAt:null,source:'Painel público ROC/CBS, Receita Federal (Power BI)',url:report,pages,
 note:'Horário de captura da visualização, não horário da atualização da base de dados. Não há extração estruturada de indicadores.'};
 await fs.writeFile(path.join(target,'manifest.json.tmp'),JSON.stringify(manifest,null,2)+'\n');
 await fs.rename(path.join(target,'manifest.json.tmp'),path.join(target,'manifest.json'));
 console.log('Capturas concluídas:',pages.length,capturedAt);
}catch(err){console.error('Erro na captura (não publicar atualização):',err);process.exitCode=1;}
finally{await browser?.close();}

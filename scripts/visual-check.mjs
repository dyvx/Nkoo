import { chromium } from '@playwright/test';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const context=await browser.newContext();const page=await context.newPage();const errors=[];
page.on('pageerror',e=>errors.push(e.message));
for(const width of [375,390,430,768,1024,1440,1920]){
  await page.setViewportSize({width,height:width<500?844:1000});
  await page.goto('http://127.0.0.1:3000/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`.arena/screenshots/home-${width}.png`,fullPage:width===390});
  const dimensions=await page.evaluate(()=>({window:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth,cards:document.querySelectorAll('.video-card').length}));
  console.log(width,dimensions);
}
await page.setViewportSize({width:1440,height:1000});
for(const [name,path] of [['search','/search?q=cinematic'],['categories','/categories'],['details','/video/v01'],['player','/watch/v01'],['library','/library'],['profile','/profile?tab=preferences']]){
  await page.goto(`http://127.0.0.1:3000${path}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`.arena/screenshots/${name}-1440.png`,fullPage:true});
  console.log(name,await page.evaluate(()=>({window:innerWidth,scroll:document.documentElement.scrollWidth,body:document.body.scrollWidth}))); 
}
console.log('Page errors',errors);await browser.close();

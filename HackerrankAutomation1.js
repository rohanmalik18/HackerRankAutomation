// node HackerrankAutomation1.js --url=https://www.hackerrank.com --config=config.json
//npm init -y
//npm install minimist

let minimist = require("minimist");
let fs = require("fs");
let puppeteer = require("puppeteer");
let args = minimist(process.argv);

let configJSON = fs.readFileSync(args.config , "utf-8");
let configJSO = JSON.parse(configJSON);

//let browserLaunchkaPromise = puppeteer.launch({headless:false});
//browserLaunchkaPromise.then(function(browser){
   // let pagesKaPromise = browser.pages();
   // pagesKaPromise.then(function(pages){
    //    let pageOpenKaPromise = pages[0].goto(args.url);
     //   pageOpenKaPromise.then(function(){
       //     let browserCloseKaPromise = browser.close();
           // browserCloseKaPromise.then(function(){
         //       console.log("browser Closed");
            //})
       // })
    //})
//})

async function run(){
  let browser = await puppeteer.launch({
    headless: false,
    args: [
        '--start-maximized'
    ],
    defaultViewport: null
  });
  let pages = await browser.pages();
  let page =  pages[0];
  await page.goto(args.url);

  await page.waitForSelector("a[data-event-action='Login']");
  await page.click("a[data-event-action='Login']");
  
  await page.waitForSelector("a[href='https://www.hackerrank.com/login']");
  await page.click("a[href='https://www.hackerrank.com/login']" , {delay:200});
  await page.waitFor(3000);
  await page.waitForSelector("input[name='username']");
  await page.type("input[name='username']" , configJSO.userid, {delay:200});

  await page.waitForSelector("input[name='password']");
  await page.type("input[name='password']" , configJSO.password , {delay:200});

  await page.waitForSelector("button[data-analytics='LoginPassword']");
  await page.click("button[data-analytics='LoginPassword']");

  await page.waitForSelector("a[data-analytics='NavBarContests']");
  await page.click("a[data-analytics='NavBarContests']");

  await page.waitForSelector("a[href='/administration/contests/']");
  await page.click("a[href='/administration/contests/']");

  //find number of pages
    await page.waitForSelector("a[data-attr1='Last']");
    let numPages = await page.$eval("a[data-attr1='Last']" , function(atag){
    let totPages = parseInt(atag.getAttribute("data-page"));
    return totPages;
  });
  for(let i = 1; i <= numPages; i++){
    await handleAllContestsOfAPage(page , browser);
    if(i < numPages){
      await page.waitForSelector("a[data-attr1='Right']");
      await page.click("a[data-attr1='Right']");
    }
  }
}
async function handleAllContestsOfAPage(page , browser){
  await page.waitForSelector("a.backbone.block-center");
  let curls = await page.$$eval("a.backbone.block-center" , function(atags){
    let urls = [];
    for(let i = 0; i < atags.length; i++){
      let url = atags[i].getAttribute("href");
      urls.push(url);
    }
    return urls;
  });

  for( let i = 0; i < curls.length; i++){
    let ctab = await browser.newPage();
    await saveModeratorInContests(ctab , args.url + curls[i] , configJSO.moderators);
    await ctab.close();
    await page.waitFor(3000);
  }
}
async function saveModeratorInContests( ctab , fullCurl , moderators){
  await ctab.bringToFront();
  await ctab.goto(fullCurl);
  await ctab.waitFor(3000);

  await ctab.waitForSelector("li[data-tab='moderators']");
  await ctab.click("li[data-tab='moderators']");

  await ctab.waitForSelector("input#moderator");
  await ctab.type("input#moderator" , moderators , {delay:50});

  await ctab.keyboard.press("Enter");
}
run();

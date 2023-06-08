const puppeteer = require('puppeteer-core')
const fs = require('fs');


const auth = 'brd-customer-hl_d9003a1e-zone-scraping_browser:i71fs9ivjkp1';

async function run(){
    let browser;
    try {
        browser = await puppeteer.connect({
            browserWSEndpoint: `wss://${auth}@zproxy.lum-superproxy.io:9222`,
        });
        const page = await browser.newPage();
        page.setDefaultNavigationTimeout(2*60*1000);
        await page.goto('https://bot.sannysoft.com/');

        await page.screenshot({path:"bot.jpg"})
        // const html = await page.evaluate(()=> {
        //    const bookPods = Array.from(document.querySelectorAll('.product_pod'))
        //    const data = bookPods.map((book) => ({
        //     titel: book.querySelector("h3 a").getAttribute("title"),
        //     price: book.querySelector(".price_color").textContent,
        //    }))
        //    return data;
          
        // });
        // //const html = await page.waitForSelector('.');
        //  console.log(html); 

        //  fs.writeFile("data.json", JSON.stringify(html), (error)=>{
        // if(error)throw error
        // console.log("The file was saved!")});

    } catch(e){
        console.error('run failed', e);
    }  
    await browser?.close();
}

if (require.main==module)
    run();
        
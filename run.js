const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://bingoboom.ru/game/seabattle2');
    //await page.screenshot({path: 'example.png'});

    page.on("domcontentloaded", () => {
        console.log(document.querySelector("html").textContent);
        browser.close();
    });

})();
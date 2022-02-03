const puppeteer = require('puppeteer');

// (async () => {
//   const browser = await puppeteer.launch({
//     args: ['--no-sandbox', '--disable-setuid-sandbox'],
//   });
//   const page = await browser.newPage();
//   await page.goto('https://buddy.works');
//   await page.screenshot({ path: 'buddy-screenshot.png' });

//   await browser.close();
// })();

const finvizUrl = 'https://finviz.com/';
const finvizMapUrl = 'https://finviz.com/map.ashx';
const finvizMainPage = 'finviz-main.png';
const finvizMapPage = 'finviz-map.png';

startBrowser = async () => {
  // if in local, headless set to false, otherwise set to true
  let chromeExecutable = '';
  const basePath = './node_modules/puppeteer/.local-chromium';
  console.log('currently running in platform: ', process.platform);
  bundledChromiumFolder = fs.readdirSync(basePath).filter((file) => {
    return fs.statSync(basePath + '/' + file).isDirectory();
  });
  console.log('bundled Chromium Folder is ', bundledChromiumFolder);
  if (process.platform === 'darwin') {
    chromeExecutable =
      basePath +
      '/' +
      bundledChromiumFolder +
      '/chrome-mac/Chromium.app/Contents/MacOS/Chromium';
  } else if (process.platform === 'linux') {
    chromeExecutable =
      basePath + '/' + bundledChromiumFolder + '/chrome-linux/chrome';
  } else {
    chromeExecutable = '/usr/bin/chromium';
  }
  console.log('to be launched chromeExecutable = ', chromeExecutable);
  const browser = await puppeteer.launch({
    headless: true,
    dumpio: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    executablePath: chromeExecutable,
  });
  const page = await browser.newPage();
  page.setUserAgent(
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4182.0 Safari/537.36'
  );
  return { browser, page };
};

closeBrowser = async (browser) => {
  return browser.close();
};

stockViz = async () => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });

  await page.goto(finvizUrl, { waitUntil: 'load' });
  console.log('Finviz page loaded');
  await page.screenshot({ path: finvizMainPage });

  await page.goto(finvizMapUrl, { waitUntil: 'load' });
  console.log('Finviz map page loaded');
  await page.screenshot({ path: finvizMapPage });

  await closeBrowser(browser);
};

// run the main automation
(async () => {
  await stockViz();
})();

const puppeteer = require('puppeteer');
const fs = require('fs');

const lcLoginUrl = 'https://leetcode.com/accounts/login/';
const usernameSelector = '#id_login';
const passwordSelector = '#id_password';
const loginSubmitSelector = '#signin_btn > div';

// get login username and password from environment variable
const loginUsername = process.env.LOGIN_USERNAME;
const loginPassword = process.env.LOGIN_PASSWORD;
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
    headless: false,
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

getCoin = async (url) => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });

  // login
  await page.goto(url, { waitUntil: 'load' });
  console.log('LC page loaded');

  // type in username and password
  await page.type(usernameSelector, loginUsername);
  await page.type(passwordSelector, loginPassword);

  // await page.click(loginSubmitSelector);
  await page.keyboard.press('Enter');
  console.log('Submitted login info');
  await page.waitForNavigation();

  await closeBrowser(browser);
};

// run the main automation
(async () => {
  await getCoin(lcLoginUrl);
})();

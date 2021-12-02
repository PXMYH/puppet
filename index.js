const puppeteer = require('puppeteer');
const C = require('./constants');
const LOGIN_SELECTOR =
  'body > div.container-fliud > div.dark > header > div:nth-child(2) > div.br-main-menu.float-right > ul > li:nth-child(2)';
const USERNAME_SELECTOR = '#UserEmail';
const PASSWORD_SELECTOR = '#UserPassword';
const SUBMIT_SELECTOR = '#UserLoginForm > div:nth-child(4) > div > div > input';
const REDIRECTION_SELECTOR = '#info > a';
const mintvineDashboardUrl = 'https://surveys.gobranded.com/users/dashboard';

startBrowser = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  return { browser, page };
};

closeBrowser = async (browser) => {
  return browser.close();
};

playTest = async (url) => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });
  await page.goto(url);
  await page.click(LOGIN_SELECTOR);
  await page.waitForTimeout(4000);
  // await page.waitForNavigation();
  await page.click(USERNAME_SELECTOR);
  console.log('USERNAME_SELECTOR = ', USERNAME_SELECTOR);
  await page.keyboard.type(C.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(C.password);
  await page.click(SUBMIT_SELECTOR);
  await page.waitForNavigation();
  await page.goto(mintvineDashboardUrl);
  await page.screenshot({ path: 'mintvine.png' });
};

(async () => {
  await playTest('https://mintvine.com/');
  process.exit(1);
})();

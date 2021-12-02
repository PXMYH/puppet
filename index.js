const puppeteer = require('puppeteer');
const C = require('./constants');
const LOGIN_SELECTOR =
  'body > div.container-fliud > div.dark > header > div:nth-child(2) > div.br-main-menu.float-right > ul > li:nth-child(2)';
const USERNAME_SELECTOR = '#UserEmail';
const PASSWORD_SELECTOR = '#UserPassword';
const SUBMIT_SELECTOR = '#UserLoginForm > div:nth-child(4) > div > div > input';
const REDIRECTION_SELECTOR = '#info > a';
const mintvineDashboardUrl = 'https://surveys.gobranded.com/users/dashboard';
const poll_wrapper_selector = '#PollDashboardForm > div.poll-ui-wrapper';

startBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  return { browser, page };
};

closeBrowser = async (browser) => {
  return browser.close();
};

login = async (url) => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });

  // login
  await page.goto(url, { waitUntil: 'load' });
  console.log('Mintvine page loaded');
  await page.click(LOGIN_SELECTOR);
  await page.waitForTimeout(4000);
  await page.click(USERNAME_SELECTOR);
  await page.keyboard.type(C.username);
  await page.click(PASSWORD_SELECTOR);
  await page.keyboard.type(C.password);
  await page.click(SUBMIT_SELECTOR);
  console.log('Submitted login info');
  await page.waitForNavigation();

  // dashboard
  await page.goto(mintvineDashboardUrl, { waitUntil: 'load' });
  console.log('Mintvine dashboard loaded');
  await page.evaluate(() => {
    // let elements = $(poll_wrapper_selector).toArray();
    let elements = $('#PollDashboardForm > div.poll-ui-wrapper').toArray();
    for (i = 0; i < elements.length; i++) {
      console.log('element is ', elements[i]);
      // $(elements[i]).click();
    }
  });
  await page.screenshot({ path: 'mintvine.png', fullPage: true });
  browser.close();
};

(async () => {
  await login('https://mintvine.com/');
})();

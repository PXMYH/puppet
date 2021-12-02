const puppeteer = require('puppeteer');
const C = require('./constants');

// variable declaration
const loginLinkSelector =
  'body > div.container-fliud > div.dark > header > div:nth-child(2) > div.br-main-menu.float-right > ul > li:nth-child(2)';
const usernameSelector = '#UserEmail';
const passwordSelector = '#UserPassword';
const loginSubmitSelector =
  '#UserLoginForm > div:nth-child(4) > div > div > input';
const mintvineDashboardUrl = 'https://surveys.gobranded.com/users/dashboard';
const pollWrapperSelector =
  '#PollDashboardForm > div.poll-ui-wrapper > label.poll-label';
const pollAnswerSubmitSelector =
  '#PollDashboardForm > input.submit-poll.d-none.d-sm-flex.btn.btn-outline-primary';
const screenshotName = 'mintvine.png';

startBrowser = async () => {
  const browser = await puppeteer.launch({ headless: false, dumpio: true });
  const page = await browser.newPage();
  return { browser, page };
};

closeBrowser = async (browser) => {
  return browser.close();
};

wheelSpin = async (url) => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });

  // login
  await page.goto(url, { waitUntil: 'load' });
  console.log('Mintvine page loaded');
  await page.click(loginLinkSelector);
  await page.waitForTimeout(2000);
  await page.click(usernameSelector);
  await page.keyboard.type(C.username);
  await page.click(passwordSelector);
  await page.keyboard.type(C.password);
  await page.click(loginSubmitSelector);
  console.log('Submitted login info');
  await page.waitForNavigation();

  // dashboard
  await page.goto(mintvineDashboardUrl, { waitUntil: 'load' });
  console.log('Mintvine dashboard loaded');

  await page.evaluate((pollWrapperSelector) => {
    let elements = $(pollWrapperSelector).toArray();
    if (elements.length != 0) {
      $(elements[0]).click(); // click the first element
    }

    // alternative: click each element, just for fun :)
    // for (i = 0; i < elements.length; i++) {
    //   console.log('element is ', elements[i]);
    //   $(elements[i]).click();
    // }
  });
  await page.click(pollAnswerSubmitSelector);
  console.log('Submitted daily poll answer');

  // taking a screenshot
  // TODO: set screenshot name with date time
  await page.screenshot({ path: screenshotName, fullPage: true });
  await page.waitForTimeout(200000000);

  browser.close();
};

// run the main automation
(async () => {
  await wheelSpin('https://mintvine.com/');
})();

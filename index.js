const puppeteer = require('puppeteer');
const fs = require('fs');

//////////////////////////// TODO /////////////////////////////////////
//
// * [Done] randomize poll answer selection
// * randomize wait time to simulate more natural user flow
// * set up schedule to run the script
// * support multi-account for max profit
//////////////////////////////////////////////////////////////////////

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
const currentDate = new Date();
const datetime =
  currentDate.getFullYear().toString() +
  currentDate.getMonth().toString() +
  currentDate.getDay().toString() +
  currentDate.getHours().toString() +
  currentDate.getMinutes().toString();
const screenshotName = `mintvine_${datetime}.png`;

// get login username and password from environment variable
const loginUsername = process.env.LOGIN_USERNAME;
const loginPassword = process.env.LOGIN_PASSWORD;

startBrowser = async () => {
  // TODO: improvement: differentiate the environment where the script is run
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
    executablePath: chromeExecutable, // this is temporary, should differentiate the running environment
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

getRandomArbitrary = (min, max) => {
  return Math.random() * (max - min) + min;
};

wheelSpin = async (url) => {
  const { browser, page } = await startBrowser();
  page.setViewport({ width: 1366, height: 768 });

  // login
  await page.goto(url, { waitUntil: 'load' });
  console.log('Mintvine page loaded');

  // bring up login page
  // TODO: improvement: go to https://surveys.gobranded.com/users/login/ directly
  await page.click(loginLinkSelector);
  await page.waitForTimeout(2000);

  // To avoid the following error, we can't use page.keyboard.type()
  //   /Users/runner/work/puppet/puppet/node_modules/puppeteer/lib/cjs/puppeteer/common/Input.js:222
  //   for (const char of text) {
  //                      ^
  // TypeError: text is not iterable
  // at Keyboard.type (/Users/runner/work/puppet/puppet/node_modules/puppeteer/lib/cjs/puppeteer/common/Input.js:222:28)
  // at wheelSpin (/Users/runner/work/puppet/puppet/index.js:92:23)
  // at processTicksAndRejections (node:internal/process/task_queues:96:5)
  // at async /Users/runner/work/puppet/puppet/index.js:139:3
  // error Command failed with exit code 1.
  // await page.click(usernameSelector);
  // await page.keyboard.type(loginUsername);
  // await page.click(passwordSelector);
  // await page.keyboard.type(loginPassword);

  // type in username and password
  console.log('loginUsername: ', loginUsername);
  console.log('loginPassword: ', loginPassword);
  await page.type(usernameSelector, loginUsername);
  await page.type(passwordSelector, loginPassword);

  await page.click(loginSubmitSelector);
  console.log('Submitted login info');
  await page.waitForNavigation();

  // dashboard
  await page.goto(mintvineDashboardUrl, { waitUntil: 'load' });
  console.log('Mintvine dashboard loaded');

  await page.evaluate(() => {
    const pollWrapperSelector =
      '#PollDashboardForm > div.poll-ui-wrapper > label.poll-label';
    let elements = $(pollWrapperSelector).toArray();
    if (elements.length != 0) {
      // randomly choose a number between 0 and elements.length
      const randomOption = Math.random() * (elements.length - 0) + 0;
      const option = Math.floor(randomOption); // we need to floor it to round to nearest integer
      console.log('choosing option ', option);
      $(elements[option]).click(); // click the first element
    }

    // alternative: click each element, just for fun :)
    // for (i = 0; i < elements.length; i++) {
    //   console.log('element is ', elements[i]);
    //   $(elements[i]).click();
    // }
  });
  // we wait for 3s for the selection to settle
  // TODO: improvement: alternatively, we can wait for a classname poll-checked to appear
  // it is a better approach since we won't have the flakiness of timeout
  await page
    .waitForTimeout(3000)
    .then(() => console.log('Waited 3 seconds for evaluate completion'));
  await page.click(pollAnswerSubmitSelector);
  console.log('Submitted daily poll answer');

  // taking a screenshot
  // TODO: set screenshot name with date time
  await page.screenshot({ path: screenshotName, fullPage: true });

  browser.close();
};

// run the main automation
(async () => {
  await wheelSpin('https://mintvine.com/');
})();

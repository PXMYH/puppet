const puppeteer = require('puppeteer');
const fs = require('fs');
const B2 = require('backblaze-b2');

const finvizUrl = 'https://finviz.com/';
const finvizMapUrl = 'https://finviz.com/map.ashx';

const today = new Date().toISOString().slice(0, 10);

const finvizMainPage = `finviz-main-${today}.png`;
const finvizMapPage = `finviz-map-${today}.png`;

const b2BucketName = 'finvizMap';

const b2ApplicationKeyId = process.env.MAP_B2_KEY_ID;
const b2ApplicationKey = process.env.MAP_B2_APPLICATION_KEY;

console.log('b2ApplicationKeyId = ', b2ApplicationKeyId);
console.log('b2ApplicationKey = ', b2ApplicationKey);

// create B2 object instance
const b2 = new B2({
  applicationKeyId: b2ApplicationKeyId,
  applicationKey: b2ApplicationKey,
  retry: {
    retries: 3, // by default
  },
});

const uploadMap = async (filename) => {
  try {
    // authorize with provided credentials (authorization expires after 24 hours)
    const auth = await b2.authorize();

    // get bucket Id
    const response = await b2.getBucket({ bucketName: b2BucketName });
    const bucketId = response.data.buckets[0].bucketId;

    // get upload url
    const result = await b2.getUploadUrl({
      bucketId: bucketId,
    });
    console.log('result = ', result);
    const uploadUrl = result.data.uploadUrl;
    const uploadAuthToken = result.data.authorizationToken;

    fs.readFile(filename, async (err, data) => {
      if (err) throw err;
      console.log('data to upload', data);
      // upload file to remote bucket
      console.log(`uploading ${filename}`);
      await b2.uploadFile({
        uploadUrl: uploadUrl,
        uploadAuthToken: uploadAuthToken,
        fileName: filename,
        data: data,
        onUploadProgress: (event) => {
          console.log(`uploading ... ${event}`);
        },
      });
    });
  } catch (err) {
    console.log('Error uploading file:', err);
  }
};

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

  // upload maps
  await uploadMap(finvizMainPage);

  await closeBrowser(browser);
};

// run the main automation
(async () => {
  await stockViz();
})();

const axios = require('axios');
const parser = require('node-html-parser');

// url e.g. https://floorplanonline.com/story/411000/u
const BASE_URL = 'https://floorplanonline.com/story/';
// const INIT_POST_ID = 020;
// const MAX_POST_LIMIT = 020;
// uncomment below for real scraping
const INIT_POST_ID = 390000;
const MAX_POST_LIMIT = 500000;
const SLEEP = 1000; // in miliseconds

const scrapeAddresses = (url) => {
  axios
    .get(url)
    .then((res) => {
      // console.log(res.data);
      getAddress(res.data, url);
    })
    .catch((error) => {
      console.error(error);
    });
};

const getAddress = (html, url) => {
  const root = parser.parse(html);
  raw_address = root.querySelector('head > title').rawText;

  const address =
    raw_address == 'Story'
      ? 'Not available'
      : raw_address.replace('Powered by FloorPlanOnline', '');

  console.log(`url is ${url}, address is ${address}`);
};

const delay = (time) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};

const run = async () => {
  for (let postId = INIT_POST_ID; postId <= MAX_POST_LIMIT; postId++) {
    const url = BASE_URL + postId.toString() + '/u';
    scrapeAddresses(url);

    console.log('Sleep a bit');
    await delay(SLEEP); // sleep 1s
  }
};

run();

const puppeteer = require("puppeteer");

async function scrape() {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1920,
    height: 1080,
  });
  await page.goto(
    "https://search.google.com/local/reviews?placeid=ChIJBVW3rfqvUQ0RgTHzJQPqHTk"
  );
  await page.screenshot({ path: "step1.png" });
  //let cookieButton = await page.waitForSelector("#L2AGLb", {
  //  visible: true,
  // });
  let button = await page.waitForSelector("#L2AGLb", { visible: true });
  await page.screenshot({ path: "step2.png" });

  page.click("#L2AGLb");

  await page.screenshot({ path: "step3.png" });

  await page.waitForXPath(
    "/html/body/span[2]/g-lightbox/div[2]/div[3]/span/div/div/div/div[1]/div[1]/div[1]/div[1]",
    { visible: true }
  );

  //Get title of Business
  const titleElement = await page.$("div.MXv6hf > div.VUGnzb > div.P5Bobd");
  let title = await page.evaluate((el) => el.textContent, titleElement);

  //Get stars of Business
  const starsElement = await page.$("span.Aq14fc");
  let businessStars = await page.evaluate((el) => el.textContent, starsElement);

  //Get number of reviews
  const reviewCountElement = await page.$("span > span.z5jxId");
  let reviewCount = await page.evaluate(
    (el) => el.textContent,
    reviewCountElement
  );
  reviewCount = reviewCount.replace(/\D/g, "");

  //Get the reviews
  let reviews = [];

  const reviewsElements = await page.$$("div.WMbnJf");
  reviewsElements.forEach(async (review) => {
    //Get name
    const name = await review.$eval(".TSUbDb", (el) => el.textContent);

    //Get Stars
    let stars = await review.$eval(".EBe2gf", (el) =>
      el.getAttribute("aria-label")
    );

    stars = stars.match(/\d/)[0]; // Returns an array with the matches, and it will always be the first one

    //Get description
    let description = ""; //await review.$eval(".MZnM8e", (el) => el.textContent);
    if ((await review.$(".review-full-text")) !== null) {
      description = await review.$eval(
        ".review-full-text",
        (el) => el.textContent
      );
    } else {
      description = await review.$eval(
        'span[jscontroller="MZnM8e"]',
        (el) => el.textContent
      );
    }

    //Get images
    let images = [];
    if ((await review.$(".DQBZx")) !== null) {
      images = await review.$$eval("div.JrO5Xe", (el) =>
        el.map((x) => x.style.getPropertyValue("background-image"))
      );
    }
    //parse urls to valid format
    images.forEach((image) => {
      image = image.slice(image.indexOf("h"), image.indexOf("="));
    });
    //console.log(name + " " + stars + " " + description + " " + images);
    reviews.push({
      name: name,
      stars: stars,
      description: description,
      images: images,
    });
    //console.log(reviews);
  });

  console.log(title);
  console.log(businessStars);
  console.log(reviewCount);
  console.log(reviews);

  await page.screenshot({ path: "step4.png" });

  browser.close();
  console.log("Curated reviews: " + reviews.length);
  console.log(reviews);
}

scrape();

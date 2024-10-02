const { analyzeSites } = require("./analyzer.js");
const playwright = require("playwright");
const { analyzeSitesV2 } = require("./analyzerV2.js");
const { getHtmlContent } = require("./take-screenshot.js");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

module.exports.collectSiteData = async function (sites, baseUrl, version = 1) {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    userAgent,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });
  try {
    const page = await context.newPage();
    // Enable console logging
    // page.on('console', (msg) => {
    //     const type = msg.type();
    //     const location = msg.location();
    //     const text = msg.text();
    //     console.log(`[Console ${type}] (${location.url}:${location.line}:${location.column}) - ${text}`);
    // });

    const results =
      version === 1
        ? await analyzeSites(page, sites, baseUrl)
        : await analyzeSitesV2(page, sites, baseUrl);
    return results;
  } catch (error) {
    return { error: error.message };
  } finally {
    await browser.close();
  }
};

module.exports.getHtmlFromUrl = async function (url) {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36";
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext({
    userAgent,
    bypassCSP: true,
    ignoreHTTPSErrors: true,
  });
  try {
    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "networkidle",
      timeout: 30000,
    });
    return await getHtmlContent(page);
  } finally {
    await browser.close();
  }
};

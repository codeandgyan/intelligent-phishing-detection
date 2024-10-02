const { parseHtmlV2 } = require("./htmlFeatures.js");
const {
  captureScreenshot,
  captureHtmlContent,
  getHtmlContent,
} = require("./take-screenshot.js");
const { skipExtraction, skipWords } = require("./common");

module.exports.analyzeSitesV2 = async function (page, sites, baseUrl) {
  const results = [];
  console.log("---------------START: V2------------------");
  const urlPrefix = baseUrl ? baseUrl : "";
  for (const site of sites) {
    const url = site.url;
    try {
      if (!url) {
        continue;
      }
      const hostname = new URL(url).hostname;
      // Ignore bit.ly links as they already take care of blocking phishing sites
      if (hostname.includes("bit.ly")) {
        continue;
      }

      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      const htmlFileContent = await getHtmlContent(page);

      if (skipWords.some((word) => htmlFileContent.includes(word))) {
        continue;
      }
      const features = await parseHtmlV2(site.id, htmlFileContent, site.url);
      if (skipExtraction(features)) {
        continue;
      }

      await captureScreenshot(page, site);
      await captureHtmlContent(page, site);

      results.push({
        ...features,
        pageScreenshot: `${urlPrefix}/screenshots/${site.id}-${site.company}.png`,
        htmlContent: `${urlPrefix}/htmlcontent/${site.id}-${site.company}.html`,
      });
      console.log(site.id, "|", site.company, "|", "Complete", "|", url);
    } catch (error) {
      console.error(
        site.id,
        "|",
        site.company,
        "|",
        "Error",
        "|",
        url,
        "|",
        error
      );
    }
  }
  console.log("---------------END: V2------------------");
  return results;
};

const features = require("./features.js");
const { captureScreenshot, captureHtmlContent } = require("./take-screenshot.js");

module.exports.analyzeSites = async function (page, sites, baseUrl) {
  const results = [];
  console.log("---------------------------------");
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

      const siteAnalysisData = await module.exports.getSiteAnalysisData(page);

      await captureScreenshot(page, site);
      await captureHtmlContent(page, site);

      results.push({
        ...siteAnalysisData,
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
      // console.error(site.id, '|', site.company, '|', 'Error', '|', url);
    }
  }
  console.log("---------------------------------");
  return results;
};
module.exports.getSiteAnalysisData = async function (page) {
  const siteDetails = await features.getSiteDetails(page);
  const metaKeywordsAndDesc = await features.getMetaKeywordsAndDescription(
    page
  );
  const headTagCount = await features.getHeadTagCount(page);
  const webGeneratorTool = await features.getMetaGenerator(page);
  const imgAltTagsMissingCount = await features.imageAltTagsMissingCount(page);
  const brokenAndTotalLinkCount = await features.getBrokenAndTotalLinkCount(
    page
  );
  const hasPasswordField = await features.hasPasswordField(page);
  const domainExtension = await features.getDomainExtension(page);
  const hasValidSignInFields = await features.hasValidSignInFields(page);
  const hasInvalidSignInFields = await features.hasInvalidSignInFields(page);
  const hasDifferentURLs = await features.hasDifferentURLs(page);
  const hasFavicon = await features.hasFavicon(page);
  const hasPhishingKeywords = await features.hasPhishingKeywords(page);
  const svgAttributesCount = await features.getSvgAttributesCount(page); // OBJ
  const footerDetails = await features.getFooterDetails(page);
  const linkingDomains = await features.extractLinkDomainExtensions(page);
  const iframeDetails = await getIframeDetails(page);
  const scriptObfuscations = await features.getScriptObfuscations(page);

  const siteData = {
    ...siteDetails,
    ...metaKeywordsAndDesc,
    ...headTagCount,
    webGeneratorTool,
    imgAltTagsMissingCount,
    ...brokenAndTotalLinkCount,
    hasPasswordField,
    domainExtension,
    hasValidSignInFields,
    hasInvalidSignInFields,
    hasDifferentURLs,
    hasFavicon,
    hasPhishingKeywords,
    ...svgAttributesCount,
    ...footerDetails,
    linkingDomains,
    scriptObfuscations,
    iframeDetails,
  };
  return siteData;
};

async function getIframeDetails(page) {
  const iframes = await page.$$("iframe");
  const iframeDetails = [];

  for (const iframe of iframes) {
    const iframePage = await iframe.contentFrame();
    if (iframePage) {
      const iframeDetail = await module.exports.getSiteAnalysisData(iframePage);
      iframeDetails.push(iframeDetail);
    }
  }
  return iframeDetails;
}

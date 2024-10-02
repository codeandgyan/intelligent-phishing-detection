const cheerio = require("cheerio");
const querystring = require("querystring");
const RobotsParser = require("robots-parser");

const { freeHostingServices } = require("./free-hosting-services");
const { default: axios } = require("axios");

function getMetaKeywordsAndDescription($) {
  const metaKeywords =
    $('meta[name="keywords"], meta[name="Keywords"]').length > 0;
  const metaDescription =
    $('meta[name="description"], meta[name="Description"]').length > 0;
  return {
    keywordsPresent: metaKeywords,
    descriptionPresent: metaDescription,
    descriptionOrKeywordsPresent: metaKeywords || metaDescription,
  };
}

function getWebGenerator(baseUrl, $) {
  const domain = getHostName(baseUrl);
  const matchedService = freeHostingServices.find((service) =>
    domain?.endsWith(service)
  );
  return $('meta[name="generator"]').attr("content") ?? matchedService ?? "";
}

function getHeadTagCount($) {
  const metaTags = $("meta");
  const linkTags = $("link");
  const scriptTags = $("script");
  return {
    metaTagCount: metaTags.length,
    linkTagCount: linkTags.length,
    scriptTagCount: scriptTags.length,
  };
}

function imageTagDetails($) {
  const imgTagCount = $("img").length;
  const imgAltTagsMissingCount = $("img:not([alt])").length;
  return {
    imgTagCount,
    imgAltTagsMissingCount,
    imgAltTagsMissingPercent:
      imgTagCount > 0 ? (imgAltTagsMissingCount / imgTagCount) * 100 : -1,
  };
}

function noAriaAttributesFound($) {
  const ariaElements = $("[aria-*]");
  return ariaElements.length === 0;
}

function getBrokenAndTotalLinkCount($) {
  const totalLinkCount = $("a").length;
  const brokenLinksCount = $("a:not([href])").length;
  const brokenLinkPercent =
    totalLinkCount > 0 ? (brokenLinksCount / totalLinkCount) * 100 : -1;

  const selfLinkingCount = $(
    'a[href="#"], a[href="/"], a[href="javascript:void(0)"]'
  ).length;
  const selfLinkingCountPercent =
    totalLinkCount > 0 ? (selfLinkingCount / totalLinkCount) * 100 : -1;

  return {
    totalLinkCount,
    brokenLinksCount,
    brokenLinkPercent,
    selfLinkingCount,
    selfLinkingCountPercent,
  };
}

function getFavicon($) {
  return $('link[rel="shortcut icon"], link[rel="icon"]').length > 0;
}

function getFormDetails($) {
  const forms = $("form");
  let formActions = [
    ...new Set(
      forms
        .map((i, form) => {
          let action = $(form).attr("action");
          try {
            const parsedAction = new URL(action);
            return `${parsedAction.protocol}//${parsedAction.hostname}`;
          } catch {
            return action ? action : null;
          }
        })
        .get()
    ),
  ];
  return { formActions, formCount: forms.length };
}

function containsPasswordLabel($) {
  const passwordKeywords = ["password"];
  return passwordKeywords.some(
    (keyword) => $(`*:contains(${keyword.toLowerCase()})`).length > 0
  );
}

function containsValidSignInFields($) {
  const validLoginKeywords = ["sign in", "log in", "login", "sign on"];
  return validLoginKeywords.some(
    (keyword) => $(`*:contains(${keyword.toLowerCase()})`).length > 0
  );
}

function containsInvalidSignInFields($) {
  const invalidLoginKeywords = ["signin", "sign-in", "signon"];
  return invalidLoginKeywords.some(
    (keyword) => $(`*:contains(${keyword.toLowerCase()})`).length > 0
  );
}

function isRobotsMetaFound($) {
  return $('meta[name="robots"]').length > 0;
}

async function getRobotsTextDetails(pageUrl) {
  const robotsTxtUrl = `${new URL(pageUrl).origin}/robots.txt`;
  try {
    const response = await axios.get(robotsTxtUrl);
    return {
      robotsTextStatus: response.status,
      robotsTextError: "",
      // robotsTextContent: response.data,
    };
    // return response?.data?.replace(/[\r\n]+/g, "\n") ?? "";
  } catch (error) {
    console.log("Robots Call Error", error);
    return {
      robotsTextStatus: -1,
      // robotsTextContent: response.data,
      robotsTextError: error.message,
    };
  }
}

async function getRobotsTxt(pageUrl) {
  const robotsTxtUrl = `${new URL(pageUrl).origin}/robots.txt`;
  try {
    const response = await axios.get(robotsTxtUrl);
    return response?.data?.replace(/[\r\n]+/g, "\n") ?? "";
  } catch (error) {
    console.log("Robots Call Error", error);
    return error;
  }
}

// function hasPaymentKeywords ($) {
// const bodyText = await page.evaluate(() =>
//     document.body.textContent.toLowerCase()
// );
// const paymentKeywords = [
//     "bank",
//     "credit card",
//     "social security",
//     "pin",
//     "account",
//     "wallet",
//     "payment",
//     "transaction",
//     "pay",
//     "bank",
//     "banking",
//     "credit",
//     "social security number",
//     "ssn",
//     "debit",
//     "debit card",
//     "bank account",
//     "routing number",
//     "payment method",
// ];
// return paymentKeywords.some((keyword) => bodyText.includes(keyword));
// };

function containsPhishingKeywords($) {
  const phishingKeywords = [
    "verify",
    "verification",
    "urgent",
    "suspended",
    "suspension",
    "immediately",
    "immediate",
    "immediate action required",
    "account suspended",
    "security alert",
    "verify your account",
    "update your payment information",
    "claim your prize now",
    "click to claim your gift",
    "virus detected",
    "call support immediately",
    "verify identity immediately",
    "secure verification required",
    "important security update",
    "social security number",
  ];
  return phishingKeywords.some(
    (keyword) => $(`*:contains(${keyword.toLowerCase()})`).length > 0
  );
}

// function hasDifferentURLs ($) {
// const result = await page.evaluate(() =>
//     Array.from(document.links).some(
//     (link) => link.href && !link.href.includes(window.location.hostname)
//     )
// );
// return result;
// };

function getSvgTagDetails($) {
  const svgTags = $("svg");
  const totalSvgCount = svgTags.length;
  const missingSvgAttrCount = $("svg:not([xmlns]):not([xmlns\\:xlink])").length; // $("svg:not([xmlns])").length;
  const svgXmlnsMissingPercent =
    totalSvgCount > 0 ? (missingSvgAttrCount / totalSvgCount) * 100 : -1;
  return {
    totalSvgCount,
    missingSvgAttrCount,
    svgXmlnsMissingPercent,
  };
}

// function extractLinkDomainExtensions ($) {
// try {
//     const hrefValues = $eval("a", (anchors) =>
//     anchors.map((anchor) =>
//         anchor.href && anchor.href.length > 0
//         ? anchor.href
//         : anchor.getAttribute("xlink:href")
//     )
//     );

//     const urlsFromQueryStrings = extractUrlsFromQueryStrings(hrefValues);
//     hrefValues.push(...urlsFromQueryStrings);

//     const domainExtensions = [
//     ...new Set(
//         hrefValues.map((href) => {
//         try {
//             const domain =
//             href && href !== "" ? new URL(href).hostname : undefined;
//             return domain?.split(".").slice(-2).join(".");
//         } catch {
//             return undefined;
//         }
//         })
//     ),
//     ];

//     return domainExtensions.filter((ext) => ext !== null);
// } catch (error) {
//     console.error("Error extracting domain extensions:", error);
//     return [];
// }
// };

// function extractUrlsFromQueryStrings(...urlStrings) {
// const extractedUrls = [];
// for (const url of urlStrings) {
//     try {
//     const queryParameters = new URL(url).searchParams;
//     queryParameters.forEach((value) => {
//         try {
//         const urlObject = new URL(value);
//         extractedUrls.push(urlObject.href);
//         } catch (error) {
//         // Ignore invalid URLs
//         }
//     });
//     } catch {
//     extractedUrls.push(url);
//     }
// }
// return extractedUrls;
// }

function extractUrls(htmlContent) {
  const urlRegex =
    /(http[s]?:\/\/(?:[a-zA-Z]|[0-9]|[$-_@.&+]|[!*\\(\\),]|(?:%[0-9a-fA-F][0-9a-fA-F]))+)/g;
  const matches = [...new Set(htmlContent.match(urlRegex))];
  const urls = [
    ...new Set(
      matches.map((url) => {
        try {
          const parsedUrl = new URL(url);
          return `${parsedUrl.protocol}//${parsedUrl.hostname}`;
        } catch {
          return url;
        }
      })
    ),
  ];

  return urls || [];
}

// function getMatchingDomainUrlCount(urls, pageUrl) {
//   try {
//     const pageHostName = new URL(pageUrl).hostname;
//     return urls.filter((url) => {
//       try {
//         const urlHostName = new URL(url).hostname;
//         return (
//           pageHostName.endsWith(urlHostName) ||
//           urlHostName.endsWith(pageHostName)
//         );
//       } catch {
//         return false;
//       }
//     }).length;
//   } catch {
//     return 0;
//   }
// }

function isSecondLevelCountryDomain(hostname) {
  // Define regular expression for second-level country domains
  const regex = /(\.[a-z]{2,3}\.[a-z]{2})$/i;

  // Check if hostname matches the regular expression
  return regex.test(hostname);
}

function getMatchingDomainUrlCount(urls, baseUrl) {
  // Initialize counts
  let domainUrlMatchCount = 0;
  let domainUrlNotMatchCount = 0;
  try {
    // Create URL object for base URL
    const parsedBaseUrl = new URL(baseUrl);

    // Extract hostname of base URL
    const baseHostname = parsedBaseUrl.hostname;

    // Split hostname into parts
    const baseParts = baseHostname.split(".").reverse();

    // Iterate over each URL
    for (let url of urls) {
      // Create URL object
      const parsedUrl = new URL(url);

      // Extract hostname
      const hostname = parsedUrl.hostname;

      // Split hostname into parts
      const parts = hostname.split(".").reverse();

      // Compare the main domain and the top-level domain
      if (baseParts[0] === parts[0] && baseParts[1] === parts[1]) {
        if (isSecondLevelCountryDomain(hostname)) {
          if (baseParts[2] === parts[2]) {
            domainUrlMatchCount++;
          } else {
            domainUrlNotMatchCount++;
          }
        } else {
          domainUrlMatchCount++;
        }
      } else {
        domainUrlNotMatchCount++;
      }
    }
  } catch {}

  // Return counts
  return {
    domainUrlMatchCount,
    domainUrlNotMatchCount,
  };
}

function getUrlAssessment(urls, baseUrl) {
  const allUrls = [...urls, baseUrl];
  const suspiciosPatterns = [
    // Punycode domains
    /xn--/i,
  ];

  const usesSuspiciousUrlPatterns = allUrls.some((url) => {
    return suspiciosPatterns.some((pattern) => pattern.test(getHostName(url)));
  });

  const usesFreeHostingService = allUrls.some((url) => {
    return freeHostingServices.some((service) =>
      getHostName(url).endsWith(service)
    );
  });

  const top3DomainLengths = [
    ...new Set(allUrls.map((url) => getHostName(url).length)),
  ]
    .sort((a, b) => b - a)
    .slice(0, 3);

  return {
    usesSuspiciousUrlPatterns,
    usesFreeHostingService,
    top3DomainLengths,
  };
}

function getScriptChacterCount($) {
  const scriptCharacterCount = Array.from($("script")).reduce(
    (sum, elem) => sum + $(elem).html().length,
    0
  );
  return scriptCharacterCount;
}

function getStyleCharacterCount($) {
  const styleCharacterCount = Array.from($("style")).reduce(
    (sum, elem) => sum + $(elem).html().length,
    0
  );
  return styleCharacterCount;
}

function getUnsafeJSFunctions($) {
  return ["unescape", "document.write"].reduce((acc, func) => {
    acc[func] = $("script")
      .toArray()
      .some((tag) => $(tag).html().includes(func));
    return acc;
  }, {});
}

function getFooterDetails($) {
  // Find the <footer> tag
  const footer = $("footer");

  // Check if the <footer> tag is present
  const footerPresent = footer.length > 0;

  // Initialize counts
  let footerLinks = 0;
  let footerBrokenLinks = 0;

  if (footerPresent) {
    // Count the total number of <a> tags inside the footer
    footerLinks = footer.find("a").length;

    // Count the anchors that have either empty href value, or "#" href value or "/" href value or "javascript:void(0)" href value
    footerBrokenLinks = footer.find(
      'a[href="#"], a[href="/"], a[href="javascript:void(0)"], a[href=""], a:not([href])'
    ).length;
  }

  return {
    footerPresent,
    footerLinks,
    footerBrokenLinks,
  };
}

function getHostName(url) {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

function getDomainExtension(url) {
  const hostname = getHostName(url);
  const parts = hostname?.split(".").reverse();

  if (isSecondLevelCountryDomain(hostname)) {
    return ".".concat(parts?.slice(0, 2).reverse().join("."));
  }
  return ".".concat(parts.slice(0, 1));
}

function getSubdomainCount(domain) {
  const d = domain.replace(/^www\./, "");
  const ignore = isSecondLevelCountryDomain(d) ? 3 : 2;
  const partCount = d.split(".").length;
  return Math.max(partCount - ignore, 0);
}

function getSiteDetails($, url) {
  const parsedUrl = new URL(url);
  const domain = parsedUrl.hostname;
  const domainExtension = getDomainExtension(url);
  const secured = parsedUrl.protocol === "https:";
  const subdomains = getSubdomainCount(domain);
  const title = $("title").text();
  // const bodyText = await page.evaluate(() => document.body.textContent);
  return {
    url,
    domain,
    domainExtension,
    secured,
    subdomains,
    title,
    // bodyText,
  };
}

module.exports.parseHtmlV2 = async function (id, html, pageUrl) {
  const $ = cheerio.load(html);
  const siteDetails = getSiteDetails($, pageUrl);
  const metaKeywordsAndDesc = getMetaKeywordsAndDescription($);
  const headTagCount = getHeadTagCount($);
  const webGeneratorTool = getWebGenerator(pageUrl, $);
  const imgTagDetails = imageTagDetails($);
  const brokenAndTotalLinkCount = getBrokenAndTotalLinkCount($);
  const hasPasswordField = containsPasswordLabel($);
  const hasValidSignInFields = containsValidSignInFields($);
  const hasInvalidSignInFields = containsInvalidSignInFields($);
  const hasFavicon = getFavicon($);
  const hasPhishingKeywords = containsPhishingKeywords($);
  const svgAttributesCount = getSvgTagDetails($);
  const footerDetails = getFooterDetails($);
  //   const iframeDetails = getIframeDetails($);
  const scriptCharacterCount = getScriptChacterCount($);
  const styleCharacterCount = getStyleCharacterCount($);
  const formActions = getFormDetails($);
  const urls = extractUrls(html);
  const urlsMatchingDomain = getMatchingDomainUrlCount(urls, pageUrl);
  const urlAssessment = getUrlAssessment(urls, pageUrl);
  const unsafeJSFunctions = getUnsafeJSFunctions($);
  // const robotsTxt = await getRobotsTxt(pageUrl);
  // const robotsTxtDetails = await getRobotsTextDetails(pageUrl);

  const siteData = {
    id,
    ...siteDetails,
    ...metaKeywordsAndDesc,
    ...headTagCount,
    webGeneratorTool,
    ...imgTagDetails,
    ...brokenAndTotalLinkCount,
    hasPasswordField,
    hasValidSignInFields,
    hasInvalidSignInFields,
    hasFavicon,
    hasPhishingKeywords,
    ...svgAttributesCount,
    ...footerDetails,
    // iframeDetails,
    ...formActions,
    ...urlsMatchingDomain,
    ...urlAssessment,
    scriptCharacterCount,
    styleCharacterCount,
    urls,
    unsafeJSFunctions,
    // robotsTxt,
    // ...robotsTxtDetails,
  };
  return siteData;
};

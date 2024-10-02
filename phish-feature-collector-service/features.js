module.exports.getMetaKeywordsAndDescription = async function (page) {
  const metaKeywords =
    (await page.$('meta[name="keywords"]')) ??
    (await page.$('meta[name="Keywords"]'));
  const metaDescription =
    (await page.$('meta[name="description"]')) ??
    (await page.$('meta[name="Description"]'));
  return {
    keywordsPresent: !!metaKeywords,
    descriptionPresent: !!metaDescription,
  };
};

module.exports.getMetaGenerator = async function (page) {
  const metaGenerator = await page.$('meta[name="generator"]');
  return metaGenerator ? await metaGenerator.getAttribute("content") : "";
};

module.exports.getHeadTagCount = async function (page) {
  const metaTags = await page.$$("meta");
  const linkTags = await page.$$("link");
  const scriptTags = await page.$$("script");
  return {
    metaTagCount: metaTags.length,
    linkTagCount: linkTags.length,
    scriptTagCount: scriptTags.length,
  };
};

module.exports.imageAltTagsMissingCount = async function (page) {
  const imgTags = (await page.$$("img")) ?? [];
  return imgTags.filter((img) => !img.getAttribute("alt")).length;
};

module.exports.noAriaAttributesFound = async function (page) {
  const ariaElements = await page.$$("[aria-*]");
  return ariaElements.length === 0;
};
module.exports.getBrokenAndTotalLinkCount = async function (page) {
  const anchorTags = await page.$$("a");
  let brokenLinksCount = 0;
  let selfLinkingCount = 0;
  const totalLinkCount = anchorTags.length;
  for (const anchor of anchorTags) {
    const href = await anchor.getAttribute("href");
    if (!href) {
      brokenLinksCount++;
    }
    if (href === "#" || href === "/" || href === "javascript:void(0)") {
      selfLinkingCount++;
    }
  }
  return { brokenLinksCount, totalLinkCount, selfLinkingCount };
};
module.exports.getFormDetails = async function (page) {
  const forms = await page.$$("form");
  const formDetails = forms.map(async (form) => {
    const action = await form.getAttribute("action");
    return action || "Submit URL not found";
  });
  return formDetails;
};
module.exports.hasPasswordField = async function (page) {
  const bodyText = await page.evaluate(() =>
    document.body.textContent.toLowerCase()
  );
  const passwordKeywords = ["password"];
  return passwordKeywords.some((keyword) => bodyText.includes(keyword));
};

module.exports.hasValidSignInFields = async function (page) {
  const bodyText = await page.evaluate(() =>
    document.body.textContent.toLowerCase()
  );
  const validLoginKeywords = ["sign in", "log in", "login", "sign on"];
  return validLoginKeywords.some((keyword) => bodyText.includes(keyword));
};

module.exports.hasInvalidSignInFields = async function (page) {
  const bodyText = await page.evaluate(() =>
    document.body.textContent.toLowerCase()
  );
  const invalidLoginKeywords = ["signin", "sign-in", "signon"];
  return invalidLoginKeywords.some((keyword) => bodyText.includes(keyword));
};

module.exports.hasPaymentKeywords = async function (page) {
  const bodyText = await page.evaluate(() =>
    document.body.textContent.toLowerCase()
  );
  const paymentKeywords = [
    "bank",
    "credit card",
    "social security",
    "pin",
    "account",
    "wallet",
    "payment",
    "transaction",
    "pay",
    "bank",
    "banking",
    "credit",
    "social security number",
    "ssn",
    "debit",
    "debit card",
    "bank account",
    "routing number",
    "payment method",
  ];
  return paymentKeywords.some((keyword) => bodyText.includes(keyword));
};

module.exports.hasPhishingKeywords = async function (page) {
  const bodyText = await page.evaluate(() =>
    document.body.textContent.toLowerCase()
  );
  const phishingKeywords = ["verify", "verification"];
  return phishingKeywords.some((keyword) => bodyText.includes(keyword));
};

module.exports.getDomainExtension = async function (page) {
  const url = page.url();
  const domain = new URL(url).hostname;
  return domain.split(".").pop();
};

module.exports.hasFavicon = async function (page) {
  const favicon = await page.$('link[rel="icon"]');
  return !!favicon;
};

module.exports.hasDifferentURLs = async function (page) {
  const result = await page.evaluate(() =>
    Array.from(document.links).some(
      (link) => link.href && !link.href.includes(window.location.hostname)
    )
  );
  return result;
};

module.exports.getSvgAttributesCount = async function (page) {
  const svgTags = await page.$$("svg");
  let missingSvgAttrCount = 0;
  for (const svg of svgTags) {
    const xmlns = await svg.getAttribute("xmlns");
    const xlink = await svg.getAttribute("xmlns:xlink");
    if (!xmlns || !xlink) {
      missingSvgAttrCount++;
    }
  }
  return { missingSvgAttrCount, totalSvgCount: svgTags.length };
};

module.exports.getFooterDetails = async function (page) {
  try {
    const footer = await page.$("footer");
    if (!footer) {
      return {
        footerPresent: false,
        footerLinks: 0,
        footerBrokenLinks: 0,
      };
    }

    const footerLinks = await footer.$$("a");
    const totalLinks = footerLinks.length;

    let brokenLinksCount = 0;
    for (const link of footerLinks) {
      const href = await link.getAttribute("href");
      if (
        !href ||
        href === "#" ||
        href === "/" ||
        href === "javascript:void(0)"
      ) {
        brokenLinksCount++;
      }
    }

    return {
      footerPresent: true,
      footerLinks: totalLinks,
      footerBrokenLinks: brokenLinksCount,
    };
  } catch (error) {
    console.error(`Error analyzing footer links: ${error.message}`);
  }
};

module.exports.extractLinkDomainExtensions = async function (page) {
  try {
    const hrefValues = await page.$$eval("a", (anchors) =>
      anchors.map((anchor) =>
        anchor.href && anchor.href.length > 0
          ? anchor.href
          : anchor.getAttribute("xlink:href")
      )
    );

    const urlsFromQueryStrings = extractUrlsFromQueryStrings(hrefValues);
    hrefValues.push(...urlsFromQueryStrings);

    const domainExtensions = [
      ...new Set(
        hrefValues.map((href) => {
          try {
            const domain =
              href && href !== "" ? new URL(href).hostname : undefined;
            return domain?.split(".").slice(-2).join(".");
          } catch {
            return undefined;
          }
        })
      ),
    ];

    return domainExtensions.filter((ext) => ext !== null);
  } catch (error) {
    console.error("Error extracting domain extensions:", error);
    return [];
  }
};

function extractUrlsFromQueryStrings(...urlStrings) {
  const extractedUrls = [];
  for (const url of urlStrings) {
    try {
      const queryParameters = new URL(url).searchParams;
      queryParameters.forEach((value) => {
        try {
          const urlObject = new URL(value);
          extractedUrls.push(urlObject.href);
        } catch (error) {
          // Ignore invalid URLs
        }
      });
    } catch {
      extractedUrls.push(url);
    }
  }
  return extractedUrls;
}

module.exports.getScriptObfuscations = async function (page) {
  const aggregateScriptData = (scriptObfuscations) => {
    const result = scriptObfuscations.reduce(
      (acc, { scriptLength, obfuscatedVariableNames }) => {
        // Sum of all script lengths
        acc.totalScriptLength += scriptLength;
        // Count of true and false values for obfuscatedVariableNames
        if (obfuscatedVariableNames) {
          acc.obfuscatedCount.true += 1;
        } else {
          acc.obfuscatedCount.false += 1;
        }
        return acc;
      },
      { totalScriptLength: 0, obfuscatedCount: { true: 0, false: 0 } }
    );

    return result;
  };

  const obfuscations = await page.$$eval("script", (scripts) =>
    scripts
      .map((script) => {
        const scriptContent = script.textContent.trim();
        const scriptLength = scriptContent.length;
        const variableNames = scriptContent.match(
          /[a-zA-Z_$][0-9a-zA-Z_$]{0,5}\s*=/g
        );
        return {
          scriptLength,
          obfuscatedVariableNames:
            (variableNames && variableNames.length > 20) ?? false,
        };
      })
      .filter((script) => script.scriptLength > 0)
  );
  return aggregateScriptData(obfuscations);
};

module.exports.getSiteDetails = async function (page) {
  const url = page.url();
  const domain = new URL(url).hostname;
  const secured = url.startsWith("https");
  const subdomains = domain.split(".").length - 2; // Subtract top-level domain and second-level domain
  const title = await page.title();
  // const bodyText = await page.evaluate(() => document.body.textContent);
  return {
    url,
    domain,
    secured,
    subdomains,
    title,
    // bodyText,
  };
};

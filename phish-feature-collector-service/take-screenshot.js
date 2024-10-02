const fs = require("fs");
module.exports.captureScreenshot = async function (page, site) {
  await page.screenshot({
    path: `./public/screenshots/${site.id}-${site.company}.png`,
    fullPage: true,
  });
};

module.exports.getHtmlContent = async function (page) {
  return await page.content();
}

module.exports.captureHtmlContent = async function (page, site) {
  const htmlContent = await module.exports.getHtmlContent(page);
  fs.writeFileSync(
    `./public/htmlcontent/${site.id}-${site.company}.html`,
    htmlContent,
    "utf-8"
  );
};



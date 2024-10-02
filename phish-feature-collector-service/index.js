const playwright = require("playwright");
const fs = require("fs");
const { collectSiteData } = require("./site-data-collector.js");
const { getSitesFromSource } = require("./data-source.js");
// const sites = require("./good.json");
// const sites = require("./bad.json");
// const sites = require("./test.json");

exports.start = async function (
  type,
  baseUrl = "",
  startIndex = 0,
  endIndex = 20,
  version = 1,
) {
  const source = type ?? process.env.DATA_SOURCE ?? "good";
  const sites = await getSitesFromSource(source, startIndex, endIndex);
  const results = await collectSiteData(sites, baseUrl, version);

  const outputFileName = `${source}-output.json`;
  console.log(
    "Scan successful! Features captured in:",
    `${baseUrl}/output/${outputFileName}`
  );
  // // fs.writeFileSync("./public/output.json", JSON.stringify(results, null, 2));
  fs.writeFileSync(
    `./public/output/${outputFileName}`,
    JSON.stringify(results, null, 2)
  );
};

const fs = require("fs");
const { parseHtmlV2 } = require("./htmlFeatures");
const { skipExtraction, skipWords } = require("./common");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function extractFeatures(name, path, n) {
  const results = [];

  const files = fs
    .readdirSync(path)
    .filter((file) => file.endsWith("u.text"))
    .slice(0, n);

  let index = 0;

  for (const file of files) {
    const urlFilePath = `${path}${file}`;

    const pageUrl = fs.readFileSync(urlFilePath, "utf8");
    const htmlFilePath = urlFilePath.replace("u.text", "h.text");
    const htmlFileContent = fs.readFileSync(htmlFilePath, "utf8");

    if (skipWords.some((word) => htmlFileContent.includes(word))) {
      continue;
    }
    const features = parseHtmlV2(file, htmlFileContent, pageUrl);
    if (skipExtraction(features)) {
      continue;
    }

    results.push(features);
    console.log("✔️", ++index, "Extracted features:", file, pageUrl);
  }
  const outputFile = `./public/results/${name}-${Date.now()}-output.json`;
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log("Feature output saved to the file:", outputFile);
}

async function extractFeaturesFromFile(file) {
  const pageUrl = `https://${file}`;
  const htmlFileContent = fs.readFileSync(
    `./dataset/test/${file}.html`,
    "utf8"
  );
  const features = await parseHtmlV2(file, htmlFileContent, pageUrl);
  const outputFile = `./dataset/test/${file}-${Date.now()}-output.json`;
  fs.writeFileSync(outputFile, JSON.stringify(features, null, 2));
}

extractFeaturesFromFile("pub-34c52a5245f74c7fbebf1651caaf9277.r2.dev");
// extractFeatures("phishing", "./dataset/phishing/", 10000);

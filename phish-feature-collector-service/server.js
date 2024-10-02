const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const { v4: uuidv4 } = require("uuid");
const { collectSiteData, getHtmlFromUrl } = require("./site-data-collector.js");
const { start } = require("./index.js");
const { default: axios } = require("axios");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.static(path.join(__dirname, "public")));

app.use(bodyParser.json());

// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.get("/sitedata", async (req, res) => {
  const sourceurl = req.headers.sourceurl;
  const version = req.headers.version ?? 1;
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  const response = await collectSiteData(
    [
      {
        id: req.headers.reqid ?? uuidv4(),
        company: req.headers.company ?? "Unknown",
        url: sourceurl,
      },
    ],
    baseUrl,
    version
  );
  return res.json({ response });
});

app.post("/start-scan", async (req, res) => {
  const type = req.body.type;
  const version = req.body.version ?? 1;
  if (!req.body.type) {
    return res
      .status(400)
      .json({ message: "Missing type value - 'good' | 'phish'" });
  }
  const protocol = req.protocol;
  const host = req.get("host");
  const baseUrl = `${protocol}://${host}`;
  await start(type, baseUrl, req.body.startIndex, req.body.endIndex, version);
  return res.json({ message: "Scan completed successfully!" });
});

app.get("/gethtml", async (req, res) => {
  const sourceurl = req.headers.sourceurl;
  if (!sourceurl) {
    return res.status(400).json({ error: "sourceurl header is required" });
  }
  try {
    const htmlContent = await getHtmlFromUrl(sourceurl);
    return res.json({ htmlResponse: htmlContent });
  } catch (error) {
    return res.json({ error: error.message });
  }
});

app.get("/getfile", async (req, res) => {
  const sourceurl = req.headers.sourceurl;
  if (!sourceurl) {
    return res.status(400).json({ error: "sourceurl header is required" });
  }
  try {
    const response = await axios.get(sourceurl);
    res.json({ status: response.status, fileResponse: response.data });
  } catch (error) {
    res.json({ error: error.toString() });
  }
});

app.get("/", (req, res) => {
  return res.json({ message: "Hello World" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// start(); // Uncomment this line to proactively start the scan

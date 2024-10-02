const { parse, tldExists } = require("tldjs");

const urls = [
//   "http://sites.google.com",
//   "https://www.news.com.au",
//   "https://sbi.co.in",
//   "https://ecil.co.in",
//   "https://www.ecil.co.in",
//   "https://int1-app-pmo-ext.dev.aws.pms.norton.com/api/efs/vendorAccounts",
  "http://my.etrak.co/2SZ",
];

urls.forEach((url) => {
  const response = parse(url);
  console.log(response);
});

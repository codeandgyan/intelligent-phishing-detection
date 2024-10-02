const fs = require("fs");
const goodUrls1 = require("./good-urls1.json");
const goodUrls2 = require("./good-urls2.json");

(async () => {
  const mergedUrls = [...goodUrls1, ...goodUrls2];
  fs.writeFileSync("good.json", JSON.stringify(mergedUrls, null, 2));
})();

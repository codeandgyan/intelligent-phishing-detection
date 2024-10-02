const fs = require("fs");
const good = require("./good.json");

(async () => {
  const dedup = removeDuplicates(good);
  fs.writeFileSync("good.json", JSON.stringify(dedup, null, 2));

  function removeDuplicates(data) {
    const seen = new Set();
    const filtered = data.filter((item) => {
      if (!seen.has(item.company)) {
        seen.add(item.company);
        return true;
      }
      return false;
    });
    return filtered;
  }
})();

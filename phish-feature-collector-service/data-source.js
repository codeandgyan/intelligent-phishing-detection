const bad_sites = require("./phish.json");
const good_sites = require("./good.json");

module.exports.getSitesFromSource = async function (
  input,
  startIndex,
  endIndex
) {
  if (input.toLowerCase() === "good") {
    return good_sites;
  }
  if (input.toLowerCase() === "phish") {
    const sites = bad_sites.slice(
      startIndex ?? process.env.START_INDEX ?? 0,
      endIndex ?? process.env.END_INDEX ?? 20
    );

    return sites.map((site) => {
      return {
        id: `${site.phish_id}`,
        company: site.target ?? "Unknown",
        url: site.url,
      };
    });
  }
  return [];
};

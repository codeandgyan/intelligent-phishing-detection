const skipWords = [
  "phishing",
  "Phishing",
  "PHISHING",
  "Phish",
  "phish",
  "PHISH",
  "Suspended Domain",
  "Loading...",
];


function skipExtraction(features) {
  if (features.metaTagCount === 0 && features.scriptTagCount === 0) {
    return true;
  }
  return false;
}

module.exports = {
  skipWords,
  skipExtraction,
}

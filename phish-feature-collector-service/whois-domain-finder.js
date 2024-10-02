const net = require("net");

// Function to perform a WHOIS query
function queryWhois(domain, callback) {
  const whoisServer = "whois.verisign-grs.com"; // Default WHOIS server for .com domains
  const port = 43;

  const client = new net.Socket();

  client.connect(port, whoisServer, () => {
    console.log(`Connected to WHOIS server ${whoisServer}`);
    client.write(`${domain}\r\n`);
  });

  client.on("data", (data) => {
    // Convert the data buffer to a string and pass it to the callback
    callback(data.toString());
    client.destroy(); // Kill the connection after receiving the data
  });

  client.on("error", (err) => {
    console.error("Error:", err.message);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });
}

// Function to extract domain information
function extractDomainInfo(whoisData) {
  const info = {
    registrar: null,
    organization: null,
    domainAge: null,
  };

  // Split the WHOIS data into lines
  const lines = whoisData.split("\n");

  // Example parsing logic (may need to be adjusted for different registries)
  lines.forEach((line) => {
    if (line.startsWith("Registrar:")) {
      info.registrar = line.split(":")[1].trim();
    } else if (line.startsWith("Organization:")) {
      info.organization = line.split(":")[1].trim();
    } else if (line.startsWith("Creation Date:")) {
      info.domainAge = line.split(":")[1].trim();
    }
  });

  return info;
}

// Example usage
const domain = "google.com"; // Replace with the desired domain

queryWhois(domain, (whoisData) => {
  console.log("WHOIS Data:");
  console.log(whoisData);

  const domainInfo = extractDomainInfo(whoisData);
  console.log("Extracted Domain Info:");
  console.log(domainInfo);
});

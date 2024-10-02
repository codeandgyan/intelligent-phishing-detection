const dns = require("dns");

// Function to get DNS records of a domain
function getDomainInfo(domain) {
  // Resolve A records (IP addresses)
  dns.resolve4(domain, (err, addresses) => {
    if (err) {
      console.error(`Error resolving A records for ${domain}:`, err.message);
      return;
    }
    console.log(`A records for ${domain}:`, addresses);
  });

  // Resolve MX records (Mail exchanges)
  dns.resolveMx(domain, (err, addresses) => {
    if (err) {
      console.error(`Error resolving MX records for ${domain}:`, err.message);
      return;
    }
    console.log(`MX records for ${domain}:`, addresses);
  });

  // Resolve NS records (Name servers)
  dns.resolveNs(domain, (err, addresses) => {
    if (err) {
      console.error(`Error resolving NS records for ${domain}:`, err.message);
      return;
    }
    console.log(`NS records for ${domain}:`, addresses);
  });

  // Resolve TXT records
  dns.resolveTxt(domain, (err, addresses) => {
    if (err) {
      console.error(`Error resolving TXT records for ${domain}:`, err.message);
      return;
    }
    console.log(`TXT records for ${domain}:`, addresses);
  });

  // Resolve CNAME records
  dns.resolveCname(domain, (err, addresses) => {
    if (err) {
      console.error(
        `Error resolving CNAME records for ${domain}:`,
        err.message
      );
      return;
    }
    console.log(`CNAME records for ${domain}:`, addresses);
  });
}

// Example usage
const domain = "google.com"; // Replace with the desired domain
getDomainInfo(domain);

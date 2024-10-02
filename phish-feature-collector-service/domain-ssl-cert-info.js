const https = require('https');
const tls = require('tls');
const url = require('url');

// Function to get SSL certificate info
function getCertificateInfo(websiteUrl) {
    // Parse the URL to extract hostname and port
    const parsedUrl = url.parse(websiteUrl);
    const hostname = parsedUrl.hostname;
    const port = parsedUrl.port || 443; // Default to port 443 for HTTPS

    // Options for the TLS connection
    const options = {
        host: hostname,
        port: port,
        rejectUnauthorized: false // To allow self-signed certificates
    };

    // Create a socket connection to get certificate
    const socket = tls.connect(options, () => {
        const certificate = socket.getPeerCertificate();
        const validFrom = new Date(certificate.valid_from);
        const validTo = new Date(certificate.valid_to);

        // Display certificate information
        console.log('Certificate Information:');
        console.log('Subject:', certificate.subject);
        console.log('Issuer:', certificate.issuer);
        console.log('Valid From:', validFrom);
        console.log('Valid To:', validTo);

        // Close the socket
        socket.end();
    });

    socket.on('error', (err) => {
        console.error('Error:', err.message);
    });
}

// Example usage
const websiteUrl = 'https://syncverificationmailpage.studio.site/'; // Replace with the desired URL
getCertificateInfo(websiteUrl);

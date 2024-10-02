const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

async function getFaviconUrl(websiteUrl) {
    try {
        const response = await axios.get(websiteUrl);
        const html = response.data;
        const $ = cheerio.load(html);

        // Check for link tags with rel="icon" or rel="shortcut icon"
        let faviconUrl = $('link[rel="icon"]').attr('href') ||
                         $('link[rel="shortcut icon"]').attr('href') ||
                         $('link[rel="apple-touch-icon"]').attr('href');

        if (faviconUrl) {
            // If faviconUrl is a relative URL, resolve it to the full URL
            return url.resolve(websiteUrl, faviconUrl);
        }

        // If no favicon link is found, assume it might be at /favicon.ico
        const parsedUrl = new URL(websiteUrl);
        const defaultFaviconUrl = `${parsedUrl.origin}/favicon.ico`;

        // Check if the default favicon exists
        try {
            const faviconResponse = await axios.head(defaultFaviconUrl);
            if (faviconResponse.status === 200) {
                return defaultFaviconUrl;
            }
        } catch (err) {
            // Do nothing; we'll return null below if the default favicon doesn't exist
        }

        // If no favicon is found
        return null;
    } catch (error) {
        console.error(`Error fetching favicon for ${websiteUrl}:`, error.message);
        return null;
    }
}

// Accept URL as an argument from the command line
const websiteUrl = process.argv[2];

if (!websiteUrl) {
    console.error('Please provide a website URL as an argument.');
    process.exit(1);
}

// Example usage
getFaviconUrl(websiteUrl).then(favicon => {
    console.log(favicon); // Full URL of the favicon or null
});

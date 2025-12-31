const axios = require('axios');

const fetchMetadata = async (url) => {
    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)'
            },
            timeout: 5000
        });

        const html = response.data;

        // Extract metadata using regex (simpler than adding cheerio if not present)
        const getMetaTag = (property) => {
            const regex = new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`, 'i');
            const match = html.match(regex);
            if (match) return match[1];

            // Try reversed order of property and content
            const regexAlt = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`, 'i');
            const matchAlt = html.match(regexAlt);
            return matchAlt ? matchAlt[1] : null;
        };

        const title = getMetaTag('og:title') || getMetaTag('twitter:title') || (html.match(/<title>([^<]+)<\/title>/i) || [])[1];
        const description = getMetaTag('og:description') || getMetaTag('twitter:description') || getMetaTag('description');
        const image = getMetaTag('og:image') || getMetaTag('twitter:image');
        const siteName = getMetaTag('og:site_name');

        return {
            title: title || '',
            description: description || '',
            image: image || '',
            siteName: siteName || '',
            url
        };
    } catch (error) {
        console.error('Error fetching metadata:', error.message);
        return null;
    }
};

module.exports = { fetchMetadata };

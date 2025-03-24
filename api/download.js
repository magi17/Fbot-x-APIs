const axios = require("axios");

module.exports = {
    name: "download",
    category: "videos",
    usage: "/download?url=<URL>",
    handler: async (req, res) => {
        const { url } = req.query;

        if (!url) {
            return res.status(400).json({ success: false, error: "Missing 'url' parameter" });
        }

        try {
            const platform = detectPlatform(url);
            if (!platform) {
                throw new Error("Unsupported URL");
            }

            const media = await fetchMedia(url, platform);
            if (!media.title || !media.download_url) {
                throw new Error("No media found for this URL.");
            }

            res.json({ success: true, data: media });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

// Detect platform based on URL
function detectPlatform(url) {
    if (url.includes("instagram.com")) return "instagram";
    if (url.includes("facebook.com")) return "facebook";
    if (url.includes("tiktok.com")) return "tiktok";
    return null;
}

// Fetch media URLs based on platform
async function fetchMedia(url, platform) {
    let apiUrl = "";

    if (platform === "facebook") {
        apiUrl = `https://kaiz-apis.gleeze.com/api/fbdl?url=${encodeURIComponent(url)}`;
    } else if (platform === "instagram") {
        apiUrl = `https://kaiz-apis.gleeze.com/api/insta-dl?url=${encodeURIComponent(url)}`;
    } else if (platform === "tiktok") {
        apiUrl = `https://kaiz-apis.gleeze.com/api/tiktok-dl?url=${encodeURIComponent(url)}`;
    } else {
        throw new Error("Unsupported platform");
    }

    try {
        const response = await axios.get(apiUrl);
        const data = response.data;

        // Facebook: Get only title and videoUrl, and rename videoUrl to download_url
        if (platform === "facebook") {
            return {
                title: data.title,
                download_url: data.videoUrl
            };
        }

        // Other platforms: Standardize response to use download_url
        return {
            title: data.title,
            download_url: data.download_url || data.url
        };
    } catch (error) {
        console.error(`Error fetching ${platform} media:`, error);
        throw new Error(`Failed to fetch ${platform} media.`);
    }
}

const axios = require("axios");

// GitHub Config (Replace with your details)
const GITHUB_USERNAME = "magi17";
const GITHUB_REPO = "Uploader-";
const GITHUB_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_USERNAME}/${GITHUB_REPO}/main/tiktok.json`;

module.exports = {
    name: "shoti",
    category: "media",
    method: "GET",
    usage: "/api/shoti",
    async execute({ req, res }) {
        try {
            // Fetch tiktok.json from GitHub raw URL
            const response = await axios.get(GITHUB_RAW_URL);
            const tiktokUrls = response.data;

            if (!Array.isArray(tiktokUrls) || tiktokUrls.length === 0) {
                return res.status(404).json({ error: "No TikTok URLs found in GitHub. Use /tikadd first." });
            }

            // Select a random TikTok URL
            const randomTikTokUrl = tiktokUrls[Math.floor(Math.random() * tiktokUrls.length)];

            // Fetch video data
            const apiUrl = `https://tikwm.com/api/?url=${encodeURIComponent(randomTikTokUrl)}`;
            const videoResponse = await axios.get(apiUrl);

            if (videoResponse.data.code === 0 && videoResponse.data.data) {
                const { region, title, play } = videoResponse.data.data;
                res.json({ region, title, playUrl: play });
            } else {
                res.status(404).json({ error: "Video not found or invalid response" });
            }
        } catch (error) {
            console.error("Error fetching TikTok data:", error);
            res.status(500).json({ error: "Internal server error", details: error.message });
        }
    }
};

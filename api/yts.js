const axios = require("axios");

module.exports = {
    name: "ytsdl",
    category: "media",
    method: "GET",
    usage: "/api/ytsdl?q=",
    async execute({ req, res }) {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({ success: false, error: "Missing search query" });
        }

        const API_KEY = "AIzaSyDC9dmGLvVptfjhZx6xgmjxqFtkDVlGxH4";
        const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
        const YTDL_API_URL = "https://kaiz-apis.gleeze.com/api/yt-down?url=";

        try {
            // Step 1: Search for the first YouTube video
            const { data } = await axios.get(YT_SEARCH_URL, {
                params: {
                    key: API_KEY,
                    q: query,
                    part: "snippet",
                    maxResults: 1
                }
            });

            if (!data.items.length) {
                return res.status(404).json({ success: false, error: "No results found" });
            }

            const firstResult = data.items[0];
            const videoId = firstResult.id.videoId;
            const videoUrl = `https://youtu.be/${videoId}`;

            // Step 2: Fetch video details & 360p download link
            const { data: ytdlResponse } = await axios.get(YTDL_API_URL + encodeURIComponent(videoUrl));

            if (!ytdlResponse.response || !ytdlResponse.response["360p"]) {
                return res.status(404).json({ success: false, error: "360p quality not available" });
            }

            res.json({
                success: true,
                data: {
                    title: ytdlResponse.response["360p"].title,
                    download_url: ytdlResponse.response["360p"].download_url
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch data", details: error.message });
        }
    }
};

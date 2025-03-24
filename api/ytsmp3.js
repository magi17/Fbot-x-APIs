const axios = require("axios");

module.exports = {
    name: "ytsmp3",
    category: "media",
    method: "GET",
    usage: "/api/ytsmp3?query=your_search_term",
    async execute({ req, res }) {
        const query = req.query.query;
        if (!query) {
            return res.status(400).json({ success: false, error: "Missing 'query' parameter" });
        }

        const API_KEY = "AIzaSyDC9dmGLvVptfjhZx6xgmjxqFtkDVlGxH4";
        const YT_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";
        const YTDL_API_URL = "https://kaiz-apis.gleeze.com/api/ytdown-mp3?url=";

        try {
            // Search for the first YouTube video
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

            // Fetch MP3 download link from YTDL API
            const { data: ytdlResponse } = await axios.get(YTDL_API_URL + encodeURIComponent(videoUrl));

            res.json({
                success: true,
                data: {
                    title: ytdlResponse.title,
                    download_url: ytdlResponse.download_url
                }
            });

        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch data", details: error.message });
        }
    }
};

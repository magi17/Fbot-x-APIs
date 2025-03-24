const axios = require('axios');

module.exports = {
    name: "ytsmp",
    description: "Search YouTube videos and get an MP3 download link",
    usage: "/ytsdlmp?q=",
    handler: async (req, res) => {
        const query = req.query.q;
        if (!query) return res.status(400).json({ error: "Missing search query" });

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

            if (!data.items.length) return res.status(404).json({ error: "No results found" });

            const firstResult = data.items[0];
            const videoId = firstResult.id.videoId;
            const videoUrl = `https://youtu.be/${videoId}`;

            // Fetch MP3 download link from YTDL API
            const { data: ytdlResponse } = await axios.get(YTDL_API_URL + encodeURIComponent(videoUrl));

            res.json({
                title: ytdlResponse.title,
                download_url: ytdlResponse.download_url
            });

        } catch (error) {
            res.status(500).json({ error: "Failed to fetch data", details: error.message });
        }
    }
};

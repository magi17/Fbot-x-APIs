const gtts = require("gtts");

module.exports = {
    name: "tts",
    category: "audio",
    method: "GET",
    usage: "/api/tts?text=hi",
    async execute({ req, res }) {
        const text = req.query.text;
        const lang = req.query.lang || "en"; // Default to English

        if (!text) {
            return res.status(400).json({ success: false, error: "Text parameter is required." });
        }

        try {
            const speech = new gtts(text, lang);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Disposition", "inline");
            speech.stream().pipe(res);
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Error generating speech.",
                details: error.message
            });
        }
    }
};

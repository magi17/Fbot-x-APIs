const gtts = require("gtts");

module.exports = {
    name: "tts",
    description: "Convert text to speech",
    usage: "/tts?text=hi",
    handler: async (req, res) => {
        const text = req.query.text;
        const lang = req.query.lang || "en"; // Default to English

        if (!text) {
            return res.status(400).json({ success: false, message: "Text parameter is required." });
        }

        try {
            const speech = new gtts(text, lang);
            res.setHeader("Content-Type", "audio/mpeg");
            res.setHeader("Content-Disposition", "inline");
            speech.stream().pipe(res);
        } catch (error) {
            res.status(500).json({ success: false, message: "Error generating speech." });
        }
    },
};

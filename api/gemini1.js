const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKeys = [
    "AIzaSyC5n8Fr6Xq722k0jkrRM0emqSQk_4s_C-o",
    "AIzaSyD5CCNspQlYuqIR2t1BggzEFG0jmTThino"
];

const API_KEY = apiKeys[Math.floor(Math.random() * apiKeys.length)];

if (!API_KEY) {
    console.error("API_KEY is not set.");
    process.exit(1);
}

module.exports = {
    name: "gemini",
    category: "ai",
    usage: "/gemini?ask=&imagurl=",
    handler: async (req, res) => {
        const { ask, imagurl } = req.query;

        if (!ask) {
            return res.status(400).json({ error: 'The ask parameter is required.' });
        }

        try {
            const genAI = new GoogleGenerativeAI(API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

            let result;

            if (imagurl) {
                // Fetch the image if imagurl is provided
                const imageResponse = await axios.get(imagurl, {
                    responseType: 'arraybuffer',
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
                        'Accept': 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
                        'Referer': 'https://facebook.com'
                    }
                });

                const image = {
                    inlineData: {
                        data: Buffer.from(imageResponse.data).toString("base64"),
                        mimeType: "image/jpeg",
                    },
                };

                result = await model.generateContent([ask, image]);
            } else {
                // Use only text input if imagurl is not provided
                result = await model.generateContent(ask);
            }

            res.json({
                description: result.response.text(),
            });
        } catch (error) {
            console.error("Error:", error.message);
            res.status(500).json({
                error: 'An error occurred while processing the request.',
                details: error.message,
            });
        }
    }
};

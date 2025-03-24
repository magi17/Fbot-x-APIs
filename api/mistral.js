const { Mistral } = require("@mistralai/mistralai");

module.exports = {
    name: "mistral",
    category: "ai",
    method: "GET",
    usage: "/api/mistral?message=<text>",
    async execute({ req, res }) {
        const { message } = req.query;
        if (!message) {
            return res.status(400).json({ success: false, error: "Message is required." });
        }

        const client = new Mistral({ apiKey: "cixQtTuj5ql7j0mf25m79mk75n6jdPoU" });

        try {
            const response = await client.chat.complete({
                model: "mistral-large-latest",
                messages: [{ role: "user", content: message }]
            });

            res.json({
                success: true,
                response: response.choices[0].message.content
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: "Error processing request",
                details: error.message
            });
        }
    }
};

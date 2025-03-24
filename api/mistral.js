const { Mistral } = require('@mistralai/mistralai');

module.exports = {
    name: "mistral",
    category: "ai",
    usage: "/mistral?message=<text>",
    handler: async (req, res) => {
        const { message } = req.query;
        if (!message) {
            return res.status(400).json({ error: 'Message is required.' });
        }

        const client = new Mistral({ apiKey: 'cixQtTuj5ql7j0mf25m79mk75n6jdPoU' });

        try {
            const response = await client.chat.complete({
                model: 'mistral-large-latest',
                messages: [{ role: 'user', content: message }]
            });

            res.json({ response: response.choices[0].message.content });
        } catch (error) {
            res.status(500).json({ error: 'Error processing request', details: error.message });
        }
    }
};

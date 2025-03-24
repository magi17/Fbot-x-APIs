module.exports = {
    name: "message",
    async execute({ api, event }) {
        const message = event.body.toLowerCase().trim();
        if (message === "hi" || message === "hello") {
            api.sendMessage(
                "👋 Hi there! Here's how to use this bot:\n\n" +
                "🔹 Type commands directly (e.g., `help`, `menu`).\n" +
                "🔹 Use specific commands like `/weather`, `/news`.\n" +
                "🔹 Mention me for assistance.\n\n" +
                "✨ Try typing `/help` to see all available commands!",
                event.threadID
            );
        }
    }
};

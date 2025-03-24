module.exports = {
    name: "ping",
    usePrefix: false,
    usage: "ping",
    version: "1.1",
    execute: async ({ api, event }) => {
        api.sendMessage("Pong!", event.threadID, event.messageID);
    }
};

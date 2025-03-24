module.exports = {
    name: "event",
    async execute({ api, event }) {
        if (event.logMessageType === "log:subscribe") {
            const newUser = event.logMessageData.addedParticipants[0].fullName;
            const threadID = event.threadID;
            api.sendMessage(`👋 Welcome, ${newUser}! Glad to have you here.`, threadID);
        }
    }
};

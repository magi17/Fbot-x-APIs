const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const login = require('ws3-fca');
const scheduleTasks = require('./custom'); // Custom scheduled tasks

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// ✅ Load JSON Config
const loadConfig = (filePath) => {
    try {
        if (!fs.existsSync(filePath)) {
            console.error(`❌ Missing ${filePath}! Make sure it exists.`);
            process.exit(1);
        }
        return JSON.parse(fs.readFileSync(filePath));
    } catch (error) {
        console.error(`❌ Error loading ${filePath}:`, error);
        process.exit(1);
    }
};

const config = loadConfig("./config.json");
const botPrefix = config.prefix || "/";

// ✅ Storage for Events & Commands
global.events = new Map();
global.commands = new Map();

// ✅ Load Events
const loadEvents = () => {
    try {
        const eventFiles = fs.readdirSync('./events').filter(file => file.endsWith('.js'));
        for (const file of eventFiles) {
            const event = require(`./events/${file}`);
            if (event.name && event.execute) {
                global.events.set(event.name, event);
                console.log(`✅ Loaded event: ${event.name}`);
            }
        }
    } catch (error) {
        console.error("❌ Error loading events:", error);
    }
};

// ✅ Load Commands
const loadCommands = () => {
    try {
        const commandFiles = fs.readdirSync('./cmds').filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const command = require(`./cmds/${file}`);
            if (command.name && command.execute) {
                global.commands.set(command.name, command);
                console.log(`✅ Loaded command: ${command.name}`);
            }
        }
    } catch (error) {
        console.error("❌ Error loading commands:", error);
    }
};

// ✅ API Section (New Structure)
const apiPath = path.join(__dirname, 'api');
const apiRoutes = [];

fs.readdirSync(apiPath).forEach(file => {
    if (file.endsWith('.js')) {
        try {
            const apiModule = require(`./api/${file}`);
            if (!apiModule.name || !apiModule.execute) {
                throw new Error(`Missing required properties in ${file}`);
            }

            const route = apiModule.route || `/api/${apiModule.name}`;
            const method = apiModule.method?.toLowerCase() || 'get';

            app[method](route, async (req, res) => {
                try {
                    await apiModule.execute({ req, res });
                } catch (error) {
                    console.error(`❌ Error in API '${apiModule.name}':`, error);
                    res.status(500).json({ error: "Internal Server Error" });
                }
            });

            apiRoutes.push({
                name: apiModule.name,
                category: apiModule.category || "uncategorized",
                route: route,
                method: method.toUpperCase(),
                usage: apiModule.usage || "No usage information provided."
            });

            console.log(`✅ Loaded API: ${apiModule.name} (Route: ${route}, Method: ${method.toUpperCase()})`);
        } catch (error) {
            console.error(`❌ Error loading API ${file}: ${error.message}`);
        }
    }
});

// ✅ API to List All Commands
app.get('/api/list', (req, res) => {
    res.json(apiRoutes);
});

// ✅ Load Facebook App State
const appState = loadConfig("./appState.json");

// ✅ Start FCA Bot
const startBot = async () => {
    try {
        login({ appState }, (err, api) => {
            if (err) {
                console.error("❌ Login failed:", err);
                setTimeout(startBot, 5000);
                return;
            }

            console.clear();
            api.setOptions(config.option);
            console.log("🤖 Bot is now online!");

            // Notify the owner
            const ownerID = config.ownerID || "100030880666720"; // Owner ID from config
            api.sendMessage("🤖 Bot has started successfully!", ownerID);

            // Execute Startup Events
            global.events.forEach((eventHandler) => {
                if (eventHandler.onStart) eventHandler.onStart(api);
            });

            // ✅ Listen to Messages & Events
            api.listenMqtt(async (err, event) => {
                if (err) {
                    console.error("❌ Error listening to events:", err);
                    return;
                }

                // ✅ Handle Event Listeners
                if (global.events.has(event.type)) {
                    try {
                        await global.events.get(event.type).execute({ api, event });
                    } catch (error) {
                        console.error(`❌ Error in event '${event.type}':`, error);
                    }
                }

                // ✅ Handle Commands
                if (event.body) {
                    let args = event.body.trim().split(/ +/);
                    let commandName = args.shift().toLowerCase();

                    let command;
                    if (global.commands.has(commandName)) {
                        command = global.commands.get(commandName);
                    } else if (event.body.startsWith(botPrefix)) {
                        commandName = event.body.slice(botPrefix.length).split(/ +/).shift().toLowerCase();
                        command = global.commands.get(commandName);
                    }

                    if (command) {
                        if (command.usePrefix && !event.body.startsWith(botPrefix)) return;
                        try {
                            await command.execute({ api, event, args });
                        } catch (error) {
                            console.error(`❌ Error executing command '${commandName}':`, error);
                        }
                    }
                }
            });

            // ✅ Auto-Restart & Auto-Greet
            scheduleTasks(ownerID, api, { autoRestart: true, autoGreet: true });
        });
    } catch (error) {
        console.error("❌ Bot crashed. Restarting in 5 seconds...", error);
        setTimeout(startBot, 5000);
    }
};

// ✅ Load Everything & Start
loadEvents();
loadCommands();
startBot();

// ✅ Start API Server
app.listen(PORT, () => {
    console.log(`🌐 API & Web Server running at http://localhost:${PORT}`);
});

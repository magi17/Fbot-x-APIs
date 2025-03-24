const { exec } = require("child_process");

console.log("📦 Installing required npm packages...");

const packages = [
    "express", "cors", "ws3-fca", "fs", "path", "axios",
    "npmlog", "@google/generative-ai", "gtts", "@mistralai/mistralai"
];

exec(`npm install ${packages.join(" ")} && node index.js`, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Installation failed: ${error.message}`);
        return;
    }
    if (stderr) {
        console.error(`⚠️ Warnings: ${stderr}`);
    }
    console.log(`✅ Installation complete:\n${stdout}`);
});

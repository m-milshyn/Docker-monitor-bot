const Docker = require('dockerode');
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
const docker = new Docker();

let checkInterval = parseInt(process.env.CHECK_INTERVAL) || 60000; // Default to 1 minute if not set
const maxInterval = 15 * 60 * 1000; // 15 minutes in milliseconds

async function checkContainers() {
    let hasError = false;

    try {

        const containers = await docker.listContainers({ all: true });

        containers.forEach(container => {
            const containerName = container.Names[0].replace(/^\//, '');
            const containerStatus = container.State.toLowerCase();

            console.log(`Container ${containerName} has status: ${containerStatus}`);

            if (containerStatus === 'exited' || containerStatus === 'dead') {
                hasError = true;
                console.log(`Sending alert for container ${containerName}`);
                bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ Container ${containerName} (${container.Id}) has stopped or has an error. Status: ${containerStatus}`);
            }
        });

        // If there's an error, set interval to 15 minutes, otherwise reset it to the default
        if (hasError) {
            checkInterval = maxInterval;
            console.log("Error detected. Increasing check interval to 15 minutes.");
            bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `⚠️ Error detected. Increasing check interval to 15 minutes.⚠️`);
        } else {
            checkInterval = parseInt(process.env.CHECK_INTERVAL) || 60000; // Reset to default or configured value
            console.log("No errors detected. Resetting check interval.");
        }
    } catch (error) {
        console.error('Error checking containers:', error);
        bot.sendMessage(process.env.TELEGRAM_CHAT_ID, `❗️ An error occurred while checking containers: ${error.message}`);
    }
}

setInterval(checkContainers, checkInterval);
checkContainers();

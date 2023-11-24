const { Client, Intents } = require('discord.js');
const axios = require('axios');
const Trello = require('node-trello');
require('dotenv').config(); // Load environment variables from .env file

// Discord bot token
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Trello API keys
const TRELLO_API_KEY = process.env.TRELLO_API_KEY;
const TRELLO_API_TOKEN = process.env.TRELLO_API_TOKEN;
const TRELLO_BOARD_ID = process.env.TRELLO_BOARD_ID;
const TRELLO_LIST_NAME = 'Ban List';

// Create a new Discord client
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// Create a new Trello instance
const trello = new Trello(TRELLO_API_KEY, TRELLO_API_TOKEN);

// Event: when the bot is   
client.once('ready', () => {
  console.log(`Bot is online and ready. Account logged in as ${client.user.tag}`);
});

// Event: when a slash command is received
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  // Command: /trelloban
  if (commandName === 'trelloban') {
    const username = options.getString('username');

    try {
      // Get Roblox user ID
      const userId = await getRobloxUserId(username);

      // Format for Trello card
      const cardName = `${username}:${userId}`;

      // Add card to Trello list
      trello.post(`/1/cards`, { name: cardName, idList: await getTrelloListId() }, (err, data) => {
        if (err) {
          console.error(err);
          interaction.reply('There was ar error with adding the player to the ban list. Please contact Development if this error occurs. Reference code: UNL47');
        } else {
          interaction.reply(`User ${username} (${userId}) has been banned succesfully, and added to the trello ban list. You may need to log the reason in trello.`);
        }
      });
    } catch (error) {
      console.error(error);
      interaction.reply(`Unable to find Roblox user ID for ${username}.`);
    }
  }
});

// Helper function: Get the ID of the Trello list
async function getTrelloListId() {
  return new Promise((resolve, reject) => {
    trello.get(`/1/boards/${TRELLO_BOARD_ID}/lists`, (err, data) => {
      if (err) {
        reject(err);
      } else {
        const banList = data.find((list) => list.name === TRELLO_LIST_NAME);
        resolve(banList.id);
      }
    });
  });
}

// Helper function: Get Roblox user ID from username
async function getRobloxUserId(username) {
  const response = await axios.get(`https://api.roblox.com/users/get-by-username?username=${encodeURIComponent(username)}`);
  return response.data.Id;
}

// Log in to Discord
client.login(DISCORD_TOKEN);

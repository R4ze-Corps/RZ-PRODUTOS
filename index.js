require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mainHandler = require("./src/handlers/mainHandler");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Carrega todos os comandos e eventos
mainHandler(client);

client.login(process.env.DISCORD_TOKEN);

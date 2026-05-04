const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Responde com Pong! Comando inicial do bot de produtos.'),
    async execute(interaction) {
        await interaction.reply('Pong! O bot de produtos está limpo e operante.');
    },
};

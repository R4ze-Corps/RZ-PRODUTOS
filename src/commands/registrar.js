const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "registrar",
  data: new SlashCommandBuilder()
    .setName("registrar")
    .setDescription("Envia o painel de registro."),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("📝 REGISTRO - TURQUIA")
      .setDescription("Clique no botão abaixo para iniciar seu registro na organização.")
      .setImage("https://media.discordapp.net/attachments/1118674962191728721/1118674962191728721/image.png") // Placeholder image
      .setFooter({ text: "Siga as instruções corretamente." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("iniciar_registro")
        .setLabel("Iniciar Registro")
        .setEmoji("📝")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

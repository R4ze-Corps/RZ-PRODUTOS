const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "suporte",
  data: new SlashCommandBuilder()
    .setName("suporte")
    .setDescription("Envia o painel de suporte.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("🎫 CENTRAL DE SUPORTE - TURQUIA")
      .setDescription("Clique no botão abaixo para abrir um ticket de atendimento.")
      .setImage("https://media.discordapp.net/attachments/1118674962191728721/1118674962191728721/image.png")
      .setFooter({ text: "Raze Corp.  •  Turquia" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_abrir_suporte")
        .setLabel("Abrir Suporte")
        .setEmoji("🎫")
        .setStyle(ButtonStyle.Primary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

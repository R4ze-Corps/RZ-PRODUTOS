const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "painel_ausencia",
  data: new SlashCommandBuilder()
    .setName("painel_ausencia")
    .setDescription("Envia o painel de registro de ausência.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("📅 REGISTRO DE AUSÊNCIA")
      .setDescription("Clique no botão abaixo para solicitar sua ausência.")
      .setFooter({ text: "Siga as instruções corretamente." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_pedir_ausencia")
        .setLabel("Solicitar Ausência")
        .setEmoji("📅")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

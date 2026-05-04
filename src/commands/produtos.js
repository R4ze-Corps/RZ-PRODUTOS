const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const { COR_PADRAO } = require("../config/constants");

module.exports = {
  name: "produtos",
  data: new SlashCommandBuilder()
    .setName("produtos")
    .setDescription("Abre o painel de gerenciamento de roupas.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PADRAO)
      .setTitle("📦 Painel de Controle de Roupas")
      .setDescription("Clique no botão abaixo para cadastrar uma nova peça de roupa no catálogo.")
      .setFooter({ text: "Apenas administradores podem ver este painel." });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_add_produto")
        .setLabel("➕ Adicionar Nova Roupa")
        .setStyle(ButtonStyle.Success),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

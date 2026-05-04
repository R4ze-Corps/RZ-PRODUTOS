const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "produtos",
  data: new SlashCommandBuilder()
    .setName("produtos")
    .setDescription("Abre o painel de gerenciamento de roupas.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    // Conteúdo textual simples (sem embed)
    const contentPanel = "Gerenciamento de Produtos\n\nUm ótimo sistema para gerenciar seu catálogo de roupas. Utilize o painel abaixo para cadastrar novos itens diretamente no canal de vitrine.\n\nLembrando que apenas administradores têm acesso a esta função.";

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_add_produto")
      .setLabel("Adicionar Nova Roupa")
      .setEmoji("➕")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("btn_fechar_painel")
      .setLabel("Fechar Painel")
      .setEmoji("❌")
      .setStyle(ButtonStyle.Secondary)
  );

    await interaction.reply({ content: contentPanel, components: [row] });
  },
};

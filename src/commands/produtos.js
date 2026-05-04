const {
  SlashCommandBuilder,
  EmbedBuilder,
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
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setAuthor({ 
        name: "Gerenciamento de Produtos", 
        iconURL: interaction.guild.iconURL() 
      })
      .setDescription(
        "Um ótimo sistema para gerenciar seu catálogo de roupas. Utilize o painel abaixo para cadastrar novos itens diretamente no canal de vitrine.\n\n" +
        "Lembrando que apenas administradores têm acesso a esta função."
      )
      .setFooter({ text: "Raze Corp • Sistema de Catálogo", iconURL: interaction.client.user.displayAvatarURL() });

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
      .setStyle(ButtonStyle.Secondary),
  );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

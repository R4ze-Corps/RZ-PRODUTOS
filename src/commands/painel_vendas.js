const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
} = require("discord.js");
const { COR_PRETO } = require("../config/constants");
const catalogoVendas = require("../config/catalogoVendas");

module.exports = {
  name: "painel_vendas",
  data: new SlashCommandBuilder()
    .setName("painel_vendas")
    .setDescription("Envia o painel de vendas.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("🛒 PAINEL DE VENDAS - TURQUIA")
      .setDescription(
        "Clique no botão abaixo para abrir o seu carrinho de compras e adicionar produtos.",
      )
      .setThumbnail(
        "https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/logo-png(1).png",
      )
      .setImage(
        "https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/Gemini_Generated_Image_nenl89nenl89nenl.png",
      )
      .setFooter({ text: "Raze Corp.  •  Turquia" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_venda_parceria")
        .setLabel("🛒 Venda Parceria")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("btn_venda_pista")
        .setLabel("🛒 Venda Pista")
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

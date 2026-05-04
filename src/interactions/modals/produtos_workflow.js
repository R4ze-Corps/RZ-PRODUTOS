const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { COR_PRETO } = require("../../config/constants");

module.exports = {
  customId: "modal_add_produto",
  async execute(interaction) {
    const nome = interaction.fields.getTextInputValue("prod_nome");
    const preco = interaction.fields.getTextInputValue("prod_preco");
    const tamanhos = interaction.fields.getTextInputValue("prod_tamanhos");
    const descricao = interaction.fields.getTextInputValue("prod_descricao");
    const imagem = interaction.fields.getTextInputValue("prod_imagem");

    const embedPreview = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle(nome)
      .setDescription(descricao)
      .addFields(
        { name: "💰 Preço", value: preco, inline: true },
        { name: "📏 Tamanhos", value: tamanhos, inline: true }
      )
      .setImage(imagem)
      .setFooter({ text: "Prévia do Produto" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_confirmar_postagem")
        .setLabel("Confirmar Postagem")
        .setEmoji("✅")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("btn_cancelar_postagem")
        .setLabel("Cancelar")
        .setEmoji("❌")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({
      content: "**PRÉVIA DO PRODUTO:**",
      embeds: [embedPreview],
      components: [row],
      ephemeral: true
    });
  }
};

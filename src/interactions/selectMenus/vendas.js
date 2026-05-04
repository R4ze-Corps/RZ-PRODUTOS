const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");
const { sessoesVenda } = require("../../database/memoryDb");

module.exports = {
  customId: "menu_vendas_produtos",
  async execute(interaction) {
    const prodId = interaction.values[0];
    const sessao = sessoesVenda.get(interaction.user.id);
    if (!sessao) return interaction.reply({ content: "Sessão não encontrada.", ephemeral: true });
    sessao.itens.push({ key: prodId, quantidade: 0 });
    const modal = new ModalBuilder().setCustomId("modal_venda_qtd").setTitle("Quantidade do Produto");
    const input = new TextInputBuilder().setCustomId("venda_qtd").setLabel("Quantidade").setStyle(TextInputStyle.Short).setRequired(true);
    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }
};

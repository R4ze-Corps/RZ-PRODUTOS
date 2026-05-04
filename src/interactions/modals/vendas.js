const { sessoesVenda } = require("../../database/memoryDb");
const { montarEmbedCarrinhoVenda, montarComponentesVenda } = require("../../utils/vendasHelpers");

module.exports = {
  customId: "modal_venda_qtd",
  async execute(interaction) {
    const qtd = parseInt(interaction.fields.getTextInputValue("venda_qtd"));
    if (isNaN(qtd) || qtd <= 0) return interaction.reply({ content: "Quantidade inválida.", ephemeral: true });
    const sessao = sessoesVenda.get(interaction.user.id);
    if (!sessao) return interaction.reply({ content: "Sessão não encontrada.", ephemeral: true });
    const itemAtual = sessao.itens[sessao.itens.length - 1];
    itemAtual.quantidade = qtd;
    const embed = montarEmbedCarrinhoVenda(interaction.user.id, sessao);
    const componentes = montarComponentesVenda(sessao);
    await interaction.update({ embeds: [embed], components: componentes });
  }
};

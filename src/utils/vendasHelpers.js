const {
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { formatarMoeda } = require("./formatters");
const catalogoVendas = require("../config/catalogoVendas");

function calcularTotaisVenda(sessao) {
  const itens = sessao.itens.map((item) => {
    const produto = catalogoVendas[item.key];
    const unitario = produto[sessao.tipo];
    const subtotal = unitario * item.quantidade;
    return { ...item, nome: produto.nome, unitario, subtotal };
  });

  const total = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const deposito = Math.floor(total * 0.3);
  return { itens, total, deposito };
}

function montarEmbedCarrinhoVenda(userId, sessao) {
  const { itens, total, deposito } = calcularTotaisVenda(sessao);
  const lista = itens.length
    ? itens
        .map(
          (item) =>
            `• **${item.nome}** - ${item.quantidade}x (${formatarMoeda(item.unitario)}) = **${formatarMoeda(item.subtotal)}**`,
        )
        .join("\n")
    : "*Nenhum item adicionado ainda.*";

  return new EmbedBuilder()
    .setColor("#FF0000")
    .setTitle("🛒 Carrinho de Vendas")
    .setDescription(
      `**Registrador:** <@${userId}>\n**Categoria:** ${sessao.tipo === "pista" ? "Venda Pista" : "Venda Parceria"}\n\n${lista}`,
    )
    .addFields(
      { name: "Valor Total", value: formatarMoeda(total), inline: true },
      {
        name: "30% para organização",
        value: formatarMoeda(deposito),
        inline: true,
      },
    )
    .setThumbnail(
      "https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/logo-png(1).png",
    )
    .setTimestamp();
}

function montarComponentesVenda(sessao) {
  const opcoesProdutos = Object.entries(catalogoVendas).map(
    ([key, produto]) => ({
      label: produto.nome,
      description: `${sessao.tipo === "pista" ? "Pista" : "Parceria"}: ${formatarMoeda(produto[sessao.tipo])}`,
      value: key,
    }),
  );

  const menuProdutos = new StringSelectMenuBuilder()
    .setCustomId("menu_vendas_produtos")
    .setPlaceholder("Selecione um produto para adicionar")
    .addOptions(opcoesProdutos);

  const rowMenu = new ActionRowBuilder().addComponents(menuProdutos);
  const rowAcoes = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("btn_finalizar_venda")
      .setLabel("✅ Finalizar Venda")
      .setStyle(ButtonStyle.Success),
    new ButtonBuilder()
      .setCustomId("btn_limpar_carrinho")
      .setLabel("❌ Limpar Carrinho")
      .setStyle(ButtonStyle.Danger),
  );

  return [rowMenu, rowAcoes];
}

module.exports = {
  calcularTotaisVenda,
  montarEmbedCarrinhoVenda,
  montarComponentesVenda,
};

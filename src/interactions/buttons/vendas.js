const { montarEmbedCarrinhoVenda, montarComponentesVenda, calcularTotaisVenda } = require("../../utils/vendasHelpers");
const { sessoesVenda } = require("../../database/memoryDb");
const { CANAL_LOG_VENDAS_ID, COR_PADRAO } = require("../../config/constants");
const { EmbedBuilder } = require("discord.js");
const { formatarMoeda } = require("../../utils/formatters");

module.exports = [
  {
    customId: "btn_venda",
    async execute(interaction) {
      const tipo = interaction.customId === "btn_venda_parceria" ? "parceria" : "pista";
      sessoesVenda.set(interaction.user.id, { tipo, itens: [] });
      const sessao = sessoesVenda.get(interaction.user.id);
      const embed = montarEmbedCarrinhoVenda(interaction.user.id, sessao);
      const componentes = montarComponentesVenda(sessao);
      await interaction.reply({ embeds: [embed], components: componentes, ephemeral: true });
    }
  },
  {
    customId: "btn_limpar_carrinho",
    async execute(interaction) {
      sessoesVenda.delete(interaction.user.id);
      await interaction.update({ content: "🛒 Carrinho limpo.", embeds: [], components: [] });
    }
  },
  {
    customId: "btn_finalizar_venda",
    async execute(interaction) {
      const sessao = sessoesVenda.get(interaction.user.id);
      if (!sessao || sessao.itens.length === 0) return interaction.reply({ content: "Seu carrinho está vazio.", ephemeral: true });
      const { itens, total, deposito } = calcularTotaisVenda(sessao);
      const listaProdutos = itens.map((i) => `• ${i.quantidade}x **${i.nome}**`).join("\n");
      const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_VENDAS_ID);
      if (logChannel) {
        const embedLog = new EmbedBuilder().setColor(COR_PADRAO).setTitle("📦 NOVA VENDA")
          .addFields(
            { name: "Vendedor", value: `<@${interaction.user.id}>`, inline: true },
            { name: "Tipo", value: sessao.tipo === "pista" ? "Pista" : "Parceria", inline: true },
            { name: "Produtos", value: listaProdutos || "---" },
            { name: "Total", value: formatarMoeda(total), inline: true },
            { name: "30% Organização", value: formatarMoeda(deposito), inline: true }
          ).setTimestamp();
        await logChannel.send({ embeds: [embedLog] });
      }
      sessoesVenda.delete(interaction.user.id);
      await interaction.update({ content: "✅ Venda finalizada com sucesso!", embeds: [], components: [] });
    }
  }
];

const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CANAL_ROUPAS_ID, COR_PRETO } = require("../../config/constants");

module.exports = [
  {
    customId: "btn_add_produto",
    async execute(interaction) {
      const modal = new ModalBuilder()
        .setCustomId("modal_add_produto")
        .setTitle("Cadastrar Nova Roupa");

      const nome = new TextInputBuilder()
        .setCustomId("prod_nome")
        .setLabel("Nome do Produto")
        .setPlaceholder("Ex: Camiseta Oversized Preta")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const preco = new TextInputBuilder()
        .setCustomId("prod_preco")
        .setLabel("Preço")
        .setPlaceholder("Ex: R$ 89,90")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const tamanhos = new TextInputBuilder()
        .setCustomId("prod_tamanhos")
        .setLabel("Tamanhos Disponíveis")
        .setPlaceholder("Ex: P, M, G, GG")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      const descricao = new TextInputBuilder()
        .setCustomId("prod_descricao")
        .setLabel("Descrição/Detalhes")
        .setPlaceholder("Ex: 100% algodão, estampa em silk")
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

      const imagem = new TextInputBuilder()
        .setCustomId("prod_imagem")
        .setLabel("Link da Imagem (URL)")
        .setPlaceholder("https://linkdaimagem.com/foto.png")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);

      modal.addComponents(
        new ActionRowBuilder().addComponents(nome),
        new ActionRowBuilder().addComponents(preco),
        new ActionRowBuilder().addComponents(tamanhos),
        new ActionRowBuilder().addComponents(descricao),
        new ActionRowBuilder().addComponents(imagem)
      );

      await interaction.showModal(modal);
    }
  },
  {
    customId: "btn_confirmar_postagem",
    async execute(interaction) {
      const embedPreview = interaction.message.embeds[0];
      const canalRoupas = interaction.guild.channels.cache.get(CANAL_ROUPAS_ID);

      if (!canalRoupas) {
        return interaction.reply({ content: "❌ Canal de roupas não encontrado.", ephemeral: true });
      }

      const postEmbed = EmbedBuilder.from(embedPreview)
        .setTitle(`👔 ${embedPreview.title}`)
        .setFooter({ text: "Postado via Painel Administrativo" });
      
      await canalRoupas.send({ embeds: [postEmbed] });

      await interaction.update({
        content: `✅ Produto **${embedPreview.title}** postado com sucesso no canal <#${CANAL_ROUPAS_ID}>!`,
        embeds: [],
        components: []
      });
    }
  },
  {
    customId: "btn_cancelar_postagem",
    async execute(interaction) {
      await interaction.update({
        content: "❌ Postagem cancelada.",
        embeds: [],
        components: []
      });
    }
  }
];

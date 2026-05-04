const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { criarSalaFarm } = require("../../utils/farmHelpers");
const { configFarm, farmEmAndamento, bancoDeFarm } = require("../../database/memoryDb");
const { COR_PADRAO } = require("../../config/constants");

module.exports = [
  {
    customId: "menu_ticket",
    async execute(interaction) {
      if (interaction.values[0] === "abrir_farm") {
        const canal = await criarSalaFarm(interaction.guild, interaction.member, configFarm);
        await interaction.reply({ content: `✅ Sua sala de farm foi criada: ${canal}`, ephemeral: true });
      }
    }
  },
  {
    customId: "menu_produtos_farm",
    async execute(interaction) {
      const itemKey = interaction.values[0];
      farmEmAndamento.set(interaction.channel.id, { itemKey: itemKey, itemNome: configFarm[itemKey].nome, userId: interaction.user.id });
      const modal = new ModalBuilder().setCustomId("modal_qtd_farm").setTitle("Quantidade do Farm");
      const input = new TextInputBuilder().setCustomId("qtd_farm").setLabel("Quantidade").setStyle(TextInputStyle.Short).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }
  },
  {
    customId: "selecionar_jogador_edit_farm",
    async execute(interaction) {
      const userId = interaction.values[0];
      let conta = bancoDeFarm.get(userId) || { plastico: 0, aluminio: 0, polvora: 0, ferro: 0, sd: 0 };
      if (!bancoDeFarm.has(userId)) bancoDeFarm.set(userId, conta);
      const embedStatus = new EmbedBuilder().setTitle(`📊 Farm Atual: <@${userId}>`).setColor(COR_PADRAO)
        .setDescription(`Aqui está o total que o jogador já entregou:\n\n📦 **${configFarm.plastico.nome}:** ${conta.plastico}\n📦 **${configFarm.aluminio.nome}:** ${conta.aluminio}\n📦 **${configFarm.polvora.nome}:** ${conta.polvora}\n📦 **${configFarm.ferro.nome}:** ${conta.ferro}\n📦 **${configFarm.sd.nome}:** ${conta.sd}`);
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId(`abrir_modal_valores_edit_${userId}`).setLabel("✏️ Editar Quantidades").setStyle(ButtonStyle.Primary));
      await interaction.reply({ embeds: [embedStatus], components: [row], ephemeral: true });
    }
  }
];

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { COR_PADRAO } = require("../../config/constants");
const { farmEmAndamento, configFarm, bancoDeFarm } = require("../../database/memoryDb");

module.exports = [
  {
    customId: "modal_qtd_farm",
    async execute(interaction) {
      const qtd = parseInt(interaction.fields.getTextInputValue("qtd_farm"));
      if (isNaN(qtd) || qtd <= 0) return interaction.reply({ content: "Quantidade inválida.", ephemeral: true });
      const farm = farmEmAndamento.get(interaction.channel.id);
      if (farm) farm.qtd = qtd;
      const embed = new EmbedBuilder().setColor(COR_PADRAO).setTitle("🚜 REGISTRO DE FARM").setDescription(`Você está registrando ${qtd}x **${farm?.itemNome || 'Item'}**.`)
        .setFooter({ text: "Clique no botão abaixo para enviar o print e finalizar." });
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("finalizar_farm").setLabel("ENVIAR PRINT (CLIQUE AQUI)").setStyle(ButtonStyle.Primary));
      await interaction.reply({ embeds: [embed], components: [row] });
    }
  },
  {
    customId: "modal_config_farm",
    async execute(interaction) {
      const parseInput = (val, defaultNome) => {
        const parts = val.split("|");
        return { nome: parts[0] ? parts[0].trim() : defaultNome, meta: parts[1] ? parts[1].trim() : "X" };
      };
      configFarm.plastico = parseInput(interaction.fields.getTextInputValue("cfg_plastico"), "Plástico");
      configFarm.aluminio = parseInput(interaction.fields.getTextInputValue("cfg_aluminio"), "Alumínio");
      configFarm.polvora = parseInput(interaction.fields.getTextInputValue("cfg_polvora"), "Pólvora Preta");
      configFarm.ferro = parseInput(interaction.fields.getTextInputValue("cfg_ferro"), "Barra de Ferro");
      configFarm.sd = parseInput(interaction.fields.getTextInputValue("cfg_sd"), "Cartão SD");
      await interaction.reply({ content: "✅ Produtos e metas atualizados com sucesso!", ephemeral: true });
    }
  },
  {
    customId: "edit_farm_vals",
    async execute(interaction) {
      const userId = interaction.customId.replace("edit_farm_vals_", "");
      const p = parseInt(interaction.fields.getTextInputValue("val_plastico"), 10);
      const a = parseInt(interaction.fields.getTextInputValue("val_aluminio"), 10);
      const po = parseInt(interaction.fields.getTextInputValue("val_polvora"), 10);
      const f = parseInt(interaction.fields.getTextInputValue("val_ferro"), 10);
      const s = parseInt(interaction.fields.getTextInputValue("val_sd"), 10);
      if (isNaN(p) || isNaN(a) || isNaN(po) || isNaN(f) || isNaN(s)) return interaction.reply({ content: "❌ Todos os valores devem ser números válidos.", ephemeral: true });
      bancoDeFarm.set(userId, { plastico: p, aluminio: a, polvora: po, ferro: f, sd: s });
      await interaction.reply({ content: `✅ Farm do jogador <@${userId}> atualizado com sucesso!`, ephemeral: true });
    }
  }
];

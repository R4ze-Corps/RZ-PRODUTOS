const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CANAL_AUSENCIA_ID, COR_PRETO } = require("../../config/constants");
const { ausenciasEmAndamento } = require("../../database/memoryDb");

module.exports = {
  customId: "modal_ausencia",
  async execute(interaction) {
    const inicio = interaction.fields.getTextInputValue("inicio_ausencia");
    const fim = interaction.fields.getTextInputValue("fim_ausencia");
    const motivo = interaction.fields.getTextInputValue("motivo_ausencia");
    ausenciasEmAndamento.set(interaction.user.id, { inicio, fim, motivo });
    const avaliacaoChannel = interaction.guild.channels.cache.get(CANAL_AUSENCIA_ID);
    if (avaliacaoChannel) {
      const embed = new EmbedBuilder().setColor(COR_PRETO).setTitle("📋 PEDIDO DE AUSÊNCIA")
        .addFields({ name: "Membro", value: `<@${interaction.user.id}>`, inline: true }, { name: "Início", value: inicio, inline: true }, { name: "Fim", value: fim, inline: true }, { name: "Motivo", value: motivo });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`btn_aprovar_ausencia_${interaction.user.id}`).setLabel("Aprovar").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`btn_negar_ausencia_${interaction.user.id}`).setLabel("Negar").setStyle(ButtonStyle.Danger)
      );
      await avaliacaoChannel.send({ embeds: [embed], components: [row] });
    }
    await interaction.reply({ content: "Seu pedido de ausência foi enviado para análise.", ephemeral: true });
  }
};

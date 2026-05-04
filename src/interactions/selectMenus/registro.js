const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { CANAL_AVALIACAO_ID, COR_PRETO } = require("../../config/constants");
const { sessoesDeRegistro } = require("../../database/memoryDb");

module.exports = {
  customId: "selecionar_recrutador",
  async execute(interaction) {
    const staffId = interaction.values[0];
    const dados = sessoesDeRegistro.get(interaction.user.id);
    if (dados) {
      dados.recrutadorId = staffId;
      sessoesDeRegistro.set(interaction.user.id, dados);
    }
    const canalAvaliacao = interaction.guild.channels.cache.get(CANAL_AVALIACAO_ID);
    if (canalAvaliacao) {
      const embed = new EmbedBuilder().setColor(COR_PRETO).setTitle("📋 NOVA AVALIAÇÃO DE REGISTRO")
        .addFields({ name: "Candidato", value: `<@${interaction.user.id}>`, inline: true }, { name: "ID", value: dados?.id || "---", inline: true }, { name: "Telefone", value: dados?.telefone || "---", inline: true }, { name: "Recrutador", value: `<@${staffId}>` });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId(`aprovar_${interaction.user.id}`).setLabel("Aprovar").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId(`negar_${interaction.user.id}`).setLabel("Negar").setStyle(ButtonStyle.Danger)
      );
      await canalAvaliacao.send({ embeds: [embed], components: [row] });
    }
    await interaction.update({ content: "Seus dados foram enviados para avaliação. Aguarde.", components: [] });
  }
};

const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { CANAL_LOG_AUSENCIA_ID, CARGO_AUSENCIA_ID } = require("../../config/constants");
const { ausenciasEmAndamento } = require("../../database/memoryDb");

module.exports = [
  {
    customId: "btn_pedir_ausencia",
    async execute(interaction) {
      const modal = new ModalBuilder().setCustomId("modal_ausencia").setTitle("Registro de Ausência");
      const inicioInput = new TextInputBuilder().setCustomId("inicio_ausencia").setLabel("Data de Início").setPlaceholder("Ex: 10/05").setStyle(TextInputStyle.Short).setRequired(true);
      const fimInput = new TextInputBuilder().setCustomId("fim_ausencia").setLabel("Data de Término").setPlaceholder("Ex: 15/05").setStyle(TextInputStyle.Short).setRequired(true);
      const motivoInput = new TextInputBuilder().setCustomId("motivo_ausencia").setLabel("Motivo").setStyle(TextInputStyle.Paragraph).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(inicioInput), new ActionRowBuilder().addComponents(fimInput), new ActionRowBuilder().addComponents(motivoInput));
      await interaction.showModal(modal);
    }
  },
  {
    customId: "btn_aprovar_ausencia",
    async execute(interaction) {
      const userId = interaction.customId.split("_")[3];
      const dados = ausenciasEmAndamento.get(userId);
      const member = await interaction.guild.members.fetch(userId).catch(() => null);
      if (member) {
        await member.roles.add(CARGO_AUSENCIA_ID).catch(console.error);
        const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_AUSENCIA_ID);
        if (logChannel) {
          const embedLog = new EmbedBuilder().setColor("#00FF00").setTitle("Ausência Iniciada")
            .addFields(
              { name: "Membro", value: `<@${userId}>`, inline: true },
              { name: "Início", value: dados?.inicio || "---", inline: true },
              { name: "Fim", value: dados?.fim || "---", inline: true },
              { name: "Motivo", value: dados?.motivo || "---" }
            ).setTimestamp();
          await logChannel.send({ embeds: [embedLog] });
        }
      }
      await interaction.update({ content: `✅ Ausência de <@${userId}> aprovada por <@${interaction.user.id}>`, components: [] });
    }
  },
  {
    customId: "btn_negar_ausencia",
    async execute(interaction) {
      const userId = interaction.customId.split("_")[3];
      await interaction.update({ content: `❌ Ausência de <@${userId}> negada por <@${interaction.user.id}>`, components: [] });
      ausenciasEmAndamento.delete(userId);
    }
  }
];

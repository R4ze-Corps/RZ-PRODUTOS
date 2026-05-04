const { EmbedBuilder } = require("discord.js");
const { CANAL_LOG_PUNICAO_ID, COR_PADRAO } = require("../../config/constants");

module.exports = {
  customId: "modal_punicao",
  async execute(interaction) {
    const parts = interaction.customId.split("_");
    const userId = parts[2];
    const cargoId = parts[3];
    const motivo = interaction.fields.getTextInputValue("motivo_punicao");
    const member = await interaction.guild.members.fetch(userId).catch(() => null);
    if (member) {
      await member.roles.add(cargoId).catch(console.error);
      const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_PUNICAO_ID);
      if (logChannel) {
        const embedLog = new EmbedBuilder().setColor(COR_PADRAO).setTitle("⚖️ PUNIÇÃO APLICADA")
          .addFields({ name: "Membro", value: `<@${userId}>`, inline: true }, { name: "Staff", value: `<@${interaction.user.id}>`, inline: true }, { name: "Motivo", value: motivo || "---" }).setTimestamp();
        await logChannel.send({ embeds: [embedLog] });
      }
      await interaction.reply({ content: "Punição aplicada e logada.", ephemeral: true });
    }
  }
};

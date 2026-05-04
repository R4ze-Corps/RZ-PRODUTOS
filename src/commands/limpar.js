const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");

module.exports = {
  name: "limpar",
  data: new SlashCommandBuilder()
    .setName("limpar")
    .setDescription("Limpa as mensagens do canal atual.")
    .addIntegerOption(option =>
      option.setName("quantidade")
        .setDescription("Quantidade de mensagens a serem limpas (máximo 100).")
        .setMinValue(1)
        .setMaxValue(100)
        .setRequired(false)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
  async execute(interaction) {
    const amount = interaction.options.getInteger("quantidade") || 100;

    try {
      const deleted = await interaction.channel.bulkDelete(amount, true);

      const embed = new EmbedBuilder()
        .setColor("#00FF00")
        .setDescription(`✅ Limpeza concluída! **${deleted.size}** mensagens foram removidas.`);

      await interaction.reply({ embeds: [embed], ephemeral: true });
    } catch (error) {
      console.error("Erro ao limpar mensagens:", error);
      await interaction.reply({
        content: "❌ Ocorreu um erro ao tentar limpar as mensagens deste canal. Certifique-se de que as mensagens não têm mais de 14 dias.",
        ephemeral: true,
      });
    }
  },
};

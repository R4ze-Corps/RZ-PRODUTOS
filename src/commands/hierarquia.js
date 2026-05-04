const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { gerarEmbedHierarquia } = require("../utils/hierarquia.js");

module.exports = {
  name: "hierarquia",
  data: new SlashCommandBuilder()
    .setName("hierarquia")
    .setDescription("Gera o embed da hierarquia atualizada."),
  async execute(interaction) {
    const embed = await gerarEmbedHierarquia(interaction.guild);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("atualizar_hierarquia")
        .setLabel("Atualizar Hierarquia")
        .setEmoji("🔄")
        .setStyle(ButtonStyle.Secondary)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

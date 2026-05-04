const { gerarEmbedHierarquia } = require("../../utils/hierarquia");
module.exports = {
  customId: "atualizar_hierarquia",
  async execute(interaction) {
    const embed = await gerarEmbedHierarquia(interaction.guild);
    await interaction.update({ embeds: [embed] });
  }
};

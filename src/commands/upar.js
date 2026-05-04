const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits } = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "upar",
  data: new SlashCommandBuilder()
    .setName("upar")
    .setDescription("Promover ou rebaixar um membro.")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("📈 GESTÃO DE MEMBROS - TURQUIA")
      .setDescription("Selecione uma das opções abaixo para gerenciar a hierarquia de um membro.")
      .setFooter({ text: "Raze Corp.  •  Turquia" });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_promover")
        .setLabel("Promover")
        .setEmoji("📈")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("btn_rebaixar")
        .setLabel("Rebaixar")
        .setEmoji("📉")
        .setStyle(ButtonStyle.Danger)
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

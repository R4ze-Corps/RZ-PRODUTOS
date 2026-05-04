const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { COR_PRETO } = require("../config/constants");

module.exports = {
  name: "ticket",
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Envia o painel de tickets de farm.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("🚜 SISTEMA DE FARM - TURQUIA")
      .setDescription("Selecione uma opção abaixo para iniciar seu atendimento ou farm.")
      .setImage("https://media.discordapp.net/attachments/1118674962191728721/1118674962191728721/image.png")
      .setFooter({ text: "Raze Corp.  •  Turquia" });

    const menu = new StringSelectMenuBuilder()
      .setCustomId("menu_ticket")
      .setPlaceholder("Selecione o tipo de atendimento...")
      .addOptions([
        {
          label: "Iniciar Farm",
          value: "abrir_farm",
          description: "Abra um ticket para registrar seu farm.",
          emoji: "🚜"
        },
        {
          label: "Dúvidas/Suporte Farm",
          value: "suporte_farm",
          description: "Tire suas dúvidas sobre o sistema de farm.",
          emoji: "❓"
        }
      ]);

    const row = new ActionRowBuilder().addComponents(menu);

    await interaction.reply({ embeds: [embed], components: [row] });
  },
};

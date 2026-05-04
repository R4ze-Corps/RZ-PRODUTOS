const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "ausencia",
  data: new SlashCommandBuilder()
    .setName("ausencia")
    .setDescription("Registra um pedido de ausência."),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("modal_ausencia")
      .setTitle("Registro de Ausência");

    const inicioInput = new TextInputBuilder()
      .setCustomId("inicio_ausencia")
      .setLabel("Data de Início")
      .setPlaceholder("Ex: 10/05")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const fimInput = new TextInputBuilder()
      .setCustomId("fim_ausencia")
      .setLabel("Data de Término")
      .setPlaceholder("Ex: 15/05")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const motivoInput = new TextInputBuilder()
      .setCustomId("motivo_ausencia")
      .setLabel("Motivo")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(inicioInput),
      new ActionRowBuilder().addComponents(fimInput),
      new ActionRowBuilder().addComponents(motivoInput)
    );

    await interaction.showModal(modal);
  },
};

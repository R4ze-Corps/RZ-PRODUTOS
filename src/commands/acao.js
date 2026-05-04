const { SlashCommandBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

module.exports = {
  name: "acao",
  data: new SlashCommandBuilder()
    .setName("acao")
    .setDescription("Inicia a criação de uma ação."),
  async execute(interaction) {
    const modal = new ModalBuilder()
      .setCustomId("modal_criar_acao")
      .setTitle("Configurar Nova Ação");

    const nomeInput = new TextInputBuilder()
      .setCustomId("nome_acao")
      .setLabel("Nome da Ação")
      .setPlaceholder("Ex: Banco Central, Joalheria...")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const dataInput = new TextInputBuilder()
      .setCustomId("horario_acao")
      .setLabel("Horário")
      .setPlaceholder("Ex: 20:00")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const vagasInput = new TextInputBuilder()
      .setCustomId("vagas_acao")
      .setLabel("Quantidade de Vagas")
      .setPlaceholder("Ex: 10")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nomeInput),
      new ActionRowBuilder().addComponents(dataInput),
      new ActionRowBuilder().addComponents(vagasInput)
    );

    await interaction.showModal(modal);
  },
};

const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { CARGOS_LIDER_ORGANIZADOR } = require("../config/constants");

module.exports = {
  name: "punicao",
  data: new SlashCommandBuilder()
    .setName("punicao")
    .setDescription("Aplica uma punição a um membro.")
    .addUserOption(option =>
      option.setName("membro")
        .setDescription("O membro a ser punido")
        .setRequired(true))
    .addRoleOption(option =>
      option.setName("cargo")
        .setDescription("O cargo de punição a ser aplicado")
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
  async execute(interaction) {
    // A lógica real de abrir o modal será no interactionHandler
    // Aqui apenas enviamos o gatilho se necessário, ou podemos abrir o modal direto
    // Mas como o usuário quer "Modal motivo", precisamos abrir o modal aqui.

    const membro = interaction.options.getMember("membro");
    const cargo = interaction.options.getRole("cargo");

    // Verificar se quem usa tem permissão (pela lista de cargos)
    const hasPermission = interaction.member.roles.cache.some(r => CARGOS_LIDER_ORGANIZADOR.includes(r.id));
    if (!hasPermission && !interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
        return interaction.reply({ content: "Você não tem permissão para usar este comando.", ephemeral: true });
    }

    const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require("discord.js");

    const modal = new ModalBuilder()
      .setCustomId(`modal_punicao_${membro.id}_${cargo.id}`)
      .setTitle("Motivo da Punição");

    const motivoInput = new TextInputBuilder()
      .setCustomId("motivo_punicao")
      .setLabel("Motivo")
      .setStyle(TextInputStyle.Paragraph)
      .setPlaceholder("Descreva o motivo da punição...")
      .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(motivoInput));

    await interaction.showModal(modal);
  },
};

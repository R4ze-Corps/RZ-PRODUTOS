const { ActionRowBuilder, StringSelectMenuBuilder } = require("discord.js");
const { CARGO_RECRUTADOR_ID } = require("../../config/constants");
const { sessoesDeRegistro } = require("../../database/memoryDb");

module.exports = {
  customId: "modal_registro",
  async execute(interaction) {
    const nome = interaction.fields.getTextInputValue("reg_nome");
    const id = interaction.fields.getTextInputValue("reg_id");
    const telefone = interaction.fields.getTextInputValue("reg_telefone");
    sessoesDeRegistro.set(interaction.user.id, { nome, id, telefone });
    await interaction.guild.members.fetch();
    const recruiters = interaction.guild.members.cache.filter((m) => m.roles.cache.has(CARGO_RECRUTADOR_ID));
    if (recruiters.size === 0) return interaction.reply({ content: "Nenhum recrutador disponível no momento.", ephemeral: true });
    const menu = new StringSelectMenuBuilder().setCustomId("selecionar_recrutador").setPlaceholder("Selecione o recrutador que te avaliou...")
      .addOptions(recruiters.map((r) => ({ label: r.user.tag, value: r.id })).slice(0, 25));
    await interaction.reply({ content: "Selecione seu recrutador:", components: [new ActionRowBuilder().addComponents(menu)], ephemeral: true });
  }
};

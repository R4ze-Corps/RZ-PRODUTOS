const { ActionRowBuilder, UserSelectMenuBuilder } = require("discord.js");
const { sessoesUpar } = require("../../database/memoryDb");

module.exports = [
  {
    customId: "btn_promover",
    async execute(interaction) { await startUpar(interaction, "PROMOÇÃO"); }
  },
  {
    customId: "btn_rebaixar",
    async execute(interaction) { await startUpar(interaction, "REBAIXAMENTO"); }
  }
];

async function startUpar(interaction, tipo) {
  sessoesUpar.set(interaction.user.id, { tipo });
  const userSelect = new UserSelectMenuBuilder().setCustomId("select_user_upar").setPlaceholder("Selecione o membro...");
  await interaction.reply({ content: "Selecione o membro:", components: [new ActionRowBuilder().addComponents(userSelect)], ephemeral: true });
}

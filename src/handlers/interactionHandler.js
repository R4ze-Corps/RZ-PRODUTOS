const buttonHandler = require("./interactions/buttonHandler");
const modalHandler = require("./interactions/modalHandler");
const selectMenuHandler = require("./interactions/selectMenuHandler");

module.exports = async (interaction, client) => {
  try {
    // --- SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
    }

    // --- BUTTONS ---
    if (interaction.isButton()) {
      await buttonHandler(interaction, client);
    }

    // --- MODALS ---
    if (interaction.isModalSubmit()) {
      await modalHandler(interaction, client);
    }

    // --- SELECT MENUS ---
    if (
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu() ||
      interaction.isRoleSelectMenu()
    ) {
      await selectMenuHandler(interaction, client);
    }
  } catch (error) {
    console.error("Erro no Interaction Handler:", error);
    const errorMsg = {
      content: "Ocorreu um erro ao processar sua interação.",
      ephemeral: true,
    };

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMsg).catch(() => {});
    } else {
      await interaction.reply(errorMsg).catch(() => {});
    }
  }
};

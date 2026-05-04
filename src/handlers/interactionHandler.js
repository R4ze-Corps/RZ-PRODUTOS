module.exports = async (interaction, client) => {
  try {
    // --- SLASH COMMANDS ---
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;
      await command.execute(interaction, client);
    }

    // --- COMPONENTES V2 (Buttons, Modals, Select Menus) ---
    let collection;
    if (interaction.isButton()) collection = client.buttons;
    else if (interaction.isModalSubmit()) collection = client.modals;
    else if (
      interaction.isStringSelectMenu() ||
      interaction.isUserSelectMenu() ||
      interaction.isRoleSelectMenu()
    )
      collection = client.selectMenus;

    if (collection) {
      // Busca exata primeiro
      let component = collection.get(interaction.customId);

      // Se não encontrar exato, busca por prefixo (mais longo primeiro)
      if (!component) {
        const key = Array.from(collection.keys())
          .filter(k => interaction.customId.startsWith(k))
          .sort((a, b) => b.length - a.length)[0];
        
        if (key) component = collection.get(key);
      }

      if (component) {
        return await component.execute(interaction, client);
      }
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

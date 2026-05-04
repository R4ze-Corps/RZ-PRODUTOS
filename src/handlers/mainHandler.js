const fs = require("fs");
const path = require("path");

module.exports = (client) => {
  // Handler de Comandos
  client.commands = new Map();
  const commandFiles = fs
    .readdirSync(path.join(__dirname, "../commands"))
    .filter((file) => file.endsWith(".js"));
  for (const file of commandFiles) {
    const command = require(`../commands/${file}`);
    client.commands.set(command.name, command);
  }

  // Handler de Interações V2
  client.buttons = new Map();
  client.modals = new Map();
  client.selectMenus = new Map();

  const loadInteractions = (dir, map) => {
    const fullPath = path.join(__dirname, `../interactions/${dir}`);
    if (!fs.existsSync(fullPath)) return;

    const files = fs
      .readdirSync(fullPath)
      .filter((file) => file.endsWith(".js"));
    for (const file of files) {
      const interaction = require(path.join(fullPath, file));
      if (Array.isArray(interaction)) {
        interaction.forEach((i) => map.set(i.customId, i));
      } else {
        map.set(interaction.customId, interaction);
      }
    }
  };

  loadInteractions("buttons", client.buttons);
  loadInteractions("modals", client.modals);
  loadInteractions("selectMenus", client.selectMenus);

  // Handler de Eventos
  const eventFiles = fs
    .readdirSync(path.join(__dirname, "../events"))
    .filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(`../events/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(event.name, (...args) => event.execute(...args, client));
    }
  }
};

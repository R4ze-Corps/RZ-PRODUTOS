require("dotenv").config();
const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];
const commandsPath = path.join(__dirname, "src", "commands");
const commandFiles = fs
  .readdirSync(commandsPath)
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ("data" in command && "execute" in command) {
    commands.push(command.data.toJSON());
  } else {
    console.log(
      `[AVISO] O comando em ${filePath} está faltando a propriedade "data" ou "execute".`,
    );
  }
}

const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID;
const TOKEN = process.env.DISCORD_TOKEN;

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  try {
    console.log(
      `Iniciando o registro de ${commands.length} comandos de barra (/) no servidor...`,
    );

    const data = await rest.put(
      Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
      { body: commands },
    );

    console.log(
      `Sucesso! ${data.length} comandos de barra (/) foram registrados.`,
    );
  } catch (error) {
    console.error("Ocorreu um erro ao registrar os comandos:", error);
  }
})();

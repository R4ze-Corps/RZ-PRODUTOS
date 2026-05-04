const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    client.commands = new Map();
    const commandFiles = fs.readdirSync(path.join(__dirname, '../commands')).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(../commands/file);
        const commandName = command.data ? command.data.name : command.name;
        if(commandName) {
             client.commands.set(commandName, command);
        }
    }

    const eventFiles = fs.readdirSync(path.join(__dirname, '../events')).filter(file => file.endsWith('.js'));
    for (const file of eventFiles) {
        const event = require(../events/file);
        if (event.once) {
            client.once(event.name, (...args) => event.execute(...args, client));
        } else {
            client.on(event.name, (...args) => event.execute(...args, client));
        }
    }
};

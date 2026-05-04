module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) {
                console.error(Nenhum comando correspondente para  + interaction.commandName +  foi encontrado.);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
                } else {
                    await interaction.reply({ content: 'Houve um erro ao executar este comando!', ephemeral: true });
                }
            }
        }
        // Aqui adicionaremos handlers para botões e modais do bot de produtos no futuro
    },
};

const { CANAL_LOG_VENDAS_ID, CANAL_AVALIACAO_ID, CARGO_ENTRADA_ID } = require("../config/constants");
const {
    sessoesDeRegistro,
    farmEmAndamento,
    bancoDeFarm,
    punicoesEmAndamento,
    ausenciasEmAndamento,
    sessoesAusenciaPainel,
    sessoesVenda,
    acoesEmAndamento,
    sessoesFinalizacaoAcao,
    sessoesUpar,
    configFarm
} = require("../database/memoryDb");

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Toda a lógica de interação (Slash, Botão, Modal, Menu) vai aqui
        // No momento, como é uma refatoração em massa, o ideal é dividir
        // em handlers específicos para Button, Modal e Menu.

        const interactionHandler = require('../handlers/interactionHandler');
        await interactionHandler(interaction, client);
    },
};

const { EmbedBuilder } = require("discord.js");
const { COR_PADRAO } = require("../config/constants");

function formatarMoeda(valor) {
  return `R$${valor.toLocaleString("pt-BR")}`;
}

function formatarDataBR(data) {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(data);
}

module.exports = {
  formatarMoeda,
  formatarDataBR,
};

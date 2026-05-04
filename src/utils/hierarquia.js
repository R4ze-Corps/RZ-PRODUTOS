const { EmbedBuilder } = require("discord.js");
const { COR_PADRAO } = require("../config/constants");
const cargosTurquia = require("../config/cargosHierarquia");

async function gerarEmbedHierarquia(guild) {
  await guild.members.fetch();

  let descricaoHierarquia = "";

  for (const dadoCargo of cargosTurquia) {
    const cargo = guild.roles.cache.get(dadoCargo.id);

    if (cargo && cargo.members.size > 0) {
      const membros = cargo.members.map((m) => `<@${m.user.id}>`);
      descricaoHierarquia += `\n**${dadoCargo.nome}**\n${membros.join("\n")}\n`;
    } else {
      descricaoHierarquia += `\n**${dadoCargo.nome}**\n(*Vago*)\n`;
    }
  }

  return new EmbedBuilder()
    .setColor(COR_PADRAO)
    .setTitle("🏆 Hierarquia Turquia")
    .setDescription(descricaoHierarquia)
    .setThumbnail(guild.iconURL())
    .setFooter({ text: "Raze Corp.  •  Turquia", iconURL: guild.iconURL() })
    .setTimestamp();
}

module.exports = { gerarEmbedHierarquia };

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { COR_PADRAO } = require("../config/constants");

function montarEmbedAcao(acaoData) {
  const vagasStr = `(${acaoData.escalacao.length}/${acaoData.vagas})`;
  const statusEmoji =
    acaoData.status === "Pendente"
      ? "🟡 Pendente"
      : acaoData.status === "Realizando"
        ? "🟢 Realizando"
        : "🔴 Finalizado";

  const embed = new EmbedBuilder()
    .setTitle(`🔫 AÇÃO MARCADA: ${acaoData.nome.toUpperCase()}`)
    .setDescription(
      `Status: ${statusEmoji}\n\n👤 **Quem puxou:** <@${acaoData.organizadorId}>\n\n⏰ **Horário:** ${acaoData.horario}\n\n💰 **Valor:** ${acaoData.valor}\n\n🔫 **Armamento:** ${acaoData.armamento}`,
    )
    .setColor(COR_PADRAO);

  const escalacaoText =
    acaoData.escalacao.length > 0
      ? acaoData.escalacao.map((id) => `<@${id}>`).join("\n")
      : "*Ninguém na escalação ainda.*";

  const reservasText =
    acaoData.reservas.length > 0
      ? acaoData.reservas.map((id) => `<@${id}>`).join("\n")
      : "*Ninguém na reserva ainda.*";

  embed.addFields(
    { name: `👥 Escalação ${vagasStr}:`, value: escalacaoText, inline: true }
  );

  if (acaoData.resultado) {
    embed.addFields({
      name: "📊 Resultado",
      value: acaoData.resultado,
      inline: true,
    });
  }

  embed.addFields(
    {
      name: `🛡️ Reservas (${acaoData.reservas.length}):`,
      value: reservasText,
      inline: false,
    },
  );

  embed.setImage(
    "https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/Gemini_Generated_Image_nenl89nenl89nenl.png",
  );

  return embed;
}

function montarComponentesAcao(acaoData) {
  if (acaoData.status === "Finalizado") return [];

  const row1 = new ActionRowBuilder();
  if (acaoData.status === "Pendente") {
    row1.addComponents(
      new ButtonBuilder().setCustomId("acao_participar").setLabel("⚔️ Participar").setStyle(ButtonStyle.Primary),
      new ButtonBuilder().setCustomId("acao_reserva").setLabel("🛡️ Reserva").setStyle(ButtonStyle.Secondary),
      new ButtonBuilder().setCustomId("acao_sair").setLabel("❌ Sair").setStyle(ButtonStyle.Danger)
    );
  }

  const row2 = new ActionRowBuilder();
  if (acaoData.status === "Pendente") {
    row2.addComponents(
      new ButtonBuilder().setCustomId("acao_iniciar").setLabel("🚀 Iniciar Ação").setStyle(ButtonStyle.Success)
    );
  } else if (acaoData.status === "Realizando") {
    row2.addComponents(
      new ButtonBuilder().setCustomId("acao_finalizar").setLabel("🏁 Finalizar Ação").setStyle(ButtonStyle.Danger)
    );
  }

  const components = [];
  if (row1.components.length > 0) components.push(row1);
  if (row2.components.length > 0) components.push(row2);

  return components;
}

module.exports = { montarEmbedAcao, montarComponentesAcao };

const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { acoesEmAndamento, sessoesFinalizacaoAcao } = require("../../database/memoryDb");

module.exports = [
  {
    customId: "btn_participar_acao",
    async execute(interaction) { await handleAcao(interaction, "participar"); }
  },
  {
    customId: "btn_reserva_acao",
    async execute(interaction) { await handleAcao(interaction, "reserva"); }
  },
  {
    customId: "btn_sair_acao",
    async execute(interaction) { await handleAcao(interaction, "sair"); }
  },
  {
    customId: "btn_iniciar_acao",
    async execute(interaction) {
      const acao = acoesEmAndamento.get(interaction.message.id);
      if (!acao) return interaction.reply({ content: "Ação não encontrada.", ephemeral: true });
      if (interaction.user.id !== acao.criadorId) return interaction.reply({ content: "Apenas o criador pode iniciar.", ephemeral: true });
      const pingMsg = await interaction.channel.send({ content: `${acao.participantes.map((id) => `<@${id}>`).join(" ")}` });
      acao.pingMsgId = pingMsg.id;
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("btn_vitoria_acao").setLabel("Vitória").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("btn_derrota_acao").setLabel("Derrota").setStyle(ButtonStyle.Danger)
      );
      const startedEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setTitle(`🔴 EM ANDAMENTO: ${acao.nome}`).setColor("#FFFF00");
      await interaction.update({ embeds: [startedEmbed], components: [row] });
    }
  },
  {
    customId: "btn_vitoria_acao",
    async execute(interaction) {
      const acao = acoesEmAndamento.get(interaction.message.id);
      if (interaction.user.id !== acao.criadorId) return interaction.reply({ content: "Apenas o criador pode finalizar.", ephemeral: true });
      const modal = new ModalBuilder().setCustomId("modal_valor_vitoria").setTitle("Valor da Vitória");
      const valInput = new TextInputBuilder().setCustomId("valor_vitoria").setLabel("Valor Total Ganho").setStyle(TextInputStyle.Short).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(valInput));
      await interaction.showModal(modal);
      sessoesFinalizacaoAcao.set(interaction.user.id, interaction.message.id);
    }
  },
  {
    customId: "btn_derrota_acao",
    async execute(interaction) {
      const acao = acoesEmAndamento.get(interaction.message.id);
      if (interaction.user.id !== acao.criadorId) return interaction.reply({ content: "Apenas o criador pode finalizar.", ephemeral: true });
      if (acao.pingMsgId) {
        const m = await interaction.channel.messages.fetch(acao.pingMsgId).catch(() => null);
        if (m) await m.delete();
      }
      await interaction.update({ content: "💀 Ação finalizada com Derrota.", embeds: [], components: [] });
      acoesEmAndamento.delete(interaction.message.id);
    }
  }
];

async function handleAcao(interaction, tipo) {
  const msgId = interaction.message.id;
  const acao = acoesEmAndamento.get(msgId);
  if (!acao) return interaction.reply({ content: "Ação não encontrada.", ephemeral: true });
  const userId = interaction.user.id;
  if (tipo === "participar") {
    if (acao.participantes.length < acao.vagas) {
      if (!acao.participantes.includes(userId)) {
        acao.participantes.push(userId);
        acao.reservas = acao.reservas.filter((id) => id !== userId);
      }
    } else return interaction.reply({ content: "Vagas preenchidas. Entre como reserva.", ephemeral: true });
  } else if (tipo === "reserva") {
    if (!acao.reservas.includes(userId)) {
      acao.reservas.push(userId);
      acao.participantes = acao.participantes.filter((id) => id !== userId);
    }
  } else if (tipo === "sair") {
    acao.participantes = acao.participantes.filter((id) => id !== userId);
    acao.reservas = acao.reservas.filter((id) => id !== userId);
  }
  const newEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setFields(
    { name: `Participantes (${acao.participantes.length}/${acao.vagas})`, value: acao.participantes.length > 0 ? acao.participantes.map((id) => `<@${id}>`).join("\n") : "Nenhum" },
    { name: `Reservas`, value: acao.reservas.length > 0 ? acao.reservas.map((id) => `<@${id}>`).join("\n") : "Nenhum" }
  );
  await interaction.update({ embeds: [newEmbed] });
}

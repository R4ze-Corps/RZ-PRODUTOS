const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { COR_PADRAO } = require("../../config/constants");
const { acoesEmAndamento, sessoesFinalizacaoAcao } = require("../../database/memoryDb");

module.exports = [
  {
    customId: "modal_criar_acao",
    async execute(interaction) {
      const nome = interaction.fields.getTextInputValue("nome_acao");
      const horario = interaction.fields.getTextInputValue("horario_acao");
      const vagas = parseInt(interaction.fields.getTextInputValue("vagas_acao"));
      const embed = new EmbedBuilder().setColor(COR_PADRAO).setTitle(`🎯 AÇÃO: ${nome}`)
        .addFields({ name: "Horário", value: horario, inline: true }, { name: "Vagas", value: vagas.toString(), inline: true }, { name: "Participantes (0)", value: "Nenhum" }, { name: "Reservas", value: "Nenhum" })
        .setFooter({ text: `Criado por ${interaction.user.username}` });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("btn_participar_acao").setLabel("Participar").setStyle(ButtonStyle.Success),
        new ButtonBuilder().setCustomId("btn_reserva_acao").setLabel("Reserva").setStyle(ButtonStyle.Secondary),
        new ButtonBuilder().setCustomId("btn_sair_acao").setLabel("Sair").setStyle(ButtonStyle.Danger),
        new ButtonBuilder().setCustomId("btn_iniciar_acao").setLabel("Iniciar").setStyle(ButtonStyle.Primary)
      );
      const msg = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });
      acoesEmAndamento.set(msg.id, { nome, horario, vagas, criadorId: interaction.user.id, participantes: [], reservas: [] });
    }
  },
  {
    customId: "modal_valor_vitoria",
    async execute(interaction) {
      const valor = interaction.fields.getTextInputValue("valor_vitoria");
      const msgId = sessoesFinalizacaoAcao.get(interaction.user.id);
      const acao = acoesEmAndamento.get(msgId);
      if (acao && acao.pingMsgId) {
        const m = await interaction.channel.messages.fetch(acao.pingMsgId).catch(() => null);
        if (m) await m.delete();
      }
      await interaction.update({ content: `🏆 Ação finalizada com Vitória! Total Ganho: ${valor}`, embeds: [], components: [] });
      acoesEmAndamento.delete(msgId);
      sessoesFinalizacaoAcao.delete(interaction.user.id);
    }
  }
];

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  StringSelectMenuBuilder,
} = require("discord.js");

const {
  CANAL_LOG_PUNICAO_ID,
  CANAL_AUSENCIA_ID,
  CANAL_LOG_REGISTRO_ID,
  CANAL_AVALIACAO_ID,
  CARGO_RECRUTADOR_ID,
  COR_PADRAO,
  COR_PRETO,
} = require("../../config/constants");

const {
  sessoesDeRegistro,
  farmEmAndamento,
  bancoDeFarm,
  ausenciasEmAndamento,
  sessoesVenda,
  acoesEmAndamento,
  sessoesFinalizacaoAcao,
  configFarm,
} = require("../../database/memoryDb");

const {
  montarEmbedCarrinhoVenda,
  montarComponentesVenda,
} = require("../../utils/vendasHelpers");

module.exports = async (interaction, client) => {
  const customId = interaction.customId;

  if (customId === "modal_registro") {
    const nome = interaction.fields.getTextInputValue("reg_nome");
    const id = interaction.fields.getTextInputValue("reg_id");
    const telefone = interaction.fields.getTextInputValue("reg_telefone");

    sessoesDeRegistro.set(interaction.user.id, { nome, id, telefone });

    await interaction.guild.members.fetch();
    const recruiters = interaction.guild.members.cache.filter((m) =>
      m.roles.cache.has(CARGO_RECRUTADOR_ID),
    );

    if (recruiters.size === 0) {
      return interaction.reply({
        content: "Nenhum recrutador disponível no momento.",
        ephemeral: true,
      });
    }

    const menu = new StringSelectMenuBuilder()
      .setCustomId("selecionar_recrutador")
      .setPlaceholder("Selecione o recrutador que te avaliou...")
      .addOptions(
        recruiters
          .map((r) => ({
            label: r.user.tag,
            value: r.id,
          }))
          .slice(0, 25),
      );

    await interaction.reply({
      content: "Selecione seu recrutador:",
      components: [new ActionRowBuilder().addComponents(menu)],
      ephemeral: true,
    });
  }

  if (customId.startsWith("modal_punicao_")) {
    const parts = customId.split("_");
    const userId = parts[2];
    const cargoId = parts[3];
    const motivo = interaction.fields.getTextInputValue("motivo_punicao");

    const member = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);
    if (member) {
      await member.roles.add(cargoId).catch(console.error);
      const logChannel =
        interaction.guild.channels.cache.get(CANAL_LOG_PUNICAO_ID);
      if (logChannel) {
        const embedLog = new EmbedBuilder()
          .setColor(COR_PADRAO)
          .setTitle("⚖️ PUNIÇÃO APLICADA")
          .addFields(
            { name: "Membro", value: `<@${userId}>`, inline: true },
            {
              name: "Staff",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            { name: "Motivo", value: motivo || "---" },
          )
          .setTimestamp();
        await logChannel.send({ embeds: [embedLog] });
      }
      await interaction.reply({
        content: "Punição aplicada e logada.",
        ephemeral: true,
      });
    }
  }

  if (customId === "modal_ausencia") {
    const inicio = interaction.fields.getTextInputValue("inicio_ausencia");
    const fim = interaction.fields.getTextInputValue("fim_ausencia");
    const motivo = interaction.fields.getTextInputValue("motivo_ausencia");

    ausenciasEmAndamento.set(interaction.user.id, { inicio, fim, motivo });

    const avaliacaoChannel =
      interaction.guild.channels.cache.get(CANAL_AUSENCIA_ID);
    if (avaliacaoChannel) {
      const embed = new EmbedBuilder()
        .setColor(COR_PRETO)
        .setTitle("📋 PEDIDO DE AUSÊNCIA")
        .addFields(
          {
            name: "Membro",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          { name: "Início", value: inicio, inline: true },
          { name: "Fim", value: fim, inline: true },
          { name: "Motivo", value: motivo },
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`btn_aprovar_ausencia_${interaction.user.id}`)
          .setLabel("Aprovar")
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId(`btn_negar_ausencia_${interaction.user.id}`)
          .setLabel("Negar")
          .setStyle(ButtonStyle.Danger),
      );

      await avaliacaoChannel.send({ embeds: [embed], components: [row] });
    }
    await interaction.reply({
      content: "Seu pedido de ausência foi enviado para análise.",
      ephemeral: true,
    });
  }

  if (customId === "modal_venda_qtd") {
    const qtd = parseInt(interaction.fields.getTextInputValue("venda_qtd"));
    if (isNaN(qtd) || qtd <= 0)
      return interaction.reply({
        content: "Quantidade inválida.",
        ephemeral: true,
      });

    const sessao = sessoesVenda.get(interaction.user.id);
    if (!sessao)
      return interaction.reply({
        content: "Sessão não encontrada.",
        ephemeral: true,
      });

    const itemAtual = sessao.itens[sessao.itens.length - 1];
    itemAtual.quantidade = qtd;

    const embed = montarEmbedCarrinhoVenda(interaction.user.id, sessao);
    const componentes = montarComponentesVenda(sessao);

    await interaction.update({
      embeds: [embed],
      components: componentes,
    });
  }

  if (customId === "modal_criar_acao") {
    const nome = interaction.fields.getTextInputValue("nome_acao");
    const horario = interaction.fields.getTextInputValue("horario_acao");
    const vagas = parseInt(
      interaction.fields.getTextInputValue("vagas_acao"),
    );

    const embed = new EmbedBuilder()
      .setColor(COR_PADRAO)
      .setTitle(`🎯 AÇÃO: ${nome}`)
      .addFields(
        { name: "Horário", value: horario, inline: true },
        { name: "Vagas", value: vagas.toString(), inline: true },
        { name: "Participantes (0)", value: "Nenhum" },
        { name: "Reservas", value: "Nenhum" },
      )
      .setFooter({ text: `Criado por ${interaction.user.username}` });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_participar_acao")
        .setLabel("Participar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("btn_reserva_acao")
        .setLabel("Reserva")
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId("btn_sair_acao")
        .setLabel("Sair")
        .setStyle(ButtonStyle.Danger),
      new ButtonBuilder()
        .setCustomId("btn_iniciar_acao")
        .setLabel("Iniciar")
        .setStyle(ButtonStyle.Primary),
    );

    const msg = await interaction.reply({
      embeds: [embed],
      components: [row],
      fetchReply: true,
    });
    acoesEmAndamento.set(msg.id, {
      nome,
      horario,
      vagas,
      criadorId: interaction.user.id,
      participantes: [],
      reservas: [],
    });
  }

  if (customId === "modal_valor_vitoria") {
    const valor = interaction.fields.getTextInputValue("valor_vitoria");
    const msgId = sessoesFinalizacaoAcao.get(interaction.user.id);
    const acao = acoesEmAndamento.get(msgId);

    if (acao && acao.pingMsgId) {
      const m = await interaction.channel.messages
        .fetch(acao.pingMsgId)
        .catch(() => null);
      if (m) await m.delete();
    }

    await interaction.update({
      content: `🏆 Ação finalizada com Vitória! Total Ganho: ${valor}`,
      embeds: [],
      components: [],
    });
    acoesEmAndamento.delete(msgId);
    sessoesFinalizacaoAcao.delete(interaction.user.id);
  }

  if (customId === "modal_qtd_farm") {
    const qtd = parseInt(interaction.fields.getTextInputValue("qtd_farm"));
    if (isNaN(qtd) || qtd <= 0)
      return interaction.reply({
        content: "Quantidade inválida.",
        ephemeral: true,
      });

    const farm = farmEmAndamento.get(interaction.channel.id);
    if (farm) farm.qtd = qtd;

    const embed = new EmbedBuilder()
      .setColor(COR_PADRAO)
      .setTitle("🚜 REGISTRO DE FARM")
      .setDescription(`Você está registrando ${qtd}x **${farm?.itemNome || 'Item'}**.`)
      .setFooter({
        text: "Clique no botão abaixo para enviar o print e finalizar.",
      });

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("finalizar_farm")
        .setLabel("ENVIAR PRINT (CLIQUE AQUI)")
        .setStyle(ButtonStyle.Primary),
    );

    await interaction.reply({ embeds: [embed], components: [row] });
  }

  if (customId === "modal_config_farm") {
    const parseInput = (val, defaultNome) => {
      const parts = val.split("|");
      return {
        nome: parts[0] ? parts[0].trim() : defaultNome,
        meta: parts[1] ? parts[1].trim() : "X",
      };
    };

    configFarm.plastico = parseInput(
      interaction.fields.getTextInputValue("cfg_plastico"),
      "Plástico",
    );
    configFarm.aluminio = parseInput(
      interaction.fields.getTextInputValue("cfg_aluminio"),
      "Alumínio",
    );
    configFarm.polvora = parseInput(
      interaction.fields.getTextInputValue("cfg_polvora"),
      "Pólvora Preta",
    );
    configFarm.ferro = parseInput(
      interaction.fields.getTextInputValue("cfg_ferro"),
      "Barra de Ferro",
    );
    configFarm.sd = parseInput(
      interaction.fields.getTextInputValue("cfg_sd"),
      "Cartão SD",
    );

    await interaction.reply({
      content: "✅ Produtos e metas atualizados com sucesso!",
      ephemeral: true,
    });
  }

  if (customId.startsWith("edit_farm_vals_")) {
    const userId = customId.replace("edit_farm_vals_", "");
    const p = parseInt(
      interaction.fields.getTextInputValue("val_plastico"),
      10,
    );
    const a = parseInt(
      interaction.fields.getTextInputValue("val_aluminio"),
      10,
    );
    const po = parseInt(
      interaction.fields.getTextInputValue("val_polvora"),
      10,
    );
    const f = parseInt(
      interaction.fields.getTextInputValue("val_ferro"),
      10,
    );
    const s = parseInt(interaction.fields.getTextInputValue("val_sd"), 10);

    if (isNaN(p) || isNaN(a) || isNaN(po) || isNaN(f) || isNaN(s)) {
      return interaction.reply({
        content: "❌ Todos os valores devem ser números válidos.",
        ephemeral: true,
      });
    }

    bancoDeFarm.set(userId, {
      plastico: p,
      aluminio: a,
      polvora: po,
      ferro: f,
      sd: s,
    });
    await interaction.reply({
      content: `✅ Farm do jogador <@${userId}> atualizado com sucesso!`,
      ephemeral: true,
    });
  }
};

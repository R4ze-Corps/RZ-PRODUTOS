const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ChannelType,
  PermissionFlagsBits,
  AttachmentBuilder,
  UserSelectMenuBuilder,
} = require("discord.js");

const {
  CANAL_LOG_PUNICAO_ID,
  CANAL_AUSENCIA_ID,
  CANAL_LOG_AUSENCIA_ID,
  CANAL_LOG_VENDAS_ID,
  CANAL_LOG_FARM_ID,
  CANAL_LOG_TRANSCRIPT_ID,
  CANAL_LOG_REGISTRO_ID,
  CARGO_AUSENCIA_ID,
  CARGO_ENTRADA_ID,
  CARGO_AVIAOZINHO_ID,
  CARGO_MEMBRO_EXTRA_ID,
  CATEGORIA_SUPORTE_ID,
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
  sessoesUpar,
  configFarm,
} = require("../../database/memoryDb");

const { gerarEmbedHierarquia } = require("../../utils/hierarquia");
const { safeNickname } = require("../../utils/nickHelpers");
const { formatarMoeda } = require("../../utils/formatters");
const { criarSalaFarm } = require("../../utils/farmHelpers");
const {
  montarEmbedCarrinhoVenda,
  montarComponentesVenda,
  calcularTotaisVenda,
} = require("../../utils/vendasHelpers");

module.exports = async (interaction, client) => {
  const customId = interaction.customId;

  // Hierarquia
  if (customId === "atualizar_hierarquia") {
    const embed = await gerarEmbedHierarquia(interaction.guild);
    await interaction.update({ embeds: [embed] });
  }

  // Registro
  if (customId === "iniciar_registro") {
    const modal = new ModalBuilder()
      .setCustomId("modal_registro")
      .setTitle("Formulário de Registro");

    const nomeInput = new TextInputBuilder()
      .setCustomId("reg_nome")
      .setLabel("Nome")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const idInput = new TextInputBuilder()
      .setCustomId("reg_id")
      .setLabel("ID")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const telefoneInput = new TextInputBuilder()
      .setCustomId("reg_telefone")
      .setLabel("Telefone")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(nomeInput),
      new ActionRowBuilder().addComponents(idInput),
      new ActionRowBuilder().addComponents(telefoneInput),
    );

    await interaction.showModal(modal);
  }

  if (customId.startsWith("aprovar_") || customId.startsWith("negar_")) {
    const [acao, userId] = customId.split("_");
    const targetMember = await interaction.guild.members
      .fetch(userId)
      .catch(() => null);

    if (acao === "aprovar") {
      if (!targetMember)
        return interaction.reply({
          content: "Membro não encontrado.",
          ephemeral: true,
        });

      const dados = sessoesDeRegistro.get(userId);
      if (!dados)
        return interaction.reply({
          content: "Dados do registro não encontrados.",
          ephemeral: true,
        });

      const nick = safeNickname(`[AV] ${dados.nome} | ${dados.id}`);
      await targetMember.setNickname(nick).catch(console.error);

      // Adiciona Cargos: Aviãozinho e extra
      await targetMember.roles
        .add([CARGO_AVIAOZINHO_ID, CARGO_MEMBRO_EXTRA_ID])
        .catch(console.error);
      await targetMember.roles.remove(CARGO_ENTRADA_ID).catch(console.error);

      // Criar Sala de Farm
      await criarSalaFarm(interaction.guild, targetMember, configFarm).catch(
        console.error,
      );

      const embedLog = new EmbedBuilder()
        .setColor("#00FF00")
        .setTitle("✅ REGISTRO APROVADO")
        .addFields(
          { name: "Membro", value: `<@${userId}>`, inline: true },
          { name: "Nome", value: dados.nome || "---", inline: true },
          { name: "ID", value: dados.id || "---", inline: true },
          {
            name: "Telefone",
            value: dados.telefone || "---",
            inline: true,
          },
          {
            name: "Recrutador",
            value: dados.recrutadorId ? `<@${dados.recrutadorId}>` : "---",
            inline: true,
          },
          {
            name: "Aprovado Por",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
        )
        .setTimestamp();

      const logCanal = interaction.guild.channels.cache.get(
        CANAL_LOG_REGISTRO_ID,
      );
      if (logCanal && logCanal.id !== interaction.channel.id) {
        await logCanal.send({ embeds: [embedLog] });
      }

      await interaction.update({
        content: null,
        embeds: [embedLog],
        components: [],
      });
      sessoesDeRegistro.delete(userId);
    } else {
      const dados = sessoesDeRegistro.get(userId);
      const embedLog = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ REGISTRO NEGADO")
        .addFields(
          { name: "Membro", value: `<@${userId}>`, inline: true },
          { name: "Nome", value: dados?.nome || "---", inline: true },
          { name: "ID", value: dados?.id || "---", inline: true },
          {
            name: "Telefone",
            value: dados?.telefone || "---",
            inline: true,
          },
          {
            name: "Recrutador",
            value: dados?.recrutadorId ? `<@${dados.recrutadorId}>` : "---",
            inline: true,
          },
          {
            name: "Negado Por",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
        )
        .setTimestamp();

      const logCanal = interaction.guild.channels.cache.get(
        CANAL_LOG_REGISTRO_ID,
      );
      if (logCanal && logCanal.id !== interaction.channel.id) {
        await logCanal.send({ embeds: [embedLog] });
      }

      await interaction.update({
        content: null,
        embeds: [embedLog],
        components: [],
      });
      sessoesDeRegistro.delete(userId);
    }
  }

  // Ausência
  if (customId === "btn_pedir_ausencia") {
    const modal = new ModalBuilder()
      .setCustomId("modal_ausencia")
      .setTitle("Registro de Ausência");

    const inicioInput = new TextInputBuilder()
      .setCustomId("inicio_ausencia")
      .setLabel("Data de Início")
      .setPlaceholder("Ex: 10/05")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const fimInput = new TextInputBuilder()
      .setCustomId("fim_ausencia")
      .setLabel("Data de Término")
      .setPlaceholder("Ex: 15/05")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const motivoInput = new TextInputBuilder()
      .setCustomId("motivo_ausencia")
      .setLabel("Motivo")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(inicioInput),
      new ActionRowBuilder().addComponents(fimInput),
      new ActionRowBuilder().addComponents(motivoInput),
    );

    await interaction.showModal(modal);
  }

  if (
    customId.startsWith("btn_aprovar_ausencia_") ||
    customId.startsWith("btn_negar_ausencia_")
  ) {
    const parts = customId.split("_");
    const userId = parts[3];
    const acao = parts[1];

    if (acao === "aprovar") {
      const dados = ausenciasEmAndamento.get(userId);
      const member = await interaction.guild.members
        .fetch(userId)
        .catch(() => null);
      if (member) {
        await member.roles.add(CARGO_AUSENCIA_ID).catch(console.error);

        const logChannel = interaction.guild.channels.cache.get(
          CANAL_LOG_AUSENCIA_ID,
        );
        if (logChannel) {
          const embedLog = new EmbedBuilder()
            .setColor("#00FF00")
            .setTitle("Ausência Iniciada")
            .addFields(
              { name: "Membro", value: `<@${userId}>`, inline: true },
              {
                name: "Início",
                value: dados?.inicio || "---",
                inline: true,
              },
              { name: "Fim", value: dados?.fim || "---", inline: true },
              { name: "Motivo", value: dados?.motivo || "---" },
            )
            .setTimestamp();
          await logChannel.send({ embeds: [embedLog] });
        }
      }
      await interaction.update({
        content: `✅ Ausência de <@${userId}> aprovada por <@${interaction.user.id}>`,
        components: [],
      });
    } else {
      await interaction.update({
        content: `❌ Ausência de <@${userId}> negada por <@${interaction.user.id}>`,
        components: [],
      });
      ausenciasEmAndamento.delete(userId);
    }
  }

  // Vendas
  if (customId === "btn_venda_parceria" || customId === "btn_venda_pista") {
    const tipo = customId === "btn_venda_parceria" ? "parceria" : "pista";
    sessoesVenda.set(interaction.user.id, { tipo, itens: [] });

    const sessao = sessoesVenda.get(interaction.user.id);
    const embed = montarEmbedCarrinhoVenda(interaction.user.id, sessao);
    const componentes = montarComponentesVenda(sessao);

    await interaction.reply({
      embeds: [embed],
      components: componentes,
      ephemeral: true,
    });
  }

  if (customId === "btn_limpar_carrinho") {
    sessoesVenda.delete(interaction.user.id);
    await interaction.update({
      content: "🛒 Carrinho limpo.",
      embeds: [],
      components: [],
    });
  }

  if (customId === "btn_finalizar_venda") {
    const sessao = sessoesVenda.get(interaction.user.id);
    if (!sessao || sessao.itens.length === 0)
      return interaction.reply({
        content: "Seu carrinho está vazio.",
        ephemeral: true,
      });

    const { itens, total, deposito } = calcularTotaisVenda(sessao);
    const listaProdutos = itens
      .map((i) => `• ${i.quantidade}x **${i.nome}**`)
      .join("\n");

    const logChannel =
      interaction.guild.channels.cache.get(CANAL_LOG_VENDAS_ID);
    if (logChannel) {
      const embedLog = new EmbedBuilder()
        .setColor(COR_PADRAO)
        .setTitle("📦 NOVA VENDA")
        .addFields(
          {
            name: "Vendedor",
            value: `<@${interaction.user.id}>`,
            inline: true,
          },
          {
            name: "Tipo",
            value: sessao.tipo === "pista" ? "Pista" : "Parceria",
            inline: true,
          },
          { name: "Produtos", value: listaProdutos || "---" },
          {
            name: "Total",
            value: formatarMoeda(total),
            inline: true,
          },
          {
            name: "30% Organização",
            value: formatarMoeda(deposito),
            inline: true,
          },
        )
        .setTimestamp();
      await logChannel.send({ embeds: [embedLog] });
    }

    sessoesVenda.delete(interaction.user.id);
    await interaction.update({
      content: "✅ Venda finalizada com sucesso!",
      embeds: [],
      components: [],
    });
  }

  // Ações
  if (
    customId.startsWith("btn_participar_acao") ||
    customId.startsWith("btn_reserva_acao") ||
    customId.startsWith("btn_sair_acao")
  ) {
    const msgId = interaction.message.id;
    const acao = acoesEmAndamento.get(msgId);
    if (!acao)
      return interaction.reply({
        content: "Ação não encontrada.",
        ephemeral: true,
      });

    const userId = interaction.user.id;
    if (customId.includes("participar")) {
      if (acao.participantes.length < acao.vagas) {
        if (!acao.participantes.includes(userId)) {
          acao.participantes.push(userId);
          acao.reservas = acao.reservas.filter((id) => id !== userId);
        }
      } else {
        return interaction.reply({
          content: "Vagas preenchidas. Entre como reserva.",
          ephemeral: true,
        });
      }
    } else if (customId.includes("reserva")) {
      if (!acao.reservas.includes(userId)) {
        acao.reservas.push(userId);
        acao.participantes = acao.participantes.filter(
          (id) => id !== userId,
        );
      }
    } else if (customId.includes("sair")) {
      acao.participantes = acao.participantes.filter((id) => id !== userId);
      acao.reservas = acao.reservas.filter((id) => id !== userId);
    }

    const newEmbed = EmbedBuilder.from(
      interaction.message.embeds[0],
    ).setFields(
      {
        name: `Participantes (${acao.participantes.length}/${acao.vagas})`,
        value:
          acao.participantes.length > 0
            ? acao.participantes.map((id) => `<@${id}>`).join("\n")
            : "Nenhum",
      },
      {
        name: `Reservas`,
        value:
          acao.reservas.length > 0
            ? acao.reservas.map((id) => `<@${id}>`).join("\n")
            : "Nenhum",
      },
    );
    await interaction.update({ embeds: [newEmbed] });
  }

  if (customId === "btn_iniciar_acao") {
    const msgId = interaction.message.id;
    const acao = acoesEmAndamento.get(msgId);
    if (interaction.user.id !== acao.criadorId)
      return interaction.reply({
        content: "Apenas o criador pode iniciar.",
        ephemeral: true,
      });

    const pingMsg = await interaction.channel.send({
      content: `${acao.participantes.map((id) => `<@${id}>`).join(" ")}`,
    });
    acao.pingMsgId = pingMsg.id;

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_vitoria_acao")
        .setLabel("Vitória")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("btn_derrota_acao")
        .setLabel("Derrota")
        .setStyle(ButtonStyle.Danger),
    );

    const startedEmbed = EmbedBuilder.from(interaction.message.embeds[0])
      .setTitle(`🔴 EM ANDAMENTO: ${acao.nome}`)
      .setColor("#FFFF00");

    await interaction.update({ embeds: [startedEmbed], components: [row] });
  }

  if (customId === "btn_vitoria_acao" || customId === "btn_derrota_acao") {
    const msgId = interaction.message.id;
    const acao = acoesEmAndamento.get(msgId);
    if (interaction.user.id !== acao.criadorId)
      return interaction.reply({
        content: "Apenas o criador pode finalizar.",
        ephemeral: true,
      });

    if (customId.includes("vitoria")) {
      const modal = new ModalBuilder()
        .setCustomId("modal_valor_vitoria")
        .setTitle("Valor da Vitória");
      const valInput = new TextInputBuilder()
        .setCustomId("valor_vitoria")
        .setLabel("Valor Total Ganho")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(valInput));
      await interaction.showModal(modal);
      sessoesFinalizacaoAcao.set(interaction.user.id, msgId);
    } else {
      if (acao.pingMsgId) {
        const m = await interaction.channel.messages
          .fetch(acao.pingMsgId)
          .catch(() => null);
        if (m) await m.delete();
      }
      await interaction.update({
        content: "💀 Ação finalizada com Derrota.",
        embeds: [],
        components: [],
      });
      acoesEmAndamento.delete(msgId);
    }
  }

  // Upar
  if (customId === "btn_promover" || customId === "btn_rebaixar") {
    sessoesUpar.set(interaction.user.id, {
      tipo: customId === "btn_promover" ? "PROMOÇÃO" : "REBAIXAMENTO",
    });
    const userSelect = new UserSelectMenuBuilder()
      .setCustomId("select_user_upar")
      .setPlaceholder("Selecione o membro...");
    await interaction.reply({
      content: "Selecione o membro:",
      components: [new ActionRowBuilder().addComponents(userSelect)],
      ephemeral: true,
    });
  }

  // Suporte
  if (customId === "btn_abrir_suporte") {
    const canal = await interaction.guild.channels.create({
      name: `suporte-${interaction.user.username}`,
      type: ChannelType.GuildText,
      parent: CATEGORIA_SUPORTE_ID,
      permissionOverwrites: [
        {
          id: interaction.guild.id,
          deny: [PermissionFlagsBits.ViewChannel],
        },
        {
          id: interaction.user.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
          ],
        },
      ],
    });

    const embed = new EmbedBuilder()
      .setColor(COR_PRETO)
      .setTitle("Atendimento")
      .setDescription(
        "Aguarde um membro da gerência. Para fechar, clique no botão abaixo.",
      );

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("btn_fechar_suporte")
        .setLabel("Fechar Suporte")
        .setStyle(ButtonStyle.Danger),
    );

    await canal.send({
      content: `<@${interaction.user.id}>`,
      embeds: [embed],
      components: [row],
    });
    await interaction.reply({
      content: `Canal criado: ${canal}`,
      ephemeral: true,
    });
  }

  if (customId === "btn_fechar_suporte") {
    const canal = interaction.channel;
    const logs = await canal.messages.fetch();
    let transcript = `Transcript do canal ${canal.name}\n\n`;
    logs.reverse().forEach((m) => {
      transcript += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
    });

    const buffer = Buffer.from(transcript, "utf-8");
    const attachment = new AttachmentBuilder(buffer, {
      name: "transcript.txt",
    });

    const logChannel = interaction.guild.channels.cache.get(
      CANAL_LOG_TRANSCRIPT_ID,
    );
    if (logChannel) {
      await logChannel.send({
        content: `Suporte de <@${interaction.user.id}> fechado.`,
        files: [attachment],
      });
    }

    await interaction.reply("O canal será deletado em 5 segundos...");
    setTimeout(() => canal.delete(), 5000);
  }

  // Farm Buttons
  if (customId === "ver_entregas") {
    const conta = bancoDeFarm.get(interaction.user.id) || {
      plastico: 0,
      aluminio: 0,
      polvora: 0,
      ferro: 0,
      sd: 0,
    };
    const embedStatus = new EmbedBuilder()
      .setTitle("📊 Seu Histórico de Entregas")
      .setColor(COR_PADRAO)
      .setDescription(
        `Aqui está o total que você já entregou:\n\n📦 **${configFarm.plastico.nome}:** ${conta.plastico} / ${configFarm.plastico.meta}\n📦 **${configFarm.aluminio.nome}:** ${conta.aluminio} / ${configFarm.aluminio.meta}\n📦 **${configFarm.polvora.nome}:** ${conta.polvora} / ${configFarm.polvora.meta}\n📦 **${configFarm.ferro.nome}:** ${conta.ferro} / ${configFarm.ferro.meta}\n📦 **${configFarm.sd.nome}:** ${conta.sd} / ${configFarm.sd.meta}`,
      );
    await interaction.reply({
      embeds: [embedStatus],
      ephemeral: true,
    });
  }

  if (customId === "configurar_farm") {
    if (
      !interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)
    ) {
      return interaction.reply({
        content: "❌ Apenas administradores podem configurar o painel.",
        ephemeral: true,
      });
    }

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("abrir_modal_metas")
        .setLabel("⚙️ Produtos e Metas")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId("abrir_modal_editar_farm")
        .setLabel("✏️ Editar Farm de Jogador")
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.reply({
      content: "O que você deseja configurar?",
      components: [row],
      ephemeral: true,
    });
  }

  if (customId === "abrir_modal_metas") {
    const modal = new ModalBuilder()
      .setCustomId("modal_config_farm")
      .setTitle("Configurar Produtos e Metas");
    const in1 = new TextInputBuilder()
      .setCustomId("cfg_plastico")
      .setLabel("Plástico (Nome | Meta)")
      .setStyle(TextInputStyle.Short)
      .setValue(`${configFarm.plastico.nome} | ${configFarm.plastico.meta}`)
      .setRequired(true);
    const in2 = new TextInputBuilder()
      .setCustomId("cfg_aluminio")
      .setLabel("Alumínio (Nome | Meta)")
      .setStyle(TextInputStyle.Short)
      .setValue(`${configFarm.aluminio.nome} | ${configFarm.aluminio.meta}`)
      .setRequired(true);
    const in3 = new TextInputBuilder()
      .setCustomId("cfg_polvora")
      .setLabel("Pólvora (Nome | Meta)")
      .setStyle(TextInputStyle.Short)
      .setValue(`${configFarm.polvora.nome} | ${configFarm.polvora.meta}`)
      .setRequired(true);
    const in4 = new TextInputBuilder()
      .setCustomId("cfg_ferro")
      .setLabel("Ferro (Nome | Meta)")
      .setStyle(TextInputStyle.Short)
      .setValue(`${configFarm.ferro.nome} | ${configFarm.ferro.meta}`)
      .setRequired(true);
    const in5 = new TextInputBuilder()
      .setCustomId("cfg_sd")
      .setLabel("Cartão SD (Nome | Meta)")
      .setStyle(TextInputStyle.Short)
      .setValue(`${configFarm.sd.nome} | ${configFarm.sd.meta}`)
      .setRequired(true);

    modal.addComponents(
      new ActionRowBuilder().addComponents(in1),
      new ActionRowBuilder().addComponents(in2),
      new ActionRowBuilder().addComponents(in3),
      new ActionRowBuilder().addComponents(in4),
      new ActionRowBuilder().addComponents(in5),
    );
    await interaction.showModal(modal);
  }

  if (customId === "abrir_modal_editar_farm") {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("selecionar_jogador_edit_farm")
      .setPlaceholder("Selecione o jogador");

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: "Selecione de qual jogador você deseja editar o farm:",
      components: [row],
      ephemeral: true,
    });
  }

  if (customId.startsWith("abrir_modal_valores_edit_")) {
    const userId = customId.replace("abrir_modal_valores_edit_", "");
    const conta = bancoDeFarm.get(userId) || {
      plastico: 0,
      aluminio: 0,
      polvora: 0,
      ferro: 0,
      sd: 0,
    };

    const modalEdit = new ModalBuilder()
      .setCustomId(`edit_farm_vals_${userId}`)
      .setTitle("Editar Valores de Farm");

    const in1 = new TextInputBuilder()
      .setCustomId("val_plastico")
      .setLabel(configFarm.plastico.nome)
      .setStyle(TextInputStyle.Short)
      .setValue(String(conta.plastico))
      .setRequired(true);
    const in2 = new TextInputBuilder()
      .setCustomId("val_aluminio")
      .setLabel(configFarm.aluminio.nome)
      .setStyle(TextInputStyle.Short)
      .setValue(String(conta.aluminio))
      .setRequired(true);
    const in3 = new TextInputBuilder()
      .setCustomId("val_polvora")
      .setLabel(configFarm.polvora.nome)
      .setStyle(TextInputStyle.Short)
      .setValue(String(conta.polvora))
      .setRequired(true);
    const in4 = new TextInputBuilder()
      .setCustomId("val_ferro")
      .setLabel(configFarm.ferro.nome)
      .setStyle(TextInputStyle.Short)
      .setValue(String(conta.ferro))
      .setRequired(true);
    const in5 = new TextInputBuilder()
      .setCustomId("val_sd")
      .setLabel(configFarm.sd.nome)
      .setStyle(TextInputStyle.Short)
      .setValue(String(conta.sd))
      .setRequired(true);

    modalEdit.addComponents(
      new ActionRowBuilder().addComponents(in1),
      new ActionRowBuilder().addComponents(in2),
      new ActionRowBuilder().addComponents(in3),
      new ActionRowBuilder().addComponents(in4),
      new ActionRowBuilder().addComponents(in5),
    );

    await interaction.showModal(modalEdit);
  }

  if (customId === "fechar_ticket") {
    if (!interaction.member.roles.cache.has(CARGO_RECRUTADOR_ID)) {
      return interaction.reply({
        content:
          "❌ **Acesso Negado:** Apenas membros autorizados podem fechar esta sala.",
        ephemeral: true,
      });
    }
    await interaction.reply("🔒 Esta sala será apagada em 5 segundos...");
    setTimeout(() => {
      interaction.channel.delete().catch(console.error);
    }, 5000);
  }

  // Farm Finalizar
  if (customId === "finalizar_farm") {
    const farm = farmEmAndamento.get(interaction.channel.id);
    if (!farm)
      return interaction.reply({
        content: "Farm não encontrado.",
        ephemeral: true,
      });

    await interaction.reply(
      "Envie um print do farm para finalizar o registro.",
    );
    const filter = (m) =>
      m.author.id === interaction.user.id && m.attachments.size > 0;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 60000,
      max: 1,
    });

    collector.on("collect", async (m) => {
      const logChannel =
        interaction.guild.channels.cache.get(CANAL_LOG_FARM_ID);
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setColor("#00FF00")
          .setTitle("🚜 NOVO FARM REGISTRADO")
          .addFields(
            {
              name: "Membro",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            { name: "Produto", value: farm.itemNome, inline: true },
            {
              name: "Quantidade",
              value: farm.qtd.toString(),
              inline: true,
            },
          )
          .setImage(m.attachments.first().url)
          .setTimestamp();
        await logChannel.send({ embeds: [embed] });
      }

      // Atualizar banco de farm
      if (!bancoDeFarm.has(interaction.user.id)) {
        bancoDeFarm.set(interaction.user.id, {
          plastico: 0,
          aluminio: 0,
          polvora: 0,
          ferro: 0,
          sd: 0,
        });
      }
      const conta = bancoDeFarm.get(interaction.user.id);
      conta[farm.itemKey] += parseInt(farm.qtd);
      bancoDeFarm.set(interaction.user.id, conta);

      await m.delete().catch(() => {});
      await interaction.deleteReply().catch(() => {});
      await interaction.message.delete().catch(() => {});
      await interaction.followUp({
        content: `✅ Farm de **${farm.qtd}x ${farm.itemNome}** registrado com sucesso!`,
        ephemeral: true,
      });
      farmEmAndamento.delete(interaction.channel.id);
    });
  }
};

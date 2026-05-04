const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  RoleSelectMenuBuilder,
} = require("discord.js");

const {
  CANAL_AVALIACAO_ID,
  CANAL_LOG_PROMO_ID,
  COR_PADRAO,
  COR_PRETO,
} = require("../../config/constants");

const {
  sessoesDeRegistro,
  farmEmAndamento,
  bancoDeFarm,
  sessoesVenda,
  sessoesUpar,
  configFarm,
} = require("../../database/memoryDb");

const { safeNickname } = require("../../utils/nickHelpers");
const { criarSalaFarm } = require("../../utils/farmHelpers");
const cargosUpar = require("../../config/cargosUpar");

module.exports = async (interaction, client) => {
  // --- STRING SELECT MENUS ---
  if (interaction.isStringSelectMenu()) {
    const customId = interaction.customId;

    if (customId === "selecionar_recrutador") {
      const staffId = interaction.values[0];
      const dados = sessoesDeRegistro.get(interaction.user.id);
      if (dados) {
        dados.recrutadorId = staffId;
        sessoesDeRegistro.set(interaction.user.id, dados);
      }

      const canalAvaliacao =
        interaction.guild.channels.cache.get(CANAL_AVALIACAO_ID);
      if (canalAvaliacao) {
        const embed = new EmbedBuilder()
          .setColor(COR_PRETO)
          .setTitle("📋 NOVA AVALIAÇÃO DE REGISTRO")
          .addFields(
            {
              name: "Candidato",
              value: `<@${interaction.user.id}>`,
              inline: true,
            },
            { name: "ID", value: dados?.id || "---", inline: true },
            {
              name: "Telefone",
              value: dados?.telefone || "---",
              inline: true,
            },
            { name: "Recrutador", value: `<@${staffId}>` },
          );

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`aprovar_${interaction.user.id}`)
            .setLabel("Aprovar")
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId(`negar_${interaction.user.id}`)
            .setLabel("Negar")
            .setStyle(ButtonStyle.Danger),
        );

        await canalAvaliacao.send({ embeds: [embed], components: [row] });
      }
      await interaction.update({
        content: "Seus dados foram enviados para avaliação. Aguarde.",
        components: [],
      });
    }

    if (customId === "menu_ticket") {
      const tipo = interaction.values[0];
      if (tipo === "abrir_farm") {
        const canal = await criarSalaFarm(
          interaction.guild,
          interaction.member,
          configFarm,
        );

        await interaction.reply({
          content: `✅ Sua sala de farm foi criada: ${canal}`,
          ephemeral: true,
        });
      }
    }

    if (customId === "menu_produtos_farm") {
      const itemKey = interaction.values[0];
      farmEmAndamento.set(interaction.channel.id, {
        itemKey: itemKey,
        itemNome: configFarm[itemKey].nome,
        userId: interaction.user.id,
      });

      const modal = new ModalBuilder()
        .setCustomId("modal_qtd_farm")
        .setTitle("Quantidade do Farm");
      const input = new TextInputBuilder()
        .setCustomId("qtd_farm")
        .setLabel("Quantidade")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    if (customId === "menu_vendas_produtos") {
      const prodId = interaction.values[0];
      const sessao = sessoesVenda.get(interaction.user.id);
      if (!sessao)
        return interaction.reply({
          content: "Sessão não encontrada.",
          ephemeral: true,
        });

      sessao.itens.push({ key: prodId, quantidade: 0 });

      const modal = new ModalBuilder()
        .setCustomId("modal_venda_qtd")
        .setTitle("Quantidade do Produto");
      const input = new TextInputBuilder()
        .setCustomId("venda_qtd")
        .setLabel("Quantidade")
        .setStyle(TextInputStyle.Short)
        .setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(input));
      await interaction.showModal(modal);
    }

    if (customId === "select_role_upar") {
      const roleId = interaction.values[0];
      const sessao = sessoesUpar.get(interaction.user.id);
      const targetMember = await interaction.guild.members
        .fetch(sessao?.targetId)
        .catch(() => null);

      if (targetMember) {
        const rolesToRemove = Object.keys(cargosUpar);
        await targetMember.roles.remove(rolesToRemove).catch(console.error);
        await targetMember.roles.add(roleId).catch(console.error);

        const metadata = cargosUpar[roleId];
        const sigla = metadata?.sigla || "MB";

        const nickBase = targetMember.nickname || targetMember.user.username;
        const nomeLimpo = nickBase.includes("|")
          ? nickBase
              .split("|")[0]
              .replace(/\[.*?\]/, "")
              .trim()
          : nickBase.replace(/\[.*?\]/, "").trim();

        const newNick = safeNickname(
          `[${sigla}] ${nomeLimpo} | ${targetMember.id}`,
        );
        await targetMember.setNickname(newNick).catch(console.error);

        const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_PROMO_ID);
        if (logChannel) {
          let titulo = "";
          let texto = "";
          let cor = "";

          if (sessao.tipo === "PROMOÇÃO") {
            titulo = "🎊 PROMOÇÃO NA TURQUIA";
            cor = "#57F287";
            texto =
              "É com grande satisfação que celebramos sua merecida promoção, resultado de sua dedicação exemplar e desempenho consistente.\nSua trajetória demonstra profissionalismo, compromisso e excelência, qualidades que o destacam e inspiram todos ao seu redor.\nDesejamos pleno sucesso nesta nova etapa, certos de que continuará alcançando conquistas ainda mais significativas.";
          } else {
            titulo = "📉 RECLASSIFICAÇÃO NA TURQUIA";
            cor = "#ED4245";
            texto =
              "Informamos, de forma respeitosa, a redefinição de sua posição, medida adotada após criteriosa avaliação interna e alinhamento estratégico.\nA decisão não invalida suas contribuições, mas busca promover um melhor enquadramento às necessidades atuais da organização.\nSeguimos confiantes em sua capacidade de adaptação e contamos com seu profissionalismo para esta nova etapa.";
          }

          const embed = new EmbedBuilder()
            .setColor(cor)
            .setTitle(titulo)
            .setDescription(
              `**Membro:** <@${targetMember.id}>\n**Novo Cargo:** <@&${roleId}>\n\n${texto}`,
            )
            .setThumbnail(targetMember.user.displayAvatarURL())
            .setTimestamp();

          await logChannel.send({
            content: `<@${targetMember.id}>`,
            embeds: [embed],
          });
        }
        await interaction.update({
          content: `✅ Membro atualizado para **${metadata?.nome || "---"}**`,
          components: [],
        });
      }
      sessoesUpar.delete(interaction.user.id);
    }
  }

  // --- USER SELECT MENUS ---
  if (interaction.isUserSelectMenu()) {
    if (interaction.customId === "selecionar_jogador_edit_farm") {
      const userId = interaction.values[0];

      let conta = bancoDeFarm.get(userId);
      if (!conta) {
        conta = { plastico: 0, aluminio: 0, polvora: 0, ferro: 0, sd: 0 };
        bancoDeFarm.set(userId, conta);
      }

      const embedStatus = new EmbedBuilder()
        .setTitle(`📊 Farm Atual: <@${userId}>`)
        .setColor(COR_PADRAO)
        .setDescription(
          `Aqui está o total que o jogador já entregou:\n\n📦 **${configFarm.plastico.nome}:** ${conta.plastico}\n📦 **${configFarm.aluminio.nome}:** ${conta.aluminio}\n📦 **${configFarm.polvora.nome}:** ${conta.polvora}\n📦 **${configFarm.ferro.nome}:** ${conta.ferro}\n📦 **${configFarm.sd.nome}:** ${conta.sd}`,
        );

      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`abrir_modal_valores_edit_${userId}`)
          .setLabel("✏️ Editar Quantidades")
          .setStyle(ButtonStyle.Primary),
      );

      await interaction.reply({
        embeds: [embedStatus],
        components: [row],
        ephemeral: true,
      });
    }

    if (interaction.customId === "select_user_upar") {
      const targetId = interaction.values[0];
      const sessao = sessoesUpar.get(interaction.user.id);
      if (sessao) sessao.targetId = targetId;

      const roleSelect = new RoleSelectMenuBuilder()
        .setCustomId("select_role_upar")
        .setPlaceholder("Selecione o novo cargo...");
      await interaction.update({
        content: `Membro selecionado: <@${targetId}>. Agora selecione o novo cargo:`,
        components: [new ActionRowBuilder().addComponents(roleSelect)],
      });
    }
  }

  // --- ROLE SELECT MENUS ---
  if (interaction.isRoleSelectMenu()) {
      if (interaction.customId === "select_role_upar") {
          // Reusing the same logic as string select if needed,
          // but usually role select gives back interaction.values with role IDs.
          // The current interactionHandler used RoleSelectMenuBuilder but handled it in interaction.values[0]
          // within interaction.isStringSelectMenu() by mistake or by generic handling.
          // Actually, interaction.isStringSelectMenu() wouldn't trigger for RoleSelectMenu.
          // Let's fix that.

          const roleId = interaction.values[0];
          const sessao = sessoesUpar.get(interaction.user.id);
          const targetMember = await interaction.guild.members
            .fetch(sessao?.targetId)
            .catch(() => null);

          if (targetMember) {
            const rolesToRemove = Object.keys(cargosUpar);
            await targetMember.roles.remove(rolesToRemove).catch(console.error);
            await targetMember.roles.add(roleId).catch(console.error);

            const metadata = cargosUpar[roleId];
            const sigla = metadata?.sigla || "MB";

            const nickBase = targetMember.nickname || targetMember.user.username;
            const nomeLimpo = nickBase.includes("|")
              ? nickBase
                  .split("|")[0]
                  .replace(/\[.*?\]/, "")
                  .trim()
              : nickBase.replace(/\[.*?\]/, "").trim();

            const newNick = safeNickname(
              `[${sigla}] ${nomeLimpo} | ${targetMember.id}`,
            );
            await targetMember.setNickname(newNick).catch(console.error);

            const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_PROMO_ID);
            if (logChannel) {
              let titulo = "";
              let texto = "";
              let cor = "";

              if (sessao.tipo === "PROMOÇÃO") {
                titulo = "🎊 PROMOÇÃO NA TURQUIA";
                cor = "#57F287";
                texto =
                  "É com grande satisfação que celebramos sua merecida promoção, resultado de sua dedicação exemplar e desempenho consistente.\nSua trajetória demonstra profissionalismo, compromisso e excelência, qualidades que o destacam e inspiram todos ao seu redor.\nDesejamos pleno sucesso nesta nova etapa, certos de que continuará alcançando conquistas ainda mais significativas.";
              } else {
                titulo = "📉 RECLASSIFICAÇÃO NA TURQUIA";
                cor = "#ED4245";
                texto =
                  "Informamos, de forma respeitosa, a redefinição de sua posição, medida adotada após criteriosa avaliação interna e alinhamento estratégico.\nA decisão não invalida suas contribuições, mas busca promover um melhor enquadramento às necessidades atuais da organização.\nSeguimos confiantes em sua capacidade de adaptação e contamos com seu profissionalismo para esta nova etapa.";
              }

              const embed = new EmbedBuilder()
                .setColor(cor)
                .setTitle(titulo)
                .setDescription(
                  `**Membro:** <@${targetMember.id}>\n**Novo Cargo:** <@&${roleId}>\n\n${texto}`,
                )
                .setThumbnail(targetMember.user.displayAvatarURL())
                .setTimestamp();

              await logChannel.send({
                content: `<@${targetMember.id}>`,
                embeds: [embed],
              });
            }
            await interaction.update({
              content: `✅ Membro atualizado para **${metadata?.nome || "---"}**`,
              components: [],
            });
          }
          sessoesUpar.delete(interaction.user.id);
      }
  }
};

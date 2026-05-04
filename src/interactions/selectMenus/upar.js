const { RoleSelectMenuBuilder, ActionRowBuilder, EmbedBuilder } = require("discord.js");
const { sessoesUpar } = require("../../database/memoryDb");
const { CANAL_LOG_PROMO_ID } = require("../../config/constants");
const { safeNickname } = require("../../utils/nickHelpers");
const cargosUpar = require("../../config/cargosUpar");

module.exports = [
  {
    customId: "select_user_upar",
    async execute(interaction) {
      const targetId = interaction.values[0];
      const sessao = sessoesUpar.get(interaction.user.id);
      if (sessao) sessao.targetId = targetId;
      const roleSelect = new RoleSelectMenuBuilder().setCustomId("select_role_upar").setPlaceholder("Selecione o novo cargo...");
      await interaction.update({ content: `Membro selecionado: <@${targetId}>. Agora selecione o novo cargo:`, components: [new ActionRowBuilder().addComponents(roleSelect)] });
    }
  },
  {
    customId: "select_role_upar",
    async execute(interaction) {
      const roleId = interaction.values[0];
      const sessao = sessoesUpar.get(interaction.user.id);
      const targetMember = await interaction.guild.members.fetch(sessao?.targetId).catch(() => null);
      if (targetMember) {
        const rolesToRemove = Object.keys(cargosUpar);
        await targetMember.roles.remove(rolesToRemove).catch(console.error);
        await targetMember.roles.add(roleId).catch(console.error);
        const metadata = cargosUpar[roleId];
        const sigla = metadata?.sigla || "MB";
        const nickBase = targetMember.nickname || targetMember.user.username;
        const nomeLimpo = nickBase.includes("|") ? nickBase.split("|")[0].replace(/\[.*?\]/, "").trim() : nickBase.replace(/\[.*?\]/, "").trim();
        const newNick = safeNickname(`[${sigla}] ${nomeLimpo} | ${targetMember.id}`);
        await targetMember.setNickname(newNick).catch(console.error);
        const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_PROMO_ID);
        if (logChannel) {
          let titulo = ""; let texto = ""; let cor = "";
          if (sessao.tipo === "PROMOÇÃO") {
            titulo = "🎊 PROMOÇÃO NA TURQUIA"; cor = "#57F287";
            texto = "É com grande satisfação que celebramos sua merecida promoção, resultado de sua dedicação exemplar e desempenho consistente.\nSua trajetória demonstra profissionalismo, compromisso e excelência, qualidades que o destacam e inspiram todos ao seu redor.\nDesejamos pleno sucesso nesta nova etapa, certos de que continuará alcançando conquistas ainda mais significativas.";
          } else {
            titulo = "📉 RECLASSIFICAÇÃO NA TURQUIA"; cor = "#ED4245";
            texto = "Informamos, de forma respeitosa, a redefinição de sua posição, medida adotada após criteriosa avaliação interna e alinhamento estratégico.\nA decisão não invalida suas contribuições, mas busca promover um melhor enquadramento às necessidades atuais da organização.\nSeguimos confiantes em sua capacidade de adaptação e contamos com seu profissionalismo para esta nova etapa.";
          }
          const embed = new EmbedBuilder().setColor(cor).setTitle(titulo).setDescription(`**Membro:** <@${targetMember.id}>\n**Novo Cargo:** <@&${roleId}>\n\n${texto}`).setThumbnail(targetMember.user.displayAvatarURL()).setTimestamp();
          await logChannel.send({ content: `<@${targetMember.id}>`, embeds: [embed] });
        }
        await interaction.update({ content: `✅ Membro atualizado para **${metadata?.nome || "---"}**`, components: [] });
      }
      sessoesUpar.delete(interaction.user.id);
    }
  }
];

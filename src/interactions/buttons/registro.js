const { EmbedBuilder, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");
const { CARGO_AVIAOZINHO_ID, CARGO_MEMBRO_EXTRA_ID, CARGO_ENTRADA_ID, CANAL_LOG_REGISTRO_ID } = require("../../config/constants");
const { sessoesDeRegistro, configFarm } = require("../../database/memoryDb");
const { safeNickname } = require("../../utils/nickHelpers");
const { criarSalaFarm } = require("../../utils/farmHelpers");

module.exports = [
  {
    customId: "iniciar_registro",
    async execute(interaction) {
      const modal = new ModalBuilder().setCustomId("modal_registro").setTitle("Formulário de Registro");
      const nomeInput = new TextInputBuilder().setCustomId("reg_nome").setLabel("Nome").setStyle(TextInputStyle.Short).setRequired(true);
      const idInput = new TextInputBuilder().setCustomId("reg_id").setLabel("ID").setStyle(TextInputStyle.Short).setRequired(true);
      const telefoneInput = new TextInputBuilder().setCustomId("reg_telefone").setLabel("Telefone").setStyle(TextInputStyle.Short).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(nomeInput), new ActionRowBuilder().addComponents(idInput), new ActionRowBuilder().addComponents(telefoneInput));
      await interaction.showModal(modal);
    }
  },
  {
    customId: "aprovar",
    async execute(interaction) {
      const userId = interaction.customId.split("_")[1];
      const targetMember = await interaction.guild.members.fetch(userId).catch(() => null);
      if (!targetMember) return interaction.reply({ content: "Membro não encontrado.", ephemeral: true });

      const dados = sessoesDeRegistro.get(userId);
      if (!dados) return interaction.reply({ content: "Dados do registro não encontrados.", ephemeral: true });

      const nick = safeNickname(`[AV] ${dados.nome} | ${dados.id}`);
      await targetMember.setNickname(nick).catch(console.error);
      await targetMember.roles.add([CARGO_AVIAOZINHO_ID, CARGO_MEMBRO_EXTRA_ID]).catch(console.error);
      await targetMember.roles.remove(CARGO_ENTRADA_ID).catch(console.error);
      await criarSalaFarm(interaction.guild, targetMember, configFarm).catch(console.error);

      const embedLog = new EmbedBuilder().setColor("#00FF00").setTitle("✅ REGISTRO APROVADO")
        .addFields(
          { name: "Membro", value: `<@${userId}>`, inline: true },
          { name: "Nome", value: dados.nome || "---", inline: true },
          { name: "ID", value: dados.id || "---", inline: true },
          { name: "Telefone", value: dados.telefone || "---", inline: true },
          { name: "Recrutador", value: dados.recrutadorId ? `<@${dados.recrutadorId}>` : "---", inline: true },
          { name: "Aprovado Por", value: `<@${interaction.user.id}>`, inline: true }
        ).setTimestamp();

      const logCanal = interaction.guild.channels.cache.get(CANAL_LOG_REGISTRO_ID);
      if (logCanal && logCanal.id !== interaction.channel.id) await logCanal.send({ embeds: [embedLog] });

      await interaction.update({ content: null, embeds: [embedLog], components: [] });
      sessoesDeRegistro.delete(userId);
    }
  },
  {
    customId: "negar",
    async execute(interaction) {
      const userId = interaction.customId.split("_")[1];
      const dados = sessoesDeRegistro.get(userId);
      const embedLog = new EmbedBuilder().setColor("#FF0000").setTitle("❌ REGISTRO NEGADO")
        .addFields(
          { name: "Membro", value: `<@${userId}>`, inline: true },
          { name: "Nome", value: dados?.nome || "---", inline: true },
          { name: "ID", value: dados?.id || "---", inline: true },
          { name: "Telefone", value: dados?.telefone || "---", inline: true },
          { name: "Recrutador", value: dados?.recrutadorId ? `<@${dados.recrutadorId}>` : "---", inline: true },
          { name: "Negado Por", value: `<@${interaction.user.id}>`, inline: true }
        ).setTimestamp();

      const logCanal = interaction.guild.channels.cache.get(CANAL_LOG_REGISTRO_ID);
      if (logCanal && logCanal.id !== interaction.channel.id) await logCanal.send({ embeds: [embedLog] });

      await interaction.update({ content: null, embeds: [embedLog], components: [] });
      sessoesDeRegistro.delete(userId);
    }
  }
];

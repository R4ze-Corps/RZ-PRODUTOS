const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, UserSelectMenuBuilder, PermissionFlagsBits } = require("discord.js");
const { bancoDeFarm, configFarm, farmEmAndamento } = require("../../database/memoryDb");
const { CANAL_LOG_FARM_ID, COR_PADRAO } = require("../../config/constants");

module.exports = [
  {
    customId: "ver_entregas",
    async execute(interaction) {
      const conta = bancoDeFarm.get(interaction.user.id) || { plastico: 0, aluminio: 0, polvora: 0, ferro: 0, sd: 0 };
      const embedStatus = new EmbedBuilder().setTitle("📊 Seu Histórico de Entregas").setColor(COR_PADRAO)
        .setDescription(`Aqui está o total que você já entregou:\n\n📦 **${configFarm.plastico.nome}:** ${conta.plastico} / ${configFarm.plastico.meta}\n📦 **${configFarm.aluminio.nome}:** ${conta.aluminio} / ${configFarm.aluminio.meta}\n📦 **${configFarm.polvora.nome}:** ${conta.polvora} / ${configFarm.polvora.meta}\n📦 **${configFarm.ferro.nome}:** ${conta.ferro} / ${configFarm.ferro.meta}\n📦 **${configFarm.sd.nome}:** ${conta.sd} / ${configFarm.sd.meta}`);
      await interaction.reply({ embeds: [embedStatus], ephemeral: true });
    }
  },
  {
    customId: "configurar_farm",
    async execute(interaction) {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild)) return interaction.reply({ content: "❌ Apenas administradores podem configurar o painel.", ephemeral: true });
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("abrir_modal_metas").setLabel("⚙️ Produtos e Metas").setStyle(ButtonStyle.Primary),
        new ButtonBuilder().setCustomId("abrir_modal_editar_farm").setLabel("✏️ Editar Farm de Jogador").setStyle(ButtonStyle.Secondary)
      );
      await interaction.reply({ content: "O que você deseja configurar?", components: [row], ephemeral: true });
    }
  },
  {
    customId: "abrir_modal_metas",
    async execute(interaction) {
      const modal = new ModalBuilder().setCustomId("modal_config_farm").setTitle("Configurar Produtos e Metas");
      const in1 = new TextInputBuilder().setCustomId("cfg_plastico").setLabel("Plástico (Nome | Meta)").setStyle(TextInputStyle.Short).setValue(`${configFarm.plastico.nome} | ${configFarm.plastico.meta}`).setRequired(true);
      const in2 = new TextInputBuilder().setCustomId("cfg_aluminio").setLabel("Alumínio (Nome | Meta)").setStyle(TextInputStyle.Short).setValue(`${configFarm.aluminio.nome} | ${configFarm.aluminio.meta}`).setRequired(true);
      const in3 = new TextInputBuilder().setCustomId("cfg_polvora").setLabel("Pólvora (Nome | Meta)").setStyle(TextInputStyle.Short).setValue(`${configFarm.polvora.nome} | ${configFarm.polvora.meta}`).setRequired(true);
      const in4 = new TextInputBuilder().setCustomId("cfg_ferro").setLabel("Ferro (Nome | Meta)").setStyle(TextInputStyle.Short).setValue(`${configFarm.ferro.nome} | ${configFarm.ferro.meta}`).setRequired(true);
      const in5 = new TextInputBuilder().setCustomId("cfg_sd").setLabel("Cartão SD (Nome | Meta)").setStyle(TextInputStyle.Short).setValue(`${configFarm.sd.nome} | ${configFarm.sd.meta}`).setRequired(true);
      modal.addComponents(new ActionRowBuilder().addComponents(in1), new ActionRowBuilder().addComponents(in2), new ActionRowBuilder().addComponents(in3), new ActionRowBuilder().addComponents(in4), new ActionRowBuilder().addComponents(in5));
      await interaction.showModal(modal);
    }
  },
  {
    customId: "abrir_modal_editar_farm",
    async execute(interaction) {
      const selectMenu = new UserSelectMenuBuilder().setCustomId("selecionar_jogador_edit_farm").setPlaceholder("Selecione o jogador");
      await interaction.reply({ content: "Selecione de qual jogador você deseja editar o farm:", components: [new ActionRowBuilder().addComponents(selectMenu)], ephemeral: true });
    }
  },
  {
    customId: "abrir_modal_valores_edit",
    async execute(interaction) {
      const userId = interaction.customId.replace("abrir_modal_valores_edit_", "");
      const conta = bancoDeFarm.get(userId) || { plastico: 0, aluminio: 0, polvora: 0, ferro: 0, sd: 0 };
      const modalEdit = new ModalBuilder().setCustomId(`edit_farm_vals_${userId}`).setTitle("Editar Valores de Farm");
      const in1 = new TextInputBuilder().setCustomId("val_plastico").setLabel(configFarm.plastico.nome).setStyle(TextInputStyle.Short).setValue(String(conta.plastico)).setRequired(true);
      const in2 = new TextInputBuilder().setCustomId("val_aluminio").setLabel(configFarm.aluminio.nome).setStyle(TextInputStyle.Short).setValue(String(conta.aluminio)).setRequired(true);
      const in3 = new TextInputBuilder().setCustomId("val_polvora").setLabel(configFarm.polvora.nome).setStyle(TextInputStyle.Short).setValue(String(conta.polvora)).setRequired(true);
      const in4 = new TextInputBuilder().setCustomId("val_ferro").setLabel(configFarm.ferro.nome).setStyle(TextInputStyle.Short).setValue(String(conta.ferro)).setRequired(true);
      const in5 = new TextInputBuilder().setCustomId("val_sd").setLabel(configFarm.sd.nome).setStyle(TextInputStyle.Short).setValue(String(conta.sd)).setRequired(true);
      modalEdit.addComponents(new ActionRowBuilder().addComponents(in1), new ActionRowBuilder().addComponents(in2), new ActionRowBuilder().addComponents(in3), new ActionRowBuilder().addComponents(in4), new ActionRowBuilder().addComponents(in5));
      await interaction.showModal(modalEdit);
    }
  },
  {
    customId: "finalizar_farm",
    async execute(interaction) {
      const farm = farmEmAndamento.get(interaction.channel.id);
      if (!farm) return interaction.reply({ content: "Farm não encontrado.", ephemeral: true });
      await interaction.reply("Envie um print do farm para finalizar o registro.");
      const filter = (m) => m.author.id === interaction.user.id && m.attachments.size > 0;
      const collector = interaction.channel.createMessageCollector({ filter, time: 60000, max: 1 });
      collector.on("collect", async (m) => {
        const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_FARM_ID);
        if (logChannel) {
          const embed = new EmbedBuilder().setColor("#00FF00").setTitle("🚜 NOVO FARM REGISTRADO")
            .addFields({ name: "Membro", value: `<@${interaction.user.id}>`, inline: true }, { name: "Produto", value: farm.itemNome, inline: true }, { name: "Quantidade", value: farm.qtd.toString(), inline: true })
            .setImage(m.attachments.first().url).setTimestamp();
          await logChannel.send({ embeds: [embed] });
        }
        if (!bancoDeFarm.has(interaction.user.id)) bancoDeFarm.set(interaction.user.id, { plastico: 0, aluminio: 0, polvora: 0, ferro: 0, sd: 0 });
        const conta = bancoDeFarm.get(interaction.user.id);
        conta[farm.itemKey] += parseInt(farm.qtd);
        bancoDeFarm.set(interaction.user.id, conta);
        await m.delete().catch(() => {});
        await interaction.deleteReply().catch(() => {});
        await interaction.message.delete().catch(() => {});
        await interaction.followUp({ content: `✅ Farm de **${farm.qtd}x ${farm.itemNome}** registrado com sucesso!`, ephemeral: true });
        farmEmAndamento.delete(interaction.channel.id);
      });
    }
  }
];

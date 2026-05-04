const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require("discord.js");
const { CATEGORIA_SUPORTE_ID, COR_PRETO, CANAL_LOG_TRANSCRIPT_ID } = require("../../config/constants");

module.exports = [
  {
    customId: "btn_abrir_suporte",
    async execute(interaction) {
      const canal = await interaction.guild.channels.create({
        name: `suporte-${interaction.user.username}`,
        type: ChannelType.GuildText,
        parent: CATEGORIA_SUPORTE_ID,
        permissionOverwrites: [
          { id: interaction.guild.id, deny: [PermissionFlagsBits.ViewChannel] },
          { id: interaction.user.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages] }
        ]
      });
      const embed = new EmbedBuilder().setColor(COR_PRETO).setTitle("Atendimento").setDescription("Aguarde um membro da gerência. Para fechar, clique no botão abaixo.");
      const row = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("btn_fechar_suporte").setLabel("Fechar Suporte").setStyle(ButtonStyle.Danger));
      await canal.send({ content: `<@${interaction.user.id}>`, embeds: [embed], components: [row] });
      await interaction.reply({ content: `Canal criado: ${canal}`, ephemeral: true });
    }
  },
  {
    customId: "btn_fechar_suporte",
    async execute(interaction) {
      const canal = interaction.channel;
      const logs = await canal.messages.fetch();
      let transcript = `Transcript do canal ${canal.name}\n\n`;
      logs.reverse().forEach((m) => { transcript += `[${m.createdAt.toLocaleString()}] ${m.author.tag}: ${m.content}\n`; });
      const buffer = Buffer.from(transcript, "utf-8");
      const attachment = new AttachmentBuilder(buffer, { name: "transcript.txt" });
      const logChannel = interaction.guild.channels.cache.get(CANAL_LOG_TRANSCRIPT_ID);
      if (logChannel) await logChannel.send({ content: `Suporte de <@${interaction.user.id}> fechado.`, files: [attachment] });
      await interaction.reply("O canal será deletado em 5 segundos...");
      setTimeout(() => canal.delete(), 5000);
    }
  }
];

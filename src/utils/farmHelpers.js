const { EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require("discord.js");
const { CATEGORIA_FARM_ID, COR_PADRAO } = require("../config/constants");

async function criarSalaFarm(guild, member, configFarm) {
  const nomeFormatado = member.displayName.replace(/\s+/g, "").split("|")[0] || member.user.username;
  const idInGame = member.displayName.includes("|") ? member.displayName.split("|")[1].trim() : "0000";

  const canal = await guild.channels.create({
    name: `⭐・${nomeFormatado.toLowerCase()}-${idInGame}`,
    type: ChannelType.GuildText,
    parent: CATEGORIA_FARM_ID,
    permissionOverwrites: [
      {
        id: guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  const embed = new EmbedBuilder()
    .setColor(COR_PADRAO)
    .setTitle("🚜 Painel de Registro de Farm")
    .setDescription(
      `Olá <@${member.id}>, bem-vindo(a) à sua sala de farm!\n\n` +
      "**Como registrar seu farm:**\n" +
      "1️⃣ Selecione na lista abaixo o produto que você farmou.\n" +
      "2️⃣ Preencha a quantidade na janela que vai abrir.\n" +
      "3️⃣ Envie o print da entrega no chat e finalize.\n\n" +
      "Acompanhe seu progresso clicando em \"Ver Entregas\".\n\n" +
      "🎯 **Metas de Farm:**\n" +
      `📦 **${configFarm.plastico.nome}:** Meta ${configFarm.plastico.meta}\n` +
      `📦 **${configFarm.aluminio.nome}:** Meta ${configFarm.aluminio.meta}\n` +
      `📦 **${configFarm.polvora.nome}:** Meta ${configFarm.polvora.meta}\n` +
      `📦 **${configFarm.ferro.nome}:** Meta ${configFarm.ferro.meta}\n` +
      `📦 **${configFarm.sd.nome}:** Meta ${configFarm.sd.meta}`
    )
    .setThumbnail("https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/logo-png(1).png")
    .setImage("https://r2.fivemanage.com/vLUsF9vzqBOo7DSFHERFX/Gemini_Generated_Image_nenl89nenl89nenl.png");

  const menu = new StringSelectMenuBuilder()
    .setCustomId("menu_produtos_farm")
    .setPlaceholder("📦 Selecione o produto que você farmou")
    .addOptions(
      Object.entries(configFarm).map(([key, val]) => ({
        label: val.nome,
        value: key,
      }))
    );

  const rowMenu = new ActionRowBuilder().addComponents(menu);

  const rowButtons = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("ver_entregas")
      .setLabel("📊 Ver Entregas")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("configurar_farm")
      .setLabel("⚙️ Configurar")
      .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
      .setCustomId("fechar_ticket")
      .setLabel("🔒 Fechar")
      .setStyle(ButtonStyle.Danger)
  );

  await canal.send({
    content: `<@${member.id}>`,
    embeds: [embed],
    components: [rowMenu, rowButtons],
  });

  return canal;
}

module.exports = { criarSalaFarm };

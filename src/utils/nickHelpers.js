function safeNickname(nick) {
  if (nick.length > 32) {
    // Tenta manter o ID se possível (ex: "[SIGLA] Nome... | ID")
    if (nick.includes("|")) {
        const partes = nick.split("|");
        const id = partes[partes.length - 1].trim();
        const prefixo = nick.substring(0, nick.lastIndexOf("|"));
        const disponivel = 32 - (id.length + 3); // 32 - (" | " + id)
        return prefixo.substring(0, disponivel).trim() + " | " + id;
    }
    return nick.substring(0, 32);
  }
  return nick;
}

module.exports = {
  safeNickname
};

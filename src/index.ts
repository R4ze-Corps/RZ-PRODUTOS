import { env } from "#env";
import { bootstrap } from "@constatic/base";
import ck from "chalk";

console.clear();
console.log(ck.blue("★ Bot de Produtos - Inicializando..."));

process.on('uncaughtException', (error) => {
    console.error(ck.redBright("🔥 [ERRO GLOBAL] Exceção não tratada:"), error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error(ck.redBright("⚠️ [ERRO GLOBAL] Promessa rejeitada não tratada:"), reason, promise);
});

await bootstrap({
    meta: import.meta,
    env
});

console.log(ck.green("☰ Variáveis de ambiente validadas ✓"));
console.log(ck.green("\n◎ Bot online e pronto!"));

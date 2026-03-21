const { createMajsoulConnection } = require("../index");
const fs = require("fs");

const GAME_UUID = "";

async function main() {
  const conn = await createMajsoulConnection();

  const log = await conn.rpcCall(".lq.Lobby.fetchGameRecord", {
    game_uuid: GAME_UUID,
    client_version_string: conn.clientVersionString,
  });

  fs.writeFileSync(`${GAME_UUID}.json`, JSON.stringify(log, null, 2), "utf8");
  console.log(`保存しました: ${GAME_UUID}.json`);

  conn.close();
}

main().catch(console.error);

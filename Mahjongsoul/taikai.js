const { createMajsoulConnection } = require("./login");
const fs = require("fs");
const p = require("path");

async function main() {
  const conn = await createMajsoulConnection();

  const contestInfo = await conn.rpcCall(".lq.Lobby.fetchCustomizedContestByContestId", {
    contest_id: process.env.contest,
  });

  const uniqueId = contestInfo.contest_info?.unique_id;
  if (!uniqueId) {
    console.error("unique_idが取得できませんでした");
    conn.close();
    return;
  }

  const records = await conn.rpcCall(".lq.Lobby.fetchCustomizedContestGameRecords", {
    unique_id: uniqueId
  });

  fs.writeFileSync(p.join(__dirname, "contest_records.json"), JSON.stringify(records, null, 2), "utf8");  // ← 修正
  console.log("保存しました: contest_records.json");
  console.log("取得件数:", records.record_list?.length || 0);

  conn.close();
}

function point(){
    const record = JSON.parse(fs.readFileSync(p.join(__dirname, "contest_records.json")));  // ← 修正
    const HOM = JSON.parse(fs.readFileSync(p.join(__dirname, "HOMdata_temp.json")));        // ← 修正

    for(let i of record.record_list){
        const seat = [];
        for(let j of i.accounts){
            seat[j.seat] = j.nickname;
        }
        for(let k of i.result.players){
            HOM.point[seat[k.seat]] += Number(k.total_point) / 1000;
        }
    }

    for(let [i, j] of Object.entries(HOM.teams)){
        let teamp = 0
        for(let k of j){
            teamp += HOM.point[k]
        }
        HOM["team-point"][i] = teamp
    }

    fs.writeFileSync(p.join(__dirname, "HOMdata.json"), JSON.stringify(HOM, null, 2));
    const HOMd = JSON.parse(fs.readFileSync(p.join(__dirname, "HOMdata.json")));
    console.log("data更新成功！")
}

async function taikai(){
    await main();
    point();
}

module.exports = { taikai };
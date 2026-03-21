const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const teamrole = new Set(["The Anchors", "Solid", "TEAM RODEN", "NEXUS ZERO", "Polaris", "Mistral-Guerrero", "冷勝サクラルークズ", "零芯ヴォルテックス"]);

module.exports = {
  data: new SlashCommandBuilder()
    .setName('entry')
    .setDescription('対戦結果を入力します')
    .addIntegerOption(option =>
      option.setName('round').setDescription('節').setRequired(true)
    )
    .addStringOption(option =>
      option.setName('table').setDescription('卓').setRequired(true)
        .addChoices(
          { name: 'A卓', value: 'A' },
          { name: 'B卓', value: 'B' },
        )
    )
    .addIntegerOption(option =>
      option.setName('match').setDescription('試合').setRequired(true)
        .addChoices(
          { name: '第1試合', value: 1 },
          { name: '第2試合', value: 2 },
        )
    )
    .addUserOption(option =>
      option.setName('user').setDescription('対象のユーザー').setRequired(true)
    ),

  async execute(interaction) {
    // 最初にdeferReplyで応答を保留（3秒の制限を15分に延長）
    await interaction.deferReply({ ephemeral: true });

    const round = String(interaction.options.getInteger('round'));
    const table = interaction.options.getString('table');
    const match = String(interaction.options.getInteger('match'));
    const user = interaction.options.getUser('user');
    const guild = await interaction.client.guilds.fetch(interaction.guildId);
    const member = await guild.members.fetch(user.id);
    
    const name = user.id;
    const team = member?.roles.cache.find(role => teamrole.has(role.name))?.name ?? null;

    if (!team) {
      await interaction.editReply({ content: 'チームロールが見つかりません。' });
      return;
    }

    const entries = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'entries.json')));

    entries[round] ??= {};
    entries[round][table] ??= {};
    entries[round][table][match] ??= [];

    const entryp = entries[round][table][match];
    const exist = entryp.findIndex(e => e.team === team);
    if (exist !== -1) {
      entryp[exist] = { team, name };
    } else {
      entryp.push({ team, name });
    }

    fs.writeFileSync(path.join(__dirname, '..', 'entries.json'), JSON.stringify(entries, null, 2));

    if (entryp.length === 4) {
      const HOM = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'Mahjongsoul', 'HOMdata.json')));

      const now = new Date();
      const options = { timeZone: 'Asia/Tokyo', month: 'numeric', day: 'numeric', weekday: 'short' };
      const parts = new Intl.DateTimeFormat('ja-JP', options).formatToParts(now);

      const month   = parts.find(p => p.type === 'month').value;
      const day     = parts.find(p => p.type === 'day').value;
      const weekday = parts.find(p => p.type === 'weekday').value;

      const infos = [];
      for (let i of entryp) {
        const entryt  = i.team;
        const entryid = i.name;
        const entryn  = HOM['Id'][entryid];
        const rpoint = HOM['point'][entryn];
        const point = rpoint >= 0 ? `+${rpoint.toFixed(1)}` : `▲${Math.abs(rpoint).toFixed(1)}`;
        const ranking = (Object.entries(HOM['point']).sort(([, a], [, b]) => b - a).findIndex(([, p]) => p == HOM["point"][entryn]) + 1) || null;
        
        infos.push([entryt, entryid, ranking, point]);
      }

      // 4人揃ったら全員に見える形でfollowUp
      await interaction.deleteReply();
      await interaction.followUp({
        content:
          `🀄${month}/${day}(${weekday}) HOM.LEAGUE\n第${round}節${table}卓\n🎊第${match}試合出場選手発表🎊\n\n` +
          `${infos[0][0]}\n<@${infos[0][1]}>  個人${infos[0][2]}位 ${infos[0][3]}pt\n\n` +
          `${infos[1][0]}\n<@${infos[1][1]}>  個人${infos[1][2]}位 ${infos[1][3]}pt\n\n` +
          `${infos[2][0]}\n<@${infos[2][1]}>  個人${infos[2][2]}位 ${infos[2][3]}pt\n\n` +
          `${infos[3][0]}\n<@${infos[3][1]}>  個人${infos[3][2]}位 ${infos[3][3]}pt`,
        ephemeral: false
      });
    } else {
      await interaction.editReply({
        content: `HOM.LEAGUE\n第${round}節 ${table}卓 第${match}試合\n${team} | <@${name}>\n(${entryp.length}/4人)`,
      });
    }
  },
};
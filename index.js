const { Client, Collection, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const path = require('node:path');
const fs = require("fs");
const express = require('express');
const { taikai } = require('./Mahjongsoul/taikai.js')

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  } else {
    console.log(`${filePath} に必要な "data" か "execute" がありません。`);
  }
}

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.client.commands.get(interaction.commandName);
  if (!command) {
    console.error(`${interaction.commandName} が見つかりません。`);
    return;
  }

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
});

client.once('ready', () => {
  console.log(`ログイン完了: ${client.user.tag}`);
});

client.login(process.env.TOKEN);

const app = express();
app.get("/", (req, res) => {
	res.send(`ok`);
});

app.listen(3000, () => {
	console.log(`Good morning!!`);
});

Deno.cron("Continuous Request", "*/2 * * * *", () => {
	console.log("running...");
});

Deno.cron("Taikai", "*/1 * * * *", async () => {
	await taikai();
});
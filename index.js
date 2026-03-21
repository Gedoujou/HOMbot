
import { Client, GatewayIntentBits, Events } from "discord.js";
import express from "express";
var client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});
client.login(process.env.TOKEN);

client.on("clientReady", () => {
  console.log(`サーバーが起動しました!!`);
});
var app = express();
app.get("/", (req, res) => {
  res.send(`ok`);
});
var port = 3000;
app.listen(port, () => {
  console.log(`Good morning!!`);
});

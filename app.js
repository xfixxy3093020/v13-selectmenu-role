const fs = require("fs");
const {Client, Intents, Collection} = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const client = new Client({
  fetchAllMembers: true,
  intents:[
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_INTEGRATIONS,
  ]});
const {token,mongoDB} = require("./ayarlar.json");

const mongoose = require("mongoose");
mongoose.connect(mongoDB)
.then(() => console.log("Connect MongoDb"))
.catch(console.error);



global.client = client;
client.commands = (global.commands = []);
fs.readdir("./slashKomutlar/", (err, files) => {
    if (err) throw err;

    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        let props = require(`./slashKomutlar/${file}`);

        client.commands.push({
             name: props.name.toLowerCase(),
             description: props.description,
             options: props.options,
        })
        console.log(`👌 Komut Yüklendi: ${props.name}`);
    });
});

fs.readdir("./events/", (_err, files) => {
    files.forEach((file) => {
        if (!file.endsWith(".js")) return;
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        
        console.log(`👌 Event yüklendi: ${eventName}`);
        client.on(eventName, (...args) => {
           event(client, ...args);
        });
    });
});

client.on("ready", async () => {
    const rest = new REST({ version: "9" }).setToken(token);
  try {
    await rest.put(Routes.applicationCommands(client.user.id), {
      body: client.commands,
    });
  } catch (error) {
    console.error(error);
  }
});

client.login(token);
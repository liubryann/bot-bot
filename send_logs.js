const Discord = require('discord.js')
const client = new Discord.Client()

client.on('ready', () => {
    client.user.setActivity("and listening", {type: "WATCHING"})
    console.log("Sending logs")
    client.guilds.cache.forEach((guild) => {

        guild.channels.cache.forEach((channel) => { 
            if (channel.type == "text") {
                var monitoredChannel = client.channels.cache.get(channel.id)
                monitoredChannel.send("Encrypting and sending chat logs to Xi Jinping...")
            }
        })
    })
})

bot_secret_token = "NzQ0NDIyMjc5NTc5OTU5NDI3.Xzi_Rg.0mzM31o3iDPr1y-4G0oiyWW_9nw"
client.login(bot_secret_token)

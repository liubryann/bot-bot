const Discord = require('discord.js')
const cron = require("node-cron")
require('dotenv').config()
const {pool} = require('./config')
const users = require('./userIdConstants')
const client = new Discord.Client()


client.on('ready', () => {
    client.user.setActivity("and listening", {type: "WATCHING"})
    console.log("Connected as " + client.user.tag)

    var monitoredChannels = []
    client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => { 
            if (channel.type == 'text') {
                monitoredChannels.push(channel) 
            }
        })
    })

    cron.schedule("0 0 * * *", () => {
        scheduledMessage(monitoredChannels)
    })
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channelID
    let oldUserChannel = oldMember.channelID
    
    if(oldUserChannel != newUserChannel) {
        if (oldUserChannel == null) {
            console.log(typeof newMember.member.id)
            console.log(newMember.member.id)
            pool.query (
                'SELECT * FROM social_credit_score WHERE id=$1',
                [newMember.member.id],
                (err, result) => {
                    if (err) {
                        return console.error("Query error", err.stack)
                    }
                    if (result.rows[0] == undefined) {
                        
                        sendWelcomeMessage(newMember)
                        // getGeneralChannel().send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 100. Enjoy your stay.")      

                        // generalChannel.send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 100. Enjoy your stay.")
                        // getGeneralChannel(newMember).send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 100. Enjoy your stay." )
                        insertInitalScore(newMember.member.id)
                    }
                }
            )
        }
    }
})

client.on('message', (receivedMessage) => {
    if (receivedMessage.author == client.user) {
        return
    }

    if (receivedMessage.content.startsWith("!")){
        processCommand(receivedMessage)
    }
})

function insertInitalScore(memberId) {
    pool.query(
        'INSERT INTO social_credit_score (id, score) VALUES ($1, 100)',
        [memberId],
        (err) => {
            if (err) {
                return console.error("Query error", err.stack)
            }
        }
    )
}

function sendWelcomeMessage(voiceState) {
    voiceState.guild.channels.cache.forEach((channel) => { 
         if (channel.type == 'text') {
            channel.send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 100. Enjoy your stay.")
            break
        }   
    })
}

function scheduledMessage(monitoredChannels) {
    for (channel of monitoredChannels){
        channel.send("Encrypting and sending chat logs to Xi Jinping...")
    }
}

function processCommand(receivedMessage) {
    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments)

    if (primaryCommand == "help") {
        if (users.isElton(receivedMessage.author.id)) {
            client.channels.cache.get(receivedMessage.channel.id).send("Fuck u figure it out")
        }
        else {
            client.channels.cache.get(receivedMessage.channel.id).send("I'm here to help")
        }
    }

    
    // "The supreme leader has recognized your contribution to the motherland. Your family will be sent an extra bag of rice."
    // else if (primaryCommand == "praise") {
    //     pool.query('')
    // }
    
    else if (primaryCommand == "report") {
        pool.query(
            'INSERT INTO social_credit_score (id, score) VALUES ($1, $2)',
            ['Justin', 3],
            (err) => {
                if (err) {
                    return console.error("Query error", err.stack)
                }
            }
        )
    }

    else if (primaryCommand == "score") {
        pool.query(
            'SELECT * FROM social_credit_score WHERE id=$1',
            ['idk'],
            (err, result) => {
                if (err) {
                    return console.error("Query error", err.stack)
                }
                console.log(result.rows[0])
            }
        )
    }
}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"
secret_token = process.env.bot_secret_token
client.login(secret_token)

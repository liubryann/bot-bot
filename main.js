const Discord = require('discord.js')
const cron = require("node-cron")
require('dotenv').config()
// const {pool} = require('./config')
const client = new Discord.Client()

const {Pool} = require('pg')
console.log(process.env.DATABASE_URL)

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: true
})

var monitoredChannel

client.on('ready', () => {
    client.user.setActivity("and listening", {type: "WATCHING"})
    console.log("Connected as " + client.user.tag)
    client.guilds.cache.forEach((guild) => {
        guild.channels.cache.forEach((channel) => { 
            if (channel.type == 'text') {
                cron.schedule("0 0 * * *", () => {
                    scheduledMessage(channel.id)
                })
                monitoredChannel = client.channels.cache.get(channel.id)
            }
        })
    })
})

client.on('voiceStateUpdate', (oldMember, newMember) => {
    let newUserChannel = newMember.channelID
    let oldUserChannel = oldMember.channelID
    
    if(oldUserChannel != newUserChannel) {
        console.log("I am here")
        if (oldUserChannel == null) {
            console.log(":(")
            pool.query = (
                'SELECT * FROM social_credit_score WHERE id=$1',
                [newMember.member.id],
                (err, result) => {
                    if (err) {
                        return console.error("Query error", err.stack)
                    }
                    console.log("here2")
                    console.log(result.rows[0])
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

function scheduledMessage(channelId) {
    // var monitoredChannel = client.channels.cache.get(channelId)
    monitoredChannel.send("Encrypting and sending chat logs to Xi Jinping...")
}

function processCommand(receivedMessage) {
    let isElton = receivedMessage.author.id == 283411716358799360
    let isBryan = receivedMessage.author.id == 290642739140493312
    let isRajah = receivedMessage.author.id == 312948893966925826

    let fullCommand = receivedMessage.content.substr(1)
    let splitCommand = fullCommand.split(" ")
    let primaryCommand = splitCommand[0]
    let arguments = splitCommand.slice(1)

    console.log("Command received: " + primaryCommand)
    console.log("Arguments: " + arguments)

    if (primaryCommand == "help") {
        if (isElton) {
            monitoredChannel.send("Fuck u figure it out")
        }
        else {
            monitoredChannel.send("I'm here to help")
        }
    }

    
    // "The supreme leader has recognized your contribution to the motherland. Your family will be sent an extra bag of rice."
    // else if (primaryCommand == "praise") {
    //     pool.query('')
    // }
    
    else if (primaryCommand == "report") {
        pool.query(
            'INSERT INTO social_credit_score (name, score) VALUES ($1, $2)',
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
            'SELECT * FROM social_credit_score WHERE name=$1',
            ['Justin'],
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

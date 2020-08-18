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
            pool.query (
                'SELECT * FROM social_credit_score WHERE id=$1',
                [newMember.member.id],
                (err, result) => {
                    if (err) {
                        return console.error("Query error", err.stack)
                    }
                    if (result.rows[0] == undefined) {
                        sendWelcomeMessage(newMember)
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
    console.log("Inserting initial score")
    pool.query(
        'INSERT INTO social_credit_score (id, score) VALUES ($1, 100)',
        [memberId],
        (err) => {
            if (err) {
                return console.error("InsertInitialScoreQuery error", err.stack)
            }
        }
    )
}

function sendWelcomeMessage(newMember) {
    console.log("Sending welcome message")
    newMember.guild.channels.cache.forEach((channel) => { 
         if (channel.type == 'text') {
            channel.send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 100. Enjoy your stay.")
            return
        }   
    })
}

function scheduledMessage(monitoredChannels) {
    console.log("Sending scheduled message")
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
            receivedMessage.channel.send("Fuck u figure it out")
        }
        else {
            receivedMessage.channel.send("I'm here to help")
        }
    }

    
    // "The supreme leader has recognized your contribution to the motherland. Your family will be sent an extra bag of rice."
    // else if (primaryCommand == "praise") {
    //     pool.query('')
    // }
    
    else if (primaryCommand == "report") {
      reportCommand(arguments, receivedMessage)
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

function reportCommand(arguments, receivedMessage) {
    if (validateArguments(arguments, receivedMessage)) {
        var user = receivedMessage.mentions.users.first()
        var member = receivedMessage.guild.member(receivedMessage.author)
        var displayName = member ? member.displayName : "this traitor"

        receivedMessage.channel.send("Thank you for your report against " + displayName + "." + " They will be punished accordingly.")

        pool.query(
            'SELECT * FROM social_credit_score WHERE id=$1',
            [user.id],
            (err, result) => {
                if (err) {
                    return console.error("SelectScoreByIdQuery error", err.stack)
                }
                let updatedScore = result.rows[0].score - parseInt(arguments[1])
                
                pool.query(
                    'UPDATE social_credit_score SET score=$2 WHERE id=$1',
                    [user.id, updatedScore],
                    (err) => {
                        if (err) {
                            return console.error("UpdateScoreByIdQuery error", err.stack)
                        }
                        evaluateScore(updatedScore, receivedMessage, displayName)
                    }
                )   
            }
        ) 
    }
    else {
        receivedMessage.channel.send("Try using !help. The chinese government is happy to assist.")
    }
}

function scoreCommand() {
    console.log("hellu")
}

function retrieveScoreByIdQuery(id, callback) {
    pool.query(
        'SELECT * FROM social_credit_score WHERE id=$1',
        [id],
        (err, result) => {
            if (err) {
                return console.error("SelectScoreByIdQuery error", err.stack)
            }
            return result.rows[0]
        }
    )
}

function updateScoreByIdQuery(id, score) {
    pool.query(
        'UPDATE scoial_credit_score SET score=$2 WHERE id=$1',
        [id, score],
        (err) => {
            if (err) {
                return console.error("UpdateScoreByIdQuery error", err.stack)
            }
        }
    )
}

function validateArguments (arguments, receivedMessage) {
    if (arguments.length < 2) {
        return false
    }
    else if (receivedMessage.mentions.users.size != 1) {
        return false 
    }
    else if (isNaN(parseInt(arguments[1]))) {
        return false
    }
    else {
        return true
    }
}

function evaluateScore(score, receivedMessage, user) {
    if (score < 0) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " For their crimes against the Replubic of China they will be subject to capital punishment.")
    }

    else if (score < 100) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " Your family will only be deducted one bag of rice.")
    }
}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"
secret_token = process.env.bot_secret_token
client.login(secret_token)

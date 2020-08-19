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
        'INSERT INTO social_credit_score (id, score) VALUES ($1, 50)',
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
            channel.send("Welcome to China " + newMember.member.displayName + "." + " Your social credit score has been set to 50. Use !help to get started and enjoy your stay.")
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
        if (users.isElton(receivedMessage.author.id) || users.isRajah(receivedMessage.author.id) || users.isAbdu(receivedMessage.author.id)) {
            receivedMessage.channel.send("Fuck u figure it out") 
        }
        else {
            receivedMessage.channel.send("Use !praise @name 1-5 to praise your friends for being model citizens.\nUse !report @name 1-5 to report your enemies for crimes against the country.\nUse !score @name to see someone's score.")
        }
    }

    else if (primaryCommand == "praise") {
      praiseCommand(arguments, receivedMessage)
    }
    
    else if (primaryCommand == "report") {
      reportCommand(arguments, receivedMessage)
    }

    else if (primaryCommand == "score") {
        scoreCommand(arguments, receivedMessage)
    }
}

function praiseCommand(arguments, receivedMessage) {
    if (validateArguments(arguments, receivedMessage)) {
        var user = receivedMessage.mentions.users.first()
        var member = receivedMessage.guild.member(user)
        var displayName = member ? member.displayName : "this person"

        pool.query(
            'SELECT * FROM social_credit_score WHERE id=$1',
            [user.id],
            (err, result) => {
                if (err) {
                    return console.error("SelectScoreByIdQuery error", err.stack)
                }

                if (result.rows[0] != undefined) {
                    var updatedScore
                    if (user == receivedMessage.member.user){
                        receivedMessage.channel.send("In China we are proud of our country, not in ourselves.")
                        updatedScore = result.rows[0].score - parseInt(arguments[1])
                    }
                    else {
                        updatedScore = result.rows[0].score + parseInt(arguments[1])
                    }     
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
                else {
                    receivedMessage.channel.send(displayName + " has not been to China recently but we invite them to join our glorious country.")
                }
                
            }
        ) 
    }
    else {
        receivedMessage.channel.send("Try using !help. The chinese government is happy to assist.")
    }

}

function reportCommand(arguments, receivedMessage) {
    if (validateArguments(arguments, receivedMessage)) {
        var user = receivedMessage.mentions.users.first()
        var member = receivedMessage.guild.member(user)
        var displayName = member ? member.displayName : "this traitor"

        pool.query(
            'SELECT * FROM social_credit_score WHERE id=$1',
            [user.id],
            (err, result) => {
                if (err) {
                    return console.error("SelectScoreByIdQuery error", err.stack)
                }

                if (result.rows[0] != undefined) {
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
                else {
                    receivedMessage.channel.send(displayName + " has not been to China recently but we invite them to join our glorious country.")
                }
                
            }
        ) 
    }
    else {
        receivedMessage.channel.send("Try using !help. The chinese government is happy to assist.")
    }
}


function scoreCommand(arguments, receivedMessage) {
    if (validateScoreArguments(arguments, receivedMessage)) {
        var user = receivedMessage.mentions.users.first()
        var member = receivedMessage.guild.member(user)
        var displayName = member ? member.displayName : "this person"

        pool.query(
            'SELECT * FROM social_credit_score WHERE id=$1',
            [user.id],
            (err, result) => {
                if (err) {
                    return console.error("SelectScoreByIdQuery error", err.stack)
                }

                if (result.rows[0] != undefined) {
                    evaluateScore(result.rows[0].score, receivedMessage, displayName)
                }
                else {
                    receivedMessage.channel.send(displayName + " has not been to China recently but we invite them to join our glorious country.")
                }
                
            }
        ) 
    }
    else {
        receivedMessage.channel.send("Try using !help. The chinese government is happy to assist.")
    }
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
    else if (parseInt(arguments[1]) <= 0 || parseInt(arguments[1]) > 5) {
        return false
    } 
    else {
        return true
    }
}

function validateScoreArguments(arguments, receivedMessage) {
    if (arguments.length != 1) {
        return false
    }
    else if (receivedMessage.mentions.users.size != 1) {
        return false 
    }
    else {
        return true
    }
}

function evaluateScore(score, receivedMessage, user) {
    if (score <= 0) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " For their crimes against the Republic of China they will be subject to capital punishment.")
    }
    else if (score <= 10) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " They and their family will be imprisoned and subject to labor for 3 generations.")
    }
    else if (score <= 20) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + "They will be sent to a re-eduation camp in XinJiang")
    }
    else if (score <= 30) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " They have been put on a list and will be closely monitored")
    }
    else if (score <= 40) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " They are no longer allowed to ride on public transport." )
    }
    else if (score <= 50) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " Their family will only be deducted one bag of rice.")
    }
    else if (score <= 60) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " The supreme leader has recognized their contribution to the motherland. Their family will be sent an extra bag of rice.")
    }
    else if (score <= 70) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " The supreme leader has found them an opening at T1 Esports as a reward for their excellent behaviour.")
    }
    else if (score <= 80) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " As a model citizen, the supreme leader has gifted them a brand new Tesla.")
    }
    else if (score <= 90) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " For their astounding contributions, the supreme leader has sent them a mail-order bride to procreate with.")
    }
    else if (score <= 100) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " Their upstanding loyalty to the Republic of China has been rewarded with a luxurious estate in Vancouver.")
    }
    else if (score > 100) {
        receivedMessage.channel.send(user + "'s social credit score is " + score.toString() + "." + " The Emperor invites you to tea.")
    }
}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"
secret_token = process.env.bot_secret_token
client.login(secret_token)

require('dotenv').config();

const {Client} = require('discord.js');
const ytdl = require('ytdl-core');
const client = new Client();
const PREFIX = '!';

let servers = {};

client.login(process.env.BOT_TOKEN).then();

client.on('ready', () => {
    console.log(`${client.user.username} has logged in!`);
});

client.on('message', (message) => {
    if (message.author.bot) return;

    console.log(`[${message.author.tag}]: ${message.content}`);


    // WELCOME
    if (message.content === 'Hi') {
        const username = message.author.username;
        message.channel.send(`Hi ${username}, welcome to the channel!`);
    }

    // GET COMMAND
    if (message.content.startsWith(PREFIX)) {
        const [CMD_NAME, ...args] = message.content
            .trim()
            .substring(PREFIX.length)
            .split(/\s+/);
        console.log('Command Name: ' + CMD_NAME);
        console.log('Args: ' + args);

        // PLAY MUSIC
        switch (CMD_NAME) {
            case 'play':

            function play(connection, message) {
                const server = servers[message.guild.id];
                const stream = ytdl(server.queue[0], {filter: "audioonly"});
                server.dispatcher = connection.play(stream);
                server.queue.shift();

                server.dispatcher.on('end', function () {
                    if (server.queue[0]) {
                        play(connection, message);
                    } else {
                        connection.disconnect();
                    }
                });

            }


                if (!args[0]) {
                    message.channel.send('Please provide a link for the song');
                    return;
                }

                if (!message.member.voice.channel) {
                    message.channel.send('You have to be connected to a voice channel before you can use this command');
                    return;
                }

                if (!servers[message.guild.id]) {
                    servers[message.guild.id] = {
                        queue: []
                    }
                    let server = servers[message.guild.id];
                    server.queue.push(args[0]);

                    if (!message.guild.voiceConnection) {
                        message.member.voice.channel.join()
                            .then(function (connection) {
                                play(connection, message);
                            })
                    }
                }
                break;
            /*
                        case 'skip':
                            const server = servers[message.guild.id];
                            if (server.dispatcher) {
                                server.dispatcher.end();
                            }
                            message.channel.send('Skipping the song');
                            break;*/

            case 'stop':
                const server2 = servers[message.guild.id];

                if (message.guild.voiceConnection) {
                    for (let i = server2.queue.length - 1; i >= 0; i--) {
                        server2.queue.splice(i, 1);
                    }

                    server2.dispatcher.end();
                    message.channel.send('Ending queue');

                }

                if (message.guild.connection) {
                    message.guild.voiceConnection.disconnect();
                }
                break;


        }

    }

});


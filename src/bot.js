require('dotenv').config();

const {Client} = require('discord.js');
const client = new Client();
const PREFIX = '!';
const DisTube = require('distube');


const distube = new DisTube(client, {searchSongs: true, emitNewSongOnly: true, highWaterMark: 1 << 25});

client.on('ready', () => {
    console.log(`${client.user.username} has logged in!`);
});

client.on('message', async (message) => {
    if (message.author.bot) return;
    console.log(`[${message.author.username}]: ${message.content}`);


    // WELCOME


    // GET COMMAND
    const [CMD_NAME, ...args] = message.content
        .trim()
        .substring(PREFIX.length)
        .split(/\s+/);


    // PLAY MUSIC
    if (['play', 'cal'].includes(CMD_NAME))
        await distube.play(message, args.join(' '));

    if (['repeat', 'loop', 'tekrar'].includes(CMD_NAME))
        distube.setRepeatMode(message, parseInt(args[0]));

    if (['stop', 'dur'].includes(CMD_NAME)) {
        distube.stop(message);
        message.channel.send("Stopped the music!");
    }

});


const status = (queue) => `Volume: \`${queue.volume}%\` | Filter: \`${queue.filter || "Off"}\` | Loop: \`${queue.repeatMode ? queue.repeatMode === 2 ? "All Queue" : "This Song" : "Off"}\` | Autoplay: \`${queue.autoplay ? "On" : "Off"}\``;


distube
    .on("playSong", (message, queue, song) => message.channel.send(
        `Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${song.user}\n${status(queue)}`
    ))
    .on("addSong", (message, queue, song) => message.channel.send(
        `Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
    ))
    .on("playList", (message, queue, playlist, song) => message.channel.send(
        `Play \`${playlist.name}\` playlist (${playlist.songs.length} songs).\nRequested by: ${song.user}\nNow playing \`${song.name}\` - \`${song.formattedDuration}\`\n${status(queue)}`
    ))
    .on("addList", (message, queue, playlist) => message.channel.send(
        `Added \`${playlist.name}\` playlist (${playlist.songs.length} songs) to queue\n${status(queue)}`
    ))
    // DisTubeOptions.searchSongs = true
    .on("searchResult", (message, result) => {
        let i = 0;
        message.channel.send(`**Choose an option from below**\n${result.map(song => `**${++i}**. ${song.name} - \`${song.formattedDuration}\``).join("\n")}\n*Enter anything else or wait 60 seconds to cancel*`);
    })
    // DisTubeOptions.searchSongs = true
    .on("searchCancel", (message) => message.channel.send(`Searching canceled`))
    .on("error", (message, err) => message.channel.send(
        "An error encountered: " + err
    ));

client.login(process.env.BOT_TOKEN).then();

const ytdl = require('ytdl-core');

async function ytu(ytUrl, quality = 'highestvideo', filter = 'videoandaudio') {
    const info = await ytdl.getInfo(ytUrl);
    const { formats } = info;
    // const { url } = ytdl.chooseFormat(formats, { quality, filter }); // quality: 'highestvideo' filter: 'videoandaudio' / 'audioandvideo'
    const { url: video } = ytdl.chooseFormat(formats, { quality: 'highestvideo' });
    const { url: audio } = ytdl.chooseFormat(formats, { quality: 'lowestaudio' });
    return { audio, video };
}

module.exports = ytu;
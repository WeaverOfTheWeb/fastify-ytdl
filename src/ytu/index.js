const ytdl = require('ytdl-core');

async function ytu(ytUrl, quality = 'highestvideo', filter = 'videoandaudio') {
    const info = await ytdl.getInfo(ytUrl);
    const { formats } = info;
    const video = {};
    
    // const { url } = ytdl.chooseFormat(formats, { quality, filter }); // quality: 'highestvideo' filter: 'videoandaudio' / 'audioandvideo'
    const { url: highestVideo } = ytdl.chooseFormat(formats, { quality: 'highestvideo' });
    const { url: mediumVideo } = ytdl.chooseFormat(formats, { quality: '135' }); // 135: 480p, 22: 720p with audio
    // const { url: lowestVideo } = ytdl.chooseFormat(formats, { quality: 'lowestvideo' });
    
    video.high = highestVideo;
    video.medium = mediumVideo;
    // video.low = lowestVideo;
    // video.formats = formats;
    
    const { url: audio } = ytdl.chooseFormat(formats, { quality: 'lowestaudio' });
    
    return { audio, video };
}

module.exports = ytu;
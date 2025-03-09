const ytdl = require("@distube/ytdl-core");

async function ytu(ytUrl, quality = 'highestvideo', filter = 'videoandaudio') {
    const info = await ytdl.getInfo(ytUrl);
    const { formats } = info;
    const video = {};
    
    const { url: highestVideo } = ytdl.chooseFormat(formats, { quality: 'highestvideo' });
    const { url: mediumVideo } = ytdl.chooseFormat(formats, { filter: 'audioandvideo', quality: 'highestvideo' });
    
    video.high = highestVideo;
    video.medium = mediumVideo;
    
    return { video };
}

module.exports = ytu;

//video.formats = test;
// const test = ytdl.chooseFormat(formats, { filter: 'audioandvideo', quality: 'highestvideo' });
// const { url: audio } = ytdl.chooseFormat(formats, { quality: 'lowestaudio' });
// return { audio, video };
/* const { url } = ytdl.chooseFormat(formats, { quality, filter }); // quality: 'highestvideo' filter: 'videoandaudio' / 'audioandvideo'
const { url: lowestVideo } = ytdl.chooseFormat(formats, { quality: 'lowestvideo' });
video.low = lowestVideo; */
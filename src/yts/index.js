const ytdl = require("@distube/ytdl-core");
const ffmpeg = require('fluent-ffmpeg');
const { promisify } = require('util');

const screenshot = promisify((videoStream, time, outputPath, filename, callback) => {
    ffmpeg(videoStream)
        .on('error', (err) => callback(err))
        .on('end', () => callback(null, 'Screenshot taken'))
        .screenshots({
            timestamps: [time],
            filename: filename,
            folder: outputPath
        });
});

/* const { formats, videoDetails: { keywords, storyboards, chapters, thumbnails } } = info; */
/* const { formats } = info;
    const { url } = ytdl.chooseFormat(formats, { quality: 'highestvideo', filter: 'audioandvideo' });
    console.log({ url }); */

async function getVideoInfo(ytUrl) {
    const info = await ytdl.getInfo(ytUrl);
    return info;
}

async function getVideoDuration(url) {
    const videoInfo = await getVideoInfo(url);
    const { videoDetails: { lengthSeconds } } = videoInfo;
    return lengthSeconds;
}

function getVideoSream(url, quality = 'highestvideo') {
    const stream = ytdl(url, { quality: quality });
    return stream;
}

async function yts(videoUrl, timestampInSeconds, outputPath, filename, quality) {
    try {
        const durationInSeconds = await getVideoDuration(videoUrl);
        if (timestampInSeconds > durationInSeconds) throw new Error('Requested timestamp is beyond the video duration.');
        const videoStream = getVideoSream(videoUrl, quality);
        await screenshot(videoStream, timestampInSeconds, outputPath, filename);
    } catch (error) {
        throw error;
    }
}

module.exports = yts;

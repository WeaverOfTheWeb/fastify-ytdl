/* const yts = require("./yts/index.js"); */
const ytu = require("./ytu/index.js");
const YoutubeTranscript = require("youtube-transcript").YoutubeTranscript;
const fastify = require('fastify')({
    logger: true
});

const { ADDRESS = 'localhost', PORT = '3000' } = process.env;

const srcOptions = {
    schema: {
        params: {
            properties: {
                videoID: { type: 'string' },
            },
            required: ['videoID'],
        },
        response: {
            200: {
                properties: {
                    audio: { type: 'string' },
                    message: { type: 'string' },
                    video: { type: 'string' },
                },
            },
        },
    },
};

fastify.get('/src/:videoID', srcOptions, async (req, reply) => {
    const { videoID } = req.params;
    if (videoID) {
        const url = `https://www.youtube.com/watch?v=${videoID}`;
        try {
            const { audio, video } = await ytu(url);
            return { audio, video };
        } catch (error) {
            console.error('Error retreiving URL:', error.message);
        }

        return { message: "Something f#cked up..."}
    }
    return { message: "Youtube ID is missing!" };
});

/* fastify.get('/frame/:videoID', async (req, reply) => {
    const { videoID } = req.params;
    if (videoID) {
        const videoUrl = `https://www.youtube.com/watch?v=${videoID}`;
        const timeStamp = new Date().getMilliseconds();
        const outputPath = "screenshots";
        const fileName = `${Date.now()}.png`;

        try {
            await yts(videoUrl, timeStamp, outputPath, fileName, 'lowestvideo');
            const message = `Screenshot saved as ${outputPath}/${fileName}`;
            console.log("\n", message, "\n");
            return { message };
        } catch (error) {
            console.error('Error taking screenshot:', error.message);
        }

        return { message: "Something f#cked up..."}
    }
    return { message: "Youtube ID is missing!" };
}); */

fastify.get('/transcript/:videoID', async (req, reply) => {
    const { videoID } = req.params;
    if (videoID) {
        const transcript = await YoutubeTranscript.fetchTranscript(videoID);
        let copy = "";
        transcript.forEach(item => {
            copy += `${item.text} `;
        });
        return { copy, transcript };
    }
    return { message: "Youtube ID is missing!" };
});

fastify.listen({ host: ADDRESS, port: parseInt(PORT, 10) }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
});
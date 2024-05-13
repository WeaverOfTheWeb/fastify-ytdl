const yts = require('./index.js');

async function captureYouTubeVideoScreenshot(videoUrl, timestamp, outputDir, filename, quality) {
    try {
        await yts(videoUrl, timestamp, outputDir, filename, quality);
        console.log(`Screenshot saved as ${filename} in ${outputDir}`);
    } catch (error) {
        console.error('Error taking screenshot:', error.message);
    }
}

// Example usage
const videoUrl = 'https://www.youtube.com/watch?v=ddTV12hErTc'; // Replace with actual YouTube video URL
//const timestamp = "00:00:54"; // The time point for the screenshot (in seconds)
const timestamp = 120; // The time point for the screenshot (in seconds)
const outputDir = '../../screenshots'; // The directory where the screenshot will be saved
const filename = `${Date.now()}.png`; // The name of the screenshot file

captureYouTubeVideoScreenshot(videoUrl, timestamp, outputDir, filename, 'lowestvideo');
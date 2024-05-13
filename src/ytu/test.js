const ytu = require('./index.js');

const fetchVideoSrc = async (url) => {
    console.log({ url: await ytu(url) });
}

fetchVideoSrc('https://youtu.be/QbMO4Il8y4Y');
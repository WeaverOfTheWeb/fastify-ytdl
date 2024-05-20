async function fetchMediaData(videoId) {
    if (!videoId) throw new Error('videoId must be provided!');

    try {
        const response = await fetch(`/src/${videoId}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.audio || !data.video) {
            throw new Error('Missing audio or video properties in the response');
        }

        const thumbnailQuality = ['default','hqdefault','maxresdefault'];
        document.getElementById('canvasWrapper').style.backgroundImage = `url(https://i.ytimg.com/vi/${videoId}/${thumbnailQuality[2]}.jpg)`;

        return data;
    } catch (error) {
        console.error('Error fetching media data:', error);
    }
}

window.onload = async () => {
    const { audio, video } = await fetchMediaData('ddTV12hErTc');
    
    const srcAudio = new Audio();
    const srcVideo = document.createElement('video');

    srcAudio.src = audio;
    srcVideo.src = video;

    const canvas = document.getElementById('canvasVideo');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const ctx = canvas.getContext('2d');
    let raf = null;

    const drawVideoFrame = (x) => {
        raf = window.requestAnimationFrame(drawVideoFrame);
        ctx.drawImage(srcVideo, 0, 0, canvas.width, canvas.height);
        /* if (x === 'loadeddata') setTimeout(clearRaf, 500); */
    };

    const clearRaf = () => {
        window.cancelAnimationFrame(raf);
        raf = null;
    };

    // srcAudio.addEventListener('loadeddata', console.log('BOOM'), false);
    srcVideo.addEventListener('play', () => {
        canvasWrapper.className = 'pause';
        if (srcAudio.paused) srcAudio.play();
    }, false);
    srcVideo.addEventListener('playing', () => {
        canvasWrapper.className = 'pause';
    }, false);
    srcVideo.addEventListener('pause', () => {
        clearRaf();
        canvasWrapper.className = 'play';
        if (!srcAudio.paused) srcAudio.pause();
    }, false);
    srcVideo.addEventListener('ended', () => {
        clearRaf();
        canvasWrapper.className = 'play';
    }, false);
    srcVideo.addEventListener('timeupdate', () => {
        if(srcAudio.readyState >= 4) {
            if(Math.ceil(srcAudio.currentTime) != Math.ceil(srcVideo.currentTime)) {
                srcAudio.currentTime = srcVideo.currentTime;
            }
        }
        drawVideoFrame();
    }, false);

    canvasWrapper.onclick = () => {
        if (srcVideo.paused) {
            return srcVideo.play();
        }
        srcVideo.pause();
        console.log({
            audioCurrentTime: srcAudio.currentTime,
            videoCurrentTime: srcVideo.currentTime,
        });
    };
};
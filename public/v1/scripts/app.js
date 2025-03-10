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

async function fetchTranscript(videoId) {
    if (!videoId) throw new Error('videoId must be provided!');

    try {
        const response = await fetch(`/transcript/${videoId}`);
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        
        if (!data.copy || !data.transcript) {
            throw new Error('Missing copy or transcript properties in the response');
        }

        return data;
    } catch (error) {
        console.error('Error fetching media data:', error);
    }
}

window.onload = async () => {
    const { audio, video } = await fetchMediaData('ddTV12hErTc');
    const { copy, transcript } = await fetchTranscript('ddTV12hErTc');

    // Ammend transcript to desired format
    transcript.forEach(item => {
        // Add 'end' time field to object
        const endTime = item.duration + item.offset;
        item.end = Math.round(endTime * 1000) / 1000;

        // Remove unwanted fields
        delete item['duration'];
        delete item['lang'];

        // Rename 'offset' field to 'start'
        delete Object.assign(item, { ['start']: item['offset'] })['offset'];
    });
    
    const srcAudio = new Audio();
    const srcVideo = document.createElement('video');
    
    srcAudio.src = audio;
    srcVideo.src = video;

    const canvas = document.getElementById('canvasVideo');
    const canvasWrapper = document.getElementById('canvasWrapper');
    const ctx = canvas.getContext('2d');
    
    let lastTranscript = '';
    let raf = null;

    const drawVideoFrame = (x) => {
        raf = window.requestAnimationFrame(drawVideoFrame);
        ctx.drawImage(srcVideo, 0, 0, canvas.width, canvas.height);
    };

    const clearRaf = () => {
        window.cancelAnimationFrame(raf);
        raf = null;
    };

    // https://stackoverflow.com/a/5920749
    function htmlDecode(input){
        var e = document.createElement('div');
        e.innerHTML = input;
        return e.childNodes[0].nodeValue;
    }

    const updateTranscript = () => {
        const transcriptContainer = document.getElementById("transcript");
        const currentTime = srcVideo.currentTime;
        const currentTranscript = transcript.find(transcript => currentTime >= transcript.start && currentTime <= transcript.end);
        
        if (currentTranscript) {
            if (lastTranscript !== currentTranscript.text) {
                lastTranscript = currentTranscript.text;
                transcriptContainer.innerHTML = htmlDecode(currentTranscript.text);
                transcriptContainer.className = 'show';
            }
        } else {
            transcriptContainer.className = '';
        }
    };

    srcVideo.addEventListener('play', () => {
        canvasWrapper.className = 'pause';
        if (srcAudio && srcAudio?.paused) srcAudio.play();
    }, false);
    srcVideo.addEventListener('playing', () => {
        canvasWrapper.className = 'pause';
    }, false);
    srcVideo.addEventListener('pause', () => {
        clearRaf();
        canvasWrapper.className = 'play';
        if (srcAudio && !srcAudio?.paused) srcAudio.pause();
    }, false);
    srcVideo.addEventListener('ended', () => {
        clearRaf();
        canvasWrapper.className = 'play';
    }, false);
    srcVideo.addEventListener('timeupdate', () => {
        drawVideoFrame();
        updateTranscript();

        if (srcAudio && srcAudio?.readyState >= 4) {
            if(Math.ceil(srcAudio.currentTime) != Math.ceil(srcVideo.currentTime)) {
                srcAudio.currentTime = srcVideo.currentTime;
            }
        }
    }, false);

    canvasWrapper.onclick = () => {
        if (srcVideo.paused) {
            return srcVideo.play();
        }
        
        srcVideo.pause();
        
        console.log({
            audioCurrentTime: srcAudio?.currentTime,
            videoCurrentTime: srcVideo.currentTime,
        });
    };
};
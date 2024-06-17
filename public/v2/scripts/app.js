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
    
    const srcAudio = new Audio();; // null
    const srcVideo = document.getElementById('video'); // document.createElement('video');
    
    srcAudio.preload = 'auto';
    srcAudio.src = audio;
    srcAudio.muted = true;
    srcVideo.src = video.medium;
    srcVideo.load();

    /* const canvas = document.getElementById('canvasVideo');
    const ctx = canvas.getContext('2d'); */
    const canvasWrapper = document.getElementById('canvasWrapper');
    const muteBtn = document.getElementById('muteAudio');
    const subtitlesBtn = document.getElementById('subtitlesBtn');
    const captureFramBtn = document.getElementById('captureFrame');
    const subtitlesContainer = document.getElementById('subtitles');
    
    let lastTranscript = '';
    /* let raf = null; */

    /* const drawVideoFrame = (x) => {
        raf = window.requestAnimationFrame(drawVideoFrame);
        ctx.drawImage(srcVideo, 0, 0, canvas.width, canvas.height);
        // if (x === 'loadeddata') setTimeout(clearRaf, 500);
    }; */

    /* const clearRaf = () => {
        window.cancelAnimationFrame(raf);
        raf = null;
    }; */

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

    // srcAudio.addEventListener('loadeddata', console.log('BOOM'), false);
    srcVideo.addEventListener('canplay', ({ target }) => {
        console.log("Video player can play!");
        canvasWrapper.className = 'play';
    });
    srcVideo.addEventListener('canplaythrough', ({ target }) => {
        console.log("Video player has fulled loaded!");
    });
    srcVideo.addEventListener('play', () => {
        canvasWrapper.className = 'pause';
    }, false);
    srcVideo.addEventListener('playing', () => {
        canvasWrapper.className = 'pause';
    }, false);
    srcVideo.addEventListener('pause', () => {
        // clearRaf();
        canvasWrapper.className = 'play';
        if (srcAudio && !srcAudio?.paused && !srcAudio.muted) srcAudio.pause();
    }, false);
    srcVideo.addEventListener('ended', () => {
        // clearRaf();
        canvasWrapper.className = 'play';
    }, false);
    srcVideo.addEventListener('timeupdate', () => {
        // drawVideoFrame();
        updateTranscript();
        if (srcAudio && srcAudio?.readyState >= 4 && !srcAudio.muted) {
            if(Math.ceil(srcAudio.currentTime) != Math.ceil(srcVideo.currentTime)) {
                srcAudio.currentTime = srcVideo.currentTime;
            }
            if (srcAudio?.paused) srcAudio.play();
        }
    }, false);

    captureFramBtn.onclick = () => {
        let hqVid = document.createElement('video');
        hqVid.src = 'https://cors.awreet.com/' + video.high;
        hqVid.crossOrigin = 'Anonymous';
        hqVid.currentTime = srcVideo.currentTime;
        console.log('HQ video src and current time set');
        // hqVid.addEventListener('error', (e) => console.log(e));
        hqVid.addEventListener('canplay', ({ target }) => {
            console.log('HQ video loaded and can play');
            let canvas = document.createElement('canvas');
            canvas.width = target.videoWidth;
            canvas.height = target.videoHeight;
            
            let ctx = canvas.getContext('2d');
            ctx.drawImage(hqVid, 0, 0, canvas.width, canvas.height);
            console.log('HQ video frame drawn to canvas');
            
            const img = document.getElementById('testImage');
            img.crossOrigin = 'Anonymous';
            img.src = canvas.toDataURL('image/jpeg', 0.8);
            img.onload = () => {
                console.log('HQ video frame exported');
                img.className = 'show';
                hqVid.removeAttribute('src');
                hqVid.load();
                hqVid = null;
                canvas = null;
                ctx = null;
                console.log('HQ video cleared');
            };
        });
    };

    muteBtn.onclick = ({ target }) => {
        srcAudio.muted = !srcAudio.muted;
        target.className = srcAudio.muted ? 'btn muted' : 'btn';
    };
    
    subtitlesBtn.onclick = ({ target }) => {
        const { classList } = target;
        classList.toggle('on');
        if (classList.contains('on')) {
            subtitlesContainer.className = 'on';
        } else {
            subtitlesContainer.className = '';
        }
    };

    canvasWrapper.onclick = () => {
        const activeElmClasses = document.activeElement.classList;
        if (activeElmClasses.contains('btn') || activeElmClasses.contains('loading')) return;
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
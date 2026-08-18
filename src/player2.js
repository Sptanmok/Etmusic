const audio = document.getElementById('audio');

// Custom media controls. The native audio chrome differs between
// browsers, so keep the media element accessible but render our own controls.
audio.controls = false;
audio.classList.add('audio-source');
const player = audio.closest('.player') || audio.parentElement;
const controls = document.createElement('div');
controls.className = 'music-controls';
controls.setAttribute('aria-label', 'Music player controls');
controls.innerHTML = `
  <div class="progress-row">
    <span class="time-label current-time">0:00</span>
    <input class="seek-slider" type="range" min="0" max="100" value="0" step="0.1" aria-label="Seek">
    <span class="time-label duration-label">0:00</span>
  </div>
  <div class="control-actions">
    <button class="control-button skip-button" data-seconds="-10" aria-label="Back 10 seconds">↶<small>10</small></button>
    <button class="control-button play-button" aria-label="Play">▶</button>
    <button class="control-button skip-button" data-seconds="10" aria-label="Forward 10 seconds">↷<small>10</small></button>
    <label class="volume-control" aria-label="Volume"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4zm12.5 3a4.5 4.5 0 0 0-2.1-3.8v7.6a4.5 4.5 0 0 0 2.1-3.8zm0-8.2v2.1a7.5 7.5 0 0 1 0 12.2v2.1a9.5 9.5 0 0 0 0-16.4z"/></svg><input class="volume-slider" type="range" min="0" max="1" value="1" step="0.01"></label>
  </div>`;
audio.insertAdjacentElement('afterend', controls);
const playButton = controls.querySelector('.play-button');
const seekSlider = controls.querySelector('.seek-slider');
const volumeSlider = controls.querySelector('.volume-slider');
const currentTimeLabel = controls.querySelector('.current-time');
const durationLabel = controls.querySelector('.duration-label');
const formatTime = seconds => {
  if (!Number.isFinite(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
const updateSeekFill = () => seekSlider.style.setProperty('--seek-progress', `${seekSlider.value}%`);
const syncControls = () => {
  const progress = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  seekSlider.value = progress;
  updateSeekFill();
  currentTimeLabel.textContent = formatTime(audio.currentTime);
  durationLabel.textContent = formatTime(audio.duration);
  playButton.textContent = audio.paused ? '▶' : 'Ⅱ';
  playButton.setAttribute('aria-label', audio.paused ? 'Play' : 'Pause');
};
playButton.addEventListener('click', () => audio.paused ? audio.play() : audio.pause());
controls.querySelectorAll('.skip-button').forEach(button => button.addEventListener('click', () => {
  audio.currentTime = Math.max(0, Math.min(audio.duration || Infinity, audio.currentTime + Number(button.dataset.seconds)));
}));
seekSlider.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (Number(seekSlider.value) / 100) * audio.duration;
  updateSeekFill();
});
volumeSlider.addEventListener('input', () => { audio.volume = volumeSlider.value; volumeSlider.style.setProperty('--volume-progress', `${volumeSlider.value * 100}%`); });
['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended'].forEach(event => audio.addEventListener(event, syncControls));
syncControls();
let lyricpath;
let currentLyricIndex = -1;
let wordElements = [];
const lyricElement = document.getElementById('lyric');
const pairLyricElement = document.getElementById('pairlyric');
const romaLyricElement = document.getElementById('romalyric');
const title = document.title
let jsonlyrics;
let alimg = document.querySelector(".img");
const canvas = document.getElementById('spectrum');
const canvasb = document.getElementById('spectrumb');
const canvasd = document.getElementById('spectrumd');
const ctx = canvas.getContext('2d');
const ctxb = canvasb.getContext('2d');
const ctxd = canvasd.getContext('2d');
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 256;
const LiteralRenderingModeSelectionall = 3;
let LiteralRenderingModeSelection = Math.floor(Math.random() * (LiteralRenderingModeSelectionall)) + 1;
const AudioVisualizationModeSelectionall = 2;
let AudioVisualizationModeSelection = 1;
let bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const dd = audioContext.createMediaElementSource(audio);
dd.connect(analyser);
analyser.connect(audioContext.destination);
main = document.querySelector(".main");
if(audio.getAttribute('lyricpath')){
	lyricpath = audio.getAttribute('lyricpath');
}else{
	lyricpath = audio.getAttribute('src').replace(/\.[^.]*$/, ".json");
}
fetch(lyricpath)
  .then(response => {
    if (!response.ok) {
      throw new Error('json response was not ok');
    }
    return response.json();
  })
  .then(data => {
    jsonlyrics = data;
    console.log(jsonlyrics);
    initLyrics()
  })
let suijsz =[]
function initLyrics() {
	if(!jsonlyrics.lyrics[0] || jsonlyrics.lyrics[0].time > 0){
		let defaultLyric = !jsonlyrics.metadata.nolyric ? {"time": 0.00,"text": "Enjoy to the fullest!","etext": [{"Duration": 0.10,"start": 0.0,"end": 0.1,"text": "Enjoy to the fullest :)"}]} : {"time": 0.00,"text": "Write your own lyrics to pure instrumental music!","etext": [{"Duration": 0.10,"start": 0.0,"end": 0.1,"text": "Write your own lyrics to pure instrumental music!"}]}
		jsonlyrics.lyrics.unshift(defaultLyric);
	}
    if(jsonlyrics.metadata.zq){
        setInterval(updateLyrics, 15);
    }
    if(!jsonlyrics.metadata.zq){
        lyricElement.classList.add('lowfadeinzb');
        setInterval(lowupdateLyrics, 50);
    }
    setInterval(changeTitle, 50);
    for(let i=1;i<=200;i++){
        suijsz.push(i)
    }
    suijsz.sort(() => Math.random() - 0.5)
    if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: jsonlyrics.metadata.ti,
            artist: jsonlyrics.metadata.ar,
            album: jsonlyrics.metadata.al,
            artwork: [
            {
                src: alimg.src,
                sizes: "1400x1400",
                type: "image/jpeg"
            }
            ]
        });
    }
}
let zt = 1;
function updateLyrics() {
    const currentTime = audio.currentTime;
    let newIndex = -1;
    for (let i = 0; i < jsonlyrics.lyrics.length; i++) {
        if (currentTime >= jsonlyrics.lyrics[i].time) {
            newIndex = i;
        } else {
            break;
       }
    }
	if (audio.readyState !== 4 && audio.readyState !== 3){
		lyricElement.innerHTML = "Loading music...";
		zt = 2;
		return;
	}
    if (newIndex !== currentLyricIndex && newIndex !== -1) {
        currentLyricIndex = newIndex;
        displayCurrentLyric();
    }
	if(zt === 2){
		displayCurrentLyric();
		zt = 1;
	}
    if (currentLyricIndex !== -1) {
		if(LiteralRenderingModeSelection === 2 || LiteralRenderingModeSelection === 3){
			requestAnimationFrame(() => fadeWords(currentTime));
		}else{
            requestAnimationFrame(() => highlightWords(currentTime));
		}
    }
	const targetClass =  LiteralRenderingModeSelection === 2 || LiteralRenderingModeSelection === 3 ? "textt" : "text";
    if(!lyricElement.classList.contains(targetClass)) {
        lyricElement.className = targetClass;
    }
}
function displayCurrentLyric() {
	let htmllyric = '';
    const currentLyric = jsonlyrics.lyrics[currentLyricIndex];
    for (let i = 0; i < currentLyric.etext.length; i++) {
        htmllyric += `<span style="">${currentLyric.etext[i].text}</span>`;
    }
	lyricElement.innerHTML = htmllyric;
	wordElements = lyricElement.getElementsByTagName('span');
    pairLyricElement.textContent = currentLyric.pairlyric;
    romaLyricElement.textContent = currentLyric.romanizationslyric;
    if(LiteralRenderingModeSelection === 2 || LiteralRenderingModeSelection === 3) arowfadeWords();
    if(LiteralRenderingModeSelection === 3){
        arowfadeWordsmode3()
    }
}
function arowfadeWordsmode3(){
    let previous_direction;
    for(let i = 0;i < wordElements.length;i++){
        let bianD = Math.ceil(4 - (Math.random())*4)
        if(previous_direction && bianD === previous_direction){
            bianD = bianD === 4 ? 1 : bianD + 1;
        }
        previous_direction = bianD;
        let xcs = 20-(Math.random())*40
        let inX;let inY;let outX;let outY;
        if(bianD===1){inY=20;inX=xcs;outY=-20;outX=-xcs;}
        if(bianD===2){inX=-20;inY=xcs;outX=20;outY=-xcs;}
        if(bianD===3){inY=-20;inX=xcs;outY=20;outX=-xcs;}
        if(bianD===4){inX=20;inY=xcs;outX=-20;outY=-xcs;}
        wordElements[i].style.setProperty('--inX', `${inX}px`);
        wordElements[i].style.setProperty('--inY', `${inY}px`);
        wordElements[i].style.setProperty('--outX', `${outX}px`);
        wordElements[i].style.setProperty('--outY', `${outY}px`);
    }
}
function arowfadeWords(){
    let smjgtime = 0.9;
    /*
    for(let b=0;b < jsonlyrics.lyrics[currentLyricIndex].etext.length;b++){
        if(jsonlyrics.lyrics[currentLyricIndex].etext[b] && jsonlyrics.lyrics[currentLyricIndex].etext[b].Duration < smjgtime){
            smjgtime = jsonlyrics.lyrics[currentLyricIndex].etext[b].Duration
        }
    }
    */
    smjgtime = jsonlyrics.lyrics[currentLyricIndex+1]?jsonlyrics.lyrics[currentLyricIndex+1].time-jsonlyrics.lyrics[currentLyricIndex].etext[jsonlyrics.lyrics[currentLyricIndex].etext.length-1].start-0.2:0.9//0.2为淡出动画时间
    if(smjgtime > 0.8){
        smjgtime = 0.8
    }
    if(smjgtime < 0.6){
        smjgtime = 0.6
    }
    lyricElement.style.setProperty('--inTime', `${smjgtime}s`);
    //  根据歌词间隔时长设置淡入时间，但是不允许大于0.8s或小于0.4s
}
function fadeWords(currentTime){
	const currentLyric = jsonlyrics.lyrics[currentLyricIndex];
	let outtimes = [];
	if(jsonlyrics.lyrics[currentLyricIndex + 1] && jsonlyrics.lyrics[currentLyricIndex + 1].time - currentLyric.etext[currentLyric.etext.length - 1].start >= wordElements.length * 0.03 + 0.2){
		//逐字/词退出
        let n = 1;
		for(let word of wordElements){
			let Time = jsonlyrics.lyrics[currentLyricIndex + 1].time - (( wordElements.length - n ) * 0.03 + 0.2);
			outtimes.push(Time);
			n++;
		}
		let a = 0;
		for(const outtime of outtimes){
			if(outtime > currentTime){
				wordElements[a].classList.remove('fade-out');
				continue;
			}
			wordElements[a].classList.add('fade-out');
			wordElements[a].classList.remove('fade-in');
			a++;
		}
		lyricElement.style.setProperty('--outTime', `0.2s`);
	}else if(jsonlyrics.lyrics[currentLyricIndex + 1]){
        //整行退出
            let outTime = jsonlyrics.lyrics[currentLyricIndex+1].time-currentLyric.etext[currentLyric.etext.length-1].start-0.6
            outTime = outTime<0.1?0.1:(outTime<0.2?outTime:0.2)
            const time = jsonlyrics.lyrics[currentLyricIndex + 1].time - outTime;
            if(currentTime < time){
                for(let i = 0;i < wordElements.length;i++){
                    wordElements[i].classList.remove('fade-out');
                }
            }
            if(currentTime >= time){
                for(let i = 0;i < wordElements.length;i++){
                    wordElements[i].classList.add('fade-out');
                    wordElements[i].classList.remove('fade-in');
                }
            }
            lyricElement.style.setProperty('--outTime', `${outTime}s`);
    }
    for (let i = 0; i < currentLyric.etext.length; i++) {
        const word = currentLyric.etext[i];//简化m
        if (currentTime >= word.start && !wordElements[i].classList.contains('fade-out')) { //判断时间
            wordElements[i].classList.add('fade-in');
        } else if (currentTime < word.start && wordElements[i]) {
            wordElements[i].classList.remove('fade-in');
        }
    }
}
function highlightWords(currentTime) {
    const currentLyric = jsonlyrics.lyrics[currentLyricIndex];
	for (let i = 0; i < currentLyric.etext.length; i++) {
        const word = currentLyric.etext[i];
        if (currentTime >= word.start && currentTime <= word.end) {
            const progress = ((currentTime - word.start) / word.Duration) * 100;
            if (wordElements[i]) {
                wordElements[i].style.setProperty('--progress', `${progress}%`);
            }
        } else if (currentTime > word.end && wordElements[i]) {
            wordElements[i].style.setProperty('--progress', '100%');
        } else if (wordElements[i]) {
            wordElements[i].style.setProperty('--progress', '0%');
        }
    }
}
function changeTitle() {
	if (document.hidden == true && audio.paused == false && jsonlyrics && !jsonlyrics.metadata.nolyric && currentLyricIndex !== -1) {
		if(document.title !== jsonlyrics.lyrics[currentLyricIndex].text){
			document.title = jsonlyrics.lyrics[currentLyricIndex].text;
		}
	}else if (document.title !== title){
		document.title = title;
	}
}
//频谱条
const barWidth = (canvas.width / bufferLength) * 2.5;
let oldAudioVisualizationModeSelection;
let startmove = 0;
let barmove = startmove;
let barmoveb = window.innerWidth;
let debug_ojb_a = document.getElementById('a');
let debug_ojb_b = document.getElementById('b');
let debug_ojb_c = document.getElementById('c');
setInterval(updateBarmove,20);
function updateBarmove() {
    barmove++;
    barmoveb--;
    if(barmove >= canvasb.width){
        barmove = startmove;
        barmoveb = window.innerWidth;
    }
    if(true){//debug
        debug_ojb_a.textContent = "barmove: "+barmove;
        debug_ojb_b.textContent = "barmoveb: "+barmoveb;
    }
}
setInterval(updatasjArray);
let oldsjdataArray;
let sjdataArray;
let jump_change;
function updatasjArray(){
    let audataArray = dataArray.slice(20,20+bufferLengthb+1);
    if(!oldsjdataArray){
        oldsjdataArray=audataArray
    }
    if(!sjdataArray){
        sjdataArray=audataArray
    }
    for(let i=0;i<audataArray.length;i++){
        if(audataArray[i]===0){
            sjdataArray[i]=0;
            continue;
        }
        const cha = audataArray[i] - oldsjdataArray[i];
        sjdataArray[i]=Math.min(Math.max(cha+sjdataArray[i],0),300)
    }
    oldsjdataArray=audataArray
    jump_change=true;
}
let oldwindowwidth = 0;
let previousHeights = [];
let previousHeightsB = [];
function drawSpectrum() {
    if(oldwindowwidth !== window.innerWidth){
        oldwindowwidth = window.innerWidth
        canvas.width = main.clientWidth - 40;
        bufferLength = Math.floor( (canvas.width + 1 ) / (barWidth + 1) );
        bufferLengthb = (Math.ceil(canvasb.width / 73)+1)*2;
        canvasb.width = window.innerWidth;
        canvasd.width = window.innerWidth;
        suijsz=[];
        for(let i=1;i<=bufferLengthb;i++){
            suijsz.push(i)
        }
        suijsz.sort(() => Math.random() - 0.5)
    }
    analyser.getByteFrequencyData(dataArray);
    if(AudioVisualizationModeSelection !== oldAudioVisualizationModeSelection){
    oldAudioVisualizationModeSelection = AudioVisualizationModeSelection;
    if(AudioVisualizationModeSelection===2){
        canvas.setAttribute('style', 'display: none;');
        canvasb.setAttribute('style', 'display: block;');
        canvasd.setAttribute('style', 'display: block;');
        alimg.setAttribute('style', 'margin-top: 100px;');
    }
    if(AudioVisualizationModeSelection===1){
        canvasb.setAttribute('style', 'display: none;');
        canvasd.setAttribute('style', 'display: none;');
        canvas.setAttribute('style', 'margin-top: 0px;');
    }
  }
  if (AudioVisualizationModeSelection===1){
    draw_a();
  }
  if (AudioVisualizationModeSelection===2){
    draw_b();
  }
  function draw_a(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
        ctx.fillStyle = "white";
        ctx.fillRect(x, canvas.height - dataArray[i], barWidth, dataArray[i]);
        x += barWidth + 1;
    }
  }
  function draw_b(){
    /*
    for(let i=0;i<rawdataArray.length;i++){
        sjdataArray.push(rawdataArray[suijsz[i]])
    }
    */
    bufferLengthb = (Math.ceil(canvasb.width / 73)+1)*2;
    startmove = window.innerWidth-bufferLengthb/2*73
    console.log(startmove+"  "+barmove)
    let max = -Infinity;
    let min = Infinity;
    for(let i = 0;i < sjdataArray.length;i++){
        if(sjdataArray[i] > max){
            max = sjdataArray[i];
        }
        if(sjdataArray[i] < min){
            min = sjdataArray[i];
        }
    }

    const frameHasNewData = jump_change;
    jump_change = false;

    ctxb.clearRect(0, 0, canvasb.width, canvasb.height);
    ctxd.clearRect(0, 0, canvasd.width, canvasd.height);
    ctxb.fillStyle = "white";
    let x = 0;
    let yic_mun=0;
    const width = canvasb.width;
    for (let i = 0; i < sjdataArray.length; i++) {
        let barHeight;
        if(frameHasNewData){
            barHeight = sjdataArray[i];
        }else if(previousHeights[i] !== undefined){
            if(previousHeights[i] > 50){
                barHeight = previousHeights[i] - 2
            }else{
                barHeight = previousHeights[i] + 2
            }
        }else{
            barHeight = 0;
        }
        previousHeights[i] = barHeight;
        ctxb.fillStyle = "white";
        if(x+barmove < width){
            ctxb.fillRect(x+barmove, 0, 60, barHeight);
            ctxb.beginPath();
            ctxb.arc(x+barmove+30, barHeight, 30, 0, 2 * Math.PI, false);
            ctxb.fill();
        }
        if(x+barmove >= width){
            yic_mun++;
            ctxb.fillRect((x+barmove)-(width+73), 0, 60, barHeight);
            ctxb.beginPath();
            ctxb.arc((x+barmove)-(width+73)+30, barHeight, 30, 0, 2 * Math.PI, false);
            ctxb.fill();
        }
        ctxb.fillStyle = "black";
        ctxb.font = "48px serif";
        ctxb.fillText(i, barmove+x<width?barmove+x:(x+barmove)-(width+73), 50);
        x += 73;
    }
    x=0;
    yic_mun = 0;
    for (let i = sjdataArray.length-1; i >= 0; i--) {
        let barHeight;
        if(frameHasNewData){
            barHeight = sjdataArray[i];
        }else if(previousHeightsB[i] !== undefined){
            if(previousHeightsB[i] > 50){
                barHeight = previousHeightsB[i] - 2
            }else{
                barHeight = previousHeightsB[i] + 2
            }
        }else{
            barHeight = 0;
        }
        previousHeightsB[i] = barHeight;
        ctxd.fillStyle = "white";
        if(x+barmoveb < width){
            ctxd.fillRect(barmoveb+x, canvasd.height - barHeight, 60, barHeight);
            ctxd.beginPath()
            ctxd.arc(barmoveb+x+30, canvasd.height - barHeight, 30, 0, 2 * Math.PI, true);
            ctxd.fill();
        }
        if(x+barmoveb >= width){
            yic_mun++;
            ctxd.fillRect((x+barmoveb)-(width+73), canvasd.height - barHeight, 60, barHeight);
            ctxd.beginPath();
            ctxd.arc((x+barmoveb)-(width+73)+30, canvasd.height - barHeight, 30, 0, 2 * Math.PI, true);
            ctxd.fill();
        }
        ctxd.fillStyle = "black";
        ctxd.font = "48px serif";
        ctxd.fillText(i, barmoveb+x<width?barmoveb+x:(x+barmoveb)-(width+73), canvasd.height - 10);
        x += 73;
    }

  }
  requestAnimationFrame(drawSpectrum);
}
canvas.width = main.clientWidth - 40;
canvasb.width = window.innerWidth;
canvasd.width = window.innerWidth;
let bufferLengthb = (Math.ceil(canvasb.width / 73)+1)*2;
bufferLength = Math.floor( (canvas.width + 1 ) / (barWidth + 1) );
audio.onplay = () => {
  audioContext.resume().then(() => {
    drawSpectrum();
  });
};
//键盘监测区
document.addEventListener('keydown', function(event) {
   if (event.key === 't' && LiteralRenderingModeSelection < LiteralRenderingModeSelectionall) {
       LiteralRenderingModeSelection++;
   }else if(event.key === 't' && LiteralRenderingModeSelection >= LiteralRenderingModeSelectionall) {
	   LiteralRenderingModeSelection = 1;
   }
   if (event.key === 'y' && AudioVisualizationModeSelection < AudioVisualizationModeSelectionall) {
       AudioVisualizationModeSelection++;
   }else if(event.key === 'y' && AudioVisualizationModeSelection >= AudioVisualizationModeSelectionall) {
	   AudioVisualizationModeSelection = 1;
   }
});
function lowupdateLyrics(){
    const currentTime = audio.currentTime;
    let newIndex = -1;
    for (let i = 0; i < jsonlyrics.lyrics.length; i++) {
        if (currentTime >= jsonlyrics.lyrics[i].time) {
            newIndex = i;
        } else {
            break;
        }
    }
	if (audio.readyState !== 4 && audio.readyState !== 3){
		lyricElement.innerHTML = "Loading music...";
		zt = 2;
		return;
	}
    if (newIndex !== currentLyricIndex && newIndex !== -1) {
        currentLyricIndex = newIndex;
        lyricElement.innerHTML = jsonlyrics.lyrics[newIndex].text;
        pairLyricElement.textContent = jsonlyrics.lyrics[newIndex].pairlyric;
        romaLyricElement.textContent = jsonlyrics.lyrics[newIndex].romanizationslyric;
    }
    if(jsonlyrics.lyrics[newIndex+1] && jsonlyrics.lyrics[newIndex+1].time - jsonlyrics.lyrics[newIndex].time > 0.2 && currentTime >= jsonlyrics.lyrics[newIndex+1].time-0.2){
        lyricElement.classList.add('fade-out');
        lyricElement.classList.remove('fade-in');
    }else{
        lyricElement.classList.remove('fade-out');
        lyricElement.classList.add('fade-in');
    }
	if(zt === 2){
        lyricElement.innerHTML = jsonlyrics.lyrics[newIndex].text;
        pairLyricElement.textContent = jsonlyrics.lyrics[newIndex].pairlyric;
        romaLyricElement.textContent = jsonlyrics.lyrics[newIndex].romanizationslyric;
		zt = 1;
	}
}

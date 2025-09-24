const audio = document.getElementById('audio');
var lyricpath = audio.getAttribute('lyricpath');
let currentLyricIndex = -1;
let wordElements = [];
var _etext = document.getElementById("lyric");
const lyricElement = document.getElementById('lyric');
const pairLyricElement = document.getElementById('pairlyric');
const shake = document.querySelector('.shake');
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
	initLyrics();
  })
function initLyrics() {
    setInterval(updateLyrics, 10);//刷新
}
function updateLyrics() {
	shake.style.animationPlayState = 'running';
	audio.addEventListener('paused', function(e){
		shake.style.animationPlayState = 'paused';
	});
    const currentTime = audio.currentTime;
                
    let newIndex = -1;
    for (let i = 0; i < jsonlyrics.lyrics.length; i++) {
        if (currentTime >= jsonlyrics.lyrics[i].time) {
            newIndex = i;
        } else {
            break;
       }
    }
                
    if (newIndex !== currentLyricIndex && newIndex !== -1) {
        currentLyricIndex = newIndex;
        displayCurrentLyric();
    }
                
    if (currentLyricIndex !== -1) {
        highlightWords(currentTime);
    }
}
function displayCurrentLyric() {
    const currentLyric = jsonlyrics.lyrics[currentLyricIndex];
    let html = '';
    
    for (let i = 0; i < currentLyric.etext.length; i++) {
        html += `<span style="--progress:0%">${currentLyric.etext[i].text}</span>`;
    }
        lyricElement.innerHTML = html;
    wordElements = lyricElement.getElementsByTagName('span');
    pairLyricElement.textContent = currentLyric.pairlyric;
}
function highlightWords(currentTime) {
    const currentLyric = jsonlyrics.lyrics[currentLyricIndex];
                
    for (let i = 0; i < currentLyric.etext.length; i++) {
        const word = currentLyric.etext[i];//简化m
        
        if (currentTime >= word.start && currentTime <= word.end) { //判断时间
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
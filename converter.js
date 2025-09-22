       lyric = document.getElementById('lyric');
       const lrcFileInput = document.getElementById('lrcFile');
       const parseBtn = document.getElementById('parseBtn');
       let lrcContent;
       parseBtn.addEventListener('click', function() {
           const file = lrcFileInput.files[0];
           if (!file) {
               alert('请先选择LRC文件');
               return;
           }
           console.log("1");
           const reader = new FileReader();
           reader.onload = function(e) {
           	     console.log("start");
                    const lrcContent = e.target.result;
                    jsonlyrics = lrctojson(lrcContent);

           };
           reader.readAsText(file);
       });
       audio.ontimeupdate=function(e) {//遗留播放器字幕控制
       for(i1=0;i1<jsonlyrics.lyrics.length;i1++) {
       	if (audio.currentTime > jsonlyrics.lyrics[i1].time) {
       		lyric.innerHTML=jsonlyrics.lyrics[i1].text;
       		pairlyric.innerHTML=jsonlyrics.lyrics[i1].pairlyric;
       	}
          }
       }

       function lrctojson(lrc) {
       	const result = {
            metadata: {},
            lyrics: [],
          };
          let text = "";
          let totalSeconds = 0;
          const lines = lrc.split('\n');
          const timeTagRegex = /^\[(\d{2}):(\d{2})\.(\d{2})\](.*)/;
          const metadataRegex = /^\[(.*?):(.*)\]$/;
          console.log("2");
          //定义正则表达式
          let i = 0;
          for (line of lines) {
               if (!line.trim()) continue;
               const metadataMatch = line.match(metadataRegex);
               if (metadataMatch) {
                   result.metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2];
                   continue;
               }
               //获取以及处理meta
               const timeMatch = line.match(timeTagRegex);
               if (timeMatch) {
                   text = timeMatch[4];
                   totalSeconds = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]) + parseInt(timeMatch[3]) / 100;//大部分为到百分位，有一些到千分位
               }
               
               //获取和处理普通时间
               const pairlyricif = result.lyrics.findIndex(user => user.time == totalSeconds);
               if (pairlyricif != -1) {
               	result.lyrics[pairlyricif].pairlyric = text;
               	continue;
               }
               //处理副歌词
               ;
               let ei = 0;
               let eljson = [];
               if (text.includes('<') && text.includes('>')) {
                const regex = /<(\d+):(\d+)\.(\d+)>/g;
                const dregex = /([^<]*)/g;
                eljson = [];
                let ttt;
                let tttc;
                while ((ttt = regex.exec(text)) !== null) {
                  if (tttc) {
                    ei++;
            	     const totalSecondsStart = parseInt(tttc[1]) * 60 + parseInt(tttc[2]) + parseInt(tttc[3]) / 100;
            	     const totalSecondsEnd = parseInt(ttt[1]) * 60 + parseInt(ttt[2]) + parseInt(ttt[3]) / 100;//大部分为到百分位，有一些到千分位
           	     const Duration = totalSecondsEnd - totalSecondsStart;
           	     tttd = text.substring(tttc.index + tttc[0].length, ttt.index);
                     tttd = tttd.replace(/ /g, '&nbsp;')
                     eljson.push({ ordinal: i, Duration: Duration.toFixed(2), start: totalSecondsStart, end: totalSecondsEnd, text: tttd });
                  }
                  tttc = ttt;
                }
               } else{
               	ei = 0;
               }
               
               //处理增强版lrc格式
               if (text) {
                   text = text.replace(/<[^>]*>/g, '');
                   result.lyrics.push({
                   	   ordinal: i,
                       time: totalSeconds.toFixed(2),
                       text: text,
                       eln: ei,
                       etext: eljson
                       
                   });
               }
               i++;
          }
       console.log(result);
       return result;
       }
import fs from "fs";
import { parseFile } from 'music-metadata';
import axios from 'axios';
import { escapeHtml, prepareDist, songHref, writeSongCatalog } from "./build-shared.js";
  function lrctojson(lrc) {
  const result = {
      metadata: {},
      lyrics: [],
    };
    let text = "";
    let totalSeconds = 0;
    lrc = lrc.replace(/^\uFEFF/, '');

    // 分割行
    const lines = lrc.split(/\r?\n/);

    const metadataRegex = /^\s*\[([a-zA-Z]+)\s*:\s*(.*?)\]\s*$/;
    const timeTagRegex = /\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?\](.*)/;
let zq = false;
    for (const line of lines) {
          if (!line.trim()) continue;
          const metadataMatch = line.match(metadataRegex);
          if (metadataMatch) {
              result.metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2].trim();
              continue;
          }
          //获取以及处理meta
          const timeMatch = line.match(timeTagRegex);
          if (timeMatch) {
              text = timeMatch[4];
      let decimal = null;
      if (timeMatch[3].toString().length === 3){
        decimal = parseInt(timeMatch[3]) / 1000;
      }else{
          decimal = parseInt(timeMatch[3]) / 100;
      }
              totalSeconds = parseInt(timeMatch[1]) * 60 + parseInt(timeMatch[2]) + decimal;//大部分为到百分位，有一些到千分位
          }
          
          //获取和处理普通时间
          const pairlyricif = result.lyrics.findIndex(lybl => lybl.time == totalSeconds);
          if (pairlyricif != -1) {
            result.lyrics[pairlyricif].pairlyric = text;
            continue;
          }
          //处理副歌词
          ;
          let eljson = [];
          if (text.includes('<') && text.includes('>')) {
  zq = true;
          const regex = /<(\d+):(\d+)\.(\d+)>/g;
          const dregex = /([^<]*)/g;
          eljson = [];
          let ttt;
          let tttc;
          while ((ttt = regex.exec(text)) !== null) {
            if (tttc) {
      let tttd = text.substring(tttc.index + tttc[0].length, ttt.index);
      tttd = tttd.replace(/<\d+:\d+\.\d+>/g, '');
      if(tttd == ''){continue;}
      let decimal = null;
      if (tttc[3].toString().length === 3){//大部分为到百分位，有一些到千分位
      decimal = parseInt(tttc[3]) / 1000
      } else{
      decimal = parseInt(tttc[3]) / 100
      }
      let decimalc = null;
      if (ttt[3].toString().length === 3){//大部分为到百分位，有一些到千分位
      decimalc = parseInt(ttt[3]) / 1000
      } else{
      decimalc = parseInt(ttt[3]) / 100
      }
              const totalSecondsStart = parseInt(tttc[1]) * 60 + parseInt(tttc[2]) + decimal;
              const totalSecondsEnd = parseInt(ttt[1]) * 60 + parseInt(ttt[2]) + decimalc;
                const Duration = totalSecondsEnd - totalSecondsStart;
                tttd = tttd.replace(/ /g, '&nbsp;')
                eljson.push({ Duration: Duration, start: totalSecondsStart, end: totalSecondsEnd, text: tttd });
            }
            tttc = ttt;
          }
          }
          
          //处理增强版lrc格式
    if (text) {
              text = text.replace(/<[^>]*>/g, '');
              result.lyrics.push({
                  time: totalSeconds,
                  text: text,
                  etext: eljson
              });
          }
    }
result.metadata.zq = zq;
  return result;
  }

let allmusicfilename = fs.readdirSync("./src/musicfile");
const nregex = /json|lrc/;
allmusicfilename = allmusicfilename.filter(item => !nregex.test(item));
await prepareDist({ clean: true });

const index = fs.readFileSync("src/indexmoban.html", "utf8");
let liebiao = "";
const songs = [];
for (const musicfilename of allmusicfilename) {
  const musicname = musicfilename.replace(/\.[^.]*$/, '');
  const lrcpath = "/musicfile/" + musicfilename.replace(/\.[^.]*$/, '.lrc');
  if (!fs.existsSync("src/musicfile/" + musicfilename.replace(/\.[^.]*$/, '.lrc'))) {
	  console.warn(`没有找到${musicfilename}的对应lrc文件`);
	  continue;
  }
  const lyriclrc = fs.readFileSync("src" + lrcpath, "utf8");
  let lyricjson = lrctojson(lyriclrc);
  fs.writeFileSync(`dist/musicfile/${musicname}.json`,JSON.stringify(lyricjson, null, 2),"utf8");
  fs.copyFileSync("src/musicfile/" + musicfilename, "dist/musicfile/" + musicfilename)
  const image = await imgload(musicfilename, lyricjson);
  songs.push({ id: musicname, title: musicname, audio: musicfilename, lyrics: `${musicname}.json`, image });
  liebiao += `<li><a href="${songHref(musicname)}">${escapeHtml(musicname)}</a></li>`
  console.log(`生成: ${musicname}`);
}
async function imgload(musicfilename, jsonlyrics){
    const image = musicfilename.replace(/\.[^.]*$/, '.jpg');
    const metadata = await parseFile(`./src/musicfile/${musicfilename}`);
    if(metadata.common.picture && metadata.common.picture.length > 0){
      const picture = metadata.common.picture[0];
      fs.writeFileSync(`./dist/musicfile/${image}`, picture.data);
      return image;
    }
    if(jsonlyrics.metadata.ti){
      try {
        const ssjg = await axios.get(`https://oiapi.net/api/Music_163?name=${encodeURIComponent(jsonlyrics.metadata.ti)}`, { timeout: 10000 });
        const imageResponse = await axios.get(ssjg.data.data[0].picurl, { responseType: 'arraybuffer', timeout: 10000 });
        fs.writeFileSync(`./dist/musicfile/${image}`, imageResponse.data)
        console.log("img ok")
        return image;
      } catch (error) {
        console.warn(`封面获取失败: ${musicfilename}`, error.message);
      }
    }
    console.warn('no img');
    return null;
}
let indexhtml = index
    .replace(/{{link}}/g, liebiao)
fs.writeFileSync(`dist/index.html`, indexhtml);
writeSongCatalog(songs);

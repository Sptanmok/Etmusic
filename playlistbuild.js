import { build } from "esbuild";
import fs from "fs";
import axios from 'axios';
import axiosRetry from 'axios-retry';
import * as cheerio from 'cheerio';
//import { console } from "inspector";
//喵喵喵！
//await fs.promises.rm('dist', { recursive: true, force: true });
const metingapi_url='https://api.qijieya.cn/meting/'//好人一生平安！
//const metingapi_url='https://api.injahow.cn/meting/'//好人一生平安！
const qqmusiclyric_api ='http://38.76.201.17:5000/'
const qqyuan = true;//我们联合起来！r
const yuming ='https://mrachritmo.emnasop.cn/'
const indexpage_max = 500;//每页歌曲数量，过大可能导致部分手机浏览器无法打开
const async_max = 1;//让暴风雨来得更猛烈些吧！
const async_downfile_max = 1;
const musicnum_max = 10000;
const user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
//const user_agent_b = "Sent by the https://github.com/Sptanmok/Mrachritmo project, thanks for your service!"
const user_agent_b = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
const jymaster = true;
let no_wyy = 0;
let sesc_ppe = 0;
//↑↑↑配置处↑↑↑
axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    // 原有条件
    if (axiosRetry.isNetworkOrIdempotentRequestError(error) ||
        error.code === 'ECONNRESET' ||
        error.message.includes('stream has been aborted')) {
      return true;
    }
    // 新增：当响应状态为 404 时也重试
    if (error.response && error.response.status === 404) {
      return true;
    }
    return false;
  }
});
if (!fs.existsSync("dist")) fs.mkdirSync("dist", { recursive: true });
if (!fs.existsSync("dist/musicfile")) fs.mkdirSync("dist/musicfile", { recursive: true });
if (!fs.existsSync("dist/musicfile/img")) fs.mkdirSync("dist/musicfile/img", { recursive: true });
await build({
  entryPoints: ["src/player2.js"],
  bundle: true,
  minify: true,
  outfile: "dist/player2.js"
});
const gedang = fs.readFileSync(`neteaseplaylist.txt`, 'utf8')
const playmusics = gedang.split(/\r?\n/);
const index = fs.readFileSync("src/indexmoban.html", "utf8");
const simplicityindexb = fs.readFileSync("src/index.html", "utf8");
const template = fs.readFileSync("src/moban.html", "utf8");
let liebiao = "";
let liebiaoj = [];
let o = 0;
let mobanc =""
let simplicitylibiao = ""
async function start(){
    let dd = 0;
    console.log("开始！");
    for(const playmusic of playmusics){
        const list = await axios.get(`${metingapi_url}?type=playlist&id=${playmusic.match(/\d+$/)}`,{headers: {'user-agent': user_agent}});
        const listd = list.data
        if(!Array.isArray(listd)){
            console.error(`歌单${playmusic.match(/\d+$/)}错误！,   它不是一个数组`);
            continue;
        }
        await jxgd(listd);
        if(o > musicnum_max) {
            break;
        }
    }
    let indexhtml = index.replace(/{{link}}/g, mobanc).replace(/previous_button_hide/g, '')
    const simplicityindexr = simplicityindexb.replace(/{{link}}/g, simplicitylibiao)
    fs.writeFileSync(`./dist/${indexpageo}.html`, indexhtml)
    fs.writeFileSync(`./dist/simplicityindex.html`, simplicityindexr)
    console.log("successfully")
}
let async_nu = 0
let yureliebiao = "";
let indexpageo = 1;
let downfile_task;
let rwd =[];
async function jxgd(listd){
    let rw =[];
    let indexpage = 0;
    for(const musicd of listd){
        o++;
        if(o > musicnum_max) {
            console.warn("音乐过多，停止生成");
            break;
        }
        while(async_nu >= async_max){
            await delay(50);
        }
        const task = amusic(musicd,  o)
        rw.push(task)
    }
    async function amusic(musicd, o){
        async_nu++;
        const musicid = musicd.url.match(/\d+$/);
        const metadata = {name:musicd.name, artist:musicd.artist}
        liebiaoj.push(metadata)
        let json = await YrcToJson(musicid[0],metadata);
        if(qqyuan){
        //替补
            let jsonq;
            if(!json.metadata.zq){
                no_wyy++;
                jsonq= await QQJsonGET(json.metadata.ti,json.metadata.ar,json.metadata.al,json);
                if(jsonq && jsonq.metadata.zq){
                    const r = json
                    json = jsonq
                    json.metadataq = json.metadata
                    json.metadata.ti = r.metadata.ti
                    json.metadata.ar = r.metadata.ar
                    json.metadata.al = r.metadata.al
                    json.metadata.CLXIIIid = r.metadata.CLXIIIid
                    json.lyrict = r
                }else if(jsonq){
                    json.lyricq = jsonq
                    sesc_ppe++;
                }else{
                    sesc_ppe++;
                }
            }
        }
        
        if(!json) {
            async_nu--;
            return;
        }
        const task = downMusicFilePut(json, musicd);
        rwd.push(task)
        mobanc +=`
            <div class="card" url="./${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html">
                <img src="./musicfile/img/${filenamecl(json.metadata.al)}.jpg" alt="${filenamecl(json.metadata.al)}专辑" class="card-image">
                <div class="card-content">
                    <div>
                        <h3 class="card-ti">${json.metadata.ti}</h3>
                        <p class="card-ar">——${filenamecl(json.metadata.ar)}</p>
                        <p class="card-al">${json.metadata.ti==json.metadata.al?"":filenamecl(json.metadata.al)}</p>
                    </div>
                </div>
            </div>`
        //liebiaoj.push({name:json.metadata.ti, artist:json.metadata.ar, album:json.metadata.al})
        simplicitylibiao += `<li><a href="./${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html" target="_blank">${json.metadata.ti} - ${json.metadata.ar}${json.metadata.ti==json.metadata.al?"":" · "+json.metadata.al}</a></li>`
        fs.writeFileSync(`dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.json`,JSON.stringify(json), "utf8")
        let ddyyweb = template
            .replace(/{{title}}/g, `${json.metadata.ti} - ${json.metadata.ar} · ${json.metadata.al}`)
            .replace(/{{filename}}/g, `${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.${jymaster?'flac':'mp3'}`)
            .replace('https://picsum.photos/400/400', `./musicfile/img/${filenamecl(json.metadata.al)}.jpg`)
        fs.writeFileSync(`./dist/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html`, ddyyweb)
        //yureliebiao += encodeURI(`${yuming}${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html`) + `\n`
        //yureliebiao += encodeURI(`${yuming}musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.mp3`) +`\n`
        console.log(`${o}:${json.metadata.ti} - ${json.metadata.ar} · ${json.metadata.al}   is ok ,${json.metadata.apimode?json.metadata.apimode:"wyy"},now ppl:${(sesc_ppe/no_wyy*100).toFixed(2)}%`);
        indexpage++;
        if(indexpage>=indexpage_max){
            let indexhtml="";
            indexhtml=index.replace(/{{link}}/g, mobanc).replace(/next_button_hide/g, '')
            //非尾页启用下一页按钮（尾页处理在start函数）
            if(indexpageo!==1){
                indexhtml = indexhtml.replace(/previous_button_hide/g, '')
            }
            //非首页启用上一页按钮
            fs.writeFileSync(`./dist/${indexpageo===1?'index':indexpageo}.html`, indexhtml)
            indexpage=0;
            mobanc=""
            indexpageo++;
        }
        async_nu--;
    }
    await Promise.all(rw);
    await Promise.all(rwd);
}
let async_downfile = 0;
async function downMusicFilePut(json,musicd){
    while(async_downfile >= async_downfile_max){
        await delay(50);
    }
    async_downfile++;
    if(!fs.existsSync(`./dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.mp3`)&&!jymaster){
        const music = await axios.get(musicd.url, { responseType: 'arraybuffer' ,headers: {'user-agent': user_agent},timeout: 60000});
        fs.writeFileSync(`./dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.mp3`,music.data)
    }
    if(!fs.existsSync(`./dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.flac`)&&jymaster){
        const music = await axios.post("http://127.0.0.1:5000/download",{"id": json.metadata.CLXIIIid,"quality": "jymaster"}, {validateStatus: function (status) {return (status==200)||(status==404);}, responseType: 'arraybuffer' ,headers: {'user-agent': user_agent},timeout: 500000});
        if(music.status===404){
            const music = await axios.get(musicd.url, { responseType: 'arraybuffer' ,headers: {'user-agent': user_agent},timeout: 60000});
            fs.writeFileSync(`./dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.mp3`,music.data)
            fs.writeFileSync(`./dist/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html`,fs.readFileSync(`./dist/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.html`,"utf8").replace("flac", "mp3"))
        }else{
            fs.writeFileSync(`./dist/musicfile/${filenamecl(json.metadata.ti)} - ${filenamecl(json.metadata.ar)} · ${filenamecl(json.metadata.al)}.flac`,music.data)
        }
    }
    async_downfile--;
}
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
function filenamecl(name) {
    if (!name) return '';

    // 1. 将可能引发问题的字符全部替换为下划线
    let result = name
        .replace(/[\\\/:*?"<>|#&+{}\[\]\^`~;=@$!,%]/g, '_') // 非法及特殊字符
        .replace(/ /g, '_')                                 // 空格
        .replace(/[\x00-\x1f\x7f]/g, '');                  // 删除控制字符

    // 2. 长度截断（保留前5和后5字符，中间加省略号）
    if (result.length > 30) {
        result = result.slice(0, 5) + ' ··· ' + result.slice(-5);
    }

    return result;
}
async function YrcToJson(musicid, meta){
    function prpdl(yrc, timesec,fault_tolerance){
        const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
        let pairif = false;
        let romaif = false;
        let pairtext = "";
        let min_pairtime = fault_tolerance?3:0.8;
        let min_romatime = fault_tolerance?3:0.8;
        if(yrc.tlyric.lyric){
            let pairlyrics = yrc.tlyric.lyric.split("\n").filter(item => timeTagRegex.test(item));
            if(yrc.ytlrc&&yrc.ytlrc.lyric){
                pairlyrics = yrc.ytlrc.lyric.split("\n").filter(item => timeTagRegex.test(item));
                min_pairtime = 0.01;
            }
            for(let i = 0; i < pairlyrics.length; i++){
                let lyricMatch = pairlyrics[i].match(timeTagRegex);
                if(!lyricMatch) continue;
                let text = lyricMatch[4]
                const decimal = lyricMatch[3] ? (lyricMatch[3].toString().length === 2 ? parseInt(lyricMatch[3]) / 100 : parseInt(lyricMatch[3]) / 1000) : 0;
                let timesecp = parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal
               if(min_pairtime > Math.abs(timesec - timesecp)){
                        min_pairtime = Math.abs(timesec - timesecp);
                        pairtext = text.replace('//', '');
                }
            }
            pairif = true;
        }
        let romatext = '';
        if(yrc.romalrc.lyric){
            let romalyrics = yrc.romalrc.lyric.split("\n").filter(item => timeTagRegex.test(item));
            if(yrc.yromalrc&&yrc.yromalrc.lyric){
                romalyrics = yrc.yromalrc.lyric.split("\n").filter(item => timeTagRegex.test(item));
                min_romatime = 0.01;
            }
            for(let i = 0; i < romalyrics.length; i++){
                let lyricMatch = romalyrics[i].match(timeTagRegex);
                if(!lyricMatch) continue;
                let text = lyricMatch[4]
                const decimal = lyricMatch[3] ? (lyricMatch[3].toString().length === 2 ? parseInt(lyricMatch[3]) / 100 : parseInt(lyricMatch[3]) / 1000) : 0;
                let timesecp = parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal
                if(min_romatime > Math.abs(timesec - timesecp)){
                    min_romatime = Math.abs(timesec - timesecp);
                    romatext = text;
                }
            }
            romaif = true;
        }
        return {pairtext,pairif,romatext,romaif};
    }
    const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
    const zqTagRegex = /\[(\d+),(\d+)?\](.*)/
    const regex = /\((\d+),(\d+),(\d+)\)(.*?)(?=\(\d+,\d+,\d+\)|$)/g;
    const datae = await axios.get(`https://music.163.com/api/song/lyric?os=pc&id=${musicid}&yv=-1&tv=-1&rv=-1&lv=-1`, {headers: {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83'},timeout: 60000})
    const yrc = datae.data;
    let json ={metadata: {zq:false,m:2}, lyrics: [],};
    let metadata_ = await metaload(musicid, meta.name)
    if(!yrc.yrc && !yrc.tlyric){
        //没有歌词（大概率纯音乐）
        json.metadata.ti = meta.name
        json.metadata.ar = meta.artist
        json.metadata.al = metadata_.albumName
        json.metadata.CLXIIIid = musicid
        json.metadata.nolyric = true
        return json;
    }
    let pdjg = {pairtext:"",pairif:false,romatext:"",romaif:false};;
    if(yrc.yrc && yrc.yrc.lyric){
        yrc.yrc.lyric = yrc.yrc.lyric.replace(/^\uFEFF/, '');
        const lyrics = yrc.yrc.lyric.split("\n");
        let i=0;
        for(const lyric of lyrics){
            i++;
            let lyricMatch = lyric.match(zqTagRegex);
            let text;
            let timesec;
            if(!lyricMatch) continue;
            text = lyricMatch[3]
            timesec = lyricMatch[1] / 1000
            let eljson = [];
            if (text.includes('(') && text.includes(')')) {
                let ttt;
                while ((ttt = regex.exec(lyric)) !== null) {
                    const Duration = ttt[2] / 1000
                    const start = ttt[1] / 1000
                    const totalSecondsEnd = (parseInt(ttt[1])+parseInt(ttt[2]))/1000
                    const texte = ttt[4].replace(/ /g, '&nbsp;')
                    eljson.push({ Duration: Duration, start: start, end: totalSecondsEnd, text: texte });
                }
                if(eljson[eljson.length-1]=='&nbsp;') eljson.pop();
                json.metadata.zq = eljson.length > 0;
            }
            text = text.replace(/\(\d+,\d+,\d+\)/g, '')
            pdjg = prpdl(yrc, timesec,false)
            if(!pdjg.pairif&&json.lyrics[i-1]?.pairlyric){
                pdjg = prpdl(yrc, timesec,true)
            }
            if(!pdjg.romaif&&json.lyrics[i-1]?.romanizationslyric){
                pdjg = prpdl(yrc, timesec,true)
            }
            json.lyrics.push({time: timesec,text: text,etext: eljson,pairlyric: pdjg.pairtext,romanizationslyric: pdjg.romatext})
        }
    }else if(yrc.lrc.lyric){//没有逐字/词歌词
        let lyrics = yrc.lrc.lyric.split("\n").filter(item => timeTagRegex.test(item))
        let i=0;
        for(const lyric of lyrics){
            i++;
            let lyricMatch = lyric.match(timeTagRegex);
            const decimal = lyricMatch[3] ? (lyricMatch[3].toString().length === 2 ? parseInt(lyricMatch[3]) / 100 : parseInt(lyricMatch[3]) / 1000) : 0;
            let timesec = parseInt(lyricMatch[1])*60+parseInt(lyricMatch[2])+decimal
            pdjg = prpdl(yrc, timesec,false)
            if(!pdjg.pairif&&json.lyrics[i-1]?.pairlyric){
                pdjg = prpdl(yrc, timesec,true)
            }
            if(!pdjg.romaif&&json.lyrics[i-1]?.romanizationslyric){
                pdjg = prpdl(yrc, timesec,true)
            }
            json.lyrics.push({time:timesec,text:lyricMatch[4],pairlyric: pdjg.pairtext,romanizationslyric: pdjg.romatext})
        }
    }else{
        json.metadata.nolyric = true
    }
    json.metadata.nolyric = json.lyrics.length===0
    json.metadata.ti = meta.name
    json.metadata.ar = meta.artist
    json.metadata.al = metadata_.albumName
    json.metadata.CLXIIIid = musicid
    json.metadata.roma = pdjg.romaif
    json.metadata.pair = pdjg.pairif
    return json;
}
let sade ='';
let sadee ='';
async function QQJsonGET(name,artist,album,yrcjson){
    function QrcMatchingYrcTimelineOffset(qrcjson, yrcjson){
        let matches = [];
        for(let i=0;i<yrcjson.length;i++){
            const liney = yrcjson[i];
            if(!liney.text || liney.text.length < 2) continue;
            let best_sim = 0;
            let nq_i = -1;
            for(let c=0;c<qrcjson.length;c++){
                const lineq = qrcjson[c];
                if(!lineq.text || lineq.text.length < 2) continue;
                const sim = stringSimilarity(liney.text, lineq.text);
                if(sim > best_sim){
                    best_sim = sim;
                    nq_i = c;
                }
            }
            if(best_sim > 0.5 && nq_i >= 0){
                matches.push({
                    sim: best_sim,
                    offset: parseFloat((liney.time - qrcjson[nq_i].time).toFixed(2))
                });
            }
        }
        if(matches.length < 3){
            console.log("Not enough matches for offset");
            return 0;
        }
        matches.sort((a, b) => b.sim - a.sim);
        let top = matches.slice(0, Math.min(10, matches.length));
        let offsets = top.map(m => m.offset);
        offsets.sort((a, b) => a - b);
        let median = offsets.length % 2
            ? offsets[Math.floor(offsets.length/2)]
            : (offsets[offsets.length/2 - 1] + offsets[offsets.length/2]) / 2;
        let mean = offsets.reduce((s, v) => s + v, 0) / offsets.length;
        let variance = offsets.reduce((s, v) => s + (v - mean) ** 2, 0) / offsets.length;
        let stddev = Math.sqrt(variance);
        if(stddev > 1.5){
            console.log(`Offset unreliable (stddev=${stddev.toFixed(2)}, pairs=${matches.length}), skipping`);
            return 0;
        }
        let filtered = offsets.filter(v => Math.abs(v - median) <= stddev);
        let finalOffset = filtered.reduce((s, v) => s + v, 0) / filtered.length;
        console.log(`Offset: ${finalOffset.toFixed(2)}s (from ${filtered.length}/${matches.length} pairs)`);
        return parseFloat(finalOffset.toFixed(2));
    }
    //const datae = await axios.get(`${qqmusiclyric_api}?name=${encodeURIComponent(name.replace(/ - .*/, ''))}&artists=${encodeURIComponent(artist.replace(/\/.*/, ''))}&album=${encodeURIComponent(album)}&cid=${i}`)
    let nme;
    /*
    try{
        nme = await axios.get(`https://api.vkeys.cn/v2/music/tencent/search/song?word=${encodeURIComponent(name.replace(/-.*$/, ''))}%20${encodeURIComponent(artist)}`)
    }catch{
        console.log("qqmusicsearchapi失效")
    }
    */
    try{
        nme = await axios.get(`http://192.168.1.9:3000/search?keyword=${encodeURIComponent(name.replace(/-.*$/, ''))}%20${encodeURIComponent(artist)}&limit=20`)
    }catch{
        console.log("qqmusicsearch备用api失效")
    }
    let mi;
    if(!nme.data.data||!Array.isArray(nme.data.data)||nme.data.data.length === 0) {sadee = `${sadee}${name} - ${artist} ~ ${album}\n`;return};
    let max=0;
    let index=-1;
    for(let i=0;i<nme.data.data.length;i++){
        const qqName = nme.data.data[i].song?nme.data.data[i].song:"";const qqArtist = nme.data.data[i].singer?nme.data.data[i].singer:"";const qqAlbum = nme.data.data[i].album?nme.data.data[i].album:"";
        const qqList = qqArtist.replace(/\([^)]*\)/g, '').replace(/ /g, "").toUpperCase().split("/");
        const wyList = artist.replace(/\([^)]*\)/g, '').replace(/ /g, "").toUpperCase().split("/");
        let a_aru = 0;
        for (const qq of qqList) { 
            for (const wy of wyList) {
                const sim = stringSimilarity(qq, wy);
                if (sim > a_aru) {
                    a_aru = sim;
                }
            }
        }
        const a_tiu = stringSimilarity(qqName.replace(/\([^)]*\)/g, '').replace(/-.*$/, '').replace(/ /g, "").toUpperCase(),name.replace(/\([^)]*\)/g, '').replace(/-.*$/, '').replace(/ /g, "").toUpperCase())
        const a_alu = album==name||qqName==qqAlbum?1:stringSimilarity(qqAlbum.replace(/\([^)]*\)/g, '').replace(/ /g, "").toUpperCase(),album.replace(/\([^)]*\)/g, '').replace(/ /g, "").toUpperCase())
        if(a_tiu+a_aru+a_alu>max+0.3){//max+3靠前搜索结果有特权
            max=a_tiu+a_aru+a_alu;
            index=i;
        }
    }
    if(!nme.data.data[index]){
        return {metadata:{zq:false,message:`未找到匹配的歌曲  .`}};
    }
    const qqName = nme.data.data[index].song?nme.data.data[index].song:"";const qqArtist = nme.data.data[index].singer?nme.data.data[index].singer:"";const qqAlbum = nme.data.data[index].album?nme.data.data[index].album:"";
    if(max<1.7){//初音ミク的歌和我初音未来的歌有什么关系呢，就算专辑名一样罢了（x
        return {metadata:{zq:false,message:`匹配度过低，放弃匹配。相似度：${max}。${qqName} - ${qqArtist} · ${qqAlbum}`}};
    }else if(index===-1){
        return {metadata:{zq:false,message:`未找到匹配的歌曲.`}};
    }
    let datae;
    /*
    try{
        datae = await axios.get(`https://api.vkeys.cn/v2/music/tencent/lyric?id=${nme.data.data[index].id}`)//api有时会出现502错误
    }catch{
        console.log("qqmusiclyricapi失效")
    }
    */
    try{
        datae = await axios.get(`http://192.168.1.9:3000/lyric?id=${nme.data.data[index].mid}&qrc=1`)
    }catch{
        console.log("qqmusiclyric备用api失效")
        return
    }
    if(!datae.data.data) return;
    let qrc={};
    qrc.orig = datae.data.data.yrc
    qrc.ts = datae.data.data.trans
    qrc.roma = datae.data.data.roma
    let qrcjson = QrcToJson(qrc,nme.data.data[0].id,0)
    qrcjson = QrcOffset(qrcjson,QrcMatchingYrcTimelineOffset(yrcjson.lyrics,qrcjson.lyrics))
    if(qrcjson){
        return qrcjson
    }
    //备用API，与前者相比能获取的歌词较少，大道至简（雾
    let datas = await axios.get(`${qqmusiclyric_api}?name=${encodeURIComponent(name.replace(/ - .*/, ''))}&artists=${encodeURIComponent(artist.replace(/\/.*/, ''))}&album=${encodeURIComponent(album)}`, {validateStatus: function (status) {return (status==500)||(status==404)||(status==200);},timeout: 60000})
    if(datas.status===500||datas.status===404||datas.data.code===404){
        return {metadata:{zq:false}};
    }
    qrcjson = QrcToJson(datas.data,datas.data.id,1)
    qrcjson = QrcOffset(qrcjson,QrcMatchingYrcTimelineOffset(yrcjson.lyrics,qrcjson.lyrics))
    qrcjson.metadata.apimode = 2;
    //qrcjson.metadata.nmess = nme.data;//调试用
    return qrcjson
}
function QrcOffset(json,offset){
    if(offset<3){
        return json;
    }
    let qrc=json;
    for(let i=0;i<qrc.lyrics.length;i++){
        qrc.lyrics[i].time += offset;
        for(let c=0;c<qrc.lyrics[i].etext.length;c++){
            qrc.lyrics[i].etext[c].start += offset;
            qrc.lyrics[i].etext[c].end += offset;
        }
    }
    qrc.metadata.offset=offset
    return qrc;
}
function QrcToJson(qrcd,id, apinu){
    let qrc = qrcd;
    const metadataRegex = /^\s*\[([a-zA-Z]+)\s*:\s*(.*?)\]\s*$/;
    const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
    const zqTagRegex = /\[(\d+),(\d+)?\](.*)/
    const regex = /(.*?)\((\d+),(\d+)\)/g;
    function prpdlq(qrc, timesec,apinu){
        const timeTagRegex = /\[(\d+):(\d+)(?:[.:](\d+))?\](.*)/;
        const zqTagRegex = /\[(\d+),(\d+)?\](.*)/
        let pairif = false;
        let romaif = false;
        let pairtext = "";
        let min_pairtime = 3;
        let min_romatime = 3;
        if(qrc.ts){
            let pairlyrics;
            let lyricMatch;
            if(apinu===0){
                pairlyrics = qrc.ts.split("\n").filter(item => timeTagRegex.test(item));
            }
            if(apinu===1){
                pairlyrics = qrc.ts.split("\n").filter(item => zqTagRegex.test(item));
            }
            for(let i = 0; i < pairlyrics.length; i++){
                lyricMatch = apinu===0?pairlyrics[i].match(timeTagRegex):pairlyrics[i].match(zqTagRegex);
                if(!lyricMatch) continue;
                let text = apinu===0?lyricMatch[4]:lyricMatch[3]
                const decimal = apinu===0?(lyricMatch[3] ? (lyricMatch[3].toString().length === 2 ? parseInt(lyricMatch[3]) / 100 : parseInt(lyricMatch[1])/1000):0):0
                let timesecp = apinu===0?parseInt(lyricMatch[1]) * 60 + parseInt(lyricMatch[2]) + decimal:lyricMatch[1]/1000
                if(min_pairtime > Math.abs(timesec - timesecp)){
                        min_pairtime = Math.abs(timesec - timesecp);
                        pairtext = text.replace('//', '');//TX特有的局部无翻译文本的替换字符
                }
            }
            pairif = true;
        }
        let romatext = '';
        if(qrc.roma){
            const romalyrics = qrc.roma.split("\n").filter(item => zqTagRegex.test(item));
            for(let i = 0; i < romalyrics.length; i++){
                let lyricMatch = romalyrics[i].match(zqTagRegex);
                if(!lyricMatch) continue;
                let text = lyricMatch[3].replace(/\([^)]*\)/g, '')
                let timesecp = parseInt(lyricMatch[1])/1000
                if(min_romatime > Math.abs(timesec - timesecp)){
                    min_romatime = Math.abs(timesec - timesecp);
                    romatext = text;
                }
            }
            romaif = true;
        }
        return {pairtext,pairif,romatext,romaif};
    }
    let json ={metadata: {zq:false,m:2}, lyrics: [],};
    if(qrc.orig){
        let pdjg;
        qrc.orig = qrc.orig.replace(/^\uFEFF/, '');
        const lyrics = qrc.orig.split("\n");
        for(const lyric of lyrics){
            const metadataMatch = lyric.match(metadataRegex);
            if (metadataMatch) {
                 json.metadata[metadataMatch[1].toLowerCase()] = metadataMatch[2].trim();
                 continue;
            }
            let lyricMatch = lyric.match(zqTagRegex);
            let text;
            let timesec;
            if(!lyricMatch) continue;
            text = lyricMatch[3]
            timesec = lyricMatch[1] / 1000
            let eljson = [];
            if (text.includes('(') && text.includes(')')) {
                let ttt;
                let i = 0;
                while ((ttt = regex.exec(lyric.replace(/\[.*?\]/g, '')))) {
                    const Duration = parseInt(ttt[3]) / 1000
                    const start = parseInt(ttt[2]) / 1000
                    const totalSecondsEnd = (parseInt(ttt[2])+parseInt(ttt[3]))/1000
                    const texte = ttt[1].replace(/ /g, '&nbsp;')
                    eljson.push({ Duration: Duration, start: start, end: totalSecondsEnd, text: texte });
                }
                if(eljson[eljson.length-1]=='&nbsp;') eljson.pop();
                json.metadata.zq = eljson.length > 0;
            }
            text = text.replace(/\(\d+,\d+\)/g, '')
            pdjg = prpdlq(qrc, timesec, apinu)
            json.lyrics.push({time: timesec,text: text,etext: eljson,pairlyric: pdjg.pairtext,romanizationslyric: pdjg.romatext})
        }
        json.metadata.nolyric = json.lyrics.length === 0;
        json.metadata.roma = pdjg?pdjg.romaif:false
        json.metadata.pair = pdjg?pdjg.pairif:false
    }else{
        json.metadata.nolyric =true;
        json.metadata.zq = false;
        json.metadata.roma = false;
        json.metadata.pair = false;
    }
    json.metadata.qqmusicid = id;
    return json;
}
let picerr = '';
async function metaload(musicid, name){
    const pijt = await axios.get(`https://music.163.com/song?id=${musicid}`, {headers: {'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36'}});
    const $ = cheerio.load(pijt.data);
    let albumName = '';let albumLink = '';
    $('a[href*="/album?id="]').each((index, element) => {
        const $link = $(element);
        const parentText = $link.parent().text();
        if (parentText.includes('所属专辑：')) {
            albumLink = $link.attr('href');
            if (albumLink && !albumLink.startsWith('http')) {
                albumName = $link.text().trim();
                albumLink = `https://music.163.com${albumLink}`;
            }
            return false;
        }
    });
    if(!fs.existsSync(`dist/musicfile/img/${filenamecl(albumName)}.jpg`)){
        const dataSrcList = [];
        $('img[data-src]').each((index, element) => {
            const dataSrc = $(element).attr('data-src');
            if (dataSrc) {
            dataSrcList.push(dataSrc);
            }
        });
        const imageResponse = await axios.get(dataSrcList[0], { responseType: 'arraybuffer' ,timeout: 30000});
        fs.writeFile(`./dist/musicfile/img/${filenamecl(albumName)}.jpg`, imageResponse.data, (err) => {//以专辑名作为名称，减少空间浪费
            picerr+=err?`${err}\n`:''
            yureliebiao += encodeURI(`${yuming}musicfile/img/${filenamecl(albumName)}.jpg`) +`\n`
        });
    }
    return {albumName,albumLink};
}
fs.copyFileSync("src/player2.css", "dist/player2.css");
fs.copyFileSync("src/index.css", "dist/index.css");
fs.copyFileSync("src/DSC00485.webp", "dist/DSC00485.webp");
fs.copyFileSync("src/Saira-Light.woff2", "dist/Saira-Light.woff2");
fs.copyFileSync("src/LXGWWenKai-Light.woff2", "dist/LXGWWenKai-Light.woff2");
await start()
fs.writeFileSync(`./nonono.txt`,sade)
fs.writeFileSync(`./nononono.txt`,sadee)
fs.writeFileSync(`./picerr.txt`,picerr)
fs.writeFileSync(`./yureurl.txt`,yureliebiao)
/*
function sjzzh(sjzx){
    sjz = parseInt(sjzx);
    const min = Math.floor(sjz / 60000);
    const sec = Math.floor(sjz / 1000);
    const decimal = sjz / 1000 - Math.floor(sjz / 1000);
    const zzxs = decimal.toFixed(3)
    return `${min}:${sec}.${zzxs}`
}

axiosRetry(axios, {
  //不包括api.vkeys.cn api
  retries: 3,
  retryDelay: (retryCount) => {
    return axiosRetry.exponentialDelay(retryCount);
  },
  retryCondition: (error) => {
    return (axiosRetry.isNetworkError(error) || 
           axiosRetry.isRetryableError(error) ||
           (error.response && error.response.status !== 200))&&error.response.status !== 502
  },
  shouldResetTimeout: true
});
*/
function stringSimilarity(a, b) {
    const strA = a == null ? '' : String(a);
    const strB = b == null ? '' : String(b);
    const lenA = strA.length, lenB = strB.length;
    // 空串情况
    if (lenA === 0 && lenB === 0) return 1;
    if (lenA === 0 || lenB === 0) return 0;

    // 前一行的编辑距离数组，初始为0..lenB
    let prev = Array.from({ length: lenB + 1 }, (_, i) => i);
    let curr = new Array(lenB + 1);

    for (let i = 1; i <= lenA; i++) {
        curr[0] = i; // 第一列值 = i（删除a的字符数）
        for (let j = 1; j <= lenB; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            // 插入、删除、替换的最小代价
            curr[j] = Math.min(
                curr[j - 1] + 1,   // 插入
                prev[j] + 1,       // 删除
                prev[j - 1] + cost // 替换
            );
        }
        // 交换当前行与前行，复用数组
        [prev, curr] = [curr, prev];
    }

    const distance = prev[lenB]; // 最终编辑距离
    return 1 - distance / Math.max(lenA, lenB);
}
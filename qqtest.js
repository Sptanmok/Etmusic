import axios from 'axios';
const user_agent_b = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.83 Safari/537.36"
const data = await QQJsonGET("Caerus","Motorama","Caerus")
console.log(data.metadata)
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
    let nme = await axios.get(`https://api.vkeys.cn/v2/music/tencent/search/song?word=${encodeURIComponent(name.replace(/-.*$/, ''))}`,{validateStatus: function (status) {return (status==200)||(status==502)||(status==500);},headers: {'user-agent': user_agent_b},timeout: 10000})
    while(!nme||nme.status!==200){
        console.error("api.vkeys.cn Request failed_       sss")
        await delay(1000);
        nme = await axios.get(`https://api.vkeys.cn/v2/music/tencent/search/song?word=${encodeURIComponent(name.replace(/-.*$/, ''))}`,{validateStatus: function (status) {return (status==200)||(status==502)||(status==500);},headers: {'user-agent': user_agent_b},timeout: 10000})
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
        if(a_tiu+a_aru+a_alu>max+0.3){//后面的权重低
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
    let datae = await axios.get(`https://api.vkeys.cn/v2/music/tencent/lyric?id=${nme.data.data[index].id}`,{validateStatus: function (status) {return (status==200)||(status==502)||(status==500);},headers: {'user-agent': user_agent_b},timeout: 10000})//api有时会出现502错误
    while(!datae||datae.status!==200){
        console.error("api.vkeys.cn Request failed")
        await delay(1000);
        datae = await axios.get(`https://api.vkeys.cn/v2/music/tencent/lyric?id=${nme.data.data[index].id}`,{validateStatus: function (status) {return (status==200)||(status==502)||(status==500);},headers: {'user-agent': user_agent_b},timeout: 10000})
        .catch(err => {
        if (err.code === 'ECONNABORTED') {
            console.error('api.vkeys.cn请求超时！');
        }
        });
    }
    if(!datae.data.data) return;
    let qrc={};
    qrc.orig = datae.data.data.yrc
    qrc.ts = datae.data.data.trans
    qrc.roma = datae.data.data.roma
    let qrcjson = QrcToJson(qrc,nme.data.data[index].id,0)
    if(qrcjson){
        return qrcjson
    }
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
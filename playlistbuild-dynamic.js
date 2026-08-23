import fs from "fs";
import path from "path";
import axios from "axios";
import { downMusicFilePut, resolveSong, songManifest } from "./playlistbuild.js";

const metingapi_url = "https://api.qijieya.cn/meting/";
const user_agent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/85.0.4183.83 Safari/537.36";
const statePath = "dist/.playlist-state.json";
const musicRoot = path.resolve("dist/musicfile");
const concurrency = 4;

function sourceOf(musicd) {
  const match = musicd.url && musicd.url.match(/\d+$/);
  return {
    id: match ? match[0] : "",
    url: musicd.url || "",
    name: musicd.name || "",
    artist: musicd.artist || ""
  };
}

function signature(source) {
  return JSON.stringify(source);
}

function loadState() {
  try {
    const state = JSON.parse(fs.readFileSync(statePath, "utf8"));
    return state && state.playlists ? state : { version: 1, playlists: {} };
  } catch {
    return { version: 1, playlists: {} };
  }
}

function entriesOf(playlists) {
  return Object.values(playlists).flatMap((playlist) => Array.isArray(playlist?.entries) ? playlist.entries : []);
}

function fileExists(relativePath) {
  return Boolean(relativePath) && fs.existsSync(path.join(musicRoot, relativePath));
}

function songFilesExist(song) {
  return song && fileExists(song.audio) && fileExists(song.lyrics) && (!song.image || fileExists(song.image));
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  async function run() {
    while (cursor < items.length) {
      const index = cursor++;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run));
  return results;
}

async function updateEntry(musicd, previous) {
  const source = sourceOf(musicd);
  if (!source.id) return null;
  const currentSignature = signature(source);
  if (previous?.signature === currentSignature && songFilesExist(previous.song)) {
    return previous;
  }

  console.log(`${previous ? "更新" : "新增"}: ${musicd.name} - ${musicd.artist}`);
  try {
    const resolved = await resolveSong(musicd);
    if (!resolved) return previous || null;

    const song = songManifest(resolved.json);
    await downMusicFilePut(resolved.json, musicd, song, { force: Boolean(previous) });
    await fs.promises.writeFile(
      path.join(musicRoot, song.lyrics),
      JSON.stringify(resolved.json),
      "utf8"
    );
    return { source, signature: currentSignature, song };
  } catch (error) {
    console.warn(`更新失败，保留旧记录: ${source.id}`, error.message);
    return previous || null;
  }
}

function safeResourcePath(relativePath) {
  if (!relativePath) return null;
  const target = path.resolve(musicRoot, relativePath);
  return target.startsWith(`${musicRoot}${path.sep}`) ? target : null;
}

async function removeUnusedFiles(previousEntries, currentEntries) {
  const currentFiles = new Set();
  for (const entry of currentEntries) {
    for (const key of ["audio", "lyrics", "image"]) {
      if (entry.song?.[key]) currentFiles.add(entry.song[key]);
    }
  }

  const removed = new Set();
  for (const entry of previousEntries) {
    for (const key of ["audio", "lyrics", "image"]) {
      const relativePath = entry.song?.[key];
      if (!relativePath || currentFiles.has(relativePath) || removed.has(relativePath)) continue;
      const target = safeResourcePath(relativePath);
      if (target) {
        await fs.promises.rm(target, { force: true });
        removed.add(relativePath);
      }
    }
  }
  return removed.size;
}

async function fetchPlaylist(id) {
  const response = await axios.get(`${metingapi_url}?type=playlist&id=${id}`, {
    headers: { "user-agent": user_agent },
    timeout: 60000
  });
  if (!Array.isArray(response.data)) throw new Error("playlist response is not an array");
  return response.data;
}

async function writeJsonAtomic(file, value) {
  const temporary = `${file}.tmp`;
  await fs.promises.writeFile(temporary, JSON.stringify(value), "utf8");
  await fs.promises.rm(file, { force: true });
  await fs.promises.rename(temporary, file);
}

async function main() {
  fs.mkdirSync(path.join(musicRoot, "img"), { recursive: true });
  const state = loadState();
  const nextPlaylists = {};
  const playlistIds = [...new Set(
    fs.readFileSync("neteaseplaylist.txt", "utf8")
      .split(/\r?\n/)
      .map((line) => line.match(/\d+$/)?.[0])
      .filter(Boolean)
  )];
  let changed = 0;
  let failed = 0;
  let successfulPlaylists = 0;
  let expectedItems = 0;

  for (const playlistId of playlistIds) {
    const previousPlaylist = state.playlists[playlistId];
    let list;
    try {
      list = await fetchPlaylist(playlistId);
    } catch (error) {
      failed++;
      console.warn(`歌单 ${playlistId} 获取失败，保留旧记录:`, error.message);
      if (previousPlaylist) nextPlaylists[playlistId] = previousPlaylist;
      continue;
    }
    successfulPlaylists++;

    const previousEntries = new Map(
      (Array.isArray(previousPlaylist?.entries) ? previousPlaylist.entries : [])
        .filter((entry) => entry?.source?.id)
        .map((entry) => [entry.source.id, entry])
    );
    const uniqueSongs = [...new Map(list.map((musicd) => [sourceOf(musicd).id, musicd])).values()]
      .filter((musicd) => sourceOf(musicd).id);
    expectedItems += uniqueSongs.length;
    const entries = await mapLimit(uniqueSongs, concurrency, async (musicd) => {
      const source = sourceOf(musicd);
      const previous = previousEntries.get(source.id);
      const entry = await updateEntry(musicd, previous);
      if (entry && (!previous || entry.signature !== previous.signature)) changed++;
      if (!entry) failed++;
      return entry;
    });
    nextPlaylists[playlistId] = { entries: entries.filter(Boolean) };
  }

  const currentEntries = entriesOf(nextPlaylists);
  if (!successfulPlaylists) {
    throw new Error("所有歌单请求均失败，保留现有文件不变");
  }
  const previousEntries = entriesOf(state.playlists);
  if (expectedItems > 0 && currentEntries.length === 0 && previousEntries.length === 0) {
    throw new Error("歌单有歌曲但没有成功处理任何条目，保留现有文件不变");
  }
  const removed = await removeUnusedFiles(previousEntries, currentEntries);
  const songs = [];
  const seen = new Set();
  for (const entry of currentEntries) {
    if (entry.song && !seen.has(entry.song.id)) {
      seen.add(entry.song.id);
      songs.push(entry.song);
    }
  }

  await writeJsonAtomic(statePath, { version: 1, updatedAt: new Date().toISOString(), playlists: nextPlaylists });
  await writeJsonAtomic("dist/songs.json", songs);
  console.log(`完成: ${changed} 项更新, ${removed} 个孤立文件已删除, ${failed} 项失败`);
}

main().catch((error) => {
  console.error("增量更新失败:", error);
  process.exitCode = 1;
});

import { build } from "esbuild";
import fs from "fs";

const staticAssets = [
  "player2.css",
  "index.css",
  "DSC00485.webp",
  "Saira-Light.woff2",
  "LXGWWenKai-Light.woff2",
];

export async function prepareDist({ clean = false } = {}) {
  if (clean) {
    await fs.promises.rm("dist", { recursive: true, force: true });
  }

  fs.mkdirSync("dist/musicfile/img", { recursive: true });
  if (!clean) {
    for (const entry of fs.readdirSync("dist", { withFileTypes: true })) {
      if (entry.isFile() && (entry.name.endsWith(".html") || entry.name === "player2.js")) {
        fs.unlinkSync(`dist/${entry.name}`);
      }
    }
  }

  await build({
    entryPoints: ["src/player-page.js"],
    bundle: true,
    minify: true,
    outfile: "dist/player.js",
  });

  fs.copyFileSync("src/moban.html", "dist/player.html");
  for (const asset of staticAssets) {
    fs.copyFileSync(`src/${asset}`, `dist/${asset}`);
  }
}

export function songHref(id) {
  return `./player.html?s=${encodeURIComponent(id)}`;
}

export function writeSongCatalog(songs) {
  fs.writeFileSync("dist/songs.json", JSON.stringify(songs), "utf8");
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
}

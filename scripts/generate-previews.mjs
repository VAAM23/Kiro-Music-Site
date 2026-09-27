import { mkdir, writeFile } from "node:fs/promises";

// Illustrated previews follow the real app's layout; replace with actual captures before launch.
const variants = [
  {
    file: "player.svg",
    tab: "Search",
    title: "Midnight drive",
    artist: "Now playing",
    content: `<rect x="38" y="541" width="384" height="42" rx="12" fill="#222a43"/><text x="57" y="568" fill="#afbdd6" font-size="13">Song, artist...</text><rect x="336" y="545" width="81" height="34" rx="9" fill="url(#button)"/><text x="352" y="567" fill="white" font-size="12" font-weight="700">Search</text><text x="40" y="627" fill="#e6eaf8" font-size="15">Your next favorite song starts here.</text><text x="40" y="655" fill="#8796b2" font-size="12">Search YouTube and press play.</text>`,
  },
  {
    file: "lyrics.svg",
    tab: "Lyrics",
    title: "Midnight drive",
    artist: "Now playing",
    content: `<text x="40" y="578" fill="#8392b1" font-size="14">And all the lights are fading</text><text x="40" y="616" fill="#70d9ff" font-size="19" font-weight="700">We are right where we belong</text><text x="40" y="654" fill="#8392b1" font-size="14">Let the rhythm take us home</text>`,
  },
  {
    file: "playlists.svg",
    tab: "Playlists",
    title: "Midnight drive",
    artist: "Now playing",
    content: `<text x="40" y="570" fill="#e7ecfa" font-size="16" font-weight="700">Your playlists</text><rect x="38" y="586" width="384" height="55" rx="12" fill="#222a43"/><circle cx="70" cy="614" r="17" fill="#654aba"/><text x="62" y="621" fill="white" font-size="17">♫</text><text x="101" y="620" fill="#e7ecfa" font-size="14">Late night favorites</text><rect x="38" y="651" width="384" height="45" rx="12" fill="#222a43"/><text x="57" y="679" fill="#e7ecfa" font-size="14">Songs to keep close</text>`,
  },
];

await mkdir(new URL("../public/previews/", import.meta.url), {
  recursive: true,
});
for (const view of variants) {
  const tabs = ["Search", "Playlists", "Favorites", "Lyrics"]
    .map((tab, i) => {
      const x = [42, 135, 248, 355][i];
      const selected = view.tab === tab;
      return `<text x="${x}" y="512" fill="${selected ? "#70d9ff" : "#94a1ba"}" font-size="13" font-weight="${selected ? 700 : 500}">${tab}</text>${selected ? `<rect x="${x}" y="521" width="45" height="2" rx="1" fill="#70d9ff"/>` : ""}`;
    })
    .join("");
  const bars = Array.from({ length: 32 }, (_, i) => {
    const height = 12 + Math.round(Math.sin(i * 1.7) ** 2 * 67);
    return `<rect x="${28 + i * 13}" y="${226 - height / 2}" width="5" height="${height}" rx="2.5" fill="${i % 4 === 0 ? "#b497fb" : "#63cbef"}" opacity=".78"/>`;
  }).join("");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 720" role="img" aria-label="Illustrated Kiro Music ${view.tab} interface preview"><defs><linearGradient id="button" x2="1" y2="1"><stop stop-color="#5586fa"/><stop offset="1" stop-color="#38c9ed"/></linearGradient><linearGradient id="surface" x2="0" y2="1"><stop stop-color="#1b2138"/><stop offset="1" stop-color="#101725"/></linearGradient><radialGradient id="art"><stop stop-color="#7d6dbd"/><stop offset=".55" stop-color="#414382"/><stop offset="1" stop-color="#192947"/></radialGradient></defs><rect width="460" height="720" rx="20" fill="url(#surface)"/><rect x="1" y="1" width="458" height="718" rx="19" fill="none" stroke="#4a5375" opacity=".8"/><circle cx="31" cy="32" r="5" fill="#63cef4"/><text x="45" y="37" fill="#f1f4ff" font-family="Segoe UI,Arial,sans-serif" font-size="17" font-weight="700">Kiro <tspan fill="#abb7cb" font-weight="400">Music</tspan></text><text x="374" y="37" fill="#9eaac1" font-family="Segoe UI,Arial,sans-serif" font-size="14">✦  ▭  ×</text><rect x="20" y="63" width="420" height="265" rx="18" fill="#141e35"/><g>${bars}</g><circle cx="230" cy="221" r="76" fill="url(#art)" stroke="#aaa0dc" stroke-width="2"/><circle cx="230" cy="221" r="64" fill="none" stroke="#a5bdf8" opacity=".4"/><path d="M174 264 Q227 150 284 265" fill="none" stroke="#b5a2ee" opacity=".4" stroke-width="12"/><text x="230" y="359" text-anchor="middle" fill="#f0f2ff" font-family="Segoe UI,Arial,sans-serif" font-size="19" font-weight="700">${view.title}</text><text x="230" y="381" text-anchor="middle" fill="#aebad1" font-family="Segoe UI,Arial,sans-serif" font-size="13">${view.artist}</text><text x="25" y="423" fill="#9caac7" font-size="11">0:42</text><rect x="72" y="414" width="316" height="5" rx="2.5" fill="#4b536d"/><rect x="72" y="414" width="116" height="5" rx="2.5" fill="#71b9f4"/><circle cx="188" cy="416.5" r="7" fill="#c7ebfc"/><text x="400" y="423" fill="#9caac7" font-size="11">3:16</text><text x="169" y="474" fill="#d3dcf0" font-size="22">‹‹</text><circle cx="230" cy="459" r="24" fill="#f3f5ff"/><path d="M225 448 L225 469 L243 459 Z" fill="#141c30"/><text x="279" y="474" fill="#d3dcf0" font-size="22">››</text><path d="M20 488 H440" stroke="#46506b" opacity=".55"/>${tabs}<g font-family="Segoe UI,Arial,sans-serif">${view.content}</g></svg>`;
  await writeFile(
    new URL(`../public/previews/${view.file}`, import.meta.url),
    svg,
  );
}

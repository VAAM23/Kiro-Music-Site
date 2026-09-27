// Only the public distribution repository is a source of release data.
const RELEASE_REPO = "VAAM23/Kiro-Music-Site";
const RELEASE_API =
  "https://api.github.com/repos/VAAM23/Kiro-Music-Site/releases/latest";
const MAC_APPLE = /(?:^|[._-])(?:aarch64|arm64)(?:[._-]|$)/i;
const MAC_INTEL = /(?:^|[._-])(?:x64|x86_64|amd64)(?:[._-]|$)/i;

function safeGitHubUrl(raw, path) {
  try {
    const url = new URL(raw);
    return (
      url.protocol === "https:" &&
      url.hostname === "github.com" &&
      url.pathname
        .toLowerCase()
        .startsWith(`/${RELEASE_REPO.toLowerCase()}/${path}/`) &&
      !url.username &&
      !url.password &&
      !url.search &&
      !url.hash
    );
  } catch {
    return false;
  }
}

export function mapAssets(assets) {
  if (!Array.isArray(assets)) return {};
  const installers = assets.filter(
    (item) =>
      typeof item?.name === "string" &&
      typeof item?.browser_download_url === "string" &&
      safeGitHubUrl(item.browser_download_url, "releases/download"),
  );
  const pick = (...formats) =>
    formats
      .map((format) => installers.find((asset) => format.test(asset.name)))
      .find(Boolean)?.browser_download_url;
  const downloads = {};
  downloads.windows = pick(/\.exe$/i, /\.msi$/i);
  downloads.linux = pick(/\.appimage$/i, /\.deb$/i, /\.rpm$/i);
  const dmg = installers.filter((asset) => /\.dmg$/i.test(asset.name));
  downloads.macosAppleSilicon = dmg.find((asset) =>
    MAC_APPLE.test(asset.name),
  )?.browser_download_url;
  downloads.macosIntel = dmg.find((asset) =>
    MAC_INTEL.test(asset.name),
  )?.browser_download_url;
  downloads.macos = dmg.find(
    (asset) => !MAC_APPLE.test(asset.name) && !MAC_INTEL.test(asset.name),
  )?.browser_download_url;
  return Object.fromEntries(Object.entries(downloads).filter(([, url]) => url));
}

export async function getLatestRelease({ fetcher = fetch } = {}) {
  try {
    const response = await fetcher(RELEASE_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "kiro-music-site",
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) return null;
    const release = await response.json();
    const downloads = mapAssets(release.assets);
    if (
      !Object.keys(downloads).length ||
      !safeGitHubUrl(release.html_url, "releases/tag") ||
      typeof release.tag_name !== "string" ||
      !/^v\d+\.\d+\.\d+$/.test(release.tag_name)
    )
      return null;
    return {
      version: release.tag_name,
      url: release.html_url,
      notes:
        typeof release.body === "string"
          ? release.body.trim().slice(0, 650)
          : "",
      downloads,
    };
  } catch (error) {
    console.warn(
      `Release unavailable at build time (${error instanceof Error ? error.message : "unknown error"}).`,
    );
    return null;
  }
}

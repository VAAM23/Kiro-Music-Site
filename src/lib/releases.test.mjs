import test from "node:test";
import assert from "node:assert/strict";
import { getLatestRelease, isNewerVersion, mapAssets } from "./releases.mjs";

const asset = (name, repo = "Kiro-Music-Site") => ({
  name,
  browser_download_url: `https://github.com/VAAM23/${repo}/releases/download/v1.2.3/${name}`,
});
const assets = [
  asset("kiro-setup.exe"),
  asset("kiro.msi"),
  asset("kiro-aarch64.dmg"),
  asset("kiro-x64.dmg"),
  asset("kiro.AppImage"),
  asset("kiro.deb"),
  asset("kiro.rpm"),
  asset("kiro-setup.exe.sig"),
  asset("kiro-aarch64.tar.gz"),
  asset("latest.json"),
];

test("maps public installers by OS and macOS architecture without updater artifacts", () => {
  assert.deepEqual(mapAssets(assets), {
    windows: assets[0].browser_download_url,
    linux: assets[4].browser_download_url,
    macosAppleSilicon: assets[2].browser_download_url,
    macosIntel: assets[3].browser_download_url,
  });
  assert.deepEqual(
    mapAssets([asset("kiro.msi"), asset("kiro.rpm"), asset("kiro.dmg")]),
    {
      windows: asset("kiro.msi").browser_download_url,
      linux: asset("kiro.rpm").browser_download_url,
      macos: asset("kiro.dmg").browser_download_url,
    },
  );
  assert.deepEqual(
    mapAssets([
      asset("latest.json"),
      asset("kiro.exe.sig"),
      asset("kiro.tar.gz"),
    ]),
    {},
  );
  assert.deepEqual(mapAssets([asset("private.exe", "Kiro-Music")]), {});
  assert.deepEqual(
    mapAssets([
      {
        name: "bad.exe",
        browser_download_url: "https://elsewhere.test/malware.exe",
      },
    ]),
    {},
  );
});

test("fetches only the public site release and returns platform URLs", async () => {
  const fetcher = async (url) => {
    assert.equal(
      url,
      "https://api.github.com/repos/VAAM23/Kiro-Music-Site/releases/latest",
    );
    return {
      ok: true,
      json: async () => ({
        tag_name: "v1.2.3",
        body: "New playlist tools",
        html_url:
          "https://github.com/VAAM23/Kiro-Music-Site/releases/tag/v1.2.3",
        assets,
      }),
    };
  };
  const result = await getLatestRelease({ fetcher });
  assert.equal(result.version, "v1.2.3");
  assert.equal(result.notes, "New playlist tools");
  assert.equal(result.downloads.macosIntel, assets[3].browser_download_url);
});

test("fails closed if a public installer release does not exist", async () => {
  assert.equal(
    await getLatestRelease({
      fetcher: async () => ({ ok: false, status: 404 }),
    }),
    null,
  );
  assert.equal(
    await getLatestRelease({
      fetcher: async () => {
        throw new Error("offline");
      },
    }),
    null,
  );
  assert.equal(
    await getLatestRelease({
      fetcher: async () => ({
        ok: true,
        json: async () => ({
          tag_name: "v1.2.3",
          assets: [asset("latest.json")],
        }),
      }),
    }),
    null,
  );
});

test("isNewerVersion compares release tags and fails closed on invalid input", () => {
  assert.equal(isNewerVersion("v0.2.5", "v0.2.4"), true);
  assert.equal(isNewerVersion("v0.2.4", "v0.2.5"), false);
  assert.equal(isNewerVersion("v0.2.4", "v0.2.4"), false);
  assert.equal(isNewerVersion("v1.0.0", "v0.9.9"), true);
  assert.equal(isNewerVersion("v0.10.0", "v0.9.0"), true);
  assert.equal(isNewerVersion("v1.2.3", ""), true);
  assert.equal(isNewerVersion("v1.2.3", null), true);
  assert.equal(isNewerVersion("not-a-version", "v0.2.4"), false);
  assert.equal(isNewerVersion("", "v0.2.4"), false);
});

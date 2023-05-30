import WebTorrent from "webtorrent";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = new WebTorrent();

const torrentId =
  "magnet:?xt=urn:btih:08ada5a7a6183aae1e09d831df6748d566095a10&dn=Sintel&tr=udp%3A%2F%2Fexplodie.org%3A6969&tr=udp%3A%2F%2Ftracker.coppersurfer.tk%3A6969&tr=udp%3A%2F%2Ftracker.empire-js.us%3A1337&tr=udp%3A%2F%2Ftracker.leechers-paradise.org%3A6969&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337&tr=wss%3A%2F%2Ftracker.btorrent.xyz&tr=wss%3A%2F%2Ftracker.fastcast.nz&tr=wss%3A%2F%2Ftracker.openwebtorrent.com&ws=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2F&xs=https%3A%2F%2Fwebtorrent.io%2Ftorrents%2Fsintel.torrent";

const downloadPath = path.join(__dirname, "downloads");

client.add(torrentId, {path: downloadPath} , function (torrent) {
  // Download
  torrent.on("download", function (bytes) {
    console.log("just downloaded: " + bytes);
    console.log("total downloaded: " + torrent.downloaded);
    console.log("download speed: " + torrent.downloadSpeed);
    console.log("progress: " + torrent.progress);
  });

  torrent.on("done", function () {
    console.log("torrent download finished");
  });
});

console.log("hello");

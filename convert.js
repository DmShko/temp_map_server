const fs = require("fs");
var _ = require("lodash");
const { Image, Canvas } = require("canvas");
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>

    <img src='./public/map/map.jpg' alt='ocean temp map' width=3600 height=1800></img>
   
    <div id="root"></div>
    <script type="module" src="./convert.js"></script>
  </body>
</html>
`);

let sourceimage = dom.window.document.querySelector("img");
const newCanvas = new Canvas(sourceimage.width, sourceimage.height);
let context = newCanvas.getContext("2d");

// temps table array (size of 6480000 (3600px * 1800px))
let temps = [];

const getColor = (value) => {
  // to Celsius
  let toC = (5 / 9) * (value - 32);

  // return water temp color
  if (toC <= 10) return [60, 106, 255, 255];
  if (toC <= 20) return [60, 255, 247, 255];
  if (toC <= 30) return [91, 255, 60, 255];
  if (toC <= 35) return [248, 180, 13, 255];
  if (toC > 35) return [248, 25, 13, 255];
};

function createMap() {
  /**########  Canvas ######### */
  //create canvas and add image content
  newCanvas.height = sourceimage.height;
  newCanvas.width = sourceimage.width;

  const img = new Image();
  img.onload = () => context.drawImage(img, 0, 0);
  img.onerror = (err) => {
    throw err;
  };
  img.src = "./public/map/map.jpg";

  let pixels = context.getImageData(0, 0, newCanvas.width, newCanvas.height);
  let all = pixels.data.length;
  let data = pixels.data;
  let j = 0;
  /**########  Canvas ######### */

  /**########  Select pixel and chenge color ######### */
  for (let i = 0; i < all; i += 4) {
    j += 1;
    if (data[i + 1] === 60) {
      let tempsColor = getColor(temps[j]);

      if (tempsColor !== undefined) {
        data[i] = tempsColor[0];
        data[i + 1] = tempsColor[1];
        data[i + 2] = tempsColor[2];
      }
    }
  }
  /**########  Select pixel and chenge color ######### */

  context.putImageData(pixels, 0, 0);

  /**########  Write new image to file ######### */
  const out = fs.createWriteStream("./public/map/temp_map.jpg");
  const stream = newCanvas.createJPEGStream();
  stream.pipe(out);
  out.on("finish", () => console.log("The JPEG file was created."));
}

function getTempertures() {
  /**########  Read chunks size of 6480000 from sst.grid and save chunk #45  ######### */
  let readStream = fs.createReadStream("./dist/sst.grid", {
    highWaterMark: 6480000,
  });

  let i = 0;
  readStream.on("data", function (chunk) {
    i += 1;
    if (i === 45) temps = [...chunk];
  });

  readStream.on("end", () => {
    console.log("file has been read completely");

    // create temps map function
    createMap();
  });
}

function convertMap() {
  getTempertures();
}

module.exports = convertMap;

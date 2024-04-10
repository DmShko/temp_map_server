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
let chunkArr = [];
// temps table array (size of 6480000 (3600px * 1800px))
let temps = [];

const getColor = (value) => {

  // to Celsius
  let toC = (5 / 9) * (value - 32);

  // return water temp color
  if (toC <= 5) return [6, 1, 101, 255];
  if (toC > 5 && toC <= 10) return [19, 139, 202, 255];

  if (toC > 10 && toC <= 15) return [60, 255, 500, 255];
  if (toC > 15 && toC <= 20) return [60, 255, 247, 255];

  if (toC > 20 && toC <= 25) return [91, 255, 130, 255];
  if (toC > 25 && toC <= 30) return [91, 255, 60, 255];

  if (toC > 30 && toC <= 32) return [248, 180, 13, 255];
  if (toC > 32 && toC <= 35) return [242, 38, 33, 255];
  
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
  const tempsReverce = temps.reverse();

  /**########  Canvas ######### */

  /**########  Select pixel and change color ######### */
  for (let i = 0; i < all; i += 4) {
    j += 1;
    if (data[i + 1] === 60) {
      let tempsColor = getColor(tempsReverce[j]);

      if (tempsColor !== undefined) {
        data[i] = tempsColor[0];
        data[i + 1] = tempsColor[1];
        data[i + 2] = tempsColor[2];
      }
    }
  }
  /**########  Select pixel and change color ######### */

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
    highWaterMark: 36000,
  });

  let i = 0;
  readStream.on("data", function (chunk) {

    chunkArr = [];
    i += 1;
    // get chunk of 36000 elements (width of one row data from binary file)
    // take such 10-d chunk
    if(i % 10 === 0) {
      chunkArr = [...chunk.reverse()];

       // take such 10 element
      for(let c = 0; c < chunkArr.length; c += 10) {
        temps.push(chunkArr[c]);
      }
    }

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

const fs = require("fs");
var _ = require('lodash');
const { Image, Canvas } = require('canvas')
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
const newCanvas =  new Canvas(sourceimage.width, sourceimage.height);
let context = newCanvas.getContext("2d");

let temps = [];
let tempsArr = [];
let tempsArrTwo = [];

const getColor = (value) => {
  
  let toC = 5/9 *(value - 32)
  if(toC <= 10) return [60, 106, 255, 255];
  if(toC <= 20) return [60, 255, 247, 255];
  if(toC <= 30) return [91, 255, 60, 255];
  if(toC <= 35) return [248, 180, 13, 255];
  if(toC > 35) return [248, 25, 13, 255];
};

function createMap () {

  newCanvas.height = sourceimage.height;
  newCanvas.width = sourceimage.width;

  const img = new Image()
  img.onload = () => context.drawImage(img, 0, 0)
  img.onerror = err => { throw err }
  img.src = './public/map/map.jpg'

  let pixels = context.getImageData(0, 0, newCanvas.width, newCanvas.height);
  let all = pixels.data.length;
  let data = pixels.data;
  let j = 0;
  // let twoData = _.chunk(data, 4);
 

  for (let i = 0; i < all; i += 4) {
    j += 1;
    if(data[i + 1] === 60) {

        let tempsColor = getColor(temps[j]);
  
        // let stash = data[i];
        // data[i] = data[i + 1];
        // data[i + 1] = stash;
        // data[i + 1] = 255;
        if(tempsColor !== undefined) {
          data[i] = tempsColor[0]
          data[i + 1] = tempsColor[1]
          data[i + 2] = tempsColor[2]
        }
        
        // twoData[i] = getColor(temps[i]);
        // console.log(temps[i]);
    }
  }


  context.putImageData(pixels, 0, 0);

  console.log(data, all);

  const out = fs.createWriteStream('./public/map/temp_map.jpg');
  const stream = newCanvas.createJPEGStream();
  stream.pipe(out);
  out.on('finish', () =>  console.log('The JPEG file was created.'));
};

function getTempertures () {
  
  let readStream = fs.createReadStream('./public/map/sst.grid', { 
  highWaterMark: 6480000 });
  let i=0;
  readStream.on('data', function(chunk) {
    i += 1;
    if(i === 90) temps = [...chunk];
  
  });
 
  readStream.on('end', () => {
      console.log('chunk Data : ')
      // tempsArr = _.chunk(temps, 3600);
      // for(let y = 0; y < 1800; y += 1) {
      //   tempsArrTwo.push(tempsArr[y]);
      // }
      console.log(temps, temps.length);
      
      console.log('file has been read completely');
      createMap();
  });
  
 
};

function convertMap () {

    getTempertures();
   

};

module.exports = convertMap;
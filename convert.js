const fs = require("fs");

const jsdom = require("jsdom",{
    resources: "usable",
    url: "./public/map/map"
});
const { JSDOM } = jsdom;

const dom = new JSDOM(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>
  <body>

    <img src='./public/map/map.jpg' alt='ocean temp map' width=1800 height=3600></img>
    <canvas>
            
    </canvas>
    
    <div id="root"></div>
    <script type="module" src="./convert.js"></script>
  </body>
</html>
`);

// let link = dom.window.document.querySelector('a');
let sourceimage = dom.window.document.querySelector("img");
let canvas = dom.window.document.querySelector("canvas");
let context = canvas.getContext("2d");

function convertMap () {

    canvas.height = sourceimage.height;
    canvas.width = sourceimage.width;

    (async() => {
        await sourceimage.onload(() => {
            context.drawImage(sourceimage, 0, 0);
        });
    });
     
    canvas.style.display = "none";

    let pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    let all = pixels.data.length;
    let data = pixels.data;
    console.log(data, all);
    for (let i = 0; i < all; i += 4) {
        let stash = data[i];
        data[i] = data[i + 1];
        data[i + 1] = stash;
        data[i + 1] = 255;
    }
    context.putImageData(pixels, 0, 0);
    canvas.style.display = "inline";

    fs.writeFileSync('./public/map/temp_map.jpg', data);

}

module.exports = convertMap;
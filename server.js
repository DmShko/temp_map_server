// import 'temp_map' veb-server
const temp_map  = require("./app");
const convertMap = require("./convert");

// start 'temp_map' veb-server
temp_map.listen(3000, () => {
    console.log("Server running. Use our API on port: 3000");
    convertMap();
});
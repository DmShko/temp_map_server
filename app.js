const express = require("express");
const cors = require("cors");
const tempsRouter = require("./routes/api/temps");

const temp_map = express();

temp_map.use(cors());
temp_map.use("/api/temps", tempsRouter);
temp_map.use(express.static("public"));

temp_map.use((req, res) => {
  res.status(404).json({ message: "Not found" });
});

// universal error hundler
temp_map.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({
    message,
  });
});

// export 'temp_map' veb-server
module.exports = temp_map;

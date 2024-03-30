const fs = require("fs/promises");
const path = require("path");
const decompress = require("decompress");
const convertMap = require("../convert");

const writeMap = async (req, res, next) => {
  try {
    if (req.file) {
      const mapDir = path.join(__dirname, "../", "public", "map");
      const { path: tempUpload, filename } = req.file;
      const publicUpload = path.join(mapDir, filename);

      await fs.rename(tempUpload, publicUpload);

      decompress(publicUpload, "dist").then((files) => {
        convertMap();
      });
    }
    res.status(201).json({ message: "File is uploaded", path: `temp_map.jpg` });
  } catch (error) {
    next(error);
  }
};

module.exports = writeMap;

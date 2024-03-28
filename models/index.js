const fs = require("fs/promises");
const path = require("path");

const writeMap = async (req, res, next) => {
    
    try {
      
      if(req.file) {
        const mapDir = path.join(__dirname, "../", "public", "map");
        const { path: tempUpload, filename } = req.file;
        const publicUpload = path.join(mapDir, filename);
        await fs.rename(tempUpload, publicUpload);
      }
      res.status(201).json({message: "File is uploaded"});

    }
  
    catch(error) {
     
      next(error);
    }
      
};

module.exports = writeMap;
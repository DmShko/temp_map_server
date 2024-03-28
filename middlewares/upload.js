const multer = require("multer");
const path = require("path");

/** multer config */
// create path to temp directory
const tempDir = path.join(__dirname, "../", "temp");
const multerConfig = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, callback) => {
        callback(null, file.originalname);
    }
});
/** multer config */

// create multer middleware
const upload = multer({
    storage: multerConfig,
});

module.exports = upload;
const express = require("express");
const { upload } = require("../../middlewares");

const router = express.Router();
const writeMap  = require("../../models/index");

// transport temp-s zip file from front-end
router.post("/", upload.single("file"), writeMap);

// export to server
module.exports = router;
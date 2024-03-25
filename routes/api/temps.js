const express = require("express");

const router = express.Router();

router.get("/", async (reg, res, next) => {
    res.json(
      {message: "I'm ok!",}
    );
});

// export to server
module.exports = router;
const express = require("express");
const router = express.Router();
const adsController = require("../controllers/adsController");

router.get("/", adsController.getAllAds);

router.put("/:id", adsController.updateAd);

router.put("/status/:id", adsController.updateStatus);

module.exports = router;

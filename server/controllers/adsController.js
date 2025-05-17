const { Ad } = require("../models");

const getAllAds = async (req, res) => {
  try {
    const ads = await Ad.findAll(   {
      where: {
        status: true, // Only get ads with status 'true'
      },
    });
    res.json(ads);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateAd = async (req, res) => {
  try {
    const [updated] = await Ad.update(req.body, {
      where: { id: req.params.id },
    });
    if (updated) {
      const updatedAd = await Ad.findByPk(req.params.id);
      return res.json(updatedAd);
    }
    throw new Error("Ad not found");
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateStatus = async (req, res) => {
  try {
    const ad = await Ad.findByPk(req.params.id);

    if (!ad) {
      return res.status(404).json({ message: "Ad not found" });
    }

    // Toggle status
    ad.status = !ad.status;
    await ad.save(); // Save the updated status

    return res.json({ message: "Ad status updated", ad });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
module.exports = {
  getAllAds,
  updateAd,
  updateStatus,
};

const express = require('express');
const ScraperController = require('../controller/scrap.controller');
const router = express.Router();

router.get('/banners', ScraperController.fetchBanner);
router.get('/character-tiers', ScraperController.fetchCharacterTierList);
router.get('/characters', ScraperController.fetchCharacter);
router.get('/characters/:name', ScraperController.fetchCharacterStats);
router.get('/support-card', ScraperController.fetchSupportCard);
router.get('/support-card/:name', ScraperController.fetchSupportCardStats);
router.get('/support-card-tiers', ScraperController.fetchSupportCardTierList);

module.exports = router;
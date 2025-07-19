const ScraperService = require('../services/index');

class ScraperController {

    static async fetchCharacter(req, res) {
        try {
            const data = await ScraperService.getCharacter();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async fetchBanner(req, res) {
        try {
            const data = await ScraperService.getBanner();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async fetchCharacterTierList(req, res) {
        try {
            const data = await ScraperService.getBestTierCharacter();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async fetchSupportCardTierList(req, res) {
        try {
            const data = await ScraperService.getBestTierSupportCard();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async fetchSupportCardStats(req, res) {
        try {
            const response = await ScraperService.getSupportCard();
            const mergeAllCharacters = [
                ...response.ssrCards,
                ...response.srCards,
                ...response.rCards,
            ];
            const results = mergeAllCharacters.filter(character => character.name.toLowerCase().split(" ").join("-")
                .includes(
                    req.params.name.toLowerCase().split(" ").join("-"))
            );
            if (!results.length) return res.status(404).json({ success: false, message: "Character not found" });
            if (req.query.limit) {
                const data = await ScraperService.getSupportCardStats(results[0].url);
                res.status(200).json({ success: true, dataFound: 1, data: data });
            } else {
                const data = await Promise.all(results.map(character => ScraperService.getSupportCardStats(character.url)));
                res.status(200).json({ success: true, dataFound: data.length, data: data });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
    static async fetchCharacterStats(req, res) {
        try {
            const response = await ScraperService.getCharacter();
            const mergeAllCharacters = [
                ...response.spotlightCharacters,
                ...response.upcomingCharacters,
                ...response.allCharacters.threeStar,
                ...response.allCharacters.twoStar,
                ...response.allCharacters.oneStar
            ];
            const results = mergeAllCharacters.filter(character => character.name.toLowerCase().split(" ").join("-")
                .includes(
                    req.params.name.toLowerCase().split(" ").join("-"))
            );
            if (!results.length) return res.status(404).json({ success: false, message: "Character not found" });
            if (req.query.limit) {
                const data = await ScraperService.getCharacterStats(results[0].url);
                res.status(200).json({ success: true, dataFound: 1, data: data });
            } else {
                const data = await Promise.all(results.map(character => ScraperService.getCharacterStats(character.url)));
                res.status(200).json({ success: true, dataFound: data.length, data: data });
            }
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }

    static async fetchSupportCard(req, res) {
        try {
            const data = await ScraperService.getSupportCard();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = ScraperController;
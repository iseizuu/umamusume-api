const ScraperService = require('../services/index');
const UmaError = require('../structure/error');

class ScraperController {

    static async fetchCharacter(req, res) {
        try {
            const data = await ScraperService.getCharacter();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchBanner(req, res) {
        try {
            const data = await ScraperService.getBanner();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchCharacterTierList(req, res) {
        try {
            const data = await ScraperService.getBestTierCharacter();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchSupportCardTierList(req, res) {
        try {
            const data = await ScraperService.getBestTierSupportCard();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
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
            if (!results.length) return errorHandler("Support Card not found", res);
            if (req.query.limit) {
                const data = await ScraperService.getSupportCardStats(results[0].url);
                res.status(200).json({ success: true, dataFound: 1, data: data });
            } else {
                const data = await Promise.all(results.map(character => ScraperService.getSupportCardStats(character.url)));
                res.status(200).json({ success: true, dataFound: data.length, data: data });
            }
        } catch (error) {
            errorHandler(error.message, res);
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
            if (!results.length) return errorHandler("Character not found", res);
            if (req.query.limit) {
                const data = await ScraperService.getCharacterStats(results[0].url);
                res.status(200).json({ success: true, dataFound: 1, data: data });
            } else {
                const data = await Promise.all(results.map(character => ScraperService.getCharacterStats(character.url)));
                res.status(200).json({ success: true, dataFound: data.length, data: data });
            }
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchSupportCard(req, res) {
        try {
            const data = await ScraperService.getSupportCard();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchSkills(req, res) {
        try {
            const data = await ScraperService.getSkills();
            res.status(200).json({ success: true, data: data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }

    static async fetchSkillStats(req, res) {
        try {
            const response = await ScraperService.getSkills();
            const merge = [
                ...response.normal,
                ...response.rare,
                ...response.unique
            ];
            const results = merge.filter(skill => {
                const name = skill.name.toLowerCase().split(" ").join("-")
                    .includes(req.params.name.toLowerCase().split(" ").join("-"));
                return name && skill.url;
            });
            console.log(results);
            if (!results.length) return errorHandler("Skill not found", res);

            const data = await Promise.all(results.map(skill => ScraperService.getSkillStats(skill.url)));
            res.status(200).json({ success: true, dataFound: data.length, data });
        } catch (error) {
            errorHandler(error.message, res);
        }
    }
}

function errorHandler(error, res) {
    const umaError = new UmaError(error);
    const message = `UmaApiError: ${umaError.message}`;
    res.status(500).json({ success: false, message: message });
}

module.exports = ScraperController;

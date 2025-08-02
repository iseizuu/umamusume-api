const { getBanner } = require("./banner/getBanner");
const { getBestTierCharacter } = require("./tier-list/getBestTierCharacter");
const { getBestTierSupportCard } = require("./tier-list/getBestTierSupportCard");
const { getCharacter } = require("./character/getCharacter");
const { getCharacterStats } = require("./character/getCharacterStats");
const { getSupportCard } = require("./support-card/getSupportCard");
const { getSupportCardStats } = require("./support-card/getSupportCardStats");
const { getSkills } = require("./skill/getSkills");
const { getSkillStats } = require("./skill/getSkillStats");

module.exports = { getBanner, getCharacter, getBestTierCharacter, getCharacterStats, getSupportCard, getSupportCardStats, getBestTierSupportCard, getSkills, getSkillStats };
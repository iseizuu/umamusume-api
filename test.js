const { getSkillStats } = require('./src/services/skill/getSkillStats.js');

// getSupportCard().then(data => console.log(data));

//getBestTierCharacter().then(data => console.log(data));

getSkillStats("https://game8.co/games/Umamusume-Pretty-Derby/archives/536895").then(data => console.log(data));
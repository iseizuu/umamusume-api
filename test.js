const { getBestTierCharacter } = require('./src/services/getBestTierCharacter.js');
const { getBestTierSupportCard } = require('./src/services/getBestTierSupportCard.js');
const { getSupportCard} = require('./src/services/getSupportCard.js');

// getSupportCard().then(data => console.log(data));

//getBestTierCharacter().then(data => console.log(data));

    getBestTierSupportCard().then(data => console.log(data));
const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class BestTierCharacter {

    static getBestTierCharacter() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/536352')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const results = {
                        careerTrainingTiers: {
                            newlyAdded: []
                        },
                        teamTrialsTiers: {}
                    };

                    const newCharsTable = $('h3:contains("New Characters Added")').next('table');
                    newCharsTable.find('td[width="50%"]').each((i, cell) => {
                        const link = $(cell).find('a');
                        const tierImg = $(cell).find('div.align img');

                        const character = {
                            name: link.text().trim(),
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src'),
                            tier: tierImg.attr('alt').replace(' Rank', '')
                        };
                        results.careerTrainingTiers.newlyAdded.push(character);
                    });

                    const careerTable = $('h3:contains("Easiest Characters to Train")').next('table');
                    careerTable.find('tbody > tr:has(th):has(td)').each((i, row) => {
                        const tierCell = $(row).find('th');
                        const altText = tierCell.find('img').attr('alt');
                        const tierName = altText ? altText.replace(' Rank', '').toLowerCase() : 'unknown';

                        results.careerTrainingTiers[tierName] = [];

                        const characterCell = $(row).find('td');
                        characterCell.find('a.a-link').each((j, link) => {
                            const linkElement = $(link);
                            const tooltipSpan = linkElement.find('span.js-discription-tooltip');
                            const image = tooltipSpan.find('img').attr('data-src');
                            const url = linkElement.attr('href');

                            const templateHtml = tooltipSpan.find('template').html();
                            if (!templateHtml) return;

                            const nameMatch = templateHtml.match(/(.*?)<br>/);
                            const rarityMatch = templateHtml.match(/Rarity<\/b>:\s*(.*)/);

                            results.careerTrainingTiers[tierName].push({
                                name: nameMatch ? nameMatch[1].trim() : "Unknown Name",
                                rarity: rarityMatch ? rarityMatch[1].trim() : "Unknown Rarity",
                                url: url,
                                image: image
                            });
                        });
                    });

                    const raceTypes = {
                        'hm_101': 'sprint', 'hm_102': 'mile', 'hm_103': 'medium',
                        'hm_104': 'long', 'hm_105': 'dirt'
                    };
                    for (const [id, type] of Object.entries(raceTypes)) {
                        results.teamTrialsTiers[type] = [];
                        const trialsTable = $(`h3#${id}`).next('table');

                        trialsTable.find('div.align').each((i, div) => {
                            const lineText = $(div).text().trim().replace(/\s+/g, ' ');
                            const linkElement = $(div).find('a');
                            const rankMatch = lineText.match(/(\d+)(st|nd|rd|th)?:\s*(\d+)\s*–\s*(.*)/);

                            if (rankMatch) {
                                results.teamTrialsTiers[type].push({
                                    rank: parseInt(rankMatch[1], 10),
                                    count: parseInt(rankMatch[3], 10),
                                    name: linkElement.text().trim(),
                                    url: linkElement.attr('href'),
                                    image: $(div).find('img').attr('data-src')
                                });
                            }
                        });
                    }

                    resolve(results);
                })
                .catch(error => reject(error));
        });
    };
}

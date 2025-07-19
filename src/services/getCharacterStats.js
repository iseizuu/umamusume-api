const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class CharacterStats {

    static getCharacterStats(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);
                const infoTable = $('h2:contains("Character Info")').nextAll('table').first();
                const characterInfo = {
                    name: infoTable.find('tr').first().text().trim(),
                    image: infoTable.find('img').first().attr('data-src'),
                    aptitudes: {},
                    statGrowth: {},
                    uniqueSkill: {}
                };

                const getAptitude = (headerText) => {
                    const values = {};
                    infoTable.find(`th:contains("${headerText}")`).first().parent().next('tr').find('td').each((i, td) => {
                        const text = $(td).text().trim();
                        const parts = text.split(':');
                        if (parts.length === 2) {
                            values[parts[0].trim().toLowerCase()] = parts[1].trim();
                        }
                    });
                    return values;
                };

                characterInfo.aptitudes.track = getAptitude('Track Aptitude');
                characterInfo.aptitudes.distance = getAptitude('Distance Aptitude');
                characterInfo.aptitudes.pace = getAptitude('Pace Aptitude');
                characterInfo.statGrowth = getAptitude('Stat Growth');

                const skillTable = $('h3:contains("Unique Skill")').next('table');
                characterInfo.uniqueSkill = {
                    name: skillTable.find('th').text().trim(),
                    description: skillTable.find('td').text().trim()
                };

                const buildGuide = {
                    recommendedStats: {},
                    recommendedSupportCards: [],
                    recommendedSkills: []
                };

                const recommendedStatsTable = $('h3:contains("Recommended Stats")').nextAll('table').first();
                recommendedStatsTable.find('tbody tr:last-child td').each((i, cell) => {
                    const statName = recommendedStatsTable.find('th img').eq(i).attr('alt');
                    if (statName) {
                        buildGuide.recommendedStats[statName.toLowerCase()] = parseInt($(cell).text().trim(), 10);
                    }
                });

                const supportCardsTable = $('h3:contains("Recommended Support Cards")').nextAll('table').first();
                supportCardsTable.find('td.center a').each((i, card) => {
                    buildGuide.recommendedSupportCards.push({
                        name: $(card).text().trim(),
                        url: $(card).attr('href'),
                        image: $(card).find('img').attr('data-src')
                    });
                });

                const skillsTable = $('h3:contains("Recommended Skills")').nextAll('table').first();
                skillsTable.find('td.center a').each((i, skill) => {
                    buildGuide.recommendedSkills.push({
                        name: $(skill).text().trim(),
                        url: $(skill).attr('href'),
                        image: $(skill).find('img').attr('data-src')
                    });
                });

                const finalResult = {
                    characterInfo,
                    buildGuide
                };

                resolve(finalResult);
            } catch (error) {
                console.error('Error:', error.message);
                reject(error.message);
            }
        });
    }
}



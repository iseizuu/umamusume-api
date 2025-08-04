const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class CharacterStats {

    static getCharacterStats(url) {
        return new Promise((resolve, reject) => {
            request(url)
                .then(request => {
                    const $ = cheerio.load(request.data);
                    const finalResult = {
                        characterInfo: {},
                        buildGuide: {}
                    };
                    const infoTable = $('h2:contains("Character Info")').nextAll('table').first();
                    const characterInfo = {
                        name: infoTable.find('tr').first().text().trim(),
                        rank: !infoTable.find('div.align img').attr('alt') ? "?" : infoTable.find('div.align img').attr('alt').replace(' Rank', ''),
                        image: infoTable.find('img').first().attr('data-src'),
                        url: url,
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
                    finalResult.characterInfo = characterInfo;

                    const buildGuide = {
                        recommendedStats: {},
                        recommendedSupportCards: { description: "", list: [] },
                        alternateSRCards: [],
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
                        buildGuide.recommendedSupportCards.list.push({
                            name: $(card).text().trim(),
                            url: $(card).attr('href'),
                            image: $(card).find('img').attr('data-src')
                        });
                    });
                    buildGuide.recommendedSupportCards.description = $('h3:contains("Recommended Support Cards")').next('table').next('p.a-paragraph').text().trim();
                    const alternateSRTable = $('h4:contains("Alternate SR Support Cards")').next('table');
                    alternateSRTable.find('td[width="33%"]').each((i, cell) => {
                        const link = $(cell).find('a').first();
                        const tooltipSpan = link.find('span.js-discription-tooltip');
                        const templateHtml = tooltipSpan.find('template').html();
                        const nameMatch = templateHtml ? templateHtml.match(/(.*?)<br>/) : null;
                        const typeMatch = templateHtml ? templateHtml.match(/Type<\/b>:\s*(\w+)/) : null;

                        buildGuide.alternateSRCards.push({
                            name: nameMatch ? nameMatch[1].trim() : "Unknown Name",
                            type: typeMatch ? typeMatch[1] : null,
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src'),
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
                    finalResult.buildGuide = buildGuide;

                    resolve(finalResult);
                })
                .catch(error => reject(error));
        });
    }
}

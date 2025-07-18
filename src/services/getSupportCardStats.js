const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class SupportCardStats {

    static getSupportCardStats(url) {
        return new Promise(async (resolve, reject) => {
            try {
                const { data } = await axios.get(url);
                const $ = cheerio.load(data);

                const cardDetails = {
                    cardInfo: {},
                    supportEffects: [],
                    obtainableSkills: {
                        random: [],
                        careerEvents: []
                    }
                };

                const infoTable = $('h3:contains("Unique Perk and Overview")').next('table');
                const nameAndImageCell = infoTable.find('td[colspan="12"]');

                cardDetails.cardInfo = {
                    name: nameAndImageCell.find('b').text().trim(),
                    character: nameAndImageCell.text().trim().split('\n').pop().trim(),
                    image: nameAndImageCell.find('img').attr('data-src'),
                    rarity: infoTable.find('th:contains("Rarity")').next().text().trim(),
                    specialty: infoTable.find('th:contains("Specialty")').next().text().trim(),
                    uniquePerk: infoTable.find('th:contains("Unique Perk")').next().text().trim()
                };

                const effectsTable = $('h3:contains("Support Effects")').next('table');
                effectsTable.find('td.center').contents().each((i, node) => {
                    if (node.type === 'text' && $(node).text().trim()) {
                        cardDetails.supportEffects.push($(node).text().trim());
                    }
                });

                const scrapeSkillsTable = (table) => {
                    const skills = [];
                    table.find('tbody > tr').each((i, row) => {
                        const cells = $(row).find('td');
                        if (cells.length < 2) return;

                        const link = cells.eq(0).find('a');
                        skills.push({
                            name: link.text().trim(),
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src'),
                            effect: cells.eq(1).text().trim().replace(/\s+/g, ' ')
                        });
                    });
                    return skills;
                };

                const randomSkillsTable = $('h3:contains("Random Obtainable Skills")').next('table');
                cardDetails.obtainableSkills.random = scrapeSkillsTable(randomSkillsTable);

                const eventSkillsTable = $('h3:contains("Skills from Career Events")').next('table');
                cardDetails.obtainableSkills.careerEvents = scrapeSkillsTable(eventSkillsTable);

                resolve(cardDetails);

            } catch (error) {
                console.error('Error:', error.message);
                reject(error.message);
            }
        });
    }
}




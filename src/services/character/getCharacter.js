const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class Characters {

    static getCharacter() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/535926')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const results = {
                        spotlightCharacters: [],
                        upcomingCharacters: [],
                        allCharacters: {
                            threeStar: [],
                            twoStar: [],
                            oneStar: []
                        }
                    };

                    const scrapeAptitudeTable = (tableElement) => {
                        const characters = [];
                        tableElement.find('tbody > tr:has(td)').each((i, row) => {
                            const characterCell = $(row).find('td').eq(0);
                            const aptitudeCell = $(row).find('td').eq(1);
                            const link = characterCell.find('a');
                            const aptitudesRaw = aptitudeCell.text().trim().replace(/\s+/g, ' ').split('hr.a-table__line');
                            const statGrowthsRaw = aptitudesRaw[aptitudesRaw.length - 1];
                            const characterData = {
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src'),
                                aptitudes: {
                                    turf: aptitudesRaw[0].match(/Turf: (\w)/)?.[1] || null,
                                    dirt: aptitudesRaw[0].match(/Dirt: (\w)/)?.[1] || null,
                                    sprint: aptitudesRaw[0].match(/Sprint: (\w)/)?.[1] || null,
                                    mile: aptitudesRaw[0].match(/Mile: (\w)/)?.[1] || null,
                                    medium: aptitudesRaw[0].match(/Medium: (\w)/)?.[1] || null,
                                    long: aptitudesRaw[0].match(/Long: (\w)/)?.[1] || null,
                                    front: aptitudesRaw[0].match(/Front: (\w)/)?.[1] || null,
                                    pace: aptitudesRaw[0].match(/Pace: (\w)/)?.[1] || null,
                                    late: aptitudesRaw[0].match(/Late: (\w)/)?.[1] || null,
                                    end: aptitudesRaw[0].match(/End: (\w)/)?.[1] || null,
                                },
                                statGrowth: {
                                    speed: statGrowthsRaw.match(/SPD \+(\d+%)/)?.[1] || "0%",
                                    stamina: statGrowthsRaw.match(/STA \+(\d+%)/)?.[1] || "0%",
                                    power: statGrowthsRaw.match(/POW \+(\d+%)/)?.[1] || "0%",
                                    guts: statGrowthsRaw.match(/GUT \+(\d+%)/)?.[1] || "0%",
                                    wit: statGrowthsRaw.match(/WIT \+(\d+%)/)?.[1] || "0%",
                                }
                            };
                            characters.push(characterData);
                        });

                        return characters;
                    };

                    const scrapeGridTable = (tableElement) => {
                        const characters = [];
                        tableElement.find('td.top.center').each((i, cell) => {
                            const link = $(cell).find('a.a-link');
                            const character = {
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src'),
                            };
                            characters.push(character);
                        });
                        
                        return characters;
                    };

                    results.spotlightCharacters = scrapeAptitudeTable($('h3#hm_1').next('table'));
                    results.upcomingCharacters = scrapeAptitudeTable($('h3#hm_2').next('table'));
                    results.allCharacters.threeStar = scrapeGridTable($('h3#hm_3').next('table'));
                    results.allCharacters.twoStar = scrapeGridTable($('h3#hm_4').next('table'));
                    results.allCharacters.oneStar = scrapeGridTable($('h3#hm_5').next('table'));

                    resolve(results);
                })
                .catch(error => reject(error));
        });

    }
}

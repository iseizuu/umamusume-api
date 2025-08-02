const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class NormalSkills {

    static getNormalSkills() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/536839')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const normal = [];

                    const scrapeSkillTable = (tableElement, type) => {
                        tableElement.find('tbody > tr').each((i, row) => {
                            const cells = $(row).find('td');
                            if (cells.length < 2) return;

                            const link = cells.eq(0).find('a');

                            const skill = {
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src'),
                                type: type,
                                effect: cells.eq(1).text().trim().replace(/\s\s+/g, ' ')
                            };
                            normal.push(skill);
                        });
                    };

                    const speedTable = $('h3#hm_101').nextAll('div.scroll--table').first().find('table');
                    scrapeSkillTable(speedTable, 'speed');

                    const passiveTable = $('h3#hm_102').nextAll('div.scroll--table').first().find('table');
                    scrapeSkillTable(passiveTable, 'passive');

                    const recoveryTable = $('h3#hm_103').nextAll('div.scroll--table').first().find('table');
                    scrapeSkillTable(recoveryTable, 'recovery');

                    const debuffTable = $('h3#hm_104').nextAll('div.scroll--table').first().find('table');
                    scrapeSkillTable(debuffTable, 'debuff');

                    resolve(normal);

                })
                .catch(error => reject(error));
        });
    }
}

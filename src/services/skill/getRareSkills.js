const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class RareSkills {

    static getRareSkills() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/536837')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const rare = [];
                    const scrapeSkillTable = (tableElement, type) => {
                        const skills = [];
                        if (!tableElement || !tableElement.length) {
                            return skills;
                        }

                        tableElement.find('tbody > tr').each((i, row) => {
                            const cells = $(row).find('td');
                            if (cells.length < 2) return;

                            const link = cells.eq(0).find('a.a-link, a').first();
                            if (!link.length) return;

                            const name = link.text().trim();
                            const url = link.attr('href') ? link.attr('href').trim() : null;
                            const img = link.find('img').first();
                            const image = img.attr('data-src') || img.attr('src') || null;

                            const effect = cells.eq(1).text().trim().replace(/\s\s+/g, ' ');

                            skills.push({ name, url, image, effect, type });
                        });
                        return skills;
                    };

                    const findSection = (headingMatch, type) => {
                        const out = [];
                        $('h3').each((_, h3) => {
                            const $h3 = $(h3);
                            const headingText = $h3.text().trim();
                            if (headingMatch(headingText)) {
                                const table = $h3.nextAll('table').filter((_, tbl) => {
                                    const ths = $(tbl).find('thead th');
                                    let hasSkillHeader = false;
                                    ths.each((__, th) => {
                                        const ttxt = $(th).text().toLowerCase();
                                        if (ttxt.includes('skill') || ttxt.includes('effect') || $(th).attr('data-cell') === 'name') {
                                            hasSkillHeader = true;
                                        }
                                    });
                                    return hasSkillHeader;
                                }).first();

                                if (table.length) {
                                    const parsed = scrapeSkillTable(table, type);
                                    out.push(...parsed);
                                }
                            }
                        });
                        return out;
                    };

                    rare.push(...findSection(text => /rare\s+speed\s+skills/i.test(text) || /\bSpeed\b/i.test(text), 'speed'));
                    rare.push(...findSection(text => /rare\s+passive\s+skills/i.test(text) || /\bPassive\b/i.test(text), 'passive'));
                    rare.push(...findSection(text => /rare\s+recovery\s+skills/i.test(text) || /\bRecovery\b/i.test(text), 'recovery'));
                    rare.push(...findSection(text => /rare\s+debuff\s+skills/i.test(text) || /\bDebuff\b/i.test(text), 'debuff'));

                    resolve(rare);
                })
                .catch(error => reject(error));
        });
    }
}


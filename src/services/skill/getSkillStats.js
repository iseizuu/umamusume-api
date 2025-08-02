const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class SkillStats {

    static getSkillStats(url) {
        return new Promise((resolve, reject) => {
            request(url)
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const normalizeText = (s = '') => s.replace(/\s+/g, ' ').trim();
                    const titleBold = $('table.a-table').first().find('b.a-bold').first();
                    const skillName = normalizeText(titleBold.text());
                    const skillIcon = titleBold.find('img').attr('data-src') || titleBold.find('img').attr('src') || null;

                    let rarity = null;
                    let effect = null;
                    $('table.a-table').first().find('tr').each((_, tr) => {
                        const th = $(tr).find('th').first();
                        const td = $(tr).find('td').first();
                        if (!th.length || !td.length) return;

                        const heading = normalizeText(th.text()).toLowerCase();
                        if (heading === 'rarity') {
                            rarity = normalizeText(td.text());
                        } else if (heading === 'effect') {
                            effect = normalizeText(td.text());
                        }
                    });

                    const advanced = {};
                    const advHeader = $('h3#hm_2');
                    const advTable = advHeader.nextAll('table').first();
                    if (advTable.length) {
                        const advLink = advTable.find('a.a-link').first();
                        advanced.name = normalizeText(advLink.text()) || null;
                        advanced.url = advLink.attr('href') || null;
                        const advIconEl = advLink.find('img').first();
                        advanced.image = advIconEl.attr('data-src') || advIconEl.attr('src') || null;
                        advanced.requiredSP = null;
                        advanced.effect = null;
                        advTable.find('.align').each((_, el) => {
                            const text = normalizeText($(el).text());
                            if (/Required SP/i.test(text) || /Required SP/i.test($(el).html())) {
                                // extract number
                                const m = text.match(/Required SP[:\s]*([0-9]+)/i);
                                if (m) advanced.requiredSP = m[1];
                            }
                            if (!advanced.effect && text && !/Required SP/i.test(text)) {
                                if (!/Required SP/i.test(text)) {
                                    advanced.effect = text;
                                }
                            }
                        });
                    }

                    const parseEntitySkillRows = (sectionHeaderSelector) => {
                        const list = [];
                        const header = $(sectionHeaderSelector);
                        if (!header.length) return list;

                        const table = header.nextAll('table').first();
                        if (!table.length) return list;
                        table.find('tr').each((_, tr) => {
                            const cells = $(tr).find('td');
                            if (cells.length < 2) return;

                            const left = cells.eq(0);
                            const right = cells.eq(1);

                            const entityLink = left.find('a.a-link, a').first();
                            if (!entityLink.length) return;

                            const entityName = normalizeText(entityLink.text());
                            const entityUrl = entityLink.attr('href') || null;
                            const entityIconEl = entityLink.find('img').first();
                            const entityIcon = entityIconEl.attr('data-src') || entityIconEl.attr('src') || null;

                            const skills = [];
                            right.find('.align').each((_, alignDiv) => {
                                const bold = $(alignDiv).find('b.a-bold');
                                if (bold.length) {
                                    const nameText = normalizeText(bold.text());
                                    const img = bold.find('img').first();
                                    const image = img.attr('data-src') || img.attr('src') || null;
                                    skills.push({ name: nameText, url: null, image });
                                }
                                $(alignDiv).find('a.a-link, a').each((__, a) => {
                                    const link = $(a);
                                    const nameText = normalizeText(link.text());
                                    const url = link.attr('href') || null;
                                    const img = link.find('img').first();
                                    const image = img.attr('data-src') || img.attr('src') || null;
                                    skills.push({ name: nameText, url, image });
                                });
                            });

                            list.push({
                                name: entityName,
                                url: entityUrl,
                                icon: entityIcon,
                                skills,
                            });
                        });
                        return list;
                    };

                    const innateCharacters = parseEntitySkillRows('h3#hm_3'); // Innate Skills from Characters
                    const potentialCharacters = parseEntitySkillRows('h3#hm_4'); // Potential Skills from Characters
                    const careerEventCharacters = parseEntitySkillRows('h3#hm_5'); // Career Events from Characters
                    const supportTrainingHints = parseEntitySkillRows('h3#hm_6'); // Career Events from Support Cards
                    const supportCardCareerEvents = parseEntitySkillRows('h3#hm_7');

                    const output = {
                        name: skillName,
                        url: url,
                        icon: skillIcon,
                        rarity,
                        effect,
                        advanced: Object.keys(advanced).length ? advanced : null,
                        innateCharacters,
                        potentialCharacters,
                        careerEventCharacters,
                        supportTrainingHints,
                        supportCardCareerEvents
                    };

                    resolve(output);
                })
                .catch(error => reject(error));
        });
    }
}

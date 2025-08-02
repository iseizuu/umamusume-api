const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class SupportCard {

    static getSupportCard() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/535928')
                .then(response => {
                    const $ = cheerio.load(response.data);

                    const results = {
                        currentSpotlight: [],
                        ssrCards: [],
                        srCards: [],
                        rCards: []
                    };

                    $('h2#hl_1').nextUntil('h2#hl_2', 'table').each((i, table) => {
                        $(table).find('a.a-link').each((j, el) => {
                            const link = $(el);
                            results.currentSpotlight.push({
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src')
                            });
                        });
                    });

                    $('h2#hl_2').nextUntil('h2#hl_3', 'table:has(th:contains("Card"))').each((i, table) => {
                        $(table).find('tbody > tr:has(td)').each((j, row) => {
                            const cells = $(row).find('td');
                            const link = cells.eq(0).find('a');
                            const card = {
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src'),
                                uniqueSkillEffect: cells.eq(1).text().trim()
                            };
                            if (card.name.length && card.url && card.url.includes('https')) {
                                results.ssrCards.push(card);
                            }
                        });
                    });

                    const srTable = $('h2#hl_3').nextAll('div.scroll--table').first().find('table');
                    srTable.find('tbody > tr').each((i, row) => {
                        const cells = $(row).find('td');
                        if (cells.length < 2) return;
                        const link = cells.eq(0).find('a');
                        const card = {
                            name: link.text().trim(),
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src'),
                            uniqueSkillEffect: cells.eq(1).text().trim()
                        };
                        results.srCards.push(card);
                    });

                    const rTable = $('h2#hl_4').nextAll('div.scroll--table').first().find('table');
                    rTable.find('td.top.center').each((i, cell) => {
                        const link = $(cell).find('a');
                        const card = {
                            name: link.text().trim(),
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src')
                        };
                        results.rCards.push(card);
                    });

                    resolve(results);
                })
                .catch(error => reject(error));
        });

    }
}

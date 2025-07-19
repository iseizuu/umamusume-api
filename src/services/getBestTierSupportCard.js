const axios = require('axios');
const cheerio = require('cheerio');

module.exports = class BestTierSupportCard {

    static getBestTierSupportCard() {
        return new Promise((resolve, reject) => {
            axios.get('https://game8.co/games/Umamusume-Pretty-Derby/archives/536715')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const results = {
                        newlyAddedCards: [],
                        overallTierList: {},
                        bestCardsByStyle: {}
                    };

                    const newCardsTable = $('h3:contains("New Support Cards Added")').next('table');
                    newCardsTable.find('tbody > tr').each((i, row) => {
                        const cells = $(row).find('td');
                        if (cells.length < 2) return;

                        const link = cells.eq(0).find('a');
                        const placementCell = cells.eq(1);
                        const tierImg = placementCell.find('img');
                        const descriptions = [];
                        placementCell.find('div.align-left').each((j, div) => {
                            descriptions.push($(div).text().trim().replace(/・/g, ''));
                        });

                        results.newlyAddedCards.push({
                            name: link.text().trim(),
                            url: link.attr('href'),
                            image: link.find('img').attr('data-src'),
                            tier: tierImg.attr('alt').replace(' Rank', ''),
                            description: descriptions
                        });
                    });

                    const overallTable = $('h3:contains("Best Support Cards (Overall)")').next('table');
                    overallTable.find('tbody > tr:has(th):has(td)').each((i, row) => {
                        const tierCell = $(row).find('th');
                        const altText = tierCell.find('img').attr('alt');
                        const tierName = altText ? altText.replace(' Rank', '').toLowerCase() : 'unknown';

                        results.overallTierList[tierName] = [];
                        const cardCell = $(row).find('td');
                        cardCell.find('a.a-link').each((j, cardLink) => {
                            const linkElement = $(cardLink);
                            const tooltip = linkElement.find('span.js-discription-tooltip');
                            const templateHtml = tooltip.find('template').html();

                            const rarityMatch = templateHtml ? templateHtml.match(/Rarity<\/b>:\s*(SSR|SR|R)/) : null;
                            const typeMatch = templateHtml ? templateHtml.match(/Type<\/b>:\s*(\w+)/) : null;
                            const nameInTemplate = tooltip.find('template').text().split('<br>')[0].trim();

                            results.overallTierList[tierName].push({
                                name: nameInTemplate || linkElement.text().trim(),
                                rarity: rarityMatch ? rarityMatch[1] : null,
                                type: typeMatch ? typeMatch[1] : null,
                                url: linkElement.attr('href'),
                                image: tooltip.find('img').attr('data-src')
                            });
                        });
                    });

                    const styleSections = $('h4[id^="hs_"]');
                    styleSections.each((i, header) => {
                        const headerElement = $(header);
                        const styleNameRaw = headerElement.text().replace('Best', '').replace('Support Cards', '').trim();
                        const styleKey = styleNameRaw.toLowerCase().replace(/\s+/g, '_'); // "Front Runner" -> "front_runner"

                        results.bestCardsByStyle[styleKey] = [];
                        const styleTable = headerElement.next('table');
                        styleTable.find('tbody > tr:has(td)').each((j, row) => {
                            const cardCell = $(row).find('td').eq(0);
                            const pointsCell = $(row).find('td').eq(1);
                            const link = cardCell.find('a');
                            const keyPoints = [];
                            pointsCell.contents().each((k, node) => {
                                if (node.type === 'text' && $(node).text().trim().length > 0) {
                                    keyPoints.push($(node).text().trim().replace(/・/g, ''));
                                }
                            });

                            results.bestCardsByStyle[styleKey].push({
                                name: link.text().trim(),
                                url: link.attr('href'),
                                image: link.find('img').attr('data-src'),
                                keyPoints: keyPoints
                            });
                        });
                    });

                    resolve(results);
                })
                .catch(error => {
                    reject(error);
                });
        });

    }
}


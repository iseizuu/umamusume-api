const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class Banner {

    static getBanner() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/536311')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const results = {
                        recommendedBanner: {},
                        currentBanners: [],
                        upcomingBanners: [],
                        previousBanners: []
                    };

                    const currentBannerData = $('.archive-style-wrapper table.a-table.a-table').eq(0).find('td');
                    const currentText = currentBannerData.text().trim();
                    const nameMatch = currentText.match(/([^\/]+)\/[^\/]+/);
                    const periodMatch = currentText.match(/\d{1,2}\/\d{1,2}\/\d{4}\s*-\s*\d{1,2}\/\d{1,2}\/\d{4}/);

                    results.recommendedBanner = {
                        name: nameMatch ? nameMatch[1].trim() : '',
                        url: 'https://game8.co' + currentBannerData.find('a').attr('href'),
                        image: currentBannerData.find('img').attr('data-src'),
                        period: periodMatch ? periodMatch[0] : "No Period"
                    };

                    const scrapeBannerTable = (tableElement) => {
                        const banners = [];
                        tableElement.find('tbody > tr:has(td)').each((i, row) => {
                            const cells = $(row).find('td');
                            if (cells.length < 2) return;

                            const link = cells.eq(0).find('a');
                            const image = cells.eq(0).find('img');

                            let name = link.length ? link.text().trim() : cells.eq(0).find('b').text().trim();
                            name = name.replace(/and\s*\n/g, '& ').replace(/\n/g, ' ');


                            const bannerData = {
                                name: name,
                                url: link.length ? 'https://game8.co' + link.attr('href') : null,
                                image: image.attr('data-src'),
                                rating: cells.eq(1).text().trim().split('★').length - 1,
                                star: cells.eq(1).text().trim(),
                                availability: cells.eq(2).text().trim().replace(/\n/g, ' ')
                            };
                            banners.push(bannerData);
                        });
                        return banners;
                    };

                    results.currentBanners = scrapeBannerTable($('h3#hm_2').next('table'));
                    results.upcomingBanners = scrapeBannerTable($('h3#hm_3').next('table'));
                    results.previousBanners = scrapeBannerTable($('h3#hm_4').next('table'));

                    resolve(results);
                })
                .catch(error => {
                    reject(error);
                });
        });
    }
}

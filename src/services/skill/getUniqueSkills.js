const { request } = require('../../structure/request');
const cheerio = require('cheerio');

module.exports = class UniqueSkills {

    static getUniqueSkills() {
        return new Promise((resolve, reject) => {
            request('https://game8.co/games/Umamusume-Pretty-Derby/archives/536836')
                .then(response => {
                    const $ = cheerio.load(response.data);
                    const rows = $("table.a-table tr").slice(1); // skip header
                    let skills = [];
                    const normalizeText = (s) => s.replace(/\s+/g, " ").trim();

                    rows.each((_, tr) => {
                        const tdSkill = $(tr).find("td").eq(0);
                        const tdInfo = $(tr).find("td").eq(1);

                        if (!tdSkill.length || !tdInfo.length) return;

                        const imageEl = tdSkill.find("img").first();
                        const image = imageEl.attr("data-src") || imageEl.attr("src") || null;
                        let name = tdSkill.text();
                        name = normalizeText(name.replace(/\n/g, " "));

                        let effect = "";
                        const hr = tdInfo.find("hr.a-table__line");
                        if (hr.length) {
                            const parts = [];
                            let cur = hr[0].prev;
                            while (cur) {
                                if (cur.type === "text") parts.unshift($(cur).text());
                                else if (cur.type === "tag") parts.unshift($(cur).text());
                                cur = cur.prev;
                            }
                            effect = normalizeText(parts.join(" "));
                        } else {
                            effect = normalizeText(tdInfo.text());
                        }

                        const charLink = tdInfo.find("a.a-link").first();
                        const character = {
                            name: null,
                            url: null,
                            image: null,
                        };
                        if (charLink.length) {
                            character.url = charLink.attr("href") || null;
                            character.name = normalizeText(charLink.text());
                            const charimageEl = charLink.find("img").first();
                            if (charimageEl.length) {
                                character.image = charimageEl.attr("data-src") || charimageEl.attr("src") || null;
                            }
                        }

                        skills.push({
                            name,
                            image,
                            effect,
                            character,
                        });
                    });

                    resolve(skills.slice(0, skills.length - 2));
                })
                .catch(error => reject(error));
        });
    }
}

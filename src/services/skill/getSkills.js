const { getNormalSkills } = require('./getNormalSkills');
const { getRareSkills } = require('./getRareSkills');
const { getUniqueSkills } = require('./getUniqueSkills');

module.exports = class Skills {

    static getSkills() {
        return new Promise((resolve, reject) => {
            Promise.all([getNormalSkills(), getRareSkills(), getUniqueSkills()])
                .then(data => {
                    const results = { normal: data[0], rare: data[1], unique: data[2] };
                    resolve(results);
                })
                .catch(error => reject(error));
        })
    }
}

const axios = require('axios');

module.exports = class Request {

    static request(url) {
        return new Promise((resolve, reject) => {
            axios.get(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0'
                }
            })
                .then(response => resolve(response))
                .catch(error => reject(error));
        })
    }
}
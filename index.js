const express = require('express');
const routes = require('./src/api/routes');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);
app.get('/', (req, res) => {
    console.log('Scraper API is running!');
    res.redirect('https://aizuu.my.id');
});
app.use((req, res) => {
    res.status(404).send({
        error: "Not Found",
        message: `The requested URL ${req.originalUrl} does not exist.`,
        availableRoutes: ['/banners', '/tier-list', '/characters', '/characters/:name', '/support-card', '/support-card/:name', '/support-card-tiers', "/skills", "/skills/:name"],
        github: "https://github.com/iseizuu/umamusume-api"
    });
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
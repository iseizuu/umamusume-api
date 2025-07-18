const express = require('express');
const routes = require('./src/api/routes'); // Impor rute Anda
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api', routes);
app.get('/', (req, res) => {
    console.log('Scraper API is running!');
    res.send('Scraper API is running!');
});
app.use((req, res, next) => {
    res.status(404).send({
        error: "Not Found",
        message: `The requested URL ${req.originalUrl} does not exist.`,
        availableRoutes: ['/banners', '/tier-list', '/characters', '/character/:name', '/support-card', '/support-card/:name', '/support-card-tiers']
    });
});
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
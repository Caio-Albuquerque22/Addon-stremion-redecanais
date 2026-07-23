const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

// Importamos o roteador oficial do SDK do Stremio
const router = getRouter(addonInterface);

module.exports = (req, res) => {
    // Passamos a requisição da Vercel para o roteador do Stremio
    // O terceiro parâmetro resolve o erro 500 garantindo que a Vercel não quebre
    router(req, res, () => {
        res.statusCode = 404;
        res.end();
    });
};
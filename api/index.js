const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

// O getRouter do Stremio gera automaticamente aquela tela visual bonita na rota "/"
module.exports = getRouter(addonInterface);
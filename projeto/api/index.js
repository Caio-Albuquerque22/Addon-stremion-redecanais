const addonInterface = require("../addon");

module.exports = (req, res) => {
    // Redireciona a raiz para o manifest.json
    if (req.url === "/" || req.url === "") {
        res.writeHead(307, { Location: "/manifest.json" });
        res.end();
        return;
    }

    // Passa a requisição para o SDK do Stremio
    addonInterface.getRouter()(req, res);
};
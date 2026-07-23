const addonInterface = require("../addon");

module.exports = (req, res) => {
    if (req.url === "/" || req.url === "") {
        res.writeHead(307, { Location: "/manifest.json" });
        res.end();
        return;
    }

    addonInterface.getRouter()(req, res);
};
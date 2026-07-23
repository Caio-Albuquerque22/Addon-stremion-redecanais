const { serveHTTP } = require("stremio-addon-sdk");
const addonInterface = require("./addon");

// Sobe o servidor na porta 7000
serveHTTP(addonInterface, { port: 7000 });

console.log("Addon rodando com sucesso!");
console.log("URL do Manifest: http://127.0.0.1:7000/manifest.json");
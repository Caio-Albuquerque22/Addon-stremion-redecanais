const express = require("express");
const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

const app = express();

// O Express repassa automaticamente a rota raiz "/" (a tela bonita) 
// e a "/manifest.json" para o SDK do Stremio
app.use("/", getRouter(addonInterface));

module.exports = app;
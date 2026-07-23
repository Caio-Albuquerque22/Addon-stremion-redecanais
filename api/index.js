const express = require("express");
const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

const app = express();

// O Express repassa automaticamente a rota raiz "/" (a tela bonita) 
// e a "/manifest.json" para o SDK do Stremio
app.use("/", getRouter(addonInterface));

module.exports = app;const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

const router = getRouter(addonInterface);

module.exports = (req, res) => {
    // Se acessar a raiz, mostra uma tela simples apenas com a URL para copiar
    if (req.url === "/" || req.url === "") {
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(`
            <body style="background:#121216; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
                <div style="background:#1e1e24; padding:30px; border-radius:8px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.5); width:90%; max-width:500px;">
                    <h2 style="margin-top:0; color:#8a5aeb;">Rede Canais - Stremio</h2>
                    <p style="color:#aaa; font-size:14px;">Copie a URL do Manifesto abaixo:</p>
                    <input type="text" value="https://${req.headers.host}/manifest.json" style="width:100%; padding:12px; font-size:14px; background:#121216; color:#00ffcc; border:1px solid #333; border-radius:4px; text-align:center; box-sizing:border-box; outline:none;" readonly onclick="this.select()">
                    <p style="margin-top:20px; font-size:13px;"><a href="/manifest.json" target="_blank" style="color:#8a5aeb; text-decoration:none;">Ver arquivo manifest.json direto</a></p>
                </div>
            </body>
        `);
        return;
    }

    // Deixa o Stremio SDK lidar com as rotas do addon (como o /manifest.json)
    router(req, res, () => {
        res.statusCode = 404;
        res.end("Not Found");
    });
};
const express = require("express");
const { getRouter } = require("stremio-addon-sdk");
const addonInterface = require("../addon");

const app = express();

// 1. Intercepta a rota raiz "/" para mostrar a sua interface customizada
app.get("/", (req, res) => {
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    
    // Pega o domínio público gerado pelo Vercel dinamicamente
    const host = req.headers.host;
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const manifestUrl = `${protocol}://${host}/manifest.json`;

    res.send(`
        <body style="background:#121216; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; margin:0;">
            <div style="background:#1e1e24; padding:30px; border-radius:8px; text-align:center; box-shadow:0 4px 20px rgba(0,0,0,0.5); width:90%; max-width:500px;">
                <h2 style="margin-top:0; color:#8a5aeb;">Rede Canais - Stremio</h2>
                <p style="color:#aaa; font-size:14px;">Copie a URL do Manifesto abaixo:</p>
                <input type="text" value="${manifestUrl}" style="width:100%; padding:12px; font-size:14px; background:#121216; color:#fff; border:1px solid #333; border-radius:4px; margin-bottom:20px; text-align:center;" readonly onclick="this.select()">
                <a href="/manifest.json" target="_blank" style="color:#8a5aeb; text-decoration:none; font-size:13px;">Ver arquivo manifest.json</a>
            </div>
        </body>
    `);
});

// 2. Repassa todas as outras rotas (/manifest.json, /catalog, /stream) para o SDK do Stremio
app.use("/", getRouter(addonInterface));

// 3. Exporta o app para o Vercel processar como Serverless Function
module.exports = app;
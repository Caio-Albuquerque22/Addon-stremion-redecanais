const addonInterface = require("../addon");

module.exports = (req, res) => {
    // Puxa o roteador correto do seu próprio addon
    const router = addonInterface.getRouter();
    
    // O Vercel precisa desse terceiro parâmetro (uma função de fallback) 
    // para não crashar caso a rota não seja encontrada
    router(req, res, () => {
        res.statusCode = 404;
        res.end();
    });
};
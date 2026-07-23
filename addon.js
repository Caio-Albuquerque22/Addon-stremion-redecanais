const { addonBuilder } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

// Domínio principal do site (atualize se o Rede Canais mudar de URL)
const BASE_URL = "https://redecanais.la";

// 1. MANIFESTO COM TODAS AS CATEGORIAS
const manifest = {
    id: "org.redecanais.addon",
    version: "1.0.0",
    name: "Rede Canais Premium",
    description: "Catálogo completo: Filmes, Séries, Animes e TV ao Vivo",
    resources: ["catalog", "stream"],
    types: ["movie", "series", "anime", "tv"],
    catalogs: [
        { type: "movie", id: "rc_movies", name: "Rede Canais - Filmes" },
        { type: "series", id: "rc_series", name: "Rede Canais - Séries" },
        { type: "anime", id: "rc_animes", name: "Rede Canais - Animes" },
        { type: "tv", id: "rc_channels", name: "Rede Canais - TV ao Vivo" }
    ]
};

const builder = new addonBuilder(manifest);

// 2. FUNÇÃO AUXILIAR PARA RASPAGEM (SCRAPING)
// Reutilizamos a mesma lógica para ler os cartazes, independentemente da categoria
async function fetchCatalog(url, tipoStremio) {
    try {
        const response = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const $ = cheerio.load(response.data);
        const metas = [];

        // O Rede Canais costuma usar a classe .pm-video-thumb ou .video-list
        $('.pm-video-thumb, .col-md-3').each((index, element) => {
            const title = $(element).find('img').attr('alt') || $(element).find('a').attr('title');
            const link = $(element).find('a').attr('href');
            let poster = $(element).find('img').attr('src');

            if (title && link) {
                // Ajusta o link da imagem se não for absoluto
                if (poster && !poster.startsWith('http')) poster = `${BASE_URL}/${poster}`;

                // Codificamos a URL do filme/canal em Base64 para não quebrar a rota do Stremio
                const safeUrl = Buffer.from(link).toString('base64');
                
                metas.push({
                    id: `rc_${tipoStremio}_${safeUrl}`, // Ex: rc_movie_aHR0cHM6Ly...
                    type: tipoStremio,
                    name: title.trim(),
                    poster: poster,
                    description: `Assistir ${title}`
                });
            }
        });
        return metas;
    } catch (error) {
        console.error(`Erro ao buscar página ${url}:`, error.message);
        return [];
    }
}

// 3. HANDLER DO CATÁLOGO (O MENU)
builder.defineCatalogHandler(async ({ type, id }) => {
    let metas = [];
    
    // Direciona o scraping para a página correta do site baseada no catálogo escolhido
    if (type === "movie" && id === "rc_movies") {
        metas = await fetchCatalog(`${BASE_URL}/browse-filmes-videos-1-date.html`, "movie");
    } else if (type === "series" && id === "rc_series") {
        metas = await fetchCatalog(`${BASE_URL}/browse-series-videos-1-date.html`, "series");
    } else if (type === "anime" && id === "rc_animes") {
        metas = await fetchCatalog(`${BASE_URL}/browse-desenhos-e-animes-videos-1-date.html`, "anime");
    } else if (type === "tv" && id === "rc_channels") {
        metas = await fetchCatalog(`${BASE_URL}/browse-canais-videos-1-date.html`, "tv");
    }

    return { metas };
});

// 4. HANDLER DE STREAMS (O PLAYER DE VÍDEO)
builder.defineStreamHandler(async ({ type, id }) => {
    // Só processamos se o ID começar com "rc_"
    if (id.startsWith("rc_")) {
        try {
            // Extrai e decodifica a URL da página do Base64
            const idParts = id.split("_");
            const encodedUrl = idParts[idParts.length - 1]; // Pega a última parte (o base64)
            const pagePath = Buffer.from(encodedUrl, 'base64').toString('ascii');
            const pageUrl = pagePath.startsWith('http') ? pagePath : `${BASE_URL}/${pagePath}`;

            // Pega o HTML da página do vídeo/canal
            const response = await axios.get(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
            const $ = cheerio.load(response.data);

            // Busca iframes de vídeo ou tags source
            let streamUrl = $("iframe").attr("src");

            // Se não for iframe, procura links m3u8 ou mp4 no código usando expressão regular
            if (!streamUrl) {
                const match = response.data.match(/(https?:\/\/[^"']+\.(?:m3u8|mp4)[^"']*)/i);
                if (match) streamUrl = match[1];
            }

            if (streamUrl) {
                return {
                    streams: [
                        {
                            title: `Assistir (${type.toUpperCase()})`,
                            url: streamUrl,
                            behaviorHints: {
                                // Engana o servidor deles para achar que estamos no site oficial
                                requestHeaders: {
                                    "User-Agent": "Mozilla/5.0",
                                    "Referer": BASE_URL
                                }
                            }
                        }
                    ]
                };
            }
        } catch (error) {
            console.error("Erro ao extrair stream:", error.message);
        }
    }
    return { streams: [] };
});

module.exports = builder.getInterface();
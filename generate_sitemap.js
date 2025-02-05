const base = process.argv[2] || "https://ccported.github.io";
const toModify = process.argv[3] || "no";
const fs = require("fs");
const other_domains = ["https://ccported.onrender.com"]; // Add your alternate domains here

const absLinks = [
    "/signup/",
    "/login/",
    "/",
    "/chat/",
    "/profile/",
    "/roms/"
]
const { games: gamesJSON } = require("./static/games.json");
const parseXml = require("./sitemap_parser.js");

function linkExtractor(xmlString) {
    const { root } = parseXml(xmlString);
    const urls = root.children.filter(child => child.name === "url");
    const links = urls.map(url => {
        let loc;
        let lastMod;
        for (let child of url.children) {
            if (child.name === "loc") {
                loc = child;
            }
            if (child.name === "lastmod") {
                lastMod = child;
            }
        }
        if(lastMod){
            lastMod = lastMod.children[0].content;
        }
        if (loc) {
            loc = loc.children[0].content
        }
        return [loc, lastMod];
    })
    return links
}

function format(link, priority = 1.00, lastMod = new Date().toISOString()) {
    return [base + link, priority, lastMod];
}

function generateAlternateLinks(path) {
    return other_domains.map(domain => 
        `    <xhtml:link 
        rel="alternate"
        href="${domain}${path}"/>`
    ).join('\n');
}

function xml([url, priority = 1.00, lastMod = new Date().toISOString()]) {
    const path = new URL(url).pathname;
    const alternateLinks = generateAlternateLinks(path);
    
    return `
<url>
    <loc>${url}</loc>
    <lastmod>${lastMod}</lastmod>
    <priority>${priority}</priority>
    <xhtml:link 
        rel="alternate"
        hreflang="x-default"
        href="${url}"/>
${alternateLinks}
</url>`;
}

function getLinks(existing, toModify) {
    let eJson = new Map();
    let links = new Set();
    for (let [link, lastMod] of existing) {
        eJson.set(link, lastMod);
    }
    for(let link of absLinks){
        const fullLink = base + link;
        if(eJson.has(fullLink)){
            if(toModify === "yes"){
                links.add(format(link, 1.00, new Date().toISOString()));
            }else{
                links.add(format(link, 1.00, eJson.get(fullLink)));
            }
        }else{
            links.add(format(link, 1.00, new Date().toISOString()));
        }
    }
    for (let game of gamesJSON) {
        const xlinks = game.links;
        const gameLinks = xlinks.map(link => link.link);
        for(let gameLink of gameLinks) {
            let path = new URL(gameLink, base).pathname;

            if (eJson.has(gameLink)) {
                if (toModify === "yes") {
                    links.add(format(path, 0.8));
                }else{
                    links.add(format(path, 0.8, eJson.get(gameLink)));
                }
            } else {
                links.add(format(path, 0.8));
            }
        }
    }
    return links;
}

function main() {
    const existing = linkExtractor(fs.readFileSync("static/sitemap.xml", "utf8"));
    const links = Array.from(getLinks(existing, toModify));
    const xmls = links.map(xml);
    const xmlString = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmls.join("\n")}
</urlset>`;
    fs.writeFileSync("static/sitemap.xml", xmlString);
}
main();
// Génère les 2 visuels « fiches techniques » A3 paysage à partir de data/recettes.json :
//   sortie/fiche-burgers.(png|pdf) et sortie/fiche-sandwichs.(png|pdf)
// Chaque colonne : nom du produit, montage en vue éclatée numéroté de bas en haut, puis le produit monté.
// Usage : node generer-fiches.js

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')
const { semer, f, couchesDe } = require('./lib/commun')
const ECLATE = require('./lib/eclate')
const PROFIL = require('./lib/profil')

const ICI = __dirname
const SORTIE = path.join(ICI, 'sortie')
const recettes = JSON.parse(fs.readFileSync(path.join(ICI, 'data', 'recettes.json'), 'utf8'))

// A3 paysage à 96 dpi (CSS) ; ×3.125 = 4961×3508 px, soit 300 dpi à l'impression
const PAGE_L = 1587
const PAGE_H = 1123
const ECHELLE_PNG = 3.125
const JAUNE = '#FFC20E'

const DEFS = `<defs>
  <linearGradient id="croute" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ECB25C"/><stop offset="1" stop-color="#B26A26"/></linearGradient>
  <linearGradient id="brioche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EBAA52"/><stop offset="1" stop-color="#B26A26"/></linearGradient>
  <linearGradient id="viande" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4528"/><stop offset="1" stop-color="#3E2112"/></linearGradient>
  <linearGradient id="pane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDB65A"/><stop offset="1" stop-color="#C47F25"/></linearGradient>
  <filter id="ombre" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="1.5" stdDeviation="1.2" flood-opacity=".35"/></filter>
  <radialGradient id="halo" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#FF8A1E" stop-opacity=".38"/><stop offset=".55" stop-color="#FF6A00" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
</defs>`

// Type de dessin « produit monté » correspondant à une couche
function typeProfil(c, baguette) {
    if (c.t === 'painBas') return baguette ? 'painSandwichBas' : 'painBurgerBas'
    if (c.t === 'painHaut') return baguette ? 'painSandwichHaut' : 'painBurgerHaut'
    if (c.t === 'pieces') return c.nom === 'jalapeño' ? 'jalapeno' : 'cornichon'
    return c.t
}

function hauteurProfil(couches, baguette) {
    let h = couches.reduce((s, c) => s + PROFIL[typeProfil(c, baguette)].h + 1.5, 0)
    if (couches[0].t === 'galette') h += PROFIL.galette.h + 4
    return h
}

// Produit monté, vu de profil, posé sur yBas
function dessinerMonte(produit, cx, yBas, W, k, baguette) {
    semer(produit.numero * 31 + 7)
    const couches = couchesDe(produit)
    let y = yBas
    let svg = ''
    for (const c of couches) {
        const D = PROFIL[typeProfil(c, baguette)]
        const w = W * D.l
        y -= D.h * k
        svg += `<g transform="translate(0 ${f(y)}) scale(1 ${k}) translate(0 ${-y})">${D.svg(cx - w / 2, y, w, D.h, c.q, c.nom)}</g>`
        y -= 1.5 * k
    }
    if (couches[0].t === 'galette') {
        // wrap : galette repliée par-dessus, vue en coupe
        const D = PROFIL.galette
        const w = W * D.l
        const x = cx - w / 2
        y -= 2 * k
        const yHaut = y - D.h * k
        svg = `<path d="M${f(x + 6)},${f(yBas)} Q${f(x - 10)},${f(yBas)} ${f(x - 10)},${f((yBas + yHaut) / 2)} Q${f(x - 10)},${f(yHaut)} ${f(x + 6)},${f(yHaut)}
                     M${f(x + w - 6)},${f(yBas)} Q${f(x + w + 10)},${f(yBas)} ${f(x + w + 10)},${f((yBas + yHaut) / 2)} Q${f(x + w + 10)},${f(yHaut)} ${f(x + w - 6)},${f(yHaut)}"
                     fill="none" stroke="#F1DEB0" stroke-width="${f(D.h * k)}" stroke-linecap="round"/>` + svg
        svg += `<g transform="translate(0 ${f(yHaut)}) scale(1 ${k}) translate(0 ${-yHaut})">${D.svg(x, yHaut, w, D.h)}</g>`
    }
    return `<ellipse cx="${f(cx)}" cy="${f(yBas + 3)}" rx="${f(W * 0.62)}" ry="5" fill="#000" opacity=".55"/>` + svg
}

// Montage en vue éclatée : pastille jaune numérotée + dessin + nom de la couche
function dessinerEclate(produit, l, h, o) {
    semer(produit.numero * 97 + (o.baguette ? 13 : 0))
    const couches = couchesDe(produit)
    const n = couches.length
    const pas = Math.min(o.pas * 1.45, (h - 14) / (n + 0.35))
    const sDessin = o.pas * 0.66
    let svg = ''
    couches.forEach((c, i) => {
        const cy = h - 10 - pas * (i + 0.5)
        const yDessin = cy - o.pas * 0.12
        svg += `<g filter="url(#ombre)">${ECLATE[c.t](o.centre, yDessin, o.largeur, sDessin, c.q, c.nom, o.baguette)}</g>`
        svg += `<text x="${f(o.centre)}" y="${f(yDessin + o.pas * 0.4 + 4)}" text-anchor="middle" class="${c.fort ? 'lab fort' : 'lab'}">${c.e}</text>`
        svg += `<circle cx="13" cy="${f(yDessin)}" r="8.5" fill="${JAUNE}" stroke="#111" stroke-width="1.2"/>
                <text x="13" y="${f(yDessin + 3.6)}" text-anchor="middle" class="pastille">${i + 1}</text>`
    })
    return svg
}

function colonne(produit, l, H, o) {
    return `<div class="col">
      <div class="tete"><span class="rond">${produit.numero}</span><span>${produit.nom}</span></div>
      <div class="papier"><svg width="${l}" height="${H.papier}">${DEFS}${dessinerEclate(produit, l, H.papier, o)}</svg></div>
      <div class="photo"><svg width="${l}" height="${H.photo}">${DEFS}
        <rect width="${l}" height="${H.photo}" fill="url(#halo)"/>
        ${dessinerMonte(produit, l / 2, H.photo - 14, o.largeurMonte, o.k, o.baguette)}</svg></div>
      <div class="nom">${produit.nom}</div>
    </div>`
}

// Bandeau des ingrédients utilisés sur la page (dans un ordre fixe)
const CATALOGUE = [
    ['painBurger', 'Pain burger', (cx, cy) => ECLATE.painHaut(cx, cy + 4, 46, 26)],
    ['painSandwich', 'Pain sandwich', (cx, cy) => ECLATE.painHaut(cx, cy + 4, 50, 26, 1, '', true)],
    ['galette', 'Galette fajitas', (cx, cy) => ECLATE.galette(cx, cy, 42, 30)],
    ['sauce biggy', 'Sauce Biggy', (cx, cy) => ECLATE.sauce(cx, cy, 54, 40, 1, 'sauce biggy')],
    ['sauce pepper', 'Sauce Pepper', (cx, cy) => ECLATE.sauce(cx, cy, 54, 40, 1, 'sauce pepper')],
    ['sauce spicy', 'Sauce Spicy', (cx, cy) => ECLATE.sauce(cx, cy, 54, 40, 1, 'sauce spicy')],
    ['sauce bbq', 'Sauce BBQ', (cx, cy) => ECLATE.sauce(cx, cy, 54, 40, 1, 'sauce bbq')],
    ['ketchup', 'Ketchup', (cx, cy) => ECLATE.sauce(cx, cy, 54, 40, 1, 'ketchup')],
    ['cheddar', 'Cheddar', (cx, cy) => ECLATE.cheddar(cx, cy, 48, 30)],
    ['steak', 'Steak', (cx, cy) => ECLATE.steak(cx, cy, 48, 32)],
    ['tender', 'Tender', (cx, cy) => ECLATE.tender(cx, cy, 60, 32, 1)],
    ['tenderSmashe', 'Tender smashé', (cx, cy) => ECLATE.tenderSmashe(cx, cy, 46, 30)],
    ['bacon', '½ bacon américain', (cx, cy) => ECLATE.bacon(cx, cy, 70, 30)],
    ['cornichon', 'Cornichon', (cx, cy) => ECLATE.pieces(cx, cy, 30, 34, 1, 'cornichon')],
    ['jalapeño', 'Jalapeño', (cx, cy) => ECLATE.pieces(cx, cy, 30, 34, 1, 'jalapeño')],
    ['oignonsRouges', 'Oignons rouges', (cx, cy) => ECLATE.oignonsRouges(cx, cy, 46, 34)],
    ['oignonsCaramelises', 'Oignons caramélisés', (cx, cy) => ECLATE.oignonsCaramelises(cx, cy, 50, 34)],
    ['oignonsFrits', 'Oignons frits', (cx, cy) => ECLATE.oignonsFrits(cx, cy, 50, 34)],
    ['salade', 'Salade', (cx, cy) => ECLATE.salade(cx, cy, 50, 34)],
]

function clesUtilisees(produits) {
    const cles = new Set()
    for (const p of produits)
        for (const c of couchesDe(p)) {
            if (c.t === 'painBas' || c.t === 'painHaut') cles.add(p.pain === 'pain sandwich' ? 'painSandwich' : 'painBurger')
            else if (c.t === 'sauce') cles.add(c.nom)
            else if (c.t === 'pieces') cles.add(c.nom)
            else cles.add(c.t)
        }
    return cles
}

function bandeauIngredients(produits) {
    const cles = clesUtilisees(produits)
    return CATALOGUE.filter(([cle]) => cles.has(cle))
        .map(([, nom, dessin]) => `<div class="ing"><svg width="62" height="44">${DEFS}<g filter="url(#ombre)">${dessin(31, 22)}</g></svg><span>${nom}</span></div>`)
        .join('')
}

const LOGO = `<svg width="92" height="92" viewBox="0 0 92 92">
  <circle cx="46" cy="46" r="43" fill="#0B0B0B" stroke="#fff" stroke-width="4"/>
  <circle cx="46" cy="46" r="35" fill="none" stroke="#fff" stroke-width="1.5"/>
  <path d="M22,34 Q46,14 70,34" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
  <rect x="8" y="38" width="76" height="20" rx="3" fill="#fff"/>
  <text x="46" y="53.5" text-anchor="middle" font-family="Anton" font-size="16" fill="#0B0B0B" letter-spacing=".5">TASTY FOOD</text>
  <path d="M22,62 Q46,80 70,62" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
</svg>`

function page({ titre, produits, opts }) {
    const MARGE = 16, HAUT_TETE = 112, BAS = 26
    const nb = produits.length
    const l = Math.floor((PAGE_L - 2 * MARGE - 8) / nb)
    const hBande = PAGE_H - 2 * MARGE - HAUT_TETE - BAS
    const H = { tete: 40, nom: 40, photo: opts.hautPhoto }
    H.papier = hBande - 8 - H.tete - H.nom - H.photo
    const maxCouches = Math.max(...produits.map((p) => p.couches_bas_vers_haut.length))
    const pas = Math.min(54, (H.papier - 14) / (maxCouches + 0.35))
    // même échelle verticale pour tous les produits montés : les hauteurs se comparent d'un coup d'œil
    const plusHaut = Math.max(...produits.map((p) => hauteurProfil(couchesDe(p), opts.baguette)))
    const k = Math.min(opts.kMax, (H.photo - 24) / plusHaut)
    const o = { ...opts, pas, k }
    const police = (nom, fichier, poids) =>
        `@font-face { font-family:'${nom}'; font-weight:${poids}; src:url('file://${path.join(ICI, 'polices', fichier)}') format('woff2') }`
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${titre} · Fiches techniques</title><style>
  ${police('Anton', 'anton-latin-400-normal.woff2', 400)}
  ${police('Oswald', 'oswald-latin-500-normal.woff2', 500)}
  ${police('Oswald', 'oswald-latin-600-normal.woff2', 600)}
  ${police('Oswald', 'oswald-latin-700-normal.woff2', 700)}
  @page { size: A3 landscape; margin: 0 }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { width:${PAGE_L}px; height:${PAGE_H}px; padding:${MARGE}px; overflow:hidden; color:#fff;
         font-family: Oswald, "Arial Narrow", Arial, sans-serif;
         background: radial-gradient(ellipse at 30% 0%, #222 0%, #0A0A0A 55%) #0A0A0A }
  header { height:${HAUT_TETE}px; display:flex; align-items:center; gap:18px }
  .titre { display:flex; flex-direction:column; align-items:flex-start }
  .titre h1 { font-family:Anton; font-weight:400; font-size:78px; line-height:.95; letter-spacing:1px; text-transform:uppercase;
              text-shadow: 0 3px 0 #000, 0 0 18px rgba(255,255,255,.08) }
  .ruban { margin-top:2px; margin-left:26px; background:${JAUNE}; color:#111; font-weight:700; font-size:19px; letter-spacing:1px;
           padding:1px 18px; transform:rotate(-3deg) skewX(-10deg); text-transform:uppercase;
           clip-path: polygon(2% 8%, 30% 0, 62% 6%, 100% 0, 97% 55%, 100% 100%, 64% 92%, 30% 100%, 0 94%, 3% 50%) }
  .ingredients { margin-left:auto; display:flex; gap:2px }
  .ing { width:66px; display:flex; flex-direction:column; align-items:center; text-align:center }
  .ing span { font-size:11px; font-weight:500; line-height:1.1; color:#EEE; margin-top:1px }
  .bande { height:${hBande}px; display:flex; border:2px solid #3A3A3A; border-radius:12px; overflow:hidden; background:#111;
           padding:2px }
  .col { width:${l}px; display:flex; flex-direction:column; border-right:2px solid #0A0A0A }
  .col:last-child { border-right:0 }
  .tete { height:${H.tete}px; display:flex; align-items:center; gap:7px; padding:0 8px; background:#111;
          font-family:Anton; font-size:${opts.taillenom}px; letter-spacing:.5px; text-transform:uppercase; white-space:nowrap }
  .rond { flex:none; width:24px; height:24px; border-radius:50%; background:${JAUNE}; color:#111; border:1.5px solid #000;
          font-family:Oswald; font-weight:700; font-size:14px; display:flex; align-items:center; justify-content:center }
  .papier { height:${H.papier}px; background: linear-gradient(180deg, #F4EFE6 0%, #EAE3D6 100%) }
  .photo { height:${H.photo}px; background:#060606 }
  .nom { height:${H.nom}px; background:#060606; font-family:Anton; font-size:${opts.taillenom + 4}px; letter-spacing:.5px; text-transform:uppercase;
         display:flex; align-items:center; justify-content:center; white-space:nowrap; border-top:1px solid #222 }
  svg .lab { font-family:Oswald; font-weight:500; font-size:${opts.tailleLab}px; fill:#2A2A2A }
  svg .fort { font-weight:700; fill:#000 }
  svg .pastille { font-family:Oswald; font-weight:700; font-size:11px; fill:#111 }
  footer { height:${BAS}px; display:flex; align-items:flex-end; justify-content:space-between; font-size:13px; color:#BBB; letter-spacing:.5px }
  footer b { color:${JAUNE}; font-weight:600 }
</style></head><body>
  <header>
    ${LOGO}
    <div class="titre"><h1>${titre}</h1><div class="ruban">Fiches techniques</div></div>
    <div class="ingredients">${bandeauIngredients(produits)}</div>
  </header>
  <div class="bande">${produits.map((p) => colonne(p, l - 1, H, o)).join('')}</div>
  <footer><span>Lire chaque produit <b>de bas en haut</b> : 1 = première couche posée</span>
    <span><b>Rien hors fiche</b> : pas de tomate, pas de sésame, pas d'autre sauce</span>
    <span>Tasty Food <b>Saint-Gilles</b> · Liège</span></footer>
</body></html>`
}

async function main() {
    fs.mkdirSync(SORTIE, { recursive: true })
    const pages = {
        'fiche-burgers': page({
            titre: 'Burgers',
            produits: recettes.burgers,
            opts: { largeur: 84, centre: 80, largeurMonte: 104, kMax: 1.2, hautPhoto: 200, tailleLab: 10.5, taillenom: 18 },
        }),
        'fiche-sandwichs': page({
            titre: 'Sandwichs',
            produits: recettes.sandwichs,
            opts: { largeur: 140, centre: 108, largeurMonte: 168, kMax: 1.3, hautPhoto: 190, tailleLab: 12, taillenom: 20, baguette: true },
        }),
    }
    const navigateur = await chromium.launch()
    for (const [nom, html] of Object.entries(pages)) {
        const fichierHtml = path.join(SORTIE, nom + '.html')
        fs.writeFileSync(fichierHtml, html)
        const onglet = await navigateur.newPage({ viewport: { width: PAGE_L, height: PAGE_H }, deviceScaleFactor: ECHELLE_PNG })
        await onglet.goto('file://' + fichierHtml)
        await onglet.evaluate(() => document.fonts.ready)
        await onglet.screenshot({ path: path.join(SORTIE, nom + '.png') })
        await onglet.pdf({ path: path.join(SORTIE, nom + '.pdf'), format: 'A3', landscape: true, printBackground: true })
        console.log('✔', nom + '.png', '+', nom + '.pdf')
    }
    await navigateur.close()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})

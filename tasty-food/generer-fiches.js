// Génère les fiches techniques A3 paysage (burgers + sandwichs) à partir de data/recettes.json.
// Style « vue éclatée » : chaque couche est dessinée séparément, de bas en haut, avec son nom à gauche.
// Usage : node generer-fiches.js   →  sortie/fiche-burgers.(png|pdf), sortie/fiche-sandwichs.(png|pdf)

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const ICI = __dirname
const SORTIE = path.join(ICI, 'sortie')
const recettes = JSON.parse(fs.readFileSync(path.join(ICI, 'data', 'recettes.json'), 'utf8'))

// A3 paysage à 96 dpi (CSS) ; ×3.125 = 4961×3508 px, soit 300 dpi à l'impression
const PAGE_L = 1587
const PAGE_H = 1123
const ECHELLE_PNG = 3.125

const COULEURS = {
    'sauce biggy': '#D9B77E',
    'sauce pepper': '#D6C09A',
    'sauce spicy': '#E8562A',
    'sauce bbq': '#4A2414',
    ketchup: '#C8201E',
}

// ---------- utilitaires ----------
let graine = 1
const alea = () => {
    graine = (graine * 16807) % 2147483647
    return (graine - 1) / 2147483646
}
const f = (n) => Math.round(n * 10) / 10

// Disque épais vu en légère plongée (steak, tranche…)
function cylindre(cx, cy, rx, ry, ep, dessus, cote, trait) {
    const y0 = cy - ep / 2
    return `<path d="M${f(cx - rx)},${f(y0)} V${f(y0 + ep)} A${f(rx)},${f(ry)} 0 0 0 ${f(cx + rx)},${f(y0 + ep)} V${f(y0)} Z" fill="${cote}" stroke="${trait}" stroke-width="1"/>
            <ellipse cx="${f(cx)}" cy="${f(y0)}" rx="${f(rx)}" ry="${f(ry)}" fill="${dessus}" stroke="${trait}" stroke-width="1"/>`
}

// Contour ondulé autour d'une ellipse (salade, sauce…)
function contourOndule(cx, cy, rx, ry, n, amp) {
    let d = ''
    for (let i = 0; i <= n * 2; i++) {
        const a = (Math.PI * i) / n
        const k = i % 2 ? 1 + amp : 1 - amp * 0.3
        d += `${i ? 'L' : 'M'}${f(cx + Math.cos(a) * rx * k)},${f(cy + Math.sin(a) * ry * k)} `
    }
    return d + 'Z'
}

// ---------- dessin de chaque couche ----------
// Chaque fonction reçoit cx, cy (centre), W (largeur de référence), s (hauteur d'une couche), q (quantité), nom.
const DESSINS = {
    painBas: (cx, cy, W, s) => {
        const rx = W / 2, ry = s * 0.2, ep = s * 0.42, y0 = cy - ep / 3
        return `<path d="M${f(cx - rx)},${f(y0)} C${f(cx - rx)},${f(y0 + ep * 1.25)} ${f(cx + rx)},${f(y0 + ep * 1.25)} ${f(cx + rx)},${f(y0)} Z" fill="url(#croute)" stroke="#8A5520" stroke-width="1"/>
                <ellipse cx="${f(cx)}" cy="${f(y0)}" rx="${f(rx)}" ry="${f(ry)}" fill="#F7E3BC" stroke="#C9974F" stroke-width="1"/>`
    },
    painHaut: (cx, cy, W, s, q, nom, baguette) => {
        const rx = W / 2, ry = s * 0.16, hd = baguette ? s * 0.62 : s * 0.85, yb = cy + s * 0.18
        let o = `<ellipse cx="${f(cx)}" cy="${f(yb)}" rx="${f(rx)}" ry="${f(ry)}" fill="#F7E3BC" stroke="#C9974F" stroke-width="1"/>
                 <path d="M${f(cx - rx)},${f(yb)} C${f(cx - rx)},${f(yb - hd * 1.3)} ${f(cx + rx)},${f(yb - hd * 1.3)} ${f(cx + rx)},${f(yb)} A${f(rx)},${f(ry)} 0 0 1 ${f(cx - rx)},${f(yb)} Z" fill="url(#croute)" stroke="#8A5520" stroke-width="1"/>`
        if (baguette)
            for (let i = 1; i <= 4; i++) {
                const x = cx - rx + (W * i) / 5
                o += `<path d="M${f(x - 13)},${f(yb - hd * 0.45)} Q${f(x)},${f(yb - hd * 1.0)} ${f(x + 13)},${f(yb - hd * 0.75)}" stroke="#F0D29A" stroke-width="3" fill="none" stroke-linecap="round"/>`
            }
        else o += `<ellipse cx="${f(cx - W * 0.12)}" cy="${f(yb - hd * 0.62)}" rx="${f(W * 0.17)}" ry="${f(hd * 0.12)}" fill="#fff" opacity=".35"/>`
        return o
    },
    sauce: (cx, cy, W, s, q, nom) => {
        const c = COULEURS[nom]
        let o = `<path d="${contourOndule(cx, cy, W * 0.36, s * 0.2, 9, 0.12)}" fill="${c}" stroke="rgba(0,0,0,.3)" stroke-width=".8"/>`
        o += `<ellipse cx="${f(cx - W * 0.08)}" cy="${f(cy - s * 0.05)}" rx="${f(W * 0.12)}" ry="${f(s * 0.05)}" fill="#fff" opacity=".3"/>`
        if (nom === 'sauce pepper')
            for (let i = 0; i < 30; i++) {
                const a = alea() * Math.PI * 2, r = Math.sqrt(alea())
                o += `<circle cx="${f(cx + Math.cos(a) * r * W * 0.32)}" cy="${f(cy + Math.sin(a) * r * s * 0.16)}" r="1" fill="#151515"/>`
            }
        return o
    },
    pieces: (cx, cy, W, s, q, nom) => {
        // cornichons et jalapeños : q rondelles bien séparées, faciles à compter
        const jal = nom === 'jalapeño'
        const zone = W * 0.86
        const pas = zone / q
        const rx = Math.min(pas / 2 - 3, 16), ry = Math.min(s * 0.17, rx * 0.55)
        let o = ''
        for (let i = 0; i < q; i++) {
            const x = cx - zone / 2 + pas * (i + 0.5)
            const y = cy + (q > 3 ? (i % 2 ? -s * 0.1 : s * 0.1) : 0)
            o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx)}" ry="${f(ry)}" fill="${jal ? '#3E7D1E' : '#5C8A2E'}" stroke="${jal ? '#1E4A0C' : '#2F4F14'}" stroke-width="1.2"/>
                  <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(rx * 0.68)}" ry="${f(ry * 0.6)}" fill="${jal ? '#DCE9A8' : '#BFD472'}"/>`
            if (jal) o += `<circle cx="${f(x - 2.5)}" cy="${f(y)}" r="1.1" fill="#fff"/><circle cx="${f(x + 2.5)}" cy="${f(y)}" r="1.1" fill="#fff"/>`
            else o += `<circle cx="${f(x)}" cy="${f(y)}" r="1.4" fill="#7FA43C"/>`
        }
        return o
    },
    steak: (cx, cy, W, s) => {
        const rx = W * 0.46, ry = s * 0.2
        let o = cylindre(cx, cy, rx, ry, s * 0.34, '#6E3C22', '#45230F', '#2A140A')
        const yt = cy - s * 0.17
        for (let i = 0; i < 26; i++) {
            const a = alea() * Math.PI * 2, r = Math.sqrt(alea()) * 0.85
            o += `<circle cx="${f(cx + Math.cos(a) * r * rx)}" cy="${f(yt + Math.sin(a) * r * ry)}" r="${f(0.8 + alea())}" fill="${alea() > 0.5 ? '#3B1C0C' : '#94583A'}"/>`
        }
        return o
    },
    cheddar: (cx, cy, W, s) => {
        // tranche carrée vue en plongée, coins qui fondent
        const a = W * 0.44, b = s * 0.24
        return `<path d="M${f(cx - a)},${f(cy)} L${f(cx)},${f(cy - b)} L${f(cx + a)},${f(cy)} L${f(cx)},${f(cy + b)} Z" fill="#F5A81C" stroke="#C47A06" stroke-width="1"/>
                <path d="M${f(cx - a)},${f(cy)} Q${f(cx - a - 2)},${f(cy + 8)} ${f(cx - a + 6)},${f(cy + 7)} L${f(cx - a + 9)},${f(cy + 2)} Z" fill="#F5A81C" stroke="#C47A06" stroke-width=".8"/>
                <path d="M${f(cx + a)},${f(cy)} Q${f(cx + a + 2)},${f(cy + 9)} ${f(cx + a - 6)},${f(cy + 8)} L${f(cx + a - 9)},${f(cy + 2)} Z" fill="#F5A81C" stroke="#C47A06" stroke-width=".8"/>
                <path d="M${f(cx - a * 0.5)},${f(cy - b * 0.3)} L${f(cx)},${f(cy - b * 0.8)}" stroke="#FFD27A" stroke-width="2" stroke-linecap="round"/>`
    },
    salade: (cx, cy, W, s) => {
        const rx = W * 0.44, ry = s * 0.26
        let o = `<path d="${contourOndule(cx, cy, rx, ry, 14, 0.1)}" fill="#7DBE3A" stroke="#3E7A17" stroke-width="1"/>`
        o += `<path d="M${f(cx - rx * 0.75)},${f(cy)} H${f(cx + rx * 0.75)}" stroke="#D2EBA6" stroke-width="1.6"/>`
        for (let i = -3; i <= 3; i++) o += `<path d="M${f(cx + i * rx * 0.2)},${f(cy)} l${f(rx * 0.08)},${f(-ry * 0.6)} M${f(cx + i * rx * 0.2)},${f(cy)} l${f(rx * 0.08)},${f(ry * 0.6)}" stroke="#B9DE85" stroke-width="1"/>`
        return o
    },
    oignonsRouges: (cx, cy, W, s) => {
        let o = ''
        const n = 6
        for (let i = 0; i < n; i++) {
            const x = cx - W * 0.36 + (W * 0.72 * i) / (n - 1)
            const y = cy + (i % 2 ? -s * 0.09 : s * 0.09)
            o += `<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(W * 0.075)}" ry="${f(s * 0.12)}" fill="none" stroke="#8E2D6E" stroke-width="3"/>
                  <ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(W * 0.075)}" ry="${f(s * 0.12)}" fill="none" stroke="#F1D2E6" stroke-width="1"/>`
        }
        return o
    },
    oignonsCaramelises: (cx, cy, W, s) => {
        let o = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(W * 0.38)}" ry="${f(s * 0.17)}" fill="#C27A35" stroke="#7A3A10" stroke-width=".8"/>`
        for (let i = 0; i < 14; i++) {
            const x = cx - W * 0.32 + alea() * W * 0.5
            const y = cy - s * 0.1 + alea() * s * 0.2
            o += `<path d="M${f(x)},${f(y)} q5,-4 9,0 t9,0" stroke="#6E300C" stroke-width="1.6" fill="none" stroke-linecap="round"/>`
        }
        return o
    },
    oignonsFrits: (cx, cy, W, s) => {
        let o = ''
        for (let i = 0; i < 34; i++) {
            const a = alea() * Math.PI * 2, r = Math.sqrt(alea())
            o += `<ellipse cx="${f(cx + Math.cos(a) * r * W * 0.36)}" cy="${f(cy + Math.sin(a) * r * s * 0.18)}" rx="${f(2.5 + alea() * 2)}" ry="2" fill="${alea() > 0.5 ? '#C98A2B' : '#E5B552'}" stroke="#8A5A12" stroke-width=".5"/>`
        }
        return o
    },
    bacon: (cx, cy, W, s) => {
        // une demi-tranche : une seule bande ondulée, plus courte qu'un steak
        const l = W * 0.5, x0 = cx - l / 2, e = s * 0.2
        let d = `M${f(x0)},${f(cy - e / 2)}`
        for (let i = 1; i <= 5; i++) d += ` Q${f(x0 + (l * (i - 0.5)) / 5)},${f(cy - e / 2 + (i % 2 ? -4 : 4))} ${f(x0 + (l * i) / 5)},${f(cy - e / 2)}`
        d += ` V${f(cy + e / 2)}`
        for (let i = 4; i >= 0; i--) d += ` Q${f(x0 + (l * (i + 0.5)) / 5)},${f(cy + e / 2 + (i % 2 ? 4 : -4))} ${f(x0 + (l * i) / 5)},${f(cy + e / 2)}`
        return `<path d="${d} Z" fill="#B33A2E" stroke="#6E1A12" stroke-width="1"/>
                <path d="M${f(x0 + 3)},${f(cy)} H${f(x0 + l - 3)}" stroke="#F3D3C2" stroke-width="1.8"/>`
    },
    tender: (cx, cy, W, s, q) => {
        let o = ''
        const l = q > 1 ? W * 0.42 : W * 0.6, h = s * 0.36, gap = W * 0.06
        const total = q * l + (q - 1) * gap
        for (let i = 0; i < q; i++) {
            const x = cx - total / 2 + i * (l + gap)
            o += `<rect x="${f(x)}" y="${f(cy - h / 2)}" width="${f(l)}" height="${f(h)}" rx="${f(h / 2)}" fill="url(#pane)" stroke="#8A5410" stroke-width="1"/>`
            for (let k = 0; k < 16; k++) o += `<circle cx="${f(x + 5 + alea() * (l - 10))}" cy="${f(cy - h / 2 + 3 + alea() * (h - 6))}" r="1.1" fill="#A8661A" opacity=".85"/>`
        }
        return o
    },
    tenderSmashe: (cx, cy, W, s) => {
        let o = cylindre(cx, cy, W * 0.45, s * 0.22, s * 0.16, 'url(#pane)', '#B5731F', '#8A5410')
        for (let k = 0; k < 30; k++) {
            const a = alea() * Math.PI * 2, r = Math.sqrt(alea()) * 0.85
            o += `<circle cx="${f(cx + Math.cos(a) * r * W * 0.45)}" cy="${f(cy - s * 0.08 + Math.sin(a) * r * s * 0.22)}" r="1.1" fill="#A8661A"/>`
        }
        return o
    },
    galette: (cx, cy, W, s) => {
        let o = `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(W * 0.52)}" ry="${f(s * 0.28)}" fill="#F1DEB0" stroke="#B58F4E" stroke-width="1.2"/>`
        for (let k = 0; k < 12; k++) {
            const a = alea() * Math.PI * 2, r = Math.sqrt(alea()) * 0.85
            o += `<ellipse cx="${f(cx + Math.cos(a) * r * W * 0.5)}" cy="${f(cy + Math.sin(a) * r * s * 0.26)}" rx="3" ry="1.5" fill="#C08A3E" opacity=".7"/>`
        }
        return o
    },
}

// Associe chaque ingrédient de la fiche à un dessin et à une étiquette courte
function decrire(ingredient, q, numero) {
    if (ingredient.endsWith('(bas)')) return { t: 'painBas', e: 'Pain du bas' }
    if (ingredient.endsWith('(haut)')) return { t: 'painHaut', e: 'Pain du haut' }
    if (ingredient.startsWith('galette')) return { t: 'galette', e: 'Galette fajitas' }
    if (ingredient.startsWith('sauce') || ingredient === 'ketchup') {
        const nom = ingredient.replace(/ \(.*/, '')
        const noms = { ketchup: 'Ketchup', 'sauce biggy': 'Sauce Biggy', 'sauce pepper': 'Sauce Pepper', 'sauce spicy': 'Sauce Spicy', 'sauce bbq': 'Sauce BBQ' }
        return { t: 'sauce', nom, e: noms[nom] }
    }
    if (ingredient === 'cornichon') return { t: 'pieces', nom: 'cornichon', e: `${q} cornichon${q > 1 ? 's' : ''}`, fort: 1 }
    if (ingredient === 'jalapeño') return { t: 'pieces', nom: 'jalapeño', e: `${q} jalapeños`, fort: 1 }
    if (ingredient === 'steak') return { t: 'steak', e: 'Steak' + numero, fort: 1 }
    if (ingredient === 'cheddar') return { t: 'cheddar', e: 'Cheddar' + numero }
    if (ingredient === 'feuille de salade') return { t: 'salade', e: '1 feuille salade' }
    if (ingredient === 'oignons rouges') return { t: 'oignonsRouges', e: 'Oignons rouges' }
    if (ingredient === 'oignons caramélisés') return { t: 'oignonsCaramelises', e: 'Oignons caramélisés' }
    if (ingredient === 'oignons frits') return { t: 'oignonsFrits', e: 'Oignons frits' }
    if (ingredient.includes('bacon')) return { t: 'bacon', e: '½ bacon américain', fort: 1 }
    if (ingredient.startsWith('tender smashé')) return { t: 'tenderSmashe', e: 'Tender smashé', fort: 1 }
    if (ingredient === 'tender') return { t: 'tender', e: q > 1 ? `${q} tenders` : '1 tender', fort: 1 }
    throw new Error('Ingrédient sans dessin : ' + ingredient)
}

function couchesDe(produit) {
    const total = {}
    for (const c of produit.couches_bas_vers_haut) total[c.ingredient] = (total[c.ingredient] || 0) + 1
    const compteur = {}
    return produit.couches_bas_vers_haut.map((c) => {
        compteur[c.ingredient] = (compteur[c.ingredient] || 0) + 1
        const numero = total[c.ingredient] > 1 ? ' ' + compteur[c.ingredient] : ''
        return { ...decrire(c.ingredient, c.quantite, numero), q: c.quantite }
    })
}

// Coupe une étiquette trop longue en deux lignes
function lignes(texte, max) {
    if (texte.length <= max) return [texte]
    const i = texte.lastIndexOf(' ', max)
    return i > 0 ? [texte.slice(0, i), texte.slice(i + 1)] : [texte]
}

function dessinerProduit(produit, svgH, o) {
    graine = produit.numero * 97 + (o.baguette ? 13 : 0)
    const couches = couchesDe(produit)
    const s = o.pas
    const n = couches.length
    // pile centrée verticalement (un peu plus de place en haut pour le dôme du pain)
    const yBas = svgH / 2 + ((n - 1) * s) / 2 + s * 0.3
    let svg = ''
    couches.forEach((c, i) => {
        const cy = yBas - i * s
        svg += DESSINS[c.t](o.centre, cy, o.largeur, s, c.q, c.nom, o.baguette)
        const ls = lignes(c.e, o.maxCar)
        const y0 = cy + 4 - ((ls.length - 1) * o.taille) / 2
        svg += `<text x="${o.xTexte}" y="${f(y0)}" text-anchor="end" class="${c.fort ? 'lab fort' : 'lab'}" style="font-size:${o.taille}px">${ls
            .map((l, k) => `<tspan x="${o.xTexte}" dy="${k ? o.taille : 0}">${l}</tspan>`)
            .join('')}</text>
                <text x="6" y="${f(cy + 4)}" class="num">${i + 1}</text>`
    })
    return svg
}

const DEFS = `<defs>
  <linearGradient id="croute" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9AE58"/><stop offset="1" stop-color="#B8742C"/></linearGradient>
  <linearGradient id="pane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDB65A"/><stop offset="1" stop-color="#C47F25"/></linearGradient>
</defs>`

function carte(produit, l, svgH, o) {
    return `<div class="carte">
      <div class="tete"><span class="numero">${produit.numero}</span>${produit.nom}</div>
      <svg width="${l}" height="${svgH}" viewBox="0 0 ${l} ${svgH}">${DEFS}${dessinerProduit(produit, svgH, o)}</svg>
      <div class="resume">${produit.legende}</div>
    </div>`
}

function legendeSauces() {
    const item = (c, t, extra = '') => `<span class="sw"><i style="background:${c}">${extra}</i>${t}</span>`
    return `<div class="legende">
      <b>Sauces&nbsp;:</b>
      ${item(COULEURS['sauce biggy'], 'Biggy (beige)')}
      ${item(COULEURS['sauce pepper'], 'Pepper (poivrée)', '<em></em>')}
      ${item(COULEURS['sauce spicy'], 'Spicy (rouge-orangé)')}
      ${item(COULEURS['sauce bbq'], 'BBQ (brune)')}
      ${item(COULEURS.ketchup, 'Ketchup')}
      <span class="sep"></span>
      <span>Lire chaque produit <b>de bas en haut</b> (1 = première couche posée)</span>
      <span class="interdit">✕ Rien hors fiche : pas de tomate, pas de sésame</span>
    </div>`
}

function page({ titre, sousTitre, produits, colonnes, lignes: nbLignes, opts, caseEnPlus }) {
    const MARGE = 22, HAUT_TETE = 64, HAUT_LEGENDE = 34, HAUT_BAS = 22, ESP = 8
    const TITRE = 42, RESUME = 34
    const l = Math.floor((PAGE_L - 2 * MARGE) / colonnes)
    const h = Math.floor((PAGE_H - 2 * MARGE - HAUT_TETE - HAUT_LEGENDE - HAUT_BAS - 3 * ESP) / nbLignes)
    const svgH = h - TITRE - RESUME - 2
    const maxCouches = Math.max(...produits.map((p) => p.couches_bas_vers_haut.length))
    const o = { ...opts, pas: Math.min(opts.pasMax, svgH / (maxCouches + 0.9)) }
    const cartes = produits.map((p) => carte(p, l, svgH, o)).join('') + (caseEnPlus ? caseEnPlus() : '')
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${titre.replace(/<[^>]+>/g, '')}</title><style>
  @page { size: A3 landscape; margin: 0 }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { width:${PAGE_L}px; height:${PAGE_H}px; background:#fff; color:#1A1A1A;
         font-family: Inter, "Segoe UI", Arial, sans-serif; padding:${MARGE}px; overflow:hidden }
  header { height:${HAUT_TETE}px; display:flex; align-items:center; justify-content:space-between;
           background:#161616; color:#fff; border-radius:10px; padding:0 24px; margin-bottom:${ESP}px; border-bottom:5px solid #F07A1A }
  header h1 { font-size:32px; font-weight:900; letter-spacing:.5px; text-transform:uppercase }
  header h1 span { color:#F07A1A }
  header p { font-size:15px; color:#ddd }
  .grille { display:grid; grid-template-columns:repeat(${colonnes}, ${l}px); grid-auto-rows:${h}px;
            border-top:1.5px solid #9E9E9E; border-left:1.5px solid #9E9E9E }
  .carte, .info { border-right:1.5px solid #9E9E9E; border-bottom:1.5px solid #9E9E9E; display:flex; flex-direction:column; overflow:hidden }
  .tete { height:${TITRE}px; display:flex; align-items:center; justify-content:center; gap:8px; padding-top:6px;
          font-size:23px; font-weight:900; text-transform:uppercase; letter-spacing:.3px }
  .numero { width:26px; height:26px; border-radius:50%; background:#F07A1A; color:#fff; font-size:15px;
            display:flex; align-items:center; justify-content:center }
  .resume { height:${RESUME}px; padding:0 10px; display:flex; align-items:center; justify-content:center; text-align:center;
            font-size:11px; font-weight:600; color:#555; border-top:1px dashed #D5D5D5; line-height:1.2 }
  svg .lab { font-size:12px; font-weight:600; fill:#333 } svg .fort { font-weight:900; fill:#111 }
  svg .num { font-size:10px; font-weight:800; fill:#B0B0B0 }
  .legende { margin-top:${ESP}px; height:${HAUT_LEGENDE}px; border-radius:8px; background:#F5F5F5; border:1px solid #DDD;
             display:flex; align-items:center; gap:14px; padding:0 14px; font-size:12px; white-space:nowrap }
  .sw { display:inline-flex; align-items:center; gap:6px } .sw i { width:22px; height:14px; border-radius:4px; border:1px solid rgba(0,0,0,.3); position:relative; overflow:hidden }
  .sw em { position:absolute; inset:0; background-image:radial-gradient(#111 1px, transparent 1.3px); background-size:5px 5px }
  .sep { width:1px; height:18px; background:#CCC }
  .interdit { margin-left:auto; font-weight:800; color:#B3261E }
  footer { margin-top:${ESP}px; height:${HAUT_BAS}px; text-align:center; font-size:13px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#555 }
  footer span { color:#F07A1A }
  .info { background:#161616; color:#fff; padding:16px 18px; gap:6px }
  .info h2 { font-size:28px; font-weight:900; line-height:1 } .info h2 span { color:#F07A1A }
  .info h3 { font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#F07A1A; margin:6px 0 2px }
  .info table { border-collapse:collapse; font-size:13px; width:100% }
  .info td { padding:4px 0; border-bottom:1px solid #333 } .info td:last-child { text-align:right; font-weight:800 }
</style></head><body>
  <header><h1>${titre}</h1><p>${sousTitre}</p></header>
  <div class="grille">${cartes}</div>
  ${legendeSauces()}
  <footer>Tasty Food <span>Saint-Gilles</span> · Liège</footer>
</body></html>`
}

// Case n°12 de la page burgers : repère rapide du nombre de steaks
function caseRepere() {
    const lignesTab = recettes.burgers
        .map((b) => {
            const steaks = b.couches_bas_vers_haut.filter((c) => c.ingredient === 'steak').length
            const tender = b.couches_bas_vers_haut.some((c) => c.ingredient.startsWith('tender'))
            return `<tr><td>${b.numero}. ${b.nom}</td><td>${tender ? 'tender' : steaks + ' steak' + (steaks > 1 ? 's' : '')}</td></tr>`
        })
        .join('')
    return `<div class="info"><h2>Tasty <span>Food</span></h2><h3>Repère rapide : la viande</h3><table>${lignesTab}</table></div>`
}

async function main() {
    fs.mkdirSync(SORTIE, { recursive: true })
    const pages = {
        'fiche-burgers': page({
            titre: 'Fiche technique · <span>Burgers</span>',
            sousTitre: 'Bun brioché lisse sans sésame · cheddar toujours posé sur le steak',
            produits: recettes.burgers,
            colonnes: 6,
            lignes: 2,
            opts: { largeur: 122, centre: 192, xTexte: 120, maxCar: 16, pasMax: 34, taille: 12 },
            caseEnPlus: caseRepere,
        }),
        'fiche-sandwichs': page({
            titre: 'Fiche technique · <span>Sandwichs</span>',
            sousTitre: 'Demi-baguette belge · cheddar toujours posé sur le steak',
            produits: recettes.sandwichs,
            colonnes: 4,
            lignes: 2,
            opts: { largeur: 210, centre: 272, xTexte: 152, maxCar: 16, pasMax: 34, taille: 14, baguette: true },
        }),
    }
    const navigateur = await chromium.launch()
    for (const [nom, html] of Object.entries(pages)) {
        const fichierHtml = path.join(SORTIE, nom + '.html')
        fs.writeFileSync(fichierHtml, html)
        const onglet = await navigateur.newPage({ viewport: { width: PAGE_L, height: PAGE_H }, deviceScaleFactor: ECHELLE_PNG })
        await onglet.goto('file://' + fichierHtml)
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

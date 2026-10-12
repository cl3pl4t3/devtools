// Génère les fiches techniques A3 (burgers + sandwichs) à partir de data/recettes.json.
// Chaque produit est dessiné couche par couche, de bas en haut, avec le nombre exact de pièces.
// Usage : node generer-fiches.js   →  sortie/fiche-burgers.(png|pdf), sortie/fiche-sandwichs.(png|pdf)

const fs = require('fs')
const path = require('path')
const { chromium } = require('playwright')

const ICI = __dirname
const SORTIE = path.join(ICI, 'sortie')
const recettes = JSON.parse(fs.readFileSync(path.join(ICI, 'data', 'recettes.json'), 'utf8'))

// A3 portrait à 96 dpi (CSS) ; ×3.125 = 3508×4961 px, soit 300 dpi à l'impression
const PAGE_L = 1123
const PAGE_H = 1587
const ECHELLE_PNG = 3.125

const COULEURS = {
    'sauce biggy': '#D9B77E',
    'sauce pepper': '#D9C29A',
    'sauce spicy': '#E8562A',
    'sauce bbq': '#4A2414',
    ketchup: '#C8201E',
}

// ---------- petits utilitaires ----------
let graine = 1
const alea = () => {
    graine = (graine * 16807) % 2147483647
    return (graine - 1) / 2147483646
}
const f = (n) => Math.round(n * 10) / 10

// ---------- dessin de chaque type de couche ----------
// Chaque fonction reçoit x (gauche), y (haut), w (largeur), h (hauteur), q (quantité) et renvoie du SVG.
const DESSINS = {
    painBurgerBas: { h: 22, l: 1, svg: (x, y, w, h) =>
        `<path d="M${x},${y} H${x + w} V${y + h - 9} Q${x + w},${y + h} ${x + w - 12},${y + h} H${x + 12} Q${x},${y + h} ${x},${y + h - 9} Z" fill="url(#brioche)" stroke="#8A5520" stroke-width="1"/>
         <rect x="${x + 2}" y="${y}" width="${w - 4}" height="4" fill="#FBEFD6"/>` },
    painBurgerHaut: { h: 46, l: 1, svg: (x, y, w, h) =>
        `<path d="M${x},${y + h} V${y + h - 8} C${x},${y + 6} ${x + w * 0.2},${y} ${x + w / 2},${y} C${x + w * 0.8},${y} ${x + w},${y + 6} ${x + w},${y + h - 8} V${y + h} Z" fill="url(#brioche)" stroke="#8A5520" stroke-width="1"/>
         <rect x="${x + 2}" y="${y + h - 4}" width="${w - 4}" height="4" fill="#FBEFD6"/>
         <ellipse cx="${x + w * 0.36}" cy="${y + h * 0.3}" rx="${w * 0.16}" ry="${h * 0.1}" fill="#fff" opacity=".35"/>` },
    painSandwichBas: { h: 22, l: 1, svg: (x, y, w, h) =>
        `<path d="M${x + 6},${y} H${x + w - 6} Q${x + w + 4},${y + 2} ${x + w - 8},${y + h} H${x + 8} Q${x - 4},${y + 2} ${x + 6},${y} Z" fill="url(#croute)" stroke="#7A4A18" stroke-width="1"/>
         <rect x="${x + 6}" y="${y}" width="${w - 12}" height="4" fill="#FBEFD6"/>` },
    painSandwichHaut: { h: 34, l: 1, svg: (x, y, w, h) => {
        let s = `<path d="M${x + 4},${y + h} C${x - 6},${y + h * 0.3} ${x + w * 0.1},${y} ${x + w * 0.25},${y} H${x + w * 0.75} C${x + w * 0.9},${y} ${x + w + 6},${y + h * 0.3} ${x + w - 4},${y + h} Z" fill="url(#croute)" stroke="#7A4A18" stroke-width="1"/>
                 <rect x="${x + 6}" y="${y + h - 4}" width="${w - 12}" height="4" fill="#FBEFD6"/>`
        for (let i = 1; i <= 5; i++) {
            const cx = x + (w * i) / 6
            s += `<path d="M${cx - 14},${y + h * 0.55} Q${cx},${y + 2} ${cx + 14},${y + h * 0.3}" stroke="#E9C88C" stroke-width="3" fill="none" stroke-linecap="round"/>`
        }
        return s
    } },
    sauce: { h: 6, l: 0.92, svg: (x, y, w, h, q, nom) => {
        const c = COULEURS[nom] || '#ddd'
        let d = `M${x},${y + h}`
        for (let i = 0; i <= 10; i++) d += ` L${f(x + (w * i) / 10)},${f(y + (i % 2 ? 0 : 2))}`
        d += ` L${x + w},${y + h} Z`
        let s = `<path d="${d}" fill="${c}" stroke="rgba(0,0,0,.25)" stroke-width=".6"/>`
        s += `<path d="M${x + w * 0.2},${y + h} q3,6 6,0 M${x + w * 0.7},${y + h} q3,7 6,0" fill="${c}"/>`
        if (nom === 'sauce pepper')
            for (let i = 0; i < 22; i++) s += `<circle cx="${f(x + 4 + alea() * (w - 8))}" cy="${f(y + 2 + alea() * (h - 3))}" r=".9" fill="#1a1a1a"/>`
        return s
    } },
    cornichon: { h: 10, l: 0.86, svg: (x, y, w, h, q) => {
        let s = ''
        const pas = w / q
        for (let i = 0; i < q; i++) {
            const cx = x + pas * (i + 0.5)
            const rx = Math.min(pas / 2 - 3, 18)
            s += `<ellipse cx="${f(cx)}" cy="${y + h / 2}" rx="${f(rx)}" ry="${h / 2}" fill="#5C8A2E" stroke="#2F4F14" stroke-width="1"/>
                  <ellipse cx="${f(cx)}" cy="${y + h / 2}" rx="${f(rx * 0.65)}" ry="${h / 2 - 2}" fill="#B9CF6A"/>`
        }
        return s
    } },
    jalapeno: { h: 11, l: 0.86, svg: (x, y, w, h, q) => {
        let s = ''
        const pas = w / q
        for (let i = 0; i < q; i++) {
            const cx = x + pas * (i + 0.5)
            const r = Math.min(pas / 2 - 2, h / 2 + 3)
            s += `<ellipse cx="${f(cx)}" cy="${y + h / 2}" rx="${f(r)}" ry="${h / 2}" fill="#3E7D1E" stroke="#1E4A0C" stroke-width="1"/>
                  <ellipse cx="${f(cx)}" cy="${y + h / 2}" rx="${f(r * 0.6)}" ry="${h / 2 - 2.5}" fill="#D7E6A2"/>
                  <circle cx="${f(cx - 2)}" cy="${y + h / 2}" r="1" fill="#fff"/><circle cx="${f(cx + 2)}" cy="${y + h / 2}" r="1" fill="#fff"/>`
        }
        return s
    } },
    steak: { h: 18, l: 0.94, svg: (x, y, w, h) => {
        let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2.4}" fill="url(#viande)" stroke="#2A140A" stroke-width="1"/>`
        for (let i = 0; i < 9; i++) {
            const lx = x + 8 + alea() * (w - 30)
            const ly = y + 4 + alea() * (h - 8)
            s += `<line x1="${f(lx)}" y1="${f(ly)}" x2="${f(lx + 8 + alea() * 10)}" y2="${f(ly)}" stroke="#2A140A" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>`
        }
        return s
    } },
    cheddar: { h: 6, l: 1.0, svg: (x, y, w, h) => {
        const g = x + 3, d = x + w - 3
        return `<path d="M${x},${y} H${x + w} V${y + h} L${d},${y + h + 8} L${d - 6},${y + h} H${g + 6} L${g},${y + h + 9} L${x},${y + h} Z" fill="#F5A81C" stroke="#C47A06" stroke-width=".8"/>`
    } },
    salade: { h: 11, l: 1.06, svg: (x, y, w, h) => {
        let d = `M${x},${y + h * 0.6}`
        const n = Math.round(w / 9)
        for (let i = 0; i < n; i++) {
            const x1 = x + (w * (i + 0.5)) / n, x2 = x + (w * (i + 1)) / n
            d += ` Q${f(x1)},${i % 2 ? y - 2 : y + h + 2} ${f(x2)},${f(y + h * 0.5)}`
        }
        d += ` L${x + w},${y + h} L${x},${y + h} Z`
        return `<path d="${d}" fill="#7DBE3A" stroke="#3E7A17" stroke-width="1"/>
                <path d="M${x + 6},${y + h * 0.6} H${x + w - 6}" stroke="#C8E89A" stroke-width="1.2" opacity=".8"/>`
    } },
    oignonsRouges: { h: 9, l: 0.88, svg: (x, y, w, h) => {
        let s = ''
        const n = Math.max(4, Math.round(w / 26))
        for (let i = 0; i < n; i++) {
            const cx = x + (w * (i + 0.5)) / n
            s += `<ellipse cx="${f(cx)}" cy="${y + h / 2}" rx="${f(w / n / 2 - 1)}" ry="${h / 2 - 0.5}" fill="#F3DDEB" stroke="#8E2D6E" stroke-width="2.4"/>`
        }
        return s
    } },
    oignonsCaramelises: { h: 8, l: 0.9, svg: (x, y, w, h) => {
        let s = `<rect x="${x}" y="${y + 1}" width="${w}" height="${h - 2}" rx="3" fill="#B8692A"/>`
        for (let i = 0; i < 12; i++) {
            const sx = x + alea() * (w - 18)
            s += `<path d="M${f(sx)},${y + h * 0.6} q5,-5 9,0 t9,0" stroke="#7A3A10" stroke-width="1.5" fill="none"/>`
        }
        return s
    } },
    oignonsFrits: { h: 8, l: 0.9, svg: (x, y, w, h) => {
        let s = ''
        for (let i = 0; i < 26; i++)
            s += `<ellipse cx="${f(x + 3 + alea() * (w - 6))}" cy="${f(y + 2 + alea() * (h - 4))}" rx="${f(2.5 + alea() * 2)}" ry="2" fill="${alea() > 0.5 ? '#C98A2B' : '#E2B04D'}" stroke="#8A5A12" stroke-width=".5"/>`
        return s
    } },
    bacon: { h: 8, l: 0.5, svg: (x, y, w, h) => {
        let d = `M${x},${y + 2}`
        for (let i = 1; i <= 6; i++) d += ` Q${f(x + (w * (i - 0.5)) / 6)},${i % 2 ? y - 2 : y + 5} ${f(x + (w * i) / 6)},${y + 2}`
        d += ` V${y + h} H${x} Z`
        return `<path d="${d}" fill="#B33A2E" stroke="#6E1A12" stroke-width="1"/>
                <path d="M${x + 3},${y + h * 0.55} H${x + w - 3}" stroke="#F3D3C2" stroke-width="1.6"/>`
    } },
    tender: { h: 16, l: 0.86, svg: (x, y, w, h, q) => {
        let s = ''
        const gap = 6
        const tw = (w - gap * (q - 1)) / q
        for (let i = 0; i < q; i++) {
            const tx = x + i * (tw + gap)
            s += `<rect x="${f(tx)}" y="${y}" width="${f(tw)}" height="${h}" rx="${h / 2}" fill="url(#pane)" stroke="#8A5410" stroke-width="1"/>`
            for (let k = 0; k < 14; k++) s += `<circle cx="${f(tx + 5 + alea() * (tw - 10))}" cy="${f(y + 3 + alea() * (h - 6))}" r="1.1" fill="#A8661A" opacity=".8"/>`
        }
        return s
    } },
    tenderSmashe: { h: 12, l: 1.0, svg: (x, y, w, h) => {
        let d = `M${x + 4},${y + h / 2}`
        for (let i = 1; i <= 8; i++) d += ` Q${f(x + (w * (i - 0.5)) / 8)},${i % 2 ? y - 1 : y + 2} ${f(x + (w * i) / 8 - (i === 8 ? 4 : 0))},${y + 1}`
        d += ` Q${x + w + 2},${y + h / 2} ${x + w - 4},${y + h} H${x + 4} Q${x - 2},${y + h / 2} ${x + 4},${y + 1}`
        let s = `<path d="${d}" fill="url(#pane)" stroke="#8A5410" stroke-width="1"/>`
        for (let k = 0; k < 22; k++) s += `<circle cx="${f(x + 5 + alea() * (w - 10))}" cy="${f(y + 3 + alea() * (h - 5))}" r="1.1" fill="#A8661A" opacity=".8"/>`
        return s
    } },
    galette: { h: 9, l: 1.04, svg: (x, y, w, h) => {
        let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#F1DEB0" stroke="#B58F4E" stroke-width="1"/>`
        for (let k = 0; k < 8; k++) s += `<ellipse cx="${f(x + 6 + alea() * (w - 12))}" cy="${f(y + 2 + alea() * (h - 4))}" rx="2.6" ry="1.3" fill="#C08A3E" opacity=".7"/>`
        return s
    } },
}

// Associe chaque ingrédient de la fiche à un dessin et à une étiquette courte
function decrire(ingredient, q, compteur, total) {
    const num = (k) => (total[k] > 1 ? ` ${compteur[k]}` : '')
    if (ingredient === 'pain burger (bas)') return { t: 'painBurgerBas', e: 'Pain du bas' }
    if (ingredient === 'pain burger (haut)') return { t: 'painBurgerHaut', e: 'Pain du haut' }
    if (ingredient === 'pain sandwich (bas)') return { t: 'painSandwichBas', e: 'Pain du bas' }
    if (ingredient === 'pain sandwich (haut)') return { t: 'painSandwichHaut', e: 'Pain du haut' }
    if (ingredient.startsWith('galette')) return { t: 'galette', e: 'Galette fajitas (roulée)' }
    if (ingredient.startsWith('sauce biggy (sous')) return { t: 'sauce', nom: 'sauce biggy', e: 'Biggy (sous pain haut)', gras: 1 }
    if (ingredient.startsWith('sauce') || ingredient === 'ketchup') {
        const nom = ingredient
        const noms = { ketchup: 'Ketchup', 'sauce biggy': 'Sauce Biggy', 'sauce pepper': 'Sauce Pepper', 'sauce spicy': 'Sauce Spicy', 'sauce bbq': 'Sauce BBQ' }
        const e = noms[nom]
        return { t: 'sauce', nom, e, gras: 1 }
    }
    if (ingredient === 'cornichon') return { t: 'cornichon', e: `${q} cornichon${q > 1 ? 's' : ''}`, gras: 1 }
    if (ingredient === 'jalapeño') return { t: 'jalapeno', e: `${q} jalapeños`, gras: 1 }
    if (ingredient === 'steak') return { t: 'steak', e: 'Steak' + num('steak'), gras: 1 }
    if (ingredient === 'cheddar') return { t: 'cheddar', e: 'Cheddar' + num('cheddar') }
    if (ingredient === 'feuille de salade') return { t: 'salade', e: '1 feuille de salade' }
    if (ingredient === 'oignons rouges') return { t: 'oignonsRouges', e: 'Oignons rouges' }
    if (ingredient === 'oignons caramélisés') return { t: 'oignonsCaramelises', e: 'Oignons caramélisés' }
    if (ingredient === 'oignons frits') return { t: 'oignonsFrits', e: 'Oignons frits' }
    if (ingredient.includes('bacon')) return { t: 'bacon', e: '½ bacon américain' }
    if (ingredient.startsWith('tender smashé')) return { t: 'tenderSmashe', e: 'Tender smashé', gras: 1 }
    if (ingredient === 'tender') return { t: 'tender', e: q > 1 ? `${q} tenders` : '1 tender', gras: 1 }
    throw new Error('Ingrédient sans dessin : ' + ingredient)
}

function couchesDe(produit) {
    const total = {}
    for (const c of produit.couches_bas_vers_haut) total[c.ingredient] = (total[c.ingredient] || 0) + 1
    const compteur = {}
    const couches = produit.couches_bas_vers_haut.map((c) => {
        compteur[c.ingredient] = (compteur[c.ingredient] || 0) + 1
        return { ...decrire(c.ingredient, c.quantite, compteur, total), q: c.quantite }
    })
    return couches
}

// Hauteur "naturelle" d'un produit (avant mise à l'échelle). Le wrap a une galette repliée en plus au-dessus.
const ESPACE = 1.5
function hauteurNaturelle(couches) {
    let h = couches.reduce((s, c) => s + DESSINS[c.t].h + ESPACE, 0)
    if (couches[0].t === 'galette') h += DESSINS.galette.h + 4
    return h
}

// Dessine un produit dans une zone l × h. Renvoie le SVG.
function dessinerProduit(produit, l, h, opts) {
    graine = produit.numero * 97 + (opts.sandwich ? 13 : 0)
    const couches = couchesDe(produit)
    const W = opts.largeurPain
    const cx = opts.centre
    const k = opts.echelle
    let y = h - 8 // on monte depuis le bas
    let svg = ''
    const reperes = []
    const estWrap = couches[0].t === 'galette'
    const yBas = y

    couches.forEach((c, i) => {
        const D = DESSINS[c.t]
        const ch = D.h * k
        const w = W * D.l
        const x = cx - w / 2
        y -= ch
        // dessin avec hauteur mise à l'échelle : on dessine en unités naturelles puis on étire verticalement
        svg += `<g transform="translate(0 ${f(y)}) scale(1 ${k}) translate(0 ${-y})">${D.svg(x, y, w, D.h, c.q, c.nom)}</g>`
        reperes.push({ y: y + ch / 2, xd: cx + w / 2, e: c.e, gras: c.gras, n: i + 1 })
        y -= ESPACE * k
    })

    if (estWrap) {
        // galette repliée au-dessus + bords arrondis : coupe d'un wrap
        const D = DESSINS.galette
        const w = W * D.l
        const x = cx - w / 2
        y -= 2 * k
        const yHaut = y - D.h * k
        svg = `<path d="M${f(x + 6)},${f(yBas)} Q${f(x - 10)},${f(yBas)} ${f(x - 10)},${f((yBas + yHaut) / 2)} Q${f(x - 10)},${f(yHaut)} ${f(x + 6)},${f(yHaut)}
                     M${f(x + w - 6)},${f(yBas)} Q${f(x + w + 10)},${f(yBas)} ${f(x + w + 10)},${f((yBas + yHaut) / 2)} Q${f(x + w + 10)},${f(yHaut)} ${f(x + w - 6)},${f(yHaut)}"
                     fill="none" stroke="#F1DEB0" stroke-width="${f(D.h * k)}" stroke-linecap="round"/>` + svg
        svg += `<g transform="translate(0 ${f(yHaut)}) scale(1 ${k}) translate(0 ${-yHaut})">${D.svg(x, yHaut, w, D.h)}</g>`
        svg += `<text x="${f(cx)}" y="${f(yHaut - 8)}" text-anchor="middle" class="note">vue en coupe</text>`
    }

    // Étiquettes : de bas en haut, espacées d'au moins PAS px, reliées à leur couche
    const PAS = opts.pasEtiquette
    const lab = reperes.map((r) => ({ ...r, ly: r.y }))
    for (let i = 1; i < lab.length; i++) lab[i].ly = Math.min(lab[i].ly, lab[i - 1].ly - PAS)
    const haut = 10
    if (lab[lab.length - 1].ly < haut) {
        lab[lab.length - 1].ly = haut
        for (let i = lab.length - 2; i >= 0; i--) lab[i].ly = Math.max(lab[i].ly, lab[i + 1].ly + PAS)
    }
    const LX = opts.xEtiquettes
    for (const r of lab) {
        svg += `<path d="M${f(r.xd + 2)},${f(r.y)} L${f(LX - 26)},${f(r.ly)} H${LX - 18}" class="trait"/>
                <circle cx="${f(r.xd + 2)}" cy="${f(r.y)}" r="1.8" fill="#222"/>
                <circle cx="${LX - 9}" cy="${f(r.ly)}" r="7.5" class="pastille"/>
                <text x="${LX - 9}" y="${f(r.ly + 3.2)}" text-anchor="middle" class="num">${r.n}</text>
                <text x="${LX + 2}" y="${f(r.ly + 4)}" class="${r.gras ? 'lab gras' : 'lab'}">${r.e}</text>`
    }
    return svg
}

const DEFS = `<defs>
  <linearGradient id="brioche" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7A54C"/><stop offset="1" stop-color="#B66E25"/></linearGradient>
  <linearGradient id="croute" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E2A957"/><stop offset="1" stop-color="#A9672A"/></linearGradient>
  <linearGradient id="viande" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A4528"/><stop offset="1" stop-color="#3E2112"/></linearGradient>
  <linearGradient id="pane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EDB65A"/><stop offset="1" stop-color="#C47F25"/></linearGradient>
</defs>`

function carte(produit, dims, opts) {
    const svgH = dims.h - 44 - 38
    return `<div class="carte">
      <div class="tete"><span class="numero">${produit.numero}</span><span class="nom">${produit.nom}</span></div>
      <svg width="${dims.l}" height="${svgH}" viewBox="0 0 ${dims.l} ${svgH}">${DEFS}${dessinerProduit(produit, dims.l, svgH, opts)}</svg>
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
      <span class="interdit">✕ Rien hors fiche : pas de tomate, pas de sésame</span>
    </div>`
}

function page({ titre, sousTitre, produits, colonnes, lignes, opts, caseEnPlus }) {
    const MARGE = 28, GAP = 12, HAUT_TETE = 104, HAUT_BAS = 92
    const l = Math.floor((PAGE_L - 2 * MARGE - GAP * (colonnes - 1)) / colonnes)
    const h = Math.floor((PAGE_H - HAUT_TETE - HAUT_BAS - 2 * MARGE - GAP * (lignes - 1)) / lignes)
    const svgH = h - 44 - 38
    // Même échelle pour tous les produits de la page : un Suprême paraît vraiment plus haut qu'un Simple
    const plusHaut = Math.max(...produits.map((p) => hauteurNaturelle(couchesDe(p))))
    const o = { ...opts, echelle: Math.min(opts.echelleMax, (svgH - 30) / plusHaut) }
    const cartes = produits.map((p) => carte(p, { l, h }, o)).join('') + (caseEnPlus ? caseEnPlus({ l, h }) : '')
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${titre}</title><style>
  @page { size: A3; margin: 0 }
  * { box-sizing: border-box; margin: 0; padding: 0 }
  body { width:${PAGE_L}px; height:${PAGE_H}px; background:#FFFDF8; color:#1A1A1A;
         font-family: Inter, "Segoe UI", Arial, sans-serif; padding:${MARGE}px; overflow:hidden }
  header { height:${HAUT_TETE}px; display:flex; align-items:center; justify-content:space-between;
           background:#161616; color:#fff; border-radius:14px; padding:0 28px; margin-bottom:${GAP}px;
           border-bottom:6px solid #F07A1A }
  header h1 { font-size:38px; font-weight:900; letter-spacing:.5px; text-transform:uppercase }
  header h1 span { color:#F07A1A }
  header p { font-size:16px; color:#ddd; margin-top:4px }
  header .fleche { font-size:15px; font-weight:700; text-align:right; line-height:1.35 }
  header .fleche b { color:#F07A1A; font-size:28px; display:block }
  .grille { display:grid; grid-template-columns:repeat(${colonnes}, ${l}px); grid-auto-rows:${h}px; gap:${GAP}px }
  .carte { background:#fff; border:1.5px solid #E2DACB; border-radius:12px; overflow:hidden; display:flex; flex-direction:column }
  .tete { height:44px; display:flex; align-items:center; gap:10px; padding:0 12px; background:#F7F1E6; border-bottom:1.5px solid #E2DACB }
  .numero { width:30px; height:30px; border-radius:50%; background:#F07A1A; color:#fff; font-weight:900; font-size:17px;
            display:flex; align-items:center; justify-content:center }
  .nom { font-size:24px; font-weight:900; text-transform:uppercase; letter-spacing:.3px }
  .resume { height:38px; padding:0 12px; display:flex; align-items:center; font-size:12px; font-weight:600; color:#444;
            border-top:1px dashed #E2DACB; line-height:1.2 }
  svg .lab { font-size:12.5px; fill:#222 } svg .gras { font-weight:800 }
  svg .num { font-size:9.5px; font-weight:800; fill:#fff } svg .pastille { fill:#1A1A1A }
  svg .trait { stroke:#9A9A9A; stroke-width:.9; fill:none } svg .note { font-size:10px; fill:#888; font-style:italic }
  .legende { margin-top:${GAP}px; height:40px; border-radius:10px; background:#F7F1E6; border:1.5px solid #E2DACB;
             display:flex; align-items:center; gap:14px; padding:0 16px; font-size:12px; white-space:nowrap }
  .sw { display:inline-flex; align-items:center; gap:6px } .sw i { width:22px; height:14px; border-radius:4px; border:1px solid rgba(0,0,0,.3); position:relative; overflow:hidden }
  .sw em { position:absolute; inset:0; background-image:radial-gradient(#111 1px, transparent 1.3px); background-size:5px 5px }
  .interdit { margin-left:auto; font-weight:800; color:#B3261E }
  footer { margin-top:8px; text-align:center; font-size:14px; font-weight:800; letter-spacing:2px; text-transform:uppercase; color:#555 }
  footer span { color:#F07A1A }
  .info { background:#161616; color:#fff; border-radius:12px; padding:16px 18px; display:flex; flex-direction:column; gap:8px }
  .info h2 { font-size:30px; font-weight:900; line-height:1 } .info h2 span { color:#F07A1A }
  .info h3 { font-size:14px; text-transform:uppercase; letter-spacing:1px; color:#F07A1A; margin-top:4px }
  .info table { border-collapse:collapse; font-size:13px; width:100% }
  .info td { padding:2.5px 0; border-bottom:1px solid #333 } .info td:last-child { text-align:right; font-weight:800 }
</style></head><body>
  <header><div><h1>${titre}</h1><p>${sousTitre}</p></div>
    <div class="fleche"><b>↑</b>Montage<br>de bas en haut</div></header>
  <div class="grille">${cartes}</div>
  ${legendeSauces()}
  <footer>Tasty Food <span>Saint-Gilles</span> · Liège</footer>
</body></html>`
}

// Case n°12 de la page burgers : repère rapide du nombre de steaks
function caseRepere() {
    const lignes = recettes.burgers
        .map((b) => {
            const steaks = b.couches_bas_vers_haut.filter((c) => c.ingredient === 'steak').length
            const tender = b.couches_bas_vers_haut.some((c) => c.ingredient.startsWith('tender'))
            return `<tr><td>${b.numero}. ${b.nom}</td><td>${tender ? 'tender' : steaks + ' steak' + (steaks > 1 ? 's' : '')}</td></tr>`
        })
        .join('')
    return `<div class="info"><h2>Tasty <span>Food</span></h2><h3>Repère rapide : la viande</h3><table>${lignes}</table></div>`
}

async function main() {
    fs.mkdirSync(SORTIE, { recursive: true })
    const pages = {
        'fiche-burgers': page({
            titre: 'Fiche technique · <span>Burgers</span>',
            sousTitre: '11 recettes · bun brioché lisse sans sésame · cheddar toujours sur le steak',
            produits: recettes.burgers,
            colonnes: 3,
            lignes: 4,
            opts: { largeurPain: 142, centre: 90, xEtiquettes: 196, pasEtiquette: 16.5, echelleMax: 1.5 },
            caseEnPlus: caseRepere,
        }),
        'fiche-sandwichs': page({
            titre: 'Fiche technique · <span>Sandwichs</span>',
            sousTitre: '8 recettes · demi-baguette belge · cheddar toujours sur le steak',
            produits: recettes.sandwichs,
            colonnes: 2,
            lignes: 4,
            opts: { largeurPain: 300, centre: 180, sandwich: true, xEtiquettes: 372, pasEtiquette: 18, echelleMax: 1.6 },
        }),
    }
    const navigateur = await chromium.launch()
    for (const [nom, html] of Object.entries(pages)) {
        const fichierHtml = path.join(SORTIE, nom + '.html')
        fs.writeFileSync(fichierHtml, html)
        const onglet = await navigateur.newPage({ viewport: { width: PAGE_L, height: PAGE_H }, deviceScaleFactor: ECHELLE_PNG })
        await onglet.goto('file://' + fichierHtml)
        await onglet.screenshot({ path: path.join(SORTIE, nom + '.png') })
        await onglet.pdf({ path: path.join(SORTIE, nom + '.pdf'), format: 'A3', printBackground: true })
        console.log('✔', nom + '.png', '+', nom + '.pdf')
    }
    await navigateur.close()
}

main().catch((e) => {
    console.error(e)
    process.exit(1)
})

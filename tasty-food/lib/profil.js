// Dessins de profil : le produit monté, vu de côté. Chaque type a une hauteur h, une largeur relative l et une fonction svg(x, y, w, h, q, nom).
const { COULEURS, alea, f } = require('./commun')

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

module.exports = DESSINS

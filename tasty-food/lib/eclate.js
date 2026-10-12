// Dessins en vue éclatée (légère plongée) : une couche = un élément séparé.
const { COULEURS, alea, f } = require('./commun')

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

module.exports = DESSINS

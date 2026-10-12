// Outils partagés : couleurs des sauces, hasard reproductible, lecture des recettes en couches.

const COULEURS = {
    'sauce biggy': '#D9B77E',
    'sauce pepper': '#D6C09A',
    'sauce spicy': '#E8562A',
    'sauce bbq': '#4A2414',
    ketchup: '#C8201E',
}

// Hasard reproductible : le même produit est toujours dessiné de la même façon
let graine = 1
const semer = (n) => {
    graine = n
}
const alea = () => {
    graine = (graine * 16807) % 2147483647
    return (graine - 1) / 2147483646
}
const f = (n) => Math.round(n * 10) / 10

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

module.exports = { COULEURS, semer, alea, f, couchesDe }

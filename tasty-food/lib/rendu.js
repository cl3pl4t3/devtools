// Rendu « réaliste » : dégradés, relief (lumière + brillance) et grain de matière, appliqués par filtre SVG.
// Chaque type de couche reçoit le filtre qui correspond à sa matière (pain, viande, fromage, sauce…).

// Filtre de relief : ombrage doux + reflet brillant + grain optionnel (taches de couleur prises dans un bruit)
function filtre(id, { flou = 2, relief = 3, brillance = 0.5, exposant = 20, grain = null }) {
    const grainSvg = grain
        ? `<feTurbulence type="fractalNoise" baseFrequency="${grain.freq}" numOctaves="${grain.octaves || 2}" seed="${grain.seed || 4}" result="bruit"/>
           <feColorMatrix in="bruit" type="matrix" values="0 0 0 0 ${grain.r}  0 0 0 0 ${grain.g}  0 0 0 0 ${grain.b}  ${grain.force} 0 0 0 ${grain.seuil}" result="taches"/>
           <feComposite in="taches" in2="SourceAlpha" operator="in" result="grain"/>`
        : ''
    return `<filter id="${id}" x="-15%" y="-40%" width="130%" height="180%" color-interpolation-filters="sRGB">
      <feGaussianBlur in="SourceAlpha" stdDeviation="${flou}" result="forme"/>
      <feDiffuseLighting in="forme" surfaceScale="${relief}" diffuseConstant="1.05" lighting-color="#FFF" result="lumiere"><feDistantLight azimuth="230" elevation="58"/></feDiffuseLighting>
      <feComposite in="SourceGraphic" in2="lumiere" operator="arithmetic" k1="1.12" result="ombre"/>
      ${grainSvg}
      <feSpecularLighting in="forme" surfaceScale="${relief}" specularConstant="1" specularExponent="${exposant}" lighting-color="#FFF4DD" result="reflet"><feDistantLight azimuth="230" elevation="48"/></feSpecularLighting>
      <feComposite in="reflet" in2="SourceAlpha" operator="in" result="reflet2"/>
      <feComposite in="ombre" in2="reflet2" operator="arithmetic" k2="1" k3="${brillance}" result="eclaire"/>
      <feMerge><feMergeNode in="eclaire"/>${grain ? '<feMergeNode in="grain"/>' : ''}</feMerge>
      <feComposite in2="SourceAlpha" operator="in"/>
    </filter>`
}

const DEFS = `<defs>
  <radialGradient id="brioche" cx=".38" cy=".28" r=".85"><stop offset="0" stop-color="#F8CF80"/><stop offset=".35" stop-color="#E9A24A"/><stop offset=".8" stop-color="#C0712A"/><stop offset="1" stop-color="#8E4E18"/></radialGradient>
  <radialGradient id="croute" cx=".4" cy=".25" r=".9"><stop offset="0" stop-color="#F4CB86"/><stop offset=".45" stop-color="#DDA04E"/><stop offset="1" stop-color="#9A5A20"/></radialGradient>
  <linearGradient id="mie" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFF3D8"/><stop offset="1" stop-color="#EBCB92"/></linearGradient>
  <linearGradient id="viande" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7C4527"/><stop offset=".5" stop-color="#5A2E17"/><stop offset="1" stop-color="#2E160A"/></linearGradient>
  <radialGradient id="viandeDessus" cx=".45" cy=".4" r=".7"><stop offset="0" stop-color="#8A4D2C"/><stop offset=".7" stop-color="#5E2F17"/><stop offset="1" stop-color="#3A1C0C"/></radialGradient>
  <linearGradient id="fromage" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FFD15A"/><stop offset=".55" stop-color="#F7A91C"/><stop offset="1" stop-color="#E48A08"/></linearGradient>
  <radialGradient id="feuille" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#B7E07A"/><stop offset=".6" stop-color="#7DBE3A"/><stop offset="1" stop-color="#4A8E1E"/></radialGradient>
  <radialGradient id="cornichon" cx=".5" cy=".5" r=".55"><stop offset="0" stop-color="#E2EBA0"/><stop offset=".55" stop-color="#B8CF68"/><stop offset=".8" stop-color="#7EA03A"/><stop offset="1" stop-color="#3F6B1C"/></radialGradient>
  <linearGradient id="pane" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2C066"/><stop offset=".6" stop-color="#D9952F"/><stop offset="1" stop-color="#A9661B"/></linearGradient>
  <filter id="ombre" x="-20%" y="-20%" width="140%" height="170%"><feDropShadow dx="0" dy="2" stdDeviation="1.6" flood-color="#3A2410" flood-opacity=".35"/></filter>
  <radialGradient id="halo" cx=".5" cy=".62" r=".6"><stop offset="0" stop-color="#FF8A1E" stop-opacity=".42"/><stop offset=".55" stop-color="#FF6A00" stop-opacity=".12"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  ${filtre('f-pain', { flou: 2.4, relief: 3.5, brillance: 0.35, exposant: 14, grain: { freq: 1.4, r: 1, g: 0.93, b: 0.8, force: 1.8, seuil: -1.2 } })}
  ${filtre('f-viande', { flou: 1.6, relief: 2.5, brillance: 0.3, exposant: 12, grain: { freq: 0.55, octaves: 3, r: 0.16, g: 0.07, b: 0.03, force: 2.6, seuil: -1.48 } })}
  ${filtre('f-fromage', { flou: 1.4, relief: 2.2, brillance: 0.75, exposant: 26 })}
  ${filtre('f-sauce', { flou: 1.6, relief: 3, brillance: 0.9, exposant: 30 })}
  ${filtre('f-legume', { flou: 1.2, relief: 2, brillance: 0.45, exposant: 22 })}
  ${filtre('f-pane', { flou: 1.6, relief: 2.6, brillance: 0.3, exposant: 12, grain: { freq: 1.1, r: 0.62, g: 0.36, b: 0.08, force: 2.8, seuil: -1.5 } })}
  ${filtre('f-doux', { flou: 1.2, relief: 1.6, brillance: 0.3, exposant: 16 })}
</defs>`

// Filtre à utiliser pour chaque type de couche (vue éclatée et vue de profil)
const FILTRE = {
    painBas: 'f-pain',
    painHaut: 'f-pain',
    painBurgerBas: 'f-pain',
    painBurgerHaut: 'f-pain',
    painSandwichBas: 'f-pain',
    painSandwichHaut: 'f-pain',
    galette: 'f-doux',
    steak: 'f-viande',
    cheddar: 'f-fromage',
    sauce: 'f-sauce',
    pieces: 'f-legume',
    cornichon: 'f-legume',
    jalapeno: 'f-legume',
    salade: 'f-legume',
    oignonsRouges: 'f-legume',
    oignonsCaramelises: 'f-sauce',
    oignonsFrits: 'f-pane',
    bacon: 'f-fromage',
    tender: 'f-pane',
    tenderSmashe: 'f-pane',
}

const avecFiltre = (type, svg) => `<g filter="url(#${FILTRE[type] || 'f-doux'})">${svg}</g>`

module.exports = { DEFS, avecFiltre }

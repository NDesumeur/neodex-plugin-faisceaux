// Faisceaux : un petit robot esquive les rayons d'une salle d'essai ; les émetteurs prévenent avant de tirer.
// Jeu NeoDex en pixel art dessiné à la main (police bitmap, cadres et boutons en pixels). Il tourne dans le bac à sable de NeoDex.
const HTML = `<div class="appWrap wide">
  <div class="agHead"><span class="label">Faisceaux</span><span class="hint">Flèches ou ZQSD pour bouger · Maj ou X : élan · P : pause</span></div>
  <div class="gMain"><div class="gameBox"><canvas id="fxCanvas" width="128" height="142" role="img" aria-label="Faisceaux"></canvas></div>
    <div class="gSide">
      <div class="sysCard"><b>RECORDS</b><div class="gStats" id="fxStats"></div></div>
      <div class="row"><button class="btn main" id="fxNew">NOUVELLE PARTIE</button><button class="btn" id="fxFs">PLEIN ÉCRAN</button></div>
      <div class="hint">Un trait pointillé qui clignote annonce un rayon : il tire quand le clignotement s'accélère puis s'arrête. Les croix visent l'endroit où tu es, les balayages tournent depuis un mur (les deux traits montrent l'angle couvert), les grilles laissent toujours un passage. L'élan te fait filer d'un coup, puis se recharge (la jauge jaune en haut). Ramasse les piles : 50 points chacune, plus 10 points par seconde. À 45 s, puis toutes les minutes, un boss prend la salle pendant 20 s : le Projecteur vise, le Prisme fait tourner trois rayons depuis le centre (ne le touche pas), l'Horloge enchaîne les grilles. Tiens jusqu'au bout : 250 points par boss, de plus en plus.</div><div class="hint">Des bonus apparaissent de temps en temps : la bulle bleue est un bouclier qui encaisse un rayon, le sablier violet ralentit les rayons pendant 5 secondes (pas toi).</div>
    </div></div>
</div>`;
const CSS = `.gMain{display:flex;gap:22px;align-items:flex-start;flex-wrap:wrap}
.gameBox{display:grid;place-items:center;padding:10px;background:#05010b;flex:0 0 auto;position:relative}
.gameBox canvas{height:min(72vh,710px);width:auto;aspect-ratio:128/142;image-rendering:pixelated;cursor:var(--cp,pointer);touch-action:none}
.gameBox:fullscreen{padding:0}
.gameBox:fullscreen canvas{height:min(100vh,calc(100vw * 142 / 128))}
.gSide{display:flex;flex-direction:column;gap:14px;flex:1;min-width:250px;max-width:420px}
.gSide .sysCard{display:flex;flex-direction:column}
.gStats{display:grid;grid-template-columns:1fr auto;gap:4px 14px}
.gStats b{text-align:right}`;
/* ---------- l'habillage pixel art, dessiné à la main : police bitmap (accents compris), cadres, boutons, icônes ----------
   Tout est en pixels pleins, agrandis par 2 sans lissage : aucun dégradé, aucune ombre floue. */
const PXK = (() => {
  // chaque lettre : ses lignes, de haut en bas, à partir de la ligne 2 de la case (0-1 : accents des majuscules, 9-10 : jambages)
  const S = {
    A: '.###. #...# #...# ##### #...# #...# #...#', B: '####. #...# #...# ####. #...# #...# ####.', C: '.###. #...# #.... #.... #.... #...# .###.',
    D: '####. #...# #...# #...# #...# #...# ####.', E: '##### #.... #.... ####. #.... #.... #####', F: '##### #.... #.... ####. #.... #.... #....',
    G: '.###. #...# #.... #.### #...# #...# .####', H: '#...# #...# #...# ##### #...# #...# #...#', I: '### .#. .#. .#. .#. .#. ###',
    J: '..### ...#. ...#. ...#. #..#. #..#. .##..', K: '#...# #..#. #.#.. ##... #.#.. #..#. #...#', L: '#.... #.... #.... #.... #.... #.... #####',
    M: '#...# ##.## #.#.# #.#.# #...# #...# #...#', N: '#...# ##..# #.#.# #..## #...# #...# #...#', O: '.###. #...# #...# #...# #...# #...# .###.',
    P: '####. #...# #...# ####. #.... #.... #....', Q: '.###. #...# #...# #...# #.#.# #..#. .##.#', R: '####. #...# #...# ####. #.#.. #..#. #...#',
    S: '.#### #.... #.... .###. ....# ....# ####.', T: '##### ..#.. ..#.. ..#.. ..#.. ..#.. ..#..', U: '#...# #...# #...# #...# #...# #...# .###.',
    V: '#...# #...# #...# #...# #...# .#.#. ..#..', W: '#...# #...# #...# #.#.# #.#.# ##.## #...#', X: '#...# #...# .#.#. ..#.. .#.#. #...# #...#',
    Y: '#...# #...# .#.#. ..#.. ..#.. ..#.. ..#..', Z: '##### ....# ...#. ..#.. .#... #.... #####',
    a: '..... ..... .###. ....# .#### #...# .####', b: '#.... #.... ####. #...# #...# #...# ####.', c: '..... ..... .###. #.... #.... #.... .###.',
    d: '....# ....# .#### #...# #...# #...# .####', e: '..... ..... .###. #...# ##### #.... .###.', f: '..## .#.. #### .#.. .#.. .#.. .#..',
    g: '..... ..... .#### #...# #...# #...# .#### ....# .###.', h: '#.... #.... ####. #...# #...# #...# #...#', i: '.#. ... ##. .#. .#. .#. ###',
    'ı': '... ... ##. .#. .#. .#. ###', j: '...# .... ..## ...# ...# ...# ...# #..# .##.', k: '#... #... #..# #.#. ##.. #.#. #..#',
    l: '##. .#. .#. .#. .#. .#. ###', m: '..... ..... ##.#. #.#.# #.#.# #.#.# #...#', n: '..... ..... ####. #...# #...# #...# #...#',
    o: '..... ..... .###. #...# #...# #...# .###.', p: '..... ..... ####. #...# #...# #...# ####. #.... #....', q: '..... ..... .#### #...# #...# #...# .#### ....# ....#',
    r: '.... .... #.## ##.. #... #... #...', s: '..... ..... .#### #.... .###. ....# ####.', t: '.#.. .#.. #### .#.. .#.. .#.. ..##',
    u: '..... ..... #...# #...# #...# #..## .##.#', v: '..... ..... #...# #...# #...# .#.#. ..#..', w: '..... ..... #...# #...# #.#.# #.#.# .#.#.',
    x: '..... ..... #...# .#.#. ..#.. .#.#. #...#', y: '..... ..... #...# #...# #...# #...# .#### ....# .###.', z: '..... ..... ##### ...#. ..#.. .#... #####',
    0: '.###. #...# #..## #.#.# ##..# #...# .###.', 1: '..#.. .##.. ..#.. ..#.. ..#.. ..#.. .###.', 2: '.###. #...# ....# ...#. ..#.. .#... #####',
    3: '####. ....# ....# .###. ....# ....# ####.', 4: '...#. ..##. .#.#. #..#. ##### ...#. ...#.', 5: '##### #.... ####. ....# ....# #...# .###.',
    6: '.###. #.... #.... ####. #...# #...# .###.', 7: '##### ....# ...#. ..#.. .#... .#... .#...', 8: '.###. #...# #...# .###. #...# #...# .###.',
    9: '.###. #...# #...# .#### ....# ....# .###.',
    '.': '. . . . . . #', ',': '.. .. .. .. .. .# .# #.', ':': '. . # . . . #', ';': '.. .. .# .. .. .# .# #.', '!': '# # # # # . #',
    '?': '.###. #...# ....# ...#. ..#.. ..... ..#..', "'": '# # . . . . .', '"': '#.# #.# ... ... ... ... ...', '-': '... ... ... ### ... ... ...',
    '+': '..... ..#.. ..#.. ##### ..#.. ..#.. .....', '/': '....# ...#. ...#. ..#.. .#... .#... #....', '(': '.# #. #. #. #. #. .#', ')': '#. .# .# .# .# .# #.',
    '%': '##..# ##.#. ...#. ..#.. .#... .#.## #..##', '·': '. . . # . . .', '×': '..... ..... #...# .#.#. ..#.. .#.#. #...#',
    '<': '...# ..#. .#.. #... .#.. ..#. ...#', '>': '#... .#.. ..#. ...# ..#. .#.. #...', '=': '.... .... #### .... #### .... ....',
    '_': '..... ..... ..... ..... ..... ..... #####', '#': '.#.#. .#.#. ##### .#.#. ##### .#.#. .#.#.', '&': '.##.. #..#. #.#.. .#... #.#.# #..#. .##.#',
    '…': '..... ..... ..... ..... ..... ..... #.#.#', '«': '..... ..#.# .#.#. #.#.. .#.#. ..#.# .....', '»': '..... #.#.. .#.#. ..#.# .#.#. #.#.. .....',
    '◀': '...# ..## .### #### .### ..## ...#', '▶': '#... ##.. ###. #### ###. ##.. #...', '→': '..... ..#.. ...#. ##### ...#. ..#.. .....',
    '←': '..... ..#.. .#... ##### .#... ..#.. .....', '↑': '..#.. .###. #.#.# ..#.. ..#.. ..#.. ..#..', '↓': '..#.. ..#.. ..#.. ..#.. #.#.# .###. ..#..',
    '*': '..... #.#.# .###. ##### .###. #.#.# .....', '[': '## #. #. #. #. #. ##', ']': '## .# .# .# .# .# ##', '|': '# # # # # # #',
    '@': '.###. #...# #.### #.#.# #.### #.... .###.', '€': '..### .#... ####. .#... ####. .#... ..###', '$': '..#.. .#### #.#.. .###. ..#.# ####. ..#..',
    '°': '.#. #.# .#. ... ... ... ...', '~': '..... ..... .#..# #.##. ..... ..... .....', '♪': '..##. ..#.# ..#.. ..#.. .##.. ###.. .#...',
  };
  const ACC = { a: ['..#', '.#.'], g: ['#..', '.#.'], c: ['.#.', '#.#'], d: ['...', '#.#'], t: ['.#.#', '#.#.'], z: ['.#.', '##.'] };  // aigu, grave, circonflexe, tréma, tilde, cédille
  const COMP = { é: 'ea', è: 'eg', ê: 'ec', ë: 'ed', á: 'aa', à: 'ag', â: 'ac', ä: 'ad', í: 'ıa', ì: 'ıg', î: 'ıc', ï: 'ıd', ó: 'oa', ò: 'og', ô: 'oc', ö: 'od',
    ú: 'ua', ù: 'ug', û: 'uc', ü: 'ud', ÿ: 'yd', ñ: 'nt', ç: 'cz', É: 'Ea', È: 'Eg', Ê: 'Ec', Ë: 'Ed', Á: 'Aa', À: 'Ag', Â: 'Ac', Ä: 'Ad', Í: 'Ia', Î: 'Ic', Ï: 'Id',
    Ó: 'Oa', Ô: 'Oc', Ö: 'Od', Ú: 'Ua', Ù: 'Ug', Û: 'Uc', Ü: 'Ud', Ñ: 'Nt', Ç: 'Cz' };
  const SUB = { 'œ': 'oe', 'Œ': 'OE', '’': "'", '‘': "'", '“': '"', '”': '"', '–': '-', '—': '-', ' ': ' ', ' ': ' ', '•': '·', '✓': 'v', 'ᐸ': '<', 'ᐳ': '>', '＜': '<', '＞': '>', '｜': '|', '／': '/', '！': '!', '？': '?', '（': '(', '）': ')', '：': ':', '　': ' ' };  // ᐸ ᐳ : les < > des titres YouTube
  const H = 11, glyphs = new Map(); let raster;
  function glyph(ch) {
    let g = glyphs.get(ch); if (g) return g;
    const px = [], add = (rows, ox, oy) => rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) if (r[x] === '#') px.push([ox + x, oy + y]); });
    const c = COMP[ch], src = S[c ? c[0] : ch]; let w = 3;
    if (src) {
      const rows = src.split(' '); w = Math.max(...rows.map(r => r.length)); add(rows, 0, 2);
      if (c) { const a = ACC[c[1]]; add(a, Math.floor((w - a[0].length) / 2), c[1] === 'z' ? 9 : /[A-Z]/.test(c[0]) ? 0 : 1); }
    } else if (ch !== ' ') {  // japonais, emoji… : la lettre du système, réduite à des pixels nets (sans lissage) sur la même hauteur que la police
      const q = (raster ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true })), RW = 16;
      q.canvas.width = RW; q.canvas.height = H; q.font = '11px "MS Gothic", "Yu Gothic UI", Meiryo, "Segoe UI Symbol", sans-serif'; q.fillStyle = '#000'; q.fillText(ch, 0, 10);
      const d = q.getImageData(0, 0, RW, H).data; let mx = 0;
      for (let y = 0; y < H; y++) for (let x = 0; x < RW; x++) if (d[(y * RW + x) * 4 + 3] > 110) { px.push([x, y]); mx = Math.max(mx, x + 1); }
      w = mx || 3;
      if (!px.length) { w = 5; add(['#####', '#...#', '#...#', '#...#', '#...#', '#...#', '#####'], 0, 2); }  // vraiment inconnue : une petite case
    }
    g = { w, px }; glyphs.set(ch, g); return g;
  }
  function layout(text) {
    let x = 0; const items = [];
    for (const ch of String(text)) for (const c of SUB[ch] ?? ch) { const g = glyph(c); items.push([g, x]); x += g.w + 1; }
    return { w: Math.max(0, x - 1), items };
  }
  function draw(g, text, x, y, color, s = 1) {  // (x, y) : coin haut gauche de la case
    const L = layout(text); g.fillStyle = color;
    for (const [gl, ox] of L.items) for (const [px, py] of gl.px) g.fillRect(x + (ox + px) * s, y + py * s, s, s);
    return L.w * s;
  }
  const bmp = new Map();
  function sprite(text, color, s = 1) {  // le texte tout prêt, gardé pour les images suivantes du jeu
    const k = text + '|' + color + '|' + s; let c = bmp.get(k); if (c) return c;
    c = document.createElement('canvas'); c.width = Math.max(1, layout(text).w * s); c.height = H * s; draw(c.getContext('2d'), text, 0, 0, color, s);
    if (bmp.size > 400) bmp.delete(bmp.keys().next().value);
    bmp.set(k, c); return c;
  }
  // comme fillText : (x, y) sur la ligne de base, aligné à gauche, au centre ou à droite
  function fill(g, text, x, y, color, s = 1, align = 'left') {
    const c = sprite(String(text), color, s), dx = align === 'center' ? -c.width / 2 : align === 'right' ? -c.width : 0;
    g.drawImage(c, Math.round(x + dx), Math.round(y - 9 * s));
  }
  const scale = size => Math.max(1, Math.round((size || 8) / 8));
  function art(rows, pal, s = 1) {  // un dessin en lignes de caractères, chaque caractère une couleur de la palette (« . » : transparent)
    const c = document.createElement('canvas'); c.width = Math.max(...rows.map(r => r.length)) * s; c.height = rows.length * s;
    const g = c.getContext('2d');
    rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const col = pal[r[x]]; if (col) { g.fillStyle = col; g.fillRect(x * s, y * s, s, s); } } });
    return c;
  }
  return { H, layout, draw, sprite, fill, scale, art };
})();

// les pièces de l'interface, pixel par pixel (K : contour, les autres lettres : la palette du jeu)
const PX_PANEL = ['..KKKKKKKKKKKK..', '.KAAAAAAAAAAAAK.', 'KALAAAAAAAAAALSK', 'KAAKKKKKKKKKKSSK', 'KAAKHHHHHHHHKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK',
  'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKHDDDDDDDKSSK', 'KAAKKKKKKKKKKSSK', 'KALSSSSSSSSSSLSK', '.KSSSSSSSSSSSSK.', '..KKKKKKKKKKKK..'];
const PX_CARD = ['.KKKKKKKKKK.', 'KFFFFFFFFFFK', 'KFHHHHHHHHFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFHDDDDDDDFK', 'KFSSSSSSSSFK', 'KFFFFFFFFFFK', '.KKKKKKKKKK.'];
const PX_BTN = ['.KKKKKKKKKK.', 'KWWWWWWWWWWK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KWMMMMMMMMBK', 'KBBBBBBBBBBK', 'KKKKKKKKKKKK', 'KDDDDDDDDDDK', '.KKKKKKKKKK.'];
const PX_BTN_DOWN = ['............', '............', '.KKKKKKKKKK.', 'KBBBBBBBBBBK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KBMMMMMMMMWK', 'KWWWWWWWWWWK', '.KKKKKKKKKK.'];
const PX_TRACK = ['.KKKKKKKKKK.', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KDDDDDDDDDDK', 'KHHHHHHHHHHK', '.KKKKKKKKKK.'];
const PX_KNOB = ['.KKKKK.', 'KWWWWWK', 'KWAAABK', 'KWAAABK', 'KKKKKKK', 'KWAAABK', 'KWAAABK', 'KBBBBBK', 'KDDDDDK', '.KKKKK.'];
const PX_RAIL = ['KDDDDDDK', 'KDDDDDDK', 'KDDDDDDK', 'KDDHHDDK'];
const PX_ICONS = {
  play: ['kk......', 'kakk....', 'kaaakk..', 'kaaaaakk', 'kaaaaaak', 'kaaaaakk', 'kaaakk..', 'kakk....', 'kk......'],
  full: ['www...www', 'w.......w', 'w.......w', '.........', '....a....', '.........', 'w.......w', 'w.......w', 'www...www'],
  note: ['...aaaaaa', '...aaaaaa', '...a....a', '...a....a', '...a....a', '.aaa..aaa', 'aaaa.aaaa', 'aaaa.aaaa', '.aa...aa.'],
  star: ['....g....', '....g....', '...ggg...', 'ggggwgggg', '.ggwwwgg.', '..ggggg..', '..oo.oo..', '.oo...oo.', '.o.....o.'],
  crown: ['g...g...g', 'gg.ggg.gg', 'ggggggggg', 'grgggggrg', 'ggggggggg', 'ooooooooo'],
  folder: ['oooo.....', 'oggoooooo', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ggggggggg', 'ooooooooo'],
  vol: ['....w....', '...ww..b.', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', 'wwwww.b.b', '...ww..b.', '....w....'],
  clock: ['..wwwww..', '.w.....w.', 'w...a...w', 'w...a...w', 'w...aaa.w', 'w.......w', 'w.......w', '.w.....w.', '..wwwww..'],
  cursor: ['....a....', '..aaaaa..', '.a..a..a.', '.a.....a.', 'aaa.w.aaa', '.a.....a.', '.a..a..a.', '..aaaaa..', '....a....'],
  plus: ['...b...', '...b...', '...b...', 'bbbbbbb', '...b...', '...b...', '...b...'],
  down: ['wwwwwww', '.wwwww.', '..www..', '...w...'],
};

/* habille la page du jeu : root = son conteneur, T = sa palette, icons = [motif du texte, icône] pour les boutons et libellés */
function pxSkin(root, { T, icons = [], emblem, title }) {
  root.classList.add('pxk'); const s = 2, url = c => c.toDataURL();
  const btnPal = (M, W, B, D) => ({ K: T.k, W, M, B, D });
  const BN = btnPal(T.btn, T.btnHi, T.btnLo, T.k2), BH = btnPal(T.btnHov, T.btnHovHi, T.btnLo, T.k2);
  const BA = btnPal(T.acc, T.accL, T.accS, T.accD), BAH = btnPal(T.accL, '#ffffff', T.acc, T.accD);
  const img = { panel: PXK.art(PX_PANEL, { K: T.k, A: T.acc, S: T.accS, L: T.rivet, H: T.hl, D: T.fill }, s),
    card: PXK.art(PX_CARD, { K: T.k, F: T.line, H: T.hl, D: T.fill, S: T.k2 }, s), cardOn: PXK.art(PX_CARD, { K: T.k, F: T.acc, H: T.accS, D: T.fillOn, S: T.accD }, s),
    btn: PXK.art(PX_BTN, BN, s), btnH: PXK.art(PX_BTN, BH, s), btnD: PXK.art(PX_BTN_DOWN, BH, s),
    main: PXK.art(PX_BTN, BA, s), mainH: PXK.art(PX_BTN, BAH, s), mainD: PXK.art(PX_BTN_DOWN, BA, s),
    track: PXK.art(PX_TRACK, { K: T.k, D: T.k2, H: T.line }, s), knob: PXK.art(PX_KNOB, { K: T.k, W: T.accL, A: T.acc, B: T.accS, D: T.accD }, s),
    rail: PXK.art(PX_RAIL, { K: T.k, D: T.k2, H: T.line }, s), tile: PXK.art(T.tile, { x: T.bgDot, ':': T.bgDot2, '+': T.spark, '*': T.spark2 }, s) };
  const u = Object.fromEntries(Object.entries(img).map(([k, c]) => [k, url(c)]));
  const nine = (k, sl) => `border-style:solid;border-width:${sl * s}px;border-image:url(${u[k]}) ${sl * s} fill / ${sl * s}px stretch`;
  const IP = { k: T.k, w: T.text, a: T.acc, b: T.acc2, g: T.gold, o: T.orange, r: T.red, n: T.green, N: T.green2, m: T.muted, s: T.accS };
  const iconUrl = new Map(), icon = name => {
    let v = iconUrl.get(name); if (!v) { const c = PXK.art(PX_ICONS[name] || emblem, IP, s); v = { u: url(c), w: c.width, h: c.height }; iconUrl.set(name, v); }
    const b = document.createElement('b'); b.className = 'pxI'; b.setAttribute('aria-hidden', 'true'); b.style.cssText = `width:${v.w}px;height:${v.h}px;background-image:url(${v.u})`; return b;
  };
  const R = '.pxk.pxk';
  const css = document.createElement('style');
  css.textContent = `html,html body{background:${T.bg} url(${u.tile}) 0 0/${img.tile.width}px ${img.tile.height}px repeat!important}
::-webkit-scrollbar{width:16px;height:16px} ::-webkit-scrollbar-track{background:url(${u.rail}) 0 0/16px 8px repeat-y} ::-webkit-scrollbar-thumb{${nine('main', 4)}} ::-webkit-scrollbar-corner{background:none}
${R}{color:${T.text}}
${R} .px{box-shadow:none;background:none}
${R} .agHead{gap:18px;margin:0}
${R} .agHead .label{display:flex;align-items:center;gap:12px}
${R} .btn,${R} .tab{${nine('btn', 4)};height:auto;min-height:0;padding:0 6px 4px;margin:0;color:${T.text};font:12px/1 monospace;display:inline-flex;align-items:center;gap:6px;filter:none;text-shadow:none;letter-spacing:0;cursor:var(--cp,pointer)}
${R} .btn:hover,${R} .tab:hover{border-image-source:url(${u.btnH})}
${R} .btn:active,${R} .tab:active{border-image-source:url(${u.btnD});padding:4px 6px 0}
${R} .btn.main,${R} .tab.on{border-image-source:url(${u.main});color:${T.k}}
${R} .btn.main:hover,${R} .tab.on:hover{border-image-source:url(${u.mainH})}
${R} .btn.main:active,${R} .tab.on:active{border-image-source:url(${u.mainD})}
${R} .btn:focus-visible,${R} .tab:focus-visible{outline:2px dashed ${T.acc2};outline-offset:2px}
${R} .btn .pxV,${R} .tab .pxV{white-space:nowrap}
${R} .sysCard{${nine('card', 4)};padding:4px 6px;gap:8px;background:none}
${R} .sysCard.on{border-image-source:url(${u.cardOn})}
${R} .sysCard.on>b{color:${T.acc}}
${R} .sysCard>b{color:${T.text}}
${R} .row{display:flex;flex-wrap:wrap;gap:8px;align-items:center}
${R} .gameBox,${R} .thBox{${nine('panel', 5)};box-shadow:none;background:none;padding:2px;gap:8px;grid-template-rows:auto auto}
${R} .gameBox canvas,${R} .thBox canvas{display:block;background:#05010b}
${R} .gameBox:fullscreen,${R} .thBox:fullscreen{border:0;padding:0;background:#000}
${R} .rhFs{position:static;opacity:1;justify-self:end;margin:0 6px 6px 0}
${R} .rhTabs{gap:8px;flex-wrap:wrap}
${R} .hint{color:${T.muted};line-height:24px}
${R} label{color:${T.muted};display:inline-flex;align-items:center;gap:8px}
${R} .rhDel{color:${T.red};top:6px;right:8px}
${R} input[type=range]{-webkit-appearance:none;appearance:none;background:none;height:20px;width:150px}
${R} input[type=range]::-webkit-slider-runnable-track{height:12px;${nine('track', 2)}}
${R} input[type=range]::-webkit-slider-thumb{-webkit-appearance:none;width:14px;height:20px;border:0;background:url(${u.knob}) 0 0/100% 100%;margin-top:-8px;cursor:var(--cp,pointer)}
${R} .pxSel{justify-content:space-between;gap:10px;max-width:100%;overflow:hidden}
${R} .rhImport .pxSel{flex:1;min-width:0}
.pxMenu{position:fixed;z-index:50;${nine('card', 4)};padding:2px;max-height:280px;overflow-y:auto;display:flex;flex-direction:column;gap:2px;color:${T.text}}
.pxMenu button{all:unset;padding:3px 8px;cursor:var(--cp,pointer);white-space:nowrap}
.pxMenu button:hover,.pxMenu button:focus-visible,.pxMenu button.on{background:${T.btnHov};color:${T.text}}
.pxMenu button.on{color:${T.acc}}
.pxT{position:relative;white-space:normal;font:12px/1 monospace;letter-spacing:0;text-transform:none}
.pxT i{display:inline-block;vertical-align:middle;background:currentColor;-webkit-mask:var(--m) 0 0/100% 100% no-repeat;mask:var(--m) 0 0/100% 100% no-repeat;image-rendering:pixelated}
.pxI{display:inline-block;vertical-align:middle;background:0 0/100% 100% no-repeat;image-rendering:pixelated;margin-right:6px}
.pxV>.pxI+.pxI{margin-left:-4px}
.pxSr{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap}`;
  document.head.append(css);
  // un mot = une image (en masque : sa couleur suit celle du texte), une règle par mot pour ne pas répéter l'image
  const words = new Map(), sheet = document.head.appendChild(document.createElement('style')).sheet;
  const word = w => {
    let k = words.get(w);
    if (!k) { const c = PXK.sprite(w, '#fff', s); k = 'pw' + words.size; words.set(w, k); sheet.insertRule(`.${k}{--m:url(${c.toDataURL()});width:${c.width}px;height:${c.height}px}`, sheet.cssRules.length); }
    const i = document.createElement('i'); i.className = k; return i;
  };
  function render(vis, text, lead) {
    const parts = [], ic = lead && icons.find(([re]) => re.test(text.trim()));
    if (ic) parts.push(icon(ic[1]));
    for (const m of text.matchAll(/(★+)|(\s+)|([^\s★]+)/g)) {
      if (m[1]) for (const _ of m[1]) parts.push(icon('star'));
      else if (m[2]) parts.push(document.createTextNode(' '));
      else parts.push(word(m[3]));
    }
    vis.replaceChildren(...parts);
  }
  const lead = node => node.parentElement?.matches('button,label,.tab,.btn') && !node.previousSibling;
  function pixText(node) {  // le texte reste dans la page (lecteur d'écran, copier) ; on voit ses lettres en pixels
    const wrap = document.createElement('span'), sr = document.createElement('span'), vis = document.createElement('span');
    wrap.className = 'pxT'; sr.className = 'pxSr'; vis.className = 'pxV'; vis.setAttribute('aria-hidden', 'true');
    const first = lead(node); node.replaceWith(wrap); sr.append(node); wrap.append(sr, vis); render(vis, node.data, first);
  }
  function pxSelect(sel) {  // une liste déroulante en pixels ; la vraie reste cachée et garde sa valeur et ses événements
    sel.dataset.px = '1'; sel.style.display = 'none';
    const b = document.createElement('button'), lab = document.createElement('span'); b.type = 'button'; b.className = 'btn pxSel'; b.append(lab, icon('down')); sel.after(b);
    const sync = () => { const t = sel.selectedOptions[0]?.textContent || '—'; if (lab.dataset.t !== t) { lab.dataset.t = t; lab.textContent = t; } };
    const d = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
    Object.defineProperty(sel, 'value', { configurable: true, get() { return d.get.call(this); }, set(v) { d.set.call(this, v); sync(); } });
    new MutationObserver(sync).observe(sel, { childList: true, subtree: true, characterData: true, attributes: true });
    sel.addEventListener('change', sync);
    b.onclick = () => {
      document.querySelector('.pxMenu')?.remove();
      const m = document.createElement('div'), r = b.getBoundingClientRect(); m.className = 'pxMenu'; m.setAttribute('role', 'listbox');
      for (const o of sel.options) {
        const it = document.createElement('button'); it.type = 'button'; it.textContent = o.textContent; it.className = o.selected ? 'on' : ''; it.setAttribute('role', 'option');
        it.onclick = () => { sel.value = o.value; sel.dispatchEvent(new Event('input', { bubbles: true })); sel.dispatchEvent(new Event('change', { bubbles: true })); close(); b.focus(); };
        m.append(it);
      }
      root.append(m);
      const below = innerHeight - r.bottom; m.style.minWidth = r.width + 'px'; m.style.left = Math.min(r.left, innerWidth - m.offsetWidth - 4) + 'px';
      m.style.top = (below > m.offsetHeight + 8 || below > r.top ? r.bottom + 2 : r.top - m.offsetHeight - 2) + 'px';
      const close = () => { m.remove(); removeEventListener('pointerdown', out, true); removeEventListener('keydown', key, true); removeEventListener('blur', close); };
      const out = e => { if (!m.contains(e.target) && e.target !== b && !b.contains(e.target)) close(); };
      const key = e => { if (e.key === 'Escape') { e.stopPropagation(); close(); b.focus(); } };
      addEventListener('pointerdown', out, true); addEventListener('keydown', key, true); addEventListener('blur', close);
      (m.querySelector('.on') || m.firstChild)?.focus();
    };
    sync();
  }
  const SKIP = 'select,option,textarea,script,style,canvas,.pxT,[data-pxskip]';
  let queued = false;
  function pass() {
    queued = false;
    root.querySelectorAll('select.gSel:not([data-px])').forEach(pxSelect);
    const w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), todo = [];
    for (let n; (n = w.nextNode());) if (n.data.trim() && n.parentElement && !n.parentElement.closest(SKIP)) todo.push(n);
    todo.forEach(pixText);
  }
  new MutationObserver(ms => {
    for (const m of ms) if (m.type === 'characterData') { const wrap = m.target.parentNode?.closest?.('.pxT'); if (wrap) render(wrap.lastChild, m.target.data, false); }
    if (!queued) { queued = true; queueMicrotask(pass); }
  }).observe(root, { childList: true, subtree: true, characterData: true });
  // le titre : grosses lettres à contour, trois tons, et l'emblème du jeu
  const lab = root.querySelector('.agHead .label');
  if (lab) {
    const L = PXK.layout(title), c = document.createElement('canvas'), g = c.getContext('2d'), on = [];
    c.width = L.w + 3; c.height = PXK.H + 3;
    for (const [gl, ox] of L.items) for (const [x, y] of gl.px) on.push([ox + x + 1, y + 1]);
    g.fillStyle = T.k; for (const [x, y] of on) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [2, 2], [1, 2], [2, 1]]) g.fillRect(x + dx, y + dy, 1, 1);
    for (const [x, y] of on) { g.fillStyle = y <= 5 ? T.accL : y <= 7 ? T.acc : T.accS; g.fillRect(x, y, 1, 1); }
    const big = document.createElement('canvas'), z = 4; big.width = c.width * z; big.height = c.height * z;
    const bg = big.getContext('2d'); bg.imageSmoothingEnabled = false; bg.drawImage(c, 0, 0, big.width, big.height);
    const t = document.createElement('b'); t.className = 'pxI'; t.style.cssText = `width:${big.width}px;height:${big.height}px;background-image:url(${big.toDataURL()})`;
    const e = PXK.art(emblem, IP, 3), em = document.createElement('b'); em.className = 'pxI'; em.style.cssText = `width:${e.width}px;height:${e.height}px;background-image:url(${e.toDataURL()})`;
    const sr = document.createElement('span'); sr.className = 'pxSr'; sr.textContent = lab.textContent;
    lab.dataset.pxskip = '1'; lab.replaceChildren(em, t, sr);
  }
  pass();
}


export default async function (ctx) {
  const view = ctx.view;
  if (!ctx.host) { view.textContent = "Ce plugin doit être approuvé par NeoDex pour s'ouvrir."; return; }
  const host = ctx.host, { el, toast, sfx } = host;
  const folder = ctx.folder;
  host.addStyle(CSS);
  view.innerHTML = HTML;
  pxSkin(view.querySelector('.appWrap'), { title: 'FAISCEAUX', T: { k: '#0c0a12', k2: '#14101c', fill: '#1e1c28', fillOn: '#2a2836', hl: '#34323f', line: '#5a5468', acc: '#ff4a3a', accL: '#ffb0a0', accS: '#c8201a', accD: '#4a0a10',
  rivet: '#e8e4ec', btn: '#34323f', btnHi: '#5a5468', btnLo: '#14101c', btnHov: '#3e3a4c', btnHovHi: '#7a7488', text: '#f0eef4', muted: '#b8b4c4', acc2: '#9ef07a', gold: '#ffd84a',
  orange: '#ff8a3a', red: '#ff4a3a', green: '#9ef07a', green2: '#3aa04a', bg: '#100e16', bgDot: '#1e1c28', bgDot2: '#16141e', spark: '#5a0a10', spark2: '#ff4a3a',
  tile: ['................', '...:............', '................', '..........+.....', '................', '................', '.....:..........', '................',
    '................', '.............:..', '................', '..+.............', '................', '.........:......', '................', '................'] },
  emblem: ['...kkkk.....', '..kwwwwk....', '.kwwwwwmk...', '.kwkkkkmk...', '.kwkggkmk...', '.kmwwwmmk...', '..kmmmmk....', '...kook.....', 'rrrrrrrrrrrr', 'oooooooooooo', 'rrrrrrrrrrrr'],
  icons: [[/^NOUVELLE/, 'play'], [/^RECORDS/, 'crown']] });
  const $ = id => view.querySelector('#' + id) || document.getElementById(id);
  const doc = async n => { try { return await folder.read(n); } catch { return null; } };
  const games = { best: {}, ...(await doc('games')) };
  let gamesTimer = null;
  const saveGames = () => { clearTimeout(gamesTimer); gamesTimer = setTimeout(() => { gamesTimer = null; folder.write('games', games).catch(() => {}); }, 500); };
  const best = (k, v) => { const b = games.best[k]; if (v > (b ?? 0)) {  // un score nul n'est jamais un record
    games.best[k] = v; saveGames(); return true; } return false; };
  const gstore = (k, init) => (games[k] ??= init);
  // les trophées de NeoDex (3.4.8 et plus) : succès et records déclarés dans plugin.json ; sur un NeoDex plus ancien, rien ne se passe
  const trophy = id => { ctx.games?.unlock(id).catch(() => {}); };
  const trophyRecord = (id, v) => { if (v != null && Number.isFinite(+v)) ctx.games?.record(id, +v).catch(() => {}); };
function gameLoop(st, appKey, update, draw) {
  cancelAnimationFrame(st.raf);
  const STEP = 1000 / 60; let acc = 0, last = performance.now();
  const frame = t => {
    if (!view.classList.contains('on')) { st.raf = 0; if (st.mode === 'play') st.mode = 'pause'; return; }  // leaving the tab pauses the game
    st.raf = requestAnimationFrame(frame);
    acc += Math.min(200, t - last); last = t;
    while (acc >= STEP) { if (st.mode === 'play') update(); st.tick++; acc -= STEP; }
    draw();
  };
  st.raf = requestAnimationFrame(frame);
}
function gameText(g, w, lines, y0) {  // lignes centrées en police pixel, sur une bande sombre
  g.fillStyle = 'rgba(11,3,28,.72)'; g.fillRect(0, y0 - 14, w, lines.length * 14 + 14);
  lines.forEach(([text, color, size], i) => PXK.fill(g, text, w / 2, y0 + i * 14, color, PXK.scale(size), 'center'));
}
const px = (g, color, x, y, w = 1, h = 1) => { g.fillStyle = color; g.fillRect(Math.round(x), Math.round(y), w, h); };
function sprite(g, rows, x, y, pal) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) px(g, c, x + i, y + j); } }); }
const seeded = s => () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
const pxFont = (g, text, x, y, color, size = 8, align = 'left') => { const s = PXK.scale(size); PXK.fill(g, text, x + s, y + s, '#05010b', s, align); PXK.fill(g, text, x, y, color, s, align); };

/* ---------- Faisceaux : un petit robot dans une salle d'essai ; des émetteurs dans les murs s'allument (trait clignotant),
   puis tirent. On se glisse entre les rayons, on ramasse les piles. 60 images par seconde ---------- */
const FX = {W: 128, H: 142, HUD: 14, WALL: 8, SP: 1.15, DASH: 2.7, R: 3.5};
FX.X0 = FX.WALL; FX.X1 = FX.W - FX.WALL; FX.Y0 = FX.HUD + FX.WALL; FX.Y1 = FX.H - FX.WALL;  // l'intérieur de la salle (112 x 112)
const fxs = gstore('faisceaux', {games: 0, cells: 0, secs: 0});
let fx = null, fxac = null;
// le robot, vu de trois quarts, tourné vers la droite (miroir pour la gauche) ; deux images : la flamme du réacteur bat
const FX_PAL = {k: '#14101c', w: '#e8e4ec', g: '#9a94a8', G: '#5a5468', y: '#ffd84a', d: '#3a3448', o: '#ff8a3a', O: '#ffd84a'};
const FX_BOT = [
  ['..kkkkkk..', '.kwwwwwwk.', 'kwwwwwwwgk', 'kwkkkkkkgk', 'kwkddyykgk', 'kwkkkkkkgk', 'kgwwwwwggk', '.kggggggk.', '..kGGGGk..', '...kook...', '....kk....'],
  ['..kkkkkk..', '.kwwwwwwk.', 'kwwwwwwwgk', 'kwkkkkkkgk', 'kwkddyykgk', 'kwkkkkkkgk', 'kgwwwwwggk', '.kggggggk.', '..kGGGGk..', '...kOOk...', '...koOk...']];
const fxArt = (rows, flip, pal) => { const c = el('canvas'); c.width = rows[0].length; c.height = rows.length; sprite(c.getContext('2d'), flip ? rows.map(r => [...r].reverse().join('')) : rows, 0, 0, pal); return c; };
const FX_SPR = FX_BOT.map(r => [fxArt(r, false, FX_PAL), fxArt(r, true, FX_PAL)]);
// la pile à ramasser, qui scintille
const FX_CELL = [['.kkk.', 'kwlwk', 'klllk', 'kcllk', 'kcclk', 'kccck', '.kkk.'], ['.kkk.', 'kllwk', 'klllk', 'kclwk', 'kcclk', 'kccck', '.kkk.']]
  .map(r => fxArt(r, false, {k: '#14101c', w: '#ffffff', l: '#9ef07a', c: '#3aa04a'}));
const FX_BON = {shield: [['..kkk..', '.kbbbk.', 'kbwbbbk', 'kbbbbbk', 'kbbbbBk', '.kbbBk.', '..kkk..'], ['..kkk..', '.kbbbk.', 'kbbwbbk', 'kbbbbbk', 'kbbbbBk', '.kbBBk.', '..kkk..']],
  slow: [['kkkkk', 'kpppk', '.kyk.', '..k..', '.kpk.', 'kyyyk', 'kkkkk'], ['kkkkk', 'kpypk', '.kpk.', '..k..', '.kyk.', 'kyyyk', 'kkkkk']]};
for (const k in FX_BON) FX_BON[k] = FX_BON[k].map(r => fxArt(r, false, {k: '#14101c', b: '#4ac8ff', B: '#2a6ac8', w: '#ffffff', p: '#b070ff', y: '#ffd84a'}));
// le sol : des plaques de métal rivetées
const FX_FLOOR = (() => { const c = el('canvas'); c.width = c.height = 16; const g = c.getContext('2d');
  px(g, '#2a2836', 0, 0, 16, 16); px(g, '#34323f', 1, 1, 14, 1); px(g, '#34323f', 1, 1, 1, 14); px(g, '#201e2a', 1, 15, 15, 1); px(g, '#201e2a', 15, 1, 1, 15);
  for (const [x, y] of [[2, 2], [13, 2], [2, 13], [13, 13]]) { px(g, '#4a4658', x, y); px(g, '#16141e', x + 1, y + 1); }
  for (let i = 0; i < 6; i++) px(g, '#2f2d3b', 4 + i * 2, 7 + (i % 2)); return c; })();
const fxDiff = () => Math.min(1, fx.t / (60 * 100));  // au plus dur après 100 s
const fxSecs = () => Math.floor(fx.t / 60);
const fxScore = () => fxSecs() * 10 + fx.cells * 50 + (fx.bossPts || 0);
const FX_BOSS = [{name: 'LE PROJECTEUR', c: ['#ffd84a', '#c89a1a']}, {name: 'LE PRISME', c: ['#b070ff', '#6a3ab8']}, {name: 'L\'HORLOGE', c: ['#7ae0ff', '#2a8ab8']}];
const FX_BDUR = 1200;
const fxBossXY = () => fx.boss.kind === 1 ? [(FX.X0 + FX.X1) / 2, (FX.Y0 + FX.Y1) / 2] : [(FX.X0 + FX.X1) / 2, FX.Y0 - 2];
function fxBossStep(step) {  // le boss : ses attaques à son rythme ; tenu jusqu'au bout, il explose
  const B = fx.boss, t0 = Math.floor(B.t); B.t += step; const t = Math.floor(B.t); if (t === t0 && step < 1) return;
  const [bx, by] = fxBossXY(), d = .3 * Math.min(1, B.n / 3), at = fx.bt;
  if (B.t >= FX_BDUR) { fx.boss = null; fx.beams = []; const pts = 250 * (B.n + 1); fx.bossPts = (fx.bossPts || 0) + pts; fx.bossWins = (fx.bossWins || 0) + 1; fx.nextBoss = fxSecs() + 60; fx.next = 90;
    fx.banner = {text: FX_BOSS[B.kind].name + ' VAINCU', sub: '+' + pts + ' points', t: 110}; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; fx.bits.push({x: bx, y: by + 6, vx: Math.cos(a) * 1.5, vy: Math.sin(a) * 1.5, t: 40, c: FX_BOSS[B.kind].c[i % 2]}); }
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => fxBeep(f, .12, 'square', 0, .05), i * 90)); return; }
  if (t < 70 || t > FX_BDUR - 40) return;  // le temps de le voir arriver, et un répit à la fin
  if (B.kind === 0) {  // le Projecteur : des rayons visés sur le robot depuis son œil, et parfois une croix
    if (t % Math.round(64 - 14 * d * 3) === 0) { const a = Math.atan2(fx.y - by, fx.x - bx); fx.beams.push({kind: 'r', ex: bx, ey: by, a0: a - .3, a1: a + .3, w: 4, warn: 38, fire: 40, at}); fxBeep(700, .05, 'square', 0, .025); }
    if (t % 300 === 150) { fx.beams.push({kind: 'h', o: 'h', p: fx.y, w: 4, warn: 60, fire: 30, at}, {kind: 'v', o: 'v', p: fx.x, w: 4, warn: 60, fire: 30, at}); }
  } else if (B.kind === 1) {  // le Prisme : trois rayons qui tournent depuis le centre, dans un sens puis dans l'autre
    if (t === 70 || t === 640) { const dir = t === 70 ? 1 : -1, a = fx.rnd() * 6.283; for (let k = 0; k < 3; k++) fx.beams.push({kind: 'r', ex: bx, ey: by, a0: a + k * 2.094, a1: a + k * 2.094 + dir * (3.6 + d * 2), w: 4, warn: 70, fire: 460, at}); fxBeep(300, .3, 'sawtooth', 120, .04); }
  } else if (t % Math.round(58 - d * 30) === 0) {  // l'Horloge : des grilles qui alternent, toujours avec un passage
    const o = (t / 58 | 0) % 2 ? 'h' : 'v', n = 5, gap = Math.floor(fx.rnd() * n), lo = o === 'h' ? FX.Y0 : FX.X0, ix = FX.X1 - FX.X0;
    for (let i = 0; i < n; i++) if (i !== gap) fx.beams.push({kind: o, o, p: lo + (i + .5) * ix / n, w: 6, warn: 46, fire: 30, at}); fxBeep(1200, .04, 'square', 0, .03);
  }
}
function fxBossDraw(g) {  // trois machines à un seul œil
  const B = fx.boss; if (!B) return; const [bx, by] = fxBossXY(), [L, D] = FX_BOSS[B.kind].c, x = Math.round(bx), y = Math.round(by), come = Math.min(1, B.t / 60);
  g.globalAlpha = come;
  if (B.kind === 1) { const a = fx.tick * .04; for (let k = 0; k < 3; k++) { const t = a + k * 2.094; for (let r = 0; r < 9; r++) px(g, r > 6 ? '#14101c' : r % 2 ? L : D, x + Math.cos(t) * r - 1, y + Math.sin(t) * r - 1, 3, 3); }
    px(g, '#14101c', x - 5, y - 5, 11, 11); px(g, D, x - 4, y - 4, 9, 9); px(g, L, x - 3, y - 4, 7, 2); }
  else { px(g, '#14101c', x - 13, y - 4, 27, 13); px(g, D, x - 12, y - 3, 25, 11); px(g, L, x - 11, y - 3, 23, 3);
    if (B.kind === 2) for (let k = 0; k < 12; k++) { const t = k / 12 * 6.283; px(g, '#14101c', x + Math.cos(t) * 10, y + 3 + Math.sin(t) * 5, 1, 1); } }
  const ex = x, ey = B.kind === 1 ? y : y + 3, la = Math.atan2(fx.y - ey, fx.x - ex);
  px(g, '#14101c', ex - 3, ey - 3, 7, 7); px(g, '#ffffff', ex - 2, ey - 2, 5, 5); px(g, '#ff4a3a', Math.round(ex - 1 + Math.cos(la) * 1.5), Math.round(ey - 1 + Math.sin(la) * 1.5), 2, 2);
  if (B.kind === 2) { const h = B.t / FX_BDUR * 6.283 - 1.57; px(g, '#14101c', Math.round(x + Math.cos(h) * 8), Math.round(y + 3 + Math.sin(h) * 4), 2, 2); }  // l'aiguille fait le tour en 20 s
  g.globalAlpha = 1;
}
let fxBeep = function (f, d, type = 'square', slide = 0, vol = .04) { try { fxac ??= new AudioContext(); const o = fxac.createOscillator(), g = fxac.createGain(), t = fxac.currentTime; o.type = type; o.frequency.setValueAtTime(f, t); if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + d); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g).connect(fxac.destination); o.start(t); o.stop(t + d); } catch {} }
// une nouvelle partie garde le même objet : la boucle du jeu (gameLoop) continue de tourner dessus
const renew = (old, o) => { if (!old) return o; for (const k of Object.keys(old)) if (k !== 'raf') delete old[k]; return Object.assign(old, o); };
function fxNew() {
  const g = fx?.g;
  fx = renew(fx, {g, mode: 'ready', tick: 0, seen: 0, t: 0, x: FX.W / 2, y: (FX.Y0 + FX.Y1) / 2, face: 0, keys: new Set(), dash: 0, dashCd: 0, beams: [], next: 90, cells: 0, cell: null, cellT: 120, bt: 0, bonus: null, bonusT: 600, shield: false, inv: 0, slow: 0, boom: 0, dead: 0, record: false, bits: [], rnd: seeded(Date.now() % 1e9), boss: null, nextBoss: 45, bossPts: 0, bossWins: 0, banner: null});
  fxInfo();
}
// les rayons : 'h' / 'v' = une ligne d'un mur à l'autre (p = sa position, w = son épaisseur) ; 'r' = un rayon qui balaie un arc depuis un émetteur du mur
// warn = temps d'alerte (le trait clignote), fire = durée du tir
const fxLineHit = (b, x, y) => Math.abs((b.o === 'h' ? y : x) - b.p) < b.w / 2 + FX.R;
function fxRayHit(b, x, y, a) { const dx = x - b.ex, dy = y - b.ey, c = Math.cos(a), s = Math.sin(a); return dx * c + dy * s > 0 && Math.abs(dx * s - dy * c) < b.w / 2 + FX.R; }
const fxAng = b => b.a0 + (b.a1 - b.a0) * Math.min(1, Math.max(0, (fx.bt - b.at - b.warn) / b.fire));
function fxSpawn() {
  let d = fxDiff(), r = fx.rnd, warn = Math.round(70 - 30 * d), fire = 34, at = fx.bt, ix = FX.X1 - FX.X0;
  const line = (o, p, w = 4) => fx.beams.push({kind: o, o, p, w, warn, fire, at});
  const roll = r();
  if (roll < .3 - d * .1) { const o = r() < .5 ? 'h' : 'v'; line(o, (o === 'h' ? FX.Y0 : FX.X0) + 14 + r() * (ix - 28), r() < d * .6 ? 8 : 4); }
  else if (roll < .55) {  // la grille : des lignes parallèles, avec toujours un passage
    const o = r() < .5 ? 'h' : 'v', n = 3 + Math.floor(r() * (2 + d * 2)), gap = Math.floor(r() * n), lo = o === 'h' ? FX.Y0 : FX.X0;
    for (let i = 0; i < n; i++) if (i !== gap) line(o, lo + (i + .5) * ix / n, 6);
  }
  else if (roll < .75) { const w0 = warn; warn += 18; line('h', fx.y); line('v', fx.x); warn = w0; }  // la croix, visée sur le robot : il faut bouger en diagonale, d'où une alerte plus longue
  else {  // le balayage : un rayon part d'un mur et tourne de 60 à 100 degrés (plus au plus dur)
    const side = Math.floor(r() * 4), t = .2 + r() * .6, sweep = (50 + r() * 30 * (1 + d)) * Math.PI / 180 * (r() < .5 ? 1 : -1);
    const [ex, ey, base] = [[FX.X0 + t * ix, FX.Y0, Math.PI / 2], [FX.X1, FX.Y0 + t * ix, Math.PI], [FX.X0 + t * ix, FX.Y1, -Math.PI / 2], [FX.X0, FX.Y0 + t * ix, 0]][side];
    fx.beams.push({kind: 'r', ex, ey, a0: base - sweep / 2, a1: base + sweep / 2, w: 4, warn: warn + 10, fire: Math.round(Math.abs(sweep) / .009), at});  // il tourne à 0,009 rad par image : à 80 px du mur, moins vite que le robot
  }
  fxBeep(880, .05, 'square', 0, .025);
}
function fxDie() {
  fx.mode = 'over'; fx.dead = 0; fx.keys.clear(); fx.ptr = null;
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2, v = .6 + (i % 3) * .5; fx.bits.push({x: fx.x, y: fx.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 30 + (i % 4) * 8, c: i % 3 ? '#9a94a8' : '#ffd84a'}); }
  fxs.games++; fxs.cells += fx.cells; fxs.secs += fxSecs(); fxs.longest = Math.max(fxs.longest || 0, fxSecs()); fxs.bosses = (fxs.bosses || 0) + (fx.bossWins || 0); fx.record = best('faisceaux', fxScore()); saveGames(); fxInfo();
  fxBeep(220, .5, 'sawtooth', 40, .07);
}
function fxUpdate() {
  if (fx.mode === 'over') { fx.dead++; for (const b of fx.bits) { b.x += b.vx; b.y += b.vy; b.vx *= .94; b.vy *= .94; b.t--; } fx.bits = fx.bits.filter(b => b.t > 0); return; }
  if (fx.mode !== 'play') return;
  fx.t++; const step = fx.slow > 0 ? .5 : 1; fx.bt += step; if (fx.slow > 0) fx.slow--; if (fx.inv > 0) fx.inv--; if (fx.boom > 0) fx.boom--;
  // le déplacement (8 directions, ou vers le pointeur) et l'élan, à recharger
  const k = fx.keys, on = (...n) => n.some(x => k.has(x));
  let dx = (on('ArrowRight', 'd') ? 1 : 0) - (on('ArrowLeft', 'q', 'a') ? 1 : 0), dy = (on('ArrowDown', 's') ? 1 : 0) - (on('ArrowUp', 'z', 'w') ? 1 : 0);
  if (dx && dy) { dx *= .7071; dy *= .7071; }
  if (fx.ptr) { const vx = fx.ptr.x - fx.x, vy = fx.ptr.y - fx.y, n = Math.hypot(vx, vy); dx = dy = 0; if (n > 2) { dx = vx / n; dy = vy / n; } }
  if (dx) fx.face = dx < 0 ? 1 : 0;
  if (fx.dashCd) fx.dashCd--;
  const sp = fx.dash > 0 ? (fx.dash--, FX.DASH) : FX.SP;
  fx.x = Math.min(FX.X1 - 5, Math.max(FX.X0 + 5, fx.x + dx * sp)); fx.y = Math.min(FX.Y1 - 5, Math.max(FX.Y0 + 5, fx.y + dy * sp));
  // les rayons : alerte, tir, fin
  if (!fx.boss && fxSecs() >= fx.nextBoss && !fx.beams.length) { const n = fx.bossWins || 0; fx.boss = {kind: n % 3, n, t: 0}; fx.banner = {text: 'BOSS : ' + FX_BOSS[n % 3].name, sub: 'tiens 20 secondes', t: 100}; fxBeep(110, .8, 'sawtooth', 220, .06); }
  if (fx.banner && --fx.banner.t <= 0) fx.banner = null;
  if (fx.boss) { fxBossStep(step); if (fx.boss?.kind === 1 && fx.boss.t > 40) { const [bx, by] = fxBossXY(); if (Math.hypot(fx.x - bx, fx.y - by) < 8 && !fx.inv) { if (!fx.shield) return fxDie(); fx.shield = false; fx.inv = 50; fx.boom = 20; } } }
  else if ((fx.next -= step) <= 0) { fxSpawn(); fx.next = Math.round(Math.max(70 - 30 * fxDiff() + 14, 115 - 55 * fxDiff() + fx.rnd() * 30)); }  // une seule alerte à la fois : deux rayons qui tombent ensemble étaient impossibles à éviter
  for (const b of fx.beams) {
    const age = fx.bt - b.at;
    if (age === b.warn) fxBeep(b.kind === 'r' ? 140 : 110, .25, 'sawtooth', 60, .03);
    if (age >= b.warn && age < b.warn + b.fire && (b.kind === 'r' ? fxRayHit(b, fx.x, fx.y, fxAng(b)) : fxLineHit(b, fx.x, fx.y))) { if (fx.inv) continue; if (!fx.shield) return fxDie(); fx.shield = false; fx.inv = 50; fx.boom = 20; fxBeep(600, .3, 'square', 120, .06); }
  }
  fx.beams = fx.beams.filter(b => fx.bt - b.at < b.warn + b.fire);
  // la pile : posée loin du robot, ramassée en passant dessus
  if (!fx.cell && --fx.cellT <= 0) { let x, y, n = 0; do { x = FX.X0 + 12 + fx.rnd() * (FX.X1 - FX.X0 - 24); y = FX.Y0 + 12 + fx.rnd() * (FX.Y1 - FX.Y0 - 24); } while (Math.hypot(x - fx.x, y - fx.y) < 40 && n++ < 20); fx.cell = {x, y}; }
  // les bonus : un toutes les 10 à 16 s, posé loin du robot, il reste 8 s ; bouclier (un rayon encaissé) ou ralenti des rayons (5 s)
  if (!fx.bonus && --fx.bonusT <= 0) { let x, y, n = 0; do { x = FX.X0 + 12 + fx.rnd() * (FX.X1 - FX.X0 - 24); y = FX.Y0 + 12 + fx.rnd() * (FX.Y1 - FX.Y0 - 24); } while (Math.hypot(x - fx.x, y - fx.y) < 40 && n++ < 20);
    fx.bonus = {x, y, kind: fx.shield || fx.rnd() < .5 ? 'slow' : 'shield', life: 480}; }
  if (fx.bonus && --fx.bonus.life <= 0) { fx.bonus = null; fx.bonusT = 600 + Math.floor(fx.rnd() * 360); }
  if (fx.bonus && Math.hypot(fx.bonus.x - fx.x, fx.bonus.y - fx.y) < 8) { fxBonus(fx.bonus.kind); fx.bonus = null; fx.bonusT = 600 + Math.floor(fx.rnd() * 360); }
  if (fx.cell && Math.hypot(fx.cell.x - fx.x, fx.cell.y - fx.y) < 7) { fx.cells++; fx.cell = null; fx.cellT = 150 + Math.floor(fx.rnd() * 120); fxBeep(990, .07, 'square', 0, .04); setTimeout(() => fxBeep(1320, .1, 'square', 0, .04), 70); }
}
function fxBonus(kind) {
  if (kind === 'shield') { fx.shield = true; [520, 780, 1040].forEach((f, i) => setTimeout(() => fxBeep(f, .08, 'triangle', 0, .05), i * 60)); }
  else { fx.slow = 300; fxBeep(900, .5, 'sine', 220, .06); }
}
function fxDash() { if (fx.mode !== 'play' || fx.dashCd) return; fx.dash = 10; fx.dashCd = 110; fxBeep(300, .15, 'triangle', 900, .05); }
// un rayon : bord rouge sombre, cœur clair ; pendant l'alerte, un trait pointillé qui clignote de plus en plus vite
function fxBeamDraw(g, b) {
  const age = fx.bt - b.at, warn = age < b.warn, fade = !warn && age > b.warn + b.fire - 6;
  if (warn && ((age < b.warn - 20 ? age >> 3 : age >> 1) % 2)) return;
  const col = warn ? '#ff4a3a' : '#a8200a', inRoom = (x, y) => x >= FX.X0 && x < FX.X1 && y >= FX.Y0 && y < FX.Y1;
  if (b.kind === 'r') {
    if (warn) { for (const e of [b.a0, b.a1]) for (let i = 4; i < 220; i += 5) { const x = b.ex + Math.cos(e) * i, y = b.ey + Math.sin(e) * i; if (inRoom(x, y)) px(g, e === b.a0 ? col : '#7a2a3a', x, y); } return; }
    const a = fxAng(b), c = Math.cos(a), s = Math.sin(a);
    for (let i = 0; i < 230; i++) { const x = b.ex + c * i, y = b.ey + s * i; if (inRoom(x, y)) px(g, fade ? col : '#c8201a', x - 2, y - 2, 4, 4); }
    if (!fade) for (let i = 0; i < 230; i++) { const x = b.ex + c * i, y = b.ey + s * i; if (inRoom(x, y)) px(g, (i + fx.tick) % 7 < 5 ? '#fff0e0' : '#ff8a6a', x - 1, y - 1, 2, 2); }
    return;
  }
  const h = b.o === 'h', p = Math.round(b.p), w = b.w, lo = h ? FX.X0 : FX.Y0, len = (h ? FX.X1 : FX.Y1) - lo;
  const R = (a, t, cc) => h ? px(g, cc, lo, a, len, t) : px(g, cc, a, lo, t, len);
  if (warn) { for (let i = 0; i < len; i += 4) h ? px(g, col, lo + i, p, 2, 1) : px(g, col, p, lo + i, 1, 2); return; }
  R(p - w / 2 - 1, w + 2, '#5a0a10'); R(p - w / 2, w, fade ? col : '#e8301a');
  if (!fade) { R(p - w / 2 + 1, Math.max(1, w - 2), '#ff8a6a'); R(w > 4 ? p - 1 : p, w > 4 ? 2 : 1, '#fff0e0'); }
  // les étincelles de part et d'autre, qui défilent
  if (!fade) for (let i = (fx.tick * 3) % 9; i < len; i += 9) { const o = p - w / 2 - 3 + ((i >> 2) % 2) * (w + 5); h ? px(g, '#ffd84a', lo + i, o) : px(g, '#ffd84a', o, lo + i); }
}
// un émetteur dans le mur, allumé tant que son rayon vit
function fxEmitter(g, x, y, hot) { px(g, '#14101c', x - 3, y - 3, 7, 7); px(g, hot ? '#ff4a3a' : '#5a5468', x - 2, y - 2, 5, 5); px(g, hot ? '#fff0e0' : '#9a94a8', x - 1, y - 1, 2, 2); }
function fxDraw() {
  const g = fx.g, {W, H, HUD} = FX;
  for (; fx.seen < fx.tick; fx.seen++) if (fx.mode === 'over') fxUpdate();
  g.imageSmoothingEnabled = false;
  // le bandeau du haut, le mur et le sol
  px(g, '#0e0c14', 0, 0, W, HUD); px(g, '#3a3648', 0, HUD, W, H - HUD); px(g, '#4e4a5e', 0, HUD, W, 1);
  for (let x = 4; x < W; x += 16) { px(g, '#2a2836', x, HUD + 2, 1, 4); px(g, '#2a2836', x, H - 6, 1, 4); }
  for (let y = HUD + 12; y < H; y += 16) { px(g, '#2a2836', 2, y, 4, 1); px(g, '#2a2836', W - 6, y, 4, 1); }
  for (let y = FX.Y0; y < FX.Y1; y += 16) for (let x = FX.X0; x < FX.X1; x += 16) g.drawImage(FX_FLOOR, x, y);
  px(g, '#16141e', FX.X0, FX.Y0, FX.X1 - FX.X0, 1); px(g, '#16141e', FX.X0, FX.Y0, 1, FX.Y1 - FX.Y0);
  // les émetteurs des rayons en cours
  for (const b of fx.beams) {
    const hot = fx.bt - b.at >= b.warn || (fx.tick >> 2) % 2;
    if (b.kind === 'r') fxEmitter(g, Math.min(FX.X1 + 3, Math.max(FX.X0 - 4, b.ex)), Math.min(FX.Y1 + 3, Math.max(FX.Y0 - 4, b.ey)), hot);
    else if (b.o === 'h') { fxEmitter(g, FX.X0 - 4, b.p, hot); fxEmitter(g, FX.X1 + 3, b.p, hot); }
    else { fxEmitter(g, b.p, FX.Y0 - 4, hot); fxEmitter(g, b.p, FX.Y1 + 3, hot); }
  }
  if (fx.cell) { const c = FX_CELL[(fx.tick >> 4) % 2]; px(g, '#1e1c28', Math.round(fx.cell.x) - 2, Math.round(fx.cell.y) + 4, 5, 1); g.drawImage(c, Math.round(fx.cell.x) - 2, Math.round(fx.cell.y) - 4 - ((fx.tick >> 5) % 2)); }
  // le robot (il flotte au-dessus de son ombre), puis les rayons par-dessus
  if (fx.mode !== 'over') { const bob = (fx.tick >> 4) % 2, s = FX_SPR[(fx.tick >> 2) % 2][fx.face];
    px(g, '#1e1c28', Math.round(fx.x) - 3, Math.round(fx.y) + 5, 7, 2);
    if (fx.dash > 0) for (let i = 1; i < 4; i++) px(g, '#5a5468', Math.round(fx.x - (fx.face ? -1 : 1) * i * 3) - 2, Math.round(fx.y) - 2, 4, 3);
    g.drawImage(s, Math.round(fx.x) - 5, Math.round(fx.y) - 7 - bob); }
  if (fx.bonus && (fx.bonus.life > 90 || (fx.tick >> 2) % 2)) { const b = fx.bonus, im = FX_BON[b.kind][(fx.tick >> 3) % 2]; px(g, '#1e1c28', Math.round(b.x) - 3, Math.round(b.y) + 5, 7, 1); g.drawImage(im, Math.round(b.x) - (im.width >> 1), Math.round(b.y) - 4 - ((fx.tick >> 4) % 2)); }
  // le bouclier autour du robot, et l'éclat quand il encaisse un rayon
  if (fx.mode !== 'over' && (fx.shield || fx.inv && (fx.tick >> 1) % 2)) { const cx = Math.round(fx.x), cy = Math.round(fx.y) - 2; for (let a = 0; a < 24; a++) { const t = a / 24 * Math.PI * 2 + fx.tick * .05; if (a % 3) px(g, a % 6 ? '#4ac8ff' : '#ffffff', cx + Math.cos(t) * 9, cy + Math.sin(t) * 9); } }
  if (fx.boom) { g.globalAlpha = fx.boom / 20; const r = 30 - fx.boom; for (let a = 0; a < 32; a++) { const t = a / 32 * Math.PI * 2; px(g, '#9ad8ff', fx.x + Math.cos(t) * r, fx.y + Math.sin(t) * r, 2, 2); } g.globalAlpha = 1; }
  fxBossDraw(g);
  for (const b of fx.beams) fxBeamDraw(g, b);
  if (fx.boss) { const k = 1 - fx.boss.t / FX_BDUR, [L] = FX_BOSS[fx.boss.kind].c; px(g, '#0e0c14', 13, FX.H - 5, 102, 4); px(g, L, 14, FX.H - 4, Math.ceil(100 * k), 2); }  // le temps qu'il reste à tenir, dans le mur du bas
  if (fx.banner && fx.mode === 'play') gameText(g, W, [[fx.banner.text, '#ff8a3a', 8], [fx.banner.sub, '#ffffff']], 60);
  if (fx.slow > 0) { g.globalAlpha = .16; px(g, '#7a4aff', FX.X0, FX.Y0, FX.X1 - FX.X0, FX.Y1 - FX.Y0); g.globalAlpha = 1; for (let i = 0; i < 4; i++) { const k = (fx.tick * .6 + i * 28) % 112; px(g, '#b070ff', FX.X0 + k, FX.Y0, 6, 1); px(g, '#b070ff', FX.X1 - k - 6, FX.Y1 - 1, 6, 1); } }
  for (const b of fx.bits) px(g, b.c, b.x, b.y, 2, 2);
  // l'affichage : secondes, piles, élan, points
  pxFont(g, fxSecs() + ' s', 4, 10, '#ffffff', 8);
  g.drawImage(FX_CELL[0], 36, 3); pxFont(g, String(fx.cells), 44, 10, '#9ef07a', 8);
  px(g, '#2a2836', 60, 5, 22, 4); px(g, fx.dashCd ? '#5a5468' : '#ffd84a', 61, 6, Math.round(20 * (1 - fx.dashCd / 110)), 2);
  if (fx.shield) g.drawImage(FX_BON.shield[0], 86, 3);
  if (fx.slow > 0) { g.drawImage(FX_BON.slow[0], 95, 3); px(g, '#b070ff', 95, 11, Math.ceil(5 * fx.slow / 300), 1); }
  pxFont(g, String(fxScore()), W - 4, 10, '#ffd84a', 8, 'right');
  if (fx.mode === 'ready') gameText(g, W, [['FAISCEAUX', '#ff4a3a', 12], ['Flèches : bouger', '#ffffff'], ['Maj ou X : élan', '#ffffff'], ['Pointillés = tir', '#b8b0c8'], ['Record ' + (games.best.faisceaux || 0), '#ffd84a'], ['Espace : jouer', '#b8b0c8']], 48);
  if (fx.mode === 'pause') gameText(g, W, [['PAUSE', '#ffffff', 12], ['Espace : reprendre', '#b8b0c8']], 72);
  if (fx.mode === 'over' && fx.dead > 40) gameText(g, W, [['GRILLÉ !', '#ff4a3a', 12], [fxSecs() + ' s · ' + fx.cells + (fx.cells > 1 ? ' piles' : ' pile'), '#ffffff'], [fx.record ? 'NOUVEAU RECORD !' : 'Record ' + (games.best.faisceaux || 0), '#ffd84a'], [fx.dead > 60 ? 'Espace : recommencer' : '', '#b8b0c8']], 58);
  if (fx.tick % 30 === 0) g.canvas.setAttribute('aria-label', 'Faisceaux : ' + (fx.mode === 'play' ? fxSecs() + (fxSecs() > 1 ? ' secondes, ' : ' seconde, ') + fx.cells + (fx.cells > 1 ? ' piles, ' : ' pile, ') + fx.beams.length + (fx.beams.length > 1 ? ' rayons' : ' rayon') : fx.mode === 'over' ? 'partie finie après ' + fxSecs() + ' secondes' : fx.mode === 'pause' ? 'pause' : 'prêt'));
}
function fxInfo() {
  setTimeout(fxTrophies);
  $('fxStats').replaceChildren(...[['Meilleur score', games.best.faisceaux || 0], ['Parties', fxs.games], ['Piles', fxs.cells], ['Boss vaincus', fxs.bosses || 0], ['Temps survécu', Math.floor(fxs.secs / 60) + ' min ' + (fxs.secs % 60) + ' s']].flatMap(([a, b]) => [el('span', '', a), el('b', '', String(b))]));
}
function fxStart() {
  if (fx.mode === 'ready' || fx.mode === 'pause') fx.mode = 'play';
  else if (fx.mode === 'over' && fx.dead > 60) { fxNew(); fx.mode = 'play'; }
}
const FX_MOVE = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'z', 'q', 's', 'd', 'w', 'a'];
document.addEventListener('keydown', e => {
  if (!view.classList.contains('on') || !fx || /INPUT|SELECT|TEXTAREA/.test(e.target.tagName)) return;
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (FX_MOVE.includes(k)) { e.preventDefault(); fx.keys.add(k); if (fx.mode === 'ready') fxStart(); }
  if (k === ' ' || k === 'Enter') { e.preventDefault(); if (!e.repeat) fxStart(); }
  if (k === 'Shift' || k === 'x') fxDash();
  if ((k === 'p' || k === 'Escape') && fx.mode === 'play') { fx.mode = 'pause'; fx.keys.clear(); }
});
document.addEventListener('keyup', e => { if (fx) fx.keys.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key); });
// à la souris ou au doigt : le robot suit le pointeur tant qu'on appuie ; deux appuis rapides = élan
{ const cv = $('fxCanvas'), at = e => { const r = cv.getBoundingClientRect(); return {x: (e.clientX - r.left) / r.width * FX.W, y: (e.clientY - r.top) / r.height * FX.H}; };
  cv.onpointerdown = e => { e.preventDefault(); if (!fx) return; if (fx.mode !== 'play') return fxStart(); if (performance.now() - (fx.lastTap || 0) < 280) fxDash(); fx.lastTap = performance.now(); fx.ptr = at(e); cv.setPointerCapture(e.pointerId); };
  cv.onpointermove = e => { if (fx?.ptr) fx.ptr = at(e); };
  cv.onpointerup = cv.onpointercancel = () => { if (fx) fx.ptr = null; }; }
$('fxNew').onclick = () => { fxNew(); $('fxNew').blur(); };
$('fxFs').onclick = () => { $('fxFs').blur(); try { if (document.fullscreenElement) document.exitFullscreen(); else $('fxCanvas').parentElement.requestFullscreen?.().catch(() => {}); } catch {} };
function fxCheck() {  // vérification : les rayons touchent ce qu'ils doivent, la grille laisse toujours un passage d'au moins 12 px, le bouclier encaisse un rayon, le ralenti freine les rayons
  const keep = fx, kb = fxBeep, ks = {...fxs}, kbest = games.best.faisceaux, bad = []; fxBeep = () => {}; fx = null; fxNew(); fx.t = 6000;
  const h = {o: 'h', p: 60, w: 4}, ray = {ex: 8, ey: 78, w: 4};
  const lineOk = fxLineHit(h, 80, 61) && !fxLineHit(h, 80, 70), rayOk = fxRayHit(ray, 100, 78, 0) && !fxRayHit(ray, 100, 96, 0) && !fxRayHit(ray, 0, 78, 0);
  let gridOk = true;
  for (let i = 0; i < 300; i++) { fx.beams = []; fx.rnd = seeded(i); fx.x = 64; fx.y = 78; fxSpawn(); const ls = fx.beams.filter(b => b.kind !== 'r');
    if (ls.length > 2) { const lo = ls[0].o === 'h' ? FX.Y0 : FX.X0; let free = 0, most = 0; for (let p = lo; p < lo + FX.X1 - FX.X0; p++) { if (ls.some(b => Math.abs(p - b.p) < b.w / 2 + FX.R)) free = 0; else most = Math.max(most, ++free); } if (most < 12) gridOk = false; } }
  if (!lineOk) bad.push('ligne'); if (!rayOk) bad.push('balayage'); if (!gridOk) bad.push('grille');
  // un rayon horizontal sur le robot : avec le bouclier il passe, sans il grille
  const fire = () => { fx.beams = [{kind: 'h', o: 'h', p: fx.y, w: 4, warn: 0, fire: 30, at: fx.bt}]; fx.next = 999; fx.bonusT = fx.cellT = 999; fxUpdate(); };
  fx.mode = 'play'; fx.rnd = seeded(1); fxBonus('shield'); fire(); if (fx.mode !== 'play' || fx.shield || !fx.inv) bad.push('bouclier'); fx.inv = 0; fire(); if (fx.mode !== 'over') bad.push('sans bouclier');
  fxNew(); fx.mode = 'play'; fx.next = fx.bonusT = fx.cellT = 999; fxBonus('slow'); const t0 = fx.bt; for (let i = 0; i < 10; i++) fxUpdate(); if (fx.bt - t0 !== 5 || fx.slow !== 290) bad.push('ralenti');
  fx.bonus = {x: fx.x, y: fx.y, kind: 'shield', life: 100}; fxUpdate(); if (!fx.shield || fx.bonus) bad.push('ramasser');
  // les boss : il arrive à 45 s et coupe les rayons ordinaires ; le Prisme fait tourner trois rayons ; tenu 20 s, il rapporte ses points
  fxNew(); fx.mode = 'play'; fx.t = 45 * 60; fx.next = 1; fx.bonusT = fx.cellT = 1e9; fx.x = FX.X0 + 6; fx.y = FX.Y0 + 6; fx.inv = 1e9; fxUpdate();
  if (fx.boss?.kind !== 0) bad.push('pas de boss à 45 s'); for (let i = 0; i < 200; i++) fxUpdate(); if (!fx.beams.length || fx.beams.some(b => b.kind === 'r' && Math.abs(b.ex - (FX.X0 + FX.X1) / 2) > 1)) bad.push('le Projecteur ne vise pas');
  for (let i = 0; i < FX_BDUR; i++) fxUpdate(); if (fx.boss || fx.bossWins !== 1 || fxScore() < 250) bad.push('boss vaincu ' + fx.bossWins + ' ' + fxScore());
  fx.boss = {kind: 1, n: 1, t: 0}; fx.beams = []; for (let i = 0; i < 300; i++) fxUpdate(); const pr = fx.beams.filter(b => b.kind === 'r');
  if (pr.length !== 3) bad.push('Prisme : ' + pr.length + ' rayons'); else { const a1 = fxAng(pr[0]); fxUpdate(); fxUpdate(); if (fxAng(pr[0]) === a1) bad.push('les rayons du Prisme ne tournent pas'); }
  fx.inv = 0; fx.shield = false; const [px0, py0] = fxBossXY(); fx.x = px0 + 3; fx.y = py0; fxUpdate(); if (fx.mode !== 'over') bad.push('toucher le Prisme');
  fxBeep = kb; Object.assign(fxs, ks); if (kbest === undefined) delete games.best.faisceaux; else games.best.faisceaux = kbest; fx = keep;
  return bad.length ? bad.join(', ') : 'ok';
}
{ const c = fxCheck(); console.assert(c === 'ok', 'faisceaux', c); }
$('fxCanvas').__fx = {st: () => fx, check: fxCheck, bonus: k => fxBonus(k), FX};

// les trophées, tirés des statistiques et des records gardés (aussi à l'ouverture : ce qui a été fait avant compte)
function fxTrophies() {
  const b = games.best.faisceaux, sig = [b, fxs.games, fxs.cells, fxs.bosses, fxs.longest].join(); if (sig === fxTrophies.sig) return; fxTrophies.sig = sig;
  trophyRecord('score', b || null);
  if (fxs.games >= 1) trophy('premier'); if (fxs.longest >= 60) trophy('m1'); if (fxs.longest >= 180) trophy('m3');
  if (fxs.bosses >= 1) trophy('boss'); if (fxs.bosses >= 10) trophy('boss10'); if (fxs.cells >= 200) trophy('cellules'); if (b >= 2000) trophy('s2000');
}
ctx.onOpen(() => {
  if (!fx || !fx.g) { fxNew(); fx.g = $('fxCanvas').getContext('2d'); }
  gameLoop(fx, 'faisceaux', fxUpdate, fxDraw); fxInfo();
});
}

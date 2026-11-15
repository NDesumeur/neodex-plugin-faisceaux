// lancé par le test « local » de NeoDex : la vérification interne (rayons, grille, bouclier, ralenti), une partie qui avance,
// un bouclier puis un ralenti ramassés, le plein écran et la place prise (avec NEO_SHOTS : garde des images du jeu)
module.exports = async ({ pj, sleep }) => {
  const C = code => pj(`(() => { const T = document.getElementById('fxCanvas').__fx, fx = T.st(); ${code} })()`);
  const key = (type, k) => pj(`document.dispatchEvent(new KeyboardEvent('${type}', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('fxCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('fxCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'faisceaux-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await pj(`window.__e = []; addEventListener('error', e => __e.push(e.message)); 0`);
  const chk = await C('return T.check();'); if (chk !== 'ok') throw new Error('vérification : ' + chk);
  await pj(`document.getElementById('fxNew').click(), 0`); await shot('0-depart');
  await key('keydown', ' '); await key('keyup', ' ');
  await key('keydown', 'ArrowLeft'); await sleep(400); await key('keyup', 'ArrowLeft');
  await sleep(1300); await shot('1-alerte');
  const first = await label();
  const s = +(/(\d+) seconde/.exec(first) || [])[1];
  if (!(s >= 1)) throw new Error('la partie n\'avance pas : « ' + first + ' »');
  // un bouclier posé sous le robot, puis un ralenti
  await C(`fx.bonus = {x: fx.x, y: fx.y, kind: 'shield', life: 300}; return 0;`); await sleep(150);
  if (!await C('return fx.shield;')) throw new Error('le bouclier devait être ramassé');
  await C(`fx.bonus = {x: fx.x + 30, y: fx.y, kind: 'slow', life: 300}; return 0;`); await sleep(80); await shot('2-bonus');
  await C(`fx.bonus = {x: fx.x, y: fx.y, kind: 'slow', life: 300}; return 0;`); await sleep(400);
  if (!(await C('return fx.slow;') > 0)) throw new Error('le ralenti devait commencer'); await shot('3-ralenti');
  if (process.env.NEO_SHOTS) { await sleep(1500); await shot('4-tir'); }
  await C(`fx.shield = false; fx.slow = 0; fx.inv = 0; return 0;`); await sleep(9000);
  if (process.env.NEO_SHOTS) await shot('5-fin');
  const errs = await pj(`window.__e.join(' | ')`); if (errs) throw new Error('erreur : ' + errs);
  // plein écran, et la zone de jeu qui tient dans la fenêtre
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(200);
  await pj(`document.getElementById('fxFs').click(), 0`); await sleep(700);
  const fs = await pj(`(() => { const c = document.getElementById('fxCanvas'), r = c.getBoundingClientRect(); return document.fullscreenElement === c.parentElement && (Math.abs(r.height - innerHeight) < 3 || Math.abs(r.width - innerWidth) < 3); })()`);
  await pj(`document.fullscreenElement && document.exitFullscreen(), 0`); await sleep(300);
  if (!fs) throw new Error('le plein écran ne remplit pas l\'écran');
  const L = await pj(`(() => { const r = document.getElementById('fxCanvas').getBoundingClientRect(); let s = 0; for (let e = document.getElementById('fxCanvas').parentElement; e; e = e.parentElement) s += e.scrollTop; return { bottom: Math.round(r.bottom + s), h: Math.round(r.height), wh: innerHeight, ww: innerWidth, sw: document.documentElement.scrollWidth }; })()`);
  if (process.env.NEO_FIT_LOG) console.log('FIT', JSON.stringify(L));
  if (L.bottom > L.wh + 1 || L.sw > L.ww + 1 || L.h < 300) throw new Error('la zone de jeu dépasse la fenêtre ou reste petite : ' + JSON.stringify(L));
  return 'vérification ok · ' + first + ' · bouclier · ralenti · plein écran · ' + L.h + ' px dans ' + L.ww + '×' + L.wh;
};

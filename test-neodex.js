// lancé par le test « local » de NeoDex : part, bouge le robot et vérifie que la partie avance
// (avec NEO_SHOTS : garde des images du jeu, sans la teinte du thème : alerte, tir, fin)
module.exports = async ({ pj, sleep }) => {
  const key = (type, k) => pj(`document.dispatchEvent(new KeyboardEvent('${type}', {key: '${k}', bubbles: true})), 0`);
  const label = () => pj(`document.getElementById('fxCanvas').getAttribute('aria-label')`);
  const shot = async n => { if (!process.env.NEO_SHOTS) return; const d = await pj(`document.getElementById('fxCanvas').toDataURL()`); require('fs').writeFileSync(require('path').join(process.env.NEO_SHOTS, 'faisceaux-' + n + '.png'), Buffer.from(d.split(',')[1], 'base64')); };
  await shot('0-depart');
  await key('keydown', ' '); await key('keyup', ' ');
  await key('keydown', 'ArrowLeft'); await sleep(400); await key('keyup', 'ArrowLeft');
  await sleep(1300); await shot('1-alerte');
  const first = await label();
  if (process.env.NEO_SHOTS) { await sleep(1100); await shot('2-tir'); await sleep(900); await shot('3-tir'); await sleep(9000); await shot('4-fin'); }
  const s = +(/(\d+) seconde/.exec(first) || [])[1];
  if (!(s >= 1)) throw new Error('la partie n\'avance pas : « ' + first + ' »');
  return first;
};

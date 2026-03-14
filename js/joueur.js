async function loadData() {
  const res = await fetch('data/joueurs.json');
  return res.json();
}
function getParam(name) { return new URLSearchParams(location.search).get(name); }
function badgeLevel(player) {
  const lows = ['confiance','regulation','engagement','stabilite'].filter(k => player[k] < 40).length;
  if (player.score_global < 45 || lows >= 2) return 'Alerte rouge';
  if (player.score_global < 55 || ['confiance','regulation','engagement','stabilite'].some(k => player[k] < 45)) return 'Alerte orange';
  return 'Zone stable';
}
(async function init() {
  const data = await loadData();
  const id = getParam('id') || data.equipes[0].joueurs[0].id;
  let teamName = '';
  let player = null;
  data.equipes.forEach(team => {
    const found = team.joueurs.find(j => j.id === id);
    if (found) { player = found; teamName = team.nom; }
  });
  if (!player) return;

  document.getElementById('player-title').textContent = `${player.prenom} ${player.nom}`;
  document.getElementById('player-subtitle').textContent = `${teamName} · ${player.profil_nom}`;
  document.getElementById('player-kpis').innerHTML = `
    <article class="kpi-card"><p class="eyebrow">Score global</p><div class="kpi-value">${player.score_global}</div><div class="kpi-sub">Indice mental</div></article>
    <article class="kpi-card"><p class="eyebrow">Confiance</p><div class="kpi-value">${player.confiance}</div><div class="kpi-sub">Sentiment de capacité</div></article>
    <article class="kpi-card"><p class="eyebrow">Régulation</p><div class="kpi-value">${player.regulation}</div><div class="kpi-sub">Gestion émotionnelle</div></article>
    <article class="kpi-card"><p class="eyebrow">Stabilité</p><div class="kpi-value">${player.stabilite}</div><div class="kpi-sub">Tenue dans la durée</div></article>
  `;
  drawRadar(document.getElementById('player-radar'), ['Confiance','Régulation','Engagement','Stabilité'], [player.confiance, player.regulation, player.engagement, player.stabilite]);
  document.getElementById('player-summary').innerHTML = `
    <p><strong>Profil :</strong> ${player.profil_nom}</p>
    <p><strong>Niveau d’alerte :</strong> ${badgeLevel(player)}</p>
    <p><strong>Lecture coach :</strong> ${player.profil_nom === 'Mobilisation forte mais régulation fluctuante' ? 'Énergie et implication fortes, mais régulation à stabiliser dans les moments de pression.' : 'Base mentale plutôt structurée avec des leviers à entretenir.'}</p>
    <p><strong>Action recommandée :</strong> ${player.regulation < 50 ? 'Installer une routine respiratoire, un recentrage entre actions et un débrief ciblé sur la gestion émotionnelle.' : 'Consolider la confiance et maintenir les repères de performance.'}</p>
  `;
})();

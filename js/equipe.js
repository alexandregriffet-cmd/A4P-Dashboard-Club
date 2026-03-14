async function loadData() {
  const res = await fetch('data/joueurs.json');
  return res.json();
}
function avg(items, key) { return Math.round(items.reduce((sum, item) => sum + item[key], 0) / items.length); }
function getParam(name) { return new URLSearchParams(location.search).get(name); }
function badgeLevel(player) {
  const lows = ['confiance','regulation','engagement','stabilite'].filter(k => player[k] < 40).length;
  if (player.score_global < 45 || lows >= 2) return ['Rouge','red'];
  if (player.score_global < 55 || ['confiance','regulation','engagement','stabilite'].some(k => player[k] < 45)) return ['Orange','orange'];
  return ['Vert','green'];
}
(async function init() {
  const data = await loadData();
  const teamName = getParam('team') || data.equipes[0].nom;
  const team = data.equipes.find(t => t.nom === teamName) || data.equipes[0];
  const players = team.joueurs;
  const summary = {
    score: avg(players, 'score_global'),
    confiance: avg(players, 'confiance'),
    regulation: avg(players, 'regulation'),
    engagement: avg(players, 'engagement'),
    stabilite: avg(players, 'stabilite')
  };
  document.getElementById('team-title').textContent = team.nom;
  document.getElementById('team-subtitle').textContent = `${team.coach} · ${players.length} joueurs · score moyen ${summary.score}/100`;
  document.getElementById('team-kpis').innerHTML = `
    <article class="kpi-card"><p class="eyebrow">Score équipe</p><div class="kpi-value">${summary.score}</div><div class="kpi-sub">Indice mental moyen</div></article>
    <article class="kpi-card"><p class="eyebrow">Confiance</p><div class="kpi-value">${summary.confiance}</div><div class="kpi-sub">Moyenne collective</div></article>
    <article class="kpi-card"><p class="eyebrow">Régulation</p><div class="kpi-value">${summary.regulation}</div><div class="kpi-sub">Axe mental sensible</div></article>
    <article class="kpi-card"><p class="eyebrow">Engagement</p><div class="kpi-value">${summary.engagement}</div><div class="kpi-sub">Ressource collective</div></article>
  `;
  drawRadar(document.getElementById('team-detail-radar'), ['Confiance','Régulation','Engagement','Stabilité'], [summary.confiance, summary.regulation, summary.engagement, summary.stabilite]);

  const profiles = {};
  players.forEach(p => profiles[p.profil_nom] = (profiles[p.profil_nom] || 0) + 1);
  document.getElementById('team-profiles').innerHTML = Object.entries(profiles).sort((a,b)=>b[1]-a[1]).map(([name,count]) => `<div class="stack-item"><span>${name}</span><strong>${count}</strong></div>`).join('');

  document.getElementById('players-table').innerHTML = players.map(p => {
    const [level, klass] = badgeLevel(p);
    return `<tr>
      <td><a href="joueur.html?id=${p.id}"><strong>${p.prenom} ${p.nom}</strong></a></td>
      <td>${p.score_global}</td>
      <td>${p.confiance}</td>
      <td>${p.regulation}</td>
      <td>${p.engagement}</td>
      <td>${p.stabilite}</td>
      <td>${p.profil_nom}</td>
      <td><span class="badge ${klass}">${level}</span></td>
    </tr>`;
  }).join('');
})();

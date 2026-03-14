async function loadData() {
  const res = await fetch('data/joueurs.json');
  return res.json();
}

function avg(items, key) {
  return Math.round(items.reduce((sum, item) => sum + item[key], 0) / items.length);
}

function dominantProfile(players) {
  const counts = {};
  players.forEach((p) => counts[p.profil_nom] = (counts[p.profil_nom] || 0) + 1);
  return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || '—';
}

function teamSummary(team) {
  const players = team.joueurs;
  return {
    team: team.nom,
    count: players.length,
    score: avg(players, 'score_global'),
    confiance: avg(players, 'confiance'),
    regulation: avg(players, 'regulation'),
    engagement: avg(players, 'engagement'),
    stabilite: avg(players, 'stabilite'),
    profil: dominantProfile(players)
  };
}

function badgeLevel(player) {
  const lows = ['confiance','regulation','engagement','stabilite'].filter(k => player[k] < 40).length;
  if (player.score_global < 45 || lows >= 2) return 'Rouge';
  if (player.score_global < 55 || ['confiance','regulation','engagement','stabilite'].some(k => player[k] < 45)) return 'Orange';
  return 'Vert';
}

function weakestDimension(player) {
  const entries = [
    ['Confiance', player.confiance],
    ['Régulation', player.regulation],
    ['Engagement', player.engagement],
    ['Stabilité', player.stabilite]
  ];
  return entries.sort((a,b) => a[1]-b[1])[0][0];
}

function renderKpis(data, teamSummaries) {
  const players = data.equipes.flatMap(t => t.joueurs);
  const globalScore = Math.round(teamSummaries.reduce((s,t) => s + t.score, 0) / teamSummaries.length);
  const alertCount = players.filter(p => badgeLevel(p) !== 'Vert').length;
  const strongDim = ['confiance','regulation','engagement','stabilite']
    .map(k => [k, Math.round(players.reduce((s,p) => s + p[k], 0) / players.length)])
    .sort((a,b) => b[1]-a[1])[0];
  const weakDim = ['confiance','regulation','engagement','stabilite']
    .map(k => [k, Math.round(players.reduce((s,p) => s + p[k], 0) / players.length)])
    .sort((a,b) => a[1]-b[1])[0];

  document.getElementById('kpi-grid').innerHTML = `
    <article class="kpi-card"><p class="eyebrow">Score global club</p><div class="kpi-value">${globalScore}/100</div><div class="kpi-sub">${players.length} joueurs testés</div></article>
    <article class="kpi-card"><p class="eyebrow">Équipes actives</p><div class="kpi-value">${data.equipes.length}</div><div class="kpi-sub">Vue staff centralisée</div></article>
    <article class="kpi-card"><p class="eyebrow">Ressource dominante</p><div class="kpi-value" style="font-size:36px">${strongDim[0]}</div><div class="kpi-sub">Moyenne ${strongDim[1]}/100</div></article>
    <article class="kpi-card"><p class="eyebrow">Alertes</p><div class="kpi-value">${alertCount}</div><div class="kpi-sub">Joueurs à surveiller</div></article>
  `;
}

function renderTeamSelect(data, teamSummaries) {
  const select = document.getElementById('team-select');
  select.innerHTML = data.equipes.map((team, i) => `<option value="${i}">${team.nom}</option>`).join('');
  const refresh = () => {
    const idx = Number(select.value || 0);
    const summary = teamSummaries[idx];
    drawRadar(document.getElementById('team-radar'), ['Confiance','Régulation','Engagement','Stabilité'], [summary.confiance, summary.regulation, summary.engagement, summary.stabilite]);
    const team = data.equipes[idx];
    const counts = {};
    team.joueurs.forEach(p => counts[p.profil_nom] = (counts[p.profil_nom] || 0) + 1);
    document.getElementById('profile-distribution').innerHTML = Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([name,count]) => `<div class="stack-item"><span>${name}</span><strong>${count} joueur(s)</strong></div>`).join('');
    const weak = ['Confiance','Régulation','Engagement','Stabilité'][[summary.confiance, summary.regulation, summary.engagement, summary.stabilite].indexOf(Math.min(summary.confiance, summary.regulation, summary.engagement, summary.stabilite))];
    document.getElementById('team-alerts').innerHTML = `<strong>Lecture staff :</strong> ${team.nom} présente un profil collectif dominant « ${summary.profil} ». Le levier prioritaire à travailler est <strong>${weak}</strong>.`;
  };
  select.addEventListener('change', refresh);
  refresh();
}

function renderTeamsTable(teamSummaries) {
  document.getElementById('teams-table').innerHTML = teamSummaries.map(team => `
    <tr>
      <td><a href="equipe.html?team=${encodeURIComponent(team.team)}"><strong>${team.team}</strong></a></td>
      <td>${team.count}</td>
      <td>${team.score}/100</td>
      <td>${team.confiance}</td>
      <td>${team.regulation}</td>
      <td>${team.engagement}</td>
      <td>${team.stabilite}</td>
      <td>${team.profil}</td>
    </tr>
  `).join('');
}

function renderAlertsTable(data) {
  const rows = data.equipes.flatMap(team => team.joueurs.map(player => ({team: team.nom, player})))
    .filter(entry => badgeLevel(entry.player) !== 'Vert');

  document.getElementById('alerts-table').innerHTML = rows.map(({team, player}) => {
    const level = badgeLevel(player);
    const recommendation = level === 'Rouge'
      ? 'Entretien individuel + routine de stabilisation'
      : 'Travail ciblé sur la dimension faible';
    return `
      <tr>
        <td><a href="joueur.html?id=${player.id}">${player.prenom} ${player.nom}</a></td>
        <td>${team}</td>
        <td>${player.score_global}/100</td>
        <td>${weakestDimension(player)}</td>
        <td><span class="badge ${level === 'Rouge' ? 'red' : 'orange'}">${level}</span></td>
        <td>${recommendation}</td>
      </tr>
    `;
  }).join('');
}

function attachButtons() {
  document.getElementById('btn-refresh').addEventListener('click', () => window.location.reload());
  document.getElementById('btn-reset').addEventListener('click', () => {
    localStorage.removeItem('a4p_hub_results');
    alert('Hub local réinitialisé.');
  });
}

(async function init() {
  const data = await loadData();
  const teamSummaries = data.equipes.map(teamSummary);
  renderKpis(data, teamSummaries);
  renderTeamSelect(data, teamSummaries);
  renderTeamsTable(teamSummaries);
  renderAlertsTable(data);
  document.getElementById('json-view').textContent = JSON.stringify(data, null, 2);
  attachButtons();
})();

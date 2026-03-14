function drawRadar(canvas, labels, values, options = {}) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  ctx.clearRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2 + 10;
  const radius = Math.min(width, height) * 0.32;
  const levels = 5;
  const stroke = options.stroke || '#2f4d83';
  const fill = options.fill || 'rgba(47,77,131,.16)';
  const grid = '#cfd7e6';
  const axis = '#9fb0cb';
  const labelColor = '#274679';
  const font = options.font || '700 18px Arial';

  ctx.lineWidth = 1;
  for (let level = levels; level >= 1; level--) {
    const r = radius * (level / levels);
    ctx.beginPath();
    labels.forEach((_, i) => {
      const angle = (-Math.PI / 2) + (i * (Math.PI * 2 / labels.length));
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.strokeStyle = grid;
    ctx.stroke();
  }

  labels.forEach((label, i) => {
    const angle = (-Math.PI / 2) + (i * (Math.PI * 2 / labels.length));
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = axis;
    ctx.stroke();

    const labelX = centerX + Math.cos(angle) * (radius + 52);
    const labelY = centerY + Math.sin(angle) * (radius + 52);
    ctx.font = font;
    ctx.fillStyle = labelColor;
    ctx.textAlign = Math.cos(angle) > 0.4 ? 'left' : (Math.cos(angle) < -0.4 ? 'right' : 'center');
    ctx.textBaseline = Math.sin(angle) > 0.6 ? 'top' : (Math.sin(angle) < -0.6 ? 'bottom' : 'middle');
    ctx.fillText(label, labelX, labelY);
  });

  ctx.beginPath();
  values.forEach((value, i) => {
    const pct = Math.max(0, Math.min(100, value)) / 100;
    const r = radius * pct;
    const angle = (-Math.PI / 2) + (i * (Math.PI * 2 / labels.length));
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 4;
  ctx.stroke();

  values.forEach((value, i) => {
    const pct = Math.max(0, Math.min(100, value)) / 100;
    const r = radius * pct;
    const angle = (-Math.PI / 2) + (i * (Math.PI * 2 / labels.length));
    const x = centerX + Math.cos(angle) * r;
    const y = centerY + Math.sin(angle) * r;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fillStyle = stroke;
    ctx.fill();
  });
}

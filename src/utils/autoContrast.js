export function wcagTextColor(bg) {
  const m = bg.match(/\d+(\.\d+)?/g);
  if (!m) return '#111'; // fallback
  const [r, g, b] = m.map(Number);
  const L = v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const Y = 0.2126 * L(r) + 0.7152 * L(g) + 0.0722 * L(b);
  const contrast = (L1, L2) => {
    const bright = Math.max(L1, L2) + 0.05;
    const dark = Math.min(L1, L2) + 0.05;
    return bright / dark;
  };
  // Pick the better of black/white (both meet AA for body text; no loop needed)
  const white = contrast(Y, 1) >= contrast(Y, 0);
  return white ? '#fff' : '#111';
}

export function applyAutoContrast(root = document) {
  const getEffectiveBG = (el) => {
    let e = el;
    while (e) {
      const bg = getComputedStyle(e).backgroundColor;
      // rgba(a) with alpha 0 or keyword transparent
      if (bg && !/rgba?\(0,\s*0,\s*0(?:,\s*0)?\)|transparent/i.test(bg)) return bg;
      e = e.parentElement;
    }
    return 'rgb(255,255,255)'; // default page background
  };

  root.querySelectorAll('.auto-contrast').forEach(el => {
    el.style.color = wcagTextColor(getEffectiveBG(el));
  });
}


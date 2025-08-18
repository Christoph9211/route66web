export function wcagTextColor(bg) {
  const m = bg.match(/\d+(\.\d+)?/g);
  if (!m) return '#111'; // fallback
  const [r, g, b] = m.map(Number);
  const L = v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  const Y = 0.2126 * L(r) + 0.7152 * L(g) + 0.0722 * L(b);

/**
 * Calculate the contrast ratio between two relative luminance values.
 * @param {number} L1 - The relative luminance of the first color.
 * @param {number} L2 - The relative luminance of the second color.
 * @return {number} The contrast ratio between the two colors.
 */
  const contrast = (L1, L2) => {
    const bright = Math.max(L1, L2) + 0.05;
    const dark = Math.min(L1, L2) + 0.05;
    return bright / dark;
  };
  // Pick the better of black/white (both meet AA for body text; no loop needed)
  const white = contrast(Y, 1) >= contrast(Y, 0);
  return white ? '#fff' : '#111';
}

/**
 * Applies auto contrast to all elements with the class 'auto-contrast'.
 * This function calculates the color contrast between the background color
 * of an element and a white or black color based on the Web Content Accessibility
 * Guidelines (WCAG) and applies that color to the element's text color.
 * 
 * @param {HTMLElement} [root=document] - The root element to start the search
 * from. Defaults to the entire document.
 */
export function applyAutoContrast(root = document) {

  /**
   * Returns the effective background color of an element by traversing the 
   * parent elements until a non-transparent background color is found. If no
   * non-transparent background color is found, the default page background 
   * color (white) is returned.
   *
   * @param {HTMLElement} el - The element to start the search from.
   * @return {string} The effective background color of the element.
   */
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


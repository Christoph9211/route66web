export function wcagContrastColor(bg) {
    const [r, g, b] = bg.match(/\d+/g).map(Number)
    const L = (v) => {
        v /= 255
        return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4
    }
    const luminance = 0.2126 * L(r) + 0.7152 * L(g) + 0.0722 * L(b)

    const contrast = (L1, L2) => {
        const bright = Math.max(L1, L2) + 0.05
        const dark = Math.min(L1, L2) + 0.05
        return bright / dark
    }

    const whiteContrast = contrast(luminance, 1)
    const blackContrast = contrast(luminance, 0)

    if (whiteContrast >= 4.5 && whiteContrast > blackContrast) return '#fff'
    if (blackContrast >= 4.5 && blackContrast >= whiteContrast) return '#111'

    let cr, cg, cb
    if (whiteContrast > blackContrast) {
        cr = cg = cb = 255
        let step = -1
        while (
            contrast(
                luminance,
                0.2126 * L(cr) + 0.7152 * L(cg) + 0.0722 * L(cb)
            ) < 4.5
        ) {
            cr = Math.max(0, cr + step)
            cg = Math.max(0, cg + step)
            cb = Math.max(0, cb + step)
        }
    } else {
        cr = cg = cb = 17
        let step = 1
        while (
            contrast(
                luminance,
                0.2126 * L(cr) + 0.7152 * L(cg) + 0.0722 * L(cb)
            ) < 4.5
        ) {
            cr = Math.min(255, cr + step)
            cg = Math.min(255, cg + step)
            cb = Math.min(255, cb + step)
        }
    }
    return `rgb(${cr},${cg},${cb})`
}

export function applyAutoContrast() {
    document.querySelectorAll('.auto-contrast').forEach((el) => {
        let bg = getComputedStyle(el).backgroundColor
        if (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent') {
            bg = getComputedStyle(el.parentElement).backgroundColor
        }
        el.style.color = wcagContrastColor(bg)
    })
}

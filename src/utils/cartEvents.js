export function initCartButtonListener() {
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart')
        if (!btn) return
        const detail = {
            productId: btn.dataset.productId,
            variantId: btn.dataset.variantId,
            name: btn.dataset.name,
            image: btn.dataset.image,
            unitPrice: parseFloat(btn.dataset.price),
            currency: btn.dataset.currency,
            qty: 1,
        }
        window.dispatchEvent(new CustomEvent('cart:add', { detail }))
    })
}

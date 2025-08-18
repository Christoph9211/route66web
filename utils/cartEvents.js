/**
 * Initializes a listener on the document for click events on elements
 * with a class of 'add-to-cart'. When such an element is clicked, an
 * event is dispatched with the product details, such as the product
 * ID, variant ID, name, image, unit price, currency, and quantity.
 * The event is named 'cart:add'.
 */
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

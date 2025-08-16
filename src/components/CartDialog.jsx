import React from 'react'
import { useCart } from '../hooks/useCart'

export default function CartDialog() {
    const { cart, isPageOpen, closeCartPage } = useCart()

    if (!isPageOpen) return null

    const handleRemove = (variantId) => {
        window.dispatchEvent(
            new CustomEvent('cart:remove', { detail: { variantId } })
        )
    }

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            id="cart-panel"
            className="fixed inset-0 z-50 grid place-items-center p-4"
        >
            <div
                className="absolute inset-0 bg-black/50"
                onClick={closeCartPage}
                aria-hidden="true"
            />
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="flex items-center justify-between">
                    <h2 id="cart-title" className="text-xl font-bold">
                        Your Cart
                    </h2>
                    <button
                        onClick={closeCartPage}
                        className="rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        aria-label="Close cart"
                    >
                        <span aria-hidden>×</span>
                    </button>
                </div>
                {cart.items.length === 0 ? (
                    <p className="mt-4 text-slate-700">Your cart is empty.</p>
                ) : (
                    <div className="mt-4 grid gap-4">
                        {cart.items.map((item) => (
                            <div
                                key={item.variantId}
                                className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3"
                            >
                                <div>
                                    <p className="font-semibold">{item.name}</p>
                                    <p className="text-sm text-slate-600">
                                        Qty: {item.qty}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold">
                                        $
                                        {(item.unitPrice * item.qty).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() =>
                                            handleRemove(item.variantId)
                                        }
                                        className="mt-2 text-sm underline underline-offset-4"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">Subtotal</p>
                            <p className="font-bold">
                                ${cart.subtotal.toFixed(2)}
                            </p>
                        </div>
                        <button
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                            aria-label="Proceed to checkout"
                        >
                            Checkout
                        </button>
                        <p className="text-xs text-slate-600">
                            Secure checkout and age verification applied at
                            payment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

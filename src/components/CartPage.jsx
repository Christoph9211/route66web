import React from 'react'
import { useCart } from '../hooks/useCart'

/**
 * Renders the cart page.
 *
 * @return {JSX.Element|null} The cart page component or null if the page is not open.
 */
export default function CartPage() {
    const { cart, isPageOpen, closeCartPage, removeItem } = useCart()

    if (!isPageOpen) return null

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
                aria-hidden
            />
            <div className="relative w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-4 shadow-xl dark:border-gray-700 dark:bg-gray-800">
                <div className="flex items-center justify-between">
                    <h2
                        id="cart-title"
                        className="text-xl font-bold dark:text-white"
                    >
                        Your Cart
                    </h2>
                    <button
                        onClick={closeCartPage}
                        className="rounded-xl border border-slate-300 p-2 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 dark:border-gray-600"
                        aria-label="Close cart"
                    >
                        <span aria-hidden="true">✕</span>
                    </button>
                </div>
                {cart.items.length === 0 ? (
                    <p className="mt-4 text-slate-700 dark:text-gray-300">
                        Your cart is empty.
                    </p>
                ) : (
                    <div className="mt-4 grid gap-4">
                        {cart.items.map((item) => (
                            <div
                                key={item.variantId}
                                className="flex items-start justify-between gap-3 border-b border-slate-200 pb-3 dark:border-gray-700"
                            >
                                <div>
                                    <p className="font-semibold dark:text-white">
                                        {item.name}
                                    </p>
                                    <p className="text-sm text-slate-600 dark:text-gray-400">
                                        Qty: {item.qty}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="font-semibold dark:text-white">
                                        $
                                        {(item.unitPrice * item.qty).toFixed(2)}
                                    </p>
                                    <button
                                        onClick={() =>
                                            removeItem(item.variantId)
                                        }
                                        className="mt-2 text-sm underline underline-offset-4 dark:text-red-400"
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                        <div className="flex items-center justify-between">
                            <p className="font-semibold dark:text-white">
                                Subtotal
                            </p>
                            <p className="font-bold dark:text-white">
                                ${cart.subtotal.toFixed(2)}
                            </p>
                        </div>
                        <button
                            className="inline-flex w-full items-center justify-center rounded-2xl bg-emerald-700 px-5 py-3 font-semibold text-white shadow hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2"
                        >
                            Checkout
                        </button>
                        <p className="text-xs text-slate-600 dark:text-gray-400">
                            Secure checkout and age verification applied at
                            payment.
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

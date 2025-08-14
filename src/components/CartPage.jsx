import React from 'react'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
    const { cart, isPageOpen, closeCartPage } = useCart()

    if (!isPageOpen) return null

    const itemCount = cart.items.reduce((sum, item) => sum + item.qty, 0)

    return (
        <div className="fixed inset-0 z-40 overflow-auto bg-white dark:bg-gray-900">
            <div className="mx-auto mt-16 max-w-3xl p-6">
                <div className="mb-6 flex items-center justify-between border-b pb-4">
                    <h1 className="auto-contrast text-2xl font-bold">
                        Your Cart ({itemCount})
                    </h1>
                    <button
                        onClick={closeCartPage}
                        aria-label="Close cart page"
                        className="auto-contrast rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                        ✕
                    </button>
                </div>
                {cart.items.length === 0 ? (
                    <p className="auto-contrast">Your cart is empty.</p>
                ) : (
                    <ul className="divide-y">
                        {cart.items.map((item) => (
                            <li
                                key={item.variantId}
                                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between"
                            >
                                <div className="flex-1">
                                    <p className="auto-contrast font-medium">
                                        {item.name}
                                    </p>
                                    <p className="auto-contrast text-sm">
                                        ${item.unitPrice.toFixed(2)} each
                                    </p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="px-2"
                                        onClick={() =>
                                            window.dispatchEvent(
                                                new CustomEvent('cart:update', {
                                                    detail: {
                                                        variantId:
                                                            item.variantId,
                                                        qty: item.qty - 1,
                                                    },
                                                })
                                            )
                                        }
                                        aria-label={`Decrease quantity of ${item.name}`}
                                    >
                                        -
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-16 border p-1 text-center"
                                        value={item.qty}
                                        onChange={(e) =>
                                            window.dispatchEvent(
                                                new CustomEvent('cart:update', {
                                                    detail: {
                                                        variantId:
                                                            item.variantId,
                                                        qty: Number(
                                                            e.target.value
                                                        ),
                                                    },
                                                })
                                            )
                                        }
                                        aria-label={`Quantity for ${item.name}`}
                                    />
                                    <button
                                        className="px-2"
                                        onClick={() =>
                                            window.dispatchEvent(
                                                new CustomEvent('cart:update', {
                                                    detail: {
                                                        variantId:
                                                            item.variantId,
                                                        qty: item.qty + 1,
                                                    },
                                                })
                                            )
                                        }
                                        aria-label={`Increase quantity of ${item.name}`}
                                    >
                                        +
                                    </button>
                                </div>
                                <div className="text-right sm:w-24">
                                    <p className="auto-contrast">
                                        $
                                        {(item.unitPrice * item.qty).toFixed(2)}
                                    </p>
                                    <button
                                        className="text-sm text-red-600"
                                        onClick={() =>
                                            window.dispatchEvent(
                                                new CustomEvent('cart:remove', {
                                                    detail: {
                                                        variantId:
                                                            item.variantId,
                                                    },
                                                })
                                            )
                                        }
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
                <div
                    className={`mt-6 ${cart.items.length > 0 ? 'border-t pt-4' : ''}`}
                >
                    {cart.items.length > 0 && (
                        <div className="mb-4 flex justify-between text-lg">
                            <span className="auto-contrast">Subtotal</span>
                            <span className="auto-contrast font-semibold">
                                ${cart.subtotal.toFixed(2)}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-end gap-4">
                        <button
                            onClick={closeCartPage}
                            className="auto-contrast rounded border px-4 py-2 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                        >
                            Continue shopping
                        </button>
                        {cart.items.length > 0 && (
                            <button className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                Checkout
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

import React from 'react'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
    const { cart, isPageOpen, closeCartPage } = useCart()

    if (!isPageOpen) return null

    return (
        <div className="fixed inset-0 z-40 overflow-auto bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
                <h1 className=" auto-contrast text-2xl font-bold">Shopping Cart</h1>
                <button onClick={closeCartPage} aria-label="Close cart page">
                    ✕
                </button>
            </div>
            {cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <table className="auto-contrast w-full text-left">
                    <thead>
                        <tr>
                            <th className="p-2">Product</th>
                            <th className="p-2">Price</th>
                            <th className="p-2">Qty</th>
                            <th className="p-2">Total</th>
                            <th className="p-2"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {cart.items.map((item) => (
                            <tr key={item.variantId} className="border-t">
                                <td className="p-2">{item.name}</td>
                                <td className="p-2">
                                    ${item.unitPrice.toFixed(2)}
                                </td>
                                <td className="p-2">
                                    <input
                                        type="number"
                                        min="1"
                                        className="w-16 border p-1"
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
                                </td>
                                <td className="p-2">
                                    ${(item.unitPrice * item.qty).toFixed(2)}
                                </td>
                                <td className="p-2">
                                    <button
                                        className="text-red-600"
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
                                    >
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <div className="mt-4 text-right">
                <p className="text-lg">
                    Subtotal:{' '}
                    <span className="font-semibold">
                        ${cart.subtotal.toFixed(2)}
                    </span>
                </p>
            </div>
        </div>
    )
}

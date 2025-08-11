import React from 'react'
import { useCart } from '../hooks/useCart'
import Navigation from './Navigation'
import FooterNavigation from './FooterNavigation'

function CartPage() {
    const { cart, updateItem, removeItem } = useCart()
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Navigation />
            <main className="mx-auto max-w-3xl px-4 py-10">
                <h1 className="mb-6 text-2xl font-bold">Your Cart</h1>
                {cart.items.length === 0 ? (
                    <p>Your cart is empty.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full text-left text-sm">
                            <thead className="border-b">
                                <tr>
                                    <th className="py-2">Product</th>
                                    <th className="py-2">Qty</th>
                                    <th className="py-2">Price</th>
                                    <th className="py-2">Total</th>
                                    <th className="py-2"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {cart.items.map((item) => (
                                    <tr
                                        key={item.variantId}
                                        className="border-b"
                                    >
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                {item.image && (
                                                    <img
                                                        src={item.image}
                                                        alt=""
                                                        className="h-12 w-12 rounded object-cover"
                                                    />
                                                )}
                                                <span className="font-medium">
                                                    {item.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <input
                                                type="number"
                                                min="1"
                                                value={item.qty}
                                                onChange={(e) =>
                                                    updateItem(
                                                        item.variantId,
                                                        Number(e.target.value)
                                                    )
                                                }
                                                className="w-16 rounded border p-1 text-center"
                                            />
                                        </td>
                                        <td className="py-3">
                                            ${item.unitPrice.toFixed(2)}
                                        </td>
                                        <td className="py-3">
                                            $
                                            {(
                                                item.unitPrice * item.qty
                                            ).toFixed(2)}
                                        </td>
                                        <td className="py-3">
                                            <button
                                                onClick={() =>
                                                    removeItem(item.variantId)
                                                }
                                                className="text-sm text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                <div className="mt-6 text-right">
                    <p className="text-lg font-semibold">
                        Subtotal: ${cart.subtotal.toFixed(2)}
                    </p>
                    <button
                        className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        disabled={cart.items.length === 0}
                    >
                        Checkout
                    </button>
                </div>
            </main>
            <FooterNavigation />
        </div>
    )
}

export default CartPage

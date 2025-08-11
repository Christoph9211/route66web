import React from 'react'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
    const { cart } = useCart()

    const handleQty = (variantId, qty) => {
        window.dispatchEvent(
            new CustomEvent('cart:update', {
                detail: { variantId, qty: Number(qty) },
            })
        )
    }

    const handleRemove = (variantId) => {
        window.dispatchEvent(
            new CustomEvent('cart:remove', { detail: { variantId } })
        )
    }

    const itemCount = cart.items.length

    if (itemCount === 0) {
        return (
            <div className="mx-auto max-w-3xl p-6">
                <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
                <p>Your cart is empty.</p>
                <a href="/" className="text-green-600 underline">
                    Continue shopping
                </a>
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1 className="mb-4 text-2xl font-bold">Your cart ({itemCount})</h1>
            <ul className="divide-y">
                {cart.items.map((item) => (
                    <li
                        key={item.variantId}
                        className="flex items-center justify-between py-4"
                    >
                        <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm">
                                ${item.unitPrice.toFixed(2)}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                className="w-16 border p-1"
                                value={item.qty}
                                onChange={(e) =>
                                    handleQty(item.variantId, e.target.value)
                                }
                                aria-label={`Quantity for ${item.name}`}
                            />
                            <span className="w-20 text-right">
                                ${(item.unitPrice * item.qty).toFixed(2)}
                            </span>
                            <button
                                className="text-red-600"
                                onClick={() => handleRemove(item.variantId)}
                                aria-label={`Remove ${item.name}`}
                            >
                                Remove
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-4 text-right">
                <p className="text-lg">
                    Subtotal:{' '}
                    <span className="font-semibold">
                        ${cart.subtotal.toFixed(2)}
                    </span>
                </p>
                <button className="mt-4 rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                    Proceed to checkout
                </button>
            </div>
        </div>
    )
}

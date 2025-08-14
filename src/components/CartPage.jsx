import React from 'react'
import { useCart } from '../hooks/useCart'

export default function CartPage() {
    const { cart, isPageOpen, closeCartPage, updateItem, removeItem } =
        useCart()

    if (!isPageOpen) return null

    return (
        <div className="fixed inset-0 z-40 overflow-auto bg-white p-6 dark:bg-gray-900">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="auto-contrast text-2xl font-bold">
                    Shopping Cart
                </h1>
                <button
                    onClick={closeCartPage}
                    aria-label="Close cart page"
                    className="text-2xl leading-none"
                >
                    ✕
                </button>
            </div>
            {cart.items.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="space-y-4">
                    {cart.items.map((item) => (
                        <div
                            key={item.variantId}
                            className="flex items-center justify-between border-b pb-4"
                        >
                            <div className="flex items-center gap-4">
                                {item.image && (
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="h-16 w-16 rounded object-cover"
                                    />
                                )}
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">
                                        ${item.unitPrice.toFixed(2)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    className="rounded border px-2 py-1"
                                    onClick={() =>
                                        updateItem(item.variantId, item.qty - 1)
                                    }
                                    aria-label={`Decrease quantity of ${item.name}`}
                                >
                                    -
                                </button>
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
                                    className="w-16 border p-1 text-center"
                                    aria-label={`Quantity for ${item.name}`}
                                />
                                <button
                                    className="rounded border px-2 py-1"
                                    onClick={() =>
                                        updateItem(item.variantId, item.qty + 1)
                                    }
                                    aria-label={`Increase quantity of ${item.name}`}
                                >
                                    +
                                </button>
                            </div>
                            <div className="w-20 text-right">
                                ${(item.unitPrice * item.qty).toFixed(2)}
                            </div>
                            <button
                                className="text-red-600 hover:underline"
                                onClick={() => removeItem(item.variantId)}
                                aria-label={`Remove ${item.name} from cart`}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                    <div className="flex justify-end pt-4">
                        <div className="text-right">
                            <p className="text-lg">
                                Subtotal:{' '}
                                <span className="font-semibold">
                                    ${cart.subtotal.toFixed(2)}
                                </span>
                            </p>
                            <button className="mt-2 rounded bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700">
                                Checkout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

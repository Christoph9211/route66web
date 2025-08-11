import React, { useEffect, useRef } from 'react'
import { useCart } from '../hooks/useCart'

function MiniCart({ open, onClose }) {
    const { cart, updateItem, removeItem } = useCart()
    const panelRef = useRef(null)

    useEffect(() => {
        if (!open) return
        const handleKey = (e) => {
            if (e.key === 'Escape') onClose()
        }
        document.addEventListener('keydown', handleKey)
        panelRef.current?.focus()
        return () => document.removeEventListener('keydown', handleKey)
    }, [open, onClose])

    if (!open) return null

    return (
        <div
            className="fixed inset-0 z-50 flex"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="fixed inset-0 bg-black/50"
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                ref={panelRef}
                tabIndex="-1"
                className="ml-auto flex h-full w-full max-w-sm flex-col bg-white shadow-xl dark:bg-gray-800"
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className="text-lg font-semibold">Your Cart</h2>
                    <button
                        aria-label="Close cart"
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <span aria-hidden="true">&times;</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                    {cart.items.length === 0 ? (
                        <p className="text-sm text-gray-600">
                            Your cart is empty.
                        </p>
                    ) : (
                        <ul className="space-y-4">
                            {cart.items.map((item) => (
                                <li key={item.variantId} className="flex gap-3">
                                    {item.image && (
                                        <img
                                            src={item.image}
                                            alt=""
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="font-medium">
                                            {item.name}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            ${item.unitPrice.toFixed(2)}
                                        </p>
                                        <div className="mt-1 flex items-center">
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
                                            <button
                                                onClick={() =>
                                                    removeItem(item.variantId)
                                                }
                                                className="ml-2 text-sm text-red-600 hover:underline"
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="border-t p-4">
                    <div className="mb-2 flex justify-between text-sm">
                        <span>Subtotal</span>
                        <span>${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <button
                        className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        onClick={() => {
                            onClose()
                            window.location.href = '/cart'
                        }}
                    >
                        View cart
                    </button>
                </div>
            </div>
        </div>
    )
}

export default MiniCart

import React, { useEffect, useRef } from 'react'
import { useCart } from '../hooks/useCart'

export default function CartDrawer() {
    const { cart, isOpen, closeCart, openCartPage } = useCart()
    const ref = useRef(null)

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') closeCart()
        }
        if (isOpen) document.addEventListener('keydown', handleEsc)
        return () => document.removeEventListener('keydown', handleEsc)
    }, [isOpen, closeCart])

    useEffect(() => {
        if (isOpen) {
            ref.current?.focus()
        }
    }, [isOpen])

    const itemCount = cart.items.reduce((sum, i) => sum + i.qty, 0)

    return (
        <div
            className={`fixed inset-0 z-50 ${isOpen ? '' : 'pointer-events-none'}`}
        >
            <div
                className={`absolute inset-0 bg-black/50 transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                onClick={closeCart}
            />
            <div
                ref={ref}
                tabIndex="-1"
                className={`absolute right-0 top-0 h-full w-80 bg-white shadow-xl transition-transform dark:bg-gray-800 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
                role="dialog"
                aria-modal="true"
                aria-label="Shopping cart"
            >
                <div className="flex items-center justify-between border-b p-4">
                    <h2 className=" auto-contrast text-lg font-semibold">
                        Cart ({itemCount})
                    </h2>
                    <button onClick={closeCart} aria-label="Close cart">
                        ✕
                    </button>
                </div>
                <div className="flex h-full flex-col justify-between">
                    <ul className="flex-1 overflow-y-auto p-4">
                        {cart.items.length === 0 && (
                            <li className="text-center text-sm">
                                Your cart is empty.
                            </li>
                        )}
                        {cart.items.map((item) => (
                            <li
                                key={item.variantId}
                                className="mb-4 flex items-center justify-between"
                            >
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm">
                                        $
                                        {(item.unitPrice * item.qty).toFixed(2)}
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
                                    <span>{item.qty}</span>
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
                                        aria-label={`Remove ${item.name}`}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </li>
                        ))}
                        <button type="button" className="w-full rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700" onClick={openCartPage}> View Cart </button>
                    </ul>
                    <div className="border-t p-4">
                        <div className="mb-2 flex justify-between">
                            <span>Subtotal</span>
                            <span>${cart.subtotal.toFixed(2)}</span>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'

const CartContext = createContext()

function calculateTotals(items) {
    const subtotal = items.reduce(
        (sum, item) => sum + item.unitPrice * item.qty,
        0
    )
    return {
        items,
        subtotal,
        total: subtotal,
        updatedAt: new Date().toISOString(),
    }
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(() => {
        try {
            const stored = localStorage.getItem('cart')
            if (stored) return JSON.parse(stored)
        } catch (e) {
            console.error('Failed to parse cart from storage', e)
        }
        return calculateTotals([])
    })

    const persist = (next) => {
        try {
            localStorage.setItem('cart', JSON.stringify(next))
        } catch (e) {
            console.error('Failed to persist cart', e)
        }
    }

    const setAndPersist = (updater) => {
        setCart((prevCart) => {
            const items =
                typeof updater === 'function'
                    ? updater(prevCart.items)
                    : updater
            const next = calculateTotals(items)
            persist(next)
            return next
        })
    }

    const addItem = useCallback((item) => {
        setAndPersist((items) => {
            const existing = items.find((i) => i.variantId === item.variantId)
            if (existing) {
                return items.map((i) =>
                    i.variantId === item.variantId
                        ? {
                              ...i,
                              qty: Math.min(
                                  i.maxQty ?? Infinity,
                                  i.qty + item.qty
                              ),
                          }
                        : i
                )
            }
            return [...items, item]
        })
    }, [])

    const updateItem = useCallback((variantId, qty) => {
        setAndPersist((items) =>
            items
                .map((i) =>
                    i.variantId === variantId
                        ? { ...i, qty: Math.min(qty, i.maxQty ?? qty) }
                        : i
                )
                .filter((i) => i.qty > 0)
        )
    }, [])

    const removeItem = useCallback((variantId) => {
        setAndPersist((items) => items.filter((i) => i.variantId !== variantId))
    }, [])

    const clear = useCallback(() => {
        setAndPersist([])
    }, [])

    // Event listeners for cart actions
    useEffect(() => {
        const handleAdd = (e) => addItem(e.detail)
        const handleUpdate = (e) => updateItem(e.detail.variantId, e.detail.qty)
        const handleRemove = (e) => removeItem(e.detail.variantId)
        const handleClear = () => clear()

        window.addEventListener('cart:add', handleAdd)
        window.addEventListener('cart:update', handleUpdate)
        window.addEventListener('cart:remove', handleRemove)
        window.addEventListener('cart:clear', handleClear)
        return () => {
            window.removeEventListener('cart:add', handleAdd)
            window.removeEventListener('cart:update', handleUpdate)
            window.removeEventListener('cart:remove', handleRemove)
            window.removeEventListener('cart:clear', handleClear)
        }
    }, [addItem, updateItem, removeItem, clear])

    return (
        <CartContext.Provider
            value={{ cart, addItem, updateItem, removeItem, clear }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)

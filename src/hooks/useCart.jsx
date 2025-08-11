import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
} from 'react'

const CartContext = createContext()

function getInitialCart() {
    try {
        const stored = localStorage.getItem('cart')
        return stored
            ? JSON.parse(stored)
            : { items: [], subtotal: 0, total: 0 }
    } catch {
        return { items: [], subtotal: 0, total: 0 }
    }
}

export function CartProvider({ children }) {
    const [cart, setCart] = useState(getInitialCart)
    const [isOpen, setIsOpen] = useState(false)
    const [isPageOpen, setIsPageOpen] = useState(false)

    const recalc = (items) => {
        const subtotal = items.reduce(
            (sum, item) => sum + item.unitPrice * item.qty,
            0
        )
        return { items, subtotal, total: subtotal }
    }

    const persist = (data) => {
        setCart(data)
        try {
            localStorage.setItem('cart', JSON.stringify(data))
        } catch {
            /* ignore */
        }
    }

    const addItem = useCallback((item) => {
        setCart((prev) => {
            const existing = prev.items.find(
                (i) => i.variantId === item.variantId
            )
            let items
            if (existing) {
                items = prev.items.map((i) =>
                    i.variantId === item.variantId
                        ? { ...i, qty: i.qty + item.qty }
                        : i
                )
            } else {
                items = [...prev.items, item]
            }
            const updated = recalc(items)
            persist(updated)
            return updated
        })
    }, [])

    const updateItem = useCallback((variantId, qty) => {
        setCart((prev) => {
            const items = prev.items
                .map((i) => (i.variantId === variantId ? { ...i, qty } : i))
                .filter((i) => i.qty > 0)
            const updated = recalc(items)
            persist(updated)
            return updated
        })
    }, [])

    const removeItem = useCallback((variantId) => {
        setCart((prev) => {
            const items = prev.items.filter((i) => i.variantId !== variantId)
            const updated = recalc(items)
            persist(updated)
            return updated
        })
    }, [])

    const clearCart = useCallback(() => {
        const empty = recalc([])
        persist(empty)
    }, [])

    useEffect(() => {
        const handleAdd = (e) => {
            addItem(e.detail)
            setIsOpen(true)
        }
        const handleUpdate = (e) => updateItem(e.detail.variantId, e.detail.qty)
        const handleRemove = (e) => removeItem(e.detail.variantId)
        const handleClear = () => clearCart()

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
    }, [addItem, updateItem, removeItem, clearCart])

    const openCart = () => setIsOpen(true)
    const closeCart = () => setIsOpen(false)

    const openCartPage = () => {
        setIsOpen(false)
        setIsPageOpen(true)
        window.history.pushState({}, '', '/cart')
    }

    const closeCartPage = () => {
        setIsPageOpen(false)
        if (window.location.pathname === '/cart') {
            window.history.back()
        }
    }

    useEffect(() => {
        const handleRoute = () => {
            const isCart = window.location.pathname === '/cart'
            setIsPageOpen(isCart)
            if (isCart) setIsOpen(false)
        }
        window.addEventListener('popstate', handleRoute)
        handleRoute()
        return () => window.removeEventListener('popstate', handleRoute)
    }, [])

    return (
        <CartContext.Provider
            value={{
                cart,
                addItem,
                updateItem,
                removeItem,
                clearCart,
                isOpen,
                openCart,
                closeCart,
                isPageOpen,
                openCartPage,
                closeCartPage,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    return useContext(CartContext)
}

import { useEffect, useRef, useState } from 'react'

const shouldLogWarnings =
    typeof import.meta !== 'undefined' && import.meta.env?.MODE !== 'production'

function getSafeLocalStorage() {
    if (typeof window === 'undefined') return null
    try {
        return window.localStorage
    } catch (error) {
        if (shouldLogWarnings) {
            console.warn(
                'localStorage is unavailable; age gate will not persist state.',
                error
            )
        }
        return null
    }
}

export default function AgeGate() {
    const [visible, setVisible] = useState(false)
    const dialogRef = useRef(null)

    useEffect(() => {
        const storage = getSafeLocalStorage()
        const isAdult = storage?.getItem('isAdult') === 'true'
        setVisible(!isAdult)
    }, [])

    useEffect(() => {
        if (!visible) return undefined

        const dialog = dialogRef.current
        if (!dialog) return undefined

        if (!dialog.open && typeof dialog.showModal === 'function') {
            dialog.showModal()
        } else if (!dialog.open) {
            dialog.setAttribute('open', '')
        }

        const handleCancel = (event) => event.preventDefault()
        dialog.addEventListener('cancel', handleCancel)

        return () => {
            dialog.removeEventListener('cancel', handleCancel)
            if (dialog.open && typeof dialog.close === 'function') {
                dialog.close()
            } else {
                dialog.removeAttribute('open')
            }
        }
    }, [visible])

    const handleConfirm = () => {
        try {
            if (
                typeof window !== 'undefined' &&
                typeof window.confirmAge21 === 'function'
            ) {
                window.confirmAge21()
            }
        } catch (error) {
            if (shouldLogWarnings) {
                console.warn('Failed to persist age confirmation.', error)
            }
        } finally {
            setVisible(false)
        }
    }

    if (!visible) return null

    return (
        <dialog
            ref={dialogRef}
            className="z-[10000] w-full max-w-md rounded-xl bg-white p-6 text-gray-900 shadow-xl backdrop:bg-black/70"
            aria-labelledby="age-gate-title"
            aria-describedby="age-gate-description"
        >
            <h2 id="age-gate-title" className="mb-2 text-xl font-semibold">
                Are you 21 or older?
            </h2>
            <p id="age-gate-description" className="mb-6 text-sm text-black">
                You must be of legal age to enter this site.
            </p>
            <div className="flex gap-3">
                <button
                    onClick={handleConfirm}
                    className="rounded-lg bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400"
                >
                    I am 21+
                </button>
                <a
                    href="https://www.google.com"
                    className="rounded-lg border border-gray-300 text-black px-4 py-2 hover:bg-gray-50"
                >
                    No, take me back
                </a>
            </div>
            <p className="mt-4 text-xs text-black">
                By confirming, you certify that you are of legal age in your
                jurisdiction.
            </p>
        </dialog>
    )
}

import React, { useEffect, useRef } from 'react'

/**
 * Component for making announcements to screen readers
 * Used for dynamic content changes that need to be announced
 */
function AccessibilityAnnouncer({ message, priority = 'polite', clearAfter = 1000 }) {
    const announcerRef = useRef(null)

    useEffect(() => {
        if (message && announcerRef.current) {
            announcerRef.current.textContent = message
            
            if (clearAfter > 0) {
                const timer = setTimeout(() => {
                    if (announcerRef.current) {
                        announcerRef.current.textContent = ''
                    }
                }, clearAfter)
                
                return () => clearTimeout(timer)
            }
        }
    }, [message, clearAfter])

    return (
        <div
            ref={announcerRef}
            aria-live={priority}
            aria-atomic="true"
            className="sr-only"
            role="status"
        />
    )
}

export default AccessibilityAnnouncer
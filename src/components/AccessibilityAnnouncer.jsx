import React, { useEffect, useRef } from 'react'


/**
 * AccessibilityAnnouncer is a React component that creates a live region for 
 * screen readers to announce messages to users. It is used to provide
 * important information to users that may not be visible to all users.
 *
 * @param {Object} props - The component properties.
 * @param {string} props.message - The message to announce.
 * @param {string} [props.priority='polite'] - The priority of the announcement.
 * @param {number} [props.clearAfter=1000] - The time in milliseconds to clear
 * the announcement after.
 * @return {JSX.Element} The AccessibilityAnnouncer component.
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
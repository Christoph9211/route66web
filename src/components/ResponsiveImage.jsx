import { useMemo, useState } from 'react'

const DEFAULT_SIZES = [320, 400, 640, 768, 1024, 1280, 1600, 1920]
const FALLBACK_BASE = '/assets/images/route-66-hemp-product-placeholder'

const STRIP_PATTERN = /(-\d+w)?\.[^/.]+$/

const buildSrcSet = (baseName, extension, sizes) =>
    sizes.map((size) => `${baseName}-${size}w.${extension} ${size}w`).join(', ')

const normaliseBaseName = (value) => {
    if (!value || typeof value !== 'string') {
        return FALLBACK_BASE
    }

    const trimmed = value.trim()
    if (!trimmed) {
        return FALLBACK_BASE
    }

    // Remove any existing extension or responsive suffix (-1280w, etc.)
    if (trimmed.includes('.')) {
        return trimmed.replace(STRIP_PATTERN, '')
    }

    return trimmed.replace(/-\d+w$/, '')
}

function ResponsiveImage({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 50vw',
    priority = false,
    fallbackBase = FALLBACK_BASE,
    srcSetWidths = null,
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)

    const isExternal = useMemo(() => {
        if (typeof src !== 'string') return false
        return /^https?:\/\//.test(src.trim())
    }, [src])

    const baseName = useMemo(() => {
        if (isExternal) return fallbackBase
        const normalised = normaliseBaseName(src)
        return normalised || fallbackBase
    }, [fallbackBase, isExternal, src])

    const resolvedWidths = useMemo(() => {
        if (Array.isArray(srcSetWidths) && srcSetWidths.length) {
            return srcSetWidths
        }
        return DEFAULT_SIZES
    }, [srcSetWidths])

    const srcSets = useMemo(() => {
        if (isExternal || hasError) return null
        return {
            avif: buildSrcSet(baseName, 'avif', resolvedWidths),
            webp: buildSrcSet(baseName, 'webp', resolvedWidths),
            jpeg: buildSrcSet(baseName, 'jpg', resolvedWidths),
        }
    }, [baseName, isExternal, hasError, resolvedWidths])

    const mergedClassName = `${className} ${isLoaded ? 'loaded' : 'loading'} ${hasError ? 'error' : ''}`.trim()

    const handleError = (event) => {
        const target = event?.target
        if (target) {
            target.onerror = null
            setHasError(true)
            // Use a specific, guaranteed size for the fallback to avoid further issues
            target.src = `${FALLBACK_BASE}-640w.webp`
            setIsLoaded(false)
        }
    }

    if (isExternal) {
        return (
            <img
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : loading}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={mergedClassName}
                onLoad={() => setIsLoaded(true)}
                onError={handleError}
            />
        )
    }

    const fallbackSrc = `${baseName}-640w.jpg`

    return (
        <picture>
            {!hasError && srcSets && (
                <>
                    <source type="image/avif" srcSet={srcSets.avif} sizes={sizes} />
                    <source type="image/webp" srcSet={srcSets.webp} sizes={sizes} />
                    <source type="image/jpeg" srcSet={srcSets.jpeg} sizes={sizes} />
                </>
            )}
            <img
                src={hasError ? `${FALLBACK_BASE}-640w.webp` : fallbackSrc}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : loading}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={mergedClassName}
                onError={handleError}
                onLoad={() => setIsLoaded(true)}
            />
        </picture>
    )
}

export default ResponsiveImage

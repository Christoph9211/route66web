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
    const [errorStage, setErrorStage] = useState(0)

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
        if (isExternal || errorStage > 0) return null
        return {
            avif: buildSrcSet(baseName, 'avif', resolvedWidths),
            webp: buildSrcSet(baseName, 'webp', resolvedWidths),
            jpeg: buildSrcSet(baseName, 'jpg', resolvedWidths),
        }
    }, [baseName, isExternal, errorStage, resolvedWidths])

    const mergedClassName = `${className} ${isLoaded ? 'loaded' : 'loading'} ${errorStage > 0 ? 'error' : ''}`.trim()

    const fallbackSrc = `${baseName}-640w.jpg`
    const placeholderSrc = `${fallbackBase}-640w.webp`

    const handleError = () => {
        setIsLoaded(false)
        setErrorStage((currentStage) => Math.min(currentStage + 1, 2))
    }

    if (isExternal) {
        return (
            <img
                src={errorStage > 0 ? placeholderSrc : src}
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

    const resolvedSrc = errorStage >= 2 ? placeholderSrc : fallbackSrc

    return (
        <picture>
            {!errorStage && srcSets && (
                <>
                    <source type="image/avif" srcSet={srcSets.avif} sizes={sizes} />
                    <source type="image/webp" srcSet={srcSets.webp} sizes={sizes} />
                    <source type="image/jpeg" srcSet={srcSets.jpeg} sizes={sizes} />
                </>
            )}
            <img
                src={resolvedSrc}
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

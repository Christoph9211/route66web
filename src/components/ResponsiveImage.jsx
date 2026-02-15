import { useMemo, useState } from 'react'
import { responsiveImageManifest } from '../generated/responsiveImageManifest.js'

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

const sanitiseWidths = (value) =>
    [...new Set(value.map((entry) => Number(entry)).filter((entry) => Number.isFinite(entry) && entry > 0))]
        .sort((a, b) => a - b)

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

    const manifestKey = useMemo(() => {
        const segments = baseName.split('/').filter(Boolean)
        return segments.length ? segments[segments.length - 1] : baseName
    }, [baseName])

    const resolvedWidths = useMemo(() => {
        if (Array.isArray(srcSetWidths) && srcSetWidths.length) {
            return sanitiseWidths(srcSetWidths)
        }

        if (isExternal) {
            return []
        }

        const manifestWidths = responsiveImageManifest[manifestKey]
        if (!Array.isArray(manifestWidths) || manifestWidths.length === 0) {
            return []
        }

        return sanitiseWidths(manifestWidths)
    }, [isExternal, manifestKey, srcSetWidths])

    const srcSets = useMemo(() => {
        if (isExternal || errorStage > 0 || resolvedWidths.length === 0) return null
        return {
            avif: buildSrcSet(baseName, 'avif', resolvedWidths),
            webp: buildSrcSet(baseName, 'webp', resolvedWidths),
            jpeg: buildSrcSet(baseName, 'jpg', resolvedWidths),
        }
    }, [baseName, errorStage, isExternal, resolvedWidths])

    const mergedClassName = `${className} ${isLoaded ? 'loaded' : 'loading'} ${errorStage > 0 ? 'error' : ''}`.trim()

    const fallbackWidth = useMemo(() => {
        if (!resolvedWidths.length) {
            return 640
        }
        return resolvedWidths.includes(640) ? 640 : resolvedWidths[0]
    }, [resolvedWidths])

    const fallbackSrc = `${baseName}-${fallbackWidth}w.jpg`
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

    // For local images, first retry with plain <img> fallback (no <source> set),
    // then escalate to placeholder if that also errors.
    const resolvedSrc = errorStage > 1 ? placeholderSrc : fallbackSrc

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

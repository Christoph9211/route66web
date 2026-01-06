import { useMemo, useState } from 'react'

const DEFAULT_SIZES = [320, 400, 640, 768, 1024, 1280, 1920]
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

    if (!trimmed.includes('.')) {
        return trimmed.replace(/-\d+w$/, '')
    }

    return trimmed.replace(STRIP_PATTERN, '')
}

function ResponsiveImage({
    src,
    alt,
    width,
    height,
    className = '',
    loading = 'lazy',
    sizes = '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw',
    priority = false,
    fallbackBase = FALLBACK_BASE,
}) {
    const [isLoaded, setIsLoaded] = useState(false)
    const isExternal = typeof src === 'string' && /^https?:\/\//.test(src.trim())
    const effectiveSizes = useMemo(() => DEFAULT_SIZES.slice(), [])
    const baseName = useMemo(() => {
        if (isExternal) {
            return fallbackBase
        }
        return normaliseBaseName(src) || fallbackBase
    }, [fallbackBase, isExternal, src])

    const avifSrcSet = useMemo(
        () => buildSrcSet(baseName, 'avif', effectiveSizes),
        [baseName, effectiveSizes]
    )
    const webpSrcSet = useMemo(
        () => buildSrcSet(baseName, 'webp', effectiveSizes),
        [baseName, effectiveSizes]
    )
    const jpegSrcSet = useMemo(
        () => buildSrcSet(baseName, 'jpg', effectiveSizes),
        [baseName, effectiveSizes]
    )

    if (isExternal) {
        const mergedClassName = `${className} ${isLoaded ? 'loaded' : 'loading'}`.trim()

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
                onError={(event) => {
                    const target = event?.target
                    if (target) {
                        target.onerror = null
                        target.src = `${fallbackBase}-640w.webp`
                        setIsLoaded(false)
                    }
                }}
            />
        )
    }

    const fallbackSrc = `${baseName}-640w.jpg`
    const placeholderSrc = `${fallbackBase}-640w.webp`

    const mergedClassName = `${className} ${isLoaded ? 'loaded' : 'loading'}`.trim()

    return (
        <picture>
            <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
            <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
            <source type="image/jpeg" srcSet={jpegSrcSet} sizes={sizes} />
            <img
                src={fallbackSrc}
                alt={alt}
                width={width}
                height={height}
                loading={priority ? 'eager' : loading}
                decoding={priority ? 'sync' : 'async'}
                fetchPriority={priority ? 'high' : 'auto'}
                className={mergedClassName}
                onError={(event) => {
                    const target = event?.target
                    if (target) {
                        target.onerror = null
                        target.src = placeholderSrc
                        setIsLoaded(false)
                    }
                }}
                onLoad={() => setIsLoaded(true)}
            />
        </picture>
    )
}

export default ResponsiveImage

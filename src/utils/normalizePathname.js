export const normalizePathname = (pathname) => {
    if (typeof pathname !== 'string') {
        return ''
    }

    const trimmed = pathname.trim()
    if (!trimmed || trimmed === '/') {
        return ''
    }

    const withoutLeading = trimmed.replace(/^\/+/, '')
    return withoutLeading.replace(/\/+$/, '')
}

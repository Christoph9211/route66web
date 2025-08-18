/**
 * Convert a string to a URL-friendly slug.
 *
 * @param {string} str - The string to slugify.
 * @return {string} The slugified string.
 *
 * @example
 * slugify('Hello, World!') // 'hello-world'
 * slugify('123-456') // '123-456'
 */
export function slugify(str) {
    return str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
}

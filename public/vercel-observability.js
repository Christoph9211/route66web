(function () {
    window.va =
        window.va ||
        function () {
            window.vaq = window.vaq || []
            window.vaq.push(arguments)
        }

    window.si =
        window.si ||
        function () {
            window.siq = window.siq || []
            window.siq.push(arguments)
        }

    function loadScript(src) {
        if (document.querySelector('script[src="' + src + '"]')) {
            return
        }

        const script = document.createElement('script')
        script.defer = true
        script.src = src
        document.head.appendChild(script)
    }

    if (/^(localhost|127\.0\.0\.1|\[::1\])$/.test(window.location.hostname)) {
        return
    }

    loadScript('/_vercel/insights/script.js')
    loadScript('/_vercel/speed-insights/script.js')
})()

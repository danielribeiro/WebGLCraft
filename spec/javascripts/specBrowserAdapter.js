if (typeof global !== "undefined" && global !== null) {
    global.window = global
    global.headless = false
}
else {
    function noop() {
    }
    window.require = noop
    window.headless = false
}





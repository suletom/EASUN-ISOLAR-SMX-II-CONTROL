module.exports = {
    win32: require('./windows'),
    linux: require('./linux'),
    freebsd: require('./freebsd'),
    darwin: require('./freebsd')
};
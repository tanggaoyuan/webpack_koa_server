"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const koa_1 = __importDefault(require("koa"));
const webpack_1 = __importDefault(require("webpack"));
const middlewares_1 = require("./middlewares");
const koa2_connect_history_api_fallback_1 = __importDefault(require("koa2-connect-history-api-fallback"));
const koa_server_http_proxy_1 = __importDefault(require("koa-server-http-proxy"));
const koa_static_1 = __importDefault(require("koa-static"));
const koa_mount_1 = __importDefault(require("koa-mount"));
const child_process_1 = __importDefault(require("child_process"));
const process_1 = __importDefault(require("process"));
const webpack_merge_1 = require("webpack-merge");
const os_1 = __importDefault(require("os"));
class KoaWebpackServer {
    constructor(config, app = new koa_1.default()) {
        this.config = {};
        this.historyApiFallbackWhiteList = [];
        this.config = config;
        this.app = app;
    }
    setConfig(config, mix = true) {
        if (mix) {
            this.config = (0, webpack_merge_1.merge)(this.config, config);
        }
        else {
            this.config = config;
        }
        return this;
    }
    setProxy(proxy, mix = true) {
        if (mix) {
            this.config.proxy = Object.assign(Object.assign({}, this.config.proxy), proxy);
        }
        else {
            this.config.proxy = proxy;
        }
        return this;
    }
    setHistoryApiFallbackWhiteList(whiteList, mix = true) {
        if (mix) {
            this.historyApiFallbackWhiteList = [...this.historyApiFallbackWhiteList, ...whiteList];
        }
        else {
            this.historyApiFallbackWhiteList = whiteList;
        }
    }
    getLocalhostIp() {
        let localWlanHost = '127.0.0.1';
        try {
            const ifaces = os_1.default.networkInterfaces();
            for (const dev in ifaces) {
                ifaces[dev].forEach((details) => {
                    if (details.family === 'IPv4' && details.address !== '127.0.0.1' && !details.internal) {
                        localWlanHost = details.address;
                    }
                });
            }
        }
        catch (e) {
            localWlanHost = '127.0.0.1';
        }
        return localWlanHost;
    }
    setStaticServer(options, mix = true) {
        const { devServer } = this.config;
        if (!Array.isArray(devServer.static)) {
            devServer.static = [devServer.static];
        }
        if (!Array.isArray(options)) {
            options = [options];
        }
        if (mix) {
            devServer.static = [...devServer.static, ...options];
        }
        else {
            devServer.static = options;
        }
        return this;
    }
    start(options = {}) {
        setTimeout(() => {
            const config = this.config;
            const devServer = config.devServer || {};
            const proxy = config.proxy;
            // 代理设置
            Object.keys(proxy || {}).forEach((path) => {
                this.app.use((0, koa_server_http_proxy_1.default)(path, proxy[path]));
            });
            // 热更新
            if (devServer.hot) {
                const hot_client = 'webpack-hot-middleware/client?path=/koa_hot&timeout=20000';
                if (typeof config.entry === 'string') {
                    config.entry = [hot_client, config.entry];
                }
                else if (Array.isArray(config.entry) && typeof config.entry[0] === 'string') {
                    config.entry.unshift(hot_client);
                }
                else {
                    Object.keys(config.entry).forEach((key) => {
                        if (!Array.isArray(config.entry[key])) {
                            config.entry[key] = [config.entry[key]];
                        }
                        config.entry[key].unshift(hot_client);
                    });
                }
            }
            this.compiler = (0, webpack_1.default)(config);
            if (devServer.hot) {
                this.app.use((0, middlewares_1.KoaWebpackHot)(this.compiler, {
                    log: console.log,
                    path: '/koa_hot',
                    heartbeat: 10 * 1000,
                }));
            }
            if (devServer.historyApiFallback) {
                this.app.use((0, koa2_connect_history_api_fallback_1.default)({ whiteList: this.historyApiFallbackWhiteList }));
            }
            this.app.use((0, middlewares_1.KoaWebpackDev)(this.compiler, Object.assign(Object.assign({}, options), { publicPath: config.output.publicPath })));
            // 静态资源服务
            if (devServer.static) {
                if (!Array.isArray(devServer.static)) {
                    devServer.static = [devServer.static];
                }
                devServer.static.forEach((item) => {
                    if (item.publicPath) {
                        this.app.use((0, koa_mount_1.default)(item.publicPath, (0, koa_static_1.default)(item.directory, Object.assign({}, item))));
                    }
                    else {
                        this.app.use((0, koa_static_1.default)(item.directory, Object.assign({}, item)));
                    }
                });
            }
            this.app.listen(devServer.port || 3000, () => {
                this.compiler.hooks.done.tap('done', () => {
                    var _a;
                    if (devServer.open) {
                        const url = `http://localhost:${(_a = config.devServer) === null || _a === void 0 ? void 0 : _a.port}`;
                        let cmd = '';
                        if (process_1.default.platform === 'win32') {
                            cmd = 'start "%ProgramFiles%Internet Exploreriexplore.exe"';
                        }
                        else if (process_1.default.platform === 'linux') {
                            cmd = 'xdg-open';
                        }
                        else if (process_1.default.platform === 'darwin') {
                            cmd = 'open';
                        }
                        child_process_1.default.exec(cmd + ' "' + url + '"');
                    }
                    devServer.open = false;
                    setTimeout(() => {
                        console.info(`
___________________________________________________

    http://${this.getLocalhostIp()}:${devServer.port}
    http://localhost:${devServer.port}
___________________________________________________
            `);
                    });
                });
                process_1.default.on('unhandledRejection', (err) => {
                    console.log(`unhandledRejection: ${err['message']}, stack: ${err['stack']}`);
                });
                // 捕获未被处理的异常
                process_1.default.on('uncaughtException', (err) => {
                    console.log(`uncaughtException: ${err.message}, stack: ${err.stack}`);
                });
            });
        }, 0);
    }
}
exports.default = KoaWebpackServer;

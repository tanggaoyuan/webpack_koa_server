/* eslint-disable @typescript-eslint/ban-types */
import Koa from 'koa';

import webpack, { Compiler } from 'webpack';
import { KoaWebpackDev, KoaWebpackDevOptions, KoaWebpackHot } from './middlewares';
import HistoryApiFallback from 'koa2-connect-history-api-fallback';
import Proxy from 'koa-server-http-proxy';
import KoaStatic from 'koa-static';
import KoaMount from 'koa-mount';
import child_process from 'child_process';
import process from 'process';
import { merge } from 'webpack-merge';
import os from 'os';

type ObjAndArray<T> = T | Array<T>

interface KoaWebpackOption {
  hot?: boolean;
  open?: boolean,
  historyApiFallback?: boolean,
  port?: number,
  static?: ObjAndArray<{
    directory: string;
    publicPath?: string;
    serveIndex?: boolean
  }>,
  proxy?: Record<string, {
    target: string,
    pathRewrite?: Record<string, string>,
    changeOrigin?: boolean,
    secure?: boolean,
  }>,
}

class KoaWebpackServer {
  private config: Record<string, any> = {};
  private compiler?: Compiler;
  private historyApiFallbackWhiteList: Array<string> = [];
  public app: Koa;
  private ignoreMiddlewares: Set<Function | string> = new Set();

  constructor(config: Record<string, any>, app: Koa = new Koa()) {
    this.config = config;
    this.app = app;
  }

  public setConfig(config: Record<string, any>, mix = true) {
    if (mix) {
      this.config = merge(this.config, config);
    } else {
      this.config = config;
    }
    return this;
  }

  public setProxy(proxy: KoaWebpackOption['proxy'], mix = true) {
    if (mix) {
      this.config.proxy = { ...this.config.proxy, ...proxy };
    } else {
      this.config.proxy = proxy;
    }
    return this;
  }

  public setHistoryApiFallbackWhiteList(whiteList: Array<string>, mix = true) {
    if (mix) {
      this.historyApiFallbackWhiteList = [...this.historyApiFallbackWhiteList, ...whiteList];
    } else {
      this.historyApiFallbackWhiteList = whiteList;
    }
  }

  private getLocalhostIp() {
    let localWlanHost = '127.0.0.1';
    try {
      const ifaces = os.networkInterfaces();
      for (const dev in ifaces) {
        ifaces[dev].forEach((details) => {
          if (details.family === 'IPv4' && details.address !== '127.0.0.1' && !details.internal) {
            localWlanHost = details.address;
          }
        });
      }
    } catch (e) {
      localWlanHost = '127.0.0.1';
    }
    return localWlanHost;
  }

  public setStaticServer(options: KoaWebpackOption['static'], mix = true) {
    const { devServer } = this.config;
    if (!Array.isArray(devServer.static)) {
      devServer.static = [devServer.static];
    }
    if (!Array.isArray(options)) {
      options = [options];
    }
    if (mix) {
      devServer.static = [...devServer.static, ...options];
    } else {
      devServer.static = options;
    }
    return this;
  }

  /**
   * @description modules ????????????????????????
   */
  public ignoreMiddleware(modules: Array<Function> | Array<string>) {
    modules.forEach((module) => {
      this.ignoreMiddlewares.add(module);
    });
  }

  public start(option?: KoaWebpackDevOptions | ((app: Koa) => void), fn?: (app: Koa) => void) {
    const isFn = typeof option === 'function';

    const startBefore = isFn ? option : fn;

    setTimeout(() => {
      // const middleware = this.app.middleware;

      const config = this.config;
      const devServer = config.devServer || {};
      const proxy = config.proxy;

      // ????????????
      Object.keys(proxy || {}).forEach((path) => {
        this.app.use(Proxy(path, proxy[path]));
      });

      // ?????????
      if (devServer.hot) {
        const hot_client = 'webpack-hot-middleware/client?path=/koa_hot&timeout=20000';
        if (typeof config.entry === 'string') {
          config.entry = [hot_client, config.entry];
        } else if (Array.isArray(config.entry) && typeof config.entry[0] === 'string') {
          config.entry.unshift(hot_client);
        } else {
          Object.keys(config.entry).forEach((key) => {
            if (!Array.isArray(config.entry[key])) {
              config.entry[key] = [config.entry[key]];
            }
            config.entry[key].unshift(hot_client);
          });
        }
      }

      this.compiler = webpack(config);

      if (devServer.hot) {
        this.app.use(KoaWebpackHot(this.compiler, {
          log: console.log,
          path: '/koa_hot',
          heartbeat: 10 * 1000,
        }));
      }

      if (devServer.historyApiFallback) {
        this.app.use(HistoryApiFallback({ whiteList: this.historyApiFallbackWhiteList }));
      }

      this.app.use(KoaWebpackDev(this.compiler, { ...(isFn ? {} : option), publicPath: config.output.publicPath }));

      // ??????????????????
      if (devServer.static) {
        if (!Array.isArray(devServer.static)) {
          devServer.static = [devServer.static];
        }
        devServer.static.forEach((item) => {
          if (item.publicPath) {
            this.app.use(KoaMount(item.publicPath, KoaStatic(item.directory, { ...item })));
          } else {
            this.app.use(KoaStatic(item.directory, { ...item }));
          }
        });
      }

      this.app.middleware = this.app.middleware.filter((module) => !this.ignoreMiddlewares.has(module) && !this.ignoreMiddlewares.has(module.name));
      // this.app.middleware = [...this.app.middleware, ...middleware];

      startBefore && startBefore(this.app);

      this.app.listen(devServer.port || 3000, () => {
        this.compiler.hooks.done.tap('done', () => {
          if (devServer.open) {
            const url = `http://localhost:${config.devServer?.port}`;
            let cmd = '';
            if (process.platform === 'win32') {
              cmd = 'start "%ProgramFiles%Internet Exploreriexplore.exe"';
            } else if (process.platform === 'linux') {
              cmd = 'xdg-open';
            } else if (process.platform === 'darwin') {
              cmd = 'open';
            }
            child_process.exec(`${cmd} "${url}"`);
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

        process.on('unhandledRejection', (err) => {
          console.log(`unhandledRejection: ${err['message']}, stack: ${err['stack']}`);
        });
        // ???????????????????????????
        process.on('uncaughtException', (err) => {
          console.log(`uncaughtException: ${err.message}, stack: ${err.stack}`);
        });
      });
    }, 0);
  }
}

export default KoaWebpackServer;

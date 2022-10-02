/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-spread */
/* eslint-disable prefer-rest-params */

// https://www.npmjs.com/package/koa-webpack-dev-middleware

'use strict';
import expressMiddleware, { IncomingMessage } from 'webpack-dev-middleware';
import webpack from 'webpack';

export type KoaWebpackDevOptions = expressMiddleware.Options<IncomingMessage, expressMiddleware.ServerResponse>;

function middleware(doIt: any, req: any, res: any) {
  const { end: originalEnd } = res;
  return new Promise((resolve) => {
    res.end = function end() {
      originalEnd.apply(this, arguments);
      resolve(0);
    };
    doIt(req, res, () => {
      resolve(1);
    });
  });
}

export default function KoaWebpackDev(compiler: webpack.Compiler, options?: KoaWebpackDevOptions) {
  const doIt = expressMiddleware(compiler, options);

  async function koaMiddleware(ctx: any, next: any) {
    const { req, res } = ctx;
    const locals = ctx.locals || ctx.state;

    ctx.webpack = doIt;

    const runNext = await middleware(doIt, req, {
      ...res,
      end(content: any) {
        ctx.body = content;
      },
      locals,
      setHeader() {
        ctx.set.apply(ctx, arguments);
      },
      getHeader: (name: string) => {
        return res.getHeader(name);
      }
    });

    if (runNext) {
      await next();
    }
  }

  Object.keys(doIt).forEach(p => {
    (koaMiddleware as any)[p] = (doIt as any)[p];
  });

  return koaMiddleware;
}

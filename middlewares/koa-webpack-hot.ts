/* eslint-disable prefer-rest-params */
import WebpackHotMiddleware from 'webpack-hot-middleware';
import webpack from 'webpack';
const PassThrough = require('stream').PassThrough;

const HotMiddleware = (compiler: webpack.Compiler, opts?: WebpackHotMiddleware.MiddlewareOptions) => {
  const middleware = WebpackHotMiddleware(compiler, opts);
  return async (ctx, next) => {
    if(ctx.originalUrl === '/koa_hot'){
      const stream = new PassThrough();
      ctx.body = stream;
      await middleware(ctx.req, {
        ...ctx.res,
        end(content: any) {
          ctx.body = content;
        },
        write: stream.write.bind(stream),
        writeHead: (status, headers) => {
          ctx.status = status;
          ctx.set(headers);
        },
      }, next);
    } else {
      await next();
    }
  };
};


export default HotMiddleware;
```js

import KoaWebpackServer from 'webpack_koa_server';

  // 作为webpack 打包服务器
  // 读取devServer的配置，支持热更新、代理
  // devServer: {
  //   hot: true,
  //   open: true,
  //   historyApiFallback: true,
  //   port: 3000,
  //   static: [
  //     {
  //       directory: path.join(__dirname, '../public'),
  //     }, {
  //       directory: path.join(__dirname, '../web/assets'),
  //     }
  //   ],
  //   proxy: {
  //     '/api': {
  //       target: 'http://localhost:3000/',
  //       pathRewrite: { '/^api/': '' },
  //       changeOrigin: true,
  //     },
  //   },
  // },
const server = KoaWebpackServer(require("webpack.dev.js"))

// 在KoaWebpackServer内部中间件添加之前加入

server.app.use(...)

server.start((app)=>{
   // 服务启动之前，加入中间件，属于最后添加的中间件
    app.use(...)
})

// 以下方法有第二参数mix默认是true，将和旧的配置进行合并

server.setConfig({...}) // 修改webpack 配置

// 设置代理
server.setProxy({
    '/api': {
        target: 'http://localhost:3000/',
        pathRewrite: { '/^api/': '' },
        changeOrigin: true,
      },
})

// 设置historyAipFallback的白名单，匹配的地址不会被重定向到index.html
server.setHistoryApiFallbackWhiteList(['/api'])

// 设置静态服务
server.setStaticServer([
      {
        directory: path.join(__dirname, '../public'),
      }, {
        directory: path.join(__dirname, '../web/assets'),
        publicPath:'/assets'
      }
])


// 链式调用
server.setProxy().setHistoryApiFallbackWhiteList().start()

```


```js

// 与koa同服开发的情况

import KoaWebpackServer from 'webpack_koa_server';
import Koa from 'Koa';
import Router from 'koa-router';
import koaNotFound from '../koaNotFound'

// import { Context } from 'koa';
// const koaNotFound = async function (ctx: Context) {
//   ctx.response.type = 'text/html';
//   ctx.response.body = '<h1>error: api or url not found!</h1>';
// };
// export default koaNotFound;


const app = new Koa();

const router = new Router();

router.get('/api',async (ctx)=>{
    ctx.body = "api"
})


app.use(koaCors)
app.use(koaLogger())
app.use(koaBody({
    multipart: true,
    formidable: {
     maxFileSize: 20000 * 1024 * 1024 // 设置上传文件大小最大限制，默认2M
    },
    formLimit: '20mb',
    jsonLimit: '20mb',
    textLimit: '20mb'
}))

app.use(router.routes());

// 路径访问不到时的错误页，为了KoaWebpackServer里面的中间不受影响
// 使用时可以配置忽略该中间件
app.use(koaNotFound)

// 作为webpack 打包服务器
const server = KoaWebpackServer(require("webpack.dev.js"),app)
server.start((app)=>{
    app.use(...)
})

// 可以是模块名称或者模块自身
server.ignoreMiddleware(['koaNotFound',koaNotFound])

```

[用例地址](https://github.com/tanggaoyuan/react_koa_demo)


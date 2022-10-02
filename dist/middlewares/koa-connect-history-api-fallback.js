"use strict";
/* eslint-disable @typescript-eslint/ban-types */
/**
 * @description 来源
 * https://www.npmjs.com/package/koa2-connect-history-api-fallback
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.historyApiFallback = void 0;
const url = __importStar(require("url"));
function getLogger(options) {
    if (options && options.logger) {
        return options.logger;
    }
    else if (options && options.verbose) {
        return console.log.bind(console);
    }
    return Function();
}
function historyApiFallback(options = {}) {
    const logger = getLogger(options);
    return (ctx, next) => __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (ctx.method !== 'GET') {
            logger('Not rewriting', ctx.method, ctx.url, 'because the method is not GET.');
            return next();
        }
        else if (!ctx.header || typeof ctx.header.accept !== 'string') {
            logger('Not rewriting', ctx.method, ctx.url, 'because the client did not send an HTTP accept header.');
            return next();
        }
        else if (ctx.header.accept.indexOf('application/json') === 0) {
            logger('Not rewriting', ctx.method, ctx.url, 'because the client prefers JSON.');
            return next();
        }
        else if (!acceptsHtml(ctx.header.accept, options)) {
            logger('Not rewriting', ctx.method, ctx.url, 'because the client does not accept HTML.');
            return next();
        }
        // white list check
        if (options.whiteList) {
            let isFlag = false;
            options.whiteList.forEach((item) => {
                if (!isFlag) {
                    isFlag = new RegExp(item).test(ctx.url);
                }
            });
            if (isFlag) {
                return next();
            }
        }
        const parsedUrl = url.parse(ctx.url);
        let rewriteTarget;
        options.rewrites = options.rewrites || [];
        for (let i = 0; i < options.rewrites.length; i++) {
            const rewrite = options.rewrites[i];
            const match = ((_a = parsedUrl.pathname) === null || _a === void 0 ? void 0 : _a.match(rewrite.from)) || null;
            if (match !== null) {
                rewriteTarget = evaluateRewriteRule(parsedUrl, match, rewrite.to);
                logger('Rewriting', ctx.method, ctx.url, 'to', rewriteTarget);
                ctx.url = rewriteTarget;
                return next();
            }
        }
        if (((_b = parsedUrl.pathname) === null || _b === void 0 ? void 0 : _b.indexOf('.')) !== -1 && options.disableDotRule !== true) {
            logger('Not rewriting', ctx.method, ctx.url, 'because the path includes a dot (.) character.');
            return next();
        }
        rewriteTarget = options.index || '/index.html';
        logger('Rewriting', ctx.method, ctx.url, 'to', rewriteTarget);
        ctx.url = rewriteTarget;
        yield next();
    });
}
exports.historyApiFallback = historyApiFallback;
function evaluateRewriteRule(parsedUrl, match, rule) {
    if (typeof rule === 'string') {
        return rule;
    }
    else if (typeof rule !== 'function') {
        throw new Error('Rewrite rule can only be of type string of function.');
    }
    return rule({
        parsedUrl: parsedUrl,
        match: match
    });
}
function acceptsHtml(header, options) {
    options.htmlAcceptHeaders = options.htmlAcceptHeaders || ['text/html', '*/*'];
    for (let i = 0; i < options.htmlAcceptHeaders.length; i++) {
        if (header.indexOf(options.htmlAcceptHeaders[i]) !== -1) {
            return true;
        }
    }
    return false;
}
exports.default = historyApiFallback;

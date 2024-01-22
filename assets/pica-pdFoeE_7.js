import{g as N}from"./index-ut5D1k-z.js";import{c as H}from"./_commonjs-dynamic-modules-h-SxKiO4.js";function X(T,Y){for(var d=0;d<Y.length;d++){const I=Y[d];if(typeof I!="string"&&!Array.isArray(I)){for(const R in I)if(R!=="default"&&!(R in T)){const _=Object.getOwnPropertyDescriptor(I,R);_&&Object.defineProperty(T,R,_.get?_:{enumerable:!0,get:()=>I[R]})}}}return Object.freeze(Object.defineProperty(T,Symbol.toStringTag,{value:"Module"}))}var W={exports:{}};(function(T,Y){/*!

	pica
	https://github.com/nodeca/pica

	*/(function(d){T.exports=d()})(function(){return function(){function d(I,R,_){function o(a,t){if(!R[a]){if(!I[a]){var e=typeof H=="function"&&H;if(!t&&e)return e(a,!0);if(A)return A(a,!0);var i=new Error("Cannot find module '"+a+"'");throw i.code="MODULE_NOT_FOUND",i}var h=R[a]={exports:{}};I[a][0].call(h.exports,function(c){var f=I[a][1][c];return o(f||c)},h,h.exports,d,I,R,_)}return R[a].exports}for(var A=typeof H=="function"&&H,n=0;n<_.length;n++)o(_[n]);return o}return d}()({1:[function(d,I,R){var _=d("inherits"),o=d("multimath"),A=d("./mm_unsharp_mask"),n=d("./mm_resize");function a(t){var e=t||[],i={js:e.indexOf("js")>=0,wasm:e.indexOf("wasm")>=0};o.call(this,i),this.features={js:i.js,wasm:i.wasm&&this.has_wasm()},this.use(A),this.use(n)}_(a,o),a.prototype.resizeAndUnsharp=function(e,i){var h=this.resize(e,i);return e.unsharpAmount&&this.unsharp_mask(h,e.toWidth,e.toHeight,e.unsharpAmount,e.unsharpRadius,e.unsharpThreshold),h},I.exports=a},{"./mm_resize":4,"./mm_unsharp_mask":9,inherits:19,multimath:20}],2:[function(d,I,R){function _(n){return n<0?0:n>255?255:n}function o(n,a,t,e,i,h){var c,f,v,p,m,w,B,y,E,k,b,G=0,D=0;for(E=0;E<e;E++){for(m=0,k=0;k<i;k++){for(w=h[m++],B=h[m++],y=G+w*4|0,c=f=v=p=0;B>0;B--)b=h[m++],p=p+b*n[y+3]|0,v=v+b*n[y+2]|0,f=f+b*n[y+1]|0,c=c+b*n[y]|0,y=y+4|0;a[D+3]=_(p+8192>>14),a[D+2]=_(v+8192>>14),a[D+1]=_(f+8192>>14),a[D]=_(c+8192>>14),D=D+e*4|0}D=(E+1)*4|0,G=(E+1)*t*4|0}}function A(n,a,t,e,i,h){var c,f,v,p,m,w,B,y,E,k,b,G=0,D=0;for(E=0;E<e;E++){for(m=0,k=0;k<i;k++){for(w=h[m++],B=h[m++],y=G+w*4|0,c=f=v=p=0;B>0;B--)b=h[m++],p=p+b*n[y+3]|0,v=v+b*n[y+2]|0,f=f+b*n[y+1]|0,c=c+b*n[y]|0,y=y+4|0;a[D+3]=_(p+8192>>14),a[D+2]=_(v+8192>>14),a[D+1]=_(f+8192>>14),a[D]=_(c+8192>>14),D=D+e*4|0}D=(E+1)*4|0,G=(E+1)*t*4|0}}I.exports={convolveHorizontally:o,convolveVertically:A}},{}],3:[function(d,I,R){I.exports="AGFzbQEAAAAADAZkeWxpbmsAAAAAAAEXA2AAAGAGf39/f39/AGAHf39/f39/fwACDwEDZW52Bm1lbW9yeQIAAAMEAwABAgYGAX8AQQALB1cFEV9fd2FzbV9jYWxsX2N0b3JzAAAIY29udm9sdmUAAQpjb252b2x2ZUhWAAIMX19kc29faGFuZGxlAwAYX193YXNtX2FwcGx5X2RhdGFfcmVsb2NzAAAK7AMDAwABC8YDAQ9/AkAgA0UNACAERQ0AA0AgDCENQQAhE0EAIQcDQCAHQQJqIQYCfyAHQQF0IAVqIgcuAQIiFEUEQEGAwAAhCEGAwAAhCUGAwAAhCkGAwAAhCyAGDAELIBIgBy4BAGohCEEAIQsgFCEHQQAhDiAGIQlBACEPQQAhEANAIAUgCUEBdGouAQAiESAAIAhBAnRqKAIAIgpBGHZsIBBqIRAgCkH/AXEgEWwgC2ohCyAKQRB2Qf8BcSARbCAPaiEPIApBCHZB/wFxIBFsIA5qIQ4gCEEBaiEIIAlBAWohCSAHQQFrIgcNAAsgC0GAQGshCCAOQYBAayEJIA9BgEBrIQogEEGAQGshCyAGIBRqCyEHIAEgDUECdGogCUEOdSIGQf8BIAZB/wFIGyIGQQAgBkEAShtBCHRBgP4DcSAKQQ51IgZB/wEgBkH/AUgbIgZBACAGQQBKG0EQdEGAgPwHcSALQQ51IgZB/wEgBkH/AUgbIgZBACAGQQBKG0EYdHJyIAhBDnUiBkH/ASAGQf8BSBsiBkEAIAZBAEobcjYCACADIA1qIQ0gE0EBaiITIARHDQALIAxBAWoiDCACbCESIAMgDEcNAAsLCx4AQQAgAiADIAQgBSAAEAEgAkEAIAQgBSAGIAEQAQs="},{}],4:[function(d,I,R){I.exports={name:"resize",fn:d("./resize"),wasm_fn:d("./resize_wasm"),wasm_src:d("./convolve_wasm_base64")}},{"./convolve_wasm_base64":3,"./resize":5,"./resize_wasm":8}],5:[function(d,I,R){var _=d("./resize_filter_gen"),o=d("./convolve").convolveHorizontally,A=d("./convolve").convolveVertically;function n(a,t,e){for(var i=3,h=t*e*4|0;i<h;)a[i]=255,i=i+4|0}I.exports=function(t){var e=t.src,i=t.width,h=t.height,c=t.toWidth,f=t.toHeight,v=t.scaleX||t.toWidth/t.width,p=t.scaleY||t.toHeight/t.height,m=t.offsetX||0,w=t.offsetY||0,B=t.dest||new Uint8Array(c*f*4),y=typeof t.quality>"u"?3:t.quality,E=t.alpha||!1,k=_(y,i,c,v,m),b=_(y,h,f,p,w),G=new Uint8Array(c*h*4);return o(e,G,i,h,c,k),A(G,B,h,c,f,b),E||n(B,c,f),B}},{"./convolve":2,"./resize_filter_gen":6}],6:[function(d,I,R){var _=d("./resize_filter_info"),o=14;function A(n){return Math.round(n*((1<<o)-1))}I.exports=function(a,t,e,i,h){var c=_[a].filter,f=1/i,v=Math.min(1,i),p=_[a].win/v,m,w,B,y,E,k,b,G,D,x,F,O,U,r,u,s,l,g=Math.floor((p+1)*2),M=new Int16Array((g+2)*e),C=0,Q=!M.subarray||!M.set;for(m=0;m<e;m++){for(w=(m+.5)*f+h,B=Math.max(0,Math.floor(w-p)),y=Math.min(t-1,Math.ceil(w+p)),E=y-B+1,k=new Float32Array(E),b=new Int16Array(E),G=0,D=B,x=0;D<=y;D++,x++)F=c((D+.5-w)*v),G+=F,k[x]=F;for(O=0,x=0;x<k.length;x++)U=k[x]/G,O+=U,b[x]=A(U);for(b[e>>1]+=A(1-O),r=0;r<b.length&&b[r]===0;)r++;if(r<b.length){for(u=b.length-1;u>0&&b[u]===0;)u--;if(s=B+r,l=u-r+1,M[C++]=s,M[C++]=l,!Q)M.set(b.subarray(r,u+1),C),C+=l;else for(x=r;x<=u;x++)M[C++]=b[x]}else M[C++]=0,M[C++]=0}return M}},{"./resize_filter_info":7}],7:[function(d,I,R){I.exports=[{win:.5,filter:function(o){return o>=-.5&&o<.5?1:0}},{win:1,filter:function(o){if(o<=-1||o>=1)return 0;if(o>-11920929e-14&&o<11920929e-14)return 1;var A=o*Math.PI;return Math.sin(A)/A*(.54+.46*Math.cos(A/1))}},{win:2,filter:function(o){if(o<=-2||o>=2)return 0;if(o>-11920929e-14&&o<11920929e-14)return 1;var A=o*Math.PI;return Math.sin(A)/A*Math.sin(A/2)/(A/2)}},{win:3,filter:function(o){if(o<=-3||o>=3)return 0;if(o>-11920929e-14&&o<11920929e-14)return 1;var A=o*Math.PI;return Math.sin(A)/A*Math.sin(A/3)/(A/3)}}]},{}],8:[function(d,I,R){var _=d("./resize_filter_gen");function o(t,e,i){for(var h=3,c=e*i*4|0;h<c;)t[h]=255,h=h+4|0}function A(t){return new Uint8Array(t.buffer,0,t.byteLength)}var n=!0;try{n=new Uint32Array(new Uint8Array([1,0,0,0]).buffer)[0]===1}catch{}function a(t,e,i){if(n){e.set(A(t),i);return}for(var h=i,c=0;c<t.length;c++){var f=t[c];e[h++]=f&255,e[h++]=f>>8&255}}I.exports=function(e){var i=e.src,h=e.width,c=e.height,f=e.toWidth,v=e.toHeight,p=e.scaleX||e.toWidth/e.width,m=e.scaleY||e.toHeight/e.height,w=e.offsetX||0,B=e.offsetY||0,y=e.dest||new Uint8Array(f*v*4),E=typeof e.quality>"u"?3:e.quality,k=e.alpha||!1,b=_(E,h,f,p,w),G=_(E,c,v,m,B),D=0,x=this.__align(D+Math.max(i.byteLength,y.byteLength)),F=this.__align(x+c*f*4),O=this.__align(F+b.byteLength),U=O+G.byteLength,r=this.__instance("resize",U),u=new Uint8Array(this.__memory.buffer),s=new Uint32Array(this.__memory.buffer),l=new Uint32Array(i.buffer);s.set(l),a(b,u,F),a(G,u,O);var g=r.exports.convolveHV||r.exports._convolveHV;g(F,O,x,h,c,f,v);var M=new Uint32Array(y.buffer);return M.set(new Uint32Array(this.__memory.buffer,0,v*f)),k||o(y,f,v),y}},{"./resize_filter_gen":6}],9:[function(d,I,R){I.exports={name:"unsharp_mask",fn:d("./unsharp_mask"),wasm_fn:d("./unsharp_mask_wasm"),wasm_src:d("./unsharp_mask_wasm_base64")}},{"./unsharp_mask":10,"./unsharp_mask_wasm":11,"./unsharp_mask_wasm_base64":12}],10:[function(d,I,R){var _=d("glur/mono16");function o(A,n,a){for(var t=n*a,e=new Uint16Array(t),i,h,c,f,v=0;v<t;v++)i=A[4*v],h=A[4*v+1],c=A[4*v+2],f=i>=h&&i>=c?i:h>=c&&h>=i?h:c,e[v]=f<<8;return e}I.exports=function(n,a,t,e,i,h){var c,f,v,p,m;if(!(e===0||i<.5)){i>2&&(i=2);var w=o(n,a,t),B=new Uint16Array(w);_(B,a,t,i);for(var y=e/100*4096+.5|0,E=h<<8,k=a*t,b=0;b<k;b++)c=w[b],p=c-B[b],Math.abs(p)>=E&&(f=c+(y*p+2048>>12),f=f>65280?65280:f,f=f<0?0:f,c=c!==0?c:1,v=(f<<12)/c|0,m=b*4,n[m]=n[m]*v+2048>>12,n[m+1]=n[m+1]*v+2048>>12,n[m+2]=n[m+2]*v+2048>>12)}}},{"glur/mono16":18}],11:[function(d,I,R){I.exports=function(o,A,n,a,t,e){if(!(a===0||t<.5)){t>2&&(t=2);var i=A*n,h=i*4,c=i*2,f=i*2,v=Math.max(A,n)*4,p=8*4,m=0,w=h,B=w+c,y=B+f,E=y+f,k=E+v,b=this.__instance("unsharp_mask",h+c+f*2+v+p,{exp:Math.exp}),G=new Uint32Array(o.buffer),D=new Uint32Array(this.__memory.buffer);D.set(G);var x=b.exports.hsv_v16||b.exports._hsv_v16;x(m,w,A,n),x=b.exports.blurMono16||b.exports._blurMono16,x(w,B,y,E,k,A,n,t),x=b.exports.unsharp||b.exports._unsharp,x(m,m,w,B,A,n,a,e),G.set(new Uint32Array(this.__memory.buffer,0,i))}}},{}],12:[function(d,I,R){I.exports="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"},{}],13:[function(d,I,R){var _=100;function o(A,n){this.create=A,this.available=[],this.acquired={},this.lastId=1,this.timeoutId=0,this.idle=n||2e3}o.prototype.acquire=function(){var A=this,n;return this.available.length!==0?n=this.available.pop():(n=this.create(),n.id=this.lastId++,n.release=function(){return A.release(n)}),this.acquired[n.id]=n,n},o.prototype.release=function(A){var n=this;delete this.acquired[A.id],A.lastUsed=Date.now(),this.available.push(A),this.timeoutId===0&&(this.timeoutId=setTimeout(function(){return n.gc()},_))},o.prototype.gc=function(){var A=this,n=Date.now();this.available=this.available.filter(function(a){return n-a.lastUsed>A.idle?(a.destroy(),!1):!0}),this.available.length!==0?this.timeoutId=setTimeout(function(){return A.gc()},_):this.timeoutId=0},I.exports=o},{}],14:[function(d,I,R){var _=2;I.exports=function(A,n,a,t,e,i){var h=a/A,c=t/n,f=(2*i+_+1)/e;if(f>.5)return[[a,t]];var v=Math.ceil(Math.log(Math.min(h,c))/Math.log(f));if(v<=1)return[[a,t]];for(var p=[],m=0;m<v;m++){var w=Math.round(Math.pow(Math.pow(A,v-m-1)*Math.pow(a,m+1),1/v)),B=Math.round(Math.pow(Math.pow(n,v-m-1)*Math.pow(t,m+1),1/v));p.push([w,B])}return p}},{}],15:[function(d,I,R){var _=1e-5;function o(n){var a=Math.round(n);return Math.abs(n-a)<_?a:Math.floor(n)}function A(n){var a=Math.round(n);return Math.abs(n-a)<_?a:Math.ceil(n)}I.exports=function(a){var t=a.toWidth/a.width,e=a.toHeight/a.height,i=o(a.srcTileSize*t)-2*a.destTileBorder,h=o(a.srcTileSize*e)-2*a.destTileBorder;if(i<1||h<1)throw new Error("Internal error in pica: target tile width/height is too small.");var c,f,v,p,m,w,B=[],y;for(p=0;p<a.toHeight;p+=h)for(v=0;v<a.toWidth;v+=i)c=v-a.destTileBorder,c<0&&(c=0),m=v+i+a.destTileBorder-c,c+m>=a.toWidth&&(m=a.toWidth-c),f=p-a.destTileBorder,f<0&&(f=0),w=p+h+a.destTileBorder-f,f+w>=a.toHeight&&(w=a.toHeight-f),y={toX:c,toY:f,toWidth:m,toHeight:w,toInnerX:v,toInnerY:p,toInnerWidth:i,toInnerHeight:h,offsetX:c/t-o(c/t),offsetY:f/e-o(f/e),scaleX:t,scaleY:e,x:o(c/t),y:o(f/e),width:A(m/t),height:A(w/e)},B.push(y);return B}},{}],16:[function(d,I,R){function _(o){return Object.prototype.toString.call(o)}I.exports.isCanvas=function(A){var n=_(A);return n==="[object HTMLCanvasElement]"||n==="[object OffscreenCanvas]"||n==="[object Canvas]"},I.exports.isImage=function(A){return _(A)==="[object HTMLImageElement]"},I.exports.isImageBitmap=function(A){return _(A)==="[object ImageBitmap]"},I.exports.limiter=function(A){var n=0,a=[];function t(){n<A&&a.length&&(n++,a.shift()())}return function(i){return new Promise(function(h,c){a.push(function(){i().then(function(f){h(f),n--,t()},function(f){c(f),n--,t()})}),t()})}},I.exports.cib_quality_name=function(A){switch(A){case 0:return"pixelated";case 1:return"low";case 2:return"medium"}return"high"},I.exports.cib_support=function(A){return Promise.resolve().then(function(){if(typeof createImageBitmap>"u")return!1;var n=A(100,100);return createImageBitmap(n,0,0,100,100,{resizeWidth:10,resizeHeight:10,resizeQuality:"high"}).then(function(a){var t=a.width===10;return a.close(),n=null,t})}).catch(function(){return!1})},I.exports.worker_offscreen_canvas_support=function(){return new Promise(function(A,n){if(typeof OffscreenCanvas>"u"){A(!1);return}function a(i){if(typeof createImageBitmap>"u"){i.postMessage(!1);return}Promise.resolve().then(function(){var h=new OffscreenCanvas(10,10),c=h.getContext("2d");return c.rect(0,0,1,1),createImageBitmap(h,0,0,1,1)}).then(function(){return i.postMessage(!0)},function(){return i.postMessage(!1)})}var t=btoa("(".concat(a.toString(),")(self);")),e=new Worker("data:text/javascript;base64,".concat(t));e.onmessage=function(i){return A(i.data)},e.onerror=n}).then(function(A){return A},function(){return!1})},I.exports.can_use_canvas=function(A){var n=!1;try{var a=A(2,1),t=a.getContext("2d"),e=t.createImageData(2,1);e.data[0]=12,e.data[1]=23,e.data[2]=34,e.data[3]=255,e.data[4]=45,e.data[5]=56,e.data[6]=67,e.data[7]=255,t.putImageData(e,0,0),e=null,e=t.getImageData(0,0,2,1),e.data[0]===12&&e.data[1]===23&&e.data[2]===34&&e.data[3]===255&&e.data[4]===45&&e.data[5]===56&&e.data[6]===67&&e.data[7]===255&&(n=!0)}catch{}return n},I.exports.cib_can_use_region=function(){return new Promise(function(A){if(typeof createImageBitmap>"u"){A(!1);return}var n=new Image;n.src="data:image/jpeg;base64,/9j/4QBiRXhpZgAATU0AKgAAAAgABQESAAMAAAABAAYAAAEaAAUAAAABAAAASgEbAAUAAAABAAAAUgEoAAMAAAABAAIAAAITAAMAAAABAAEAAAAAAAAAAABIAAAAAQAAAEgAAAAB/9sAQwAEAwMEAwMEBAMEBQQEBQYKBwYGBgYNCQoICg8NEBAPDQ8OERMYFBESFxIODxUcFRcZGRsbGxAUHR8dGh8YGhsa/9sAQwEEBQUGBQYMBwcMGhEPERoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoaGhoa/8IAEQgAAQACAwERAAIRAQMRAf/EABQAAQAAAAAAAAAAAAAAAAAAAAf/xAAUAQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAF/P//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAQUCf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Bf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Bf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEABj8Cf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8hf//aAAwDAQACAAMAAAAQH//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQMBAT8Qf//EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQIBAT8Qf//EABQQAQAAAAAAAAAAAAAAAAAAAAD/2gAIAQEAAT8Qf//Z",n.onload=function(){createImageBitmap(n,0,0,n.width,n.height).then(function(a){a.width===n.width&&a.height===n.height?A(!0):A(!1)},function(){return A(!1)})},n.onerror=function(){return A(!1)}})}},{}],17:[function(d,I,R){I.exports=function(){var _=d("./mathlib"),o;onmessage=function(n){var a=n.data.opts;if(!a.src&&a.srcBitmap){var t=new OffscreenCanvas(a.width,a.height),e=t.getContext("2d",{alpha:!!a.alpha});e.drawImage(a.srcBitmap,0,0),a.src=e.getImageData(0,0,a.width,a.height).data,t.width=t.height=0,t=null,a.srcBitmap.close(),a.srcBitmap=null}o||(o=new _(n.data.features));var i=o.resizeAndUnsharp(a);postMessage({data:i},[i.buffer])}}},{"./mathlib":1}],18:[function(d,I,R){var _,o,A,n,a,t,e,i;function h(v){v<.5&&(v=.5);var p=Math.exp(.726*.726)/v,m=Math.exp(-p),w=Math.exp(-2*p),B=(1-m)*(1-m)/(1+2*p*m-w);return _=B,o=B*(p-1)*m,A=B*(p+1)*m,n=-B*w,a=2*m,t=-w,e=(_+o)/(1-a-t),i=(A+n)/(1-a-t),new Float32Array([_,o,A,n,a,t,e,i])}function c(v,p,m,w,B,y){var E,k,b,G,D,x,F,O,U,r,u,s,l,g;for(U=0;U<y;U++){for(x=U*B,F=U,O=0,E=v[x],D=E*w[6],G=D,u=w[0],s=w[1],l=w[4],g=w[5],r=0;r<B;r++)k=v[x],b=k*u+E*s+G*l+D*g,D=G,G=b,E=k,m[O]=G,O++,x++;for(x--,O--,F+=y*(B-1),E=v[x],D=E*w[7],G=D,k=E,u=w[2],s=w[3],r=B-1;r>=0;r--)b=k*u+E*s+G*l+D*g,D=G,G=b,E=k,k=v[x],p[F]=m[O]+G,x--,O--,F-=y}}function f(v,p,m,w){if(w){var B=new Uint16Array(v.length),y=new Float32Array(Math.max(p,m)),E=h(w);c(v,B,y,E,p,m),c(B,v,y,E,m,p)}}I.exports=f},{}],19:[function(d,I,R){typeof Object.create=="function"?I.exports=function(o,A){A&&(o.super_=A,o.prototype=Object.create(A.prototype,{constructor:{value:o,enumerable:!1,writable:!0,configurable:!0}}))}:I.exports=function(o,A){if(A){o.super_=A;var n=function(){};n.prototype=A.prototype,o.prototype=new n,o.prototype.constructor=o}}},{}],20:[function(d,I,R){var _=d("object-assign"),o=d("./lib/base64decode"),A=d("./lib/wa_detect"),n={js:!0,wasm:!0};function a(t){if(!(this instanceof a))return new a(t);var e=_({},n,t||{});if(this.options=e,this.__cache={},this.__init_promise=null,this.__modules=e.modules||{},this.__memory=null,this.__wasm={},this.__isLE=new Uint32Array(new Uint8Array([1,0,0,0]).buffer)[0]===1,!this.options.js&&!this.options.wasm)throw new Error('mathlib: at least "js" or "wasm" should be enabled')}a.prototype.has_wasm=A,a.prototype.use=function(t){return this.__modules[t.name]=t,this.options.wasm&&this.has_wasm()&&t.wasm_fn?this[t.name]=t.wasm_fn:this[t.name]=t.fn,this},a.prototype.init=function(){if(this.__init_promise)return this.__init_promise;if(!this.options.js&&this.options.wasm&&!this.has_wasm())return Promise.reject(new Error(`mathlib: only "wasm" was enabled, but it's not supported`));var t=this;return this.__init_promise=Promise.all(Object.keys(t.__modules).map(function(e){var i=t.__modules[e];return!t.options.wasm||!t.has_wasm()||!i.wasm_fn||t.__wasm[e]?null:WebAssembly.compile(t.__base64decode(i.wasm_src)).then(function(h){t.__wasm[e]=h})})).then(function(){return t}),this.__init_promise},a.prototype.__base64decode=o,a.prototype.__reallocate=function(e){if(!this.__memory)return this.__memory=new WebAssembly.Memory({initial:Math.ceil(e/(64*1024))}),this.__memory;var i=this.__memory.buffer.byteLength;return i<e&&this.__memory.grow(Math.ceil((e-i)/(64*1024))),this.__memory},a.prototype.__instance=function(e,i,h){if(i&&this.__reallocate(i),!this.__wasm[e]){var c=this.__modules[e];this.__wasm[e]=new WebAssembly.Module(this.__base64decode(c.wasm_src))}if(!this.__cache[e]){var f={memoryBase:0,memory:this.__memory,tableBase:0,table:new WebAssembly.Table({initial:0,element:"anyfunc"})};this.__cache[e]=new WebAssembly.Instance(this.__wasm[e],{env:_(f,h||{})})}return this.__cache[e]},a.prototype.__align=function(e,i){i=i||8;var h=e%i;return e+(h?i-h:0)},I.exports=a},{"./lib/base64decode":21,"./lib/wa_detect":22,"object-assign":23}],21:[function(d,I,R){var _="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";I.exports=function(A){for(var n=A.replace(/[\r\n=]/g,""),a=n.length,t=new Uint8Array(a*3>>2),e=0,i=0,h=0;h<a;h++)h%4===0&&h&&(t[i++]=e>>16&255,t[i++]=e>>8&255,t[i++]=e&255),e=e<<6|_.indexOf(n.charAt(h));var c=a%4*6;return c===0?(t[i++]=e>>16&255,t[i++]=e>>8&255,t[i++]=e&255):c===18?(t[i++]=e>>10&255,t[i++]=e>>2&255):c===12&&(t[i++]=e>>4&255),t}},{}],22:[function(d,I,R){var _;I.exports=function(){if(typeof _<"u"||(_=!1,typeof WebAssembly>"u"))return _;try{var A=new Uint8Array([0,97,115,109,1,0,0,0,1,6,1,96,1,127,1,127,3,2,1,0,5,3,1,0,1,7,8,1,4,116,101,115,116,0,0,10,16,1,14,0,32,0,65,1,54,2,0,32,0,40,2,0,11]),n=new WebAssembly.Module(A),a=new WebAssembly.Instance(n,{});return a.exports.test(4)!==0&&(_=!0),_}catch{}return _}},{}],23:[function(d,I,R){var _=Object.getOwnPropertySymbols,o=Object.prototype.hasOwnProperty,A=Object.prototype.propertyIsEnumerable;function n(t){if(t==null)throw new TypeError("Object.assign cannot be called with null or undefined");return Object(t)}function a(){try{if(!Object.assign)return!1;var t=new String("abc");if(t[5]="de",Object.getOwnPropertyNames(t)[0]==="5")return!1;for(var e={},i=0;i<10;i++)e["_"+String.fromCharCode(i)]=i;var h=Object.getOwnPropertyNames(e).map(function(f){return e[f]});if(h.join("")!=="0123456789")return!1;var c={};return"abcdefghijklmnopqrst".split("").forEach(function(f){c[f]=f}),Object.keys(Object.assign({},c)).join("")==="abcdefghijklmnopqrst"}catch{return!1}}I.exports=a()?Object.assign:function(t,e){for(var i,h=n(t),c,f=1;f<arguments.length;f++){i=Object(arguments[f]);for(var v in i)o.call(i,v)&&(h[v]=i[v]);if(_){c=_(i);for(var p=0;p<c.length;p++)A.call(i,c[p])&&(h[c[p]]=i[c[p]])}}return h}},{}],24:[function(d,I,R){var _=arguments[3],o=arguments[4],A=arguments[5],n=JSON.stringify;I.exports=function(a,t){for(var e,i=Object.keys(A),h=0,c=i.length;h<c;h++){var f=i[h],v=A[f].exports;if(v===a||v&&v.default===a){e=f;break}}if(!e){e=Math.floor(Math.pow(16,8)*Math.random()).toString(16);for(var p={},h=0,c=i.length;h<c;h++){var f=i[h];p[f]=f}o[e]=["function(require,module,exports){"+a+"(self); }",p]}var m=Math.floor(Math.pow(16,8)*Math.random()).toString(16),w={};w[e]=e,o[m]=["function(require,module,exports){var f = require("+n(e)+");(f.default ? f.default : f)(self);}",w];var B={};y(m);function y(x){B[x]=!0;for(var F in o[x][1]){var O=o[x][1][F];B[O]||y(O)}}var E="("+_+")({"+Object.keys(B).map(function(x){return n(x)+":["+o[x][0]+","+n(o[x][1])+"]"}).join(",")+"},{},["+n(m)+"])",k=window.URL||window.webkitURL||window.mozURL||window.msURL,b=new Blob([E],{type:"text/javascript"});if(t&&t.bare)return b;var G=k.createObjectURL(b),D=new Worker(G);return D.objectURL=G,D}},{}],"/index.js":[function(d,I,R){function _(r,u){return t(r)||a(r,u)||A(r,u)||o()}function o(){throw new TypeError(`Invalid attempt to destructure non-iterable instance.
In order to be iterable, non-array objects must have a [Symbol.iterator]() method.`)}function A(r,u){if(r){if(typeof r=="string")return n(r,u);var s=Object.prototype.toString.call(r).slice(8,-1);if(s==="Object"&&r.constructor&&(s=r.constructor.name),s==="Map"||s==="Set")return Array.from(r);if(s==="Arguments"||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(s))return n(r,u)}}function n(r,u){(u==null||u>r.length)&&(u=r.length);for(var s=0,l=new Array(u);s<u;s++)l[s]=r[s];return l}function a(r,u){var s=r==null?null:typeof Symbol<"u"&&r[Symbol.iterator]||r["@@iterator"];if(s!=null){var l=[],g=!0,M=!1,C,Q;try{for(s=s.call(r);!(g=(C=s.next()).done)&&(l.push(C.value),!(u&&l.length===u));g=!0);}catch(j){M=!0,Q=j}finally{try{!g&&s.return!=null&&s.return()}finally{if(M)throw Q}}return l}}function t(r){if(Array.isArray(r))return r}var e=d("object-assign"),i=d("webworkify"),h=d("./lib/mathlib"),c=d("./lib/pool"),f=d("./lib/utils"),v=d("./lib/worker"),p=d("./lib/stepper"),m=d("./lib/tiler"),w={},B=!1;try{typeof navigator<"u"&&navigator.userAgent&&(B=navigator.userAgent.indexOf("Safari")>=0)}catch{}var y=1;typeof navigator<"u"&&(y=Math.min(navigator.hardwareConcurrency||1,4));var E={tile:1024,concurrency:y,features:["js","wasm","ww"],idle:2e3,createCanvas:function(u,s){var l=document.createElement("canvas");return l.width=u,l.height=s,l}},k={quality:3,alpha:!1,unsharpAmount:0,unsharpRadius:0,unsharpThreshold:0},b=!1,G=!1,D=!1,x=!1,F=!1;function O(){return{value:i(v),destroy:function(){if(this.value.terminate(),typeof window<"u"){var u=window.URL||window.webkitURL||window.mozURL||window.msURL;u&&u.revokeObjectURL&&this.value.objectURL&&u.revokeObjectURL(this.value.objectURL)}}}}function U(r){if(!(this instanceof U))return new U(r);this.options=e({},E,r||{});var u="lk_".concat(this.options.concurrency);this.__limit=w[u]||f.limiter(this.options.concurrency),w[u]||(w[u]=this.__limit),this.features={js:!1,wasm:!1,cib:!1,ww:!1},this.__workersPool=null,this.__requested_features=[],this.__mathlib=null}U.prototype.init=function(){var r=this;if(this.__initPromise)return this.__initPromise;if(typeof ImageData<"u"&&typeof Uint8ClampedArray<"u")try{new ImageData(new Uint8ClampedArray(400),10,10),b=!0}catch{}typeof ImageBitmap<"u"&&(ImageBitmap.prototype&&ImageBitmap.prototype.close?G=!0:this.debug("ImageBitmap does not support .close(), disabled"));var u=this.options.features.slice();if(u.indexOf("all")>=0&&(u=["cib","wasm","js","ww"]),this.__requested_features=u,this.__mathlib=new h(u),u.indexOf("ww")>=0&&typeof window<"u"&&"Worker"in window)try{var s=d("webworkify")(function(){});s.terminate(),this.features.ww=!0;var l="wp_".concat(JSON.stringify(this.options));w[l]?this.__workersPool=w[l]:(this.__workersPool=new c(O,this.options.idle),w[l]=this.__workersPool)}catch{}var g=this.__mathlib.init().then(function(j){e(r.features,j.features)}),M;G?M=f.cib_support(this.options.createCanvas).then(function(j){if(r.features.cib&&u.indexOf("cib")<0){r.debug("createImageBitmap() resize supported, but disabled by config");return}u.indexOf("cib")>=0&&(r.features.cib=j)}):M=Promise.resolve(!1),D=f.can_use_canvas(this.options.createCanvas);var C;G&&b&&u.indexOf("ww")!==-1?C=f.worker_offscreen_canvas_support():C=Promise.resolve(!1),C=C.then(function(j){x=j});var Q=f.cib_can_use_region().then(function(j){F=j});return this.__initPromise=Promise.all([g,M,C,Q]).then(function(){return r}),this.__initPromise},U.prototype.__invokeResize=function(r,u){var s=this;return u.__mathCache=u.__mathCache||{},Promise.resolve().then(function(){return s.features.ww?new Promise(function(l,g){var M=s.__workersPool.acquire();u.cancelToken&&u.cancelToken.catch(function(Q){return g(Q)}),M.value.onmessage=function(Q){M.release(),Q.data.err?g(Q.data.err):l(Q.data)};var C=[];r.src&&C.push(r.src.buffer),r.srcBitmap&&C.push(r.srcBitmap),M.value.postMessage({opts:r,features:s.__requested_features,preload:{wasm_nodule:s.__mathlib.__}},C)}):{data:s.__mathlib.resizeAndUnsharp(r,u.__mathCache)}})},U.prototype.__extractTileData=function(r,u,s,l,g){if(this.features.ww&&x&&(f.isCanvas(u)||F))return this.debug("Create tile for OffscreenCanvas"),createImageBitmap(l.srcImageBitmap||u,r.x,r.y,r.width,r.height).then(function(Q){return g.srcBitmap=Q,g});if(f.isCanvas(u))return l.srcCtx||(l.srcCtx=u.getContext("2d",{alpha:!!s.alpha})),this.debug("Get tile pixel data"),g.src=l.srcCtx.getImageData(r.x,r.y,r.width,r.height).data,g;this.debug("Draw tile imageBitmap/image to temporary canvas");var M=this.options.createCanvas(r.width,r.height),C=M.getContext("2d",{alpha:!!s.alpha});return C.globalCompositeOperation="copy",C.drawImage(l.srcImageBitmap||u,r.x,r.y,r.width,r.height,0,0,r.width,r.height),this.debug("Get tile pixel data"),g.src=C.getImageData(0,0,r.width,r.height).data,M.width=M.height=0,g},U.prototype.__landTileData=function(r,u,s){var l;if(this.debug("Convert raw rgba tile result to ImageData"),u.bitmap)return s.toCtx.drawImage(u.bitmap,r.toX,r.toY),null;if(b)l=new ImageData(new Uint8ClampedArray(u.data),r.toWidth,r.toHeight);else if(l=s.toCtx.createImageData(r.toWidth,r.toHeight),l.data.set)l.data.set(u.data);else for(var g=l.data.length-1;g>=0;g--)l.data[g]=u.data[g];return this.debug("Draw tile"),B?s.toCtx.putImageData(l,r.toX,r.toY,r.toInnerX-r.toX,r.toInnerY-r.toY,r.toInnerWidth+1e-5,r.toInnerHeight+1e-5):s.toCtx.putImageData(l,r.toX,r.toY,r.toInnerX-r.toX,r.toInnerY-r.toY,r.toInnerWidth,r.toInnerHeight),null},U.prototype.__tileAndResize=function(r,u,s){var l=this,g={srcCtx:null,srcImageBitmap:null,isImageBitmapReused:!1,toCtx:null},M=function(Q){return l.__limit(function(){if(s.canceled)return s.cancelToken;var j={width:Q.width,height:Q.height,toWidth:Q.toWidth,toHeight:Q.toHeight,scaleX:Q.scaleX,scaleY:Q.scaleY,offsetX:Q.offsetX,offsetY:Q.offsetY,quality:s.quality,alpha:s.alpha,unsharpAmount:s.unsharpAmount,unsharpRadius:s.unsharpRadius,unsharpThreshold:s.unsharpThreshold};return l.debug("Invoke resize math"),Promise.resolve(j).then(function(S){return l.__extractTileData(Q,r,s,g,S)}).then(function(S){return l.debug("Invoke resize math"),l.__invokeResize(S,s)}).then(function(S){return s.canceled?s.cancelToken:(g.srcImageData=null,l.__landTileData(Q,S,g))})})};return Promise.resolve().then(function(){if(g.toCtx=u.getContext("2d",{alpha:!!s.alpha}),f.isCanvas(r))return null;if(f.isImageBitmap(r))return g.srcImageBitmap=r,g.isImageBitmapReused=!0,null;if(f.isImage(r))return G?(l.debug("Decode image via createImageBitmap"),createImageBitmap(r).then(function(C){g.srcImageBitmap=C}).catch(function(C){return null})):null;throw new Error('Pica: ".from" should be Image, Canvas or ImageBitmap')}).then(function(){if(s.canceled)return s.cancelToken;l.debug("Calculate tiles");var C=m({width:s.width,height:s.height,srcTileSize:l.options.tile,toWidth:s.toWidth,toHeight:s.toHeight,destTileBorder:s.__destTileBorder}),Q=C.map(function(S){return M(S)});function j(S){S.srcImageBitmap&&(S.isImageBitmapReused||S.srcImageBitmap.close(),S.srcImageBitmap=null)}return l.debug("Process tiles"),Promise.all(Q).then(function(){return l.debug("Finished!"),j(g),u},function(S){throw j(g),S})})},U.prototype.__processStages=function(r,u,s,l){var g=this;if(l.canceled)return l.cancelToken;var M=r.shift(),C=_(M,2),Q=C[0],j=C[1],S=r.length===0;l=e({},l,{toWidth:Q,toHeight:j,quality:S?l.quality:Math.min(1,l.quality)});var P;return S||(P=this.options.createCanvas(Q,j)),this.__tileAndResize(u,S?s:P,l).then(function(){return S?s:(l.width=Q,l.height=j,g.__processStages(r,P,s,l))}).then(function(L){return P&&(P.width=P.height=0),L})},U.prototype.__resizeViaCreateImageBitmap=function(r,u,s){var l=this,g=u.getContext("2d",{alpha:!!s.alpha});return this.debug("Resize via createImageBitmap()"),createImageBitmap(r,{resizeWidth:s.toWidth,resizeHeight:s.toHeight,resizeQuality:f.cib_quality_name(s.quality)}).then(function(M){if(s.canceled)return s.cancelToken;if(!s.unsharpAmount)return g.drawImage(M,0,0),M.close(),g=null,l.debug("Finished!"),u;l.debug("Unsharp result");var C=l.options.createCanvas(s.toWidth,s.toHeight),Q=C.getContext("2d",{alpha:!!s.alpha});Q.drawImage(M,0,0),M.close();var j=Q.getImageData(0,0,s.toWidth,s.toHeight);return l.__mathlib.unsharp_mask(j.data,s.toWidth,s.toHeight,s.unsharpAmount,s.unsharpRadius,s.unsharpThreshold),g.putImageData(j,0,0),C.width=C.height=0,j=Q=C=g=null,l.debug("Finished!"),u})},U.prototype.resize=function(r,u,s){var l=this;this.debug("Start resize...");var g=e({},k);if(isNaN(s)?s&&(g=e(g,s)):g=e(g,{quality:s}),g.toWidth=u.width,g.toHeight=u.height,g.width=r.naturalWidth||r.width,g.height=r.naturalHeight||r.height,u.width===0||u.height===0)return Promise.reject(new Error("Invalid output size: ".concat(u.width,"x").concat(u.height)));g.unsharpRadius>2&&(g.unsharpRadius=2),g.canceled=!1,g.cancelToken&&(g.cancelToken=g.cancelToken.then(function(C){throw g.canceled=!0,C},function(C){throw g.canceled=!0,C}));var M=3;return g.__destTileBorder=Math.ceil(Math.max(M,2.5*g.unsharpRadius|0)),this.init().then(function(){if(g.canceled)return g.cancelToken;if(l.features.cib)return l.__resizeViaCreateImageBitmap(r,u,g);if(!D){var C=new Error("Pica: cannot use getImageData on canvas, make sure fingerprinting protection isn't enabled");throw C.code="ERR_GET_IMAGE_DATA",C}var Q=p(g.width,g.height,g.toWidth,g.toHeight,l.options.tile,g.__destTileBorder);return l.__processStages(Q,r,u,g)})},U.prototype.resizeBuffer=function(r){var u=this,s=e({},k,r);return this.init().then(function(){return u.__mathlib.resizeAndUnsharp(s)})},U.prototype.toBlob=function(r,u,s){return u=u||"image/png",new Promise(function(l){if(r.toBlob){r.toBlob(function(j){return l(j)},u,s);return}if(r.convertToBlob){l(r.convertToBlob({type:u,quality:s}));return}for(var g=atob(r.toDataURL(u,s).split(",")[1]),M=g.length,C=new Uint8Array(M),Q=0;Q<M;Q++)C[Q]=g.charCodeAt(Q);l(new Blob([C],{type:u}))})},U.prototype.debug=function(){},I.exports=U},{"./lib/mathlib":1,"./lib/pool":13,"./lib/stepper":14,"./lib/tiler":15,"./lib/utils":16,"./lib/worker":17,"object-assign":23,webworkify:24}]},{},[])("/index.js")})})(W);var z=W.exports;const q=N(z),V=X({__proto__:null,default:q},[z]);export{V as p};
//# sourceMappingURL=pica-pdFoeE_7.js.map

(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))r(a);new MutationObserver(a=>{for(const c of a)if(c.type==="childList")for(const f of c.addedNodes)f.tagName==="LINK"&&f.rel==="modulepreload"&&r(f)}).observe(document,{childList:!0,subtree:!0});function n(a){const c={};return a.integrity&&(c.integrity=a.integrity),a.referrerPolicy&&(c.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?c.credentials="include":a.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function r(a){if(a.ep)return;a.ep=!0;const c=n(a);fetch(a.href,c)}})();function Wg(s){return s&&s.__esModule&&Object.prototype.hasOwnProperty.call(s,"default")?s.default:s}var jf={exports:{}},al={},Yf={exports:{}},Tt={};/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Lm;function Tv(){if(Lm)return Tt;Lm=1;var s=Symbol.for("react.element"),e=Symbol.for("react.portal"),n=Symbol.for("react.fragment"),r=Symbol.for("react.strict_mode"),a=Symbol.for("react.profiler"),c=Symbol.for("react.provider"),f=Symbol.for("react.context"),u=Symbol.for("react.forward_ref"),h=Symbol.for("react.suspense"),p=Symbol.for("react.memo"),v=Symbol.for("react.lazy"),x=Symbol.iterator;function y(B){return B===null||typeof B!="object"?null:(B=x&&B[x]||B["@@iterator"],typeof B=="function"?B:null)}var S={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},T=Object.assign,E={};function _(B,oe,be){this.props=B,this.context=oe,this.refs=E,this.updater=be||S}_.prototype.isReactComponent={},_.prototype.setState=function(B,oe){if(typeof B!="object"&&typeof B!="function"&&B!=null)throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,B,oe,"setState")},_.prototype.forceUpdate=function(B){this.updater.enqueueForceUpdate(this,B,"forceUpdate")};function g(){}g.prototype=_.prototype;function F(B,oe,be){this.props=B,this.context=oe,this.refs=E,this.updater=be||S}var D=F.prototype=new g;D.constructor=F,T(D,_.prototype),D.isPureReactComponent=!0;var A=Array.isArray,G=Object.prototype.hasOwnProperty,O={current:null},z={key:!0,ref:!0,__self:!0,__source:!0};function $(B,oe,be){var Q,me={},Me=null,xe=null;if(oe!=null)for(Q in oe.ref!==void 0&&(xe=oe.ref),oe.key!==void 0&&(Me=""+oe.key),oe)G.call(oe,Q)&&!z.hasOwnProperty(Q)&&(me[Q]=oe[Q]);var Re=arguments.length-2;if(Re===1)me.children=be;else if(1<Re){for(var Ne=Array(Re),ke=0;ke<Re;ke++)Ne[ke]=arguments[ke+2];me.children=Ne}if(B&&B.defaultProps)for(Q in Re=B.defaultProps,Re)me[Q]===void 0&&(me[Q]=Re[Q]);return{$$typeof:s,type:B,key:Me,ref:xe,props:me,_owner:O.current}}function L(B,oe){return{$$typeof:s,type:B.type,key:oe,ref:B.ref,props:B.props,_owner:B._owner}}function b(B){return typeof B=="object"&&B!==null&&B.$$typeof===s}function U(B){var oe={"=":"=0",":":"=2"};return"$"+B.replace(/[=:]/g,function(be){return oe[be]})}var N=/\/+/g;function I(B,oe){return typeof B=="object"&&B!==null&&B.key!=null?U(""+B.key):oe.toString(36)}function ae(B,oe,be,Q,me){var Me=typeof B;(Me==="undefined"||Me==="boolean")&&(B=null);var xe=!1;if(B===null)xe=!0;else switch(Me){case"string":case"number":xe=!0;break;case"object":switch(B.$$typeof){case s:case e:xe=!0}}if(xe)return xe=B,me=me(xe),B=Q===""?"."+I(xe,0):Q,A(me)?(be="",B!=null&&(be=B.replace(N,"$&/")+"/"),ae(me,oe,be,"",function(ke){return ke})):me!=null&&(b(me)&&(me=L(me,be+(!me.key||xe&&xe.key===me.key?"":(""+me.key).replace(N,"$&/")+"/")+B)),oe.push(me)),1;if(xe=0,Q=Q===""?".":Q+":",A(B))for(var Re=0;Re<B.length;Re++){Me=B[Re];var Ne=Q+I(Me,Re);xe+=ae(Me,oe,be,Ne,me)}else if(Ne=y(B),typeof Ne=="function")for(B=Ne.call(B),Re=0;!(Me=B.next()).done;)Me=Me.value,Ne=Q+I(Me,Re++),xe+=ae(Me,oe,be,Ne,me);else if(Me==="object")throw oe=String(B),Error("Objects are not valid as a React child (found: "+(oe==="[object Object]"?"object with keys {"+Object.keys(B).join(", ")+"}":oe)+"). If you meant to render a collection of children, use an array instead.");return xe}function re(B,oe,be){if(B==null)return B;var Q=[],me=0;return ae(B,Q,"","",function(Me){return oe.call(be,Me,me++)}),Q}function ce(B){if(B._status===-1){var oe=B._result;oe=oe(),oe.then(function(be){(B._status===0||B._status===-1)&&(B._status=1,B._result=be)},function(be){(B._status===0||B._status===-1)&&(B._status=2,B._result=be)}),B._status===-1&&(B._status=0,B._result=oe)}if(B._status===1)return B._result.default;throw B._result}var fe={current:null},H={transition:null},te={ReactCurrentDispatcher:fe,ReactCurrentBatchConfig:H,ReactCurrentOwner:O};function se(){throw Error("act(...) is not supported in production builds of React.")}return Tt.Children={map:re,forEach:function(B,oe,be){re(B,function(){oe.apply(this,arguments)},be)},count:function(B){var oe=0;return re(B,function(){oe++}),oe},toArray:function(B){return re(B,function(oe){return oe})||[]},only:function(B){if(!b(B))throw Error("React.Children.only expected to receive a single React element child.");return B}},Tt.Component=_,Tt.Fragment=n,Tt.Profiler=a,Tt.PureComponent=F,Tt.StrictMode=r,Tt.Suspense=h,Tt.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=te,Tt.act=se,Tt.cloneElement=function(B,oe,be){if(B==null)throw Error("React.cloneElement(...): The argument must be a React element, but you passed "+B+".");var Q=T({},B.props),me=B.key,Me=B.ref,xe=B._owner;if(oe!=null){if(oe.ref!==void 0&&(Me=oe.ref,xe=O.current),oe.key!==void 0&&(me=""+oe.key),B.type&&B.type.defaultProps)var Re=B.type.defaultProps;for(Ne in oe)G.call(oe,Ne)&&!z.hasOwnProperty(Ne)&&(Q[Ne]=oe[Ne]===void 0&&Re!==void 0?Re[Ne]:oe[Ne])}var Ne=arguments.length-2;if(Ne===1)Q.children=be;else if(1<Ne){Re=Array(Ne);for(var ke=0;ke<Ne;ke++)Re[ke]=arguments[ke+2];Q.children=Re}return{$$typeof:s,type:B.type,key:me,ref:Me,props:Q,_owner:xe}},Tt.createContext=function(B){return B={$$typeof:f,_currentValue:B,_currentValue2:B,_threadCount:0,Provider:null,Consumer:null,_defaultValue:null,_globalName:null},B.Provider={$$typeof:c,_context:B},B.Consumer=B},Tt.createElement=$,Tt.createFactory=function(B){var oe=$.bind(null,B);return oe.type=B,oe},Tt.createRef=function(){return{current:null}},Tt.forwardRef=function(B){return{$$typeof:u,render:B}},Tt.isValidElement=b,Tt.lazy=function(B){return{$$typeof:v,_payload:{_status:-1,_result:B},_init:ce}},Tt.memo=function(B,oe){return{$$typeof:p,type:B,compare:oe===void 0?null:oe}},Tt.startTransition=function(B){var oe=H.transition;H.transition={};try{B()}finally{H.transition=oe}},Tt.unstable_act=se,Tt.useCallback=function(B,oe){return fe.current.useCallback(B,oe)},Tt.useContext=function(B){return fe.current.useContext(B)},Tt.useDebugValue=function(){},Tt.useDeferredValue=function(B){return fe.current.useDeferredValue(B)},Tt.useEffect=function(B,oe){return fe.current.useEffect(B,oe)},Tt.useId=function(){return fe.current.useId()},Tt.useImperativeHandle=function(B,oe,be){return fe.current.useImperativeHandle(B,oe,be)},Tt.useInsertionEffect=function(B,oe){return fe.current.useInsertionEffect(B,oe)},Tt.useLayoutEffect=function(B,oe){return fe.current.useLayoutEffect(B,oe)},Tt.useMemo=function(B,oe){return fe.current.useMemo(B,oe)},Tt.useReducer=function(B,oe,be){return fe.current.useReducer(B,oe,be)},Tt.useRef=function(B){return fe.current.useRef(B)},Tt.useState=function(B){return fe.current.useState(B)},Tt.useSyncExternalStore=function(B,oe,be){return fe.current.useSyncExternalStore(B,oe,be)},Tt.useTransition=function(){return fe.current.useTransition()},Tt.version="18.3.1",Tt}var Dm;function Eh(){return Dm||(Dm=1,Yf.exports=Tv()),Yf.exports}/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Im;function wv(){if(Im)return al;Im=1;var s=Eh(),e=Symbol.for("react.element"),n=Symbol.for("react.fragment"),r=Object.prototype.hasOwnProperty,a=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner,c={key:!0,ref:!0,__self:!0,__source:!0};function f(u,h,p){var v,x={},y=null,S=null;p!==void 0&&(y=""+p),h.key!==void 0&&(y=""+h.key),h.ref!==void 0&&(S=h.ref);for(v in h)r.call(h,v)&&!c.hasOwnProperty(v)&&(x[v]=h[v]);if(u&&u.defaultProps)for(v in h=u.defaultProps,h)x[v]===void 0&&(x[v]=h[v]);return{$$typeof:e,type:u,key:y,ref:S,props:x,_owner:a.current}}return al.Fragment=n,al.jsx=f,al.jsxs=f,al}var Um;function Rv(){return Um||(Um=1,jf.exports=wv()),jf.exports}var ue=Rv(),st=Eh();const kn=Wg(st);var Ac={},qf={exports:{}},hi={},$f={exports:{}},Kf={};/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Nm;function Av(){return Nm||(Nm=1,(function(s){function e(H,te){var se=H.length;H.push(te);e:for(;0<se;){var B=se-1>>>1,oe=H[B];if(0<a(oe,te))H[B]=te,H[se]=oe,se=B;else break e}}function n(H){return H.length===0?null:H[0]}function r(H){if(H.length===0)return null;var te=H[0],se=H.pop();if(se!==te){H[0]=se;e:for(var B=0,oe=H.length,be=oe>>>1;B<be;){var Q=2*(B+1)-1,me=H[Q],Me=Q+1,xe=H[Me];if(0>a(me,se))Me<oe&&0>a(xe,me)?(H[B]=xe,H[Me]=se,B=Me):(H[B]=me,H[Q]=se,B=Q);else if(Me<oe&&0>a(xe,se))H[B]=xe,H[Me]=se,B=Me;else break e}}return te}function a(H,te){var se=H.sortIndex-te.sortIndex;return se!==0?se:H.id-te.id}if(typeof performance=="object"&&typeof performance.now=="function"){var c=performance;s.unstable_now=function(){return c.now()}}else{var f=Date,u=f.now();s.unstable_now=function(){return f.now()-u}}var h=[],p=[],v=1,x=null,y=3,S=!1,T=!1,E=!1,_=typeof setTimeout=="function"?setTimeout:null,g=typeof clearTimeout=="function"?clearTimeout:null,F=typeof setImmediate<"u"?setImmediate:null;typeof navigator<"u"&&navigator.scheduling!==void 0&&navigator.scheduling.isInputPending!==void 0&&navigator.scheduling.isInputPending.bind(navigator.scheduling);function D(H){for(var te=n(p);te!==null;){if(te.callback===null)r(p);else if(te.startTime<=H)r(p),te.sortIndex=te.expirationTime,e(h,te);else break;te=n(p)}}function A(H){if(E=!1,D(H),!T)if(n(h)!==null)T=!0,ce(G);else{var te=n(p);te!==null&&fe(A,te.startTime-H)}}function G(H,te){T=!1,E&&(E=!1,g($),$=-1),S=!0;var se=y;try{for(D(te),x=n(h);x!==null&&(!(x.expirationTime>te)||H&&!U());){var B=x.callback;if(typeof B=="function"){x.callback=null,y=x.priorityLevel;var oe=B(x.expirationTime<=te);te=s.unstable_now(),typeof oe=="function"?x.callback=oe:x===n(h)&&r(h),D(te)}else r(h);x=n(h)}if(x!==null)var be=!0;else{var Q=n(p);Q!==null&&fe(A,Q.startTime-te),be=!1}return be}finally{x=null,y=se,S=!1}}var O=!1,z=null,$=-1,L=5,b=-1;function U(){return!(s.unstable_now()-b<L)}function N(){if(z!==null){var H=s.unstable_now();b=H;var te=!0;try{te=z(!0,H)}finally{te?I():(O=!1,z=null)}}else O=!1}var I;if(typeof F=="function")I=function(){F(N)};else if(typeof MessageChannel<"u"){var ae=new MessageChannel,re=ae.port2;ae.port1.onmessage=N,I=function(){re.postMessage(null)}}else I=function(){_(N,0)};function ce(H){z=H,O||(O=!0,I())}function fe(H,te){$=_(function(){H(s.unstable_now())},te)}s.unstable_IdlePriority=5,s.unstable_ImmediatePriority=1,s.unstable_LowPriority=4,s.unstable_NormalPriority=3,s.unstable_Profiling=null,s.unstable_UserBlockingPriority=2,s.unstable_cancelCallback=function(H){H.callback=null},s.unstable_continueExecution=function(){T||S||(T=!0,ce(G))},s.unstable_forceFrameRate=function(H){0>H||125<H?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):L=0<H?Math.floor(1e3/H):5},s.unstable_getCurrentPriorityLevel=function(){return y},s.unstable_getFirstCallbackNode=function(){return n(h)},s.unstable_next=function(H){switch(y){case 1:case 2:case 3:var te=3;break;default:te=y}var se=y;y=te;try{return H()}finally{y=se}},s.unstable_pauseExecution=function(){},s.unstable_requestPaint=function(){},s.unstable_runWithPriority=function(H,te){switch(H){case 1:case 2:case 3:case 4:case 5:break;default:H=3}var se=y;y=H;try{return te()}finally{y=se}},s.unstable_scheduleCallback=function(H,te,se){var B=s.unstable_now();switch(typeof se=="object"&&se!==null?(se=se.delay,se=typeof se=="number"&&0<se?B+se:B):se=B,H){case 1:var oe=-1;break;case 2:oe=250;break;case 5:oe=1073741823;break;case 4:oe=1e4;break;default:oe=5e3}return oe=se+oe,H={id:v++,callback:te,priorityLevel:H,startTime:se,expirationTime:oe,sortIndex:-1},se>B?(H.sortIndex=se,e(p,H),n(h)===null&&H===n(p)&&(E?(g($),$=-1):E=!0,fe(A,se-B))):(H.sortIndex=oe,e(h,H),T||S||(T=!0,ce(G))),H},s.unstable_shouldYield=U,s.unstable_wrapCallback=function(H){var te=y;return function(){var se=y;y=te;try{return H.apply(this,arguments)}finally{y=se}}}})(Kf)),Kf}var Fm;function bv(){return Fm||(Fm=1,$f.exports=Av()),$f.exports}/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */var Om;function Cv(){if(Om)return hi;Om=1;var s=Eh(),e=bv();function n(t){for(var i="https://reactjs.org/docs/error-decoder.html?invariant="+t,o=1;o<arguments.length;o++)i+="&args[]="+encodeURIComponent(arguments[o]);return"Minified React error #"+t+"; visit "+i+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}var r=new Set,a={};function c(t,i){f(t,i),f(t+"Capture",i)}function f(t,i){for(a[t]=i,t=0;t<i.length;t++)r.add(i[t])}var u=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),h=Object.prototype.hasOwnProperty,p=/^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/,v={},x={};function y(t){return h.call(x,t)?!0:h.call(v,t)?!1:p.test(t)?x[t]=!0:(v[t]=!0,!1)}function S(t,i,o,l){if(o!==null&&o.type===0)return!1;switch(typeof i){case"function":case"symbol":return!0;case"boolean":return l?!1:o!==null?!o.acceptsBooleans:(t=t.toLowerCase().slice(0,5),t!=="data-"&&t!=="aria-");default:return!1}}function T(t,i,o,l){if(i===null||typeof i>"u"||S(t,i,o,l))return!0;if(l)return!1;if(o!==null)switch(o.type){case 3:return!i;case 4:return i===!1;case 5:return isNaN(i);case 6:return isNaN(i)||1>i}return!1}function E(t,i,o,l,d,m,w){this.acceptsBooleans=i===2||i===3||i===4,this.attributeName=l,this.attributeNamespace=d,this.mustUseProperty=o,this.propertyName=t,this.type=i,this.sanitizeURL=m,this.removeEmptyString=w}var _={};"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(t){_[t]=new E(t,0,!1,t,null,!1,!1)}),[["acceptCharset","accept-charset"],["className","class"],["htmlFor","for"],["httpEquiv","http-equiv"]].forEach(function(t){var i=t[0];_[i]=new E(i,1,!1,t[1],null,!1,!1)}),["contentEditable","draggable","spellCheck","value"].forEach(function(t){_[t]=new E(t,2,!1,t.toLowerCase(),null,!1,!1)}),["autoReverse","externalResourcesRequired","focusable","preserveAlpha"].forEach(function(t){_[t]=new E(t,2,!1,t,null,!1,!1)}),"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(t){_[t]=new E(t,3,!1,t.toLowerCase(),null,!1,!1)}),["checked","multiple","muted","selected"].forEach(function(t){_[t]=new E(t,3,!0,t,null,!1,!1)}),["capture","download"].forEach(function(t){_[t]=new E(t,4,!1,t,null,!1,!1)}),["cols","rows","size","span"].forEach(function(t){_[t]=new E(t,6,!1,t,null,!1,!1)}),["rowSpan","start"].forEach(function(t){_[t]=new E(t,5,!1,t.toLowerCase(),null,!1,!1)});var g=/[\-:]([a-z])/g;function F(t){return t[1].toUpperCase()}"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(t){var i=t.replace(g,F);_[i]=new E(i,1,!1,t,null,!1,!1)}),"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(t){var i=t.replace(g,F);_[i]=new E(i,1,!1,t,"http://www.w3.org/1999/xlink",!1,!1)}),["xml:base","xml:lang","xml:space"].forEach(function(t){var i=t.replace(g,F);_[i]=new E(i,1,!1,t,"http://www.w3.org/XML/1998/namespace",!1,!1)}),["tabIndex","crossOrigin"].forEach(function(t){_[t]=new E(t,1,!1,t.toLowerCase(),null,!1,!1)}),_.xlinkHref=new E("xlinkHref",1,!1,"xlink:href","http://www.w3.org/1999/xlink",!0,!1),["src","href","action","formAction"].forEach(function(t){_[t]=new E(t,1,!1,t.toLowerCase(),null,!0,!0)});function D(t,i,o,l){var d=_.hasOwnProperty(i)?_[i]:null;(d!==null?d.type!==0:l||!(2<i.length)||i[0]!=="o"&&i[0]!=="O"||i[1]!=="n"&&i[1]!=="N")&&(T(i,o,d,l)&&(o=null),l||d===null?y(i)&&(o===null?t.removeAttribute(i):t.setAttribute(i,""+o)):d.mustUseProperty?t[d.propertyName]=o===null?d.type===3?!1:"":o:(i=d.attributeName,l=d.attributeNamespace,o===null?t.removeAttribute(i):(d=d.type,o=d===3||d===4&&o===!0?"":""+o,l?t.setAttributeNS(l,i,o):t.setAttribute(i,o))))}var A=s.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,G=Symbol.for("react.element"),O=Symbol.for("react.portal"),z=Symbol.for("react.fragment"),$=Symbol.for("react.strict_mode"),L=Symbol.for("react.profiler"),b=Symbol.for("react.provider"),U=Symbol.for("react.context"),N=Symbol.for("react.forward_ref"),I=Symbol.for("react.suspense"),ae=Symbol.for("react.suspense_list"),re=Symbol.for("react.memo"),ce=Symbol.for("react.lazy"),fe=Symbol.for("react.offscreen"),H=Symbol.iterator;function te(t){return t===null||typeof t!="object"?null:(t=H&&t[H]||t["@@iterator"],typeof t=="function"?t:null)}var se=Object.assign,B;function oe(t){if(B===void 0)try{throw Error()}catch(o){var i=o.stack.trim().match(/\n( *(at )?)/);B=i&&i[1]||""}return`
`+B+t}var be=!1;function Q(t,i){if(!t||be)return"";be=!0;var o=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{if(i)if(i=function(){throw Error()},Object.defineProperty(i.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(i,[])}catch(he){var l=he}Reflect.construct(t,[],i)}else{try{i.call()}catch(he){l=he}t.call(i.prototype)}else{try{throw Error()}catch(he){l=he}t()}}catch(he){if(he&&l&&typeof he.stack=="string"){for(var d=he.stack.split(`
`),m=l.stack.split(`
`),w=d.length-1,k=m.length-1;1<=w&&0<=k&&d[w]!==m[k];)k--;for(;1<=w&&0<=k;w--,k--)if(d[w]!==m[k]){if(w!==1||k!==1)do if(w--,k--,0>k||d[w]!==m[k]){var X=`
`+d[w].replace(" at new "," at ");return t.displayName&&X.includes("<anonymous>")&&(X=X.replace("<anonymous>",t.displayName)),X}while(1<=w&&0<=k);break}}}finally{be=!1,Error.prepareStackTrace=o}return(t=t?t.displayName||t.name:"")?oe(t):""}function me(t){switch(t.tag){case 5:return oe(t.type);case 16:return oe("Lazy");case 13:return oe("Suspense");case 19:return oe("SuspenseList");case 0:case 2:case 15:return t=Q(t.type,!1),t;case 11:return t=Q(t.type.render,!1),t;case 1:return t=Q(t.type,!0),t;default:return""}}function Me(t){if(t==null)return null;if(typeof t=="function")return t.displayName||t.name||null;if(typeof t=="string")return t;switch(t){case z:return"Fragment";case O:return"Portal";case L:return"Profiler";case $:return"StrictMode";case I:return"Suspense";case ae:return"SuspenseList"}if(typeof t=="object")switch(t.$$typeof){case U:return(t.displayName||"Context")+".Consumer";case b:return(t._context.displayName||"Context")+".Provider";case N:var i=t.render;return t=t.displayName,t||(t=i.displayName||i.name||"",t=t!==""?"ForwardRef("+t+")":"ForwardRef"),t;case re:return i=t.displayName||null,i!==null?i:Me(t.type)||"Memo";case ce:i=t._payload,t=t._init;try{return Me(t(i))}catch{}}return null}function xe(t){var i=t.type;switch(t.tag){case 24:return"Cache";case 9:return(i.displayName||"Context")+".Consumer";case 10:return(i._context.displayName||"Context")+".Provider";case 18:return"DehydratedFragment";case 11:return t=i.render,t=t.displayName||t.name||"",i.displayName||(t!==""?"ForwardRef("+t+")":"ForwardRef");case 7:return"Fragment";case 5:return i;case 4:return"Portal";case 3:return"Root";case 6:return"Text";case 16:return Me(i);case 8:return i===$?"StrictMode":"Mode";case 22:return"Offscreen";case 12:return"Profiler";case 21:return"Scope";case 13:return"Suspense";case 19:return"SuspenseList";case 25:return"TracingMarker";case 1:case 0:case 17:case 2:case 14:case 15:if(typeof i=="function")return i.displayName||i.name||null;if(typeof i=="string")return i}return null}function Re(t){switch(typeof t){case"boolean":case"number":case"string":case"undefined":return t;case"object":return t;default:return""}}function Ne(t){var i=t.type;return(t=t.nodeName)&&t.toLowerCase()==="input"&&(i==="checkbox"||i==="radio")}function ke(t){var i=Ne(t)?"checked":"value",o=Object.getOwnPropertyDescriptor(t.constructor.prototype,i),l=""+t[i];if(!t.hasOwnProperty(i)&&typeof o<"u"&&typeof o.get=="function"&&typeof o.set=="function"){var d=o.get,m=o.set;return Object.defineProperty(t,i,{configurable:!0,get:function(){return d.call(this)},set:function(w){l=""+w,m.call(this,w)}}),Object.defineProperty(t,i,{enumerable:o.enumerable}),{getValue:function(){return l},setValue:function(w){l=""+w},stopTracking:function(){t._valueTracker=null,delete t[i]}}}}function vt(t){t._valueTracker||(t._valueTracker=ke(t))}function tt(t){if(!t)return!1;var i=t._valueTracker;if(!i)return!0;var o=i.getValue(),l="";return t&&(l=Ne(t)?t.checked?"true":"false":t.value),t=l,t!==o?(i.setValue(t),!0):!1}function _t(t){if(t=t||(typeof document<"u"?document:void 0),typeof t>"u")return null;try{return t.activeElement||t.body}catch{return t.body}}function V(t,i){var o=i.checked;return se({},i,{defaultChecked:void 0,defaultValue:void 0,value:void 0,checked:o??t._wrapperState.initialChecked})}function St(t,i){var o=i.defaultValue==null?"":i.defaultValue,l=i.checked!=null?i.checked:i.defaultChecked;o=Re(i.value!=null?i.value:o),t._wrapperState={initialChecked:l,initialValue:o,controlled:i.type==="checkbox"||i.type==="radio"?i.checked!=null:i.value!=null}}function _e(t,i){i=i.checked,i!=null&&D(t,"checked",i,!1)}function Ue(t,i){_e(t,i);var o=Re(i.value),l=i.type;if(o!=null)l==="number"?(o===0&&t.value===""||t.value!=o)&&(t.value=""+o):t.value!==""+o&&(t.value=""+o);else if(l==="submit"||l==="reset"){t.removeAttribute("value");return}i.hasOwnProperty("value")?Le(t,i.type,o):i.hasOwnProperty("defaultValue")&&Le(t,i.type,Re(i.defaultValue)),i.checked==null&&i.defaultChecked!=null&&(t.defaultChecked=!!i.defaultChecked)}function de(t,i,o){if(i.hasOwnProperty("value")||i.hasOwnProperty("defaultValue")){var l=i.type;if(!(l!=="submit"&&l!=="reset"||i.value!==void 0&&i.value!==null))return;i=""+t._wrapperState.initialValue,o||i===t.value||(t.value=i),t.defaultValue=i}o=t.name,o!==""&&(t.name=""),t.defaultChecked=!!t._wrapperState.initialChecked,o!==""&&(t.name=o)}function Le(t,i,o){(i!=="number"||_t(t.ownerDocument)!==t)&&(o==null?t.defaultValue=""+t._wrapperState.initialValue:t.defaultValue!==""+o&&(t.defaultValue=""+o))}var Se=Array.isArray;function C(t,i,o,l){if(t=t.options,i){i={};for(var d=0;d<o.length;d++)i["$"+o[d]]=!0;for(o=0;o<t.length;o++)d=i.hasOwnProperty("$"+t[o].value),t[o].selected!==d&&(t[o].selected=d),d&&l&&(t[o].defaultSelected=!0)}else{for(o=""+Re(o),i=null,d=0;d<t.length;d++){if(t[d].value===o){t[d].selected=!0,l&&(t[d].defaultSelected=!0);return}i!==null||t[d].disabled||(i=t[d])}i!==null&&(i.selected=!0)}}function R(t,i){if(i.dangerouslySetInnerHTML!=null)throw Error(n(91));return se({},i,{value:void 0,defaultValue:void 0,children:""+t._wrapperState.initialValue})}function W(t,i){var o=i.value;if(o==null){if(o=i.children,i=i.defaultValue,o!=null){if(i!=null)throw Error(n(92));if(Se(o)){if(1<o.length)throw Error(n(93));o=o[0]}i=o}i==null&&(i=""),o=i}t._wrapperState={initialValue:Re(o)}}function ie(t,i){var o=Re(i.value),l=Re(i.defaultValue);o!=null&&(o=""+o,o!==t.value&&(t.value=o),i.defaultValue==null&&t.defaultValue!==o&&(t.defaultValue=o)),l!=null&&(t.defaultValue=""+l)}function ge(t){var i=t.textContent;i===t._wrapperState.initialValue&&i!==""&&i!==null&&(t.value=i)}function pe(t){switch(t){case"svg":return"http://www.w3.org/2000/svg";case"math":return"http://www.w3.org/1998/Math/MathML";default:return"http://www.w3.org/1999/xhtml"}}function Fe(t,i){return t==null||t==="http://www.w3.org/1999/xhtml"?pe(i):t==="http://www.w3.org/2000/svg"&&i==="foreignObject"?"http://www.w3.org/1999/xhtml":t}var Ce,Be=(function(t){return typeof MSApp<"u"&&MSApp.execUnsafeLocalFunction?function(i,o,l,d){MSApp.execUnsafeLocalFunction(function(){return t(i,o,l,d)})}:t})(function(t,i){if(t.namespaceURI!=="http://www.w3.org/2000/svg"||"innerHTML"in t)t.innerHTML=i;else{for(Ce=Ce||document.createElement("div"),Ce.innerHTML="<svg>"+i.valueOf().toString()+"</svg>",i=Ce.firstChild;t.firstChild;)t.removeChild(t.firstChild);for(;i.firstChild;)t.appendChild(i.firstChild)}});function ot(t,i){if(i){var o=t.firstChild;if(o&&o===t.lastChild&&o.nodeType===3){o.nodeValue=i;return}}t.textContent=i}var Te={animationIterationCount:!0,aspectRatio:!0,borderImageOutset:!0,borderImageSlice:!0,borderImageWidth:!0,boxFlex:!0,boxFlexGroup:!0,boxOrdinalGroup:!0,columnCount:!0,columns:!0,flex:!0,flexGrow:!0,flexPositive:!0,flexShrink:!0,flexNegative:!0,flexOrder:!0,gridArea:!0,gridRow:!0,gridRowEnd:!0,gridRowSpan:!0,gridRowStart:!0,gridColumn:!0,gridColumnEnd:!0,gridColumnSpan:!0,gridColumnStart:!0,fontWeight:!0,lineClamp:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,tabSize:!0,widows:!0,zIndex:!0,zoom:!0,fillOpacity:!0,floodOpacity:!0,stopOpacity:!0,strokeDasharray:!0,strokeDashoffset:!0,strokeMiterlimit:!0,strokeOpacity:!0,strokeWidth:!0},Xe=["Webkit","ms","Moz","O"];Object.keys(Te).forEach(function(t){Xe.forEach(function(i){i=i+t.charAt(0).toUpperCase()+t.substring(1),Te[i]=Te[t]})});function it(t,i,o){return i==null||typeof i=="boolean"||i===""?"":o||typeof i!="number"||i===0||Te.hasOwnProperty(t)&&Te[t]?(""+i).trim():i+"px"}function rt(t,i){t=t.style;for(var o in i)if(i.hasOwnProperty(o)){var l=o.indexOf("--")===0,d=it(o,i[o],l);o==="float"&&(o="cssFloat"),l?t.setProperty(o,d):t[o]=d}}var Ye=se({menuitem:!0},{area:!0,base:!0,br:!0,col:!0,embed:!0,hr:!0,img:!0,input:!0,keygen:!0,link:!0,meta:!0,param:!0,source:!0,track:!0,wbr:!0});function mt(t,i){if(i){if(Ye[t]&&(i.children!=null||i.dangerouslySetInnerHTML!=null))throw Error(n(137,t));if(i.dangerouslySetInnerHTML!=null){if(i.children!=null)throw Error(n(60));if(typeof i.dangerouslySetInnerHTML!="object"||!("__html"in i.dangerouslySetInnerHTML))throw Error(n(61))}if(i.style!=null&&typeof i.style!="object")throw Error(n(62))}}function ht(t,i){if(t.indexOf("-")===-1)return typeof i.is=="string";switch(t){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var wt=null;function q(t){return t=t.target||t.srcElement||window,t.correspondingUseElement&&(t=t.correspondingUseElement),t.nodeType===3?t.parentNode:t}var Oe=null,ve=null,ye=null;function He(t){if(t=ja(t)){if(typeof Oe!="function")throw Error(n(280));var i=t.stateNode;i&&(i=Vl(i),Oe(t.stateNode,t.type,i))}}function Ve(t){ve?ye?ye.push(t):ye=[t]:ve=t}function ft(){if(ve){var t=ve,i=ye;if(ye=ve=null,He(t),i)for(t=0;t<i.length;t++)He(i[t])}}function Vt(t,i){return t(i)}function hn(){}var Pt=!1;function Bn(t,i,o){if(Pt)return t(i,o);Pt=!0;try{return Vt(t,i,o)}finally{Pt=!1,(ve!==null||ye!==null)&&(hn(),ft())}}function In(t,i){var o=t.stateNode;if(o===null)return null;var l=Vl(o);if(l===null)return null;o=l[i];e:switch(i){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(l=!l.disabled)||(t=t.type,l=!(t==="button"||t==="input"||t==="select"||t==="textarea")),t=!l;break e;default:t=!1}if(t)return null;if(o&&typeof o!="function")throw Error(n(231,i,typeof o));return o}var $r=!1;if(u)try{var ar={};Object.defineProperty(ar,"passive",{get:function(){$r=!0}}),window.addEventListener("test",ar,ar),window.removeEventListener("test",ar,ar)}catch{$r=!1}function Wi(t,i,o,l,d,m,w,k,X){var he=Array.prototype.slice.call(arguments,3);try{i.apply(o,he)}catch(we){this.onError(we)}}var Xi=!1,Mr=null,Er=!1,lr=null,So={onError:function(t){Xi=!0,Mr=t}};function Kr(t,i,o,l,d,m,w,k,X){Xi=!1,Mr=null,Wi.apply(So,arguments)}function Mo(t,i,o,l,d,m,w,k,X){if(Kr.apply(this,arguments),Xi){if(Xi){var he=Mr;Xi=!1,Mr=null}else throw Error(n(198));Er||(Er=!0,lr=he)}}function Ri(t){var i=t,o=t;if(t.alternate)for(;i.return;)i=i.return;else{t=i;do i=t,(i.flags&4098)!==0&&(o=i.return),t=i.return;while(t)}return i.tag===3?o:null}function Eo(t){if(t.tag===13){var i=t.memoizedState;if(i===null&&(t=t.alternate,t!==null&&(i=t.memoizedState)),i!==null)return i.dehydrated}return null}function To(t){if(Ri(t)!==t)throw Error(n(188))}function Ai(t){var i=t.alternate;if(!i){if(i=Ri(t),i===null)throw Error(n(188));return i!==t?null:t}for(var o=t,l=i;;){var d=o.return;if(d===null)break;var m=d.alternate;if(m===null){if(l=d.return,l!==null){o=l;continue}break}if(d.child===m.child){for(m=d.child;m;){if(m===o)return To(d),t;if(m===l)return To(d),i;m=m.sibling}throw Error(n(188))}if(o.return!==l.return)o=d,l=m;else{for(var w=!1,k=d.child;k;){if(k===o){w=!0,o=d,l=m;break}if(k===l){w=!0,l=d,o=m;break}k=k.sibling}if(!w){for(k=m.child;k;){if(k===o){w=!0,o=m,l=d;break}if(k===l){w=!0,l=m,o=d;break}k=k.sibling}if(!w)throw Error(n(189))}}if(o.alternate!==l)throw Error(n(190))}if(o.tag!==3)throw Error(n(188));return o.stateNode.current===o?t:i}function Us(t){return t=Ai(t),t!==null?bi(t):null}function bi(t){if(t.tag===5||t.tag===6)return t;for(t=t.child;t!==null;){var i=bi(t);if(i!==null)return i;t=t.sibling}return null}var wo=e.unstable_scheduleCallback,M=e.unstable_cancelCallback,j=e.unstable_shouldYield,Z=e.unstable_requestPaint,J=e.unstable_now,K=e.unstable_getCurrentPriorityLevel,Ae=e.unstable_ImmediatePriority,ze=e.unstable_UserBlockingPriority,Ge=e.unstable_NormalPriority,qe=e.unstable_LowPriority,at=e.unstable_IdlePriority,lt=null,$e=null;function Mt(t){if($e&&typeof $e.onCommitFiberRoot=="function")try{$e.onCommitFiberRoot(lt,t,void 0,(t.current.flags&128)===128)}catch{}}var gt=Math.clz32?Math.clz32:At,$t=Math.log,Wt=Math.LN2;function At(t){return t>>>=0,t===0?32:31-($t(t)/Wt|0)|0}var et=64,Qt=4194304;function Et(t){switch(t&-t){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t&4194240;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return t&130023424;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 1073741824;default:return t}}function Sn(t,i){var o=t.pendingLanes;if(o===0)return 0;var l=0,d=t.suspendedLanes,m=t.pingedLanes,w=o&268435455;if(w!==0){var k=w&~d;k!==0?l=Et(k):(m&=w,m!==0&&(l=Et(m)))}else w=o&~d,w!==0?l=Et(w):m!==0&&(l=Et(m));if(l===0)return 0;if(i!==0&&i!==l&&(i&d)===0&&(d=l&-l,m=i&-i,d>=m||d===16&&(m&4194240)!==0))return i;if((l&4)!==0&&(l|=o&16),i=t.entangledLanes,i!==0)for(t=t.entanglements,i&=l;0<i;)o=31-gt(i),d=1<<o,l|=t[o],i&=~d;return l}function cr(t,i){switch(t){case 1:case 2:case 4:return i+250;case 8:case 16:case 32:case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return i+5e3;case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:return-1;case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Un(t,i){for(var o=t.suspendedLanes,l=t.pingedLanes,d=t.expirationTimes,m=t.pendingLanes;0<m;){var w=31-gt(m),k=1<<w,X=d[w];X===-1?((k&o)===0||(k&l)!==0)&&(d[w]=cr(k,i)):X<=i&&(t.expiredLanes|=k),m&=~k}}function Ci(t){return t=t.pendingLanes&-1073741825,t!==0?t:t&1073741824?1073741824:0}function kt(){var t=et;return et<<=1,(et&4194240)===0&&(et=64),t}function pn(t){for(var i=[],o=0;31>o;o++)i.push(t);return i}function Kt(t,i,o){t.pendingLanes|=i,i!==536870912&&(t.suspendedLanes=0,t.pingedLanes=0),t=t.eventTimes,i=31-gt(i),t[i]=o}function ln(t,i){var o=t.pendingLanes&~i;t.pendingLanes=i,t.suspendedLanes=0,t.pingedLanes=0,t.expiredLanes&=i,t.mutableReadLanes&=i,t.entangledLanes&=i,i=t.entanglements;var l=t.eventTimes;for(t=t.expirationTimes;0<o;){var d=31-gt(o),m=1<<d;i[d]=0,l[d]=-1,t[d]=-1,o&=~m}}function cn(t,i){var o=t.entangledLanes|=i;for(t=t.entanglements;o;){var l=31-gt(o),d=1<<l;d&i|t[l]&i&&(t[l]|=i),o&=~d}}var Rt=0;function mi(t){return t&=-t,1<t?4<t?(t&268435455)!==0?16:536870912:4:1}var Ns,Fs,Ro,Ao,Zr,Pi=!1,gi=[],vi=null,ji=null,Yi=null,Jr=new Map,Qr=new Map,qi=[],Ml="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");function es(t,i){switch(t){case"focusin":case"focusout":vi=null;break;case"dragenter":case"dragleave":ji=null;break;case"mouseover":case"mouseout":Yi=null;break;case"pointerover":case"pointerout":Jr.delete(i.pointerId);break;case"gotpointercapture":case"lostpointercapture":Qr.delete(i.pointerId)}}function Os(t,i,o,l,d,m){return t===null||t.nativeEvent!==m?(t={blockedOn:i,domEventName:o,eventSystemFlags:l,nativeEvent:m,targetContainers:[d]},i!==null&&(i=ja(i),i!==null&&Fs(i)),t):(t.eventSystemFlags|=l,i=t.targetContainers,d!==null&&i.indexOf(d)===-1&&i.push(d),t)}function El(t,i,o,l,d){switch(i){case"focusin":return vi=Os(vi,t,i,o,l,d),!0;case"dragenter":return ji=Os(ji,t,i,o,l,d),!0;case"mouseover":return Yi=Os(Yi,t,i,o,l,d),!0;case"pointerover":var m=d.pointerId;return Jr.set(m,Os(Jr.get(m)||null,t,i,o,l,d)),!0;case"gotpointercapture":return m=d.pointerId,Qr.set(m,Os(Qr.get(m)||null,t,i,o,l,d)),!0}return!1}function Ua(t){var i=Ys(t.target);if(i!==null){var o=Ri(i);if(o!==null){if(i=o.tag,i===13){if(i=Eo(o),i!==null){t.blockedOn=i,Zr(t.priority,function(){Ro(o)});return}}else if(i===3&&o.stateNode.current.memoizedState.isDehydrated){t.blockedOn=o.tag===3?o.stateNode.containerInfo:null;return}}}t.blockedOn=null}function ur(t){if(t.blockedOn!==null)return!1;for(var i=t.targetContainers;0<i.length;){var o=Mn(t.domEventName,t.eventSystemFlags,i[0],t.nativeEvent);if(o===null){o=t.nativeEvent;var l=new o.constructor(o.type,o);wt=l,o.target.dispatchEvent(l),wt=null}else return i=ja(o),i!==null&&Fs(i),t.blockedOn=o,!1;i.shift()}return!0}function Tl(t,i,o){ur(t)&&o.delete(i)}function wl(){Pi=!1,vi!==null&&ur(vi)&&(vi=null),ji!==null&&ur(ji)&&(ji=null),Yi!==null&&ur(Yi)&&(Yi=null),Jr.forEach(Tl),Qr.forEach(Tl)}function Tr(t,i){t.blockedOn===i&&(t.blockedOn=null,Pi||(Pi=!0,e.unstable_scheduleCallback(e.unstable_NormalPriority,wl)))}function ts(t){function i(d){return Tr(d,t)}if(0<gi.length){Tr(gi[0],t);for(var o=1;o<gi.length;o++){var l=gi[o];l.blockedOn===t&&(l.blockedOn=null)}}for(vi!==null&&Tr(vi,t),ji!==null&&Tr(ji,t),Yi!==null&&Tr(Yi,t),Jr.forEach(i),Qr.forEach(i),o=0;o<qi.length;o++)l=qi[o],l.blockedOn===t&&(l.blockedOn=null);for(;0<qi.length&&(o=qi[0],o.blockedOn===null);)Ua(o),o.blockedOn===null&&qi.shift()}var wr=A.ReactCurrentBatchConfig,ks=!0;function Rl(t,i,o,l){var d=Rt,m=wr.transition;wr.transition=null;try{Rt=1,De(t,i,o,l)}finally{Rt=d,wr.transition=m}}function P(t,i,o,l){var d=Rt,m=wr.transition;wr.transition=null;try{Rt=4,De(t,i,o,l)}finally{Rt=d,wr.transition=m}}function De(t,i,o,l){if(ks){var d=Mn(t,i,o,l);if(d===null)Nu(t,i,l,Nn,o),es(t,l);else if(El(d,t,i,o,l))l.stopPropagation();else if(es(t,l),i&4&&-1<Ml.indexOf(t)){for(;d!==null;){var m=ja(d);if(m!==null&&Ns(m),m=Mn(t,i,o,l),m===null&&Nu(t,i,l,Nn,o),m===d)break;d=m}d!==null&&l.stopPropagation()}else Nu(t,i,l,null,o)}}var Nn=null;function Mn(t,i,o,l){if(Nn=null,t=q(l),t=Ys(t),t!==null)if(i=Ri(t),i===null)t=null;else if(o=i.tag,o===13){if(t=Eo(i),t!==null)return t;t=null}else if(o===3){if(i.stateNode.current.memoizedState.isDehydrated)return i.tag===3?i.stateNode.containerInfo:null;t=null}else i!==t&&(t=null);return Nn=t,null}function zn(t){switch(t){case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"resize":case"seeked":case"submit":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 1;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"scroll":case"toggle":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 4;case"message":switch(K()){case Ae:return 1;case ze:return 4;case Ge:case qe:return 16;case at:return 536870912;default:return 16}default:return 16}}var qn=null,Xt=null,En=null;function Bt(){if(En)return En;var t,i=Xt,o=i.length,l,d="value"in qn?qn.value:qn.textContent,m=d.length;for(t=0;t<o&&i[t]===d[t];t++);var w=o-t;for(l=1;l<=w&&i[o-l]===d[m-l];l++);return En=d.slice(t,1<l?1-l:void 0)}function dt(t){var i=t.keyCode;return"charCode"in t?(t=t.charCode,t===0&&i===13&&(t=13)):t=i,t===10&&(t=13),32<=t||t===13?t:0}function Rr(){return!0}function jt(){return!1}function nn(t){function i(o,l,d,m,w){this._reactName=o,this._targetInst=d,this.type=l,this.nativeEvent=m,this.target=w,this.currentTarget=null;for(var k in t)t.hasOwnProperty(k)&&(o=t[k],this[k]=o?o(m):m[k]);return this.isDefaultPrevented=(m.defaultPrevented!=null?m.defaultPrevented:m.returnValue===!1)?Rr:jt,this.isPropagationStopped=jt,this}return se(i.prototype,{preventDefault:function(){this.defaultPrevented=!0;var o=this.nativeEvent;o&&(o.preventDefault?o.preventDefault():typeof o.returnValue!="unknown"&&(o.returnValue=!1),this.isDefaultPrevented=Rr)},stopPropagation:function(){var o=this.nativeEvent;o&&(o.stopPropagation?o.stopPropagation():typeof o.cancelBubble!="unknown"&&(o.cancelBubble=!0),this.isPropagationStopped=Rr)},persist:function(){},isPersistent:Rr}),i}var ri={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(t){return t.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},rn=nn(ri),$n=se({},ri,{view:0,detail:0}),yu=nn($n),Bs,fr,ns,zs=se({},$n,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Ar,button:0,buttons:0,relatedTarget:function(t){return t.relatedTarget===void 0?t.fromElement===t.srcElement?t.toElement:t.fromElement:t.relatedTarget},movementX:function(t){return"movementX"in t?t.movementX:(t!==ns&&(ns&&t.type==="mousemove"?(Bs=t.screenX-ns.screenX,fr=t.screenY-ns.screenY):fr=Bs=0,ns=t),Bs)},movementY:function(t){return"movementY"in t?t.movementY:fr}}),Na=nn(zs),bo=se({},zs,{dataTransfer:0}),Fa=nn(bo),Al=se({},$n,{relatedTarget:0}),Hs=nn(Al),bl=se({},ri,{animationName:0,elapsedTime:0,pseudoElement:0}),Su=nn(bl),Mu=se({},ri,{clipboardData:function(t){return"clipboardData"in t?t.clipboardData:window.clipboardData}}),si=nn(Mu),Vs=se({},ri,{data:0}),Co=nn(Vs),Eu={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},is={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Oa={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Cl(t){var i=this.nativeEvent;return i.getModifierState?i.getModifierState(t):(t=Oa[t])?!!i[t]:!1}function Ar(){return Cl}var Tu=se({},$n,{key:function(t){if(t.key){var i=Eu[t.key]||t.key;if(i!=="Unidentified")return i}return t.type==="keypress"?(t=dt(t),t===13?"Enter":String.fromCharCode(t)):t.type==="keydown"||t.type==="keyup"?is[t.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Ar,charCode:function(t){return t.type==="keypress"?dt(t):0},keyCode:function(t){return t.type==="keydown"||t.type==="keyup"?t.keyCode:0},which:function(t){return t.type==="keypress"?dt(t):t.type==="keydown"||t.type==="keyup"?t.keyCode:0}}),Pl=nn(Tu),Gs=se({},zs,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),ka=nn(Gs),Po=se({},$n,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Ar}),Ll=nn(Po),Ws=se({},ri,{propertyName:0,elapsedTime:0,pseudoElement:0}),Lo=nn(Ws),$i=se({},zs,{deltaX:function(t){return"deltaX"in t?t.deltaX:"wheelDeltaX"in t?-t.wheelDeltaX:0},deltaY:function(t){return"deltaY"in t?t.deltaY:"wheelDeltaY"in t?-t.wheelDeltaY:"wheelDelta"in t?-t.wheelDelta:0},deltaZ:0,deltaMode:0}),Xs=nn($i),Ba=[9,13,27,32],Do=u&&"CompositionEvent"in window,Io=null;u&&"documentMode"in document&&(Io=document.documentMode);var wu=u&&"TextEvent"in window&&!Io,Dl=u&&(!Do||Io&&8<Io&&11>=Io),rs=" ",js=!1;function br(t,i){switch(t){case"keyup":return Ba.indexOf(i.keyCode)!==-1;case"keydown":return i.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Il(t){return t=t.detail,typeof t=="object"&&"data"in t?t.data:null}var oi=!1;function Ul(t,i){switch(t){case"compositionend":return Il(i);case"keypress":return i.which!==32?null:(js=!0,rs);case"textInput":return t=i.data,t===rs&&js?null:t;default:return null}}function nt(t,i){if(oi)return t==="compositionend"||!Do&&br(t,i)?(t=Bt(),En=Xt=qn=null,oi=!1,t):null;switch(t){case"paste":return null;case"keypress":if(!(i.ctrlKey||i.altKey||i.metaKey)||i.ctrlKey&&i.altKey){if(i.char&&1<i.char.length)return i.char;if(i.which)return String.fromCharCode(i.which)}return null;case"compositionend":return Dl&&i.locale!=="ko"?null:i.data;default:return null}}var bt={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Lt(t){var i=t&&t.nodeName&&t.nodeName.toLowerCase();return i==="input"?!!bt[t.type]:i==="textarea"}function Gt(t,i,o,l){Ve(l),i=Bl(i,"onChange"),0<i.length&&(o=new rn("onChange","change",null,o,l),t.push({event:o,listeners:i}))}var mn=null,Kn=null;function gn(t){Yh(t,0)}function _i(t){var i=ko(t);if(tt(i))return t}function Cr(t,i){if(t==="change")return i}var ai=!1;if(u){var Ot;if(u){var Yt="oninput"in document;if(!Yt){var en=document.createElement("div");en.setAttribute("oninput","return;"),Yt=typeof en.oninput=="function"}Ot=Yt}else Ot=!1;ai=Ot&&(!document.documentMode||9<document.documentMode)}function Li(){mn&&(mn.detachEvent("onpropertychange",ss),Kn=mn=null)}function ss(t){if(t.propertyName==="value"&&_i(Kn)){var i=[];Gt(i,Kn,t,q(t)),Bn(gn,i)}}function Ru(t,i,o){t==="focusin"?(Li(),mn=i,Kn=o,mn.attachEvent("onpropertychange",ss)):t==="focusout"&&Li()}function Au(t){if(t==="selectionchange"||t==="keyup"||t==="keydown")return _i(Kn)}function Nl(t,i){if(t==="click")return _i(i)}function C0(t,i){if(t==="input"||t==="change")return _i(i)}function P0(t,i){return t===i&&(t!==0||1/t===1/i)||t!==t&&i!==i}var Ki=typeof Object.is=="function"?Object.is:P0;function za(t,i){if(Ki(t,i))return!0;if(typeof t!="object"||t===null||typeof i!="object"||i===null)return!1;var o=Object.keys(t),l=Object.keys(i);if(o.length!==l.length)return!1;for(l=0;l<o.length;l++){var d=o[l];if(!h.call(i,d)||!Ki(t[d],i[d]))return!1}return!0}function Uh(t){for(;t&&t.firstChild;)t=t.firstChild;return t}function Nh(t,i){var o=Uh(t);t=0;for(var l;o;){if(o.nodeType===3){if(l=t+o.textContent.length,t<=i&&l>=i)return{node:o,offset:i-t};t=l}e:{for(;o;){if(o.nextSibling){o=o.nextSibling;break e}o=o.parentNode}o=void 0}o=Uh(o)}}function Fh(t,i){return t&&i?t===i?!0:t&&t.nodeType===3?!1:i&&i.nodeType===3?Fh(t,i.parentNode):"contains"in t?t.contains(i):t.compareDocumentPosition?!!(t.compareDocumentPosition(i)&16):!1:!1}function Oh(){for(var t=window,i=_t();i instanceof t.HTMLIFrameElement;){try{var o=typeof i.contentWindow.location.href=="string"}catch{o=!1}if(o)t=i.contentWindow;else break;i=_t(t.document)}return i}function bu(t){var i=t&&t.nodeName&&t.nodeName.toLowerCase();return i&&(i==="input"&&(t.type==="text"||t.type==="search"||t.type==="tel"||t.type==="url"||t.type==="password")||i==="textarea"||t.contentEditable==="true")}function L0(t){var i=Oh(),o=t.focusedElem,l=t.selectionRange;if(i!==o&&o&&o.ownerDocument&&Fh(o.ownerDocument.documentElement,o)){if(l!==null&&bu(o)){if(i=l.start,t=l.end,t===void 0&&(t=i),"selectionStart"in o)o.selectionStart=i,o.selectionEnd=Math.min(t,o.value.length);else if(t=(i=o.ownerDocument||document)&&i.defaultView||window,t.getSelection){t=t.getSelection();var d=o.textContent.length,m=Math.min(l.start,d);l=l.end===void 0?m:Math.min(l.end,d),!t.extend&&m>l&&(d=l,l=m,m=d),d=Nh(o,m);var w=Nh(o,l);d&&w&&(t.rangeCount!==1||t.anchorNode!==d.node||t.anchorOffset!==d.offset||t.focusNode!==w.node||t.focusOffset!==w.offset)&&(i=i.createRange(),i.setStart(d.node,d.offset),t.removeAllRanges(),m>l?(t.addRange(i),t.extend(w.node,w.offset)):(i.setEnd(w.node,w.offset),t.addRange(i)))}}for(i=[],t=o;t=t.parentNode;)t.nodeType===1&&i.push({element:t,left:t.scrollLeft,top:t.scrollTop});for(typeof o.focus=="function"&&o.focus(),o=0;o<i.length;o++)t=i[o],t.element.scrollLeft=t.left,t.element.scrollTop=t.top}}var D0=u&&"documentMode"in document&&11>=document.documentMode,Uo=null,Cu=null,Ha=null,Pu=!1;function kh(t,i,o){var l=o.window===o?o.document:o.nodeType===9?o:o.ownerDocument;Pu||Uo==null||Uo!==_t(l)||(l=Uo,"selectionStart"in l&&bu(l)?l={start:l.selectionStart,end:l.selectionEnd}:(l=(l.ownerDocument&&l.ownerDocument.defaultView||window).getSelection(),l={anchorNode:l.anchorNode,anchorOffset:l.anchorOffset,focusNode:l.focusNode,focusOffset:l.focusOffset}),Ha&&za(Ha,l)||(Ha=l,l=Bl(Cu,"onSelect"),0<l.length&&(i=new rn("onSelect","select",null,i,o),t.push({event:i,listeners:l}),i.target=Uo)))}function Fl(t,i){var o={};return o[t.toLowerCase()]=i.toLowerCase(),o["Webkit"+t]="webkit"+i,o["Moz"+t]="moz"+i,o}var No={animationend:Fl("Animation","AnimationEnd"),animationiteration:Fl("Animation","AnimationIteration"),animationstart:Fl("Animation","AnimationStart"),transitionend:Fl("Transition","TransitionEnd")},Lu={},Bh={};u&&(Bh=document.createElement("div").style,"AnimationEvent"in window||(delete No.animationend.animation,delete No.animationiteration.animation,delete No.animationstart.animation),"TransitionEvent"in window||delete No.transitionend.transition);function Ol(t){if(Lu[t])return Lu[t];if(!No[t])return t;var i=No[t],o;for(o in i)if(i.hasOwnProperty(o)&&o in Bh)return Lu[t]=i[o];return t}var zh=Ol("animationend"),Hh=Ol("animationiteration"),Vh=Ol("animationstart"),Gh=Ol("transitionend"),Wh=new Map,Xh="abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");function os(t,i){Wh.set(t,i),c(i,[t])}for(var Du=0;Du<Xh.length;Du++){var Iu=Xh[Du],I0=Iu.toLowerCase(),U0=Iu[0].toUpperCase()+Iu.slice(1);os(I0,"on"+U0)}os(zh,"onAnimationEnd"),os(Hh,"onAnimationIteration"),os(Vh,"onAnimationStart"),os("dblclick","onDoubleClick"),os("focusin","onFocus"),os("focusout","onBlur"),os(Gh,"onTransitionEnd"),f("onMouseEnter",["mouseout","mouseover"]),f("onMouseLeave",["mouseout","mouseover"]),f("onPointerEnter",["pointerout","pointerover"]),f("onPointerLeave",["pointerout","pointerover"]),c("onChange","change click focusin focusout input keydown keyup selectionchange".split(" ")),c("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),c("onBeforeInput",["compositionend","keypress","textInput","paste"]),c("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" ")),c("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" ")),c("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Va="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),N0=new Set("cancel close invalid load scroll toggle".split(" ").concat(Va));function jh(t,i,o){var l=t.type||"unknown-event";t.currentTarget=o,Mo(l,i,void 0,t),t.currentTarget=null}function Yh(t,i){i=(i&4)!==0;for(var o=0;o<t.length;o++){var l=t[o],d=l.event;l=l.listeners;e:{var m=void 0;if(i)for(var w=l.length-1;0<=w;w--){var k=l[w],X=k.instance,he=k.currentTarget;if(k=k.listener,X!==m&&d.isPropagationStopped())break e;jh(d,k,he),m=X}else for(w=0;w<l.length;w++){if(k=l[w],X=k.instance,he=k.currentTarget,k=k.listener,X!==m&&d.isPropagationStopped())break e;jh(d,k,he),m=X}}}if(Er)throw t=lr,Er=!1,lr=null,t}function Zt(t,i){var o=i[Hu];o===void 0&&(o=i[Hu]=new Set);var l=t+"__bubble";o.has(l)||(qh(i,t,2,!1),o.add(l))}function Uu(t,i,o){var l=0;i&&(l|=4),qh(o,t,l,i)}var kl="_reactListening"+Math.random().toString(36).slice(2);function Ga(t){if(!t[kl]){t[kl]=!0,r.forEach(function(o){o!=="selectionchange"&&(N0.has(o)||Uu(o,!1,t),Uu(o,!0,t))});var i=t.nodeType===9?t:t.ownerDocument;i===null||i[kl]||(i[kl]=!0,Uu("selectionchange",!1,i))}}function qh(t,i,o,l){switch(zn(i)){case 1:var d=Rl;break;case 4:d=P;break;default:d=De}o=d.bind(null,i,o,t),d=void 0,!$r||i!=="touchstart"&&i!=="touchmove"&&i!=="wheel"||(d=!0),l?d!==void 0?t.addEventListener(i,o,{capture:!0,passive:d}):t.addEventListener(i,o,!0):d!==void 0?t.addEventListener(i,o,{passive:d}):t.addEventListener(i,o,!1)}function Nu(t,i,o,l,d){var m=l;if((i&1)===0&&(i&2)===0&&l!==null)e:for(;;){if(l===null)return;var w=l.tag;if(w===3||w===4){var k=l.stateNode.containerInfo;if(k===d||k.nodeType===8&&k.parentNode===d)break;if(w===4)for(w=l.return;w!==null;){var X=w.tag;if((X===3||X===4)&&(X=w.stateNode.containerInfo,X===d||X.nodeType===8&&X.parentNode===d))return;w=w.return}for(;k!==null;){if(w=Ys(k),w===null)return;if(X=w.tag,X===5||X===6){l=m=w;continue e}k=k.parentNode}}l=l.return}Bn(function(){var he=m,we=q(o),Pe=[];e:{var Ee=Wh.get(t);if(Ee!==void 0){var je=rn,Ze=t;switch(t){case"keypress":if(dt(o)===0)break e;case"keydown":case"keyup":je=Pl;break;case"focusin":Ze="focus",je=Hs;break;case"focusout":Ze="blur",je=Hs;break;case"beforeblur":case"afterblur":je=Hs;break;case"click":if(o.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":je=Na;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":je=Fa;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":je=Ll;break;case zh:case Hh:case Vh:je=Su;break;case Gh:je=Lo;break;case"scroll":je=yu;break;case"wheel":je=Xs;break;case"copy":case"cut":case"paste":je=si;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":je=ka}var Je=(i&4)!==0,vn=!Je&&t==="scroll",ne=Je?Ee!==null?Ee+"Capture":null:Ee;Je=[];for(var Y=he,le;Y!==null;){le=Y;var Ie=le.stateNode;if(le.tag===5&&Ie!==null&&(le=Ie,ne!==null&&(Ie=In(Y,ne),Ie!=null&&Je.push(Wa(Y,Ie,le)))),vn)break;Y=Y.return}0<Je.length&&(Ee=new je(Ee,Ze,null,o,we),Pe.push({event:Ee,listeners:Je}))}}if((i&7)===0){e:{if(Ee=t==="mouseover"||t==="pointerover",je=t==="mouseout"||t==="pointerout",Ee&&o!==wt&&(Ze=o.relatedTarget||o.fromElement)&&(Ys(Ze)||Ze[Pr]))break e;if((je||Ee)&&(Ee=we.window===we?we:(Ee=we.ownerDocument)?Ee.defaultView||Ee.parentWindow:window,je?(Ze=o.relatedTarget||o.toElement,je=he,Ze=Ze?Ys(Ze):null,Ze!==null&&(vn=Ri(Ze),Ze!==vn||Ze.tag!==5&&Ze.tag!==6)&&(Ze=null)):(je=null,Ze=he),je!==Ze)){if(Je=Na,Ie="onMouseLeave",ne="onMouseEnter",Y="mouse",(t==="pointerout"||t==="pointerover")&&(Je=ka,Ie="onPointerLeave",ne="onPointerEnter",Y="pointer"),vn=je==null?Ee:ko(je),le=Ze==null?Ee:ko(Ze),Ee=new Je(Ie,Y+"leave",je,o,we),Ee.target=vn,Ee.relatedTarget=le,Ie=null,Ys(we)===he&&(Je=new Je(ne,Y+"enter",Ze,o,we),Je.target=le,Je.relatedTarget=vn,Ie=Je),vn=Ie,je&&Ze)t:{for(Je=je,ne=Ze,Y=0,le=Je;le;le=Fo(le))Y++;for(le=0,Ie=ne;Ie;Ie=Fo(Ie))le++;for(;0<Y-le;)Je=Fo(Je),Y--;for(;0<le-Y;)ne=Fo(ne),le--;for(;Y--;){if(Je===ne||ne!==null&&Je===ne.alternate)break t;Je=Fo(Je),ne=Fo(ne)}Je=null}else Je=null;je!==null&&$h(Pe,Ee,je,Je,!1),Ze!==null&&vn!==null&&$h(Pe,vn,Ze,Je,!0)}}e:{if(Ee=he?ko(he):window,je=Ee.nodeName&&Ee.nodeName.toLowerCase(),je==="select"||je==="input"&&Ee.type==="file")var Qe=Cr;else if(Lt(Ee))if(ai)Qe=C0;else{Qe=Au;var ct=Ru}else(je=Ee.nodeName)&&je.toLowerCase()==="input"&&(Ee.type==="checkbox"||Ee.type==="radio")&&(Qe=Nl);if(Qe&&(Qe=Qe(t,he))){Gt(Pe,Qe,o,we);break e}ct&&ct(t,Ee,he),t==="focusout"&&(ct=Ee._wrapperState)&&ct.controlled&&Ee.type==="number"&&Le(Ee,"number",Ee.value)}switch(ct=he?ko(he):window,t){case"focusin":(Lt(ct)||ct.contentEditable==="true")&&(Uo=ct,Cu=he,Ha=null);break;case"focusout":Ha=Cu=Uo=null;break;case"mousedown":Pu=!0;break;case"contextmenu":case"mouseup":case"dragend":Pu=!1,kh(Pe,o,we);break;case"selectionchange":if(D0)break;case"keydown":case"keyup":kh(Pe,o,we)}var ut;if(Do)e:{switch(t){case"compositionstart":var pt="onCompositionStart";break e;case"compositionend":pt="onCompositionEnd";break e;case"compositionupdate":pt="onCompositionUpdate";break e}pt=void 0}else oi?br(t,o)&&(pt="onCompositionEnd"):t==="keydown"&&o.keyCode===229&&(pt="onCompositionStart");pt&&(Dl&&o.locale!=="ko"&&(oi||pt!=="onCompositionStart"?pt==="onCompositionEnd"&&oi&&(ut=Bt()):(qn=we,Xt="value"in qn?qn.value:qn.textContent,oi=!0)),ct=Bl(he,pt),0<ct.length&&(pt=new Co(pt,t,null,o,we),Pe.push({event:pt,listeners:ct}),ut?pt.data=ut:(ut=Il(o),ut!==null&&(pt.data=ut)))),(ut=wu?Ul(t,o):nt(t,o))&&(he=Bl(he,"onBeforeInput"),0<he.length&&(we=new Co("onBeforeInput","beforeinput",null,o,we),Pe.push({event:we,listeners:he}),we.data=ut))}Yh(Pe,i)})}function Wa(t,i,o){return{instance:t,listener:i,currentTarget:o}}function Bl(t,i){for(var o=i+"Capture",l=[];t!==null;){var d=t,m=d.stateNode;d.tag===5&&m!==null&&(d=m,m=In(t,o),m!=null&&l.unshift(Wa(t,m,d)),m=In(t,i),m!=null&&l.push(Wa(t,m,d))),t=t.return}return l}function Fo(t){if(t===null)return null;do t=t.return;while(t&&t.tag!==5);return t||null}function $h(t,i,o,l,d){for(var m=i._reactName,w=[];o!==null&&o!==l;){var k=o,X=k.alternate,he=k.stateNode;if(X!==null&&X===l)break;k.tag===5&&he!==null&&(k=he,d?(X=In(o,m),X!=null&&w.unshift(Wa(o,X,k))):d||(X=In(o,m),X!=null&&w.push(Wa(o,X,k)))),o=o.return}w.length!==0&&t.push({event:i,listeners:w})}var F0=/\r\n?/g,O0=/\u0000|\uFFFD/g;function Kh(t){return(typeof t=="string"?t:""+t).replace(F0,`
`).replace(O0,"")}function zl(t,i,o){if(i=Kh(i),Kh(t)!==i&&o)throw Error(n(425))}function Hl(){}var Fu=null,Ou=null;function ku(t,i){return t==="textarea"||t==="noscript"||typeof i.children=="string"||typeof i.children=="number"||typeof i.dangerouslySetInnerHTML=="object"&&i.dangerouslySetInnerHTML!==null&&i.dangerouslySetInnerHTML.__html!=null}var Bu=typeof setTimeout=="function"?setTimeout:void 0,k0=typeof clearTimeout=="function"?clearTimeout:void 0,Zh=typeof Promise=="function"?Promise:void 0,B0=typeof queueMicrotask=="function"?queueMicrotask:typeof Zh<"u"?function(t){return Zh.resolve(null).then(t).catch(z0)}:Bu;function z0(t){setTimeout(function(){throw t})}function zu(t,i){var o=i,l=0;do{var d=o.nextSibling;if(t.removeChild(o),d&&d.nodeType===8)if(o=d.data,o==="/$"){if(l===0){t.removeChild(d),ts(i);return}l--}else o!=="$"&&o!=="$?"&&o!=="$!"||l++;o=d}while(o);ts(i)}function as(t){for(;t!=null;t=t.nextSibling){var i=t.nodeType;if(i===1||i===3)break;if(i===8){if(i=t.data,i==="$"||i==="$!"||i==="$?")break;if(i==="/$")return null}}return t}function Jh(t){t=t.previousSibling;for(var i=0;t;){if(t.nodeType===8){var o=t.data;if(o==="$"||o==="$!"||o==="$?"){if(i===0)return t;i--}else o==="/$"&&i++}t=t.previousSibling}return null}var Oo=Math.random().toString(36).slice(2),dr="__reactFiber$"+Oo,Xa="__reactProps$"+Oo,Pr="__reactContainer$"+Oo,Hu="__reactEvents$"+Oo,H0="__reactListeners$"+Oo,V0="__reactHandles$"+Oo;function Ys(t){var i=t[dr];if(i)return i;for(var o=t.parentNode;o;){if(i=o[Pr]||o[dr]){if(o=i.alternate,i.child!==null||o!==null&&o.child!==null)for(t=Jh(t);t!==null;){if(o=t[dr])return o;t=Jh(t)}return i}t=o,o=t.parentNode}return null}function ja(t){return t=t[dr]||t[Pr],!t||t.tag!==5&&t.tag!==6&&t.tag!==13&&t.tag!==3?null:t}function ko(t){if(t.tag===5||t.tag===6)return t.stateNode;throw Error(n(33))}function Vl(t){return t[Xa]||null}var Vu=[],Bo=-1;function ls(t){return{current:t}}function Jt(t){0>Bo||(t.current=Vu[Bo],Vu[Bo]=null,Bo--)}function qt(t,i){Bo++,Vu[Bo]=t.current,t.current=i}var cs={},Hn=ls(cs),li=ls(!1),qs=cs;function zo(t,i){var o=t.type.contextTypes;if(!o)return cs;var l=t.stateNode;if(l&&l.__reactInternalMemoizedUnmaskedChildContext===i)return l.__reactInternalMemoizedMaskedChildContext;var d={},m;for(m in o)d[m]=i[m];return l&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=i,t.__reactInternalMemoizedMaskedChildContext=d),d}function ci(t){return t=t.childContextTypes,t!=null}function Gl(){Jt(li),Jt(Hn)}function Qh(t,i,o){if(Hn.current!==cs)throw Error(n(168));qt(Hn,i),qt(li,o)}function ep(t,i,o){var l=t.stateNode;if(i=i.childContextTypes,typeof l.getChildContext!="function")return o;l=l.getChildContext();for(var d in l)if(!(d in i))throw Error(n(108,xe(t)||"Unknown",d));return se({},o,l)}function Wl(t){return t=(t=t.stateNode)&&t.__reactInternalMemoizedMergedChildContext||cs,qs=Hn.current,qt(Hn,t),qt(li,li.current),!0}function tp(t,i,o){var l=t.stateNode;if(!l)throw Error(n(169));o?(t=ep(t,i,qs),l.__reactInternalMemoizedMergedChildContext=t,Jt(li),Jt(Hn),qt(Hn,t)):Jt(li),qt(li,o)}var Lr=null,Xl=!1,Gu=!1;function np(t){Lr===null?Lr=[t]:Lr.push(t)}function G0(t){Xl=!0,np(t)}function us(){if(!Gu&&Lr!==null){Gu=!0;var t=0,i=Rt;try{var o=Lr;for(Rt=1;t<o.length;t++){var l=o[t];do l=l(!0);while(l!==null)}Lr=null,Xl=!1}catch(d){throw Lr!==null&&(Lr=Lr.slice(t+1)),wo(Ae,us),d}finally{Rt=i,Gu=!1}}return null}var Ho=[],Vo=0,jl=null,Yl=0,Di=[],Ii=0,$s=null,Dr=1,Ir="";function Ks(t,i){Ho[Vo++]=Yl,Ho[Vo++]=jl,jl=t,Yl=i}function ip(t,i,o){Di[Ii++]=Dr,Di[Ii++]=Ir,Di[Ii++]=$s,$s=t;var l=Dr;t=Ir;var d=32-gt(l)-1;l&=~(1<<d),o+=1;var m=32-gt(i)+d;if(30<m){var w=d-d%5;m=(l&(1<<w)-1).toString(32),l>>=w,d-=w,Dr=1<<32-gt(i)+d|o<<d|l,Ir=m+t}else Dr=1<<m|o<<d|l,Ir=t}function Wu(t){t.return!==null&&(Ks(t,1),ip(t,1,0))}function Xu(t){for(;t===jl;)jl=Ho[--Vo],Ho[Vo]=null,Yl=Ho[--Vo],Ho[Vo]=null;for(;t===$s;)$s=Di[--Ii],Di[Ii]=null,Ir=Di[--Ii],Di[Ii]=null,Dr=Di[--Ii],Di[Ii]=null}var xi=null,yi=null,tn=!1,Zi=null;function rp(t,i){var o=Oi(5,null,null,0);o.elementType="DELETED",o.stateNode=i,o.return=t,i=t.deletions,i===null?(t.deletions=[o],t.flags|=16):i.push(o)}function sp(t,i){switch(t.tag){case 5:var o=t.type;return i=i.nodeType!==1||o.toLowerCase()!==i.nodeName.toLowerCase()?null:i,i!==null?(t.stateNode=i,xi=t,yi=as(i.firstChild),!0):!1;case 6:return i=t.pendingProps===""||i.nodeType!==3?null:i,i!==null?(t.stateNode=i,xi=t,yi=null,!0):!1;case 13:return i=i.nodeType!==8?null:i,i!==null?(o=$s!==null?{id:Dr,overflow:Ir}:null,t.memoizedState={dehydrated:i,treeContext:o,retryLane:1073741824},o=Oi(18,null,null,0),o.stateNode=i,o.return=t,t.child=o,xi=t,yi=null,!0):!1;default:return!1}}function ju(t){return(t.mode&1)!==0&&(t.flags&128)===0}function Yu(t){if(tn){var i=yi;if(i){var o=i;if(!sp(t,i)){if(ju(t))throw Error(n(418));i=as(o.nextSibling);var l=xi;i&&sp(t,i)?rp(l,o):(t.flags=t.flags&-4097|2,tn=!1,xi=t)}}else{if(ju(t))throw Error(n(418));t.flags=t.flags&-4097|2,tn=!1,xi=t}}}function op(t){for(t=t.return;t!==null&&t.tag!==5&&t.tag!==3&&t.tag!==13;)t=t.return;xi=t}function ql(t){if(t!==xi)return!1;if(!tn)return op(t),tn=!0,!1;var i;if((i=t.tag!==3)&&!(i=t.tag!==5)&&(i=t.type,i=i!=="head"&&i!=="body"&&!ku(t.type,t.memoizedProps)),i&&(i=yi)){if(ju(t))throw ap(),Error(n(418));for(;i;)rp(t,i),i=as(i.nextSibling)}if(op(t),t.tag===13){if(t=t.memoizedState,t=t!==null?t.dehydrated:null,!t)throw Error(n(317));e:{for(t=t.nextSibling,i=0;t;){if(t.nodeType===8){var o=t.data;if(o==="/$"){if(i===0){yi=as(t.nextSibling);break e}i--}else o!=="$"&&o!=="$!"&&o!=="$?"||i++}t=t.nextSibling}yi=null}}else yi=xi?as(t.stateNode.nextSibling):null;return!0}function ap(){for(var t=yi;t;)t=as(t.nextSibling)}function Go(){yi=xi=null,tn=!1}function qu(t){Zi===null?Zi=[t]:Zi.push(t)}var W0=A.ReactCurrentBatchConfig;function Ya(t,i,o){if(t=o.ref,t!==null&&typeof t!="function"&&typeof t!="object"){if(o._owner){if(o=o._owner,o){if(o.tag!==1)throw Error(n(309));var l=o.stateNode}if(!l)throw Error(n(147,t));var d=l,m=""+t;return i!==null&&i.ref!==null&&typeof i.ref=="function"&&i.ref._stringRef===m?i.ref:(i=function(w){var k=d.refs;w===null?delete k[m]:k[m]=w},i._stringRef=m,i)}if(typeof t!="string")throw Error(n(284));if(!o._owner)throw Error(n(290,t))}return t}function $l(t,i){throw t=Object.prototype.toString.call(i),Error(n(31,t==="[object Object]"?"object with keys {"+Object.keys(i).join(", ")+"}":t))}function lp(t){var i=t._init;return i(t._payload)}function cp(t){function i(ne,Y){if(t){var le=ne.deletions;le===null?(ne.deletions=[Y],ne.flags|=16):le.push(Y)}}function o(ne,Y){if(!t)return null;for(;Y!==null;)i(ne,Y),Y=Y.sibling;return null}function l(ne,Y){for(ne=new Map;Y!==null;)Y.key!==null?ne.set(Y.key,Y):ne.set(Y.index,Y),Y=Y.sibling;return ne}function d(ne,Y){return ne=_s(ne,Y),ne.index=0,ne.sibling=null,ne}function m(ne,Y,le){return ne.index=le,t?(le=ne.alternate,le!==null?(le=le.index,le<Y?(ne.flags|=2,Y):le):(ne.flags|=2,Y)):(ne.flags|=1048576,Y)}function w(ne){return t&&ne.alternate===null&&(ne.flags|=2),ne}function k(ne,Y,le,Ie){return Y===null||Y.tag!==6?(Y=zf(le,ne.mode,Ie),Y.return=ne,Y):(Y=d(Y,le),Y.return=ne,Y)}function X(ne,Y,le,Ie){var Qe=le.type;return Qe===z?we(ne,Y,le.props.children,Ie,le.key):Y!==null&&(Y.elementType===Qe||typeof Qe=="object"&&Qe!==null&&Qe.$$typeof===ce&&lp(Qe)===Y.type)?(Ie=d(Y,le.props),Ie.ref=Ya(ne,Y,le),Ie.return=ne,Ie):(Ie=xc(le.type,le.key,le.props,null,ne.mode,Ie),Ie.ref=Ya(ne,Y,le),Ie.return=ne,Ie)}function he(ne,Y,le,Ie){return Y===null||Y.tag!==4||Y.stateNode.containerInfo!==le.containerInfo||Y.stateNode.implementation!==le.implementation?(Y=Hf(le,ne.mode,Ie),Y.return=ne,Y):(Y=d(Y,le.children||[]),Y.return=ne,Y)}function we(ne,Y,le,Ie,Qe){return Y===null||Y.tag!==7?(Y=ro(le,ne.mode,Ie,Qe),Y.return=ne,Y):(Y=d(Y,le),Y.return=ne,Y)}function Pe(ne,Y,le){if(typeof Y=="string"&&Y!==""||typeof Y=="number")return Y=zf(""+Y,ne.mode,le),Y.return=ne,Y;if(typeof Y=="object"&&Y!==null){switch(Y.$$typeof){case G:return le=xc(Y.type,Y.key,Y.props,null,ne.mode,le),le.ref=Ya(ne,null,Y),le.return=ne,le;case O:return Y=Hf(Y,ne.mode,le),Y.return=ne,Y;case ce:var Ie=Y._init;return Pe(ne,Ie(Y._payload),le)}if(Se(Y)||te(Y))return Y=ro(Y,ne.mode,le,null),Y.return=ne,Y;$l(ne,Y)}return null}function Ee(ne,Y,le,Ie){var Qe=Y!==null?Y.key:null;if(typeof le=="string"&&le!==""||typeof le=="number")return Qe!==null?null:k(ne,Y,""+le,Ie);if(typeof le=="object"&&le!==null){switch(le.$$typeof){case G:return le.key===Qe?X(ne,Y,le,Ie):null;case O:return le.key===Qe?he(ne,Y,le,Ie):null;case ce:return Qe=le._init,Ee(ne,Y,Qe(le._payload),Ie)}if(Se(le)||te(le))return Qe!==null?null:we(ne,Y,le,Ie,null);$l(ne,le)}return null}function je(ne,Y,le,Ie,Qe){if(typeof Ie=="string"&&Ie!==""||typeof Ie=="number")return ne=ne.get(le)||null,k(Y,ne,""+Ie,Qe);if(typeof Ie=="object"&&Ie!==null){switch(Ie.$$typeof){case G:return ne=ne.get(Ie.key===null?le:Ie.key)||null,X(Y,ne,Ie,Qe);case O:return ne=ne.get(Ie.key===null?le:Ie.key)||null,he(Y,ne,Ie,Qe);case ce:var ct=Ie._init;return je(ne,Y,le,ct(Ie._payload),Qe)}if(Se(Ie)||te(Ie))return ne=ne.get(le)||null,we(Y,ne,Ie,Qe,null);$l(Y,Ie)}return null}function Ze(ne,Y,le,Ie){for(var Qe=null,ct=null,ut=Y,pt=Y=0,Pn=null;ut!==null&&pt<le.length;pt++){ut.index>pt?(Pn=ut,ut=null):Pn=ut.sibling;var Nt=Ee(ne,ut,le[pt],Ie);if(Nt===null){ut===null&&(ut=Pn);break}t&&ut&&Nt.alternate===null&&i(ne,ut),Y=m(Nt,Y,pt),ct===null?Qe=Nt:ct.sibling=Nt,ct=Nt,ut=Pn}if(pt===le.length)return o(ne,ut),tn&&Ks(ne,pt),Qe;if(ut===null){for(;pt<le.length;pt++)ut=Pe(ne,le[pt],Ie),ut!==null&&(Y=m(ut,Y,pt),ct===null?Qe=ut:ct.sibling=ut,ct=ut);return tn&&Ks(ne,pt),Qe}for(ut=l(ne,ut);pt<le.length;pt++)Pn=je(ut,ne,pt,le[pt],Ie),Pn!==null&&(t&&Pn.alternate!==null&&ut.delete(Pn.key===null?pt:Pn.key),Y=m(Pn,Y,pt),ct===null?Qe=Pn:ct.sibling=Pn,ct=Pn);return t&&ut.forEach(function(xs){return i(ne,xs)}),tn&&Ks(ne,pt),Qe}function Je(ne,Y,le,Ie){var Qe=te(le);if(typeof Qe!="function")throw Error(n(150));if(le=Qe.call(le),le==null)throw Error(n(151));for(var ct=Qe=null,ut=Y,pt=Y=0,Pn=null,Nt=le.next();ut!==null&&!Nt.done;pt++,Nt=le.next()){ut.index>pt?(Pn=ut,ut=null):Pn=ut.sibling;var xs=Ee(ne,ut,Nt.value,Ie);if(xs===null){ut===null&&(ut=Pn);break}t&&ut&&xs.alternate===null&&i(ne,ut),Y=m(xs,Y,pt),ct===null?Qe=xs:ct.sibling=xs,ct=xs,ut=Pn}if(Nt.done)return o(ne,ut),tn&&Ks(ne,pt),Qe;if(ut===null){for(;!Nt.done;pt++,Nt=le.next())Nt=Pe(ne,Nt.value,Ie),Nt!==null&&(Y=m(Nt,Y,pt),ct===null?Qe=Nt:ct.sibling=Nt,ct=Nt);return tn&&Ks(ne,pt),Qe}for(ut=l(ne,ut);!Nt.done;pt++,Nt=le.next())Nt=je(ut,ne,pt,Nt.value,Ie),Nt!==null&&(t&&Nt.alternate!==null&&ut.delete(Nt.key===null?pt:Nt.key),Y=m(Nt,Y,pt),ct===null?Qe=Nt:ct.sibling=Nt,ct=Nt);return t&&ut.forEach(function(Ev){return i(ne,Ev)}),tn&&Ks(ne,pt),Qe}function vn(ne,Y,le,Ie){if(typeof le=="object"&&le!==null&&le.type===z&&le.key===null&&(le=le.props.children),typeof le=="object"&&le!==null){switch(le.$$typeof){case G:e:{for(var Qe=le.key,ct=Y;ct!==null;){if(ct.key===Qe){if(Qe=le.type,Qe===z){if(ct.tag===7){o(ne,ct.sibling),Y=d(ct,le.props.children),Y.return=ne,ne=Y;break e}}else if(ct.elementType===Qe||typeof Qe=="object"&&Qe!==null&&Qe.$$typeof===ce&&lp(Qe)===ct.type){o(ne,ct.sibling),Y=d(ct,le.props),Y.ref=Ya(ne,ct,le),Y.return=ne,ne=Y;break e}o(ne,ct);break}else i(ne,ct);ct=ct.sibling}le.type===z?(Y=ro(le.props.children,ne.mode,Ie,le.key),Y.return=ne,ne=Y):(Ie=xc(le.type,le.key,le.props,null,ne.mode,Ie),Ie.ref=Ya(ne,Y,le),Ie.return=ne,ne=Ie)}return w(ne);case O:e:{for(ct=le.key;Y!==null;){if(Y.key===ct)if(Y.tag===4&&Y.stateNode.containerInfo===le.containerInfo&&Y.stateNode.implementation===le.implementation){o(ne,Y.sibling),Y=d(Y,le.children||[]),Y.return=ne,ne=Y;break e}else{o(ne,Y);break}else i(ne,Y);Y=Y.sibling}Y=Hf(le,ne.mode,Ie),Y.return=ne,ne=Y}return w(ne);case ce:return ct=le._init,vn(ne,Y,ct(le._payload),Ie)}if(Se(le))return Ze(ne,Y,le,Ie);if(te(le))return Je(ne,Y,le,Ie);$l(ne,le)}return typeof le=="string"&&le!==""||typeof le=="number"?(le=""+le,Y!==null&&Y.tag===6?(o(ne,Y.sibling),Y=d(Y,le),Y.return=ne,ne=Y):(o(ne,Y),Y=zf(le,ne.mode,Ie),Y.return=ne,ne=Y),w(ne)):o(ne,Y)}return vn}var Wo=cp(!0),up=cp(!1),Kl=ls(null),Zl=null,Xo=null,$u=null;function Ku(){$u=Xo=Zl=null}function Zu(t){var i=Kl.current;Jt(Kl),t._currentValue=i}function Ju(t,i,o){for(;t!==null;){var l=t.alternate;if((t.childLanes&i)!==i?(t.childLanes|=i,l!==null&&(l.childLanes|=i)):l!==null&&(l.childLanes&i)!==i&&(l.childLanes|=i),t===o)break;t=t.return}}function jo(t,i){Zl=t,$u=Xo=null,t=t.dependencies,t!==null&&t.firstContext!==null&&((t.lanes&i)!==0&&(ui=!0),t.firstContext=null)}function Ui(t){var i=t._currentValue;if($u!==t)if(t={context:t,memoizedValue:i,next:null},Xo===null){if(Zl===null)throw Error(n(308));Xo=t,Zl.dependencies={lanes:0,firstContext:t}}else Xo=Xo.next=t;return i}var Zs=null;function Qu(t){Zs===null?Zs=[t]:Zs.push(t)}function fp(t,i,o,l){var d=i.interleaved;return d===null?(o.next=o,Qu(i)):(o.next=d.next,d.next=o),i.interleaved=o,Ur(t,l)}function Ur(t,i){t.lanes|=i;var o=t.alternate;for(o!==null&&(o.lanes|=i),o=t,t=t.return;t!==null;)t.childLanes|=i,o=t.alternate,o!==null&&(o.childLanes|=i),o=t,t=t.return;return o.tag===3?o.stateNode:null}var fs=!1;function ef(t){t.updateQueue={baseState:t.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,interleaved:null,lanes:0},effects:null}}function dp(t,i){t=t.updateQueue,i.updateQueue===t&&(i.updateQueue={baseState:t.baseState,firstBaseUpdate:t.firstBaseUpdate,lastBaseUpdate:t.lastBaseUpdate,shared:t.shared,effects:t.effects})}function Nr(t,i){return{eventTime:t,lane:i,tag:0,payload:null,callback:null,next:null}}function ds(t,i,o){var l=t.updateQueue;if(l===null)return null;if(l=l.shared,(Ut&2)!==0){var d=l.pending;return d===null?i.next=i:(i.next=d.next,d.next=i),l.pending=i,Ur(t,o)}return d=l.interleaved,d===null?(i.next=i,Qu(l)):(i.next=d.next,d.next=i),l.interleaved=i,Ur(t,o)}function Jl(t,i,o){if(i=i.updateQueue,i!==null&&(i=i.shared,(o&4194240)!==0)){var l=i.lanes;l&=t.pendingLanes,o|=l,i.lanes=o,cn(t,o)}}function hp(t,i){var o=t.updateQueue,l=t.alternate;if(l!==null&&(l=l.updateQueue,o===l)){var d=null,m=null;if(o=o.firstBaseUpdate,o!==null){do{var w={eventTime:o.eventTime,lane:o.lane,tag:o.tag,payload:o.payload,callback:o.callback,next:null};m===null?d=m=w:m=m.next=w,o=o.next}while(o!==null);m===null?d=m=i:m=m.next=i}else d=m=i;o={baseState:l.baseState,firstBaseUpdate:d,lastBaseUpdate:m,shared:l.shared,effects:l.effects},t.updateQueue=o;return}t=o.lastBaseUpdate,t===null?o.firstBaseUpdate=i:t.next=i,o.lastBaseUpdate=i}function Ql(t,i,o,l){var d=t.updateQueue;fs=!1;var m=d.firstBaseUpdate,w=d.lastBaseUpdate,k=d.shared.pending;if(k!==null){d.shared.pending=null;var X=k,he=X.next;X.next=null,w===null?m=he:w.next=he,w=X;var we=t.alternate;we!==null&&(we=we.updateQueue,k=we.lastBaseUpdate,k!==w&&(k===null?we.firstBaseUpdate=he:k.next=he,we.lastBaseUpdate=X))}if(m!==null){var Pe=d.baseState;w=0,we=he=X=null,k=m;do{var Ee=k.lane,je=k.eventTime;if((l&Ee)===Ee){we!==null&&(we=we.next={eventTime:je,lane:0,tag:k.tag,payload:k.payload,callback:k.callback,next:null});e:{var Ze=t,Je=k;switch(Ee=i,je=o,Je.tag){case 1:if(Ze=Je.payload,typeof Ze=="function"){Pe=Ze.call(je,Pe,Ee);break e}Pe=Ze;break e;case 3:Ze.flags=Ze.flags&-65537|128;case 0:if(Ze=Je.payload,Ee=typeof Ze=="function"?Ze.call(je,Pe,Ee):Ze,Ee==null)break e;Pe=se({},Pe,Ee);break e;case 2:fs=!0}}k.callback!==null&&k.lane!==0&&(t.flags|=64,Ee=d.effects,Ee===null?d.effects=[k]:Ee.push(k))}else je={eventTime:je,lane:Ee,tag:k.tag,payload:k.payload,callback:k.callback,next:null},we===null?(he=we=je,X=Pe):we=we.next=je,w|=Ee;if(k=k.next,k===null){if(k=d.shared.pending,k===null)break;Ee=k,k=Ee.next,Ee.next=null,d.lastBaseUpdate=Ee,d.shared.pending=null}}while(!0);if(we===null&&(X=Pe),d.baseState=X,d.firstBaseUpdate=he,d.lastBaseUpdate=we,i=d.shared.interleaved,i!==null){d=i;do w|=d.lane,d=d.next;while(d!==i)}else m===null&&(d.shared.lanes=0);eo|=w,t.lanes=w,t.memoizedState=Pe}}function pp(t,i,o){if(t=i.effects,i.effects=null,t!==null)for(i=0;i<t.length;i++){var l=t[i],d=l.callback;if(d!==null){if(l.callback=null,l=o,typeof d!="function")throw Error(n(191,d));d.call(l)}}}var qa={},hr=ls(qa),$a=ls(qa),Ka=ls(qa);function Js(t){if(t===qa)throw Error(n(174));return t}function tf(t,i){switch(qt(Ka,i),qt($a,t),qt(hr,qa),t=i.nodeType,t){case 9:case 11:i=(i=i.documentElement)?i.namespaceURI:Fe(null,"");break;default:t=t===8?i.parentNode:i,i=t.namespaceURI||null,t=t.tagName,i=Fe(i,t)}Jt(hr),qt(hr,i)}function Yo(){Jt(hr),Jt($a),Jt(Ka)}function mp(t){Js(Ka.current);var i=Js(hr.current),o=Fe(i,t.type);i!==o&&(qt($a,t),qt(hr,o))}function nf(t){$a.current===t&&(Jt(hr),Jt($a))}var sn=ls(0);function ec(t){for(var i=t;i!==null;){if(i.tag===13){var o=i.memoizedState;if(o!==null&&(o=o.dehydrated,o===null||o.data==="$?"||o.data==="$!"))return i}else if(i.tag===19&&i.memoizedProps.revealOrder!==void 0){if((i.flags&128)!==0)return i}else if(i.child!==null){i.child.return=i,i=i.child;continue}if(i===t)break;for(;i.sibling===null;){if(i.return===null||i.return===t)return null;i=i.return}i.sibling.return=i.return,i=i.sibling}return null}var rf=[];function sf(){for(var t=0;t<rf.length;t++)rf[t]._workInProgressVersionPrimary=null;rf.length=0}var tc=A.ReactCurrentDispatcher,of=A.ReactCurrentBatchConfig,Qs=0,on=null,Tn=null,bn=null,nc=!1,Za=!1,Ja=0,X0=0;function Vn(){throw Error(n(321))}function af(t,i){if(i===null)return!1;for(var o=0;o<i.length&&o<t.length;o++)if(!Ki(t[o],i[o]))return!1;return!0}function lf(t,i,o,l,d,m){if(Qs=m,on=i,i.memoizedState=null,i.updateQueue=null,i.lanes=0,tc.current=t===null||t.memoizedState===null?$0:K0,t=o(l,d),Za){m=0;do{if(Za=!1,Ja=0,25<=m)throw Error(n(301));m+=1,bn=Tn=null,i.updateQueue=null,tc.current=Z0,t=o(l,d)}while(Za)}if(tc.current=sc,i=Tn!==null&&Tn.next!==null,Qs=0,bn=Tn=on=null,nc=!1,i)throw Error(n(300));return t}function cf(){var t=Ja!==0;return Ja=0,t}function pr(){var t={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return bn===null?on.memoizedState=bn=t:bn=bn.next=t,bn}function Ni(){if(Tn===null){var t=on.alternate;t=t!==null?t.memoizedState:null}else t=Tn.next;var i=bn===null?on.memoizedState:bn.next;if(i!==null)bn=i,Tn=t;else{if(t===null)throw Error(n(310));Tn=t,t={memoizedState:Tn.memoizedState,baseState:Tn.baseState,baseQueue:Tn.baseQueue,queue:Tn.queue,next:null},bn===null?on.memoizedState=bn=t:bn=bn.next=t}return bn}function Qa(t,i){return typeof i=="function"?i(t):i}function uf(t){var i=Ni(),o=i.queue;if(o===null)throw Error(n(311));o.lastRenderedReducer=t;var l=Tn,d=l.baseQueue,m=o.pending;if(m!==null){if(d!==null){var w=d.next;d.next=m.next,m.next=w}l.baseQueue=d=m,o.pending=null}if(d!==null){m=d.next,l=l.baseState;var k=w=null,X=null,he=m;do{var we=he.lane;if((Qs&we)===we)X!==null&&(X=X.next={lane:0,action:he.action,hasEagerState:he.hasEagerState,eagerState:he.eagerState,next:null}),l=he.hasEagerState?he.eagerState:t(l,he.action);else{var Pe={lane:we,action:he.action,hasEagerState:he.hasEagerState,eagerState:he.eagerState,next:null};X===null?(k=X=Pe,w=l):X=X.next=Pe,on.lanes|=we,eo|=we}he=he.next}while(he!==null&&he!==m);X===null?w=l:X.next=k,Ki(l,i.memoizedState)||(ui=!0),i.memoizedState=l,i.baseState=w,i.baseQueue=X,o.lastRenderedState=l}if(t=o.interleaved,t!==null){d=t;do m=d.lane,on.lanes|=m,eo|=m,d=d.next;while(d!==t)}else d===null&&(o.lanes=0);return[i.memoizedState,o.dispatch]}function ff(t){var i=Ni(),o=i.queue;if(o===null)throw Error(n(311));o.lastRenderedReducer=t;var l=o.dispatch,d=o.pending,m=i.memoizedState;if(d!==null){o.pending=null;var w=d=d.next;do m=t(m,w.action),w=w.next;while(w!==d);Ki(m,i.memoizedState)||(ui=!0),i.memoizedState=m,i.baseQueue===null&&(i.baseState=m),o.lastRenderedState=m}return[m,l]}function gp(){}function vp(t,i){var o=on,l=Ni(),d=i(),m=!Ki(l.memoizedState,d);if(m&&(l.memoizedState=d,ui=!0),l=l.queue,df(yp.bind(null,o,l,t),[t]),l.getSnapshot!==i||m||bn!==null&&bn.memoizedState.tag&1){if(o.flags|=2048,el(9,xp.bind(null,o,l,d,i),void 0,null),Cn===null)throw Error(n(349));(Qs&30)!==0||_p(o,i,d)}return d}function _p(t,i,o){t.flags|=16384,t={getSnapshot:i,value:o},i=on.updateQueue,i===null?(i={lastEffect:null,stores:null},on.updateQueue=i,i.stores=[t]):(o=i.stores,o===null?i.stores=[t]:o.push(t))}function xp(t,i,o,l){i.value=o,i.getSnapshot=l,Sp(i)&&Mp(t)}function yp(t,i,o){return o(function(){Sp(i)&&Mp(t)})}function Sp(t){var i=t.getSnapshot;t=t.value;try{var o=i();return!Ki(t,o)}catch{return!0}}function Mp(t){var i=Ur(t,1);i!==null&&tr(i,t,1,-1)}function Ep(t){var i=pr();return typeof t=="function"&&(t=t()),i.memoizedState=i.baseState=t,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:Qa,lastRenderedState:t},i.queue=t,t=t.dispatch=q0.bind(null,on,t),[i.memoizedState,t]}function el(t,i,o,l){return t={tag:t,create:i,destroy:o,deps:l,next:null},i=on.updateQueue,i===null?(i={lastEffect:null,stores:null},on.updateQueue=i,i.lastEffect=t.next=t):(o=i.lastEffect,o===null?i.lastEffect=t.next=t:(l=o.next,o.next=t,t.next=l,i.lastEffect=t)),t}function Tp(){return Ni().memoizedState}function ic(t,i,o,l){var d=pr();on.flags|=t,d.memoizedState=el(1|i,o,void 0,l===void 0?null:l)}function rc(t,i,o,l){var d=Ni();l=l===void 0?null:l;var m=void 0;if(Tn!==null){var w=Tn.memoizedState;if(m=w.destroy,l!==null&&af(l,w.deps)){d.memoizedState=el(i,o,m,l);return}}on.flags|=t,d.memoizedState=el(1|i,o,m,l)}function wp(t,i){return ic(8390656,8,t,i)}function df(t,i){return rc(2048,8,t,i)}function Rp(t,i){return rc(4,2,t,i)}function Ap(t,i){return rc(4,4,t,i)}function bp(t,i){if(typeof i=="function")return t=t(),i(t),function(){i(null)};if(i!=null)return t=t(),i.current=t,function(){i.current=null}}function Cp(t,i,o){return o=o!=null?o.concat([t]):null,rc(4,4,bp.bind(null,i,t),o)}function hf(){}function Pp(t,i){var o=Ni();i=i===void 0?null:i;var l=o.memoizedState;return l!==null&&i!==null&&af(i,l[1])?l[0]:(o.memoizedState=[t,i],t)}function Lp(t,i){var o=Ni();i=i===void 0?null:i;var l=o.memoizedState;return l!==null&&i!==null&&af(i,l[1])?l[0]:(t=t(),o.memoizedState=[t,i],t)}function Dp(t,i,o){return(Qs&21)===0?(t.baseState&&(t.baseState=!1,ui=!0),t.memoizedState=o):(Ki(o,i)||(o=kt(),on.lanes|=o,eo|=o,t.baseState=!0),i)}function j0(t,i){var o=Rt;Rt=o!==0&&4>o?o:4,t(!0);var l=of.transition;of.transition={};try{t(!1),i()}finally{Rt=o,of.transition=l}}function Ip(){return Ni().memoizedState}function Y0(t,i,o){var l=gs(t);if(o={lane:l,action:o,hasEagerState:!1,eagerState:null,next:null},Up(t))Np(i,o);else if(o=fp(t,i,o,l),o!==null){var d=Jn();tr(o,t,l,d),Fp(o,i,l)}}function q0(t,i,o){var l=gs(t),d={lane:l,action:o,hasEagerState:!1,eagerState:null,next:null};if(Up(t))Np(i,d);else{var m=t.alternate;if(t.lanes===0&&(m===null||m.lanes===0)&&(m=i.lastRenderedReducer,m!==null))try{var w=i.lastRenderedState,k=m(w,o);if(d.hasEagerState=!0,d.eagerState=k,Ki(k,w)){var X=i.interleaved;X===null?(d.next=d,Qu(i)):(d.next=X.next,X.next=d),i.interleaved=d;return}}catch{}finally{}o=fp(t,i,d,l),o!==null&&(d=Jn(),tr(o,t,l,d),Fp(o,i,l))}}function Up(t){var i=t.alternate;return t===on||i!==null&&i===on}function Np(t,i){Za=nc=!0;var o=t.pending;o===null?i.next=i:(i.next=o.next,o.next=i),t.pending=i}function Fp(t,i,o){if((o&4194240)!==0){var l=i.lanes;l&=t.pendingLanes,o|=l,i.lanes=o,cn(t,o)}}var sc={readContext:Ui,useCallback:Vn,useContext:Vn,useEffect:Vn,useImperativeHandle:Vn,useInsertionEffect:Vn,useLayoutEffect:Vn,useMemo:Vn,useReducer:Vn,useRef:Vn,useState:Vn,useDebugValue:Vn,useDeferredValue:Vn,useTransition:Vn,useMutableSource:Vn,useSyncExternalStore:Vn,useId:Vn,unstable_isNewReconciler:!1},$0={readContext:Ui,useCallback:function(t,i){return pr().memoizedState=[t,i===void 0?null:i],t},useContext:Ui,useEffect:wp,useImperativeHandle:function(t,i,o){return o=o!=null?o.concat([t]):null,ic(4194308,4,bp.bind(null,i,t),o)},useLayoutEffect:function(t,i){return ic(4194308,4,t,i)},useInsertionEffect:function(t,i){return ic(4,2,t,i)},useMemo:function(t,i){var o=pr();return i=i===void 0?null:i,t=t(),o.memoizedState=[t,i],t},useReducer:function(t,i,o){var l=pr();return i=o!==void 0?o(i):i,l.memoizedState=l.baseState=i,t={pending:null,interleaved:null,lanes:0,dispatch:null,lastRenderedReducer:t,lastRenderedState:i},l.queue=t,t=t.dispatch=Y0.bind(null,on,t),[l.memoizedState,t]},useRef:function(t){var i=pr();return t={current:t},i.memoizedState=t},useState:Ep,useDebugValue:hf,useDeferredValue:function(t){return pr().memoizedState=t},useTransition:function(){var t=Ep(!1),i=t[0];return t=j0.bind(null,t[1]),pr().memoizedState=t,[i,t]},useMutableSource:function(){},useSyncExternalStore:function(t,i,o){var l=on,d=pr();if(tn){if(o===void 0)throw Error(n(407));o=o()}else{if(o=i(),Cn===null)throw Error(n(349));(Qs&30)!==0||_p(l,i,o)}d.memoizedState=o;var m={value:o,getSnapshot:i};return d.queue=m,wp(yp.bind(null,l,m,t),[t]),l.flags|=2048,el(9,xp.bind(null,l,m,o,i),void 0,null),o},useId:function(){var t=pr(),i=Cn.identifierPrefix;if(tn){var o=Ir,l=Dr;o=(l&~(1<<32-gt(l)-1)).toString(32)+o,i=":"+i+"R"+o,o=Ja++,0<o&&(i+="H"+o.toString(32)),i+=":"}else o=X0++,i=":"+i+"r"+o.toString(32)+":";return t.memoizedState=i},unstable_isNewReconciler:!1},K0={readContext:Ui,useCallback:Pp,useContext:Ui,useEffect:df,useImperativeHandle:Cp,useInsertionEffect:Rp,useLayoutEffect:Ap,useMemo:Lp,useReducer:uf,useRef:Tp,useState:function(){return uf(Qa)},useDebugValue:hf,useDeferredValue:function(t){var i=Ni();return Dp(i,Tn.memoizedState,t)},useTransition:function(){var t=uf(Qa)[0],i=Ni().memoizedState;return[t,i]},useMutableSource:gp,useSyncExternalStore:vp,useId:Ip,unstable_isNewReconciler:!1},Z0={readContext:Ui,useCallback:Pp,useContext:Ui,useEffect:df,useImperativeHandle:Cp,useInsertionEffect:Rp,useLayoutEffect:Ap,useMemo:Lp,useReducer:ff,useRef:Tp,useState:function(){return ff(Qa)},useDebugValue:hf,useDeferredValue:function(t){var i=Ni();return Tn===null?i.memoizedState=t:Dp(i,Tn.memoizedState,t)},useTransition:function(){var t=ff(Qa)[0],i=Ni().memoizedState;return[t,i]},useMutableSource:gp,useSyncExternalStore:vp,useId:Ip,unstable_isNewReconciler:!1};function Ji(t,i){if(t&&t.defaultProps){i=se({},i),t=t.defaultProps;for(var o in t)i[o]===void 0&&(i[o]=t[o]);return i}return i}function pf(t,i,o,l){i=t.memoizedState,o=o(l,i),o=o==null?i:se({},i,o),t.memoizedState=o,t.lanes===0&&(t.updateQueue.baseState=o)}var oc={isMounted:function(t){return(t=t._reactInternals)?Ri(t)===t:!1},enqueueSetState:function(t,i,o){t=t._reactInternals;var l=Jn(),d=gs(t),m=Nr(l,d);m.payload=i,o!=null&&(m.callback=o),i=ds(t,m,d),i!==null&&(tr(i,t,d,l),Jl(i,t,d))},enqueueReplaceState:function(t,i,o){t=t._reactInternals;var l=Jn(),d=gs(t),m=Nr(l,d);m.tag=1,m.payload=i,o!=null&&(m.callback=o),i=ds(t,m,d),i!==null&&(tr(i,t,d,l),Jl(i,t,d))},enqueueForceUpdate:function(t,i){t=t._reactInternals;var o=Jn(),l=gs(t),d=Nr(o,l);d.tag=2,i!=null&&(d.callback=i),i=ds(t,d,l),i!==null&&(tr(i,t,l,o),Jl(i,t,l))}};function Op(t,i,o,l,d,m,w){return t=t.stateNode,typeof t.shouldComponentUpdate=="function"?t.shouldComponentUpdate(l,m,w):i.prototype&&i.prototype.isPureReactComponent?!za(o,l)||!za(d,m):!0}function kp(t,i,o){var l=!1,d=cs,m=i.contextType;return typeof m=="object"&&m!==null?m=Ui(m):(d=ci(i)?qs:Hn.current,l=i.contextTypes,m=(l=l!=null)?zo(t,d):cs),i=new i(o,m),t.memoizedState=i.state!==null&&i.state!==void 0?i.state:null,i.updater=oc,t.stateNode=i,i._reactInternals=t,l&&(t=t.stateNode,t.__reactInternalMemoizedUnmaskedChildContext=d,t.__reactInternalMemoizedMaskedChildContext=m),i}function Bp(t,i,o,l){t=i.state,typeof i.componentWillReceiveProps=="function"&&i.componentWillReceiveProps(o,l),typeof i.UNSAFE_componentWillReceiveProps=="function"&&i.UNSAFE_componentWillReceiveProps(o,l),i.state!==t&&oc.enqueueReplaceState(i,i.state,null)}function mf(t,i,o,l){var d=t.stateNode;d.props=o,d.state=t.memoizedState,d.refs={},ef(t);var m=i.contextType;typeof m=="object"&&m!==null?d.context=Ui(m):(m=ci(i)?qs:Hn.current,d.context=zo(t,m)),d.state=t.memoizedState,m=i.getDerivedStateFromProps,typeof m=="function"&&(pf(t,i,m,o),d.state=t.memoizedState),typeof i.getDerivedStateFromProps=="function"||typeof d.getSnapshotBeforeUpdate=="function"||typeof d.UNSAFE_componentWillMount!="function"&&typeof d.componentWillMount!="function"||(i=d.state,typeof d.componentWillMount=="function"&&d.componentWillMount(),typeof d.UNSAFE_componentWillMount=="function"&&d.UNSAFE_componentWillMount(),i!==d.state&&oc.enqueueReplaceState(d,d.state,null),Ql(t,o,d,l),d.state=t.memoizedState),typeof d.componentDidMount=="function"&&(t.flags|=4194308)}function qo(t,i){try{var o="",l=i;do o+=me(l),l=l.return;while(l);var d=o}catch(m){d=`
Error generating stack: `+m.message+`
`+m.stack}return{value:t,source:i,stack:d,digest:null}}function gf(t,i,o){return{value:t,source:null,stack:o??null,digest:i??null}}function vf(t,i){try{console.error(i.value)}catch(o){setTimeout(function(){throw o})}}var J0=typeof WeakMap=="function"?WeakMap:Map;function zp(t,i,o){o=Nr(-1,o),o.tag=3,o.payload={element:null};var l=i.value;return o.callback=function(){hc||(hc=!0,Df=l),vf(t,i)},o}function Hp(t,i,o){o=Nr(-1,o),o.tag=3;var l=t.type.getDerivedStateFromError;if(typeof l=="function"){var d=i.value;o.payload=function(){return l(d)},o.callback=function(){vf(t,i)}}var m=t.stateNode;return m!==null&&typeof m.componentDidCatch=="function"&&(o.callback=function(){vf(t,i),typeof l!="function"&&(ps===null?ps=new Set([this]):ps.add(this));var w=i.stack;this.componentDidCatch(i.value,{componentStack:w!==null?w:""})}),o}function Vp(t,i,o){var l=t.pingCache;if(l===null){l=t.pingCache=new J0;var d=new Set;l.set(i,d)}else d=l.get(i),d===void 0&&(d=new Set,l.set(i,d));d.has(o)||(d.add(o),t=dv.bind(null,t,i,o),i.then(t,t))}function Gp(t){do{var i;if((i=t.tag===13)&&(i=t.memoizedState,i=i!==null?i.dehydrated!==null:!0),i)return t;t=t.return}while(t!==null);return null}function Wp(t,i,o,l,d){return(t.mode&1)===0?(t===i?t.flags|=65536:(t.flags|=128,o.flags|=131072,o.flags&=-52805,o.tag===1&&(o.alternate===null?o.tag=17:(i=Nr(-1,1),i.tag=2,ds(o,i,1))),o.lanes|=1),t):(t.flags|=65536,t.lanes=d,t)}var Q0=A.ReactCurrentOwner,ui=!1;function Zn(t,i,o,l){i.child=t===null?up(i,null,o,l):Wo(i,t.child,o,l)}function Xp(t,i,o,l,d){o=o.render;var m=i.ref;return jo(i,d),l=lf(t,i,o,l,m,d),o=cf(),t!==null&&!ui?(i.updateQueue=t.updateQueue,i.flags&=-2053,t.lanes&=~d,Fr(t,i,d)):(tn&&o&&Wu(i),i.flags|=1,Zn(t,i,l,d),i.child)}function jp(t,i,o,l,d){if(t===null){var m=o.type;return typeof m=="function"&&!Bf(m)&&m.defaultProps===void 0&&o.compare===null&&o.defaultProps===void 0?(i.tag=15,i.type=m,Yp(t,i,m,l,d)):(t=xc(o.type,null,l,i,i.mode,d),t.ref=i.ref,t.return=i,i.child=t)}if(m=t.child,(t.lanes&d)===0){var w=m.memoizedProps;if(o=o.compare,o=o!==null?o:za,o(w,l)&&t.ref===i.ref)return Fr(t,i,d)}return i.flags|=1,t=_s(m,l),t.ref=i.ref,t.return=i,i.child=t}function Yp(t,i,o,l,d){if(t!==null){var m=t.memoizedProps;if(za(m,l)&&t.ref===i.ref)if(ui=!1,i.pendingProps=l=m,(t.lanes&d)!==0)(t.flags&131072)!==0&&(ui=!0);else return i.lanes=t.lanes,Fr(t,i,d)}return _f(t,i,o,l,d)}function qp(t,i,o){var l=i.pendingProps,d=l.children,m=t!==null?t.memoizedState:null;if(l.mode==="hidden")if((i.mode&1)===0)i.memoizedState={baseLanes:0,cachePool:null,transitions:null},qt(Ko,Si),Si|=o;else{if((o&1073741824)===0)return t=m!==null?m.baseLanes|o:o,i.lanes=i.childLanes=1073741824,i.memoizedState={baseLanes:t,cachePool:null,transitions:null},i.updateQueue=null,qt(Ko,Si),Si|=t,null;i.memoizedState={baseLanes:0,cachePool:null,transitions:null},l=m!==null?m.baseLanes:o,qt(Ko,Si),Si|=l}else m!==null?(l=m.baseLanes|o,i.memoizedState=null):l=o,qt(Ko,Si),Si|=l;return Zn(t,i,d,o),i.child}function $p(t,i){var o=i.ref;(t===null&&o!==null||t!==null&&t.ref!==o)&&(i.flags|=512,i.flags|=2097152)}function _f(t,i,o,l,d){var m=ci(o)?qs:Hn.current;return m=zo(i,m),jo(i,d),o=lf(t,i,o,l,m,d),l=cf(),t!==null&&!ui?(i.updateQueue=t.updateQueue,i.flags&=-2053,t.lanes&=~d,Fr(t,i,d)):(tn&&l&&Wu(i),i.flags|=1,Zn(t,i,o,d),i.child)}function Kp(t,i,o,l,d){if(ci(o)){var m=!0;Wl(i)}else m=!1;if(jo(i,d),i.stateNode===null)lc(t,i),kp(i,o,l),mf(i,o,l,d),l=!0;else if(t===null){var w=i.stateNode,k=i.memoizedProps;w.props=k;var X=w.context,he=o.contextType;typeof he=="object"&&he!==null?he=Ui(he):(he=ci(o)?qs:Hn.current,he=zo(i,he));var we=o.getDerivedStateFromProps,Pe=typeof we=="function"||typeof w.getSnapshotBeforeUpdate=="function";Pe||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(k!==l||X!==he)&&Bp(i,w,l,he),fs=!1;var Ee=i.memoizedState;w.state=Ee,Ql(i,l,w,d),X=i.memoizedState,k!==l||Ee!==X||li.current||fs?(typeof we=="function"&&(pf(i,o,we,l),X=i.memoizedState),(k=fs||Op(i,o,k,l,Ee,X,he))?(Pe||typeof w.UNSAFE_componentWillMount!="function"&&typeof w.componentWillMount!="function"||(typeof w.componentWillMount=="function"&&w.componentWillMount(),typeof w.UNSAFE_componentWillMount=="function"&&w.UNSAFE_componentWillMount()),typeof w.componentDidMount=="function"&&(i.flags|=4194308)):(typeof w.componentDidMount=="function"&&(i.flags|=4194308),i.memoizedProps=l,i.memoizedState=X),w.props=l,w.state=X,w.context=he,l=k):(typeof w.componentDidMount=="function"&&(i.flags|=4194308),l=!1)}else{w=i.stateNode,dp(t,i),k=i.memoizedProps,he=i.type===i.elementType?k:Ji(i.type,k),w.props=he,Pe=i.pendingProps,Ee=w.context,X=o.contextType,typeof X=="object"&&X!==null?X=Ui(X):(X=ci(o)?qs:Hn.current,X=zo(i,X));var je=o.getDerivedStateFromProps;(we=typeof je=="function"||typeof w.getSnapshotBeforeUpdate=="function")||typeof w.UNSAFE_componentWillReceiveProps!="function"&&typeof w.componentWillReceiveProps!="function"||(k!==Pe||Ee!==X)&&Bp(i,w,l,X),fs=!1,Ee=i.memoizedState,w.state=Ee,Ql(i,l,w,d);var Ze=i.memoizedState;k!==Pe||Ee!==Ze||li.current||fs?(typeof je=="function"&&(pf(i,o,je,l),Ze=i.memoizedState),(he=fs||Op(i,o,he,l,Ee,Ze,X)||!1)?(we||typeof w.UNSAFE_componentWillUpdate!="function"&&typeof w.componentWillUpdate!="function"||(typeof w.componentWillUpdate=="function"&&w.componentWillUpdate(l,Ze,X),typeof w.UNSAFE_componentWillUpdate=="function"&&w.UNSAFE_componentWillUpdate(l,Ze,X)),typeof w.componentDidUpdate=="function"&&(i.flags|=4),typeof w.getSnapshotBeforeUpdate=="function"&&(i.flags|=1024)):(typeof w.componentDidUpdate!="function"||k===t.memoizedProps&&Ee===t.memoizedState||(i.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||k===t.memoizedProps&&Ee===t.memoizedState||(i.flags|=1024),i.memoizedProps=l,i.memoizedState=Ze),w.props=l,w.state=Ze,w.context=X,l=he):(typeof w.componentDidUpdate!="function"||k===t.memoizedProps&&Ee===t.memoizedState||(i.flags|=4),typeof w.getSnapshotBeforeUpdate!="function"||k===t.memoizedProps&&Ee===t.memoizedState||(i.flags|=1024),l=!1)}return xf(t,i,o,l,m,d)}function xf(t,i,o,l,d,m){$p(t,i);var w=(i.flags&128)!==0;if(!l&&!w)return d&&tp(i,o,!1),Fr(t,i,m);l=i.stateNode,Q0.current=i;var k=w&&typeof o.getDerivedStateFromError!="function"?null:l.render();return i.flags|=1,t!==null&&w?(i.child=Wo(i,t.child,null,m),i.child=Wo(i,null,k,m)):Zn(t,i,k,m),i.memoizedState=l.state,d&&tp(i,o,!0),i.child}function Zp(t){var i=t.stateNode;i.pendingContext?Qh(t,i.pendingContext,i.pendingContext!==i.context):i.context&&Qh(t,i.context,!1),tf(t,i.containerInfo)}function Jp(t,i,o,l,d){return Go(),qu(d),i.flags|=256,Zn(t,i,o,l),i.child}var yf={dehydrated:null,treeContext:null,retryLane:0};function Sf(t){return{baseLanes:t,cachePool:null,transitions:null}}function Qp(t,i,o){var l=i.pendingProps,d=sn.current,m=!1,w=(i.flags&128)!==0,k;if((k=w)||(k=t!==null&&t.memoizedState===null?!1:(d&2)!==0),k?(m=!0,i.flags&=-129):(t===null||t.memoizedState!==null)&&(d|=1),qt(sn,d&1),t===null)return Yu(i),t=i.memoizedState,t!==null&&(t=t.dehydrated,t!==null)?((i.mode&1)===0?i.lanes=1:t.data==="$!"?i.lanes=8:i.lanes=1073741824,null):(w=l.children,t=l.fallback,m?(l=i.mode,m=i.child,w={mode:"hidden",children:w},(l&1)===0&&m!==null?(m.childLanes=0,m.pendingProps=w):m=yc(w,l,0,null),t=ro(t,l,o,null),m.return=i,t.return=i,m.sibling=t,i.child=m,i.child.memoizedState=Sf(o),i.memoizedState=yf,t):Mf(i,w));if(d=t.memoizedState,d!==null&&(k=d.dehydrated,k!==null))return ev(t,i,w,l,k,d,o);if(m){m=l.fallback,w=i.mode,d=t.child,k=d.sibling;var X={mode:"hidden",children:l.children};return(w&1)===0&&i.child!==d?(l=i.child,l.childLanes=0,l.pendingProps=X,i.deletions=null):(l=_s(d,X),l.subtreeFlags=d.subtreeFlags&14680064),k!==null?m=_s(k,m):(m=ro(m,w,o,null),m.flags|=2),m.return=i,l.return=i,l.sibling=m,i.child=l,l=m,m=i.child,w=t.child.memoizedState,w=w===null?Sf(o):{baseLanes:w.baseLanes|o,cachePool:null,transitions:w.transitions},m.memoizedState=w,m.childLanes=t.childLanes&~o,i.memoizedState=yf,l}return m=t.child,t=m.sibling,l=_s(m,{mode:"visible",children:l.children}),(i.mode&1)===0&&(l.lanes=o),l.return=i,l.sibling=null,t!==null&&(o=i.deletions,o===null?(i.deletions=[t],i.flags|=16):o.push(t)),i.child=l,i.memoizedState=null,l}function Mf(t,i){return i=yc({mode:"visible",children:i},t.mode,0,null),i.return=t,t.child=i}function ac(t,i,o,l){return l!==null&&qu(l),Wo(i,t.child,null,o),t=Mf(i,i.pendingProps.children),t.flags|=2,i.memoizedState=null,t}function ev(t,i,o,l,d,m,w){if(o)return i.flags&256?(i.flags&=-257,l=gf(Error(n(422))),ac(t,i,w,l)):i.memoizedState!==null?(i.child=t.child,i.flags|=128,null):(m=l.fallback,d=i.mode,l=yc({mode:"visible",children:l.children},d,0,null),m=ro(m,d,w,null),m.flags|=2,l.return=i,m.return=i,l.sibling=m,i.child=l,(i.mode&1)!==0&&Wo(i,t.child,null,w),i.child.memoizedState=Sf(w),i.memoizedState=yf,m);if((i.mode&1)===0)return ac(t,i,w,null);if(d.data==="$!"){if(l=d.nextSibling&&d.nextSibling.dataset,l)var k=l.dgst;return l=k,m=Error(n(419)),l=gf(m,l,void 0),ac(t,i,w,l)}if(k=(w&t.childLanes)!==0,ui||k){if(l=Cn,l!==null){switch(w&-w){case 4:d=2;break;case 16:d=8;break;case 64:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:case 67108864:d=32;break;case 536870912:d=268435456;break;default:d=0}d=(d&(l.suspendedLanes|w))!==0?0:d,d!==0&&d!==m.retryLane&&(m.retryLane=d,Ur(t,d),tr(l,t,d,-1))}return kf(),l=gf(Error(n(421))),ac(t,i,w,l)}return d.data==="$?"?(i.flags|=128,i.child=t.child,i=hv.bind(null,t),d._reactRetry=i,null):(t=m.treeContext,yi=as(d.nextSibling),xi=i,tn=!0,Zi=null,t!==null&&(Di[Ii++]=Dr,Di[Ii++]=Ir,Di[Ii++]=$s,Dr=t.id,Ir=t.overflow,$s=i),i=Mf(i,l.children),i.flags|=4096,i)}function em(t,i,o){t.lanes|=i;var l=t.alternate;l!==null&&(l.lanes|=i),Ju(t.return,i,o)}function Ef(t,i,o,l,d){var m=t.memoizedState;m===null?t.memoizedState={isBackwards:i,rendering:null,renderingStartTime:0,last:l,tail:o,tailMode:d}:(m.isBackwards=i,m.rendering=null,m.renderingStartTime=0,m.last=l,m.tail=o,m.tailMode=d)}function tm(t,i,o){var l=i.pendingProps,d=l.revealOrder,m=l.tail;if(Zn(t,i,l.children,o),l=sn.current,(l&2)!==0)l=l&1|2,i.flags|=128;else{if(t!==null&&(t.flags&128)!==0)e:for(t=i.child;t!==null;){if(t.tag===13)t.memoizedState!==null&&em(t,o,i);else if(t.tag===19)em(t,o,i);else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===i)break e;for(;t.sibling===null;){if(t.return===null||t.return===i)break e;t=t.return}t.sibling.return=t.return,t=t.sibling}l&=1}if(qt(sn,l),(i.mode&1)===0)i.memoizedState=null;else switch(d){case"forwards":for(o=i.child,d=null;o!==null;)t=o.alternate,t!==null&&ec(t)===null&&(d=o),o=o.sibling;o=d,o===null?(d=i.child,i.child=null):(d=o.sibling,o.sibling=null),Ef(i,!1,d,o,m);break;case"backwards":for(o=null,d=i.child,i.child=null;d!==null;){if(t=d.alternate,t!==null&&ec(t)===null){i.child=d;break}t=d.sibling,d.sibling=o,o=d,d=t}Ef(i,!0,o,null,m);break;case"together":Ef(i,!1,null,null,void 0);break;default:i.memoizedState=null}return i.child}function lc(t,i){(i.mode&1)===0&&t!==null&&(t.alternate=null,i.alternate=null,i.flags|=2)}function Fr(t,i,o){if(t!==null&&(i.dependencies=t.dependencies),eo|=i.lanes,(o&i.childLanes)===0)return null;if(t!==null&&i.child!==t.child)throw Error(n(153));if(i.child!==null){for(t=i.child,o=_s(t,t.pendingProps),i.child=o,o.return=i;t.sibling!==null;)t=t.sibling,o=o.sibling=_s(t,t.pendingProps),o.return=i;o.sibling=null}return i.child}function tv(t,i,o){switch(i.tag){case 3:Zp(i),Go();break;case 5:mp(i);break;case 1:ci(i.type)&&Wl(i);break;case 4:tf(i,i.stateNode.containerInfo);break;case 10:var l=i.type._context,d=i.memoizedProps.value;qt(Kl,l._currentValue),l._currentValue=d;break;case 13:if(l=i.memoizedState,l!==null)return l.dehydrated!==null?(qt(sn,sn.current&1),i.flags|=128,null):(o&i.child.childLanes)!==0?Qp(t,i,o):(qt(sn,sn.current&1),t=Fr(t,i,o),t!==null?t.sibling:null);qt(sn,sn.current&1);break;case 19:if(l=(o&i.childLanes)!==0,(t.flags&128)!==0){if(l)return tm(t,i,o);i.flags|=128}if(d=i.memoizedState,d!==null&&(d.rendering=null,d.tail=null,d.lastEffect=null),qt(sn,sn.current),l)break;return null;case 22:case 23:return i.lanes=0,qp(t,i,o)}return Fr(t,i,o)}var nm,Tf,im,rm;nm=function(t,i){for(var o=i.child;o!==null;){if(o.tag===5||o.tag===6)t.appendChild(o.stateNode);else if(o.tag!==4&&o.child!==null){o.child.return=o,o=o.child;continue}if(o===i)break;for(;o.sibling===null;){if(o.return===null||o.return===i)return;o=o.return}o.sibling.return=o.return,o=o.sibling}},Tf=function(){},im=function(t,i,o,l){var d=t.memoizedProps;if(d!==l){t=i.stateNode,Js(hr.current);var m=null;switch(o){case"input":d=V(t,d),l=V(t,l),m=[];break;case"select":d=se({},d,{value:void 0}),l=se({},l,{value:void 0}),m=[];break;case"textarea":d=R(t,d),l=R(t,l),m=[];break;default:typeof d.onClick!="function"&&typeof l.onClick=="function"&&(t.onclick=Hl)}mt(o,l);var w;o=null;for(he in d)if(!l.hasOwnProperty(he)&&d.hasOwnProperty(he)&&d[he]!=null)if(he==="style"){var k=d[he];for(w in k)k.hasOwnProperty(w)&&(o||(o={}),o[w]="")}else he!=="dangerouslySetInnerHTML"&&he!=="children"&&he!=="suppressContentEditableWarning"&&he!=="suppressHydrationWarning"&&he!=="autoFocus"&&(a.hasOwnProperty(he)?m||(m=[]):(m=m||[]).push(he,null));for(he in l){var X=l[he];if(k=d!=null?d[he]:void 0,l.hasOwnProperty(he)&&X!==k&&(X!=null||k!=null))if(he==="style")if(k){for(w in k)!k.hasOwnProperty(w)||X&&X.hasOwnProperty(w)||(o||(o={}),o[w]="");for(w in X)X.hasOwnProperty(w)&&k[w]!==X[w]&&(o||(o={}),o[w]=X[w])}else o||(m||(m=[]),m.push(he,o)),o=X;else he==="dangerouslySetInnerHTML"?(X=X?X.__html:void 0,k=k?k.__html:void 0,X!=null&&k!==X&&(m=m||[]).push(he,X)):he==="children"?typeof X!="string"&&typeof X!="number"||(m=m||[]).push(he,""+X):he!=="suppressContentEditableWarning"&&he!=="suppressHydrationWarning"&&(a.hasOwnProperty(he)?(X!=null&&he==="onScroll"&&Zt("scroll",t),m||k===X||(m=[])):(m=m||[]).push(he,X))}o&&(m=m||[]).push("style",o);var he=m;(i.updateQueue=he)&&(i.flags|=4)}},rm=function(t,i,o,l){o!==l&&(i.flags|=4)};function tl(t,i){if(!tn)switch(t.tailMode){case"hidden":i=t.tail;for(var o=null;i!==null;)i.alternate!==null&&(o=i),i=i.sibling;o===null?t.tail=null:o.sibling=null;break;case"collapsed":o=t.tail;for(var l=null;o!==null;)o.alternate!==null&&(l=o),o=o.sibling;l===null?i||t.tail===null?t.tail=null:t.tail.sibling=null:l.sibling=null}}function Gn(t){var i=t.alternate!==null&&t.alternate.child===t.child,o=0,l=0;if(i)for(var d=t.child;d!==null;)o|=d.lanes|d.childLanes,l|=d.subtreeFlags&14680064,l|=d.flags&14680064,d.return=t,d=d.sibling;else for(d=t.child;d!==null;)o|=d.lanes|d.childLanes,l|=d.subtreeFlags,l|=d.flags,d.return=t,d=d.sibling;return t.subtreeFlags|=l,t.childLanes=o,i}function nv(t,i,o){var l=i.pendingProps;switch(Xu(i),i.tag){case 2:case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Gn(i),null;case 1:return ci(i.type)&&Gl(),Gn(i),null;case 3:return l=i.stateNode,Yo(),Jt(li),Jt(Hn),sf(),l.pendingContext&&(l.context=l.pendingContext,l.pendingContext=null),(t===null||t.child===null)&&(ql(i)?i.flags|=4:t===null||t.memoizedState.isDehydrated&&(i.flags&256)===0||(i.flags|=1024,Zi!==null&&(Nf(Zi),Zi=null))),Tf(t,i),Gn(i),null;case 5:nf(i);var d=Js(Ka.current);if(o=i.type,t!==null&&i.stateNode!=null)im(t,i,o,l,d),t.ref!==i.ref&&(i.flags|=512,i.flags|=2097152);else{if(!l){if(i.stateNode===null)throw Error(n(166));return Gn(i),null}if(t=Js(hr.current),ql(i)){l=i.stateNode,o=i.type;var m=i.memoizedProps;switch(l[dr]=i,l[Xa]=m,t=(i.mode&1)!==0,o){case"dialog":Zt("cancel",l),Zt("close",l);break;case"iframe":case"object":case"embed":Zt("load",l);break;case"video":case"audio":for(d=0;d<Va.length;d++)Zt(Va[d],l);break;case"source":Zt("error",l);break;case"img":case"image":case"link":Zt("error",l),Zt("load",l);break;case"details":Zt("toggle",l);break;case"input":St(l,m),Zt("invalid",l);break;case"select":l._wrapperState={wasMultiple:!!m.multiple},Zt("invalid",l);break;case"textarea":W(l,m),Zt("invalid",l)}mt(o,m),d=null;for(var w in m)if(m.hasOwnProperty(w)){var k=m[w];w==="children"?typeof k=="string"?l.textContent!==k&&(m.suppressHydrationWarning!==!0&&zl(l.textContent,k,t),d=["children",k]):typeof k=="number"&&l.textContent!==""+k&&(m.suppressHydrationWarning!==!0&&zl(l.textContent,k,t),d=["children",""+k]):a.hasOwnProperty(w)&&k!=null&&w==="onScroll"&&Zt("scroll",l)}switch(o){case"input":vt(l),de(l,m,!0);break;case"textarea":vt(l),ge(l);break;case"select":case"option":break;default:typeof m.onClick=="function"&&(l.onclick=Hl)}l=d,i.updateQueue=l,l!==null&&(i.flags|=4)}else{w=d.nodeType===9?d:d.ownerDocument,t==="http://www.w3.org/1999/xhtml"&&(t=pe(o)),t==="http://www.w3.org/1999/xhtml"?o==="script"?(t=w.createElement("div"),t.innerHTML="<script><\/script>",t=t.removeChild(t.firstChild)):typeof l.is=="string"?t=w.createElement(o,{is:l.is}):(t=w.createElement(o),o==="select"&&(w=t,l.multiple?w.multiple=!0:l.size&&(w.size=l.size))):t=w.createElementNS(t,o),t[dr]=i,t[Xa]=l,nm(t,i,!1,!1),i.stateNode=t;e:{switch(w=ht(o,l),o){case"dialog":Zt("cancel",t),Zt("close",t),d=l;break;case"iframe":case"object":case"embed":Zt("load",t),d=l;break;case"video":case"audio":for(d=0;d<Va.length;d++)Zt(Va[d],t);d=l;break;case"source":Zt("error",t),d=l;break;case"img":case"image":case"link":Zt("error",t),Zt("load",t),d=l;break;case"details":Zt("toggle",t),d=l;break;case"input":St(t,l),d=V(t,l),Zt("invalid",t);break;case"option":d=l;break;case"select":t._wrapperState={wasMultiple:!!l.multiple},d=se({},l,{value:void 0}),Zt("invalid",t);break;case"textarea":W(t,l),d=R(t,l),Zt("invalid",t);break;default:d=l}mt(o,d),k=d;for(m in k)if(k.hasOwnProperty(m)){var X=k[m];m==="style"?rt(t,X):m==="dangerouslySetInnerHTML"?(X=X?X.__html:void 0,X!=null&&Be(t,X)):m==="children"?typeof X=="string"?(o!=="textarea"||X!=="")&&ot(t,X):typeof X=="number"&&ot(t,""+X):m!=="suppressContentEditableWarning"&&m!=="suppressHydrationWarning"&&m!=="autoFocus"&&(a.hasOwnProperty(m)?X!=null&&m==="onScroll"&&Zt("scroll",t):X!=null&&D(t,m,X,w))}switch(o){case"input":vt(t),de(t,l,!1);break;case"textarea":vt(t),ge(t);break;case"option":l.value!=null&&t.setAttribute("value",""+Re(l.value));break;case"select":t.multiple=!!l.multiple,m=l.value,m!=null?C(t,!!l.multiple,m,!1):l.defaultValue!=null&&C(t,!!l.multiple,l.defaultValue,!0);break;default:typeof d.onClick=="function"&&(t.onclick=Hl)}switch(o){case"button":case"input":case"select":case"textarea":l=!!l.autoFocus;break e;case"img":l=!0;break e;default:l=!1}}l&&(i.flags|=4)}i.ref!==null&&(i.flags|=512,i.flags|=2097152)}return Gn(i),null;case 6:if(t&&i.stateNode!=null)rm(t,i,t.memoizedProps,l);else{if(typeof l!="string"&&i.stateNode===null)throw Error(n(166));if(o=Js(Ka.current),Js(hr.current),ql(i)){if(l=i.stateNode,o=i.memoizedProps,l[dr]=i,(m=l.nodeValue!==o)&&(t=xi,t!==null))switch(t.tag){case 3:zl(l.nodeValue,o,(t.mode&1)!==0);break;case 5:t.memoizedProps.suppressHydrationWarning!==!0&&zl(l.nodeValue,o,(t.mode&1)!==0)}m&&(i.flags|=4)}else l=(o.nodeType===9?o:o.ownerDocument).createTextNode(l),l[dr]=i,i.stateNode=l}return Gn(i),null;case 13:if(Jt(sn),l=i.memoizedState,t===null||t.memoizedState!==null&&t.memoizedState.dehydrated!==null){if(tn&&yi!==null&&(i.mode&1)!==0&&(i.flags&128)===0)ap(),Go(),i.flags|=98560,m=!1;else if(m=ql(i),l!==null&&l.dehydrated!==null){if(t===null){if(!m)throw Error(n(318));if(m=i.memoizedState,m=m!==null?m.dehydrated:null,!m)throw Error(n(317));m[dr]=i}else Go(),(i.flags&128)===0&&(i.memoizedState=null),i.flags|=4;Gn(i),m=!1}else Zi!==null&&(Nf(Zi),Zi=null),m=!0;if(!m)return i.flags&65536?i:null}return(i.flags&128)!==0?(i.lanes=o,i):(l=l!==null,l!==(t!==null&&t.memoizedState!==null)&&l&&(i.child.flags|=8192,(i.mode&1)!==0&&(t===null||(sn.current&1)!==0?wn===0&&(wn=3):kf())),i.updateQueue!==null&&(i.flags|=4),Gn(i),null);case 4:return Yo(),Tf(t,i),t===null&&Ga(i.stateNode.containerInfo),Gn(i),null;case 10:return Zu(i.type._context),Gn(i),null;case 17:return ci(i.type)&&Gl(),Gn(i),null;case 19:if(Jt(sn),m=i.memoizedState,m===null)return Gn(i),null;if(l=(i.flags&128)!==0,w=m.rendering,w===null)if(l)tl(m,!1);else{if(wn!==0||t!==null&&(t.flags&128)!==0)for(t=i.child;t!==null;){if(w=ec(t),w!==null){for(i.flags|=128,tl(m,!1),l=w.updateQueue,l!==null&&(i.updateQueue=l,i.flags|=4),i.subtreeFlags=0,l=o,o=i.child;o!==null;)m=o,t=l,m.flags&=14680066,w=m.alternate,w===null?(m.childLanes=0,m.lanes=t,m.child=null,m.subtreeFlags=0,m.memoizedProps=null,m.memoizedState=null,m.updateQueue=null,m.dependencies=null,m.stateNode=null):(m.childLanes=w.childLanes,m.lanes=w.lanes,m.child=w.child,m.subtreeFlags=0,m.deletions=null,m.memoizedProps=w.memoizedProps,m.memoizedState=w.memoizedState,m.updateQueue=w.updateQueue,m.type=w.type,t=w.dependencies,m.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),o=o.sibling;return qt(sn,sn.current&1|2),i.child}t=t.sibling}m.tail!==null&&J()>Zo&&(i.flags|=128,l=!0,tl(m,!1),i.lanes=4194304)}else{if(!l)if(t=ec(w),t!==null){if(i.flags|=128,l=!0,o=t.updateQueue,o!==null&&(i.updateQueue=o,i.flags|=4),tl(m,!0),m.tail===null&&m.tailMode==="hidden"&&!w.alternate&&!tn)return Gn(i),null}else 2*J()-m.renderingStartTime>Zo&&o!==1073741824&&(i.flags|=128,l=!0,tl(m,!1),i.lanes=4194304);m.isBackwards?(w.sibling=i.child,i.child=w):(o=m.last,o!==null?o.sibling=w:i.child=w,m.last=w)}return m.tail!==null?(i=m.tail,m.rendering=i,m.tail=i.sibling,m.renderingStartTime=J(),i.sibling=null,o=sn.current,qt(sn,l?o&1|2:o&1),i):(Gn(i),null);case 22:case 23:return Of(),l=i.memoizedState!==null,t!==null&&t.memoizedState!==null!==l&&(i.flags|=8192),l&&(i.mode&1)!==0?(Si&1073741824)!==0&&(Gn(i),i.subtreeFlags&6&&(i.flags|=8192)):Gn(i),null;case 24:return null;case 25:return null}throw Error(n(156,i.tag))}function iv(t,i){switch(Xu(i),i.tag){case 1:return ci(i.type)&&Gl(),t=i.flags,t&65536?(i.flags=t&-65537|128,i):null;case 3:return Yo(),Jt(li),Jt(Hn),sf(),t=i.flags,(t&65536)!==0&&(t&128)===0?(i.flags=t&-65537|128,i):null;case 5:return nf(i),null;case 13:if(Jt(sn),t=i.memoizedState,t!==null&&t.dehydrated!==null){if(i.alternate===null)throw Error(n(340));Go()}return t=i.flags,t&65536?(i.flags=t&-65537|128,i):null;case 19:return Jt(sn),null;case 4:return Yo(),null;case 10:return Zu(i.type._context),null;case 22:case 23:return Of(),null;case 24:return null;default:return null}}var cc=!1,Wn=!1,rv=typeof WeakSet=="function"?WeakSet:Set,Ke=null;function $o(t,i){var o=t.ref;if(o!==null)if(typeof o=="function")try{o(null)}catch(l){un(t,i,l)}else o.current=null}function wf(t,i,o){try{o()}catch(l){un(t,i,l)}}var sm=!1;function sv(t,i){if(Fu=ks,t=Oh(),bu(t)){if("selectionStart"in t)var o={start:t.selectionStart,end:t.selectionEnd};else e:{o=(o=t.ownerDocument)&&o.defaultView||window;var l=o.getSelection&&o.getSelection();if(l&&l.rangeCount!==0){o=l.anchorNode;var d=l.anchorOffset,m=l.focusNode;l=l.focusOffset;try{o.nodeType,m.nodeType}catch{o=null;break e}var w=0,k=-1,X=-1,he=0,we=0,Pe=t,Ee=null;t:for(;;){for(var je;Pe!==o||d!==0&&Pe.nodeType!==3||(k=w+d),Pe!==m||l!==0&&Pe.nodeType!==3||(X=w+l),Pe.nodeType===3&&(w+=Pe.nodeValue.length),(je=Pe.firstChild)!==null;)Ee=Pe,Pe=je;for(;;){if(Pe===t)break t;if(Ee===o&&++he===d&&(k=w),Ee===m&&++we===l&&(X=w),(je=Pe.nextSibling)!==null)break;Pe=Ee,Ee=Pe.parentNode}Pe=je}o=k===-1||X===-1?null:{start:k,end:X}}else o=null}o=o||{start:0,end:0}}else o=null;for(Ou={focusedElem:t,selectionRange:o},ks=!1,Ke=i;Ke!==null;)if(i=Ke,t=i.child,(i.subtreeFlags&1028)!==0&&t!==null)t.return=i,Ke=t;else for(;Ke!==null;){i=Ke;try{var Ze=i.alternate;if((i.flags&1024)!==0)switch(i.tag){case 0:case 11:case 15:break;case 1:if(Ze!==null){var Je=Ze.memoizedProps,vn=Ze.memoizedState,ne=i.stateNode,Y=ne.getSnapshotBeforeUpdate(i.elementType===i.type?Je:Ji(i.type,Je),vn);ne.__reactInternalSnapshotBeforeUpdate=Y}break;case 3:var le=i.stateNode.containerInfo;le.nodeType===1?le.textContent="":le.nodeType===9&&le.documentElement&&le.removeChild(le.documentElement);break;case 5:case 6:case 4:case 17:break;default:throw Error(n(163))}}catch(Ie){un(i,i.return,Ie)}if(t=i.sibling,t!==null){t.return=i.return,Ke=t;break}Ke=i.return}return Ze=sm,sm=!1,Ze}function nl(t,i,o){var l=i.updateQueue;if(l=l!==null?l.lastEffect:null,l!==null){var d=l=l.next;do{if((d.tag&t)===t){var m=d.destroy;d.destroy=void 0,m!==void 0&&wf(i,o,m)}d=d.next}while(d!==l)}}function uc(t,i){if(i=i.updateQueue,i=i!==null?i.lastEffect:null,i!==null){var o=i=i.next;do{if((o.tag&t)===t){var l=o.create;o.destroy=l()}o=o.next}while(o!==i)}}function Rf(t){var i=t.ref;if(i!==null){var o=t.stateNode;switch(t.tag){case 5:t=o;break;default:t=o}typeof i=="function"?i(t):i.current=t}}function om(t){var i=t.alternate;i!==null&&(t.alternate=null,om(i)),t.child=null,t.deletions=null,t.sibling=null,t.tag===5&&(i=t.stateNode,i!==null&&(delete i[dr],delete i[Xa],delete i[Hu],delete i[H0],delete i[V0])),t.stateNode=null,t.return=null,t.dependencies=null,t.memoizedProps=null,t.memoizedState=null,t.pendingProps=null,t.stateNode=null,t.updateQueue=null}function am(t){return t.tag===5||t.tag===3||t.tag===4}function lm(t){e:for(;;){for(;t.sibling===null;){if(t.return===null||am(t.return))return null;t=t.return}for(t.sibling.return=t.return,t=t.sibling;t.tag!==5&&t.tag!==6&&t.tag!==18;){if(t.flags&2||t.child===null||t.tag===4)continue e;t.child.return=t,t=t.child}if(!(t.flags&2))return t.stateNode}}function Af(t,i,o){var l=t.tag;if(l===5||l===6)t=t.stateNode,i?o.nodeType===8?o.parentNode.insertBefore(t,i):o.insertBefore(t,i):(o.nodeType===8?(i=o.parentNode,i.insertBefore(t,o)):(i=o,i.appendChild(t)),o=o._reactRootContainer,o!=null||i.onclick!==null||(i.onclick=Hl));else if(l!==4&&(t=t.child,t!==null))for(Af(t,i,o),t=t.sibling;t!==null;)Af(t,i,o),t=t.sibling}function bf(t,i,o){var l=t.tag;if(l===5||l===6)t=t.stateNode,i?o.insertBefore(t,i):o.appendChild(t);else if(l!==4&&(t=t.child,t!==null))for(bf(t,i,o),t=t.sibling;t!==null;)bf(t,i,o),t=t.sibling}var Fn=null,Qi=!1;function hs(t,i,o){for(o=o.child;o!==null;)cm(t,i,o),o=o.sibling}function cm(t,i,o){if($e&&typeof $e.onCommitFiberUnmount=="function")try{$e.onCommitFiberUnmount(lt,o)}catch{}switch(o.tag){case 5:Wn||$o(o,i);case 6:var l=Fn,d=Qi;Fn=null,hs(t,i,o),Fn=l,Qi=d,Fn!==null&&(Qi?(t=Fn,o=o.stateNode,t.nodeType===8?t.parentNode.removeChild(o):t.removeChild(o)):Fn.removeChild(o.stateNode));break;case 18:Fn!==null&&(Qi?(t=Fn,o=o.stateNode,t.nodeType===8?zu(t.parentNode,o):t.nodeType===1&&zu(t,o),ts(t)):zu(Fn,o.stateNode));break;case 4:l=Fn,d=Qi,Fn=o.stateNode.containerInfo,Qi=!0,hs(t,i,o),Fn=l,Qi=d;break;case 0:case 11:case 14:case 15:if(!Wn&&(l=o.updateQueue,l!==null&&(l=l.lastEffect,l!==null))){d=l=l.next;do{var m=d,w=m.destroy;m=m.tag,w!==void 0&&((m&2)!==0||(m&4)!==0)&&wf(o,i,w),d=d.next}while(d!==l)}hs(t,i,o);break;case 1:if(!Wn&&($o(o,i),l=o.stateNode,typeof l.componentWillUnmount=="function"))try{l.props=o.memoizedProps,l.state=o.memoizedState,l.componentWillUnmount()}catch(k){un(o,i,k)}hs(t,i,o);break;case 21:hs(t,i,o);break;case 22:o.mode&1?(Wn=(l=Wn)||o.memoizedState!==null,hs(t,i,o),Wn=l):hs(t,i,o);break;default:hs(t,i,o)}}function um(t){var i=t.updateQueue;if(i!==null){t.updateQueue=null;var o=t.stateNode;o===null&&(o=t.stateNode=new rv),i.forEach(function(l){var d=pv.bind(null,t,l);o.has(l)||(o.add(l),l.then(d,d))})}}function er(t,i){var o=i.deletions;if(o!==null)for(var l=0;l<o.length;l++){var d=o[l];try{var m=t,w=i,k=w;e:for(;k!==null;){switch(k.tag){case 5:Fn=k.stateNode,Qi=!1;break e;case 3:Fn=k.stateNode.containerInfo,Qi=!0;break e;case 4:Fn=k.stateNode.containerInfo,Qi=!0;break e}k=k.return}if(Fn===null)throw Error(n(160));cm(m,w,d),Fn=null,Qi=!1;var X=d.alternate;X!==null&&(X.return=null),d.return=null}catch(he){un(d,i,he)}}if(i.subtreeFlags&12854)for(i=i.child;i!==null;)fm(i,t),i=i.sibling}function fm(t,i){var o=t.alternate,l=t.flags;switch(t.tag){case 0:case 11:case 14:case 15:if(er(i,t),mr(t),l&4){try{nl(3,t,t.return),uc(3,t)}catch(Je){un(t,t.return,Je)}try{nl(5,t,t.return)}catch(Je){un(t,t.return,Je)}}break;case 1:er(i,t),mr(t),l&512&&o!==null&&$o(o,o.return);break;case 5:if(er(i,t),mr(t),l&512&&o!==null&&$o(o,o.return),t.flags&32){var d=t.stateNode;try{ot(d,"")}catch(Je){un(t,t.return,Je)}}if(l&4&&(d=t.stateNode,d!=null)){var m=t.memoizedProps,w=o!==null?o.memoizedProps:m,k=t.type,X=t.updateQueue;if(t.updateQueue=null,X!==null)try{k==="input"&&m.type==="radio"&&m.name!=null&&_e(d,m),ht(k,w);var he=ht(k,m);for(w=0;w<X.length;w+=2){var we=X[w],Pe=X[w+1];we==="style"?rt(d,Pe):we==="dangerouslySetInnerHTML"?Be(d,Pe):we==="children"?ot(d,Pe):D(d,we,Pe,he)}switch(k){case"input":Ue(d,m);break;case"textarea":ie(d,m);break;case"select":var Ee=d._wrapperState.wasMultiple;d._wrapperState.wasMultiple=!!m.multiple;var je=m.value;je!=null?C(d,!!m.multiple,je,!1):Ee!==!!m.multiple&&(m.defaultValue!=null?C(d,!!m.multiple,m.defaultValue,!0):C(d,!!m.multiple,m.multiple?[]:"",!1))}d[Xa]=m}catch(Je){un(t,t.return,Je)}}break;case 6:if(er(i,t),mr(t),l&4){if(t.stateNode===null)throw Error(n(162));d=t.stateNode,m=t.memoizedProps;try{d.nodeValue=m}catch(Je){un(t,t.return,Je)}}break;case 3:if(er(i,t),mr(t),l&4&&o!==null&&o.memoizedState.isDehydrated)try{ts(i.containerInfo)}catch(Je){un(t,t.return,Je)}break;case 4:er(i,t),mr(t);break;case 13:er(i,t),mr(t),d=t.child,d.flags&8192&&(m=d.memoizedState!==null,d.stateNode.isHidden=m,!m||d.alternate!==null&&d.alternate.memoizedState!==null||(Lf=J())),l&4&&um(t);break;case 22:if(we=o!==null&&o.memoizedState!==null,t.mode&1?(Wn=(he=Wn)||we,er(i,t),Wn=he):er(i,t),mr(t),l&8192){if(he=t.memoizedState!==null,(t.stateNode.isHidden=he)&&!we&&(t.mode&1)!==0)for(Ke=t,we=t.child;we!==null;){for(Pe=Ke=we;Ke!==null;){switch(Ee=Ke,je=Ee.child,Ee.tag){case 0:case 11:case 14:case 15:nl(4,Ee,Ee.return);break;case 1:$o(Ee,Ee.return);var Ze=Ee.stateNode;if(typeof Ze.componentWillUnmount=="function"){l=Ee,o=Ee.return;try{i=l,Ze.props=i.memoizedProps,Ze.state=i.memoizedState,Ze.componentWillUnmount()}catch(Je){un(l,o,Je)}}break;case 5:$o(Ee,Ee.return);break;case 22:if(Ee.memoizedState!==null){pm(Pe);continue}}je!==null?(je.return=Ee,Ke=je):pm(Pe)}we=we.sibling}e:for(we=null,Pe=t;;){if(Pe.tag===5){if(we===null){we=Pe;try{d=Pe.stateNode,he?(m=d.style,typeof m.setProperty=="function"?m.setProperty("display","none","important"):m.display="none"):(k=Pe.stateNode,X=Pe.memoizedProps.style,w=X!=null&&X.hasOwnProperty("display")?X.display:null,k.style.display=it("display",w))}catch(Je){un(t,t.return,Je)}}}else if(Pe.tag===6){if(we===null)try{Pe.stateNode.nodeValue=he?"":Pe.memoizedProps}catch(Je){un(t,t.return,Je)}}else if((Pe.tag!==22&&Pe.tag!==23||Pe.memoizedState===null||Pe===t)&&Pe.child!==null){Pe.child.return=Pe,Pe=Pe.child;continue}if(Pe===t)break e;for(;Pe.sibling===null;){if(Pe.return===null||Pe.return===t)break e;we===Pe&&(we=null),Pe=Pe.return}we===Pe&&(we=null),Pe.sibling.return=Pe.return,Pe=Pe.sibling}}break;case 19:er(i,t),mr(t),l&4&&um(t);break;case 21:break;default:er(i,t),mr(t)}}function mr(t){var i=t.flags;if(i&2){try{e:{for(var o=t.return;o!==null;){if(am(o)){var l=o;break e}o=o.return}throw Error(n(160))}switch(l.tag){case 5:var d=l.stateNode;l.flags&32&&(ot(d,""),l.flags&=-33);var m=lm(t);bf(t,m,d);break;case 3:case 4:var w=l.stateNode.containerInfo,k=lm(t);Af(t,k,w);break;default:throw Error(n(161))}}catch(X){un(t,t.return,X)}t.flags&=-3}i&4096&&(t.flags&=-4097)}function ov(t,i,o){Ke=t,dm(t)}function dm(t,i,o){for(var l=(t.mode&1)!==0;Ke!==null;){var d=Ke,m=d.child;if(d.tag===22&&l){var w=d.memoizedState!==null||cc;if(!w){var k=d.alternate,X=k!==null&&k.memoizedState!==null||Wn;k=cc;var he=Wn;if(cc=w,(Wn=X)&&!he)for(Ke=d;Ke!==null;)w=Ke,X=w.child,w.tag===22&&w.memoizedState!==null?mm(d):X!==null?(X.return=w,Ke=X):mm(d);for(;m!==null;)Ke=m,dm(m),m=m.sibling;Ke=d,cc=k,Wn=he}hm(t)}else(d.subtreeFlags&8772)!==0&&m!==null?(m.return=d,Ke=m):hm(t)}}function hm(t){for(;Ke!==null;){var i=Ke;if((i.flags&8772)!==0){var o=i.alternate;try{if((i.flags&8772)!==0)switch(i.tag){case 0:case 11:case 15:Wn||uc(5,i);break;case 1:var l=i.stateNode;if(i.flags&4&&!Wn)if(o===null)l.componentDidMount();else{var d=i.elementType===i.type?o.memoizedProps:Ji(i.type,o.memoizedProps);l.componentDidUpdate(d,o.memoizedState,l.__reactInternalSnapshotBeforeUpdate)}var m=i.updateQueue;m!==null&&pp(i,m,l);break;case 3:var w=i.updateQueue;if(w!==null){if(o=null,i.child!==null)switch(i.child.tag){case 5:o=i.child.stateNode;break;case 1:o=i.child.stateNode}pp(i,w,o)}break;case 5:var k=i.stateNode;if(o===null&&i.flags&4){o=k;var X=i.memoizedProps;switch(i.type){case"button":case"input":case"select":case"textarea":X.autoFocus&&o.focus();break;case"img":X.src&&(o.src=X.src)}}break;case 6:break;case 4:break;case 12:break;case 13:if(i.memoizedState===null){var he=i.alternate;if(he!==null){var we=he.memoizedState;if(we!==null){var Pe=we.dehydrated;Pe!==null&&ts(Pe)}}}break;case 19:case 17:case 21:case 22:case 23:case 25:break;default:throw Error(n(163))}Wn||i.flags&512&&Rf(i)}catch(Ee){un(i,i.return,Ee)}}if(i===t){Ke=null;break}if(o=i.sibling,o!==null){o.return=i.return,Ke=o;break}Ke=i.return}}function pm(t){for(;Ke!==null;){var i=Ke;if(i===t){Ke=null;break}var o=i.sibling;if(o!==null){o.return=i.return,Ke=o;break}Ke=i.return}}function mm(t){for(;Ke!==null;){var i=Ke;try{switch(i.tag){case 0:case 11:case 15:var o=i.return;try{uc(4,i)}catch(X){un(i,o,X)}break;case 1:var l=i.stateNode;if(typeof l.componentDidMount=="function"){var d=i.return;try{l.componentDidMount()}catch(X){un(i,d,X)}}var m=i.return;try{Rf(i)}catch(X){un(i,m,X)}break;case 5:var w=i.return;try{Rf(i)}catch(X){un(i,w,X)}}}catch(X){un(i,i.return,X)}if(i===t){Ke=null;break}var k=i.sibling;if(k!==null){k.return=i.return,Ke=k;break}Ke=i.return}}var av=Math.ceil,fc=A.ReactCurrentDispatcher,Cf=A.ReactCurrentOwner,Fi=A.ReactCurrentBatchConfig,Ut=0,Cn=null,xn=null,On=0,Si=0,Ko=ls(0),wn=0,il=null,eo=0,dc=0,Pf=0,rl=null,fi=null,Lf=0,Zo=1/0,Or=null,hc=!1,Df=null,ps=null,pc=!1,ms=null,mc=0,sl=0,If=null,gc=-1,vc=0;function Jn(){return(Ut&6)!==0?J():gc!==-1?gc:gc=J()}function gs(t){return(t.mode&1)===0?1:(Ut&2)!==0&&On!==0?On&-On:W0.transition!==null?(vc===0&&(vc=kt()),vc):(t=Rt,t!==0||(t=window.event,t=t===void 0?16:zn(t.type)),t)}function tr(t,i,o,l){if(50<sl)throw sl=0,If=null,Error(n(185));Kt(t,o,l),((Ut&2)===0||t!==Cn)&&(t===Cn&&((Ut&2)===0&&(dc|=o),wn===4&&vs(t,On)),di(t,l),o===1&&Ut===0&&(i.mode&1)===0&&(Zo=J()+500,Xl&&us()))}function di(t,i){var o=t.callbackNode;Un(t,i);var l=Sn(t,t===Cn?On:0);if(l===0)o!==null&&M(o),t.callbackNode=null,t.callbackPriority=0;else if(i=l&-l,t.callbackPriority!==i){if(o!=null&&M(o),i===1)t.tag===0?G0(vm.bind(null,t)):np(vm.bind(null,t)),B0(function(){(Ut&6)===0&&us()}),o=null;else{switch(mi(l)){case 1:o=Ae;break;case 4:o=ze;break;case 16:o=Ge;break;case 536870912:o=at;break;default:o=Ge}o=wm(o,gm.bind(null,t))}t.callbackPriority=i,t.callbackNode=o}}function gm(t,i){if(gc=-1,vc=0,(Ut&6)!==0)throw Error(n(327));var o=t.callbackNode;if(Jo()&&t.callbackNode!==o)return null;var l=Sn(t,t===Cn?On:0);if(l===0)return null;if((l&30)!==0||(l&t.expiredLanes)!==0||i)i=_c(t,l);else{i=l;var d=Ut;Ut|=2;var m=xm();(Cn!==t||On!==i)&&(Or=null,Zo=J()+500,no(t,i));do try{uv();break}catch(k){_m(t,k)}while(!0);Ku(),fc.current=m,Ut=d,xn!==null?i=0:(Cn=null,On=0,i=wn)}if(i!==0){if(i===2&&(d=Ci(t),d!==0&&(l=d,i=Uf(t,d))),i===1)throw o=il,no(t,0),vs(t,l),di(t,J()),o;if(i===6)vs(t,l);else{if(d=t.current.alternate,(l&30)===0&&!lv(d)&&(i=_c(t,l),i===2&&(m=Ci(t),m!==0&&(l=m,i=Uf(t,m))),i===1))throw o=il,no(t,0),vs(t,l),di(t,J()),o;switch(t.finishedWork=d,t.finishedLanes=l,i){case 0:case 1:throw Error(n(345));case 2:io(t,fi,Or);break;case 3:if(vs(t,l),(l&130023424)===l&&(i=Lf+500-J(),10<i)){if(Sn(t,0)!==0)break;if(d=t.suspendedLanes,(d&l)!==l){Jn(),t.pingedLanes|=t.suspendedLanes&d;break}t.timeoutHandle=Bu(io.bind(null,t,fi,Or),i);break}io(t,fi,Or);break;case 4:if(vs(t,l),(l&4194240)===l)break;for(i=t.eventTimes,d=-1;0<l;){var w=31-gt(l);m=1<<w,w=i[w],w>d&&(d=w),l&=~m}if(l=d,l=J()-l,l=(120>l?120:480>l?480:1080>l?1080:1920>l?1920:3e3>l?3e3:4320>l?4320:1960*av(l/1960))-l,10<l){t.timeoutHandle=Bu(io.bind(null,t,fi,Or),l);break}io(t,fi,Or);break;case 5:io(t,fi,Or);break;default:throw Error(n(329))}}}return di(t,J()),t.callbackNode===o?gm.bind(null,t):null}function Uf(t,i){var o=rl;return t.current.memoizedState.isDehydrated&&(no(t,i).flags|=256),t=_c(t,i),t!==2&&(i=fi,fi=o,i!==null&&Nf(i)),t}function Nf(t){fi===null?fi=t:fi.push.apply(fi,t)}function lv(t){for(var i=t;;){if(i.flags&16384){var o=i.updateQueue;if(o!==null&&(o=o.stores,o!==null))for(var l=0;l<o.length;l++){var d=o[l],m=d.getSnapshot;d=d.value;try{if(!Ki(m(),d))return!1}catch{return!1}}}if(o=i.child,i.subtreeFlags&16384&&o!==null)o.return=i,i=o;else{if(i===t)break;for(;i.sibling===null;){if(i.return===null||i.return===t)return!0;i=i.return}i.sibling.return=i.return,i=i.sibling}}return!0}function vs(t,i){for(i&=~Pf,i&=~dc,t.suspendedLanes|=i,t.pingedLanes&=~i,t=t.expirationTimes;0<i;){var o=31-gt(i),l=1<<o;t[o]=-1,i&=~l}}function vm(t){if((Ut&6)!==0)throw Error(n(327));Jo();var i=Sn(t,0);if((i&1)===0)return di(t,J()),null;var o=_c(t,i);if(t.tag!==0&&o===2){var l=Ci(t);l!==0&&(i=l,o=Uf(t,l))}if(o===1)throw o=il,no(t,0),vs(t,i),di(t,J()),o;if(o===6)throw Error(n(345));return t.finishedWork=t.current.alternate,t.finishedLanes=i,io(t,fi,Or),di(t,J()),null}function Ff(t,i){var o=Ut;Ut|=1;try{return t(i)}finally{Ut=o,Ut===0&&(Zo=J()+500,Xl&&us())}}function to(t){ms!==null&&ms.tag===0&&(Ut&6)===0&&Jo();var i=Ut;Ut|=1;var o=Fi.transition,l=Rt;try{if(Fi.transition=null,Rt=1,t)return t()}finally{Rt=l,Fi.transition=o,Ut=i,(Ut&6)===0&&us()}}function Of(){Si=Ko.current,Jt(Ko)}function no(t,i){t.finishedWork=null,t.finishedLanes=0;var o=t.timeoutHandle;if(o!==-1&&(t.timeoutHandle=-1,k0(o)),xn!==null)for(o=xn.return;o!==null;){var l=o;switch(Xu(l),l.tag){case 1:l=l.type.childContextTypes,l!=null&&Gl();break;case 3:Yo(),Jt(li),Jt(Hn),sf();break;case 5:nf(l);break;case 4:Yo();break;case 13:Jt(sn);break;case 19:Jt(sn);break;case 10:Zu(l.type._context);break;case 22:case 23:Of()}o=o.return}if(Cn=t,xn=t=_s(t.current,null),On=Si=i,wn=0,il=null,Pf=dc=eo=0,fi=rl=null,Zs!==null){for(i=0;i<Zs.length;i++)if(o=Zs[i],l=o.interleaved,l!==null){o.interleaved=null;var d=l.next,m=o.pending;if(m!==null){var w=m.next;m.next=d,l.next=w}o.pending=l}Zs=null}return t}function _m(t,i){do{var o=xn;try{if(Ku(),tc.current=sc,nc){for(var l=on.memoizedState;l!==null;){var d=l.queue;d!==null&&(d.pending=null),l=l.next}nc=!1}if(Qs=0,bn=Tn=on=null,Za=!1,Ja=0,Cf.current=null,o===null||o.return===null){wn=1,il=i,xn=null;break}e:{var m=t,w=o.return,k=o,X=i;if(i=On,k.flags|=32768,X!==null&&typeof X=="object"&&typeof X.then=="function"){var he=X,we=k,Pe=we.tag;if((we.mode&1)===0&&(Pe===0||Pe===11||Pe===15)){var Ee=we.alternate;Ee?(we.updateQueue=Ee.updateQueue,we.memoizedState=Ee.memoizedState,we.lanes=Ee.lanes):(we.updateQueue=null,we.memoizedState=null)}var je=Gp(w);if(je!==null){je.flags&=-257,Wp(je,w,k,m,i),je.mode&1&&Vp(m,he,i),i=je,X=he;var Ze=i.updateQueue;if(Ze===null){var Je=new Set;Je.add(X),i.updateQueue=Je}else Ze.add(X);break e}else{if((i&1)===0){Vp(m,he,i),kf();break e}X=Error(n(426))}}else if(tn&&k.mode&1){var vn=Gp(w);if(vn!==null){(vn.flags&65536)===0&&(vn.flags|=256),Wp(vn,w,k,m,i),qu(qo(X,k));break e}}m=X=qo(X,k),wn!==4&&(wn=2),rl===null?rl=[m]:rl.push(m),m=w;do{switch(m.tag){case 3:m.flags|=65536,i&=-i,m.lanes|=i;var ne=zp(m,X,i);hp(m,ne);break e;case 1:k=X;var Y=m.type,le=m.stateNode;if((m.flags&128)===0&&(typeof Y.getDerivedStateFromError=="function"||le!==null&&typeof le.componentDidCatch=="function"&&(ps===null||!ps.has(le)))){m.flags|=65536,i&=-i,m.lanes|=i;var Ie=Hp(m,k,i);hp(m,Ie);break e}}m=m.return}while(m!==null)}Sm(o)}catch(Qe){i=Qe,xn===o&&o!==null&&(xn=o=o.return);continue}break}while(!0)}function xm(){var t=fc.current;return fc.current=sc,t===null?sc:t}function kf(){(wn===0||wn===3||wn===2)&&(wn=4),Cn===null||(eo&268435455)===0&&(dc&268435455)===0||vs(Cn,On)}function _c(t,i){var o=Ut;Ut|=2;var l=xm();(Cn!==t||On!==i)&&(Or=null,no(t,i));do try{cv();break}catch(d){_m(t,d)}while(!0);if(Ku(),Ut=o,fc.current=l,xn!==null)throw Error(n(261));return Cn=null,On=0,wn}function cv(){for(;xn!==null;)ym(xn)}function uv(){for(;xn!==null&&!j();)ym(xn)}function ym(t){var i=Tm(t.alternate,t,Si);t.memoizedProps=t.pendingProps,i===null?Sm(t):xn=i,Cf.current=null}function Sm(t){var i=t;do{var o=i.alternate;if(t=i.return,(i.flags&32768)===0){if(o=nv(o,i,Si),o!==null){xn=o;return}}else{if(o=iv(o,i),o!==null){o.flags&=32767,xn=o;return}if(t!==null)t.flags|=32768,t.subtreeFlags=0,t.deletions=null;else{wn=6,xn=null;return}}if(i=i.sibling,i!==null){xn=i;return}xn=i=t}while(i!==null);wn===0&&(wn=5)}function io(t,i,o){var l=Rt,d=Fi.transition;try{Fi.transition=null,Rt=1,fv(t,i,o,l)}finally{Fi.transition=d,Rt=l}return null}function fv(t,i,o,l){do Jo();while(ms!==null);if((Ut&6)!==0)throw Error(n(327));o=t.finishedWork;var d=t.finishedLanes;if(o===null)return null;if(t.finishedWork=null,t.finishedLanes=0,o===t.current)throw Error(n(177));t.callbackNode=null,t.callbackPriority=0;var m=o.lanes|o.childLanes;if(ln(t,m),t===Cn&&(xn=Cn=null,On=0),(o.subtreeFlags&2064)===0&&(o.flags&2064)===0||pc||(pc=!0,wm(Ge,function(){return Jo(),null})),m=(o.flags&15990)!==0,(o.subtreeFlags&15990)!==0||m){m=Fi.transition,Fi.transition=null;var w=Rt;Rt=1;var k=Ut;Ut|=4,Cf.current=null,sv(t,o),fm(o,t),L0(Ou),ks=!!Fu,Ou=Fu=null,t.current=o,ov(o),Z(),Ut=k,Rt=w,Fi.transition=m}else t.current=o;if(pc&&(pc=!1,ms=t,mc=d),m=t.pendingLanes,m===0&&(ps=null),Mt(o.stateNode),di(t,J()),i!==null)for(l=t.onRecoverableError,o=0;o<i.length;o++)d=i[o],l(d.value,{componentStack:d.stack,digest:d.digest});if(hc)throw hc=!1,t=Df,Df=null,t;return(mc&1)!==0&&t.tag!==0&&Jo(),m=t.pendingLanes,(m&1)!==0?t===If?sl++:(sl=0,If=t):sl=0,us(),null}function Jo(){if(ms!==null){var t=mi(mc),i=Fi.transition,o=Rt;try{if(Fi.transition=null,Rt=16>t?16:t,ms===null)var l=!1;else{if(t=ms,ms=null,mc=0,(Ut&6)!==0)throw Error(n(331));var d=Ut;for(Ut|=4,Ke=t.current;Ke!==null;){var m=Ke,w=m.child;if((Ke.flags&16)!==0){var k=m.deletions;if(k!==null){for(var X=0;X<k.length;X++){var he=k[X];for(Ke=he;Ke!==null;){var we=Ke;switch(we.tag){case 0:case 11:case 15:nl(8,we,m)}var Pe=we.child;if(Pe!==null)Pe.return=we,Ke=Pe;else for(;Ke!==null;){we=Ke;var Ee=we.sibling,je=we.return;if(om(we),we===he){Ke=null;break}if(Ee!==null){Ee.return=je,Ke=Ee;break}Ke=je}}}var Ze=m.alternate;if(Ze!==null){var Je=Ze.child;if(Je!==null){Ze.child=null;do{var vn=Je.sibling;Je.sibling=null,Je=vn}while(Je!==null)}}Ke=m}}if((m.subtreeFlags&2064)!==0&&w!==null)w.return=m,Ke=w;else e:for(;Ke!==null;){if(m=Ke,(m.flags&2048)!==0)switch(m.tag){case 0:case 11:case 15:nl(9,m,m.return)}var ne=m.sibling;if(ne!==null){ne.return=m.return,Ke=ne;break e}Ke=m.return}}var Y=t.current;for(Ke=Y;Ke!==null;){w=Ke;var le=w.child;if((w.subtreeFlags&2064)!==0&&le!==null)le.return=w,Ke=le;else e:for(w=Y;Ke!==null;){if(k=Ke,(k.flags&2048)!==0)try{switch(k.tag){case 0:case 11:case 15:uc(9,k)}}catch(Qe){un(k,k.return,Qe)}if(k===w){Ke=null;break e}var Ie=k.sibling;if(Ie!==null){Ie.return=k.return,Ke=Ie;break e}Ke=k.return}}if(Ut=d,us(),$e&&typeof $e.onPostCommitFiberRoot=="function")try{$e.onPostCommitFiberRoot(lt,t)}catch{}l=!0}return l}finally{Rt=o,Fi.transition=i}}return!1}function Mm(t,i,o){i=qo(o,i),i=zp(t,i,1),t=ds(t,i,1),i=Jn(),t!==null&&(Kt(t,1,i),di(t,i))}function un(t,i,o){if(t.tag===3)Mm(t,t,o);else for(;i!==null;){if(i.tag===3){Mm(i,t,o);break}else if(i.tag===1){var l=i.stateNode;if(typeof i.type.getDerivedStateFromError=="function"||typeof l.componentDidCatch=="function"&&(ps===null||!ps.has(l))){t=qo(o,t),t=Hp(i,t,1),i=ds(i,t,1),t=Jn(),i!==null&&(Kt(i,1,t),di(i,t));break}}i=i.return}}function dv(t,i,o){var l=t.pingCache;l!==null&&l.delete(i),i=Jn(),t.pingedLanes|=t.suspendedLanes&o,Cn===t&&(On&o)===o&&(wn===4||wn===3&&(On&130023424)===On&&500>J()-Lf?no(t,0):Pf|=o),di(t,i)}function Em(t,i){i===0&&((t.mode&1)===0?i=1:(i=Qt,Qt<<=1,(Qt&130023424)===0&&(Qt=4194304)));var o=Jn();t=Ur(t,i),t!==null&&(Kt(t,i,o),di(t,o))}function hv(t){var i=t.memoizedState,o=0;i!==null&&(o=i.retryLane),Em(t,o)}function pv(t,i){var o=0;switch(t.tag){case 13:var l=t.stateNode,d=t.memoizedState;d!==null&&(o=d.retryLane);break;case 19:l=t.stateNode;break;default:throw Error(n(314))}l!==null&&l.delete(i),Em(t,o)}var Tm;Tm=function(t,i,o){if(t!==null)if(t.memoizedProps!==i.pendingProps||li.current)ui=!0;else{if((t.lanes&o)===0&&(i.flags&128)===0)return ui=!1,tv(t,i,o);ui=(t.flags&131072)!==0}else ui=!1,tn&&(i.flags&1048576)!==0&&ip(i,Yl,i.index);switch(i.lanes=0,i.tag){case 2:var l=i.type;lc(t,i),t=i.pendingProps;var d=zo(i,Hn.current);jo(i,o),d=lf(null,i,l,t,d,o);var m=cf();return i.flags|=1,typeof d=="object"&&d!==null&&typeof d.render=="function"&&d.$$typeof===void 0?(i.tag=1,i.memoizedState=null,i.updateQueue=null,ci(l)?(m=!0,Wl(i)):m=!1,i.memoizedState=d.state!==null&&d.state!==void 0?d.state:null,ef(i),d.updater=oc,i.stateNode=d,d._reactInternals=i,mf(i,l,t,o),i=xf(null,i,l,!0,m,o)):(i.tag=0,tn&&m&&Wu(i),Zn(null,i,d,o),i=i.child),i;case 16:l=i.elementType;e:{switch(lc(t,i),t=i.pendingProps,d=l._init,l=d(l._payload),i.type=l,d=i.tag=gv(l),t=Ji(l,t),d){case 0:i=_f(null,i,l,t,o);break e;case 1:i=Kp(null,i,l,t,o);break e;case 11:i=Xp(null,i,l,t,o);break e;case 14:i=jp(null,i,l,Ji(l.type,t),o);break e}throw Error(n(306,l,""))}return i;case 0:return l=i.type,d=i.pendingProps,d=i.elementType===l?d:Ji(l,d),_f(t,i,l,d,o);case 1:return l=i.type,d=i.pendingProps,d=i.elementType===l?d:Ji(l,d),Kp(t,i,l,d,o);case 3:e:{if(Zp(i),t===null)throw Error(n(387));l=i.pendingProps,m=i.memoizedState,d=m.element,dp(t,i),Ql(i,l,null,o);var w=i.memoizedState;if(l=w.element,m.isDehydrated)if(m={element:l,isDehydrated:!1,cache:w.cache,pendingSuspenseBoundaries:w.pendingSuspenseBoundaries,transitions:w.transitions},i.updateQueue.baseState=m,i.memoizedState=m,i.flags&256){d=qo(Error(n(423)),i),i=Jp(t,i,l,o,d);break e}else if(l!==d){d=qo(Error(n(424)),i),i=Jp(t,i,l,o,d);break e}else for(yi=as(i.stateNode.containerInfo.firstChild),xi=i,tn=!0,Zi=null,o=up(i,null,l,o),i.child=o;o;)o.flags=o.flags&-3|4096,o=o.sibling;else{if(Go(),l===d){i=Fr(t,i,o);break e}Zn(t,i,l,o)}i=i.child}return i;case 5:return mp(i),t===null&&Yu(i),l=i.type,d=i.pendingProps,m=t!==null?t.memoizedProps:null,w=d.children,ku(l,d)?w=null:m!==null&&ku(l,m)&&(i.flags|=32),$p(t,i),Zn(t,i,w,o),i.child;case 6:return t===null&&Yu(i),null;case 13:return Qp(t,i,o);case 4:return tf(i,i.stateNode.containerInfo),l=i.pendingProps,t===null?i.child=Wo(i,null,l,o):Zn(t,i,l,o),i.child;case 11:return l=i.type,d=i.pendingProps,d=i.elementType===l?d:Ji(l,d),Xp(t,i,l,d,o);case 7:return Zn(t,i,i.pendingProps,o),i.child;case 8:return Zn(t,i,i.pendingProps.children,o),i.child;case 12:return Zn(t,i,i.pendingProps.children,o),i.child;case 10:e:{if(l=i.type._context,d=i.pendingProps,m=i.memoizedProps,w=d.value,qt(Kl,l._currentValue),l._currentValue=w,m!==null)if(Ki(m.value,w)){if(m.children===d.children&&!li.current){i=Fr(t,i,o);break e}}else for(m=i.child,m!==null&&(m.return=i);m!==null;){var k=m.dependencies;if(k!==null){w=m.child;for(var X=k.firstContext;X!==null;){if(X.context===l){if(m.tag===1){X=Nr(-1,o&-o),X.tag=2;var he=m.updateQueue;if(he!==null){he=he.shared;var we=he.pending;we===null?X.next=X:(X.next=we.next,we.next=X),he.pending=X}}m.lanes|=o,X=m.alternate,X!==null&&(X.lanes|=o),Ju(m.return,o,i),k.lanes|=o;break}X=X.next}}else if(m.tag===10)w=m.type===i.type?null:m.child;else if(m.tag===18){if(w=m.return,w===null)throw Error(n(341));w.lanes|=o,k=w.alternate,k!==null&&(k.lanes|=o),Ju(w,o,i),w=m.sibling}else w=m.child;if(w!==null)w.return=m;else for(w=m;w!==null;){if(w===i){w=null;break}if(m=w.sibling,m!==null){m.return=w.return,w=m;break}w=w.return}m=w}Zn(t,i,d.children,o),i=i.child}return i;case 9:return d=i.type,l=i.pendingProps.children,jo(i,o),d=Ui(d),l=l(d),i.flags|=1,Zn(t,i,l,o),i.child;case 14:return l=i.type,d=Ji(l,i.pendingProps),d=Ji(l.type,d),jp(t,i,l,d,o);case 15:return Yp(t,i,i.type,i.pendingProps,o);case 17:return l=i.type,d=i.pendingProps,d=i.elementType===l?d:Ji(l,d),lc(t,i),i.tag=1,ci(l)?(t=!0,Wl(i)):t=!1,jo(i,o),kp(i,l,d),mf(i,l,d,o),xf(null,i,l,!0,t,o);case 19:return tm(t,i,o);case 22:return qp(t,i,o)}throw Error(n(156,i.tag))};function wm(t,i){return wo(t,i)}function mv(t,i,o,l){this.tag=t,this.key=o,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.ref=null,this.pendingProps=i,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=l,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Oi(t,i,o,l){return new mv(t,i,o,l)}function Bf(t){return t=t.prototype,!(!t||!t.isReactComponent)}function gv(t){if(typeof t=="function")return Bf(t)?1:0;if(t!=null){if(t=t.$$typeof,t===N)return 11;if(t===re)return 14}return 2}function _s(t,i){var o=t.alternate;return o===null?(o=Oi(t.tag,i,t.key,t.mode),o.elementType=t.elementType,o.type=t.type,o.stateNode=t.stateNode,o.alternate=t,t.alternate=o):(o.pendingProps=i,o.type=t.type,o.flags=0,o.subtreeFlags=0,o.deletions=null),o.flags=t.flags&14680064,o.childLanes=t.childLanes,o.lanes=t.lanes,o.child=t.child,o.memoizedProps=t.memoizedProps,o.memoizedState=t.memoizedState,o.updateQueue=t.updateQueue,i=t.dependencies,o.dependencies=i===null?null:{lanes:i.lanes,firstContext:i.firstContext},o.sibling=t.sibling,o.index=t.index,o.ref=t.ref,o}function xc(t,i,o,l,d,m){var w=2;if(l=t,typeof t=="function")Bf(t)&&(w=1);else if(typeof t=="string")w=5;else e:switch(t){case z:return ro(o.children,d,m,i);case $:w=8,d|=8;break;case L:return t=Oi(12,o,i,d|2),t.elementType=L,t.lanes=m,t;case I:return t=Oi(13,o,i,d),t.elementType=I,t.lanes=m,t;case ae:return t=Oi(19,o,i,d),t.elementType=ae,t.lanes=m,t;case fe:return yc(o,d,m,i);default:if(typeof t=="object"&&t!==null)switch(t.$$typeof){case b:w=10;break e;case U:w=9;break e;case N:w=11;break e;case re:w=14;break e;case ce:w=16,l=null;break e}throw Error(n(130,t==null?t:typeof t,""))}return i=Oi(w,o,i,d),i.elementType=t,i.type=l,i.lanes=m,i}function ro(t,i,o,l){return t=Oi(7,t,l,i),t.lanes=o,t}function yc(t,i,o,l){return t=Oi(22,t,l,i),t.elementType=fe,t.lanes=o,t.stateNode={isHidden:!1},t}function zf(t,i,o){return t=Oi(6,t,null,i),t.lanes=o,t}function Hf(t,i,o){return i=Oi(4,t.children!==null?t.children:[],t.key,i),i.lanes=o,i.stateNode={containerInfo:t.containerInfo,pendingChildren:null,implementation:t.implementation},i}function vv(t,i,o,l,d){this.tag=i,this.containerInfo=t,this.finishedWork=this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.pendingContext=this.context=null,this.callbackPriority=0,this.eventTimes=pn(0),this.expirationTimes=pn(-1),this.entangledLanes=this.finishedLanes=this.mutableReadLanes=this.expiredLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=pn(0),this.identifierPrefix=l,this.onRecoverableError=d,this.mutableSourceEagerHydrationData=null}function Vf(t,i,o,l,d,m,w,k,X){return t=new vv(t,i,o,k,X),i===1?(i=1,m===!0&&(i|=8)):i=0,m=Oi(3,null,null,i),t.current=m,m.stateNode=t,m.memoizedState={element:l,isDehydrated:o,cache:null,transitions:null,pendingSuspenseBoundaries:null},ef(m),t}function _v(t,i,o){var l=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:O,key:l==null?null:""+l,children:t,containerInfo:i,implementation:o}}function Rm(t){if(!t)return cs;t=t._reactInternals;e:{if(Ri(t)!==t||t.tag!==1)throw Error(n(170));var i=t;do{switch(i.tag){case 3:i=i.stateNode.context;break e;case 1:if(ci(i.type)){i=i.stateNode.__reactInternalMemoizedMergedChildContext;break e}}i=i.return}while(i!==null);throw Error(n(171))}if(t.tag===1){var o=t.type;if(ci(o))return ep(t,o,i)}return i}function Am(t,i,o,l,d,m,w,k,X){return t=Vf(o,l,!0,t,d,m,w,k,X),t.context=Rm(null),o=t.current,l=Jn(),d=gs(o),m=Nr(l,d),m.callback=i??null,ds(o,m,d),t.current.lanes=d,Kt(t,d,l),di(t,l),t}function Sc(t,i,o,l){var d=i.current,m=Jn(),w=gs(d);return o=Rm(o),i.context===null?i.context=o:i.pendingContext=o,i=Nr(m,w),i.payload={element:t},l=l===void 0?null:l,l!==null&&(i.callback=l),t=ds(d,i,w),t!==null&&(tr(t,d,w,m),Jl(t,d,w)),w}function Mc(t){if(t=t.current,!t.child)return null;switch(t.child.tag){case 5:return t.child.stateNode;default:return t.child.stateNode}}function bm(t,i){if(t=t.memoizedState,t!==null&&t.dehydrated!==null){var o=t.retryLane;t.retryLane=o!==0&&o<i?o:i}}function Gf(t,i){bm(t,i),(t=t.alternate)&&bm(t,i)}function xv(){return null}var Cm=typeof reportError=="function"?reportError:function(t){console.error(t)};function Wf(t){this._internalRoot=t}Ec.prototype.render=Wf.prototype.render=function(t){var i=this._internalRoot;if(i===null)throw Error(n(409));Sc(t,i,null,null)},Ec.prototype.unmount=Wf.prototype.unmount=function(){var t=this._internalRoot;if(t!==null){this._internalRoot=null;var i=t.containerInfo;to(function(){Sc(null,t,null,null)}),i[Pr]=null}};function Ec(t){this._internalRoot=t}Ec.prototype.unstable_scheduleHydration=function(t){if(t){var i=Ao();t={blockedOn:null,target:t,priority:i};for(var o=0;o<qi.length&&i!==0&&i<qi[o].priority;o++);qi.splice(o,0,t),o===0&&Ua(t)}};function Xf(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)}function Tc(t){return!(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11&&(t.nodeType!==8||t.nodeValue!==" react-mount-point-unstable "))}function Pm(){}function yv(t,i,o,l,d){if(d){if(typeof l=="function"){var m=l;l=function(){var he=Mc(w);m.call(he)}}var w=Am(i,l,t,0,null,!1,!1,"",Pm);return t._reactRootContainer=w,t[Pr]=w.current,Ga(t.nodeType===8?t.parentNode:t),to(),w}for(;d=t.lastChild;)t.removeChild(d);if(typeof l=="function"){var k=l;l=function(){var he=Mc(X);k.call(he)}}var X=Vf(t,0,!1,null,null,!1,!1,"",Pm);return t._reactRootContainer=X,t[Pr]=X.current,Ga(t.nodeType===8?t.parentNode:t),to(function(){Sc(i,X,o,l)}),X}function wc(t,i,o,l,d){var m=o._reactRootContainer;if(m){var w=m;if(typeof d=="function"){var k=d;d=function(){var X=Mc(w);k.call(X)}}Sc(i,w,t,d)}else w=yv(o,i,t,d,l);return Mc(w)}Ns=function(t){switch(t.tag){case 3:var i=t.stateNode;if(i.current.memoizedState.isDehydrated){var o=Et(i.pendingLanes);o!==0&&(cn(i,o|1),di(i,J()),(Ut&6)===0&&(Zo=J()+500,us()))}break;case 13:to(function(){var l=Ur(t,1);if(l!==null){var d=Jn();tr(l,t,1,d)}}),Gf(t,1)}},Fs=function(t){if(t.tag===13){var i=Ur(t,134217728);if(i!==null){var o=Jn();tr(i,t,134217728,o)}Gf(t,134217728)}},Ro=function(t){if(t.tag===13){var i=gs(t),o=Ur(t,i);if(o!==null){var l=Jn();tr(o,t,i,l)}Gf(t,i)}},Ao=function(){return Rt},Zr=function(t,i){var o=Rt;try{return Rt=t,i()}finally{Rt=o}},Oe=function(t,i,o){switch(i){case"input":if(Ue(t,o),i=o.name,o.type==="radio"&&i!=null){for(o=t;o.parentNode;)o=o.parentNode;for(o=o.querySelectorAll("input[name="+JSON.stringify(""+i)+'][type="radio"]'),i=0;i<o.length;i++){var l=o[i];if(l!==t&&l.form===t.form){var d=Vl(l);if(!d)throw Error(n(90));tt(l),Ue(l,d)}}}break;case"textarea":ie(t,o);break;case"select":i=o.value,i!=null&&C(t,!!o.multiple,i,!1)}},Vt=Ff,hn=to;var Sv={usingClientEntryPoint:!1,Events:[ja,ko,Vl,Ve,ft,Ff]},ol={findFiberByHostInstance:Ys,bundleType:0,version:"18.3.1",rendererPackageName:"react-dom"},Mv={bundleType:ol.bundleType,version:ol.version,rendererPackageName:ol.rendererPackageName,rendererConfig:ol.rendererConfig,overrideHookState:null,overrideHookStateDeletePath:null,overrideHookStateRenamePath:null,overrideProps:null,overridePropsDeletePath:null,overridePropsRenamePath:null,setErrorHandler:null,setSuspenseHandler:null,scheduleUpdate:null,currentDispatcherRef:A.ReactCurrentDispatcher,findHostInstanceByFiber:function(t){return t=Us(t),t===null?null:t.stateNode},findFiberByHostInstance:ol.findFiberByHostInstance||xv,findHostInstancesForRefresh:null,scheduleRefresh:null,scheduleRoot:null,setRefreshHandler:null,getCurrentFiber:null,reconcilerVersion:"18.3.1-next-f1338f8080-20240426"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"){var Rc=__REACT_DEVTOOLS_GLOBAL_HOOK__;if(!Rc.isDisabled&&Rc.supportsFiber)try{lt=Rc.inject(Mv),$e=Rc}catch{}}return hi.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED=Sv,hi.createPortal=function(t,i){var o=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!Xf(i))throw Error(n(200));return _v(t,i,null,o)},hi.createRoot=function(t,i){if(!Xf(t))throw Error(n(299));var o=!1,l="",d=Cm;return i!=null&&(i.unstable_strictMode===!0&&(o=!0),i.identifierPrefix!==void 0&&(l=i.identifierPrefix),i.onRecoverableError!==void 0&&(d=i.onRecoverableError)),i=Vf(t,1,!1,null,null,o,!1,l,d),t[Pr]=i.current,Ga(t.nodeType===8?t.parentNode:t),new Wf(i)},hi.findDOMNode=function(t){if(t==null)return null;if(t.nodeType===1)return t;var i=t._reactInternals;if(i===void 0)throw typeof t.render=="function"?Error(n(188)):(t=Object.keys(t).join(","),Error(n(268,t)));return t=Us(i),t=t===null?null:t.stateNode,t},hi.flushSync=function(t){return to(t)},hi.hydrate=function(t,i,o){if(!Tc(i))throw Error(n(200));return wc(null,t,i,!0,o)},hi.hydrateRoot=function(t,i,o){if(!Xf(t))throw Error(n(405));var l=o!=null&&o.hydratedSources||null,d=!1,m="",w=Cm;if(o!=null&&(o.unstable_strictMode===!0&&(d=!0),o.identifierPrefix!==void 0&&(m=o.identifierPrefix),o.onRecoverableError!==void 0&&(w=o.onRecoverableError)),i=Am(i,null,t,1,o??null,d,!1,m,w),t[Pr]=i.current,Ga(t),l)for(t=0;t<l.length;t++)o=l[t],d=o._getVersion,d=d(o._source),i.mutableSourceEagerHydrationData==null?i.mutableSourceEagerHydrationData=[o,d]:i.mutableSourceEagerHydrationData.push(o,d);return new Ec(i)},hi.render=function(t,i,o){if(!Tc(i))throw Error(n(200));return wc(null,t,i,!1,o)},hi.unmountComponentAtNode=function(t){if(!Tc(t))throw Error(n(40));return t._reactRootContainer?(to(function(){wc(null,null,t,!1,function(){t._reactRootContainer=null,t[Pr]=null})}),!0):!1},hi.unstable_batchedUpdates=Ff,hi.unstable_renderSubtreeIntoContainer=function(t,i,o,l){if(!Tc(o))throw Error(n(200));if(t==null||t._reactInternals===void 0)throw Error(n(38));return wc(t,i,o,!1,l)},hi.version="18.3.1-next-f1338f8080-20240426",hi}var km;function Xg(){if(km)return qf.exports;km=1;function s(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(s)}catch(e){console.error(e)}}return s(),qf.exports=Cv(),qf.exports}var Bm;function Pv(){if(Bm)return Ac;Bm=1;var s=Xg();return Ac.createRoot=s.createRoot,Ac.hydrateRoot=s.hydrateRoot,Ac}var Lv=Pv(),Dv=Xg();const Th=Wg(Dv);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const wh="172",Iv=0,zm=1,Uv=2,jg=1,Nv=2,Gr=3,Is=0,pi=1,Hi=2,Ps=0,Sa=1,Id=2,Hm=3,Vm=4,Fv=5,mo=100,Ov=101,kv=102,Bv=103,zv=104,Hv=200,Vv=201,Gv=202,Wv=203,Ud=204,Nd=205,Xv=206,jv=207,Yv=208,qv=209,$v=210,Kv=211,Zv=212,Jv=213,Qv=214,Fd=0,Od=1,kd=2,Ta=3,Bd=4,zd=5,Hd=6,Vd=7,Yg=0,e_=1,t_=2,Ls=0,n_=1,i_=2,r_=3,s_=4,o_=5,a_=6,l_=7,qg=300,wa=301,Ra=302,Gd=303,Wd=304,vu=306,Xd=1e3,vo=1001,jd=1002,Ti=1003,c_=1004,bc=1005,Gi=1006,Zf=1007,_o=1008,Yr=1009,$g=1010,Kg=1011,vl=1012,Rh=1013,xo=1014,yr=1015,_l=1016,Ah=1017,bh=1018,Aa=1020,Zg=35902,Jg=1021,Qg=1022,sr=1023,e0=1024,t0=1025,Ma=1026,ba=1027,Ch=1028,Ph=1029,n0=1030,Lh=1031,Dh=1033,nu=33776,iu=33777,ru=33778,su=33779,Yd=35840,qd=35841,$d=35842,Kd=35843,Zd=36196,Jd=37492,Qd=37496,eh=37808,th=37809,nh=37810,ih=37811,rh=37812,sh=37813,oh=37814,ah=37815,lh=37816,ch=37817,uh=37818,fh=37819,dh=37820,hh=37821,ou=36492,ph=36494,mh=36495,i0=36283,gh=36284,vh=36285,_h=36286,u_=3200,f_=3201,d_=0,h_=1,bs="",Bi="srgb",Ca="srgb-linear",cu="linear",zt="srgb",Qo=7680,Gm=519,p_=512,m_=513,g_=514,r0=515,v_=516,__=517,x_=518,y_=519,xh=35044,Wm="300 es",Xr=2e3,uu=2001;class La{addEventListener(e,n){this._listeners===void 0&&(this._listeners={});const r=this._listeners;r[e]===void 0&&(r[e]=[]),r[e].indexOf(n)===-1&&r[e].push(n)}hasEventListener(e,n){if(this._listeners===void 0)return!1;const r=this._listeners;return r[e]!==void 0&&r[e].indexOf(n)!==-1}removeEventListener(e,n){if(this._listeners===void 0)return;const a=this._listeners[e];if(a!==void 0){const c=a.indexOf(n);c!==-1&&a.splice(c,1)}}dispatchEvent(e){if(this._listeners===void 0)return;const r=this._listeners[e.type];if(r!==void 0){e.target=this;const a=r.slice(0);for(let c=0,f=a.length;c<f;c++)a[c].call(this,e);e.target=null}}}const Xn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Jf=Math.PI/180,yh=180/Math.PI;function Ds(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0,r=Math.random()*4294967295|0;return(Xn[s&255]+Xn[s>>8&255]+Xn[s>>16&255]+Xn[s>>24&255]+"-"+Xn[e&255]+Xn[e>>8&255]+"-"+Xn[e>>16&15|64]+Xn[e>>24&255]+"-"+Xn[n&63|128]+Xn[n>>8&255]+"-"+Xn[n>>16&255]+Xn[n>>24&255]+Xn[r&255]+Xn[r>>8&255]+Xn[r>>16&255]+Xn[r>>24&255]).toLowerCase()}function Dt(s,e,n){return Math.max(e,Math.min(n,s))}function S_(s,e){return(s%e+e)%e}function Qf(s,e,n){return(1-n)*s+n*e}function _r(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function Ht(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}class It{constructor(e=0,n=0){It.prototype.isVector2=!0,this.x=e,this.y=n}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,n){return this.x=e,this.y=n,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const n=this.x,r=this.y,a=e.elements;return this.x=a[0]*n+a[3]*r+a[6],this.y=a[1]*n+a[4]*r+a[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,n){return this.x=Dt(this.x,e.x,n.x),this.y=Dt(this.y,e.y,n.y),this}clampScalar(e,n){return this.x=Dt(this.x,e,n),this.y=Dt(this.y,e,n),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Dt(r,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const r=this.dot(e)/n;return Math.acos(Dt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,r=this.y-e.y;return n*n+r*r}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this}rotateAround(e,n){const r=Math.cos(n),a=Math.sin(n),c=this.x-e.x,f=this.y-e.y;return this.x=c*r-f*a+e.x,this.y=c*a+f*r+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class xt{constructor(e,n,r,a,c,f,u,h,p){xt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,n,r,a,c,f,u,h,p)}set(e,n,r,a,c,f,u,h,p){const v=this.elements;return v[0]=e,v[1]=a,v[2]=u,v[3]=n,v[4]=c,v[5]=h,v[6]=r,v[7]=f,v[8]=p,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const n=this.elements,r=e.elements;return n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=r[3],n[4]=r[4],n[5]=r[5],n[6]=r[6],n[7]=r[7],n[8]=r[8],this}extractBasis(e,n,r){return e.setFromMatrix3Column(this,0),n.setFromMatrix3Column(this,1),r.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const n=e.elements;return this.set(n[0],n[4],n[8],n[1],n[5],n[9],n[2],n[6],n[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const r=e.elements,a=n.elements,c=this.elements,f=r[0],u=r[3],h=r[6],p=r[1],v=r[4],x=r[7],y=r[2],S=r[5],T=r[8],E=a[0],_=a[3],g=a[6],F=a[1],D=a[4],A=a[7],G=a[2],O=a[5],z=a[8];return c[0]=f*E+u*F+h*G,c[3]=f*_+u*D+h*O,c[6]=f*g+u*A+h*z,c[1]=p*E+v*F+x*G,c[4]=p*_+v*D+x*O,c[7]=p*g+v*A+x*z,c[2]=y*E+S*F+T*G,c[5]=y*_+S*D+T*O,c[8]=y*g+S*A+T*z,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[3]*=e,n[6]*=e,n[1]*=e,n[4]*=e,n[7]*=e,n[2]*=e,n[5]*=e,n[8]*=e,this}determinant(){const e=this.elements,n=e[0],r=e[1],a=e[2],c=e[3],f=e[4],u=e[5],h=e[6],p=e[7],v=e[8];return n*f*v-n*u*p-r*c*v+r*u*h+a*c*p-a*f*h}invert(){const e=this.elements,n=e[0],r=e[1],a=e[2],c=e[3],f=e[4],u=e[5],h=e[6],p=e[7],v=e[8],x=v*f-u*p,y=u*h-v*c,S=p*c-f*h,T=n*x+r*y+a*S;if(T===0)return this.set(0,0,0,0,0,0,0,0,0);const E=1/T;return e[0]=x*E,e[1]=(a*p-v*r)*E,e[2]=(u*r-a*f)*E,e[3]=y*E,e[4]=(v*n-a*h)*E,e[5]=(a*c-u*n)*E,e[6]=S*E,e[7]=(r*h-p*n)*E,e[8]=(f*n-r*c)*E,this}transpose(){let e;const n=this.elements;return e=n[1],n[1]=n[3],n[3]=e,e=n[2],n[2]=n[6],n[6]=e,e=n[5],n[5]=n[7],n[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const n=this.elements;return e[0]=n[0],e[1]=n[3],e[2]=n[6],e[3]=n[1],e[4]=n[4],e[5]=n[7],e[6]=n[2],e[7]=n[5],e[8]=n[8],this}setUvTransform(e,n,r,a,c,f,u){const h=Math.cos(c),p=Math.sin(c);return this.set(r*h,r*p,-r*(h*f+p*u)+f+e,-a*p,a*h,-a*(-p*f+h*u)+u+n,0,0,1),this}scale(e,n){return this.premultiply(ed.makeScale(e,n)),this}rotate(e){return this.premultiply(ed.makeRotation(-e)),this}translate(e,n){return this.premultiply(ed.makeTranslation(e,n)),this}makeTranslation(e,n){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,n,0,0,1),this}makeRotation(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,-r,0,r,n,0,0,0,1),this}makeScale(e,n){return this.set(e,0,0,0,n,0,0,0,1),this}equals(e){const n=this.elements,r=e.elements;for(let a=0;a<9;a++)if(n[a]!==r[a])return!1;return!0}fromArray(e,n=0){for(let r=0;r<9;r++)this.elements[r]=e[r+n];return this}toArray(e=[],n=0){const r=this.elements;return e[n]=r[0],e[n+1]=r[1],e[n+2]=r[2],e[n+3]=r[3],e[n+4]=r[4],e[n+5]=r[5],e[n+6]=r[6],e[n+7]=r[7],e[n+8]=r[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const ed=new xt;function s0(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function fu(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function M_(){const s=fu("canvas");return s.style.display="block",s}const Xm={};function va(s){s in Xm||(Xm[s]=!0,console.warn(s))}function E_(s,e,n){return new Promise(function(r,a){function c(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:a();break;case s.TIMEOUT_EXPIRED:setTimeout(c,n);break;default:r()}}setTimeout(c,n)})}function T_(s){const e=s.elements;e[2]=.5*e[2]+.5*e[3],e[6]=.5*e[6]+.5*e[7],e[10]=.5*e[10]+.5*e[11],e[14]=.5*e[14]+.5*e[15]}function w_(s){const e=s.elements;e[11]===-1?(e[10]=-e[10]-1,e[14]=-e[14]):(e[10]=-e[10],e[14]=-e[14]+1)}const jm=new xt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ym=new xt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function R_(){const s={enabled:!0,workingColorSpace:Ca,spaces:{},convert:function(a,c,f){return this.enabled===!1||c===f||!c||!f||(this.spaces[c].transfer===zt&&(a.r=jr(a.r),a.g=jr(a.g),a.b=jr(a.b)),this.spaces[c].primaries!==this.spaces[f].primaries&&(a.applyMatrix3(this.spaces[c].toXYZ),a.applyMatrix3(this.spaces[f].fromXYZ)),this.spaces[f].transfer===zt&&(a.r=Ea(a.r),a.g=Ea(a.g),a.b=Ea(a.b))),a},fromWorkingColorSpace:function(a,c){return this.convert(a,this.workingColorSpace,c)},toWorkingColorSpace:function(a,c){return this.convert(a,c,this.workingColorSpace)},getPrimaries:function(a){return this.spaces[a].primaries},getTransfer:function(a){return a===bs?cu:this.spaces[a].transfer},getLuminanceCoefficients:function(a,c=this.workingColorSpace){return a.fromArray(this.spaces[c].luminanceCoefficients)},define:function(a){Object.assign(this.spaces,a)},_getMatrix:function(a,c,f){return a.copy(this.spaces[c].toXYZ).multiply(this.spaces[f].fromXYZ)},_getDrawingBufferColorSpace:function(a){return this.spaces[a].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(a=this.workingColorSpace){return this.spaces[a].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],n=[.2126,.7152,.0722],r=[.3127,.329];return s.define({[Ca]:{primaries:e,whitePoint:r,transfer:cu,toXYZ:jm,fromXYZ:Ym,luminanceCoefficients:n,workingColorSpaceConfig:{unpackColorSpace:Bi},outputColorSpaceConfig:{drawingBufferColorSpace:Bi}},[Bi]:{primaries:e,whitePoint:r,transfer:zt,toXYZ:jm,fromXYZ:Ym,luminanceCoefficients:n,outputColorSpaceConfig:{drawingBufferColorSpace:Bi}}}),s}const Ft=R_();function jr(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Ea(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let ea;class A_{static getDataURL(e){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ea===void 0&&(ea=fu("canvas")),ea.width=e.width,ea.height=e.height;const r=ea.getContext("2d");e instanceof ImageData?r.putImageData(e,0,0):r.drawImage(e,0,0,e.width,e.height),n=ea}return n.width>2048||n.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",e),n.toDataURL("image/jpeg",.6)):n.toDataURL("image/png")}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const n=fu("canvas");n.width=e.width,n.height=e.height;const r=n.getContext("2d");r.drawImage(e,0,0,e.width,e.height);const a=r.getImageData(0,0,e.width,e.height),c=a.data;for(let f=0;f<c.length;f++)c[f]=jr(c[f]/255)*255;return r.putImageData(a,0,0),n}else if(e.data){const n=e.data.slice(0);for(let r=0;r<n.length;r++)n instanceof Uint8Array||n instanceof Uint8ClampedArray?n[r]=Math.floor(jr(n[r]/255)*255):n[r]=jr(n[r]);return{data:n,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let b_=0;class o0{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:b_++}),this.uuid=Ds(),this.data=e,this.dataReady=!0,this.version=0}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const r={uuid:this.uuid,url:""},a=this.data;if(a!==null){let c;if(Array.isArray(a)){c=[];for(let f=0,u=a.length;f<u;f++)a[f].isDataTexture?c.push(td(a[f].image)):c.push(td(a[f]))}else c=td(a);r.url=c}return n||(e.images[this.uuid]=r),r}}function td(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?A_.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let C_=0;class Yn extends La{constructor(e=Yn.DEFAULT_IMAGE,n=Yn.DEFAULT_MAPPING,r=vo,a=vo,c=Gi,f=_o,u=sr,h=Yr,p=Yn.DEFAULT_ANISOTROPY,v=bs){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:C_++}),this.uuid=Ds(),this.name="",this.source=new o0(e),this.mipmaps=[],this.mapping=n,this.channel=0,this.wrapS=r,this.wrapT=a,this.magFilter=c,this.minFilter=f,this.anisotropy=p,this.format=u,this.internalFormat=null,this.type=h,this.offset=new It(0,0),this.repeat=new It(1,1),this.center=new It(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new xt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=v,this.userData={},this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}toJSON(e){const n=e===void 0||typeof e=="string";if(!n&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const r={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(r.userData=this.userData),n||(e.textures[this.uuid]=r),r}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==qg)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Xd:e.x=e.x-Math.floor(e.x);break;case vo:e.x=e.x<0?0:1;break;case jd:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Xd:e.y=e.y-Math.floor(e.y);break;case vo:e.y=e.y<0?0:1;break;case jd:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Yn.DEFAULT_IMAGE=null;Yn.DEFAULT_MAPPING=qg;Yn.DEFAULT_ANISOTROPY=1;class _n{constructor(e=0,n=0,r=0,a=1){_n.prototype.isVector4=!0,this.x=e,this.y=n,this.z=r,this.w=a}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,n,r,a){return this.x=e,this.y=n,this.z=r,this.w=a,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;case 3:this.w=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this.w=e.w+n.w,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this.w+=e.w*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this.w=e.w-n.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const n=this.x,r=this.y,a=this.z,c=this.w,f=e.elements;return this.x=f[0]*n+f[4]*r+f[8]*a+f[12]*c,this.y=f[1]*n+f[5]*r+f[9]*a+f[13]*c,this.z=f[2]*n+f[6]*r+f[10]*a+f[14]*c,this.w=f[3]*n+f[7]*r+f[11]*a+f[15]*c,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const n=Math.sqrt(1-e.w*e.w);return n<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/n,this.y=e.y/n,this.z=e.z/n),this}setAxisAngleFromRotationMatrix(e){let n,r,a,c;const h=e.elements,p=h[0],v=h[4],x=h[8],y=h[1],S=h[5],T=h[9],E=h[2],_=h[6],g=h[10];if(Math.abs(v-y)<.01&&Math.abs(x-E)<.01&&Math.abs(T-_)<.01){if(Math.abs(v+y)<.1&&Math.abs(x+E)<.1&&Math.abs(T+_)<.1&&Math.abs(p+S+g-3)<.1)return this.set(1,0,0,0),this;n=Math.PI;const D=(p+1)/2,A=(S+1)/2,G=(g+1)/2,O=(v+y)/4,z=(x+E)/4,$=(T+_)/4;return D>A&&D>G?D<.01?(r=0,a=.707106781,c=.707106781):(r=Math.sqrt(D),a=O/r,c=z/r):A>G?A<.01?(r=.707106781,a=0,c=.707106781):(a=Math.sqrt(A),r=O/a,c=$/a):G<.01?(r=.707106781,a=.707106781,c=0):(c=Math.sqrt(G),r=z/c,a=$/c),this.set(r,a,c,n),this}let F=Math.sqrt((_-T)*(_-T)+(x-E)*(x-E)+(y-v)*(y-v));return Math.abs(F)<.001&&(F=1),this.x=(_-T)/F,this.y=(x-E)/F,this.z=(y-v)/F,this.w=Math.acos((p+S+g-1)/2),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this.w=n[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,n){return this.x=Dt(this.x,e.x,n.x),this.y=Dt(this.y,e.y,n.y),this.z=Dt(this.z,e.z,n.z),this.w=Dt(this.w,e.w,n.w),this}clampScalar(e,n){return this.x=Dt(this.x,e,n),this.y=Dt(this.y,e,n),this.z=Dt(this.z,e,n),this.w=Dt(this.w,e,n),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Dt(r,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this.w+=(e.w-this.w)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this.z=e.z+(n.z-e.z)*r,this.w=e.w+(n.w-e.w)*r,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this.w=e[n+3],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e[n+3]=this.w,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this.w=e.getW(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class P_ extends La{constructor(e=1,n=1,r={}){super(),this.isRenderTarget=!0,this.width=e,this.height=n,this.depth=1,this.scissor=new _n(0,0,e,n),this.scissorTest=!1,this.viewport=new _n(0,0,e,n);const a={width:e,height:n,depth:1};r=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Gi,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},r);const c=new Yn(a,r.mapping,r.wrapS,r.wrapT,r.magFilter,r.minFilter,r.format,r.type,r.anisotropy,r.colorSpace);c.flipY=!1,c.generateMipmaps=r.generateMipmaps,c.internalFormat=r.internalFormat,this.textures=[];const f=r.count;for(let u=0;u<f;u++)this.textures[u]=c.clone(),this.textures[u].isRenderTargetTexture=!0,this.textures[u].renderTarget=this;this.depthBuffer=r.depthBuffer,this.stencilBuffer=r.stencilBuffer,this.resolveDepthBuffer=r.resolveDepthBuffer,this.resolveStencilBuffer=r.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=r.depthTexture,this.samples=r.samples}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,n,r=1){if(this.width!==e||this.height!==n||this.depth!==r){this.width=e,this.height=n,this.depth=r;for(let a=0,c=this.textures.length;a<c;a++)this.textures[a].image.width=e,this.textures[a].image.height=n,this.textures[a].image.depth=r;this.dispose()}this.viewport.set(0,0,e,n),this.scissor.set(0,0,e,n)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let r=0,a=e.textures.length;r<a;r++)this.textures[r]=e.textures[r].clone(),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;const n=Object.assign({},e.texture.image);return this.texture.source=new o0(n),this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class yo extends P_{constructor(e=1,n=1,r={}){super(e,n,r),this.isWebGLRenderTarget=!0}}class a0 extends Yn{constructor(e=null,n=1,r=1,a=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:n,height:r,depth:a},this.magFilter=Ti,this.minFilter=Ti,this.wrapR=vo,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class L_ extends Yn{constructor(e=null,n=1,r=1,a=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:n,height:r,depth:a},this.magFilter=Ti,this.minFilter=Ti,this.wrapR=vo,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class xl{constructor(e=0,n=0,r=0,a=1){this.isQuaternion=!0,this._x=e,this._y=n,this._z=r,this._w=a}static slerpFlat(e,n,r,a,c,f,u){let h=r[a+0],p=r[a+1],v=r[a+2],x=r[a+3];const y=c[f+0],S=c[f+1],T=c[f+2],E=c[f+3];if(u===0){e[n+0]=h,e[n+1]=p,e[n+2]=v,e[n+3]=x;return}if(u===1){e[n+0]=y,e[n+1]=S,e[n+2]=T,e[n+3]=E;return}if(x!==E||h!==y||p!==S||v!==T){let _=1-u;const g=h*y+p*S+v*T+x*E,F=g>=0?1:-1,D=1-g*g;if(D>Number.EPSILON){const G=Math.sqrt(D),O=Math.atan2(G,g*F);_=Math.sin(_*O)/G,u=Math.sin(u*O)/G}const A=u*F;if(h=h*_+y*A,p=p*_+S*A,v=v*_+T*A,x=x*_+E*A,_===1-u){const G=1/Math.sqrt(h*h+p*p+v*v+x*x);h*=G,p*=G,v*=G,x*=G}}e[n]=h,e[n+1]=p,e[n+2]=v,e[n+3]=x}static multiplyQuaternionsFlat(e,n,r,a,c,f){const u=r[a],h=r[a+1],p=r[a+2],v=r[a+3],x=c[f],y=c[f+1],S=c[f+2],T=c[f+3];return e[n]=u*T+v*x+h*S-p*y,e[n+1]=h*T+v*y+p*x-u*S,e[n+2]=p*T+v*S+u*y-h*x,e[n+3]=v*T-u*x-h*y-p*S,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,n,r,a){return this._x=e,this._y=n,this._z=r,this._w=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,n=!0){const r=e._x,a=e._y,c=e._z,f=e._order,u=Math.cos,h=Math.sin,p=u(r/2),v=u(a/2),x=u(c/2),y=h(r/2),S=h(a/2),T=h(c/2);switch(f){case"XYZ":this._x=y*v*x+p*S*T,this._y=p*S*x-y*v*T,this._z=p*v*T+y*S*x,this._w=p*v*x-y*S*T;break;case"YXZ":this._x=y*v*x+p*S*T,this._y=p*S*x-y*v*T,this._z=p*v*T-y*S*x,this._w=p*v*x+y*S*T;break;case"ZXY":this._x=y*v*x-p*S*T,this._y=p*S*x+y*v*T,this._z=p*v*T+y*S*x,this._w=p*v*x-y*S*T;break;case"ZYX":this._x=y*v*x-p*S*T,this._y=p*S*x+y*v*T,this._z=p*v*T-y*S*x,this._w=p*v*x+y*S*T;break;case"YZX":this._x=y*v*x+p*S*T,this._y=p*S*x+y*v*T,this._z=p*v*T-y*S*x,this._w=p*v*x-y*S*T;break;case"XZY":this._x=y*v*x-p*S*T,this._y=p*S*x-y*v*T,this._z=p*v*T+y*S*x,this._w=p*v*x+y*S*T;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+f)}return n===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,n){const r=n/2,a=Math.sin(r);return this._x=e.x*a,this._y=e.y*a,this._z=e.z*a,this._w=Math.cos(r),this._onChangeCallback(),this}setFromRotationMatrix(e){const n=e.elements,r=n[0],a=n[4],c=n[8],f=n[1],u=n[5],h=n[9],p=n[2],v=n[6],x=n[10],y=r+u+x;if(y>0){const S=.5/Math.sqrt(y+1);this._w=.25/S,this._x=(v-h)*S,this._y=(c-p)*S,this._z=(f-a)*S}else if(r>u&&r>x){const S=2*Math.sqrt(1+r-u-x);this._w=(v-h)/S,this._x=.25*S,this._y=(a+f)/S,this._z=(c+p)/S}else if(u>x){const S=2*Math.sqrt(1+u-r-x);this._w=(c-p)/S,this._x=(a+f)/S,this._y=.25*S,this._z=(h+v)/S}else{const S=2*Math.sqrt(1+x-r-u);this._w=(f-a)/S,this._x=(c+p)/S,this._y=(h+v)/S,this._z=.25*S}return this._onChangeCallback(),this}setFromUnitVectors(e,n){let r=e.dot(n)+1;return r<Number.EPSILON?(r=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=r):(this._x=0,this._y=-e.z,this._z=e.y,this._w=r)):(this._x=e.y*n.z-e.z*n.y,this._y=e.z*n.x-e.x*n.z,this._z=e.x*n.y-e.y*n.x,this._w=r),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Dt(this.dot(e),-1,1)))}rotateTowards(e,n){const r=this.angleTo(e);if(r===0)return this;const a=Math.min(1,n/r);return this.slerp(e,a),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,n){const r=e._x,a=e._y,c=e._z,f=e._w,u=n._x,h=n._y,p=n._z,v=n._w;return this._x=r*v+f*u+a*p-c*h,this._y=a*v+f*h+c*u-r*p,this._z=c*v+f*p+r*h-a*u,this._w=f*v-r*u-a*h-c*p,this._onChangeCallback(),this}slerp(e,n){if(n===0)return this;if(n===1)return this.copy(e);const r=this._x,a=this._y,c=this._z,f=this._w;let u=f*e._w+r*e._x+a*e._y+c*e._z;if(u<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,u=-u):this.copy(e),u>=1)return this._w=f,this._x=r,this._y=a,this._z=c,this;const h=1-u*u;if(h<=Number.EPSILON){const S=1-n;return this._w=S*f+n*this._w,this._x=S*r+n*this._x,this._y=S*a+n*this._y,this._z=S*c+n*this._z,this.normalize(),this}const p=Math.sqrt(h),v=Math.atan2(p,u),x=Math.sin((1-n)*v)/p,y=Math.sin(n*v)/p;return this._w=f*x+this._w*y,this._x=r*x+this._x*y,this._y=a*x+this._y*y,this._z=c*x+this._z*y,this._onChangeCallback(),this}slerpQuaternions(e,n,r){return this.copy(e).slerp(n,r)}random(){const e=2*Math.PI*Math.random(),n=2*Math.PI*Math.random(),r=Math.random(),a=Math.sqrt(1-r),c=Math.sqrt(r);return this.set(a*Math.sin(e),a*Math.cos(e),c*Math.sin(n),c*Math.cos(n))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,n=0){return this._x=e[n],this._y=e[n+1],this._z=e[n+2],this._w=e[n+3],this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._w,e}fromBufferAttribute(e,n){return this._x=e.getX(n),this._y=e.getY(n),this._z=e.getZ(n),this._w=e.getW(n),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class ee{constructor(e=0,n=0,r=0){ee.prototype.isVector3=!0,this.x=e,this.y=n,this.z=r}set(e,n,r){return r===void 0&&(r=this.z),this.x=e,this.y=n,this.z=r,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,n){switch(e){case 0:this.x=n;break;case 1:this.y=n;break;case 2:this.z=n;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,n){return this.x=e.x+n.x,this.y=e.y+n.y,this.z=e.z+n.z,this}addScaledVector(e,n){return this.x+=e.x*n,this.y+=e.y*n,this.z+=e.z*n,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,n){return this.x=e.x-n.x,this.y=e.y-n.y,this.z=e.z-n.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,n){return this.x=e.x*n.x,this.y=e.y*n.y,this.z=e.z*n.z,this}applyEuler(e){return this.applyQuaternion(qm.setFromEuler(e))}applyAxisAngle(e,n){return this.applyQuaternion(qm.setFromAxisAngle(e,n))}applyMatrix3(e){const n=this.x,r=this.y,a=this.z,c=e.elements;return this.x=c[0]*n+c[3]*r+c[6]*a,this.y=c[1]*n+c[4]*r+c[7]*a,this.z=c[2]*n+c[5]*r+c[8]*a,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const n=this.x,r=this.y,a=this.z,c=e.elements,f=1/(c[3]*n+c[7]*r+c[11]*a+c[15]);return this.x=(c[0]*n+c[4]*r+c[8]*a+c[12])*f,this.y=(c[1]*n+c[5]*r+c[9]*a+c[13])*f,this.z=(c[2]*n+c[6]*r+c[10]*a+c[14])*f,this}applyQuaternion(e){const n=this.x,r=this.y,a=this.z,c=e.x,f=e.y,u=e.z,h=e.w,p=2*(f*a-u*r),v=2*(u*n-c*a),x=2*(c*r-f*n);return this.x=n+h*p+f*x-u*v,this.y=r+h*v+u*p-c*x,this.z=a+h*x+c*v-f*p,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const n=this.x,r=this.y,a=this.z,c=e.elements;return this.x=c[0]*n+c[4]*r+c[8]*a,this.y=c[1]*n+c[5]*r+c[9]*a,this.z=c[2]*n+c[6]*r+c[10]*a,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,n){return this.x=Dt(this.x,e.x,n.x),this.y=Dt(this.y,e.y,n.y),this.z=Dt(this.z,e.z,n.z),this}clampScalar(e,n){return this.x=Dt(this.x,e,n),this.y=Dt(this.y,e,n),this.z=Dt(this.z,e,n),this}clampLength(e,n){const r=this.length();return this.divideScalar(r||1).multiplyScalar(Dt(r,e,n))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,n){return this.x+=(e.x-this.x)*n,this.y+=(e.y-this.y)*n,this.z+=(e.z-this.z)*n,this}lerpVectors(e,n,r){return this.x=e.x+(n.x-e.x)*r,this.y=e.y+(n.y-e.y)*r,this.z=e.z+(n.z-e.z)*r,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,n){const r=e.x,a=e.y,c=e.z,f=n.x,u=n.y,h=n.z;return this.x=a*h-c*u,this.y=c*f-r*h,this.z=r*u-a*f,this}projectOnVector(e){const n=e.lengthSq();if(n===0)return this.set(0,0,0);const r=e.dot(this)/n;return this.copy(e).multiplyScalar(r)}projectOnPlane(e){return nd.copy(this).projectOnVector(e),this.sub(nd)}reflect(e){return this.sub(nd.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const n=Math.sqrt(this.lengthSq()*e.lengthSq());if(n===0)return Math.PI/2;const r=this.dot(e)/n;return Math.acos(Dt(r,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const n=this.x-e.x,r=this.y-e.y,a=this.z-e.z;return n*n+r*r+a*a}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,n,r){const a=Math.sin(n)*e;return this.x=a*Math.sin(r),this.y=Math.cos(n)*e,this.z=a*Math.cos(r),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,n,r){return this.x=e*Math.sin(n),this.y=r,this.z=e*Math.cos(n),this}setFromMatrixPosition(e){const n=e.elements;return this.x=n[12],this.y=n[13],this.z=n[14],this}setFromMatrixScale(e){const n=this.setFromMatrixColumn(e,0).length(),r=this.setFromMatrixColumn(e,1).length(),a=this.setFromMatrixColumn(e,2).length();return this.x=n,this.y=r,this.z=a,this}setFromMatrixColumn(e,n){return this.fromArray(e.elements,n*4)}setFromMatrix3Column(e,n){return this.fromArray(e.elements,n*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,n=0){return this.x=e[n],this.y=e[n+1],this.z=e[n+2],this}toArray(e=[],n=0){return e[n]=this.x,e[n+1]=this.y,e[n+2]=this.z,e}fromBufferAttribute(e,n){return this.x=e.getX(n),this.y=e.getY(n),this.z=e.getZ(n),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,n=Math.random()*2-1,r=Math.sqrt(1-n*n);return this.x=r*Math.cos(e),this.y=n,this.z=r*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const nd=new ee,qm=new xl;class yl{constructor(e=new ee(1/0,1/0,1/0),n=new ee(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=n}set(e,n){return this.min.copy(e),this.max.copy(n),this}setFromArray(e){this.makeEmpty();for(let n=0,r=e.length;n<r;n+=3)this.expandByPoint(nr.fromArray(e,n));return this}setFromBufferAttribute(e){this.makeEmpty();for(let n=0,r=e.count;n<r;n++)this.expandByPoint(nr.fromBufferAttribute(e,n));return this}setFromPoints(e){this.makeEmpty();for(let n=0,r=e.length;n<r;n++)this.expandByPoint(e[n]);return this}setFromCenterAndSize(e,n){const r=nr.copy(n).multiplyScalar(.5);return this.min.copy(e).sub(r),this.max.copy(e).add(r),this}setFromObject(e,n=!1){return this.makeEmpty(),this.expandByObject(e,n)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,n=!1){e.updateWorldMatrix(!1,!1);const r=e.geometry;if(r!==void 0){const c=r.getAttribute("position");if(n===!0&&c!==void 0&&e.isInstancedMesh!==!0)for(let f=0,u=c.count;f<u;f++)e.isMesh===!0?e.getVertexPosition(f,nr):nr.fromBufferAttribute(c,f),nr.applyMatrix4(e.matrixWorld),this.expandByPoint(nr);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Cc.copy(e.boundingBox)):(r.boundingBox===null&&r.computeBoundingBox(),Cc.copy(r.boundingBox)),Cc.applyMatrix4(e.matrixWorld),this.union(Cc)}const a=e.children;for(let c=0,f=a.length;c<f;c++)this.expandByObject(a[c],n);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,n){return n.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,nr),nr.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let n,r;return e.normal.x>0?(n=e.normal.x*this.min.x,r=e.normal.x*this.max.x):(n=e.normal.x*this.max.x,r=e.normal.x*this.min.x),e.normal.y>0?(n+=e.normal.y*this.min.y,r+=e.normal.y*this.max.y):(n+=e.normal.y*this.max.y,r+=e.normal.y*this.min.y),e.normal.z>0?(n+=e.normal.z*this.min.z,r+=e.normal.z*this.max.z):(n+=e.normal.z*this.max.z,r+=e.normal.z*this.min.z),n<=-e.constant&&r>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ll),Pc.subVectors(this.max,ll),ta.subVectors(e.a,ll),na.subVectors(e.b,ll),ia.subVectors(e.c,ll),ys.subVectors(na,ta),Ss.subVectors(ia,na),so.subVectors(ta,ia);let n=[0,-ys.z,ys.y,0,-Ss.z,Ss.y,0,-so.z,so.y,ys.z,0,-ys.x,Ss.z,0,-Ss.x,so.z,0,-so.x,-ys.y,ys.x,0,-Ss.y,Ss.x,0,-so.y,so.x,0];return!id(n,ta,na,ia,Pc)||(n=[1,0,0,0,1,0,0,0,1],!id(n,ta,na,ia,Pc))?!1:(Lc.crossVectors(ys,Ss),n=[Lc.x,Lc.y,Lc.z],id(n,ta,na,ia,Pc))}clampPoint(e,n){return n.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,nr).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(nr).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(kr[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),kr[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),kr[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),kr[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),kr[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),kr[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),kr[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),kr[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(kr),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}}const kr=[new ee,new ee,new ee,new ee,new ee,new ee,new ee,new ee],nr=new ee,Cc=new yl,ta=new ee,na=new ee,ia=new ee,ys=new ee,Ss=new ee,so=new ee,ll=new ee,Pc=new ee,Lc=new ee,oo=new ee;function id(s,e,n,r,a){for(let c=0,f=s.length-3;c<=f;c+=3){oo.fromArray(s,c);const u=a.x*Math.abs(oo.x)+a.y*Math.abs(oo.y)+a.z*Math.abs(oo.z),h=e.dot(oo),p=n.dot(oo),v=r.dot(oo);if(Math.max(-Math.max(h,p,v),Math.min(h,p,v))>u)return!1}return!0}const D_=new yl,cl=new ee,rd=new ee;class _u{constructor(e=new ee,n=-1){this.isSphere=!0,this.center=e,this.radius=n}set(e,n){return this.center.copy(e),this.radius=n,this}setFromPoints(e,n){const r=this.center;n!==void 0?r.copy(n):D_.setFromPoints(e).getCenter(r);let a=0;for(let c=0,f=e.length;c<f;c++)a=Math.max(a,r.distanceToSquared(e[c]));return this.radius=Math.sqrt(a),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const n=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=n*n}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,n){const r=this.center.distanceToSquared(e);return n.copy(e),r>this.radius*this.radius&&(n.sub(this.center).normalize(),n.multiplyScalar(this.radius).add(this.center)),n}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;cl.subVectors(e,this.center);const n=cl.lengthSq();if(n>this.radius*this.radius){const r=Math.sqrt(n),a=(r-this.radius)*.5;this.center.addScaledVector(cl,a/r),this.radius+=a}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(rd.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(cl.copy(e.center).add(rd)),this.expandByPoint(cl.copy(e.center).sub(rd))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Br=new ee,sd=new ee,Dc=new ee,Ms=new ee,od=new ee,Ic=new ee,ad=new ee;class l0{constructor(e=new ee,n=new ee(0,0,-1)){this.origin=e,this.direction=n}set(e,n){return this.origin.copy(e),this.direction.copy(n),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,n){return n.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Br)),this}closestPointToPoint(e,n){n.subVectors(e,this.origin);const r=n.dot(this.direction);return r<0?n.copy(this.origin):n.copy(this.origin).addScaledVector(this.direction,r)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const n=Br.subVectors(e,this.origin).dot(this.direction);return n<0?this.origin.distanceToSquared(e):(Br.copy(this.origin).addScaledVector(this.direction,n),Br.distanceToSquared(e))}distanceSqToSegment(e,n,r,a){sd.copy(e).add(n).multiplyScalar(.5),Dc.copy(n).sub(e).normalize(),Ms.copy(this.origin).sub(sd);const c=e.distanceTo(n)*.5,f=-this.direction.dot(Dc),u=Ms.dot(this.direction),h=-Ms.dot(Dc),p=Ms.lengthSq(),v=Math.abs(1-f*f);let x,y,S,T;if(v>0)if(x=f*h-u,y=f*u-h,T=c*v,x>=0)if(y>=-T)if(y<=T){const E=1/v;x*=E,y*=E,S=x*(x+f*y+2*u)+y*(f*x+y+2*h)+p}else y=c,x=Math.max(0,-(f*y+u)),S=-x*x+y*(y+2*h)+p;else y=-c,x=Math.max(0,-(f*y+u)),S=-x*x+y*(y+2*h)+p;else y<=-T?(x=Math.max(0,-(-f*c+u)),y=x>0?-c:Math.min(Math.max(-c,-h),c),S=-x*x+y*(y+2*h)+p):y<=T?(x=0,y=Math.min(Math.max(-c,-h),c),S=y*(y+2*h)+p):(x=Math.max(0,-(f*c+u)),y=x>0?c:Math.min(Math.max(-c,-h),c),S=-x*x+y*(y+2*h)+p);else y=f>0?-c:c,x=Math.max(0,-(f*y+u)),S=-x*x+y*(y+2*h)+p;return r&&r.copy(this.origin).addScaledVector(this.direction,x),a&&a.copy(sd).addScaledVector(Dc,y),S}intersectSphere(e,n){Br.subVectors(e.center,this.origin);const r=Br.dot(this.direction),a=Br.dot(Br)-r*r,c=e.radius*e.radius;if(a>c)return null;const f=Math.sqrt(c-a),u=r-f,h=r+f;return h<0?null:u<0?this.at(h,n):this.at(u,n)}intersectsSphere(e){return this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const n=e.normal.dot(this.direction);if(n===0)return e.distanceToPoint(this.origin)===0?0:null;const r=-(this.origin.dot(e.normal)+e.constant)/n;return r>=0?r:null}intersectPlane(e,n){const r=this.distanceToPlane(e);return r===null?null:this.at(r,n)}intersectsPlane(e){const n=e.distanceToPoint(this.origin);return n===0||e.normal.dot(this.direction)*n<0}intersectBox(e,n){let r,a,c,f,u,h;const p=1/this.direction.x,v=1/this.direction.y,x=1/this.direction.z,y=this.origin;return p>=0?(r=(e.min.x-y.x)*p,a=(e.max.x-y.x)*p):(r=(e.max.x-y.x)*p,a=(e.min.x-y.x)*p),v>=0?(c=(e.min.y-y.y)*v,f=(e.max.y-y.y)*v):(c=(e.max.y-y.y)*v,f=(e.min.y-y.y)*v),r>f||c>a||((c>r||isNaN(r))&&(r=c),(f<a||isNaN(a))&&(a=f),x>=0?(u=(e.min.z-y.z)*x,h=(e.max.z-y.z)*x):(u=(e.max.z-y.z)*x,h=(e.min.z-y.z)*x),r>h||u>a)||((u>r||r!==r)&&(r=u),(h<a||a!==a)&&(a=h),a<0)?null:this.at(r>=0?r:a,n)}intersectsBox(e){return this.intersectBox(e,Br)!==null}intersectTriangle(e,n,r,a,c){od.subVectors(n,e),Ic.subVectors(r,e),ad.crossVectors(od,Ic);let f=this.direction.dot(ad),u;if(f>0){if(a)return null;u=1}else if(f<0)u=-1,f=-f;else return null;Ms.subVectors(this.origin,e);const h=u*this.direction.dot(Ic.crossVectors(Ms,Ic));if(h<0)return null;const p=u*this.direction.dot(od.cross(Ms));if(p<0||h+p>f)return null;const v=-u*Ms.dot(ad);return v<0?null:this.at(v/f,c)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class dn{constructor(e,n,r,a,c,f,u,h,p,v,x,y,S,T,E,_){dn.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,n,r,a,c,f,u,h,p,v,x,y,S,T,E,_)}set(e,n,r,a,c,f,u,h,p,v,x,y,S,T,E,_){const g=this.elements;return g[0]=e,g[4]=n,g[8]=r,g[12]=a,g[1]=c,g[5]=f,g[9]=u,g[13]=h,g[2]=p,g[6]=v,g[10]=x,g[14]=y,g[3]=S,g[7]=T,g[11]=E,g[15]=_,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new dn().fromArray(this.elements)}copy(e){const n=this.elements,r=e.elements;return n[0]=r[0],n[1]=r[1],n[2]=r[2],n[3]=r[3],n[4]=r[4],n[5]=r[5],n[6]=r[6],n[7]=r[7],n[8]=r[8],n[9]=r[9],n[10]=r[10],n[11]=r[11],n[12]=r[12],n[13]=r[13],n[14]=r[14],n[15]=r[15],this}copyPosition(e){const n=this.elements,r=e.elements;return n[12]=r[12],n[13]=r[13],n[14]=r[14],this}setFromMatrix3(e){const n=e.elements;return this.set(n[0],n[3],n[6],0,n[1],n[4],n[7],0,n[2],n[5],n[8],0,0,0,0,1),this}extractBasis(e,n,r){return e.setFromMatrixColumn(this,0),n.setFromMatrixColumn(this,1),r.setFromMatrixColumn(this,2),this}makeBasis(e,n,r){return this.set(e.x,n.x,r.x,0,e.y,n.y,r.y,0,e.z,n.z,r.z,0,0,0,0,1),this}extractRotation(e){const n=this.elements,r=e.elements,a=1/ra.setFromMatrixColumn(e,0).length(),c=1/ra.setFromMatrixColumn(e,1).length(),f=1/ra.setFromMatrixColumn(e,2).length();return n[0]=r[0]*a,n[1]=r[1]*a,n[2]=r[2]*a,n[3]=0,n[4]=r[4]*c,n[5]=r[5]*c,n[6]=r[6]*c,n[7]=0,n[8]=r[8]*f,n[9]=r[9]*f,n[10]=r[10]*f,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromEuler(e){const n=this.elements,r=e.x,a=e.y,c=e.z,f=Math.cos(r),u=Math.sin(r),h=Math.cos(a),p=Math.sin(a),v=Math.cos(c),x=Math.sin(c);if(e.order==="XYZ"){const y=f*v,S=f*x,T=u*v,E=u*x;n[0]=h*v,n[4]=-h*x,n[8]=p,n[1]=S+T*p,n[5]=y-E*p,n[9]=-u*h,n[2]=E-y*p,n[6]=T+S*p,n[10]=f*h}else if(e.order==="YXZ"){const y=h*v,S=h*x,T=p*v,E=p*x;n[0]=y+E*u,n[4]=T*u-S,n[8]=f*p,n[1]=f*x,n[5]=f*v,n[9]=-u,n[2]=S*u-T,n[6]=E+y*u,n[10]=f*h}else if(e.order==="ZXY"){const y=h*v,S=h*x,T=p*v,E=p*x;n[0]=y-E*u,n[4]=-f*x,n[8]=T+S*u,n[1]=S+T*u,n[5]=f*v,n[9]=E-y*u,n[2]=-f*p,n[6]=u,n[10]=f*h}else if(e.order==="ZYX"){const y=f*v,S=f*x,T=u*v,E=u*x;n[0]=h*v,n[4]=T*p-S,n[8]=y*p+E,n[1]=h*x,n[5]=E*p+y,n[9]=S*p-T,n[2]=-p,n[6]=u*h,n[10]=f*h}else if(e.order==="YZX"){const y=f*h,S=f*p,T=u*h,E=u*p;n[0]=h*v,n[4]=E-y*x,n[8]=T*x+S,n[1]=x,n[5]=f*v,n[9]=-u*v,n[2]=-p*v,n[6]=S*x+T,n[10]=y-E*x}else if(e.order==="XZY"){const y=f*h,S=f*p,T=u*h,E=u*p;n[0]=h*v,n[4]=-x,n[8]=p*v,n[1]=y*x+E,n[5]=f*v,n[9]=S*x-T,n[2]=T*x-S,n[6]=u*v,n[10]=E*x+y}return n[3]=0,n[7]=0,n[11]=0,n[12]=0,n[13]=0,n[14]=0,n[15]=1,this}makeRotationFromQuaternion(e){return this.compose(I_,e,U_)}lookAt(e,n,r){const a=this.elements;return Mi.subVectors(e,n),Mi.lengthSq()===0&&(Mi.z=1),Mi.normalize(),Es.crossVectors(r,Mi),Es.lengthSq()===0&&(Math.abs(r.z)===1?Mi.x+=1e-4:Mi.z+=1e-4,Mi.normalize(),Es.crossVectors(r,Mi)),Es.normalize(),Uc.crossVectors(Mi,Es),a[0]=Es.x,a[4]=Uc.x,a[8]=Mi.x,a[1]=Es.y,a[5]=Uc.y,a[9]=Mi.y,a[2]=Es.z,a[6]=Uc.z,a[10]=Mi.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,n){const r=e.elements,a=n.elements,c=this.elements,f=r[0],u=r[4],h=r[8],p=r[12],v=r[1],x=r[5],y=r[9],S=r[13],T=r[2],E=r[6],_=r[10],g=r[14],F=r[3],D=r[7],A=r[11],G=r[15],O=a[0],z=a[4],$=a[8],L=a[12],b=a[1],U=a[5],N=a[9],I=a[13],ae=a[2],re=a[6],ce=a[10],fe=a[14],H=a[3],te=a[7],se=a[11],B=a[15];return c[0]=f*O+u*b+h*ae+p*H,c[4]=f*z+u*U+h*re+p*te,c[8]=f*$+u*N+h*ce+p*se,c[12]=f*L+u*I+h*fe+p*B,c[1]=v*O+x*b+y*ae+S*H,c[5]=v*z+x*U+y*re+S*te,c[9]=v*$+x*N+y*ce+S*se,c[13]=v*L+x*I+y*fe+S*B,c[2]=T*O+E*b+_*ae+g*H,c[6]=T*z+E*U+_*re+g*te,c[10]=T*$+E*N+_*ce+g*se,c[14]=T*L+E*I+_*fe+g*B,c[3]=F*O+D*b+A*ae+G*H,c[7]=F*z+D*U+A*re+G*te,c[11]=F*$+D*N+A*ce+G*se,c[15]=F*L+D*I+A*fe+G*B,this}multiplyScalar(e){const n=this.elements;return n[0]*=e,n[4]*=e,n[8]*=e,n[12]*=e,n[1]*=e,n[5]*=e,n[9]*=e,n[13]*=e,n[2]*=e,n[6]*=e,n[10]*=e,n[14]*=e,n[3]*=e,n[7]*=e,n[11]*=e,n[15]*=e,this}determinant(){const e=this.elements,n=e[0],r=e[4],a=e[8],c=e[12],f=e[1],u=e[5],h=e[9],p=e[13],v=e[2],x=e[6],y=e[10],S=e[14],T=e[3],E=e[7],_=e[11],g=e[15];return T*(+c*h*x-a*p*x-c*u*y+r*p*y+a*u*S-r*h*S)+E*(+n*h*S-n*p*y+c*f*y-a*f*S+a*p*v-c*h*v)+_*(+n*p*x-n*u*S-c*f*x+r*f*S+c*u*v-r*p*v)+g*(-a*u*v-n*h*x+n*u*y+a*f*x-r*f*y+r*h*v)}transpose(){const e=this.elements;let n;return n=e[1],e[1]=e[4],e[4]=n,n=e[2],e[2]=e[8],e[8]=n,n=e[6],e[6]=e[9],e[9]=n,n=e[3],e[3]=e[12],e[12]=n,n=e[7],e[7]=e[13],e[13]=n,n=e[11],e[11]=e[14],e[14]=n,this}setPosition(e,n,r){const a=this.elements;return e.isVector3?(a[12]=e.x,a[13]=e.y,a[14]=e.z):(a[12]=e,a[13]=n,a[14]=r),this}invert(){const e=this.elements,n=e[0],r=e[1],a=e[2],c=e[3],f=e[4],u=e[5],h=e[6],p=e[7],v=e[8],x=e[9],y=e[10],S=e[11],T=e[12],E=e[13],_=e[14],g=e[15],F=x*_*p-E*y*p+E*h*S-u*_*S-x*h*g+u*y*g,D=T*y*p-v*_*p-T*h*S+f*_*S+v*h*g-f*y*g,A=v*E*p-T*x*p+T*u*S-f*E*S-v*u*g+f*x*g,G=T*x*h-v*E*h-T*u*y+f*E*y+v*u*_-f*x*_,O=n*F+r*D+a*A+c*G;if(O===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const z=1/O;return e[0]=F*z,e[1]=(E*y*c-x*_*c-E*a*S+r*_*S+x*a*g-r*y*g)*z,e[2]=(u*_*c-E*h*c+E*a*p-r*_*p-u*a*g+r*h*g)*z,e[3]=(x*h*c-u*y*c-x*a*p+r*y*p+u*a*S-r*h*S)*z,e[4]=D*z,e[5]=(v*_*c-T*y*c+T*a*S-n*_*S-v*a*g+n*y*g)*z,e[6]=(T*h*c-f*_*c-T*a*p+n*_*p+f*a*g-n*h*g)*z,e[7]=(f*y*c-v*h*c+v*a*p-n*y*p-f*a*S+n*h*S)*z,e[8]=A*z,e[9]=(T*x*c-v*E*c-T*r*S+n*E*S+v*r*g-n*x*g)*z,e[10]=(f*E*c-T*u*c+T*r*p-n*E*p-f*r*g+n*u*g)*z,e[11]=(v*u*c-f*x*c-v*r*p+n*x*p+f*r*S-n*u*S)*z,e[12]=G*z,e[13]=(v*E*a-T*x*a+T*r*y-n*E*y-v*r*_+n*x*_)*z,e[14]=(T*u*a-f*E*a-T*r*h+n*E*h+f*r*_-n*u*_)*z,e[15]=(f*x*a-v*u*a+v*r*h-n*x*h-f*r*y+n*u*y)*z,this}scale(e){const n=this.elements,r=e.x,a=e.y,c=e.z;return n[0]*=r,n[4]*=a,n[8]*=c,n[1]*=r,n[5]*=a,n[9]*=c,n[2]*=r,n[6]*=a,n[10]*=c,n[3]*=r,n[7]*=a,n[11]*=c,this}getMaxScaleOnAxis(){const e=this.elements,n=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],r=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],a=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(n,r,a))}makeTranslation(e,n,r){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,n,0,0,1,r,0,0,0,1),this}makeRotationX(e){const n=Math.cos(e),r=Math.sin(e);return this.set(1,0,0,0,0,n,-r,0,0,r,n,0,0,0,0,1),this}makeRotationY(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,0,r,0,0,1,0,0,-r,0,n,0,0,0,0,1),this}makeRotationZ(e){const n=Math.cos(e),r=Math.sin(e);return this.set(n,-r,0,0,r,n,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,n){const r=Math.cos(n),a=Math.sin(n),c=1-r,f=e.x,u=e.y,h=e.z,p=c*f,v=c*u;return this.set(p*f+r,p*u-a*h,p*h+a*u,0,p*u+a*h,v*u+r,v*h-a*f,0,p*h-a*u,v*h+a*f,c*h*h+r,0,0,0,0,1),this}makeScale(e,n,r){return this.set(e,0,0,0,0,n,0,0,0,0,r,0,0,0,0,1),this}makeShear(e,n,r,a,c,f){return this.set(1,r,c,0,e,1,f,0,n,a,1,0,0,0,0,1),this}compose(e,n,r){const a=this.elements,c=n._x,f=n._y,u=n._z,h=n._w,p=c+c,v=f+f,x=u+u,y=c*p,S=c*v,T=c*x,E=f*v,_=f*x,g=u*x,F=h*p,D=h*v,A=h*x,G=r.x,O=r.y,z=r.z;return a[0]=(1-(E+g))*G,a[1]=(S+A)*G,a[2]=(T-D)*G,a[3]=0,a[4]=(S-A)*O,a[5]=(1-(y+g))*O,a[6]=(_+F)*O,a[7]=0,a[8]=(T+D)*z,a[9]=(_-F)*z,a[10]=(1-(y+E))*z,a[11]=0,a[12]=e.x,a[13]=e.y,a[14]=e.z,a[15]=1,this}decompose(e,n,r){const a=this.elements;let c=ra.set(a[0],a[1],a[2]).length();const f=ra.set(a[4],a[5],a[6]).length(),u=ra.set(a[8],a[9],a[10]).length();this.determinant()<0&&(c=-c),e.x=a[12],e.y=a[13],e.z=a[14],ir.copy(this);const p=1/c,v=1/f,x=1/u;return ir.elements[0]*=p,ir.elements[1]*=p,ir.elements[2]*=p,ir.elements[4]*=v,ir.elements[5]*=v,ir.elements[6]*=v,ir.elements[8]*=x,ir.elements[9]*=x,ir.elements[10]*=x,n.setFromRotationMatrix(ir),r.x=c,r.y=f,r.z=u,this}makePerspective(e,n,r,a,c,f,u=Xr){const h=this.elements,p=2*c/(n-e),v=2*c/(r-a),x=(n+e)/(n-e),y=(r+a)/(r-a);let S,T;if(u===Xr)S=-(f+c)/(f-c),T=-2*f*c/(f-c);else if(u===uu)S=-f/(f-c),T=-f*c/(f-c);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+u);return h[0]=p,h[4]=0,h[8]=x,h[12]=0,h[1]=0,h[5]=v,h[9]=y,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=T,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,n,r,a,c,f,u=Xr){const h=this.elements,p=1/(n-e),v=1/(r-a),x=1/(f-c),y=(n+e)*p,S=(r+a)*v;let T,E;if(u===Xr)T=(f+c)*x,E=-2*x;else if(u===uu)T=c*x,E=-1*x;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+u);return h[0]=2*p,h[4]=0,h[8]=0,h[12]=-y,h[1]=0,h[5]=2*v,h[9]=0,h[13]=-S,h[2]=0,h[6]=0,h[10]=E,h[14]=-T,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){const n=this.elements,r=e.elements;for(let a=0;a<16;a++)if(n[a]!==r[a])return!1;return!0}fromArray(e,n=0){for(let r=0;r<16;r++)this.elements[r]=e[r+n];return this}toArray(e=[],n=0){const r=this.elements;return e[n]=r[0],e[n+1]=r[1],e[n+2]=r[2],e[n+3]=r[3],e[n+4]=r[4],e[n+5]=r[5],e[n+6]=r[6],e[n+7]=r[7],e[n+8]=r[8],e[n+9]=r[9],e[n+10]=r[10],e[n+11]=r[11],e[n+12]=r[12],e[n+13]=r[13],e[n+14]=r[14],e[n+15]=r[15],e}}const ra=new ee,ir=new dn,I_=new ee(0,0,0),U_=new ee(1,1,1),Es=new ee,Uc=new ee,Mi=new ee,$m=new dn,Km=new xl;class qr{constructor(e=0,n=0,r=0,a=qr.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=n,this._z=r,this._order=a}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,n,r,a=this._order){return this._x=e,this._y=n,this._z=r,this._order=a,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,n=this._order,r=!0){const a=e.elements,c=a[0],f=a[4],u=a[8],h=a[1],p=a[5],v=a[9],x=a[2],y=a[6],S=a[10];switch(n){case"XYZ":this._y=Math.asin(Dt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(-v,S),this._z=Math.atan2(-f,c)):(this._x=Math.atan2(y,p),this._z=0);break;case"YXZ":this._x=Math.asin(-Dt(v,-1,1)),Math.abs(v)<.9999999?(this._y=Math.atan2(u,S),this._z=Math.atan2(h,p)):(this._y=Math.atan2(-x,c),this._z=0);break;case"ZXY":this._x=Math.asin(Dt(y,-1,1)),Math.abs(y)<.9999999?(this._y=Math.atan2(-x,S),this._z=Math.atan2(-f,p)):(this._y=0,this._z=Math.atan2(h,c));break;case"ZYX":this._y=Math.asin(-Dt(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(y,S),this._z=Math.atan2(h,c)):(this._x=0,this._z=Math.atan2(-f,p));break;case"YZX":this._z=Math.asin(Dt(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(-v,p),this._y=Math.atan2(-x,c)):(this._x=0,this._y=Math.atan2(u,S));break;case"XZY":this._z=Math.asin(-Dt(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(y,p),this._y=Math.atan2(u,c)):(this._x=Math.atan2(-v,S),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+n)}return this._order=n,r===!0&&this._onChangeCallback(),this}setFromQuaternion(e,n,r){return $m.makeRotationFromQuaternion(e),this.setFromRotationMatrix($m,n,r)}setFromVector3(e,n=this._order){return this.set(e.x,e.y,e.z,n)}reorder(e){return Km.setFromEuler(this),this.setFromQuaternion(Km,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],n=0){return e[n]=this._x,e[n+1]=this._y,e[n+2]=this._z,e[n+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}qr.DEFAULT_ORDER="XYZ";class c0{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let N_=0;const Zm=new ee,sa=new xl,zr=new dn,Nc=new ee,ul=new ee,F_=new ee,O_=new xl,Jm=new ee(1,0,0),Qm=new ee(0,1,0),eg=new ee(0,0,1),tg={type:"added"},k_={type:"removed"},oa={type:"childadded",child:null},ld={type:"childremoved",child:null};class ii extends La{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:N_++}),this.uuid=Ds(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ii.DEFAULT_UP.clone();const e=new ee,n=new qr,r=new xl,a=new ee(1,1,1);function c(){r.setFromEuler(n,!1)}function f(){n.setFromQuaternion(r,void 0,!1)}n._onChange(c),r._onChange(f),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:n},quaternion:{configurable:!0,enumerable:!0,value:r},scale:{configurable:!0,enumerable:!0,value:a},modelViewMatrix:{value:new dn},normalMatrix:{value:new xt}}),this.matrix=new dn,this.matrixWorld=new dn,this.matrixAutoUpdate=ii.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ii.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new c0,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,n){this.quaternion.setFromAxisAngle(e,n)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,n){return sa.setFromAxisAngle(e,n),this.quaternion.multiply(sa),this}rotateOnWorldAxis(e,n){return sa.setFromAxisAngle(e,n),this.quaternion.premultiply(sa),this}rotateX(e){return this.rotateOnAxis(Jm,e)}rotateY(e){return this.rotateOnAxis(Qm,e)}rotateZ(e){return this.rotateOnAxis(eg,e)}translateOnAxis(e,n){return Zm.copy(e).applyQuaternion(this.quaternion),this.position.add(Zm.multiplyScalar(n)),this}translateX(e){return this.translateOnAxis(Jm,e)}translateY(e){return this.translateOnAxis(Qm,e)}translateZ(e){return this.translateOnAxis(eg,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zr.copy(this.matrixWorld).invert())}lookAt(e,n,r){e.isVector3?Nc.copy(e):Nc.set(e,n,r);const a=this.parent;this.updateWorldMatrix(!0,!1),ul.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zr.lookAt(ul,Nc,this.up):zr.lookAt(Nc,ul,this.up),this.quaternion.setFromRotationMatrix(zr),a&&(zr.extractRotation(a.matrixWorld),sa.setFromRotationMatrix(zr),this.quaternion.premultiply(sa.invert()))}add(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.add(arguments[n]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(tg),oa.child=e,this.dispatchEvent(oa),oa.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let r=0;r<arguments.length;r++)this.remove(arguments[r]);return this}const n=this.children.indexOf(e);return n!==-1&&(e.parent=null,this.children.splice(n,1),e.dispatchEvent(k_),ld.child=e,this.dispatchEvent(ld),ld.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zr.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zr.multiply(e.parent.matrixWorld)),e.applyMatrix4(zr),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(tg),oa.child=e,this.dispatchEvent(oa),oa.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,n){if(this[e]===n)return this;for(let r=0,a=this.children.length;r<a;r++){const f=this.children[r].getObjectByProperty(e,n);if(f!==void 0)return f}}getObjectsByProperty(e,n,r=[]){this[e]===n&&r.push(this);const a=this.children;for(let c=0,f=a.length;c<f;c++)a[c].getObjectsByProperty(e,n,r);return r}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ul,e,F_),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(ul,O_,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const n=this.matrixWorld.elements;return e.set(n[8],n[9],n[10]).normalize()}raycast(){}traverse(e){e(this);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].traverseVisible(e)}traverseAncestors(e){const n=this.parent;n!==null&&(e(n),n.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const n=this.children;for(let r=0,a=n.length;r<a;r++)n[r].updateMatrixWorld(e)}updateWorldMatrix(e,n){const r=this.parent;if(e===!0&&r!==null&&r.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),n===!0){const a=this.children;for(let c=0,f=a.length;c<f;c++)a[c].updateWorldMatrix(!1,!0)}}toJSON(e){const n=e===void 0||typeof e=="string",r={};n&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},r.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const a={};a.uuid=this.uuid,a.type=this.type,this.name!==""&&(a.name=this.name),this.castShadow===!0&&(a.castShadow=!0),this.receiveShadow===!0&&(a.receiveShadow=!0),this.visible===!1&&(a.visible=!1),this.frustumCulled===!1&&(a.frustumCulled=!1),this.renderOrder!==0&&(a.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(a.userData=this.userData),a.layers=this.layers.mask,a.matrix=this.matrix.toArray(),a.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(a.matrixAutoUpdate=!1),this.isInstancedMesh&&(a.type="InstancedMesh",a.count=this.count,a.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(a.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(a.type="BatchedMesh",a.perObjectFrustumCulled=this.perObjectFrustumCulled,a.sortObjects=this.sortObjects,a.drawRanges=this._drawRanges,a.reservedRanges=this._reservedRanges,a.visibility=this._visibility,a.active=this._active,a.bounds=this._bounds.map(u=>({boxInitialized:u.boxInitialized,boxMin:u.box.min.toArray(),boxMax:u.box.max.toArray(),sphereInitialized:u.sphereInitialized,sphereRadius:u.sphere.radius,sphereCenter:u.sphere.center.toArray()})),a.maxInstanceCount=this._maxInstanceCount,a.maxVertexCount=this._maxVertexCount,a.maxIndexCount=this._maxIndexCount,a.geometryInitialized=this._geometryInitialized,a.geometryCount=this._geometryCount,a.matricesTexture=this._matricesTexture.toJSON(e),this._colorsTexture!==null&&(a.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(a.boundingSphere={center:a.boundingSphere.center.toArray(),radius:a.boundingSphere.radius}),this.boundingBox!==null&&(a.boundingBox={min:a.boundingBox.min.toArray(),max:a.boundingBox.max.toArray()}));function c(u,h){return u[h.uuid]===void 0&&(u[h.uuid]=h.toJSON(e)),h.uuid}if(this.isScene)this.background&&(this.background.isColor?a.background=this.background.toJSON():this.background.isTexture&&(a.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(a.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){a.geometry=c(e.geometries,this.geometry);const u=this.geometry.parameters;if(u!==void 0&&u.shapes!==void 0){const h=u.shapes;if(Array.isArray(h))for(let p=0,v=h.length;p<v;p++){const x=h[p];c(e.shapes,x)}else c(e.shapes,h)}}if(this.isSkinnedMesh&&(a.bindMode=this.bindMode,a.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(c(e.skeletons,this.skeleton),a.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const u=[];for(let h=0,p=this.material.length;h<p;h++)u.push(c(e.materials,this.material[h]));a.material=u}else a.material=c(e.materials,this.material);if(this.children.length>0){a.children=[];for(let u=0;u<this.children.length;u++)a.children.push(this.children[u].toJSON(e).object)}if(this.animations.length>0){a.animations=[];for(let u=0;u<this.animations.length;u++){const h=this.animations[u];a.animations.push(c(e.animations,h))}}if(n){const u=f(e.geometries),h=f(e.materials),p=f(e.textures),v=f(e.images),x=f(e.shapes),y=f(e.skeletons),S=f(e.animations),T=f(e.nodes);u.length>0&&(r.geometries=u),h.length>0&&(r.materials=h),p.length>0&&(r.textures=p),v.length>0&&(r.images=v),x.length>0&&(r.shapes=x),y.length>0&&(r.skeletons=y),S.length>0&&(r.animations=S),T.length>0&&(r.nodes=T)}return r.object=a,r;function f(u){const h=[];for(const p in u){const v=u[p];delete v.metadata,h.push(v)}return h}}clone(e){return new this.constructor().copy(this,e)}copy(e,n=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),n===!0)for(let r=0;r<e.children.length;r++){const a=e.children[r];this.add(a.clone())}return this}}ii.DEFAULT_UP=new ee(0,1,0);ii.DEFAULT_MATRIX_AUTO_UPDATE=!0;ii.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const rr=new ee,Hr=new ee,cd=new ee,Vr=new ee,aa=new ee,la=new ee,ng=new ee,ud=new ee,fd=new ee,dd=new ee,hd=new _n,pd=new _n,md=new _n;class Vi{constructor(e=new ee,n=new ee,r=new ee){this.a=e,this.b=n,this.c=r}static getNormal(e,n,r,a){a.subVectors(r,n),rr.subVectors(e,n),a.cross(rr);const c=a.lengthSq();return c>0?a.multiplyScalar(1/Math.sqrt(c)):a.set(0,0,0)}static getBarycoord(e,n,r,a,c){rr.subVectors(a,n),Hr.subVectors(r,n),cd.subVectors(e,n);const f=rr.dot(rr),u=rr.dot(Hr),h=rr.dot(cd),p=Hr.dot(Hr),v=Hr.dot(cd),x=f*p-u*u;if(x===0)return c.set(0,0,0),null;const y=1/x,S=(p*h-u*v)*y,T=(f*v-u*h)*y;return c.set(1-S-T,T,S)}static containsPoint(e,n,r,a){return this.getBarycoord(e,n,r,a,Vr)===null?!1:Vr.x>=0&&Vr.y>=0&&Vr.x+Vr.y<=1}static getInterpolation(e,n,r,a,c,f,u,h){return this.getBarycoord(e,n,r,a,Vr)===null?(h.x=0,h.y=0,"z"in h&&(h.z=0),"w"in h&&(h.w=0),null):(h.setScalar(0),h.addScaledVector(c,Vr.x),h.addScaledVector(f,Vr.y),h.addScaledVector(u,Vr.z),h)}static getInterpolatedAttribute(e,n,r,a,c,f){return hd.setScalar(0),pd.setScalar(0),md.setScalar(0),hd.fromBufferAttribute(e,n),pd.fromBufferAttribute(e,r),md.fromBufferAttribute(e,a),f.setScalar(0),f.addScaledVector(hd,c.x),f.addScaledVector(pd,c.y),f.addScaledVector(md,c.z),f}static isFrontFacing(e,n,r,a){return rr.subVectors(r,n),Hr.subVectors(e,n),rr.cross(Hr).dot(a)<0}set(e,n,r){return this.a.copy(e),this.b.copy(n),this.c.copy(r),this}setFromPointsAndIndices(e,n,r,a){return this.a.copy(e[n]),this.b.copy(e[r]),this.c.copy(e[a]),this}setFromAttributeAndIndices(e,n,r,a){return this.a.fromBufferAttribute(e,n),this.b.fromBufferAttribute(e,r),this.c.fromBufferAttribute(e,a),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return rr.subVectors(this.c,this.b),Hr.subVectors(this.a,this.b),rr.cross(Hr).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Vi.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,n){return Vi.getBarycoord(e,this.a,this.b,this.c,n)}getInterpolation(e,n,r,a,c){return Vi.getInterpolation(e,this.a,this.b,this.c,n,r,a,c)}containsPoint(e){return Vi.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Vi.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,n){const r=this.a,a=this.b,c=this.c;let f,u;aa.subVectors(a,r),la.subVectors(c,r),ud.subVectors(e,r);const h=aa.dot(ud),p=la.dot(ud);if(h<=0&&p<=0)return n.copy(r);fd.subVectors(e,a);const v=aa.dot(fd),x=la.dot(fd);if(v>=0&&x<=v)return n.copy(a);const y=h*x-v*p;if(y<=0&&h>=0&&v<=0)return f=h/(h-v),n.copy(r).addScaledVector(aa,f);dd.subVectors(e,c);const S=aa.dot(dd),T=la.dot(dd);if(T>=0&&S<=T)return n.copy(c);const E=S*p-h*T;if(E<=0&&p>=0&&T<=0)return u=p/(p-T),n.copy(r).addScaledVector(la,u);const _=v*T-S*x;if(_<=0&&x-v>=0&&S-T>=0)return ng.subVectors(c,a),u=(x-v)/(x-v+(S-T)),n.copy(a).addScaledVector(ng,u);const g=1/(_+E+y);return f=E*g,u=y*g,n.copy(r).addScaledVector(aa,f).addScaledVector(la,u)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const u0={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ts={h:0,s:0,l:0},Fc={h:0,s:0,l:0};function gd(s,e,n){return n<0&&(n+=1),n>1&&(n-=1),n<1/6?s+(e-s)*6*n:n<1/2?e:n<2/3?s+(e-s)*6*(2/3-n):s}class Ct{constructor(e,n,r){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,n,r)}set(e,n,r){if(n===void 0&&r===void 0){const a=e;a&&a.isColor?this.copy(a):typeof a=="number"?this.setHex(a):typeof a=="string"&&this.setStyle(a)}else this.setRGB(e,n,r);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,n=Bi){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,Ft.toWorkingColorSpace(this,n),this}setRGB(e,n,r,a=Ft.workingColorSpace){return this.r=e,this.g=n,this.b=r,Ft.toWorkingColorSpace(this,a),this}setHSL(e,n,r,a=Ft.workingColorSpace){if(e=S_(e,1),n=Dt(n,0,1),r=Dt(r,0,1),n===0)this.r=this.g=this.b=r;else{const c=r<=.5?r*(1+n):r+n-r*n,f=2*r-c;this.r=gd(f,c,e+1/3),this.g=gd(f,c,e),this.b=gd(f,c,e-1/3)}return Ft.toWorkingColorSpace(this,a),this}setStyle(e,n=Bi){function r(c){c!==void 0&&parseFloat(c)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let a;if(a=/^(\w+)\(([^\)]*)\)/.exec(e)){let c;const f=a[1],u=a[2];switch(f){case"rgb":case"rgba":if(c=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(c[4]),this.setRGB(Math.min(255,parseInt(c[1],10))/255,Math.min(255,parseInt(c[2],10))/255,Math.min(255,parseInt(c[3],10))/255,n);if(c=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(c[4]),this.setRGB(Math.min(100,parseInt(c[1],10))/100,Math.min(100,parseInt(c[2],10))/100,Math.min(100,parseInt(c[3],10))/100,n);break;case"hsl":case"hsla":if(c=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(u))return r(c[4]),this.setHSL(parseFloat(c[1])/360,parseFloat(c[2])/100,parseFloat(c[3])/100,n);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(a=/^\#([A-Fa-f\d]+)$/.exec(e)){const c=a[1],f=c.length;if(f===3)return this.setRGB(parseInt(c.charAt(0),16)/15,parseInt(c.charAt(1),16)/15,parseInt(c.charAt(2),16)/15,n);if(f===6)return this.setHex(parseInt(c,16),n);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,n);return this}setColorName(e,n=Bi){const r=u0[e.toLowerCase()];return r!==void 0?this.setHex(r,n):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=jr(e.r),this.g=jr(e.g),this.b=jr(e.b),this}copyLinearToSRGB(e){return this.r=Ea(e.r),this.g=Ea(e.g),this.b=Ea(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Bi){return Ft.fromWorkingColorSpace(jn.copy(this),e),Math.round(Dt(jn.r*255,0,255))*65536+Math.round(Dt(jn.g*255,0,255))*256+Math.round(Dt(jn.b*255,0,255))}getHexString(e=Bi){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,n=Ft.workingColorSpace){Ft.fromWorkingColorSpace(jn.copy(this),n);const r=jn.r,a=jn.g,c=jn.b,f=Math.max(r,a,c),u=Math.min(r,a,c);let h,p;const v=(u+f)/2;if(u===f)h=0,p=0;else{const x=f-u;switch(p=v<=.5?x/(f+u):x/(2-f-u),f){case r:h=(a-c)/x+(a<c?6:0);break;case a:h=(c-r)/x+2;break;case c:h=(r-a)/x+4;break}h/=6}return e.h=h,e.s=p,e.l=v,e}getRGB(e,n=Ft.workingColorSpace){return Ft.fromWorkingColorSpace(jn.copy(this),n),e.r=jn.r,e.g=jn.g,e.b=jn.b,e}getStyle(e=Bi){Ft.fromWorkingColorSpace(jn.copy(this),e);const n=jn.r,r=jn.g,a=jn.b;return e!==Bi?`color(${e} ${n.toFixed(3)} ${r.toFixed(3)} ${a.toFixed(3)})`:`rgb(${Math.round(n*255)},${Math.round(r*255)},${Math.round(a*255)})`}offsetHSL(e,n,r){return this.getHSL(Ts),this.setHSL(Ts.h+e,Ts.s+n,Ts.l+r)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,n){return this.r=e.r+n.r,this.g=e.g+n.g,this.b=e.b+n.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,n){return this.r+=(e.r-this.r)*n,this.g+=(e.g-this.g)*n,this.b+=(e.b-this.b)*n,this}lerpColors(e,n,r){return this.r=e.r+(n.r-e.r)*r,this.g=e.g+(n.g-e.g)*r,this.b=e.b+(n.b-e.b)*r,this}lerpHSL(e,n){this.getHSL(Ts),e.getHSL(Fc);const r=Qf(Ts.h,Fc.h,n),a=Qf(Ts.s,Fc.s,n),c=Qf(Ts.l,Fc.l,n);return this.setHSL(r,a,c),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const n=this.r,r=this.g,a=this.b,c=e.elements;return this.r=c[0]*n+c[3]*r+c[6]*a,this.g=c[1]*n+c[4]*r+c[7]*a,this.b=c[2]*n+c[5]*r+c[8]*a,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,n=0){return this.r=e[n],this.g=e[n+1],this.b=e[n+2],this}toArray(e=[],n=0){return e[n]=this.r,e[n+1]=this.g,e[n+2]=this.b,e}fromBufferAttribute(e,n){return this.r=e.getX(n),this.g=e.getY(n),this.b=e.getZ(n),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const jn=new Ct;Ct.NAMES=u0;let B_=0;class Da extends La{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:B_++}),this.uuid=Ds(),this.name="",this.type="Material",this.blending=Sa,this.side=Is,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ud,this.blendDst=Nd,this.blendEquation=mo,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ct(0,0,0),this.blendAlpha=0,this.depthFunc=Ta,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Gm,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Qo,this.stencilZFail=Qo,this.stencilZPass=Qo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const n in e){const r=e[n];if(r===void 0){console.warn(`THREE.Material: parameter '${n}' has value of undefined.`);continue}const a=this[n];if(a===void 0){console.warn(`THREE.Material: '${n}' is not a property of THREE.${this.type}.`);continue}a&&a.isColor?a.set(r):a&&a.isVector3&&r&&r.isVector3?a.copy(r):this[n]=r}}toJSON(e){const n=e===void 0||typeof e=="string";n&&(e={textures:{},images:{}});const r={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};r.uuid=this.uuid,r.type=this.type,this.name!==""&&(r.name=this.name),this.color&&this.color.isColor&&(r.color=this.color.getHex()),this.roughness!==void 0&&(r.roughness=this.roughness),this.metalness!==void 0&&(r.metalness=this.metalness),this.sheen!==void 0&&(r.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(r.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(r.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(r.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(r.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(r.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(r.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(r.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(r.shininess=this.shininess),this.clearcoat!==void 0&&(r.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(r.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(r.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(r.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(r.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,r.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(r.dispersion=this.dispersion),this.iridescence!==void 0&&(r.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(r.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(r.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(r.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(r.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(r.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(r.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(r.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(r.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(r.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(r.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(r.lightMap=this.lightMap.toJSON(e).uuid,r.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(r.aoMap=this.aoMap.toJSON(e).uuid,r.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(r.bumpMap=this.bumpMap.toJSON(e).uuid,r.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(r.normalMap=this.normalMap.toJSON(e).uuid,r.normalMapType=this.normalMapType,r.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(r.displacementMap=this.displacementMap.toJSON(e).uuid,r.displacementScale=this.displacementScale,r.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(r.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(r.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(r.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(r.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(r.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(r.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(r.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(r.combine=this.combine)),this.envMapRotation!==void 0&&(r.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(r.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(r.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(r.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(r.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(r.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(r.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(r.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(r.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(r.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(r.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(r.size=this.size),this.shadowSide!==null&&(r.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(r.sizeAttenuation=this.sizeAttenuation),this.blending!==Sa&&(r.blending=this.blending),this.side!==Is&&(r.side=this.side),this.vertexColors===!0&&(r.vertexColors=!0),this.opacity<1&&(r.opacity=this.opacity),this.transparent===!0&&(r.transparent=!0),this.blendSrc!==Ud&&(r.blendSrc=this.blendSrc),this.blendDst!==Nd&&(r.blendDst=this.blendDst),this.blendEquation!==mo&&(r.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(r.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(r.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(r.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(r.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(r.blendAlpha=this.blendAlpha),this.depthFunc!==Ta&&(r.depthFunc=this.depthFunc),this.depthTest===!1&&(r.depthTest=this.depthTest),this.depthWrite===!1&&(r.depthWrite=this.depthWrite),this.colorWrite===!1&&(r.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(r.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Gm&&(r.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(r.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(r.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Qo&&(r.stencilFail=this.stencilFail),this.stencilZFail!==Qo&&(r.stencilZFail=this.stencilZFail),this.stencilZPass!==Qo&&(r.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(r.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(r.rotation=this.rotation),this.polygonOffset===!0&&(r.polygonOffset=!0),this.polygonOffsetFactor!==0&&(r.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(r.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(r.linewidth=this.linewidth),this.dashSize!==void 0&&(r.dashSize=this.dashSize),this.gapSize!==void 0&&(r.gapSize=this.gapSize),this.scale!==void 0&&(r.scale=this.scale),this.dithering===!0&&(r.dithering=!0),this.alphaTest>0&&(r.alphaTest=this.alphaTest),this.alphaHash===!0&&(r.alphaHash=!0),this.alphaToCoverage===!0&&(r.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(r.premultipliedAlpha=!0),this.forceSinglePass===!0&&(r.forceSinglePass=!0),this.wireframe===!0&&(r.wireframe=!0),this.wireframeLinewidth>1&&(r.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(r.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(r.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(r.flatShading=!0),this.visible===!1&&(r.visible=!1),this.toneMapped===!1&&(r.toneMapped=!1),this.fog===!1&&(r.fog=!1),Object.keys(this.userData).length>0&&(r.userData=this.userData);function a(c){const f=[];for(const u in c){const h=c[u];delete h.metadata,f.push(h)}return f}if(n){const c=a(e.textures),f=a(e.images);c.length>0&&(r.textures=c),f.length>0&&(r.images=f)}return r}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const n=e.clippingPlanes;let r=null;if(n!==null){const a=n.length;r=new Array(a);for(let c=0;c!==a;++c)r[c]=n[c].clone()}return this.clippingPlanes=r,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class _a extends Da{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ct(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qr,this.combine=Yg,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const yn=new ee,Oc=new It;class wi{constructor(e,n,r=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=e,this.itemSize=n,this.count=e!==void 0?e.length/n:0,this.normalized=r,this.usage=xh,this.updateRanges=[],this.gpuType=yr,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,n,r){e*=this.itemSize,r*=n.itemSize;for(let a=0,c=this.itemSize;a<c;a++)this.array[e+a]=n.array[r+a];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let n=0,r=this.count;n<r;n++)Oc.fromBufferAttribute(this,n),Oc.applyMatrix3(e),this.setXY(n,Oc.x,Oc.y);else if(this.itemSize===3)for(let n=0,r=this.count;n<r;n++)yn.fromBufferAttribute(this,n),yn.applyMatrix3(e),this.setXYZ(n,yn.x,yn.y,yn.z);return this}applyMatrix4(e){for(let n=0,r=this.count;n<r;n++)yn.fromBufferAttribute(this,n),yn.applyMatrix4(e),this.setXYZ(n,yn.x,yn.y,yn.z);return this}applyNormalMatrix(e){for(let n=0,r=this.count;n<r;n++)yn.fromBufferAttribute(this,n),yn.applyNormalMatrix(e),this.setXYZ(n,yn.x,yn.y,yn.z);return this}transformDirection(e){for(let n=0,r=this.count;n<r;n++)yn.fromBufferAttribute(this,n),yn.transformDirection(e),this.setXYZ(n,yn.x,yn.y,yn.z);return this}set(e,n=0){return this.array.set(e,n),this}getComponent(e,n){let r=this.array[e*this.itemSize+n];return this.normalized&&(r=_r(r,this.array)),r}setComponent(e,n,r){return this.normalized&&(r=Ht(r,this.array)),this.array[e*this.itemSize+n]=r,this}getX(e){let n=this.array[e*this.itemSize];return this.normalized&&(n=_r(n,this.array)),n}setX(e,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize]=n,this}getY(e){let n=this.array[e*this.itemSize+1];return this.normalized&&(n=_r(n,this.array)),n}setY(e,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+1]=n,this}getZ(e){let n=this.array[e*this.itemSize+2];return this.normalized&&(n=_r(n,this.array)),n}setZ(e,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+2]=n,this}getW(e){let n=this.array[e*this.itemSize+3];return this.normalized&&(n=_r(n,this.array)),n}setW(e,n){return this.normalized&&(n=Ht(n,this.array)),this.array[e*this.itemSize+3]=n,this}setXY(e,n,r){return e*=this.itemSize,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array)),this.array[e+0]=n,this.array[e+1]=r,this}setXYZ(e,n,r,a){return e*=this.itemSize,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array),a=Ht(a,this.array)),this.array[e+0]=n,this.array[e+1]=r,this.array[e+2]=a,this}setXYZW(e,n,r,a,c){return e*=this.itemSize,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array),a=Ht(a,this.array),c=Ht(c,this.array)),this.array[e+0]=n,this.array[e+1]=r,this.array[e+2]=a,this.array[e+3]=c,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==xh&&(e.usage=this.usage),e}}class f0 extends wi{constructor(e,n,r){super(new Uint16Array(e),n,r)}}class d0 extends wi{constructor(e,n,r){super(new Uint32Array(e),n,r)}}class or extends wi{constructor(e,n,r){super(new Float32Array(e),n,r)}}let z_=0;const ki=new dn,vd=new ii,ca=new ee,Ei=new yl,fl=new yl,Ln=new ee;class Dn extends La{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:z_++}),this.uuid=Ds(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(s0(e)?d0:f0)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,n){return this.attributes[e]=n,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,n,r=0){this.groups.push({start:e,count:n,materialIndex:r})}clearGroups(){this.groups=[]}setDrawRange(e,n){this.drawRange.start=e,this.drawRange.count=n}applyMatrix4(e){const n=this.attributes.position;n!==void 0&&(n.applyMatrix4(e),n.needsUpdate=!0);const r=this.attributes.normal;if(r!==void 0){const c=new xt().getNormalMatrix(e);r.applyNormalMatrix(c),r.needsUpdate=!0}const a=this.attributes.tangent;return a!==void 0&&(a.transformDirection(e),a.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return ki.makeRotationFromQuaternion(e),this.applyMatrix4(ki),this}rotateX(e){return ki.makeRotationX(e),this.applyMatrix4(ki),this}rotateY(e){return ki.makeRotationY(e),this.applyMatrix4(ki),this}rotateZ(e){return ki.makeRotationZ(e),this.applyMatrix4(ki),this}translate(e,n,r){return ki.makeTranslation(e,n,r),this.applyMatrix4(ki),this}scale(e,n,r){return ki.makeScale(e,n,r),this.applyMatrix4(ki),this}lookAt(e){return vd.lookAt(e),vd.updateMatrix(),this.applyMatrix4(vd.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ca).negate(),this.translate(ca.x,ca.y,ca.z),this}setFromPoints(e){const n=this.getAttribute("position");if(n===void 0){const r=[];for(let a=0,c=e.length;a<c;a++){const f=e[a];r.push(f.x,f.y,f.z||0)}this.setAttribute("position",new or(r,3))}else{const r=Math.min(e.length,n.count);for(let a=0;a<r;a++){const c=e[a];n.setXYZ(a,c.x,c.y,c.z||0)}e.length>n.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),n.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new yl);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new ee(-1/0,-1/0,-1/0),new ee(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),n)for(let r=0,a=n.length;r<a;r++){const c=n[r];Ei.setFromBufferAttribute(c),this.morphTargetsRelative?(Ln.addVectors(this.boundingBox.min,Ei.min),this.boundingBox.expandByPoint(Ln),Ln.addVectors(this.boundingBox.max,Ei.max),this.boundingBox.expandByPoint(Ln)):(this.boundingBox.expandByPoint(Ei.min),this.boundingBox.expandByPoint(Ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new _u);const e=this.attributes.position,n=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new ee,1/0);return}if(e){const r=this.boundingSphere.center;if(Ei.setFromBufferAttribute(e),n)for(let c=0,f=n.length;c<f;c++){const u=n[c];fl.setFromBufferAttribute(u),this.morphTargetsRelative?(Ln.addVectors(Ei.min,fl.min),Ei.expandByPoint(Ln),Ln.addVectors(Ei.max,fl.max),Ei.expandByPoint(Ln)):(Ei.expandByPoint(fl.min),Ei.expandByPoint(fl.max))}Ei.getCenter(r);let a=0;for(let c=0,f=e.count;c<f;c++)Ln.fromBufferAttribute(e,c),a=Math.max(a,r.distanceToSquared(Ln));if(n)for(let c=0,f=n.length;c<f;c++){const u=n[c],h=this.morphTargetsRelative;for(let p=0,v=u.count;p<v;p++)Ln.fromBufferAttribute(u,p),h&&(ca.fromBufferAttribute(e,p),Ln.add(ca)),a=Math.max(a,r.distanceToSquared(Ln))}this.boundingSphere.radius=Math.sqrt(a),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,n=this.attributes;if(e===null||n.position===void 0||n.normal===void 0||n.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const r=n.position,a=n.normal,c=n.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new wi(new Float32Array(4*r.count),4));const f=this.getAttribute("tangent"),u=[],h=[];for(let $=0;$<r.count;$++)u[$]=new ee,h[$]=new ee;const p=new ee,v=new ee,x=new ee,y=new It,S=new It,T=new It,E=new ee,_=new ee;function g($,L,b){p.fromBufferAttribute(r,$),v.fromBufferAttribute(r,L),x.fromBufferAttribute(r,b),y.fromBufferAttribute(c,$),S.fromBufferAttribute(c,L),T.fromBufferAttribute(c,b),v.sub(p),x.sub(p),S.sub(y),T.sub(y);const U=1/(S.x*T.y-T.x*S.y);isFinite(U)&&(E.copy(v).multiplyScalar(T.y).addScaledVector(x,-S.y).multiplyScalar(U),_.copy(x).multiplyScalar(S.x).addScaledVector(v,-T.x).multiplyScalar(U),u[$].add(E),u[L].add(E),u[b].add(E),h[$].add(_),h[L].add(_),h[b].add(_))}let F=this.groups;F.length===0&&(F=[{start:0,count:e.count}]);for(let $=0,L=F.length;$<L;++$){const b=F[$],U=b.start,N=b.count;for(let I=U,ae=U+N;I<ae;I+=3)g(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const D=new ee,A=new ee,G=new ee,O=new ee;function z($){G.fromBufferAttribute(a,$),O.copy(G);const L=u[$];D.copy(L),D.sub(G.multiplyScalar(G.dot(L))).normalize(),A.crossVectors(O,L);const U=A.dot(h[$])<0?-1:1;f.setXYZW($,D.x,D.y,D.z,U)}for(let $=0,L=F.length;$<L;++$){const b=F[$],U=b.start,N=b.count;for(let I=U,ae=U+N;I<ae;I+=3)z(e.getX(I+0)),z(e.getX(I+1)),z(e.getX(I+2))}}computeVertexNormals(){const e=this.index,n=this.getAttribute("position");if(n!==void 0){let r=this.getAttribute("normal");if(r===void 0)r=new wi(new Float32Array(n.count*3),3),this.setAttribute("normal",r);else for(let y=0,S=r.count;y<S;y++)r.setXYZ(y,0,0,0);const a=new ee,c=new ee,f=new ee,u=new ee,h=new ee,p=new ee,v=new ee,x=new ee;if(e)for(let y=0,S=e.count;y<S;y+=3){const T=e.getX(y+0),E=e.getX(y+1),_=e.getX(y+2);a.fromBufferAttribute(n,T),c.fromBufferAttribute(n,E),f.fromBufferAttribute(n,_),v.subVectors(f,c),x.subVectors(a,c),v.cross(x),u.fromBufferAttribute(r,T),h.fromBufferAttribute(r,E),p.fromBufferAttribute(r,_),u.add(v),h.add(v),p.add(v),r.setXYZ(T,u.x,u.y,u.z),r.setXYZ(E,h.x,h.y,h.z),r.setXYZ(_,p.x,p.y,p.z)}else for(let y=0,S=n.count;y<S;y+=3)a.fromBufferAttribute(n,y+0),c.fromBufferAttribute(n,y+1),f.fromBufferAttribute(n,y+2),v.subVectors(f,c),x.subVectors(a,c),v.cross(x),r.setXYZ(y+0,v.x,v.y,v.z),r.setXYZ(y+1,v.x,v.y,v.z),r.setXYZ(y+2,v.x,v.y,v.z);this.normalizeNormals(),r.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let n=0,r=e.count;n<r;n++)Ln.fromBufferAttribute(e,n),Ln.normalize(),e.setXYZ(n,Ln.x,Ln.y,Ln.z)}toNonIndexed(){function e(u,h){const p=u.array,v=u.itemSize,x=u.normalized,y=new p.constructor(h.length*v);let S=0,T=0;for(let E=0,_=h.length;E<_;E++){u.isInterleavedBufferAttribute?S=h[E]*u.data.stride+u.offset:S=h[E]*v;for(let g=0;g<v;g++)y[T++]=p[S++]}return new wi(y,v,x)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const n=new Dn,r=this.index.array,a=this.attributes;for(const u in a){const h=a[u],p=e(h,r);n.setAttribute(u,p)}const c=this.morphAttributes;for(const u in c){const h=[],p=c[u];for(let v=0,x=p.length;v<x;v++){const y=p[v],S=e(y,r);h.push(S)}n.morphAttributes[u]=h}n.morphTargetsRelative=this.morphTargetsRelative;const f=this.groups;for(let u=0,h=f.length;u<h;u++){const p=f[u];n.addGroup(p.start,p.count,p.materialIndex)}return n}toJSON(){const e={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const h=this.parameters;for(const p in h)h[p]!==void 0&&(e[p]=h[p]);return e}e.data={attributes:{}};const n=this.index;n!==null&&(e.data.index={type:n.array.constructor.name,array:Array.prototype.slice.call(n.array)});const r=this.attributes;for(const h in r){const p=r[h];e.data.attributes[h]=p.toJSON(e.data)}const a={};let c=!1;for(const h in this.morphAttributes){const p=this.morphAttributes[h],v=[];for(let x=0,y=p.length;x<y;x++){const S=p[x];v.push(S.toJSON(e.data))}v.length>0&&(a[h]=v,c=!0)}c&&(e.data.morphAttributes=a,e.data.morphTargetsRelative=this.morphTargetsRelative);const f=this.groups;f.length>0&&(e.data.groups=JSON.parse(JSON.stringify(f)));const u=this.boundingSphere;return u!==null&&(e.data.boundingSphere={center:u.center.toArray(),radius:u.radius}),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const n={};this.name=e.name;const r=e.index;r!==null&&this.setIndex(r.clone(n));const a=e.attributes;for(const p in a){const v=a[p];this.setAttribute(p,v.clone(n))}const c=e.morphAttributes;for(const p in c){const v=[],x=c[p];for(let y=0,S=x.length;y<S;y++)v.push(x[y].clone(n));this.morphAttributes[p]=v}this.morphTargetsRelative=e.morphTargetsRelative;const f=e.groups;for(let p=0,v=f.length;p<v;p++){const x=f[p];this.addGroup(x.start,x.count,x.materialIndex)}const u=e.boundingBox;u!==null&&(this.boundingBox=u.clone());const h=e.boundingSphere;return h!==null&&(this.boundingSphere=h.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const ig=new dn,ao=new l0,kc=new _u,rg=new ee,Bc=new ee,zc=new ee,Hc=new ee,_d=new ee,Vc=new ee,sg=new ee,Gc=new ee;class ni extends ii{constructor(e=new Dn,n=new _a){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const n=this.geometry.morphAttributes,r=Object.keys(n);if(r.length>0){const a=n[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,f=a.length;c<f;c++){const u=a[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=c}}}}getVertexPosition(e,n){const r=this.geometry,a=r.attributes.position,c=r.morphAttributes.position,f=r.morphTargetsRelative;n.fromBufferAttribute(a,e);const u=this.morphTargetInfluences;if(c&&u){Vc.set(0,0,0);for(let h=0,p=c.length;h<p;h++){const v=u[h],x=c[h];v!==0&&(_d.fromBufferAttribute(x,e),f?Vc.addScaledVector(_d,v):Vc.addScaledVector(_d.sub(n),v))}n.add(Vc)}return n}raycast(e,n){const r=this.geometry,a=this.material,c=this.matrixWorld;a!==void 0&&(r.boundingSphere===null&&r.computeBoundingSphere(),kc.copy(r.boundingSphere),kc.applyMatrix4(c),ao.copy(e.ray).recast(e.near),!(kc.containsPoint(ao.origin)===!1&&(ao.intersectSphere(kc,rg)===null||ao.origin.distanceToSquared(rg)>(e.far-e.near)**2))&&(ig.copy(c).invert(),ao.copy(e.ray).applyMatrix4(ig),!(r.boundingBox!==null&&ao.intersectsBox(r.boundingBox)===!1)&&this._computeIntersections(e,n,ao)))}_computeIntersections(e,n,r){let a;const c=this.geometry,f=this.material,u=c.index,h=c.attributes.position,p=c.attributes.uv,v=c.attributes.uv1,x=c.attributes.normal,y=c.groups,S=c.drawRange;if(u!==null)if(Array.isArray(f))for(let T=0,E=y.length;T<E;T++){const _=y[T],g=f[_.materialIndex],F=Math.max(_.start,S.start),D=Math.min(u.count,Math.min(_.start+_.count,S.start+S.count));for(let A=F,G=D;A<G;A+=3){const O=u.getX(A),z=u.getX(A+1),$=u.getX(A+2);a=Wc(this,g,e,r,p,v,x,O,z,$),a&&(a.faceIndex=Math.floor(A/3),a.face.materialIndex=_.materialIndex,n.push(a))}}else{const T=Math.max(0,S.start),E=Math.min(u.count,S.start+S.count);for(let _=T,g=E;_<g;_+=3){const F=u.getX(_),D=u.getX(_+1),A=u.getX(_+2);a=Wc(this,f,e,r,p,v,x,F,D,A),a&&(a.faceIndex=Math.floor(_/3),n.push(a))}}else if(h!==void 0)if(Array.isArray(f))for(let T=0,E=y.length;T<E;T++){const _=y[T],g=f[_.materialIndex],F=Math.max(_.start,S.start),D=Math.min(h.count,Math.min(_.start+_.count,S.start+S.count));for(let A=F,G=D;A<G;A+=3){const O=A,z=A+1,$=A+2;a=Wc(this,g,e,r,p,v,x,O,z,$),a&&(a.faceIndex=Math.floor(A/3),a.face.materialIndex=_.materialIndex,n.push(a))}}else{const T=Math.max(0,S.start),E=Math.min(h.count,S.start+S.count);for(let _=T,g=E;_<g;_+=3){const F=_,D=_+1,A=_+2;a=Wc(this,f,e,r,p,v,x,F,D,A),a&&(a.faceIndex=Math.floor(_/3),n.push(a))}}}}function H_(s,e,n,r,a,c,f,u){let h;if(e.side===pi?h=r.intersectTriangle(f,c,a,!0,u):h=r.intersectTriangle(a,c,f,e.side===Is,u),h===null)return null;Gc.copy(u),Gc.applyMatrix4(s.matrixWorld);const p=n.ray.origin.distanceTo(Gc);return p<n.near||p>n.far?null:{distance:p,point:Gc.clone(),object:s}}function Wc(s,e,n,r,a,c,f,u,h,p){s.getVertexPosition(u,Bc),s.getVertexPosition(h,zc),s.getVertexPosition(p,Hc);const v=H_(s,e,n,r,Bc,zc,Hc,sg);if(v){const x=new ee;Vi.getBarycoord(sg,Bc,zc,Hc,x),a&&(v.uv=Vi.getInterpolatedAttribute(a,u,h,p,x,new It)),c&&(v.uv1=Vi.getInterpolatedAttribute(c,u,h,p,x,new It)),f&&(v.normal=Vi.getInterpolatedAttribute(f,u,h,p,x,new ee),v.normal.dot(r.direction)>0&&v.normal.multiplyScalar(-1));const y={a:u,b:h,c:p,normal:new ee,materialIndex:0};Vi.getNormal(Bc,zc,Hc,y.normal),v.face=y,v.barycoord=x}return v}class Sl extends Dn{constructor(e=1,n=1,r=1,a=1,c=1,f=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:n,depth:r,widthSegments:a,heightSegments:c,depthSegments:f};const u=this;a=Math.floor(a),c=Math.floor(c),f=Math.floor(f);const h=[],p=[],v=[],x=[];let y=0,S=0;T("z","y","x",-1,-1,r,n,e,f,c,0),T("z","y","x",1,-1,r,n,-e,f,c,1),T("x","z","y",1,1,e,r,n,a,f,2),T("x","z","y",1,-1,e,r,-n,a,f,3),T("x","y","z",1,-1,e,n,r,a,c,4),T("x","y","z",-1,-1,e,n,-r,a,c,5),this.setIndex(h),this.setAttribute("position",new or(p,3)),this.setAttribute("normal",new or(v,3)),this.setAttribute("uv",new or(x,2));function T(E,_,g,F,D,A,G,O,z,$,L){const b=A/z,U=G/$,N=A/2,I=G/2,ae=O/2,re=z+1,ce=$+1;let fe=0,H=0;const te=new ee;for(let se=0;se<ce;se++){const B=se*U-I;for(let oe=0;oe<re;oe++){const be=oe*b-N;te[E]=be*F,te[_]=B*D,te[g]=ae,p.push(te.x,te.y,te.z),te[E]=0,te[_]=0,te[g]=O>0?1:-1,v.push(te.x,te.y,te.z),x.push(oe/z),x.push(1-se/$),fe+=1}}for(let se=0;se<$;se++)for(let B=0;B<z;B++){const oe=y+B+re*se,be=y+B+re*(se+1),Q=y+(B+1)+re*(se+1),me=y+(B+1)+re*se;h.push(oe,be,me),h.push(be,Q,me),H+=6}u.addGroup(S,H,L),S+=H,y+=fe}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Sl(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Pa(s){const e={};for(const n in s){e[n]={};for(const r in s[n]){const a=s[n][r];a&&(a.isColor||a.isMatrix3||a.isMatrix4||a.isVector2||a.isVector3||a.isVector4||a.isTexture||a.isQuaternion)?a.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[n][r]=null):e[n][r]=a.clone():Array.isArray(a)?e[n][r]=a.slice():e[n][r]=a}}return e}function ti(s){const e={};for(let n=0;n<s.length;n++){const r=Pa(s[n]);for(const a in r)e[a]=r[a]}return e}function V_(s){const e=[];for(let n=0;n<s.length;n++)e.push(s[n].clone());return e}function h0(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:Ft.workingColorSpace}const G_={clone:Pa,merge:ti};var W_=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,X_=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Sr extends Da{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=W_,this.fragmentShader=X_,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Pa(e.uniforms),this.uniformsGroups=V_(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const n=super.toJSON(e);n.glslVersion=this.glslVersion,n.uniforms={};for(const a in this.uniforms){const f=this.uniforms[a].value;f&&f.isTexture?n.uniforms[a]={type:"t",value:f.toJSON(e).uuid}:f&&f.isColor?n.uniforms[a]={type:"c",value:f.getHex()}:f&&f.isVector2?n.uniforms[a]={type:"v2",value:f.toArray()}:f&&f.isVector3?n.uniforms[a]={type:"v3",value:f.toArray()}:f&&f.isVector4?n.uniforms[a]={type:"v4",value:f.toArray()}:f&&f.isMatrix3?n.uniforms[a]={type:"m3",value:f.toArray()}:f&&f.isMatrix4?n.uniforms[a]={type:"m4",value:f.toArray()}:n.uniforms[a]={value:f}}Object.keys(this.defines).length>0&&(n.defines=this.defines),n.vertexShader=this.vertexShader,n.fragmentShader=this.fragmentShader,n.lights=this.lights,n.clipping=this.clipping;const r={};for(const a in this.extensions)this.extensions[a]===!0&&(r[a]=!0);return Object.keys(r).length>0&&(n.extensions=r),n}}class p0 extends ii{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new dn,this.projectionMatrix=new dn,this.projectionMatrixInverse=new dn,this.coordinateSystem=Xr}copy(e,n){return super.copy(e,n),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,n){super.updateWorldMatrix(e,n),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ws=new ee,og=new It,ag=new It;class zi extends p0{constructor(e=50,n=1,r=.1,a=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=r,this.far=a,this.focus=10,this.aspect=n,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const n=.5*this.getFilmHeight()/e;this.fov=yh*2*Math.atan(n),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Jf*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return yh*2*Math.atan(Math.tan(Jf*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,n,r){ws.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ws.x,ws.y).multiplyScalar(-e/ws.z),ws.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),r.set(ws.x,ws.y).multiplyScalar(-e/ws.z)}getViewSize(e,n){return this.getViewBounds(e,og,ag),n.subVectors(ag,og)}setViewOffset(e,n,r,a,c,f){this.aspect=e/n,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=r,this.view.offsetY=a,this.view.width=c,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let n=e*Math.tan(Jf*.5*this.fov)/this.zoom,r=2*n,a=this.aspect*r,c=-.5*a;const f=this.view;if(this.view!==null&&this.view.enabled){const h=f.fullWidth,p=f.fullHeight;c+=f.offsetX*a/h,n-=f.offsetY*r/p,a*=f.width/h,r*=f.height/p}const u=this.filmOffset;u!==0&&(c+=e*u/this.getFilmWidth()),this.projectionMatrix.makePerspective(c,c+a,n,n-r,e,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.fov=this.fov,n.object.zoom=this.zoom,n.object.near=this.near,n.object.far=this.far,n.object.focus=this.focus,n.object.aspect=this.aspect,this.view!==null&&(n.object.view=Object.assign({},this.view)),n.object.filmGauge=this.filmGauge,n.object.filmOffset=this.filmOffset,n}}const ua=-90,fa=1;class j_ extends ii{constructor(e,n,r){super(),this.type="CubeCamera",this.renderTarget=r,this.coordinateSystem=null,this.activeMipmapLevel=0;const a=new zi(ua,fa,e,n);a.layers=this.layers,this.add(a);const c=new zi(ua,fa,e,n);c.layers=this.layers,this.add(c);const f=new zi(ua,fa,e,n);f.layers=this.layers,this.add(f);const u=new zi(ua,fa,e,n);u.layers=this.layers,this.add(u);const h=new zi(ua,fa,e,n);h.layers=this.layers,this.add(h);const p=new zi(ua,fa,e,n);p.layers=this.layers,this.add(p)}updateCoordinateSystem(){const e=this.coordinateSystem,n=this.children.concat(),[r,a,c,f,u,h]=n;for(const p of n)this.remove(p);if(e===Xr)r.up.set(0,1,0),r.lookAt(1,0,0),a.up.set(0,1,0),a.lookAt(-1,0,0),c.up.set(0,0,-1),c.lookAt(0,1,0),f.up.set(0,0,1),f.lookAt(0,-1,0),u.up.set(0,1,0),u.lookAt(0,0,1),h.up.set(0,1,0),h.lookAt(0,0,-1);else if(e===uu)r.up.set(0,-1,0),r.lookAt(-1,0,0),a.up.set(0,-1,0),a.lookAt(1,0,0),c.up.set(0,0,1),c.lookAt(0,1,0),f.up.set(0,0,-1),f.lookAt(0,-1,0),u.up.set(0,-1,0),u.lookAt(0,0,1),h.up.set(0,-1,0),h.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const p of n)this.add(p),p.updateMatrixWorld()}update(e,n){this.parent===null&&this.updateMatrixWorld();const{renderTarget:r,activeMipmapLevel:a}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[c,f,u,h,p,v]=this.children,x=e.getRenderTarget(),y=e.getActiveCubeFace(),S=e.getActiveMipmapLevel(),T=e.xr.enabled;e.xr.enabled=!1;const E=r.texture.generateMipmaps;r.texture.generateMipmaps=!1,e.setRenderTarget(r,0,a),e.render(n,c),e.setRenderTarget(r,1,a),e.render(n,f),e.setRenderTarget(r,2,a),e.render(n,u),e.setRenderTarget(r,3,a),e.render(n,h),e.setRenderTarget(r,4,a),e.render(n,p),r.texture.generateMipmaps=E,e.setRenderTarget(r,5,a),e.render(n,v),e.setRenderTarget(x,y,S),e.xr.enabled=T,r.texture.needsPMREMUpdate=!0}}class m0 extends Yn{constructor(e,n,r,a,c,f,u,h,p,v){e=e!==void 0?e:[],n=n!==void 0?n:wa,super(e,n,r,a,c,f,u,h,p,v),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Y_ extends yo{constructor(e=1,n={}){super(e,e,n),this.isWebGLCubeRenderTarget=!0;const r={width:e,height:e,depth:1},a=[r,r,r,r,r,r];this.texture=new m0(a,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=n.generateMipmaps!==void 0?n.generateMipmaps:!1,this.texture.minFilter=n.minFilter!==void 0?n.minFilter:Gi}fromEquirectangularTexture(e,n){this.texture.type=n.type,this.texture.colorSpace=n.colorSpace,this.texture.generateMipmaps=n.generateMipmaps,this.texture.minFilter=n.minFilter,this.texture.magFilter=n.magFilter;const r={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},a=new Sl(5,5,5),c=new Sr({name:"CubemapFromEquirect",uniforms:Pa(r.uniforms),vertexShader:r.vertexShader,fragmentShader:r.fragmentShader,side:pi,blending:Ps});c.uniforms.tEquirect.value=n;const f=new ni(a,c),u=n.minFilter;return n.minFilter===_o&&(n.minFilter=Gi),new j_(1,10,this).update(e,f),n.minFilter=u,f.geometry.dispose(),f.material.dispose(),this}clear(e,n,r,a){const c=e.getRenderTarget();for(let f=0;f<6;f++)e.setRenderTarget(this,f),e.clear(n,r,a);e.setRenderTarget(c)}}class q_ extends ii{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qr,this.environmentIntensity=1,this.environmentRotation=new qr,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,n){return super.copy(e,n),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const n=super.toJSON(e);return this.fog!==null&&(n.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(n.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(n.object.backgroundIntensity=this.backgroundIntensity),n.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(n.object.environmentIntensity=this.environmentIntensity),n.object.environmentRotation=this.environmentRotation.toArray(),n}}class $_{constructor(e,n){this.isInterleavedBuffer=!0,this.array=e,this.stride=n,this.count=e!==void 0?e.length/n:0,this.usage=xh,this.updateRanges=[],this.version=0,this.uuid=Ds()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,n){this.updateRanges.push({start:e,count:n})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,n,r){e*=this.stride,r*=n.stride;for(let a=0,c=this.stride;a<c;a++)this.array[e+a]=n.array[r+a];return this}set(e,n=0){return this.array.set(e,n),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ds()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const n=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),r=new this.constructor(n,this.stride);return r.setUsage(this.usage),r}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ds()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Qn=new ee;class du{constructor(e,n,r,a=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=n,this.offset=r,this.normalized=a}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let n=0,r=this.data.count;n<r;n++)Qn.fromBufferAttribute(this,n),Qn.applyMatrix4(e),this.setXYZ(n,Qn.x,Qn.y,Qn.z);return this}applyNormalMatrix(e){for(let n=0,r=this.count;n<r;n++)Qn.fromBufferAttribute(this,n),Qn.applyNormalMatrix(e),this.setXYZ(n,Qn.x,Qn.y,Qn.z);return this}transformDirection(e){for(let n=0,r=this.count;n<r;n++)Qn.fromBufferAttribute(this,n),Qn.transformDirection(e),this.setXYZ(n,Qn.x,Qn.y,Qn.z);return this}getComponent(e,n){let r=this.array[e*this.data.stride+this.offset+n];return this.normalized&&(r=_r(r,this.array)),r}setComponent(e,n,r){return this.normalized&&(r=Ht(r,this.array)),this.data.array[e*this.data.stride+this.offset+n]=r,this}setX(e,n){return this.normalized&&(n=Ht(n,this.array)),this.data.array[e*this.data.stride+this.offset]=n,this}setY(e,n){return this.normalized&&(n=Ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+1]=n,this}setZ(e,n){return this.normalized&&(n=Ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+2]=n,this}setW(e,n){return this.normalized&&(n=Ht(n,this.array)),this.data.array[e*this.data.stride+this.offset+3]=n,this}getX(e){let n=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(n=_r(n,this.array)),n}getY(e){let n=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(n=_r(n,this.array)),n}getZ(e){let n=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(n=_r(n,this.array)),n}getW(e){let n=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(n=_r(n,this.array)),n}setXY(e,n,r){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=r,this}setXYZ(e,n,r,a){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array),a=Ht(a,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=r,this.data.array[e+2]=a,this}setXYZW(e,n,r,a,c){return e=e*this.data.stride+this.offset,this.normalized&&(n=Ht(n,this.array),r=Ht(r,this.array),a=Ht(a,this.array),c=Ht(c,this.array)),this.data.array[e+0]=n,this.data.array[e+1]=r,this.data.array[e+2]=a,this.data.array[e+3]=c,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let c=0;c<this.itemSize;c++)n.push(this.data.array[a+c])}return new wi(new this.array.constructor(n),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new du(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const n=[];for(let r=0;r<this.count;r++){const a=r*this.data.stride+this.offset;for(let c=0;c<this.itemSize;c++)n.push(this.data.array[a+c])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:n,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class au extends Da{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ct(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let da;const dl=new ee,ha=new ee,pa=new ee,ma=new It,hl=new It,g0=new dn,Xc=new ee,pl=new ee,jc=new ee,lg=new It,xd=new It,cg=new It;class yd extends ii{constructor(e=new au){if(super(),this.isSprite=!0,this.type="Sprite",da===void 0){da=new Dn;const n=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),r=new $_(n,5);da.setIndex([0,1,2,0,2,3]),da.setAttribute("position",new du(r,3,0,!1)),da.setAttribute("uv",new du(r,2,3,!1))}this.geometry=da,this.material=e,this.center=new It(.5,.5)}raycast(e,n){e.camera===null&&console.error('THREE.Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ha.setFromMatrixScale(this.matrixWorld),g0.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),pa.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ha.multiplyScalar(-pa.z);const r=this.material.rotation;let a,c;r!==0&&(c=Math.cos(r),a=Math.sin(r));const f=this.center;Yc(Xc.set(-.5,-.5,0),pa,f,ha,a,c),Yc(pl.set(.5,-.5,0),pa,f,ha,a,c),Yc(jc.set(.5,.5,0),pa,f,ha,a,c),lg.set(0,0),xd.set(1,0),cg.set(1,1);let u=e.ray.intersectTriangle(Xc,pl,jc,!1,dl);if(u===null&&(Yc(pl.set(-.5,.5,0),pa,f,ha,a,c),xd.set(0,1),u=e.ray.intersectTriangle(Xc,jc,pl,!1,dl),u===null))return;const h=e.ray.origin.distanceTo(dl);h<e.near||h>e.far||n.push({distance:h,point:dl.clone(),uv:Vi.getInterpolation(dl,Xc,pl,jc,lg,xd,cg,new It),face:null,object:this})}copy(e,n){return super.copy(e,n),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function Yc(s,e,n,r,a,c){ma.subVectors(s,n).addScalar(.5).multiply(r),a!==void 0?(hl.x=c*ma.x-a*ma.y,hl.y=a*ma.x+c*ma.y):hl.copy(ma),s.copy(e),s.x+=hl.x,s.y+=hl.y,s.applyMatrix4(g0)}class K_ extends Yn{constructor(e=null,n=1,r=1,a,c,f,u,h,p=Ti,v=Ti,x,y){super(null,f,u,h,p,v,a,c,x,y),this.isDataTexture=!0,this.image={data:e,width:n,height:r},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Sd=new ee,Z_=new ee,J_=new xt;class fo{constructor(e=new ee(1,0,0),n=0){this.isPlane=!0,this.normal=e,this.constant=n}set(e,n){return this.normal.copy(e),this.constant=n,this}setComponents(e,n,r,a){return this.normal.set(e,n,r),this.constant=a,this}setFromNormalAndCoplanarPoint(e,n){return this.normal.copy(e),this.constant=-n.dot(this.normal),this}setFromCoplanarPoints(e,n,r){const a=Sd.subVectors(r,n).cross(Z_.subVectors(e,n)).normalize();return this.setFromNormalAndCoplanarPoint(a,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,n){return n.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,n){const r=e.delta(Sd),a=this.normal.dot(r);if(a===0)return this.distanceToPoint(e.start)===0?n.copy(e.start):null;const c=-(e.start.dot(this.normal)+this.constant)/a;return c<0||c>1?null:n.copy(e.start).addScaledVector(r,c)}intersectsLine(e){const n=this.distanceToPoint(e.start),r=this.distanceToPoint(e.end);return n<0&&r>0||r<0&&n>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,n){const r=n||J_.getNormalMatrix(e),a=this.coplanarPoint(Sd).applyMatrix4(e),c=this.normal.applyMatrix3(r).normalize();return this.constant=-a.dot(c),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const lo=new _u,qc=new ee;class v0{constructor(e=new fo,n=new fo,r=new fo,a=new fo,c=new fo,f=new fo){this.planes=[e,n,r,a,c,f]}set(e,n,r,a,c,f){const u=this.planes;return u[0].copy(e),u[1].copy(n),u[2].copy(r),u[3].copy(a),u[4].copy(c),u[5].copy(f),this}copy(e){const n=this.planes;for(let r=0;r<6;r++)n[r].copy(e.planes[r]);return this}setFromProjectionMatrix(e,n=Xr){const r=this.planes,a=e.elements,c=a[0],f=a[1],u=a[2],h=a[3],p=a[4],v=a[5],x=a[6],y=a[7],S=a[8],T=a[9],E=a[10],_=a[11],g=a[12],F=a[13],D=a[14],A=a[15];if(r[0].setComponents(h-c,y-p,_-S,A-g).normalize(),r[1].setComponents(h+c,y+p,_+S,A+g).normalize(),r[2].setComponents(h+f,y+v,_+T,A+F).normalize(),r[3].setComponents(h-f,y-v,_-T,A-F).normalize(),r[4].setComponents(h-u,y-x,_-E,A-D).normalize(),n===Xr)r[5].setComponents(h+u,y+x,_+E,A+D).normalize();else if(n===uu)r[5].setComponents(u,x,E,D).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+n);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),lo.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const n=e.geometry;n.boundingSphere===null&&n.computeBoundingSphere(),lo.copy(n.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(lo)}intersectsSprite(e){return lo.center.set(0,0,0),lo.radius=.7071067811865476,lo.applyMatrix4(e.matrixWorld),this.intersectsSphere(lo)}intersectsSphere(e){const n=this.planes,r=e.center,a=-e.radius;for(let c=0;c<6;c++)if(n[c].distanceToPoint(r)<a)return!1;return!0}intersectsBox(e){const n=this.planes;for(let r=0;r<6;r++){const a=n[r];if(qc.x=a.normal.x>0?e.max.x:e.min.x,qc.y=a.normal.y>0?e.max.y:e.min.y,qc.z=a.normal.z>0?e.max.z:e.min.z,a.distanceToPoint(qc)<0)return!1}return!0}containsPoint(e){const n=this.planes;for(let r=0;r<6;r++)if(n[r].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class ho extends Da{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ct(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const hu=new ee,pu=new ee,ug=new dn,ml=new l0,$c=new _u,Md=new ee,fg=new ee;class Rs extends ii{constructor(e=new Dn,n=new ho){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=n,this.updateMorphTargets()}copy(e,n){return super.copy(e,n),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const n=e.attributes.position,r=[0];for(let a=1,c=n.count;a<c;a++)hu.fromBufferAttribute(n,a-1),pu.fromBufferAttribute(n,a),r[a]=r[a-1],r[a]+=hu.distanceTo(pu);e.setAttribute("lineDistance",new or(r,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,n){const r=this.geometry,a=this.matrixWorld,c=e.params.Line.threshold,f=r.drawRange;if(r.boundingSphere===null&&r.computeBoundingSphere(),$c.copy(r.boundingSphere),$c.applyMatrix4(a),$c.radius+=c,e.ray.intersectsSphere($c)===!1)return;ug.copy(a).invert(),ml.copy(e.ray).applyMatrix4(ug);const u=c/((this.scale.x+this.scale.y+this.scale.z)/3),h=u*u,p=this.isLineSegments?2:1,v=r.index,y=r.attributes.position;if(v!==null){const S=Math.max(0,f.start),T=Math.min(v.count,f.start+f.count);for(let E=S,_=T-1;E<_;E+=p){const g=v.getX(E),F=v.getX(E+1),D=Kc(this,e,ml,h,g,F);D&&n.push(D)}if(this.isLineLoop){const E=v.getX(T-1),_=v.getX(S),g=Kc(this,e,ml,h,E,_);g&&n.push(g)}}else{const S=Math.max(0,f.start),T=Math.min(y.count,f.start+f.count);for(let E=S,_=T-1;E<_;E+=p){const g=Kc(this,e,ml,h,E,E+1);g&&n.push(g)}if(this.isLineLoop){const E=Kc(this,e,ml,h,T-1,S);E&&n.push(E)}}}updateMorphTargets(){const n=this.geometry.morphAttributes,r=Object.keys(n);if(r.length>0){const a=n[r[0]];if(a!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let c=0,f=a.length;c<f;c++){const u=a[c].name||String(c);this.morphTargetInfluences.push(0),this.morphTargetDictionary[u]=c}}}}}function Kc(s,e,n,r,a,c){const f=s.geometry.attributes.position;if(hu.fromBufferAttribute(f,a),pu.fromBufferAttribute(f,c),n.distanceSqToSegment(hu,pu,Md,fg)>r)return;Md.applyMatrix4(s.matrixWorld);const h=e.ray.origin.distanceTo(Md);if(!(h<e.near||h>e.far))return{distance:h,point:fg.clone().applyMatrix4(s.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:s}}class Zc extends ii{constructor(){super(),this.isGroup=!0,this.type="Group"}}class Ed extends Yn{constructor(e,n,r,a,c,f,u,h,p){super(e,n,r,a,c,f,u,h,p),this.isCanvasTexture=!0,this.needsUpdate=!0}}class _0 extends Yn{constructor(e,n,r,a,c,f,u,h,p,v=Ma){if(v!==Ma&&v!==ba)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");r===void 0&&v===Ma&&(r=xo),r===void 0&&v===ba&&(r=Aa),super(null,a,c,f,u,h,v,r,p),this.isDepthTexture=!0,this.image={width:e,height:n},this.magFilter=u!==void 0?u:Ti,this.minFilter=h!==void 0?h:Ti,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.compareFunction=e.compareFunction,this}toJSON(e){const n=super.toJSON(e);return this.compareFunction!==null&&(n.compareFunction=this.compareFunction),n}}class mu extends Dn{constructor(e=1,n=32,r=0,a=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:n,thetaStart:r,thetaLength:a},n=Math.max(3,n);const c=[],f=[],u=[],h=[],p=new ee,v=new It;f.push(0,0,0),u.push(0,0,1),h.push(.5,.5);for(let x=0,y=3;x<=n;x++,y+=3){const S=r+x/n*a;p.x=e*Math.cos(S),p.y=e*Math.sin(S),f.push(p.x,p.y,p.z),u.push(0,0,1),v.x=(f[y]/e+1)/2,v.y=(f[y+1]/e+1)/2,h.push(v.x,v.y)}for(let x=1;x<=n;x++)c.push(x,x+1,0);this.setIndex(c),this.setAttribute("position",new or(f,3)),this.setAttribute("normal",new or(u,3)),this.setAttribute("uv",new or(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mu(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Cs extends Dn{constructor(e=1,n=1,r=1,a=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:n,widthSegments:r,heightSegments:a};const c=e/2,f=n/2,u=Math.floor(r),h=Math.floor(a),p=u+1,v=h+1,x=e/u,y=n/h,S=[],T=[],E=[],_=[];for(let g=0;g<v;g++){const F=g*y-f;for(let D=0;D<p;D++){const A=D*x-c;T.push(A,-F,0),E.push(0,0,1),_.push(D/u),_.push(1-g/h)}}for(let g=0;g<h;g++)for(let F=0;F<u;F++){const D=F+p*g,A=F+p*(g+1),G=F+1+p*(g+1),O=F+1+p*g;S.push(D,A,O),S.push(A,G,O)}this.setIndex(S),this.setAttribute("position",new or(T,3)),this.setAttribute("normal",new or(E,3)),this.setAttribute("uv",new or(_,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Cs(e.width,e.height,e.widthSegments,e.heightSegments)}}class Q_ extends Da{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=u_,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class ex extends Da{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}class tx extends p0{constructor(e=-1,n=1,r=1,a=-1,c=.1,f=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=n,this.top=r,this.bottom=a,this.near=c,this.far=f,this.updateProjectionMatrix()}copy(e,n){return super.copy(e,n),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,n,r,a,c,f){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=n,this.view.offsetX=r,this.view.offsetY=a,this.view.width=c,this.view.height=f,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),n=(this.top-this.bottom)/(2*this.zoom),r=(this.right+this.left)/2,a=(this.top+this.bottom)/2;let c=r-e,f=r+e,u=a+n,h=a-n;if(this.view!==null&&this.view.enabled){const p=(this.right-this.left)/this.view.fullWidth/this.zoom,v=(this.top-this.bottom)/this.view.fullHeight/this.zoom;c+=p*this.view.offsetX,f=c+p*this.view.width,u-=v*this.view.offsetY,h=u-v*this.view.height}this.projectionMatrix.makeOrthographic(c,f,u,h,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const n=super.toJSON(e);return n.object.zoom=this.zoom,n.object.left=this.left,n.object.right=this.right,n.object.top=this.top,n.object.bottom=this.bottom,n.object.near=this.near,n.object.far=this.far,this.view!==null&&(n.object.view=Object.assign({},this.view)),n}}class nx extends zi{constructor(e=[]){super(),this.isArrayCamera=!0,this.cameras=e}}function dg(s,e,n,r){const a=ix(r);switch(n){case Jg:return s*e;case e0:return s*e;case t0:return s*e*2;case Ch:return s*e/a.components*a.byteLength;case Ph:return s*e/a.components*a.byteLength;case n0:return s*e*2/a.components*a.byteLength;case Lh:return s*e*2/a.components*a.byteLength;case Qg:return s*e*3/a.components*a.byteLength;case sr:return s*e*4/a.components*a.byteLength;case Dh:return s*e*4/a.components*a.byteLength;case nu:case iu:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ru:case su:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case qd:case Kd:return Math.max(s,16)*Math.max(e,8)/4;case Yd:case $d:return Math.max(s,8)*Math.max(e,8)/2;case Zd:case Jd:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Qd:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case eh:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case th:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case nh:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case ih:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case rh:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case sh:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case oh:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case ah:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case lh:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case ch:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case uh:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case fh:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case dh:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case hh:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case ou:case ph:case mh:return Math.ceil(s/4)*Math.ceil(e/4)*16;case i0:case gh:return Math.ceil(s/4)*Math.ceil(e/4)*8;case vh:case _h:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${n} format.`)}function ix(s){switch(s){case Yr:case $g:return{byteLength:1,components:1};case vl:case Kg:case _l:return{byteLength:2,components:1};case Ah:case bh:return{byteLength:2,components:4};case xo:case Rh:case yr:return{byteLength:4,components:1};case Zg:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:wh}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=wh);/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function x0(){let s=null,e=!1,n=null,r=null;function a(c,f){n(c,f),r=s.requestAnimationFrame(a)}return{start:function(){e!==!0&&n!==null&&(r=s.requestAnimationFrame(a),e=!0)},stop:function(){s.cancelAnimationFrame(r),e=!1},setAnimationLoop:function(c){n=c},setContext:function(c){s=c}}}function rx(s){const e=new WeakMap;function n(u,h){const p=u.array,v=u.usage,x=p.byteLength,y=s.createBuffer();s.bindBuffer(h,y),s.bufferData(h,p,v),u.onUploadCallback();let S;if(p instanceof Float32Array)S=s.FLOAT;else if(p instanceof Uint16Array)u.isFloat16BufferAttribute?S=s.HALF_FLOAT:S=s.UNSIGNED_SHORT;else if(p instanceof Int16Array)S=s.SHORT;else if(p instanceof Uint32Array)S=s.UNSIGNED_INT;else if(p instanceof Int32Array)S=s.INT;else if(p instanceof Int8Array)S=s.BYTE;else if(p instanceof Uint8Array)S=s.UNSIGNED_BYTE;else if(p instanceof Uint8ClampedArray)S=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+p);return{buffer:y,type:S,bytesPerElement:p.BYTES_PER_ELEMENT,version:u.version,size:x}}function r(u,h,p){const v=h.array,x=h.updateRanges;if(s.bindBuffer(p,u),x.length===0)s.bufferSubData(p,0,v);else{x.sort((S,T)=>S.start-T.start);let y=0;for(let S=1;S<x.length;S++){const T=x[y],E=x[S];E.start<=T.start+T.count+1?T.count=Math.max(T.count,E.start+E.count-T.start):(++y,x[y]=E)}x.length=y+1;for(let S=0,T=x.length;S<T;S++){const E=x[S];s.bufferSubData(p,E.start*v.BYTES_PER_ELEMENT,v,E.start,E.count)}h.clearUpdateRanges()}h.onUploadCallback()}function a(u){return u.isInterleavedBufferAttribute&&(u=u.data),e.get(u)}function c(u){u.isInterleavedBufferAttribute&&(u=u.data);const h=e.get(u);h&&(s.deleteBuffer(h.buffer),e.delete(u))}function f(u,h){if(u.isInterleavedBufferAttribute&&(u=u.data),u.isGLBufferAttribute){const v=e.get(u);(!v||v.version<u.version)&&e.set(u,{buffer:u.buffer,type:u.type,bytesPerElement:u.elementSize,version:u.version});return}const p=e.get(u);if(p===void 0)e.set(u,n(u,h));else if(p.version<u.version){if(p.size!==u.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");r(p.buffer,u,h),p.version=u.version}}return{get:a,remove:c,update:f}}var sx=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,ox=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ax=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,lx=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cx=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ux=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,fx=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,dx=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hx=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,px=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mx=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gx=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,vx=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,_x=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,xx=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,yx=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Sx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Mx=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Ex=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tx=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,wx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Rx=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Ax=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,bx=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Cx=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Px=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Lx=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dx=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ix=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ux=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Nx="gl_FragColor = linearToOutputTexel( gl_FragColor );",Fx=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ox=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,kx=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Bx=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,zx=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Hx=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Vx=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gx=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Wx=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Xx=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,jx=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Yx=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,qx=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,$x=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Kx=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Zx=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Jx=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qx=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,ey=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ty=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,ny=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,iy=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,ry=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,sy=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,oy=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ay=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,ly=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,cy=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,uy=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,fy=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,dy=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,hy=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,py=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,my=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,gy=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,vy=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,_y=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,xy=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,yy=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Sy=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,My=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Ey=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Ty=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,wy=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ry=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Ay=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,by=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Cy=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Py=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Ly=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Dy=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Iy=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Uy=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Ny=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Fy=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Oy=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ky=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,By=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,zy=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Hy=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Vy=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Gy=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Wy=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Xy=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,jy=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Yy=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,qy=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$y=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Ky=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Zy=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Jy=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Qy=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,eS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,nS=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,iS=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const rS=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,sS=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,oS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,aS=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cS=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,uS=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,fS=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,dS=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,hS=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,pS=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,mS=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gS=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,vS=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,_S=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,xS=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yS=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,SS=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,MS=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ES=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,TS=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,wS=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,RS=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,AS=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,bS=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,CS=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,PS=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,LS=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,DS=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,IS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,US=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,NS=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,FS=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,OS=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,yt={alphahash_fragment:sx,alphahash_pars_fragment:ox,alphamap_fragment:ax,alphamap_pars_fragment:lx,alphatest_fragment:cx,alphatest_pars_fragment:ux,aomap_fragment:fx,aomap_pars_fragment:dx,batching_pars_vertex:hx,batching_vertex:px,begin_vertex:mx,beginnormal_vertex:gx,bsdfs:vx,iridescence_fragment:_x,bumpmap_pars_fragment:xx,clipping_planes_fragment:yx,clipping_planes_pars_fragment:Sx,clipping_planes_pars_vertex:Mx,clipping_planes_vertex:Ex,color_fragment:Tx,color_pars_fragment:wx,color_pars_vertex:Rx,color_vertex:Ax,common:bx,cube_uv_reflection_fragment:Cx,defaultnormal_vertex:Px,displacementmap_pars_vertex:Lx,displacementmap_vertex:Dx,emissivemap_fragment:Ix,emissivemap_pars_fragment:Ux,colorspace_fragment:Nx,colorspace_pars_fragment:Fx,envmap_fragment:Ox,envmap_common_pars_fragment:kx,envmap_pars_fragment:Bx,envmap_pars_vertex:zx,envmap_physical_pars_fragment:Zx,envmap_vertex:Hx,fog_vertex:Vx,fog_pars_vertex:Gx,fog_fragment:Wx,fog_pars_fragment:Xx,gradientmap_pars_fragment:jx,lightmap_pars_fragment:Yx,lights_lambert_fragment:qx,lights_lambert_pars_fragment:$x,lights_pars_begin:Kx,lights_toon_fragment:Jx,lights_toon_pars_fragment:Qx,lights_phong_fragment:ey,lights_phong_pars_fragment:ty,lights_physical_fragment:ny,lights_physical_pars_fragment:iy,lights_fragment_begin:ry,lights_fragment_maps:sy,lights_fragment_end:oy,logdepthbuf_fragment:ay,logdepthbuf_pars_fragment:ly,logdepthbuf_pars_vertex:cy,logdepthbuf_vertex:uy,map_fragment:fy,map_pars_fragment:dy,map_particle_fragment:hy,map_particle_pars_fragment:py,metalnessmap_fragment:my,metalnessmap_pars_fragment:gy,morphinstance_vertex:vy,morphcolor_vertex:_y,morphnormal_vertex:xy,morphtarget_pars_vertex:yy,morphtarget_vertex:Sy,normal_fragment_begin:My,normal_fragment_maps:Ey,normal_pars_fragment:Ty,normal_pars_vertex:wy,normal_vertex:Ry,normalmap_pars_fragment:Ay,clearcoat_normal_fragment_begin:by,clearcoat_normal_fragment_maps:Cy,clearcoat_pars_fragment:Py,iridescence_pars_fragment:Ly,opaque_fragment:Dy,packing:Iy,premultiplied_alpha_fragment:Uy,project_vertex:Ny,dithering_fragment:Fy,dithering_pars_fragment:Oy,roughnessmap_fragment:ky,roughnessmap_pars_fragment:By,shadowmap_pars_fragment:zy,shadowmap_pars_vertex:Hy,shadowmap_vertex:Vy,shadowmask_pars_fragment:Gy,skinbase_vertex:Wy,skinning_pars_vertex:Xy,skinning_vertex:jy,skinnormal_vertex:Yy,specularmap_fragment:qy,specularmap_pars_fragment:$y,tonemapping_fragment:Ky,tonemapping_pars_fragment:Zy,transmission_fragment:Jy,transmission_pars_fragment:Qy,uv_pars_fragment:eS,uv_pars_vertex:tS,uv_vertex:nS,worldpos_vertex:iS,background_vert:rS,background_frag:sS,backgroundCube_vert:oS,backgroundCube_frag:aS,cube_vert:lS,cube_frag:cS,depth_vert:uS,depth_frag:fS,distanceRGBA_vert:dS,distanceRGBA_frag:hS,equirect_vert:pS,equirect_frag:mS,linedashed_vert:gS,linedashed_frag:vS,meshbasic_vert:_S,meshbasic_frag:xS,meshlambert_vert:yS,meshlambert_frag:SS,meshmatcap_vert:MS,meshmatcap_frag:ES,meshnormal_vert:TS,meshnormal_frag:wS,meshphong_vert:RS,meshphong_frag:AS,meshphysical_vert:bS,meshphysical_frag:CS,meshtoon_vert:PS,meshtoon_frag:LS,points_vert:DS,points_frag:IS,shadow_vert:US,shadow_frag:NS,sprite_vert:FS,sprite_frag:OS},We={common:{diffuse:{value:new Ct(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new xt},alphaMap:{value:null},alphaMapTransform:{value:new xt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new xt}},envmap:{envMap:{value:null},envMapRotation:{value:new xt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new xt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new xt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new xt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new xt},normalScale:{value:new It(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new xt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new xt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new xt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new xt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ct(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ct(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new xt},alphaTest:{value:0},uvTransform:{value:new xt}},sprite:{diffuse:{value:new Ct(16777215)},opacity:{value:1},center:{value:new It(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new xt},alphaMap:{value:null},alphaMapTransform:{value:new xt},alphaTest:{value:0}}},vr={basic:{uniforms:ti([We.common,We.specularmap,We.envmap,We.aomap,We.lightmap,We.fog]),vertexShader:yt.meshbasic_vert,fragmentShader:yt.meshbasic_frag},lambert:{uniforms:ti([We.common,We.specularmap,We.envmap,We.aomap,We.lightmap,We.emissivemap,We.bumpmap,We.normalmap,We.displacementmap,We.fog,We.lights,{emissive:{value:new Ct(0)}}]),vertexShader:yt.meshlambert_vert,fragmentShader:yt.meshlambert_frag},phong:{uniforms:ti([We.common,We.specularmap,We.envmap,We.aomap,We.lightmap,We.emissivemap,We.bumpmap,We.normalmap,We.displacementmap,We.fog,We.lights,{emissive:{value:new Ct(0)},specular:{value:new Ct(1118481)},shininess:{value:30}}]),vertexShader:yt.meshphong_vert,fragmentShader:yt.meshphong_frag},standard:{uniforms:ti([We.common,We.envmap,We.aomap,We.lightmap,We.emissivemap,We.bumpmap,We.normalmap,We.displacementmap,We.roughnessmap,We.metalnessmap,We.fog,We.lights,{emissive:{value:new Ct(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:yt.meshphysical_vert,fragmentShader:yt.meshphysical_frag},toon:{uniforms:ti([We.common,We.aomap,We.lightmap,We.emissivemap,We.bumpmap,We.normalmap,We.displacementmap,We.gradientmap,We.fog,We.lights,{emissive:{value:new Ct(0)}}]),vertexShader:yt.meshtoon_vert,fragmentShader:yt.meshtoon_frag},matcap:{uniforms:ti([We.common,We.bumpmap,We.normalmap,We.displacementmap,We.fog,{matcap:{value:null}}]),vertexShader:yt.meshmatcap_vert,fragmentShader:yt.meshmatcap_frag},points:{uniforms:ti([We.points,We.fog]),vertexShader:yt.points_vert,fragmentShader:yt.points_frag},dashed:{uniforms:ti([We.common,We.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:yt.linedashed_vert,fragmentShader:yt.linedashed_frag},depth:{uniforms:ti([We.common,We.displacementmap]),vertexShader:yt.depth_vert,fragmentShader:yt.depth_frag},normal:{uniforms:ti([We.common,We.bumpmap,We.normalmap,We.displacementmap,{opacity:{value:1}}]),vertexShader:yt.meshnormal_vert,fragmentShader:yt.meshnormal_frag},sprite:{uniforms:ti([We.sprite,We.fog]),vertexShader:yt.sprite_vert,fragmentShader:yt.sprite_frag},background:{uniforms:{uvTransform:{value:new xt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:yt.background_vert,fragmentShader:yt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new xt}},vertexShader:yt.backgroundCube_vert,fragmentShader:yt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:yt.cube_vert,fragmentShader:yt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:yt.equirect_vert,fragmentShader:yt.equirect_frag},distanceRGBA:{uniforms:ti([We.common,We.displacementmap,{referencePosition:{value:new ee},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:yt.distanceRGBA_vert,fragmentShader:yt.distanceRGBA_frag},shadow:{uniforms:ti([We.lights,We.fog,{color:{value:new Ct(0)},opacity:{value:1}}]),vertexShader:yt.shadow_vert,fragmentShader:yt.shadow_frag}};vr.physical={uniforms:ti([vr.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new xt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new xt},clearcoatNormalScale:{value:new It(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new xt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new xt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new xt},sheen:{value:0},sheenColor:{value:new Ct(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new xt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new xt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new xt},transmissionSamplerSize:{value:new It},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new xt},attenuationDistance:{value:0},attenuationColor:{value:new Ct(0)},specularColor:{value:new Ct(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new xt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new xt},anisotropyVector:{value:new It},anisotropyMap:{value:null},anisotropyMapTransform:{value:new xt}}]),vertexShader:yt.meshphysical_vert,fragmentShader:yt.meshphysical_frag};const Jc={r:0,b:0,g:0},co=new qr,kS=new dn;function BS(s,e,n,r,a,c,f){const u=new Ct(0);let h=c===!0?0:1,p,v,x=null,y=0,S=null;function T(D){let A=D.isScene===!0?D.background:null;return A&&A.isTexture&&(A=(D.backgroundBlurriness>0?n:e).get(A)),A}function E(D){let A=!1;const G=T(D);G===null?g(u,h):G&&G.isColor&&(g(G,1),A=!0);const O=s.xr.getEnvironmentBlendMode();O==="additive"?r.buffers.color.setClear(0,0,0,1,f):O==="alpha-blend"&&r.buffers.color.setClear(0,0,0,0,f),(s.autoClear||A)&&(r.buffers.depth.setTest(!0),r.buffers.depth.setMask(!0),r.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function _(D,A){const G=T(A);G&&(G.isCubeTexture||G.mapping===vu)?(v===void 0&&(v=new ni(new Sl(1,1,1),new Sr({name:"BackgroundCubeMaterial",uniforms:Pa(vr.backgroundCube.uniforms),vertexShader:vr.backgroundCube.vertexShader,fragmentShader:vr.backgroundCube.fragmentShader,side:pi,depthTest:!1,depthWrite:!1,fog:!1})),v.geometry.deleteAttribute("normal"),v.geometry.deleteAttribute("uv"),v.onBeforeRender=function(O,z,$){this.matrixWorld.copyPosition($.matrixWorld)},Object.defineProperty(v.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),a.update(v)),co.copy(A.backgroundRotation),co.x*=-1,co.y*=-1,co.z*=-1,G.isCubeTexture&&G.isRenderTargetTexture===!1&&(co.y*=-1,co.z*=-1),v.material.uniforms.envMap.value=G,v.material.uniforms.flipEnvMap.value=G.isCubeTexture&&G.isRenderTargetTexture===!1?-1:1,v.material.uniforms.backgroundBlurriness.value=A.backgroundBlurriness,v.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,v.material.uniforms.backgroundRotation.value.setFromMatrix4(kS.makeRotationFromEuler(co)),v.material.toneMapped=Ft.getTransfer(G.colorSpace)!==zt,(x!==G||y!==G.version||S!==s.toneMapping)&&(v.material.needsUpdate=!0,x=G,y=G.version,S=s.toneMapping),v.layers.enableAll(),D.unshift(v,v.geometry,v.material,0,0,null)):G&&G.isTexture&&(p===void 0&&(p=new ni(new Cs(2,2),new Sr({name:"BackgroundMaterial",uniforms:Pa(vr.background.uniforms),vertexShader:vr.background.vertexShader,fragmentShader:vr.background.fragmentShader,side:Is,depthTest:!1,depthWrite:!1,fog:!1})),p.geometry.deleteAttribute("normal"),Object.defineProperty(p.material,"map",{get:function(){return this.uniforms.t2D.value}}),a.update(p)),p.material.uniforms.t2D.value=G,p.material.uniforms.backgroundIntensity.value=A.backgroundIntensity,p.material.toneMapped=Ft.getTransfer(G.colorSpace)!==zt,G.matrixAutoUpdate===!0&&G.updateMatrix(),p.material.uniforms.uvTransform.value.copy(G.matrix),(x!==G||y!==G.version||S!==s.toneMapping)&&(p.material.needsUpdate=!0,x=G,y=G.version,S=s.toneMapping),p.layers.enableAll(),D.unshift(p,p.geometry,p.material,0,0,null))}function g(D,A){D.getRGB(Jc,h0(s)),r.buffers.color.setClear(Jc.r,Jc.g,Jc.b,A,f)}function F(){v!==void 0&&(v.geometry.dispose(),v.material.dispose()),p!==void 0&&(p.geometry.dispose(),p.material.dispose())}return{getClearColor:function(){return u},setClearColor:function(D,A=1){u.set(D),h=A,g(u,h)},getClearAlpha:function(){return h},setClearAlpha:function(D){h=D,g(u,h)},render:E,addToRenderList:_,dispose:F}}function zS(s,e){const n=s.getParameter(s.MAX_VERTEX_ATTRIBS),r={},a=y(null);let c=a,f=!1;function u(b,U,N,I,ae){let re=!1;const ce=x(I,N,U);c!==ce&&(c=ce,p(c.object)),re=S(b,I,N,ae),re&&T(b,I,N,ae),ae!==null&&e.update(ae,s.ELEMENT_ARRAY_BUFFER),(re||f)&&(f=!1,A(b,U,N,I),ae!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(ae).buffer))}function h(){return s.createVertexArray()}function p(b){return s.bindVertexArray(b)}function v(b){return s.deleteVertexArray(b)}function x(b,U,N){const I=N.wireframe===!0;let ae=r[b.id];ae===void 0&&(ae={},r[b.id]=ae);let re=ae[U.id];re===void 0&&(re={},ae[U.id]=re);let ce=re[I];return ce===void 0&&(ce=y(h()),re[I]=ce),ce}function y(b){const U=[],N=[],I=[];for(let ae=0;ae<n;ae++)U[ae]=0,N[ae]=0,I[ae]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:N,attributeDivisors:I,object:b,attributes:{},index:null}}function S(b,U,N,I){const ae=c.attributes,re=U.attributes;let ce=0;const fe=N.getAttributes();for(const H in fe)if(fe[H].location>=0){const se=ae[H];let B=re[H];if(B===void 0&&(H==="instanceMatrix"&&b.instanceMatrix&&(B=b.instanceMatrix),H==="instanceColor"&&b.instanceColor&&(B=b.instanceColor)),se===void 0||se.attribute!==B||B&&se.data!==B.data)return!0;ce++}return c.attributesNum!==ce||c.index!==I}function T(b,U,N,I){const ae={},re=U.attributes;let ce=0;const fe=N.getAttributes();for(const H in fe)if(fe[H].location>=0){let se=re[H];se===void 0&&(H==="instanceMatrix"&&b.instanceMatrix&&(se=b.instanceMatrix),H==="instanceColor"&&b.instanceColor&&(se=b.instanceColor));const B={};B.attribute=se,se&&se.data&&(B.data=se.data),ae[H]=B,ce++}c.attributes=ae,c.attributesNum=ce,c.index=I}function E(){const b=c.newAttributes;for(let U=0,N=b.length;U<N;U++)b[U]=0}function _(b){g(b,0)}function g(b,U){const N=c.newAttributes,I=c.enabledAttributes,ae=c.attributeDivisors;N[b]=1,I[b]===0&&(s.enableVertexAttribArray(b),I[b]=1),ae[b]!==U&&(s.vertexAttribDivisor(b,U),ae[b]=U)}function F(){const b=c.newAttributes,U=c.enabledAttributes;for(let N=0,I=U.length;N<I;N++)U[N]!==b[N]&&(s.disableVertexAttribArray(N),U[N]=0)}function D(b,U,N,I,ae,re,ce){ce===!0?s.vertexAttribIPointer(b,U,N,ae,re):s.vertexAttribPointer(b,U,N,I,ae,re)}function A(b,U,N,I){E();const ae=I.attributes,re=N.getAttributes(),ce=U.defaultAttributeValues;for(const fe in re){const H=re[fe];if(H.location>=0){let te=ae[fe];if(te===void 0&&(fe==="instanceMatrix"&&b.instanceMatrix&&(te=b.instanceMatrix),fe==="instanceColor"&&b.instanceColor&&(te=b.instanceColor)),te!==void 0){const se=te.normalized,B=te.itemSize,oe=e.get(te);if(oe===void 0)continue;const be=oe.buffer,Q=oe.type,me=oe.bytesPerElement,Me=Q===s.INT||Q===s.UNSIGNED_INT||te.gpuType===Rh;if(te.isInterleavedBufferAttribute){const xe=te.data,Re=xe.stride,Ne=te.offset;if(xe.isInstancedInterleavedBuffer){for(let ke=0;ke<H.locationSize;ke++)g(H.location+ke,xe.meshPerAttribute);b.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=xe.meshPerAttribute*xe.count)}else for(let ke=0;ke<H.locationSize;ke++)_(H.location+ke);s.bindBuffer(s.ARRAY_BUFFER,be);for(let ke=0;ke<H.locationSize;ke++)D(H.location+ke,B/H.locationSize,Q,se,Re*me,(Ne+B/H.locationSize*ke)*me,Me)}else{if(te.isInstancedBufferAttribute){for(let xe=0;xe<H.locationSize;xe++)g(H.location+xe,te.meshPerAttribute);b.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=te.meshPerAttribute*te.count)}else for(let xe=0;xe<H.locationSize;xe++)_(H.location+xe);s.bindBuffer(s.ARRAY_BUFFER,be);for(let xe=0;xe<H.locationSize;xe++)D(H.location+xe,B/H.locationSize,Q,se,B*me,B/H.locationSize*xe*me,Me)}}else if(ce!==void 0){const se=ce[fe];if(se!==void 0)switch(se.length){case 2:s.vertexAttrib2fv(H.location,se);break;case 3:s.vertexAttrib3fv(H.location,se);break;case 4:s.vertexAttrib4fv(H.location,se);break;default:s.vertexAttrib1fv(H.location,se)}}}}F()}function G(){$();for(const b in r){const U=r[b];for(const N in U){const I=U[N];for(const ae in I)v(I[ae].object),delete I[ae];delete U[N]}delete r[b]}}function O(b){if(r[b.id]===void 0)return;const U=r[b.id];for(const N in U){const I=U[N];for(const ae in I)v(I[ae].object),delete I[ae];delete U[N]}delete r[b.id]}function z(b){for(const U in r){const N=r[U];if(N[b.id]===void 0)continue;const I=N[b.id];for(const ae in I)v(I[ae].object),delete I[ae];delete N[b.id]}}function $(){L(),f=!0,c!==a&&(c=a,p(c.object))}function L(){a.geometry=null,a.program=null,a.wireframe=!1}return{setup:u,reset:$,resetDefaultState:L,dispose:G,releaseStatesOfGeometry:O,releaseStatesOfProgram:z,initAttributes:E,enableAttribute:_,disableUnusedAttributes:F}}function HS(s,e,n){let r;function a(p){r=p}function c(p,v){s.drawArrays(r,p,v),n.update(v,r,1)}function f(p,v,x){x!==0&&(s.drawArraysInstanced(r,p,v,x),n.update(v,r,x))}function u(p,v,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(r,p,0,v,0,x);let S=0;for(let T=0;T<x;T++)S+=v[T];n.update(S,r,1)}function h(p,v,x,y){if(x===0)return;const S=e.get("WEBGL_multi_draw");if(S===null)for(let T=0;T<p.length;T++)f(p[T],v[T],y[T]);else{S.multiDrawArraysInstancedWEBGL(r,p,0,v,0,y,0,x);let T=0;for(let E=0;E<x;E++)T+=v[E]*y[E];n.update(T,r,1)}}this.setMode=a,this.render=c,this.renderInstances=f,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function VS(s,e,n,r){let a;function c(){if(a!==void 0)return a;if(e.has("EXT_texture_filter_anisotropic")===!0){const z=e.get("EXT_texture_filter_anisotropic");a=s.getParameter(z.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else a=0;return a}function f(z){return!(z!==sr&&r.convert(z)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function u(z){const $=z===_l&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(z!==Yr&&r.convert(z)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&z!==yr&&!$)}function h(z){if(z==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";z="mediump"}return z==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let p=n.precision!==void 0?n.precision:"highp";const v=h(p);v!==p&&(console.warn("THREE.WebGLRenderer:",p,"not supported, using",v,"instead."),p=v);const x=n.logarithmicDepthBuffer===!0,y=n.reverseDepthBuffer===!0&&e.has("EXT_clip_control"),S=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),T=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),E=s.getParameter(s.MAX_TEXTURE_SIZE),_=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),g=s.getParameter(s.MAX_VERTEX_ATTRIBS),F=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),D=s.getParameter(s.MAX_VARYING_VECTORS),A=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),G=T>0,O=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:c,getMaxPrecision:h,textureFormatReadable:f,textureTypeReadable:u,precision:p,logarithmicDepthBuffer:x,reverseDepthBuffer:y,maxTextures:S,maxVertexTextures:T,maxTextureSize:E,maxCubemapSize:_,maxAttributes:g,maxVertexUniforms:F,maxVaryings:D,maxFragmentUniforms:A,vertexTextures:G,maxSamples:O}}function GS(s){const e=this;let n=null,r=0,a=!1,c=!1;const f=new fo,u=new xt,h={value:null,needsUpdate:!1};this.uniform=h,this.numPlanes=0,this.numIntersection=0,this.init=function(x,y){const S=x.length!==0||y||r!==0||a;return a=y,r=x.length,S},this.beginShadows=function(){c=!0,v(null)},this.endShadows=function(){c=!1},this.setGlobalState=function(x,y){n=v(x,y,0)},this.setState=function(x,y,S){const T=x.clippingPlanes,E=x.clipIntersection,_=x.clipShadows,g=s.get(x);if(!a||T===null||T.length===0||c&&!_)c?v(null):p();else{const F=c?0:r,D=F*4;let A=g.clippingState||null;h.value=A,A=v(T,y,D,S);for(let G=0;G!==D;++G)A[G]=n[G];g.clippingState=A,this.numIntersection=E?this.numPlanes:0,this.numPlanes+=F}};function p(){h.value!==n&&(h.value=n,h.needsUpdate=r>0),e.numPlanes=r,e.numIntersection=0}function v(x,y,S,T){const E=x!==null?x.length:0;let _=null;if(E!==0){if(_=h.value,T!==!0||_===null){const g=S+E*4,F=y.matrixWorldInverse;u.getNormalMatrix(F),(_===null||_.length<g)&&(_=new Float32Array(g));for(let D=0,A=S;D!==E;++D,A+=4)f.copy(x[D]).applyMatrix4(F,u),f.normal.toArray(_,A),_[A+3]=f.constant}h.value=_,h.needsUpdate=!0}return e.numPlanes=E,e.numIntersection=0,_}}function WS(s){let e=new WeakMap;function n(f,u){return u===Gd?f.mapping=wa:u===Wd&&(f.mapping=Ra),f}function r(f){if(f&&f.isTexture){const u=f.mapping;if(u===Gd||u===Wd)if(e.has(f)){const h=e.get(f).texture;return n(h,f.mapping)}else{const h=f.image;if(h&&h.height>0){const p=new Y_(h.height);return p.fromEquirectangularTexture(s,f),e.set(f,p),f.addEventListener("dispose",a),n(p.texture,f.mapping)}else return null}}return f}function a(f){const u=f.target;u.removeEventListener("dispose",a);const h=e.get(u);h!==void 0&&(e.delete(u),h.dispose())}function c(){e=new WeakMap}return{get:r,dispose:c}}const xa=4,hg=[.125,.215,.35,.446,.526,.582],go=20,Td=new tx,pg=new Ct;let wd=null,Rd=0,Ad=0,bd=!1;const po=(1+Math.sqrt(5))/2,ga=1/po,mg=[new ee(-po,ga,0),new ee(po,ga,0),new ee(-ga,0,po),new ee(ga,0,po),new ee(0,po,-ga),new ee(0,po,ga),new ee(-1,1,-1),new ee(1,1,-1),new ee(-1,1,1),new ee(1,1,1)];class gg{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,n=0,r=.1,a=100){wd=this._renderer.getRenderTarget(),Rd=this._renderer.getActiveCubeFace(),Ad=this._renderer.getActiveMipmapLevel(),bd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,r,a,c),n>0&&this._blur(c,0,0,n),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,n=null){return this._fromTexture(e,n)}fromCubemap(e,n=null){return this._fromTexture(e,n)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=xg(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_g(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(wd,Rd,Ad),this._renderer.xr.enabled=bd,e.scissorTest=!1,Qc(e,0,0,e.width,e.height)}_fromTexture(e,n){e.mapping===wa||e.mapping===Ra?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wd=this._renderer.getRenderTarget(),Rd=this._renderer.getActiveCubeFace(),Ad=this._renderer.getActiveMipmapLevel(),bd=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const r=n||this._allocateTargets();return this._textureToCubeUV(e,r),this._applyPMREM(r),this._cleanup(r),r}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),n=4*this._cubeSize,r={magFilter:Gi,minFilter:Gi,generateMipmaps:!1,type:_l,format:sr,colorSpace:Ca,depthBuffer:!1},a=vg(e,n,r);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==n){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=vg(e,n,r);const{_lodMax:c}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=XS(c)),this._blurMaterial=jS(c,e,n)}return a}_compileMaterial(e){const n=new ni(this._lodPlanes[0],e);this._renderer.compile(n,Td)}_sceneToCubeUV(e,n,r,a){const u=new zi(90,1,n,r),h=[1,-1,1,1,1,1],p=[1,1,1,-1,-1,-1],v=this._renderer,x=v.autoClear,y=v.toneMapping;v.getClearColor(pg),v.toneMapping=Ls,v.autoClear=!1;const S=new _a({name:"PMREM.Background",side:pi,depthWrite:!1,depthTest:!1}),T=new ni(new Sl,S);let E=!1;const _=e.background;_?_.isColor&&(S.color.copy(_),e.background=null,E=!0):(S.color.copy(pg),E=!0);for(let g=0;g<6;g++){const F=g%3;F===0?(u.up.set(0,h[g],0),u.lookAt(p[g],0,0)):F===1?(u.up.set(0,0,h[g]),u.lookAt(0,p[g],0)):(u.up.set(0,h[g],0),u.lookAt(0,0,p[g]));const D=this._cubeSize;Qc(a,F*D,g>2?D:0,D,D),v.setRenderTarget(a),E&&v.render(T,u),v.render(e,u)}T.geometry.dispose(),T.material.dispose(),v.toneMapping=y,v.autoClear=x,e.background=_}_textureToCubeUV(e,n){const r=this._renderer,a=e.mapping===wa||e.mapping===Ra;a?(this._cubemapMaterial===null&&(this._cubemapMaterial=xg()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_g());const c=a?this._cubemapMaterial:this._equirectMaterial,f=new ni(this._lodPlanes[0],c),u=c.uniforms;u.envMap.value=e;const h=this._cubeSize;Qc(n,0,0,3*h,2*h),r.setRenderTarget(n),r.render(f,Td)}_applyPMREM(e){const n=this._renderer,r=n.autoClear;n.autoClear=!1;const a=this._lodPlanes.length;for(let c=1;c<a;c++){const f=Math.sqrt(this._sigmas[c]*this._sigmas[c]-this._sigmas[c-1]*this._sigmas[c-1]),u=mg[(a-c-1)%mg.length];this._blur(e,c-1,c,f,u)}n.autoClear=r}_blur(e,n,r,a,c){const f=this._pingPongRenderTarget;this._halfBlur(e,f,n,r,a,"latitudinal",c),this._halfBlur(f,e,r,r,a,"longitudinal",c)}_halfBlur(e,n,r,a,c,f,u){const h=this._renderer,p=this._blurMaterial;f!=="latitudinal"&&f!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const v=3,x=new ni(this._lodPlanes[a],p),y=p.uniforms,S=this._sizeLods[r]-1,T=isFinite(c)?Math.PI/(2*S):2*Math.PI/(2*go-1),E=c/T,_=isFinite(c)?1+Math.floor(v*E):go;_>go&&console.warn(`sigmaRadians, ${c}, is too large and will clip, as it requested ${_} samples when the maximum is set to ${go}`);const g=[];let F=0;for(let z=0;z<go;++z){const $=z/E,L=Math.exp(-$*$/2);g.push(L),z===0?F+=L:z<_&&(F+=2*L)}for(let z=0;z<g.length;z++)g[z]=g[z]/F;y.envMap.value=e.texture,y.samples.value=_,y.weights.value=g,y.latitudinal.value=f==="latitudinal",u&&(y.poleAxis.value=u);const{_lodMax:D}=this;y.dTheta.value=T,y.mipInt.value=D-r;const A=this._sizeLods[a],G=3*A*(a>D-xa?a-D+xa:0),O=4*(this._cubeSize-A);Qc(n,G,O,3*A,2*A),h.setRenderTarget(n),h.render(x,Td)}}function XS(s){const e=[],n=[],r=[];let a=s;const c=s-xa+1+hg.length;for(let f=0;f<c;f++){const u=Math.pow(2,a);n.push(u);let h=1/u;f>s-xa?h=hg[f-s+xa-1]:f===0&&(h=0),r.push(h);const p=1/(u-2),v=-p,x=1+p,y=[v,v,x,v,x,x,v,v,x,x,v,x],S=6,T=6,E=3,_=2,g=1,F=new Float32Array(E*T*S),D=new Float32Array(_*T*S),A=new Float32Array(g*T*S);for(let O=0;O<S;O++){const z=O%3*2/3-1,$=O>2?0:-1,L=[z,$,0,z+2/3,$,0,z+2/3,$+1,0,z,$,0,z+2/3,$+1,0,z,$+1,0];F.set(L,E*T*O),D.set(y,_*T*O);const b=[O,O,O,O,O,O];A.set(b,g*T*O)}const G=new Dn;G.setAttribute("position",new wi(F,E)),G.setAttribute("uv",new wi(D,_)),G.setAttribute("faceIndex",new wi(A,g)),e.push(G),a>xa&&a--}return{lodPlanes:e,sizeLods:n,sigmas:r}}function vg(s,e,n){const r=new yo(s,e,n);return r.texture.mapping=vu,r.texture.name="PMREM.cubeUv",r.scissorTest=!0,r}function Qc(s,e,n,r,a){s.viewport.set(e,n,r,a),s.scissor.set(e,n,r,a)}function jS(s,e,n){const r=new Float32Array(go),a=new ee(0,1,0);return new Sr({name:"SphericalGaussianBlur",defines:{n:go,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/n,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:r},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:a}},vertexShader:Ih(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ps,depthTest:!1,depthWrite:!1})}function _g(){return new Sr({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ih(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ps,depthTest:!1,depthWrite:!1})}function xg(){return new Sr({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ih(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ps,depthTest:!1,depthWrite:!1})}function Ih(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function YS(s){let e=new WeakMap,n=null;function r(u){if(u&&u.isTexture){const h=u.mapping,p=h===Gd||h===Wd,v=h===wa||h===Ra;if(p||v){let x=e.get(u);const y=x!==void 0?x.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==y)return n===null&&(n=new gg(s)),x=p?n.fromEquirectangular(u,x):n.fromCubemap(u,x),x.texture.pmremVersion=u.pmremVersion,e.set(u,x),x.texture;if(x!==void 0)return x.texture;{const S=u.image;return p&&S&&S.height>0||v&&S&&a(S)?(n===null&&(n=new gg(s)),x=p?n.fromEquirectangular(u):n.fromCubemap(u),x.texture.pmremVersion=u.pmremVersion,e.set(u,x),u.addEventListener("dispose",c),x.texture):null}}}return u}function a(u){let h=0;const p=6;for(let v=0;v<p;v++)u[v]!==void 0&&h++;return h===p}function c(u){const h=u.target;h.removeEventListener("dispose",c);const p=e.get(h);p!==void 0&&(e.delete(h),p.dispose())}function f(){e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:r,dispose:f}}function qS(s){const e={};function n(r){if(e[r]!==void 0)return e[r];let a;switch(r){case"WEBGL_depth_texture":a=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":a=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":a=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":a=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:a=s.getExtension(r)}return e[r]=a,a}return{has:function(r){return n(r)!==null},init:function(){n("EXT_color_buffer_float"),n("WEBGL_clip_cull_distance"),n("OES_texture_float_linear"),n("EXT_color_buffer_half_float"),n("WEBGL_multisampled_render_to_texture"),n("WEBGL_render_shared_exponent")},get:function(r){const a=n(r);return a===null&&va("THREE.WebGLRenderer: "+r+" extension not supported."),a}}}function $S(s,e,n,r){const a={},c=new WeakMap;function f(x){const y=x.target;y.index!==null&&e.remove(y.index);for(const T in y.attributes)e.remove(y.attributes[T]);y.removeEventListener("dispose",f),delete a[y.id];const S=c.get(y);S&&(e.remove(S),c.delete(y)),r.releaseStatesOfGeometry(y),y.isInstancedBufferGeometry===!0&&delete y._maxInstanceCount,n.memory.geometries--}function u(x,y){return a[y.id]===!0||(y.addEventListener("dispose",f),a[y.id]=!0,n.memory.geometries++),y}function h(x){const y=x.attributes;for(const S in y)e.update(y[S],s.ARRAY_BUFFER)}function p(x){const y=[],S=x.index,T=x.attributes.position;let E=0;if(S!==null){const F=S.array;E=S.version;for(let D=0,A=F.length;D<A;D+=3){const G=F[D+0],O=F[D+1],z=F[D+2];y.push(G,O,O,z,z,G)}}else if(T!==void 0){const F=T.array;E=T.version;for(let D=0,A=F.length/3-1;D<A;D+=3){const G=D+0,O=D+1,z=D+2;y.push(G,O,O,z,z,G)}}else return;const _=new(s0(y)?d0:f0)(y,1);_.version=E;const g=c.get(x);g&&e.remove(g),c.set(x,_)}function v(x){const y=c.get(x);if(y){const S=x.index;S!==null&&y.version<S.version&&p(x)}else p(x);return c.get(x)}return{get:u,update:h,getWireframeAttribute:v}}function KS(s,e,n){let r;function a(y){r=y}let c,f;function u(y){c=y.type,f=y.bytesPerElement}function h(y,S){s.drawElements(r,S,c,y*f),n.update(S,r,1)}function p(y,S,T){T!==0&&(s.drawElementsInstanced(r,S,c,y*f,T),n.update(S,r,T))}function v(y,S,T){if(T===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(r,S,0,c,y,0,T);let _=0;for(let g=0;g<T;g++)_+=S[g];n.update(_,r,1)}function x(y,S,T,E){if(T===0)return;const _=e.get("WEBGL_multi_draw");if(_===null)for(let g=0;g<y.length;g++)p(y[g]/f,S[g],E[g]);else{_.multiDrawElementsInstancedWEBGL(r,S,0,c,y,0,E,0,T);let g=0;for(let F=0;F<T;F++)g+=S[F]*E[F];n.update(g,r,1)}}this.setMode=a,this.setIndex=u,this.render=h,this.renderInstances=p,this.renderMultiDraw=v,this.renderMultiDrawInstances=x}function ZS(s){const e={geometries:0,textures:0},n={frame:0,calls:0,triangles:0,points:0,lines:0};function r(c,f,u){switch(n.calls++,f){case s.TRIANGLES:n.triangles+=u*(c/3);break;case s.LINES:n.lines+=u*(c/2);break;case s.LINE_STRIP:n.lines+=u*(c-1);break;case s.LINE_LOOP:n.lines+=u*c;break;case s.POINTS:n.points+=u*c;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",f);break}}function a(){n.calls=0,n.triangles=0,n.points=0,n.lines=0}return{memory:e,render:n,programs:null,autoReset:!0,reset:a,update:r}}function JS(s,e,n){const r=new WeakMap,a=new _n;function c(f,u,h){const p=f.morphTargetInfluences,v=u.morphAttributes.position||u.morphAttributes.normal||u.morphAttributes.color,x=v!==void 0?v.length:0;let y=r.get(u);if(y===void 0||y.count!==x){let b=function(){$.dispose(),r.delete(u),u.removeEventListener("dispose",b)};var S=b;y!==void 0&&y.texture.dispose();const T=u.morphAttributes.position!==void 0,E=u.morphAttributes.normal!==void 0,_=u.morphAttributes.color!==void 0,g=u.morphAttributes.position||[],F=u.morphAttributes.normal||[],D=u.morphAttributes.color||[];let A=0;T===!0&&(A=1),E===!0&&(A=2),_===!0&&(A=3);let G=u.attributes.position.count*A,O=1;G>e.maxTextureSize&&(O=Math.ceil(G/e.maxTextureSize),G=e.maxTextureSize);const z=new Float32Array(G*O*4*x),$=new a0(z,G,O,x);$.type=yr,$.needsUpdate=!0;const L=A*4;for(let U=0;U<x;U++){const N=g[U],I=F[U],ae=D[U],re=G*O*4*U;for(let ce=0;ce<N.count;ce++){const fe=ce*L;T===!0&&(a.fromBufferAttribute(N,ce),z[re+fe+0]=a.x,z[re+fe+1]=a.y,z[re+fe+2]=a.z,z[re+fe+3]=0),E===!0&&(a.fromBufferAttribute(I,ce),z[re+fe+4]=a.x,z[re+fe+5]=a.y,z[re+fe+6]=a.z,z[re+fe+7]=0),_===!0&&(a.fromBufferAttribute(ae,ce),z[re+fe+8]=a.x,z[re+fe+9]=a.y,z[re+fe+10]=a.z,z[re+fe+11]=ae.itemSize===4?a.w:1)}}y={count:x,texture:$,size:new It(G,O)},r.set(u,y),u.addEventListener("dispose",b)}if(f.isInstancedMesh===!0&&f.morphTexture!==null)h.getUniforms().setValue(s,"morphTexture",f.morphTexture,n);else{let T=0;for(let _=0;_<p.length;_++)T+=p[_];const E=u.morphTargetsRelative?1:1-T;h.getUniforms().setValue(s,"morphTargetBaseInfluence",E),h.getUniforms().setValue(s,"morphTargetInfluences",p)}h.getUniforms().setValue(s,"morphTargetsTexture",y.texture,n),h.getUniforms().setValue(s,"morphTargetsTextureSize",y.size)}return{update:c}}function QS(s,e,n,r){let a=new WeakMap;function c(h){const p=r.render.frame,v=h.geometry,x=e.get(h,v);if(a.get(x)!==p&&(e.update(x),a.set(x,p)),h.isInstancedMesh&&(h.hasEventListener("dispose",u)===!1&&h.addEventListener("dispose",u),a.get(h)!==p&&(n.update(h.instanceMatrix,s.ARRAY_BUFFER),h.instanceColor!==null&&n.update(h.instanceColor,s.ARRAY_BUFFER),a.set(h,p))),h.isSkinnedMesh){const y=h.skeleton;a.get(y)!==p&&(y.update(),a.set(y,p))}return x}function f(){a=new WeakMap}function u(h){const p=h.target;p.removeEventListener("dispose",u),n.remove(p.instanceMatrix),p.instanceColor!==null&&n.remove(p.instanceColor)}return{update:c,dispose:f}}const y0=new Yn,yg=new _0(1,1),S0=new a0,M0=new L_,E0=new m0,Sg=[],Mg=[],Eg=new Float32Array(16),Tg=new Float32Array(9),wg=new Float32Array(4);function Ia(s,e,n){const r=s[0];if(r<=0||r>0)return s;const a=e*n;let c=Sg[a];if(c===void 0&&(c=new Float32Array(a),Sg[a]=c),e!==0){r.toArray(c,0);for(let f=1,u=0;f!==e;++f)u+=n,s[f].toArray(c,u)}return c}function Rn(s,e){if(s.length!==e.length)return!1;for(let n=0,r=s.length;n<r;n++)if(s[n]!==e[n])return!1;return!0}function An(s,e){for(let n=0,r=e.length;n<r;n++)s[n]=e[n]}function xu(s,e){let n=Mg[e];n===void 0&&(n=new Int32Array(e),Mg[e]=n);for(let r=0;r!==e;++r)n[r]=s.allocateTextureUnit();return n}function eM(s,e){const n=this.cache;n[0]!==e&&(s.uniform1f(this.addr,e),n[0]=e)}function tM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Rn(n,e))return;s.uniform2fv(this.addr,e),An(n,e)}}function nM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else if(e.r!==void 0)(n[0]!==e.r||n[1]!==e.g||n[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),n[0]=e.r,n[1]=e.g,n[2]=e.b);else{if(Rn(n,e))return;s.uniform3fv(this.addr,e),An(n,e)}}function iM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Rn(n,e))return;s.uniform4fv(this.addr,e),An(n,e)}}function rM(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Rn(n,e))return;s.uniformMatrix2fv(this.addr,!1,e),An(n,e)}else{if(Rn(n,r))return;wg.set(r),s.uniformMatrix2fv(this.addr,!1,wg),An(n,r)}}function sM(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Rn(n,e))return;s.uniformMatrix3fv(this.addr,!1,e),An(n,e)}else{if(Rn(n,r))return;Tg.set(r),s.uniformMatrix3fv(this.addr,!1,Tg),An(n,r)}}function oM(s,e){const n=this.cache,r=e.elements;if(r===void 0){if(Rn(n,e))return;s.uniformMatrix4fv(this.addr,!1,e),An(n,e)}else{if(Rn(n,r))return;Eg.set(r),s.uniformMatrix4fv(this.addr,!1,Eg),An(n,r)}}function aM(s,e){const n=this.cache;n[0]!==e&&(s.uniform1i(this.addr,e),n[0]=e)}function lM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Rn(n,e))return;s.uniform2iv(this.addr,e),An(n,e)}}function cM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Rn(n,e))return;s.uniform3iv(this.addr,e),An(n,e)}}function uM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Rn(n,e))return;s.uniform4iv(this.addr,e),An(n,e)}}function fM(s,e){const n=this.cache;n[0]!==e&&(s.uniform1ui(this.addr,e),n[0]=e)}function dM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),n[0]=e.x,n[1]=e.y);else{if(Rn(n,e))return;s.uniform2uiv(this.addr,e),An(n,e)}}function hM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),n[0]=e.x,n[1]=e.y,n[2]=e.z);else{if(Rn(n,e))return;s.uniform3uiv(this.addr,e),An(n,e)}}function pM(s,e){const n=this.cache;if(e.x!==void 0)(n[0]!==e.x||n[1]!==e.y||n[2]!==e.z||n[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),n[0]=e.x,n[1]=e.y,n[2]=e.z,n[3]=e.w);else{if(Rn(n,e))return;s.uniform4uiv(this.addr,e),An(n,e)}}function mM(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a);let c;this.type===s.SAMPLER_2D_SHADOW?(yg.compareFunction=r0,c=yg):c=y0,n.setTexture2D(e||c,a)}function gM(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTexture3D(e||M0,a)}function vM(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTextureCube(e||E0,a)}function _M(s,e,n){const r=this.cache,a=n.allocateTextureUnit();r[0]!==a&&(s.uniform1i(this.addr,a),r[0]=a),n.setTexture2DArray(e||S0,a)}function xM(s){switch(s){case 5126:return eM;case 35664:return tM;case 35665:return nM;case 35666:return iM;case 35674:return rM;case 35675:return sM;case 35676:return oM;case 5124:case 35670:return aM;case 35667:case 35671:return lM;case 35668:case 35672:return cM;case 35669:case 35673:return uM;case 5125:return fM;case 36294:return dM;case 36295:return hM;case 36296:return pM;case 35678:case 36198:case 36298:case 36306:case 35682:return mM;case 35679:case 36299:case 36307:return gM;case 35680:case 36300:case 36308:case 36293:return vM;case 36289:case 36303:case 36311:case 36292:return _M}}function yM(s,e){s.uniform1fv(this.addr,e)}function SM(s,e){const n=Ia(e,this.size,2);s.uniform2fv(this.addr,n)}function MM(s,e){const n=Ia(e,this.size,3);s.uniform3fv(this.addr,n)}function EM(s,e){const n=Ia(e,this.size,4);s.uniform4fv(this.addr,n)}function TM(s,e){const n=Ia(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,n)}function wM(s,e){const n=Ia(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,n)}function RM(s,e){const n=Ia(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,n)}function AM(s,e){s.uniform1iv(this.addr,e)}function bM(s,e){s.uniform2iv(this.addr,e)}function CM(s,e){s.uniform3iv(this.addr,e)}function PM(s,e){s.uniform4iv(this.addr,e)}function LM(s,e){s.uniform1uiv(this.addr,e)}function DM(s,e){s.uniform2uiv(this.addr,e)}function IM(s,e){s.uniform3uiv(this.addr,e)}function UM(s,e){s.uniform4uiv(this.addr,e)}function NM(s,e,n){const r=this.cache,a=e.length,c=xu(n,a);Rn(r,c)||(s.uniform1iv(this.addr,c),An(r,c));for(let f=0;f!==a;++f)n.setTexture2D(e[f]||y0,c[f])}function FM(s,e,n){const r=this.cache,a=e.length,c=xu(n,a);Rn(r,c)||(s.uniform1iv(this.addr,c),An(r,c));for(let f=0;f!==a;++f)n.setTexture3D(e[f]||M0,c[f])}function OM(s,e,n){const r=this.cache,a=e.length,c=xu(n,a);Rn(r,c)||(s.uniform1iv(this.addr,c),An(r,c));for(let f=0;f!==a;++f)n.setTextureCube(e[f]||E0,c[f])}function kM(s,e,n){const r=this.cache,a=e.length,c=xu(n,a);Rn(r,c)||(s.uniform1iv(this.addr,c),An(r,c));for(let f=0;f!==a;++f)n.setTexture2DArray(e[f]||S0,c[f])}function BM(s){switch(s){case 5126:return yM;case 35664:return SM;case 35665:return MM;case 35666:return EM;case 35674:return TM;case 35675:return wM;case 35676:return RM;case 5124:case 35670:return AM;case 35667:case 35671:return bM;case 35668:case 35672:return CM;case 35669:case 35673:return PM;case 5125:return LM;case 36294:return DM;case 36295:return IM;case 36296:return UM;case 35678:case 36198:case 36298:case 36306:case 35682:return NM;case 35679:case 36299:case 36307:return FM;case 35680:case 36300:case 36308:case 36293:return OM;case 36289:case 36303:case 36311:case 36292:return kM}}class zM{constructor(e,n,r){this.id=e,this.addr=r,this.cache=[],this.type=n.type,this.setValue=xM(n.type)}}class HM{constructor(e,n,r){this.id=e,this.addr=r,this.cache=[],this.type=n.type,this.size=n.size,this.setValue=BM(n.type)}}class VM{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,n,r){const a=this.seq;for(let c=0,f=a.length;c!==f;++c){const u=a[c];u.setValue(e,n[u.id],r)}}}const Cd=/(\w+)(\])?(\[|\.)?/g;function Rg(s,e){s.seq.push(e),s.map[e.id]=e}function GM(s,e,n){const r=s.name,a=r.length;for(Cd.lastIndex=0;;){const c=Cd.exec(r),f=Cd.lastIndex;let u=c[1];const h=c[2]==="]",p=c[3];if(h&&(u=u|0),p===void 0||p==="["&&f+2===a){Rg(n,p===void 0?new zM(u,s,e):new HM(u,s,e));break}else{let x=n.map[u];x===void 0&&(x=new VM(u),Rg(n,x)),n=x}}}class lu{constructor(e,n){this.seq=[],this.map={};const r=e.getProgramParameter(n,e.ACTIVE_UNIFORMS);for(let a=0;a<r;++a){const c=e.getActiveUniform(n,a),f=e.getUniformLocation(n,c.name);GM(c,f,this)}}setValue(e,n,r,a){const c=this.map[n];c!==void 0&&c.setValue(e,r,a)}setOptional(e,n,r){const a=n[r];a!==void 0&&this.setValue(e,r,a)}static upload(e,n,r,a){for(let c=0,f=n.length;c!==f;++c){const u=n[c],h=r[u.id];h.needsUpdate!==!1&&u.setValue(e,h.value,a)}}static seqWithValue(e,n){const r=[];for(let a=0,c=e.length;a!==c;++a){const f=e[a];f.id in n&&r.push(f)}return r}}function Ag(s,e,n){const r=s.createShader(e);return s.shaderSource(r,n),s.compileShader(r),r}const WM=37297;let XM=0;function jM(s,e){const n=s.split(`
`),r=[],a=Math.max(e-6,0),c=Math.min(e+6,n.length);for(let f=a;f<c;f++){const u=f+1;r.push(`${u===e?">":" "} ${u}: ${n[f]}`)}return r.join(`
`)}const bg=new xt;function YM(s){Ft._getMatrix(bg,Ft.workingColorSpace,s);const e=`mat3( ${bg.elements.map(n=>n.toFixed(4))} )`;switch(Ft.getTransfer(s)){case cu:return[e,"LinearTransferOETF"];case zt:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function Cg(s,e,n){const r=s.getShaderParameter(e,s.COMPILE_STATUS),a=s.getShaderInfoLog(e).trim();if(r&&a==="")return"";const c=/ERROR: 0:(\d+)/.exec(a);if(c){const f=parseInt(c[1]);return n.toUpperCase()+`

`+a+`

`+jM(s.getShaderSource(e),f)}else return a}function qM(s,e){const n=YM(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${n[1]}( vec4( value.rgb * ${n[0]}, value.a ) );`,"}"].join(`
`)}function $M(s,e){let n;switch(e){case n_:n="Linear";break;case i_:n="Reinhard";break;case r_:n="Cineon";break;case s_:n="ACESFilmic";break;case a_:n="AgX";break;case l_:n="Neutral";break;case o_:n="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),n="Linear"}return"vec3 "+s+"( vec3 color ) { return "+n+"ToneMapping( color ); }"}const eu=new ee;function KM(){Ft.getLuminanceCoefficients(eu);const s=eu.x.toFixed(4),e=eu.y.toFixed(4),n=eu.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${n} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ZM(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(gl).join(`
`)}function JM(s){const e=[];for(const n in s){const r=s[n];r!==!1&&e.push("#define "+n+" "+r)}return e.join(`
`)}function QM(s,e){const n={},r=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let a=0;a<r;a++){const c=s.getActiveAttrib(e,a),f=c.name;let u=1;c.type===s.FLOAT_MAT2&&(u=2),c.type===s.FLOAT_MAT3&&(u=3),c.type===s.FLOAT_MAT4&&(u=4),n[f]={type:c.type,location:s.getAttribLocation(e,f),locationSize:u}}return n}function gl(s){return s!==""}function Pg(s,e){const n=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,n).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Lg(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const eE=/^[ \t]*#include +<([\w\d./]+)>/gm;function Sh(s){return s.replace(eE,nE)}const tE=new Map;function nE(s,e){let n=yt[e];if(n===void 0){const r=tE.get(e);if(r!==void 0)n=yt[r],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,r);else throw new Error("Can not resolve #include <"+e+">")}return Sh(n)}const iE=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dg(s){return s.replace(iE,rE)}function rE(s,e,n,r){let a="";for(let c=parseInt(e);c<parseInt(n);c++)a+=r.replace(/\[\s*i\s*\]/g,"[ "+c+" ]").replace(/UNROLLED_LOOP_INDEX/g,c);return a}function Ig(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function sE(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===jg?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Nv?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Gr&&(e="SHADOWMAP_TYPE_VSM"),e}function oE(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case wa:case Ra:e="ENVMAP_TYPE_CUBE";break;case vu:e="ENVMAP_TYPE_CUBE_UV";break}return e}function aE(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Ra:e="ENVMAP_MODE_REFRACTION";break}return e}function lE(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Yg:e="ENVMAP_BLENDING_MULTIPLY";break;case e_:e="ENVMAP_BLENDING_MIX";break;case t_:e="ENVMAP_BLENDING_ADD";break}return e}function cE(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const n=Math.log2(e)-2,r=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,n),112)),texelHeight:r,maxMip:n}}function uE(s,e,n,r){const a=s.getContext(),c=n.defines;let f=n.vertexShader,u=n.fragmentShader;const h=sE(n),p=oE(n),v=aE(n),x=lE(n),y=cE(n),S=ZM(n),T=JM(c),E=a.createProgram();let _,g,F=n.glslVersion?"#version "+n.glslVersion+`
`:"";n.isRawShaderMaterial?(_=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,T].filter(gl).join(`
`),_.length>0&&(_+=`
`),g=["#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,T].filter(gl).join(`
`),g.length>0&&(g+=`
`)):(_=[Ig(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,T,n.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",n.batching?"#define USE_BATCHING":"",n.batchingColor?"#define USE_BATCHING_COLOR":"",n.instancing?"#define USE_INSTANCING":"",n.instancingColor?"#define USE_INSTANCING_COLOR":"",n.instancingMorph?"#define USE_INSTANCING_MORPH":"",n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.map?"#define USE_MAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+v:"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.displacementMap?"#define USE_DISPLACEMENTMAP":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.mapUv?"#define MAP_UV "+n.mapUv:"",n.alphaMapUv?"#define ALPHAMAP_UV "+n.alphaMapUv:"",n.lightMapUv?"#define LIGHTMAP_UV "+n.lightMapUv:"",n.aoMapUv?"#define AOMAP_UV "+n.aoMapUv:"",n.emissiveMapUv?"#define EMISSIVEMAP_UV "+n.emissiveMapUv:"",n.bumpMapUv?"#define BUMPMAP_UV "+n.bumpMapUv:"",n.normalMapUv?"#define NORMALMAP_UV "+n.normalMapUv:"",n.displacementMapUv?"#define DISPLACEMENTMAP_UV "+n.displacementMapUv:"",n.metalnessMapUv?"#define METALNESSMAP_UV "+n.metalnessMapUv:"",n.roughnessMapUv?"#define ROUGHNESSMAP_UV "+n.roughnessMapUv:"",n.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+n.anisotropyMapUv:"",n.clearcoatMapUv?"#define CLEARCOATMAP_UV "+n.clearcoatMapUv:"",n.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+n.clearcoatNormalMapUv:"",n.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+n.clearcoatRoughnessMapUv:"",n.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+n.iridescenceMapUv:"",n.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+n.iridescenceThicknessMapUv:"",n.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+n.sheenColorMapUv:"",n.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+n.sheenRoughnessMapUv:"",n.specularMapUv?"#define SPECULARMAP_UV "+n.specularMapUv:"",n.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+n.specularColorMapUv:"",n.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+n.specularIntensityMapUv:"",n.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+n.transmissionMapUv:"",n.thicknessMapUv?"#define THICKNESSMAP_UV "+n.thicknessMapUv:"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.flatShading?"#define FLAT_SHADED":"",n.skinning?"#define USE_SKINNING":"",n.morphTargets?"#define USE_MORPHTARGETS":"",n.morphNormals&&n.flatShading===!1?"#define USE_MORPHNORMALS":"",n.morphColors?"#define USE_MORPHCOLORS":"",n.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+n.morphTextureStride:"",n.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+n.morphTargetsCount:"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+h:"",n.sizeAttenuation?"#define USE_SIZEATTENUATION":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(gl).join(`
`),g=[Ig(n),"#define SHADER_TYPE "+n.shaderType,"#define SHADER_NAME "+n.shaderName,T,n.useFog&&n.fog?"#define USE_FOG":"",n.useFog&&n.fogExp2?"#define FOG_EXP2":"",n.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",n.map?"#define USE_MAP":"",n.matcap?"#define USE_MATCAP":"",n.envMap?"#define USE_ENVMAP":"",n.envMap?"#define "+p:"",n.envMap?"#define "+v:"",n.envMap?"#define "+x:"",y?"#define CUBEUV_TEXEL_WIDTH "+y.texelWidth:"",y?"#define CUBEUV_TEXEL_HEIGHT "+y.texelHeight:"",y?"#define CUBEUV_MAX_MIP "+y.maxMip+".0":"",n.lightMap?"#define USE_LIGHTMAP":"",n.aoMap?"#define USE_AOMAP":"",n.bumpMap?"#define USE_BUMPMAP":"",n.normalMap?"#define USE_NORMALMAP":"",n.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",n.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",n.emissiveMap?"#define USE_EMISSIVEMAP":"",n.anisotropy?"#define USE_ANISOTROPY":"",n.anisotropyMap?"#define USE_ANISOTROPYMAP":"",n.clearcoat?"#define USE_CLEARCOAT":"",n.clearcoatMap?"#define USE_CLEARCOATMAP":"",n.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",n.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",n.dispersion?"#define USE_DISPERSION":"",n.iridescence?"#define USE_IRIDESCENCE":"",n.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",n.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",n.specularMap?"#define USE_SPECULARMAP":"",n.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",n.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",n.roughnessMap?"#define USE_ROUGHNESSMAP":"",n.metalnessMap?"#define USE_METALNESSMAP":"",n.alphaMap?"#define USE_ALPHAMAP":"",n.alphaTest?"#define USE_ALPHATEST":"",n.alphaHash?"#define USE_ALPHAHASH":"",n.sheen?"#define USE_SHEEN":"",n.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",n.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",n.transmission?"#define USE_TRANSMISSION":"",n.transmissionMap?"#define USE_TRANSMISSIONMAP":"",n.thicknessMap?"#define USE_THICKNESSMAP":"",n.vertexTangents&&n.flatShading===!1?"#define USE_TANGENT":"",n.vertexColors||n.instancingColor||n.batchingColor?"#define USE_COLOR":"",n.vertexAlphas?"#define USE_COLOR_ALPHA":"",n.vertexUv1s?"#define USE_UV1":"",n.vertexUv2s?"#define USE_UV2":"",n.vertexUv3s?"#define USE_UV3":"",n.pointsUvs?"#define USE_POINTS_UV":"",n.gradientMap?"#define USE_GRADIENTMAP":"",n.flatShading?"#define FLAT_SHADED":"",n.doubleSided?"#define DOUBLE_SIDED":"",n.flipSided?"#define FLIP_SIDED":"",n.shadowMapEnabled?"#define USE_SHADOWMAP":"",n.shadowMapEnabled?"#define "+h:"",n.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",n.numLightProbes>0?"#define USE_LIGHT_PROBES":"",n.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",n.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",n.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",n.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",n.toneMapping!==Ls?"#define TONE_MAPPING":"",n.toneMapping!==Ls?yt.tonemapping_pars_fragment:"",n.toneMapping!==Ls?$M("toneMapping",n.toneMapping):"",n.dithering?"#define DITHERING":"",n.opaque?"#define OPAQUE":"",yt.colorspace_pars_fragment,qM("linearToOutputTexel",n.outputColorSpace),KM(),n.useDepthPacking?"#define DEPTH_PACKING "+n.depthPacking:"",`
`].filter(gl).join(`
`)),f=Sh(f),f=Pg(f,n),f=Lg(f,n),u=Sh(u),u=Pg(u,n),u=Lg(u,n),f=Dg(f),u=Dg(u),n.isRawShaderMaterial!==!0&&(F=`#version 300 es
`,_=[S,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+_,g=["#define varying in",n.glslVersion===Wm?"":"layout(location = 0) out highp vec4 pc_fragColor;",n.glslVersion===Wm?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const D=F+_+f,A=F+g+u,G=Ag(a,a.VERTEX_SHADER,D),O=Ag(a,a.FRAGMENT_SHADER,A);a.attachShader(E,G),a.attachShader(E,O),n.index0AttributeName!==void 0?a.bindAttribLocation(E,0,n.index0AttributeName):n.morphTargets===!0&&a.bindAttribLocation(E,0,"position"),a.linkProgram(E);function z(U){if(s.debug.checkShaderErrors){const N=a.getProgramInfoLog(E).trim(),I=a.getShaderInfoLog(G).trim(),ae=a.getShaderInfoLog(O).trim();let re=!0,ce=!0;if(a.getProgramParameter(E,a.LINK_STATUS)===!1)if(re=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(a,E,G,O);else{const fe=Cg(a,G,"vertex"),H=Cg(a,O,"fragment");console.error("THREE.WebGLProgram: Shader Error "+a.getError()+" - VALIDATE_STATUS "+a.getProgramParameter(E,a.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+N+`
`+fe+`
`+H)}else N!==""?console.warn("THREE.WebGLProgram: Program Info Log:",N):(I===""||ae==="")&&(ce=!1);ce&&(U.diagnostics={runnable:re,programLog:N,vertexShader:{log:I,prefix:_},fragmentShader:{log:ae,prefix:g}})}a.deleteShader(G),a.deleteShader(O),$=new lu(a,E),L=QM(a,E)}let $;this.getUniforms=function(){return $===void 0&&z(this),$};let L;this.getAttributes=function(){return L===void 0&&z(this),L};let b=n.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=a.getProgramParameter(E,WM)),b},this.destroy=function(){r.releaseStatesOfProgram(this),a.deleteProgram(E),this.program=void 0},this.type=n.shaderType,this.name=n.shaderName,this.id=XM++,this.cacheKey=e,this.usedTimes=1,this.program=E,this.vertexShader=G,this.fragmentShader=O,this}let fE=0;class dE{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const n=e.vertexShader,r=e.fragmentShader,a=this._getShaderStage(n),c=this._getShaderStage(r),f=this._getShaderCacheForMaterial(e);return f.has(a)===!1&&(f.add(a),a.usedTimes++),f.has(c)===!1&&(f.add(c),c.usedTimes++),this}remove(e){const n=this.materialCache.get(e);for(const r of n)r.usedTimes--,r.usedTimes===0&&this.shaderCache.delete(r.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const n=this.materialCache;let r=n.get(e);return r===void 0&&(r=new Set,n.set(e,r)),r}_getShaderStage(e){const n=this.shaderCache;let r=n.get(e);return r===void 0&&(r=new hE(e),n.set(e,r)),r}}class hE{constructor(e){this.id=fE++,this.code=e,this.usedTimes=0}}function pE(s,e,n,r,a,c,f){const u=new c0,h=new dE,p=new Set,v=[],x=a.logarithmicDepthBuffer,y=a.vertexTextures;let S=a.precision;const T={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function E(L){return p.add(L),L===0?"uv":`uv${L}`}function _(L,b,U,N,I){const ae=N.fog,re=I.geometry,ce=L.isMeshStandardMaterial?N.environment:null,fe=(L.isMeshStandardMaterial?n:e).get(L.envMap||ce),H=fe&&fe.mapping===vu?fe.image.height:null,te=T[L.type];L.precision!==null&&(S=a.getMaxPrecision(L.precision),S!==L.precision&&console.warn("THREE.WebGLProgram.getParameters:",L.precision,"not supported, using",S,"instead."));const se=re.morphAttributes.position||re.morphAttributes.normal||re.morphAttributes.color,B=se!==void 0?se.length:0;let oe=0;re.morphAttributes.position!==void 0&&(oe=1),re.morphAttributes.normal!==void 0&&(oe=2),re.morphAttributes.color!==void 0&&(oe=3);let be,Q,me,Me;if(te){const Pt=vr[te];be=Pt.vertexShader,Q=Pt.fragmentShader}else be=L.vertexShader,Q=L.fragmentShader,h.update(L),me=h.getVertexShaderID(L),Me=h.getFragmentShaderID(L);const xe=s.getRenderTarget(),Re=s.state.buffers.depth.getReversed(),Ne=I.isInstancedMesh===!0,ke=I.isBatchedMesh===!0,vt=!!L.map,tt=!!L.matcap,_t=!!fe,V=!!L.aoMap,St=!!L.lightMap,_e=!!L.bumpMap,Ue=!!L.normalMap,de=!!L.displacementMap,Le=!!L.emissiveMap,Se=!!L.metalnessMap,C=!!L.roughnessMap,R=L.anisotropy>0,W=L.clearcoat>0,ie=L.dispersion>0,ge=L.iridescence>0,pe=L.sheen>0,Fe=L.transmission>0,Ce=R&&!!L.anisotropyMap,Be=W&&!!L.clearcoatMap,ot=W&&!!L.clearcoatNormalMap,Te=W&&!!L.clearcoatRoughnessMap,Xe=ge&&!!L.iridescenceMap,it=ge&&!!L.iridescenceThicknessMap,rt=pe&&!!L.sheenColorMap,Ye=pe&&!!L.sheenRoughnessMap,mt=!!L.specularMap,ht=!!L.specularColorMap,wt=!!L.specularIntensityMap,q=Fe&&!!L.transmissionMap,Oe=Fe&&!!L.thicknessMap,ve=!!L.gradientMap,ye=!!L.alphaMap,He=L.alphaTest>0,Ve=!!L.alphaHash,ft=!!L.extensions;let Vt=Ls;L.toneMapped&&(xe===null||xe.isXRRenderTarget===!0)&&(Vt=s.toneMapping);const hn={shaderID:te,shaderType:L.type,shaderName:L.name,vertexShader:be,fragmentShader:Q,defines:L.defines,customVertexShaderID:me,customFragmentShaderID:Me,isRawShaderMaterial:L.isRawShaderMaterial===!0,glslVersion:L.glslVersion,precision:S,batching:ke,batchingColor:ke&&I._colorsTexture!==null,instancing:Ne,instancingColor:Ne&&I.instanceColor!==null,instancingMorph:Ne&&I.morphTexture!==null,supportsVertexTextures:y,outputColorSpace:xe===null?s.outputColorSpace:xe.isXRRenderTarget===!0?xe.texture.colorSpace:Ca,alphaToCoverage:!!L.alphaToCoverage,map:vt,matcap:tt,envMap:_t,envMapMode:_t&&fe.mapping,envMapCubeUVHeight:H,aoMap:V,lightMap:St,bumpMap:_e,normalMap:Ue,displacementMap:y&&de,emissiveMap:Le,normalMapObjectSpace:Ue&&L.normalMapType===h_,normalMapTangentSpace:Ue&&L.normalMapType===d_,metalnessMap:Se,roughnessMap:C,anisotropy:R,anisotropyMap:Ce,clearcoat:W,clearcoatMap:Be,clearcoatNormalMap:ot,clearcoatRoughnessMap:Te,dispersion:ie,iridescence:ge,iridescenceMap:Xe,iridescenceThicknessMap:it,sheen:pe,sheenColorMap:rt,sheenRoughnessMap:Ye,specularMap:mt,specularColorMap:ht,specularIntensityMap:wt,transmission:Fe,transmissionMap:q,thicknessMap:Oe,gradientMap:ve,opaque:L.transparent===!1&&L.blending===Sa&&L.alphaToCoverage===!1,alphaMap:ye,alphaTest:He,alphaHash:Ve,combine:L.combine,mapUv:vt&&E(L.map.channel),aoMapUv:V&&E(L.aoMap.channel),lightMapUv:St&&E(L.lightMap.channel),bumpMapUv:_e&&E(L.bumpMap.channel),normalMapUv:Ue&&E(L.normalMap.channel),displacementMapUv:de&&E(L.displacementMap.channel),emissiveMapUv:Le&&E(L.emissiveMap.channel),metalnessMapUv:Se&&E(L.metalnessMap.channel),roughnessMapUv:C&&E(L.roughnessMap.channel),anisotropyMapUv:Ce&&E(L.anisotropyMap.channel),clearcoatMapUv:Be&&E(L.clearcoatMap.channel),clearcoatNormalMapUv:ot&&E(L.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Te&&E(L.clearcoatRoughnessMap.channel),iridescenceMapUv:Xe&&E(L.iridescenceMap.channel),iridescenceThicknessMapUv:it&&E(L.iridescenceThicknessMap.channel),sheenColorMapUv:rt&&E(L.sheenColorMap.channel),sheenRoughnessMapUv:Ye&&E(L.sheenRoughnessMap.channel),specularMapUv:mt&&E(L.specularMap.channel),specularColorMapUv:ht&&E(L.specularColorMap.channel),specularIntensityMapUv:wt&&E(L.specularIntensityMap.channel),transmissionMapUv:q&&E(L.transmissionMap.channel),thicknessMapUv:Oe&&E(L.thicknessMap.channel),alphaMapUv:ye&&E(L.alphaMap.channel),vertexTangents:!!re.attributes.tangent&&(Ue||R),vertexColors:L.vertexColors,vertexAlphas:L.vertexColors===!0&&!!re.attributes.color&&re.attributes.color.itemSize===4,pointsUvs:I.isPoints===!0&&!!re.attributes.uv&&(vt||ye),fog:!!ae,useFog:L.fog===!0,fogExp2:!!ae&&ae.isFogExp2,flatShading:L.flatShading===!0,sizeAttenuation:L.sizeAttenuation===!0,logarithmicDepthBuffer:x,reverseDepthBuffer:Re,skinning:I.isSkinnedMesh===!0,morphTargets:re.morphAttributes.position!==void 0,morphNormals:re.morphAttributes.normal!==void 0,morphColors:re.morphAttributes.color!==void 0,morphTargetsCount:B,morphTextureStride:oe,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:f.numPlanes,numClipIntersection:f.numIntersection,dithering:L.dithering,shadowMapEnabled:s.shadowMap.enabled&&U.length>0,shadowMapType:s.shadowMap.type,toneMapping:Vt,decodeVideoTexture:vt&&L.map.isVideoTexture===!0&&Ft.getTransfer(L.map.colorSpace)===zt,decodeVideoTextureEmissive:Le&&L.emissiveMap.isVideoTexture===!0&&Ft.getTransfer(L.emissiveMap.colorSpace)===zt,premultipliedAlpha:L.premultipliedAlpha,doubleSided:L.side===Hi,flipSided:L.side===pi,useDepthPacking:L.depthPacking>=0,depthPacking:L.depthPacking||0,index0AttributeName:L.index0AttributeName,extensionClipCullDistance:ft&&L.extensions.clipCullDistance===!0&&r.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ft&&L.extensions.multiDraw===!0||ke)&&r.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:r.has("KHR_parallel_shader_compile"),customProgramCacheKey:L.customProgramCacheKey()};return hn.vertexUv1s=p.has(1),hn.vertexUv2s=p.has(2),hn.vertexUv3s=p.has(3),p.clear(),hn}function g(L){const b=[];if(L.shaderID?b.push(L.shaderID):(b.push(L.customVertexShaderID),b.push(L.customFragmentShaderID)),L.defines!==void 0)for(const U in L.defines)b.push(U),b.push(L.defines[U]);return L.isRawShaderMaterial===!1&&(F(b,L),D(b,L),b.push(s.outputColorSpace)),b.push(L.customProgramCacheKey),b.join()}function F(L,b){L.push(b.precision),L.push(b.outputColorSpace),L.push(b.envMapMode),L.push(b.envMapCubeUVHeight),L.push(b.mapUv),L.push(b.alphaMapUv),L.push(b.lightMapUv),L.push(b.aoMapUv),L.push(b.bumpMapUv),L.push(b.normalMapUv),L.push(b.displacementMapUv),L.push(b.emissiveMapUv),L.push(b.metalnessMapUv),L.push(b.roughnessMapUv),L.push(b.anisotropyMapUv),L.push(b.clearcoatMapUv),L.push(b.clearcoatNormalMapUv),L.push(b.clearcoatRoughnessMapUv),L.push(b.iridescenceMapUv),L.push(b.iridescenceThicknessMapUv),L.push(b.sheenColorMapUv),L.push(b.sheenRoughnessMapUv),L.push(b.specularMapUv),L.push(b.specularColorMapUv),L.push(b.specularIntensityMapUv),L.push(b.transmissionMapUv),L.push(b.thicknessMapUv),L.push(b.combine),L.push(b.fogExp2),L.push(b.sizeAttenuation),L.push(b.morphTargetsCount),L.push(b.morphAttributeCount),L.push(b.numDirLights),L.push(b.numPointLights),L.push(b.numSpotLights),L.push(b.numSpotLightMaps),L.push(b.numHemiLights),L.push(b.numRectAreaLights),L.push(b.numDirLightShadows),L.push(b.numPointLightShadows),L.push(b.numSpotLightShadows),L.push(b.numSpotLightShadowsWithMaps),L.push(b.numLightProbes),L.push(b.shadowMapType),L.push(b.toneMapping),L.push(b.numClippingPlanes),L.push(b.numClipIntersection),L.push(b.depthPacking)}function D(L,b){u.disableAll(),b.supportsVertexTextures&&u.enable(0),b.instancing&&u.enable(1),b.instancingColor&&u.enable(2),b.instancingMorph&&u.enable(3),b.matcap&&u.enable(4),b.envMap&&u.enable(5),b.normalMapObjectSpace&&u.enable(6),b.normalMapTangentSpace&&u.enable(7),b.clearcoat&&u.enable(8),b.iridescence&&u.enable(9),b.alphaTest&&u.enable(10),b.vertexColors&&u.enable(11),b.vertexAlphas&&u.enable(12),b.vertexUv1s&&u.enable(13),b.vertexUv2s&&u.enable(14),b.vertexUv3s&&u.enable(15),b.vertexTangents&&u.enable(16),b.anisotropy&&u.enable(17),b.alphaHash&&u.enable(18),b.batching&&u.enable(19),b.dispersion&&u.enable(20),b.batchingColor&&u.enable(21),L.push(u.mask),u.disableAll(),b.fog&&u.enable(0),b.useFog&&u.enable(1),b.flatShading&&u.enable(2),b.logarithmicDepthBuffer&&u.enable(3),b.reverseDepthBuffer&&u.enable(4),b.skinning&&u.enable(5),b.morphTargets&&u.enable(6),b.morphNormals&&u.enable(7),b.morphColors&&u.enable(8),b.premultipliedAlpha&&u.enable(9),b.shadowMapEnabled&&u.enable(10),b.doubleSided&&u.enable(11),b.flipSided&&u.enable(12),b.useDepthPacking&&u.enable(13),b.dithering&&u.enable(14),b.transmission&&u.enable(15),b.sheen&&u.enable(16),b.opaque&&u.enable(17),b.pointsUvs&&u.enable(18),b.decodeVideoTexture&&u.enable(19),b.decodeVideoTextureEmissive&&u.enable(20),b.alphaToCoverage&&u.enable(21),L.push(u.mask)}function A(L){const b=T[L.type];let U;if(b){const N=vr[b];U=G_.clone(N.uniforms)}else U=L.uniforms;return U}function G(L,b){let U;for(let N=0,I=v.length;N<I;N++){const ae=v[N];if(ae.cacheKey===b){U=ae,++U.usedTimes;break}}return U===void 0&&(U=new uE(s,b,L,c),v.push(U)),U}function O(L){if(--L.usedTimes===0){const b=v.indexOf(L);v[b]=v[v.length-1],v.pop(),L.destroy()}}function z(L){h.remove(L)}function $(){h.dispose()}return{getParameters:_,getProgramCacheKey:g,getUniforms:A,acquireProgram:G,releaseProgram:O,releaseShaderCache:z,programs:v,dispose:$}}function mE(){let s=new WeakMap;function e(f){return s.has(f)}function n(f){let u=s.get(f);return u===void 0&&(u={},s.set(f,u)),u}function r(f){s.delete(f)}function a(f,u,h){s.get(f)[u]=h}function c(){s=new WeakMap}return{has:e,get:n,remove:r,update:a,dispose:c}}function gE(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Ug(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Ng(){const s=[];let e=0;const n=[],r=[],a=[];function c(){e=0,n.length=0,r.length=0,a.length=0}function f(x,y,S,T,E,_){let g=s[e];return g===void 0?(g={id:x.id,object:x,geometry:y,material:S,groupOrder:T,renderOrder:x.renderOrder,z:E,group:_},s[e]=g):(g.id=x.id,g.object=x,g.geometry=y,g.material=S,g.groupOrder=T,g.renderOrder=x.renderOrder,g.z=E,g.group=_),e++,g}function u(x,y,S,T,E,_){const g=f(x,y,S,T,E,_);S.transmission>0?r.push(g):S.transparent===!0?a.push(g):n.push(g)}function h(x,y,S,T,E,_){const g=f(x,y,S,T,E,_);S.transmission>0?r.unshift(g):S.transparent===!0?a.unshift(g):n.unshift(g)}function p(x,y){n.length>1&&n.sort(x||gE),r.length>1&&r.sort(y||Ug),a.length>1&&a.sort(y||Ug)}function v(){for(let x=e,y=s.length;x<y;x++){const S=s[x];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:n,transmissive:r,transparent:a,init:c,push:u,unshift:h,finish:v,sort:p}}function vE(){let s=new WeakMap;function e(r,a){const c=s.get(r);let f;return c===void 0?(f=new Ng,s.set(r,[f])):a>=c.length?(f=new Ng,c.push(f)):f=c[a],f}function n(){s=new WeakMap}return{get:e,dispose:n}}function _E(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let n;switch(e.type){case"DirectionalLight":n={direction:new ee,color:new Ct};break;case"SpotLight":n={position:new ee,direction:new ee,color:new Ct,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":n={position:new ee,color:new Ct,distance:0,decay:0};break;case"HemisphereLight":n={direction:new ee,skyColor:new Ct,groundColor:new Ct};break;case"RectAreaLight":n={color:new Ct,position:new ee,halfWidth:new ee,halfHeight:new ee};break}return s[e.id]=n,n}}}function xE(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let n;switch(e.type){case"DirectionalLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new It};break;case"SpotLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new It};break;case"PointLight":n={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new It,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=n,n}}}let yE=0;function SE(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function ME(s){const e=new _E,n=xE(),r={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let p=0;p<9;p++)r.probe.push(new ee);const a=new ee,c=new dn,f=new dn;function u(p){let v=0,x=0,y=0;for(let L=0;L<9;L++)r.probe[L].set(0,0,0);let S=0,T=0,E=0,_=0,g=0,F=0,D=0,A=0,G=0,O=0,z=0;p.sort(SE);for(let L=0,b=p.length;L<b;L++){const U=p[L],N=U.color,I=U.intensity,ae=U.distance,re=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)v+=N.r*I,x+=N.g*I,y+=N.b*I;else if(U.isLightProbe){for(let ce=0;ce<9;ce++)r.probe[ce].addScaledVector(U.sh.coefficients[ce],I);z++}else if(U.isDirectionalLight){const ce=e.get(U);if(ce.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const fe=U.shadow,H=n.get(U);H.shadowIntensity=fe.intensity,H.shadowBias=fe.bias,H.shadowNormalBias=fe.normalBias,H.shadowRadius=fe.radius,H.shadowMapSize=fe.mapSize,r.directionalShadow[S]=H,r.directionalShadowMap[S]=re,r.directionalShadowMatrix[S]=U.shadow.matrix,F++}r.directional[S]=ce,S++}else if(U.isSpotLight){const ce=e.get(U);ce.position.setFromMatrixPosition(U.matrixWorld),ce.color.copy(N).multiplyScalar(I),ce.distance=ae,ce.coneCos=Math.cos(U.angle),ce.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),ce.decay=U.decay,r.spot[E]=ce;const fe=U.shadow;if(U.map&&(r.spotLightMap[G]=U.map,G++,fe.updateMatrices(U),U.castShadow&&O++),r.spotLightMatrix[E]=fe.matrix,U.castShadow){const H=n.get(U);H.shadowIntensity=fe.intensity,H.shadowBias=fe.bias,H.shadowNormalBias=fe.normalBias,H.shadowRadius=fe.radius,H.shadowMapSize=fe.mapSize,r.spotShadow[E]=H,r.spotShadowMap[E]=re,A++}E++}else if(U.isRectAreaLight){const ce=e.get(U);ce.color.copy(N).multiplyScalar(I),ce.halfWidth.set(U.width*.5,0,0),ce.halfHeight.set(0,U.height*.5,0),r.rectArea[_]=ce,_++}else if(U.isPointLight){const ce=e.get(U);if(ce.color.copy(U.color).multiplyScalar(U.intensity),ce.distance=U.distance,ce.decay=U.decay,U.castShadow){const fe=U.shadow,H=n.get(U);H.shadowIntensity=fe.intensity,H.shadowBias=fe.bias,H.shadowNormalBias=fe.normalBias,H.shadowRadius=fe.radius,H.shadowMapSize=fe.mapSize,H.shadowCameraNear=fe.camera.near,H.shadowCameraFar=fe.camera.far,r.pointShadow[T]=H,r.pointShadowMap[T]=re,r.pointShadowMatrix[T]=U.shadow.matrix,D++}r.point[T]=ce,T++}else if(U.isHemisphereLight){const ce=e.get(U);ce.skyColor.copy(U.color).multiplyScalar(I),ce.groundColor.copy(U.groundColor).multiplyScalar(I),r.hemi[g]=ce,g++}}_>0&&(s.has("OES_texture_float_linear")===!0?(r.rectAreaLTC1=We.LTC_FLOAT_1,r.rectAreaLTC2=We.LTC_FLOAT_2):(r.rectAreaLTC1=We.LTC_HALF_1,r.rectAreaLTC2=We.LTC_HALF_2)),r.ambient[0]=v,r.ambient[1]=x,r.ambient[2]=y;const $=r.hash;($.directionalLength!==S||$.pointLength!==T||$.spotLength!==E||$.rectAreaLength!==_||$.hemiLength!==g||$.numDirectionalShadows!==F||$.numPointShadows!==D||$.numSpotShadows!==A||$.numSpotMaps!==G||$.numLightProbes!==z)&&(r.directional.length=S,r.spot.length=E,r.rectArea.length=_,r.point.length=T,r.hemi.length=g,r.directionalShadow.length=F,r.directionalShadowMap.length=F,r.pointShadow.length=D,r.pointShadowMap.length=D,r.spotShadow.length=A,r.spotShadowMap.length=A,r.directionalShadowMatrix.length=F,r.pointShadowMatrix.length=D,r.spotLightMatrix.length=A+G-O,r.spotLightMap.length=G,r.numSpotLightShadowsWithMaps=O,r.numLightProbes=z,$.directionalLength=S,$.pointLength=T,$.spotLength=E,$.rectAreaLength=_,$.hemiLength=g,$.numDirectionalShadows=F,$.numPointShadows=D,$.numSpotShadows=A,$.numSpotMaps=G,$.numLightProbes=z,r.version=yE++)}function h(p,v){let x=0,y=0,S=0,T=0,E=0;const _=v.matrixWorldInverse;for(let g=0,F=p.length;g<F;g++){const D=p[g];if(D.isDirectionalLight){const A=r.directional[x];A.direction.setFromMatrixPosition(D.matrixWorld),a.setFromMatrixPosition(D.target.matrixWorld),A.direction.sub(a),A.direction.transformDirection(_),x++}else if(D.isSpotLight){const A=r.spot[S];A.position.setFromMatrixPosition(D.matrixWorld),A.position.applyMatrix4(_),A.direction.setFromMatrixPosition(D.matrixWorld),a.setFromMatrixPosition(D.target.matrixWorld),A.direction.sub(a),A.direction.transformDirection(_),S++}else if(D.isRectAreaLight){const A=r.rectArea[T];A.position.setFromMatrixPosition(D.matrixWorld),A.position.applyMatrix4(_),f.identity(),c.copy(D.matrixWorld),c.premultiply(_),f.extractRotation(c),A.halfWidth.set(D.width*.5,0,0),A.halfHeight.set(0,D.height*.5,0),A.halfWidth.applyMatrix4(f),A.halfHeight.applyMatrix4(f),T++}else if(D.isPointLight){const A=r.point[y];A.position.setFromMatrixPosition(D.matrixWorld),A.position.applyMatrix4(_),y++}else if(D.isHemisphereLight){const A=r.hemi[E];A.direction.setFromMatrixPosition(D.matrixWorld),A.direction.transformDirection(_),E++}}}return{setup:u,setupView:h,state:r}}function Fg(s){const e=new ME(s),n=[],r=[];function a(v){p.camera=v,n.length=0,r.length=0}function c(v){n.push(v)}function f(v){r.push(v)}function u(){e.setup(n)}function h(v){e.setupView(n,v)}const p={lightsArray:n,shadowsArray:r,camera:null,lights:e,transmissionRenderTarget:{}};return{init:a,state:p,setupLights:u,setupLightsView:h,pushLight:c,pushShadow:f}}function EE(s){let e=new WeakMap;function n(a,c=0){const f=e.get(a);let u;return f===void 0?(u=new Fg(s),e.set(a,[u])):c>=f.length?(u=new Fg(s),f.push(u)):u=f[c],u}function r(){e=new WeakMap}return{get:n,dispose:r}}const TE=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,wE=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function RE(s,e,n){let r=new v0;const a=new It,c=new It,f=new _n,u=new Q_({depthPacking:f_}),h=new ex,p={},v=n.maxTextureSize,x={[Is]:pi,[pi]:Is,[Hi]:Hi},y=new Sr({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new It},radius:{value:4}},vertexShader:TE,fragmentShader:wE}),S=y.clone();S.defines.HORIZONTAL_PASS=1;const T=new Dn;T.setAttribute("position",new wi(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const E=new ni(T,y),_=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=jg;let g=this.type;this.render=function(O,z,$){if(_.enabled===!1||_.autoUpdate===!1&&_.needsUpdate===!1||O.length===0)return;const L=s.getRenderTarget(),b=s.getActiveCubeFace(),U=s.getActiveMipmapLevel(),N=s.state;N.setBlending(Ps),N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const I=g!==Gr&&this.type===Gr,ae=g===Gr&&this.type!==Gr;for(let re=0,ce=O.length;re<ce;re++){const fe=O[re],H=fe.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",fe,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;a.copy(H.mapSize);const te=H.getFrameExtents();if(a.multiply(te),c.copy(H.mapSize),(a.x>v||a.y>v)&&(a.x>v&&(c.x=Math.floor(v/te.x),a.x=c.x*te.x,H.mapSize.x=c.x),a.y>v&&(c.y=Math.floor(v/te.y),a.y=c.y*te.y,H.mapSize.y=c.y)),H.map===null||I===!0||ae===!0){const B=this.type!==Gr?{minFilter:Ti,magFilter:Ti}:{};H.map!==null&&H.map.dispose(),H.map=new yo(a.x,a.y,B),H.map.texture.name=fe.name+".shadowMap",H.camera.updateProjectionMatrix()}s.setRenderTarget(H.map),s.clear();const se=H.getViewportCount();for(let B=0;B<se;B++){const oe=H.getViewport(B);f.set(c.x*oe.x,c.y*oe.y,c.x*oe.z,c.y*oe.w),N.viewport(f),H.updateMatrices(fe,B),r=H.getFrustum(),A(z,$,H.camera,fe,this.type)}H.isPointLightShadow!==!0&&this.type===Gr&&F(H,$),H.needsUpdate=!1}g=this.type,_.needsUpdate=!1,s.setRenderTarget(L,b,U)};function F(O,z){const $=e.update(E);y.defines.VSM_SAMPLES!==O.blurSamples&&(y.defines.VSM_SAMPLES=O.blurSamples,S.defines.VSM_SAMPLES=O.blurSamples,y.needsUpdate=!0,S.needsUpdate=!0),O.mapPass===null&&(O.mapPass=new yo(a.x,a.y)),y.uniforms.shadow_pass.value=O.map.texture,y.uniforms.resolution.value=O.mapSize,y.uniforms.radius.value=O.radius,s.setRenderTarget(O.mapPass),s.clear(),s.renderBufferDirect(z,null,$,y,E,null),S.uniforms.shadow_pass.value=O.mapPass.texture,S.uniforms.resolution.value=O.mapSize,S.uniforms.radius.value=O.radius,s.setRenderTarget(O.map),s.clear(),s.renderBufferDirect(z,null,$,S,E,null)}function D(O,z,$,L){let b=null;const U=$.isPointLight===!0?O.customDistanceMaterial:O.customDepthMaterial;if(U!==void 0)b=U;else if(b=$.isPointLight===!0?h:u,s.localClippingEnabled&&z.clipShadows===!0&&Array.isArray(z.clippingPlanes)&&z.clippingPlanes.length!==0||z.displacementMap&&z.displacementScale!==0||z.alphaMap&&z.alphaTest>0||z.map&&z.alphaTest>0){const N=b.uuid,I=z.uuid;let ae=p[N];ae===void 0&&(ae={},p[N]=ae);let re=ae[I];re===void 0&&(re=b.clone(),ae[I]=re,z.addEventListener("dispose",G)),b=re}if(b.visible=z.visible,b.wireframe=z.wireframe,L===Gr?b.side=z.shadowSide!==null?z.shadowSide:z.side:b.side=z.shadowSide!==null?z.shadowSide:x[z.side],b.alphaMap=z.alphaMap,b.alphaTest=z.alphaTest,b.map=z.map,b.clipShadows=z.clipShadows,b.clippingPlanes=z.clippingPlanes,b.clipIntersection=z.clipIntersection,b.displacementMap=z.displacementMap,b.displacementScale=z.displacementScale,b.displacementBias=z.displacementBias,b.wireframeLinewidth=z.wireframeLinewidth,b.linewidth=z.linewidth,$.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const N=s.properties.get(b);N.light=$}return b}function A(O,z,$,L,b){if(O.visible===!1)return;if(O.layers.test(z.layers)&&(O.isMesh||O.isLine||O.isPoints)&&(O.castShadow||O.receiveShadow&&b===Gr)&&(!O.frustumCulled||r.intersectsObject(O))){O.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,O.matrixWorld);const I=e.update(O),ae=O.material;if(Array.isArray(ae)){const re=I.groups;for(let ce=0,fe=re.length;ce<fe;ce++){const H=re[ce],te=ae[H.materialIndex];if(te&&te.visible){const se=D(O,te,L,b);O.onBeforeShadow(s,O,z,$,I,se,H),s.renderBufferDirect($,null,I,se,O,H),O.onAfterShadow(s,O,z,$,I,se,H)}}}else if(ae.visible){const re=D(O,ae,L,b);O.onBeforeShadow(s,O,z,$,I,re,null),s.renderBufferDirect($,null,I,re,O,null),O.onAfterShadow(s,O,z,$,I,re,null)}}const N=O.children;for(let I=0,ae=N.length;I<ae;I++)A(N[I],z,$,L,b)}function G(O){O.target.removeEventListener("dispose",G);for(const $ in p){const L=p[$],b=O.target.uuid;b in L&&(L[b].dispose(),delete L[b])}}}const AE={[Fd]:Od,[kd]:Hd,[Bd]:Vd,[Ta]:zd,[Od]:Fd,[Hd]:kd,[Vd]:Bd,[zd]:Ta};function bE(s,e){function n(){let q=!1;const Oe=new _n;let ve=null;const ye=new _n(0,0,0,0);return{setMask:function(He){ve!==He&&!q&&(s.colorMask(He,He,He,He),ve=He)},setLocked:function(He){q=He},setClear:function(He,Ve,ft,Vt,hn){hn===!0&&(He*=Vt,Ve*=Vt,ft*=Vt),Oe.set(He,Ve,ft,Vt),ye.equals(Oe)===!1&&(s.clearColor(He,Ve,ft,Vt),ye.copy(Oe))},reset:function(){q=!1,ve=null,ye.set(-1,0,0,0)}}}function r(){let q=!1,Oe=!1,ve=null,ye=null,He=null;return{setReversed:function(Ve){if(Oe!==Ve){const ft=e.get("EXT_clip_control");Oe?ft.clipControlEXT(ft.LOWER_LEFT_EXT,ft.ZERO_TO_ONE_EXT):ft.clipControlEXT(ft.LOWER_LEFT_EXT,ft.NEGATIVE_ONE_TO_ONE_EXT);const Vt=He;He=null,this.setClear(Vt)}Oe=Ve},getReversed:function(){return Oe},setTest:function(Ve){Ve?xe(s.DEPTH_TEST):Re(s.DEPTH_TEST)},setMask:function(Ve){ve!==Ve&&!q&&(s.depthMask(Ve),ve=Ve)},setFunc:function(Ve){if(Oe&&(Ve=AE[Ve]),ye!==Ve){switch(Ve){case Fd:s.depthFunc(s.NEVER);break;case Od:s.depthFunc(s.ALWAYS);break;case kd:s.depthFunc(s.LESS);break;case Ta:s.depthFunc(s.LEQUAL);break;case Bd:s.depthFunc(s.EQUAL);break;case zd:s.depthFunc(s.GEQUAL);break;case Hd:s.depthFunc(s.GREATER);break;case Vd:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ye=Ve}},setLocked:function(Ve){q=Ve},setClear:function(Ve){He!==Ve&&(Oe&&(Ve=1-Ve),s.clearDepth(Ve),He=Ve)},reset:function(){q=!1,ve=null,ye=null,He=null,Oe=!1}}}function a(){let q=!1,Oe=null,ve=null,ye=null,He=null,Ve=null,ft=null,Vt=null,hn=null;return{setTest:function(Pt){q||(Pt?xe(s.STENCIL_TEST):Re(s.STENCIL_TEST))},setMask:function(Pt){Oe!==Pt&&!q&&(s.stencilMask(Pt),Oe=Pt)},setFunc:function(Pt,Bn,In){(ve!==Pt||ye!==Bn||He!==In)&&(s.stencilFunc(Pt,Bn,In),ve=Pt,ye=Bn,He=In)},setOp:function(Pt,Bn,In){(Ve!==Pt||ft!==Bn||Vt!==In)&&(s.stencilOp(Pt,Bn,In),Ve=Pt,ft=Bn,Vt=In)},setLocked:function(Pt){q=Pt},setClear:function(Pt){hn!==Pt&&(s.clearStencil(Pt),hn=Pt)},reset:function(){q=!1,Oe=null,ve=null,ye=null,He=null,Ve=null,ft=null,Vt=null,hn=null}}}const c=new n,f=new r,u=new a,h=new WeakMap,p=new WeakMap;let v={},x={},y=new WeakMap,S=[],T=null,E=!1,_=null,g=null,F=null,D=null,A=null,G=null,O=null,z=new Ct(0,0,0),$=0,L=!1,b=null,U=null,N=null,I=null,ae=null;const re=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let ce=!1,fe=0;const H=s.getParameter(s.VERSION);H.indexOf("WebGL")!==-1?(fe=parseFloat(/^WebGL (\d)/.exec(H)[1]),ce=fe>=1):H.indexOf("OpenGL ES")!==-1&&(fe=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),ce=fe>=2);let te=null,se={};const B=s.getParameter(s.SCISSOR_BOX),oe=s.getParameter(s.VIEWPORT),be=new _n().fromArray(B),Q=new _n().fromArray(oe);function me(q,Oe,ve,ye){const He=new Uint8Array(4),Ve=s.createTexture();s.bindTexture(q,Ve),s.texParameteri(q,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(q,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let ft=0;ft<ve;ft++)q===s.TEXTURE_3D||q===s.TEXTURE_2D_ARRAY?s.texImage3D(Oe,0,s.RGBA,1,1,ye,0,s.RGBA,s.UNSIGNED_BYTE,He):s.texImage2D(Oe+ft,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,He);return Ve}const Me={};Me[s.TEXTURE_2D]=me(s.TEXTURE_2D,s.TEXTURE_2D,1),Me[s.TEXTURE_CUBE_MAP]=me(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Me[s.TEXTURE_2D_ARRAY]=me(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Me[s.TEXTURE_3D]=me(s.TEXTURE_3D,s.TEXTURE_3D,1,1),c.setClear(0,0,0,1),f.setClear(1),u.setClear(0),xe(s.DEPTH_TEST),f.setFunc(Ta),_e(!1),Ue(zm),xe(s.CULL_FACE),V(Ps);function xe(q){v[q]!==!0&&(s.enable(q),v[q]=!0)}function Re(q){v[q]!==!1&&(s.disable(q),v[q]=!1)}function Ne(q,Oe){return x[q]!==Oe?(s.bindFramebuffer(q,Oe),x[q]=Oe,q===s.DRAW_FRAMEBUFFER&&(x[s.FRAMEBUFFER]=Oe),q===s.FRAMEBUFFER&&(x[s.DRAW_FRAMEBUFFER]=Oe),!0):!1}function ke(q,Oe){let ve=S,ye=!1;if(q){ve=y.get(Oe),ve===void 0&&(ve=[],y.set(Oe,ve));const He=q.textures;if(ve.length!==He.length||ve[0]!==s.COLOR_ATTACHMENT0){for(let Ve=0,ft=He.length;Ve<ft;Ve++)ve[Ve]=s.COLOR_ATTACHMENT0+Ve;ve.length=He.length,ye=!0}}else ve[0]!==s.BACK&&(ve[0]=s.BACK,ye=!0);ye&&s.drawBuffers(ve)}function vt(q){return T!==q?(s.useProgram(q),T=q,!0):!1}const tt={[mo]:s.FUNC_ADD,[Ov]:s.FUNC_SUBTRACT,[kv]:s.FUNC_REVERSE_SUBTRACT};tt[Bv]=s.MIN,tt[zv]=s.MAX;const _t={[Hv]:s.ZERO,[Vv]:s.ONE,[Gv]:s.SRC_COLOR,[Ud]:s.SRC_ALPHA,[$v]:s.SRC_ALPHA_SATURATE,[Yv]:s.DST_COLOR,[Xv]:s.DST_ALPHA,[Wv]:s.ONE_MINUS_SRC_COLOR,[Nd]:s.ONE_MINUS_SRC_ALPHA,[qv]:s.ONE_MINUS_DST_COLOR,[jv]:s.ONE_MINUS_DST_ALPHA,[Kv]:s.CONSTANT_COLOR,[Zv]:s.ONE_MINUS_CONSTANT_COLOR,[Jv]:s.CONSTANT_ALPHA,[Qv]:s.ONE_MINUS_CONSTANT_ALPHA};function V(q,Oe,ve,ye,He,Ve,ft,Vt,hn,Pt){if(q===Ps){E===!0&&(Re(s.BLEND),E=!1);return}if(E===!1&&(xe(s.BLEND),E=!0),q!==Fv){if(q!==_||Pt!==L){if((g!==mo||A!==mo)&&(s.blendEquation(s.FUNC_ADD),g=mo,A=mo),Pt)switch(q){case Sa:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Id:s.blendFunc(s.ONE,s.ONE);break;case Hm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vm:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",q);break}else switch(q){case Sa:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Id:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case Hm:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Vm:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",q);break}F=null,D=null,G=null,O=null,z.set(0,0,0),$=0,_=q,L=Pt}return}He=He||Oe,Ve=Ve||ve,ft=ft||ye,(Oe!==g||He!==A)&&(s.blendEquationSeparate(tt[Oe],tt[He]),g=Oe,A=He),(ve!==F||ye!==D||Ve!==G||ft!==O)&&(s.blendFuncSeparate(_t[ve],_t[ye],_t[Ve],_t[ft]),F=ve,D=ye,G=Ve,O=ft),(Vt.equals(z)===!1||hn!==$)&&(s.blendColor(Vt.r,Vt.g,Vt.b,hn),z.copy(Vt),$=hn),_=q,L=!1}function St(q,Oe){q.side===Hi?Re(s.CULL_FACE):xe(s.CULL_FACE);let ve=q.side===pi;Oe&&(ve=!ve),_e(ve),q.blending===Sa&&q.transparent===!1?V(Ps):V(q.blending,q.blendEquation,q.blendSrc,q.blendDst,q.blendEquationAlpha,q.blendSrcAlpha,q.blendDstAlpha,q.blendColor,q.blendAlpha,q.premultipliedAlpha),f.setFunc(q.depthFunc),f.setTest(q.depthTest),f.setMask(q.depthWrite),c.setMask(q.colorWrite);const ye=q.stencilWrite;u.setTest(ye),ye&&(u.setMask(q.stencilWriteMask),u.setFunc(q.stencilFunc,q.stencilRef,q.stencilFuncMask),u.setOp(q.stencilFail,q.stencilZFail,q.stencilZPass)),Le(q.polygonOffset,q.polygonOffsetFactor,q.polygonOffsetUnits),q.alphaToCoverage===!0?xe(s.SAMPLE_ALPHA_TO_COVERAGE):Re(s.SAMPLE_ALPHA_TO_COVERAGE)}function _e(q){b!==q&&(q?s.frontFace(s.CW):s.frontFace(s.CCW),b=q)}function Ue(q){q!==Iv?(xe(s.CULL_FACE),q!==U&&(q===zm?s.cullFace(s.BACK):q===Uv?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Re(s.CULL_FACE),U=q}function de(q){q!==N&&(ce&&s.lineWidth(q),N=q)}function Le(q,Oe,ve){q?(xe(s.POLYGON_OFFSET_FILL),(I!==Oe||ae!==ve)&&(s.polygonOffset(Oe,ve),I=Oe,ae=ve)):Re(s.POLYGON_OFFSET_FILL)}function Se(q){q?xe(s.SCISSOR_TEST):Re(s.SCISSOR_TEST)}function C(q){q===void 0&&(q=s.TEXTURE0+re-1),te!==q&&(s.activeTexture(q),te=q)}function R(q,Oe,ve){ve===void 0&&(te===null?ve=s.TEXTURE0+re-1:ve=te);let ye=se[ve];ye===void 0&&(ye={type:void 0,texture:void 0},se[ve]=ye),(ye.type!==q||ye.texture!==Oe)&&(te!==ve&&(s.activeTexture(ve),te=ve),s.bindTexture(q,Oe||Me[q]),ye.type=q,ye.texture=Oe)}function W(){const q=se[te];q!==void 0&&q.type!==void 0&&(s.bindTexture(q.type,null),q.type=void 0,q.texture=void 0)}function ie(){try{s.compressedTexImage2D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function ge(){try{s.compressedTexImage3D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function pe(){try{s.texSubImage2D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Fe(){try{s.texSubImage3D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Ce(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Be(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function ot(){try{s.texStorage2D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Te(){try{s.texStorage3D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function Xe(){try{s.texImage2D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function it(){try{s.texImage3D.apply(s,arguments)}catch(q){console.error("THREE.WebGLState:",q)}}function rt(q){be.equals(q)===!1&&(s.scissor(q.x,q.y,q.z,q.w),be.copy(q))}function Ye(q){Q.equals(q)===!1&&(s.viewport(q.x,q.y,q.z,q.w),Q.copy(q))}function mt(q,Oe){let ve=p.get(Oe);ve===void 0&&(ve=new WeakMap,p.set(Oe,ve));let ye=ve.get(q);ye===void 0&&(ye=s.getUniformBlockIndex(Oe,q.name),ve.set(q,ye))}function ht(q,Oe){const ye=p.get(Oe).get(q);h.get(Oe)!==ye&&(s.uniformBlockBinding(Oe,ye,q.__bindingPointIndex),h.set(Oe,ye))}function wt(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),f.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),v={},te=null,se={},x={},y=new WeakMap,S=[],T=null,E=!1,_=null,g=null,F=null,D=null,A=null,G=null,O=null,z=new Ct(0,0,0),$=0,L=!1,b=null,U=null,N=null,I=null,ae=null,be.set(0,0,s.canvas.width,s.canvas.height),Q.set(0,0,s.canvas.width,s.canvas.height),c.reset(),f.reset(),u.reset()}return{buffers:{color:c,depth:f,stencil:u},enable:xe,disable:Re,bindFramebuffer:Ne,drawBuffers:ke,useProgram:vt,setBlending:V,setMaterial:St,setFlipSided:_e,setCullFace:Ue,setLineWidth:de,setPolygonOffset:Le,setScissorTest:Se,activeTexture:C,bindTexture:R,unbindTexture:W,compressedTexImage2D:ie,compressedTexImage3D:ge,texImage2D:Xe,texImage3D:it,updateUBOMapping:mt,uniformBlockBinding:ht,texStorage2D:ot,texStorage3D:Te,texSubImage2D:pe,texSubImage3D:Fe,compressedTexSubImage2D:Ce,compressedTexSubImage3D:Be,scissor:rt,viewport:Ye,reset:wt}}function CE(s,e,n,r,a,c,f){const u=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,h=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),p=new It,v=new WeakMap;let x;const y=new WeakMap;let S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(C,R){return S?new OffscreenCanvas(C,R):fu("canvas")}function E(C,R,W){let ie=1;const ge=Se(C);if((ge.width>W||ge.height>W)&&(ie=W/Math.max(ge.width,ge.height)),ie<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const pe=Math.floor(ie*ge.width),Fe=Math.floor(ie*ge.height);x===void 0&&(x=T(pe,Fe));const Ce=R?T(pe,Fe):x;return Ce.width=pe,Ce.height=Fe,Ce.getContext("2d").drawImage(C,0,0,pe,Fe),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ge.width+"x"+ge.height+") to ("+pe+"x"+Fe+")."),Ce}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ge.width+"x"+ge.height+")."),C;return C}function _(C){return C.generateMipmaps}function g(C){s.generateMipmap(C)}function F(C){return C.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?s.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function D(C,R,W,ie,ge=!1){if(C!==null){if(s[C]!==void 0)return s[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let pe=R;if(R===s.RED&&(W===s.FLOAT&&(pe=s.R32F),W===s.HALF_FLOAT&&(pe=s.R16F),W===s.UNSIGNED_BYTE&&(pe=s.R8)),R===s.RED_INTEGER&&(W===s.UNSIGNED_BYTE&&(pe=s.R8UI),W===s.UNSIGNED_SHORT&&(pe=s.R16UI),W===s.UNSIGNED_INT&&(pe=s.R32UI),W===s.BYTE&&(pe=s.R8I),W===s.SHORT&&(pe=s.R16I),W===s.INT&&(pe=s.R32I)),R===s.RG&&(W===s.FLOAT&&(pe=s.RG32F),W===s.HALF_FLOAT&&(pe=s.RG16F),W===s.UNSIGNED_BYTE&&(pe=s.RG8)),R===s.RG_INTEGER&&(W===s.UNSIGNED_BYTE&&(pe=s.RG8UI),W===s.UNSIGNED_SHORT&&(pe=s.RG16UI),W===s.UNSIGNED_INT&&(pe=s.RG32UI),W===s.BYTE&&(pe=s.RG8I),W===s.SHORT&&(pe=s.RG16I),W===s.INT&&(pe=s.RG32I)),R===s.RGB_INTEGER&&(W===s.UNSIGNED_BYTE&&(pe=s.RGB8UI),W===s.UNSIGNED_SHORT&&(pe=s.RGB16UI),W===s.UNSIGNED_INT&&(pe=s.RGB32UI),W===s.BYTE&&(pe=s.RGB8I),W===s.SHORT&&(pe=s.RGB16I),W===s.INT&&(pe=s.RGB32I)),R===s.RGBA_INTEGER&&(W===s.UNSIGNED_BYTE&&(pe=s.RGBA8UI),W===s.UNSIGNED_SHORT&&(pe=s.RGBA16UI),W===s.UNSIGNED_INT&&(pe=s.RGBA32UI),W===s.BYTE&&(pe=s.RGBA8I),W===s.SHORT&&(pe=s.RGBA16I),W===s.INT&&(pe=s.RGBA32I)),R===s.RGB&&W===s.UNSIGNED_INT_5_9_9_9_REV&&(pe=s.RGB9_E5),R===s.RGBA){const Fe=ge?cu:Ft.getTransfer(ie);W===s.FLOAT&&(pe=s.RGBA32F),W===s.HALF_FLOAT&&(pe=s.RGBA16F),W===s.UNSIGNED_BYTE&&(pe=Fe===zt?s.SRGB8_ALPHA8:s.RGBA8),W===s.UNSIGNED_SHORT_4_4_4_4&&(pe=s.RGBA4),W===s.UNSIGNED_SHORT_5_5_5_1&&(pe=s.RGB5_A1)}return(pe===s.R16F||pe===s.R32F||pe===s.RG16F||pe===s.RG32F||pe===s.RGBA16F||pe===s.RGBA32F)&&e.get("EXT_color_buffer_float"),pe}function A(C,R){let W;return C?R===null||R===xo||R===Aa?W=s.DEPTH24_STENCIL8:R===yr?W=s.DEPTH32F_STENCIL8:R===vl&&(W=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):R===null||R===xo||R===Aa?W=s.DEPTH_COMPONENT24:R===yr?W=s.DEPTH_COMPONENT32F:R===vl&&(W=s.DEPTH_COMPONENT16),W}function G(C,R){return _(C)===!0||C.isFramebufferTexture&&C.minFilter!==Ti&&C.minFilter!==Gi?Math.log2(Math.max(R.width,R.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?R.mipmaps.length:1}function O(C){const R=C.target;R.removeEventListener("dispose",O),$(R),R.isVideoTexture&&v.delete(R)}function z(C){const R=C.target;R.removeEventListener("dispose",z),b(R)}function $(C){const R=r.get(C);if(R.__webglInit===void 0)return;const W=C.source,ie=y.get(W);if(ie){const ge=ie[R.__cacheKey];ge.usedTimes--,ge.usedTimes===0&&L(C),Object.keys(ie).length===0&&y.delete(W)}r.remove(C)}function L(C){const R=r.get(C);s.deleteTexture(R.__webglTexture);const W=C.source,ie=y.get(W);delete ie[R.__cacheKey],f.memory.textures--}function b(C){const R=r.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),r.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let ie=0;ie<6;ie++){if(Array.isArray(R.__webglFramebuffer[ie]))for(let ge=0;ge<R.__webglFramebuffer[ie].length;ge++)s.deleteFramebuffer(R.__webglFramebuffer[ie][ge]);else s.deleteFramebuffer(R.__webglFramebuffer[ie]);R.__webglDepthbuffer&&s.deleteRenderbuffer(R.__webglDepthbuffer[ie])}else{if(Array.isArray(R.__webglFramebuffer))for(let ie=0;ie<R.__webglFramebuffer.length;ie++)s.deleteFramebuffer(R.__webglFramebuffer[ie]);else s.deleteFramebuffer(R.__webglFramebuffer);if(R.__webglDepthbuffer&&s.deleteRenderbuffer(R.__webglDepthbuffer),R.__webglMultisampledFramebuffer&&s.deleteFramebuffer(R.__webglMultisampledFramebuffer),R.__webglColorRenderbuffer)for(let ie=0;ie<R.__webglColorRenderbuffer.length;ie++)R.__webglColorRenderbuffer[ie]&&s.deleteRenderbuffer(R.__webglColorRenderbuffer[ie]);R.__webglDepthRenderbuffer&&s.deleteRenderbuffer(R.__webglDepthRenderbuffer)}const W=C.textures;for(let ie=0,ge=W.length;ie<ge;ie++){const pe=r.get(W[ie]);pe.__webglTexture&&(s.deleteTexture(pe.__webglTexture),f.memory.textures--),r.remove(W[ie])}r.remove(C)}let U=0;function N(){U=0}function I(){const C=U;return C>=a.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+a.maxTextures),U+=1,C}function ae(C){const R=[];return R.push(C.wrapS),R.push(C.wrapT),R.push(C.wrapR||0),R.push(C.magFilter),R.push(C.minFilter),R.push(C.anisotropy),R.push(C.internalFormat),R.push(C.format),R.push(C.type),R.push(C.generateMipmaps),R.push(C.premultiplyAlpha),R.push(C.flipY),R.push(C.unpackAlignment),R.push(C.colorSpace),R.join()}function re(C,R){const W=r.get(C);if(C.isVideoTexture&&de(C),C.isRenderTargetTexture===!1&&C.version>0&&W.__version!==C.version){const ie=C.image;if(ie===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(ie.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Q(W,C,R);return}}n.bindTexture(s.TEXTURE_2D,W.__webglTexture,s.TEXTURE0+R)}function ce(C,R){const W=r.get(C);if(C.version>0&&W.__version!==C.version){Q(W,C,R);return}n.bindTexture(s.TEXTURE_2D_ARRAY,W.__webglTexture,s.TEXTURE0+R)}function fe(C,R){const W=r.get(C);if(C.version>0&&W.__version!==C.version){Q(W,C,R);return}n.bindTexture(s.TEXTURE_3D,W.__webglTexture,s.TEXTURE0+R)}function H(C,R){const W=r.get(C);if(C.version>0&&W.__version!==C.version){me(W,C,R);return}n.bindTexture(s.TEXTURE_CUBE_MAP,W.__webglTexture,s.TEXTURE0+R)}const te={[Xd]:s.REPEAT,[vo]:s.CLAMP_TO_EDGE,[jd]:s.MIRRORED_REPEAT},se={[Ti]:s.NEAREST,[c_]:s.NEAREST_MIPMAP_NEAREST,[bc]:s.NEAREST_MIPMAP_LINEAR,[Gi]:s.LINEAR,[Zf]:s.LINEAR_MIPMAP_NEAREST,[_o]:s.LINEAR_MIPMAP_LINEAR},B={[p_]:s.NEVER,[y_]:s.ALWAYS,[m_]:s.LESS,[r0]:s.LEQUAL,[g_]:s.EQUAL,[x_]:s.GEQUAL,[v_]:s.GREATER,[__]:s.NOTEQUAL};function oe(C,R){if(R.type===yr&&e.has("OES_texture_float_linear")===!1&&(R.magFilter===Gi||R.magFilter===Zf||R.magFilter===bc||R.magFilter===_o||R.minFilter===Gi||R.minFilter===Zf||R.minFilter===bc||R.minFilter===_o)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(C,s.TEXTURE_WRAP_S,te[R.wrapS]),s.texParameteri(C,s.TEXTURE_WRAP_T,te[R.wrapT]),(C===s.TEXTURE_3D||C===s.TEXTURE_2D_ARRAY)&&s.texParameteri(C,s.TEXTURE_WRAP_R,te[R.wrapR]),s.texParameteri(C,s.TEXTURE_MAG_FILTER,se[R.magFilter]),s.texParameteri(C,s.TEXTURE_MIN_FILTER,se[R.minFilter]),R.compareFunction&&(s.texParameteri(C,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(C,s.TEXTURE_COMPARE_FUNC,B[R.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(R.magFilter===Ti||R.minFilter!==bc&&R.minFilter!==_o||R.type===yr&&e.has("OES_texture_float_linear")===!1)return;if(R.anisotropy>1||r.get(R).__currentAnisotropy){const W=e.get("EXT_texture_filter_anisotropic");s.texParameterf(C,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(R.anisotropy,a.getMaxAnisotropy())),r.get(R).__currentAnisotropy=R.anisotropy}}}function be(C,R){let W=!1;C.__webglInit===void 0&&(C.__webglInit=!0,R.addEventListener("dispose",O));const ie=R.source;let ge=y.get(ie);ge===void 0&&(ge={},y.set(ie,ge));const pe=ae(R);if(pe!==C.__cacheKey){ge[pe]===void 0&&(ge[pe]={texture:s.createTexture(),usedTimes:0},f.memory.textures++,W=!0),ge[pe].usedTimes++;const Fe=ge[C.__cacheKey];Fe!==void 0&&(ge[C.__cacheKey].usedTimes--,Fe.usedTimes===0&&L(R)),C.__cacheKey=pe,C.__webglTexture=ge[pe].texture}return W}function Q(C,R,W){let ie=s.TEXTURE_2D;(R.isDataArrayTexture||R.isCompressedArrayTexture)&&(ie=s.TEXTURE_2D_ARRAY),R.isData3DTexture&&(ie=s.TEXTURE_3D);const ge=be(C,R),pe=R.source;n.bindTexture(ie,C.__webglTexture,s.TEXTURE0+W);const Fe=r.get(pe);if(pe.version!==Fe.__version||ge===!0){n.activeTexture(s.TEXTURE0+W);const Ce=Ft.getPrimaries(Ft.workingColorSpace),Be=R.colorSpace===bs?null:Ft.getPrimaries(R.colorSpace),ot=R.colorSpace===bs||Ce===Be?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,R.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,R.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,ot);let Te=E(R.image,!1,a.maxTextureSize);Te=Le(R,Te);const Xe=c.convert(R.format,R.colorSpace),it=c.convert(R.type);let rt=D(R.internalFormat,Xe,it,R.colorSpace,R.isVideoTexture);oe(ie,R);let Ye;const mt=R.mipmaps,ht=R.isVideoTexture!==!0,wt=Fe.__version===void 0||ge===!0,q=pe.dataReady,Oe=G(R,Te);if(R.isDepthTexture)rt=A(R.format===ba,R.type),wt&&(ht?n.texStorage2D(s.TEXTURE_2D,1,rt,Te.width,Te.height):n.texImage2D(s.TEXTURE_2D,0,rt,Te.width,Te.height,0,Xe,it,null));else if(R.isDataTexture)if(mt.length>0){ht&&wt&&n.texStorage2D(s.TEXTURE_2D,Oe,rt,mt[0].width,mt[0].height);for(let ve=0,ye=mt.length;ve<ye;ve++)Ye=mt[ve],ht?q&&n.texSubImage2D(s.TEXTURE_2D,ve,0,0,Ye.width,Ye.height,Xe,it,Ye.data):n.texImage2D(s.TEXTURE_2D,ve,rt,Ye.width,Ye.height,0,Xe,it,Ye.data);R.generateMipmaps=!1}else ht?(wt&&n.texStorage2D(s.TEXTURE_2D,Oe,rt,Te.width,Te.height),q&&n.texSubImage2D(s.TEXTURE_2D,0,0,0,Te.width,Te.height,Xe,it,Te.data)):n.texImage2D(s.TEXTURE_2D,0,rt,Te.width,Te.height,0,Xe,it,Te.data);else if(R.isCompressedTexture)if(R.isCompressedArrayTexture){ht&&wt&&n.texStorage3D(s.TEXTURE_2D_ARRAY,Oe,rt,mt[0].width,mt[0].height,Te.depth);for(let ve=0,ye=mt.length;ve<ye;ve++)if(Ye=mt[ve],R.format!==sr)if(Xe!==null)if(ht){if(q)if(R.layerUpdates.size>0){const He=dg(Ye.width,Ye.height,R.format,R.type);for(const Ve of R.layerUpdates){const ft=Ye.data.subarray(Ve*He/Ye.data.BYTES_PER_ELEMENT,(Ve+1)*He/Ye.data.BYTES_PER_ELEMENT);n.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ve,0,0,Ve,Ye.width,Ye.height,1,Xe,ft)}R.clearLayerUpdates()}else n.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,ve,0,0,0,Ye.width,Ye.height,Te.depth,Xe,Ye.data)}else n.compressedTexImage3D(s.TEXTURE_2D_ARRAY,ve,rt,Ye.width,Ye.height,Te.depth,0,Ye.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ht?q&&n.texSubImage3D(s.TEXTURE_2D_ARRAY,ve,0,0,0,Ye.width,Ye.height,Te.depth,Xe,it,Ye.data):n.texImage3D(s.TEXTURE_2D_ARRAY,ve,rt,Ye.width,Ye.height,Te.depth,0,Xe,it,Ye.data)}else{ht&&wt&&n.texStorage2D(s.TEXTURE_2D,Oe,rt,mt[0].width,mt[0].height);for(let ve=0,ye=mt.length;ve<ye;ve++)Ye=mt[ve],R.format!==sr?Xe!==null?ht?q&&n.compressedTexSubImage2D(s.TEXTURE_2D,ve,0,0,Ye.width,Ye.height,Xe,Ye.data):n.compressedTexImage2D(s.TEXTURE_2D,ve,rt,Ye.width,Ye.height,0,Ye.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ht?q&&n.texSubImage2D(s.TEXTURE_2D,ve,0,0,Ye.width,Ye.height,Xe,it,Ye.data):n.texImage2D(s.TEXTURE_2D,ve,rt,Ye.width,Ye.height,0,Xe,it,Ye.data)}else if(R.isDataArrayTexture)if(ht){if(wt&&n.texStorage3D(s.TEXTURE_2D_ARRAY,Oe,rt,Te.width,Te.height,Te.depth),q)if(R.layerUpdates.size>0){const ve=dg(Te.width,Te.height,R.format,R.type);for(const ye of R.layerUpdates){const He=Te.data.subarray(ye*ve/Te.data.BYTES_PER_ELEMENT,(ye+1)*ve/Te.data.BYTES_PER_ELEMENT);n.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,ye,Te.width,Te.height,1,Xe,it,He)}R.clearLayerUpdates()}else n.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,Te.width,Te.height,Te.depth,Xe,it,Te.data)}else n.texImage3D(s.TEXTURE_2D_ARRAY,0,rt,Te.width,Te.height,Te.depth,0,Xe,it,Te.data);else if(R.isData3DTexture)ht?(wt&&n.texStorage3D(s.TEXTURE_3D,Oe,rt,Te.width,Te.height,Te.depth),q&&n.texSubImage3D(s.TEXTURE_3D,0,0,0,0,Te.width,Te.height,Te.depth,Xe,it,Te.data)):n.texImage3D(s.TEXTURE_3D,0,rt,Te.width,Te.height,Te.depth,0,Xe,it,Te.data);else if(R.isFramebufferTexture){if(wt)if(ht)n.texStorage2D(s.TEXTURE_2D,Oe,rt,Te.width,Te.height);else{let ve=Te.width,ye=Te.height;for(let He=0;He<Oe;He++)n.texImage2D(s.TEXTURE_2D,He,rt,ve,ye,0,Xe,it,null),ve>>=1,ye>>=1}}else if(mt.length>0){if(ht&&wt){const ve=Se(mt[0]);n.texStorage2D(s.TEXTURE_2D,Oe,rt,ve.width,ve.height)}for(let ve=0,ye=mt.length;ve<ye;ve++)Ye=mt[ve],ht?q&&n.texSubImage2D(s.TEXTURE_2D,ve,0,0,Xe,it,Ye):n.texImage2D(s.TEXTURE_2D,ve,rt,Xe,it,Ye);R.generateMipmaps=!1}else if(ht){if(wt){const ve=Se(Te);n.texStorage2D(s.TEXTURE_2D,Oe,rt,ve.width,ve.height)}q&&n.texSubImage2D(s.TEXTURE_2D,0,0,0,Xe,it,Te)}else n.texImage2D(s.TEXTURE_2D,0,rt,Xe,it,Te);_(R)&&g(ie),Fe.__version=pe.version,R.onUpdate&&R.onUpdate(R)}C.__version=R.version}function me(C,R,W){if(R.image.length!==6)return;const ie=be(C,R),ge=R.source;n.bindTexture(s.TEXTURE_CUBE_MAP,C.__webglTexture,s.TEXTURE0+W);const pe=r.get(ge);if(ge.version!==pe.__version||ie===!0){n.activeTexture(s.TEXTURE0+W);const Fe=Ft.getPrimaries(Ft.workingColorSpace),Ce=R.colorSpace===bs?null:Ft.getPrimaries(R.colorSpace),Be=R.colorSpace===bs||Fe===Ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,R.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,R.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,R.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Be);const ot=R.isCompressedTexture||R.image[0].isCompressedTexture,Te=R.image[0]&&R.image[0].isDataTexture,Xe=[];for(let ye=0;ye<6;ye++)!ot&&!Te?Xe[ye]=E(R.image[ye],!0,a.maxCubemapSize):Xe[ye]=Te?R.image[ye].image:R.image[ye],Xe[ye]=Le(R,Xe[ye]);const it=Xe[0],rt=c.convert(R.format,R.colorSpace),Ye=c.convert(R.type),mt=D(R.internalFormat,rt,Ye,R.colorSpace),ht=R.isVideoTexture!==!0,wt=pe.__version===void 0||ie===!0,q=ge.dataReady;let Oe=G(R,it);oe(s.TEXTURE_CUBE_MAP,R);let ve;if(ot){ht&&wt&&n.texStorage2D(s.TEXTURE_CUBE_MAP,Oe,mt,it.width,it.height);for(let ye=0;ye<6;ye++){ve=Xe[ye].mipmaps;for(let He=0;He<ve.length;He++){const Ve=ve[He];R.format!==sr?rt!==null?ht?q&&n.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He,0,0,Ve.width,Ve.height,rt,Ve.data):n.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He,mt,Ve.width,Ve.height,0,Ve.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):ht?q&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He,0,0,Ve.width,Ve.height,rt,Ye,Ve.data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He,mt,Ve.width,Ve.height,0,rt,Ye,Ve.data)}}}else{if(ve=R.mipmaps,ht&&wt){ve.length>0&&Oe++;const ye=Se(Xe[0]);n.texStorage2D(s.TEXTURE_CUBE_MAP,Oe,mt,ye.width,ye.height)}for(let ye=0;ye<6;ye++)if(Te){ht?q&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,Xe[ye].width,Xe[ye].height,rt,Ye,Xe[ye].data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,mt,Xe[ye].width,Xe[ye].height,0,rt,Ye,Xe[ye].data);for(let He=0;He<ve.length;He++){const ft=ve[He].image[ye].image;ht?q&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He+1,0,0,ft.width,ft.height,rt,Ye,ft.data):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He+1,mt,ft.width,ft.height,0,rt,Ye,ft.data)}}else{ht?q&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,0,0,rt,Ye,Xe[ye]):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,0,mt,rt,Ye,Xe[ye]);for(let He=0;He<ve.length;He++){const Ve=ve[He];ht?q&&n.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He+1,0,0,rt,Ye,Ve.image[ye]):n.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+ye,He+1,mt,rt,Ye,Ve.image[ye])}}}_(R)&&g(s.TEXTURE_CUBE_MAP),pe.__version=ge.version,R.onUpdate&&R.onUpdate(R)}C.__version=R.version}function Me(C,R,W,ie,ge,pe){const Fe=c.convert(W.format,W.colorSpace),Ce=c.convert(W.type),Be=D(W.internalFormat,Fe,Ce,W.colorSpace),ot=r.get(R),Te=r.get(W);if(Te.__renderTarget=R,!ot.__hasExternalTextures){const Xe=Math.max(1,R.width>>pe),it=Math.max(1,R.height>>pe);ge===s.TEXTURE_3D||ge===s.TEXTURE_2D_ARRAY?n.texImage3D(ge,pe,Be,Xe,it,R.depth,0,Fe,Ce,null):n.texImage2D(ge,pe,Be,Xe,it,0,Fe,Ce,null)}n.bindFramebuffer(s.FRAMEBUFFER,C),Ue(R)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,ie,ge,Te.__webglTexture,0,_e(R)):(ge===s.TEXTURE_2D||ge>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&ge<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,ie,ge,Te.__webglTexture,pe),n.bindFramebuffer(s.FRAMEBUFFER,null)}function xe(C,R,W){if(s.bindRenderbuffer(s.RENDERBUFFER,C),R.depthBuffer){const ie=R.depthTexture,ge=ie&&ie.isDepthTexture?ie.type:null,pe=A(R.stencilBuffer,ge),Fe=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ce=_e(R);Ue(R)?u.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Ce,pe,R.width,R.height):W?s.renderbufferStorageMultisample(s.RENDERBUFFER,Ce,pe,R.width,R.height):s.renderbufferStorage(s.RENDERBUFFER,pe,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Fe,s.RENDERBUFFER,C)}else{const ie=R.textures;for(let ge=0;ge<ie.length;ge++){const pe=ie[ge],Fe=c.convert(pe.format,pe.colorSpace),Ce=c.convert(pe.type),Be=D(pe.internalFormat,Fe,Ce,pe.colorSpace),ot=_e(R);W&&Ue(R)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,ot,Be,R.width,R.height):Ue(R)?u.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ot,Be,R.width,R.height):s.renderbufferStorage(s.RENDERBUFFER,Be,R.width,R.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Re(C,R){if(R&&R.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(n.bindFramebuffer(s.FRAMEBUFFER,C),!(R.depthTexture&&R.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const ie=r.get(R.depthTexture);ie.__renderTarget=R,(!ie.__webglTexture||R.depthTexture.image.width!==R.width||R.depthTexture.image.height!==R.height)&&(R.depthTexture.image.width=R.width,R.depthTexture.image.height=R.height,R.depthTexture.needsUpdate=!0),re(R.depthTexture,0);const ge=ie.__webglTexture,pe=_e(R);if(R.depthTexture.format===Ma)Ue(R)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ge,0,pe):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,ge,0);else if(R.depthTexture.format===ba)Ue(R)?u.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ge,0,pe):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,ge,0);else throw new Error("Unknown depthTexture format")}function Ne(C){const R=r.get(C),W=C.isWebGLCubeRenderTarget===!0;if(R.__boundDepthTexture!==C.depthTexture){const ie=C.depthTexture;if(R.__depthDisposeCallback&&R.__depthDisposeCallback(),ie){const ge=()=>{delete R.__boundDepthTexture,delete R.__depthDisposeCallback,ie.removeEventListener("dispose",ge)};ie.addEventListener("dispose",ge),R.__depthDisposeCallback=ge}R.__boundDepthTexture=ie}if(C.depthTexture&&!R.__autoAllocateDepthBuffer){if(W)throw new Error("target.depthTexture not supported in Cube render targets");Re(R.__webglFramebuffer,C)}else if(W){R.__webglDepthbuffer=[];for(let ie=0;ie<6;ie++)if(n.bindFramebuffer(s.FRAMEBUFFER,R.__webglFramebuffer[ie]),R.__webglDepthbuffer[ie]===void 0)R.__webglDepthbuffer[ie]=s.createRenderbuffer(),xe(R.__webglDepthbuffer[ie],C,!1);else{const ge=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,pe=R.__webglDepthbuffer[ie];s.bindRenderbuffer(s.RENDERBUFFER,pe),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,pe)}}else if(n.bindFramebuffer(s.FRAMEBUFFER,R.__webglFramebuffer),R.__webglDepthbuffer===void 0)R.__webglDepthbuffer=s.createRenderbuffer(),xe(R.__webglDepthbuffer,C,!1);else{const ie=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=R.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,ge),s.framebufferRenderbuffer(s.FRAMEBUFFER,ie,s.RENDERBUFFER,ge)}n.bindFramebuffer(s.FRAMEBUFFER,null)}function ke(C,R,W){const ie=r.get(C);R!==void 0&&Me(ie.__webglFramebuffer,C,C.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),W!==void 0&&Ne(C)}function vt(C){const R=C.texture,W=r.get(C),ie=r.get(R);C.addEventListener("dispose",z);const ge=C.textures,pe=C.isWebGLCubeRenderTarget===!0,Fe=ge.length>1;if(Fe||(ie.__webglTexture===void 0&&(ie.__webglTexture=s.createTexture()),ie.__version=R.version,f.memory.textures++),pe){W.__webglFramebuffer=[];for(let Ce=0;Ce<6;Ce++)if(R.mipmaps&&R.mipmaps.length>0){W.__webglFramebuffer[Ce]=[];for(let Be=0;Be<R.mipmaps.length;Be++)W.__webglFramebuffer[Ce][Be]=s.createFramebuffer()}else W.__webglFramebuffer[Ce]=s.createFramebuffer()}else{if(R.mipmaps&&R.mipmaps.length>0){W.__webglFramebuffer=[];for(let Ce=0;Ce<R.mipmaps.length;Ce++)W.__webglFramebuffer[Ce]=s.createFramebuffer()}else W.__webglFramebuffer=s.createFramebuffer();if(Fe)for(let Ce=0,Be=ge.length;Ce<Be;Ce++){const ot=r.get(ge[Ce]);ot.__webglTexture===void 0&&(ot.__webglTexture=s.createTexture(),f.memory.textures++)}if(C.samples>0&&Ue(C)===!1){W.__webglMultisampledFramebuffer=s.createFramebuffer(),W.__webglColorRenderbuffer=[],n.bindFramebuffer(s.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let Ce=0;Ce<ge.length;Ce++){const Be=ge[Ce];W.__webglColorRenderbuffer[Ce]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,W.__webglColorRenderbuffer[Ce]);const ot=c.convert(Be.format,Be.colorSpace),Te=c.convert(Be.type),Xe=D(Be.internalFormat,ot,Te,Be.colorSpace,C.isXRRenderTarget===!0),it=_e(C);s.renderbufferStorageMultisample(s.RENDERBUFFER,it,Xe,C.width,C.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Ce,s.RENDERBUFFER,W.__webglColorRenderbuffer[Ce])}s.bindRenderbuffer(s.RENDERBUFFER,null),C.depthBuffer&&(W.__webglDepthRenderbuffer=s.createRenderbuffer(),xe(W.__webglDepthRenderbuffer,C,!0)),n.bindFramebuffer(s.FRAMEBUFFER,null)}}if(pe){n.bindTexture(s.TEXTURE_CUBE_MAP,ie.__webglTexture),oe(s.TEXTURE_CUBE_MAP,R);for(let Ce=0;Ce<6;Ce++)if(R.mipmaps&&R.mipmaps.length>0)for(let Be=0;Be<R.mipmaps.length;Be++)Me(W.__webglFramebuffer[Ce][Be],C,R,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,Be);else Me(W.__webglFramebuffer[Ce],C,R,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+Ce,0);_(R)&&g(s.TEXTURE_CUBE_MAP),n.unbindTexture()}else if(Fe){for(let Ce=0,Be=ge.length;Ce<Be;Ce++){const ot=ge[Ce],Te=r.get(ot);n.bindTexture(s.TEXTURE_2D,Te.__webglTexture),oe(s.TEXTURE_2D,ot),Me(W.__webglFramebuffer,C,ot,s.COLOR_ATTACHMENT0+Ce,s.TEXTURE_2D,0),_(ot)&&g(s.TEXTURE_2D)}n.unbindTexture()}else{let Ce=s.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(Ce=C.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),n.bindTexture(Ce,ie.__webglTexture),oe(Ce,R),R.mipmaps&&R.mipmaps.length>0)for(let Be=0;Be<R.mipmaps.length;Be++)Me(W.__webglFramebuffer[Be],C,R,s.COLOR_ATTACHMENT0,Ce,Be);else Me(W.__webglFramebuffer,C,R,s.COLOR_ATTACHMENT0,Ce,0);_(R)&&g(Ce),n.unbindTexture()}C.depthBuffer&&Ne(C)}function tt(C){const R=C.textures;for(let W=0,ie=R.length;W<ie;W++){const ge=R[W];if(_(ge)){const pe=F(C),Fe=r.get(ge).__webglTexture;n.bindTexture(pe,Fe),g(pe),n.unbindTexture()}}}const _t=[],V=[];function St(C){if(C.samples>0){if(Ue(C)===!1){const R=C.textures,W=C.width,ie=C.height;let ge=s.COLOR_BUFFER_BIT;const pe=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Fe=r.get(C),Ce=R.length>1;if(Ce)for(let Be=0;Be<R.length;Be++)n.bindFramebuffer(s.FRAMEBUFFER,Fe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Be,s.RENDERBUFFER,null),n.bindFramebuffer(s.FRAMEBUFFER,Fe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Be,s.TEXTURE_2D,null,0);n.bindFramebuffer(s.READ_FRAMEBUFFER,Fe.__webglMultisampledFramebuffer),n.bindFramebuffer(s.DRAW_FRAMEBUFFER,Fe.__webglFramebuffer);for(let Be=0;Be<R.length;Be++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(ge|=s.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(ge|=s.STENCIL_BUFFER_BIT)),Ce){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Fe.__webglColorRenderbuffer[Be]);const ot=r.get(R[Be]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ot,0)}s.blitFramebuffer(0,0,W,ie,0,0,W,ie,ge,s.NEAREST),h===!0&&(_t.length=0,V.length=0,_t.push(s.COLOR_ATTACHMENT0+Be),C.depthBuffer&&C.resolveDepthBuffer===!1&&(_t.push(pe),V.push(pe),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,V)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,_t))}if(n.bindFramebuffer(s.READ_FRAMEBUFFER,null),n.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),Ce)for(let Be=0;Be<R.length;Be++){n.bindFramebuffer(s.FRAMEBUFFER,Fe.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+Be,s.RENDERBUFFER,Fe.__webglColorRenderbuffer[Be]);const ot=r.get(R[Be]).__webglTexture;n.bindFramebuffer(s.FRAMEBUFFER,Fe.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+Be,s.TEXTURE_2D,ot,0)}n.bindFramebuffer(s.DRAW_FRAMEBUFFER,Fe.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&h){const R=C.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[R])}}}function _e(C){return Math.min(a.maxSamples,C.samples)}function Ue(C){const R=r.get(C);return C.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&R.__useRenderToTexture!==!1}function de(C){const R=f.render.frame;v.get(C)!==R&&(v.set(C,R),C.update())}function Le(C,R){const W=C.colorSpace,ie=C.format,ge=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||W!==Ca&&W!==bs&&(Ft.getTransfer(W)===zt?(ie!==sr||ge!==Yr)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",W)),R}function Se(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(p.width=C.naturalWidth||C.width,p.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(p.width=C.displayWidth,p.height=C.displayHeight):(p.width=C.width,p.height=C.height),p}this.allocateTextureUnit=I,this.resetTextureUnits=N,this.setTexture2D=re,this.setTexture2DArray=ce,this.setTexture3D=fe,this.setTextureCube=H,this.rebindTextures=ke,this.setupRenderTarget=vt,this.updateRenderTargetMipmap=tt,this.updateMultisampleRenderTarget=St,this.setupDepthRenderbuffer=Ne,this.setupFrameBufferTexture=Me,this.useMultisampledRTT=Ue}function PE(s,e){function n(r,a=bs){let c;const f=Ft.getTransfer(a);if(r===Yr)return s.UNSIGNED_BYTE;if(r===Ah)return s.UNSIGNED_SHORT_4_4_4_4;if(r===bh)return s.UNSIGNED_SHORT_5_5_5_1;if(r===Zg)return s.UNSIGNED_INT_5_9_9_9_REV;if(r===$g)return s.BYTE;if(r===Kg)return s.SHORT;if(r===vl)return s.UNSIGNED_SHORT;if(r===Rh)return s.INT;if(r===xo)return s.UNSIGNED_INT;if(r===yr)return s.FLOAT;if(r===_l)return s.HALF_FLOAT;if(r===Jg)return s.ALPHA;if(r===Qg)return s.RGB;if(r===sr)return s.RGBA;if(r===e0)return s.LUMINANCE;if(r===t0)return s.LUMINANCE_ALPHA;if(r===Ma)return s.DEPTH_COMPONENT;if(r===ba)return s.DEPTH_STENCIL;if(r===Ch)return s.RED;if(r===Ph)return s.RED_INTEGER;if(r===n0)return s.RG;if(r===Lh)return s.RG_INTEGER;if(r===Dh)return s.RGBA_INTEGER;if(r===nu||r===iu||r===ru||r===su)if(f===zt)if(c=e.get("WEBGL_compressed_texture_s3tc_srgb"),c!==null){if(r===nu)return c.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(r===iu)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(r===ru)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(r===su)return c.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(c=e.get("WEBGL_compressed_texture_s3tc"),c!==null){if(r===nu)return c.COMPRESSED_RGB_S3TC_DXT1_EXT;if(r===iu)return c.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(r===ru)return c.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(r===su)return c.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(r===Yd||r===qd||r===$d||r===Kd)if(c=e.get("WEBGL_compressed_texture_pvrtc"),c!==null){if(r===Yd)return c.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(r===qd)return c.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(r===$d)return c.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(r===Kd)return c.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(r===Zd||r===Jd||r===Qd)if(c=e.get("WEBGL_compressed_texture_etc"),c!==null){if(r===Zd||r===Jd)return f===zt?c.COMPRESSED_SRGB8_ETC2:c.COMPRESSED_RGB8_ETC2;if(r===Qd)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:c.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(r===eh||r===th||r===nh||r===ih||r===rh||r===sh||r===oh||r===ah||r===lh||r===ch||r===uh||r===fh||r===dh||r===hh)if(c=e.get("WEBGL_compressed_texture_astc"),c!==null){if(r===eh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:c.COMPRESSED_RGBA_ASTC_4x4_KHR;if(r===th)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:c.COMPRESSED_RGBA_ASTC_5x4_KHR;if(r===nh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:c.COMPRESSED_RGBA_ASTC_5x5_KHR;if(r===ih)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:c.COMPRESSED_RGBA_ASTC_6x5_KHR;if(r===rh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:c.COMPRESSED_RGBA_ASTC_6x6_KHR;if(r===sh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:c.COMPRESSED_RGBA_ASTC_8x5_KHR;if(r===oh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:c.COMPRESSED_RGBA_ASTC_8x6_KHR;if(r===ah)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:c.COMPRESSED_RGBA_ASTC_8x8_KHR;if(r===lh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:c.COMPRESSED_RGBA_ASTC_10x5_KHR;if(r===ch)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:c.COMPRESSED_RGBA_ASTC_10x6_KHR;if(r===uh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:c.COMPRESSED_RGBA_ASTC_10x8_KHR;if(r===fh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:c.COMPRESSED_RGBA_ASTC_10x10_KHR;if(r===dh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:c.COMPRESSED_RGBA_ASTC_12x10_KHR;if(r===hh)return f===zt?c.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:c.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(r===ou||r===ph||r===mh)if(c=e.get("EXT_texture_compression_bptc"),c!==null){if(r===ou)return f===zt?c.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:c.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(r===ph)return c.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(r===mh)return c.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(r===i0||r===gh||r===vh||r===_h)if(c=e.get("EXT_texture_compression_rgtc"),c!==null){if(r===ou)return c.COMPRESSED_RED_RGTC1_EXT;if(r===gh)return c.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(r===vh)return c.COMPRESSED_RED_GREEN_RGTC2_EXT;if(r===_h)return c.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return r===Aa?s.UNSIGNED_INT_24_8:s[r]!==void 0?s[r]:null}return{convert:n}}const LE={type:"move"};class Pd{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Zc,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Zc,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new ee,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new ee),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Zc,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new ee,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new ee),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const n=this._hand;if(n)for(const r of e.hand.values())this._getHandJoint(n,r)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,n,r){let a=null,c=null,f=null;const u=this._targetRay,h=this._grip,p=this._hand;if(e&&n.session.visibilityState!=="visible-blurred"){if(p&&e.hand){f=!0;for(const E of e.hand.values()){const _=n.getJointPose(E,r),g=this._getHandJoint(p,E);_!==null&&(g.matrix.fromArray(_.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=_.radius),g.visible=_!==null}const v=p.joints["index-finger-tip"],x=p.joints["thumb-tip"],y=v.position.distanceTo(x.position),S=.02,T=.005;p.inputState.pinching&&y>S+T?(p.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!p.inputState.pinching&&y<=S-T&&(p.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else h!==null&&e.gripSpace&&(c=n.getPose(e.gripSpace,r),c!==null&&(h.matrix.fromArray(c.transform.matrix),h.matrix.decompose(h.position,h.rotation,h.scale),h.matrixWorldNeedsUpdate=!0,c.linearVelocity?(h.hasLinearVelocity=!0,h.linearVelocity.copy(c.linearVelocity)):h.hasLinearVelocity=!1,c.angularVelocity?(h.hasAngularVelocity=!0,h.angularVelocity.copy(c.angularVelocity)):h.hasAngularVelocity=!1));u!==null&&(a=n.getPose(e.targetRaySpace,r),a===null&&c!==null&&(a=c),a!==null&&(u.matrix.fromArray(a.transform.matrix),u.matrix.decompose(u.position,u.rotation,u.scale),u.matrixWorldNeedsUpdate=!0,a.linearVelocity?(u.hasLinearVelocity=!0,u.linearVelocity.copy(a.linearVelocity)):u.hasLinearVelocity=!1,a.angularVelocity?(u.hasAngularVelocity=!0,u.angularVelocity.copy(a.angularVelocity)):u.hasAngularVelocity=!1,this.dispatchEvent(LE)))}return u!==null&&(u.visible=a!==null),h!==null&&(h.visible=c!==null),p!==null&&(p.visible=f!==null),this}_getHandJoint(e,n){if(e.joints[n.jointName]===void 0){const r=new Zc;r.matrixAutoUpdate=!1,r.visible=!1,e.joints[n.jointName]=r,e.add(r)}return e.joints[n.jointName]}}const DE=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,IE=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class UE{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,n,r){if(this.texture===null){const a=new Yn,c=e.properties.get(a);c.__webglTexture=n.texture,(n.depthNear!==r.depthNear||n.depthFar!==r.depthFar)&&(this.depthNear=n.depthNear,this.depthFar=n.depthFar),this.texture=a}}getMesh(e){if(this.texture!==null&&this.mesh===null){const n=e.cameras[0].viewport,r=new Sr({vertexShader:DE,fragmentShader:IE,uniforms:{depthColor:{value:this.texture},depthWidth:{value:n.z},depthHeight:{value:n.w}}});this.mesh=new ni(new Cs(20,20),r)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class NE extends La{constructor(e,n){super();const r=this;let a=null,c=1,f=null,u="local-floor",h=1,p=null,v=null,x=null,y=null,S=null,T=null;const E=new UE,_=n.getContextAttributes();let g=null,F=null;const D=[],A=[],G=new It;let O=null;const z=new zi;z.viewport=new _n;const $=new zi;$.viewport=new _n;const L=[z,$],b=new nx;let U=null,N=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Q){let me=D[Q];return me===void 0&&(me=new Pd,D[Q]=me),me.getTargetRaySpace()},this.getControllerGrip=function(Q){let me=D[Q];return me===void 0&&(me=new Pd,D[Q]=me),me.getGripSpace()},this.getHand=function(Q){let me=D[Q];return me===void 0&&(me=new Pd,D[Q]=me),me.getHandSpace()};function I(Q){const me=A.indexOf(Q.inputSource);if(me===-1)return;const Me=D[me];Me!==void 0&&(Me.update(Q.inputSource,Q.frame,p||f),Me.dispatchEvent({type:Q.type,data:Q.inputSource}))}function ae(){a.removeEventListener("select",I),a.removeEventListener("selectstart",I),a.removeEventListener("selectend",I),a.removeEventListener("squeeze",I),a.removeEventListener("squeezestart",I),a.removeEventListener("squeezeend",I),a.removeEventListener("end",ae),a.removeEventListener("inputsourceschange",re);for(let Q=0;Q<D.length;Q++){const me=A[Q];me!==null&&(A[Q]=null,D[Q].disconnect(me))}U=null,N=null,E.reset(),e.setRenderTarget(g),S=null,y=null,x=null,a=null,F=null,be.stop(),r.isPresenting=!1,e.setPixelRatio(O),e.setSize(G.width,G.height,!1),r.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Q){c=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Q){u=Q,r.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return p||f},this.setReferenceSpace=function(Q){p=Q},this.getBaseLayer=function(){return y!==null?y:S},this.getBinding=function(){return x},this.getFrame=function(){return T},this.getSession=function(){return a},this.setSession=async function(Q){if(a=Q,a!==null){if(g=e.getRenderTarget(),a.addEventListener("select",I),a.addEventListener("selectstart",I),a.addEventListener("selectend",I),a.addEventListener("squeeze",I),a.addEventListener("squeezestart",I),a.addEventListener("squeezeend",I),a.addEventListener("end",ae),a.addEventListener("inputsourceschange",re),_.xrCompatible!==!0&&await n.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(G),a.enabledFeatures!==void 0&&a.enabledFeatures.includes("layers")){let Me=null,xe=null,Re=null;_.depth&&(Re=_.stencil?n.DEPTH24_STENCIL8:n.DEPTH_COMPONENT24,Me=_.stencil?ba:Ma,xe=_.stencil?Aa:xo);const Ne={colorFormat:n.RGBA8,depthFormat:Re,scaleFactor:c};x=new XRWebGLBinding(a,n),y=x.createProjectionLayer(Ne),a.updateRenderState({layers:[y]}),e.setPixelRatio(1),e.setSize(y.textureWidth,y.textureHeight,!1),F=new yo(y.textureWidth,y.textureHeight,{format:sr,type:Yr,depthTexture:new _0(y.textureWidth,y.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,Me),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:y.ignoreDepthValues===!1})}else{const Me={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:c};S=new XRWebGLLayer(a,n,Me),a.updateRenderState({baseLayer:S}),e.setPixelRatio(1),e.setSize(S.framebufferWidth,S.framebufferHeight,!1),F=new yo(S.framebufferWidth,S.framebufferHeight,{format:sr,type:Yr,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil})}F.isXRRenderTarget=!0,this.setFoveation(h),p=null,f=await a.requestReferenceSpace(u),be.setContext(a),be.start(),r.isPresenting=!0,r.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(a!==null)return a.environmentBlendMode},this.getDepthTexture=function(){return E.getDepthTexture()};function re(Q){for(let me=0;me<Q.removed.length;me++){const Me=Q.removed[me],xe=A.indexOf(Me);xe>=0&&(A[xe]=null,D[xe].disconnect(Me))}for(let me=0;me<Q.added.length;me++){const Me=Q.added[me];let xe=A.indexOf(Me);if(xe===-1){for(let Ne=0;Ne<D.length;Ne++)if(Ne>=A.length){A.push(Me),xe=Ne;break}else if(A[Ne]===null){A[Ne]=Me,xe=Ne;break}if(xe===-1)break}const Re=D[xe];Re&&Re.connect(Me)}}const ce=new ee,fe=new ee;function H(Q,me,Me){ce.setFromMatrixPosition(me.matrixWorld),fe.setFromMatrixPosition(Me.matrixWorld);const xe=ce.distanceTo(fe),Re=me.projectionMatrix.elements,Ne=Me.projectionMatrix.elements,ke=Re[14]/(Re[10]-1),vt=Re[14]/(Re[10]+1),tt=(Re[9]+1)/Re[5],_t=(Re[9]-1)/Re[5],V=(Re[8]-1)/Re[0],St=(Ne[8]+1)/Ne[0],_e=ke*V,Ue=ke*St,de=xe/(-V+St),Le=de*-V;if(me.matrixWorld.decompose(Q.position,Q.quaternion,Q.scale),Q.translateX(Le),Q.translateZ(de),Q.matrixWorld.compose(Q.position,Q.quaternion,Q.scale),Q.matrixWorldInverse.copy(Q.matrixWorld).invert(),Re[10]===-1)Q.projectionMatrix.copy(me.projectionMatrix),Q.projectionMatrixInverse.copy(me.projectionMatrixInverse);else{const Se=ke+de,C=vt+de,R=_e-Le,W=Ue+(xe-Le),ie=tt*vt/C*Se,ge=_t*vt/C*Se;Q.projectionMatrix.makePerspective(R,W,ie,ge,Se,C),Q.projectionMatrixInverse.copy(Q.projectionMatrix).invert()}}function te(Q,me){me===null?Q.matrixWorld.copy(Q.matrix):Q.matrixWorld.multiplyMatrices(me.matrixWorld,Q.matrix),Q.matrixWorldInverse.copy(Q.matrixWorld).invert()}this.updateCamera=function(Q){if(a===null)return;let me=Q.near,Me=Q.far;E.texture!==null&&(E.depthNear>0&&(me=E.depthNear),E.depthFar>0&&(Me=E.depthFar)),b.near=$.near=z.near=me,b.far=$.far=z.far=Me,(U!==b.near||N!==b.far)&&(a.updateRenderState({depthNear:b.near,depthFar:b.far}),U=b.near,N=b.far),z.layers.mask=Q.layers.mask|2,$.layers.mask=Q.layers.mask|4,b.layers.mask=z.layers.mask|$.layers.mask;const xe=Q.parent,Re=b.cameras;te(b,xe);for(let Ne=0;Ne<Re.length;Ne++)te(Re[Ne],xe);Re.length===2?H(b,z,$):b.projectionMatrix.copy(z.projectionMatrix),se(Q,b,xe)};function se(Q,me,Me){Me===null?Q.matrix.copy(me.matrixWorld):(Q.matrix.copy(Me.matrixWorld),Q.matrix.invert(),Q.matrix.multiply(me.matrixWorld)),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale),Q.updateMatrixWorld(!0),Q.projectionMatrix.copy(me.projectionMatrix),Q.projectionMatrixInverse.copy(me.projectionMatrixInverse),Q.isPerspectiveCamera&&(Q.fov=yh*2*Math.atan(1/Q.projectionMatrix.elements[5]),Q.zoom=1)}this.getCamera=function(){return b},this.getFoveation=function(){if(!(y===null&&S===null))return h},this.setFoveation=function(Q){h=Q,y!==null&&(y.fixedFoveation=Q),S!==null&&S.fixedFoveation!==void 0&&(S.fixedFoveation=Q)},this.hasDepthSensing=function(){return E.texture!==null},this.getDepthSensingMesh=function(){return E.getMesh(b)};let B=null;function oe(Q,me){if(v=me.getViewerPose(p||f),T=me,v!==null){const Me=v.views;S!==null&&(e.setRenderTargetFramebuffer(F,S.framebuffer),e.setRenderTarget(F));let xe=!1;Me.length!==b.cameras.length&&(b.cameras.length=0,xe=!0);for(let Ne=0;Ne<Me.length;Ne++){const ke=Me[Ne];let vt=null;if(S!==null)vt=S.getViewport(ke);else{const _t=x.getViewSubImage(y,ke);vt=_t.viewport,Ne===0&&(e.setRenderTargetTextures(F,_t.colorTexture,y.ignoreDepthValues?void 0:_t.depthStencilTexture),e.setRenderTarget(F))}let tt=L[Ne];tt===void 0&&(tt=new zi,tt.layers.enable(Ne),tt.viewport=new _n,L[Ne]=tt),tt.matrix.fromArray(ke.transform.matrix),tt.matrix.decompose(tt.position,tt.quaternion,tt.scale),tt.projectionMatrix.fromArray(ke.projectionMatrix),tt.projectionMatrixInverse.copy(tt.projectionMatrix).invert(),tt.viewport.set(vt.x,vt.y,vt.width,vt.height),Ne===0&&(b.matrix.copy(tt.matrix),b.matrix.decompose(b.position,b.quaternion,b.scale)),xe===!0&&b.cameras.push(tt)}const Re=a.enabledFeatures;if(Re&&Re.includes("depth-sensing")){const Ne=x.getDepthInformation(Me[0]);Ne&&Ne.isValid&&Ne.texture&&E.init(e,Ne,a.renderState)}}for(let Me=0;Me<D.length;Me++){const xe=A[Me],Re=D[Me];xe!==null&&Re!==void 0&&Re.update(xe,me,p||f)}B&&B(Q,me),me.detectedPlanes&&r.dispatchEvent({type:"planesdetected",data:me}),T=null}const be=new x0;be.setAnimationLoop(oe),this.setAnimationLoop=function(Q){B=Q},this.dispose=function(){}}}const uo=new qr,FE=new dn;function OE(s,e){function n(_,g){_.matrixAutoUpdate===!0&&_.updateMatrix(),g.value.copy(_.matrix)}function r(_,g){g.color.getRGB(_.fogColor.value,h0(s)),g.isFog?(_.fogNear.value=g.near,_.fogFar.value=g.far):g.isFogExp2&&(_.fogDensity.value=g.density)}function a(_,g,F,D,A){g.isMeshBasicMaterial||g.isMeshLambertMaterial?c(_,g):g.isMeshToonMaterial?(c(_,g),x(_,g)):g.isMeshPhongMaterial?(c(_,g),v(_,g)):g.isMeshStandardMaterial?(c(_,g),y(_,g),g.isMeshPhysicalMaterial&&S(_,g,A)):g.isMeshMatcapMaterial?(c(_,g),T(_,g)):g.isMeshDepthMaterial?c(_,g):g.isMeshDistanceMaterial?(c(_,g),E(_,g)):g.isMeshNormalMaterial?c(_,g):g.isLineBasicMaterial?(f(_,g),g.isLineDashedMaterial&&u(_,g)):g.isPointsMaterial?h(_,g,F,D):g.isSpriteMaterial?p(_,g):g.isShadowMaterial?(_.color.value.copy(g.color),_.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function c(_,g){_.opacity.value=g.opacity,g.color&&_.diffuse.value.copy(g.color),g.emissive&&_.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(_.map.value=g.map,n(g.map,_.mapTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.bumpMap&&(_.bumpMap.value=g.bumpMap,n(g.bumpMap,_.bumpMapTransform),_.bumpScale.value=g.bumpScale,g.side===pi&&(_.bumpScale.value*=-1)),g.normalMap&&(_.normalMap.value=g.normalMap,n(g.normalMap,_.normalMapTransform),_.normalScale.value.copy(g.normalScale),g.side===pi&&_.normalScale.value.negate()),g.displacementMap&&(_.displacementMap.value=g.displacementMap,n(g.displacementMap,_.displacementMapTransform),_.displacementScale.value=g.displacementScale,_.displacementBias.value=g.displacementBias),g.emissiveMap&&(_.emissiveMap.value=g.emissiveMap,n(g.emissiveMap,_.emissiveMapTransform)),g.specularMap&&(_.specularMap.value=g.specularMap,n(g.specularMap,_.specularMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest);const F=e.get(g),D=F.envMap,A=F.envMapRotation;D&&(_.envMap.value=D,uo.copy(A),uo.x*=-1,uo.y*=-1,uo.z*=-1,D.isCubeTexture&&D.isRenderTargetTexture===!1&&(uo.y*=-1,uo.z*=-1),_.envMapRotation.value.setFromMatrix4(FE.makeRotationFromEuler(uo)),_.flipEnvMap.value=D.isCubeTexture&&D.isRenderTargetTexture===!1?-1:1,_.reflectivity.value=g.reflectivity,_.ior.value=g.ior,_.refractionRatio.value=g.refractionRatio),g.lightMap&&(_.lightMap.value=g.lightMap,_.lightMapIntensity.value=g.lightMapIntensity,n(g.lightMap,_.lightMapTransform)),g.aoMap&&(_.aoMap.value=g.aoMap,_.aoMapIntensity.value=g.aoMapIntensity,n(g.aoMap,_.aoMapTransform))}function f(_,g){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,g.map&&(_.map.value=g.map,n(g.map,_.mapTransform))}function u(_,g){_.dashSize.value=g.dashSize,_.totalSize.value=g.dashSize+g.gapSize,_.scale.value=g.scale}function h(_,g,F,D){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,_.size.value=g.size*F,_.scale.value=D*.5,g.map&&(_.map.value=g.map,n(g.map,_.uvTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest)}function p(_,g){_.diffuse.value.copy(g.color),_.opacity.value=g.opacity,_.rotation.value=g.rotation,g.map&&(_.map.value=g.map,n(g.map,_.mapTransform)),g.alphaMap&&(_.alphaMap.value=g.alphaMap,n(g.alphaMap,_.alphaMapTransform)),g.alphaTest>0&&(_.alphaTest.value=g.alphaTest)}function v(_,g){_.specular.value.copy(g.specular),_.shininess.value=Math.max(g.shininess,1e-4)}function x(_,g){g.gradientMap&&(_.gradientMap.value=g.gradientMap)}function y(_,g){_.metalness.value=g.metalness,g.metalnessMap&&(_.metalnessMap.value=g.metalnessMap,n(g.metalnessMap,_.metalnessMapTransform)),_.roughness.value=g.roughness,g.roughnessMap&&(_.roughnessMap.value=g.roughnessMap,n(g.roughnessMap,_.roughnessMapTransform)),g.envMap&&(_.envMapIntensity.value=g.envMapIntensity)}function S(_,g,F){_.ior.value=g.ior,g.sheen>0&&(_.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),_.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(_.sheenColorMap.value=g.sheenColorMap,n(g.sheenColorMap,_.sheenColorMapTransform)),g.sheenRoughnessMap&&(_.sheenRoughnessMap.value=g.sheenRoughnessMap,n(g.sheenRoughnessMap,_.sheenRoughnessMapTransform))),g.clearcoat>0&&(_.clearcoat.value=g.clearcoat,_.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(_.clearcoatMap.value=g.clearcoatMap,n(g.clearcoatMap,_.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(_.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,n(g.clearcoatRoughnessMap,_.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(_.clearcoatNormalMap.value=g.clearcoatNormalMap,n(g.clearcoatNormalMap,_.clearcoatNormalMapTransform),_.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===pi&&_.clearcoatNormalScale.value.negate())),g.dispersion>0&&(_.dispersion.value=g.dispersion),g.iridescence>0&&(_.iridescence.value=g.iridescence,_.iridescenceIOR.value=g.iridescenceIOR,_.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],_.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(_.iridescenceMap.value=g.iridescenceMap,n(g.iridescenceMap,_.iridescenceMapTransform)),g.iridescenceThicknessMap&&(_.iridescenceThicknessMap.value=g.iridescenceThicknessMap,n(g.iridescenceThicknessMap,_.iridescenceThicknessMapTransform))),g.transmission>0&&(_.transmission.value=g.transmission,_.transmissionSamplerMap.value=F.texture,_.transmissionSamplerSize.value.set(F.width,F.height),g.transmissionMap&&(_.transmissionMap.value=g.transmissionMap,n(g.transmissionMap,_.transmissionMapTransform)),_.thickness.value=g.thickness,g.thicknessMap&&(_.thicknessMap.value=g.thicknessMap,n(g.thicknessMap,_.thicknessMapTransform)),_.attenuationDistance.value=g.attenuationDistance,_.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(_.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(_.anisotropyMap.value=g.anisotropyMap,n(g.anisotropyMap,_.anisotropyMapTransform))),_.specularIntensity.value=g.specularIntensity,_.specularColor.value.copy(g.specularColor),g.specularColorMap&&(_.specularColorMap.value=g.specularColorMap,n(g.specularColorMap,_.specularColorMapTransform)),g.specularIntensityMap&&(_.specularIntensityMap.value=g.specularIntensityMap,n(g.specularIntensityMap,_.specularIntensityMapTransform))}function T(_,g){g.matcap&&(_.matcap.value=g.matcap)}function E(_,g){const F=e.get(g).light;_.referencePosition.value.setFromMatrixPosition(F.matrixWorld),_.nearDistance.value=F.shadow.camera.near,_.farDistance.value=F.shadow.camera.far}return{refreshFogUniforms:r,refreshMaterialUniforms:a}}function kE(s,e,n,r){let a={},c={},f=[];const u=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function h(F,D){const A=D.program;r.uniformBlockBinding(F,A)}function p(F,D){let A=a[F.id];A===void 0&&(T(F),A=v(F),a[F.id]=A,F.addEventListener("dispose",_));const G=D.program;r.updateUBOMapping(F,G);const O=e.render.frame;c[F.id]!==O&&(y(F),c[F.id]=O)}function v(F){const D=x();F.__bindingPointIndex=D;const A=s.createBuffer(),G=F.__size,O=F.usage;return s.bindBuffer(s.UNIFORM_BUFFER,A),s.bufferData(s.UNIFORM_BUFFER,G,O),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,D,A),A}function x(){for(let F=0;F<u;F++)if(f.indexOf(F)===-1)return f.push(F),F;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function y(F){const D=a[F.id],A=F.uniforms,G=F.__cache;s.bindBuffer(s.UNIFORM_BUFFER,D);for(let O=0,z=A.length;O<z;O++){const $=Array.isArray(A[O])?A[O]:[A[O]];for(let L=0,b=$.length;L<b;L++){const U=$[L];if(S(U,O,L,G)===!0){const N=U.__offset,I=Array.isArray(U.value)?U.value:[U.value];let ae=0;for(let re=0;re<I.length;re++){const ce=I[re],fe=E(ce);typeof ce=="number"||typeof ce=="boolean"?(U.__data[0]=ce,s.bufferSubData(s.UNIFORM_BUFFER,N+ae,U.__data)):ce.isMatrix3?(U.__data[0]=ce.elements[0],U.__data[1]=ce.elements[1],U.__data[2]=ce.elements[2],U.__data[3]=0,U.__data[4]=ce.elements[3],U.__data[5]=ce.elements[4],U.__data[6]=ce.elements[5],U.__data[7]=0,U.__data[8]=ce.elements[6],U.__data[9]=ce.elements[7],U.__data[10]=ce.elements[8],U.__data[11]=0):(ce.toArray(U.__data,ae),ae+=fe.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,N,U.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function S(F,D,A,G){const O=F.value,z=D+"_"+A;if(G[z]===void 0)return typeof O=="number"||typeof O=="boolean"?G[z]=O:G[z]=O.clone(),!0;{const $=G[z];if(typeof O=="number"||typeof O=="boolean"){if($!==O)return G[z]=O,!0}else if($.equals(O)===!1)return $.copy(O),!0}return!1}function T(F){const D=F.uniforms;let A=0;const G=16;for(let z=0,$=D.length;z<$;z++){const L=Array.isArray(D[z])?D[z]:[D[z]];for(let b=0,U=L.length;b<U;b++){const N=L[b],I=Array.isArray(N.value)?N.value:[N.value];for(let ae=0,re=I.length;ae<re;ae++){const ce=I[ae],fe=E(ce),H=A%G,te=H%fe.boundary,se=H+te;A+=te,se!==0&&G-se<fe.storage&&(A+=G-se),N.__data=new Float32Array(fe.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=A,A+=fe.storage}}}const O=A%G;return O>0&&(A+=G-O),F.__size=A,F.__cache={},this}function E(F){const D={boundary:0,storage:0};return typeof F=="number"||typeof F=="boolean"?(D.boundary=4,D.storage=4):F.isVector2?(D.boundary=8,D.storage=8):F.isVector3||F.isColor?(D.boundary=16,D.storage=12):F.isVector4?(D.boundary=16,D.storage=16):F.isMatrix3?(D.boundary=48,D.storage=48):F.isMatrix4?(D.boundary=64,D.storage=64):F.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",F),D}function _(F){const D=F.target;D.removeEventListener("dispose",_);const A=f.indexOf(D.__bindingPointIndex);f.splice(A,1),s.deleteBuffer(a[D.id]),delete a[D.id],delete c[D.id]}function g(){for(const F in a)s.deleteBuffer(a[F]);f=[],a={},c={}}return{bind:h,update:p,dispose:g}}class BE{constructor(e={}){const{canvas:n=M_(),context:r=null,depth:a=!0,stencil:c=!1,alpha:f=!1,antialias:u=!1,premultipliedAlpha:h=!0,preserveDrawingBuffer:p=!1,powerPreference:v="default",failIfMajorPerformanceCaveat:x=!1,reverseDepthBuffer:y=!1}=e;this.isWebGLRenderer=!0;let S;if(r!==null){if(typeof WebGLRenderingContext<"u"&&r instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=r.getContextAttributes().alpha}else S=f;const T=new Uint32Array(4),E=new Int32Array(4);let _=null,g=null;const F=[],D=[];this.domElement=n,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=Bi,this.toneMapping=Ls,this.toneMappingExposure=1;const A=this;let G=!1,O=0,z=0,$=null,L=-1,b=null;const U=new _n,N=new _n;let I=null;const ae=new Ct(0);let re=0,ce=n.width,fe=n.height,H=1,te=null,se=null;const B=new _n(0,0,ce,fe),oe=new _n(0,0,ce,fe);let be=!1;const Q=new v0;let me=!1,Me=!1;this.transmissionResolutionScale=1;const xe=new dn,Re=new dn,Ne=new ee,ke=new _n,vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let tt=!1;function _t(){return $===null?H:1}let V=r;function St(M,j){return n.getContext(M,j)}try{const M={alpha:!0,depth:a,stencil:c,antialias:u,premultipliedAlpha:h,preserveDrawingBuffer:p,powerPreference:v,failIfMajorPerformanceCaveat:x};if("setAttribute"in n&&n.setAttribute("data-engine",`three.js r${wh}`),n.addEventListener("webglcontextlost",ye,!1),n.addEventListener("webglcontextrestored",He,!1),n.addEventListener("webglcontextcreationerror",Ve,!1),V===null){const j="webgl2";if(V=St(j,M),V===null)throw St(j)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(M){throw console.error("THREE.WebGLRenderer: "+M.message),M}let _e,Ue,de,Le,Se,C,R,W,ie,ge,pe,Fe,Ce,Be,ot,Te,Xe,it,rt,Ye,mt,ht,wt,q;function Oe(){_e=new qS(V),_e.init(),ht=new PE(V,_e),Ue=new VS(V,_e,e,ht),de=new bE(V,_e),Ue.reverseDepthBuffer&&y&&de.buffers.depth.setReversed(!0),Le=new ZS(V),Se=new mE,C=new CE(V,_e,de,Se,Ue,ht,Le),R=new WS(A),W=new YS(A),ie=new rx(V),wt=new zS(V,ie),ge=new $S(V,ie,Le,wt),pe=new QS(V,ge,ie,Le),rt=new JS(V,Ue,C),Te=new GS(Se),Fe=new pE(A,R,W,_e,Ue,wt,Te),Ce=new OE(A,Se),Be=new vE,ot=new EE(_e),it=new BS(A,R,W,de,pe,S,h),Xe=new RE(A,pe,Ue),q=new kE(V,Le,Ue,de),Ye=new HS(V,_e,Le),mt=new KS(V,_e,Le),Le.programs=Fe.programs,A.capabilities=Ue,A.extensions=_e,A.properties=Se,A.renderLists=Be,A.shadowMap=Xe,A.state=de,A.info=Le}Oe();const ve=new NE(A,V);this.xr=ve,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){const M=_e.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){const M=_e.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(M){M!==void 0&&(H=M,this.setSize(ce,fe,!1))},this.getSize=function(M){return M.set(ce,fe)},this.setSize=function(M,j,Z=!0){if(ve.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}ce=M,fe=j,n.width=Math.floor(M*H),n.height=Math.floor(j*H),Z===!0&&(n.style.width=M+"px",n.style.height=j+"px"),this.setViewport(0,0,M,j)},this.getDrawingBufferSize=function(M){return M.set(ce*H,fe*H).floor()},this.setDrawingBufferSize=function(M,j,Z){ce=M,fe=j,H=Z,n.width=Math.floor(M*Z),n.height=Math.floor(j*Z),this.setViewport(0,0,M,j)},this.getCurrentViewport=function(M){return M.copy(U)},this.getViewport=function(M){return M.copy(B)},this.setViewport=function(M,j,Z,J){M.isVector4?B.set(M.x,M.y,M.z,M.w):B.set(M,j,Z,J),de.viewport(U.copy(B).multiplyScalar(H).round())},this.getScissor=function(M){return M.copy(oe)},this.setScissor=function(M,j,Z,J){M.isVector4?oe.set(M.x,M.y,M.z,M.w):oe.set(M,j,Z,J),de.scissor(N.copy(oe).multiplyScalar(H).round())},this.getScissorTest=function(){return be},this.setScissorTest=function(M){de.setScissorTest(be=M)},this.setOpaqueSort=function(M){te=M},this.setTransparentSort=function(M){se=M},this.getClearColor=function(M){return M.copy(it.getClearColor())},this.setClearColor=function(){it.setClearColor.apply(it,arguments)},this.getClearAlpha=function(){return it.getClearAlpha()},this.setClearAlpha=function(){it.setClearAlpha.apply(it,arguments)},this.clear=function(M=!0,j=!0,Z=!0){let J=0;if(M){let K=!1;if($!==null){const Ae=$.texture.format;K=Ae===Dh||Ae===Lh||Ae===Ph}if(K){const Ae=$.texture.type,ze=Ae===Yr||Ae===xo||Ae===vl||Ae===Aa||Ae===Ah||Ae===bh,Ge=it.getClearColor(),qe=it.getClearAlpha(),at=Ge.r,lt=Ge.g,$e=Ge.b;ze?(T[0]=at,T[1]=lt,T[2]=$e,T[3]=qe,V.clearBufferuiv(V.COLOR,0,T)):(E[0]=at,E[1]=lt,E[2]=$e,E[3]=qe,V.clearBufferiv(V.COLOR,0,E))}else J|=V.COLOR_BUFFER_BIT}j&&(J|=V.DEPTH_BUFFER_BIT),Z&&(J|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),V.clear(J)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){n.removeEventListener("webglcontextlost",ye,!1),n.removeEventListener("webglcontextrestored",He,!1),n.removeEventListener("webglcontextcreationerror",Ve,!1),it.dispose(),Be.dispose(),ot.dispose(),Se.dispose(),R.dispose(),W.dispose(),pe.dispose(),wt.dispose(),q.dispose(),Fe.dispose(),ve.dispose(),ve.removeEventListener("sessionstart",$r),ve.removeEventListener("sessionend",ar),Wi.stop()};function ye(M){M.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),G=!0}function He(){console.log("THREE.WebGLRenderer: Context Restored."),G=!1;const M=Le.autoReset,j=Xe.enabled,Z=Xe.autoUpdate,J=Xe.needsUpdate,K=Xe.type;Oe(),Le.autoReset=M,Xe.enabled=j,Xe.autoUpdate=Z,Xe.needsUpdate=J,Xe.type=K}function Ve(M){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function ft(M){const j=M.target;j.removeEventListener("dispose",ft),Vt(j)}function Vt(M){hn(M),Se.remove(M)}function hn(M){const j=Se.get(M).programs;j!==void 0&&(j.forEach(function(Z){Fe.releaseProgram(Z)}),M.isShaderMaterial&&Fe.releaseShaderCache(M))}this.renderBufferDirect=function(M,j,Z,J,K,Ae){j===null&&(j=vt);const ze=K.isMesh&&K.matrixWorld.determinant()<0,Ge=Eo(M,j,Z,J,K);de.setMaterial(J,ze);let qe=Z.index,at=1;if(J.wireframe===!0){if(qe=ge.getWireframeAttribute(Z),qe===void 0)return;at=2}const lt=Z.drawRange,$e=Z.attributes.position;let Mt=lt.start*at,gt=(lt.start+lt.count)*at;Ae!==null&&(Mt=Math.max(Mt,Ae.start*at),gt=Math.min(gt,(Ae.start+Ae.count)*at)),qe!==null?(Mt=Math.max(Mt,0),gt=Math.min(gt,qe.count)):$e!=null&&(Mt=Math.max(Mt,0),gt=Math.min(gt,$e.count));const $t=gt-Mt;if($t<0||$t===1/0)return;wt.setup(K,J,Ge,Z,qe);let Wt,At=Ye;if(qe!==null&&(Wt=ie.get(qe),At=mt,At.setIndex(Wt)),K.isMesh)J.wireframe===!0?(de.setLineWidth(J.wireframeLinewidth*_t()),At.setMode(V.LINES)):At.setMode(V.TRIANGLES);else if(K.isLine){let et=J.linewidth;et===void 0&&(et=1),de.setLineWidth(et*_t()),K.isLineSegments?At.setMode(V.LINES):K.isLineLoop?At.setMode(V.LINE_LOOP):At.setMode(V.LINE_STRIP)}else K.isPoints?At.setMode(V.POINTS):K.isSprite&&At.setMode(V.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)At.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(_e.get("WEBGL_multi_draw"))At.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const et=K._multiDrawStarts,Qt=K._multiDrawCounts,Et=K._multiDrawCount,Sn=qe?ie.get(qe).bytesPerElement:1,cr=Se.get(J).currentProgram.getUniforms();for(let Un=0;Un<Et;Un++)cr.setValue(V,"_gl_DrawID",Un),At.render(et[Un]/Sn,Qt[Un])}else if(K.isInstancedMesh)At.renderInstances(Mt,$t,K.count);else if(Z.isInstancedBufferGeometry){const et=Z._maxInstanceCount!==void 0?Z._maxInstanceCount:1/0,Qt=Math.min(Z.instanceCount,et);At.renderInstances(Mt,$t,Qt)}else At.render(Mt,$t)};function Pt(M,j,Z){M.transparent===!0&&M.side===Hi&&M.forceSinglePass===!1?(M.side=pi,M.needsUpdate=!0,Kr(M,j,Z),M.side=Is,M.needsUpdate=!0,Kr(M,j,Z),M.side=Hi):Kr(M,j,Z)}this.compile=function(M,j,Z=null){Z===null&&(Z=M),g=ot.get(Z),g.init(j),D.push(g),Z.traverseVisible(function(K){K.isLight&&K.layers.test(j.layers)&&(g.pushLight(K),K.castShadow&&g.pushShadow(K))}),M!==Z&&M.traverseVisible(function(K){K.isLight&&K.layers.test(j.layers)&&(g.pushLight(K),K.castShadow&&g.pushShadow(K))}),g.setupLights();const J=new Set;return M.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Ae=K.material;if(Ae)if(Array.isArray(Ae))for(let ze=0;ze<Ae.length;ze++){const Ge=Ae[ze];Pt(Ge,Z,K),J.add(Ge)}else Pt(Ae,Z,K),J.add(Ae)}),D.pop(),g=null,J},this.compileAsync=function(M,j,Z=null){const J=this.compile(M,j,Z);return new Promise(K=>{function Ae(){if(J.forEach(function(ze){Se.get(ze).currentProgram.isReady()&&J.delete(ze)}),J.size===0){K(M);return}setTimeout(Ae,10)}_e.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let Bn=null;function In(M){Bn&&Bn(M)}function $r(){Wi.stop()}function ar(){Wi.start()}const Wi=new x0;Wi.setAnimationLoop(In),typeof self<"u"&&Wi.setContext(self),this.setAnimationLoop=function(M){Bn=M,ve.setAnimationLoop(M),M===null?Wi.stop():Wi.start()},ve.addEventListener("sessionstart",$r),ve.addEventListener("sessionend",ar),this.render=function(M,j){if(j!==void 0&&j.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(G===!0)return;if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),j.parent===null&&j.matrixWorldAutoUpdate===!0&&j.updateMatrixWorld(),ve.enabled===!0&&ve.isPresenting===!0&&(ve.cameraAutoUpdate===!0&&ve.updateCamera(j),j=ve.getCamera()),M.isScene===!0&&M.onBeforeRender(A,M,j,$),g=ot.get(M,D.length),g.init(j),D.push(g),Re.multiplyMatrices(j.projectionMatrix,j.matrixWorldInverse),Q.setFromProjectionMatrix(Re),Me=this.localClippingEnabled,me=Te.init(this.clippingPlanes,Me),_=Be.get(M,F.length),_.init(),F.push(_),ve.enabled===!0&&ve.isPresenting===!0){const Ae=A.xr.getDepthSensingMesh();Ae!==null&&Xi(Ae,j,-1/0,A.sortObjects)}Xi(M,j,0,A.sortObjects),_.finish(),A.sortObjects===!0&&_.sort(te,se),tt=ve.enabled===!1||ve.isPresenting===!1||ve.hasDepthSensing()===!1,tt&&it.addToRenderList(_,M),this.info.render.frame++,me===!0&&Te.beginShadows();const Z=g.state.shadowsArray;Xe.render(Z,M,j),me===!0&&Te.endShadows(),this.info.autoReset===!0&&this.info.reset();const J=_.opaque,K=_.transmissive;if(g.setupLights(),j.isArrayCamera){const Ae=j.cameras;if(K.length>0)for(let ze=0,Ge=Ae.length;ze<Ge;ze++){const qe=Ae[ze];Er(J,K,M,qe)}tt&&it.render(M);for(let ze=0,Ge=Ae.length;ze<Ge;ze++){const qe=Ae[ze];Mr(_,M,qe,qe.viewport)}}else K.length>0&&Er(J,K,M,j),tt&&it.render(M),Mr(_,M,j);$!==null&&z===0&&(C.updateMultisampleRenderTarget($),C.updateRenderTargetMipmap($)),M.isScene===!0&&M.onAfterRender(A,M,j),wt.resetDefaultState(),L=-1,b=null,D.pop(),D.length>0?(g=D[D.length-1],me===!0&&Te.setGlobalState(A.clippingPlanes,g.state.camera)):g=null,F.pop(),F.length>0?_=F[F.length-1]:_=null};function Xi(M,j,Z,J){if(M.visible===!1)return;if(M.layers.test(j.layers)){if(M.isGroup)Z=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(j);else if(M.isLight)g.pushLight(M),M.castShadow&&g.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||Q.intersectsSprite(M)){J&&ke.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Re);const ze=pe.update(M),Ge=M.material;Ge.visible&&_.push(M,ze,Ge,Z,ke.z,null)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||Q.intersectsObject(M))){const ze=pe.update(M),Ge=M.material;if(J&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),ke.copy(M.boundingSphere.center)):(ze.boundingSphere===null&&ze.computeBoundingSphere(),ke.copy(ze.boundingSphere.center)),ke.applyMatrix4(M.matrixWorld).applyMatrix4(Re)),Array.isArray(Ge)){const qe=ze.groups;for(let at=0,lt=qe.length;at<lt;at++){const $e=qe[at],Mt=Ge[$e.materialIndex];Mt&&Mt.visible&&_.push(M,ze,Mt,Z,ke.z,$e)}}else Ge.visible&&_.push(M,ze,Ge,Z,ke.z,null)}}const Ae=M.children;for(let ze=0,Ge=Ae.length;ze<Ge;ze++)Xi(Ae[ze],j,Z,J)}function Mr(M,j,Z,J){const K=M.opaque,Ae=M.transmissive,ze=M.transparent;g.setupLightsView(Z),me===!0&&Te.setGlobalState(A.clippingPlanes,Z),J&&de.viewport(U.copy(J)),K.length>0&&lr(K,j,Z),Ae.length>0&&lr(Ae,j,Z),ze.length>0&&lr(ze,j,Z),de.buffers.depth.setTest(!0),de.buffers.depth.setMask(!0),de.buffers.color.setMask(!0),de.setPolygonOffset(!1)}function Er(M,j,Z,J){if((Z.isScene===!0?Z.overrideMaterial:null)!==null)return;g.state.transmissionRenderTarget[J.id]===void 0&&(g.state.transmissionRenderTarget[J.id]=new yo(1,1,{generateMipmaps:!0,type:_e.has("EXT_color_buffer_half_float")||_e.has("EXT_color_buffer_float")?_l:Yr,minFilter:_o,samples:4,stencilBuffer:c,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Ft.workingColorSpace}));const Ae=g.state.transmissionRenderTarget[J.id],ze=J.viewport||U;Ae.setSize(ze.z*A.transmissionResolutionScale,ze.w*A.transmissionResolutionScale);const Ge=A.getRenderTarget();A.setRenderTarget(Ae),A.getClearColor(ae),re=A.getClearAlpha(),re<1&&A.setClearColor(16777215,.5),A.clear(),tt&&it.render(Z);const qe=A.toneMapping;A.toneMapping=Ls;const at=J.viewport;if(J.viewport!==void 0&&(J.viewport=void 0),g.setupLightsView(J),me===!0&&Te.setGlobalState(A.clippingPlanes,J),lr(M,Z,J),C.updateMultisampleRenderTarget(Ae),C.updateRenderTargetMipmap(Ae),_e.has("WEBGL_multisampled_render_to_texture")===!1){let lt=!1;for(let $e=0,Mt=j.length;$e<Mt;$e++){const gt=j[$e],$t=gt.object,Wt=gt.geometry,At=gt.material,et=gt.group;if(At.side===Hi&&$t.layers.test(J.layers)){const Qt=At.side;At.side=pi,At.needsUpdate=!0,So($t,Z,J,Wt,At,et),At.side=Qt,At.needsUpdate=!0,lt=!0}}lt===!0&&(C.updateMultisampleRenderTarget(Ae),C.updateRenderTargetMipmap(Ae))}A.setRenderTarget(Ge),A.setClearColor(ae,re),at!==void 0&&(J.viewport=at),A.toneMapping=qe}function lr(M,j,Z){const J=j.isScene===!0?j.overrideMaterial:null;for(let K=0,Ae=M.length;K<Ae;K++){const ze=M[K],Ge=ze.object,qe=ze.geometry,at=J===null?ze.material:J,lt=ze.group;Ge.layers.test(Z.layers)&&So(Ge,j,Z,qe,at,lt)}}function So(M,j,Z,J,K,Ae){M.onBeforeRender(A,j,Z,J,K,Ae),M.modelViewMatrix.multiplyMatrices(Z.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),K.onBeforeRender(A,j,Z,J,M,Ae),K.transparent===!0&&K.side===Hi&&K.forceSinglePass===!1?(K.side=pi,K.needsUpdate=!0,A.renderBufferDirect(Z,j,J,K,M,Ae),K.side=Is,K.needsUpdate=!0,A.renderBufferDirect(Z,j,J,K,M,Ae),K.side=Hi):A.renderBufferDirect(Z,j,J,K,M,Ae),M.onAfterRender(A,j,Z,J,K,Ae)}function Kr(M,j,Z){j.isScene!==!0&&(j=vt);const J=Se.get(M),K=g.state.lights,Ae=g.state.shadowsArray,ze=K.state.version,Ge=Fe.getParameters(M,K.state,Ae,j,Z),qe=Fe.getProgramCacheKey(Ge);let at=J.programs;J.environment=M.isMeshStandardMaterial?j.environment:null,J.fog=j.fog,J.envMap=(M.isMeshStandardMaterial?W:R).get(M.envMap||J.environment),J.envMapRotation=J.environment!==null&&M.envMap===null?j.environmentRotation:M.envMapRotation,at===void 0&&(M.addEventListener("dispose",ft),at=new Map,J.programs=at);let lt=at.get(qe);if(lt!==void 0){if(J.currentProgram===lt&&J.lightsStateVersion===ze)return Ri(M,Ge),lt}else Ge.uniforms=Fe.getUniforms(M),M.onBeforeCompile(Ge,A),lt=Fe.acquireProgram(Ge,qe),at.set(qe,lt),J.uniforms=Ge.uniforms;const $e=J.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&($e.clippingPlanes=Te.uniform),Ri(M,Ge),J.needsLights=Ai(M),J.lightsStateVersion=ze,J.needsLights&&($e.ambientLightColor.value=K.state.ambient,$e.lightProbe.value=K.state.probe,$e.directionalLights.value=K.state.directional,$e.directionalLightShadows.value=K.state.directionalShadow,$e.spotLights.value=K.state.spot,$e.spotLightShadows.value=K.state.spotShadow,$e.rectAreaLights.value=K.state.rectArea,$e.ltc_1.value=K.state.rectAreaLTC1,$e.ltc_2.value=K.state.rectAreaLTC2,$e.pointLights.value=K.state.point,$e.pointLightShadows.value=K.state.pointShadow,$e.hemisphereLights.value=K.state.hemi,$e.directionalShadowMap.value=K.state.directionalShadowMap,$e.directionalShadowMatrix.value=K.state.directionalShadowMatrix,$e.spotShadowMap.value=K.state.spotShadowMap,$e.spotLightMatrix.value=K.state.spotLightMatrix,$e.spotLightMap.value=K.state.spotLightMap,$e.pointShadowMap.value=K.state.pointShadowMap,$e.pointShadowMatrix.value=K.state.pointShadowMatrix),J.currentProgram=lt,J.uniformsList=null,lt}function Mo(M){if(M.uniformsList===null){const j=M.currentProgram.getUniforms();M.uniformsList=lu.seqWithValue(j.seq,M.uniforms)}return M.uniformsList}function Ri(M,j){const Z=Se.get(M);Z.outputColorSpace=j.outputColorSpace,Z.batching=j.batching,Z.batchingColor=j.batchingColor,Z.instancing=j.instancing,Z.instancingColor=j.instancingColor,Z.instancingMorph=j.instancingMorph,Z.skinning=j.skinning,Z.morphTargets=j.morphTargets,Z.morphNormals=j.morphNormals,Z.morphColors=j.morphColors,Z.morphTargetsCount=j.morphTargetsCount,Z.numClippingPlanes=j.numClippingPlanes,Z.numIntersection=j.numClipIntersection,Z.vertexAlphas=j.vertexAlphas,Z.vertexTangents=j.vertexTangents,Z.toneMapping=j.toneMapping}function Eo(M,j,Z,J,K){j.isScene!==!0&&(j=vt),C.resetTextureUnits();const Ae=j.fog,ze=J.isMeshStandardMaterial?j.environment:null,Ge=$===null?A.outputColorSpace:$.isXRRenderTarget===!0?$.texture.colorSpace:Ca,qe=(J.isMeshStandardMaterial?W:R).get(J.envMap||ze),at=J.vertexColors===!0&&!!Z.attributes.color&&Z.attributes.color.itemSize===4,lt=!!Z.attributes.tangent&&(!!J.normalMap||J.anisotropy>0),$e=!!Z.morphAttributes.position,Mt=!!Z.morphAttributes.normal,gt=!!Z.morphAttributes.color;let $t=Ls;J.toneMapped&&($===null||$.isXRRenderTarget===!0)&&($t=A.toneMapping);const Wt=Z.morphAttributes.position||Z.morphAttributes.normal||Z.morphAttributes.color,At=Wt!==void 0?Wt.length:0,et=Se.get(J),Qt=g.state.lights;if(me===!0&&(Me===!0||M!==b)){const ln=M===b&&J.id===L;Te.setState(J,M,ln)}let Et=!1;J.version===et.__version?(et.needsLights&&et.lightsStateVersion!==Qt.state.version||et.outputColorSpace!==Ge||K.isBatchedMesh&&et.batching===!1||!K.isBatchedMesh&&et.batching===!0||K.isBatchedMesh&&et.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&et.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&et.instancing===!1||!K.isInstancedMesh&&et.instancing===!0||K.isSkinnedMesh&&et.skinning===!1||!K.isSkinnedMesh&&et.skinning===!0||K.isInstancedMesh&&et.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&et.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&et.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&et.instancingMorph===!1&&K.morphTexture!==null||et.envMap!==qe||J.fog===!0&&et.fog!==Ae||et.numClippingPlanes!==void 0&&(et.numClippingPlanes!==Te.numPlanes||et.numIntersection!==Te.numIntersection)||et.vertexAlphas!==at||et.vertexTangents!==lt||et.morphTargets!==$e||et.morphNormals!==Mt||et.morphColors!==gt||et.toneMapping!==$t||et.morphTargetsCount!==At)&&(Et=!0):(Et=!0,et.__version=J.version);let Sn=et.currentProgram;Et===!0&&(Sn=Kr(J,j,K));let cr=!1,Un=!1,Ci=!1;const kt=Sn.getUniforms(),pn=et.uniforms;if(de.useProgram(Sn.program)&&(cr=!0,Un=!0,Ci=!0),J.id!==L&&(L=J.id,Un=!0),cr||b!==M){de.buffers.depth.getReversed()?(xe.copy(M.projectionMatrix),T_(xe),w_(xe),kt.setValue(V,"projectionMatrix",xe)):kt.setValue(V,"projectionMatrix",M.projectionMatrix),kt.setValue(V,"viewMatrix",M.matrixWorldInverse);const cn=kt.map.cameraPosition;cn!==void 0&&cn.setValue(V,Ne.setFromMatrixPosition(M.matrixWorld)),Ue.logarithmicDepthBuffer&&kt.setValue(V,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(J.isMeshPhongMaterial||J.isMeshToonMaterial||J.isMeshLambertMaterial||J.isMeshBasicMaterial||J.isMeshStandardMaterial||J.isShaderMaterial)&&kt.setValue(V,"isOrthographic",M.isOrthographicCamera===!0),b!==M&&(b=M,Un=!0,Ci=!0)}if(K.isSkinnedMesh){kt.setOptional(V,K,"bindMatrix"),kt.setOptional(V,K,"bindMatrixInverse");const ln=K.skeleton;ln&&(ln.boneTexture===null&&ln.computeBoneTexture(),kt.setValue(V,"boneTexture",ln.boneTexture,C))}K.isBatchedMesh&&(kt.setOptional(V,K,"batchingTexture"),kt.setValue(V,"batchingTexture",K._matricesTexture,C),kt.setOptional(V,K,"batchingIdTexture"),kt.setValue(V,"batchingIdTexture",K._indirectTexture,C),kt.setOptional(V,K,"batchingColorTexture"),K._colorsTexture!==null&&kt.setValue(V,"batchingColorTexture",K._colorsTexture,C));const Kt=Z.morphAttributes;if((Kt.position!==void 0||Kt.normal!==void 0||Kt.color!==void 0)&&rt.update(K,Z,Sn),(Un||et.receiveShadow!==K.receiveShadow)&&(et.receiveShadow=K.receiveShadow,kt.setValue(V,"receiveShadow",K.receiveShadow)),J.isMeshGouraudMaterial&&J.envMap!==null&&(pn.envMap.value=qe,pn.flipEnvMap.value=qe.isCubeTexture&&qe.isRenderTargetTexture===!1?-1:1),J.isMeshStandardMaterial&&J.envMap===null&&j.environment!==null&&(pn.envMapIntensity.value=j.environmentIntensity),Un&&(kt.setValue(V,"toneMappingExposure",A.toneMappingExposure),et.needsLights&&To(pn,Ci),Ae&&J.fog===!0&&Ce.refreshFogUniforms(pn,Ae),Ce.refreshMaterialUniforms(pn,J,H,fe,g.state.transmissionRenderTarget[M.id]),lu.upload(V,Mo(et),pn,C)),J.isShaderMaterial&&J.uniformsNeedUpdate===!0&&(lu.upload(V,Mo(et),pn,C),J.uniformsNeedUpdate=!1),J.isSpriteMaterial&&kt.setValue(V,"center",K.center),kt.setValue(V,"modelViewMatrix",K.modelViewMatrix),kt.setValue(V,"normalMatrix",K.normalMatrix),kt.setValue(V,"modelMatrix",K.matrixWorld),J.isShaderMaterial||J.isRawShaderMaterial){const ln=J.uniformsGroups;for(let cn=0,Rt=ln.length;cn<Rt;cn++){const mi=ln[cn];q.update(mi,Sn),q.bind(mi,Sn)}}return Sn}function To(M,j){M.ambientLightColor.needsUpdate=j,M.lightProbe.needsUpdate=j,M.directionalLights.needsUpdate=j,M.directionalLightShadows.needsUpdate=j,M.pointLights.needsUpdate=j,M.pointLightShadows.needsUpdate=j,M.spotLights.needsUpdate=j,M.spotLightShadows.needsUpdate=j,M.rectAreaLights.needsUpdate=j,M.hemisphereLights.needsUpdate=j}function Ai(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return O},this.getActiveMipmapLevel=function(){return z},this.getRenderTarget=function(){return $},this.setRenderTargetTextures=function(M,j,Z){Se.get(M.texture).__webglTexture=j,Se.get(M.depthTexture).__webglTexture=Z;const J=Se.get(M);J.__hasExternalTextures=!0,J.__autoAllocateDepthBuffer=Z===void 0,J.__autoAllocateDepthBuffer||_e.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),J.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(M,j){const Z=Se.get(M);Z.__webglFramebuffer=j,Z.__useDefaultFramebuffer=j===void 0};const Us=V.createFramebuffer();this.setRenderTarget=function(M,j=0,Z=0){$=M,O=j,z=Z;let J=!0,K=null,Ae=!1,ze=!1;if(M){const qe=Se.get(M);if(qe.__useDefaultFramebuffer!==void 0)de.bindFramebuffer(V.FRAMEBUFFER,null),J=!1;else if(qe.__webglFramebuffer===void 0)C.setupRenderTarget(M);else if(qe.__hasExternalTextures)C.rebindTextures(M,Se.get(M.texture).__webglTexture,Se.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){const $e=M.depthTexture;if(qe.__boundDepthTexture!==$e){if($e!==null&&Se.has($e)&&(M.width!==$e.image.width||M.height!==$e.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");C.setupDepthRenderbuffer(M)}}const at=M.texture;(at.isData3DTexture||at.isDataArrayTexture||at.isCompressedArrayTexture)&&(ze=!0);const lt=Se.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(lt[j])?K=lt[j][Z]:K=lt[j],Ae=!0):M.samples>0&&C.useMultisampledRTT(M)===!1?K=Se.get(M).__webglMultisampledFramebuffer:Array.isArray(lt)?K=lt[Z]:K=lt,U.copy(M.viewport),N.copy(M.scissor),I=M.scissorTest}else U.copy(B).multiplyScalar(H).floor(),N.copy(oe).multiplyScalar(H).floor(),I=be;if(Z!==0&&(K=Us),de.bindFramebuffer(V.FRAMEBUFFER,K)&&J&&de.drawBuffers(M,K),de.viewport(U),de.scissor(N),de.setScissorTest(I),Ae){const qe=Se.get(M.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+j,qe.__webglTexture,Z)}else if(ze){const qe=Se.get(M.texture),at=j;V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,qe.__webglTexture,Z,at)}else if(M!==null&&Z!==0){const qe=Se.get(M.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,qe.__webglTexture,Z)}L=-1},this.readRenderTargetPixels=function(M,j,Z,J,K,Ae,ze){if(!(M&&M.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ge=Se.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ze!==void 0&&(Ge=Ge[ze]),Ge){de.bindFramebuffer(V.FRAMEBUFFER,Ge);try{const qe=M.texture,at=qe.format,lt=qe.type;if(!Ue.textureFormatReadable(at)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Ue.textureTypeReadable(lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}j>=0&&j<=M.width-J&&Z>=0&&Z<=M.height-K&&V.readPixels(j,Z,J,K,ht.convert(at),ht.convert(lt),Ae)}finally{const qe=$!==null?Se.get($).__webglFramebuffer:null;de.bindFramebuffer(V.FRAMEBUFFER,qe)}}},this.readRenderTargetPixelsAsync=async function(M,j,Z,J,K,Ae,ze){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ge=Se.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&ze!==void 0&&(Ge=Ge[ze]),Ge){const qe=M.texture,at=qe.format,lt=qe.type;if(!Ue.textureFormatReadable(at))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Ue.textureTypeReadable(lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(j>=0&&j<=M.width-J&&Z>=0&&Z<=M.height-K){de.bindFramebuffer(V.FRAMEBUFFER,Ge);const $e=V.createBuffer();V.bindBuffer(V.PIXEL_PACK_BUFFER,$e),V.bufferData(V.PIXEL_PACK_BUFFER,Ae.byteLength,V.STREAM_READ),V.readPixels(j,Z,J,K,ht.convert(at),ht.convert(lt),0);const Mt=$!==null?Se.get($).__webglFramebuffer:null;de.bindFramebuffer(V.FRAMEBUFFER,Mt);const gt=V.fenceSync(V.SYNC_GPU_COMMANDS_COMPLETE,0);return V.flush(),await E_(V,gt,4),V.bindBuffer(V.PIXEL_PACK_BUFFER,$e),V.getBufferSubData(V.PIXEL_PACK_BUFFER,0,Ae),V.deleteBuffer($e),V.deleteSync(gt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(M,j=null,Z=0){M.isTexture!==!0&&(va("WebGLRenderer: copyFramebufferToTexture function signature has changed."),j=arguments[0]||null,M=arguments[1]);const J=Math.pow(2,-Z),K=Math.floor(M.image.width*J),Ae=Math.floor(M.image.height*J),ze=j!==null?j.x:0,Ge=j!==null?j.y:0;C.setTexture2D(M,0),V.copyTexSubImage2D(V.TEXTURE_2D,Z,0,0,ze,Ge,K,Ae),de.unbindTexture()};const bi=V.createFramebuffer(),wo=V.createFramebuffer();this.copyTextureToTexture=function(M,j,Z=null,J=null,K=0,Ae=null){M.isTexture!==!0&&(va("WebGLRenderer: copyTextureToTexture function signature has changed."),J=arguments[0]||null,M=arguments[1],j=arguments[2],Ae=arguments[3]||0,Z=null),Ae===null&&(K!==0?(va("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Ae=K,K=0):Ae=0);let ze,Ge,qe,at,lt,$e,Mt,gt,$t;const Wt=M.isCompressedTexture?M.mipmaps[Ae]:M.image;if(Z!==null)ze=Z.max.x-Z.min.x,Ge=Z.max.y-Z.min.y,qe=Z.isBox3?Z.max.z-Z.min.z:1,at=Z.min.x,lt=Z.min.y,$e=Z.isBox3?Z.min.z:0;else{const Kt=Math.pow(2,-K);ze=Math.floor(Wt.width*Kt),Ge=Math.floor(Wt.height*Kt),M.isDataArrayTexture?qe=Wt.depth:M.isData3DTexture?qe=Math.floor(Wt.depth*Kt):qe=1,at=0,lt=0,$e=0}J!==null?(Mt=J.x,gt=J.y,$t=J.z):(Mt=0,gt=0,$t=0);const At=ht.convert(j.format),et=ht.convert(j.type);let Qt;j.isData3DTexture?(C.setTexture3D(j,0),Qt=V.TEXTURE_3D):j.isDataArrayTexture||j.isCompressedArrayTexture?(C.setTexture2DArray(j,0),Qt=V.TEXTURE_2D_ARRAY):(C.setTexture2D(j,0),Qt=V.TEXTURE_2D),V.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,j.flipY),V.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,j.premultiplyAlpha),V.pixelStorei(V.UNPACK_ALIGNMENT,j.unpackAlignment);const Et=V.getParameter(V.UNPACK_ROW_LENGTH),Sn=V.getParameter(V.UNPACK_IMAGE_HEIGHT),cr=V.getParameter(V.UNPACK_SKIP_PIXELS),Un=V.getParameter(V.UNPACK_SKIP_ROWS),Ci=V.getParameter(V.UNPACK_SKIP_IMAGES);V.pixelStorei(V.UNPACK_ROW_LENGTH,Wt.width),V.pixelStorei(V.UNPACK_IMAGE_HEIGHT,Wt.height),V.pixelStorei(V.UNPACK_SKIP_PIXELS,at),V.pixelStorei(V.UNPACK_SKIP_ROWS,lt),V.pixelStorei(V.UNPACK_SKIP_IMAGES,$e);const kt=M.isDataArrayTexture||M.isData3DTexture,pn=j.isDataArrayTexture||j.isData3DTexture;if(M.isDepthTexture){const Kt=Se.get(M),ln=Se.get(j),cn=Se.get(Kt.__renderTarget),Rt=Se.get(ln.__renderTarget);de.bindFramebuffer(V.READ_FRAMEBUFFER,cn.__webglFramebuffer),de.bindFramebuffer(V.DRAW_FRAMEBUFFER,Rt.__webglFramebuffer);for(let mi=0;mi<qe;mi++)kt&&(V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Se.get(M).__webglTexture,K,$e+mi),V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Se.get(j).__webglTexture,Ae,$t+mi)),V.blitFramebuffer(at,lt,ze,Ge,Mt,gt,ze,Ge,V.DEPTH_BUFFER_BIT,V.NEAREST);de.bindFramebuffer(V.READ_FRAMEBUFFER,null),de.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(K!==0||M.isRenderTargetTexture||Se.has(M)){const Kt=Se.get(M),ln=Se.get(j);de.bindFramebuffer(V.READ_FRAMEBUFFER,bi),de.bindFramebuffer(V.DRAW_FRAMEBUFFER,wo);for(let cn=0;cn<qe;cn++)kt?V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Kt.__webglTexture,K,$e+cn):V.framebufferTexture2D(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Kt.__webglTexture,K),pn?V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,ln.__webglTexture,Ae,$t+cn):V.framebufferTexture2D(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,ln.__webglTexture,Ae),K!==0?V.blitFramebuffer(at,lt,ze,Ge,Mt,gt,ze,Ge,V.COLOR_BUFFER_BIT,V.NEAREST):pn?V.copyTexSubImage3D(Qt,Ae,Mt,gt,$t+cn,at,lt,ze,Ge):V.copyTexSubImage2D(Qt,Ae,Mt,gt,at,lt,ze,Ge);de.bindFramebuffer(V.READ_FRAMEBUFFER,null),de.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else pn?M.isDataTexture||M.isData3DTexture?V.texSubImage3D(Qt,Ae,Mt,gt,$t,ze,Ge,qe,At,et,Wt.data):j.isCompressedArrayTexture?V.compressedTexSubImage3D(Qt,Ae,Mt,gt,$t,ze,Ge,qe,At,Wt.data):V.texSubImage3D(Qt,Ae,Mt,gt,$t,ze,Ge,qe,At,et,Wt):M.isDataTexture?V.texSubImage2D(V.TEXTURE_2D,Ae,Mt,gt,ze,Ge,At,et,Wt.data):M.isCompressedTexture?V.compressedTexSubImage2D(V.TEXTURE_2D,Ae,Mt,gt,Wt.width,Wt.height,At,Wt.data):V.texSubImage2D(V.TEXTURE_2D,Ae,Mt,gt,ze,Ge,At,et,Wt);V.pixelStorei(V.UNPACK_ROW_LENGTH,Et),V.pixelStorei(V.UNPACK_IMAGE_HEIGHT,Sn),V.pixelStorei(V.UNPACK_SKIP_PIXELS,cr),V.pixelStorei(V.UNPACK_SKIP_ROWS,Un),V.pixelStorei(V.UNPACK_SKIP_IMAGES,Ci),Ae===0&&j.generateMipmaps&&V.generateMipmap(Qt),de.unbindTexture()},this.copyTextureToTexture3D=function(M,j,Z=null,J=null,K=0){return M.isTexture!==!0&&(va("WebGLRenderer: copyTextureToTexture3D function signature has changed."),Z=arguments[0]||null,J=arguments[1]||null,M=arguments[2],j=arguments[3],K=arguments[4]||0),va('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(M,j,Z,J,K)},this.initRenderTarget=function(M){Se.get(M).__webglFramebuffer===void 0&&C.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?C.setTextureCube(M,0):M.isData3DTexture?C.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?C.setTexture2DArray(M,0):C.setTexture2D(M,0),de.unbindTexture()},this.resetState=function(){O=0,z=0,$=null,de.reset(),wt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xr}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const n=this.getContext();n.drawingBufferColorspace=Ft._getDrawingBufferColorSpace(e),n.unpackColorSpace=Ft._getUnpackColorSpace()}}const xr=-8,Wr=500,Og=320,tu=12,ya=.5;function ei(s,e,n){return Math.max(e,Math.min(n,s))}function Ld(s,e,n){return s+(e-s)*n}function zE(){let s;do s=Math.random();while(s<=0);return Math.sqrt(-2*Math.log(s))*Math.cos(2*Math.PI*Math.random())}function gu(s,e){if(e<=0)return 1;const n=.5*s*s;if(n<=0)return 0;const r=e-n;if(Math.abs(r)<1e-9)return 1/(1+.5*e*e*ya*ya);if(r>0){const f=Math.sqrt(2*r),u=Math.sinh(f*ya);return 1/(1+e*e*u*u/(4*n*r))}const a=Math.sqrt(-2*r),c=Math.sin(a*ya);return 1/(1+e*e*c*c/(4*n*-r))}function fn(s,e,n){const r=(s-e)/n;return Math.exp(-.5*r*r)}const an={nx:800,nk:100,xmin:-50,xmax:50,xs:null,ks:null,phi:null,psiK:null,psi_re:new Float64Array(800),psi_im:new Float64Array(800),psiF_re:new Float64Array(800),psiF_im:new Float64Array(800),rhoBuf:new Float32Array(800),T_mean:0,tCross:0};function HE(s,e,n){const r=Math.sqrt(2*s),a=s<e;let c,f,u,h,p;if(a){const v=Math.sqrt(2*(e-s)+1e-20),x=Math.cosh(v*n),y=Math.sinh(v*n),S=x,T=.5*(v/r-r/v)*y,E=S*S+T*T,_=Math.cos(r*n),g=-Math.sin(r*n);u=(_*S+g*T)/E,h=(g*S-_*T)/E,p=u*u+h*h;const F=-.5*(v/r+r/v)*y,D=-F*h,A=F*u,G=Math.cos(r*n),O=Math.sin(r*n);return c=D*G-A*O,f=D*O+A*G,{k1:r,kappa:v,tun:!0,T:p,R:1-p,r_re:c,r_im:f,t_re:u,t_im:h}}else{const v=Math.sqrt(2*(s-e)+1e-20),x=Math.cos(v*n),y=Math.sin(v*n),S=x,T=-.5*(v/r+r/v)*y,E=S*S+T*T,_=Math.cos(r*n),g=-Math.sin(r*n);u=(_*S+g*T)/E,h=(g*S-_*T)/E,p=u*u+h*h;const F=.5*(r/v-v/r)*y,D=-F*h,A=F*u,G=Math.cos(r*n),O=Math.sin(r*n);return c=D*G-A*O,f=D*O+A*G,{k1:r,k2:v,tun:!1,T:p,R:1-p,r_re:c,r_im:f,t_re:u,t_im:h}}}function VE(s,e,n){const{k1:r,tun:a,r_re:c,r_im:f,t_re:u,t_im:h}=e,p=a?e.kappa:e.k2;if(s>=n){const T=Math.cos(r*s),E=Math.sin(r*s);return[u*T-h*E,u*E+h*T]}if(s<0){const T=Math.cos(r*s),E=Math.sin(r*s);return[T+c*T-f*-E,E+c*-E+f*T]}const v=u*Math.cos(r*n)-h*Math.sin(r*n),x=u*Math.sin(r*n)+h*Math.cos(r*n),y=-r*x,S=r*v;if(a){const T=p,E=(v+y/T)*.5,_=(x+S/T)*.5,g=(v-y/T)*.5,F=(x-S/T)*.5,D=Math.exp(T*(s-n)),A=Math.exp(-T*(s-n));return[E*D+g*A,_*D+F*A]}else{const T=p,E=(v+S/T)*.5,_=(x-y/T)*.5,g=v-E,F=x-_,D=Math.cos(T*(s-n)),A=Math.sin(T*(s-n));return[E*D-_*A+g*D+F*A,E*A+_*D-g*A+F*D]}}function kg(s,e,n){const{nx:r,nk:a,xmin:c,xmax:f}=an,u=2*ya,h=(f-c)/(r-1);an.xs=new Float64Array(r);for(let _=0;_<r;_++)an.xs[_]=c+_*h;const p=1/(2*n),v=Math.max(.05,s-5*p),y=(s+5*p-v)/(a-1),S=Math.pow(2*Math.PI*n*n,-.25);an.ks=new Float64Array(a),an.phi=new Float64Array(2*a),an.psiK=new Float32Array(a*r*2);let T=0,E=0;for(let _=0;_<a;_++){const g=v+_*y;an.ks[_]=g;const D=S*Math.exp(-.5*(g-s)*(g-s)*n*n)*y;an.phi[2*_]=D*Math.cos(g*xr),an.phi[2*_+1]=-D*Math.sin(g*xr);const A=.5*g*g,G=HE(A,e,u);T+=G.T*D*D,E+=D*D;for(let O=0;O<r;O++){const z=VE(an.xs[O]+ya,G,u);an.psiK[2*(_*r+O)]=z[0],an.psiK[2*(_*r+O)+1]=z[1]}}an.T_mean=E>0?T/E:0,an.tCross=Math.abs(xr)/s,T0(0)}function T0(s){const{nk:e,nx:n,ks:r,phi:a,psiK:c,psi_re:f,psi_im:u,psiF_re:h,psiF_im:p,rhoBuf:v,tCross:x}=an;if(!c)return;const y=.5*(1+Math.tanh(3*(s-x)));f.fill(0),u.fill(0),h.fill(0),p.fill(0);for(let S=0;S<e;S++){const T=r[S],E=.5*T*T,_=Math.cos(E*s),g=-Math.sin(E*s),F=a[2*S],D=a[2*S+1],A=F*_-D*g,G=F*g+D*_,O=2*S*n,z=T*(an.xmax-an.xmin)/(n-1),$=Math.cos(z),L=Math.sin(z);let b=Math.cos(T*an.xmin),U=Math.sin(T*an.xmin);for(let N=0;N<n;N++){const I=c[O+2*N],ae=c[O+2*N+1];f[N]+=A*I-G*ae,u[N]+=A*ae+G*I,h[N]+=A*b-G*U,p[N]+=A*U+G*b;const re=b*$-U*L;U=b*L+U*$,b=re}}for(let S=0;S<n;S++){const T=f[S]*y+h[S]*(1-y),E=u[S]*y+p[S]*(1-y);f[S]=T,u[S]=E,v[S]=T*T+E*E}}function Bg(s,e){if(s>=.9999)return 0;if(s<=1e-4)return 60;let n=0,r=60;for(let a=0;a<64;a++){const c=(n+r)/2;gu(e,c)>s?n=c:r=c}return(n+r)/2}function GE(s,e,n,r,a,c,f){const u=Math.abs(xr)/s,p=(u+9)/Wr,v=f?1:-1;let x=xr,y=c;const S=[];for(let T=0;T<=Wr;T++){const E=T*p;S.push({x,y}),E<u?x+=s*p:(x+=v*s*p,y+=0)}return S}function WE(s,e,n,r,a,c){const f=[],u=ei(gu(s,e),0,1);for(let h=0;h<c;h++){const p=Math.random()<u,v=a*zE(),x=GE(s,e,n,r,a,v,p),y=x[x.length-1].x>0;f.push({pts:x,isTransmit:y})}return f}const XE=`
  varying vec2 vPos;
  void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,jE=`
  varying vec2 vPos;
  uniform float uBl;              // blend 0→1 (scatter progress)
  uniform float uPT, uPR;
  uniform float uYT, uYR;
  uniform float uSigX, uSigY;
  uniform float uColBranch;       // collapse: 1=kill R, -1=kill T, 0=keep both
  uniform float uColFade;         // 0→1 fade of killed branch
  uniform float uIsPW;            // 1=pilot-wave mode
  uniform float uBY;              // Bohmian pointer Y(t)
  uniform float uXin, uXT, uXR;  // packet x-centres: pre-scatter, T, R

  vec3 inferno(float t) {
    t = clamp(t,0.,1.);
    vec3 c0=vec3(0.000,0.000,0.016), c1=vec3(0.227,0.031,0.384),
         c2=vec3(0.698,0.165,0.322), c3=vec3(0.937,0.490,0.129),
         c4=vec3(0.988,1.000,0.643);
    if(t<.25) return mix(c0,c1,t*4.);
    if(t<.50) return mix(c1,c2,(t-.25)*4.);
    if(t<.75) return mix(c2,c3,(t-.50)*4.);
    return               mix(c3,c4,(t-.75)*4.);
  }

  void main() {
    float x=vPos.x, y=vPos.y;

    // Particle x-Gaussians (analytical — compact, no quantum dispersion widening)
    float gX0 = exp(-0.5 * ((x - uXin) / uSigX) * ((x - uXin) / uSigX));
    float gXT  = exp(-0.5 * ((x - uXT)  / uSigX) * ((x - uXT)  / uSigX));
    float gXR  = exp(-0.5 * ((x - uXR)  / uSigX) * ((x - uXR)  / uSigX));

    // Pointer y-Gaussians
    // Incoming and reflected both sit at uYR (the "not detected" position)
    float gY0 = exp(-0.5 * ((y - uYR) / uSigY) * ((y - uYR) / uSigY));
    float gYT = exp(-0.5 * ((y - uYT) / uSigY) * ((y - uYT) / uSigY));
    float gYR = exp(-0.5 * ((y - uYR) / uSigY) * ((y - uYR) / uSigY));

    // Branch weights — Copenhagen collapses one branch; Pilot-Wave shows both always
    float wT = uPT, wR = uPR;
    if (uIsPW < 0.5) {
      if(uColBranch > 0.5)  wR *= (1. - uColFade);
      if(uColBranch < -0.5) wT *= (1. - uColFade);
    }

    // Pre-scatter: incoming packet approaching barrier, pointer at y=0
    float pre  = gX0 * gY0;

    // Post-scatter: T/R branches, each at its x/y centre
    float post = wT * gXT * gYT + wR * gXR * gYR;

    float dens = mix(pre, post, uBl);
    vec3  col  = inferno(clamp(dens * 2.2, 0., 1.));
    gl_FragColor = vec4(col, 1.0);
  }
`;new Ct(2289288);new Ct(16737843);new Ct(6737151);const YE=`
  varying vec2 vPos;
  void main() { vPos = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }
`,qE=`
  varying vec2 vPos;
  uniform float uSep;       // sepFrac 0→1
  uniform float uSepA;      // x-position of vertical separator (= 0, the barrier)
  void main() {
    float isT = step(uSepA, vPos.x);  // 1 if x > uSepA (right = World 1)
    vec3 tCol = vec3(0.00, 0.90, 1.00);  // electric cyan — World 1 (T)
    vec3 rCol = vec3(0.93, 0.08, 0.82);  // hot magenta — World 2 (R)
    vec3 color = mix(rCol, tCol, isT);
    float alpha = uSep * 0.28;
    gl_FragColor = vec4(color, alpha);
  }
`,As=({text:s,children:e})=>{const[n,r]=kn.useState(null),a=kn.useRef(),c=()=>{var x;if(!s)return;const v=(x=a.current)==null?void 0:x.getBoundingClientRect();v&&r({x:v.left+v.width/2,yTop:v.top,yBot:v.bottom})},f=()=>r(null),u=260,p=(n?n.yTop:999)>120;return ue.jsxs("span",{ref:a,style:{position:"relative",display:"block"},onMouseEnter:c,onMouseLeave:f,children:[e,n&&s&&Th.createPortal(ue.jsx("span",{style:{position:"fixed",left:Math.min(Math.max(n.x-u/2,8),window.innerWidth-u-8),top:p?n.yTop-8:n.yBot+8,transform:p?"translateY(-100%)":"none",background:"rgba(8,20,55,0.97)",border:"1px solid rgba(80,140,255,0.4)",borderRadius:5,padding:"6px 10px",fontSize:11,color:"#b8d4ff",whiteSpace:"pre-wrap",width:u,lineHeight:1.5,zIndex:99999,pointerEvents:"none",fontFamily:"'JetBrains Mono','Courier New',monospace",boxShadow:"0 4px 16px rgba(0,0,30,0.7)"},children:s}),document.body)]})},gr=({label:s,tip:e,children:n,fullWidth:r})=>ue.jsxs("div",{style:{marginBottom:10,gridColumn:r?"1 / -1":void 0},children:[ue.jsx(As,{text:e,children:ue.jsx("div",{style:{fontSize:12,color:"#7ab8ff",marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em",cursor:e?"help":"default",borderBottom:e?"1px dotted rgba(100,160,255,0.4)":"none",display:"inline-block"},children:s})}),n]}),Dd=["cpn","pw","mw"],w0={cpn:"Orthodox",pw:"Pilot-Wave",mw:"Many Worlds"},Mh={cpn:"#ff9966",pw:"#44ddff",mw:"#cc88ff"},R0={cpn:`Orthodox QM (von Neumann collapse):
Collapse means the pointer acquires a definite position —
the needle always moves, weak or strong.
Strong measurement: pointer branches are well-separated;
the losing branch disappears and the outcome is unambiguous.
Weak measurement: branches overlap; both survive in the
pointer wavefunction, but the needle still lands at a definite
y — just with poor signal-to-noise. Repeated weak measurements
still converge to the correct Born-rule statistics.`,pw:`Pilot-Wave / de Broglie–Bohm:
The particle always has a definite position, guided
by the wavefunction via the guidance equation.
No collapse ever occurs. Randomness arises solely
from uncertainty in the particle's initial position.
The x-projection shows ψ_cond(x|Y(t)) = Ψ(x, Y(t)) —
the conditional wavefunction at the actual pointer position.
Weak coupling: both T and R peaks survive (pointer branches
overlap at Y(t)). Strong coupling: only the particle's branch
survives as the pointer branches separate.`,mw:`Many-Worlds (Everett):
The wavefunction never collapses. Every outcome
occurs — in separate, non-communicating branches
of a universal wavefunction. There is no preferred
outcome and no randomness beyond branch indexing.`},zg={cpn:"A quantum particle hits a potential barrier — it tunnels through (T) or reflects (R). The 2D canvas shows the full configuration space: x = particle position, y = pointer of the measuring device. The pointer always acquires a definite reading (white marker on the y-panel) when the wave reaches the detector. In a strong measurement the branches are resolved and one disappears; in a weak measurement both branches survive but the pointer reading is noisy. Statistics always converge to the Born-rule T/R probabilities.",pw:"A quantum particle hits a potential barrier — it tunnels through (T) or reflects (R). Same global |Ψ(x,y)|² plus the Bohmian particle (X,Y) that rides one branch. Below: conditional wavefunction ψ_cond(x,Y(t)) and the two marginals.",mw:"A quantum particle hits a potential barrier — it tunnels through (T) or reflects (R). Both branches persist — the universe splits. World 1: particle transmitted. World 2: particle reflected. Neither world 'knows about' the other."};function $E({text:s}){const[e,n]=kn.useState(!1);return ue.jsxs("div",{style:{marginTop:3},children:[ue.jsx("button",{onClick:()=>n(r=>!r),style:{background:"none",border:"none",padding:0,cursor:"pointer",fontSize:10,color:"#4a6a9a",fontFamily:"'JetBrains Mono','Courier New',monospace",textDecoration:"underline dotted"},children:e?"▲ hide":"▼ what is this?"}),e&&ue.jsx("div",{style:{fontSize:11,color:"#99b8e8",lineHeight:1.6,marginTop:4},children:s})]})}function KE({needleHistory:s,deltaY:e,sigY:n,Tp:r}){const[a,c]=kn.useState(!1),f=kn.useRef({x:10,y:215}),[u,h]=kn.useState(f.current),p=kn.useRef(null),v=1-r,x=kn.useRef({w:210,h:130}),[y,S]=kn.useState(x.current),T=g=>{if(g.button!==0)return;g.stopPropagation();const F=g.clientX-x.current.w,D=g.clientY-x.current.h,A=O=>{const z={w:Math.max(150,O.clientX-F),h:Math.max(80,O.clientY-D)};x.current=z,S({...z})},G=()=>{window.removeEventListener("mousemove",A),window.removeEventListener("mouseup",G)};window.addEventListener("mousemove",A),window.addEventListener("mouseup",G)},E=g=>{if(g.button!==0)return;const F=g.clientX-f.current.x,D=g.clientY-f.current.y,A=O=>{const z={x:O.clientX-F,y:O.clientY-D};f.current=z,h({...z})},G=()=>{window.removeEventListener("mousemove",A),window.removeEventListener("mouseup",G)};window.addEventListener("mousemove",A),window.addEventListener("mouseup",G)},_=g=>{const F=g.touches[0],D=F.clientX-f.current.x,A=F.clientY-f.current.y,G=z=>{const $=z.touches[0],L={x:$.clientX-D,y:$.clientY-A};f.current=L,h({...L})},O=()=>{window.removeEventListener("touchmove",G),window.removeEventListener("touchend",O)};window.addEventListener("touchmove",G,{passive:!1}),window.addEventListener("touchend",O)};return kn.useEffect(()=>{if(a||!p.current)return;const g=p.current,F=g.width,D=g.height,A=g.getContext("2d");A.clearRect(0,0,F,D);const G=8,O=6,z=8,$=20,L=F-G-O,b=D-z-$,U=(_e,Ue,de)=>Math.exp(-.5*((_e-Ue)/de)**2)/(de*Math.sqrt(2*Math.PI)),N=_e=>r*U(_e,e,n),I=_e=>v*U(_e,0,n),ae=_e=>N(_e)+I(_e),re=Math.min(0,e)-3.2*n,fe=Math.max(0,e)+3.2*n-re||1,H=_e=>G+(_e-re)/fe*L,te=s.length,se=Math.max(8,Math.min(24,Math.round(Math.sqrt(te)*1.5+4))),B=fe/se,oe=new Float64Array(se),be=new Float64Array(se);s.forEach(({dy:_e,isT:Ue})=>{const de=Math.floor((_e-re)/B);de>=0&&de<se&&(Ue?oe[de]++:be[de]++)});const Q=te>0?1/(te*B):0,me=oe.map(_e=>_e*Q),Me=be.map(_e=>_e*Q);let xe=0;for(let _e=0;_e<=400;_e++){const Ue=ae(re+fe*_e/400);Ue>xe&&(xe=Ue)}if(te>0)for(let _e=0;_e<se;_e++){const Ue=me[_e]+Me[_e];Ue>xe&&(xe=Ue)}xe===0&&(xe=1);const Re=_e=>z+b-_e/xe*b,Ne=_e=>{const Ue=r*U(_e,e,n),de=v*U(_e,0,n),Le=Ue+de;return Le<1e-30?.5:Ue/Le},ke=(_e,Ue=.95)=>{let de,Le,Se;if(_e>=.5){const C=(_e-.5)*2;de=Math.round(255+-221*C),Le=Math.round(255+-17*C),Se=Math.round(255+-119*C)}else{const C=(.5-_e)*2;de=Math.round(255+0*C),Le=Math.round(255+-136*C),Se=Math.round(255+-187*C)}return`rgba(${de},${Le},${Se},${Ue})`},vt=_e=>{const Ue=Ne(_e);return{dot:ke(Ue,.95),bar:ke(Ue,.6)}};if(te>0)for(let _e=0;_e<se;_e++){const Ue=oe[_e]+be[_e];if(Ue===0)continue;const de=Ue*Q,Le=Math.sqrt(Ue)*Q,Se=G+(_e+.5)*L/se,C=Re(de),R=Re(de+Le),W=Re(de-Le),ie=re+(_e+.5)*B,{dot:ge,bar:pe}=vt(ie);A.strokeStyle=pe,A.lineWidth=1.5,A.beginPath(),A.moveTo(Se,R),A.lineTo(Se,W),A.moveTo(Se-3,R),A.lineTo(Se+3,R),A.moveTo(Se-3,W),A.lineTo(Se+3,W),A.stroke(),A.beginPath(),A.arc(Se,C,3,0,2*Math.PI),A.fillStyle=ge,A.fill()}const tt=(_e,Ue,de)=>{A.beginPath();for(let Le=0;Le<=400;Le++){const Se=re+fe*Le/400,C=H(Se),R=Re(_e(Se));Le===0?A.moveTo(C,R):A.lineTo(C,R)}A.strokeStyle=Ue,A.lineWidth=de,A.stroke()};tt(N,"rgba(68,238,136,0.90)",2),tt(I,"rgba(255,119,68,0.90)",2),tt(ae,"rgba(180,210,255,0.60)",1.5),A.strokeStyle="rgba(50,80,140,0.5)",A.lineWidth=1,A.beginPath(),A.moveTo(G,z+b),A.lineTo(G+L,z+b),A.stroke(),A.setLineDash([2,3]),[{x:0,c:"rgba(255,119,68,0.35)"},{x:e,c:"rgba(68,238,136,0.35)"}].forEach(({x:_e,c:Ue})=>{const de=H(_e);de>=G&&de<=G+L&&(A.strokeStyle=Ue,A.beginPath(),A.moveTo(de,z),A.lineTo(de,z+b),A.stroke())}),A.setLineDash([]);const _t=_e=>{const Ue=r*U(_e,e,n),de=v*U(_e,0,n),Le=Ue+de;return Le<1e-30?.5:Ue/Le},V=_e=>ke(_t(_e),.85),St=z+b+7;s.forEach(({dy:_e})=>{const Ue=H(_e);Ue<G||Ue>G+L||(A.beginPath(),A.arc(Ue,St,2.5,0,2*Math.PI),A.fillStyle=V(_e),A.fill())}),A.fillStyle="rgba(70,100,150,0.7)",A.font="8px 'JetBrains Mono',monospace",A.textAlign="center",A.fillText("pointer y",G+L/2,D-2)},[s,e,n,r,a,y]),Th.createPortal(ue.jsxs("div",{style:{position:"fixed",left:u.x,top:u.y,zIndex:9999,width:a?"auto":y.w,minWidth:a?150:y.w,background:"rgba(4,10,30,0.90)",border:"1px solid rgba(60,110,220,0.45)",borderRadius:7,boxShadow:"0 4px 18px rgba(0,0,0,0.6)",fontFamily:"'JetBrains Mono','Courier New',monospace",userSelect:"none"},children:[ue.jsxs("div",{onMouseDown:E,onTouchStart:_,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 7px",background:"rgba(20,40,100,0.5)",cursor:"grab",borderRadius:a?7:"7px 7px 0 0",borderBottom:a?"none":"1px solid rgba(60,110,220,0.3)"},children:[ue.jsxs("span",{style:{fontSize:10,color:"#8ab0e0",fontWeight:700,letterSpacing:"0.07em"},children:["FINE POINTER DIST  N=",s.length]}),ue.jsx("button",{onMouseDown:g=>g.stopPropagation(),onTouchStart:g=>g.stopPropagation(),onClick:()=>c(g=>!g),style:{background:"none",border:"none",color:"#5080c0",cursor:"pointer",fontSize:12,lineHeight:1,padding:"0 2px",marginLeft:6},title:a?"Expand":"Minimise",children:a?"▶":"▼"})]}),!a&&ue.jsxs("div",{style:{padding:"5px 6px 4px",position:"relative"},children:[ue.jsxs("div",{style:{display:"flex",gap:10,marginBottom:3,fontSize:9},children:[ue.jsxs("span",{style:{color:"#44ee88"},children:["■ T  ",Math.round(r*100),"%"]}),ue.jsxs("span",{style:{color:"#ff7744"},children:["■ R  ",Math.round(v*100),"%"]}),ue.jsx("span",{style:{color:"rgba(160,190,255,0.55)"},children:"— total"}),ue.jsxs("span",{style:{color:"rgba(160,190,255,0.55)"},children:["dots: ",ue.jsx("span",{style:{color:"#22ee88"},children:"T"}),"/",ue.jsx("span",{style:{color:"#ff7744"},children:"R"}),"/white=mix"]})]}),ue.jsx("canvas",{ref:p,width:y.w-12,height:y.h,style:{display:"block",width:"100%",height:"auto"}}),ue.jsx("div",{style:{fontSize:9,color:"#304560",textAlign:"center",marginTop:2},children:s.length===0?"waiting for outcomes…":`${s.length} readings`}),ue.jsx("div",{onMouseDown:T,style:{position:"absolute",right:0,bottom:0,width:14,height:14,cursor:"nwse-resize",background:"linear-gradient(135deg, transparent 50%, rgba(80,120,200,0.45) 50%)",borderBottomRightRadius:7}})]})]}),document.body)}function ZE({histT:s,histR:e,histTotal:n,Tp:r}){const[a,c]=kn.useState(!1),f=kn.useRef({x:10,y:70}),[u,h]=kn.useState(f.current),p=T=>{if(T.button!==0)return;const E=T.clientX-f.current.x,_=T.clientY-f.current.y,g=D=>{const A={x:D.clientX-E,y:D.clientY-_};f.current=A,h({...A})},F=()=>{window.removeEventListener("mousemove",g),window.removeEventListener("mouseup",F)};window.addEventListener("mousemove",g),window.addEventListener("mouseup",F)},v=T=>{const E=T.touches[0],_=E.clientX-f.current.x,g=E.clientY-f.current.y,F=A=>{const G=A.touches[0],O={x:G.clientX-_,y:G.clientY-g};f.current=O,h({...O})},D=()=>{window.removeEventListener("touchmove",F),window.removeEventListener("touchend",D)};window.addEventListener("touchmove",F,{passive:!1}),window.addEventListener("touchend",D)},x=n>0?s/n:0,y=n>0?e/n:0,S=r;return Th.createPortal(ue.jsxs("div",{style:{position:"fixed",left:u.x,top:u.y,zIndex:9999,width:a?"auto":178,minWidth:a?140:178,background:"rgba(4,10,30,0.90)",border:"1px solid rgba(60,110,220,0.45)",borderRadius:7,boxShadow:"0 4px 18px rgba(0,0,0,0.6)",fontFamily:"'JetBrains Mono','Courier New',monospace",userSelect:"none"},children:[ue.jsxs("div",{onMouseDown:p,onTouchStart:v,style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"4px 7px",background:"rgba(20,40,100,0.5)",cursor:"grab",borderRadius:a?7:"7px 7px 0 0",borderBottom:a?"none":"1px solid rgba(60,110,220,0.3)"},children:[ue.jsxs("span",{style:{fontSize:10,color:"#8ab0e0",fontWeight:700,letterSpacing:"0.07em"},children:["COARSE POINTER DIST  N=",Math.round(n)]}),ue.jsx("button",{onMouseDown:T=>T.stopPropagation(),onTouchStart:T=>T.stopPropagation(),onClick:()=>c(T=>!T),style:{background:"none",border:"none",color:"#5080c0",cursor:"pointer",fontSize:12,lineHeight:1,padding:"0 2px",marginLeft:6},title:a?"Expand":"Minimise",children:a?"▶":"▼"})]}),!a&&ue.jsx("div",{style:{padding:"7px 9px 6px"},children:n===0?ue.jsx("div",{style:{fontSize:10,color:"#405070",fontStyle:"italic",textAlign:"center",padding:"4px 0"},children:"waiting for outcomes…"}):ue.jsxs(ue.Fragment,{children:[ue.jsxs("div",{style:{marginBottom:5},children:[ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2},children:[ue.jsxs("span",{style:{color:"#44ee88"},children:["T  ",Number.isInteger(s)?s:s.toFixed(2)]}),ue.jsxs("span",{style:{color:"#44ee88"},children:[Math.round(x*100),"%"]})]}),ue.jsxs("div",{style:{position:"relative",height:9,background:"rgba(15,30,70,0.7)",borderRadius:3,overflow:"visible"},children:[ue.jsx("div",{style:{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#1a7a3a,#44ee88)",width:`${x*100}%`,transition:"width 0.4s"}}),ue.jsx("div",{style:{position:"absolute",top:-2,bottom:-2,left:`${S*100}%`,width:2,background:"rgba(255,255,255,0.5)",borderRadius:1,transform:"translateX(-50%)"}})]})]}),ue.jsxs("div",{style:{marginBottom:4},children:[ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,marginBottom:2},children:[ue.jsxs("span",{style:{color:"#ff7744"},children:["R  ",Number.isInteger(e)?e:e.toFixed(2)]}),ue.jsxs("span",{style:{color:"#ff7744"},children:[Math.round(y*100),"%"]})]}),ue.jsx("div",{style:{height:9,background:"rgba(15,30,70,0.7)",borderRadius:3,overflow:"hidden"},children:ue.jsx("div",{style:{height:"100%",borderRadius:3,background:"linear-gradient(90deg,#7a2a10,#ff7744)",width:`${y*100}%`,transition:"width 0.4s"}})})]}),ue.jsxs("div",{style:{fontSize:9,color:"#304560",textAlign:"right",marginTop:2},children:["╴ theory T=",Math.round(S*100),"%"]})]})})]}),document.body)}const JE=kn.memo(({interp:s,setInterp:e,tTarget:n,setTTarget:r,tTargetRef:a,lam:c,setLam:f,lamRef:u,xPointer:h,setXPointer:p,xPointerRef:v,detWidth:x,setDetWidth:y,detWidthRef:S,sigX:T,setSigX:E,sigXRef:_,sigY:g,setSigY:F,sigYRef:D,collapseThreshold:A,setCollapseThreshold:G,collapseThresholdRef:O,speed:z,setSpeed:$,speedRef:L,pauseHoldMs:b,setPauseHoldMs:U,pauseHoldMsRef:N,showWave:I,setShowWave:ae,showTraj:re,setShowTraj:ce,showProj:fe,setShowProj:H,showCoarse:te,setShowCoarse:se,fixedT:B,setFixedT:oe,running:be,setRunning:Q,barrierOn:me,setBarrierOn:Me,detectorOn:xe,setDetectorOn:Re,histT:Ne,histR:ke,histTotal:vt,isMobile:tt,advMode:_t})=>{const V=!!_t,St=Mh[s];return ue.jsx("div",{style:{display:"flex",flexDirection:"column",width:"100%",fontFamily:"'JetBrains Mono','Courier New',monospace",color:"#e8f2ff"},children:ue.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:tt?5:7,padding:tt?"6px 8px":"8px 18px 8px 9px"},children:[ue.jsxs(gr,{label:"View",tip:`Click to cycle: Orthodox → Pilot-Wave → Many Worlds

Orthodox QM: collapse fires when pointer overlap drops below 1% (von Neumann criterion). Outcome random with Born-rule probabilities.

Pilot-Wave (de Broglie–Bohm): particle has a definite trajectory guided by the wavefunction. No collapse; randomness comes from unknown initial positions.

Many Worlds (Everett): wavefunction never collapses. All outcomes happen in branching worlds.`,children:[ue.jsx(As,{text:R0[s],children:ue.jsxs("button",{onClick:()=>e(Dd[(Dd.indexOf(s)+1)%Dd.length]),style:{display:"block",width:"100%",padding:"7px 10px",marginBottom:5,background:`rgba(${s==="cpn"?"200,80,40":"30,160,220"},0.18)`,border:`2px solid ${St}`,borderRadius:6,color:St,cursor:"pointer",fontSize:13,fontFamily:"'JetBrains Mono','Courier New',monospace",fontWeight:700,textAlign:"center"},children:[">"," ",w0[s]]})}),ue.jsx($E,{text:s==="cpn"?zg.cpn:zg[s]})]}),ue.jsxs(gr,{label:`Transmission  ${me?Math.round(n*100)+"%":"100% (barrier off)"}`,tip:`Fraction of the wave that passes through the barrier.
0% = total reflection,  100% = total transmission.
(Sets the barrier height internally.)`,children:[ue.jsx("input",{type:"range",min:0,max:100,step:1,defaultValue:Math.round(n*100),ref:a,onInput:_e=>r(+_e.target.value/100),disabled:!me,style:{width:"100%",accentColor:"#5090f0",opacity:me?1:.35}}),ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:[ue.jsx("span",{style:{color:"#ff7744"},children:"← all reflected"}),ue.jsx("span",{style:{color:"#44ee88"},children:"all transmitted →"})]})]}),V&&ue.jsxs(gr,{label:`Coupling  ${xe?Math.round(c/3*100)+"%":"off (detector off)"}`,tip:`How far the pointer deflects after the interaction.
0 = pointer does not move (no measurement).
High = pointer clearly separates the two branches.`,children:[ue.jsx("input",{type:"range",min:0,max:3,step:.05,value:c,ref:u,onChange:_e=>f(+_e.target.value),disabled:!xe,style:{width:"100%",accentColor:"#44ffaa",opacity:xe?1:.35}}),ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:[ue.jsx("span",{children:"off"}),ue.jsx("span",{children:"strong"})]})]}),V&&ue.jsxs(gr,{label:`σ_x = ${T.toFixed(2)}`,tip:`Particle wavepacket width (Gaussian σ in x).
Also sets the initial pointer width if not overridden.`,children:[ue.jsx("input",{type:"range",min:.2,max:2,step:.05,defaultValue:T,ref:_,onInput:_e=>E(+_e.target.value),style:{width:"100%",accentColor:"#cc88ff"}}),ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:[ue.jsx("span",{children:"narrow"}),ue.jsx("span",{children:"wide"})]})]}),V&&ue.jsxs(gr,{label:`σ_pointer = ${g.toFixed(2)}`,tip:`Pointer wavepacket width (Gaussian σ in y).
Small σ_pointer + large coupling → strong measurement: T and R branches clearly resolved.
Large σ_pointer + small coupling → weak measurement: branches overlap, outcome uncertain.`,children:[ue.jsx("input",{type:"range",min:.1,max:2.5,step:.05,defaultValue:g,ref:D,onInput:_e=>F(+_e.target.value),disabled:!xe,style:{width:"100%",accentColor:"#ff88cc",opacity:xe?1:.35}}),ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:[ue.jsx("span",{children:"narrow"}),ue.jsx("span",{children:"wide"})]})]}),V&&(()=>{const de=x/4,Le=xe?c:0,Se=4*Le*de,C=Math.exp(-Se*Se/(4*g*g)),R=Math.round(C*100),ie=!xe||Le===0||C>=.01,ge=ie?"#ffaa44":"#44ee88",pe=ie?"Weak  —  branches overlap, not resolved":s==="cpn"?"Strong  —  branches resolved, collapse fires":"Strong  —  branches resolved";return ue.jsxs(gr,{label:"Measurement strength",tip:`Pointer overlap ⟨χ_T|χ_R⟩ — how much the T and R pointer states overlap.

100%  →  pointer is blind to the outcome  (weak, no collapse)
  0%  →  branches orthogonal  (strong, collapse fires)

Overlap is set by the Coupling and σ_pointer sliders:
  O = exp(−(4λw/v₀)² / 4σ_p²)

Collapse fires when O < 1% (von Neumann orthogonality criterion).
Above 1% the pointer states still overlap — the global state remains entangled
and the particle alone is in a mixed state.
Pilot-Wave / Many-Worlds never collapse regardless.`,children:[ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,fontSize:11},children:[ue.jsx("span",{style:{color:"rgba(160,180,220,0.7)",fontSize:10},children:"Pointer overlap"}),ue.jsxs("span",{style:{color:ge,fontWeight:700},children:[R,"%"]})]}),ue.jsx("div",{style:{height:5,background:"rgba(15,30,70,0.6)",borderRadius:3,overflow:"hidden",marginBottom:4},children:ue.jsx("div",{style:{height:"100%",borderRadius:3,background:ie?"linear-gradient(90deg,#aa6600,#ffaa44)":"linear-gradient(90deg,#226633,#44ee88)",width:`${R}%`,transition:"width 0.2s"}})}),ue.jsx("div",{style:{fontSize:11,color:ge,fontWeight:700,textAlign:"center",padding:"2px 0",borderRadius:3,background:ie?"rgba(100,60,0,0.2)":"rgba(0,80,40,0.2)"},children:pe})]})})(),ue.jsxs(gr,{label:"Speed",tip:"Playback speed",children:[ue.jsx("input",{type:"range",min:.1,max:4,step:.05,defaultValue:.5,ref:L,onInput:_e=>$(+_e.target.value),style:{width:"100%",accentColor:"#ffcc44"}}),ue.jsx("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:ue.jsxs("span",{children:["×",z.toFixed(1)]})})]}),V&&ue.jsxs(gr,{label:`Cycle pause  ${(b/1e3).toFixed(1)} s`,tip:"How long the simulation pauses at the end of each cycle before restarting.\\n\\nIncrease this to have more time to observe the final state before the next particle is fired.",children:[ue.jsx("input",{type:"range",min:0,max:5e3,step:100,defaultValue:1e3,ref:N,onInput:_e=>U(+_e.target.value),style:{width:"100%",accentColor:"#88aaff"}}),ue.jsxs("div",{style:{display:"flex",justifyContent:"space-between",fontSize:10,color:"#506080"},children:[ue.jsx("span",{children:"0 s"}),ue.jsx("span",{children:"5 s"})]})]}),V&&ue.jsx(As,{text:"Toggle the potential barrier. Off = 100% transmission (free particle).",children:ue.jsxs("button",{onClick:()=>Me(!me),style:{width:"100%",padding:"5px 0",marginBottom:4,background:me?"rgba(40,80,180,0.5)":"rgba(15,30,70,0.5)",border:"1px solid "+(me?"#5588cc":"#334466"),borderRadius:5,color:me?"#c8e8ff":"#7090b8",cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono','Courier New',monospace"},children:[me?"◉":"○"," Barrier"]})}),V&&ue.jsx(gr,{label:"Detector",children:ue.jsx("div",{style:{display:"flex",gap:4,flexWrap:"wrap"},children:[{key:"detector",label:"Fine",on:xe,fn:Re,tip:`Toggle the fine detector (gauge dial).
Off = no coupling, pointer stays at rest.`},{key:"coarse",label:"Coarse",on:te,fn:se,tip:`Show a second coarse-grained detector (binary T/R).

The fine detector shows the quantum pointer — a continuous Gaussian wavepacket.
The coarse detector amplifies that reading into a definite T or R click.

In weak regime the fine pointer is ambiguous; the coarse register makes the outcome definite.`},{key:"fixedT",label:"Fix T",on:B,fn:oe,tip:`Lock the T pointer position on the gauge dial.

Off: the T tick on the dial moves as coupling λ changes (scale fixed at λ_max range).
On: the dial scale adjusts so T always sits at the same height on the gauge. The y-value labels change to reflect the actual pointer separation.

The y-panel always matches the 2D canvas regardless of this setting.`}].map(({key:_e,label:Ue,on:de,fn:Le,tip:Se})=>ue.jsx(As,{text:Se,children:ue.jsxs("button",{onClick:()=>Le(!de),style:{padding:"5px 10px",background:de?"rgba(40,80,180,0.5)":"rgba(15,30,70,0.5)",border:"1px solid "+(de?"#5588cc":"#334466"),borderRadius:5,color:de?"#c8e8ff":"#7090b8",cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono','Courier New',monospace"},children:[de?"◉":"○"," ",Ue]})},_e))})}),V&&s==="pw"&&ue.jsx(gr,{label:"Toggles",children:ue.jsxs("div",{style:{display:"flex",gap:4,flexWrap:"wrap"},children:[[{key:"wave",label:"Wave",on:I,fn:ae,tip:"Show/hide 2D |Ψ|² heatmap"},{key:"traj",label:"Paths",on:re,fn:ce,tip:"Show/hide Bohmian trajectories"},{key:"proj",label:"Proj",on:fe,fn:H,tip:"Also overlay global projections ρ(x), ρ(y) on the CWF panels"}].map(({key:_e,label:Ue,on:de,fn:Le,tip:Se})=>ue.jsx(As,{text:Se,children:ue.jsxs("button",{onClick:()=>Le(!de),style:{padding:"5px 10px",background:de?"rgba(40,80,180,0.5)":"rgba(15,30,70,0.5)",border:"1px solid "+(de?"#5588cc":"#334466"),borderRadius:5,color:de?"#c8e8ff":"#7090b8",cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono','Courier New',monospace"},children:[de?"◉":"○"," ",Ue]})},_e)),ue.jsx(As,{text:"Pause / resume",children:ue.jsx("button",{onClick:()=>Q(!be),style:{padding:"5px 10px",background:be?"rgba(20,55,130,0.6)":"rgba(25,80,40,0.6)",border:"1px solid "+(be?"rgba(70,130,255,0.4)":"rgba(60,200,80,0.35)"),borderRadius:5,color:be?"#88bbff":"#66dd88",cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono','Courier New',monospace"},children:be?"⏸":"▶"})})]})}),!(V&&s==="pw")&&ue.jsx(As,{text:"Start / stop simulation",children:ue.jsx("button",{onClick:()=>Q(!be),style:{width:"100%",padding:"6px 0",background:be?"rgba(60,70,90,0.6)":"rgba(25,80,40,0.6)",border:"1px solid "+(be?"rgba(130,150,190,0.4)":"rgba(60,200,80,0.35)"),borderRadius:5,color:be?"#a0aec0":"#66dd88",cursor:"pointer",fontSize:12,fontFamily:"'JetBrains Mono','Courier New',monospace"},children:be?"Stop":"Start"})}),!tt&&ue.jsx("div",{style:{fontSize:10,color:"#506080",borderTop:"1px solid rgba(50,80,180,0.15)",paddingTop:8},children:"Drag: pan"})]})})});function QE(s,{Tp:e,Rp:n,xIn:r,xT:a,xR:c,sigX:f,bl:u,colBranch:h,colFade:p,bX:v,bY:x,bIsTransmit:y,yT:S,yR:T,sigY:E,isPW:_,interp:g,colElapsedMs:F,colPhase:D,sepFrac:A,ptrOverlap:G,showProj:O,showCoarse:z,xLo:$,xHi:L,rho:b,rhoXs:U,V0:N}){if(!s)return;const I=s.getContext("2d");s.clientWidth>0&&(s.width=s.clientWidth),s.clientHeight>0&&(s.height=s.clientHeight);const ae=s.width,re=s.height;I.clearRect(0,0,ae,re);const ce=g==="mw",fe=$,H=L,te=de=>(de-fe)/(H-fe)*ae,se=h===-1?p:0,B=h===1?p:0,oe=e*(1-se),be=n*(1-B),Q=350,me=(re-10)*.66,Me=de=>{let Le=1e-10;for(let Se=0;Se<=Q;Se++){const C=de(fe+(H-fe)*Se/Q);C>Le&&(Le=C)}return Le},xe=(de,Le,Se,C,R)=>{const W=C+R-3;I.save(),I.beginPath(),I.rect(0,C,ae,R),I.clip(),I.beginPath(),I.strokeStyle=Le,I.fillStyle=Le+"28",I.lineWidth=2;let ie=!0;for(let ge=0;ge<=Q;ge++){const pe=fe+(H-fe)*ge/Q,Fe=te(pe),Ce=W-de(pe)*Se;ie?(I.moveTo(Fe,W),I.lineTo(Fe,Ce),ie=!1):I.lineTo(Fe,Ce)}I.lineTo(te(H),W),I.closePath(),I.fill(),I.beginPath(),ie=!0;for(let ge=0;ge<=Q;ge++){const pe=fe+(H-fe)*ge/Q,Fe=te(pe),Ce=W-de(pe)*Se;ie?(I.moveTo(Fe,Ce),ie=!1):I.lineTo(Fe,Ce)}I.stroke(),I.restore()},Re=(de,Le,Se=me)=>xe(de,Le,Se,0,re),Ne=de=>fn(de,r,f),ke=de=>fn(de,a,f),vt=de=>fn(de,c,f),tt=de=>u*oe*ke(de),_t=de=>u*be*vt(de),V=_?fn(x,S,E):0,St=_?fn(x,T,E):0,_e=Math.max(V,St,1e-8),Ue=ce&&((G??1)<.01||z)?1:0;if(ce&&u>.05){const de=Math.round(re/2),Le=Math.min(A*1.5,1)*Ue;I.fillStyle="#020812",I.fillRect(0,0,ae,re),I.strokeStyle="rgba(60,100,200,0.25)",I.lineWidth=1,I.beginPath(),I.moveTo(0,re-2),I.lineTo(ae,re-2),I.stroke(),I.strokeStyle="rgba(0,200,255,0.2)",I.setLineDash([3,3]),I.beginPath(),I.moveTo(te(0),0),I.lineTo(te(0),re),I.stroke(),I.setLineDash([]);const Se=Math.max(7,Math.round(re*.12)),C=Math.round(re*.09);I.font=`bold ${Se}px 'JetBrains Mono',monospace`,Le>.05?(I.fillStyle=`rgba(0,229,255,${.12*Le})`,I.fillRect(0,0,ae,de),I.fillStyle=`rgba(238,20,210,${.12*Le})`,I.fillRect(0,de,ae,re-de),I.strokeStyle=`rgba(255,255,255,${.75*Le})`,I.lineWidth=2,I.setLineDash([6,3]),I.beginPath(),I.moveTo(0,de),I.lineTo(ae,de),I.stroke(),I.setLineDash([]),I.strokeStyle="rgba(60,100,200,0.25)",I.lineWidth=1,I.beginPath(),I.moveTo(0,de-1),I.lineTo(ae,de-1),I.stroke(),oe>.001&&xe(tt,"#00e5ff",.75*(de-6)/Math.max(Me(tt),1e-10),0,de),be>.001&&xe(_t,"#ee14d2",.75*(re-de-6)/Math.max(Me(_t),1e-10),de,re-de),I.fillStyle=`rgba(0,229,255,${.95*Le})`,I.fillText("World 1  (transmitted)",6,C),I.fillStyle=`rgba(238,20,210,${.95*Le})`,I.fillText("World 2  (reflected)",6,de+C)):(oe>.001&&Re(tt,"#22ee88",me),be>.001&&Re(_t,"#ff7744",me),A>.02&&(I.fillStyle="rgba(100,160,255,0.55)",I.fillText("worlds not resolved  (weak measurement)",6,C)))}else if(I.fillStyle="#020812",I.fillRect(0,0,ae,re),I.strokeStyle="rgba(60,100,200,0.25)",I.lineWidth=1,I.beginPath(),I.moveTo(0,re-2),I.lineTo(ae,re-2),I.stroke(),I.strokeStyle="rgba(0,200,255,0.2)",I.setLineDash([3,3]),I.beginPath(),I.moveTo(te(0),0),I.lineTo(te(0),re),I.stroke(),I.setLineDash([]),_){const de=V,Le=St,Se=_e;1-u>.01&&Re(C=>(1-u)*Ne(C),"#88aaff",me),u>.05&&oe>.001&&Re(C=>u*e*(de/Se)*ke(C),"#22ee88",me),u>.05&&be>.001&&Re(C=>u*n*(Le/Se)*vt(C),"#ff7744",me),O&&(oe>.001&&Re(tt,"rgba(34,238,136,0.4)",me/Me(tt)),be>.001&&Re(_t,"rgba(255,119,68,0.4)",me/Me(_t)))}else{const de=me,Le=1-u;Le>.01&&Re(Se=>Le*Ne(Se),"#88aaff",de),u>.01&&oe>.001&&Re(tt,"#22ee88",de),u>.01&&be>.001&&Re(_t,"#ff7744",de)}if(!ce&&_&&v!==void 0){const de=te(v);I.strokeStyle="rgba(255,255,255,0.65)",I.lineWidth=1.5,I.setLineDash([4,3]),I.beginPath(),I.moveTo(de,0),I.lineTo(de,re-4),I.stroke(),I.setLineDash([]),I.fillStyle="#ffffff",I.beginPath(),I.arc(de,re-4-3,3,0,2*Math.PI),I.fill()}if(!ce){const de=Math.max(9,Math.round(re*.16)),Le=Math.round(re*.22),Se=Math.round(re*.92);if(I.font=`${de}px 'JetBrains Mono', monospace`,_){if(u<.05)I.fillStyle="#88aaff",I.fillText("Ψ_in(x)",6,Le);else{const C=V/_e,R=St/_e,W=.15;oe>.001&&C>W&&(I.fillStyle="#22ee88",I.fillText("T",Math.min(ae-20,te(a)-6),Se)),be>.001&&R>W&&(I.fillStyle="#ff7744",I.fillText("R",Math.max(6,te(c)-6),Se))}I.font=`${Math.max(8,Math.round(re*.13))}px 'JetBrains Mono', monospace`,I.fillStyle="rgba(100,160,255,0.5)",I.textAlign="right",I.fillText("ψ_cond(x|Y(t))",ae-4,Le),I.textAlign="left"}else{const C=h>=0,R=h<=0;u>.12&&oe>.05&&C&&(I.fillStyle=`rgba(34,238,136,${Math.min(u*1.5,.9)})`,I.fillText("T",Math.min(ae-20,te(a)-6),Se)),u>.12&&be>.05&&R&&(I.fillStyle=`rgba(255,119,68,${Math.min(u*1.5,.9)})`,I.fillText("R",Math.max(6,te(c)-6),Se)),I.font=`${Math.max(8,Math.round(re*.13))}px 'JetBrains Mono', monospace`,I.fillStyle="rgba(100,160,255,0.5)",I.textAlign="right",I.fillText("ρ(x) = ∫|Ψ|²dy",ae-4,Le),I.textAlign="left"}}}const e1=kn.forwardRef(function(e,n){return ue.jsx("canvas",{ref:n,width:900,height:70,style:{width:"100%",height:"100%",display:"block"}})});function A0(s,e,n=5){const r=Math.abs(e-s);if(r<1e-9)return 1;const a=r/(n-1),c=Math.pow(10,Math.floor(Math.log10(a))),f=a/c;return f<=1.5?c:f<=3?2*c:f<=7?5*c:10*c}function Hg(s,e,n){const r=[],a=Math.ceil((s-n*1e-6)/n)*n;for(let c=a;c<=e+n*1e-6;c+=n)r.push(Math.round(c/n)*n);return r}function b0(s,e){const n=e>=1?0:e>=.1?1:e>=.01?2:3;return s.toFixed(n)}function t1(s,{Tp:e,Rp:n,yT:r,yR:a,yRFixed:c,sigY:f,bl:u,colBranch:h,colFade:p,sampledPointerY:v,bY:x,bX:y,bIsTransmit:S,xT:T,xR:E,sigX:_,isPW:g,interp:F,sepFrac:D,ptrOverlap:A,showProj:G,showCoarse:O,yLo:z,yHi:$,fixedT:L,yTFinal:b,tickStep:U}){if(!s)return;const N=s.getContext("2d");s.clientWidth>0&&(s.width=s.clientWidth),s.clientHeight>0&&(s.height=s.clientHeight);const I=s.width,ae=s.height;N.clearRect(0,0,I,ae);const re=F==="mw";N.fillStyle="#020812",N.fillRect(0,0,I,ae);const ce=z,fe=$,H=c,te=W=>(1-(W-ce)/(fe-ce))*ae,se=7,B=4,oe=Math.max(6,Math.round(I*.115)),be=A0(ce,fe,6),Q=be/5,me=Hg(ce,fe,be),Me=Hg(ce,fe,Q),xe=W=>b0(W-c,be);N.font=`${oe}px 'JetBrains Mono',monospace`;const Re=me.length?Math.max(...me.map(W=>N.measureText(xe(W)).width)):N.measureText("0").width,Ne=Math.round(3+Re),ke=Ne+se+2;N.strokeStyle="rgba(80,110,200,0.30)",N.lineWidth=.8,Me.forEach(W=>{if(me.some(ge=>Math.abs(ge-W)<Q*.01))return;const ie=te(W);ie<1||ie>ae-1||(N.beginPath(),N.moveTo(Ne,ie),N.lineTo(Ne+B,ie),N.stroke())}),N.textBaseline="middle",N.textAlign="right",me.forEach(W=>{const ie=te(W);ie<3||ie>ae-3||(N.strokeStyle="rgba(140,170,255,0.60)",N.lineWidth=1,N.beginPath(),N.moveTo(Ne,ie),N.lineTo(Ne+se,ie),N.stroke(),N.fillStyle="rgba(120,155,230,0.75)",N.fillText(xe(W),Ne-2,ie))}),N.strokeStyle="rgba(60,100,200,0.45)",N.lineWidth=1,N.beginPath(),N.moveTo(Ne,0),N.lineTo(Ne,ae),N.stroke();const vt=te(c);vt>1&&vt<ae-1&&(N.strokeStyle="rgba(255,100,60,0.22)",N.setLineDash([3,3]),N.beginPath(),N.moveTo(0,vt),N.lineTo(I,vt),N.stroke(),N.setLineDash([]));const tt=!g&&!re&&(A??1)>=.01,_t=tt?0:h===-1?p:0,V=tt?0:h===1?p:0,St=e*(1-_t),_e=n*(1-V),Ue=350,de=Math.max(10,I-ke-4)*.68,Le=(W,ie,ge=4,pe=de)=>{N.beginPath(),N.strokeStyle=ie,N.fillStyle=ie+"28",N.lineWidth=2;let Fe=!0;for(let Ce=0;Ce<=Ue;Ce++){const Be=ce+(fe-ce)*Ce/Ue,ot=te(Be),Te=ge+W(Be)*pe;Fe?(N.moveTo(ge,ot),N.lineTo(Te,ot),Fe=!1):N.lineTo(Te,ot)}N.lineTo(ge,te(ce)),N.closePath(),N.fill(),N.beginPath(),Fe=!0;for(let Ce=0;Ce<=Ue;Ce++){const Be=ce+(fe-ce)*Ce/Ue,ot=te(Be),Te=ge+W(Be)*pe;Fe?(N.moveTo(Te,ot),Fe=!1):N.lineTo(Te,ot)}N.stroke()};Le(W=>(1-u)*fn(W,c,f),"#88aaff",ke);const Se=re&&((A??1)<.01||O);if(re&&u>.05)if(Se){const W=Math.min(D*1.5,1),ie=I/2;N.fillStyle=`rgba(0,229,255,${.12*W})`,N.fillRect(0,0,ie,ae),N.fillStyle=`rgba(238,20,210,${.12*W})`,N.fillRect(ie,0,I-ie,ae),N.strokeStyle=`rgba(255,255,255,${.75*W})`,N.lineWidth=2,N.setLineDash([6,3]),N.beginPath(),N.moveTo(ie,0),N.lineTo(ie,ae),N.stroke(),N.setLineDash([]),St>.001&&(N.save(),N.beginPath(),N.rect(0,0,ie,ae),N.clip(),Le(ge=>u*St*fn(ge,r,f),"#00e5ff",ke,(ie-ke-4)*.68),N.restore()),_e>.001&&(N.save(),N.beginPath(),N.rect(ie,0,I-ie,ae),N.clip(),Le(ge=>u*_e*fn(ge,H,f),"#ee14d2",ie+2,(I-ie-6)*.68),N.restore())}else St>.001&&Le(W=>u*St*fn(W,r,f),"#22ee88",ke),_e>.001&&Le(W=>u*_e*fn(W,H,f),"#ff7744",ke);else if(g&&u>.05){const W=fn(y,T,_),ie=fn(y,E,_),ge=Math.max(W,ie,1e-8);St>.001&&Le(pe=>u*e*(W/ge)*fn(pe,r,f),"#22ee88",ke),_e>.001&&Le(pe=>u*n*(ie/ge)*fn(pe,H,f),"#ff7744",ke),G&&(St>.001&&Le(pe=>u*St*fn(pe,r,f),"rgba(34,238,136,0.35)",ke),_e>.001&&Le(pe=>u*_e*fn(pe,H,f),"rgba(255,119,68,0.35)",ke))}else if(!g&&!re&&(St>.001&&Le(W=>u*St*fn(W,r,f),"#22ee88",ke),_e>.001&&Le(W=>u*_e*fn(W,H,f),"#ff7744",ke),u>.05&&(St>.001||_e>.001))){N.beginPath(),N.strokeStyle="rgba(180,210,255,0.70)",N.lineWidth=1.5;for(let W=0;W<=Ue;W++){const ie=ce+(fe-ce)*W/Ue,ge=te(ie),pe=u*(St*fn(ie,r,f)+_e*fn(ie,H,f)),Fe=ke+pe*de;W===0?N.moveTo(Fe,ge):N.lineTo(Fe,ge)}N.stroke()}if(!re&&g&&x!==void 0){const W=te(x);N.strokeStyle="rgba(255,255,255,0.65)",N.lineWidth=1.5,N.setLineDash([4,3]),N.beginPath(),N.moveTo(ke,W),N.lineTo(I,W),N.stroke(),N.setLineDash([]),N.fillStyle="#ffffff",N.beginPath(),N.arc(ke+2,W,3,0,2*Math.PI),N.fill()}if(!re&&!g&&v!=null){const W=te(v),ie=e*fn(v,r,f),ge=n*fn(v,c,f),pe=ie+ge,Fe=pe<1e-30?.5:ie/pe;let Ce,Be,ot;if(Fe>=.5){const Xe=(Fe-.5)*2;Ce=Math.round(255+-221*Xe),Be=Math.round(255+-17*Xe),ot=Math.round(255+-119*Xe)}else{const Xe=(.5-Fe)*2;Ce=255,Be=Math.round(255+-136*Xe),ot=Math.round(255+-187*Xe)}const Te=`rgba(${Ce},${Be},${ot},0.95)`;N.strokeStyle=Te,N.lineWidth=2,N.setLineDash([5,3]),N.beginPath(),N.moveTo(ke,W),N.lineTo(I,W),N.stroke(),N.setLineDash([]),N.fillStyle=Te,N.beginPath(),N.arc(ke+3,W,4,0,2*Math.PI),N.fill(),N.strokeStyle="rgba(255,255,255,0.5)",N.lineWidth=1,N.beginPath(),N.arc(ke+3,W,4,0,2*Math.PI),N.stroke()}if(!re){const W=Math.max(8,Math.round(I*.17));N.font=`bold ${W}px 'JetBrains Mono', monospace`,N.textAlign="left";const ie=ke+2,ge=!g&&(A??1)>=.01,pe=g?u>.05&&S:ge||h>=0,Fe=g?u>.05&&!S:ge||h<=0;u>.12&&St>.05&&pe&&(N.fillStyle=`rgba(34,238,136,${Math.min(u*1.5,.9)})`,N.fillText("T",ie,te(r)-4)),u>.12&&_e>.05&&Fe&&Math.abs(r-H)>f*.5&&(N.fillStyle=`rgba(255,119,68,${Math.min(u*1.5,.9)})`,N.fillText("R",ie,te(H)-4))}N.save();const C=Math.max(9,Math.round(I*.16));N.translate(I-Math.ceil(C*.75),ae/2),N.rotate(-Math.PI/2),N.font=`${C}px 'JetBrains Mono', monospace`,N.fillStyle="rgba(100,160,255,0.5)",N.textAlign="center";const R=re&&Se?"two worlds":g?"ψ_cond(y|X(t))":"ρ(y) = ∫|Ψ|²dx";N.fillText(R,0,0),N.restore()}const n1=kn.forwardRef(function(e,n){return ue.jsx("canvas",{ref:n,width:70,height:500,style:{width:"100%",height:"100%",display:"block"}})}),Vg=[2289288,4521898,52360,8978380],Gg=[16737843,16750933,16729088,16755268];function i1({interp:s}){const e=a=>ue.jsx("div",{style:{fontFamily:"'JetBrains Mono','Courier New',monospace",fontSize:13,color:"#d0e8ff",background:"rgba(20,40,100,0.25)",padding:"8px 12px",borderRadius:5,margin:"6px 0",lineHeight:1.8,borderLeft:"3px solid rgba(80,140,255,0.4)",whiteSpace:"pre"},children:a}),n=a=>ue.jsx("div",{style:{color:"#44bbff",fontWeight:700,fontSize:13,marginTop:14,marginBottom:4,textTransform:"uppercase",letterSpacing:"0.08em"},children:a}),r=a=>ue.jsx("div",{style:{fontSize:12,color:"#9ab8dd",lineHeight:1.8,marginBottom:4},children:a});return ue.jsxs("div",{style:{flex:1,overflowY:"auto",padding:"14px 20px",fontFamily:"'JetBrains Mono','Courier New',monospace",background:"#040a1c",color:"#9ab8dd"},children:[n("Initial state"),r("Particle Gaussian wavepacket approaching barrier, pointer at rest:"),e(`Ψ₀(x,y) = ψ₀(x) · χ₀(y)

ψ₀(x) = exp[-(x-x₀)²/4σₓ²] · exp[ik₀x]
χ₀(y) = exp[-y²/4σ_p²]

σₓ     — particle wavepacket width (σ_x slider)
σ_p    — pointer wavepacket width (σ_pointer slider)`),n("After barrier scattering"),r("Only the T (transmitted) branch couples to the detector pointer via H_int = λ·Π_T·P_y. The R branch never reaches the detector:"),e(`Ψ(x,y,t) = √T · ψ_T(x,t) · χ_T(y,t)
         + √R · ψ_R(x,t) · χ_R(y,t)

ψ_T:  centre → +v₀t          (transmitted, heading right)
ψ_R:  centre → -v₀t          (reflected, heading left)
χ_T:  shifts up by +Δy = 4λ·(w/v₀)   as T traverses detector
χ_R:  stays at rest                   (R never enters the detector)`),n("Probabilities"),r("Exact rectangular-barrier transmission (ℏ = m = 1, barrier width a):"),e(`T = 1 / [1 + V₀² sinh²(κa) / (4E(V₀-E))]   (E < V₀)
T = 1 / [1 + V₀² sin²(κa)  / (4E(E-V₀))]   (E > V₀)

E = k₀²/2,   κ = √(2|V₀-E|)`),n("Marginal densities"),r("The x-projection (below) and y-projection (right strip):"),e(`ρ(x,t) = ∫|Ψ(x,y,t)|²dy  ≈  T·|ψ_T(x)|² + R·|ψ_R(x)|²

ρ(y,t) = ∫|Ψ(x,y,t)|²dx  ≈  T·|χ_T(y)|² + R·|χ_R(y)|²`),s==="cpn"&&ue.jsxs(ue.Fragment,{children:[n("Orthodox QM — collapse"),r("After the detector interaction the global state is entangled. The von Neumann chain ends when the pointer is read: one branch is selected with Born-rule probability, the other is discarded. This happens at every cycle — weak or strong:"),e(`Ψ(x,y,t*)  →  ψ_T · χ_T   with prob T
            →  ψ_R · χ_R   with prob R = 1 − T`),r("The pointer snaps to a position sampled from the winning branch's Gaussian — not the exact branch centre — reflecting the spread of the pointer wavepacket:"),e(`y_outcome ~ N(y_branch, σ_p)

y_T = yR + Δy   (T branch centre)
y_R = yR        (R branch centre)`),r("What changes with coupling strength is how much information the pointer carries about the outcome, measured by the overlap of the two pointer states:"),e(`O = ⟨χ_T|χ_R⟩ = exp(−Δy² / 4σ_p²)

Δy = 4λ·(detector width / v₀)   — pointer separation
σ_p                          — pointer wavepacket width`),r("Strong (O ≈ 0): the two pointer states are nearly orthogonal. A single shot unambiguously identifies the branch — the pointer lands clearly in the T or R peak."),r("Weak (O ≈ 1): the pointer states nearly coincide. Collapse still occurs and a definite outcome is registered, but the distributions overlap so heavily that a single shot gives almost no information about which branch was selected. The statistics still converge to Tp/Rp over many shots — individual outcomes are just very noisy."),r("Note: Orthodox QM provides no microscopic derivation of collapse — it is an axiom. Placing the cut at the pointer interaction (as here) is the standard von Neumann treatment.")]}),s==="mw"&&ue.jsxs(ue.Fragment,{children:[n("Many Worlds — no collapse"),r("The wavefunction evolves unitarily forever. After scattering, the global state is:"),e(`Ψ(x,y,t) = √T · ψ_T(x,t) · χ_T(y,t)
         + √R · ψ_R(x,t) · χ_R(y,t)`),r("Both branches are equally real. There is no collapse and no preferred outcome. The universe 'splits' into two non-interacting worlds:"),e(`World 1:  ψ_T · χ_T   (particle transmitted, pointer deflected up)
World 2:  ψ_R · χ_R   (particle reflected, pointer at rest)`),r("The vertical dividing line at x=0 in the simulation marks the separation between the two worlds in configuration space. Right of the line (x>0) belongs to World 1; left (x<0) belongs to World 2."),r("The x- and y-projection panels are each split in two: the cyan half shows World 1 (transmitted), the magenta half shows World 2 (reflected)."),r("Strong measurement (O < 1%): pointer states are orthogonal, worlds are fully resolved. The Coarse Pointer Dist inlet records +T and +R (Deutsch-Wallace weights) per cycle — both worlds counted every shot:"),e(`Per cycle:  ΔN_T = T,   ΔN_R = R = 1−T,   ΔN_total = 1

After N cycles:  N_T/N → T,   N_R/N → R`),r("This recovers the correct Born-rule frequencies via the Deutsch-Wallace amplitude-squared measure (Deutsch 1999, Wallace 2010). The weights T = |√T|² and R = |√R|² are a mathematical fact about the wavefunction; whether they count as 'probabilities' in a deterministic branching universe is the central open problem."),r("Weak measurement (O ≥ 1%): pointer states overlap heavily — the worlds have not yet branched into distinguishable copies. A single noisy sample y is drawn from the mixed distribution ρ(y) = T·χ_T² + R·χ_R² and thresholded at the midpoint to give a T or R reading. This is a classical post-processing step, not a physical branching event."),e(`y ~ T·N(y_T, σ_p) + R·N(y_R, σ_p)

outcome = T  if y ≥ (y_T + y_R)/2
        = R  otherwise`),r("The coarse gauge reflects this: in weak MW it parks at centre (ambiguous) rather than snapping to T or R, since no genuine branching has occurred.")]}),s==="pw"&&ue.jsxs(ue.Fragment,{children:[n("Pilot-wave — guidance equation"),r("The particle has a definite position (X,Y) at all times, guided by:"),e(`dX/dt = ℏ/m · Im[Ψ* ∂_x Ψ] / |Ψ|²  |_(X,Y)
dY/dt = ℏ/m · Im[Ψ* ∂_y Ψ] / |Ψ|²  |_(X,Y)`),r("For the two-branch state with non-overlapping lobes, whichever branch contains (X,Y) acts as the effective wavefunction — the other branch is 'empty'."),e("ψ_cond(x,t) = Ψ(x, Y(t), t)  [conditional wavefunction]"),r("Bohmian statistics: the branch (T or R) is determined by the particle's initial x position, drawn with Born-rule probability P(T)=T from the position distribution |ψ₀(x)|². The initial pointer position Y₀ is drawn independently from the full Gaussian |χ₀(y)|² = N(0, σ_p) — it is not correlated with which branch the particle is on. Together these reproduce the correct Born-rule statistics. After scattering, the x-branches are spatially separated, so the pointer y-guidance reduces to: y→y_T (rate 4λ) for the T-branch trajectory, y→0 for the R-branch — regardless of measurement strength.")]}),n("Measurement strength"),r("The pointer overlap quantifies how much information a single shot carries:"),e(`O = ⟨χ_T|χ_R⟩ = exp(−Δy² / 4σ_p²)

Δy = 4λ·(w / v₀)   — pointer separation (w = detector width)
σ_p             — pointer wavepacket width

O → 0  (strong):  orthogonal pointer states — each shot is unambiguous
O → 1  (weak):    overlapping pointer states — each shot carries little info`),r("In Orthodox mode, collapse fires every cycle regardless of O. In a strong measurement the pointer lands clearly in one peak; in a weak measurement both peaks overlap and the outcome is nearly random — but statistics still converge to Tp / Rp."),r("In Pilot-Wave the wavefunction never collapses. The particle always has a definite trajectory so the outcome is always definite, weak or strong."),r("In Many-Worlds the wavefunction never collapses. Strong measurement: worlds are resolved, Deutsch-Wallace weighting applies. Weak measurement: worlds have not branched — no definite outcome exists from the pointer alone."),n("Two-stage detection"),r("Real detectors are amplification chains: a quantum pointer (fine) feeds a macroscopic register (coarse). The simulation shows both."),r("Fine gauge (left): the quantum pointer — a Gaussian wavepacket with width σ_p. Continuous y-reading. Can be weak. Needle tracks the pointer wavepacket in real time."),r("Coarse gauge (right, toggle in Advanced › Physics): a binary register — two macroscopic states T and R, always orthogonal by construction. Needle snaps to T or R at pointer-hit time. In MW weak, no branching has occurred so the coarse register is not physically defined — the gauge parks at centre."),e(`Coarse outcome:  T  if y_fine ≥ (y_T + y_R)/2
                R  otherwise

(threshold at midpoint between T and R pointer centres)`),n("Animation"),r("Units: ℏ = m = 1. Velocity v₀ = k₀. The simulation rescales physical time to fit the canvas. The barrier occupies |x| < 0.5."),r("Approximations: (1) Wavepacket dispersion is omitted in the 2D display — packets keep their initial width σ_x for visual clarity (realistic packets broaden as σ_x(t)=σ_x0√(1+t²/4σ_x0⁴)). (2) The Bohmian x-trajectory uses the exact spectral guidance equation; the y (pointer) motion uses the leading-order Gaussian approximation, which is exact for spatially separated branches.")]})}function r1(s,e,n,r,a,c,f=null){s.clearRect(0,0,e,n);const u=e/2,h=n/2,p=Math.min(u,h)-3,v=5*Math.PI/6;s.beginPath(),s.arc(u,h,p,0,2*Math.PI),s.fillStyle="rgba(8,16,40,0.92)",s.fill(),s.strokeStyle="rgba(180,200,255,0.65)",s.lineWidth=2.5,s.stroke(),s.beginPath(),s.arc(u,h,p-5,-Math.PI/2-v,-Math.PI/2+v),s.strokeStyle="rgba(60,100,200,0.22)",s.lineWidth=5,s.stroke();const x=a||{r:0,t:1};if(f&&f.step>0){const{step:E,yMin:_,yMax:g,yZero:F}=f,D=g-_,A=F!==void 0?F:_,G=b0,O=E/5,z=Math.ceil((_-A)/E-1e-6)*E,$=Math.floor((g-A)/E+1e-6)*E,L=[];for(let H=z;H<=$+E*1e-6;H+=E)L.push(A+Math.round(H/E)*E);const b=Math.ceil((_-A)/O-1e-6)*O,U=Math.floor((g-A)/O+1e-6)*O,N=[];for(let H=b;H<=U+O*1e-6;H+=O)N.push(A+Math.round(H/O)*O);const I=H=>(H-_)/D,ae=H=>-Math.PI/2+(H-.5)*2*v,re=p*.22,ce=p*.12,fe=p*.44;s.strokeStyle="rgba(100,130,220,0.35)",s.lineWidth=.8,N.forEach(H=>{if(L.some(B=>Math.abs(B-H)<O*.01))return;const te=I(H);if(te<-.001||te>1.001)return;const se=ae(te);s.beginPath(),s.moveTo(u+Math.cos(se)*(p-ce-2),h+Math.sin(se)*(p-ce-2)),s.lineTo(u+Math.cos(se)*(p-3),h+Math.sin(se)*(p-3)),s.stroke()}),s.font=`${Math.round(p*.185)}px 'JetBrains Mono',monospace`,s.textAlign="center",s.textBaseline="middle",L.forEach(H=>{const te=I(H);if(te<-.001||te>1.001)return;const se=ae(te);s.strokeStyle="rgba(170,190,255,0.70)",s.lineWidth=1.5,s.beginPath(),s.moveTo(u+Math.cos(se)*(p-re-2),h+Math.sin(se)*(p-re-2)),s.lineTo(u+Math.cos(se)*(p-3),h+Math.sin(se)*(p-3)),s.stroke();const B=fe;s.fillStyle="rgba(150,175,255,0.80)",s.fillText(G(H-A,E),u+Math.cos(se)*B,h+Math.sin(se)*B)})}else for(let _=0;_<=6;_++){const g=_/6,F=-Math.PI/2+(g-.5)*2*v,D=_===0||_===6||_===6/2,A=D?p*.22:p*.13;s.strokeStyle=D?"rgba(200,210,255,0.8)":"rgba(140,160,210,0.4)",s.lineWidth=D?2:1,s.beginPath(),s.moveTo(u+Math.cos(F)*(p-A-2),h+Math.sin(F)*(p-A-2)),s.lineTo(u+Math.cos(F)*(p-3),h+Math.sin(F)*(p-3)),s.stroke()}const y=p*.67,S=-Math.PI/2+(x.r-.5)*2*v,T=-Math.PI/2+(x.t-.5)*2*v;x.t>0&&x.t<=1&&(s.beginPath(),s.moveTo(u+Math.cos(T)*(p-p*.28),h+Math.sin(T)*(p-p*.28)),s.lineTo(u+Math.cos(T)*(p-3),h+Math.sin(T)*(p-3)),s.strokeStyle="rgba(34,238,136,0.9)",s.lineWidth=2.5,s.stroke()),s.font=`bold ${Math.round(p*.28)}px 'JetBrains Mono',monospace`,s.textAlign="center",s.textBaseline="middle",s.shadowColor="rgba(0,0,0,0.8)",s.shadowBlur=4,s.fillStyle="rgba(255,110,60,0.85)",s.fillText("R",u+Math.cos(S)*y,h+Math.sin(S)*y),s.fillStyle="rgba(34,238,136,0.85)",s.fillText("T",u+Math.cos(T)*y,h+Math.sin(T)*y),s.shadowBlur=0,r.forEach(({fraction:E,color:_,alpha:g})=>{if(g<.03)return;const F=-Math.PI/2+(E-.5)*2*v;s.save(),s.globalAlpha=g,s.shadowColor=_,s.shadowBlur=7,s.strokeStyle=_,s.lineWidth=2.5,s.lineCap="round",s.beginPath(),s.moveTo(u+Math.cos(F+Math.PI)*p*.18,h+Math.sin(F+Math.PI)*p*.18),s.lineTo(u+Math.cos(F)*p*.76,h+Math.sin(F)*p*.76),s.stroke(),s.shadowBlur=0,s.fillStyle="rgba(210,225,255,0.95)",s.beginPath(),s.arc(u,h,4,0,2*Math.PI),s.fill(),s.restore()})}function s1(s,e,n,r,a){s.clearRect(0,0,e,n),s.fillStyle="rgba(8,16,40,0.92)",s.beginPath(),s.roundRect?s.roundRect(1,1,e-2,n-2,10):s.rect(1,1,e-2,n-2),s.fill(),s.strokeStyle="rgba(60,100,220,0.45)",s.lineWidth=1.5,s.stroke();const c=(f,u,h,p,v)=>{const x=v==="on",y=v==="ambig",E=y?[255,170,60]:p==="T"?[34,238,136]:p==="?"?[255,170,60]:[255,80,50];if(x||y){const g=s.createRadialGradient(f,u,h*.1,f,u,h*2.4);g.addColorStop(0,`rgba(${E[0]},${E[1]},${E[2]},0.38)`),g.addColorStop(1,`rgba(${E[0]},${E[1]},${E[2]},0)`),s.fillStyle=g,s.beginPath(),s.arc(f,u,h*2.4,0,Math.PI*2),s.fill()}const _=s.createRadialGradient(f-h*.28,u-h*.28,h*.05,f,u,h);x?(_.addColorStop(0,"#ffffff"),_.addColorStop(.28,`rgba(${E[0]},${E[1]},${E[2]},1)`),_.addColorStop(1,`rgba(${Math.round(E[0]*.35)},${Math.round(E[1]*.35)},${Math.round(E[2]*.35)},1)`)):y?(_.addColorStop(0,`rgba(${E[0]},${E[1]},${E[2]},0.55)`),_.addColorStop(1,`rgba(${Math.round(E[0]*.25)},${Math.round(E[1]*.25)},${Math.round(E[2]*.25)},0.55)`)):(_.addColorStop(0,"rgba(38,50,88,1)"),_.addColorStop(1,"rgba(14,20,42,1)")),s.beginPath(),s.arc(f,u,h,0,Math.PI*2),s.fillStyle=_,s.fill(),s.strokeStyle=x?`rgba(${E[0]},${E[1]},${E[2]},0.95)`:y?`rgba(${E[0]},${E[1]},${E[2]},0.45)`:"rgba(50,70,120,0.45)",s.lineWidth=1.5,s.stroke(),s.font=`bold ${Math.round(h*.78)}px "JetBrains Mono", monospace`,s.textAlign="center",s.textBaseline="middle",s.fillStyle=x?"#ffffff":y?`rgba(${E[0]},${E[1]},${E[2]},0.9)`:"rgba(55,75,130,0.75)",s.fillText(p,f,u)};c(e/2,n*.28,24,"T",r),c(e/2,n*.72,24,"R",a)}function o1(){const s=st.useRef(null),e=st.useRef(null),n=st.useRef(null),r=st.useRef(null),a=st.useRef(null),c=st.useRef(null),f=st.useRef(null),u=st.useRef(null),h=st.useRef(null),p=st.useRef(null),v=st.useRef(null),x=st.useRef(null),y=st.useRef(null),[S,T]=st.useState(()=>window.innerWidth),[E,_]=st.useState(()=>window.innerHeight);st.useEffect(()=>{const M=()=>{T(window.innerWidth),_(window.innerHeight)};return window.addEventListener("resize",M),()=>window.removeEventListener("resize",M)},[]);const g=S<=700,F=g&&S>E,D=!g,[A,G]=st.useState(()=>Math.round((window.innerHeight-28)/5));st.useEffect(()=>{const M=y.current;if(!M)return;const j=new ResizeObserver(()=>{const Z=M.offsetHeight;Z>0&&G(Z)});return j.observe(M),()=>j.disconnect()},[]);const O=g&&!F,[z,$]=st.useState(275),L=F?200:g?"100%":z,b=st.useCallback(M=>{if(O)return;M.preventDefault();const j=M.clientX,Z=z,J=Ae=>$(Math.max(160,Math.min(480,Z-(Ae.clientX-j)))),K=()=>{window.removeEventListener("mousemove",J),window.removeEventListener("mouseup",K)};window.addEventListener("mousemove",J),window.addEventListener("mouseup",K)},[O,z]),U=st.useRef({interp:"cpn",k0:4,V0:Bg(.5,4),tTarget:.5,lam:.6,sigX:.5,sigY:.3,xPointer:4,detWidth:2,speed:.5,collapseThreshold:.01,showWave:!0,showTraj:!0,showProj:!1,showCoarse:!1,fixedT:!1,running:!0,tick:0,dirty:!0,pauseUntil:0,pauseHoldMs:1e3,camX:0,camY:0,camZ:14,drag:null,colBranch:0,colFade:0,colTriggered:!1,colYHold:0,colPhase:0,sampledPointerY:null,sampledPointerY_T:null,sampledPointerY_R:null,coarseIsT:null,barrierOn:!0,detectorOn:!0,histT:0,histR:0,histTotal:0,histLastTprob:.5,lastBIsTransmit:!1,needleHistory:[],lastBY:0,lastYRFixed:0,marg:{Tp:.5,Rp:.5,xIn:xr,xT:0,xR:0,yT:0,yR:0,sigX:.5,sigY:.3,bl:0,colBranch:0,colFade:0,bX:0,bY:0}}),[N,I]=st.useState("cpn"),[ae,re]=st.useState(.5),[ce,fe]=st.useState(.6),[H,te]=st.useState(4),[se,B]=st.useState(2),[oe,be]=st.useState(.5),[Q,me]=st.useState(.3),[Me,xe]=st.useState(.1),[Re,Ne]=st.useState(.5),[ke,vt]=st.useState(1e3),tt=st.useRef(null),[_t,V]=st.useState(!0),[St,_e]=st.useState(!0),[Ue,de]=st.useState(!1),[Le,Se]=st.useState(!1),[C,R]=st.useState(!1),[W,ie]=st.useState(!0),[ge,pe]=st.useState(!0),[Fe,Ce]=st.useState(!0),[Be,ot]=st.useState(.5),[Te,Xe]=st.useState(.5),[it,rt]=st.useState(0),[Ye,mt]=st.useState(0),[ht,wt]=st.useState(0),[q,Oe]=st.useState([]),[ve,ye]=st.useState(0),[He,Ve]=st.useState(0),ft=st.useRef(null),Vt=M=>{U.current.interp=M,I(M),U.current.colBranch=0,U.current.colFade=0,U.current.colTriggered=!1,U.current.colYHold=0,U.current.histT=0,U.current.histR=0,U.current.histTotal=0,U.current.needleHistory=[],rt(0),mt(0),wt(0),Oe([]),U.current.dirty=!0},hn=M=>{U.current.tTarget=M,U.current.V0=Bg(M,U.current.k0),U.current.dirty=!0,U.current.histT=0,U.current.histR=0,U.current.histTotal=0,U.current.needleHistory=[],rt(0),mt(0),wt(0),Oe([]),re(M),ot(M),Xe(1-M),e.current&&(e.current.value=Math.round(M*100))},Pt=st.useCallback(M=>{U.current.lam=M,U.current.dirty=!0,fe(M),n.current&&(n.current.value=M),U.current.histT=0,U.current.histR=0,U.current.histTotal=0,U.current.needleHistory=[],rt(0),mt(0),wt(0),Oe([])},[]),Bn=M=>{U.current.xPointer=M,te(M),r.current&&(r.current.value=M)},In=M=>{U.current.detWidth=M,B(M),a.current&&(a.current.value=M)},$r=M=>{U.current.sigX=M,U.current.dirty=!0,be(M),c.current&&(c.current.value=M),U.current.histT=0,U.current.histR=0,U.current.histTotal=0,U.current.needleHistory=[],rt(0),mt(0),wt(0),Oe([])},ar=M=>{U.current.sigY=M,U.current.dirty=!0,me(M),f.current&&(f.current.value=M),U.current.histT=0,U.current.histR=0,U.current.histTotal=0,U.current.needleHistory=[],rt(0),mt(0),wt(0),Oe([])},Wi=M=>{U.current.speed=M,Ne(M),u.current&&(u.current.value=M)},Xi=M=>{U.current.pauseHoldMs=M,vt(M),tt.current&&(tt.current.value=M)},Mr=M=>{U.current.showWave=M,V(M)},Er=M=>{U.current.showTraj=M,_e(M)},lr=M=>{U.current.showProj=M,de(M)},So=M=>{U.current.showCoarse=M,Se(M)},Kr=M=>{U.current.fixedT=M,R(M)},Mo=M=>{U.current.running=M,ie(M)},Ri=M=>{U.current.barrierOn=M,U.current.dirty=!0,pe(M)},Eo=M=>{U.current.detectorOn=M,U.current.dirty=!0,Ce(M)},To=M=>{U.current.collapseThreshold=M,xe(M),h.current&&(h.current.value=Math.round(M*100))};st.useEffect(()=>{const M=s.current;if(!M)return;const j=new BE({antialias:!0});j.setClearColor(4,1),j.domElement.style.cssText="display:block;width:100%;height:100%;touch-action:pan-y;",M.appendChild(j.domElement);const Z=new q_,J=new zi(52,1,.1,200);function K(){const P=M.offsetWidth||M.clientWidth||window.innerWidth,De=M.offsetHeight||M.clientHeight||window.innerHeight;j.setSize(P,De,!1),j.setPixelRatio(Math.min(window.devicePixelRatio,2)),J.aspect=P/De,J.updateProjectionMatrix()}K();const Ae=new ResizeObserver(K);Ae.observe(M);function ze(){const P=U.current;J.position.set(P.camX,P.camY,P.camZ),J.lookAt(P.camX,P.camY,0)}ze(),kg(U.current.k0,U.current.V0,U.current.sigX);const Ge=new K_(an.rhoBuf,an.nx,1,Ch,yr);Ge.minFilter=Gi,Ge.magFilter=Gi,Ge.needsUpdate=!0;const qe={uBl:{value:0},uPT:{value:.5},uPR:{value:.5},uYT:{value:0},uYR:{value:0},uSigX:{value:1},uSigY:{value:.6},uColBranch:{value:0},uColFade:{value:0},uIsPW:{value:0},uBY:{value:0},uXin:{value:xr},uXT:{value:0},uXR:{value:0}},at=new ni(new Cs(60,40),new Sr({vertexShader:XE,fragmentShader:jE,uniforms:qe,side:Hi,depthWrite:!1}));at.position.z=-.1,Z.add(at);const lt=new ho({color:1718894,transparent:!0,opacity:.45});Z.add(new Rs(new Dn().setFromPoints([new ee(-14,0,0),new ee(14,0,0)]),lt)),Z.add(new Rs(new Dn().setFromPoints([new ee(0,-10,0),new ee(0,10,0)]),lt));const $e=new ho({color:52479,transparent:!0,opacity:.5}),Mt=new Rs(new Dn().setFromPoints([new ee(-.5,-10,0),new ee(-.5,10,0)]),$e);Z.add(Mt);const gt=new Rs(new Dn().setFromPoints([new ee(.5,-10,0),new ee(.5,10,0)]),$e);Z.add(gt);const $t=new ni(new Cs(1,20),new _a({color:8772,transparent:!0,opacity:.15,side:Hi}));Z.add($t);const Wt=new ho({color:16763972,transparent:!0,opacity:.7}),At=new Dn().setFromPoints([new ee(3,-10,.05),new ee(3,10,.05)]),et=new Rs(At,Wt);Z.add(et);const Qt=new ho({color:16763972,transparent:!0,opacity:.7}),Et=new Dn().setFromPoints([new ee(5,-10,.05),new ee(5,10,.05)]),Sn=new Rs(Et,Qt);Z.add(Sn);const cr=new _a({color:16763904,transparent:!0,opacity:.04,side:Hi}),Un=new Cs(1,20),Ci=new ni(Un,cr);Z.add(Ci);const kt="700 24px 'JetBrains Mono','Courier New',monospace",pn=Kt("detector","#ffcc44",kt);pn.scale.set(4.6,1.05,1),pn.position.set(3,9,.2),Z.add(pn);function Kt(P,De,Nn="700 16px 'JetBrains Mono','Courier New',monospace"){const Mn=document.createElement("canvas");Mn.width=300,Mn.height=52;const zn=Mn.getContext("2d");zn.font=Nn,zn.fillStyle=De,zn.textAlign="center",zn.textBaseline="middle",zn.fillText(P,150,26);const qn=new Ed(Mn),Xt=new yd(new au({map:qn,transparent:!0,opacity:.85}));return Xt.scale.set(5.2,.9,1),Xt}const ln=Kt("barrier V0","#00dcff",kt);ln.scale.set(4.6,1.05,1),ln.position.set(0,9,.2),Z.add(ln);const cn=Kt("T-branch  (x>0,  y>0)","#44ee88"),Rt=Kt("R-branch  (x<0,  y<0)","#ff8844");cn.position.set(6.5,5.5,.2),Z.add(cn),Rt.position.set(-6.5,-5.5,.2),Z.add(Rt);const mi={uSep:{value:0},uSepA:{value:0}},Ns=new ni(new Cs(60,40),new Sr({vertexShader:YE,fragmentShader:qE,uniforms:mi,transparent:!0,depthWrite:!1}));Ns.position.z=0,Ns.visible=!1,Z.add(Ns);const Fs=new Rs(new Dn().setFromPoints([new ee(-15,0,.1),new ee(15,0,.1)]),new ho({color:16777215,transparent:!0,opacity:0}));Fs.visible=!1,Z.add(Fs);const Ro=Kt("World 1  (transmitted)","#00e5ff"),Ao=Kt("World 2  (reflected)","#ee14d2");Ro.visible=!1,Ao.visible=!1,Z.add(Ro),Z.add(Ao);const Zr=Array.from({length:tu},()=>{const P=new Float32Array((Wr+1)*3),De=new Float32Array((Wr+1)*3),Nn=new Dn;Nn.setAttribute("position",new wi(P,3)),Nn.setAttribute("color",new wi(De,3));const Mn=new Rs(Nn,new ho({vertexColors:!0,transparent:!0,opacity:.7}));return Z.add(Mn),{geo:Nn,pos:P,col:De,line:Mn}}),Pi=Array.from({length:tu},()=>{const P=new ni(new mu(.18,16),new _a({transparent:!0,opacity:0,depthWrite:!1}));return Z.add(P),P}),gi=Array.from({length:tu},()=>{const P=new ni(new mu(.42,16),new _a({transparent:!0,opacity:0,depthWrite:!1,blending:Id}));return Z.add(P),P});let vi=[];function ji(){const P=U.current,De=P.barrierOn?P.V0:0,Nn=P.detectorOn?P.lam:0;if(kg(P.k0,De,P.sigX),P.interp==="cpn"){vi=[],Zr.forEach(Xt=>Xt.line.visible=!1),Pi.forEach(Xt=>Xt.visible=!1),gi.forEach(Xt=>Xt.visible=!1);return}vi=WE(P.k0,De,Nn,P.sigX,P.sigY,1);const Mn=Math.abs(xr)/P.k0,zn=(Mn+9)/Wr,qn=Math.round(Wr*.4);vi.forEach(({pts:Xt,isTransmit:En},Bt)=>{const dt=Zr[Bt],Rr=En?Vg:Gg,jt=new Ct(Rr[Bt%Rr.length]),nn=new Ct(3368601);dt.rawY=new Float32Array(Xt.length),dt.dtAs=new Float32Array(Xt.length),Xt.forEach((ri,rn)=>{dt.rawY[rn]=ri.y,dt.dtAs[rn]=Math.max(0,rn*zn-Mn)}),Xt.forEach((ri,rn)=>{dt.pos[rn*3]=ri.x,dt.pos[rn*3+1]=ri.y,dt.pos[rn*3+2]=.05;const $n=ei((rn-qn)/20,0,1);dt.col[rn*3]=Ld(nn.r,jt.r,$n),dt.col[rn*3+1]=Ld(nn.g,jt.g,$n),dt.col[rn*3+2]=Ld(nn.b,jt.b,$n)}),dt.geo.attributes.position.needsUpdate=!0,dt.geo.attributes.color.needsUpdate=!0,dt.geo.setDrawRange(0,Xt.length),dt.line.visible=!1});for(let Xt=1;Xt<tu;Xt++)Zr[Xt].line.visible=!1,Pi[Xt].visible=!1,gi[Xt].visible=!1}ji();function Yi(P){P.pointerType!=="touch"&&(U.current.drag={x:P.clientX,y:P.clientY},M.setPointerCapture(P.pointerId))}function Jr(P){const De=U.current;if(!De.drag)return;const Nn=P.clientX-De.drag.x,Mn=P.clientY-De.drag.y;De.drag.x=P.clientX,De.drag.y=P.clientY;const zn=De.camZ/14*.016;De.camX-=Nn*zn,De.camY+=Mn*zn,ze()}function Qr(P){U.current.drag=null,M.hasPointerCapture(P.pointerId)&&M.releasePointerCapture(P.pointerId)}function qi(P){P.preventDefault()}const Ml=P=>P.preventDefault();M.addEventListener("pointerdown",Yi),M.addEventListener("pointermove",Jr),M.addEventListener("pointerup",Qr),M.addEventListener("wheel",qi,{passive:!1}),M.addEventListener("contextmenu",Ml);const es=document.createElement("canvas");es.width=128,es.height=128;const Os=es.getContext("2d"),El=new Ed(es),Ua=new yd(new au({map:El,transparent:!0,depthWrite:!1}));Z.add(Ua);const ur=document.createElement("canvas");ur.width=128,ur.height=128;const Tl=ur.getContext("2d"),wl=new Ed(ur),Tr=new yd(new au({map:wl,transparent:!0,depthWrite:!1}));Tr.visible=!1,Z.add(Tr),p.current={scene:Z,camera:J,renderer:j,heatUni:qe,heatMesh:at,fLines:Zr,fDots:Pi,fGlows:gi,lblT:cn,lblR:Rt,mwOverlay:Ns,mwUni:mi,mwDivLine:Fs,lblMW1:Ro,lblMW2:Ao,ptrLine:et,ptrLine2:Sn,detFill:Ci,lblPointer:pn,lblBarrier:ln,bLine1:Mt,bLine2:gt,bFill:$t,gaugeCanvas:es,gCtx:Os,gaugeTex:El,gaugeSprite:Ua,coarseCanvas:ur,cCtx:Tl,coarseTex:wl,coarseSprite:Tr,rebuild:ji,trajs:()=>vi,updateCam:ze};let ts,wr=0,ks={current:0};function Rl(){ts=requestAnimationFrame(Rl);const P=U.current,De=p.current;if(!De)return;P.dirty&&(De.rebuild(),P.dirty=!1);const Nn=performance.now();if(P.running)if(P.pauseUntil>0){if(Nn>=P.pauseUntil){const nt=ei(gu(P.k0,P.V0),0,1);Math.abs(nt-P.histLastTprob)>.01&&(P.histT=0,P.histR=0,P.histTotal=0,P.histLastTprob=nt);const bt=P.interp==="mw",Lt=P.interp==="pw",Gt=P.interp==="cpn",mn=P.k0,Kn=P.detWidth/mn,gn=P.detectorOn?P.lam:0,_i=4*gn*Kn,Cr=Math.exp(-_i*_i/(4*P.sigY*P.sigY)),ai=gn>0&&(Cr<.01||P.showCoarse),Ot=P.lastYRFixed??0;let Yt=null,en=!1;if(bt&&gn>0&&!ai){const Li=Ot+4*gn*Kn,ss=Math.max(1e-10,Math.random()),Ru=Math.random(),Au=Math.sqrt(-2*Math.log(ss))*Math.cos(2*Math.PI*Ru),Nl=(Math.random()<nt?Li:Ot)+Au*P.sigY;Yt=Nl,en=Nl>=(Li+Ot)/2}bt&&ai?(P.histT+=nt,P.histR+=1-nt,P.histTotal+=1):bt&&gn>0?(en?P.histT++:P.histR++,P.histTotal++):bt&&gn===0?(P.histT+=nt,P.histR+=1-nt,P.histTotal+=1):Lt?(P.lastBIsTransmit?P.histT++:P.histR++,P.histTotal++):Gt&&P.colTriggered&&P.colBranch!==0&&(P.colBranch>0?P.histT++:P.histR++,P.histTotal++),bt&&ai?(P.sampledPointerY_T!==null&&P.needleHistory.push({dy:P.sampledPointerY_T-Ot,isT:!0}),P.sampledPointerY_R!==null&&P.needleHistory.push({dy:P.sampledPointerY_R-Ot,isT:!1})):bt&&gn>0&&Yt!==null?P.needleHistory.push({dy:Yt-Ot,isT:en}):Lt?P.needleHistory.push({dy:P.lastBY-Ot,isT:P.lastBIsTransmit}):Gt&&P.colTriggered&&P.colBranch!==0&&P.sampledPointerY!==null&&P.needleHistory.push({dy:P.sampledPointerY-Ot,isT:P.colBranch>0}),P.needleHistory.length>300&&(P.needleHistory=P.needleHistory.slice(-300)),P.tick=0,P.pauseUntil=0,P.colTriggered=!1,P.colBranch=0,P.colFade=0,P.colYHold=0,P.sampledPointerY=null,P.sampledPointerY_T=null,P.sampledPointerY_R=null,P.coarseIsT=null,P.dirty=!0}}else P.tick+=P.speed;ze();const Mn=Math.tan(26*Math.PI/180),zn=De.renderer.domElement.clientWidth,qn=De.renderer.domElement.clientHeight,Xt=zn===0||qn===0;let En,Bt;if(Xt)if(P._halfW)En=P._halfW,Bt=P._halfH;else{const nt=v.current,bt=nt?nt.clientWidth/Math.max(nt.clientHeight,1):4;Bt=7/Math.max(bt,.1),En=bt*Bt,P._halfW=En,P._halfH=Bt}else{const nt=zn/qn,bt=7/(nt*Mn),Lt=Math.max(P.camZ,bt);Lt>P.camZ&&(J.position.z=Lt),Bt=Mn*Lt,En=nt*Bt,P._halfW=En,P._halfH=Bt}const dt=P.camY-Bt*.6;P.lastYRFixed=dt;const Rr=P.barrierOn?P.V0:0,jt=P.detectorOn?P.lam:0,nn=ei(gu(P.k0,Rr),0,1),ri=1-nn,rn=P.k0,$n=Math.abs(xr)/rn,yu=$n+9,Bs=Math.min(P.tick%Og/Og,1),fr=Bs*yu,ns=ei(.5*(1+Math.tanh(10*(fr-$n))),0,1),zs=Math.max(0,fr-$n),Na=xr+rn*Math.min(fr,$n),bo=rn*zs,Fa=-rn*zs,Al=$n+P.xPointer/rn,Hs=Math.max(0,fr-Al),bl=P.detWidth,Su=Math.min(Hs,bl/rn),Mu=Math.max(Math.min(En-1.5,9),P.xPointer+P.detWidth),si=bl/rn,Vs=P.interp==="cpn"&&P.colTriggered&&P.colBranch>0?si:Su,Co=dt+4*jt*Vs,Eu=dt,is=jt>0?ei(Vs/3,0,1):0,Oa=ei(Math.round(Bs*Wr),0,Wr);P.running&&P.pauseUntil===0&&bo>Mu&&(P.pauseUntil=performance.now()+(P.pauseHoldMs??1e3));const Cl=4*jt*si,Ar=jt>0?Math.exp(-Cl*Cl/(4*P.sigY*P.sigY)):1;if(P.interp==="cpn"&&P.detectorOn&&jt>0){if(Bs<.02&&P.colTriggered&&(P.colTriggered=!1,P.colBranch=0,P.colFade=0,P.colYHold=0,P.sampledPointerY=null,P.sampledPointerY_T=null,P.sampledPointerY_R=null),!P.colTriggered&&fr>=Al){P.colTriggered=!0;const nt=dt+4*jt*si,bt=Math.max(1e-10,Math.random()),Lt=Math.random(),Gt=Math.sqrt(-2*Math.log(bt))*Math.cos(2*Math.PI*Lt),Kn=(Math.random()<nn?nt:dt)+Gt*P.sigY;P.sampledPointerY=Kn;const gn=(nt+dt)/2;P.colBranch=Kn>=gn?1:-1,P._colFadeMax=1-Ar,P.colYHold=Math.max(Hs,1),P.colFade=0,P.colStartMs=performance.now(),P.colPhase=0,P._flashPending=!0}if(P.colTriggered&&P.colBranch!==0){const nt=P._colFadeMax??1;P.colFade=Math.min(P.colFade+.08,nt)}}else P.colBranch=0,P.colFade=0,P.colTriggered=!1,P.colYHold=0;const Tu=De.trajs();let Pl=0,Gs=0,ka=!1;Tu.forEach(({pts:nt,isTransmit:bt},Lt)=>{const Gt=Zr[Lt];if(Lt>=1||P.interp!=="pw"){Gt.line.visible=!1,Pi[Lt].visible=!1,gi[Lt].visible=!1;return}if(Gt.line.visible=P.showTraj,P.showTraj&&Gt.geo.setDrawRange(0,Oa+1),Gt.rawY&&Gt.dtAs){const Ot=P.xPointer/P.k0,Yt=P.detWidth/P.k0;for(let en=0;en<=Wr;en++){const Li=Math.min(Math.max(0,Gt.dtAs[en]-Ot),Yt),ss=bt?4*jt*Li:0;Gt.pos[en*3+1]=dt+Gt.rawY[en]+ss}Gt.geo.attributes.position.needsUpdate=!0}const mn=nt[Oa],Kn=P.xPointer/P.k0,gn=P.detWidth/P.k0,_i=Math.min(Math.max(0,(Gt.dtAs?Gt.dtAs[Oa]:0)-Kn),gn),Cr=bt?4*jt*_i:0,ai=dt+mn.y+Cr;if(Lt===0&&(Pl=mn.x,Gs=ai,ka=bt,P.lastBIsTransmit=bt,P.lastBY=ai),Pi[Lt].visible=P.showTraj,gi[Lt].visible=P.showTraj,P.showTraj){Pi[Lt].position.set(mn.x,ai,.15),gi[Lt].position.set(mn.x,ai,.12);const Ot=bt?Vg:Gg,Yt=new Ct(Ot[Lt%Ot.length]);Pi[Lt].material.color.copy(Yt),gi[Lt].material.color.copy(Yt),Pi[Lt].material.opacity=.93,gi[Lt].material.opacity=.2*is}});const Po=P.xPointer+P.detWidth;if(De.ptrLine&&(De.ptrLine.geometry.setFromPoints([new ee(P.xPointer,-20,.05),new ee(P.xPointer,20,.05)]),De.ptrLine.visible=P.detectorOn),De.ptrLine2&&(De.ptrLine2.geometry.setFromPoints([new ee(Po,-20,.05),new ee(Po,20,.05)]),De.ptrLine2.visible=P.detectorOn),De.detFill){const nt=(P.xPointer+Po)/2;De.detFill.position.set(nt,P.camY,.04),De.detFill.scale.set(P.detWidth,40,1),De.detFill.visible=P.detectorOn}if(De.lblPointer&&(De.lblPointer.position.set((P.xPointer+Po)/2,P.camY+Bt-.8,.2),De.lblPointer.visible=P.detectorOn),De.lblBarrier&&(De.lblBarrier.position.set(0,P.camY+Bt-.8,.2),De.lblBarrier.visible=P.barrierOn),De.bLine1&&(De.bLine1.visible=P.barrierOn),De.bLine2&&(De.bLine2.visible=P.barrierOn),De.bFill&&(De.bFill.visible=P.barrierOn),T0(fr),Ge.needsUpdate=!0,De.heatMesh.visible=P.showWave,P.showWave){const nt=De.heatUni;nt.uBl.value=ns,nt.uPT.value=nn,nt.uPR.value=ri,nt.uXin.value=Na,nt.uXT.value=bo,nt.uXR.value=Fa,nt.uYT.value=Co,nt.uYR.value=dt,nt.uSigX.value=P.sigX,nt.uSigY.value=P.sigY,nt.uColBranch.value=P.colBranch;const bt=P.interp!=="pw"&&P.interp!=="mw"&&Ar>=.01?0:P.colFade;nt.uColFade.value=bt,nt.uIsPW.value=P.interp==="pw"?1:0,nt.uBY.value=Gs}De.lblT.visible=is>.3,De.lblR.visible=is>.3;const Ll=Math.min(6.5,En-2.2),Ws=Math.min(5.2,En*.68),Lo=Ws*(52/300),$i=P.interp==="mw";De.lblT.visible=!$i&&is>.3,De.lblR.visible=!$i&&is>.3,De.lblT.position.set(Ll,5.5,.2),De.lblR.position.set(-Ll,-5.5,.2),De.lblT.scale.set(Ws,Lo,1),De.lblR.scale.set(Ws,Lo,1);const Xs=jt>0?ei(Hs/3,0,1):0,Ba=$i&&(Ar<.01||P.showCoarse);if(De.mwOverlay.visible=$i,De.mwDivLine.visible=Ba&&Xs>.05,De.lblMW1.visible=Ba&&Xs>.08,De.lblMW2.visible=Ba&&Xs>.08,$i){De.mwUni.uSep.value=Xs,De.mwUni.uSepA.value=0,De.mwDivLine.geometry.setFromPoints([new ee(0,P.camY-Bt,.1),new ee(0,P.camY+Bt,.1)]),De.mwDivLine.material.opacity=Math.min(Xs*1.5,.95);const nt=2.5,bt=ei(Math.max(bo*.7,1.5),.5,En-nt),Lt=ei(Co*.7+dt*.3,P.camY-Bt+1,P.camY+Bt-1),Gt=ei(Math.min(Fa*.7,-1.5),-(En-nt),-.5),mn=ei(dt-Bt*.28,P.camY-Bt+1,P.camY+Bt-1);De.lblMW1.position.set(bt,Lt,.2),De.lblMW1.scale.set(Ws*1.3,Lo*1.3,1),De.lblMW2.position.set(Gt,mn,.2),De.lblMW2.scale.set(Ws*1.3,Lo*1.3,1)}const Do=performance.now();if(Do-wr>80&&(wr=Do,rt(P.histT),mt(P.histR),wt(P.histTotal),P.needleHistory.length!==ks.current&&(ks.current=P.needleHistory.length,Oe([...P.needleHistory])),P._flashPending)){P._flashPending=!1;const nt=P.colBranch;ye(nt),Ve(1);let bt=null;const Lt=Gt=>{bt||(bt=Gt);const mn=Math.max(0,1-(Gt-bt)/1400);Ve(mn),mn>0?ft.current=requestAnimationFrame(Lt):ye(0)};ft.current&&cancelAnimationFrame(ft.current),ft.current=requestAnimationFrame(Lt)}const wu=P.fixedT?jt>0?4*jt*si:1e-6:4*3*si,Dl=dt+wu;let rs,js,br;if(P.fixedT&&jt>0){const nt=4*jt*si,bt=dt+nt;br=A0(dt,bt,5);const Lt=(Math.ceil(nt/br)+1)*br;rs=0,js=Lt}else rs=-1,js=7,br=1;const Il=js-rs,oi=nt=>ei((nt-dt-rs)/Il,-.05,1.05),Ul={Tp:nn,Rp:ri,xIn:Na,xT:bo,xR:Fa,yT:Co,yR:Eu,yRFixed:dt,sigX:P.sigX,sigY:P.sigY,bl:ns,colBranch:P.colBranch,colFade:P.colFade,sampledPointerY:P.sampledPointerY,bX:Pl,bY:Gs,bIsTransmit:ka,isPW:P.interp==="pw",interp:P.interp,colElapsedMs:P.colTriggered?performance.now()-(P.colStartMs||0):0,colPhase:P.colPhase,sepFrac:is,ptrOverlap:Ar,showProj:P.showProj,showCoarse:P.showCoarse,fixedT:P.fixedT,yTFinal:Dl,tickStep:br,xLo:P.camX-En,xHi:P.camX+En,yLo:P.camY-Bt,yHi:P.camY+Bt,rho:an.rhoBuf,rhoXs:an.xs,V0:P.V0};if(QE(v.current,Ul),t1(x.current,Ul),De.gaugeSprite&&P.detectorOn){const nt=Math.min(Bt*.4,2.2);De.gaugeSprite.scale.set(nt,nt,1),De.gaugeSprite.position.set(P.xPointer,P.camY+Bt-nt*.5-1.15,.4),De.gaugeSprite.visible=!0;const bt=Vs>.02&&jt>0,Lt=dt+4*jt*si,Gt=oi(Lt),mn=jt>0?ei(Vs/si,0,1)*Gt:0;if(bt&&P.sampledPointerY===null){const Ot=dt+4*jt*si,Yt=()=>{const Li=Math.max(1e-10,Math.random()),ss=Math.random();return Math.sqrt(-2*Math.log(Li))*Math.cos(2*Math.PI*ss)},en=Math.random()<nn?Ot:dt;P.sampledPointerY=en+Yt()*P.sigY,P.sampledPointerY_T=Ot+Yt()*P.sigY,P.sampledPointerY_R=dt+Yt()*P.sigY}const Kn=P.sampledPointerY!==null?oi(P.sampledPointerY):0;if(P.sampledPointerY!==null&&P.coarseIsT===null){const Ot=dt+4*jt*si;P.coarseIsT=P.sampledPointerY>=(Ot+dt)/2}const gn=[],_i=$i&&(Ar<.01||P.showCoarse),Cr=ei(Vs/si,0,1),ai=Cr*Kn;if(!bt)gn.push({fraction:oi(dt),color:"#88aaff",alpha:.55});else if(_i){const Ot=Math.min(mn*2,1),Yt=P.sampledPointerY_T!==null?oi(P.sampledPointerY_T):mn,en=P.sampledPointerY_R!==null?oi(P.sampledPointerY_R):0;gn.push({fraction:Cr*Yt,color:"#22ee88",alpha:Ot*.88}),gn.push({fraction:Cr*en,color:"#ff7744",alpha:Ot*.88})}else if($i)gn.push({fraction:ai,color:"#88aaff",alpha:.82});else if(P.interp==="pw"){const Ot=bt?oi(Gs):0;gn.push({fraction:Ot,color:"#ffffff",alpha:.92})}else gn.push({fraction:ai,color:"#88aaff",alpha:P.colBranch!==0?.95:.82});if(r1(De.gCtx,128,128,gn,{r:oi(dt),t:Gt},null,{step:br,yMin:dt+rs,yMax:dt+js,yZero:dt}),De.gaugeTex.needsUpdate=!0,P.showCoarse){const Ot=nt;De.coarseSprite.scale.set(Ot,Ot,1),De.coarseSprite.position.set(P.xPointer+nt*1.05,P.camY+Bt-Ot*.5-1.15,.4),De.coarseSprite.visible=!0;let Yt,en;if(!bt)Yt="off",en="off";else if($i&&_i)Yt="on",en="on";else if(P.interp==="pw"){const Li=Gs>(dt+4*jt*si+dt)/2;Yt=Li?"on":"off",en=Li?"off":"on"}else $i&&!_i?(Yt="ambig",en="ambig"):P.coarseIsT===null?(Yt="off",en="off"):(Yt=P.coarseIsT?"on":"off",en=P.coarseIsT?"off":"on");s1(De.cCtx,128,128,Yt,en),De.coarseTex.needsUpdate=!0}else De.coarseSprite.visible=!1}else De.gaugeSprite&&(De.gaugeSprite.visible=!1,De.coarseSprite&&(De.coarseSprite.visible=!1));De.renderer.render(De.scene,De.camera)}return Rl(),()=>{cancelAnimationFrame(ts),Ae.disconnect(),M.removeEventListener("pointerdown",Yi),M.removeEventListener("pointermove",Jr),M.removeEventListener("pointerup",Qr),M.removeEventListener("wheel",qi),M.removeEventListener("contextmenu",Ml),j.dispose(),M.contains(j.domElement)&&M.removeChild(j.domElement),p.current=null}},[]);const[Ai,Us]=st.useState("sim"),[bi,wo]=st.useState(!1);return ue.jsxs("div",{style:{display:"flex",flexDirection:O?"column":"row",width:"100%",maxWidth:"100vw",height:O?void 0:"100%",minHeight:O?"100dvh":void 0,background:"#040a1c",overflowX:"hidden",overflowY:O?"auto":"hidden"},children:[ue.jsxs("div",{style:{flex:1,minWidth:0,display:"flex",flexDirection:"column",position:"relative",overflow:"hidden",height:O?void 0:"100%",minHeight:O?Math.min(S,500)*1.25+28:0},children:[ue.jsxs("div",{style:{display:"flex",flexShrink:0,background:"rgba(4,10,30,0.9)",borderBottom:"1px solid rgba(40,80,180,0.35)",height:28,alignItems:"center"},children:[[["sim","Simulation"],["math","Math"],["about","About"]].map(([M,j])=>M==="math"&&!bi?null:ue.jsx("button",{onClick:()=>Us(M),style:{padding:"0 16px",fontSize:11,cursor:"pointer",border:"none",fontFamily:"'JetBrains Mono','Courier New',monospace",textTransform:"uppercase",letterSpacing:"0.08em",background:Ai===M?"rgba(40,80,200,0.3)":"transparent",color:Ai===M?"#88bbff":"#4a6a9a",borderBottom:Ai===M?"2px solid #5588ff":"2px solid transparent",height:"100%"},children:j},M)),ue.jsx("button",{onClick:()=>{const M=bi;wo(j=>!j),M&&Ai==="math"&&Us("sim")},style:{marginLeft:"auto",padding:"0 12px",height:"100%",fontSize:14,cursor:"pointer",border:"none",fontFamily:"'JetBrains Mono','Courier New',monospace",letterSpacing:"0.06em",textTransform:"uppercase",background:bi?"rgba(80,40,160,0.35)":"rgba(0,60,120,0.25)",color:bi?"#cc99ff":"#4a8ac0",borderLeft:"1px solid rgba(60,80,180,0.25)",borderBottom:"2px solid transparent"},children:bi?"▼ Advanced":"▶ Beginner"})]}),ue.jsxs("div",{style:{display:Ai==="sim"?"flex":"none",flex:1,flexDirection:"column",overflow:"hidden"},children:[ue.jsxs("div",{style:{flex:4,minHeight:0,display:"flex",flexDirection:"row",overflow:"hidden"},children:[ue.jsxs("div",{ref:s,style:{flex:1,position:"relative",overflow:"hidden",touchAction:"pan-y"},children:[ve!==0&&He>0&&(()=>{const M=ve===1?"#22ee88":"#ff7744";return ue.jsx("div",{style:{position:"absolute",inset:0,pointerEvents:"none",zIndex:10,boxShadow:`inset 0 0 ${50*He}px ${M}88`,border:`2px solid ${M}`,display:"flex",alignItems:"center",justifyContent:"center",opacity:He},children:ue.jsx("div",{style:{fontSize:g?18:28,fontWeight:700,color:M,letterSpacing:"0.18em",fontFamily:"'JetBrains Mono','Courier New',monospace",textShadow:`0 0 30px ${M}, 0 0 60px ${M}66`},children:"COLLAPSE ⚡🎲"})})})(),Ai==="sim"&&bi&&ue.jsxs(ue.Fragment,{children:[ue.jsx(ZE,{histT:it,histR:Ye,histTotal:ht,Tp:Be}),ue.jsx(KE,{needleHistory:q,deltaY:4*ce*(se/4),sigY:Q,Tp:Be})]}),ue.jsx("div",{style:{position:"absolute",bottom:14,left:"50%",transform:"translateX(-50%)",color:"rgba(100,160,255,0.5)",fontSize:g?13:16,pointerEvents:"none",fontFamily:"'JetBrains Mono','Courier New',monospace"},children:g?"x — position →":"x — particle position →"}),ue.jsx("div",{style:{position:"absolute",top:10,right:12},children:ue.jsx(As,{text:R0[N],children:ue.jsx("div",{style:{color:Mh[N],fontSize:12,fontWeight:700,fontFamily:"'JetBrains Mono','Courier New',monospace",background:"rgba(4,10,30,0.7)",padding:"3px 8px",borderRadius:4,border:`1px solid ${Mh[N]}55`,cursor:"help"},children:w0[N]})})})]}),D&&ue.jsxs(kn.Fragment,{children:[ue.jsx("div",{style:{width:18,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:"#020812",borderLeft:"1px solid rgba(40,80,180,0.3)"},children:ue.jsx("span",{style:{color:"rgba(100,160,255,0.5)",fontSize:16,pointerEvents:"none",fontFamily:"'JetBrains Mono','Courier New',monospace",writingMode:"vertical-rl",transform:"rotate(180deg)",whiteSpace:"nowrap"},children:"y — pointer position →"})}),ue.jsx("div",{style:{width:A,flexShrink:0,background:"#020812"},children:ue.jsx(n1,{ref:x})})]})]}),ue.jsxs("div",{ref:y,style:{flex:1,minHeight:0,display:"flex",flexDirection:"row",borderTop:"1px solid rgba(40,80,180,0.3)",position:"relative"},children:[ue.jsx("div",{style:{flex:1,background:"#020812",overflow:"hidden"},children:ue.jsx(e1,{ref:v})}),D&&ue.jsx("div",{style:{width:A,flexShrink:0,background:"#020812",borderLeft:"1px solid rgba(40,80,180,0.3)"}})]})]}),Ai==="math"&&ue.jsx(i1,{interp:N}),Ai==="about"&&ue.jsxs("div",{style:{flex:1,overflowY:"auto",padding:"28px 36px",fontFamily:"Georgia,'Times New Roman',serif",background:"#040a1c",color:"#c8d8f0",lineHeight:1.9,fontSize:15},children:[["What does it mean to measure a quantum particle?","This simulation shows a quantum particle — say, an electron — approaching a potential barrier from the left. The horizontal axis is the particle's position x. The vertical axis is the internal coordinate of a measuring device: a pointer that deflects upward when the particle transmits and stays at rest when it reflects. The yellow vertical line marks the detector where the particle–pointer coupling begins.","Before the barrier, the wavefunction is a single two-dimensional blob moving horizontally — the particle drifts toward the barrier while the pointer stays at rest.","At the barrier, the wavefunction splits into two branches. The transmitted branch moves to the upper right — the particle passes through and the pointer deflects upward. The reflected branch moves to the lower left — the particle bounces back and the pointer stays near rest. The projection panels on the sides show the resulting two-peaked distributions.","What happens next depends on your view of quantum mechanics.","Orthodox QM: The wavefunction collapses to a single branch at every cycle — the moment the pointer is read, one outcome is selected with Born-rule probability and the other branch is discarded. This happens regardless of whether the measurement is weak or strong. What changes with coupling strength is not whether collapse occurs, but how much the pointer moves: in a strong measurement (large coupling, narrow pointer) the two pointer states are nearly orthogonal and a single shot unambiguously identifies the branch; in a weak measurement the pointer barely moves, the T and R distributions heavily overlap, and a single shot gives almost no information. Many shots are needed to recover the Born-rule statistics — but each shot is still a definite, collapsed outcome. The Pointer overlap readout in the Advanced panel tracks the overlap ⟨χ_T|χ_R⟩ live.","Many Worlds (Everett): The wavefunction never collapses. Both branches continue to exist in separate, non-communicating worlds. In a strong measurement (pointer overlap < 1%) the two worlds are well resolved: the simulation shows the cyan/magenta split and labels World 1 / World 2. Each cycle both worlds are counted with Deutsch-Wallace amplitude-squared weights (+T and +R) — naive branch counting would give 50/50 regardless of amplitude, so the weights implement the Born-rule measure. In a weak measurement the pointer states still overlap heavily — the worlds have not yet branched into distinguishable copies. A single noisy pointer reading y is drawn from the mixed distribution and thresholded to T or R, but this is a classical post-processing step, not a physical branching event. The coarse gauge shows this: it parks at centre (ambiguous) in the weak regime.","Pilot-Wave (Bohmian mechanics): The wavefunction never collapses either, but the particle always has a definite position, guided by the wave. The white dot traces this trajectory. It enters one branch and never crosses to the other. The other branch — the empty wave — continues to propagate but carries no particle and has no further physical effect on the outcome.","All three views make identical experimental predictions. The difference is ontological: what they claim is really happening between measurements.","A strong measurement uses a large coupling and a narrow pointer so the T and R pointer states end up well separated and orthogonal — collapse fires every cycle in Orthodox mode. A weak measurement uses a small coupling or a wide pointer: the pointer states overlap significantly, the device cannot distinguish the two outcomes in a single shot, and many shots are needed to recover the Born-rule statistics. Switch to Advanced mode to adjust these parameters and watch the Pointer overlap change in real time.","The simulation shows two detector gauges side by side (enable Coarse det. in Advanced › Physics). The left Fine gauge shows the quantum pointer — a continuous Gaussian wavepacket that entangles with the particle. The right Coarse gauge shows a binary register that amplifies the fine reading into a definite T or R click. Together they illustrate the two-stage amplification chain that turns a quantum superposition into a macroscopic outcome. In the Many-Worlds weak regime, the fine pointer is ambiguous and the coarse gauge parks at centre — no branching, no definite click."].map((M,j)=>ue.jsx("p",{style:{marginBottom:"1.2em",fontWeight:j===0?700:400,fontSize:j===0?18:15,color:j===0?"#88ccff":"#c8d8f0"},children:M},j)),ue.jsxs("p",{style:{marginTop:"2em",fontSize:11,color:"#2a4060",fontFamily:"'JetBrains Mono','Courier New',monospace"},children:["Measurement · v","1.4.0"]})]})]}),!O&&ue.jsx("div",{onMouseDown:b,style:{width:5,flexShrink:0,cursor:"col-resize",background:"rgba(40,80,180,0.18)",borderLeft:"1px solid rgba(40,80,180,0.35)",transition:"background 0.15s"},onMouseEnter:M=>M.currentTarget.style.background="rgba(80,130,255,0.35)",onMouseLeave:M=>M.currentTarget.style.background="rgba(40,80,180,0.18)"}),ue.jsx("div",{style:{width:O?"100%":L,flexShrink:0,background:"rgba(4,10,30,0.92)",borderTop:O?"1px solid rgba(40,80,180,0.35)":"none",overflowY:"auto",scrollbarWidth:"thin",maxHeight:O?"none":"100vh"},children:ue.jsx(JE,{interp:N,setInterp:Vt,tTarget:ae,setTTarget:hn,tTargetRef:e,lam:ce,setLam:Pt,lamRef:n,xPointer:H,setXPointer:Bn,xPointerRef:r,detWidth:se,setDetWidth:In,detWidthRef:a,sigX:oe,setSigX:$r,sigXRef:c,sigY:Q,setSigY:ar,sigYRef:f,collapseThreshold:Me,setCollapseThreshold:To,collapseThresholdRef:h,speed:Re,setSpeed:Wi,speedRef:u,pauseHoldMs:ke,setPauseHoldMs:Xi,pauseHoldMsRef:tt,showWave:_t,setShowWave:Mr,showTraj:St,setShowTraj:Er,showProj:Ue,setShowProj:lr,showCoarse:Le,setShowCoarse:So,fixedT:C,setFixedT:Kr,running:W,setRunning:Mo,barrierOn:ge,setBarrierOn:Ri,detectorOn:Fe,setDetectorOn:Eo,histT:it,histR:Ye,histTotal:ht,isMobile:g,advMode:bi})})]})}Lv.createRoot(document.getElementById("root")).render(ue.jsx(o1,{}));

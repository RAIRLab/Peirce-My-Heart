/* empty css               */(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const f of s)if(f.type==="childList")for(const B of f.addedNodes)B.tagName==="LINK"&&B.rel==="modulepreload"&&i(B)}).observe(document,{childList:!0,subtree:!0});function n(s){const f={};return s.integrity&&(f.integrity=s.integrity),s.referrerPolicy&&(f.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?f.credentials="include":s.crossOrigin==="anonymous"?f.credentials="omit":f.credentials="same-origin",f}function i(s){if(s.ep)return;s.ep=!0;const f=n(s);fetch(s.href,f)}})();class l{constructor(e,n){if(this.x=e,this.y=n,!Number.isFinite(this.x)||!Number.isFinite(this.y))throw new Error("NaN or Infinity value(s) were passed in constructing a Point.")}set(e,n){if(!Number.isFinite(e)||!Number.isFinite(n))throw new Error("NaN or Infinity value(s) were passed in setting "+this+"'s coords.");this.x=e,this.y=n}distance(e){const n=this.x-e.x,i=this.y-e.y;return Math.sqrt(n*n+i*i)}toString(){return"("+this.x+", "+this.y+")"}}function H(t,e){return xe(t,e)||X(e,t)}function xe(t,e){if(t instanceof L)return e instanceof L?fe(t,e):ue(e,t);if(e instanceof L)return ue(t,e);if(fe(t.boundingBox,e.boundingBox)||X(e.boundingBox,t.boundingBox)){const n=te(t);let i;for(let s=0;s<n.length;s++)if(i=N(e,n[s]),i<=0)return!0;return!1}return!1}function ue(t,e){const n=te(t);for(let i=0;i<n.length;i++)if(z(e,n[i]))return!0;return!1}function X(t,e){if(t instanceof L)if(e instanceof L){const n=e.getCorners();for(let i=0;i<4;i++)if(!z(t,n[i]))return!1;return!0}else{const n=$e(e);for(let i=0;i<4;i++)if(!z(t,n[i]))return!1;return!0}else if(e instanceof L){const n=e.getCorners();let i;for(let s=0;s<4;s++)if(i=N(t,n[s]),!(i<0))return!1;return!0}else{const n=te(e);let i;for(let s=0;s<n.length;s++)if(i=N(t,n[s]),!(i<0))return!1;return!0}}function fe(t,e){const n=t.getCorners(),i=e.getCorners();return(n[0].y<=i[0].y&&n[2].y>=i[0].y||n[0].y<=i[2].y&&n[2].y>=i[2].y||i[0].y<=n[0].y&&i[2].y>=n[0].y||i[0].y<=n[2].y&&i[2].y>=n[2].y)&&(n[0].x<=i[0].x&&n[1].x>=i[0].x||n[0].x<=i[1].x&&n[1].x>=i[1].x||i[0].x<=n[0].x&&i[1].x>=n[0].x||i[0].x<=n[1].x&&i[1].x>=n[1].x)}function z(t,e){const n=t.getCorners();return n[0].x<e.x&&n[1].x>e.x&&n[0].y<e.y&&n[2].y>e.y}function N(t,e){return Math.pow(e.x-t.center.x,2)/Math.pow(t.radiusX,2)+Math.pow(e.y-t.center.y,2)/Math.pow(t.radiusY,2)-1}function $e(t){return[new l(t.center.x,t.center.y-t.radiusY),new l(t.center.x+t.radiusX,t.center.y),new l(t.center.x,t.center.y+t.radiusY),new l(t.center.x-t.radiusX,t.center.y)]}function te(t){const e=[];let n,i,s=1;for(let f=0;f<360;f++)n=t.center.x+t.radiusX*Math.cos(f*(Math.PI/180)),f>180&&(s=-1),i=He(t,n,s),e[f]=new l(n,i);return e}function He(t,e,n){return t.radiusX===0||t.radiusY===0?t.center.y:n*t.radiusY*Math.sqrt(1-Math.pow((e-t.center.x)/t.radiusX,2))+t.center.y}class L{constructor(e,n,i){if(!Number.isFinite(n)||!Number.isFinite(i))throw new Error("Infinity/NaN passed in for width/height while constructing a Rectangle.");if(n!==void 0&&n<0)throw new Error("Negative value passed for width while constructing a Rectangle.");if(i!==void 0&&i<0)throw new Error("Negative value passed for height while constructing a Rectangle.");this.startVertex=e,this.width=n,this.height=i}getCorners(){const e=[this.startVertex];return e.push(new l(this.startVertex.x+this.width,this.startVertex.y)),e.push(new l(this.startVertex.x+this.width,this.startVertex.y+this.height)),e.push(new l(this.startVertex.x,this.startVertex.y+this.height)),e}containsPoint(e){return z(this,e)}overlaps(e){return H(this,e)}contains(e){return X(this,e)}toString(){return"Rectangle with top left vertex at: "+this.startVertex.toString()+", w: "+this.width+", h: "+this.height}}class c{constructor(e,n,i,s){if(e.length!==1)throw new Error("String of length "+e.length+" passed in as identifier in AtomNode constructor, which is not of length 1.");if(!/^[A-Za-z]$/.test(e))throw new Error(e+" not contained in Latin alphabet passed in as identifier in AtomNode constructor.");this.internalIdentifier=e,this.internalOrigin=n,this.internalWidth=i,this.internalHeight=s}get width(){return this.internalWidth}set width(e){this.internalWidth=e}get height(){return this.internalHeight}set height(e){this.internalHeight=e}get identifier(){return this.internalIdentifier}set identifier(e){this.internalIdentifier=e}get origin(){return this.internalOrigin}set origin(e){this.internalOrigin=e}containsPoint(e){return this.calcRect().containsPoint(e)}toString(){return"An atom representing the proposition: "+this.internalIdentifier+" and Boundary box of: "+this.calcRect().toString()}calcRect(){return new L(new l(this.internalOrigin.x,this.internalOrigin.y-this.internalHeight),this.internalWidth,this.internalHeight)}}class u{constructor(e,n){this.internalEllipse=e,this.internalChildren=n??[]}get ellipse(){return this.internalEllipse}set ellipse(e){this.internalEllipse=e}get children(){return this.internalChildren}set children(e){this.internalChildren=e}set child(e){this.internalChildren.push(e)}getCurrentCut(e){for(let n=0;n<this.internalChildren.length;n++){const i=this.internalChildren[n];if(i instanceof u&&i.containsNode(e))return i.getCurrentCut(e)}return this}containsPoint(e){return this.internalEllipse===null?!0:this.internalEllipse.containsPoint(e)}containsNode(e){return this.internalEllipse===null?!0:e instanceof c?X(this.internalEllipse,e.calcRect()):X(this.internalEllipse,e.internalEllipse)}getLowestNode(e){if(!this.containsPoint(e))return null;for(let n=0;n<this.internalChildren.length;n++)if(this.internalChildren[n].containsPoint(e))return this.internalChildren[n]instanceof c||this.internalChildren[n]instanceof u&&this.internalChildren[n].children.length===0?this.internalChildren[n]:this.internalChildren[n].getLowestNode(e);return this}getLowestParent(e){if(!this.containsPoint(e))throw new Error("This parent "+this.toString+" does not contain the point.");for(let n=0;n<this.internalChildren.length;n++)if(this.internalChildren[n].containsPoint(e)){if(this.internalChildren[n]instanceof c||this.internalChildren[n]instanceof u&&this.internalChildren[n].children.length===0)return this;{const i=this.internalChildren[n];for(let s=0;s<i.children.length;s++)if(i.children[s].containsPoint(e))return i.getLowestParent(e);return this}}return null}remove(e){if(!this.containsPoint(e))return!1;for(let n=0;n<this.children.length;n++)if(this.children[n].containsPoint(e)){if(this.children[n]instanceof c||this.children[n]instanceof u&&this.children[n].children.length===0)return this.children.splice(n,1),!0;for(let i=0;i<this.children[n].children.length;i++)if(this.children[n].children[i].containsPoint(e))if(this.children[n].children[i]instanceof c)this.children[n].children.splice(i,1);else return this.children[n].children[i].remove(e);return this.children.splice(n,1),!0}return!1}toString(){let e;return this.internalEllipse===null?e="Sheet of Assertion of the AEG Tree":e="A cut node with boundary box of "+this.internalEllipse.toString(),this.internalChildren.length>0&&(e+=", With nested nodes: "+this.internalChildren.toString()),e}toFormulaString(){let e="";for(const n of this.internalChildren)n instanceof c?e+=n.identifier:n instanceof u&&(e+=n.toFormulaString()),e+=" ";return e=e.slice(0,-1),this.internalEllipse===null?e="["+e+"]":e="("+e+")",e}}class ne{constructor(e){this.internalSheet=e??new u(null)}get sheet(){return this.internalSheet}set sheet(e){this.internalSheet=e}verify(){return this.verifyAEG(this.internalSheet)}verifyAEG(e){for(let n=0;n<e.children.length;n++){if(!e.containsNode(e.children[n]))return!1;for(let i=n+1;i<e.children.length;i++)if(this.overlaps(e.children[n],e.children[i]))return!1}for(let n=0;n<e.children.length;n++)if(e.children[n]instanceof u&&!this.verifyAEG(e.children[n]))return!1;return!0}canInsert(e){const n=this.internalSheet.getCurrentCut(e);for(let i=0;i<n.children.length;i++)if(this.intersects(e,n.children[i]))return!1;return!0}insert(e){if(!this.canInsert(e))throw new Error("Insertion failed. "+e+" had a collision.");const n=this.internalSheet.getCurrentCut(e),i=[...n.children];if(n.child=e,e instanceof u)for(let s=i.length-1;s>=0;s--)e.containsNode(i[s])&&(e.child=i[s],n.children.splice(s,1));return!0}getLowestNode(e){return this.internalSheet.getLowestNode(e)}getLowestParent(e){return this.internalSheet.getLowestParent(e)}remove(e){return this.internalSheet.remove(e)}intersects(e,n){const i=e instanceof c?e.calcRect():e.ellipse,s=n instanceof c?n.calcRect():n.ellipse;return xe(i,s)}overlaps(e,n){let i,s;return e instanceof c?n instanceof c?H(e.calcRect(),n.calcRect()):(i=n.ellipse,H(e.calcRect(),i)):n instanceof c?(i=e.ellipse,H(i,n.calcRect())):(i=e.ellipse,s=n.ellipse,H(i,s))}toString(){return this.internalSheet.toFormulaString()}}class U{constructor(e,n,i){if(this.center=e,this.radiusX=n,this.radiusY=i,!Number.isFinite(this.radiusX)||!Number.isFinite(this.radiusY))throw new Error("A radius passed into an Ellipse construction was NaN or Infinity.");if(this.radiusX!==void 0&&this.radiusX<0)throw new Error("Horizontal radius in an Ellipse construction was negative.");if(this.radiusY!==void 0&&this.radiusY<0)throw new Error("Vertical radius in an Ellipse construction was negative.");const s=new l(this.center.x-this.radiusX,this.center.y-this.radiusY);this.boundingBox=new L(s,this.radiusX*2,this.radiusY*2)}containsPoint(e){return N(this,e)<0}overlaps(e){return H(this,e)}contains(e){return X(this,e)}toString(){return"An ellipse with Center at: "+this.center.toString()+", Horizontal radius: "+this.radiusX+", Vertical radius: "+this.radiusY+", Bounding box: "+this.boundingBox.toString()}}const Re=document.getElementById("theme-select");function R(t){return getComputedStyle(document.body).getPropertyValue(t)}let pe=R("--good-placement"),me=R("--bad-placement"),Me=R("--canvas-items");function Ee(){setTimeout(()=>{pe=R("--good-placement"),me=R("--bad-placement"),Me=R("--canvas-items"),a(r)})}Re.addEventListener("input",()=>{Ee()});window.addEventListener("DOMContentLoaded",()=>{Ee()});function g(){return me}function E(){return pe}function be(){return Me}const _=document.getElementById("canvas"),Ce=_.getContext("2d");if(Ce===null)throw Error("2d rendering context not supported");const h=Ce;h.font="35pt arial";const Xe=document.getElementById("graphString"),Fe=document.getElementById("atomBox"),ke=document.getElementById("atomBoxes");ke.addEventListener("input",Te);function $(t,e){h.strokeStyle=e;const n=t.ellipse,i=n.center;h.beginPath(),h.ellipse(i.x+o.x,i.y+o.y,n.radiusX,n.radiusY,0,0,2*Math.PI),h.stroke()}function m(t,e,n){h.textBaseline="bottom";const i=h.measureText(t.identifier);h.fillStyle=e,h.strokeStyle=e,h.beginPath(),h.fillText(t.identifier,t.origin.x+o.x,t.origin.y+o.y),(ke.checked||Fe.checked&&n)&&h.rect(t.origin.x+o.x,t.origin.y+o.y-i.actualBoundingBoxAscent,t.width,t.height),h.stroke()}function Ye(t,e,n){h.beginPath(),h.strokeStyle=n;const i=t.x-e.x+o.x,s=t.y-e.y+o.y;h.rect(t.x,t.y,-i,-s),h.stroke()}function Te(){a(r)}function a(t){Xe.innerHTML=t.toString(),h.clearRect(0,0,_.width,_.height),Ie(t.sheet)}function Ie(t){for(let e=0;t.children.length>e;e++)t.children[e]instanceof c?Ve(t.children[e]):Ie(t.children[e]);t.ellipse instanceof U&&(h.strokeStyle=be(),h.beginPath(),h.ellipse(t.ellipse.center.x+o.x,t.ellipse.center.y+o.y,t.ellipse.radiusX,t.ellipse.radiusY,0,0,2*Math.PI),h.stroke())}function Ve(t){m(t,be(),!1)}let ee,o=new l(0,0),ie;function We(t){ee=new l(t.x-o.x,t.y-o.y),ie=!1}function je(t){ie||(o=new l(t.x-ee.x,t.y-ee.y),a(r))}function Ue(){ie=!0,a(r)}const Ge=document.getElementById("showRect"),ze=document.getElementById("mode");let J,q;function Ne(t){J=new l(t.clientX-o.x,t.clientY-o.y),q=!1}function Je(t){const e=new u(new U(new l(0,0),0,0)),n=new l(t.clientX-o.x,t.clientY-o.y);if(a(r),e.ellipse=Pe(J,n),!q){const s=r.canInsert(e)&&Le(e.ellipse)?E():g();$(e,s),Ge.checked&&Ye(J,n,s)}}function qe(t){const e=new l(t.clientX-o.x,t.clientY-o.y),n=new u(Pe(J,e));r.canInsert(n)&&!q&&Le(n.ellipse)&&r.insert(n),a(r)}function Ke(){q=!0,a(r)}function Pe(t,e){const n=new l((e.x-t.x)/2+t.x,(e.y-t.y)/2+t.y),i=t.x-e.x,s=t.y-e.y,f=Math.abs(i),B=Math.abs(s);let Z,Q;if(ze.value==="circumscribed"){const ae=Math.floor(n.distance(e));Q=Math.floor(ae*(B/f)),Z=Math.floor(ae*(f/B))}else Z=f/2,Q=B/2;return new U(n,Z,Q)}function Le(t){return t.radiusX>15&&t.radiusY>15}const Ze=document.getElementById("canvas"),Se=Ze.getContext("2d");if(Se===null)throw Error("2d rendering context not supported");const Qe=Se,Be=document.getElementById("atomDisplay");let C,K,v="A";Be.innerHTML=v;function _e(t){new RegExp(/^[A-Za-z]$/).test(t.key)&&(v=t.key,Be.innerHTML=v)}function et(t){C=Qe.measureText(v),K=!1;const e=new c(v,new l(t.clientX-o.x,t.clientY-o.y),C.width,C.fontBoundingBoxDescent+C.actualBoundingBoxAscent);a(r);const n=r.canInsert(e)?E():g();m(e,n,!0)}function tt(t){const e=new c(v,new l(t.clientX-o.x,t.clientY-o.y),C.width,C.fontBoundingBoxDescent+C.actualBoundingBoxAscent);a(r),K||(r.canInsert(e)?m(e,E(),!0):m(e,g(),!0))}function nt(t){const e=new c(v,new l(t.clientX-o.x,t.clientY-o.y),C.width,C.fontBoundingBoxDescent+C.actualBoundingBoxAscent);r.canInsert(e)&&!K&&r.insert(e),a(r)}function it(){K=!0,a(r)}async function rt(t,e){const n=JSON.stringify(e,null,"	"),i=await t.createWritable();await i.write(n),await i.close()}function st(t){if(typeof t=="string"){const n=JSON.parse(t).internalSheet.internalChildren,i=new ne,s=[];return n.forEach(f=>{Object.prototype.hasOwnProperty.call(f,"internalEllipse")?s.push(ve(f)):s.push(Oe(f))}),i.sheet.children=s,i}return null}function ve(t){const e=new U(new l(t.internalEllipse.center.x,t.internalEllipse.center.y),t.internalEllipse.radiusX,t.internalEllipse.radiusY),n=[];return t.internalChildren.forEach(i=>{"internalEllipse"in i?n.push(ve(i)):n.push(Oe(i))}),new u(e,n)}function Oe(t){const e=t.internalIdentifier,n=new l(t.internalOrigin.x,t.internalOrigin.y);return new c(e,n,t.internalWidth,t.internalHeight)}function G(t,e){if(t.ellipse!==null){const n=S(t,e);if(!r.canInsert(n))return!1}for(let n=0;n<t.children.length;n++){if(t.children[n]instanceof u&&t.children[n].ellipse!==null&&!G(t.children[n],e))return!1;if(t.children[n]instanceof c){let i=t.children[n];if(i=b(i,e),!r.canInsert(i))return!1}}return!0}function re(t,e,n){if(t instanceof u&&t.ellipse!==null){const i=S(t,n);if($(i,e),t.children.length!==0)for(let s=0;s<t.children.length;s++)re(t.children[s],e,n)}else if(t instanceof c){const i=b(t,n);m(i,e,!0)}}function se(t,e){if(t instanceof u&&t.ellipse!==null){const n=S(t,e);if(r.insert(n),t.children.length!==0)for(let i=0;i<t.children.length;i++)se(t.children[i],e)}else if(t instanceof c){const n=b(t,e);r.insert(n)}}function S(t,e){if(t.ellipse!==null)return new u(new U(new l(t.ellipse.center.x+e.x-o.x,t.ellipse.center.y+e.y-o.y),t.ellipse.radiusX,t.ellipse.radiusY));throw new Error("Cannot alter the position of a cut without an ellipse.")}function b(t,e){return new c(t.identifier,new l(t.origin.x+e.x-o.x,t.origin.y+e.y-o.y),t.width,t.height)}let I,d=null,O;function ot(t){if(I=new l(t.x-o.x,t.y-o.y),d=r.getLowestNode(I),d!==r.sheet&&d!==null){const e=r.getLowestParent(I);if(e!==null&&e.remove(I),d instanceof u&&d.children.length!==0){for(let n=0;n<d.children.length;n++)r.insert(d.children[n]);d.children=[]}O=!0}else O=!1}function lt(t){if(O){const e=new l(t.x-I.x,t.y-I.y);if(d instanceof u){const n=S(d,e);a(r);const i=r.canInsert(n)?E():g();$(n,i)}else if(d instanceof c){const n=b(d,e);a(r);const i=r.canInsert(n)?E():g();m(n,i,!0)}}}function ct(t){if(O){const e=new l(t.x-I.x,t.y-I.y);if(d instanceof u){const n=S(d,e);r.canInsert(n)?r.insert(n):r.insert(d)}else if(d instanceof c){const n=b(d,e);r.canInsert(n)?r.insert(n):r.insert(d)}a(r)}O=!1}function at(){O&&d!==null&&r.insert(d),O=!1,a(r)}let P,y=null,A;function ut(t){if(P=new l(t.x-o.x,t.y-o.y),y=r.getLowestNode(P),y!==r.sheet&&y!==null){const e=r.getLowestParent(P);e!==null&&e.remove(P),A=!0}else A=!1}function ft(t){if(A){const e=new l(t.x-P.x,t.y-P.y);if(a(r),y instanceof u){const n=G(y,e)?E():g();re(y,n,e)}else if(y instanceof c){const n=b(y,e),i=r.canInsert(n)?E():g();m(n,i,!0)}}}function ht(t){if(A){const e=new l(t.x-P.x,t.y-P.y);if(y instanceof u)G(y,e)?se(y,e):r.insert(y);else if(y instanceof c){const n=b(y,e);r.canInsert(n)?r.insert(n):r.insert(y)}}a(r),A=!1}function dt(){A&&y!==null&&r.insert(y),A=!1,a(r)}let F,p=null,Y;function wt(t){F=new l(t.x-o.x,t.y-o.y);const e=r.getLowestNode(F);e!==r.sheet&&e!==null?(e instanceof u?(p=S(e,new l(0,0)),p.children=[]):e instanceof c&&(p=e),Y=!0):Y=!1}function yt(t){if(Y){const e=new l(t.x-F.x,t.y-F.y);if(p instanceof u){const n=S(p,e);a(r);const i=r.canInsert(n)?E():g();$(n,i)}else if(p instanceof c){const n=b(p,e);a(r);const i=r.canInsert(n)?E():g();m(n,i,!0)}}}function gt(t){if(Y){const e=new l(t.x-F.x,t.y-F.y);if(p instanceof u&&p.ellipse!==null){const n=S(p,e);r.canInsert(n)&&r.insert(n)}else if(p instanceof c){const n=b(p,e);r.canInsert(n)&&r.insert(n)}a(r)}Y=!1}function xt(){Y=!1,a(r)}let T,x=null,V;function pt(t){T=new l(t.x-o.x,t.y-o.y),x=r.getLowestNode(T),x!==r.sheet&&x!==null?V=!0:V=!1}function mt(t){if(V){const e=new l(t.x-T.x,t.y-T.y);if(a(r),x instanceof u){const n=G(x,e)?E():g();re(x,n,e)}else if(x instanceof c){const n=b(x,e),i=r.canInsert(n)?E():g();m(n,i,!0)}}}function Mt(t){if(V){const e=new l(t.x-T.x,t.y-T.y);if(x instanceof u)G(x,e)&&se(x,e);else if(x instanceof c){const n=b(x,e);r.canInsert(n)&&r.insert(n)}}a(r),V=!1}function Et(){V=!1,a(r)}let he,w=null,W;function bt(t){he=new l(t.x-o.x,t.y-o.y),w=r.getLowestNode(he),w!==r.sheet&&w!==null&&(W=!0,w instanceof c?m(w,g(),!0):$(w,g()))}function Ct(t){const e=new l(t.x-o.x,t.y-o.y),n=r.getLowestNode(e);w!==null&&w!==n&&(W=!0,a(r),n===r.sheet||n===null?(w=null,W=!1):(w=n,w instanceof c?m(w,g(),!0):$(w,g())))}function kt(t){const e=new l(t.x-o.x,t.y-o.y);if(W){const n=r.getLowestParent(e);if(n!==null&&n.remove(e),w instanceof u&&w.children.length!==0)for(let i=0;i<w.children.length;i++)r.insert(w.children[i])}a(r),w=null,W=!1}function It(){w=null,W=!1}let de,M=null,j;function Pt(t){de=new l(t.x-o.x,t.y-o.y),M=r.getLowestNode(de),M!==r.sheet&&M!==null&&(j=!0,oe(M,g()))}function Lt(t){const e=new l(t.x-o.x,t.y-o.y),n=r.getLowestNode(e);M!==null&&M!==r.getLowestNode(e)&&(j=!0,a(r),n===r.sheet||n===null?(M=null,j=!1):(M=n,oe(M,g())))}function St(t){const e=new l(t.x-o.x,t.y-o.y);if(j){const n=r.getLowestParent(e);n!==null&&n.remove(e),a(r)}M=null,j=!1}function Bt(){M=null,j=!1}function oe(t,e){if(t instanceof c)m(t,e,!0);else if(t instanceof u){$(t,e);for(let n=0;n<t.children.length;n++)oe(t.children[n],e)}}const k=document.getElementById("canvas");k.width=window.innerWidth;k.height=window.innerHeight;const Ae=k.getContext("2d");if(Ae===null)throw Error("2d rendering context not supported");const vt=Ae;vt.font="35pt arial";const we=document.getElementById("cutTools"),ye=document.getElementById("atomTools");window.addEventListener("keydown",$t);k.addEventListener("mousedown",Ht);k.addEventListener("mousemove",Rt);k.addEventListener("mouseup",Xt);k.addEventListener("mouseout",Ft);k.addEventListener("mouseenter",Yt);let D,le=!1,ce=!0,r=new ne;window.atomMode=0;window.cutMode=1;window.dragMode=2;window.saveMode=De;window.loadMode=Dt;window.moveSingleMode=3;window.moveMultiMode=4;window.copySingleMode=5;window.copyMultiMode=6;window.deleteSingleMode=7;window.deleteMultiMode=8;window.setMode=At;window.setHighlight=Ot;function Ot(t,e){const n=document.getElementById(e);switch(t){case"mousedown":n==null||n.classList.remove("no-highlight");break;case"mouseleave":n==null||n.classList.add("no-highlight");break}}const ge=document.querySelectorAll(".modeButton");ge.forEach(t=>{t.addEventListener("click",()=>{t.classList.toggle("modeButtonPressed"),ge.forEach(e=>{e!==t&&e.classList.remove("modeButtonPressed")})})});function At(t){switch(D=t,we.style.display="none",ye.style.display="none",D){case 0:ye.style.display="block";break;case 1:we.style.display="block";break}}async function De(){if("showSaveFilePicker"in window){const t=await window.showSaveFilePicker({excludeAcceptAllOption:!0,suggestedName:"AEG Tree",startIn:"downloads",types:[{description:"JSON Files",accept:{"text/json":[".json"]}}]});rt(t,r)}else{const t=document.createElement("a");t.href=JSON.stringify(r,null,"	"),t.download="AEGTree.json",t.click()}}async function Dt(){const[t]=await window.showOpenFilePicker({excludeAcceptAllOption:!0,multiple:!1,startIn:"downloads",types:[{description:"JSON Files",accept:{"text/json":[".json"]}}]}),e=await t.getFile(),n=new FileReader;n.addEventListener("load",()=>{const i=n.result,s=st(i);s instanceof ne&&(r=s,a(r))}),n.readAsText(e)}function $t(t){if(t.ctrlKey&&t.key==="s")t.preventDefault(),De();else switch(D){case 0:_e(t);break}}function Ht(t){switch(D){case 1:Ne(t);break;case 0:et(t);break;case 2:We(t);break;case 3:ot(t);break;case 4:ut(t);break;case 5:wt(t);break;case 6:pt(t);break;case 7:bt(t);break;case 8:Pt(t);break}le=!0}function Rt(t){if(le&&ce)switch(D){case 1:Je(t);break;case 0:tt(t);break;case 2:je(t);break;case 3:lt(t);break;case 4:ft(t);break;case 5:yt(t);break;case 6:mt(t);break;case 7:Ct(t);break;case 8:Lt(t);break}}function Xt(t){switch(D){case 1:qe(t);break;case 0:nt(t);break;case 3:ct(t);break;case 4:ht(t);break;case 5:gt(t);break;case 6:Mt(t);break;case 7:kt(t);break;case 8:St(t);break}le=!1}function Ft(){switch(D){case 1:Ke();break;case 0:it();break;case 2:Ue();break;case 3:at();break;case 4:dt();break;case 5:xt();break;case 6:Et();break;case 7:It();break;case 8:Bt();break}ce=!1}function Yt(){ce=!0}function Tt(){k.width=window.innerWidth,k.height=window.innerHeight}window.onresize=Tt;

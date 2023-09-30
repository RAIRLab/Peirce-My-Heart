(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))s(r);new MutationObserver(r=>{for(const l of r)if(l.type==="childList")for(const a of l.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&s(a)}).observe(document,{childList:!0,subtree:!0});function t(r){const l={};return r.integrity&&(l.integrity=r.integrity),r.referrerPolicy&&(l.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?l.credentials="include":r.crossOrigin==="anonymous"?l.credentials="omit":l.credentials="same-origin",l}function s(r){if(r.ep)return;r.ep=!0;const l=t(r);fetch(r.href,l)}})();class d{constructor(e,t){this.x=e??0,this.y=t??0}toString(){return"X: "+this.x+", Y: "+this.y}}class x{constructor(e,t,s){this.startVertex=e??new d,this.width=t??0,this.height=s??0}toString(){return`A rectangle with
Top Left Vertex at: `+this.startVertex.toString()+`, 
Width of: `+this.width+`, 
Height of: `+this.height}getCorners(){const e=[this.startVertex];return e.push(new d(this.startVertex.x+this.width,this.startVertex.y)),e.push(new d(this.startVertex.x+this.width,this.startVertex.y+this.height)),e.push(new d(this.startVertex.x,this.startVertex.y+this.height)),e}containsPoint(e){const t=this.getCorners();return t[0].x<=e.x&&t[1].x>=e.x&&t[1].y<=e.y&&t[2].y>=e.y}overlaps(e){if(e instanceof x){const t=this.getCorners(),s=e.getCorners();for(let r=0;r<4;r++)if(this.containsPoint(s[r])||e.containsPoint(t[r]))return!0;return!1}else return!1}containsShape(e){if(e instanceof x){const t=e.getCorners();return this.containsPoint(t[0])&&this.containsPoint(t[2])}else return!0}}class u{constructor(e,t,s){this.rect=s??new x,this.identifier=e,this.origin=t}toString(){return"An atom representing the proposition: "+this.identifier+` and 
Boundary box of: 
`+this.rect.toString}containsPoint(e){return this.rect.containsPoint(e)}containsNode(e){return e instanceof u?this.rect.containsShape(e.rect):this.rect.containsShape(e.ellipse)}}class M{constructor(e,t,s){this.center=e??new d,this.radiusX=t??0,this.radiusY=s??0;const r=new d(this.center.x-this.radiusX,this.center.y-this.radiusY);this.boundingBox=new x(r,this.radiusX*2,this.radiusY*2)}toString(){return`An ellipse with
Center at: `+this.center.toString+`, 
Horizontal Radius of: `+this.radiusX+`, 
Vertical Radius of: `+this.radiusY}containsPoint(e){return!1}overlaps(e){return!1}containsShape(e){return!1}}class h{constructor(e,t){this.ellipse=e??new M,this.children=t??[]}getCurrentCut(e){for(let t=0;t<this.children.length;t++)if(this.children[t]instanceof h&&this.children[t].containsNode(e))return this.getCurrentCut(this.children[t]);return this}toString(){let e;return this.ellipse===null?e="Sheet of Assertion of the AEG Tree":e=`A cut node with boundary box of 
`+this.ellipse.toString(),this.children.length>0&&(e+=`, 
With nested nodes: `+this.children.toString()),e}containsPoint(e){return this.ellipse===null?!0:this.ellipse.containsPoint(e)}containsNode(e){return this.ellipse===null?!0:e instanceof u?this.ellipse.containsShape(e.rect):this.ellipse.containsShape(e.ellipse)}verifyCut(){let e=!0;for(let t=0;t<this.children.length;t++){if(!e)return!1;this.ellipse===null&&this.children[t]instanceof h&&(e=this.children[t].verifyCut()),e=this.containsNode(this.children[t]),e&&this.children[t]instanceof h&&(e=this.children[t].verifyCut())}return e}remove(e){if(this.containsPoint(e)){let t=!0;for(let s=0;s<this.children.length;s++)if(this.children[s].containsPoint(e))return t=!1,this.children[s]instanceof h?this.children[s].remove(e):(this.children=this.children.splice(s,1),!0);if(t)return!0}return!1}}class W{constructor(e){this.sheet=e??new h,this.sheet.ellipse=null}verifyAEG(){return this.sheet.verifyCut()}canInsert(e){const t=this.sheet.getCurrentCut(e);for(let s=0;s<t.children.length;s++)if(this.overlaps(e,t.children[s]))return!1;return!0}insert(e){if(!this.canInsert(e))throw new Error("Insertion failed. "+e+" had a collision.");const t=this.sheet.getCurrentCut(e),s=t.children;if(t.children.push(e),e instanceof h)for(let r=0;r<s.length;r++)e.containsNode(s[r])&&(e.children.push(s[r]),t.children=t.children.splice(r,1))}remove(e){this.sheet.remove(e)}overlaps(e,t){let s,r;return e instanceof u?t instanceof u?e.rect.overlaps(t.rect):(s=t.ellipse,e.rect.overlaps(s)):t instanceof u?(s=e.ellipse,s.overlaps(t.rect)):(s=e.ellipse,r=t.ellipse,s.overlaps(r))}}const i=document.getElementById("canvas"),B=i.getContext("2d"),q=document.getElementById("showRect"),U=document.getElementById("mode");if(B===null)throw Error("2d rendering context not supported");const c=B;let R,g;function z(n,e){const t=n.x-e.x,s=n.y-e.y;return Math.sqrt(t*t+s*s)}function D(n,e){const t={x:(e.x-n.x)/2+n.x,y:(e.y-n.y)/2+n.y},s=n.x-e.x,r=n.y-e.y,l=Math.abs(s),a=Math.abs(r);let y,E;if(U.value==="circumscribed"){const Y=Math.floor(z(t,e));y=Math.floor(Y*(a/l)),E=Math.floor(Y*(l/a))}else E=l/2,y=a/2;return q.checked&&(c.beginPath(),c.rect(n.x,n.y,-s,-r),c.stroke()),c.beginPath(),c.ellipse(t.x,t.y,y,E,Math.PI/2,0,2*Math.PI),c.stroke(),g=new M(t,y,E),g}function F(){i.addEventListener("mousedown",$)}function $(n){R={x:n.clientX,y:n.clientY},i.addEventListener("mousemove",S),i.addEventListener("mouseup",A),i.addEventListener("mouseout",b)}function S(n){const e={x:n.clientX,y:n.clientY};c.clearRect(0,0,i.width,i.height),w(f.sheet),g=D(R,e)}function A(){const n=new h(g);f.canInsert(n)&&f.insert(n),i.removeEventListener("mousemove",S),i.removeEventListener("mouseup",A),i.removeEventListener("mouseout",b)}function b(){i.removeEventListener("mousemove",S),i.removeEventListener("mouseup",A),i.removeEventListener("mouseout",b),c.clearRect(0,0,i.width,i.height),w(f.sheet)}function K(){i.removeEventListener("mousedown",$)}const o=document.getElementById("canvas"),T=o.getContext("2d");if(T===null)throw Error("2d rendering context not supported");const p=T;let v,L;function j(){window.addEventListener("keydown",k)}function k(n){L=n.key,o.addEventListener("mousedown",G)}function G(n){const e={x:n.clientX,y:n.clientY};v=e,p.fillText(L,e.x,e.y),p.stroke(),o.addEventListener("mousemove",I),o.addEventListener("mouseup",V),o.addEventListener("mouseout",O)}function I(n){v={x:n.clientX,y:n.clientY},p.clearRect(0,0,o.width,o.height),w(f.sheet),p.fillText(L,v.x,v.y),p.stroke()}function V(){const n=new u(L,v);f.insert(n),o.removeEventListener("mousemove",I),o.removeEventListener("mouseup",V),o.removeEventListener("mouseOut",O)}function O(){o.removeEventListener("mousemove",I),o.removeEventListener("mouseup",V),o.removeEventListener("mouseOut",O),p.clearRect(0,0,o.width,o.height),w(f.sheet)}function J(){o.removeEventListener("mousedown",G),window.removeEventListener("keydown",k)}const X=document.getElementById("canvas");X.width=window.innerWidth;X.height=window.innerHeight;const H=X.getContext("2d");if(H===null)throw Error("2d rendering context not supported");const m=H;m.font="35pt arial";let C=!1,P=!1;const f=new W;window.atomMode=Z;window.ellipseMode=Q;function Q(){C=!0,F(),P&&(J(),P=!1)}function Z(){P=!0,j(),C&&(K(),C=!1)}function w(n){for(let e=0;n.children.length>e;e++)n.children[e]instanceof u?_(n.children[e]):w(n.children[e]);n.ellipse instanceof M&&(m.beginPath(),m.ellipse(n.ellipse.center.x,n.ellipse.center.y,n.ellipse.radiusX,n.ellipse.radiusY,Math.PI/2,0,2*Math.PI),m.stroke())}function _(n){m.fillText(n.identifier,n.origin.x,n.origin.y),m.stroke()}

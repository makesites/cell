!function(e,t,r){"function"==typeof define?define(t):"undefined"!=typeof module&&module.exports?module.exports=t():r[e]=t()}("IDBStore",function(){"use strict";var e=function(e){throw e},t={storeName:"Store",storePrefix:"IDBWrapper-",dbVersion:1,keyPath:"id",autoIncrement:!0,onStoreReady:function(){},onError:e,indexes:[]},r=function(e,r){"undefined"==typeof r&&"function"==typeof e&&(r=e),"[object Object]"!=Object.prototype.toString.call(e)&&(e={});for(var n in t)this[n]="undefined"!=typeof e[n]?e[n]:t[n];this.dbName=this.storePrefix+this.storeName,this.dbVersion=parseInt(this.dbVersion,10)||1,r&&(this.onStoreReady=r);var o="object"==typeof window?window:self;this.idb=o.indexedDB||o.webkitIndexedDB||o.mozIndexedDB,this.keyRange=o.IDBKeyRange||o.webkitIDBKeyRange||o.mozIDBKeyRange,this.features={hasAutoIncrement:!o.mozIndexedDB},this.consts={READ_ONLY:"readonly",READ_WRITE:"readwrite",VERSION_CHANGE:"versionchange",NEXT:"next",NEXT_NO_DUPLICATE:"nextunique",PREV:"prev",PREV_NO_DUPLICATE:"prevunique"},this.openDB()};r.prototype={constructor:r,version:"1.4.1",db:null,dbName:null,dbVersion:null,store:null,storeName:null,keyPath:null,autoIncrement:null,indexes:null,features:null,onStoreReady:null,onError:null,_insertIdCount:0,openDB:function(){var e=this.idb.open(this.dbName,this.dbVersion),t=!1;e.onerror=function(e){var t=!1;"error"in e.target?t="VersionError"==e.target.error.name:"errorCode"in e.target&&(t=12==e.target.errorCode),this.onError(t?new Error("The version number provided is lower than the existing one."):e)}.bind(this),e.onsuccess=function(e){if(!t){if(this.db)return void this.onStoreReady();if(this.db=e.target.result,"string"==typeof this.db.version)return void this.onError(new Error("The IndexedDB implementation in this browser is outdated. Please upgrade your browser."));if(!this.db.objectStoreNames.contains(this.storeName))return void this.onError(new Error("Something is wrong with the IndexedDB implementation in this browser. Please upgrade your browser."));var r=this.db.transaction([this.storeName],this.consts.READ_ONLY);this.store=r.objectStore(this.storeName);var n=Array.prototype.slice.call(this.getIndexList());this.indexes.forEach(function(e){var r=e.name;if(!r)return t=!0,void this.onError(new Error("Cannot create index: No index name given."));if(this.normalizeIndexData(e),this.hasIndex(r)){var o=this.store.index(r),i=this.indexComplies(o,e);i||(t=!0,this.onError(new Error('Cannot modify index "'+r+'" for current version. Please bump version number to '+(this.dbVersion+1)+"."))),n.splice(n.indexOf(r),1)}else t=!0,this.onError(new Error('Cannot create new index "'+r+'" for current version. Please bump version number to '+(this.dbVersion+1)+"."))},this),n.length&&(t=!0,this.onError(new Error('Cannot delete index(es) "'+n.toString()+'" for current version. Please bump version number to '+(this.dbVersion+1)+"."))),t||this.onStoreReady()}}.bind(this),e.onupgradeneeded=function(e){if(this.db=e.target.result,this.db.objectStoreNames.contains(this.storeName))this.store=e.target.transaction.objectStore(this.storeName);else{var r={autoIncrement:this.autoIncrement};null!==this.keyPath&&(r.keyPath=this.keyPath),this.store=this.db.createObjectStore(this.storeName,r)}var n=Array.prototype.slice.call(this.getIndexList());this.indexes.forEach(function(e){var r=e.name;if(r||(t=!0,this.onError(new Error("Cannot create index: No index name given."))),this.normalizeIndexData(e),this.hasIndex(r)){var o=this.store.index(r),i=this.indexComplies(o,e);i||(this.store.deleteIndex(r),this.store.createIndex(r,e.keyPath,{unique:e.unique,multiEntry:e.multiEntry})),n.splice(n.indexOf(r),1)}else this.store.createIndex(r,e.keyPath,{unique:e.unique,multiEntry:e.multiEntry})},this),n.length&&n.forEach(function(e){this.store.deleteIndex(e)},this)}.bind(this)},deleteDatabase:function(){this.idb.deleteDatabase&&this.idb.deleteDatabase(this.dbName)},put:function(t,r,o,i){null!==this.keyPath&&(i=o,o=r,r=t),i||(i=e),o||(o=n);var s,u=!1,a=null,c=this.db.transaction([this.storeName],this.consts.READ_WRITE);return c.oncomplete=function(){var e=u?o:i;e(a)},c.onabort=i,c.onerror=i,null!==this.keyPath?(this._addIdPropertyIfNeeded(r),s=c.objectStore(this.storeName).put(r)):s=c.objectStore(this.storeName).put(r,t),s.onsuccess=function(e){u=!0,a=e.target.result},s.onerror=i,c},get:function(t,r,o){o||(o=e),r||(r=n);var i=!1,s=null,u=this.db.transaction([this.storeName],this.consts.READ_ONLY);u.oncomplete=function(){var e=i?r:o;e(s)},u.onabort=o,u.onerror=o;var a=u.objectStore(this.storeName).get(t);return a.onsuccess=function(e){i=!0,s=e.target.result},a.onerror=o,u},remove:function(t,r,o){o||(o=e),r||(r=n);var i=!1,s=null,u=this.db.transaction([this.storeName],this.consts.READ_WRITE);u.oncomplete=function(){var e=i?r:o;e(s)},u.onabort=o,u.onerror=o;var a=u.objectStore(this.storeName)["delete"](t);return a.onsuccess=function(e){i=!0,s=e.target.result},a.onerror=o,u},batch:function(t,r,o){o||(o=e),r||(r=n),"[object Array]"!=Object.prototype.toString.call(t)&&o(new Error("dataArray argument must be of type Array."));var i=this.db.transaction([this.storeName],this.consts.READ_WRITE);i.oncomplete=function(){var e=a?r:o;e(a)},i.onabort=o,i.onerror=o;var s=t.length,u=!1,a=!1,c=function(){s--,0!==s||u||(u=!0,a=!0)};return t.forEach(function(e){var t=e.type,r=e.key,n=e.value,s=function(e){i.abort(),u||(u=!0,o(e,t,r))};if("remove"==t){var a=i.objectStore(this.storeName)["delete"](r);a.onsuccess=c,a.onerror=s}else if("put"==t){var l;null!==this.keyPath?(this._addIdPropertyIfNeeded(n),l=i.objectStore(this.storeName).put(n)):l=i.objectStore(this.storeName).put(n,r),l.onsuccess=c,l.onerror=s}},this),i},putBatch:function(e,t,r){var n=e.map(function(e){return{type:"put",value:e}});return this.batch(n,t,r)},removeBatch:function(e,t,r){var n=e.map(function(e){return{type:"remove",key:e}});return this.batch(n,t,r)},getBatch:function(t,r,o,i){o||(o=e),r||(r=n),i||(i="sparse"),"[object Array]"!=Object.prototype.toString.call(t)&&o(new Error("keyArray argument must be of type Array."));var s=this.db.transaction([this.storeName],this.consts.READ_ONLY);s.oncomplete=function(){var e=l?r:o;e(d)},s.onabort=o,s.onerror=o;var u=[],a=t.length,c=!1,l=!1,d=null,h=function(e){e.target.result||"dense"==i?u.push(e.target.result):"sparse"==i&&u.length++,a--,0===a&&(c=!0,l=!0,d=u)};return t.forEach(function(e){var t=function(e){c=!0,d=e,o(e),s.abort()},r=s.objectStore(this.storeName).get(e);r.onsuccess=h,r.onerror=t},this),s},getAll:function(t,r){r||(r=e),t||(t=n);var o=this.db.transaction([this.storeName],this.consts.READ_ONLY),i=o.objectStore(this.storeName);return i.getAll?this._getAllNative(o,i,t,r):this._getAllCursor(o,i,t,r),o},_getAllNative:function(e,t,r,n){var o=!1,i=null;e.oncomplete=function(){var e=o?r:n;e(i)},e.onabort=n,e.onerror=n;var s=t.getAll();s.onsuccess=function(e){o=!0,i=e.target.result},s.onerror=n},_getAllCursor:function(e,t,r,n){var o=[],i=!1,s=null;e.oncomplete=function(){var e=i?r:n;e(s)},e.onabort=n,e.onerror=n;var u=t.openCursor();u.onsuccess=function(e){var t=e.target.result;t?(o.push(t.value),t["continue"]()):(i=!0,s=o)},u.onError=n},clear:function(t,r){r||(r=e),t||(t=n);var o=!1,i=null,s=this.db.transaction([this.storeName],this.consts.READ_WRITE);s.oncomplete=function(){var e=o?t:r;e(i)},s.onabort=r,s.onerror=r;var u=s.objectStore(this.storeName).clear();return u.onsuccess=function(e){o=!0,i=e.target.result},u.onerror=r,s},_addIdPropertyIfNeeded:function(e){this.features.hasAutoIncrement||"undefined"!=typeof e[this.keyPath]||(e[this.keyPath]=this._insertIdCount++ +Date.now())},getIndexList:function(){return this.store.indexNames},hasIndex:function(e){return this.store.indexNames.contains(e)},normalizeIndexData:function(e){e.keyPath=e.keyPath||e.name,e.unique=!!e.unique,e.multiEntry=!!e.multiEntry},indexComplies:function(e,t){var r=["keyPath","unique","multiEntry"].every(function(r){if("multiEntry"==r&&void 0===e[r]&&t[r]===!1)return!0;if("keyPath"==r&&"[object Array]"==Object.prototype.toString.call(t[r])){var n=t.keyPath,o=e.keyPath;if("string"==typeof o)return n.toString()==o;if("function"!=typeof o.contains&&"function"!=typeof o.indexOf)return!1;if(o.length!==n.length)return!1;for(var i=0,s=n.length;s>i;i++)if(!(o.contains&&o.contains(n[i])||o.indexOf(-1!==n[i])))return!1;return!0}return t[r]==e[r]});return r},iterate:function(t,r){r=i({index:null,order:"ASC",autoContinue:!0,filterDuplicates:!1,keyRange:null,writeAccess:!1,onEnd:null,onError:e},r||{});var n="desc"==r.order.toLowerCase()?"PREV":"NEXT";r.filterDuplicates&&(n+="_NO_DUPLICATE");var o=!1,s=this.db.transaction([this.storeName],this.consts[r.writeAccess?"READ_WRITE":"READ_ONLY"]),u=s.objectStore(this.storeName);r.index&&(u=u.index(r.index)),s.oncomplete=function(){return o?void(r.onEnd?r.onEnd():t(null)):void r.onError(null)},s.onabort=r.onError,s.onerror=r.onError;var a=u.openCursor(r.keyRange,this.consts[n]);return a.onerror=r.onError,a.onsuccess=function(e){var n=e.target.result;n?(t(n.value,n,s),r.autoContinue&&n["continue"]()):o=!0},s},query:function(e,t){var r=[];return t=t||{},t.onEnd=function(){e(r)},this.iterate(function(e){r.push(e)},t)},count:function(t,r){r=i({index:null,keyRange:null},r||{});var n=r.onError||e,o=!1,s=null,u=this.db.transaction([this.storeName],this.consts.READ_ONLY);u.oncomplete=function(){var e=o?t:n;e(s)},u.onabort=n,u.onerror=n;var a=u.objectStore(this.storeName);r.index&&(a=a.index(r.index));var c=a.count(r.keyRange);return c.onsuccess=function(e){o=!0,s=e.target.result},c.onError=n,u},makeKeyRange:function(e){var t,r="undefined"!=typeof e.lower,n="undefined"!=typeof e.upper,o="undefined"!=typeof e.only;switch(!0){case o:t=this.keyRange.only(e.only);break;case r&&n:t=this.keyRange.bound(e.lower,e.upper,e.excludeLower,e.excludeUpper);break;case r:t=this.keyRange.lowerBound(e.lower,e.excludeLower);break;case n:t=this.keyRange.upperBound(e.upper,e.excludeUpper);break;default:throw new Error('Cannot create KeyRange. Provide one or both of "lower" or "upper" value, or an "only" value.')}return t}};var n=function(){},o={},i=function(e,t){var r,n;for(r in t)n=t[r],n!==o[r]&&n!==e[r]&&(e[r]=n);return e};return r.version=r.prototype.version,r},this),function(){var e,t,r,n,o,i=function(e,t){return function(){return e.apply(t,arguments)}};e=function(){function e(e){this.path=e,this.loaded=i(this.loaded,this),this.ready=i(this.ready,this),this.setup()}return e.prototype.ready=function(e){return this.isReady?e():this.onReady=e},e.prototype.loaded=function(){return this.isReady=!0,"function"==typeof this.onReady&&this.onReady(),this.onReady=null},e}(),("undefined"!=typeof process&&null!==process&&null!=(o=process.versions)?o.node:void 0)?(t=require("leveldb"),e.prototype.setup=function(e){var r=this;return t.open(this.path,{create_if_missing:!0},function(t,n){if(t)throw t;return r.store=n,r.loaded(),"function"==typeof e?e():void 0})},e.prototype.get=function(e,t){return this.store.get(e,t)},e.prototype.put=function(e,t,r){return this.store.put(e,t.toString(),r)},e.prototype.del=function(e,t){return this.store.del(e,t)},e.prototype.getAll=function(e){return this.store.iterator(function(t,r){var n;return t?e(t):(n={},r.forRange(function(t,r,o){return t?e(t):n[r]=o},function(){return e(null,n)}))})},e.prototype.clear=function(e){var r=this;return t.destroy(this.path,{},function(){return r.setup(e)})}):(e.prototype.setup=function(){return this.store=new IDBStore({keyPath:"id",autoIncrement:!1,onStoreReady:this.loaded})},n=function(e){return function(t){return e(null,t)}},r=function(e){return function(t){return e(t,null)}},e.prototype.get=function(e,t){return this.store.get(e,function(e){return t(null,null!=e?e.val:void 0)},r(t))},e.prototype.put=function(e,t,o){var i;return i={id:e,val:t},this.store.put(i,n(o),r(o))},e.prototype.del=function(e,t){return this.store.remove(e,n(t),r(t))},e.prototype.getAll=function(e){return this.store.getAll(function(t){var r,n,o,i;for(r={},o=0,i=t.length;i>o;o++)n=t[o],r[n.id]=n.val;return e(null,r)},r(e))},e.prototype.clear=function(e){return this.store.clear(function(t){return e(null,t)})}),null!=("undefined"!=typeof module&&null!==module?module.exports:void 0)?module.exports=e:window.ILDB=e}.call(this),function(e){"function"==typeof define&&define.amd?define("cell",[],e):"object"==typeof exports?module.exports=e(require("ildb")):e(window.ILDB)}(function(){var e=function(){};return e});
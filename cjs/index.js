var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// lib/index.ts
__export(exports, {
  throttleUrl: () => throttleUrl,
  throttleUrlCache: () => throttleUrlCache
});

// node_modules/nanoid/index.js
var import_crypto = __toModule(require("crypto"));

// node_modules/nanoid/url-alphabet/index.js
var urlAlphabet = "ModuleSymbhasOwnPr-0123456789ABCDEFGHNRVfgctiUvz_KqYTJkLxpZXIjQW";

// node_modules/nanoid/index.js
var POOL_SIZE_MULTIPLIER = 32;
var pool;
var poolOffset;
var random = (bytes) => {
  if (!pool || pool.length < bytes) {
    pool = Buffer.allocUnsafe(bytes * POOL_SIZE_MULTIPLIER);
    import_crypto.default.randomFillSync(pool);
    poolOffset = 0;
  } else if (poolOffset + bytes > pool.length) {
    import_crypto.default.randomFillSync(pool);
    poolOffset = 0;
  }
  let res = pool.subarray(poolOffset, poolOffset + bytes);
  poolOffset += bytes;
  return res;
};
var nanoid = (size = 21) => {
  let bytes = random(size);
  let id = "";
  while (size--) {
    id += urlAlphabet[bytes[size] & 63];
  }
  return id;
};

// lib/index.ts
var throttleUrlCache = {};
var throttleUrl = (_0) => __async(void 0, [_0], function* ({
  url,
  max,
  onMax,
  timeout,
  redisConfig
}) {
  const getRdsKey = (url2) => {
    const key = redisConfig.preKey;
    return `${key}_${url2}`;
  };
  const urlKey = getRdsKey(url);
  let count = yield redisConfig.incr(urlKey);
  redisConfig.expire(urlKey, 60);
  if (!throttleUrlCache[url]) {
    throttleUrlCache[url] = new Set();
  }
  const box = throttleUrlCache[url];
  const id = nanoid();
  box.add(id);
  const removeId = () => __async(void 0, null, function* () {
    if (box.has(id)) {
      box.delete(id);
      const afterRemoveCount = yield redisConfig.decr(urlKey);
    }
  });
  setTimeout(() => {
    removeId();
  }, timeout);
  const size = count;
  if (size > max) {
    onMax(size);
    return removeId;
  }
  return removeId;
});
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  throttleUrl,
  throttleUrlCache
});
//# sourceMappingURL=index.js.map

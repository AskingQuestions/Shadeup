(function (global, factory) {
  typeof exports === "object" && typeof module !== "undefined"
    ? factory(exports)
    : typeof define === "function" && define.amd
    ? define(["exports"], factory)
    : ((global =
        typeof globalThis !== "undefined" ? globalThis : global || self),
      factory((global.ShadeupEngine = {})));
})(this, function (exports) {
  "use strict";

  class GenericShader {
    uniqueSourceKey = "";
    code;
    type;
    payload;
    parent = null;
    constructor(code, type) {
      this.code = code;
      this.type = type;
    }
  }
  class UniformValue {
    valueType;
    value;
    constructor(valueType, value) {
      this.valueType = valueType;
      this.value = value;
    }
  }
  function makePrimitiveUniform(type, value) {
    return new UniformValue(type, value);
  }
  class UniformPayload {
    uniforms = /* @__PURE__ */ new Map();
  }
  class ShaderDispatch {
    type;
    drawType = "screen";
    vertexUniforms;
    fragmentUniforms;
    depthOnly = false;
    backfaceCulling = true;
    reverseZ = false;
    depthCompare = "auto";
    attachments = null;
    vertexShader = null;
    fragmentShader = null;
    computeShader = null;
    geometry = null;
    indexBuffer = null;
    drawCount = 0;
    instanceCount = 1;
    indirectBuffer = null;
    indirectOffset = 0;
    overrideDepth = null;
    computeCount = [0, 0, 0];
    constructor(type) {
      this.type = type;
      this.vertexUniforms = new UniformPayload();
      this.fragmentUniforms = new UniformPayload();
    }
    setVertexUniform(name, value) {
      this.vertexUniforms.uniforms.set(name, value);
    }
    setFragmentUniform(name, value) {
      this.fragmentUniforms.uniforms.set(name, value);
    }
    setVertexShader(shader) {
      this.vertexShader = shader;
    }
    setFragmentShader(shader) {
      this.fragmentShader = shader;
    }
    setComputeShader(shader) {
      this.computeShader = shader;
    }
    setGeometry(geometry) {
      this.geometry = geometry;
    }
    setIndexBuffer(indexBuffer) {
      this.indexBuffer = indexBuffer;
    }
  }
  class GraphicsAdapter {
    canvas;
    contextMode = "draw";
    listeners = /* @__PURE__ */ new Map();
    viewportSize = [0, 0];
    constructor(cnvs) {
      this.canvas = cnvs;
    }
    clear(immediate = false, color = "auto") {}
    draw() {}
    init() {}
    addEventListener(name, callback) {
      let listeners = this.listeners.get(name);
      if (!listeners) {
        listeners = [];
        this.listeners.set(name, listeners);
      }
      listeners.push(callback);
    }
    removeEventListener(name, callback) {
      const listeners = this.listeners.get(name);
      if (!listeners) return;
      const index = listeners.indexOf(callback);
      if (index === -1) return;
      listeners.splice(index, 1);
    }
    triggerEvent(name, ...args) {
      const listeners = this.listeners.get(name);
      if (!listeners) return;
      for (const listener of listeners) {
        listener(...args);
      }
    }
    dispatch(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      this.activateDrawContext();
    }
    activateDrawContext() {
      if (this.contextMode === "paint") {
        this.switchContext("draw");
      }
    }
    activatePaintContext() {
      if (this.contextMode === "draw") {
        this.switchContext("paint");
        this.flush();
      }
    }
    switchContext(mode) {
      this.contextMode = mode;
      this.triggerEvent("context", mode);
    }
    drawImage(image, x, y, width, height) {}
    async downloadImage() {
      return new Float32Array(0);
    }
    uploadImage(data) {}
    setViewport(width, height) {
      this.viewportSize = [width, height];
    }
    getOrCreateShader(instance, type, config) {
      return new GenericShader("", "vertex");
    }
    createShader(code, type) {
      return new GenericShader("", "vertex");
    }
    unbindTexture(texture) {}
    dispose() {}
    flush() {
      this.triggerEvent("flush");
    }
    waitForDraw() {
      return Promise.resolve();
    }
  }

  /**
   * @module LRUCache
   */
  const perf =
    typeof performance === "object" &&
    performance &&
    typeof performance.now === "function"
      ? performance
      : Date;
  const warned = new Set();
  /* c8 ignore start */
  const PROCESS = typeof process === "object" && !!process ? process : {};
  /* c8 ignore start */
  const emitWarning = (msg, type, code, fn) => {
    typeof PROCESS.emitWarning === "function"
      ? PROCESS.emitWarning(msg, type, code, fn)
      : console.error(`[${code}] ${type}: ${msg}`);
  };
  let AC = globalThis.AbortController;
  let AS = globalThis.AbortSignal;
  /* c8 ignore start */
  if (typeof AC === "undefined") {
    //@ts-ignore
    AS = class AbortSignal {
      onabort;
      _onabort = [];
      reason;
      aborted = false;
      addEventListener(_, fn) {
        this._onabort.push(fn);
      }
    };
    //@ts-ignore
    AC = class AbortController {
      constructor() {
        warnACPolyfill();
      }
      signal = new AS();
      abort(reason) {
        if (this.signal.aborted) return;
        //@ts-ignore
        this.signal.reason = reason;
        //@ts-ignore
        this.signal.aborted = true;
        //@ts-ignore
        for (const fn of this.signal._onabort) {
          fn(reason);
        }
        this.signal.onabort?.(reason);
      }
    };
    let printACPolyfillWarning =
      PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== "1";
    const warnACPolyfill = () => {
      if (!printACPolyfillWarning) return;
      printACPolyfillWarning = false;
      emitWarning(
        "AbortController is not defined. If using lru-cache in " +
          "node 14, load an AbortController polyfill from the " +
          "`node-abort-controller` package. A minimal polyfill is " +
          "provided for use by LRUCache.fetch(), but it should not be " +
          "relied upon in other contexts (eg, passing it to other APIs that " +
          "use AbortController/AbortSignal might have undesirable effects). " +
          "You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.",
        "NO_ABORT_CONTROLLER",
        "ENOTSUP",
        warnACPolyfill
      );
    };
  }
  /* c8 ignore stop */
  const shouldWarn = (code) => !warned.has(code);
  const isPosInt = (n) => n && n === Math.floor(n) && n > 0 && isFinite(n);
  /* c8 ignore start */
  // This is a little bit ridiculous, tbh.
  // The maximum array length is 2^32-1 or thereabouts on most JS impls.
  // And well before that point, you're caching the entire world, I mean,
  // that's ~32GB of just integers for the next/prev links, plus whatever
  // else to hold that many keys and values.  Just filling the memory with
  // zeroes at init time is brutal when you get that big.
  // But why not be complete?
  // Maybe in the future, these limits will have expanded.
  const getUintArray = (max) =>
    !isPosInt(max)
      ? null
      : max <= Math.pow(2, 8)
      ? Uint8Array
      : max <= Math.pow(2, 16)
      ? Uint16Array
      : max <= Math.pow(2, 32)
      ? Uint32Array
      : max <= Number.MAX_SAFE_INTEGER
      ? ZeroArray
      : null;
  /* c8 ignore stop */
  class ZeroArray extends Array {
    constructor(size) {
      super(size);
      this.fill(0);
    }
  }
  class Stack {
    heap;
    length;
    // private constructor
    static #constructing = false;
    static create(max) {
      const HeapCls = getUintArray(max);
      if (!HeapCls) return [];
      Stack.#constructing = true;
      const s = new Stack(max, HeapCls);
      Stack.#constructing = false;
      return s;
    }
    constructor(max, HeapCls) {
      /* c8 ignore start */
      if (!Stack.#constructing) {
        throw new TypeError("instantiate Stack using Stack.create(n)");
      }
      /* c8 ignore stop */
      this.heap = new HeapCls(max);
      this.length = 0;
    }
    push(n) {
      this.heap[this.length++] = n;
    }
    pop() {
      return this.heap[--this.length];
    }
  }
  /**
   * Default export, the thing you're using this module to get.
   *
   * All properties from the options object (with the exception of
   * {@link OptionsBase.max} and {@link OptionsBase.maxSize}) are added as
   * normal public members. (`max` and `maxBase` are read-only getters.)
   * Changing any of these will alter the defaults for subsequent method calls,
   * but is otherwise safe.
   */
  class LRUCache {
    // properties coming in from the options of these, only max and maxSize
    // really *need* to be protected. The rest can be modified, as they just
    // set defaults for various methods.
    #max;
    #maxSize;
    #dispose;
    #disposeAfter;
    #fetchMethod;
    /**
     * {@link LRUCache.OptionsBase.ttl}
     */
    ttl;
    /**
     * {@link LRUCache.OptionsBase.ttlResolution}
     */
    ttlResolution;
    /**
     * {@link LRUCache.OptionsBase.ttlAutopurge}
     */
    ttlAutopurge;
    /**
     * {@link LRUCache.OptionsBase.updateAgeOnGet}
     */
    updateAgeOnGet;
    /**
     * {@link LRUCache.OptionsBase.updateAgeOnHas}
     */
    updateAgeOnHas;
    /**
     * {@link LRUCache.OptionsBase.allowStale}
     */
    allowStale;
    /**
     * {@link LRUCache.OptionsBase.noDisposeOnSet}
     */
    noDisposeOnSet;
    /**
     * {@link LRUCache.OptionsBase.noUpdateTTL}
     */
    noUpdateTTL;
    /**
     * {@link LRUCache.OptionsBase.maxEntrySize}
     */
    maxEntrySize;
    /**
     * {@link LRUCache.OptionsBase.sizeCalculation}
     */
    sizeCalculation;
    /**
     * {@link LRUCache.OptionsBase.noDeleteOnFetchRejection}
     */
    noDeleteOnFetchRejection;
    /**
     * {@link LRUCache.OptionsBase.noDeleteOnStaleGet}
     */
    noDeleteOnStaleGet;
    /**
     * {@link LRUCache.OptionsBase.allowStaleOnFetchAbort}
     */
    allowStaleOnFetchAbort;
    /**
     * {@link LRUCache.OptionsBase.allowStaleOnFetchRejection}
     */
    allowStaleOnFetchRejection;
    /**
     * {@link LRUCache.OptionsBase.ignoreFetchAbort}
     */
    ignoreFetchAbort;
    // computed properties
    #size;
    #calculatedSize;
    #keyMap;
    #keyList;
    #valList;
    #next;
    #prev;
    #head;
    #tail;
    #free;
    #disposed;
    #sizes;
    #starts;
    #ttls;
    #hasDispose;
    #hasFetchMethod;
    #hasDisposeAfter;
    /**
     * Do not call this method unless you need to inspect the
     * inner workings of the cache.  If anything returned by this
     * object is modified in any way, strange breakage may occur.
     *
     * These fields are private for a reason!
     *
     * @internal
     */
    static unsafeExposeInternals(c) {
      return {
        // properties
        starts: c.#starts,
        ttls: c.#ttls,
        sizes: c.#sizes,
        keyMap: c.#keyMap,
        keyList: c.#keyList,
        valList: c.#valList,
        next: c.#next,
        prev: c.#prev,
        get head() {
          return c.#head;
        },
        get tail() {
          return c.#tail;
        },
        free: c.#free,
        // methods
        isBackgroundFetch: (p) => c.#isBackgroundFetch(p),
        backgroundFetch: (k, index, options, context) =>
          c.#backgroundFetch(k, index, options, context),
        moveToTail: (index) => c.#moveToTail(index),
        indexes: (options) => c.#indexes(options),
        rindexes: (options) => c.#rindexes(options),
        isStale: (index) => c.#isStale(index),
      };
    }
    // Protected read-only members
    /**
     * {@link LRUCache.OptionsBase.max} (read-only)
     */
    get max() {
      return this.#max;
    }
    /**
     * {@link LRUCache.OptionsBase.maxSize} (read-only)
     */
    get maxSize() {
      return this.#maxSize;
    }
    /**
     * The total computed size of items in the cache (read-only)
     */
    get calculatedSize() {
      return this.#calculatedSize;
    }
    /**
     * The number of items stored in the cache (read-only)
     */
    get size() {
      return this.#size;
    }
    /**
     * {@link LRUCache.OptionsBase.fetchMethod} (read-only)
     */
    get fetchMethod() {
      return this.#fetchMethod;
    }
    /**
     * {@link LRUCache.OptionsBase.dispose} (read-only)
     */
    get dispose() {
      return this.#dispose;
    }
    /**
     * {@link LRUCache.OptionsBase.disposeAfter} (read-only)
     */
    get disposeAfter() {
      return this.#disposeAfter;
    }
    constructor(options) {
      const {
        max = 0,
        ttl,
        ttlResolution = 1,
        ttlAutopurge,
        updateAgeOnGet,
        updateAgeOnHas,
        allowStale,
        dispose,
        disposeAfter,
        noDisposeOnSet,
        noUpdateTTL,
        maxSize = 0,
        maxEntrySize = 0,
        sizeCalculation,
        fetchMethod,
        noDeleteOnFetchRejection,
        noDeleteOnStaleGet,
        allowStaleOnFetchRejection,
        allowStaleOnFetchAbort,
        ignoreFetchAbort,
      } = options;
      if (max !== 0 && !isPosInt(max)) {
        throw new TypeError("max option must be a nonnegative integer");
      }
      const UintArray = max ? getUintArray(max) : Array;
      if (!UintArray) {
        throw new Error("invalid max value: " + max);
      }
      this.#max = max;
      this.#maxSize = maxSize;
      this.maxEntrySize = maxEntrySize || this.#maxSize;
      this.sizeCalculation = sizeCalculation;
      if (this.sizeCalculation) {
        if (!this.#maxSize && !this.maxEntrySize) {
          throw new TypeError(
            "cannot set sizeCalculation without setting maxSize or maxEntrySize"
          );
        }
        if (typeof this.sizeCalculation !== "function") {
          throw new TypeError("sizeCalculation set to non-function");
        }
      }
      if (fetchMethod !== undefined && typeof fetchMethod !== "function") {
        throw new TypeError("fetchMethod must be a function if specified");
      }
      this.#fetchMethod = fetchMethod;
      this.#hasFetchMethod = !!fetchMethod;
      this.#keyMap = new Map();
      this.#keyList = new Array(max).fill(undefined);
      this.#valList = new Array(max).fill(undefined);
      this.#next = new UintArray(max);
      this.#prev = new UintArray(max);
      this.#head = 0;
      this.#tail = 0;
      this.#free = Stack.create(max);
      this.#size = 0;
      this.#calculatedSize = 0;
      if (typeof dispose === "function") {
        this.#dispose = dispose;
      }
      if (typeof disposeAfter === "function") {
        this.#disposeAfter = disposeAfter;
        this.#disposed = [];
      } else {
        this.#disposeAfter = undefined;
        this.#disposed = undefined;
      }
      this.#hasDispose = !!this.#dispose;
      this.#hasDisposeAfter = !!this.#disposeAfter;
      this.noDisposeOnSet = !!noDisposeOnSet;
      this.noUpdateTTL = !!noUpdateTTL;
      this.noDeleteOnFetchRejection = !!noDeleteOnFetchRejection;
      this.allowStaleOnFetchRejection = !!allowStaleOnFetchRejection;
      this.allowStaleOnFetchAbort = !!allowStaleOnFetchAbort;
      this.ignoreFetchAbort = !!ignoreFetchAbort;
      // NB: maxEntrySize is set to maxSize if it's set
      if (this.maxEntrySize !== 0) {
        if (this.#maxSize !== 0) {
          if (!isPosInt(this.#maxSize)) {
            throw new TypeError(
              "maxSize must be a positive integer if specified"
            );
          }
        }
        if (!isPosInt(this.maxEntrySize)) {
          throw new TypeError(
            "maxEntrySize must be a positive integer if specified"
          );
        }
        this.#initializeSizeTracking();
      }
      this.allowStale = !!allowStale;
      this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
      this.updateAgeOnGet = !!updateAgeOnGet;
      this.updateAgeOnHas = !!updateAgeOnHas;
      this.ttlResolution =
        isPosInt(ttlResolution) || ttlResolution === 0 ? ttlResolution : 1;
      this.ttlAutopurge = !!ttlAutopurge;
      this.ttl = ttl || 0;
      if (this.ttl) {
        if (!isPosInt(this.ttl)) {
          throw new TypeError("ttl must be a positive integer if specified");
        }
        this.#initializeTTLTracking();
      }
      // do not allow completely unbounded caches
      if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) {
        throw new TypeError("At least one of max, maxSize, or ttl is required");
      }
      if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
        const code = "LRU_CACHE_UNBOUNDED";
        if (shouldWarn(code)) {
          warned.add(code);
          const msg =
            "TTL caching without ttlAutopurge, max, or maxSize can " +
            "result in unbounded memory consumption.";
          emitWarning(msg, "UnboundedCacheWarning", code, LRUCache);
        }
      }
    }
    /**
     * Return the remaining TTL time for a given entry key
     */
    getRemainingTTL(key) {
      return this.#keyMap.has(key) ? Infinity : 0;
    }
    #initializeTTLTracking() {
      const ttls = new ZeroArray(this.#max);
      const starts = new ZeroArray(this.#max);
      this.#ttls = ttls;
      this.#starts = starts;
      this.#setItemTTL = (index, ttl, start = perf.now()) => {
        starts[index] = ttl !== 0 ? start : 0;
        ttls[index] = ttl;
        if (ttl !== 0 && this.ttlAutopurge) {
          const t = setTimeout(() => {
            if (this.#isStale(index)) {
              this.delete(this.#keyList[index]);
            }
          }, ttl + 1);
          // unref() not supported on all platforms
          /* c8 ignore start */
          if (t.unref) {
            t.unref();
          }
          /* c8 ignore stop */
        }
      };
      this.#updateItemAge = (index) => {
        starts[index] = ttls[index] !== 0 ? perf.now() : 0;
      };
      this.#statusTTL = (status, index) => {
        if (ttls[index]) {
          const ttl = ttls[index];
          const start = starts[index];
          status.ttl = ttl;
          status.start = start;
          status.now = cachedNow || getNow();
          const age = status.now - start;
          status.remainingTTL = ttl - age;
        }
      };
      // debounce calls to perf.now() to 1s so we're not hitting
      // that costly call repeatedly.
      let cachedNow = 0;
      const getNow = () => {
        const n = perf.now();
        if (this.ttlResolution > 0) {
          cachedNow = n;
          const t = setTimeout(() => (cachedNow = 0), this.ttlResolution);
          // not available on all platforms
          /* c8 ignore start */
          if (t.unref) {
            t.unref();
          }
          /* c8 ignore stop */
        }
        return n;
      };
      this.getRemainingTTL = (key) => {
        const index = this.#keyMap.get(key);
        if (index === undefined) {
          return 0;
        }
        const ttl = ttls[index];
        const start = starts[index];
        if (ttl === 0 || start === 0) {
          return Infinity;
        }
        const age = (cachedNow || getNow()) - start;
        return ttl - age;
      };
      this.#isStale = (index) => {
        return (
          ttls[index] !== 0 &&
          starts[index] !== 0 &&
          (cachedNow || getNow()) - starts[index] > ttls[index]
        );
      };
    }
    // conditionally set private methods related to TTL
    #updateItemAge = () => {};
    #statusTTL = () => {};
    #setItemTTL = () => {};
    /* c8 ignore stop */
    #isStale = () => false;
    #initializeSizeTracking() {
      const sizes = new ZeroArray(this.#max);
      this.#calculatedSize = 0;
      this.#sizes = sizes;
      this.#removeItemSize = (index) => {
        this.#calculatedSize -= sizes[index];
        sizes[index] = 0;
      };
      this.#requireSize = (k, v, size, sizeCalculation) => {
        // provisionally accept background fetches.
        // actual value size will be checked when they return.
        if (this.#isBackgroundFetch(v)) {
          return 0;
        }
        if (!isPosInt(size)) {
          if (sizeCalculation) {
            if (typeof sizeCalculation !== "function") {
              throw new TypeError("sizeCalculation must be a function");
            }
            size = sizeCalculation(v, k);
            if (!isPosInt(size)) {
              throw new TypeError(
                "sizeCalculation return invalid (expect positive integer)"
              );
            }
          } else {
            throw new TypeError(
              "invalid size value (must be positive integer). " +
                "When maxSize or maxEntrySize is used, sizeCalculation " +
                "or size must be set."
            );
          }
        }
        return size;
      };
      this.#addItemSize = (index, size, status) => {
        sizes[index] = size;
        if (this.#maxSize) {
          const maxSize = this.#maxSize - sizes[index];
          while (this.#calculatedSize > maxSize) {
            this.#evict(true);
          }
        }
        this.#calculatedSize += sizes[index];
        if (status) {
          status.entrySize = size;
          status.totalCalculatedSize = this.#calculatedSize;
        }
      };
    }
    #removeItemSize = (_i) => {};
    #addItemSize = (_i, _s, _st) => {};
    #requireSize = (_k, _v, size, sizeCalculation) => {
      if (size || sizeCalculation) {
        throw new TypeError(
          "cannot set size without setting maxSize or maxEntrySize on cache"
        );
      }
      return 0;
    };
    *#indexes({ allowStale = this.allowStale } = {}) {
      if (this.#size) {
        for (let i = this.#tail; true; ) {
          if (!this.#isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.#isStale(i)) {
            yield i;
          }
          if (i === this.#head) {
            break;
          } else {
            i = this.#prev[i];
          }
        }
      }
    }
    *#rindexes({ allowStale = this.allowStale } = {}) {
      if (this.#size) {
        for (let i = this.#head; true; ) {
          if (!this.#isValidIndex(i)) {
            break;
          }
          if (allowStale || !this.#isStale(i)) {
            yield i;
          }
          if (i === this.#tail) {
            break;
          } else {
            i = this.#next[i];
          }
        }
      }
    }
    #isValidIndex(index) {
      return (
        index !== undefined && this.#keyMap.get(this.#keyList[index]) === index
      );
    }
    /**
     * Return a generator yielding `[key, value]` pairs,
     * in order from most recently used to least recently used.
     */
    *entries() {
      for (const i of this.#indexes()) {
        if (
          this.#valList[i] !== undefined &&
          this.#keyList[i] !== undefined &&
          !this.#isBackgroundFetch(this.#valList[i])
        ) {
          yield [this.#keyList[i], this.#valList[i]];
        }
      }
    }
    /**
     * Inverse order version of {@link LRUCache.entries}
     *
     * Return a generator yielding `[key, value]` pairs,
     * in order from least recently used to most recently used.
     */
    *rentries() {
      for (const i of this.#rindexes()) {
        if (
          this.#valList[i] !== undefined &&
          this.#keyList[i] !== undefined &&
          !this.#isBackgroundFetch(this.#valList[i])
        ) {
          yield [this.#keyList[i], this.#valList[i]];
        }
      }
    }
    /**
     * Return a generator yielding the keys in the cache,
     * in order from most recently used to least recently used.
     */
    *keys() {
      for (const i of this.#indexes()) {
        const k = this.#keyList[i];
        if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield k;
        }
      }
    }
    /**
     * Inverse order version of {@link LRUCache.keys}
     *
     * Return a generator yielding the keys in the cache,
     * in order from least recently used to most recently used.
     */
    *rkeys() {
      for (const i of this.#rindexes()) {
        const k = this.#keyList[i];
        if (k !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield k;
        }
      }
    }
    /**
     * Return a generator yielding the values in the cache,
     * in order from most recently used to least recently used.
     */
    *values() {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield this.#valList[i];
        }
      }
    }
    /**
     * Inverse order version of {@link LRUCache.values}
     *
     * Return a generator yielding the values in the cache,
     * in order from least recently used to most recently used.
     */
    *rvalues() {
      for (const i of this.#rindexes()) {
        const v = this.#valList[i];
        if (v !== undefined && !this.#isBackgroundFetch(this.#valList[i])) {
          yield this.#valList[i];
        }
      }
    }
    /**
     * Iterating over the cache itself yields the same results as
     * {@link LRUCache.entries}
     */
    [Symbol.iterator]() {
      return this.entries();
    }
    /**
     * Find a value for which the supplied fn method returns a truthy value,
     * similar to Array.find().  fn is called as fn(value, key, cache).
     */
    find(fn, getOptions = {}) {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined) continue;
        if (fn(value, this.#keyList[i], this)) {
          return this.get(this.#keyList[i], getOptions);
        }
      }
    }
    /**
     * Call the supplied function on each item in the cache, in order from
     * most recently used to least recently used.  fn is called as
     * fn(value, key, cache).  Does not update age or recenty of use.
     * Does not iterate over stale values.
     */
    forEach(fn, thisp = this) {
      for (const i of this.#indexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined) continue;
        fn.call(thisp, value, this.#keyList[i], this);
      }
    }
    /**
     * The same as {@link LRUCache.forEach} but items are iterated over in
     * reverse order.  (ie, less recently used items are iterated over first.)
     */
    rforEach(fn, thisp = this) {
      for (const i of this.#rindexes()) {
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined) continue;
        fn.call(thisp, value, this.#keyList[i], this);
      }
    }
    /**
     * Delete any stale entries. Returns true if anything was removed,
     * false otherwise.
     */
    purgeStale() {
      let deleted = false;
      for (const i of this.#rindexes({ allowStale: true })) {
        if (this.#isStale(i)) {
          this.delete(this.#keyList[i]);
          deleted = true;
        }
      }
      return deleted;
    }
    /**
     * Return an array of [key, {@link LRUCache.Entry}] tuples which can be
     * passed to cache.load()
     */
    dump() {
      const arr = [];
      for (const i of this.#indexes({ allowStale: true })) {
        const key = this.#keyList[i];
        const v = this.#valList[i];
        const value = this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
        if (value === undefined || key === undefined) continue;
        const entry = { value };
        if (this.#ttls && this.#starts) {
          entry.ttl = this.#ttls[i];
          // always dump the start relative to a portable timestamp
          // it's ok for this to be a bit slow, it's a rare operation.
          const age = perf.now() - this.#starts[i];
          entry.start = Math.floor(Date.now() - age);
        }
        if (this.#sizes) {
          entry.size = this.#sizes[i];
        }
        arr.unshift([key, entry]);
      }
      return arr;
    }
    /**
     * Reset the cache and load in the items in entries in the order listed.
     * Note that the shape of the resulting cache may be different if the
     * same options are not used in both caches.
     */
    load(arr) {
      this.clear();
      for (const [key, entry] of arr) {
        if (entry.start) {
          // entry.start is a portable timestamp, but we may be using
          // node's performance.now(), so calculate the offset, so that
          // we get the intended remaining TTL, no matter how long it's
          // been on ice.
          //
          // it's ok for this to be a bit slow, it's a rare operation.
          const age = Date.now() - entry.start;
          entry.start = perf.now() - age;
        }
        this.set(key, entry.value, entry);
      }
    }
    /**
     * Add a value to the cache.
     *
     * Note: if `undefined` is specified as a value, this is an alias for
     * {@link LRUCache#delete}
     */
    set(k, v, setOptions = {}) {
      if (v === undefined) {
        this.delete(k);
        return this;
      }
      const {
        ttl = this.ttl,
        start,
        noDisposeOnSet = this.noDisposeOnSet,
        sizeCalculation = this.sizeCalculation,
        status,
      } = setOptions;
      let { noUpdateTTL = this.noUpdateTTL } = setOptions;
      const size = this.#requireSize(
        k,
        v,
        setOptions.size || 0,
        sizeCalculation
      );
      // if the item doesn't fit, don't do anything
      // NB: maxEntrySize set to maxSize by default
      if (this.maxEntrySize && size > this.maxEntrySize) {
        if (status) {
          status.set = "miss";
          status.maxEntrySizeExceeded = true;
        }
        // have to delete, in case something is there already.
        this.delete(k);
        return this;
      }
      let index = this.#size === 0 ? undefined : this.#keyMap.get(k);
      if (index === undefined) {
        // addition
        index =
          this.#size === 0
            ? this.#tail
            : this.#free.length !== 0
            ? this.#free.pop()
            : this.#size === this.#max
            ? this.#evict(false)
            : this.#size;
        this.#keyList[index] = k;
        this.#valList[index] = v;
        this.#keyMap.set(k, index);
        this.#next[this.#tail] = index;
        this.#prev[index] = this.#tail;
        this.#tail = index;
        this.#size++;
        this.#addItemSize(index, size, status);
        if (status) status.set = "add";
        noUpdateTTL = false;
      } else {
        // update
        this.#moveToTail(index);
        const oldVal = this.#valList[index];
        if (v !== oldVal) {
          if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
            oldVal.__abortController.abort(new Error("replaced"));
          } else if (!noDisposeOnSet) {
            if (this.#hasDispose) {
              this.#dispose?.(oldVal, k, "set");
            }
            if (this.#hasDisposeAfter) {
              this.#disposed?.push([oldVal, k, "set"]);
            }
          }
          this.#removeItemSize(index);
          this.#addItemSize(index, size, status);
          this.#valList[index] = v;
          if (status) {
            status.set = "replace";
            const oldValue =
              oldVal && this.#isBackgroundFetch(oldVal)
                ? oldVal.__staleWhileFetching
                : oldVal;
            if (oldValue !== undefined) status.oldValue = oldValue;
          }
        } else if (status) {
          status.set = "update";
        }
      }
      if (ttl !== 0 && !this.#ttls) {
        this.#initializeTTLTracking();
      }
      if (this.#ttls) {
        if (!noUpdateTTL) {
          this.#setItemTTL(index, ttl, start);
        }
        if (status) this.#statusTTL(status, index);
      }
      if (!noDisposeOnSet && this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while ((task = dt?.shift())) {
          this.#disposeAfter?.(...task);
        }
      }
      return this;
    }
    /**
     * Evict the least recently used item, returning its value or
     * `undefined` if cache is empty.
     */
    pop() {
      try {
        while (this.#size) {
          const val = this.#valList[this.#head];
          this.#evict(true);
          if (this.#isBackgroundFetch(val)) {
            if (val.__staleWhileFetching) {
              return val.__staleWhileFetching;
            }
          } else if (val !== undefined) {
            return val;
          }
        }
      } finally {
        if (this.#hasDisposeAfter && this.#disposed) {
          const dt = this.#disposed;
          let task;
          while ((task = dt?.shift())) {
            this.#disposeAfter?.(...task);
          }
        }
      }
    }
    #evict(free) {
      const head = this.#head;
      const k = this.#keyList[head];
      const v = this.#valList[head];
      if (this.#hasFetchMethod && this.#isBackgroundFetch(v)) {
        v.__abortController.abort(new Error("evicted"));
      } else if (this.#hasDispose || this.#hasDisposeAfter) {
        if (this.#hasDispose) {
          this.#dispose?.(v, k, "evict");
        }
        if (this.#hasDisposeAfter) {
          this.#disposed?.push([v, k, "evict"]);
        }
      }
      this.#removeItemSize(head);
      // if we aren't about to use the index, then null these out
      if (free) {
        this.#keyList[head] = undefined;
        this.#valList[head] = undefined;
        this.#free.push(head);
      }
      if (this.#size === 1) {
        this.#head = this.#tail = 0;
        this.#free.length = 0;
      } else {
        this.#head = this.#next[head];
      }
      this.#keyMap.delete(k);
      this.#size--;
      return head;
    }
    /**
     * Check if a key is in the cache, without updating the recency of use.
     * Will return false if the item is stale, even though it is technically
     * in the cache.
     *
     * Will not update item age unless
     * {@link LRUCache.OptionsBase.updateAgeOnHas} is set.
     */
    has(k, hasOptions = {}) {
      const { updateAgeOnHas = this.updateAgeOnHas, status } = hasOptions;
      const index = this.#keyMap.get(k);
      if (index !== undefined) {
        const v = this.#valList[index];
        if (
          this.#isBackgroundFetch(v) &&
          v.__staleWhileFetching === undefined
        ) {
          return false;
        }
        if (!this.#isStale(index)) {
          if (updateAgeOnHas) {
            this.#updateItemAge(index);
          }
          if (status) {
            status.has = "hit";
            this.#statusTTL(status, index);
          }
          return true;
        } else if (status) {
          status.has = "stale";
          this.#statusTTL(status, index);
        }
      } else if (status) {
        status.has = "miss";
      }
      return false;
    }
    /**
     * Like {@link LRUCache#get} but doesn't update recency or delete stale
     * items.
     *
     * Returns `undefined` if the item is stale, unless
     * {@link LRUCache.OptionsBase.allowStale} is set.
     */
    peek(k, peekOptions = {}) {
      const { allowStale = this.allowStale } = peekOptions;
      const index = this.#keyMap.get(k);
      if (index !== undefined && (allowStale || !this.#isStale(index))) {
        const v = this.#valList[index];
        // either stale and allowed, or forcing a refresh of non-stale value
        return this.#isBackgroundFetch(v) ? v.__staleWhileFetching : v;
      }
    }
    #backgroundFetch(k, index, options, context) {
      const v = index === undefined ? undefined : this.#valList[index];
      if (this.#isBackgroundFetch(v)) {
        return v;
      }
      const ac = new AC();
      const { signal } = options;
      // when/if our AC signals, then stop listening to theirs.
      signal?.addEventListener("abort", () => ac.abort(signal.reason), {
        signal: ac.signal,
      });
      const fetchOpts = {
        signal: ac.signal,
        options,
        context,
      };
      const cb = (v, updateCache = false) => {
        const { aborted } = ac.signal;
        const ignoreAbort = options.ignoreFetchAbort && v !== undefined;
        if (options.status) {
          if (aborted && !updateCache) {
            options.status.fetchAborted = true;
            options.status.fetchError = ac.signal.reason;
            if (ignoreAbort) options.status.fetchAbortIgnored = true;
          } else {
            options.status.fetchResolved = true;
          }
        }
        if (aborted && !ignoreAbort && !updateCache) {
          return fetchFail(ac.signal.reason);
        }
        // either we didn't abort, and are still here, or we did, and ignored
        const bf = p;
        if (this.#valList[index] === p) {
          if (v === undefined) {
            if (bf.__staleWhileFetching) {
              this.#valList[index] = bf.__staleWhileFetching;
            } else {
              this.delete(k);
            }
          } else {
            if (options.status) options.status.fetchUpdated = true;
            this.set(k, v, fetchOpts.options);
          }
        }
        return v;
      };
      const eb = (er) => {
        if (options.status) {
          options.status.fetchRejected = true;
          options.status.fetchError = er;
        }
        return fetchFail(er);
      };
      const fetchFail = (er) => {
        const { aborted } = ac.signal;
        const allowStaleAborted = aborted && options.allowStaleOnFetchAbort;
        const allowStale =
          allowStaleAborted || options.allowStaleOnFetchRejection;
        const noDelete = allowStale || options.noDeleteOnFetchRejection;
        const bf = p;
        if (this.#valList[index] === p) {
          // if we allow stale on fetch rejections, then we need to ensure that
          // the stale value is not removed from the cache when the fetch fails.
          const del = !noDelete || bf.__staleWhileFetching === undefined;
          if (del) {
            this.delete(k);
          } else if (!allowStaleAborted) {
            // still replace the *promise* with the stale value,
            // since we are done with the promise at this point.
            // leave it untouched if we're still waiting for an
            // aborted background fetch that hasn't yet returned.
            this.#valList[index] = bf.__staleWhileFetching;
          }
        }
        if (allowStale) {
          if (options.status && bf.__staleWhileFetching !== undefined) {
            options.status.returnedStale = true;
          }
          return bf.__staleWhileFetching;
        } else if (bf.__returned === bf) {
          throw er;
        }
      };
      const pcall = (res, rej) => {
        const fmp = this.#fetchMethod?.(k, v, fetchOpts);
        if (fmp && fmp instanceof Promise) {
          fmp.then((v) => res(v === undefined ? undefined : v), rej);
        }
        // ignored, we go until we finish, regardless.
        // defer check until we are actually aborting,
        // so fetchMethod can override.
        ac.signal.addEventListener("abort", () => {
          if (!options.ignoreFetchAbort || options.allowStaleOnFetchAbort) {
            res(undefined);
            // when it eventually resolves, update the cache.
            if (options.allowStaleOnFetchAbort) {
              res = (v) => cb(v, true);
            }
          }
        });
      };
      if (options.status) options.status.fetchDispatched = true;
      const p = new Promise(pcall).then(cb, eb);
      const bf = Object.assign(p, {
        __abortController: ac,
        __staleWhileFetching: v,
        __returned: undefined,
      });
      if (index === undefined) {
        // internal, don't expose status.
        this.set(k, bf, { ...fetchOpts.options, status: undefined });
        index = this.#keyMap.get(k);
      } else {
        this.#valList[index] = bf;
      }
      return bf;
    }
    #isBackgroundFetch(p) {
      if (!this.#hasFetchMethod) return false;
      const b = p;
      return (
        !!b &&
        b instanceof Promise &&
        b.hasOwnProperty("__staleWhileFetching") &&
        b.__abortController instanceof AC
      );
    }
    async fetch(k, fetchOptions = {}) {
      const {
        // get options
        allowStale = this.allowStale,
        updateAgeOnGet = this.updateAgeOnGet,
        noDeleteOnStaleGet = this.noDeleteOnStaleGet,
        // set options
        ttl = this.ttl,
        noDisposeOnSet = this.noDisposeOnSet,
        size = 0,
        sizeCalculation = this.sizeCalculation,
        noUpdateTTL = this.noUpdateTTL,
        // fetch exclusive options
        noDeleteOnFetchRejection = this.noDeleteOnFetchRejection,
        allowStaleOnFetchRejection = this.allowStaleOnFetchRejection,
        ignoreFetchAbort = this.ignoreFetchAbort,
        allowStaleOnFetchAbort = this.allowStaleOnFetchAbort,
        context,
        forceRefresh = false,
        status,
        signal,
      } = fetchOptions;
      if (!this.#hasFetchMethod) {
        if (status) status.fetch = "get";
        return this.get(k, {
          allowStale,
          updateAgeOnGet,
          noDeleteOnStaleGet,
          status,
        });
      }
      const options = {
        allowStale,
        updateAgeOnGet,
        noDeleteOnStaleGet,
        ttl,
        noDisposeOnSet,
        size,
        sizeCalculation,
        noUpdateTTL,
        noDeleteOnFetchRejection,
        allowStaleOnFetchRejection,
        allowStaleOnFetchAbort,
        ignoreFetchAbort,
        status,
        signal,
      };
      let index = this.#keyMap.get(k);
      if (index === undefined) {
        if (status) status.fetch = "miss";
        const p = this.#backgroundFetch(k, index, options, context);
        return (p.__returned = p);
      } else {
        // in cache, maybe already fetching
        const v = this.#valList[index];
        if (this.#isBackgroundFetch(v)) {
          const stale = allowStale && v.__staleWhileFetching !== undefined;
          if (status) {
            status.fetch = "inflight";
            if (stale) status.returnedStale = true;
          }
          return stale ? v.__staleWhileFetching : (v.__returned = v);
        }
        // if we force a refresh, that means do NOT serve the cached value,
        // unless we are already in the process of refreshing the cache.
        const isStale = this.#isStale(index);
        if (!forceRefresh && !isStale) {
          if (status) status.fetch = "hit";
          this.#moveToTail(index);
          if (updateAgeOnGet) {
            this.#updateItemAge(index);
          }
          if (status) this.#statusTTL(status, index);
          return v;
        }
        // ok, it is stale or a forced refresh, and not already fetching.
        // refresh the cache.
        const p = this.#backgroundFetch(k, index, options, context);
        const hasStale = p.__staleWhileFetching !== undefined;
        const staleVal = hasStale && allowStale;
        if (status) {
          status.fetch = isStale ? "stale" : "refresh";
          if (staleVal && isStale) status.returnedStale = true;
        }
        return staleVal ? p.__staleWhileFetching : (p.__returned = p);
      }
    }
    /**
     * Return a value from the cache. Will update the recency of the cache
     * entry found.
     *
     * If the key is not found, get() will return `undefined`.
     */
    get(k, getOptions = {}) {
      const {
        allowStale = this.allowStale,
        updateAgeOnGet = this.updateAgeOnGet,
        noDeleteOnStaleGet = this.noDeleteOnStaleGet,
        status,
      } = getOptions;
      const index = this.#keyMap.get(k);
      if (index !== undefined) {
        const value = this.#valList[index];
        const fetching = this.#isBackgroundFetch(value);
        if (status) this.#statusTTL(status, index);
        if (this.#isStale(index)) {
          if (status) status.get = "stale";
          // delete only if not an in-flight background fetch
          if (!fetching) {
            if (!noDeleteOnStaleGet) {
              this.delete(k);
            }
            if (status && allowStale) status.returnedStale = true;
            return allowStale ? value : undefined;
          } else {
            if (
              status &&
              allowStale &&
              value.__staleWhileFetching !== undefined
            ) {
              status.returnedStale = true;
            }
            return allowStale ? value.__staleWhileFetching : undefined;
          }
        } else {
          if (status) status.get = "hit";
          // if we're currently fetching it, we don't actually have it yet
          // it's not stale, which means this isn't a staleWhileRefetching.
          // If it's not stale, and fetching, AND has a __staleWhileFetching
          // value, then that means the user fetched with {forceRefresh:true},
          // so it's safe to return that value.
          if (fetching) {
            return value.__staleWhileFetching;
          }
          this.#moveToTail(index);
          if (updateAgeOnGet) {
            this.#updateItemAge(index);
          }
          return value;
        }
      } else if (status) {
        status.get = "miss";
      }
    }
    #connect(p, n) {
      this.#prev[n] = p;
      this.#next[p] = n;
    }
    #moveToTail(index) {
      // if tail already, nothing to do
      // if head, move head to next[index]
      // else
      //   move next[prev[index]] to next[index] (head has no prev)
      //   move prev[next[index]] to prev[index]
      // prev[index] = tail
      // next[tail] = index
      // tail = index
      if (index !== this.#tail) {
        if (index === this.#head) {
          this.#head = this.#next[index];
        } else {
          this.#connect(this.#prev[index], this.#next[index]);
        }
        this.#connect(this.#tail, index);
        this.#tail = index;
      }
    }
    /**
     * Deletes a key out of the cache.
     * Returns true if the key was deleted, false otherwise.
     */
    delete(k) {
      let deleted = false;
      if (this.#size !== 0) {
        const index = this.#keyMap.get(k);
        if (index !== undefined) {
          deleted = true;
          if (this.#size === 1) {
            this.clear();
          } else {
            this.#removeItemSize(index);
            const v = this.#valList[index];
            if (this.#isBackgroundFetch(v)) {
              v.__abortController.abort(new Error("deleted"));
            } else if (this.#hasDispose || this.#hasDisposeAfter) {
              if (this.#hasDispose) {
                this.#dispose?.(v, k, "delete");
              }
              if (this.#hasDisposeAfter) {
                this.#disposed?.push([v, k, "delete"]);
              }
            }
            this.#keyMap.delete(k);
            this.#keyList[index] = undefined;
            this.#valList[index] = undefined;
            if (index === this.#tail) {
              this.#tail = this.#prev[index];
            } else if (index === this.#head) {
              this.#head = this.#next[index];
            } else {
              this.#next[this.#prev[index]] = this.#next[index];
              this.#prev[this.#next[index]] = this.#prev[index];
            }
            this.#size--;
            this.#free.push(index);
          }
        }
      }
      if (this.#hasDisposeAfter && this.#disposed?.length) {
        const dt = this.#disposed;
        let task;
        while ((task = dt?.shift())) {
          this.#disposeAfter?.(...task);
        }
      }
      return deleted;
    }
    /**
     * Clear the cache entirely, throwing away all values.
     */
    clear() {
      for (const index of this.#rindexes({ allowStale: true })) {
        const v = this.#valList[index];
        if (this.#isBackgroundFetch(v)) {
          v.__abortController.abort(new Error("deleted"));
        } else {
          const k = this.#keyList[index];
          if (this.#hasDispose) {
            this.#dispose?.(v, k, "delete");
          }
          if (this.#hasDisposeAfter) {
            this.#disposed?.push([v, k, "delete"]);
          }
        }
      }
      this.#keyMap.clear();
      this.#valList.fill(undefined);
      this.#keyList.fill(undefined);
      if (this.#ttls && this.#starts) {
        this.#ttls.fill(0);
        this.#starts.fill(0);
      }
      if (this.#sizes) {
        this.#sizes.fill(0);
      }
      this.#head = 0;
      this.#tail = 0;
      this.#free.length = 0;
      this.#calculatedSize = 0;
      this.#size = 0;
      if (this.#hasDisposeAfter && this.#disposed) {
        const dt = this.#disposed;
        let task;
        while ((task = dt?.shift())) {
          this.#disposeAfter?.(...task);
        }
      }
    }
  }

  const FormatCapabilities = {
    r8unorm: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    r8snorm: {
      blendable: false,
      sampleTypes: ["float", "unfilterable-float"],
    },
    r8uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    r8sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rg8unorm: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rg8snorm: {
      blendable: false,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rg8uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rg8sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rgba8unorm: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    "rgba8unorm-srgb": {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rgba8snorm: {
      blendable: false,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rgba8uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rgba8sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    bgra8unorm: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    "bgra8unorm-srgb": {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    r16uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    r16sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    r16float: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rg16uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rg16sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rg16float: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rgba16uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rgba16sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rgba16float: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    r32uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    r32sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    r32float: {
      blendable: false,
      sampleTypes: [
        "unfilterable-float",
        "float",
        "float32-filterable",
        "float",
        "float32-filterable",
      ],
    },
    rg32uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rg32sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rg32float: {
      blendable: false,
      sampleTypes: [
        "unfilterable-float",
        "float",
        "float32-filterable",
        "float",
        "float32-filterable",
      ],
    },
    rgba32uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rgba32sint: {
      blendable: false,
      sampleTypes: ["sint"],
    },
    rgba32float: {
      blendable: false,
      sampleTypes: [
        "unfilterable-float",
        "float",
        "float32-filterable",
        "float",
        "float32-filterable",
      ],
    },
    rgb10a2uint: {
      blendable: false,
      sampleTypes: ["uint"],
    },
    rgb10a2unorm: {
      blendable: true,
      sampleTypes: ["float", "unfilterable-float"],
    },
    rg11b10ufloat: {
      blendable: false,
      sampleTypes: ["float", "unfilterable-float"],
    },
  };
  class WebGPUMeshData {
    sourceMesh;
    vertexBuffer;
    indexBuffer;
    vertexCount;
    indexCount;
    constructor(
      sourceMesh,
      vertexBuffer,
      indexBuffer,
      vertexCount,
      indexCount
    ) {
      this.sourceMesh = sourceMesh;
      this.vertexBuffer = vertexBuffer;
      this.indexBuffer = indexBuffer;
      this.vertexCount = vertexCount;
      this.indexCount = indexCount;
    }
  }
  const lruCacheOptions = {
    max: 500,
  };
  let lruUniformOptions = {
    max: 128,
  };
  const vertexLayout = [
    {
      // Position
      arrayStride:
        (3 + // Position
          3 + // Normal
          3 + // Tangent
          3 + // Bitangent
          2 + // UV
          4) * // Color
        4,
      stepMode: "vertex",
      attributes: [
        {
          shaderLocation: 0,
          offset: 0,
          format: "float32x3",
        },
        {
          shaderLocation: 1,
          offset: 3 * 4,
          format: "float32x3",
        },
        {
          shaderLocation: 2,
          offset: (3 + 3) * 4,
          format: "float32x3",
        },
        {
          shaderLocation: 3,
          offset: (3 + 3 + 3) * 4,
          format: "float32x3",
        },
        {
          shaderLocation: 4,
          offset: (3 + 3 + 3 + 3) * 4,
          format: "float32x2",
        },
        {
          shaderLocation: 5,
          offset: (3 + 3 + 3 + 3 + 2) * 4,
          format: "float32x4",
        },
      ],
    },
  ];
  class WebGPUAdapter extends GraphicsAdapter {
    ctx = null;
    texture = null;
    storageTexture = null;
    storageDirty = false;
    pendingWrites = 0;
    adapter = null;
    device = null;
    headless = false;
    headlessDimensions = 2;
    headlessWidth = 1024;
    headlessHeight = 1024;
    headlessDepth = 1024;
    baseUniformBufferSize = 2 * 4;
    // _vtex_canvas
    baseUniformValues = new Float32Array(this.baseUniformBufferSize / 4);
    baseUniformBuffer = null;
    pipelineCache = new LRUCache(lruCacheOptions);
    ready = false;
    catchGPUErrors = true;
    gpuMeshData = /* @__PURE__ */ new Map();
    depthTexture = null;
    textureFormat = "float4";
    gpuTextureFormat = "rgba8unorm";
    clearEnqueued = false;
    getValueSize(vt) {
      return getValueSize(vt);
    }
    init() {
      this.ready = false;
      this.adapter = window.shadeupWebGPUAdapter;
      this.device = window.shadeupWebGPUDevice;
      if (!this.adapter || !this.device) {
        throw new Error("WebGPU is not supported");
      }
      this.addEventListener("context", (to) => {
        if (to == "paint") {
          if (!this.clearEnqueued) {
            this.beforeScreenDraw();
          }
        }
      });
      this.baseUniformBuffer = this.device.createBuffer({
        size: this.baseUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      if (this.headless) {
        if (this.headlessDimensions == 2) {
          this.startDispatch();
          this.texture = this.device.createTexture({
            size: {
              width: this.headlessWidth,
              height: this.headlessHeight,
            },
            format: this.gpuTextureFormat,
            dimension: "2d",
            viewFormats: [this.gpuTextureFormat],
            usage:
              GPUTextureUsage.RENDER_ATTACHMENT |
              GPUTextureUsage.TEXTURE_BINDING |
              GPUTextureUsage.COPY_SRC |
              GPUTextureUsage.COPY_DST,
          });
          this.endDispatch();
        } else {
          this.startDispatch();
          this.texture = this.device.createTexture({
            size: {
              width: this.headlessWidth,
              height: this.headlessHeight,
              depthOrArrayLayers: this.headlessDepth,
            },
            format: this.gpuTextureFormat,
            dimension: "3d",
            usage:
              GPUTextureUsage.TEXTURE_BINDING |
              GPUTextureUsage.COPY_SRC |
              GPUTextureUsage.COPY_DST,
          });
          this.endDispatch();
        }
      } else {
        this.textureFormat = "uint8";
        this.ctx = this.canvas.getContext("webgpu");
        if (!this.ctx) {
          throw new Error("WebGPU is not supported");
        }
        this.ctx.configure({
          device: this.device,
          format: "rgba8unorm",
          alphaMode: "premultiplied",
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT |
            GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_SRC |
            GPUTextureUsage.COPY_DST,
        });
      }
      if (this.canvas) {
        this.startDispatch();
        this.depthTexture = this.device.createTexture({
          size: {
            width: this.canvas.width,
            height: this.canvas.height,
          },
          format: "depth24plus",
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        this.endDispatch();
      }
      this.ready = true;
    }
    startDispatch() {
      if (!this.device) return;
      if (this.catchGPUErrors) {
        this.device.pushErrorScope("validation");
        this.device.pushErrorScope("internal");
        this.device.pushErrorScope("out-of-memory");
      }
    }
    endDispatch() {
      if (!this.device) return;
      let handler = (e) => {
        if (!e) return;
        let ignore =
          e.message.includes("[Invalid ShaderModule] is invalid.") ||
          e.message.includes("[Invalid BindGroup] is invalid.") ||
          e.message.includes("[Invalid ComputePipeline") ||
          e.message.includes("[Invalid RenderPipeline");
        if (ignore) return;
        window.bubbleError(e.message);
        let stack = new Error();
        console.error(e, stack.stack);
      };
      if (this.catchGPUErrors) {
        this.device.popErrorScope().then(handler);
        this.device.popErrorScope().then(handler);
        this.device.popErrorScope().then(handler);
      }
    }
    drawImageCache;
    trace(id, data) {}
    drawImage(image, x, y, width, height) {
      const { device } = this.getGPU();
      this.trace("drawImage", { image, x, y, width, height });
      if (!this.ready) {
        return;
      }
      this.startDispatch();
      let selfTexture = this.getTexture();
      device.queue.copyExternalImageToTexture(
        { source: image },
        { texture: selfTexture, premultipliedAlpha: true },
        { width: image.width, height: image.height }
      );
      this.copyToCanvas();
      this.endDispatch();
    }
    genericBufferFlags() {
      return (
        GPUBufferUsage.STORAGE |
        GPUBufferUsage.COPY_DST |
        GPUBufferUsage.COPY_SRC
      );
    }
    copyBufferToBuffer(from, to) {
      this.getGPU();
      this.enqueueCommand((encoder) => {
        encoder.copyBufferToBuffer(
          this.getOrCreateBuffer(from, this.genericBufferFlags()),
          0,
          this.getOrCreateBuffer(to, this.genericBufferFlags()),
          0,
          from.elementCount * from.elementBytes
        );
      });
    }
    async downloadBuffer(buf) {
      this.trace("downloadBuffer", { buffer: buf });
      const { device } = this.getGPU();
      let nativeBuffer = this.getOrCreateBuffer(buf, this.genericBufferFlags());
      this.startDispatch();
      let encoder = device.createCommandEncoder();
      let buffer = device.createBuffer({
        size: nativeBuffer.size,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
      encoder.copyBufferToBuffer(nativeBuffer, 0, buffer, 0, nativeBuffer.size);
      let commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
      await buffer.mapAsync(GPUMapMode.READ);
      let arr = buffer.getMappedRange();
      if (!buf.structured) {
        if (buf.arrayBuffer) {
          let u8down = new Uint8Array(arr);
          let u8in = new Uint8Array(buf.arrayBuffer);
          u8in.set(u8down);
        } else {
          throw new Error("Buffer not found while downloading");
        }
      } else {
        if (buf.typeName == "atomic<uint>") {
          let u32down = new Uint32Array(arr);
          buf.uintArray?.set(u32down);
        } else if (buf.typeName == "atomic<int>") {
          let i32down = new Int32Array(arr);
          buf.intArray?.set(i32down);
        } else {
          new Uint8Array(buf.arrayBuffer).set(new Uint8Array(arr));
        }
      }
      buffer.destroy();
      this.endDispatch();
    }
    uploadBuffer(buf) {
      const { device } = this.getGPU();
      this.trace("uploadBuffer", { buffer: buf });
      this.startDispatch();
      let nativeBuffer = this.getOrCreateBuffer(buf, this.genericBufferFlags());
      if (!buf.structured) {
        if (buf.arrayBuffer) {
          let u8in = new Uint8Array(buf.arrayBuffer);
          device.queue.writeBuffer(nativeBuffer, 0, u8in);
        } else {
          throw new Error("Buffer not found while downloading");
        }
      } else {
        if (buf.typeName == "atomic<uint>") {
          device.queue.writeBuffer(nativeBuffer, 0, buf.arrayBuffer);
        } else if (buf.typeName == "atomic<int>") {
          new Int32Array(buf.elementCount);
          device.queue.writeBuffer(nativeBuffer, 0, buf.arrayBuffer);
        } else {
          device.queue.writeBuffer(
            nativeBuffer,
            0,
            new Uint8Array(buf.arrayBuffer)
          );
        }
      }
      this.endDispatch();
    }
    async downloadImage() {
      const { device } = this.getGPU();
      this.flushStorage();
      this.startDispatch();
      let encoder = device.createCommandEncoder();
      let texture = this.getTexture();
      let stride =
        parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
      if (this.textureFormat == "uint8") {
        stride = 4;
      }
      let bytesPerComponent = 2;
      if (this.textureFormat == "uint8") {
        bytesPerComponent = 1;
      } else if (this.textureFormat.startsWith("float")) {
        bytesPerComponent = 4;
      } else if (this.textureFormat.startsWith("int")) {
        bytesPerComponent = 4;
      } else {
        bytesPerComponent = 4;
      }
      let alignment = 256;
      let bytesPerRow = texture.width * stride * bytesPerComponent;
      let neededAlignment = false;
      let alignmentPad = 0;
      if (bytesPerRow % alignment != 0) {
        let oldBytes = bytesPerRow;
        bytesPerRow += alignment - (bytesPerRow % alignment);
        alignmentPad = bytesPerRow - oldBytes;
        neededAlignment = true;
      }
      let buffer = device.createBuffer({
        size: bytesPerRow * texture.height,
        usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
      });
      encoder.copyTextureToBuffer(
        { texture },
        { buffer, bytesPerRow },
        texture
      );
      let commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
      await buffer.mapAsync(GPUMapMode.READ);
      let arr;
      let buf = new Uint8Array(buffer.getMappedRange());
      if (neededAlignment) {
        let oldBytes = bytesPerRow - alignmentPad;
        let newData = new Uint8Array(oldBytes * texture.height);
        for (let i = 0; i < texture.height; i++) {
          newData.set(
            new Uint8Array(buf.buffer, i * bytesPerRow, oldBytes),
            i * oldBytes
          );
        }
        buf = newData;
      }
      if (this.textureFormat == "uint8") {
        arr = new Uint8Array(buf.buffer);
      } else if (this.textureFormat.startsWith("float")) {
        arr = new Float32Array(buf.buffer);
      } else if (this.textureFormat.startsWith("int")) {
        arr = new Uint32Array(buf.buffer);
      } else {
        arr = new Uint32Array(buf.buffer);
      }
      this.endDispatch();
      return arr;
    }
    uploadImage(data) {
      this.startDispatch();
      const { device } = this.getGPU();
      let encoder = device.createCommandEncoder();
      let texture = this.getTexture();
      let stride =
        parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
      if (this.textureFormat == "uint8") {
        stride = 4;
      }
      let bytesPerComponent = 2;
      if (this.textureFormat == "uint8") {
        bytesPerComponent = 1;
      } else if (this.textureFormat.startsWith("float")) {
        bytesPerComponent = 4;
      } else if (this.textureFormat.startsWith("int")) {
        bytesPerComponent = 4;
      } else {
        bytesPerComponent = 4;
      }
      let alignment = 256;
      let bytesPerRow = texture.width * stride * bytesPerComponent;
      if (bytesPerRow % alignment != 0) {
        let oldBytes = bytesPerRow;
        bytesPerRow += alignment - (bytesPerRow % alignment);
        let newData = new Uint8Array(bytesPerRow * texture.height);
        for (let i = 0; i < texture.height; i++) {
          newData.set(
            new Uint8Array(data.buffer, i * oldBytes, oldBytes),
            i * bytesPerRow
          );
        }
        data = newData;
      }
      let buffer = device.createBuffer({
        size: data.byteLength,
        usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(buffer, 0, data);
      encoder.copyBufferToTexture(
        { buffer, bytesPerRow },
        { texture },
        { width: texture.width, height: texture.height }
      );
      let commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
      buffer.destroy();
      this.copyToCanvas();
      this.endDispatch();
    }
    getGPU() {
      if (!this.device) {
        throw new Error("WebGPU is not supported");
      }
      if (!this.ready) {
        throw new Error("WebGPU is not ready");
      }
      return {
        device: this.device,
      };
    }
    setViewport(width, height) {
      super.setViewport(width, height);
      if (!this.device) {
        return;
      }
      this.startDispatch();
      this.depthTexture?.destroy();
      this.depthTexture = this.device.createTexture({
        size: {
          width,
          height,
        },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
      this.endDispatch();
    }
    translateFormatToGPUType(type) {
      if (type == "float4") {
        return "vec4<f32>";
      }
      if (type == "float3") {
        return "vec3<f32>";
      }
      if (type == "float2") {
        return "vec2<f32>";
      }
      if (type == "float") {
        return "f32";
      }
      if (type == "int4") {
        return "vec4<i32>";
      }
      if (type == "int3") {
        return "vec3<i32>";
      }
      if (type == "int2") {
        return "vec2<i32>";
      }
      if (type == "int") {
        return "i32";
      }
      if (type == "uint4") {
        return "vec4<u32>";
      }
      if (type == "uint3") {
        return "vec3<u32>";
      }
      if (type == "uint2") {
        return "vec2<u32>";
      }
      if (type == "uint") {
        return "u32";
      }
      throw new Error("Invalid type");
    }
    getOrCreateShader(instance, type, config) {
      const { device } = this.getGPU();
      let key = type;
      if (config) {
        if (config.attachments) {
          key += "|" + config.attachments.join(",");
        }
      }
      if (instance.parent.types[key]) {
        return instance.parent.types[key];
      } else {
        let base = instance.parent.code.webgpu;
        for (let param of Object.keys(instance.parent.arraySizes)) {
          base = base.replace(
            `%${param}_size%`,
            instance.parent.arraySizes[param]
          );
        }
        if (
          instance.parent.params.webgpu.globals.length == 0 &&
          instance.parent.params.webgpu.locals.length == 0
        ) {
          base = base.replace(`/*SHADEUP_UNIFORM_STRUCT_START*/`, "");
        }
        if (instance) {
          for (let key2 of Object.keys(instance.bindings)) {
            let value = instance.bindings[key2];
            let isArrayTex = false;
            if (
              value instanceof ShadeupTexture2d ||
              (Array.isArray(value) &&
                value.length > 0 &&
                value[0] instanceof ShadeupTexture2d)
            ) {
              if (Array.isArray(value)) {
                if (value.length == 0) {
                  throw new Error("Invalid array length");
                } else {
                  if (value[0] instanceof ShadeupTexture2d) {
                    value = value[0];
                    isArrayTex = true;
                  }
                }
              }
              let name = `%WRITE_TYPE_${key2}%`;
              let texFormat = value.adapter.gpuTextureFormat;
              base = base.replace(name, texFormat);
              if (texFormat == "depth24plus" || texFormat == "depth32float") {
                base = base.replace(
                  `var ${key2}_texture: texture_2d${
                    isArrayTex ? "_array" : ""
                  }<${
                    value.innerType.startsWith("float")
                      ? "f32"
                      : value.innerType.startsWith("int")
                      ? "i32"
                      : "u32"
                  }>`,
                  `var ${key2}_texture: texture_depth_2d${
                    isArrayTex ? "_array" : ""
                  }`
                );
                let startIndexes = base.matchAll(
                  new RegExp(`textureLoad\\(${key2}_texture, `, "g")
                );
                for (let match of startIndexes) {
                  let balance = 0;
                  let hitFirst = false;
                  for (let i = match.index ?? 0; i < base.length; i++) {
                    if (base[i] == "(") {
                      balance++;
                      hitFirst = true;
                    }
                    if (base[i] == ")") {
                      balance--;
                    }
                    if (balance == 0 && hitFirst) {
                      base =
                        base.substring(0, i + 1) +
                        base.substring(i + 3, base.length);
                      break;
                    }
                  }
                }
                startIndexes = base.matchAll(
                  new RegExp(`textureSample\\(${key2}_texture, `, "g")
                );
                let replaces = [];
                for (let match of startIndexes) {
                  let balance = 0;
                  let hitFirst = false;
                  for (let i = match.index ?? 0; i < base.length; i++) {
                    if (base[i] == "(") {
                      balance++;
                      hitFirst = true;
                    }
                    if (base[i] == ")") {
                      balance--;
                    }
                    if (balance == 0 && hitFirst) {
                      replaces.push(base.substring(match.index, i));
                      break;
                    }
                  }
                }
                for (let replace of replaces) {
                  base = base.replace(replace, "vec4<f32>(" + replace + ")");
                }
              }
            }
          }
        }
        if (type == "compute") {
          base = base.replaceAll("%GROUP_INDEX%", "0");
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `
					
					struct _ComputeUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _compute_uniform_input: _ComputeUniformInput;

					`.replace(/\t\n/g, "")
          );
          base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `void`);
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_INPUT*/`,
            `
				@builtin(workgroup_id) workgroup_id : vec3<u32>,
				@builtin(local_invocation_id) local_invocation_id : vec3<u32>,
				@builtin(global_invocation_id) global_invocation_id : vec3<u32>,
				@builtin(local_invocation_index) local_invocation_index: u32,
				@builtin(num_workgroups) num_workgroups: vec3<u32>
				`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `var _i_in: ShaderInput;
					_i_in.groupId = vec3<i32>(workgroup_id);
					_i_in.groupSize = vec3<i32>(num_workgroups);
					_i_in.localId = vec3<i32>(local_invocation_id);
					_i_in.globalId = vec3<i32>(global_invocation_id);
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            ``.replace(/\t\n/g, "")
          );
        } else if (type == "vertex") {
          base = base.replaceAll("%GROUP_INDEX%", "1");
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeOutput}
					};
					struct _VertexUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _vertex_uniform_input: _VertexUniformInput;

					@vertex
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_OUTPUT*/`,
            `_VertexShaderOutput`
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_INPUT*/`,
            `
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32,
				@location(0) position: vec3<f32>,
				@location(1) normal: vec3<f32>,
				@location(2) tangent: vec3<f32>,
				@location(3) bitangent: vec3<f32>,
				@location(4) uv: vec2<f32>,
				@location(5) color: vec4<f32>
				`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `var _i_out: _VertexShaderOutput;
					_i_out.position = vec4(position, 1.0);
					_i_out.normal = normal;
					_i_out.tangent = tangent;
					_i_out.bitangent = bitangent;
					_i_out.uv = uv;
					_i_out.color = color;
					_i_out.instanceIndex = instanceIndex;
					var _i_in: ShaderInput;
					_i_in.position = position;
					_i_in.normal = normal;
					_i_in.tangent = tangent;
					_i_in.bitangent = bitangent;
					_i_in.vertexIndex = i32(vertexIndex);
					_i_in.instanceIndex = i32(instanceIndex);
					_i_in.uv = uv;
					_i_in.color = color;
					_i_in.screen = vec2<f32>(0, 0);
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            `
					// _i_out.position = vec4<f32>(_i_out.position.x, _i_out.position.y, (1.0 + _i_out.position.z) / 2.0, _i_out.position.w);
					_i_out.worldPosition = position;
					return _i_out;`.replace(/\t\n/g, "")
          );
        } else if (type == "vertex-indexed") {
          base = base.replaceAll("%GROUP_INDEX%", "1");
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeOutput}
					};
					struct _VertexUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _vertex_uniform_input: _VertexUniformInput;

					@vertex
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_OUTPUT*/`,
            `_VertexShaderOutput`
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_INPUT*/`,
            `
				@builtin(vertex_index) vertexIndex: u32,
				@builtin(instance_index) instanceIndex: u32,
				`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `var _i_out: _VertexShaderOutput;
					_i_out.position = vec4(0.0, 0.0, 0.0, 1.0);
					_i_out.normal = vec3(0.0, 0.0, 0.0);
					_i_out.tangent = vec3(0.0, 0.0, 0.0);
					_i_out.bitangent = vec3(0.0, 0.0, 0.0);
					_i_out.uv = vec2(0.0, 0.0);
					_i_out.color = vec4(0.0, 0.0, 0.0, 0.0);
					_i_out.instanceIndex = instanceIndex;
					var _i_in: ShaderInput;
					_i_in.position = vec3(0.0, 0.0, 0.0);
					_i_in.normal = vec3(0.0, 0.0, 0.0);
					_i_in.tangent = vec3(0.0, 0.0, 0.0);
					_i_in.bitangent = vec3(0.0, 0.0, 0.0);
					_i_in.vertexIndex = i32(vertexIndex);
					_i_in.instanceIndex = i32(instanceIndex);
					_i_in.uv = vec2(0.0, 0.0);
					_i_in.color = vec4(0.0, 0.0, 0.0, 0.0);
					_i_in.screen = vec2<f32>(0, 0);
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            `
					// _i_out.position = vec4<f32>(_i_out.position.x, _i_out.position.y, (1.0 + _i_out.position.z) / 2.0, _i_out.position.w);
					// _i_out.worldPosition = position;
					return _i_out;`.replace(/\t\n/g, "")
          );
        } else {
          let headerStr = "";
          if (config?.attachments) {
            let i = 0;
            headerStr += "struct _ShaderFragmentOutput {\n";
            for (let attachment of config.attachments) {
              headerStr += `@location(${i}) attachment${i}: ${this.translateFormatToGPUType(
                attachment
              )},
`;
              i++;
            }
            headerStr += "\n};";
          }
          base = base.replaceAll("%GROUP_INDEX%", "0");
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `
					struct _VertexShaderOutput {
						@builtin(position) position: vec4<f32>,
						@location(0) normal: vec3<f32>,
						@location(1) tangent: vec3<f32>,
						@location(2) bitangent: vec3<f32>,
						@location(3) uv: vec2<f32>,
						@location(4) color: vec4<f32>,
						@location(5) @interpolate(flat) instanceIndex: u32,
						@location(6) worldPosition: vec3<f32>,
						${instance.parent.params.webgpu.attributeInput}
					};

					${headerStr}
					
					struct _FragmentUniformInput {
						_vtex_canvas: vec2<f32>,
					};
					@group(0) @binding(0) var<uniform> _fragment_uniform_input: _FragmentUniformInput;

					@fragment
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_OUTPUT*/`,
            config?.attachments
              ? `_ShaderFragmentOutput`
              : `@location(0) vec4<f32>`
          );
          base = base.replace(
            `/*__SHADEUP_TEMPLATE_INPUT*/`,
            `
				_frag_in: _VertexShaderOutput
				`.replace(/\t\n/g, "")
          );
          let writeCustoms =
            instance.parent.params.webgpu.attributeInput.split(
              "@location"
            ).length;
          let extra = "";
          if (writeCustoms >= 2) {
            for (let i = 0; i < writeCustoms - 1; i++) {
              extra += `_i_in.custom${i} = _frag_in.custom${i};
`;
            }
          }
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `var _i_out: ${
              config?.attachments ? "_ShaderFragmentOutput" : "ShaderOutput"
            };
					var _i_in: ShaderInput;
					_i_in.position = _frag_in.worldPosition;
					_i_in.clipPosition = _frag_in.position;
					_i_in.normal = _frag_in.normal;
					_i_in.tangent = _frag_in.tangent;
					_i_in.bitangent = _frag_in.bitangent;
					_i_in.uv = _frag_in.uv;
					_i_in.color = _frag_in.color;
					_i_in.screen = vec2<f32>(_frag_in.position.x, _frag_in.position.y);
					_i_in.instanceIndex = i32(_frag_in.instanceIndex);
					${extra}
					`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            `return ${
              config?.attachments ? "_i_out" : "_i_out.color"
            };`.replace(/\t\n/g, "")
          );
        }
        this.startDispatch();
        let shader = device.createShaderModule({
          code: base,
        });
        this.endDispatch();
        if (!shader) throw new Error("Failed to create shader");
        instance.version++;
        let gShader = new GenericShader(base, type);
        gShader.payload = shader;
        gShader.parent = instance.parent;
        instance.parent.types[key] = gShader;
        return gShader;
      }
    }
    createShader(code, type) {
      const { device } = this.getGPU();
      if (type == "compute") {
        let gComputeShader = new GenericShader(code.webgl, type);
        gComputeShader.payload = code.software;
        gComputeShader.parent = null;
        return gComputeShader;
      }
      this.startDispatch();
      let shader = device.createShaderModule({
        code: code.webgpu,
      });
      this.endDispatch();
      if (!shader) {
        console.error("Failed to create shader");
        throw new Error("Failed to create shader");
      }
      let gShader = new GenericShader(code.webgpu, type);
      gShader.payload = shader;
      gShader.parent = null;
      return gShader;
    }
    clear(immediate = false, color = "auto") {
      this.enqueueCommand((encoder) => {
        this.getGPU();
        if (!this.depthTexture) return;
        const textureView = this.getTexture().createView();
        if (
          this.gpuTextureFormat == "depth24plus" ||
          this.gpuTextureFormat == "depth32float"
        ) {
          const clearPassDesc = {
            colorAttachments: [],
            depthStencilAttachment: {
              view: this.getTexture().createView(),
              depthClearValue: typeof color === "number" ? color : 1,
              depthLoadOp: "clear",
              depthStoreOp: "store",
            },
          };
          const passEncoder = encoder.beginRenderPass(clearPassDesc);
          passEncoder.end();
        } else {
          const clearPassDesc = {
            colorAttachments: [
              {
                view: textureView,
                clearValue: Array.isArray(color)
                  ? { r: color[0], g: color[1], b: color[2], a: color[3] }
                  : { r: 0, g: 0, b: 0, a: 0 },
                storeOp: "store",
                loadOp: "clear",
              },
            ],
            depthStencilAttachment: {
              view: this.depthTexture.createView(),
              depthClearValue: 1,
              depthLoadOp: "clear",
              depthStoreOp: "store",
            },
          };
          const passEncoder = encoder.beginRenderPass(clearPassDesc);
          passEncoder.end();
        }
      }, immediate);
    }
    fill(color, immediate = false) {
      this.enqueueCommand((encoder) => {
        this.getGPU();
        if (!this.depthTexture) return;
        const textureView = this.getTexture().createView({
          format: this.gpuTextureFormat,
        });
        const clearPassDesc = {
          colorAttachments: [
            {
              view: textureView,
              clearValue: {
                r: color[0],
                g: color[1],
                b: color[2],
                a: color[3],
              },
              storeOp: "store",
              loadOp: "clear",
            },
          ],
          depthStencilAttachment: {
            view: this.depthTexture.createView(),
            depthClearValue: 1,
            depthLoadOp: "clear",
            depthStoreOp: "store",
          },
        };
        const passEncoder = encoder.beginRenderPass(clearPassDesc);
        passEncoder.end();
      }, immediate);
    }
    unbindTexture(texture) {}
    getOrCreateMeshData(mesh) {
      const { device } = this.getGPU();
      if (mesh.symbol == null) mesh.symbol = Symbol();
      if (mesh.$__gpuMeshData) {
        return mesh.$__gpuMeshData;
      } else {
        let meshVertices = mesh.getVertices();
        let meshIndices = mesh.getTriangles();
        let meshNormals = mesh.getNormals();
        let meshTangents = mesh.getTangents();
        let meshBitangents = mesh.getBitangents();
        let meshUVs = mesh.getUVs();
        let meshColors = mesh.getColors();
        let vertexCount = meshVertices.length;
        let vertexData = new Float32Array(
          vertexCount * (3 + 3 + 3 + 3 + 2 + 4)
        );
        let indexData = new Uint32Array(meshIndices.length);
        let offset = 0;
        for (let i = 0; i < vertexCount; i++) {
          vertexData[offset++] = meshVertices[i][0];
          vertexData[offset++] = meshVertices[i][1];
          vertexData[offset++] = meshVertices[i][2];
          if (meshNormals[i]) {
            vertexData[offset++] = meshNormals[i][0];
            vertexData[offset++] = meshNormals[i][1];
            vertexData[offset++] = meshNormals[i][2];
          } else {
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
          }
          if (meshTangents[i]) {
            vertexData[offset++] = meshTangents[i][0];
            vertexData[offset++] = meshTangents[i][1];
            vertexData[offset++] = meshTangents[i][2];
          } else {
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
          }
          if (meshBitangents[i]) {
            vertexData[offset++] = meshBitangents[i][0];
            vertexData[offset++] = meshBitangents[i][1];
            vertexData[offset++] = meshBitangents[i][2];
          } else {
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
          }
          if (meshUVs[i]) {
            vertexData[offset++] = meshUVs[i][0];
            vertexData[offset++] = meshUVs[i][1];
          } else {
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
          }
          if (meshColors[i]) {
            vertexData[offset++] = meshColors[i][0];
            vertexData[offset++] = meshColors[i][1];
            vertexData[offset++] = meshColors[i][2];
            vertexData[offset++] = meshColors[i][3];
          } else {
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
            vertexData[offset++] = 0;
          }
        }
        for (let i = 0; i < meshIndices.length; i++) {
          indexData[i] = meshIndices[i];
        }
        let vertexBuffer = device.createBuffer({
          size: vertexData.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        let indexBuffer = device.createBuffer({
          size: indexData.byteLength,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(vertexBuffer, 0, vertexData);
        device.queue.writeBuffer(indexBuffer, 0, indexData);
        let meshData = new WebGPUMeshData(
          mesh,
          vertexBuffer,
          indexBuffer,
          vertexCount,
          meshIndices.length
        );
        mesh.$__gpuMeshData = meshData;
        return meshData;
      }
    }
    flushStorage() {
      const { device } = this.getGPU();
      this.startDispatch();
      if (this.storageDirty && this.texture) {
        let encoder = device.createCommandEncoder();
        encoder.copyTextureToTexture(
          { texture: this.getStorageTexture() },
          { texture: this.getTexture() },
          { width: this.texture.width, height: this.texture.height }
        );
        device.queue.submit([encoder.finish()]);
        this.storageDirty = false;
      }
      this.endDispatch();
    }
    buildUniformKey(generatedUniforms) {
      let key = [];
      const KEY_TYPES = {
        BINDING: 1241253932,
        MARK: 153925923059,
        SAMPLER: 1241253932,
        TEXTURE: 153925923059,
        BUFFER: 1241253932,
      };
      key.push(KEY_TYPES.BINDING, 0, KEY_TYPES.MARK);
      if (generatedUniforms.size > 0) {
        key.push(KEY_TYPES.BINDING, 1, KEY_TYPES.MARK);
      }
      if (generatedUniforms.special)
        for (let s of generatedUniforms.special) {
          if (s.type == "sampler2D") {
            let gpuFormat = (s.value?.texture.adapter).gpuTextureFormat;
            let texInner = s.value?.texture?.innerType ?? "float4";
            let filterMode =
              texInner == "uint8" ? "filtering" : "non-filtering";
            if (s.access == "sample_write") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.SAMPLER,
                s.index + 1,
                filterMode,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index + 2,
                KEY_TYPES.MARK
              );
            } else if (s.access == "write") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index + 1,
                gpuFormat,
                KEY_TYPES.MARK
              );
            } else if (s.access == "sample" || s.access == "read") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.SAMPLER,
                s.index + 1,
                filterMode,
                KEY_TYPES.MARK
              );
            }
          } else if (s.type == "sampler2DArray") {
            if (!s.value?.textures[0]) continue;
            let firstTexture = s.value?.textures[0];
            let gpuFormat = firstTexture.adapter.gpuTextureFormat;
            let texInner = firstTexture.innerType ?? "float4";
            let filterMode =
              texInner == "uint8" ? "filtering" : "non-filtering";
            if (s.access == "sample_write") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.SAMPLER,
                s.index + 1,
                filterMode,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index + 2,
                KEY_TYPES.MARK
              );
            } else if (s.access == "write") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index + 1,
                gpuFormat,
                KEY_TYPES.MARK
              );
            } else if (s.access == "sample" || s.access == "read") {
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.TEXTURE,
                s.index,
                gpuFormat,
                KEY_TYPES.MARK
              );
              key.push(
                KEY_TYPES.BINDING,
                KEY_TYPES.SAMPLER,
                s.index + 1,
                filterMode,
                KEY_TYPES.MARK
              );
            }
            key.push("len", s.value.textures.length);
          } else if (s.type == "array") {
            key.push(
              KEY_TYPES.BINDING,
              KEY_TYPES.BUFFER,
              s.index,
              3623,
              KEY_TYPES.MARK
            );
          } else if (s.type == "atomic") {
            key.push(
              KEY_TYPES.BINDING,
              KEY_TYPES.BUFFER,
              s.index,
              124,
              KEY_TYPES.MARK
            );
          } else if (s.type == "buffer") {
            key.push(
              KEY_TYPES.BINDING,
              KEY_TYPES.BUFFER,
              s.index,
              111,
              s.access,
              KEY_TYPES.MARK
            );
          }
        }
      return key;
    }
    bindGroupLayoutCounter = 0;
    buildUniformsForPipeline(
      shader,
      generatedUniforms,
      baseUniformBuffer,
      stage
    ) {
      let key = this.buildUniformKey(generatedUniforms).join("|");
      const { device } = this.getGPU();
      let commands = [];
      if (generatedUniforms.special) {
        for (let s of generatedUniforms.special) {
          if (s.type == "sampler2D") {
            commands.push((encoder) => {
              if (s.value && "texture" in s.value) {
                if (
                  s.value?.texture.adapter &&
                  s.value.texture.adapter instanceof WebGPUAdapter
                ) {
                  if (s.value.texture.adapter.storageDirty) {
                    this.trace("copyWritableTextureToReadable", {
                      texture: s.value.texture,
                    });
                    encoder.copyTextureToTexture(
                      { texture: s.value.texture.adapter.getStorageTexture() },
                      { texture: s.value.texture.adapter.getTexture() },
                      {
                        width: s.value.texture.size[0],
                        height: s.value.texture.size[1],
                      }
                    );
                    s.value.texture.adapter.storageDirty = false;
                    s.value.texture.cpuReadDirty = true;
                  }
                }
                s.value?.texture.flush(false);
              }
            });
            s.value?.texture?.innerType ?? "float4";
            if (s.access == "sample_write");
            else if (s.access == "write") {
              if (
                s.value?.texture.adapter &&
                s.value.texture.adapter instanceof WebGPUAdapter
              ) {
                s.value.texture.adapter.pendingWrites++;
              }
              commands.push((encoder) => {
                if (s.value && "texture" in s.value) {
                  if (
                    s.value?.texture.adapter &&
                    s.value.texture.adapter instanceof WebGPUAdapter
                  ) {
                    this.trace("markWritableTextureDirty", {
                      texture: s.value.texture,
                    });
                    s.value.texture.adapter.storageDirty = true;
                    s.value.texture.adapter.pendingWrites--;
                  }
                }
              });
            } else if (s.access == "sample" || s.access == "read");
          } else if (s.type == "sampler2DArray") {
            let needsNewTexture = false;
            if (s.value && "textures" in s.value) {
              if (!s.value?.textures.$arrTexture) {
                needsNewTexture = true;
              } else {
                if (
                  s.value.textures[0].adapter.getTexture().usage !=
                  s.value.textures.$arrTexture.usage
                ) {
                  needsNewTexture = true;
                }
                if (
                  s.value.textures[0].adapter.getTexture().format !=
                  s.value.textures.$arrTexture.format
                ) {
                  needsNewTexture = true;
                }
                if (
                  s.value.textures[0].adapter.getTexture().width !=
                  s.value.textures.$arrTexture.width
                ) {
                  needsNewTexture = true;
                }
                if (
                  s.value.textures[0].adapter.getTexture().height !=
                  s.value.textures.$arrTexture.height
                ) {
                  needsNewTexture = true;
                }
                if (
                  s.value.textures.length !=
                  s.value.textures.$arrTexture.depthOrArrayLayers
                ) {
                  needsNewTexture = true;
                }
              }
              if (needsNewTexture) {
                if (s.value.textures.$arrTexture) {
                  let oldTex = s.value.textures.$arrTexture;
                  this.enqueueCleanupCommand(() => {
                    this.trace("destroyMissizedArrayTexture", {
                      texture: oldTex,
                    });
                    oldTex.destroy();
                  });
                }
                s.value.textures.$arrTexture = device.createTexture({
                  size: [
                    s.value.textures[0].size[0],
                    s.value.textures[0].size[1],
                    s.value.textures.length,
                  ],
                  format: s.value.textures[0].adapter.gpuTextureFormat,
                  usage: s.value.textures[0].adapter.getTexture().usage,
                });
              }
            }
            commands.push((encoder) => {
              let arrDirty = false;
              let texVersions = [];
              if (s.value && "textures" in s.value) {
                if (s.value.textures.$arrTexture) {
                  if (s.value.textures.$arrTexture.$versions) {
                    texVersions = s.value.textures.$arrTexture.$versions;
                  }
                }
                if (texVersions.length != s.value.textures.length) {
                  texVersions = [];
                  for (let i = 0; i < s.value.textures.length; i++) {
                    texVersions.push(-1);
                  }
                }
                for (let [i, texture] of s.value.textures.entries()) {
                  if (
                    texture.adapter &&
                    texture.adapter instanceof WebGPUAdapter
                  ) {
                    if (texture.adapter.storageDirty) {
                      arrDirty = true;
                      encoder.copyTextureToTexture(
                        { texture: texture.adapter.getStorageTexture() },
                        { texture: texture.adapter.getTexture() },
                        { width: texture.size[0], height: texture.size[1] }
                      );
                      texture.adapter.storageDirty = false;
                      texture.cpuReadDirty = true;
                    }
                    if (texture.version != texVersions[i]) {
                      texVersions[i] = texture.version;
                      arrDirty = true;
                    }
                  }
                  texture.flush(false);
                }
                if (arrDirty) {
                  s.value.textures.$arrTexture.$versions = texVersions;
                  this.trace("copyToArrayTexture", {
                    texture: s.value.textures.$arrTexture,
                  });
                  for (let [i, texture] of s.value.textures.entries()) {
                    encoder.copyTextureToTexture(
                      {
                        texture: texture.adapter.getTexture(),
                      },
                      {
                        texture: s.value.textures.$arrTexture,
                        origin: [0, 0, i],
                      },
                      {
                        width: texture.size[0],
                        height: texture.size[1],
                        depthOrArrayLayers: 1,
                      }
                    );
                  }
                }
              }
            });
            if (s.value && "textures" in s.value) {
              for (let texture of s.value.textures) {
                texture.innerType ?? "float4";
                if (s.access == "sample_write");
                else if (s.access == "write") {
                  if (
                    texture.adapter &&
                    texture.adapter instanceof WebGPUAdapter
                  ) {
                    texture.adapter.pendingWrites++;
                  }
                  commands.push((encoder) => {
                    if (
                      texture.adapter &&
                      texture.adapter instanceof WebGPUAdapter
                    ) {
                      this.trace("markWritableTextureDirty", { texture });
                      texture.adapter.storageDirty = true;
                      texture.adapter.pendingWrites--;
                    }
                  });
                } else if (s.access == "sample" || s.access == "read");
              }
            }
          } else if (s.type == "array");
          else if (s.type == "atomic");
          else if (s.type == "buffer") {
            if (s.value && s.access == "write") {
              s.value.pendingWrites++;
            }
            commands.push((encoder) => {
              if (s.value) {
                let sv = s.value;
                if (sv.cpuWriteDirty) {
                  this.trace("uploadCPUDirtyBuffer", { buffer: s.value });
                  sv.upload();
                }
                if (s.access == "write") {
                  this.trace("markBufferDirty", { buffer: s.value });
                  sv.cpuReadDirty = true;
                  sv.pendingWrites--;
                }
              }
            });
          }
        }
      }
      let bindGroupLayout = null;
      let bindGroup = null;
      if (!shader.webgpuUniformCache) {
        shader.webgpuUniformCache = new LRUCache({
          ...lruUniformOptions,
          dispose(value, key2) {
            value.uniformBuffer.destroy();
          },
        });
      }
      let cache = void 0;
      if (shader.webgpuUniformCache) {
        cache = shader.webgpuUniformCache.get(key);
        let matches = true;
        if (!cache) {
          matches = false;
        }
        if (matches && cache) {
          bindGroupLayout = cache.bindGroupLayout;
          bindGroup = cache.bindGroup;
        }
      }
      if (!bindGroupLayout) {
        this.startDispatch();
        bindGroupLayout = device.createBindGroupLayout({
          entries: [
            {
              binding: 0,
              visibility: stage,
              buffer: {
                minBindingSize: 0,
              },
            },
            ...(generatedUniforms.size > 0
              ? [
                  {
                    binding: 1,
                    visibility: stage,
                    buffer: {
                      minBindingSize: 0,
                    },
                  },
                ]
              : []),
            ...generatedUniforms.special
              .map((s) => {
                if (s.type == "sampler2D") {
                  let sampleType = (t) => {
                    let gpuFormat = (s.value?.texture.adapter).gpuTextureFormat;
                    if (
                      gpuFormat == "depth24plus" ||
                      gpuFormat == "depth32float"
                    ) {
                      return "depth";
                    }
                    if (t == "uint8") {
                      return "float";
                    }
                    if (t.startsWith("int")) {
                      return "sint";
                    } else if (t.startsWith("uint")) {
                      return "uint";
                    } else if (t.startsWith("float")) {
                      return "unfilterable-float";
                    }
                    return "unfilterable-float";
                  };
                  let texInner = s.value?.texture?.innerType ?? "float4";
                  let filterMode =
                    texInner == "uint8" ? "filtering" : "non-filtering";
                  let sampleTypeGPU = sampleType(
                    s.value?.texture?.innerType ?? "float4"
                  );
                  if (s.access == "sample_write") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleType(texInner),
                          viewDimension: "2d",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        sampler: {
                          type: filterMode,
                        },
                      },
                      {
                        binding: s.index + 2,
                        visibility: stage,
                        storageTexture: {
                          format: (s.value?.texture.adapter).gpuTextureFormat,
                          access: "write-only",
                          viewDimension: "2d",
                        },
                      },
                    ];
                  } else if (s.access == "write") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleTypeGPU,
                          viewDimension: "2d",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        storageTexture: {
                          format: (s.value?.texture.adapter).gpuTextureFormat,
                          access: "write-only",
                          viewDimension: "2d",
                        },
                      },
                    ];
                  } else if (s.access == "sample" || s.access == "read") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleTypeGPU,
                          viewDimension: "2d",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        sampler: {
                          type: filterMode,
                        },
                      },
                    ];
                  }
                } else if (s.type == "sampler2DArray") {
                  if (!s.value?.textures[0]) return [];
                  let firstTexture = s.value?.textures[0];
                  let sampleType = (t) => {
                    let gpuFormat = firstTexture.adapter.gpuTextureFormat;
                    if (
                      gpuFormat == "depth24plus" ||
                      gpuFormat == "depth32float"
                    ) {
                      return "depth";
                    }
                    if (t == "uint8") {
                      return "float";
                    }
                    if (t.startsWith("int")) {
                      return "sint";
                    } else if (t.startsWith("uint")) {
                      return "uint";
                    } else if (t.startsWith("float")) {
                      return "unfilterable-float";
                    }
                    return "unfilterable-float";
                  };
                  let texInner = firstTexture.innerType ?? "float4";
                  let filterMode =
                    texInner == "uint8" ? "filtering" : "non-filtering";
                  let sampleTypeGPU = sampleType(
                    firstTexture.innerType ?? "float4"
                  );
                  if (s.access == "sample_write") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleType(texInner),
                          viewDimension: "2d-array",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        sampler: {
                          type: filterMode,
                        },
                      },
                      {
                        binding: s.index + 2,
                        visibility: stage,
                        storageTexture: {
                          format: firstTexture.adapter.gpuTextureFormat,
                          access: "write-only",
                          viewDimension: "2d-array",
                        },
                      },
                    ];
                  } else if (s.access == "write") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleTypeGPU,
                          viewDimension: "2d-array",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        storageTexture: {
                          format: firstTexture.adapter.gpuTextureFormat,
                          access: "write-only",
                          viewDimension: "2d-array",
                        },
                      },
                    ];
                  } else if (s.access == "sample" || s.access == "read") {
                    return [
                      {
                        binding: s.index,
                        visibility: stage,
                        texture: {
                          sampleType: sampleTypeGPU,
                          viewDimension: "2d-array",
                          multisampled: false,
                        },
                      },
                      {
                        binding: s.index + 1,
                        visibility: stage,
                        sampler: {
                          type: filterMode,
                        },
                      },
                    ];
                  }
                } else if (s.type == "array") {
                  return [
                    {
                      binding: s.index,
                      visibility: stage,
                      buffer: { type: "read-only-storage" },
                    },
                  ];
                } else if (s.type == "atomic") {
                  return [
                    {
                      binding: s.index,
                      visibility: stage,
                      buffer: { type: "storage" },
                    },
                  ];
                } else if (s.type == "buffer") {
                  return [
                    {
                      binding: s.index,
                      visibility: stage,
                      buffer: {
                        type:
                          s.access == "read" ? "read-only-storage" : "storage",
                      },
                    },
                  ];
                }
              })
              .flat(),
          ],
        });
        bindGroupLayout.$__gpuKey = this.bindGroupLayoutCounter++;
        this.endDispatch();
      }
      let outUniformBuffer = cache?.uniformBuffer;
      let outSpecialBuffers = cache?.specialBuffers;
      if (cache) {
        if (cache.cachedUniforms) {
          let matches =
            generatedUniforms.data.byteLength ==
            cache.cachedUniforms.byteLength;
          let uintView = new Uint8Array(generatedUniforms.data);
          let uintView2 = new Uint8Array(cache.cachedUniforms);
          if (matches) {
            for (let i = 0; i < uintView.length; i++) {
              if (uintView[i] != uintView2[i]) {
                matches = false;
                break;
              }
            }
          }
          if (!matches) {
            if (outUniformBuffer) {
              let oldBuffer = outUniformBuffer;
              this.enqueueCleanupCommand(() => {
                oldBuffer.destroy();
              });
            }
            bindGroup = null;
            outUniformBuffer = void 0;
          }
        }
      }
      let specialsKey = [];
      let alwaysDirty = false;
      for (let special of generatedUniforms.special) {
        if (special.type == "sampler2D") {
          if (!special.value || !("texture" in special.value)) continue;
          let tex = special.value.texture;
          if (tex.image) {
            let texture;
            if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
              let texCtx = tex.adapter.getTexture();
              texture = texCtx;
              if (!texture) continue;
              specialsKey.push(
                5623462,
                special.index,
                tex.symbol,
                tex.innerType,
                special.access
              );
            }
          } else {
            return;
          }
        } else if (special.type == "sampler2DArray") {
          if (!special.value || !("textures" in special.value)) continue;
          let tex = special.value.textures[0];
          if (tex) {
            if (tex.image) {
              let texture;
              if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
                let texCtx = tex.adapter.getTexture();
                texture = texCtx;
                if (!texture) continue;
                specialsKey.push(
                  5653223462,
                  special.index,
                  tex.symbol,
                  tex.innerType,
                  special.access
                );
              }
            }
          } else {
            return;
          }
        } else if (special.type == "array" && special.value) {
          specialsKey.push(5523462, special.index);
          alwaysDirty = true;
        } else if (special.type == "buffer" && special.value) {
          specialsKey.push(
            1253462,
            special.index,
            special.access,
            special.value.symbol
          );
        } else if (special.type == "atomic" && special.value) {
          specialsKey.push(125342, special.index);
          alwaysDirty = true;
        } else {
          throw new Error(`Unknown special type ${special.type}`);
        }
      }
      let specialsDirty = false;
      if (cache) {
        if (cache.specialsKey.length != specialsKey.length) {
          specialsDirty = true;
        } else {
          for (let i = 0; i < specialsKey.length; i++) {
            if (cache.specialsKey[i] != specialsKey[i]) {
              specialsDirty = true;
              break;
            }
          }
        }
      } else {
        specialsDirty = true;
      }
      let specialEntries = void 0;
      if (cache) {
        specialEntries = cache.specialEntries;
      }
      if (alwaysDirty || specialsDirty) {
        outSpecialBuffers = void 0;
        specialEntries = void 0;
      }
      if (
        !bindGroup ||
        !outUniformBuffer ||
        !outSpecialBuffers ||
        !specialEntries
      ) {
        let outEntries = [
          { binding: 0, resource: { buffer: baseUniformBuffer } },
        ];
        if (!outSpecialBuffers || !specialEntries) {
          outSpecialBuffers = [];
          specialEntries = [];
          for (let special of generatedUniforms.special) {
            if (special.type == "sampler2D") {
              if (!special.value || !("texture" in special.value)) continue;
              let tex = special.value.texture;
              if (tex.image) {
                let texture;
                if (
                  tex.adapter instanceof WebGPUAdapter &&
                  tex.adapter.texture
                ) {
                  let texCtx = tex.adapter.getTexture();
                  texture = texCtx;
                  if (!texture) continue;
                  let filterable = tex.innerType == "uint8";
                  if (special.access == "sample_write") {
                    const sampler = device.createSampler(
                      filterable
                        ? {
                            magFilter: "linear",
                            minFilter: "linear",
                          }
                        : {}
                    );
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: sampler,
                    });
                    specialEntries.push({
                      binding: special.index + 2,
                      resource: tex.adapter.getStorageTexture().createView(),
                    });
                  } else if (special.access == "write") {
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: tex.adapter.getStorageTexture().createView(),
                    });
                  } else if (
                    special.access == "read" ||
                    special.access == "sample"
                  ) {
                    const sampler = device.createSampler(
                      filterable
                        ? {
                            magFilter: "linear",
                            minFilter: "linear",
                          }
                        : {}
                    );
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: sampler,
                    });
                  }
                }
              } else {
                return;
              }
            } else if (special.type == "sampler2DArray") {
              if (!special.value || !("textures" in special.value)) continue;
              if (special.value.textures.$arrTexture) {
                if (special.value.textures.$arrTexture instanceof GPUTexture) {
                  let tex = special.value.textures[0];
                  if (!tex) return;
                  let texture = special.value.textures.$arrTexture;
                  let filterable = tex.innerType == "uint8";
                  if (special.access == "sample_write") {
                    const sampler = device.createSampler(
                      filterable
                        ? {
                            magFilter: "linear",
                            minFilter: "linear",
                          }
                        : {}
                    );
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: sampler,
                    });
                    specialEntries.push({
                      binding: special.index + 2,
                      resource: tex.adapter.getStorageTexture().createView(),
                    });
                    throw new Error(
                      "Writing to texture arrays is not supported yet"
                    );
                  } else if (special.access == "write") {
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: tex.adapter.getStorageTexture().createView(),
                    });
                    throw new Error(
                      "Writing to texture arrays is not supported yet"
                    );
                  } else if (
                    special.access == "read" ||
                    special.access == "sample"
                  ) {
                    const sampler = device.createSampler(
                      filterable
                        ? {
                            magFilter: "linear",
                            minFilter: "linear",
                          }
                        : {}
                    );
                    specialEntries.push({
                      binding: special.index,
                      resource: texture.createView({
                        format: tex.adapter.gpuTextureFormat,
                        arrayLayerCount: special.value.textures.length,
                        baseArrayLayer: 0,
                        dimension: "2d-array",
                      }),
                    });
                    specialEntries.push({
                      binding: special.index + 1,
                      resource: sampler,
                    });
                  }
                }
              }
            } else if (special.type == "array" && special.value) {
              let buffer = device.createBuffer({
                size: special.value.size,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
              });
              outSpecialBuffers.push(buffer);
              specialEntries.push({
                binding: special.index,
                resource: { buffer },
              });
            } else if (special.type == "buffer" && special.value) {
              let buf = this.getOrCreateBuffer(
                special.value,
                this.genericBufferFlags()
              );
              outSpecialBuffers.push(buf);
              specialEntries.push({
                binding: special.index,
                resource: { buffer: buf },
              });
            } else if (special.type == "atomic" && special.value) {
              let buf = device.createBuffer({
                size: 4,
                usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
              });
              outSpecialBuffers.push(buf);
              specialEntries.push({
                binding: special.index,
                resource: {
                  buffer: buf,
                },
              });
            } else {
              throw new Error(`Unknown special type ${special.type}`);
            }
          }
        }
        let needsUniformWrite = false;
        if (!outUniformBuffer) {
          outUniformBuffer = device.createBuffer({
            size: generatedUniforms.size,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
          });
          needsUniformWrite = true;
        }
        if (generatedUniforms.size > 0) {
          outEntries.push({
            binding: 1,
            resource: { buffer: outUniformBuffer },
          });
          if (needsUniformWrite)
            device.queue.writeBuffer(
              outUniformBuffer,
              0,
              generatedUniforms.data
            );
        }
        for (let i = 0; i < specialEntries.length; i++) {
          outEntries.push(specialEntries[i]);
        }
        let bufCounter = 0;
        for (let i = 0; i < generatedUniforms.special.length; i++) {
          let special = generatedUniforms.special[i];
          if (special.type == "array" && special.value) {
            device.queue.writeBuffer(
              outSpecialBuffers[bufCounter++],
              0,
              special.value.buffer
            );
          }
        }
        bindGroup = device.createBindGroup({
          layout: bindGroupLayout,
          entries: outEntries,
        });
      }
      if (cache) {
        cache.key = key;
        cache.bindGroupLayout = bindGroupLayout;
        cache.bindGroup = bindGroup;
        cache.uniformBuffer = outUniformBuffer;
        cache.specialBuffers = outSpecialBuffers;
        cache.cachedUniforms = generatedUniforms.data;
        cache.specialsKey = specialsKey;
        cache.specialEntries = specialEntries;
      } else {
        shader.webgpuUniformCache.set(key, {
          key,
          bindGroupLayout,
          bindGroup,
          uniformBuffer: outUniformBuffer,
          specialBuffers: outSpecialBuffers,
          cachedUniforms: generatedUniforms.data,
          specialsKey,
          specialEntries,
        });
      }
      return {
        bindGroupLayout,
        bindGroup,
        uniformBuffer: outUniformBuffer,
        specialBuffers: outSpecialBuffers,
        commands,
      };
    }
    writeStructuredBuffer(structure, raw, buffer, offset = 0) {
      let rootObj = {
        val: raw,
      };
      let queue = [[["val", structure], rootObj, null]];
      writeBufferStructure(queue, rootObj, buffer, offset);
    }
    readStructuredBuffer(structure, buffer, offset = 0) {
      if (structure.type == "array") {
        let arr = [];
        if ("staticSize" in structure && structure.staticSize != null) {
          let elSize = getValueSize(structure.element);
          for (let i = 0; i < structure.staticSize; i++) {
            arr.push(
              this.readStructuredBuffer(structure.element, buffer, offset)
            );
            offset += elSize / 4;
          }
          return arr;
        } else {
          throw new Error(`Unable to read dynamic array`);
        }
      } else if (structure.type == "primitive") {
        let uview = new Uint32Array(buffer);
        let iview = new Int32Array(buffer);
        let fview = new Float32Array(buffer);
        if (structure.name == "uint4") {
          return [
            uview[offset],
            uview[offset + 1],
            uview[offset + 2],
            uview[offset + 3],
          ];
        } else if (structure.name == "int4") {
          return [
            iview[offset],
            iview[offset + 1],
            iview[offset + 2],
            iview[offset + 3],
          ];
        } else if (structure.name == "float4") {
          return [
            fview[offset],
            fview[offset + 1],
            fview[offset + 2],
            fview[offset + 3],
          ];
        } else if (structure.name == "uint3") {
          return [uview[offset], uview[offset + 1], uview[offset + 2]];
        } else if (structure.name == "int3") {
          return [iview[offset], iview[offset + 1], iview[offset + 2]];
        } else if (structure.name == "float3") {
          return [fview[offset], fview[offset + 1], fview[offset + 2]];
        } else if (structure.name == "uint2") {
          return [uview[offset], uview[offset + 1]];
        } else if (structure.name == "int2") {
          return [iview[offset], iview[offset + 1]];
        } else if (structure.name == "float2") {
          return [fview[offset], fview[offset + 1]];
        } else if (structure.name == "uint") {
          return uview[offset];
        } else if (structure.name == "int") {
          return iview[offset];
        } else if (structure.name == "float") {
          return fview[offset];
        } else if (structure.name == "bool") {
          return uview[offset] == 1;
        } else if (structure.name == "float2x2") {
          return window.applyMatrix2x2Methods([
            [fview[offset], fview[offset + 1]],
            [fview[offset + 2], fview[offset + 3]],
          ]);
        } else if (structure.name == "float3x3") {
          return window.applyMatrix3x3Methods([
            [fview[offset], fview[offset + 1], fview[offset + 2]],
            [fview[offset + 3], fview[offset + 4], fview[offset + 5]],
            [fview[offset + 6], fview[offset + 7], fview[offset + 8]],
          ]);
        } else if (structure.name == "float4x4") {
          return window.applyMatrix4x4Methods([
            [
              fview[offset],
              fview[offset + 1],
              fview[offset + 2],
              fview[offset + 3],
            ],
            [
              fview[offset + 4],
              fview[offset + 5],
              fview[offset + 6],
              fview[offset + 7],
            ],
            [
              fview[offset + 8],
              fview[offset + 9],
              fview[offset + 10],
              fview[offset + 11],
            ],
            [
              fview[offset + 12],
              fview[offset + 13],
              fview[offset + 14],
              fview[offset + 15],
            ],
          ]);
        } else if (structure.name == "atomic") {
          if (structure.element.type == "primitive") {
            if (structure.element.name == "uint") {
              return window.makeAtomic(uview[offset]);
            } else if (structure.element.name == "int") {
              return window.makeAtomic(iview[offset]);
            }
          }
        } else {
          throw new Error(`Unable to convert primitive type ${structure.name}`);
        }
      } else if (structure.type == "struct") {
        let out = {};
        for (let field of structure.fields) {
          let size = getValueSize(field[1]);
          out[field[0]] = this.readStructuredBuffer(
            field[1],
            buffer,
            offset / 4
          );
          offset += size;
        }
        let clazz = window.__shadeup_structs[structure.name].struct;
        if (clazz) {
          return new clazz(out);
        }
      } else {
        throw new Error(`Unable to convert type ${structure.type}`);
      }
    }
    buildComputePipeline(shader, computeUniform) {
      const { device } = this.getGPU();
      let commands = [];
      this.baseUniformValues;
      const baseUniformBufferSize = this.baseUniformBufferSize;
      const baseUniformBuffer = device.createBuffer({
        size: baseUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const compute = this.buildUniformsForPipeline(
        shader,
        computeUniform,
        baseUniformBuffer,
        GPUShaderStage.COMPUTE
      );
      if (!compute) {
        return;
      }
      commands = compute.commands;
      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [compute.bindGroupLayout],
      });
      this.startDispatch();
      let pipeline = device.createComputePipeline({
        label: "compute pipeline",
        layout: pipelineLayout,
        compute: {
          module: shader.payload,
          entryPoint: "main",
        },
      });
      this.endDispatch();
      return {
        pipeline,
        bindGroup: compute.bindGroup,
        baseUniformBuffer,
        uniformBuffer: compute.uniformBuffer,
        specialBuffers: compute.specialBuffers,
        commands,
      };
    }
    cachedPipelines = /* @__PURE__ */ new Map();
    cachedPipelineLayouts = /* @__PURE__ */ new Map();
    setupDrawPipeline(
      shaders,
      fragmentUniform,
      vertexUniform,
      options,
      ignoreVertexLayout = false
    ) {
      const { device } = this.getGPU();
      if (!this.baseUniformBuffer) {
        throw new Error("Base uniform buffer not initialized");
      }
      let commands = [];
      const fragment = this.buildUniformsForPipeline(
        shaders.fragment,
        fragmentUniform,
        this.baseUniformBuffer,
        GPUShaderStage.FRAGMENT
      );
      const vertex = this.buildUniformsForPipeline(
        shaders.vertex,
        vertexUniform,
        this.baseUniformBuffer,
        GPUShaderStage.VERTEX
      );
      if (!fragment || !vertex) {
        return;
      }
      commands.push(...fragment.commands);
      commands.push(...vertex.commands);
      let pipelineLayoutKey = `${shaders.fragment.uniqueSourceKey}_${fragment.bindGroupLayout.$__gpuKey}_${shaders.vertex.uniqueSourceKey}_${vertex.bindGroupLayout.$__gpuKey}`;
      let pipelineLayout;
      if (this.cachedPipelineLayouts.has(pipelineLayoutKey)) {
        pipelineLayout = this.cachedPipelineLayouts.get(pipelineLayoutKey);
      } else {
        pipelineLayout = device.createPipelineLayout({
          bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout],
        });
        this.cachedPipelineLayouts.set(pipelineLayoutKey, pipelineLayout);
      }
      if (!this.depthTexture) {
        throw new Error("Depth texture not initialized");
      }
      let pipelineKey =
        pipelineLayoutKey +
        this.depthTexture.format +
        options.depthTest +
        options.depthFormat +
        options.depthOnly +
        options.backfaceCulling +
        options.depthCompare +
        options.attachments?.length;
      let pipeline;
      if (this.cachedPipelines.has(pipelineKey)) {
        pipeline = this.cachedPipelines.get(pipelineKey);
      } else {
        const generateTarget = (adap) => {
          return {
            format: adap.headless ? adap.gpuTextureFormat : "rgba8unorm",
            blend: FormatCapabilities[adap.gpuTextureFormat].blendable
              ? {
                  alpha: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                  },
                  color: {
                    srcFactor: "src-alpha",
                    dstFactor: "one-minus-src-alpha",
                    operation: "add",
                  },
                }
              : void 0,
          };
        };
        const pipelineDescriptor = {
          vertex: {
            module: shaders.vertex.payload,
            entryPoint: "main",
            buffers: ignoreVertexLayout ? [] : vertexLayout,
          },
          ...(options.depthOnly
            ? {}
            : {
                fragment: {
                  module: shaders.fragment.payload,
                  entryPoint: "main",
                  targets:
                    options.attachments && options.attachments.length > 0
                      ? options.attachments.map((att) =>
                          generateTarget(att.adapter)
                        )
                      : [generateTarget(this)],
                },
              }),
          primitive: {
            topology: "triangle-list",
            cullMode: options.backfaceCulling ? "back" : "none",
          },
          ...(options.depthTest
            ? {
                depthStencil: {
                  depthWriteEnabled: true,
                  depthCompare: options.depthCompare ?? "less",
                  format: options.depthFormat ?? "depth24plus",
                },
              }
            : {}),
          layout: pipelineLayout,
        };
        this.startDispatch();
        pipeline = device.createRenderPipeline(pipelineDescriptor);
        this.endDispatch();
        this.cachedPipelines.set(pipelineKey, pipeline);
      }
      let drawData = {
        pipeline,
        bindGroupFragment: fragment.bindGroup,
        bindGroupVertex: vertex.bindGroup,
        baseUniformBuffer: this.baseUniformBuffer,
        vertexUniformBuffer: vertex.uniformBuffer,
        fragmentUniformBuffer: fragment.uniformBuffer,
        specialBuffersFragment: fragment.specialBuffers,
        specialBuffersVertex: vertex.specialBuffers,
        commands,
      };
      return drawData;
    }
    buildDrawPipeline(
      shaders,
      fragmentUniform,
      vertexUniform,
      options,
      ignoreVertexLayout = false
    ) {
      const { device } = this.getGPU();
      let commands = [];
      this.baseUniformValues;
      const baseUniformBufferSize = this.baseUniformBufferSize;
      const baseUniformBuffer = device.createBuffer({
        size: baseUniformBufferSize,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
      });
      const fragment = this.buildUniformsForPipeline(
        shaders.fragment,
        fragmentUniform,
        baseUniformBuffer,
        GPUShaderStage.FRAGMENT
      );
      const vertex = this.buildUniformsForPipeline(
        shaders.vertex,
        vertexUniform,
        baseUniformBuffer,
        GPUShaderStage.VERTEX
      );
      if (!fragment || !vertex) {
        return;
      }
      commands.push(...fragment.commands);
      commands.push(...vertex.commands);
      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout],
      });
      if (!this.depthTexture) {
        throw new Error("Depth texture not initialized");
      }
      const generateTarget = (adap) => {
        return {
          format: adap.headless ? adap.gpuTextureFormat : "rgba8unorm",
          blend: FormatCapabilities[adap.gpuTextureFormat].blendable
            ? {
                alpha: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
                color: {
                  srcFactor: "src-alpha",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
              }
            : void 0,
        };
      };
      const pipelineDescriptor = {
        vertex: {
          module: shaders.vertex.payload,
          entryPoint: "main",
          buffers: ignoreVertexLayout ? [] : vertexLayout,
        },
        ...(options.depthOnly
          ? {}
          : {
              fragment: {
                module: shaders.fragment.payload,
                entryPoint: "main",
                targets:
                  options.attachments && options.attachments.length > 0
                    ? options.attachments.map((att) =>
                        generateTarget(att.adapter)
                      )
                    : [generateTarget(this)],
              },
            }),
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
        ...(options.depthTest
          ? {
              depthStencil: {
                depthWriteEnabled: true,
                depthCompare: "less",
                format: options.depthFormat ?? "depth24plus",
              },
            }
          : {}),
        layout: pipelineLayout,
      };
      this.startDispatch();
      let pipeline = device.createRenderPipeline(pipelineDescriptor);
      this.endDispatch();
      let drawData = {
        pipeline,
        bindGroupFragment: fragment.bindGroup,
        bindGroupVertex: vertex.bindGroup,
        baseUniformBuffer,
        vertexUniformBuffer: vertex.uniformBuffer,
        fragmentUniformBuffer: fragment.uniformBuffer,
        specialBuffersFragment: fragment.specialBuffers,
        specialBuffersVertex: vertex.specialBuffers,
        commands,
      };
      return drawData;
    }
    getTexture() {
      if (!this.headless) {
        if (this.ctx) {
          return this.ctx.getCurrentTexture();
        } else {
          throw new Error("No context");
        }
      } else {
        return this.texture;
      }
    }
    getStorageTexture() {
      const { device } = this.getGPU();
      if (!this.storageTexture) {
        this.startDispatch();
        this.storageTexture = device.createTexture({
          size: {
            width: this.headlessWidth,
            height: this.headlessHeight,
          },
          format: this.gpuTextureFormat,
          dimension: "2d",
          viewFormats: [this.gpuTextureFormat],
          usage:
            GPUTextureUsage.RENDER_ATTACHMENT |
            GPUTextureUsage.STORAGE_BINDING |
            GPUTextureUsage.COPY_SRC |
            GPUTextureUsage.COPY_DST,
        });
        this.endDispatch();
      }
      return this.storageTexture;
    }
    commandQueue = [];
    cleanupCommands = [];
    immediate = false;
    enqueueCommand(command, immediate = false) {
      if (this.immediate || immediate) {
        const { device } = this.getGPU();
        this.startDispatch();
        let encoder = device.createCommandEncoder();
        let result = command(encoder);
        device.queue.submit([encoder.finish()]);
        if (result) {
          result();
        }
        this.endDispatch();
      } else {
        this.commandQueue.push(command);
      }
    }
    enqueueCleanupCommand(command) {
      let cmd = command;
      cmd.$counter = 10;
      this.cleanupCommands.push(cmd);
    }
    dispatchCompute(dispatch) {
      this.trace("enqueueCompute", { dispatch });
      const { device } = this.getGPU();
      if (!dispatch.computeShader) {
        throw new Error("Dispatch is missing compute shader");
      }
      `${dispatch.computeShader.uniqueSourceKey}`;
      const computeUniform = generateUniforms(
        dispatch.fragmentUniforms,
        dispatch.computeShader
      );
      let output = this.buildComputePipeline(
        dispatch.computeShader,
        computeUniform
      );
      this.enqueueCommand((encoder) => {
        if (output)
          for (let command of output.commands) {
            command(encoder);
          }
        const pass = encoder.beginComputePass({
          label: "compute builtin pass",
        });
        let baseUniformValues = this.baseUniformValues;
        this.baseUniformBufferSize;
        baseUniformValues.set([0, 0], 0);
        let computeData;
        {
          if (!output) return;
          computeData = output;
        }
        let {
          pipeline,
          bindGroup,
          baseUniformBuffer,
          uniformBuffer,
          specialBuffers,
        } = computeData;
        device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
        device.queue.writeBuffer(uniformBuffer, 0, computeUniform.data);
        let bufCounter = 0;
        for (let i = 0; i < computeUniform.special.length; i++) {
          let special = computeUniform.special[i];
          if (special.type == "array" && special.value) {
            this.trace("writeArray", { special });
            device.queue.writeBuffer(
              specialBuffers[bufCounter++],
              0,
              special.value.buffer
            );
          }
        }
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        if (dispatch.indirectBuffer) {
          pass.dispatchWorkgroupsIndirect(
            this.getOrCreateBuffer(
              dispatch.indirectBuffer,
              GPUBufferUsage.INDIRECT
            ),
            dispatch.indirectOffset
          );
        } else {
          pass.dispatchWorkgroups(...dispatch.computeCount);
        }
        this.trace("dispatchCompute", { dispatch });
        pass.end();
      });
    }
    writeSpecialBuffer(buffer, data) {
      const { device } = this.getGPU();
      this.startDispatch();
      device.queue.writeBuffer(buffer, 0, data);
      this.endDispatch();
    }
    beforeScreenDraw() {
      if (!this.clearEnqueued) {
        this.enqueueCommand((encoder) => {
          this.getGPU();
          if (!this.depthTexture) return;
          const textureView = this.getTexture().createView();
          if (
            this.gpuTextureFormat == "depth24plus" ||
            this.gpuTextureFormat == "depth32float"
          ) {
            const clearPassDesc = {
              colorAttachments: [],
              depthStencilAttachment: {
                view: textureView,
                depthClearValue: 1,
                depthLoadOp: "clear",
                depthStoreOp: "store",
              },
            };
            const passEncoder = encoder.beginRenderPass(clearPassDesc);
            passEncoder.end();
          } else {
            const clearPassDesc = {
              colorAttachments: [
                {
                  view: textureView,
                  clearValue: { r: 0, g: 0, b: 0, a: 0 },
                  storeOp: "store",
                  loadOp: "clear",
                },
              ],
              depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1,
                depthLoadOp: "clear",
                depthStoreOp: "store",
              },
            };
            const passEncoder = encoder.beginRenderPass(clearPassDesc);
            passEncoder.end();
          }
          this.clearEnqueued = false;
        });
        this.clearEnqueued = true;
      }
    }
    dispatchDraw(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      this.trace("enqueueDraw", { dispatch, options });
      const { device } = this.getGPU();
      if (!dispatch.vertexShader || !dispatch.fragmentShader) {
        throw new Error("Dispatch is missing vertex or fragment shader");
      }
      if (!dispatch.geometry && !dispatch.indirectBuffer) {
        throw new Error("Dispatch is missing geometry");
      }
      if (!this.depthTexture) {
        throw new Error("Depth texture not created");
      }
      this.startDispatch();
      if (dispatch.overrideDepth) {
        if (dispatch.overrideDepth.adapter instanceof WebGPUAdapter) {
          dispatch.overrideDepth.adapter.flush();
        }
      }
      let fragment = dispatch.fragmentShader;
      let vertex = dispatch.vertexShader;
      const fragmentUniform = generateUniforms(
        dispatch.fragmentUniforms,
        dispatch.fragmentShader
      );
      const vertexUniform = generateUniforms(
        dispatch.vertexUniforms,
        dispatch.vertexShader
      );
      `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
      let depthTex = dispatch.overrideDepth
        ? dispatch.overrideDepth.adapter.getTexture()
        : this.depthTexture;
      let output = this.setupDrawPipeline(
        {
          fragment,
          vertex,
        },
        fragmentUniform,
        vertexUniform,
        {
          ...options,
          depthFormat: depthTex.format,
          depthOnly: dispatch.depthOnly,
          attachments: dispatch.attachments ?? [],
          depthCompare:
            dispatch.depthCompare == "auto" ? "less" : dispatch.depthCompare,
          backfaceCulling: dispatch.backfaceCulling,
        }
      );
      this.beforeScreenDraw();
      this.enqueueCommand((encoder) => {
        if (output)
          for (let command of output.commands) {
            command(encoder);
          }
        let attachments = [];
        if (!dispatch.depthOnly) {
          if (!dispatch.attachments) {
            attachments.push({
              view: this.getTexture().createView(),
              storeOp: "store",
              loadOp: "load",
            });
          } else {
            for (let attachment of dispatch.attachments) {
              if (attachment.adapter instanceof WebGPUAdapter) {
                let view = attachment.adapter.getTexture().createView();
                attachments.push({
                  view,
                  storeOp: "store",
                  loadOp: "load",
                });
              }
            }
          }
        }
        let passDescriptor = {
          colorAttachments: attachments,
          ...(options.depthTest
            ? {
                depthStencilAttachment: {
                  view: depthTex.createView(),
                  depthClearValue: 1,
                  depthLoadOp: "load",
                  depthStoreOp: "store",
                },
              }
            : {}),
        };
        const pass = encoder.beginRenderPass(passDescriptor);
        let myTex = this.getTexture();
        let baseUniformValues = this.baseUniformValues;
        this.baseUniformBufferSize;
        baseUniformValues.set([myTex.width, myTex.height], 0);
        let drawData;
        if (!output) return;
        drawData = output;
        let {
          pipeline,
          bindGroupFragment,
          bindGroupVertex,
          baseUniformBuffer,
          vertexUniformBuffer,
          fragmentUniformBuffer,
          specialBuffersFragment,
          specialBuffersVertex,
        } = drawData;
        pass.setPipeline(pipeline);
        device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
        pass.setBindGroup(0, bindGroupFragment);
        pass.setBindGroup(1, bindGroupVertex);
        if (dispatch.indirectBuffer) {
          if (dispatch.geometry) {
            let meshData = this.getOrCreateMeshData(dispatch.geometry);
            pass.setVertexBuffer(0, meshData.vertexBuffer);
            pass.setIndexBuffer(meshData.indexBuffer, "uint32");
          }
          if (dispatch.indexBuffer) {
            if (dispatch.indexBuffer) {
              pass.setIndexBuffer(
                this.getOrCreateBuffer(
                  dispatch.indexBuffer,
                  GPUBufferUsage.INDEX
                ),
                "uint32"
              );
            }
            if (dispatch.indirectBuffer.elementCount % 5 != 0) {
              throw new Error(
                "Indirect buffer needs to be a multiple of 5 (must be at least 5 elements for indexedIndirect)"
              );
            }
            pass.drawIndexedIndirect(
              this.getOrCreateBuffer(
                dispatch.indirectBuffer,
                GPUBufferUsage.INDIRECT
              ),
              dispatch.indirectOffset
            );
          } else {
            if (dispatch.indirectBuffer.elementCount % 4 != 0) {
              throw new Error(
                "Indirect buffer needs to be a multiple of 4 (must be at least 4 elements for indirect)"
              );
            }
            pass.drawIndirect(
              this.getOrCreateBuffer(
                dispatch.indirectBuffer,
                GPUBufferUsage.INDIRECT
              ),
              dispatch.indirectOffset
            );
          }
        } else if (dispatch.geometry) {
          let meshData = this.getOrCreateMeshData(dispatch.geometry);
          pass.setVertexBuffer(0, meshData.vertexBuffer);
          if (meshData.indexCount > 0) {
            pass.setIndexBuffer(meshData.indexBuffer, "uint32");
            pass.drawIndexed(meshData.indexCount, dispatch.instanceCount);
          } else {
            pass.draw(meshData.vertexCount, dispatch.instanceCount);
          }
        }
        this.trace("dispatchDraw", { dispatch, options });
        pass.end();
        return () => {};
      });
    }
    dispatchDrawIndexed(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      const { device } = this.getGPU();
      if (!dispatch.vertexShader || !dispatch.fragmentShader) {
        throw new Error("Dispatch is missing vertex or fragment shader");
      }
      if (!dispatch.indexBuffer) {
        throw new Error("Dispatch is missing indexBuffer");
      }
      this.startDispatch();
      let fragment = dispatch.fragmentShader;
      let vertex = dispatch.vertexShader;
      const fragmentUniform = generateUniforms(
        dispatch.fragmentUniforms,
        dispatch.fragmentShader
      );
      const vertexUniform = generateUniforms(
        dispatch.vertexUniforms,
        dispatch.vertexShader
      );
      `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
      let output = this.buildDrawPipeline(
        {
          fragment,
          vertex,
        },
        fragmentUniform,
        vertexUniform,
        options,
        true
      );
      this.beforeScreenDraw();
      this.enqueueCommand((encoder) => {
        if (output)
          for (let command of output.commands) {
            command(encoder);
          }
        if (!this.depthTexture) {
          throw new Error("Depth texture not created");
        }
        let passDescriptor = {
          colorAttachments: [
            {
              view: this.getTexture().createView(),
              storeOp: "store",
              loadOp: "load",
            },
          ],
          depthStencilAttachment: {
            view: this.depthTexture.createView(),
            depthClearValue: 1,
            depthLoadOp: "load",
            depthStoreOp: "store",
          },
        };
        const pass = encoder.beginRenderPass(passDescriptor);
        let baseUniformValues = this.baseUniformValues;
        this.baseUniformBufferSize;
        let myTex = this.getTexture();
        baseUniformValues.set([myTex.width, myTex.height], 0);
        let drawData;
        {
          if (!output) return;
          drawData = output;
        }
        let {
          pipeline,
          bindGroupFragment,
          bindGroupVertex,
          baseUniformBuffer,
          vertexUniformBuffer,
          fragmentUniformBuffer,
          specialBuffersFragment,
          specialBuffersVertex,
        } = drawData;
        pass.setPipeline(pipeline);
        device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
        device.queue.writeBuffer(
          fragmentUniformBuffer,
          0,
          fragmentUniform.data
        );
        let bufCounterFrag = 0;
        for (let i = 0; i < fragmentUniform.special.length; i++) {
          let special = fragmentUniform.special[i];
          if (special.type == "array" && special.value) {
            device.queue.writeBuffer(
              specialBuffersFragment[bufCounterFrag++],
              0,
              special.value.buffer
            );
          }
        }
        device.queue.writeBuffer(vertexUniformBuffer, 0, vertexUniform.data);
        let bufCounterVert = 0;
        for (let i = 0; i < vertexUniform.special.length; i++) {
          let special = vertexUniform.special[i];
          if (special.type == "array" && special.value) {
            device.queue.writeBuffer(
              specialBuffersVertex[bufCounterVert++],
              0,
              special.value.buffer
            );
          }
        }
        pass.setBindGroup(0, bindGroupFragment);
        pass.setBindGroup(1, bindGroupVertex);
        pass.setIndexBuffer(
          this.getOrCreateBuffer(dispatch.indexBuffer, GPUBufferUsage.INDEX),
          "uint32"
        );
        pass.drawIndexed(dispatch.indexBuffer.len(), dispatch.instanceCount);
        pass.end();
      });
    }
    dispatchDrawCount(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      const { device } = this.getGPU();
      if (!dispatch.vertexShader || !dispatch.fragmentShader) {
        throw new Error("Dispatch is missing vertex or fragment shader");
      }
      this.startDispatch();
      let fragment = dispatch.fragmentShader;
      let vertex = dispatch.vertexShader;
      `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
      const fragmentUniform = generateUniforms(
        dispatch.fragmentUniforms,
        dispatch.fragmentShader
      );
      const vertexUniform = generateUniforms(
        dispatch.vertexUniforms,
        dispatch.vertexShader
      );
      let output = this.buildDrawPipeline(
        {
          fragment,
          vertex,
        },
        fragmentUniform,
        vertexUniform,
        options,
        true
      );
      this.beforeScreenDraw();
      this.enqueueCommand((encoder) => {
        if (output)
          for (let command of output.commands) {
            command(encoder);
          }
        if (!this.depthTexture) {
          throw new Error("Depth texture not created");
        }
        let passDescriptor = {
          colorAttachments: [
            {
              view: this.getTexture().createView(),
              storeOp: "store",
              loadOp: "load",
            },
          ],
          depthStencilAttachment: {
            view: this.depthTexture.createView(),
            depthClearValue: 1,
            depthLoadOp: "load",
            depthStoreOp: "store",
          },
        };
        const pass = encoder.beginRenderPass(passDescriptor);
        let baseUniformValues = this.baseUniformValues;
        this.baseUniformBufferSize;
        let myTex = this.getTexture();
        baseUniformValues.set([myTex.width, myTex.height], 0);
        let drawData;
        {
          if (!output) return;
          drawData = output;
        }
        let {
          pipeline,
          bindGroupFragment,
          bindGroupVertex,
          baseUniformBuffer,
          vertexUniformBuffer,
          fragmentUniformBuffer,
          specialBuffersFragment,
          specialBuffersVertex,
        } = drawData;
        pass.setPipeline(pipeline);
        device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
        device.queue.writeBuffer(
          fragmentUniformBuffer,
          0,
          fragmentUniform.data
        );
        let bufCounterFrag = 0;
        for (let i = 0; i < fragmentUniform.special.length; i++) {
          let special = fragmentUniform.special[i];
          if (special.type == "array" && special.value) {
            device.queue.writeBuffer(
              specialBuffersFragment[bufCounterFrag++],
              0,
              special.value.buffer
            );
          }
        }
        device.queue.writeBuffer(vertexUniformBuffer, 0, vertexUniform.data);
        let bufCounterVert = 0;
        for (let i = 0; i < vertexUniform.special.length; i++) {
          let special = vertexUniform.special[i];
          if (special.type == "array" && special.value) {
            device.queue.writeBuffer(
              specialBuffersVertex[bufCounterVert++],
              0,
              special.value.buffer
            );
          }
        }
        pass.setBindGroup(0, bindGroupFragment);
        pass.setBindGroup(1, bindGroupVertex);
        pass.draw(dispatch.drawCount * 3, 1, 0, 0);
        pass.end();
      });
    }
    drawCalls = [];
    flush() {
      this.trace("flush", {});
      super.flush();
      const { device } = this.getGPU();
      let needsDraw = true;
      if (this.drawCalls.length == 0 && this.commandQueue.length == 0)
        needsDraw = false;
      if (needsDraw) {
        if (this.drawCalls.length > 0) {
          device.queue.submit(this.drawCalls);
          this.drawCalls = [];
        }
        if (this.commandQueue.length > 0) {
          let cleanups = [];
          this.startDispatch();
          let encoder = device.createCommandEncoder();
          for (let i = 0; i < this.commandQueue.length; i++) {
            let o = this.commandQueue[i](encoder);
            if (o) {
              cleanups.push(o);
            }
          }
          device.queue.submit([encoder.finish()]);
          for (let i = this.cleanupCommands.length - 1; i >= 0; i--) {
            if (this.cleanupCommands[i].$counter > 0) {
              this.cleanupCommands[i].$counter--;
            } else {
              this.cleanupCommands[i]();
              this.cleanupCommands.splice(i, 1);
            }
          }
          for (let i = 0; i < cleanups.length; i++) {
            cleanups[i]();
          }
          this.endDispatch();
          this.commandQueue = [];
        }
        this.copyToCanvas();
      }
      return device.queue.onSubmittedWorkDone();
    }
    drawImageRender(texture, toTexture) {
      const { device } = this.getGPU();
      if (!this.ready) {
        return;
      }
      if (this.drawImageCache) {
        this.drawImageCache(texture, toTexture);
        return;
      }
      const bindGroupLayout = device.createBindGroupLayout({
        entries: [
          {
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            texture: { sampleType: "unfilterable-float" },
          },
          {
            binding: 1,
            visibility: GPUShaderStage.FRAGMENT,
            sampler: { type: "non-filtering" },
          },
        ],
      });
      let vertexShader = this.createShader(
        {
          webgl: ``,
          webgpu: `
		struct VertexOutput {
			@builtin(position) Position : vec4<f32>,
			@location(0) Normal : vec3<f32>,
			@location(1) TexCoord : vec2<f32>,
			@location(2) Color : vec4<f32>,
		};
	
		@vertex
		fn main(
			@builtin(vertex_index) VertexIndex : u32
		) -> VertexOutput {
			var x : f32 = f32((VertexIndex & 1) << 2);
			var y : f32 = f32((VertexIndex & 2) << 1);
			var output : VertexOutput;
			output.Position = vec4<f32>(x - 1.0, y - 1.0, 0, 1);
			output.Normal = vec3<f32>(1.0, 0.0, 0.0);
			output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
			output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
	
			return output;
		}
		`,
          software: () => {},
        },
        "vertex"
      );
      let fragmentShader = this.createShader(
        {
          webgl: ``,
          webgpu: `
			struct VertexOutput {
				@builtin(position) Position : vec4<f32>,
				@location(0) Normal : vec3<f32>,
				@location(1) TexCoord : vec2<f32>,
				@location(2) Color : vec4<f32>,
			};
			@group(0) @binding(1) var _sampler: sampler;
			@group(0) @binding(0) var _texture: texture_2d<f32>;

		@fragment
		fn main(
			_in: VertexOutput
		) -> @location(0) vec4<f32> {
			return textureSample(_texture, _sampler, _in.TexCoord);
		}
		`,
          software: () => {},
        },
        "fragment"
      );
      const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout],
      });
      const pipelineDescriptor = {
        vertex: {
          module: vertexShader.payload,
          entryPoint: "main",
          buffers: vertexLayout,
        },
        fragment: {
          module: fragmentShader.payload,
          entryPoint: "main",
          targets: [
            {
              format: "rgba8unorm",
              blend: {
                alpha: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
                color: {
                  srcFactor: "one",
                  dstFactor: "one-minus-src-alpha",
                  operation: "add",
                },
              },
            },
          ],
        },
        primitive: {
          topology: "triangle-list",
          cullMode: "back",
        },
        layout: pipelineLayout,
      };
      const pipeline = device.createRenderPipeline(pipelineDescriptor);
      let geo = {
        vertices: [
          [0, 0, 0],
          [0, 1, 0],
          [1, 1, 0],
          [1, 0, 0],
        ],
        uvs: [
          [0, 0],
          [0, 1],
          [1, 1],
          [1, 0],
        ],
        triangles: [0, 1, 2],
        colors: [],
        normals: [],
        tangents: [],
        bitangents: [],
        getTriangles: () => {
          return geo.triangles;
        },
        getVertices: () => {
          return geo.vertices;
        },
        getUVs: () => {
          return geo.uvs;
        },
        getNormals: () => {
          return [];
        },
        getTangents: () => {
          return [];
        },
        getBitangents: () => {
          return [];
        },
        getColors: () => {
          return [];
        },
        symbol: Symbol(),
      };
      let meshData = this.getOrCreateMeshData(geo);
      this.drawImageCache = (texture2, toTexture2) => {
        device.pushErrorScope("internal");
        device.pushErrorScope("validation");
        const commandEncoder = device.createCommandEncoder();
        const passEncoder = commandEncoder.beginRenderPass({
          colorAttachments: [
            {
              view: toTexture2.createView(),
              storeOp: "store",
              loadOp: "load",
            },
          ],
        });
        const sampler = device.createSampler({});
        passEncoder.setPipeline(pipeline);
        const bindGroup = device.createBindGroup({
          layout: bindGroupLayout,
          entries: [
            {
              binding: 0,
              resource: texture2.createView(),
            },
            {
              binding: 1,
              resource: sampler,
            },
          ],
        });
        passEncoder.setBindGroup(0, bindGroup);
        passEncoder.setVertexBuffer(0, meshData.vertexBuffer);
        passEncoder.setIndexBuffer(meshData.indexBuffer, "uint32");
        passEncoder.drawIndexed(meshData.indexCount);
        passEncoder.end();
        device.queue.submit([commandEncoder.finish()]);
        device.popErrorScope().then((error) => {
          if (error) {
            console.log("Error", error);
            window.bubbleError(error.message);
            throw new Error("Failed to create shader");
          }
        });
        device.popErrorScope().then((error) => {
          if (error) {
            console.log("Error", error);
            window.bubbleError(error.message);
            throw new Error("Failed to create shader");
          }
        });
      };
      this.drawImageCache(texture, toTexture);
    }
    async copyToOtherCanvas(canvas) {
      const { device } = this.getGPU();
      let encoder = device.createCommandEncoder();
      let ctx = canvas.getContext("webgpu");
      if (!ctx) throw new Error("Could not get webgpu context");
      ctx.configure({
        device,
        format: "rgba8unorm",
        alphaMode: "premultiplied",
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT |
          GPUTextureUsage.TEXTURE_BINDING |
          GPUTextureUsage.COPY_SRC |
          GPUTextureUsage.COPY_DST,
      });
      encoder.copyTextureToTexture(
        { texture: this.getTexture() },
        { texture: ctx.getCurrentTexture() },
        { width: this.getTexture().width, height: this.getTexture().height }
      );
      device.queue.submit([encoder.finish()]);
      await device.queue.onSubmittedWorkDone();
    }
    copyToCanvas() {
      const { device } = this.getGPU();
      if (
        this.headless &&
        this.texture &&
        (this.textureFormat.endsWith("4") || this.textureFormat == "uint8")
      ) {
        if (!this.ctx) {
          this.ctx = this.canvas.getContext("webgpu");
          if (!this.ctx) throw new Error("Could not get webgpu context");
          this.ctx.configure({
            device,
            format: "rgba8unorm",
            alphaMode: "premultiplied",
            usage:
              GPUTextureUsage.RENDER_ATTACHMENT |
              GPUTextureUsage.TEXTURE_BINDING |
              GPUTextureUsage.COPY_SRC |
              GPUTextureUsage.COPY_DST,
          });
        }
        this.startDispatch();
        let encoder = device.createCommandEncoder();
        if (this.texture.format == "rgba8unorm") {
          encoder.copyTextureToTexture(
            { texture: this.texture },
            { texture: this.ctx.getCurrentTexture() },
            { width: this.texture.width, height: this.texture.height }
          );
        } else {
          this.drawImageRender(this.texture, this.ctx.getCurrentTexture());
        }
        device.queue.submit([encoder.finish()]);
        this.endDispatch();
      }
    }
    dispatch(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      super.dispatch(dispatch, options);
      if (dispatch.type == "draw") {
        this.activateDrawContext();
        this.triggerEvent("draw", dispatch);
        if (dispatch.drawType == "indexed") {
          this.dispatchDrawIndexed(dispatch, options);
        } else if (dispatch.drawType == "count") {
          this.dispatchDrawCount(dispatch, options);
        } else {
          this.dispatchDraw(dispatch, options);
        }
      }
    }
    dispose() {
      this.canvas?.remove();
      this.texture?.destroy();
      this.storageTexture?.destroy();
    }
    destroyBuffer(buf) {
      this.enqueueCommand((encoder) => {
        if (buf.platformPayload) {
          buf.platformPayload.destroy();
        }
      });
    }
    waitForDraw() {
      const { device } = this.getGPU();
      return device.queue.onSubmittedWorkDone();
    }
    bufferCounter = 0;
    getOrCreateBuffer(buf, extraFlags) {
      let useOldBuffer = null;
      if (buf.platformPayload) {
        let gpuBuf = buf.platformPayload;
        if (extraFlags !== null) {
          if (gpuBuf.usage & extraFlags) {
            return gpuBuf;
          }
          extraFlags |= gpuBuf.usage;
          useOldBuffer = gpuBuf;
        } else {
          return gpuBuf;
        }
      }
      const { device } = this.getGPU();
      let flags = this.genericBufferFlags();
      if (extraFlags) {
        flags |= extraFlags;
      }
      let bufferSize = buf.len() * buf.elementBytes;
      if (!buf.structured) {
        bufferSize *= buf.vectorSize;
      }
      this.startDispatch();
      let buffer = device.createBuffer({
        size: bufferSize,
        usage: flags,
      });
      buf.$_bufferIndex = this.bufferCounter;
      this.bufferCounter++;
      buf.symbol = Symbol();
      if (useOldBuffer) {
        let encoder = device.createCommandEncoder();
        encoder.copyBufferToBuffer(useOldBuffer, 0, buffer, 0, bufferSize);
        device.queue.submit([encoder.finish()]);
      } else if (buf.cpuWriteDirty) {
        if (buf.structured) {
          if (buf.typeName == "atomic<uint>" || buf.typeName == "atomic<int>") {
            let zero;
            if (buf.typeName == "atomic<uint>") {
              zero = new Uint32Array(buf.elementCount);
            } else {
              zero = new Int32Array(buf.elementCount);
            }
            if (buf.structArray)
              for (let i = 0; i < buf.structArray.length; i++) {
                let struct = buf.structArray[i];
                if (struct) {
                  zero[i] = struct;
                }
              }
            device.queue.writeBuffer(buffer, 0, zero);
          } else {
            device.queue.writeBuffer(buffer, 0, buf.arrayBuffer);
          }
        } else {
          device.queue.writeBuffer(
            buffer,
            0,
            buf.uintArray ?? buf.floatArray ?? buf.intArray ?? new Uint8Array(0)
          );
        }
        buf.cpuWriteDirty = false;
      }
      buf.platformPayload = buffer;
      buf.adapter = this;
      this.endDispatch();
      return buffer;
    }
  }
  const TYPE_SIZES = {
    atomic: [8, 8],
    texture2d: [8, 8],
    rwtexture2d: [8, 8],
    bool: [1, 15],
    float: [4, 12],
    float2: [8, 8],
    float3: [12, 4],
    float4: [16, 0],
    float2x2: [16, 0],
    float3x3: [12 + 12 + 12, 4 + 4 + 4],
    float4x4: [16 + 16 + 16 + 16, 4 + 4 + 4 + 4],
    uint: [4, 12],
    uint2: [8, 8],
    uint3: [12, 4],
    uint4: [16, 0],
    int: [4, 12],
    int2: [8, 8],
    int3: [12, 4],
    int4: [16, 0],
  };
  function getValueSize(val) {
    let totalSize = 0;
    if (val.type == "struct") {
      for (let member of val.fields) {
        let fieldSize = getValueSize(member[1]);
        totalSize += fieldSize;
      }
    } else if (val.type == "primitive") {
      let n = val.name;
      if (n == "atomic") {
        totalSize += 4;
      } else if (n == "texture2d" || n == "rwtexture2d") {
        totalSize += 8;
      } else {
        let s = TYPE_SIZES[n];
        if (s[0] == 0) {
          throw new Error(
            `Cannot calculate size of struct with unknown size type ${n}`
          );
        }
        totalSize += s[0] + s[1];
      }
    } else if (val.type == "array") {
      let elementSize = getValueSize(val.element);
      if (typeof val.staticSize !== "undefined") {
        totalSize += val.staticSize * elementSize;
      } else {
        throw new Error(
          `Cannot calculate size of struct with unknown size type ${val.element}`
        );
      }
    }
    return totalSize;
  }
  function generateArrayBuffer(rootVt, rawData, data, offset) {
    if (rootVt.type != "array") {
      throw new Error(
        `Cannot generate array buffer for non-array type ${rootVt.type}`
      );
    }
    let totalSize = 0;
    let vsize = getValueSize(rootVt.element);
    totalSize += vsize * rawData.value.len();
    if (totalSize == 0) {
      totalSize = 4 * 4;
    }
    if (!data) data = new ArrayBuffer(totalSize);
    let floatView = new Float32Array(data);
    let uintView = new Uint32Array(data);
    let intView = new Int32Array(data);
    if (!offset) offset = 0;
    let queue = [];
    let rootObj = rawData.value;
    for (let i = 0; i < rawData.value.len(); i++) {
      queue.unshift([[`[${i}]`, rootVt.element], rootObj, i]);
    }
    while (queue.length > 0) {
      let [uniform, obj, arrayIndex] = queue.pop();
      let vt = uniform[1];
      let name = uniform[0];
      if (vt.type == "primitive") {
        let n = vt.name;
        let s = TYPE_SIZES[n];
        if (s[0] == 0) {
          throw new Error(
            `Cannot calculate size of struct with unknown size type ${n}`
          );
        }
        let val;
        if (arrayIndex !== null) {
          val = obj[arrayIndex];
        } else {
          val = obj[name];
        }
        if (typeof val === "undefined") {
          throw new Error(`Uniform ${name} is not defined`);
        }
        if (val instanceof UniformValue) {
          val = val.value;
        }
        let view = floatView;
        if (n.startsWith("u")) {
          view = uintView;
        } else if (n.startsWith("i")) {
          view = intView;
        }
        if (n == "float" || n == "uint" || n == "int") {
          if (typeof val == "boolean") {
            val = val ? 1 : 0;
          }
          view[offset++] = val;
          offset += 3;
        } else if (n == "float2" || n == "uint2" || n == "int2") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          offset += 2;
        } else if (n == "float3" || n == "uint3" || n == "int3") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          view[offset++] = val[2];
          offset += 1;
        } else if (n == "float4" || n == "uint4" || n == "int4") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          view[offset++] = val[2];
          view[offset++] = val[3];
        } else if (n == "float2x2") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            view[offset++] = val[3];
          }
        } else if (n == "float3x3") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            offset++;
            view[offset++] = val[3];
            view[offset++] = val[4];
            view[offset++] = val[5];
            offset++;
            view[offset++] = val[6];
            view[offset++] = val[7];
            view[offset++] = val[8];
            offset++;
          }
        } else if (n == "float4x4") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            view[offset++] = val[3];
            view[offset++] = val[4];
            view[offset++] = val[5];
            view[offset++] = val[6];
            view[offset++] = val[7];
            view[offset++] = val[8];
            view[offset++] = val[9];
            view[offset++] = val[10];
            view[offset++] = val[11];
            view[offset++] = val[12];
            view[offset++] = val[13];
            view[offset++] = val[14];
            view[offset++] = val[15];
          }
        } else if (n == "bool") {
          intView[offset++] = val ? 1 : 0;
          offset += 3;
        } else if (n == "rwtexture2d" || n == "texture2d") {
          floatView[offset++] = val.size[0];
          floatView[offset++] = val.size[1];
          offset += 2;
        } else if (n == "atomic") {
          view[offset++] = val;
          offset += 3;
        } else {
          throw new Error("Invalid param type " + n);
        }
      } else if (vt.type == "array") {
        let val = obj[name];
        if (val instanceof UniformValue) {
          val = val.value;
        }
        if (obj == rootObj) {
          if (typeof val === "object" && Array.isArray(val)) {
            intView[offset++] = val.length;
            offset += 3;
          }
        } else {
          for (let i = val.length - 1; i >= 0; i--) {
            queue.push([["", vt.element], val, i]);
          }
        }
      } else if (vt.type == "buffer") {
        let val = obj[name];
        if (val instanceof UniformValue) {
          val = val.value;
        }
        if (obj == rootObj) {
          if (typeof val === "object") {
            intView[offset++] = val.elementCount;
            offset += 3;
          }
        }
      } else if (vt.type == "struct") {
        let val;
        if (arrayIndex !== null) {
          val = obj[arrayIndex];
        } else {
          val = obj[name];
        }
        if (typeof val === "object") {
          for (let i = vt.fields.length - 1; i >= 0; i--) {
            let member = vt.fields[i];
            if (val instanceof UniformValue) {
              queue.push([member, val.value, null]);
            } else {
              queue.push([member, val, null]);
            }
          }
        }
      }
    }
    return {
      size: totalSize,
      buffer: data,
    };
  }
  function generateUniforms(fragmentUniforms, fragmentShader) {
    if (fragmentShader.parent == null) {
      return {
        size: 0,
        special: [],
        data: new ArrayBuffer(0),
      };
    }
    let orderedUniforms = [
      ...fragmentShader.parent.params.webgpu.locals.map((l) => {
        return ["_ext_uniform_local_" + l[0], l[1]];
      }),
      ...fragmentShader.parent.params.webgpu.globals.map((g) => {
        return ["_ext_uniform_global_" + g[0], g[1].structure];
      }),
    ];
    let special = [];
    let specialCounter = 2;
    let totalSize = 0;
    let lastFieldPadding = 0;
    for (let uniform of orderedUniforms) {
      let vt = uniform[1];
      if (
        vt.type == "primitive" &&
        (vt.name == "texture2d" || vt.name == "rwtexture2d")
      ) {
        let texPayload = fragmentUniforms.uniforms.get(uniform[0]);
        special.push({
          index: specialCounter,
          type: "sampler2D",
          valueType: vt,
          value: {
            texture: texPayload.value,
          },
          access: vt.access,
        });
        specialCounter += 2;
        lastFieldPadding = 8;
        totalSize += 8 + lastFieldPadding;
      } else if (vt.type == "array") {
        if (vt.element.type == "primitive" && vt.element.name == "texture2d") {
          let texPayload = fragmentUniforms.uniforms.get(uniform[0]);
          special.push({
            index: specialCounter,
            type: "sampler2DArray",
            valueType: vt,
            value: {
              textures: texPayload.value,
            },
            access: vt.element.access,
          });
          specialCounter += 2;
          lastFieldPadding = 8;
          totalSize += 8 + lastFieldPadding;
        } else {
          special.push({
            index: specialCounter,
            type: "array",
            valueType: vt,
            value: generateArrayBuffer(
              vt,
              fragmentUniforms.uniforms.get(uniform[0])
            ),
          });
          specialCounter++;
          lastFieldPadding = 12;
          totalSize += 4 + lastFieldPadding;
        }
      } else if (vt.type == "buffer") {
        special.push({
          type: "buffer",
          valueType: vt,
          access: vt.access,
          index: specialCounter,
          value: fragmentUniforms.uniforms.get(uniform[0])?.value,
        });
        specialCounter++;
        lastFieldPadding = 12;
        totalSize += 4 + lastFieldPadding;
      } else if (vt.type == "primitive" && vt.name == "atomic") {
        special.push({
          type: "atomic",
          valueType: vt,
          index: specialCounter,
          value: fragmentUniforms.uniforms.get(uniform[0])?.value,
        });
        specialCounter++;
        lastFieldPadding = 12;
        totalSize += 4 + lastFieldPadding;
      } else {
        let vsize = getValueSize(vt);
        let extra = vsize % 16;
        if (vt.type == "primitive") {
          lastFieldPadding = 16 - extra;
        } else {
          lastFieldPadding = 0;
        }
        totalSize += vsize + lastFieldPadding;
      }
    }
    if (totalSize == 0) {
      totalSize = 4 * 4;
    }
    let queue = [];
    let rootObj = {};
    for (let k of fragmentUniforms.uniforms.keys()) {
      rootObj[k] = fragmentUniforms.uniforms.get(k);
    }
    for (let uniform of orderedUniforms) {
      queue.unshift([uniform, rootObj, null]);
    }
    let data = new ArrayBuffer(totalSize);
    let offset = 0;
    writeBufferStructure(queue, rootObj, data, offset);
    return {
      size: totalSize,
      special,
      data,
    };
  }
  function writeBufferStructure(initialQueue, rootObj, data, offset) {
    let floatView = new Float32Array(data);
    let uintView = new Uint32Array(data);
    let intView = new Int32Array(data);
    let queue = [...initialQueue];
    while (queue.length > 0) {
      let [uniform, obj, arrayIndex] = queue.pop();
      let vt = uniform[1];
      let name = uniform[0];
      if (vt.type == "primitive") {
        let n = vt.name;
        let s = TYPE_SIZES[n];
        if (s[0] == 0) {
          throw new Error(
            `Cannot calculate size of struct with unknown size type ${n}`
          );
        }
        let val;
        if (arrayIndex !== null) {
          val = obj[arrayIndex];
        } else {
          val = obj[name];
        }
        if (typeof val === "undefined") {
          throw new Error(`Uniform ${name} is not defined`);
        }
        if (val instanceof UniformValue) {
          val = val.value;
        }
        let view = floatView;
        if (n.startsWith("u")) {
          view = uintView;
        } else if (n.startsWith("i")) {
          view = intView;
        }
        if (n == "float" || n == "uint" || n == "int") {
          if (typeof val == "boolean") {
            val = val ? 1 : 0;
          }
          view[offset++] = val;
          offset += 3;
        } else if (n == "float2" || n == "uint2" || n == "int2") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          offset += 2;
        } else if (n == "float3" || n == "uint3" || n == "int3") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          view[offset++] = val[2];
          offset += 1;
        } else if (n == "float4" || n == "uint4" || n == "int4") {
          view[offset++] = val[0];
          view[offset++] = val[1];
          view[offset++] = val[2];
          view[offset++] = val[3];
        } else if (n == "float2x2") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            view[offset++] = val[3];
          }
        } else if (n == "float3x3") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            offset++;
            view[offset++] = val[3];
            view[offset++] = val[4];
            view[offset++] = val[5];
            offset++;
            view[offset++] = val[6];
            view[offset++] = val[7];
            view[offset++] = val[8];
            offset++;
          }
        } else if (n == "float4x4") {
          {
            view[offset++] = val[0];
            view[offset++] = val[1];
            view[offset++] = val[2];
            view[offset++] = val[3];
            view[offset++] = val[4];
            view[offset++] = val[5];
            view[offset++] = val[6];
            view[offset++] = val[7];
            view[offset++] = val[8];
            view[offset++] = val[9];
            view[offset++] = val[10];
            view[offset++] = val[11];
            view[offset++] = val[12];
            view[offset++] = val[13];
            view[offset++] = val[14];
            view[offset++] = val[15];
          }
        } else if (n == "bool") {
          intView[offset++] = val ? 1 : 0;
          offset += 3;
        } else if (n == "rwtexture2d" || n == "texture2d") {
          floatView[offset++] = val.size[0];
          floatView[offset++] = val.size[1];
          offset += 2;
        } else if (n == "atomic") {
          if (vt.element == "uint") {
            uintView[offset++] = val;
          } else {
            intView[offset++] = val;
          }
          offset += 3;
        } else {
          throw new Error("Invalid param type " + n);
        }
      } else if (vt.type == "array") {
        let val = obj[name];
        if (val instanceof UniformValue) {
          val = val.value;
        }
        if (obj == rootObj) {
          if (typeof val === "object" && Array.isArray(val)) {
            intView[offset++] = val.length;
            offset += 3;
          }
        } else {
          for (let i = val.length - 1; i >= 0; i--) {
            queue.push([["", vt.element], val, i]);
          }
        }
      } else if (vt.type == "buffer") {
        let val = obj[name];
        if (val instanceof UniformValue) {
          val = val.value;
        }
        if (obj == rootObj) {
          if (typeof val === "object") {
            intView[offset++] = val.elementCount;
            offset += 3;
          }
        }
      } else if (vt.type == "struct") {
        let val;
        if (arrayIndex !== null) {
          val = obj[arrayIndex];
        } else {
          val = obj[name];
        }
        if (typeof val === "object") {
          for (let i = vt.fields.length - 1; i >= 0; i--) {
            let member = vt.fields[i];
            if (val instanceof UniformValue) {
              queue.push([member, val.value, null]);
            } else {
              queue.push([member, val, null]);
            }
          }
        }
      }
    }
  }

  function makeFullscreenQuadGeometry() {
    let geo = {
      vertices: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0],
      ],
      uvs: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
      ],
      triangles: [0, 1, 2],
      colors: [],
      normals: [],
      tangents: [],
      bitangents: [],
      getTriangles: () => {
        return geo.triangles;
      },
      getVertices: () => {
        return geo.vertices;
      },
      getUVs: () => {
        return geo.uvs;
      },
      getNormals: () => {
        return [];
      },
      getTangents: () => {
        return [];
      },
      getBitangents: () => {
        return [];
      },
      getColors: () => {
        return [];
      },
      symbol: Symbol(),
    };
    return geo;
  }
  const fullscreenGeo = makeFullscreenQuadGeometry();

  let shadeupTextureCounter = 0;
  class ShadeupTexture3d {
    size = [0, 0, 0];
    width = 0;
    height = 0;
    depth = 0;
    adapter = null;
    innerType = "float4";
    isBound = false;
    boundUnit = -1;
    dirty = true;
    payload;
    constructor() {}
    /** @shadeup=glsl(!texture($self$, $0$)) */
    __index(index) {
      return [0, 0, 0, 0];
    }
    __index_assign(index, value) {}
  }
  class ShadeupTexture2d {
    symbol;
    image = null;
    loading = true;
    size = [0, 0];
    width = 0;
    height = 0;
    paint = null;
    adapter = null;
    engine = null;
    innerType = "float4";
    isBound = false;
    boundUnit = -1;
    dirty = true;
    cpuReadDirty = true;
    cpuWriteDirty = false;
    cpuData = null;
    dataIndexStride = 4;
    version = 0;
    payload;
    data = null;
    constructor() {
      this.symbol = `stx${shadeupTextureCounter++}`;
    }
    destroy() {
      this.engine?.textureDestroyQueue.push(this);
    }
    async download() {
      if (!this.adapter) return;
      if (this.adapter instanceof WebGPUAdapter) {
        if (this.adapter.pendingWrites > 0) {
          this.engine?.adapter.flush();
        }
        if (this.adapter.storageDirty) {
          this.cpuReadDirty = true;
        }
      }
      if (this.cpuReadDirty) {
        if (this.dirty) {
          this.flush();
        }
        this.cpuReadDirty = false;
        this.cpuData = await this.adapter.downloadImage();
      }
    }
    getData() {
      return this.cpuData;
    }
    downloadAsync() {
      return this.download();
    }
    /** @shadeup=glsl(!texture($self$, $0$)) */
    __index(index) {
      if (!this.cpuData) return [0, 0, 0, 0];
      return this.getFast(index);
    }
    getFast;
    setFast;
    init() {
      this.dataIndexStride =
        parseInt(this.innerType[this.innerType.length - 1]) || 1;
      if (this.innerType == "uint8") {
        this.dataIndexStride = 4;
      }
      let width = this.size[0];
      if (this.innerType == "uint8") {
        this.getFast = (index) => {
          let i =
            ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          return [
            this.cpuData[i] / 255,
            this.cpuData[i + 1] / 255,
            this.cpuData[i + 2] / 255,
            this.cpuData[i + 3] / 255,
          ];
        };
      } else {
        if (this.dataIndexStride == 4) {
          this.getFast = (index) => {
            let i =
              ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            return [
              this.cpuData[i],
              this.cpuData[i + 1],
              this.cpuData[i + 2],
              this.cpuData[i + 3],
            ];
          };
        } else if (this.dataIndexStride == 3) {
          this.getFast = (index) => {
            let i =
              ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            return [this.cpuData[i], this.cpuData[i + 1], this.cpuData[i + 2]];
          };
        } else if (this.dataIndexStride == 2) {
          this.getFast = (index) => {
            let i =
              ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            return [this.cpuData[i], this.cpuData[i + 1]];
          };
        } else if (this.dataIndexStride == 1) {
          this.getFast = (index) => {
            let i =
              ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            return this.cpuData[i];
          };
        }
      }
      if (this.dataIndexStride == 1) {
        this.setFast = (index, val) => {
          let i =
            ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          this.cpuWriteDirty = true;
          this.cpuData[i] = val;
        };
      } else {
        if (this.innerType == "uint8") {
          this.setFast = (index, value) => {
            let i =
              ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            this.cpuWriteDirty = true;
            this.cpuData[i] = value[2] * 255;
            this.cpuData[i + 1] = value[1] * 255;
            this.cpuData[i + 2] = value[0] * 255;
            this.cpuData[i + 3] = value[3] * 255;
          };
        } else {
          if (this.dataIndexStride == 4) {
            this.setFast = (index, value) => {
              let i =
                ((index[1] | 0) * width + (index[0] | 0)) *
                this.dataIndexStride;
              this.cpuWriteDirty = true;
              this.cpuData[i] = value[0];
              this.cpuData[i + 1] = value[1];
              this.cpuData[i + 2] = value[2];
              this.cpuData[i + 3] = value[3];
            };
          } else if (this.dataIndexStride == 3) {
            this.setFast = (index, value) => {
              let i =
                ((index[1] | 0) * width + (index[0] | 0)) *
                this.dataIndexStride;
              this.cpuWriteDirty = true;
              this.cpuData[i] = value[0];
              this.cpuData[i + 1] = value[1];
              this.cpuData[i + 2] = value[2];
            };
          } else if (this.dataIndexStride == 2) {
            this.setFast = (index, value) => {
              let i =
                ((index[1] | 0) * width + (index[0] | 0)) *
                this.dataIndexStride;
              this.cpuWriteDirty = true;
              this.cpuData[i] = value[0];
              this.cpuData[i + 1] = value[1];
            };
          }
        }
      }
    }
    __index_assign(index, value) {
      if (!this.cpuData) this.fillCpuData();
      this.setFast(index, value);
    }
    fillCpuData() {
      let arr;
      this.dataIndexStride;
      if (this.innerType.startsWith("float")) {
        arr = new Float32Array(this.width * this.height * this.dataIndexStride);
      } else if (this.innerType.startsWith("int")) {
        arr = new Int32Array(this.width * this.height * this.dataIndexStride);
      } else if (this.innerType.startsWith("uint")) {
        arr = new Uint32Array(this.width * this.height * this.dataIndexStride);
      } else if (this.innerType == "uint8") {
        arr = new Uint8Array(this.width * this.height * this.dataIndexStride);
      } else {
        throw new Error("Unknown texture type " + this.innerType);
      }
      this.cpuData = arr;
    }
    sample(pos) {
      return [0, 0, 0, 0];
    }
    cpuFlush() {
      if (this.cpuData && this.cpuWriteDirty && this.adapter) {
        this.adapter.uploadImage(this.cpuData);
      }
    }
    upload() {
      this.cpuFlush();
    }
    flush(flushStorage = true) {
      this.cpuFlush();
      if (flushStorage) {
        if (this.adapter instanceof WebGPUAdapter) {
          if (this.adapter.storageDirty) {
            this.adapter.flushStorage();
            this.cpuReadDirty = true;
          }
        }
      }
      if (this.dirty) {
        this.dirty = false;
        if (this.adapter?.contextMode == "draw") {
          this.adapter?.flush();
        } else {
          this.paint?.flush();
        }
      }
    }
    drawAdvanced(config) {
      if (!this.adapter) return;
      let drawCall = new ShaderDispatch("draw");
      if (config.mesh) {
        drawCall.drawType = "geometry";
      } else if (config.indexBuffer) {
        drawCall.drawType = "indexed";
      }
      if (config.depth) {
        drawCall.overrideDepth = config.depth;
      }
      if (config.indirect) {
        drawCall.indirectBuffer = config.indirect;
      }
      if (config.depthCompare) {
        drawCall.depthCompare = config.depthCompare;
      }
      if ("backfaceCulling" in config) {
        drawCall.backfaceCulling = config.backfaceCulling;
      }
      if ("indirectOffset" in config) {
        drawCall.indirectOffset = config.indirectOffset;
      }
      drawCall.instanceCount = config.instances ?? 1;
      drawCall.attachments = config.attachments ?? null;
      drawCall.depthOnly = config.depthOnly ?? false;
      let fragShader = config.fragment.get(this.adapter, "fragment", {
        attachments: config.attachments
          ? config.attachments.map((a) => a.innerType)
          : void 0,
      });
      if (!fragShader) {
        throw new Error("Fragment shader not found");
      }
      drawCall.setFragmentShader(fragShader);
      let vertShader = config.vertex.get(this.adapter, "vertex");
      if (!vertShader) {
        throw new Error("Vertex shader not found");
      }
      drawCall.setVertexShader(vertShader);
      config.fragment.bindUniforms(drawCall.fragmentUniforms);
      config.vertex.bindUniforms(drawCall.vertexUniforms);
      if (config.mesh) {
        drawCall.setGeometry(config.mesh);
      } else if (config.indexBuffer) {
        drawCall.setIndexBuffer(config.indexBuffer);
      }
      this.adapter.dispatch(drawCall, {
        depthTest: config.depthTest ?? true,
      });
    }
    draw(first, second, third) {
      this.cpuFlush();
      this.dirty = true;
      this.cpuReadDirty = true;
      this.version++;
      if ("vertices" in first && second && third) {
        this._draw_geometry(first, second, third);
      } else if (first && !second && !third) {
        this._draw_fullscreen(first);
      }
    }
    fullscreenVertexShaderInternal = null;
    _draw_fullscreen(pixelShaderInst) {
      if (!this.adapter) return;
      if (!this.fullscreenVertexShaderInternal) {
        this.fullscreenVertexShaderInternal = this.adapter.createShader(
          {
            webgl: `#version 300 es
			
			precision highp float;
			
			in vec3 a_position;
			in vec3 a_normal;
			in vec3 a_tangent;
			in vec3 a_bitangent;
			in vec2 a_uv;
			in vec4 a_color;
	
			out vec3 _v_position;
			out vec3 _v_normal;
			out vec3 _v_tangent;
			out vec3 _v_bitangent;
			out vec2 _v_uv;
			out vec4 _v_color;
			
			void main(void) {
			float x = float((gl_VertexID & 1) << 2);
			float y = float((gl_VertexID & 2) << 1);
			_v_uv.x = x * 0.5;
			_v_uv.y = 1.f - (y * 0.5);
			gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
			}`,
            webgpu: `
				struct VertexOutput {
					@builtin(position) Position : vec4<f32>,
					@location(0) Normal : vec3<f32>,
					@location(1) Tangent : vec3<f32>,
					@location(2) Bitangent : vec3<f32>,
					@location(3) TexCoord : vec2<f32>,
					@location(4) Color : vec4<f32>,
					@location(5) @interpolate(flat) instanceIndex : u32,
					@location(6) worldPosition: vec3<f32>,
				};
			
				@vertex
				fn main(
					@builtin(vertex_index) VertexIndex : u32
				) -> VertexOutput {
					var x : f32 = f32((VertexIndex & 1) << 2);
					var y : f32 = f32((VertexIndex & 2) << 1);
					var output : VertexOutput;
					output.Position = vec4<f32>(x - 1.0, y - 1.0, 0, 1);
					output.Normal = vec3<f32>(1.0, 0.0, 0.0);
					output.Tangent = vec3<f32>(0.0, 1.0, 0.0);
					output.Bitangent = vec3<f32>(0.0, 0.0, 1.0);
					output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
					output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
					output.instanceIndex = 0;
			
					return output;
				}
				`,
            software: () => {},
          },
          "vertex"
        );
      }
      if (!this.fullscreenVertexShaderInternal) {
        throw new Error("Fullscreen vertex shader not found");
      }
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "screen";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.size[0], this.size[1]]
        )
      );
      drawCall.setVertexShader(this.fullscreenVertexShaderInternal);
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        throw new Error("Fragment shader not found");
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      if (!this.$geo) {
        this.$geo = makeFullscreenQuadGeometry();
      }
      drawCall.setGeometry(this.$geo);
      this.adapter.dispatch(drawCall, {
        depthTest: false,
      });
    }
    _draw_geometry(geometry, vertexShaderInst, pixelShaderInst) {
      this.dirty = true;
      this.cpuReadDirty = true;
      this.cpuFlush();
      this.version++;
      if (!this.adapter) return;
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "geometry";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.size[0], this.size[1]]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setGeometry(geometry);
      this.adapter.dispatch(drawCall);
    }
    drawIndexed(indexBuffer, vertexShaderInst, pixelShaderInst) {
      this.dirty = true;
      this.cpuReadDirty = true;
      this.cpuFlush();
      this.version++;
      if (!this.adapter) return;
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "indexed";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.adapter.canvas.width, this.adapter.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex-indexed");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setIndexBuffer(indexBuffer);
      this.adapter.dispatch(drawCall);
    }
    clear(color = "auto") {
      this.dirty = true;
      this.cpuReadDirty = true;
      this.cpuFlush();
      this.version++;
      if (!this.adapter) return;
      this.adapter.clear(false, color);
    }
    drawCount(count, vertexShaderInst, pixelShaderInst) {
      this.dirty = true;
      this.cpuReadDirty = true;
      this.cpuFlush();
      this.version++;
      if (!this.adapter) return;
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "count";
      drawCall.drawCount = count;
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.adapter.canvas.width, this.adapter.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex-indexed");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      this.adapter.dispatch(drawCall);
    }
    drawInstanced(mesh, instanceCount, vertexShaderInst, pixelShaderInst) {
      if (!this.adapter) {
        return;
      }
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "geometry";
      drawCall.instanceCount = instanceCount;
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.adapter.canvas.width, this.adapter.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setGeometry(mesh);
      this.adapter.dispatch(drawCall);
    }
  }
  const FormatInnerTypeMapping = {
    "8bit-float": "r16float",
    "8bit-float2": "rg16float",
    "8bit-float3": "rgba16float",
    "8bit-float4": "rgba16float",
    "16bit-float": "r16float",
    "16bit-float2": "rg16float",
    "16bit-float3": "rgba16float",
    "16bit-float4": "rgba16float",
    "32bit-float": "r32float",
    "32bit-float2": "rg32float",
    "32bit-float3": "rgba32float",
    "32bit-float4": "rgba32float",
    "16bit-int": "r16sint",
    "16bit-int2": "rg16sint",
    "16bit-int3": "rgba16sint",
    "16bit-int4": "rgba16sint",
    "8bit-int": "r8sint",
    "8bit-int2": "rg8sint",
    "8bit-int3": "rgba8sint",
    "8bit-int4": "rgba8sint",
    "32bit-int": "r32sint",
    "32bit-int2": "rg32sint",
    "32bit-int3": "rgba32sint",
    "32bit-int4": "rgba32sint",
    "8bit-uint": "r8uint",
    "8bit-uint2": "rg8uint",
    "8bit-uint3": "rgba8uint",
    "8bit-uint4": "rgba8uint",
    "16bit-uint": "r16uint",
    "16bit-uint2": "rg16uint",
    "16bit-uint3": "rgba16uint",
    "16bit-uint4": "rgba16uint",
    "32bit-uint": "r32uint",
    "32bit-uint2": "rg32uint",
    "32bit-uint3": "rgba32uint",
    "32bit-uint4": "rgba32uint",
    "8bit-uint8": "rgba8unorm",
    "16bit-uint8": "rgba16uint",
    "32bit-uint8": "rgba32float",
    "depth-uint8": "depth24plus",
    "depth-float": "depth24plus",
    "depth-float2": "depth24plus",
    "depth-float3": "depth24plus",
    "depth-float4": "depth24plus",
    "depth-int": "depth24plus",
    "depth-int2": "depth24plus",
    "depth-int3": "depth24plus",
    "depth-int4": "depth24plus",
    "depth-uint": "depth24plus",
    "depth-uint2": "depth24plus",
    "depth-uint3": "depth24plus",
    "depth-uint4": "depth24plus",
    "depth-32-uint8": "depth32float",
    "depth-32-float": "depth32float",
    "depth-32-float2": "depth32float",
    "depth-32-float3": "depth32float",
    "depth-32-float4": "depth32float",
    "depth-32-int": "depth32float",
    "depth-32-int2": "depth32float",
    "depth-32-int3": "depth32float",
    "depth-32-int4": "depth32float",
    "depth-32-uint": "depth32float",
    "depth-32-uint2": "depth32float",
    "depth-32-uint3": "depth32float",
    "depth-32-uint4": "depth32float",
  };

  function translateNumericToGLSL(type) {
    if (type == "float2x2") {
      return "Matrix2f";
    } else if (type == "float3x3") {
      return "Matrix3f";
    } else if (type == "float4x4") {
      return "Matrix4f";
    }
    let matches = type.match(/^([A-Za-z]+)(\d)?$/);
    if (!matches) {
      return null;
    }
    let base = matches[1];
    let size = matches[2] ? parseInt(matches[2]) : 1;
    let type_name = "";
    switch (base) {
      case "float":
        type_name = "f";
        break;
      case "int":
        type_name = "i";
        break;
      case "uint":
        type_name = "i";
        break;
      case "bool":
        type_name = "i";
        break;
      default:
        return null;
    }
    return `${size}${type_name}`;
  }
  function translateIdentifier(str) {
    return str.replace(/\_\_\_/g, "_ii_").replace(/\_\_/g, "_i_");
  }

  const boundTextures = /* @__PURE__ */ new Map();
  let boundTexturesCache = new LRUCache({
    max: 16,
  });
  for (let ti = 0; ti < 16; ti++) {
    boundTextures.set(ti, null);
  }
  let webglCounter = 0;
  class WebGLAdapter extends GraphicsAdapter {
    gl = null;
    index = 0;
    blankImage = null;
    GL_SHADER_TYPES = {
      vertex: 0,
      "vertex-indexed": 0,
      fragment: 0,
      compute: -1,
    };
    programCache = /* @__PURE__ */ new Map();
    init() {
      this.index = webglCounter++;
      console.log("Creating gl with index", this.index);
      this.gl = this.canvas.getContext("webgl2", {
        preserveDrawingBuffer: true,
      });
      if (!this.gl) {
        throw new Error("WebGL is not supported");
      }
      this.GL_SHADER_TYPES = {
        vertex: this.gl.VERTEX_SHADER,
        fragment: this.gl.FRAGMENT_SHADER,
        "vertex-indexed": this.gl.VERTEX_SHADER,
        compute: -1,
      };
      this.blankImage = document.createElement("canvas");
      this.blankImage.width = 1;
      this.blankImage.height = 1;
      this.blankImage.getContext("2d").fillRect(0, 0, 1, 1);
      this.setupImageDrawing();
    }
    __program = null;
    setupImageDrawing() {
      const gl = this.getGL();
      this.__program = gl.createProgram();
      let program = this.__program;
      if (!program) throw new Error("Could not create program");
      let vertexShader = this.genNativeShader(
        `#version 300 es
precision highp float;

in vec4 a_position;
in vec2 a_texcoord;

uniform vec2 size;

out vec2 v_texcoord;

void main() {
	gl_Position = a_position;
	v_texcoord = a_texcoord;

	float x = float((gl_VertexID & 1) << 2);
	float y = float((gl_VertexID & 2) << 1);
	v_texcoord.x = x * 0.5;
	v_texcoord.y = 1.f - (y * 0.5);
	gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);

}
`,
        gl.VERTEX_SHADER
      );
      let fragmentShader = this.genNativeShader(
        `#version 300 es
precision mediump float;
precision mediump int;

in vec2 v_texcoord;
out vec4 _i_gl_out_pixel;
	
uniform sampler2D u_texture;
	
void main() {
	vec2 t = vec2(v_texcoord.x, v_texcoord.y);
	vec4 c = texture(u_texture, t);
	// c.rgb *= c.a;
	_i_gl_out_pixel = c;
	// _i_gl_out_pixel = vec4(t, 0.0, 1.0);
}
`,
        gl.FRAGMENT_SHADER
      );
      if (!vertexShader || !fragmentShader) {
        return;
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
    }
    drawImage(image, dstX, dstY, texWidth, texHeight) {
      const gl = this.getGL();
      const program = this.__program;
      if (!program) throw new Error("Could not create program");
      let positionLocation = gl.getAttribLocation(program, "a_position");
      let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
      gl.getUniformLocation(program, "u_matrix");
      let textureLocation = gl.getUniformLocation(program, "u_texture");
      let positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      let positions = [-1, -1, -1, 1, 1, -1, 1, -1];
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(positions),
        gl.STATIC_DRAW
      );
      let texcoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      let texcoords = [0, 0, 0, 1, 1, 0, 1, 0];
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(texcoords),
        gl.STATIC_DRAW
      );
      let unit = this.getTextureUnit(image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.useProgram(program);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
      gl.enableVertexAttribArray(texcoordLocation);
      gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);
      gl.uniform1i(textureLocation, unit);
      gl.enable(gl.BLEND);
      let indexBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      let tris = [0, 1, 2];
      let indexArr = new Uint16Array(tris.length);
      for (let i = 0; i < tris.length; i += 3) {
        indexArr[i] = tris[i];
        indexArr[i + 1] = tris[i + 1];
        indexArr[i + 2] = tris[i + 2];
      }
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(gl.TRIANGLES, 3, gl.UNSIGNED_SHORT, 0);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texcoordBuffer);
    }
    getGL() {
      if (!this.gl) {
        throw new Error("WebGL is not supported");
      }
      return this.gl;
    }
    setViewport(width, height) {
      const gl = this.getGL();
      super.setViewport(width, height);
      gl.viewport(0, 0, width, height);
    }
    getOrCreateShader(instance, type, config) {
      const gl = this.getGL();
      let arrSizeChanged = false;
      for (let param of Object.keys(instance.parent.params.webgl)) {
        let type2 = instance.parent.params.webgl[param];
        if (type2.type == "array") {
          if (!instance.parent.arraySizes[param])
            instance.parent.arraySizes[param] = 0;
          if (Array.isArray(instance.bindings[param])) {
            if (
              instance.bindings[param].length >
              instance.parent.arraySizes[param]
            ) {
              instance.parent.arraySizes[param] =
                instance.bindings[param].length;
              arrSizeChanged = true;
            }
          }
        }
      }
      if (instance.parent.types[type] && !arrSizeChanged) {
        return instance.parent.types[type];
      } else {
        if (type == "compute") {
          throw new Error("Compute shaders are not supported in WebGL");
        }
        let shader = gl.createShader(this.GL_SHADER_TYPES[type]);
        if (!shader) {
          console.log("Shader on canvas failed", this.canvas);
          throw new Error("Failed to create shader of type " + type);
        }
        let base = instance.parent.code.webgl;
        for (let param of Object.keys(instance.parent.arraySizes)) {
          base = base.replace(
            `%${param}_size%`,
            instance.parent.arraySizes[param]
          );
        }
        if (type == "vertex") {
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `in vec3 a_position;
					in vec3 a_normal;
					in vec3 a_tangent;
					in vec3 a_bitangent;
					in vec2 a_uv;
					in vec4 a_color;
					
					out vec3 _v_position;
					out vec3 _v_normal;
					out vec3 _v_tangent;
					out vec3 _v_bitangent;
					out vec2 _v_uv;
					out vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `ShaderOutput _i_out;
					_i_out.position = vec4(a_position, 1.0);
					_i_out.normal = a_normal;
					_i_out.tangent = a_tangent;
					_i_out.bitangent = a_bitangent;
					_i_out.uv = a_uv;
					_i_out.color = a_color;

					ShaderInput _i_in;
					_i_in.position = a_position;
					_i_in.uv = a_uv;
					_i_in.normal = a_normal;
					_i_in.tangent = a_tangent;
					_i_in.bitangent = a_bitangent;
					_i_in.color = a_color;
					_i_in.screen = vec2(0, 0);`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            `gl_Position = _i_out.position;
					_v_position = _i_out.position.xyz;
					_v_normal = _i_out.normal;
					_v_tangent = _i_out.tangent;
					_v_bitangent = _i_out.bitangent;
					_v_uv = _i_out.uv;
					_v_color = _i_out.color;`.replace(/\t\n/g, "")
          );
          base = base.replaceAll(
            "_ext_uniform_global_",
            "_vertex_ext_uniform_global_"
          );
          base = base.replaceAll(
            "_ext_uniform_local_",
            "_vertex_ext_uniform_local_"
          );
        } else if (type == "vertex-indexed") {
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `
					out vec3 _v_position;
					out vec3 _v_normal;
					out vec3 _v_tangent;
					out vec3 _v_bitangent;
					out vec2 _v_uv;
					out vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `ShaderOutput _i_out;
					_i_out.position = vec4(0.0, 0.0, 0.0, 1.0);
					_i_out.normal = vec3(0.0);
					_i_out.tangent = vec3(0.0);
					_i_out.bitangent = vec3(0.0);
					_i_out.uv = vec2(0.0);
					_i_out.color = vec4(0.0);

					ShaderInput _i_in;
					_i_in.vertexIndex = uint(gl_VertexID);
					_i_in.position = vec3(0.0);
					_i_in.uv = vec2(0.0);
					_i_in.normal = vec3(0.0);
					_i_in.tangent = vec3(0.0);
					_i_in.bitangent = vec3(0.0);
					_i_in.color = vec4(0.0);
					_i_in.screen = vec2(0, 0);`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            `gl_Position = _i_out.position;
					_v_position = _i_out.position.xyz;
					_v_normal = _i_out.normal;
					_v_tangent = _i_out.tangent;
					_v_bitangent = _i_out.bitangent;
					_v_uv = _i_out.uv;
					_v_color = _i_out.color;`.replace(/\t\n/g, "")
          );
          base = base.replaceAll(
            "_ext_uniform_global_",
            "_vertex_ext_uniform_global_"
          );
          base = base.replaceAll(
            "_ext_uniform_local_",
            "_vertex_ext_uniform_local_"
          );
        } else {
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_BEFORE__*/",
            `out vec4 _i_gl_out_pixel;
					in vec3 _v_position;
					in vec3 _v_normal;
					in vec3 _v_tangent;
					in vec3 _v_bitangent;
					in vec2 _v_uv;
					in vec4 _v_color;
					uniform vec2 _vtex_canvas;`.replace(/\t\n/g, "")
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
            `ShaderOutput _i_out;
					ShaderInput _i_in;
					_i_in.uv = _v_uv;
					_i_in.normal = _v_normal;
					_i_in.tangent = _v_tangent;
					_i_in.bitangent = _v_bitangent;
					_i_in.color = _v_color;
					_i_in.position = _v_position;
					_i_in.screen = vec2(gl_FragCoord.x, _vtex_canvas.y - gl_FragCoord.y);`.replace(
              /\t\n/g,
              ""
            )
          );
          base = base.replace(
            "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
            "_i_gl_out_pixel = _i_out.color;"
          );
          base = base.replaceAll(
            "_ext_uniform_global_",
            "_pixel_ext_uniform_global_"
          );
          base = base.replaceAll(
            "_ext_uniform_local_",
            "_pixel_ext_uniform_local_"
          );
        }
        let finalSource = `#version 300 es
precision mediump float;
precision mediump int;

${base}`;
        gl.shaderSource(shader, finalSource);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          let err = gl.getShaderInfoLog(shader);
          if (err) {
            let location = err.match(/ERROR: \d+:(\d+):/);
            if (location) {
              let line = parseInt(location[1]);
              let col = parseInt(location[0]);
              let lines = finalSource.split("\n");
              console.error(lines[line - 1]);
              console.error(" ".repeat(col - 1) + "^");
            }
          }
          console.error("Shader compile error", gl.getShaderInfoLog(shader));
          console.log(finalSource);
          window.bubbleError(
            "Shader compile error " + gl.getShaderInfoLog(shader)
          );
        }
        instance.version++;
        let gShader = new GenericShader(instance.parent.code.webgl, type);
        if (!gShader.payload) {
          gShader.payload = {};
        }
        gShader.payload[this.index] = shader;
        gShader.code = finalSource;
        gShader.parent = instance.parent;
        instance.parent.types[type] = gShader;
        return gShader;
      }
    }
    createShader(code, type) {
      const gl = this.getGL();
      if (type == "compute") {
        let gComputeShader = new GenericShader(code.webgl, type);
        gComputeShader.payload = code.software;
        gComputeShader.parent = null;
        return gComputeShader;
      }
      let shader = gl.createShader(this.GL_SHADER_TYPES[type]);
      if (!shader) {
        throw new Error("Failed to create shader");
      }
      gl.shaderSource(shader, code.webgl);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Code", code);
        console.error("Shader compile error", gl.getShaderInfoLog(shader));
        throw new Error("Shader compile error");
      }
      let gShader = new GenericShader(code.webgl, type);
      gShader.payload = { [this.index]: shader };
      gShader.parent = null;
      return gShader;
    }
    clear() {
      const gl = this.getGL();
      gl.clearColor(0, 0, 0, 0);
      gl.clear(
        gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT
      );
    }
    getProgramVertexPixel(
      vertexShaderKey,
      vertexShader,
      pixelShaderKey,
      pixelShader
    ) {
      const gl = this.getGL();
      let key = `${vertexShaderKey}_${pixelShaderKey}`;
      let uniformCache = /* @__PURE__ */ new Map();
      if (this.programCache.has(key)) {
        return this.programCache.get(key) ?? null;
      }
      let program = gl.createProgram();
      if (!program) {
        return null;
      }
      program.getUniformLocationCached = (path) => {
        if (!program) throw new Error("Program is null");
        if (uniformCache.has(path)) {
          return uniformCache.get(path) ?? null;
        }
        let loc = gl.getUniformLocation(program, path);
        if (!loc);
        else {
          uniformCache.set(path, loc);
          return loc;
        }
      };
      if (!vertexShader || !pixelShader) {
        return null;
      }
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, pixelShader);
      gl.linkProgram(program);
      gl.useProgram(program);
      this.programCache.set(key, program);
      return program ?? null;
    }
    unbindTexture(texture) {
      const gl = this.getGL();
      if (texture.isBound && texture.payload) {
        boundTextures.set(texture.payload.unit, null);
        texture.isBound = false;
        gl.deleteTexture(texture.payload.texture);
        texture.payload = null;
      }
    }
    flush() {
      const gl = this.getGL();
      gl.flush();
    }
    getTextureUnit(texture) {
      const gl = this.getGL();
      let isBound = false;
      if (texture instanceof ShadeupTexture2d) {
        texture.flush();
        isBound = texture.isBound;
      }
      if (!isBound) {
        let unit = -1;
        for (let [ti, tex] of boundTextures) {
          if (tex == null) {
            unit = ti;
            break;
          }
        }
        if (unit == -1) {
          let oldest = boundTexturesCache.pop();
          unit = oldest[0];
        }
        if (texture instanceof ShadeupTexture2d) {
          texture.payload = {
            texture: gl.createTexture(),
            unit: -1,
            version: texture.version,
          };
          gl.activeTexture(gl.TEXTURE0 + unit);
          gl.bindTexture(gl.TEXTURE_2D, texture.payload.texture);
        } else {
          gl.activeTexture(gl.TEXTURE0 + unit);
          if (!texture.$gl) {
            texture.$gl = {};
          }
          if (!texture.$gl[this.index]) {
            texture.$gl[this.index] = gl.createTexture();
          }
          gl.bindTexture(gl.TEXTURE_2D, texture.$gl[this.index]);
        }
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (texture instanceof ShadeupTexture2d) {
          let webglAdapter = texture.adapter;
          let useImage = webglAdapter.canvas;
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            useImage
          );
        } else {
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.RGBA,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            texture
          );
        }
        boundTextures.set(unit, texture);
        if (texture instanceof ShadeupTexture2d) {
          texture.isBound = true;
          texture.payload.unit = unit;
          boundTexturesCache.set(texture.payload.unit, [
            texture.payload.unit,
            texture,
          ]);
        } else {
          boundTexturesCache.set(unit, [unit, texture]);
        }
        return unit;
      } else {
        if (texture instanceof ShadeupTexture2d) {
          if (texture.payload.version != texture.version) {
            gl.activeTexture(gl.TEXTURE0 + texture.payload.unit);
            gl.bindTexture(gl.TEXTURE_2D, texture.payload.texture);
            let webglAdapter = texture.adapter;
            let useImage = webglAdapter.canvas;
            gl.texImage2D(
              gl.TEXTURE_2D,
              0,
              gl.RGBA,
              gl.RGBA,
              gl.UNSIGNED_BYTE,
              useImage
            );
            texture.payload.version = texture.version;
          }
          boundTexturesCache.set(texture.payload.unit, [
            texture.payload.unit,
            texture.payload.texture,
          ]);
          return texture.payload.unit;
        }
      }
    }
    setUniform(program, path, val, type, shaderKind) {
      const gl = this.getGL();
      const setUniform = this.setUniform.bind(this);
      let expandedType = type;
      if (expandedType.type == "array") {
        let innerType = expandedType.element;
        for (let i = 0; i < val.length; i++) {
          setUniform(program, `${path}[${i}]`, val[i], innerType, shaderKind);
        }
        if (path.split(".").length < 2) {
          setUniform(
            program,
            `${path}_size`,
            val.length,
            { type: "primitive", name: "int" },
            shaderKind
          );
        }
      } else if (expandedType.type == "primitive") {
        if (
          expandedType.name == "texture2d" ||
          expandedType.name == "rwtexture2d"
        ) {
          expandedType.element;
          let u = this.getTextureUnit(val);
          let loc = program.getUniformLocationCached(path);
          gl.uniform1i(loc, u);
          if (path.split(".").length < 2) {
            setUniform(
              program,
              `${path}_size`,
              val.size,
              { type: "primitive", name: "float2" },
              shaderKind
            );
          }
        } else {
          let methodName = translateNumericToGLSL(expandedType.name);
          let loc = program.getUniformLocationCached(path);
          if (!Array.isArray(val)) {
            val = [val];
          }
          methodName = `uniform${methodName}v`;
          if (methodName.startsWith("uniformMatrix")) {
            if (val.length == 4);
            else if (val.length == 9);
            else if (val.length == 16);
            gl[methodName](loc, false, val);
          } else {
            gl[methodName](loc, val);
          }
        }
      } else if (expandedType.type == "buffer");
      else if (expandedType.type == "struct") {
        for (let field of Object.keys(expandedType.fields)) {
          if (!val) {
            throw new Error(
              `Found null value for ${path}.${field} while passing to shader (nulls are not allowed)`
            );
          }
          setUniform(
            program,
            `${path}.${field}`,
            val[field],
            expandedType.fields[field],
            shaderKind
          );
        }
      }
    }
    dispatchDraw(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      const gl = this.getGL();
      let pixelShader = dispatch.fragmentShader;
      let vertexShader = dispatch.vertexShader;
      if (!pixelShader || !vertexShader) {
        return;
      }
      let program = this.getProgramVertexPixel(
        vertexShader.uniqueSourceKey,
        vertexShader.payload[this.index],
        pixelShader.uniqueSourceKey,
        pixelShader.payload[this.index]
      );
      if (!program) {
        return;
      }
      gl.useProgram(program);
      for (let k of dispatch.vertexUniforms.uniforms.keys()) {
        let val = dispatch.vertexUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "vertex");
      }
      for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
        let val = dispatch.fragmentUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "pixel");
      }
      const geometry = dispatch.geometry;
      if (!geometry) {
        return;
      }
      let vao = gl.createVertexArray();
      gl.bindVertexArray(vao);
      function generateEmptyData(arr, size, numItems) {
        if (arr.length == 0) {
          for (let i = 0; i < numItems * size; i++) {
            for (let j = 0; j < size; j++) arr.push(0);
          }
        }
        return arr;
      }
      let geoGl = geometry;
      let positionBuffer;
      let normalBuffer;
      let tangentBuffer;
      let bitangentBuffer;
      let uvBuffer;
      let colorBuffer;
      let indexBuffer;
      if (geoGl._cacheGL) {
        positionBuffer = geoGl._cacheGL.positionBuffer;
        normalBuffer = geoGl._cacheGL.normalBuffer;
        tangentBuffer = geoGl._cacheGL.tangentBuffer;
        bitangentBuffer = geoGl._cacheGL.bitangentBuffer;
        uvBuffer = geoGl._cacheGL.uvBuffer;
        colorBuffer = geoGl._cacheGL.colorBuffer;
        indexBuffer = geoGl._cacheGL.indexBuffer;
      } else {
        let tris = geometry.getTriangles();
        positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(geometry.getVertices().flat()),
          gl.STATIC_DRAW
        );
        normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            generateEmptyData(geometry.getNormals().flat(), 3, tris.length)
          ),
          gl.STATIC_DRAW
        );
        tangentBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            generateEmptyData(geometry.getTangents().flat(), 3, tris.length)
          ),
          gl.STATIC_DRAW
        );
        bitangentBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            generateEmptyData(geometry.getBitangents().flat(), 3, tris.length)
          ),
          gl.STATIC_DRAW
        );
        uvBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            generateEmptyData(geometry.getUVs().flat(), 2, tris.length)
          ),
          gl.STATIC_DRAW
        );
        colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(
          gl.ARRAY_BUFFER,
          new Float32Array(
            generateEmptyData(geometry.getColors().flat(), 4, tris.length)
          ),
          gl.STATIC_DRAW
        );
        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        let indexArr = new Uint16Array(tris.length);
        for (let i = 0; i < tris.length; i += 3) {
          {
            indexArr[i] = tris[i];
            indexArr[i + 1] = tris[i + 1];
            indexArr[i + 2] = tris[i + 2];
          }
        }
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexArr, gl.STATIC_DRAW);
        geoGl._cacheGL = {
          positionBuffer,
          normalBuffer,
          tangentBuffer,
          bitangentBuffer,
          uvBuffer,
          colorBuffer,
          indexBuffer,
        };
      }
      let positionAttr = gl.getAttribLocation(program, "a_position");
      let normalAttr = gl.getAttribLocation(program, "a_normal");
      let tangentAttr = gl.getAttribLocation(program, "a_tangent");
      let bitangentAttr = gl.getAttribLocation(program, "a_bitangent");
      let uvAttr = gl.getAttribLocation(program, "a_uv");
      let colorAttr = gl.getAttribLocation(program, "a_color");
      gl.enable(gl.BLEND);
      if (options.depthTest) gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      if (positionAttr != -1) {
        gl.enableVertexAttribArray(positionAttr);
        gl.vertexAttribPointer(
          positionAttr,
          // location
          3,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
      if (normalAttr != -1) {
        gl.enableVertexAttribArray(normalAttr);
        gl.vertexAttribPointer(
          normalAttr,
          // location
          3,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
      if (tangentAttr != -1) {
        gl.enableVertexAttribArray(tangentAttr);
        gl.vertexAttribPointer(
          tangentAttr,
          // location
          3,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
      if (bitangentAttr != -1) {
        gl.enableVertexAttribArray(bitangentAttr);
        gl.vertexAttribPointer(
          bitangentAttr,
          // location
          3,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      if (uvAttr != -1) {
        gl.enableVertexAttribArray(uvAttr);
        gl.vertexAttribPointer(
          uvAttr,
          // location
          2,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      if (colorAttr != -1) {
        gl.enableVertexAttribArray(colorAttr);
        gl.vertexAttribPointer(
          colorAttr,
          // location
          4,
          // size (components per iteration)
          gl.FLOAT,
          // type of to get from buffer
          false,
          // normalize
          0,
          // stride (bytes to advance each iteration)
          0
          // offset (bytes from start of buffer)
        );
      }
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
      gl.drawElements(
        gl.TRIANGLES,
        geometry.getTriangles().length,
        gl.UNSIGNED_SHORT,
        0
      );
      gl.deleteVertexArray(vao);
    }
    dispatchDrawIndexed(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      const gl = this.getGL();
      let pixelShader = dispatch.fragmentShader;
      let vertexShader = dispatch.vertexShader;
      if (!pixelShader || !vertexShader) {
        return;
      }
      let program = this.getProgramVertexPixel(
        vertexShader.uniqueSourceKey,
        vertexShader.payload[this.index],
        pixelShader.uniqueSourceKey,
        pixelShader.payload[this.index]
      );
      if (!program) {
        return;
      }
      gl.useProgram(program);
      for (let k of dispatch.vertexUniforms.uniforms.keys()) {
        let val = dispatch.vertexUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "vertex");
      }
      for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
        let val = dispatch.fragmentUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "pixel");
      }
      const indexBuffer = dispatch.indexBuffer;
      if (!indexBuffer) {
        return;
      }
      gl.enable(gl.BLEND);
      if (options.depthTest) gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, indexBuffer.len());
    }
    dispatchDrawCount(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      const gl = this.getGL();
      let pixelShader = dispatch.fragmentShader;
      let vertexShader = dispatch.vertexShader;
      if (!pixelShader || !vertexShader) {
        return;
      }
      let program = this.getProgramVertexPixel(
        vertexShader.uniqueSourceKey,
        vertexShader.payload[this.index],
        pixelShader.uniqueSourceKey,
        pixelShader.payload[this.index]
      );
      if (!program) {
        return;
      }
      gl.useProgram(program);
      for (let k of dispatch.vertexUniforms.uniforms.keys()) {
        let val = dispatch.vertexUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "vertex");
      }
      for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
        let val = dispatch.fragmentUniforms.uniforms.get(k);
        if (!val) continue;
        k = k.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
        k = k.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
        this.setUniform(program, k, val.value, val.valueType, "pixel");
      }
      gl.enable(gl.BLEND);
      if (options.depthTest) gl.enable(gl.DEPTH_TEST);
      gl.enable(gl.CULL_FACE);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      gl.drawArrays(gl.TRIANGLES, 0, dispatch.drawCount * 3);
    }
    getOrCreateBuffer(buf, binding) {
      const gl = this.getGL();
      if (buf.platformPayload) {
        return buf.platformPayload;
      }
      let buffer = gl.createBuffer();
      if (!buffer) {
        throw new Error("Could not create buffer");
      }
      gl.bindBuffer(binding, buffer);
      if (buf.structured);
      else {
        gl.bufferData(
          binding,
          buf.uintArray ?? buf.floatArray ?? buf.intArray ?? new Uint8Array(0),
          gl.STATIC_DRAW
        );
      }
      buf.platformPayload = buffer;
      return buffer;
    }
    dispatch(
      dispatch,
      options = {
        depthTest: true,
      }
    ) {
      super.dispatch(dispatch, options);
      if (dispatch.type == "draw") {
        this.activateDrawContext();
        this.triggerEvent("draw", dispatch);
        if (dispatch.drawType == "indexed") {
          this.dispatchDrawIndexed(dispatch, options);
        } else if (dispatch.drawType == "count") {
          this.dispatchDrawCount(dispatch, options);
        } else {
          this.dispatchDraw(dispatch, options);
        }
      }
    }
    genNativeShader(code, type) {
      const gl = this.getGL();
      let shader = gl.createShader(type);
      if (!shader) {
        throw new Error("Could not create shader");
      }
      gl.shaderSource(shader, code);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log("Code", code);
        console.error("Shader compile error", gl.getShaderInfoLog(shader));
      }
      return shader;
    }
  }

  const keyboardKeys = [
    {
      name: "backspace",
      which: "8",
      key: "Backspace",
      code: "Backspace",
    },
    {
      name: "tab",
      which: "9",
      key: "Tab",
      code: "Tab",
    },
    {
      name: "enter",
      which: "13",
      key: "Enter",
      code: "Enter",
    },
    {
      name: "shift(left)",
      which: "16",
      key: "Shift",
      code: "ShiftLeft",
    },
    {
      name: "shift(right)",
      which: "16",
      key: "Shift",
      code: "ShiftRight",
    },
    {
      name: "ctrl(left)",
      which: "17",
      key: "Control",
      code: "ControlLeft",
    },
    {
      name: "ctrl(right)",
      which: "17",
      key: "Control",
      code: "ControlRight",
    },
    {
      name: "alt(left)",
      which: "18",
      key: "Alt",
      code: "AltLeft",
    },
    {
      name: "alt(right)",
      which: "18",
      key: "Alt",
      code: "AltRight",
    },
    {
      name: "pause/break",
      which: "19",
      key: "Pause",
      code: "Pause",
    },
    {
      name: "caps lock",
      which: "20",
      key: "CapsLock",
      code: "CapsLock",
    },
    {
      name: "escape",
      which: "27",
      key: "Escape",
      code: "Escape",
    },
    {
      name: "space",
      which: "32",
      key: "",
      code: "Space",
    },
    {
      name: "page up",
      which: "33",
      key: "PageUp",
      code: "PageUp",
    },
    {
      name: "page down",
      which: "34",
      key: "PageDown",
      code: "PageDown",
    },
    {
      name: "end",
      which: "35",
      key: "End",
      code: "End",
    },
    {
      name: "home",
      which: "36",
      key: "Home",
      code: "Home",
    },
    {
      name: "left arrow",
      which: "37",
      key: "ArrowLeft",
      code: "ArrowLeft",
    },
    {
      name: "up arrow",
      which: "38",
      key: "ArrowUp",
      code: "ArrowUp",
    },
    {
      name: "right arrow",
      which: "39",
      key: "ArrowRight",
      code: "ArrowRight",
    },
    {
      name: "down arrow",
      which: "40",
      key: "ArrowDown",
      code: "ArrowDown",
    },
    {
      name: "print screen",
      which: "44",
      key: "PrintScreen",
      code: "PrintScreen",
    },
    {
      name: "insert",
      which: "45",
      key: "Insert",
      code: "Insert",
    },
    {
      name: "delete",
      which: "46",
      key: "Delete",
      code: "Delete",
    },
    {
      name: "0",
      which: "48",
      key: "0",
      code: "Digit0",
    },
    {
      name: "1",
      which: "49",
      key: "1",
      code: "Digit1",
    },
    {
      name: "2",
      which: "50",
      key: "2",
      code: "Digit2",
    },
    {
      name: "3",
      which: "51",
      key: "3",
      code: "Digit3",
    },
    {
      name: "#",
      which: "51",
      key: "#",
      code: "Digit3",
    },
    {
      name: "4",
      which: "52",
      key: "4",
      code: "Digit4",
    },
    {
      name: "5",
      which: "53",
      key: "5",
      code: "Digit5",
    },
    {
      name: "6",
      which: "54",
      key: "6",
      code: "Digit6",
    },
    {
      name: "7",
      which: "55",
      key: "7",
      code: "Digit7",
    },
    {
      name: "8",
      which: "56",
      key: "8",
      code: "Digit8",
    },
    {
      name: "9",
      which: "57",
      key: "9",
      code: "Digit9",
    },
    {
      name: "a",
      which: "65",
      key: "a",
      code: "KeyA",
    },
    {
      name: "b",
      which: "66",
      key: "b",
      code: "KeyB",
    },
    {
      name: "c",
      which: "67",
      key: "c",
      code: "KeyC",
    },
    {
      name: "d",
      which: "68",
      key: "d",
      code: "KeyD",
    },
    {
      name: "e",
      which: "69",
      key: "e",
      code: "KeyE",
    },
    {
      name: "f",
      which: "70",
      key: "f",
      code: "KeyF",
    },
    {
      name: "g",
      which: "71",
      key: "g",
      code: "KeyG",
    },
    {
      name: "h",
      which: "72",
      key: "h",
      code: "KeyH",
    },
    {
      name: "i",
      which: "73",
      key: "i",
      code: "KeyI",
    },
    {
      name: "j",
      which: "74",
      key: "j",
      code: "KeyJ",
    },
    {
      name: "k",
      which: "75",
      key: "k",
      code: "KeyK",
    },
    {
      name: "l",
      which: "76",
      key: "l",
      code: "KeyL",
    },
    {
      name: "m",
      which: "77",
      key: "m",
      code: "KeyM",
    },
    {
      name: "n",
      which: "78",
      key: "n",
      code: "KeyN",
    },
    {
      name: "o",
      which: "79",
      key: "o",
      code: "KeyO",
    },
    {
      name: "p",
      which: "80",
      key: "p",
      code: "KeyP",
    },
    {
      name: "q",
      which: "81",
      key: "q",
      code: "KeyQ",
    },
    {
      name: "r",
      which: "82",
      key: "r",
      code: "KeyR",
    },
    {
      name: "s",
      which: "83",
      key: "s",
      code: "KeyS",
    },
    {
      name: "t",
      which: "84",
      key: "t",
      code: "KeyT",
    },
    {
      name: "u",
      which: "85",
      key: "u",
      code: "KeyU",
    },
    {
      name: "v",
      which: "86",
      key: "v",
      code: "KeyV",
    },
    {
      name: "w",
      which: "87",
      key: "w",
      code: "KeyW",
    },
    {
      name: "x",
      which: "88",
      key: "x",
      code: "KeyX",
    },
    {
      name: "y",
      which: "89",
      key: "y",
      code: "KeyY",
    },
    {
      name: "z",
      which: "90",
      key: "z",
      code: "KeyZ",
    },
    {
      name: "left window key",
      which: "91",
      key: "Meta",
      code: "MetaLeft",
    },
    {
      name: "right window key",
      which: "92",
      key: "Meta",
      code: "MetaRight",
    },
    {
      name: "select key (Context Menu)",
      which: "93",
      key: "ContextMenu",
      code: "ContextMenu",
    },
    {
      name: "numpad 0",
      which: "96",
      key: "0",
      code: "Numpad0",
    },
    {
      name: "numpad 1",
      which: "97",
      key: "1",
      code: "Numpad1",
    },
    {
      name: "numpad 2",
      which: "98",
      key: "2",
      code: "Numpad2",
    },
    {
      name: "numpad 3",
      which: "99",
      key: "3",
      code: "Numpad3",
    },
    {
      name: "numpad 4",
      which: "100",
      key: "4",
      code: "Numpad4",
    },
    {
      name: "numpad 5",
      which: "101",
      key: "5",
      code: "Numpad5",
    },
    {
      name: "numpad 6",
      which: "102",
      key: "6",
      code: "Numpad6",
    },
    {
      name: "numpad 7",
      which: "103",
      key: "7",
      code: "Numpad7",
    },
    {
      name: "numpad 8",
      which: "104",
      key: "8",
      code: "Numpad8",
    },
    {
      name: "numpad 9",
      which: "105",
      key: "9",
      code: "Numpad9",
    },
    {
      name: "multiply",
      which: "106",
      key: "*",
      code: "NumpadMultiply",
    },
    {
      name: "add",
      which: "107",
      key: "+",
      code: "NumpadAdd",
    },
    {
      name: "subtract",
      which: "109",
      key: "-",
      code: "NumpadSubtract",
    },
    {
      name: "decimal point",
      which: "110",
      key: ".",
      code: "NumpadDecimal",
    },
    {
      name: "divide",
      which: "111",
      key: "/",
      code: "NumpadDivide",
    },
    {
      name: "f1",
      which: "112",
      key: "F1",
      code: "F1",
    },
    {
      name: "f2",
      which: "113",
      key: "F2",
      code: "F2",
    },
    {
      name: "f3",
      which: "114",
      key: "F3",
      code: "F3",
    },
    {
      name: "f4",
      which: "115",
      key: "F4",
      code: "F4",
    },
    {
      name: "f5",
      which: "116",
      key: "F5",
      code: "F5",
    },
    {
      name: "f6",
      which: "117",
      key: "F6",
      code: "F6",
    },
    {
      name: "f7",
      which: "118",
      key: "F7",
      code: "F7",
    },
    {
      name: "f8",
      which: "119",
      key: "F8",
      code: "F8",
    },
    {
      name: "f9",
      which: "120",
      key: "F9",
      code: "F9",
    },
    {
      name: "f10",
      which: "121",
      key: "F10",
      code: "F10",
    },
    {
      name: "f11",
      which: "122",
      key: "F11",
      code: "F11",
    },
    {
      name: "f12",
      which: "123",
      key: "F12",
      code: "F12",
    },
    {
      name: "num lock",
      which: "144",
      key: "NumLock",
      code: "NumLock",
    },
    {
      name: "scroll lock",
      which: "145",
      key: "ScrollLock",
      code: "ScrollLock",
    },
    {
      name: "audio volume mute",
      which: "173",
      key: "AudioVolumeMute",
      code: "",
    },
    {
      name: "audio volume down",
      which: "174",
      key: "AudioVolumeDown",
      code: "",
    },
    {
      name: "audio volume up",
      which: "175",
      key: "AudioVolumeUp",
      code: "",
    },
    {
      name: "media player",
      which: "181",
      key: "LaunchMediaPlayer",
      code: "",
    },
    {
      name: "launch application 1",
      which: "182",
      key: "LaunchApplication1",
      code: "",
    },
    {
      name: "launch application 2",
      which: "183",
      key: "LaunchApplication2",
      code: "",
    },
    {
      name: "semi-colon",
      which: "186",
      key: ";",
      code: "Semicolon",
    },
    {
      name: "equal sign",
      which: "187",
      key: "=",
      code: "Equal",
    },
    {
      name: "comma",
      which: "188",
      key: ",",
      code: "Comma",
    },
    {
      name: "dash",
      which: "189",
      key: "-",
      code: "Minus",
    },
    {
      name: "period",
      which: "190",
      key: ".",
      code: "Period",
    },
    {
      name: "forward slash",
      which: "191",
      key: "/",
      code: "Slash",
    },
    {
      name: "Backquote/Grave accent",
      which: "192",
      key: "`",
      code: "Backquote",
    },
    {
      name: "open bracket",
      which: "219",
      key: "[",
      code: "BracketLeft",
    },
    {
      name: "back slash",
      which: "220",
      key: "\\",
      code: "Backslash",
    },
    {
      name: "close bracket",
      which: "221",
      key: "]",
      code: "BracketRight",
    },
    {
      name: "single quote",
      which: "222",
      key: "'",
      code: "Quote",
    },
  ];

  function initInput(canvas, mouseState, keyboardSink) {
    let frameKeySink = /* @__PURE__ */ new Map();
    window.addEventListener("keydown", (e) => {
      keyboardSink.set(e.code, true);
      frameKeySink.set(e.code, true);
      if (e.code.startsWith("Arrow")) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => {
      if (keyboardSink.has(e.code)) {
        keyboardSink.delete(e.code);
      }
    });
    let offsetLeft = document.querySelector(".ui-container")?.offsetLeft ?? 0;
    let offsetTop = document.querySelector(".ui-container")?.offsetTop ?? 0;
    window.addEventListener("mousedown", (e) => {
      if (e.target && e.target.closest(".ui-container")) {
        mouseState.button[e.button] = true;
        console.log("down", mouseState.button);
        mouseState.startScreen = [...mouseState.screen];
        mouseState.startUv = [...mouseState.uv];
        mouseState.deltaScreen = [0, 0];
        mouseState.deltaUv = [0, 0];
        mouseState.dragging = true;
      }
    });
    window.addEventListener("mouseup", (e) => {
      mouseState.clicked[0] = false;
      mouseState.clicked[1] = false;
      mouseState.clicked[2] = false;
      mouseState.button[e.button] = false;
      mouseState.dragging = false;
    });
    window.addEventListener("click", (e) => {
      if (e.target && e.target.closest(".ui-container")) {
        mouseState.clicked[e.button] = true;
      }
    });
    window.addEventListener("mousemove", (e) => {
      mouseState.screen = [
        (e.clientX - offsetLeft) * window.devicePixelRatio,
        (e.clientY - offsetTop) * window.devicePixelRatio,
      ];
      mouseState.uv = [
        ((e.clientX - offsetLeft) * window.devicePixelRatio) / canvas.width,
        ((e.clientY - offsetTop) * window.devicePixelRatio) / canvas.height,
      ];
      if (mouseState.dragging) {
        mouseState.deltaScreen = [
          mouseState.screen[0] - mouseState.startScreen[0],
          mouseState.screen[1] - mouseState.startScreen[1],
        ];
        mouseState.deltaUv = [
          mouseState.uv[0] - mouseState.startUv[0],
          mouseState.uv[1] - mouseState.startUv[1],
        ];
      }
    });
    window.addEventListener("touchstart", (e) => {
      if (e.target && e.target.closest(".ui-container")) {
        mouseState.button[0] = true;
        mouseState.startScreen = [...mouseState.screen];
        mouseState.startUv = [...mouseState.uv];
        mouseState.deltaScreen = [0, 0];
        mouseState.deltaUv = [0, 0];
        mouseState.dragging = true;
      }
    });
    window.addEventListener("touchend", (e) => {
      mouseState.button[0] = false;
      mouseState.dragging = false;
    });
    window.addEventListener("touchmove", (e) => {
      mouseState.screen = [
        (e.touches[0].clientX - offsetLeft) * window.devicePixelRatio,
        (e.touches[0].clientY - offsetTop) * window.devicePixelRatio,
      ];
      mouseState.uv = [
        ((e.touches[0].clientX - offsetLeft) * window.devicePixelRatio) /
          canvas.width,
        ((e.touches[0].clientY - offsetTop) * window.devicePixelRatio) /
          canvas.height,
      ];
      if (mouseState.dragging) {
        mouseState.deltaScreen = [
          mouseState.screen[0] - mouseState.startScreen[0],
          mouseState.screen[1] - mouseState.startScreen[1],
        ];
        mouseState.deltaUv = [
          mouseState.uv[0] - mouseState.startUv[0],
          mouseState.uv[1] - mouseState.startUv[1],
        ];
      }
    });
    window.addEventListener(
      "wheel",
      (e) => {
        if (
          e.target.matches("canvas") ||
          e.target.matches(".ui-container") ||
          e.target == document.body
        ) {
          e.preventDefault();
          mouseState.wheel += normalizeWheel(e).pixelY * -0.01;
        }
      },
      { passive: false }
    );
    window.addEventListener("scroll", (e) => {
      if (
        e.target.matches("canvas") ||
        e.target.matches(".ui-container") ||
        e.target == document.body
      ) {
        e.preventDefault();
      }
    });
    document.addEventListener("scroll", (e) => {});
    let getKeyboardState = () => {
      let keys = {};
      for (let key of keyboardKeys) {
        if (!key.code) continue;
        let realKey = key.code[0].toLowerCase() + key.code.slice(1);
        keys[realKey] = keyboardSink.has(key.code);
        keys["pressed" + key.code] = frameKeySink.has(key.code);
      }
      let vec = [0, 0];
      if (keys.keyW) vec[1] -= 1;
      if (keys.keyS) vec[1] += 1;
      if (keys.keyA) vec[0] -= 1;
      if (keys.keyD) vec[0] += 1;
      if (keys.arrowUp) vec[1] -= 1;
      if (keys.arrowDown) vec[1] += 1;
      if (keys.arrowLeft) vec[0] -= 1;
      if (keys.arrowRight) vec[0] += 1;
      keys.arrowVector = [vec[0], vec[1]];
      frameKeySink.clear();
      return keys;
    };
    return {
      getKeyboardState,
    };
  }
  const blankKeyboardState = {
    keyW: false,
    keyS: false,
    keyA: false,
    keyD: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
    pressedKeyW: false,
    pressedKeyS: false,
    pressedKeyA: false,
    pressedKeyD: false,
    pressedArrowUp: false,
    pressedArrowDown: false,
    pressedArrowLeft: false,
    pressedArrowRight: false,
    arrowVector: [0, 0],
  };
  for (let key of keyboardKeys) {
    if (!key.code) continue;
    blankKeyboardState[key.code] = false;
    blankKeyboardState["pressed" + key.code] = false;
  }
  var PIXEL_STEP = 10;
  var LINE_HEIGHT = 40;
  var PAGE_HEIGHT = 800;
  function normalizeWheel(event) {
    var sX = 0,
      sY = 0,
      pX = 0,
      pY = 0;
    if ("detail" in event) {
      sY = event.detail;
    }
    if ("wheelDelta" in event) {
      sY = -event.wheelDelta / 120;
    }
    if ("wheelDeltaY" in event) {
      sY = -event.wheelDeltaY / 120;
    }
    if ("wheelDeltaX" in event) {
      sX = -event.wheelDeltaX / 120;
    }
    if ("axis" in event && event.axis === event.HORIZONTAL_AXIS) {
      sX = sY;
      sY = 0;
    }
    pX = sX * PIXEL_STEP;
    pY = sY * PIXEL_STEP;
    if ("deltaY" in event) {
      pY = event.deltaY;
    }
    if ("deltaX" in event) {
      pX = event.deltaX;
    }
    if ((pX || pY) && event.deltaMode) {
      if (event.deltaMode == 1) {
        pX *= LINE_HEIGHT;
        pY *= LINE_HEIGHT;
      } else {
        pX *= PAGE_HEIGHT;
        pY *= PAGE_HEIGHT;
      }
    }
    if (pX && !sX) {
      sX = pX < 1 ? -1 : 1;
    }
    if (pY && !sY) {
      sY = pY < 1 ? -1 : 1;
    }
    return { spinX: sX, spinY: sY, pixelX: pX, pixelY: pY };
  }

  const addCameraHook = (engine) => {
    const realUiContainer =
      document.querySelector(".ui-container") ?? engine.canvas;
    let cameraConfig = {
      mode: "orbit-free",
      spinning: false,
      initialPosition: [0, 0, 0],
      initialPitch: 0,
      initialYaw: 0,
      speed: 10,
      orbitTarget: [0, 0, 0],
      orbitDistance: 650,
      orbitPitch: Math.PI / 6,
      orbitYaw: Math.PI / 4,
      orbitMinDistance: 0,
      orbitMaxDistance: 1e5,
      orbitMinPitch: -Math.PI / 2,
      orbitMaxPitch: Math.PI / 2 - 1e-3,
    };
    let defaultCameraConfig = { ...cameraConfig };
    let flying = false;
    let orbiting = false;
    let cameraUnlocked = false;
    let lastFrameMovement = Date.now();
    let defaultCameraSpeed = 1;
    let cameraSpeed = defaultCameraSpeed;
    function activateFreeFly() {
      if (cameraConfig.mode == "orbit-free") {
        cameraUnlocked = true;
      }
      cameraConfig.mode = "free";
      cameraRotY = cameraConfig.orbitPitch;
      cameraRotX = cameraConfig.orbitYaw - Math.PI / 2;
    }
    function activateOrbit() {
      if (cameraConfig.mode == "free") {
        cameraUnlocked = false;
      }
      cameraConfig.mode = "orbit-free";
      let camera = window.env.camera;
      let currentDist = cameraConfig.orbitDistance;
      let currentCameraPos = camera.position;
      let rotation = camera.rotation;
      let quatMulled = quaternionMul(rotation, [0, 0, 1]);
      let targetForward = [quatMulled[0], quatMulled[1], quatMulled[2]];
      cameraConfig.orbitTarget = [
        currentCameraPos[0] - targetForward[0] * currentDist,
        currentCameraPos[1] - targetForward[1] * currentDist,
        currentCameraPos[2] - targetForward[2] * currentDist,
      ];
      let target = cameraConfig.orbitTarget;
      let position = currentCameraPos;
      let dx = target[0] - position[0];
      let dy = target[1] - position[1];
      let dz = target[2] - position[2];
      let yaw = Math.atan2(dz, dx);
      let pitch = Math.atan2(dy, Math.sqrt(dx * dx + dz * dz));
      cameraConfig.orbitPitch = -pitch;
      cameraConfig.orbitYaw = yaw - Math.PI;
    }
    window.addEventListener("contextmenu", async (e) => {
      if (e.target == realUiContainer) {
        e.preventDefault();
        if (cameraConfig.mode == "orbit-free" || cameraConfig.mode == "free") {
          await engine.canvas.requestPointerLock();
          flying = true;
          if (cameraConfig.mode == "orbit-free") {
            activateFreeFly();
          }
          engine.canvas.focus();
        }
      }
    });
    window.addEventListener("mousedown", async (e) => {
      if (e.target == realUiContainer) {
        if (e.button == 2) {
          e.preventDefault();
          if (
            cameraConfig.mode == "orbit-free" ||
            cameraConfig.mode == "free"
          ) {
            await engine.canvas.requestPointerLock();
            engine.canvas.focus();
            flying = true;
            if (cameraConfig.mode == "orbit-free") {
              activateFreeFly();
            }
          }
        } else if (e.buttons == 4) {
          e.preventDefault();
          orbiting = true;
        } else if (e.button == 0 || e.button == 1) {
          orbiting = true;
        }
      }
    });
    window.addEventListener("mouseup", async (e) => {
      if (
        e.target == realUiContainer ||
        e.target == document.body ||
        e.target == canvas
      ) {
        if (e.button == 2) {
          e.preventDefault();
          if (
            cameraConfig.mode == "orbit-free" ||
            cameraConfig.mode == "free"
          ) {
            document.exitPointerLock();
            if (cameraUnlocked) {
              activateOrbit();
            }
            flying = false;
            cameraSpeed = defaultCameraSpeed;
          }
        } else if (e.buttons == 4) {
          e.preventDefault();
          orbiting = false;
        } else if (e.button == 0 || e.button == 1) {
          orbiting = false;
        }
      }
    });
    function normalizeVector3(v) {
      let len = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
      return [v[0] / len, v[1] / len, v[2] / len];
    }
    let cameraRotX = 0;
    let cameraRotY = 0;
    let cameraPitchVelocity = 0;
    let cameraYawVelocity = 0;
    window.addEventListener("mousemove", (e) => {
      if (
        e.target == document.body ||
        e.target == realUiContainer ||
        e.target == canvas
      ) {
        if (e.buttons == 4 || e.buttons == 2) {
          let camera2d = engine.env.camera2d;
          if (camera2d) {
            camera2d.position[0] += e.movementX * window.devicePixelRatio;
            camera2d.position[1] += e.movementY * window.devicePixelRatio;
          }
        }
        if (flying) {
          let dx = e.movementX;
          let dy = e.movementY;
          let camera = window.env.camera;
          let right = [1, 0, 0];
          let cameraRight = quaternionRotate(camera.rotation, right);
          cameraRight[1] = 0;
          cameraRight = normalizeVector3(cameraRight);
          cameraRotX += dx * 1e-3;
          cameraRotY += dy * 1e-3;
        } else {
          if (cameraConfig.mode.startsWith("orbit") && orbiting) {
            if (e.buttons == 1) {
              cameraYawVelocity += e.movementX * 0.01;
              cameraPitchVelocity += e.movementY * 0.01;
              cameraConfig.spinning = false;
            } else if (e.buttons == 4) {
              cameraConfig.spinning = false;
              let camera = window.env.camera;
              if (camera) {
                let up = [0, 1, 0];
                let forward = [0, 0, -1];
                let right = [1, 0, 0];
                let cameraRight = quaternionRotate(camera.rotation, right);
                cameraRight = normalizeVector3(cameraRight);
                let cameraUp = quaternionRotate(camera.rotation, up);
                cameraUp = normalizeVector3(cameraUp);
                let cameraForward = quaternionRotate(camera.rotation, forward);
                cameraForward[1] = 0;
                cameraForward = normalizeVector3(cameraForward);
                let cameraSpeed2 =
                  0.6 * (Math.sqrt(cameraConfig.orbitDistance) / 20);
                let cameraTarget = cameraConfig.orbitTarget;
                if (e.shiftKey) {
                  cameraSpeed2 = 0.01;
                }
                if (e.ctrlKey) {
                  cameraSpeed2 = 1;
                }
                cameraTarget[0] +=
                  cameraRight[0] * e.movementX * cameraSpeed2 * -1;
                cameraTarget[1] +=
                  cameraRight[1] * e.movementX * cameraSpeed2 * -1;
                cameraTarget[2] +=
                  cameraRight[2] * e.movementX * cameraSpeed2 * -1;
                cameraTarget[0] += cameraUp[0] * e.movementY * cameraSpeed2;
                cameraTarget[1] += cameraUp[1] * e.movementY * cameraSpeed2;
                cameraTarget[2] += cameraUp[2] * e.movementY * cameraSpeed2;
                cameraConfig.orbitTarget = cameraTarget;
              }
            }
          }
        }
      }
    });
    function quaternionRotate(quaternion, vector) {
      let [x, y, z] = vector;
      let [qx, qy, qz, qw] = quaternion;
      let ix = qw * x + qy * z - qz * y;
      let iy = qw * y + qz * x - qx * z;
      let iz = qw * z + qx * y - qy * x;
      let iw = -qx * x - qy * y - qz * z;
      return [
        ix * qw + iw * -qx + iy * -qz - iz * -qy,
        iy * qw + iw * -qy + iz * -qx - ix * -qz,
        iz * qw + iw * -qz + ix * -qy - iy * -qx,
      ];
    }
    function quaternionMul(quat, vec) {
      let [qx, qy, qz, qw] = quat;
      let [vx, vy, vz] = vec;
      let ix = qw * vx + qy * vz - qz * vy;
      let iy = qw * vy + qz * vx - qx * vz;
      let iz = qw * vz + qx * vy - qy * vx;
      let iw = -qx * vx - qy * vy - qz * vz;
      return [
        ix * qw + iw * -qx + iy * -qz - iz * -qy,
        iy * qw + iw * -qy + iz * -qx - ix * -qz,
        iz * qw + iw * -qz + ix * -qy - iy * -qx,
        iw * qw - ix * -qx - iy * -qy - iz * -qz,
      ];
    }
    function quaternionMulQuaternion(a, b) {
      let [ax, ay, az, aw] = a;
      let [bx, by, bz, bw] = b;
      let ix = aw * bx + ax * bw + ay * bz - az * by;
      let iy = aw * by + ay * bw + az * bx - ax * bz;
      let iz = aw * bz + az * bw + ax * by - ay * bx;
      let iw = aw * bw - ax * bx - ay * by - az * bz;
      return [ix, iy, iz, iw];
    }
    let movementForward = 0;
    let movementRight = 0;
    let movementUp = 0;
    let movement = {
      w: 0,
      a: 0,
      s: 0,
      d: 0,
      q: 0,
      e: 0,
    };
    let movementReal = {
      w: 0,
      a: 0,
      s: 0,
      d: 0,
      q: 0,
      e: 0,
    };
    let fovDirection = 0;
    window.addEventListener("keydown", (e) => {
      if (
        e.target instanceof Element &&
        (e.target.closest("input") || e.target.closest("textarea"))
      )
        return;
      if (e.key == "w") {
        movement.w = 1;
      } else if (e.key == "s") {
        movement.s = 1;
      } else if (e.key == "a") {
        movement.a = 1;
      } else if (e.key == "d") {
        movement.d = 1;
      } else if (e.key == "e") {
        movement.e = 1;
      } else if (e.key == "q") {
        movement.q = 1;
      } else if (e.key == "c") {
        fovDirection = -1;
      } else if (e.key == "z") {
        fovDirection = 1;
      }
    });
    let targetOrbitDistance = cameraConfig.orbitDistance;
    window.addEventListener("wheel", (e) => {
      if (
        e.target == document.body ||
        e.target == realUiContainer ||
        e.target == engine.canvas
      ) {
        if (e.deltaY > 0) {
          cameraSpeed = cameraSpeed / 1.2;
        } else if (e.deltaY < 0) {
          cameraSpeed = cameraSpeed * 1.2;
        }
        let wheel = normalizeWheel(e);
        if (cameraConfig.mode.startsWith("orbit")) {
          targetOrbitDistance = Math.max(
            0.1,
            targetOrbitDistance - wheel.spinY * -100
          );
        }
        let camera2d = engine.env.camera2d;
        if (camera2d) {
          let mousePos = [
            engine.env.mouse.screen[0],
            engine.env.mouse.screen[1],
          ];
          let cameraPos = camera2d.position;
          let cameraZoom = camera2d.zoom;
          let zoomDelta = wheel.spinY * 0.1;
          let newZoom = Math.max(0.01, cameraZoom + zoomDelta * cameraZoom);
          let mouseWorldPos = [
            (mousePos[0] - cameraPos[0]) / cameraZoom,
            (mousePos[1] - cameraPos[1]) / cameraZoom,
          ];
          let mouseWorldPos2 = [
            (mousePos[0] - cameraPos[0]) / newZoom,
            (mousePos[1] - cameraPos[1]) / newZoom,
          ];
          let mouseWorldDelta = [
            mouseWorldPos2[0] - mouseWorldPos[0],
            mouseWorldPos2[1] - mouseWorldPos[1],
          ];
          camera2d.position = [
            cameraPos[0] - mouseWorldDelta[0] * cameraZoom,
            cameraPos[1] - mouseWorldDelta[1] * cameraZoom,
          ];
          camera2d.zoom = newZoom;
        }
      }
    });
    window.addEventListener("keyup", (e) => {
      if (e.key == "w") {
        movement.w = 0;
      } else if (e.key == "s") {
        movement.s = 0;
      } else if (e.key == "a") {
        movement.a = 0;
      } else if (e.key == "d") {
        movement.d = 0;
      } else if (e.key == "e") {
        movement.e = 0;
      } else if (e.key == "q") {
        movement.q = 0;
      } else if (e.key == "c" || e.key == "z") {
        fovDirection = 0;
      }
    });
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    function quaternionFromEuler(euler) {
      let [x, y, z] = euler;
      let c1 = Math.cos(x / 2);
      let c2 = Math.cos(y / 2);
      let c3 = Math.cos(z / 2);
      let s1 = Math.sin(x / 2);
      let s2 = Math.sin(y / 2);
      let s3 = Math.sin(z / 2);
      return [
        s1 * c2 * c3 + c1 * s2 * s3,
        c1 * s2 * c3 - s1 * c2 * s3,
        c1 * c2 * s3 + s1 * s2 * c3,
        c1 * c2 * c3 - s1 * s2 * s3,
      ];
    }
    function cross(a, b) {
      let [ax, ay, az] = a;
      let [bx, by, bz] = b;
      return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx];
    }
    engine.env.configureCamera = function configureCamera(options) {
      cameraConfig = { ...cameraConfig, ...options };
      targetOrbitDistance = cameraConfig.orbitDistance;
    };
    return {
      beforeFrame(delta) {
        engine.env.camera =
          engine.env.camera ??
          (window._makeCamera ? new window._makeCamera({}) : null);
        engine.env.camera2d =
          engine.env.camera2d ??
          (window._makeCamera2d ? new window._makeCamera2d({}) : null);
        if (!engine.env.camera || !engine.env.camera2d) {
          return;
        }
        let now = Date.now();
        let dt = now - lastFrameMovement;
        lastFrameMovement = now;
        if (cameraConfig.mode == "orbit-free" || cameraConfig.mode == "free") {
          if (!flying) {
            if (engine.env.camera) {
              engine.env.camera.fov = lerp(
                engine.env.camera.fov,
                90,
                dt * 0.01
              );
            }
          }
        }
        if (
          engine.env.camera.width != engine.canvas.width ||
          engine.env.camera.height != engine.canvas.height
        ) {
          engine.env.camera.width = engine.canvas.width;
          engine.env.camera.height = engine.canvas.height;
        }
        if (cameraConfig.mode == "orbit" || cameraConfig.mode == "orbit-free") {
          {
            cameraConfig.orbitYaw += cameraYawVelocity * dt * 0.025;
            cameraConfig.orbitPitch += cameraPitchVelocity * dt * 0.025;
            cameraYawVelocity = lerp(cameraYawVelocity, 0, dt * 0.03);
            cameraPitchVelocity = lerp(cameraPitchVelocity, 0, dt * 0.03);
            cameraConfig.orbitPitch = Math.max(
              cameraConfig.orbitMinPitch,
              Math.min(cameraConfig.orbitMaxPitch, cameraConfig.orbitPitch)
            );
          }
          cameraConfig.orbitDistance = lerp(
            cameraConfig.orbitDistance,
            targetOrbitDistance,
            dt * 0.025
          );
          if (cameraConfig.spinning) {
            cameraConfig.orbitYaw -= dt * 2e-4;
          }
          let theta = cameraConfig.orbitYaw;
          let phi = Math.PI / 2 - cameraConfig.orbitPitch;
          let orbitTarget = cameraConfig.orbitTarget;
          let cameraPosition = [
            Math.sin(phi) * Math.cos(theta) * cameraConfig.orbitDistance +
              orbitTarget[0],
            Math.cos(phi) * cameraConfig.orbitDistance + orbitTarget[1],
            Math.sin(phi) * Math.sin(theta) * cameraConfig.orbitDistance +
              orbitTarget[2],
          ];
          let camera = engine.env.camera;
          if (camera) {
            camera.position = cameraPosition;
            let quat = window.shadeupQuat;
            if (quat) {
              camera.rotation = quat.lookAt(
                normalizeVector3([
                  cameraPosition[0] - orbitTarget[0],
                  cameraPosition[1] - orbitTarget[1],
                  cameraPosition[2] - orbitTarget[2],
                ]),
                [0, -1, 0]
              );
            }
          }
        } else if (cameraConfig.mode == "free") {
          const damping = 60;
          movementReal = {
            w: lerp(movementReal.w, movement.w, dt / damping),
            a: lerp(movementReal.a, movement.a, dt / damping),
            s: lerp(movementReal.s, movement.s, dt / damping),
            d: lerp(movementReal.d, movement.d, dt / damping),
            q: lerp(movementReal.q, movement.q, dt / damping),
            e: lerp(movementReal.e, movement.e, dt / damping),
          };
          let camera = engine.env.camera;
          let up = [0, 1, 0];
          if (camera) {
            cameraRotY = Math.max(
              -Math.PI / 2,
              Math.min(Math.PI / 2, cameraRotY)
            );
            camera.rotation = quaternionMulQuaternion(
              quaternionFromEuler([0, -cameraRotX, 0]),
              quaternionFromEuler([-cameraRotY, 0, 0])
            );
          }
          if (!flying) {
            return;
          }
          let rotation = camera.rotation;
          let quatMulled = quaternionMul(rotation, [0, 0, 1]);
          let targetForward = [quatMulled[0], quatMulled[1], quatMulled[2]];
          let targetUp = up;
          let targetRight = cross(targetForward, targetUp);
          targetRight = normalizeVector3(targetRight);
          movementForward = 0;
          movementRight = 0;
          movementUp = 0;
          movementForward += movementReal.w;
          movementForward -= movementReal.s;
          movementRight += movementReal.d;
          movementRight -= movementReal.a;
          movementUp += movementReal.e;
          movementUp -= movementReal.q;
          movementRight *= -1;
          movementForward *= -1;
          let movementVector = [0, 0, 0];
          movementVector[0] += targetForward[0] * movementForward;
          movementVector[1] += targetForward[1] * movementForward;
          movementVector[2] += targetForward[2] * movementForward;
          movementVector[0] += targetRight[0] * movementRight;
          movementVector[1] += targetRight[1] * movementRight;
          movementVector[2] += targetRight[2] * movementRight;
          movementVector[0] += targetUp[0] * movementUp;
          movementVector[1] += targetUp[1] * movementUp;
          movementVector[2] += targetUp[2] * movementUp;
          camera.position = [
            camera.position[0] + movementVector[0] * dt * cameraSpeed,
            camera.position[1] + movementVector[1] * dt * cameraSpeed,
            camera.position[2] + movementVector[2] * dt * cameraSpeed,
          ];
          camera.fov += fovDirection * dt * 0.1;
          camera.fov = Math.max(Math.min(camera.fov, 150), 4);
        }
      },
      reset() {
        let cam = engine.env.camera;
        cam.position = [0, 0, 0];
        cam.rotation = [1, 0, 0, 0];
        cam.width = engine.canvas.width;
        cam.height = engine.canvas.height;
        cam.fov = 90;
        cam.near = 1;
        cam.far = 1e5;
        let cam2d = engine.env.camera2d;
        cam2d.position = [0, 0];
        cam2d.zoom = 1;
        cameraConfig = { ...defaultCameraConfig };
        targetOrbitDistance = cameraConfig.orbitDistance;
      },
    };
  };

  const addCaptureHook = (engine) => {
    let screenshotQueue = [];
    let screenshotQueueResults = [];
    const blank = document.createElement("canvas");
    blank.width = engine.canvas.width;
    blank.height = engine.canvas.height;
    return {
      screenshotQueue,
      screenshotQueueResults,
      beforeFrame() {
        if (!engine.playing) return;
        if (
          blank.width != engine.canvas.width ||
          blank.height != engine.canvas.height
        ) {
          blank.width = engine.canvas.width;
          blank.height = engine.canvas.height;
        }
        for (let i = screenshotQueue.length - 1; i >= 0; i--) {
          let item = screenshotQueue[i];
          let doCapture = false;
          if ("frame" in item && typeof item.frame == "number") {
            if (
              item.frame <= engine.env.frame - 1 ||
              (engine.timeMultiplier != 1 && engine.env.frame - 1 > item.frame)
            ) {
              doCapture = true;
            }
          }
          if ("time" in item) {
            if (engine.env.time >= item.time) {
              doCapture = true;
            }
          }
          console.log("Checking screenshot", item, doCapture);
          if (doCapture) {
            performance.mark("start capture");
            performance.mark("wait cap");
            if (engine.canvas) {
              let cacheScreenshotItem = screenshotQueue[i];
              screenshotQueue.splice(i, 1);
              performance.mark("start to url");
              let data = engine.canvas.toDataURL("image/png");
              let ctx = blank.getContext("2d");
              ctx?.drawImage(engine.canvas, 0, 0);
              let blankData = ctx?.getImageData(
                0,
                0,
                blank.width,
                blank.height
              );
              if (
                cacheScreenshotItem.$tries &&
                cacheScreenshotItem.$tries > 100 &&
                blankData
              ) {
                blankData.data[0] = 1;
              }
              if (!blankData?.data.some((v) => v != 0)) {
                console.log("Blank screenshot, retrying", screenshotQueue);
                if (!cacheScreenshotItem.$tries) cacheScreenshotItem.$tries = 0;
                cacheScreenshotItem.$tries++;
                screenshotQueue.push(cacheScreenshotItem);
              } else {
                performance.mark("end to url");
                console.log("Screenshot captured, sending to parent");
                screenshotQueueResults.push({
                  options: item,
                  image: data,
                });
              }
            }
          }
        }
      },
      afterFrame() {
        if (screenshotQueue.length == 0 && screenshotQueueResults.length > 0) {
          console.log("Posting screenshot results");
          window.parent.postMessage(
            { type: "screenshot-results", data: screenshotQueueResults },
            "*"
          );
          screenshotQueueResults = [];
        }
      },
    };
  };

  class PaintingContext {
    constructor(canvas, gl) {
      this.markDirtyCallback = () => {};
      this.__ctx = null;
      this.__gl = null;
      this.__offscreen_canvas = null;
      this.__program = null;
      this.stagedChanges = false;
      this.dirty = false;
      this.fastPoints = false;
      this.fastPointsBuffer = null;
      this.__currentColor = null;
      this.pointsCounter = 0;
      this.cacheSize = [0, 0];
      if (!gl) return;
      this.__gl = gl;
      this.__canvas = canvas;
      this.__offscreen_canvas = document.createElement("canvas");
      this.__offscreen_canvas.width = canvas.width;
      this.__offscreen_canvas.height = canvas.height;
      this.__ctx = this.__offscreen_canvas.getContext("2d", {
        willReadFrequently: true,
      });
      this.__offscreen_canvas.style.position = "absolute";
      this.__offscreen_canvas.style.zIndex = "10";
      this.__setColor([0, 0, 0, 1]);
      gl.addEventListener("context", (toContext) => {
        if (toContext == "draw") {
          this.flush();
        }
      });
      gl.addEventListener("flush", () => {
        this.flush();
      });
    }
    flush() {
      if (!this.__gl) return;
      if (!this.__canvas) return;
      if (!this.__offscreen_canvas) return;
      if (!this.stagedChanges) return;
      if (this.fastPoints) this.flushPoints();
      this.__gl.drawImage(this.__offscreen_canvas);
      this.stagedChanges = false;
      if (
        this.__offscreen_canvas.width != this.__canvas.width ||
        this.__offscreen_canvas.height != this.__canvas.height
      ) {
        this.__offscreen_canvas.width = this.__canvas.width;
        this.__offscreen_canvas.height = this.__canvas.height;
      }
      this.pointsCounter = 0;
    }
    __beforeDraw() {
      if (!this.__offscreen_canvas) return;
      if (!this.__ctx) return;
      if (!this.__canvas) return;
      this.markDirtyCallback();
      this.__gl?.activatePaintContext();
      if (!this.stagedChanges) {
        this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
        this.__ctx.drawImage(this.__canvas, 0, 0);
        let color = this.__currentColor;
        this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
          color[2] * 255
        }, ${color[3]})`;
        this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
          color[2] * 255
        }, ${color[3]})`;
      }
    }
    __afterDraw() {
      this.__gl;
      this.dirty = true;
      this.stagedChanges = true;
    }
    __setColor(color) {
      if (!this.__ctx || !color) return;
      if (
        this.__currentColor &&
        this.__currentColor[0] == color[0] &&
        this.__currentColor[1] == color[1] &&
        this.__currentColor[2] == color[2] &&
        this.__currentColor[3] == color[3]
      )
        return;
      this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
        color[2] * 255
      }, ${color[3]})`;
      this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
        color[2] * 255
      }, ${color[3]})`;
      this.__currentColor = [color[0], color[1], color[2], color[3]];
    }
    fillRect(pos, size, color) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.fillRect(pos[0], pos[1], size[0], size[1]);
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    fillCircle(pos, radius, color) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
      this.__ctx.fill();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    fillArc(pos, radius, startAngle, endAngle, color) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
      this.__ctx.fill();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    line(pos1, pos2, color, width = 1) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.__ctx.moveTo(pos1[0], pos1[1]);
      this.__ctx.lineTo(pos2[0], pos2[1]);
      this.__ctx.lineWidth = width;
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    circle(pos, radius, color, width = 1) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.__ctx.arc(pos[0], pos[1], radius, 0, Math.PI * 2);
      this.__ctx.lineWidth = width;
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    arc(pos, radius, startAngle, endAngle, color, width = 1) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.__ctx.arc(pos[0], pos[1], radius, startAngle, endAngle);
      this.__ctx.lineWidth = width;
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    text(pos, text, color) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.fillText(text, pos[0], pos[1]);
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    startPath(pos) {
      if (!this.__ctx) return;
      this.flushPoints();
      this.__beforeDraw();
      this.__ctx.beginPath();
      this.__ctx.moveTo(pos[0], pos[1]);
    }
    lineTo(pos) {
      if (!this.__ctx) return;
      this.__ctx.lineTo(pos[0], pos[1]);
    }
    strokePath(color, width = 1) {
      if (!this.__ctx) return;
      this.__ctx.lineWidth = width;
      this.__setColor(color);
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    fillPath(color) {
      if (!this.__ctx) return;
      this.__setColor(color);
      this.__ctx.fill();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    setStrokeWidth(width) {
      if (!this.__ctx) return;
      this.__ctx.lineWidth = width;
    }
    setFont(font) {
      if (!this.__ctx) return;
      this.__ctx.font = font;
    }
    setFontSize(size) {
      if (!this.__ctx) return;
      this.__ctx.font = `${size}px ${this.__ctx.font
        .split(" ")
        .slice(1)
        .join(" ")}`;
    }
    setTextAlign(align) {
      if (!this.__ctx) return;
      this.__ctx.textAlign = align;
    }
    setTextBaseline(baseline) {
      if (!this.__ctx) return;
      this.__ctx.textBaseline = baseline;
    }
    setLineCap(cap) {
      if (!this.__ctx) return;
      this.__ctx.lineCap = cap;
    }
    setLineJoin(join) {
      if (!this.__ctx) return;
      this.__ctx.lineJoin = join;
    }
    setMiterLimit(limit) {
      if (!this.__ctx) return;
      this.__ctx.miterLimit = limit;
    }
    setShadowColor(color) {
      if (!this.__ctx) return;
      this.__ctx.shadowColor = `rgba(${color[0] * 255}, ${color[1] * 255}, ${
        color[2] * 255
      }, ${color[3]})`;
    }
    setShadowBlur(blur) {
      if (!this.__ctx) return;
      this.__ctx.shadowBlur = blur;
    }
    setShadowOffset(offset) {
      if (!this.__ctx) return;
      this.__ctx.shadowOffsetX = offset[0];
      this.__ctx.shadowOffsetY = offset[1];
    }
    setGlobalAlpha(alpha) {
      if (!this.__ctx) return;
      this.__ctx.globalAlpha = alpha;
    }
    setGlobalCompositeOperation(op) {
      if (!this.__ctx) return;
      this.__ctx.globalCompositeOperation = op;
    }
    setImageSmoothingEnabled(enabled) {
      if (!this.__ctx) return;
      this.__ctx.imageSmoothingEnabled = enabled;
    }
    setImageSmoothingQuality(quality) {
      if (!this.__ctx) return;
      this.__ctx.imageSmoothingQuality = quality;
    }
    setLineDash(dash) {
      if (!this.__ctx) return;
      this.__ctx.setLineDash(dash);
    }
    setLineDashOffset(offset) {
      if (!this.__ctx) return;
      this.__ctx.lineDashOffset = offset;
    }
    setTransform(a, b, c, d, e, f) {
      if (!this.__ctx) return;
      this.__ctx.setTransform(a, b, c, d, e, f);
    }
    resetTransform() {
      if (!this.__ctx) return;
      this.__ctx.resetTransform();
    }
    scale(v) {
      if (!this.__ctx) return;
      this.__ctx.scale(v[0], v[1]);
    }
    rotate(angle) {
      if (!this.__ctx) return;
      this.__ctx.rotate(angle);
    }
    translate(v) {
      if (!this.__ctx) return;
      this.__ctx.translate(v[0], v[1]);
    }
    flushPoints() {
      if (!this.__ctx) return;
      if (!this.fastPoints) return;
      if (!this.fastPointsBuffer) return;
      this.__ctx.putImageData(this.fastPointsBuffer, 0, 0);
      this.fastPoints = false;
      this.fastPointsBuffer = null;
      this.pointsCounter = 0;
    }
    point(pos, color) {
      if (!this.__ctx) return;
      this.pointsCounter++;
      this.__beforeDraw();
      if (this.pointsCounter > 10) {
        if (!this.fastPoints) {
          this.fastPoints = true;
          this.cacheSize = [
            this.__offscreen_canvas.width,
            this.__offscreen_canvas.height,
          ];
          this.fastPointsBuffer = this.__ctx.getImageData(
            0,
            0,
            this.cacheSize[0],
            this.cacheSize[1]
          );
        }
        if (!this.fastPointsBuffer) return;
        let x = Math.floor(pos[0]);
        let y = Math.floor(pos[1]);
        let index = (y * this.cacheSize[0] + x) * 4;
        if (!color) {
          color = this.__currentColor;
        }
        let oldColorx = this.fastPointsBuffer.data[index] / 255;
        let oldColory = this.fastPointsBuffer.data[index + 1] / 255;
        let oldColorz = this.fastPointsBuffer.data[index + 2] / 255;
        let oldColora = this.fastPointsBuffer.data[index + 3] / 255;
        this.fastPointsBuffer.data[index] =
          color[0] * 255 * color[3] + oldColorx * 255 * (1 - color[3]);
        this.fastPointsBuffer.data[index + 1] =
          color[1] * 255 * color[3] + oldColory * 255 * (1 - color[3]);
        this.fastPointsBuffer.data[index + 2] =
          color[2] * 255 * color[3] + oldColorz * 255 * (1 - color[3]);
        this.fastPointsBuffer.data[index + 3] =
          color[3] * 255 + oldColora * 255 * (1 - color[3]);
      } else {
        this.__setColor(color);
        this.__ctx.fillRect(pos[0], pos[1], 1, 1);
      }
      this.__afterDraw();
    }
    vector(
      pos,
      dir,
      color = [0.9803921568627451, 0.8, 0.08235294117647059, 1],
      width = 4
    ) {
      if (!this.__ctx || (dir[0] == 0 && dir[1] == 0)) return;
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.setStrokeWidth(width);
      this.__ctx.moveTo(pos[0], pos[1]);
      this.__ctx.lineCap = "round";
      this.__ctx.lineTo(pos[0] + dir[0], pos[1] + dir[1]);
      this.__ctx.stroke();
      this.__ctx.beginPath();
      this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
      let arrowSize = 20;
      let arrowAngle = Math.PI / 5;
      let dirAngle = Math.atan2(dir[1], dir[0]) + Math.PI;
      let arrow1 = [
        Math.cos(dirAngle + arrowAngle) * arrowSize,
        Math.sin(dirAngle + arrowAngle) * arrowSize,
      ];
      let arrow2 = [
        Math.cos(dirAngle - arrowAngle) * arrowSize,
        Math.sin(dirAngle - arrowAngle) * arrowSize,
      ];
      this.__ctx.lineTo(
        pos[0] + dir[0] + arrow1[0],
        pos[1] + dir[1] + arrow1[1]
      );
      this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
      this.__ctx.lineTo(
        pos[0] + dir[0] + arrow2[0],
        pos[1] + dir[1] + arrow2[1]
      );
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
    grid(
      center,
      count,
      gap,
      color = [0.1607843137254902, 0.1450980392156863, 0.1411764705882353, 1],
      width = 2
    ) {
      if (!this.__ctx) return;
      this.__beforeDraw();
      this.__setColor(color);
      this.__ctx.beginPath();
      this.setStrokeWidth(width);
      let start = [
        center[0] - (count[0] / 2) * gap[0],
        center[1] - (count[1] / 2) * gap[1],
      ];
      for (let i = 0; i <= count[0]; i++) {
        this.__ctx.moveTo(start[0] + i * gap[0], start[1]);
        this.__ctx.lineTo(start[0] + i * gap[0], start[1] + count[1] * gap[1]);
      }
      for (let i = 0; i <= count[1]; i++) {
        this.__ctx.moveTo(start[0], start[1] + i * gap[1]);
        this.__ctx.lineTo(start[0] + count[0] * gap[0], start[1] + i * gap[1]);
      }
      this.__ctx.stroke();
      this.__afterDraw();
      this.pointsCounter = 0;
    }
  }

  const simpleHash = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash &= hash;
    }
    return new Uint32Array([hash])[0].toString(36);
  };
  class ShadeupShaderInstance {
    parent;
    bindings;
    key;
    version;
    constructor(parentSource, bindings, key) {
      this.parent = parentSource;
      this.bindings = bindings;
      this.key = key;
      this.version = 0;
    }
    getKey() {
      return `${this.key}_${this.version}`;
    }
    get(adapter, type, config) {
      let shade = adapter.getOrCreateShader(this, type, config);
      shade.uniqueSourceKey = this.getKey();
      return shade;
    }
    bindUniforms(to) {
      for (let k of Object.keys(this.parent.params.webgl)) {
        let paramType = this.parent.params.webgl[k];
        let val = this.bindings[k];
        let uniVal = new UniformValue(paramType, val);
        let uniformName = translateIdentifier(k);
        to.uniforms.set(uniformName, uniVal);
      }
    }
  }
  class ShadeupShaderSource {
    code;
    params;
    types;
    arraySizes;
    indexMapping;
    key;
    constructor(params, code, indexMapping) {
      this.code = code;
      this.params = params;
      this.indexMapping = indexMapping;
      this.types = {};
      this.arraySizes = {};
      this.key = simpleHash(JSON.stringify(code));
    }
    instance(bindings) {
      return new ShadeupShaderInstance(this, bindings, this.key);
    }
  }

  class ShadeupAssetLoader {
    registeredLoads = [];
    loadedAssets = /* @__PURE__ */ new Map();
    primedTextureAssets = /* @__PURE__ */ new Map();
    registeredLibs = /* @__PURE__ */ new Set();
    engine;
    constructor(engine) {
      this.engine = engine;
    }
    reset() {
      this.registeredLoads.splice(0, this.registeredLoads.length);
      this.registeredLibs.clear();
    }
    async loadLib(name) {
      if (name == "rapier2d") {
        console.log("Loading rapier2d");
        window.RAPIER_2D = await import(
          "https://cdn.skypack.dev/@dimforge/rapier2d-compat"
        );
        console.log("Loaded rapier2d");
        await window.RAPIER_2D.init();
        console.log("Initialized rapier2d");
      } else if (name == "rapier3d") {
        window.RAPIER_3D = await import(
          "https://cdn.skypack.dev/@dimforge/rapier3d-compat"
        );
        await window.RAPIER_3D.init();
      }
    }
    async loadLibs() {
      console.log("Loading libs", [...this.registeredLibs.keys()]);
      await Promise.all(
        [...this.registeredLibs.keys()].map(async (lib) => {
          await this.loadLib(lib);
        })
      );
    }
    async loadAssets() {
      let promises = [];
      console.log("Loading assets", [...this.registeredLoads.keys()]);
      this.registeredLoads = this.registeredLoads.filter((load) => {
        return !this.loadedAssets.has(load[0]);
      });
      for (let load of this.registeredLoads) {
        promises.push(
          (async () => {
            let [key, type] = load;
            let baseUrl = "https://assets.shadeup.dev/";
            if (type == "image") {
              await new Promise((resolve) => {
                let img = new Image();
                img.crossOrigin = "anonymous";
                img.onerror = () => {
                  console.error("Failed to load image " + key);
                  resolve();
                };
                img.onload = async () => {
                  let canvas = document.createElement("canvas");
                  canvas.width = img.width;
                  canvas.height = img.height;
                  let ctx = canvas.getContext("2d");
                  if (ctx) ctx.drawImage(img, 0, 0);
                  this.loadedAssets.set(key, canvas);
                  let tex = window.shadeupMakeTextureInternal(
                    [canvas.width, canvas.height],
                    "8bit",
                    "uint8"
                  );
                  tex.adapter?.drawImage(
                    canvas,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                  );
                  tex.adapter?.flush();
                  if (tex.adapter instanceof WebGPUAdapter) {
                    await tex.adapter.waitForDraw();
                  }
                  this.primedTextureAssets.set(key, tex);
                  resolve();
                };
                img.src = baseUrl + key;
              });
            } else if (type == "audio") {
              await new Promise((resolve) => {
                let audio = new Audio();
                audio.oncanplaythrough = () => {
                  this.loadedAssets.set(key, audio);
                  resolve();
                };
                audio.src = baseUrl + key;
              });
            } else if (type == "video") {
              await new Promise((resolve) => {
                let video = document.createElement("video");
                video.oncanplaythrough = () => {
                  this.loadedAssets.set(key, video);
                  resolve();
                };
                video.src = baseUrl + key;
              });
            } else {
              let raw = fetch(baseUrl + key);
              if (type == "binary") {
                await raw
                  .then((res) => res.arrayBuffer())
                  .then((res) => {
                    this.loadedAssets.set(key, res);
                  });
              } else if (type == "text") {
                await raw
                  .then((res) => res.text())
                  .then((res) => {
                    this.loadedAssets.set(key, res);
                  });
              } else if (type == "model") {
                await raw
                  .then((res) => res.arrayBuffer())
                  .then(async (res) => {
                    const { GLTFLoader } = await Promise.resolve().then(
                      () => GLTFLoader$1
                    );
                    const {
                      Vector3,
                      Mesh: THREEMesh,
                      MeshStandardMaterial,
                    } = await Promise.resolve().then(() => three_module);
                    const { DRACOLoader } = await Promise.resolve().then(
                      () => DRACOLoader$1
                    );
                    const dracoLoader = new DRACOLoader();
                    dracoLoader.setDecoderPath("/lib/draco/");
                    const loader = new GLTFLoader();
                    loader.setDRACOLoader(dracoLoader);
                    let out = await new Promise((reso, rej) => {
                      loader.parse(
                        res,
                        "",
                        (d) => {
                          reso(d);
                        },
                        (e) => {
                          rej(e);
                        }
                      );
                    });
                    let parts = [];
                    let scene = out.scene;
                    function convertMesh(mesh) {
                      let positions = [];
                      let normals = [];
                      let tangents = [];
                      let bitangents = [];
                      let uvs = [];
                      let colors = [];
                      let indices = [];
                      if (mesh.geometry.index) {
                        for (let i = 0; i < mesh.geometry.index.count; i++) {
                          indices.push(mesh.geometry.index?.array[i]);
                        }
                      }
                      if (mesh.geometry.attributes.position) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.position.array.length;
                          i += 3
                        ) {
                          positions.push([
                            mesh.geometry.attributes.position.array[i],
                            mesh.geometry.attributes.position.array[i + 1],
                            mesh.geometry.attributes.position.array[i + 2],
                          ]);
                        }
                      }
                      if (mesh.geometry.attributes.normal) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.normal.array.length;
                          i += 3
                        ) {
                          normals.push([
                            mesh.geometry.attributes.normal.array[i],
                            mesh.geometry.attributes.normal.array[i + 1],
                            mesh.geometry.attributes.normal.array[i + 2],
                          ]);
                        }
                      }
                      if (mesh.geometry.attributes.tangent) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.tangent.array.length;
                          i += 4
                        ) {
                          tangents.push([
                            mesh.geometry.attributes.tangent.array[i],
                            mesh.geometry.attributes.tangent.array[i + 1],
                            mesh.geometry.attributes.tangent.array[i + 2],
                          ]);
                        }
                      }
                      if (mesh.geometry.attributes.bitangent) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.bitangent.array.length;
                          i += 3
                        ) {
                          bitangents.push([
                            mesh.geometry.attributes.bitangent.array[i],
                            mesh.geometry.attributes.bitangent.array[i + 1],
                            mesh.geometry.attributes.bitangent.array[i + 2],
                          ]);
                        }
                      }
                      if (mesh.geometry.attributes.uv) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.uv.array.length;
                          i += 2
                        ) {
                          uvs.push([
                            mesh.geometry.attributes.uv.array[i],
                            mesh.geometry.attributes.uv.array[i + 1],
                          ]);
                        }
                      }
                      if (mesh.geometry.attributes.color) {
                        for (
                          let i = 0;
                          i < mesh.geometry.attributes.color.array.length;
                          i += 4
                        ) {
                          colors.push([
                            mesh.geometry.attributes.color.array[i],
                            mesh.geometry.attributes.color.array[i + 1],
                            mesh.geometry.attributes.color.array[i + 2],
                            mesh.geometry.attributes.color.array[i + 3],
                          ]);
                        }
                      }
                      let m = new window.SHD_Mesh({});
                      m.vertices = positions;
                      m.normals = normals;
                      m.uvs = uvs;
                      m.colors = colors;
                      m.triangles = indices;
                      return m;
                    }
                    let that = this;
                    function convertTexMap(map) {
                      let t = that.engine.shadeupMakeTextureFromImageLike(
                        map.source.data
                      );
                      return t;
                    }
                    scene.traverse((obj) => {
                      if (obj instanceof THREEMesh && obj.isMesh) {
                        let mobj = obj;
                        let m = convertMesh(mobj);
                        let mat = mobj.material;
                        let part = new window.SHD_ModelPart({});
                        if (!Array.isArray(mat)) {
                          let shdMat = new window.SHD_Material({});
                          if (mat instanceof MeshStandardMaterial) {
                            shdMat.baseColor = [
                              mat.color.r,
                              mat.color.g,
                              mat.color.b,
                              1,
                            ];
                            if (mat.normalMap) {
                              shdMat.normal = convertTexMap(mat.normalMap);
                              shdMat.normalScale = [
                                mat.normalScale.x,
                                mat.normalScale.y,
                              ];
                            }
                            if (mat.map) {
                              shdMat.color = convertTexMap(mat.map);
                            }
                            if (mat.metalnessMap) {
                              shdMat.metallic = convertTexMap(mat.metalnessMap);
                            }
                            if (mat.roughnessMap) {
                              shdMat.roughness = convertTexMap(
                                mat.roughnessMap
                              );
                            }
                            if (mat.emissiveMap) {
                              shdMat.emissive = convertTexMap(mat.emissiveMap);
                            }
                            part.material = shdMat;
                          }
                        }
                        part.mesh = m;
                        let world = obj.getWorldPosition(new Vector3());
                        part.position = [world.x, world.y, world.z];
                        parts.push(part);
                      }
                    });
                    let model = new window.SHD_Model({});
                    model.parts = parts;
                    this.loadedAssets.set(key, model);
                  });
              }
            }
          })()
        );
      }
      await Promise.all(promises);
      console.log("Loaded assets", [...this.loadedAssets.keys()]);
    }
  }

  class ShadeupEngine {
    adapter;
    playing = true;
    timeMultiplier = 1;
    canvas;
    paint;
    shadeup_globals = {};
    textureDestroyQueue = [];
    errCount = 0;
    isFirstFrame = true;
    hasLoadedCode = false;
    assetLoader;
    inputValues = /* @__PURE__ */ new Map();
    frameFunc = async () => {};
    env = {
      camera:
        window?.env?.camera ??
        (window._makeCamera ? new window._makeCamera({}) : null),
      camera2d:
        window?.env?.camera2d ??
        (window._makeCamera2d ? new window._makeCamera2d({}) : null),
      deltaTime: 0,
      time: 0,
      frame: 0,
      screenSize: [0, 0],
      keyboard: { ...blankKeyboardState },
      mouse: {
        button: [false, false, false],
        clicked: [false, false, false],
        screen: [0, 0],
        uv: [0, 0],
        startScreen: [0, 0],
        startUv: [0, 0],
        deltaUv: [0, 0],
        frameDeltaUv: [0, 0],
        deltaScreen: [0, 0],
        frameDeltaScreen: [0, 0],
        dragging: false,
        velocity: 0,
        wheel: 0,
        focused: false,
      },
      configureCamera(options) {},
      input(key, defaultValue) {
        return defaultValue;
      },
      output(key, value) {},
    };
    stats = /* @__PURE__ */ new Map();
    statsGraph = /* @__PURE__ */ new Map();
    statsMark = /* @__PURE__ */ new Map();
    statsGraphMark = /* @__PURE__ */ new Map();
    hooks = [];
    preferredAdapter = "webgpu";
    constructor(canvas, adapter) {
      this.canvas = canvas;
      this.adapter = adapter;
      this.paint = new PaintingContext(canvas, adapter);
      this.assetLoader = new ShadeupAssetLoader(this);
      window["paint"] = this.paint;
      this.env.input = (key, defaultValue) => {
        return this.inputValues.get(key) ?? defaultValue;
      };
      this.env.output = function output(key, value) {
        window.parent.postMessage({ type: "output", key, value }, "*");
      };
      this.addCoreHook();
    }
    _SHADEUP_UI_PUCK = () => {};
    _SHADEUP_UI_SLIDER = () => {};
    _SHADEUP_UI_CONTROL = () => {};
    shadeupMakeTextureInternal(size, format, innerType = "float4") {
      if (size.length == 3) {
        size = [Math.floor(size[0]), Math.floor(size[1]), Math.floor(size[2])];
        let tex2 = new ShadeupTexture3d();
        tex2.innerType = innerType;
        tex2.size = size;
        tex2.width = size[0];
        tex2.height = size[1];
        tex2.depth = size[2];
        if (this.preferredAdapter == "webgl") {
          tex2.adapter = new WebGLAdapter(null);
        } else if (this.preferredAdapter == "webgpu") {
          tex2.adapter = new WebGPUAdapter(null);
          let webgpu = tex2.adapter;
          webgpu.textureFormat = tex2.innerType;
          webgpu.headless = true;
          webgpu.headlessHeight = tex2.height;
          webgpu.headlessWidth = tex2.width;
          webgpu.headlessDepth = tex2.depth;
          webgpu.headlessDimensions = 3;
        } else {
          throw new Error("No adapter found");
        }
        tex2.adapter.init();
        tex2.adapter.setViewport(0, 0);
        return tex2;
      }
      size = [Math.floor(size[0]), Math.floor(size[1])];
      let tex = new ShadeupTexture2d();
      tex.innerType = innerType;
      tex.size = size;
      tex.width = size[0];
      tex.height = size[1];
      tex.image = document.createElement("canvas");
      tex.image.width = tex.width;
      tex.image.height = tex.height;
      if (this.preferredAdapter == "webgl") {
        tex.adapter = new WebGLAdapter(tex.image);
      } else if (this.preferredAdapter == "webgpu") {
        let gpuTextureFormat = "rgba8unorm";
        if (format == "auto") {
          format = innerType == "uint8" ? "8bit" : "32bit";
        }
        gpuTextureFormat = FormatInnerTypeMapping[`${format}-${innerType}`];
        tex.adapter = new WebGPUAdapter(tex.image);
        let webgpu = tex.adapter;
        webgpu.textureFormat = tex.innerType;
        webgpu.gpuTextureFormat = gpuTextureFormat;
        webgpu.headless = true;
        webgpu.headlessHeight = tex.height;
        webgpu.headlessWidth = tex.width;
      } else {
        throw new Error("No adapter found");
      }
      tex.init();
      tex.adapter.init();
      tex.adapter.setViewport(tex.width, tex.height);
      tex.paint = new PaintingContext(tex.image, tex.adapter);
      tex.paint.markDirtyCallback = () => {
        tex.cpuFlush();
        tex.dirty = true;
        tex.cpuReadDirty = true;
        tex.version++;
      };
      tex.adapter.clear(true);
      return tex;
    }
    shadeupMakeTextureFromImageLike(img) {
      let tex = this.shadeupMakeTextureInternal(
        [img.width, img.height],
        "8bit",
        "uint8"
      );
      let canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      let ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      tex.adapter?.drawImage(canvas, 0, 0, img.width, img.height);
      tex.adapter?.flush();
      return tex;
    }
    reset() {
      for (let hook of this.hooks) {
        if (hook.reset) {
          try {
            hook.reset();
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
    addCoreHook() {
      let lastFrame = performance.now();
      let timeCounter = 0;
      let frameCount = 0;
      this.hooks.push({
        beforeFrame: () => {
          if (!this.playing) return;
          if (
            this.canvas.width != this.adapter.viewportSize[0] ||
            this.canvas.height != this.adapter.viewportSize[1]
          ) {
            this.adapter.setViewport(this.canvas.width, this.canvas.height);
          }
          if (
            this.canvas.width != this.paint.__offscreen_canvas.width ||
            this.canvas.height != this.paint.__offscreen_canvas.height
          ) {
            this.paint.__offscreen_canvas.width = this.canvas.width;
            this.paint.__offscreen_canvas.height = this.canvas.height;
          }
          let delta = performance.now() - lastFrame;
          lastFrame = performance.now();
          timeCounter += (delta / 1e3) * this.timeMultiplier;
          frameCount += 1 * this.timeMultiplier;
          this.env.deltaTime = (delta / 1e3) * this.timeMultiplier;
          this.env.time = timeCounter;
          this.env.frame = frameCount;
          this.env.screenSize = [this.canvas.width, this.canvas.height];
        },
        reset: () => {
          lastFrame = performance.now();
          timeCounter = 0;
          frameCount = 0;
        },
      });
    }
    __shadeup_print(...args) {}
    __shadeup_stat(name, value) {}
    __shadeup_statGraph(name, value, sampleRate = 1) {}
    clear() {
      try {
        this.adapter.clear();
      } catch (e) {
        console.error(e);
      }
    }
    async loadLib(name) {
      this.assetLoader.loadLib(name);
    }
    async loadLibs() {
      this.assetLoader.loadLibs();
    }
    async loadAssets() {
      this.assetLoader.loadAssets();
    }
    __shadeup_register_loads = (ids) => {
      this.assetLoader.registeredLoads.push(...ids);
    };
    __shadeup_register_libs(libs) {
      for (let lib of libs) {
        this.assetLoader.registeredLibs.add(lib);
      }
    }
    load(id) {
      let asset = this.assetLoader.loadedAssets.get(id);
      if (!asset) {
        throw new Error("Asset not found");
      }
      if (asset instanceof HTMLCanvasElement) {
        if (this.assetLoader.primedTextureAssets.has(id)) {
          let a = this.assetLoader.primedTextureAssets.get(id);
          this.assetLoader.primedTextureAssets.delete(id);
          return a;
        }
        let tex = window.shadeupMakeTextureInternal(
          [asset.width, asset.height],
          "8bit",
          "uint8"
        );
        tex.adapter?.drawImage(asset, 0, 0, asset.width, asset.height);
        tex.adapter?.flush();
        return tex;
      } else if (asset && asset.clone) {
        return asset.clone();
      }
      return asset;
    }
    async frameLoop() {
      for (let hook of this.hooks) {
        if (hook.beforeFrame) {
          try {
            hook.beforeFrame(this.env.deltaTime);
          } catch (e) {
            console.error(e);
          }
        }
      }
      if (this.playing) {
        try {
          if (this.adapter instanceof WebGPUAdapter) {
          } else {
            this.clear();
          }
          await this.frameFunc();
          paint.flush();
          this.adapter.flush();
          if (this.adapter instanceof WebGPUAdapter) {
            this.adapter.trace("endFrame\n\n", {});
          }
          this.adapter.switchContext("draw");
          for (let tex of this.textureDestroyQueue) {
            if (tex.adapter) {
              tex.adapter.dispose();
            }
          }
          this.textureDestroyQueue = [];
        } catch (e) {
          if (this.errCount < 10) {
            console.error(e);
            if (window.bubbleError) window.bubbleError(e.toString() + e.stack);
            this.errCount++;
            if (this.errCount === 10) {
              console.warn("Too many errors, slowing logs");
            }
          } else {
            this.errCount++;
            if (this.errCount % 100 === 0) {
              if (window.bubbleError)
                window.bubbleError(e.toString() + e.stack);
              console.error(e);
            }
          }
        }
        for (let hook of this.hooks) {
          if (hook.afterFrame) {
            try {
              hook.afterFrame(this.env.deltaTime);
            } catch (e) {
              console.error(e);
            }
          }
        }
        for (let statKey of this.stats.keys()) {
          if ((this.statsMark.get(statKey) ?? 0) <= 0) {
            this.stats.get(statKey)?.remove();
            this.stats.delete(statKey);
            this.statsMark.delete(statKey);
          } else {
            this.statsMark.set(statKey, this.statsMark.get(statKey) - 1);
          }
        }
        for (let statKey of this.statsGraph.keys()) {
          if ((this.statsGraphMark.get(statKey) ?? 0) <= 0) {
            this.statsGraph.get(statKey)?.graph.parentElement?.remove();
            this.statsGraph.delete(statKey);
            this.statsGraphMark.delete(statKey);
          } else {
            this.statsGraphMark.set(
              statKey,
              this.statsGraphMark.get(statKey) - 1
            );
          }
        }
        if (this.isFirstFrame && this.hasLoadedCode) {
          this.isFirstFrame = false;
          (async () => {
            await this.adapter.waitForDraw();
            window.parent.postMessage({ type: "firstFrame" }, "*");
          })();
        }
      }
    }
    flushAdapter() {
      this.adapter.flush();
    }
    __shadeup_gen_native_shader(code, type) {
      return this.adapter.createShader(code, type);
    }
    fullscreenVertexShader = null;
    registeredShaders = /* @__PURE__ */ new Map();
    __shadeup_gen_shader(key, params, code, indexMapping) {
      this.registeredShaders.set(
        key,
        new ShadeupShaderSource(params, code, indexMapping)
      );
    }
    __shadeup_make_shader_inst(key, params, closure) {
      let shader = this.registeredShaders.get(key);
      if (!shader) {
        throw new Error("Shader not found");
      }
      return shader.instance(params);
    }
    __shadeup_dispatch_compute(workgroups, shaderInst) {
      let computeCall = new ShaderDispatch("compute");
      computeCall.computeCount = workgroups;
      let compShader = shaderInst.get(this.adapter, "compute", {
        initialDispatch: shaderInst,
      });
      if (!compShader) {
        throw new Error("Fragment shader not found");
      }
      computeCall.setComputeShader(compShader);
      shaderInst.bindUniforms(computeCall.fragmentUniforms);
      if (this.adapter instanceof WebGPUAdapter) {
        this.adapter.dispatchCompute(computeCall);
      } else {
        throw new Error("WebGL compute not supported");
      }
    }
    __shadeup_dispatch_compute_indirect(
      indirectBuffer,
      indirectOffset,
      shaderInst
    ) {
      let computeCall = new ShaderDispatch("compute");
      computeCall.indirectBuffer = indirectBuffer;
      computeCall.indirectOffset = indirectOffset;
      let compShader = shaderInst.get(this.adapter, "compute", {
        initialDispatch: shaderInst,
      });
      if (!compShader) {
        throw new Error("Fragment shader not found");
      }
      computeCall.setComputeShader(compShader);
      shaderInst.bindUniforms(computeCall.fragmentUniforms);
      if (this.adapter instanceof WebGPUAdapter) {
        this.adapter.dispatchCompute(computeCall);
      } else {
        throw new Error("WebGL compute not supported");
      }
    }
    __shadeup_dispatch_draw_advanced(config) {
      let drawCall = new ShaderDispatch("draw");
      if (config.mesh) {
        drawCall.drawType = "geometry";
      } else if (config.indexBuffer) {
        drawCall.drawType = "indexed";
      }
      if (config.depth) {
        drawCall.overrideDepth = config.depth;
      }
      if (config.depthCompare) {
        drawCall.depthCompare = config.depthCompare;
      }
      if ("backfaceCulling" in config) {
        drawCall.backfaceCulling = config.backfaceCulling;
      }
      if (config.indirect) {
        drawCall.indirectBuffer = config.indirect;
      }
      drawCall.instanceCount = config.instances ?? 1;
      drawCall.attachments = config.attachments ?? null;
      drawCall.depthOnly = config.depthOnly ?? false;
      let fragShader = config.fragment.get(this.adapter, "fragment", {
        attachments: config.attachments
          ? config.attachments.map((a) => a.innerType)
          : void 0,
      });
      if (!fragShader) {
        throw new Error("Fragment shader not found");
      }
      drawCall.setFragmentShader(fragShader);
      let vertShader = config.vertex.get(this.adapter, "vertex");
      if (!vertShader) {
        throw new Error("Vertex shader not found");
      }
      drawCall.setVertexShader(vertShader);
      config.fragment.bindUniforms(drawCall.fragmentUniforms);
      config.vertex.bindUniforms(drawCall.vertexUniforms);
      if (config.mesh) {
        drawCall.setGeometry(config.mesh);
      } else if (config.indexBuffer) {
        drawCall.setIndexBuffer(config.indexBuffer);
      }
      this.adapter.dispatch(drawCall, {
        depthTest: config.depthTest ?? true,
      });
    }
    __shadeup_dispatch_draw(pixelShaderInst) {
      if (!this.fullscreenVertexShader) {
        this.fullscreenVertexShader = this.__shadeup_gen_native_shader(
          {
            webgl: `#version 300 es
		
		precision highp float;
		
		in vec3 a_position;
		in vec3 a_normal;
		in vec3 a_tangent;
		in vec3 a_bitangent;
		in vec2 a_uv;
		in vec4 a_color;

		out vec3 _v_position;
		out vec3 _v_normal;
		out vec3 _v_tangent;
		out vec3 _v_bitangent;
		out vec2 _v_uv;
		out vec4 _v_color;
		
		void main(void) {
		float x = float((gl_VertexID & 1) << 2);
		float y = float((gl_VertexID & 2) << 1);
		_v_uv.x = x * 0.5;
		_v_uv.y = 1.f - (y * 0.5);
		gl_Position = vec4(x - 1.0, y - 1.0, 0, 1);
		}`,
            webgpu: `
			struct VertexOutput {
				@builtin(position) Position : vec4<f32>,
				@location(0) Normal : vec3<f32>,
				@location(1) Tangent : vec3<f32>,
				@location(2) Bitangent : vec3<f32>,
				@location(3) TexCoord : vec2<f32>,
				@location(4) Color : vec4<f32>,
				@location(5) @interpolate(flat) instanceIndex : u32,
				@location(6) WorldPosition : vec3<f32>,
			};
		
			@vertex
			fn main(
				@builtin(vertex_index) VertexIndex : u32
			) -> VertexOutput {
				var x : f32 = f32((VertexIndex & 1) << 2);
				var y : f32 = f32((VertexIndex & 2) << 1);
				var output : VertexOutput;
				output.Position = vec4<f32>(x - 1.0, y - 1.0, 0, 1);
				output.Normal = vec3<f32>(1.0, 0.0, 0.0);
				output.Tangent = vec3<f32>(0.0, 1.0, 0.0);
				output.Bitangent = vec3<f32>(0.0, 0.0, 1.0);
				output.TexCoord = vec2<f32>(x * 0.5, 1.0 - (y * 0.5));
				output.Color = vec4<f32>(0.0, 0.0, 0.0, 0.0);
				output.instanceIndex = 0;
		
				return output;
			}
			`,
            software: () => {},
          },
          "vertex"
        );
      }
      if (!this.fullscreenVertexShader) {
        throw new Error("Fullscreen vertex shader not found");
      }
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "screen";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      drawCall.setVertexShader(this.fullscreenVertexShader);
      let fragShader = pixelShaderInst.get(this.adapter, "fragment", {
        initialDispatch: pixelShaderInst,
      });
      if (!fragShader) {
        throw new Error("Fragment shader not found");
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      drawCall.setGeometry(fullscreenGeo);
      this.adapter.dispatch(drawCall, {
        depthTest: false,
      });
    }
    PLATFORM_WEBGL = this.preferredAdapter == "webgl";
    PLATFORM_WEBGPU = this.preferredAdapter == "webgpu";
    __shadeup_dispatch_draw_geometry(
      geometry,
      vertexShaderInst,
      pixelShaderInst
    ) {
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "geometry";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setGeometry(geometry);
      this.adapter.dispatch(drawCall);
    }
    __shadeup_dispatch_draw_indexed(
      indexBuffer,
      vertexShaderInst,
      pixelShaderInst
    ) {
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "indexed";
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex-indexed");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setIndexBuffer(indexBuffer);
      this.adapter.dispatch(drawCall);
    }
    __shadeup_dispatch_draw_instanced_indexed(
      indexBuffer,
      instanceCount,
      vertexShaderInst,
      pixelShaderInst
    ) {
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "indexed";
      drawCall.instanceCount = instanceCount;
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex-indexed");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setIndexBuffer(indexBuffer);
      this.adapter.dispatch(drawCall);
    }
    __shadeup_dispatch_draw_instanced(
      mesh,
      instanceCount,
      vertexShaderInst,
      pixelShaderInst
    ) {
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "geometry";
      drawCall.instanceCount = instanceCount;
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      drawCall.setGeometry(mesh);
      this.adapter.dispatch(drawCall);
    }
    __shadeup_dispatch_draw_count(count, vertexShaderInst, pixelShaderInst) {
      let drawCall = new ShaderDispatch("draw");
      drawCall.drawType = "count";
      drawCall.drawCount = count;
      drawCall.setVertexUniform(
        "_vtex_canvas",
        makePrimitiveUniform(
          {
            type: "primitive",
            name: "float2",
          },
          [this.canvas.width, this.canvas.height]
        )
      );
      let fragShader = pixelShaderInst.get(this.adapter, "fragment");
      if (!fragShader) {
        return;
      }
      drawCall.setFragmentShader(fragShader);
      pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
      let vertShader = vertexShaderInst.get(this.adapter, "vertex-indexed");
      if (!vertShader) {
        return;
      }
      drawCall.setVertexShader(vertShader);
      vertexShaderInst.bindUniforms(drawCall.vertexUniforms);
      this.adapter.dispatch(drawCall);
    }
    __shadeup_structs;
    __shadeup_get_struct(name) {
      if (!this.__shadeup_structs) this.__shadeup_structs = {};
      return this.__shadeup_structs[name];
    }
    __shadeup_register_struct(fields, cls) {
      if (!this.__shadeup_structs) this.__shadeup_structs = {};
      this.__shadeup_structs[fields.name] = { fields, struct: cls };
    }
    __shadeup_error(err, context) {
      return err || context;
    }
    killed = false;
    useAnimationFrame = true;
    start() {
      (async () => {
        do {
          await this.frameLoop();
          if (this.adapter instanceof WebGPUAdapter);
          if (this.useAnimationFrame) {
            await new Promise(requestAnimationFrame);
          } else {
            await new Promise(setZeroTimeout);
          }
        } while (true);
      })();
    }
  }

  const addInputHook = (engine) => {
    let keyboardSink = /* @__PURE__ */ new Map();
    let lastFrameMousePosition = [0, 0];
    let mouseState = {
      button: [false, false, false],
      clicked: [false, false, false],
      screen: [0, 0],
      uv: [0, 0],
      startScreen: [0, 0],
      startUv: [0, 0],
      deltaUv: [0, 0],
      frameDeltaUv: [0, 0],
      deltaScreen: [0, 0],
      frameDeltaScreen: [0, 0],
      dragging: false,
      velocity: 0,
      wheel: 0,
      focused: false,
    };
    let { getKeyboardState } = initInput(
      engine.canvas,
      mouseState,
      keyboardSink
    );
    return {
      beforeFrame(delta) {
        if (!engine.playing) return;
        let lastFramePos = lastFrameMousePosition;
        mouseState.frameDeltaScreen = [
          mouseState.screen[0] - lastFramePos[0],
          mouseState.screen[1] - lastFramePos[1],
        ];
        let lastFramePosUv = [
          lastFramePos[0] / engine.canvas.width,
          lastFramePos[1] / engine.canvas.height,
        ];
        mouseState.frameDeltaUv = [
          mouseState.uv[0] - lastFramePosUv[0],
          mouseState.uv[1] - lastFramePosUv[1],
        ];
        mouseState.velocity = Math.sqrt(
          mouseState.frameDeltaScreen[0] ** 2 +
            mouseState.frameDeltaScreen[1] ** 2
        );
        lastFrameMousePosition = [...mouseState.screen];
        engine.env.keyboard = getKeyboardState();
        engine.env.mouse = {
          ...mouseState,
        };
      },
      afterFrame() {
        mouseState.clicked[0] = false;
        mouseState.clicked[1] = false;
        mouseState.clicked[2] = false;
      },
    };
  };

  function isAbsolute(pathname) {
    return pathname.charAt(0) === "/";
  }

  // About 1.5x faster than the two-arg version of Array#splice()
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
      list[i] = list[k];
    }

    list.pop();
  }

  // This implementation is based heavily on node's url.parse
  function resolvePathname(to, from) {
    if (from === undefined) from = "";

    var toParts = (to && to.split("/")) || [];
    var fromParts = (from && from.split("/")) || [];

    var isToAbs = to && isAbsolute(to);
    var isFromAbs = from && isAbsolute(from);
    var mustEndAbs = isToAbs || isFromAbs;

    if (to && isAbsolute(to)) {
      // to is absolute
      fromParts = toParts;
    } else if (toParts.length) {
      // to is relative, drop the filename
      fromParts.pop();
      fromParts = fromParts.concat(toParts);
    }

    if (!fromParts.length) return "/";

    var hasTrailingSlash;
    if (fromParts.length) {
      var last = fromParts[fromParts.length - 1];
      hasTrailingSlash = last === "." || last === ".." || last === "";
    } else {
      hasTrailingSlash = false;
    }

    var up = 0;
    for (var i = fromParts.length; i >= 0; i--) {
      var part = fromParts[i];

      if (part === ".") {
        spliceOne(fromParts, i);
      } else if (part === "..") {
        spliceOne(fromParts, i);
        up++;
      } else if (up) {
        spliceOne(fromParts, i);
        up--;
      }
    }

    if (!mustEndAbs) for (; up--; up) fromParts.unshift("..");

    if (
      mustEndAbs &&
      fromParts[0] !== "" &&
      (!fromParts[0] || !isAbsolute(fromParts[0]))
    )
      fromParts.unshift("");

    var result = fromParts.join("/");

    if (hasTrailingSlash && result.substr(-1) !== "/") result += "/";

    return result;
  }

  function globalDefine(name, deps, callback) {
    if (typeof name !== "string") {
      callback = deps;
      deps = name;
      name = null;
    }
    if (!Array.isArray(deps)) {
      callback = deps;
      deps = [];
    }
    if (!deps.length && callback.length) {
      if (callback.length === 1) {
        deps = ["require"];
      } else if (callback.length === 2) {
        deps = ["require", "exports"];
      } else {
        deps = ["require", "exports", "module"];
      }
    }
    globalDefine.amd[name] = {
      deps,
      callback,
    };
  }
  globalDefine.amd = {
    require: {
      deps: [],
      callback: function () {
        return globalRequire;
      },
    },
    exports: {
      deps: [],
      callback: function () {
        return {};
      },
    },
  };
  function globalRequire(deps) {
    let result = [];
    for (let i = 0; i < deps.length; i++) {
      let dep = deps[i];
      if (dep !== "require" && dep !== "exports" && dep !== "module") {
        dep = resolvePathname(dep, "/");
        if (!(dep in globalDefine.amd)) {
          if (!dep.endsWith(".js")) {
            dep += ".js";
          }
        }
      }
      if (dep in globalDefine.amd) {
        let deps2 = globalDefine.amd[dep].deps;
        let depsResults = [];
        for (let d of deps2) {
          depsResults.push(globalRequire([d])[0]);
        }
        let callback = globalDefine.amd[dep].callback;
        let exports = callback.apply(null, depsResults);
        if (deps2.indexOf("exports") !== -1) {
          exports = depsResults[deps2.indexOf("exports")];
        }
        result.push(exports);
      } else {
        throw new Error(`Cannot find module '${dep}'`);
      }
    }
    return result;
  }

  function makeAMDResolver() {
    function globalDefine(name, deps, callback) {
      if (typeof name !== "string") {
        callback = deps;
        deps = name;
        name = null;
      }
      if (!Array.isArray(deps)) {
        callback = deps;
        deps = [];
      }
      if (!deps.length && callback.length) {
        if (callback.length === 1) {
          deps = ["require"];
        } else if (callback.length === 2) {
          deps = ["require", "exports"];
        } else {
          deps = ["require", "exports", "module"];
        }
      }
      globalDefine.amd[name] = {
        deps,
        callback,
      };
    }
    globalDefine.amd = {
      require: {
        deps: [],
        callback: function () {
          return globalRequire;
        },
      },
      exports: {
        deps: [],
        callback: function () {
          return {};
        },
      },
    };
    function globalRequire(deps) {
      let result = [];
      for (let i = 0; i < deps.length; i++) {
        let dep = deps[i];
        if (dep !== "require" && dep !== "exports" && dep !== "module") {
          dep = resolvePathname(dep, "/");
          if (!(dep in globalDefine.amd)) {
            if (!dep.endsWith(".js")) {
              dep += ".js";
            }
          }
        }
        if (dep in globalDefine.amd) {
          let deps2 = globalDefine.amd[dep].deps;
          let depsResults = [];
          for (let d of deps2) {
            depsResults.push(globalRequire([d])[0]);
          }
          let callback = globalDefine.amd[dep].callback;
          let exports = callback.apply(null, depsResults);
          if (deps2.indexOf("exports") !== -1) {
            exports = depsResults[deps2.indexOf("exports")];
          }
          result.push(exports);
        } else {
          throw new Error(`Cannot find module '${dep}'`);
        }
      }
      return result;
    }
    return { globalDefine, globalRequire };
  }

  const makeShadeupEngine = (canvas, options) => {
    options = options || {};
    const preferredAdapter = options.preferredAdapter || "webgpu";
    let graphicsAdapter;
    if (preferredAdapter == "webgl") {
      graphicsAdapter = new WebGLAdapter(canvas);
    } else if (preferredAdapter == "webgpu") {
      graphicsAdapter = new WebGPUAdapter(canvas);
    } else {
      throw new Error("No adapter found");
    }
    const engine = new ShadeupEngine(canvas, graphicsAdapter);
    engine.start();
    const inputHook = addInputHook(engine);
    engine.hooks.push(inputHook);
    const { screenshotQueue, screenshotQueueResults, ...captureHook } =
      addCaptureHook(engine);
    engine.hooks.push(captureHook);
    const cameraHook = addCameraHook(engine);
    engine.hooks.push(cameraHook);
    return engine;
  };
  const linkIntoEngine = async (engine, fn) => {
    const resolver = makeAMDResolver();
    fn(resolver.globalDefine);
    globalRequire(["/_std/mesh.js"])[0];
    await engine.assetLoader.loadAssets();
    await engine.assetLoader.loadLibs();
    try {
      let outs = globalRequire(["/main.js"])[0];
      if (typeof outs.main === "function") {
        engine.frameFunc = outs.main;
        engine.hasLoadedCode = true;
      }
    } catch (e) {
      console.error(e);
      result = e.message;
    }
    engine.frameFunc;
  };

  /**
   * @license
   * Copyright 2010-2023 Three.js Authors
   * SPDX-License-Identifier: MIT
   */
  const REVISION = "155";
  const FrontSide = 0;
  const BackSide = 1;
  const DoubleSide = 2;
  const NormalBlending = 1;
  const AddEquation = 100;
  const SrcAlphaFactor = 204;
  const OneMinusSrcAlphaFactor = 205;
  const LessEqualDepth = 3;
  const MultiplyOperation = 0;

  const UVMapping = 300;
  const RepeatWrapping = 1000;
  const ClampToEdgeWrapping = 1001;
  const MirroredRepeatWrapping = 1002;
  const NearestFilter = 1003;
  const NearestMipmapNearestFilter = 1004;
  const NearestMipmapLinearFilter = 1005;
  const LinearFilter = 1006;
  const LinearMipmapNearestFilter = 1007;
  const LinearMipmapLinearFilter = 1008;
  const UnsignedByteType = 1009;
  const FloatType = 1015;
  const RGBAFormat = 1023;
  const InterpolateDiscrete = 2300;
  const InterpolateLinear = 2301;
  const InterpolateSmooth = 2302;
  const ZeroCurvatureEnding = 2400;
  const ZeroSlopeEnding = 2401;
  const WrapAroundEnding = 2402;
  const NormalAnimationBlendMode = 2500;
  const TrianglesDrawMode = 0;
  const TriangleStripDrawMode = 1;
  const TriangleFanDrawMode = 2;
  /** @deprecated Use LinearSRGBColorSpace or NoColorSpace in three.js r152+. */
  const LinearEncoding = 3000;
  /** @deprecated Use SRGBColorSpace in three.js r152+. */
  const sRGBEncoding = 3001;
  const TangentSpaceNormalMap = 0;

  // Color space string identifiers, matching CSS Color Module Level 4 and WebGPU names where available.
  const NoColorSpace = "";
  const SRGBColorSpace = "srgb";
  const LinearSRGBColorSpace = "srgb-linear";
  const DisplayP3ColorSpace = "display-p3";
  const KeepStencilOp = 7680;
  const AlwaysStencilFunc = 519;

  const StaticDrawUsage = 35044;

  const WebGLCoordinateSystem = 2000;
  const WebGPUCoordinateSystem = 2001;

  /**
   * https://github.com/mrdoob/eventdispatcher.js/
   */

  class EventDispatcher {
    addEventListener(type, listener) {
      if (this._listeners === undefined) this._listeners = {};

      const listeners = this._listeners;

      if (listeners[type] === undefined) {
        listeners[type] = [];
      }

      if (listeners[type].indexOf(listener) === -1) {
        listeners[type].push(listener);
      }
    }

    hasEventListener(type, listener) {
      if (this._listeners === undefined) return false;

      const listeners = this._listeners;

      return (
        listeners[type] !== undefined &&
        listeners[type].indexOf(listener) !== -1
      );
    }

    removeEventListener(type, listener) {
      if (this._listeners === undefined) return;

      const listeners = this._listeners;
      const listenerArray = listeners[type];

      if (listenerArray !== undefined) {
        const index = listenerArray.indexOf(listener);

        if (index !== -1) {
          listenerArray.splice(index, 1);
        }
      }
    }

    dispatchEvent(event) {
      if (this._listeners === undefined) return;

      const listeners = this._listeners;
      const listenerArray = listeners[event.type];

      if (listenerArray !== undefined) {
        event.target = this;

        // Make a copy, in case listeners are removed while iterating.
        const array = listenerArray.slice(0);

        for (let i = 0, l = array.length; i < l; i++) {
          array[i].call(this, event);
        }

        event.target = null;
      }
    }
  }

  const _lut = [
    "00",
    "01",
    "02",
    "03",
    "04",
    "05",
    "06",
    "07",
    "08",
    "09",
    "0a",
    "0b",
    "0c",
    "0d",
    "0e",
    "0f",
    "10",
    "11",
    "12",
    "13",
    "14",
    "15",
    "16",
    "17",
    "18",
    "19",
    "1a",
    "1b",
    "1c",
    "1d",
    "1e",
    "1f",
    "20",
    "21",
    "22",
    "23",
    "24",
    "25",
    "26",
    "27",
    "28",
    "29",
    "2a",
    "2b",
    "2c",
    "2d",
    "2e",
    "2f",
    "30",
    "31",
    "32",
    "33",
    "34",
    "35",
    "36",
    "37",
    "38",
    "39",
    "3a",
    "3b",
    "3c",
    "3d",
    "3e",
    "3f",
    "40",
    "41",
    "42",
    "43",
    "44",
    "45",
    "46",
    "47",
    "48",
    "49",
    "4a",
    "4b",
    "4c",
    "4d",
    "4e",
    "4f",
    "50",
    "51",
    "52",
    "53",
    "54",
    "55",
    "56",
    "57",
    "58",
    "59",
    "5a",
    "5b",
    "5c",
    "5d",
    "5e",
    "5f",
    "60",
    "61",
    "62",
    "63",
    "64",
    "65",
    "66",
    "67",
    "68",
    "69",
    "6a",
    "6b",
    "6c",
    "6d",
    "6e",
    "6f",
    "70",
    "71",
    "72",
    "73",
    "74",
    "75",
    "76",
    "77",
    "78",
    "79",
    "7a",
    "7b",
    "7c",
    "7d",
    "7e",
    "7f",
    "80",
    "81",
    "82",
    "83",
    "84",
    "85",
    "86",
    "87",
    "88",
    "89",
    "8a",
    "8b",
    "8c",
    "8d",
    "8e",
    "8f",
    "90",
    "91",
    "92",
    "93",
    "94",
    "95",
    "96",
    "97",
    "98",
    "99",
    "9a",
    "9b",
    "9c",
    "9d",
    "9e",
    "9f",
    "a0",
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "a8",
    "a9",
    "aa",
    "ab",
    "ac",
    "ad",
    "ae",
    "af",
    "b0",
    "b1",
    "b2",
    "b3",
    "b4",
    "b5",
    "b6",
    "b7",
    "b8",
    "b9",
    "ba",
    "bb",
    "bc",
    "bd",
    "be",
    "bf",
    "c0",
    "c1",
    "c2",
    "c3",
    "c4",
    "c5",
    "c6",
    "c7",
    "c8",
    "c9",
    "ca",
    "cb",
    "cc",
    "cd",
    "ce",
    "cf",
    "d0",
    "d1",
    "d2",
    "d3",
    "d4",
    "d5",
    "d6",
    "d7",
    "d8",
    "d9",
    "da",
    "db",
    "dc",
    "dd",
    "de",
    "df",
    "e0",
    "e1",
    "e2",
    "e3",
    "e4",
    "e5",
    "e6",
    "e7",
    "e8",
    "e9",
    "ea",
    "eb",
    "ec",
    "ed",
    "ee",
    "ef",
    "f0",
    "f1",
    "f2",
    "f3",
    "f4",
    "f5",
    "f6",
    "f7",
    "f8",
    "f9",
    "fa",
    "fb",
    "fc",
    "fd",
    "fe",
    "ff",
  ];

  let _seed = 1234567;

  const DEG2RAD = Math.PI / 180;
  const RAD2DEG = 180 / Math.PI;

  // http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
  function generateUUID() {
    const d0 = (Math.random() * 0xffffffff) | 0;
    const d1 = (Math.random() * 0xffffffff) | 0;
    const d2 = (Math.random() * 0xffffffff) | 0;
    const d3 = (Math.random() * 0xffffffff) | 0;
    const uuid =
      _lut[d0 & 0xff] +
      _lut[(d0 >> 8) & 0xff] +
      _lut[(d0 >> 16) & 0xff] +
      _lut[(d0 >> 24) & 0xff] +
      "-" +
      _lut[d1 & 0xff] +
      _lut[(d1 >> 8) & 0xff] +
      "-" +
      _lut[((d1 >> 16) & 0x0f) | 0x40] +
      _lut[(d1 >> 24) & 0xff] +
      "-" +
      _lut[(d2 & 0x3f) | 0x80] +
      _lut[(d2 >> 8) & 0xff] +
      "-" +
      _lut[(d2 >> 16) & 0xff] +
      _lut[(d2 >> 24) & 0xff] +
      _lut[d3 & 0xff] +
      _lut[(d3 >> 8) & 0xff] +
      _lut[(d3 >> 16) & 0xff] +
      _lut[(d3 >> 24) & 0xff];

    // .toLowerCase() here flattens concatenated strings to save heap memory space.
    return uuid.toLowerCase();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  // compute euclidean modulo of m % n
  // https://en.wikipedia.org/wiki/Modulo_operation
  function euclideanModulo(n, m) {
    return ((n % m) + m) % m;
  }

  // Linear mapping from range <a1, a2> to range <b1, b2>
  function mapLinear(x, a1, a2, b1, b2) {
    return b1 + ((x - a1) * (b2 - b1)) / (a2 - a1);
  }

  // https://www.gamedev.net/tutorials/programming/general-and-gameplay-programming/inverse-lerp-a-super-useful-yet-often-overlooked-function-r5230/
  function inverseLerp(x, y, value) {
    if (x !== y) {
      return (value - x) / (y - x);
    } else {
      return 0;
    }
  }

  // https://en.wikipedia.org/wiki/Linear_interpolation
  function lerp(x, y, t) {
    return (1 - t) * x + t * y;
  }

  // http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/
  function damp(x, y, lambda, dt) {
    return lerp(x, y, 1 - Math.exp(-lambda * dt));
  }

  // https://www.desmos.com/calculator/vcsjnyz7x4
  function pingpong(x, length = 1) {
    return length - Math.abs(euclideanModulo(x, length * 2) - length);
  }

  // http://en.wikipedia.org/wiki/Smoothstep
  function smoothstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * (3 - 2 * x);
  }

  function smootherstep(x, min, max) {
    if (x <= min) return 0;
    if (x >= max) return 1;

    x = (x - min) / (max - min);

    return x * x * x * (x * (x * 6 - 15) + 10);
  }

  // Random integer from <low, high> interval
  function randInt(low, high) {
    return low + Math.floor(Math.random() * (high - low + 1));
  }

  // Random float from <low, high> interval
  function randFloat(low, high) {
    return low + Math.random() * (high - low);
  }

  // Random float from <-range/2, range/2> interval
  function randFloatSpread(range) {
    return range * (0.5 - Math.random());
  }

  // Deterministic pseudo-random float in the interval [ 0, 1 ]
  function seededRandom(s) {
    if (s !== undefined) _seed = s;

    // Mulberry32 generator

    let t = (_seed += 0x6d2b79f5);

    t = Math.imul(t ^ (t >>> 15), t | 1);

    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);

    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  function degToRad(degrees) {
    return degrees * DEG2RAD;
  }

  function radToDeg(radians) {
    return radians * RAD2DEG;
  }

  function isPowerOfTwo(value) {
    return (value & (value - 1)) === 0 && value !== 0;
  }

  function ceilPowerOfTwo(value) {
    return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
  }

  function floorPowerOfTwo(value) {
    return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
  }

  function setQuaternionFromProperEuler(q, a, b, c, order) {
    // Intrinsic Proper Euler Angles - see https://en.wikipedia.org/wiki/Euler_angles

    // rotations are applied to the axes in the order specified by 'order'
    // rotation by angle 'a' is applied first, then by angle 'b', then by angle 'c'
    // angles are in radians

    const cos = Math.cos;
    const sin = Math.sin;

    const c2 = cos(b / 2);
    const s2 = sin(b / 2);

    const c13 = cos((a + c) / 2);
    const s13 = sin((a + c) / 2);

    const c1_3 = cos((a - c) / 2);
    const s1_3 = sin((a - c) / 2);

    const c3_1 = cos((c - a) / 2);
    const s3_1 = sin((c - a) / 2);

    switch (order) {
      case "XYX":
        q.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
        break;

      case "YZY":
        q.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
        break;

      case "ZXZ":
        q.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
        break;

      case "XZX":
        q.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
        break;

      case "YXY":
        q.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
        break;

      case "ZYZ":
        q.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
        break;

      default:
        console.warn(
          "THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " +
            order
        );
    }
  }

  function denormalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;

      case Uint32Array:
        return value / 4294967295.0;

      case Uint16Array:
        return value / 65535.0;

      case Uint8Array:
        return value / 255.0;

      case Int32Array:
        return Math.max(value / 2147483647.0, -1.0);

      case Int16Array:
        return Math.max(value / 32767.0, -1.0);

      case Int8Array:
        return Math.max(value / 127.0, -1.0);

      default:
        throw new Error("Invalid component type.");
    }
  }

  function normalize(value, array) {
    switch (array.constructor) {
      case Float32Array:
        return value;

      case Uint32Array:
        return Math.round(value * 4294967295.0);

      case Uint16Array:
        return Math.round(value * 65535.0);

      case Uint8Array:
        return Math.round(value * 255.0);

      case Int32Array:
        return Math.round(value * 2147483647.0);

      case Int16Array:
        return Math.round(value * 32767.0);

      case Int8Array:
        return Math.round(value * 127.0);

      default:
        throw new Error("Invalid component type.");
    }
  }

  const MathUtils = {
    DEG2RAD: DEG2RAD,
    RAD2DEG: RAD2DEG,
    generateUUID: generateUUID,
    clamp: clamp,
    euclideanModulo: euclideanModulo,
    mapLinear: mapLinear,
    inverseLerp: inverseLerp,
    lerp: lerp,
    damp: damp,
    pingpong: pingpong,
    smoothstep: smoothstep,
    smootherstep: smootherstep,
    randInt: randInt,
    randFloat: randFloat,
    randFloatSpread: randFloatSpread,
    seededRandom: seededRandom,
    degToRad: degToRad,
    radToDeg: radToDeg,
    isPowerOfTwo: isPowerOfTwo,
    ceilPowerOfTwo: ceilPowerOfTwo,
    floorPowerOfTwo: floorPowerOfTwo,
    setQuaternionFromProperEuler: setQuaternionFromProperEuler,
    normalize: normalize,
    denormalize: denormalize,
  };

  class Vector2 {
    constructor(x = 0, y = 0) {
      Vector2.prototype.isVector2 = true;

      this.x = x;
      this.y = y;
    }

    get width() {
      return this.x;
    }

    set width(value) {
      this.x = value;
    }

    get height() {
      return this.y;
    }

    set height(value) {
      this.y = value;
    }

    set(x, y) {
      this.x = x;
      this.y = y;

      return this;
    }

    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;

      return this;
    }

    setX(x) {
      this.x = x;

      return this;
    }

    setY(y) {
      this.y = y;

      return this;
    }

    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }

      return this;
    }

    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        default:
          throw new Error("index is out of range: " + index);
      }
    }

    clone() {
      return new this.constructor(this.x, this.y);
    }

    copy(v) {
      this.x = v.x;
      this.y = v.y;

      return this;
    }

    add(v) {
      this.x += v.x;
      this.y += v.y;

      return this;
    }

    addScalar(s) {
      this.x += s;
      this.y += s;

      return this;
    }

    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;

      return this;
    }

    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;

      return this;
    }

    sub(v) {
      this.x -= v.x;
      this.y -= v.y;

      return this;
    }

    subScalar(s) {
      this.x -= s;
      this.y -= s;

      return this;
    }

    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;

      return this;
    }

    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;

      return this;
    }

    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;

      return this;
    }

    divide(v) {
      this.x /= v.x;
      this.y /= v.y;

      return this;
    }

    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }

    applyMatrix3(m) {
      const x = this.x,
        y = this.y;
      const e = m.elements;

      this.x = e[0] * x + e[3] * y + e[6];
      this.y = e[1] * x + e[4] * y + e[7];

      return this;
    }

    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);

      return this;
    }

    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);

      return this;
    }

    clamp(min, max) {
      // assumes min < max, componentwise

      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));

      return this;
    }

    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));

      return this;
    }

    clampLength(min, max) {
      const length = this.length();

      return this.divideScalar(length || 1).multiplyScalar(
        Math.max(min, Math.min(max, length))
      );
    }

    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);

      return this;
    }

    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);

      return this;
    }

    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);

      return this;
    }

    roundToZero() {
      this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
      this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);

      return this;
    }

    negate() {
      this.x = -this.x;
      this.y = -this.y;

      return this;
    }

    dot(v) {
      return this.x * v.x + this.y * v.y;
    }

    cross(v) {
      return this.x * v.y - this.y * v.x;
    }

    lengthSq() {
      return this.x * this.x + this.y * this.y;
    }

    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y);
    }

    normalize() {
      return this.divideScalar(this.length() || 1);
    }

    angle() {
      // computes the angle in radians with respect to the positive x-axis

      const angle = Math.atan2(-this.y, -this.x) + Math.PI;

      return angle;
    }

    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

      if (denominator === 0) return Math.PI / 2;

      const theta = this.dot(v) / denominator;

      // clamp, to handle numerical problems

      return Math.acos(clamp(theta, -1, 1));
    }

    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v) {
      const dx = this.x - v.x,
        dy = this.y - v.y;
      return dx * dx + dy * dy;
    }

    manhattanDistanceTo(v) {
      return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
    }

    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }

    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;

      return this;
    }

    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;

      return this;
    }

    equals(v) {
      return v.x === this.x && v.y === this.y;
    }

    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;

      return array;
    }

    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);

      return this;
    }

    rotateAround(center, angle) {
      const c = Math.cos(angle),
        s = Math.sin(angle);

      const x = this.x - center.x;
      const y = this.y - center.y;

      this.x = x * c - y * s + center.x;
      this.y = x * s + y * c + center.y;

      return this;
    }

    random() {
      this.x = Math.random();
      this.y = Math.random();

      return this;
    }

    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
    }
  }

  class Matrix3 {
    constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      Matrix3.prototype.isMatrix3 = true;

      this.elements = [1, 0, 0, 0, 1, 0, 0, 0, 1];

      if (n11 !== undefined) {
        this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
      }
    }

    set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
      const te = this.elements;

      te[0] = n11;
      te[1] = n21;
      te[2] = n31;
      te[3] = n12;
      te[4] = n22;
      te[5] = n32;
      te[6] = n13;
      te[7] = n23;
      te[8] = n33;

      return this;
    }

    identity() {
      this.set(1, 0, 0, 0, 1, 0, 0, 0, 1);

      return this;
    }

    copy(m) {
      const te = this.elements;
      const me = m.elements;

      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];

      return this;
    }

    extractBasis(xAxis, yAxis, zAxis) {
      xAxis.setFromMatrix3Column(this, 0);
      yAxis.setFromMatrix3Column(this, 1);
      zAxis.setFromMatrix3Column(this, 2);

      return this;
    }

    setFromMatrix4(m) {
      const me = m.elements;

      this.set(me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]);

      return this;
    }

    multiply(m) {
      return this.multiplyMatrices(this, m);
    }

    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }

    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;

      const a11 = ae[0],
        a12 = ae[3],
        a13 = ae[6];
      const a21 = ae[1],
        a22 = ae[4],
        a23 = ae[7];
      const a31 = ae[2],
        a32 = ae[5],
        a33 = ae[8];

      const b11 = be[0],
        b12 = be[3],
        b13 = be[6];
      const b21 = be[1],
        b22 = be[4],
        b23 = be[7];
      const b31 = be[2],
        b32 = be[5],
        b33 = be[8];

      te[0] = a11 * b11 + a12 * b21 + a13 * b31;
      te[3] = a11 * b12 + a12 * b22 + a13 * b32;
      te[6] = a11 * b13 + a12 * b23 + a13 * b33;

      te[1] = a21 * b11 + a22 * b21 + a23 * b31;
      te[4] = a21 * b12 + a22 * b22 + a23 * b32;
      te[7] = a21 * b13 + a22 * b23 + a23 * b33;

      te[2] = a31 * b11 + a32 * b21 + a33 * b31;
      te[5] = a31 * b12 + a32 * b22 + a33 * b32;
      te[8] = a31 * b13 + a32 * b23 + a33 * b33;

      return this;
    }

    multiplyScalar(s) {
      const te = this.elements;

      te[0] *= s;
      te[3] *= s;
      te[6] *= s;
      te[1] *= s;
      te[4] *= s;
      te[7] *= s;
      te[2] *= s;
      te[5] *= s;
      te[8] *= s;

      return this;
    }

    determinant() {
      const te = this.elements;

      const a = te[0],
        b = te[1],
        c = te[2],
        d = te[3],
        e = te[4],
        f = te[5],
        g = te[6],
        h = te[7],
        i = te[8];

      return (
        a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g
      );
    }

    invert() {
      const te = this.elements,
        n11 = te[0],
        n21 = te[1],
        n31 = te[2],
        n12 = te[3],
        n22 = te[4],
        n32 = te[5],
        n13 = te[6],
        n23 = te[7],
        n33 = te[8],
        t11 = n33 * n22 - n32 * n23,
        t12 = n32 * n13 - n33 * n12,
        t13 = n23 * n12 - n22 * n13,
        det = n11 * t11 + n21 * t12 + n31 * t13;

      if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);

      const detInv = 1 / det;

      te[0] = t11 * detInv;
      te[1] = (n31 * n23 - n33 * n21) * detInv;
      te[2] = (n32 * n21 - n31 * n22) * detInv;

      te[3] = t12 * detInv;
      te[4] = (n33 * n11 - n31 * n13) * detInv;
      te[5] = (n31 * n12 - n32 * n11) * detInv;

      te[6] = t13 * detInv;
      te[7] = (n21 * n13 - n23 * n11) * detInv;
      te[8] = (n22 * n11 - n21 * n12) * detInv;

      return this;
    }

    transpose() {
      let tmp;
      const m = this.elements;

      tmp = m[1];
      m[1] = m[3];
      m[3] = tmp;
      tmp = m[2];
      m[2] = m[6];
      m[6] = tmp;
      tmp = m[5];
      m[5] = m[7];
      m[7] = tmp;

      return this;
    }

    getNormalMatrix(matrix4) {
      return this.setFromMatrix4(matrix4).invert().transpose();
    }

    transposeIntoArray(r) {
      const m = this.elements;

      r[0] = m[0];
      r[1] = m[3];
      r[2] = m[6];
      r[3] = m[1];
      r[4] = m[4];
      r[5] = m[7];
      r[6] = m[2];
      r[7] = m[5];
      r[8] = m[8];

      return this;
    }

    setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
      const c = Math.cos(rotation);
      const s = Math.sin(rotation);

      this.set(
        sx * c,
        sx * s,
        -sx * (c * cx + s * cy) + cx + tx,
        -sy * s,
        sy * c,
        -sy * (-s * cx + c * cy) + cy + ty,
        0,
        0,
        1
      );

      return this;
    }

    //

    scale(sx, sy) {
      this.premultiply(_m3.makeScale(sx, sy));

      return this;
    }

    rotate(theta) {
      this.premultiply(_m3.makeRotation(-theta));

      return this;
    }

    translate(tx, ty) {
      this.premultiply(_m3.makeTranslation(tx, ty));

      return this;
    }

    // for 2D Transforms

    makeTranslation(x, y) {
      if (x.isVector2) {
        this.set(1, 0, x.x, 0, 1, x.y, 0, 0, 1);
      } else {
        this.set(1, 0, x, 0, 1, y, 0, 0, 1);
      }

      return this;
    }

    makeRotation(theta) {
      // counterclockwise

      const c = Math.cos(theta);
      const s = Math.sin(theta);

      this.set(c, -s, 0, s, c, 0, 0, 0, 1);

      return this;
    }

    makeScale(x, y) {
      this.set(x, 0, 0, 0, y, 0, 0, 0, 1);

      return this;
    }

    //

    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;

      for (let i = 0; i < 9; i++) {
        if (te[i] !== me[i]) return false;
      }

      return true;
    }

    fromArray(array, offset = 0) {
      for (let i = 0; i < 9; i++) {
        this.elements[i] = array[i + offset];
      }

      return this;
    }

    toArray(array = [], offset = 0) {
      const te = this.elements;

      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];

      array[offset + 3] = te[3];
      array[offset + 4] = te[4];
      array[offset + 5] = te[5];

      array[offset + 6] = te[6];
      array[offset + 7] = te[7];
      array[offset + 8] = te[8];

      return array;
    }

    clone() {
      return new this.constructor().fromArray(this.elements);
    }
  }

  const _m3 = /*@__PURE__*/ new Matrix3();

  function arrayNeedsUint32(array) {
    // assumes larger values usually on last

    for (let i = array.length - 1; i >= 0; --i) {
      if (array[i] >= 65535) return true; // account for PRIMITIVE_RESTART_FIXED_INDEX, #24565
    }

    return false;
  }

  function createElementNS(name) {
    return document.createElementNS("http://www.w3.org/1999/xhtml", name);
  }

  const _cache = {};

  function warnOnce(message) {
    if (message in _cache) return;

    _cache[message] = true;

    console.warn(message);
  }

  function SRGBToLinear(c) {
    return c < 0.04045
      ? c * 0.0773993808
      : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
  }

  function LinearToSRGB(c) {
    return c < 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
  }

  /**
   * Matrices converting P3 <-> Rec. 709 primaries, without gamut mapping
   * or clipping. Based on W3C specifications for sRGB and Display P3,
   * and ICC specifications for the D50 connection space. Values in/out
   * are _linear_ sRGB and _linear_ Display P3.
   *
   * Note that both sRGB and Display P3 use the sRGB transfer functions.
   *
   * Reference:
   * - http://www.russellcottrell.com/photo/matrixCalculator.htm
   */

  const LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 =
    /*@__PURE__*/ new Matrix3().fromArray([
      0.8224621, 0.0331941, 0.0170827, 0.177538, 0.9668058, 0.0723974,
      -0.0000001, 0.0000001, 0.9105199,
    ]);

  const LINEAR_DISPLAY_P3_TO_LINEAR_SRGB =
    /*@__PURE__*/ new Matrix3().fromArray([
      1.2249401, -0.0420569, -0.0196376, -0.2249404, 1.0420571, -0.0786361,
      0.0000001, 0.0, 1.0982735,
    ]);

  function DisplayP3ToLinearSRGB(color) {
    // Display P3 uses the sRGB transfer functions
    return color
      .convertSRGBToLinear()
      .applyMatrix3(LINEAR_DISPLAY_P3_TO_LINEAR_SRGB);
  }

  function LinearSRGBToDisplayP3(color) {
    // Display P3 uses the sRGB transfer functions
    return color
      .applyMatrix3(LINEAR_SRGB_TO_LINEAR_DISPLAY_P3)
      .convertLinearToSRGB();
  }

  // Conversions from <source> to Linear-sRGB reference space.
  const TO_LINEAR = {
    [LinearSRGBColorSpace]: (color) => color,
    [SRGBColorSpace]: (color) => color.convertSRGBToLinear(),
    [DisplayP3ColorSpace]: DisplayP3ToLinearSRGB,
  };

  // Conversions to <target> from Linear-sRGB reference space.
  const FROM_LINEAR = {
    [LinearSRGBColorSpace]: (color) => color,
    [SRGBColorSpace]: (color) => color.convertLinearToSRGB(),
    [DisplayP3ColorSpace]: LinearSRGBToDisplayP3,
  };

  const ColorManagement = {
    enabled: true,

    get legacyMode() {
      console.warn(
        "THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."
      );

      return !this.enabled;
    },

    set legacyMode(legacyMode) {
      console.warn(
        "THREE.ColorManagement: .legacyMode=false renamed to .enabled=true in r150."
      );

      this.enabled = !legacyMode;
    },

    get workingColorSpace() {
      return LinearSRGBColorSpace;
    },

    set workingColorSpace(colorSpace) {
      console.warn("THREE.ColorManagement: .workingColorSpace is readonly.");
    },

    convert: function (color, sourceColorSpace, targetColorSpace) {
      if (
        this.enabled === false ||
        sourceColorSpace === targetColorSpace ||
        !sourceColorSpace ||
        !targetColorSpace
      ) {
        return color;
      }

      const sourceToLinear = TO_LINEAR[sourceColorSpace];
      const targetFromLinear = FROM_LINEAR[targetColorSpace];

      if (sourceToLinear === undefined || targetFromLinear === undefined) {
        throw new Error(
          `Unsupported color space conversion, "${sourceColorSpace}" to "${targetColorSpace}".`
        );
      }

      return targetFromLinear(sourceToLinear(color));
    },

    fromWorkingColorSpace: function (color, targetColorSpace) {
      return this.convert(color, this.workingColorSpace, targetColorSpace);
    },

    toWorkingColorSpace: function (color, sourceColorSpace) {
      return this.convert(color, sourceColorSpace, this.workingColorSpace);
    },
  };

  let _canvas;

  class ImageUtils {
    static getDataURL(image) {
      if (/^data:/i.test(image.src)) {
        return image.src;
      }

      if (typeof HTMLCanvasElement === "undefined") {
        return image.src;
      }

      let canvas;

      if (image instanceof HTMLCanvasElement) {
        canvas = image;
      } else {
        if (_canvas === undefined) _canvas = createElementNS("canvas");

        _canvas.width = image.width;
        _canvas.height = image.height;

        const context = _canvas.getContext("2d");

        if (image instanceof ImageData) {
          context.putImageData(image, 0, 0);
        } else {
          context.drawImage(image, 0, 0, image.width, image.height);
        }

        canvas = _canvas;
      }

      if (canvas.width > 2048 || canvas.height > 2048) {
        console.warn(
          "THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",
          image
        );

        return canvas.toDataURL("image/jpeg", 0.6);
      } else {
        return canvas.toDataURL("image/png");
      }
    }

    static sRGBToLinear(image) {
      if (
        (typeof HTMLImageElement !== "undefined" &&
          image instanceof HTMLImageElement) ||
        (typeof HTMLCanvasElement !== "undefined" &&
          image instanceof HTMLCanvasElement) ||
        (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap)
      ) {
        const canvas = createElementNS("canvas");

        canvas.width = image.width;
        canvas.height = image.height;

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, image.width, image.height);

        const imageData = context.getImageData(0, 0, image.width, image.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i++) {
          data[i] = SRGBToLinear(data[i] / 255) * 255;
        }

        context.putImageData(imageData, 0, 0);

        return canvas;
      } else if (image.data) {
        const data = image.data.slice(0);

        for (let i = 0; i < data.length; i++) {
          if (data instanceof Uint8Array || data instanceof Uint8ClampedArray) {
            data[i] = Math.floor(SRGBToLinear(data[i] / 255) * 255);
          } else {
            // assuming float

            data[i] = SRGBToLinear(data[i]);
          }
        }

        return {
          data: data,
          width: image.width,
          height: image.height,
        };
      } else {
        console.warn(
          "THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."
        );
        return image;
      }
    }
  }

  let sourceId = 0;

  class Source {
    constructor(data = null) {
      this.isSource = true;

      Object.defineProperty(this, "id", { value: sourceId++ });

      this.uuid = generateUUID();

      this.data = data;

      this.version = 0;
    }

    set needsUpdate(value) {
      if (value === true) this.version++;
    }

    toJSON(meta) {
      const isRootObject = meta === undefined || typeof meta === "string";

      if (!isRootObject && meta.images[this.uuid] !== undefined) {
        return meta.images[this.uuid];
      }

      const output = {
        uuid: this.uuid,
        url: "",
      };

      const data = this.data;

      if (data !== null) {
        let url;

        if (Array.isArray(data)) {
          // cube texture

          url = [];

          for (let i = 0, l = data.length; i < l; i++) {
            if (data[i].isDataTexture) {
              url.push(serializeImage(data[i].image));
            } else {
              url.push(serializeImage(data[i]));
            }
          }
        } else {
          // texture

          url = serializeImage(data);
        }

        output.url = url;
      }

      if (!isRootObject) {
        meta.images[this.uuid] = output;
      }

      return output;
    }
  }

  function serializeImage(image) {
    if (
      (typeof HTMLImageElement !== "undefined" &&
        image instanceof HTMLImageElement) ||
      (typeof HTMLCanvasElement !== "undefined" &&
        image instanceof HTMLCanvasElement) ||
      (typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap)
    ) {
      // default images

      return ImageUtils.getDataURL(image);
    } else {
      if (image.data) {
        // images of DataTexture

        return {
          data: Array.from(image.data),
          width: image.width,
          height: image.height,
          type: image.data.constructor.name,
        };
      } else {
        console.warn("THREE.Texture: Unable to serialize Texture.");
        return {};
      }
    }
  }

  let textureId = 0;

  class Texture extends EventDispatcher {
    constructor(
      image = Texture.DEFAULT_IMAGE,
      mapping = Texture.DEFAULT_MAPPING,
      wrapS = ClampToEdgeWrapping,
      wrapT = ClampToEdgeWrapping,
      magFilter = LinearFilter,
      minFilter = LinearMipmapLinearFilter,
      format = RGBAFormat,
      type = UnsignedByteType,
      anisotropy = Texture.DEFAULT_ANISOTROPY,
      colorSpace = NoColorSpace
    ) {
      super();

      this.isTexture = true;

      Object.defineProperty(this, "id", { value: textureId++ });

      this.uuid = generateUUID();

      this.name = "";

      this.source = new Source(image);
      this.mipmaps = [];

      this.mapping = mapping;
      this.channel = 0;

      this.wrapS = wrapS;
      this.wrapT = wrapT;

      this.magFilter = magFilter;
      this.minFilter = minFilter;

      this.anisotropy = anisotropy;

      this.format = format;
      this.internalFormat = null;
      this.type = type;

      this.offset = new Vector2(0, 0);
      this.repeat = new Vector2(1, 1);
      this.center = new Vector2(0, 0);
      this.rotation = 0;

      this.matrixAutoUpdate = true;
      this.matrix = new Matrix3();

      this.generateMipmaps = true;
      this.premultiplyAlpha = false;
      this.flipY = true;
      this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

      if (typeof colorSpace === "string") {
        this.colorSpace = colorSpace;
      } else {
        // @deprecated, r152

        warnOnce(
          "THREE.Texture: Property .encoding has been replaced by .colorSpace."
        );
        this.colorSpace =
          colorSpace === sRGBEncoding ? SRGBColorSpace : NoColorSpace;
      }

      this.userData = {};

      this.version = 0;
      this.onUpdate = null;

      this.isRenderTargetTexture = false; // indicates whether a texture belongs to a render target or not
      this.needsPMREMUpdate = false; // indicates whether this texture should be processed by PMREMGenerator or not (only relevant for render target textures)
    }

    get image() {
      return this.source.data;
    }

    set image(value = null) {
      this.source.data = value;
    }

    updateMatrix() {
      this.matrix.setUvTransform(
        this.offset.x,
        this.offset.y,
        this.repeat.x,
        this.repeat.y,
        this.rotation,
        this.center.x,
        this.center.y
      );
    }

    clone() {
      return new this.constructor().copy(this);
    }

    copy(source) {
      this.name = source.name;

      this.source = source.source;
      this.mipmaps = source.mipmaps.slice(0);

      this.mapping = source.mapping;
      this.channel = source.channel;

      this.wrapS = source.wrapS;
      this.wrapT = source.wrapT;

      this.magFilter = source.magFilter;
      this.minFilter = source.minFilter;

      this.anisotropy = source.anisotropy;

      this.format = source.format;
      this.internalFormat = source.internalFormat;
      this.type = source.type;

      this.offset.copy(source.offset);
      this.repeat.copy(source.repeat);
      this.center.copy(source.center);
      this.rotation = source.rotation;

      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrix.copy(source.matrix);

      this.generateMipmaps = source.generateMipmaps;
      this.premultiplyAlpha = source.premultiplyAlpha;
      this.flipY = source.flipY;
      this.unpackAlignment = source.unpackAlignment;
      this.colorSpace = source.colorSpace;

      this.userData = JSON.parse(JSON.stringify(source.userData));

      this.needsUpdate = true;

      return this;
    }

    toJSON(meta) {
      const isRootObject = meta === undefined || typeof meta === "string";

      if (!isRootObject && meta.textures[this.uuid] !== undefined) {
        return meta.textures[this.uuid];
      }

      const output = {
        metadata: {
          version: 4.6,
          type: "Texture",
          generator: "Texture.toJSON",
        },

        uuid: this.uuid,
        name: this.name,

        image: this.source.toJSON(meta).uuid,

        mapping: this.mapping,
        channel: this.channel,

        repeat: [this.repeat.x, this.repeat.y],
        offset: [this.offset.x, this.offset.y],
        center: [this.center.x, this.center.y],
        rotation: this.rotation,

        wrap: [this.wrapS, this.wrapT],

        format: this.format,
        internalFormat: this.internalFormat,
        type: this.type,
        colorSpace: this.colorSpace,

        minFilter: this.minFilter,
        magFilter: this.magFilter,
        anisotropy: this.anisotropy,

        flipY: this.flipY,

        generateMipmaps: this.generateMipmaps,
        premultiplyAlpha: this.premultiplyAlpha,
        unpackAlignment: this.unpackAlignment,
      };

      if (Object.keys(this.userData).length > 0)
        output.userData = this.userData;

      if (!isRootObject) {
        meta.textures[this.uuid] = output;
      }

      return output;
    }

    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }

    transformUv(uv) {
      if (this.mapping !== UVMapping) return uv;

      uv.applyMatrix3(this.matrix);

      if (uv.x < 0 || uv.x > 1) {
        switch (this.wrapS) {
          case RepeatWrapping:
            uv.x = uv.x - Math.floor(uv.x);
            break;

          case ClampToEdgeWrapping:
            uv.x = uv.x < 0 ? 0 : 1;
            break;

          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.x) % 2) === 1) {
              uv.x = Math.ceil(uv.x) - uv.x;
            } else {
              uv.x = uv.x - Math.floor(uv.x);
            }

            break;
        }
      }

      if (uv.y < 0 || uv.y > 1) {
        switch (this.wrapT) {
          case RepeatWrapping:
            uv.y = uv.y - Math.floor(uv.y);
            break;

          case ClampToEdgeWrapping:
            uv.y = uv.y < 0 ? 0 : 1;
            break;

          case MirroredRepeatWrapping:
            if (Math.abs(Math.floor(uv.y) % 2) === 1) {
              uv.y = Math.ceil(uv.y) - uv.y;
            } else {
              uv.y = uv.y - Math.floor(uv.y);
            }

            break;
        }
      }

      if (this.flipY) {
        uv.y = 1 - uv.y;
      }

      return uv;
    }

    set needsUpdate(value) {
      if (value === true) {
        this.version++;
        this.source.needsUpdate = true;
      }
    }

    get encoding() {
      // @deprecated, r152

      warnOnce(
        "THREE.Texture: Property .encoding has been replaced by .colorSpace."
      );
      return this.colorSpace === SRGBColorSpace ? sRGBEncoding : LinearEncoding;
    }

    set encoding(encoding) {
      // @deprecated, r152

      warnOnce(
        "THREE.Texture: Property .encoding has been replaced by .colorSpace."
      );
      this.colorSpace =
        encoding === sRGBEncoding ? SRGBColorSpace : NoColorSpace;
    }
  }

  Texture.DEFAULT_IMAGE = null;
  Texture.DEFAULT_MAPPING = UVMapping;
  Texture.DEFAULT_ANISOTROPY = 1;

  class Vector4 {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      Vector4.prototype.isVector4 = true;

      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;
    }

    get width() {
      return this.z;
    }

    set width(value) {
      this.z = value;
    }

    get height() {
      return this.w;
    }

    set height(value) {
      this.w = value;
    }

    set(x, y, z, w) {
      this.x = x;
      this.y = y;
      this.z = z;
      this.w = w;

      return this;
    }

    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;
      this.w = scalar;

      return this;
    }

    setX(x) {
      this.x = x;

      return this;
    }

    setY(y) {
      this.y = y;

      return this;
    }

    setZ(z) {
      this.z = z;

      return this;
    }

    setW(w) {
      this.w = w;

      return this;
    }

    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        case 3:
          this.w = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }

      return this;
    }

    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        case 3:
          return this.w;
        default:
          throw new Error("index is out of range: " + index);
      }
    }

    clone() {
      return new this.constructor(this.x, this.y, this.z, this.w);
    }

    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      this.w = v.w !== undefined ? v.w : 1;

      return this;
    }

    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      this.w += v.w;

      return this;
    }

    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;
      this.w += s;

      return this;
    }

    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;
      this.w = a.w + b.w;

      return this;
    }

    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      this.w += v.w * s;

      return this;
    }

    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      this.w -= v.w;

      return this;
    }

    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;
      this.w -= s;

      return this;
    }

    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;
      this.w = a.w - b.w;

      return this;
    }

    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;
      this.w *= v.w;

      return this;
    }

    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
      this.w *= scalar;

      return this;
    }

    applyMatrix4(m) {
      const x = this.x,
        y = this.y,
        z = this.z,
        w = this.w;
      const e = m.elements;

      this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
      this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
      this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
      this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

      return this;
    }

    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }

    setAxisAngleFromQuaternion(q) {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

      // q is assumed to be normalized

      this.w = 2 * Math.acos(q.w);

      const s = Math.sqrt(1 - q.w * q.w);

      if (s < 0.0001) {
        this.x = 1;
        this.y = 0;
        this.z = 0;
      } else {
        this.x = q.x / s;
        this.y = q.y / s;
        this.z = q.z / s;
      }

      return this;
    }

    setAxisAngleFromRotationMatrix(m) {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm

      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

      let angle, x, y, z; // variables for result
      const epsilon = 0.01, // margin to allow for rounding errors
        epsilon2 = 0.1, // margin to distinguish between 0 and 180 degrees
        te = m.elements,
        m11 = te[0],
        m12 = te[4],
        m13 = te[8],
        m21 = te[1],
        m22 = te[5],
        m23 = te[9],
        m31 = te[2],
        m32 = te[6],
        m33 = te[10];

      if (
        Math.abs(m12 - m21) < epsilon &&
        Math.abs(m13 - m31) < epsilon &&
        Math.abs(m23 - m32) < epsilon
      ) {
        // singularity found
        // first check for identity matrix which must have +1 for all terms
        // in leading diagonal and zero in other terms

        if (
          Math.abs(m12 + m21) < epsilon2 &&
          Math.abs(m13 + m31) < epsilon2 &&
          Math.abs(m23 + m32) < epsilon2 &&
          Math.abs(m11 + m22 + m33 - 3) < epsilon2
        ) {
          // this singularity is identity matrix so angle = 0

          this.set(1, 0, 0, 0);

          return this; // zero angle, arbitrary axis
        }

        // otherwise this singularity is angle = 180

        angle = Math.PI;

        const xx = (m11 + 1) / 2;
        const yy = (m22 + 1) / 2;
        const zz = (m33 + 1) / 2;
        const xy = (m12 + m21) / 4;
        const xz = (m13 + m31) / 4;
        const yz = (m23 + m32) / 4;

        if (xx > yy && xx > zz) {
          // m11 is the largest diagonal term

          if (xx < epsilon) {
            x = 0;
            y = 0.707106781;
            z = 0.707106781;
          } else {
            x = Math.sqrt(xx);
            y = xy / x;
            z = xz / x;
          }
        } else if (yy > zz) {
          // m22 is the largest diagonal term

          if (yy < epsilon) {
            x = 0.707106781;
            y = 0;
            z = 0.707106781;
          } else {
            y = Math.sqrt(yy);
            x = xy / y;
            z = yz / y;
          }
        } else {
          // m33 is the largest diagonal term so base result on this

          if (zz < epsilon) {
            x = 0.707106781;
            y = 0.707106781;
            z = 0;
          } else {
            z = Math.sqrt(zz);
            x = xz / z;
            y = yz / z;
          }
        }

        this.set(x, y, z, angle);

        return this; // return 180 deg rotation
      }

      // as we have reached here there are no singularities so we can handle normally

      let s = Math.sqrt(
        (m32 - m23) * (m32 - m23) +
          (m13 - m31) * (m13 - m31) +
          (m21 - m12) * (m21 - m12)
      ); // used to normalize

      if (Math.abs(s) < 0.001) s = 1;

      // prevent divide by zero, should not happen if matrix is orthogonal and should be
      // caught by singularity test above, but I've left it in just in case

      this.x = (m32 - m23) / s;
      this.y = (m13 - m31) / s;
      this.z = (m21 - m12) / s;
      this.w = Math.acos((m11 + m22 + m33 - 1) / 2);

      return this;
    }

    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);
      this.w = Math.min(this.w, v.w);

      return this;
    }

    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);
      this.w = Math.max(this.w, v.w);

      return this;
    }

    clamp(min, max) {
      // assumes min < max, componentwise

      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));
      this.z = Math.max(min.z, Math.min(max.z, this.z));
      this.w = Math.max(min.w, Math.min(max.w, this.w));

      return this;
    }

    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));
      this.z = Math.max(minVal, Math.min(maxVal, this.z));
      this.w = Math.max(minVal, Math.min(maxVal, this.w));

      return this;
    }

    clampLength(min, max) {
      const length = this.length();

      return this.divideScalar(length || 1).multiplyScalar(
        Math.max(min, Math.min(max, length))
      );
    }

    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);
      this.w = Math.floor(this.w);

      return this;
    }

    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);
      this.w = Math.ceil(this.w);

      return this;
    }

    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);
      this.w = Math.round(this.w);

      return this;
    }

    roundToZero() {
      this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
      this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
      this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
      this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);

      return this;
    }

    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;
      this.w = -this.w;

      return this;
    }

    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
    }

    lengthSq() {
      return (
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
      );
    }

    length() {
      return Math.sqrt(
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
      );
    }

    manhattanLength() {
      return (
        Math.abs(this.x) +
        Math.abs(this.y) +
        Math.abs(this.z) +
        Math.abs(this.w)
      );
    }

    normalize() {
      return this.divideScalar(this.length() || 1);
    }

    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }

    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;
      this.w += (v.w - this.w) * alpha;

      return this;
    }

    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;
      this.w = v1.w + (v2.w - v1.w) * alpha;

      return this;
    }

    equals(v) {
      return (
        v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w
      );
    }

    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];
      this.w = array[offset + 3];

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;
      array[offset + 3] = this.w;

      return array;
    }

    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);
      this.w = attribute.getW(index);

      return this;
    }

    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();
      this.w = Math.random();

      return this;
    }

    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
      yield this.w;
    }
  }

  class Quaternion {
    constructor(x = 0, y = 0, z = 0, w = 1) {
      this.isQuaternion = true;

      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;
    }

    static slerpFlat(dst, dstOffset, src0, srcOffset0, src1, srcOffset1, t) {
      // fuzz-free, array-based Quaternion SLERP operation

      let x0 = src0[srcOffset0 + 0],
        y0 = src0[srcOffset0 + 1],
        z0 = src0[srcOffset0 + 2],
        w0 = src0[srcOffset0 + 3];

      const x1 = src1[srcOffset1 + 0],
        y1 = src1[srcOffset1 + 1],
        z1 = src1[srcOffset1 + 2],
        w1 = src1[srcOffset1 + 3];

      if (t === 0) {
        dst[dstOffset + 0] = x0;
        dst[dstOffset + 1] = y0;
        dst[dstOffset + 2] = z0;
        dst[dstOffset + 3] = w0;
        return;
      }

      if (t === 1) {
        dst[dstOffset + 0] = x1;
        dst[dstOffset + 1] = y1;
        dst[dstOffset + 2] = z1;
        dst[dstOffset + 3] = w1;
        return;
      }

      if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
        let s = 1 - t;
        const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
          dir = cos >= 0 ? 1 : -1,
          sqrSin = 1 - cos * cos;

        // Skip the Slerp for tiny steps to avoid numeric problems:
        if (sqrSin > Number.EPSILON) {
          const sin = Math.sqrt(sqrSin),
            len = Math.atan2(sin, cos * dir);

          s = Math.sin(s * len) / sin;
          t = Math.sin(t * len) / sin;
        }

        const tDir = t * dir;

        x0 = x0 * s + x1 * tDir;
        y0 = y0 * s + y1 * tDir;
        z0 = z0 * s + z1 * tDir;
        w0 = w0 * s + w1 * tDir;

        // Normalize in case we just did a lerp:
        if (s === 1 - t) {
          const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

          x0 *= f;
          y0 *= f;
          z0 *= f;
          w0 *= f;
        }
      }

      dst[dstOffset] = x0;
      dst[dstOffset + 1] = y0;
      dst[dstOffset + 2] = z0;
      dst[dstOffset + 3] = w0;
    }

    static multiplyQuaternionsFlat(
      dst,
      dstOffset,
      src0,
      srcOffset0,
      src1,
      srcOffset1
    ) {
      const x0 = src0[srcOffset0];
      const y0 = src0[srcOffset0 + 1];
      const z0 = src0[srcOffset0 + 2];
      const w0 = src0[srcOffset0 + 3];

      const x1 = src1[srcOffset1];
      const y1 = src1[srcOffset1 + 1];
      const z1 = src1[srcOffset1 + 2];
      const w1 = src1[srcOffset1 + 3];

      dst[dstOffset] = x0 * w1 + w0 * x1 + y0 * z1 - z0 * y1;
      dst[dstOffset + 1] = y0 * w1 + w0 * y1 + z0 * x1 - x0 * z1;
      dst[dstOffset + 2] = z0 * w1 + w0 * z1 + x0 * y1 - y0 * x1;
      dst[dstOffset + 3] = w0 * w1 - x0 * x1 - y0 * y1 - z0 * z1;

      return dst;
    }

    get x() {
      return this._x;
    }

    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }

    get y() {
      return this._y;
    }

    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }

    get z() {
      return this._z;
    }

    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }

    get w() {
      return this._w;
    }

    set w(value) {
      this._w = value;
      this._onChangeCallback();
    }

    set(x, y, z, w) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;

      this._onChangeCallback();

      return this;
    }

    clone() {
      return new this.constructor(this._x, this._y, this._z, this._w);
    }

    copy(quaternion) {
      this._x = quaternion.x;
      this._y = quaternion.y;
      this._z = quaternion.z;
      this._w = quaternion.w;

      this._onChangeCallback();

      return this;
    }

    setFromEuler(euler, update) {
      const x = euler._x,
        y = euler._y,
        z = euler._z,
        order = euler._order;

      // http://www.mathworks.com/matlabcentral/fileexchange/
      // 	20696-function-to-convert-between-dcm-euler-angles-quaternions-and-euler-vectors/
      //	content/SpinCalc.m

      const cos = Math.cos;
      const sin = Math.sin;

      const c1 = cos(x / 2);
      const c2 = cos(y / 2);
      const c3 = cos(z / 2);

      const s1 = sin(x / 2);
      const s2 = sin(y / 2);
      const s3 = sin(z / 2);

      switch (order) {
        case "XYZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;

        case "YXZ":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;

        case "ZXY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;

        case "ZYX":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;

        case "YZX":
          this._x = s1 * c2 * c3 + c1 * s2 * s3;
          this._y = c1 * s2 * c3 + s1 * c2 * s3;
          this._z = c1 * c2 * s3 - s1 * s2 * c3;
          this._w = c1 * c2 * c3 - s1 * s2 * s3;
          break;

        case "XZY":
          this._x = s1 * c2 * c3 - c1 * s2 * s3;
          this._y = c1 * s2 * c3 - s1 * c2 * s3;
          this._z = c1 * c2 * s3 + s1 * s2 * c3;
          this._w = c1 * c2 * c3 + s1 * s2 * s3;
          break;

        default:
          console.warn(
            "THREE.Quaternion: .setFromEuler() encountered an unknown order: " +
              order
          );
      }

      if (update !== false) this._onChangeCallback();

      return this;
    }

    setFromAxisAngle(axis, angle) {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/angleToQuaternion/index.htm

      // assumes axis is normalized

      const halfAngle = angle / 2,
        s = Math.sin(halfAngle);

      this._x = axis.x * s;
      this._y = axis.y * s;
      this._z = axis.z * s;
      this._w = Math.cos(halfAngle);

      this._onChangeCallback();

      return this;
    }

    setFromRotationMatrix(m) {
      // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToQuaternion/index.htm

      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

      const te = m.elements,
        m11 = te[0],
        m12 = te[4],
        m13 = te[8],
        m21 = te[1],
        m22 = te[5],
        m23 = te[9],
        m31 = te[2],
        m32 = te[6],
        m33 = te[10],
        trace = m11 + m22 + m33;

      if (trace > 0) {
        const s = 0.5 / Math.sqrt(trace + 1.0);

        this._w = 0.25 / s;
        this._x = (m32 - m23) * s;
        this._y = (m13 - m31) * s;
        this._z = (m21 - m12) * s;
      } else if (m11 > m22 && m11 > m33) {
        const s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

        this._w = (m32 - m23) / s;
        this._x = 0.25 * s;
        this._y = (m12 + m21) / s;
        this._z = (m13 + m31) / s;
      } else if (m22 > m33) {
        const s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

        this._w = (m13 - m31) / s;
        this._x = (m12 + m21) / s;
        this._y = 0.25 * s;
        this._z = (m23 + m32) / s;
      } else {
        const s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

        this._w = (m21 - m12) / s;
        this._x = (m13 + m31) / s;
        this._y = (m23 + m32) / s;
        this._z = 0.25 * s;
      }

      this._onChangeCallback();

      return this;
    }

    setFromUnitVectors(vFrom, vTo) {
      // assumes direction vectors vFrom and vTo are normalized

      let r = vFrom.dot(vTo) + 1;

      if (r < Number.EPSILON) {
        // vFrom and vTo point in opposite directions

        r = 0;

        if (Math.abs(vFrom.x) > Math.abs(vFrom.z)) {
          this._x = -vFrom.y;
          this._y = vFrom.x;
          this._z = 0;
          this._w = r;
        } else {
          this._x = 0;
          this._y = -vFrom.z;
          this._z = vFrom.y;
          this._w = r;
        }
      } else {
        // crossVectors( vFrom, vTo ); // inlined to avoid cyclic dependency on Vector3

        this._x = vFrom.y * vTo.z - vFrom.z * vTo.y;
        this._y = vFrom.z * vTo.x - vFrom.x * vTo.z;
        this._z = vFrom.x * vTo.y - vFrom.y * vTo.x;
        this._w = r;
      }

      return this.normalize();
    }

    angleTo(q) {
      return 2 * Math.acos(Math.abs(clamp(this.dot(q), -1, 1)));
    }

    rotateTowards(q, step) {
      const angle = this.angleTo(q);

      if (angle === 0) return this;

      const t = Math.min(1, step / angle);

      this.slerp(q, t);

      return this;
    }

    identity() {
      return this.set(0, 0, 0, 1);
    }

    invert() {
      // quaternion is assumed to have unit length

      return this.conjugate();
    }

    conjugate() {
      this._x *= -1;
      this._y *= -1;
      this._z *= -1;

      this._onChangeCallback();

      return this;
    }

    dot(v) {
      return this._x * v._x + this._y * v._y + this._z * v._z + this._w * v._w;
    }

    lengthSq() {
      return (
        this._x * this._x +
        this._y * this._y +
        this._z * this._z +
        this._w * this._w
      );
    }

    length() {
      return Math.sqrt(
        this._x * this._x +
          this._y * this._y +
          this._z * this._z +
          this._w * this._w
      );
    }

    normalize() {
      let l = this.length();

      if (l === 0) {
        this._x = 0;
        this._y = 0;
        this._z = 0;
        this._w = 1;
      } else {
        l = 1 / l;

        this._x = this._x * l;
        this._y = this._y * l;
        this._z = this._z * l;
        this._w = this._w * l;
      }

      this._onChangeCallback();

      return this;
    }

    multiply(q) {
      return this.multiplyQuaternions(this, q);
    }

    premultiply(q) {
      return this.multiplyQuaternions(q, this);
    }

    multiplyQuaternions(a, b) {
      // from http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/code/index.htm

      const qax = a._x,
        qay = a._y,
        qaz = a._z,
        qaw = a._w;
      const qbx = b._x,
        qby = b._y,
        qbz = b._z,
        qbw = b._w;

      this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
      this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
      this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
      this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

      this._onChangeCallback();

      return this;
    }

    slerp(qb, t) {
      if (t === 0) return this;
      if (t === 1) return this.copy(qb);

      const x = this._x,
        y = this._y,
        z = this._z,
        w = this._w;

      // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/

      let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

      if (cosHalfTheta < 0) {
        this._w = -qb._w;
        this._x = -qb._x;
        this._y = -qb._y;
        this._z = -qb._z;

        cosHalfTheta = -cosHalfTheta;
      } else {
        this.copy(qb);
      }

      if (cosHalfTheta >= 1.0) {
        this._w = w;
        this._x = x;
        this._y = y;
        this._z = z;

        return this;
      }

      const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

      if (sqrSinHalfTheta <= Number.EPSILON) {
        const s = 1 - t;
        this._w = s * w + t * this._w;
        this._x = s * x + t * this._x;
        this._y = s * y + t * this._y;
        this._z = s * z + t * this._z;

        this.normalize();
        this._onChangeCallback();

        return this;
      }

      const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
      const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
      const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
        ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

      this._w = w * ratioA + this._w * ratioB;
      this._x = x * ratioA + this._x * ratioB;
      this._y = y * ratioA + this._y * ratioB;
      this._z = z * ratioA + this._z * ratioB;

      this._onChangeCallback();

      return this;
    }

    slerpQuaternions(qa, qb, t) {
      return this.copy(qa).slerp(qb, t);
    }

    random() {
      // Derived from http://planning.cs.uiuc.edu/node198.html
      // Note, this source uses w, x, y, z ordering,
      // so we swap the order below.

      const u1 = Math.random();
      const sqrt1u1 = Math.sqrt(1 - u1);
      const sqrtu1 = Math.sqrt(u1);

      const u2 = 2 * Math.PI * Math.random();

      const u3 = 2 * Math.PI * Math.random();

      return this.set(
        sqrt1u1 * Math.cos(u2),
        sqrtu1 * Math.sin(u3),
        sqrtu1 * Math.cos(u3),
        sqrt1u1 * Math.sin(u2)
      );
    }

    equals(quaternion) {
      return (
        quaternion._x === this._x &&
        quaternion._y === this._y &&
        quaternion._z === this._z &&
        quaternion._w === this._w
      );
    }

    fromArray(array, offset = 0) {
      this._x = array[offset];
      this._y = array[offset + 1];
      this._z = array[offset + 2];
      this._w = array[offset + 3];

      this._onChangeCallback();

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._w;

      return array;
    }

    fromBufferAttribute(attribute, index) {
      this._x = attribute.getX(index);
      this._y = attribute.getY(index);
      this._z = attribute.getZ(index);
      this._w = attribute.getW(index);

      return this;
    }

    toJSON() {
      return this.toArray();
    }

    _onChange(callback) {
      this._onChangeCallback = callback;

      return this;
    }

    _onChangeCallback() {}

    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._w;
    }
  }

  class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
      Vector3.prototype.isVector3 = true;

      this.x = x;
      this.y = y;
      this.z = z;
    }

    set(x, y, z) {
      if (z === undefined) z = this.z; // sprite.scale.set(x,y)

      this.x = x;
      this.y = y;
      this.z = z;

      return this;
    }

    setScalar(scalar) {
      this.x = scalar;
      this.y = scalar;
      this.z = scalar;

      return this;
    }

    setX(x) {
      this.x = x;

      return this;
    }

    setY(y) {
      this.y = y;

      return this;
    }

    setZ(z) {
      this.z = z;

      return this;
    }

    setComponent(index, value) {
      switch (index) {
        case 0:
          this.x = value;
          break;
        case 1:
          this.y = value;
          break;
        case 2:
          this.z = value;
          break;
        default:
          throw new Error("index is out of range: " + index);
      }

      return this;
    }

    getComponent(index) {
      switch (index) {
        case 0:
          return this.x;
        case 1:
          return this.y;
        case 2:
          return this.z;
        default:
          throw new Error("index is out of range: " + index);
      }
    }

    clone() {
      return new this.constructor(this.x, this.y, this.z);
    }

    copy(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;

      return this;
    }

    add(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;

      return this;
    }

    addScalar(s) {
      this.x += s;
      this.y += s;
      this.z += s;

      return this;
    }

    addVectors(a, b) {
      this.x = a.x + b.x;
      this.y = a.y + b.y;
      this.z = a.z + b.z;

      return this;
    }

    addScaledVector(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;

      return this;
    }

    sub(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;

      return this;
    }

    subScalar(s) {
      this.x -= s;
      this.y -= s;
      this.z -= s;

      return this;
    }

    subVectors(a, b) {
      this.x = a.x - b.x;
      this.y = a.y - b.y;
      this.z = a.z - b.z;

      return this;
    }

    multiply(v) {
      this.x *= v.x;
      this.y *= v.y;
      this.z *= v.z;

      return this;
    }

    multiplyScalar(scalar) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;

      return this;
    }

    multiplyVectors(a, b) {
      this.x = a.x * b.x;
      this.y = a.y * b.y;
      this.z = a.z * b.z;

      return this;
    }

    applyEuler(euler) {
      return this.applyQuaternion(_quaternion$4.setFromEuler(euler));
    }

    applyAxisAngle(axis, angle) {
      return this.applyQuaternion(_quaternion$4.setFromAxisAngle(axis, angle));
    }

    applyMatrix3(m) {
      const x = this.x,
        y = this.y,
        z = this.z;
      const e = m.elements;

      this.x = e[0] * x + e[3] * y + e[6] * z;
      this.y = e[1] * x + e[4] * y + e[7] * z;
      this.z = e[2] * x + e[5] * y + e[8] * z;

      return this;
    }

    applyNormalMatrix(m) {
      return this.applyMatrix3(m).normalize();
    }

    applyMatrix4(m) {
      const x = this.x,
        y = this.y,
        z = this.z;
      const e = m.elements;

      const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);

      this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
      this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
      this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;

      return this;
    }

    applyQuaternion(q) {
      const x = this.x,
        y = this.y,
        z = this.z;
      const qx = q.x,
        qy = q.y,
        qz = q.z,
        qw = q.w;

      // calculate quat * vector

      const ix = qw * x + qy * z - qz * y;
      const iy = qw * y + qz * x - qx * z;
      const iz = qw * z + qx * y - qy * x;
      const iw = -qx * x - qy * y - qz * z;

      // calculate result * inverse quat

      this.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
      this.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
      this.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;

      return this;
    }

    project(camera) {
      return this.applyMatrix4(camera.matrixWorldInverse).applyMatrix4(
        camera.projectionMatrix
      );
    }

    unproject(camera) {
      return this.applyMatrix4(camera.projectionMatrixInverse).applyMatrix4(
        camera.matrixWorld
      );
    }

    transformDirection(m) {
      // input: THREE.Matrix4 affine matrix
      // vector interpreted as a direction

      const x = this.x,
        y = this.y,
        z = this.z;
      const e = m.elements;

      this.x = e[0] * x + e[4] * y + e[8] * z;
      this.y = e[1] * x + e[5] * y + e[9] * z;
      this.z = e[2] * x + e[6] * y + e[10] * z;

      return this.normalize();
    }

    divide(v) {
      this.x /= v.x;
      this.y /= v.y;
      this.z /= v.z;

      return this;
    }

    divideScalar(scalar) {
      return this.multiplyScalar(1 / scalar);
    }

    min(v) {
      this.x = Math.min(this.x, v.x);
      this.y = Math.min(this.y, v.y);
      this.z = Math.min(this.z, v.z);

      return this;
    }

    max(v) {
      this.x = Math.max(this.x, v.x);
      this.y = Math.max(this.y, v.y);
      this.z = Math.max(this.z, v.z);

      return this;
    }

    clamp(min, max) {
      // assumes min < max, componentwise

      this.x = Math.max(min.x, Math.min(max.x, this.x));
      this.y = Math.max(min.y, Math.min(max.y, this.y));
      this.z = Math.max(min.z, Math.min(max.z, this.z));

      return this;
    }

    clampScalar(minVal, maxVal) {
      this.x = Math.max(minVal, Math.min(maxVal, this.x));
      this.y = Math.max(minVal, Math.min(maxVal, this.y));
      this.z = Math.max(minVal, Math.min(maxVal, this.z));

      return this;
    }

    clampLength(min, max) {
      const length = this.length();

      return this.divideScalar(length || 1).multiplyScalar(
        Math.max(min, Math.min(max, length))
      );
    }

    floor() {
      this.x = Math.floor(this.x);
      this.y = Math.floor(this.y);
      this.z = Math.floor(this.z);

      return this;
    }

    ceil() {
      this.x = Math.ceil(this.x);
      this.y = Math.ceil(this.y);
      this.z = Math.ceil(this.z);

      return this;
    }

    round() {
      this.x = Math.round(this.x);
      this.y = Math.round(this.y);
      this.z = Math.round(this.z);

      return this;
    }

    roundToZero() {
      this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
      this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
      this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);

      return this;
    }

    negate() {
      this.x = -this.x;
      this.y = -this.y;
      this.z = -this.z;

      return this;
    }

    dot(v) {
      return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    // TODO lengthSquared?

    lengthSq() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    manhattanLength() {
      return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }

    normalize() {
      return this.divideScalar(this.length() || 1);
    }

    setLength(length) {
      return this.normalize().multiplyScalar(length);
    }

    lerp(v, alpha) {
      this.x += (v.x - this.x) * alpha;
      this.y += (v.y - this.y) * alpha;
      this.z += (v.z - this.z) * alpha;

      return this;
    }

    lerpVectors(v1, v2, alpha) {
      this.x = v1.x + (v2.x - v1.x) * alpha;
      this.y = v1.y + (v2.y - v1.y) * alpha;
      this.z = v1.z + (v2.z - v1.z) * alpha;

      return this;
    }

    cross(v) {
      return this.crossVectors(this, v);
    }

    crossVectors(a, b) {
      const ax = a.x,
        ay = a.y,
        az = a.z;
      const bx = b.x,
        by = b.y,
        bz = b.z;

      this.x = ay * bz - az * by;
      this.y = az * bx - ax * bz;
      this.z = ax * by - ay * bx;

      return this;
    }

    projectOnVector(v) {
      const denominator = v.lengthSq();

      if (denominator === 0) return this.set(0, 0, 0);

      const scalar = v.dot(this) / denominator;

      return this.copy(v).multiplyScalar(scalar);
    }

    projectOnPlane(planeNormal) {
      _vector$b.copy(this).projectOnVector(planeNormal);

      return this.sub(_vector$b);
    }

    reflect(normal) {
      // reflect incident vector off plane orthogonal to normal
      // normal is assumed to have unit length

      return this.sub(
        _vector$b.copy(normal).multiplyScalar(2 * this.dot(normal))
      );
    }

    angleTo(v) {
      const denominator = Math.sqrt(this.lengthSq() * v.lengthSq());

      if (denominator === 0) return Math.PI / 2;

      const theta = this.dot(v) / denominator;

      // clamp, to handle numerical problems

      return Math.acos(clamp(theta, -1, 1));
    }

    distanceTo(v) {
      return Math.sqrt(this.distanceToSquared(v));
    }

    distanceToSquared(v) {
      const dx = this.x - v.x,
        dy = this.y - v.y,
        dz = this.z - v.z;

      return dx * dx + dy * dy + dz * dz;
    }

    manhattanDistanceTo(v) {
      return (
        Math.abs(this.x - v.x) + Math.abs(this.y - v.y) + Math.abs(this.z - v.z)
      );
    }

    setFromSpherical(s) {
      return this.setFromSphericalCoords(s.radius, s.phi, s.theta);
    }

    setFromSphericalCoords(radius, phi, theta) {
      const sinPhiRadius = Math.sin(phi) * radius;

      this.x = sinPhiRadius * Math.sin(theta);
      this.y = Math.cos(phi) * radius;
      this.z = sinPhiRadius * Math.cos(theta);

      return this;
    }

    setFromCylindrical(c) {
      return this.setFromCylindricalCoords(c.radius, c.theta, c.y);
    }

    setFromCylindricalCoords(radius, theta, y) {
      this.x = radius * Math.sin(theta);
      this.y = y;
      this.z = radius * Math.cos(theta);

      return this;
    }

    setFromMatrixPosition(m) {
      const e = m.elements;

      this.x = e[12];
      this.y = e[13];
      this.z = e[14];

      return this;
    }

    setFromMatrixScale(m) {
      const sx = this.setFromMatrixColumn(m, 0).length();
      const sy = this.setFromMatrixColumn(m, 1).length();
      const sz = this.setFromMatrixColumn(m, 2).length();

      this.x = sx;
      this.y = sy;
      this.z = sz;

      return this;
    }

    setFromMatrixColumn(m, index) {
      return this.fromArray(m.elements, index * 4);
    }

    setFromMatrix3Column(m, index) {
      return this.fromArray(m.elements, index * 3);
    }

    setFromEuler(e) {
      this.x = e._x;
      this.y = e._y;
      this.z = e._z;

      return this;
    }

    setFromColor(c) {
      this.x = c.r;
      this.y = c.g;
      this.z = c.b;

      return this;
    }

    equals(v) {
      return v.x === this.x && v.y === this.y && v.z === this.z;
    }

    fromArray(array, offset = 0) {
      this.x = array[offset];
      this.y = array[offset + 1];
      this.z = array[offset + 2];

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this.x;
      array[offset + 1] = this.y;
      array[offset + 2] = this.z;

      return array;
    }

    fromBufferAttribute(attribute, index) {
      this.x = attribute.getX(index);
      this.y = attribute.getY(index);
      this.z = attribute.getZ(index);

      return this;
    }

    random() {
      this.x = Math.random();
      this.y = Math.random();
      this.z = Math.random();

      return this;
    }

    randomDirection() {
      // Derived from https://mathworld.wolfram.com/SpherePointPicking.html

      const u = (Math.random() - 0.5) * 2;
      const t = Math.random() * Math.PI * 2;
      const f = Math.sqrt(1 - u ** 2);

      this.x = f * Math.cos(t);
      this.y = f * Math.sin(t);
      this.z = u;

      return this;
    }

    *[Symbol.iterator]() {
      yield this.x;
      yield this.y;
      yield this.z;
    }
  }

  const _vector$b = /*@__PURE__*/ new Vector3();
  const _quaternion$4 = /*@__PURE__*/ new Quaternion();

  class Box3 {
    constructor(
      min = new Vector3(+Infinity, +Infinity, +Infinity),
      max = new Vector3(-Infinity, -Infinity, -Infinity)
    ) {
      this.isBox3 = true;

      this.min = min;
      this.max = max;
    }

    set(min, max) {
      this.min.copy(min);
      this.max.copy(max);

      return this;
    }

    setFromArray(array) {
      this.makeEmpty();

      for (let i = 0, il = array.length; i < il; i += 3) {
        this.expandByPoint(_vector$a.fromArray(array, i));
      }

      return this;
    }

    setFromBufferAttribute(attribute) {
      this.makeEmpty();

      for (let i = 0, il = attribute.count; i < il; i++) {
        this.expandByPoint(_vector$a.fromBufferAttribute(attribute, i));
      }

      return this;
    }

    setFromPoints(points) {
      this.makeEmpty();

      for (let i = 0, il = points.length; i < il; i++) {
        this.expandByPoint(points[i]);
      }

      return this;
    }

    setFromCenterAndSize(center, size) {
      const halfSize = _vector$a.copy(size).multiplyScalar(0.5);

      this.min.copy(center).sub(halfSize);
      this.max.copy(center).add(halfSize);

      return this;
    }

    setFromObject(object, precise = false) {
      this.makeEmpty();

      return this.expandByObject(object, precise);
    }

    clone() {
      return new this.constructor().copy(this);
    }

    copy(box) {
      this.min.copy(box.min);
      this.max.copy(box.max);

      return this;
    }

    makeEmpty() {
      this.min.x = this.min.y = this.min.z = +Infinity;
      this.max.x = this.max.y = this.max.z = -Infinity;

      return this;
    }

    isEmpty() {
      // this is a more robust check for empty than ( volume <= 0 ) because volume can get positive with two negative axes

      return (
        this.max.x < this.min.x ||
        this.max.y < this.min.y ||
        this.max.z < this.min.z
      );
    }

    getCenter(target) {
      return this.isEmpty()
        ? target.set(0, 0, 0)
        : target.addVectors(this.min, this.max).multiplyScalar(0.5);
    }

    getSize(target) {
      return this.isEmpty()
        ? target.set(0, 0, 0)
        : target.subVectors(this.max, this.min);
    }

    expandByPoint(point) {
      this.min.min(point);
      this.max.max(point);

      return this;
    }

    expandByVector(vector) {
      this.min.sub(vector);
      this.max.add(vector);

      return this;
    }

    expandByScalar(scalar) {
      this.min.addScalar(-scalar);
      this.max.addScalar(scalar);

      return this;
    }

    expandByObject(object, precise = false) {
      // Computes the world-axis-aligned bounding box of an object (including its children),
      // accounting for both the object's, and children's, world transforms

      object.updateWorldMatrix(false, false);

      if (object.boundingBox !== undefined) {
        if (object.boundingBox === null) {
          object.computeBoundingBox();
        }

        _box$3.copy(object.boundingBox);
        _box$3.applyMatrix4(object.matrixWorld);

        this.union(_box$3);
      } else {
        const geometry = object.geometry;

        if (geometry !== undefined) {
          if (
            precise &&
            geometry.attributes !== undefined &&
            geometry.attributes.position !== undefined
          ) {
            const position = geometry.attributes.position;
            for (let i = 0, l = position.count; i < l; i++) {
              _vector$a
                .fromBufferAttribute(position, i)
                .applyMatrix4(object.matrixWorld);
              this.expandByPoint(_vector$a);
            }
          } else {
            if (geometry.boundingBox === null) {
              geometry.computeBoundingBox();
            }

            _box$3.copy(geometry.boundingBox);
            _box$3.applyMatrix4(object.matrixWorld);

            this.union(_box$3);
          }
        }
      }

      const children = object.children;

      for (let i = 0, l = children.length; i < l; i++) {
        this.expandByObject(children[i], precise);
      }

      return this;
    }

    containsPoint(point) {
      return point.x < this.min.x ||
        point.x > this.max.x ||
        point.y < this.min.y ||
        point.y > this.max.y ||
        point.z < this.min.z ||
        point.z > this.max.z
        ? false
        : true;
    }

    containsBox(box) {
      return (
        this.min.x <= box.min.x &&
        box.max.x <= this.max.x &&
        this.min.y <= box.min.y &&
        box.max.y <= this.max.y &&
        this.min.z <= box.min.z &&
        box.max.z <= this.max.z
      );
    }

    getParameter(point, target) {
      // This can potentially have a divide by zero if the box
      // has a size dimension of 0.

      return target.set(
        (point.x - this.min.x) / (this.max.x - this.min.x),
        (point.y - this.min.y) / (this.max.y - this.min.y),
        (point.z - this.min.z) / (this.max.z - this.min.z)
      );
    }

    intersectsBox(box) {
      // using 6 splitting planes to rule out intersections.
      return box.max.x < this.min.x ||
        box.min.x > this.max.x ||
        box.max.y < this.min.y ||
        box.min.y > this.max.y ||
        box.max.z < this.min.z ||
        box.min.z > this.max.z
        ? false
        : true;
    }

    intersectsSphere(sphere) {
      // Find the point on the AABB closest to the sphere center.
      this.clampPoint(sphere.center, _vector$a);

      // If that point is inside the sphere, the AABB and sphere intersect.
      return (
        _vector$a.distanceToSquared(sphere.center) <=
        sphere.radius * sphere.radius
      );
    }

    intersectsPlane(plane) {
      // We compute the minimum and maximum dot product values. If those values
      // are on the same side (back or front) of the plane, then there is no intersection.

      let min, max;

      if (plane.normal.x > 0) {
        min = plane.normal.x * this.min.x;
        max = plane.normal.x * this.max.x;
      } else {
        min = plane.normal.x * this.max.x;
        max = plane.normal.x * this.min.x;
      }

      if (plane.normal.y > 0) {
        min += plane.normal.y * this.min.y;
        max += plane.normal.y * this.max.y;
      } else {
        min += plane.normal.y * this.max.y;
        max += plane.normal.y * this.min.y;
      }

      if (plane.normal.z > 0) {
        min += plane.normal.z * this.min.z;
        max += plane.normal.z * this.max.z;
      } else {
        min += plane.normal.z * this.max.z;
        max += plane.normal.z * this.min.z;
      }

      return min <= -plane.constant && max >= -plane.constant;
    }

    intersectsTriangle(triangle) {
      if (this.isEmpty()) {
        return false;
      }

      // compute box center and extents
      this.getCenter(_center);
      _extents.subVectors(this.max, _center);

      // translate triangle to aabb origin
      _v0$2.subVectors(triangle.a, _center);
      _v1$7.subVectors(triangle.b, _center);
      _v2$4.subVectors(triangle.c, _center);

      // compute edge vectors for triangle
      _f0.subVectors(_v1$7, _v0$2);
      _f1.subVectors(_v2$4, _v1$7);
      _f2.subVectors(_v0$2, _v2$4);

      // test against axes that are given by cross product combinations of the edges of the triangle and the edges of the aabb
      // make an axis testing of each of the 3 sides of the aabb against each of the 3 sides of the triangle = 9 axis of separation
      // axis_ij = u_i x f_j (u0, u1, u2 = face normals of aabb = x,y,z axes vectors since aabb is axis aligned)
      let axes = [
        0,
        -_f0.z,
        _f0.y,
        0,
        -_f1.z,
        _f1.y,
        0,
        -_f2.z,
        _f2.y,
        _f0.z,
        0,
        -_f0.x,
        _f1.z,
        0,
        -_f1.x,
        _f2.z,
        0,
        -_f2.x,
        -_f0.y,
        _f0.x,
        0,
        -_f1.y,
        _f1.x,
        0,
        -_f2.y,
        _f2.x,
        0,
      ];
      if (!satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents)) {
        return false;
      }

      // test 3 face normals from the aabb
      axes = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      if (!satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents)) {
        return false;
      }

      // finally testing the face normal of the triangle
      // use already existing triangle edge vectors here
      _triangleNormal.crossVectors(_f0, _f1);
      axes = [_triangleNormal.x, _triangleNormal.y, _triangleNormal.z];

      return satForAxes(axes, _v0$2, _v1$7, _v2$4, _extents);
    }

    clampPoint(point, target) {
      return target.copy(point).clamp(this.min, this.max);
    }

    distanceToPoint(point) {
      return this.clampPoint(point, _vector$a).distanceTo(point);
    }

    getBoundingSphere(target) {
      if (this.isEmpty()) {
        target.makeEmpty();
      } else {
        this.getCenter(target.center);

        target.radius = this.getSize(_vector$a).length() * 0.5;
      }

      return target;
    }

    intersect(box) {
      this.min.max(box.min);
      this.max.min(box.max);

      // ensure that if there is no overlap, the result is fully empty, not slightly empty with non-inf/+inf values that will cause subsequence intersects to erroneously return valid values.
      if (this.isEmpty()) this.makeEmpty();

      return this;
    }

    union(box) {
      this.min.min(box.min);
      this.max.max(box.max);

      return this;
    }

    applyMatrix4(matrix) {
      // transform of empty box is an empty box.
      if (this.isEmpty()) return this;

      // NOTE: I am using a binary pattern to specify all 2^3 combinations below
      _points[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(matrix); // 000
      _points[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(matrix); // 001
      _points[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(matrix); // 010
      _points[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(matrix); // 011
      _points[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(matrix); // 100
      _points[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(matrix); // 101
      _points[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(matrix); // 110
      _points[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(matrix); // 111

      this.setFromPoints(_points);

      return this;
    }

    translate(offset) {
      this.min.add(offset);
      this.max.add(offset);

      return this;
    }

    equals(box) {
      return box.min.equals(this.min) && box.max.equals(this.max);
    }
  }

  const _points = [
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
    /*@__PURE__*/ new Vector3(),
  ];

  const _vector$a = /*@__PURE__*/ new Vector3();

  const _box$3 = /*@__PURE__*/ new Box3();

  // triangle centered vertices

  const _v0$2 = /*@__PURE__*/ new Vector3();
  const _v1$7 = /*@__PURE__*/ new Vector3();
  const _v2$4 = /*@__PURE__*/ new Vector3();

  // triangle edge vectors

  const _f0 = /*@__PURE__*/ new Vector3();
  const _f1 = /*@__PURE__*/ new Vector3();
  const _f2 = /*@__PURE__*/ new Vector3();

  const _center = /*@__PURE__*/ new Vector3();
  const _extents = /*@__PURE__*/ new Vector3();
  const _triangleNormal = /*@__PURE__*/ new Vector3();
  const _testAxis = /*@__PURE__*/ new Vector3();

  function satForAxes(axes, v0, v1, v2, extents) {
    for (let i = 0, j = axes.length - 3; i <= j; i += 3) {
      _testAxis.fromArray(axes, i);
      // project the aabb onto the separating axis
      const r =
        extents.x * Math.abs(_testAxis.x) +
        extents.y * Math.abs(_testAxis.y) +
        extents.z * Math.abs(_testAxis.z);
      // project all 3 vertices of the triangle onto the separating axis
      const p0 = v0.dot(_testAxis);
      const p1 = v1.dot(_testAxis);
      const p2 = v2.dot(_testAxis);
      // actual test, basically see if either of the most extreme of the triangle points intersects r
      if (Math.max(-Math.max(p0, p1, p2), Math.min(p0, p1, p2)) > r) {
        // points of the projected triangle are outside the projected half-length of the aabb
        // the axis is separating and we can exit
        return false;
      }
    }

    return true;
  }

  const _box$2 = /*@__PURE__*/ new Box3();
  const _v1$6 = /*@__PURE__*/ new Vector3();
  const _v2$3 = /*@__PURE__*/ new Vector3();

  class Sphere {
    constructor(center = new Vector3(), radius = -1) {
      this.center = center;
      this.radius = radius;
    }

    set(center, radius) {
      this.center.copy(center);
      this.radius = radius;

      return this;
    }

    setFromPoints(points, optionalCenter) {
      const center = this.center;

      if (optionalCenter !== undefined) {
        center.copy(optionalCenter);
      } else {
        _box$2.setFromPoints(points).getCenter(center);
      }

      let maxRadiusSq = 0;

      for (let i = 0, il = points.length; i < il; i++) {
        maxRadiusSq = Math.max(
          maxRadiusSq,
          center.distanceToSquared(points[i])
        );
      }

      this.radius = Math.sqrt(maxRadiusSq);

      return this;
    }

    copy(sphere) {
      this.center.copy(sphere.center);
      this.radius = sphere.radius;

      return this;
    }

    isEmpty() {
      return this.radius < 0;
    }

    makeEmpty() {
      this.center.set(0, 0, 0);
      this.radius = -1;

      return this;
    }

    containsPoint(point) {
      return point.distanceToSquared(this.center) <= this.radius * this.radius;
    }

    distanceToPoint(point) {
      return point.distanceTo(this.center) - this.radius;
    }

    intersectsSphere(sphere) {
      const radiusSum = this.radius + sphere.radius;

      return (
        sphere.center.distanceToSquared(this.center) <= radiusSum * radiusSum
      );
    }

    intersectsBox(box) {
      return box.intersectsSphere(this);
    }

    intersectsPlane(plane) {
      return Math.abs(plane.distanceToPoint(this.center)) <= this.radius;
    }

    clampPoint(point, target) {
      const deltaLengthSq = this.center.distanceToSquared(point);

      target.copy(point);

      if (deltaLengthSq > this.radius * this.radius) {
        target.sub(this.center).normalize();
        target.multiplyScalar(this.radius).add(this.center);
      }

      return target;
    }

    getBoundingBox(target) {
      if (this.isEmpty()) {
        // Empty sphere produces empty bounding box
        target.makeEmpty();
        return target;
      }

      target.set(this.center, this.center);
      target.expandByScalar(this.radius);

      return target;
    }

    applyMatrix4(matrix) {
      this.center.applyMatrix4(matrix);
      this.radius = this.radius * matrix.getMaxScaleOnAxis();

      return this;
    }

    translate(offset) {
      this.center.add(offset);

      return this;
    }

    expandByPoint(point) {
      if (this.isEmpty()) {
        this.center.copy(point);

        this.radius = 0;

        return this;
      }

      _v1$6.subVectors(point, this.center);

      const lengthSq = _v1$6.lengthSq();

      if (lengthSq > this.radius * this.radius) {
        // calculate the minimal sphere

        const length = Math.sqrt(lengthSq);

        const delta = (length - this.radius) * 0.5;

        this.center.addScaledVector(_v1$6, delta / length);

        this.radius += delta;
      }

      return this;
    }

    union(sphere) {
      if (sphere.isEmpty()) {
        return this;
      }

      if (this.isEmpty()) {
        this.copy(sphere);

        return this;
      }

      if (this.center.equals(sphere.center) === true) {
        this.radius = Math.max(this.radius, sphere.radius);
      } else {
        _v2$3.subVectors(sphere.center, this.center).setLength(sphere.radius);

        this.expandByPoint(_v1$6.copy(sphere.center).add(_v2$3));

        this.expandByPoint(_v1$6.copy(sphere.center).sub(_v2$3));
      }

      return this;
    }

    equals(sphere) {
      return sphere.center.equals(this.center) && sphere.radius === this.radius;
    }

    clone() {
      return new this.constructor().copy(this);
    }
  }

  const _vector$9 = /*@__PURE__*/ new Vector3();
  const _segCenter = /*@__PURE__*/ new Vector3();
  const _segDir = /*@__PURE__*/ new Vector3();
  const _diff = /*@__PURE__*/ new Vector3();

  const _edge1 = /*@__PURE__*/ new Vector3();
  const _edge2 = /*@__PURE__*/ new Vector3();
  const _normal$1 = /*@__PURE__*/ new Vector3();

  class Ray {
    constructor(origin = new Vector3(), direction = new Vector3(0, 0, -1)) {
      this.origin = origin;
      this.direction = direction;
    }

    set(origin, direction) {
      this.origin.copy(origin);
      this.direction.copy(direction);

      return this;
    }

    copy(ray) {
      this.origin.copy(ray.origin);
      this.direction.copy(ray.direction);

      return this;
    }

    at(t, target) {
      return target.copy(this.origin).addScaledVector(this.direction, t);
    }

    lookAt(v) {
      this.direction.copy(v).sub(this.origin).normalize();

      return this;
    }

    recast(t) {
      this.origin.copy(this.at(t, _vector$9));

      return this;
    }

    closestPointToPoint(point, target) {
      target.subVectors(point, this.origin);

      const directionDistance = target.dot(this.direction);

      if (directionDistance < 0) {
        return target.copy(this.origin);
      }

      return target
        .copy(this.origin)
        .addScaledVector(this.direction, directionDistance);
    }

    distanceToPoint(point) {
      return Math.sqrt(this.distanceSqToPoint(point));
    }

    distanceSqToPoint(point) {
      const directionDistance = _vector$9
        .subVectors(point, this.origin)
        .dot(this.direction);

      // point behind the ray

      if (directionDistance < 0) {
        return this.origin.distanceToSquared(point);
      }

      _vector$9
        .copy(this.origin)
        .addScaledVector(this.direction, directionDistance);

      return _vector$9.distanceToSquared(point);
    }

    distanceSqToSegment(v0, v1, optionalPointOnRay, optionalPointOnSegment) {
      // from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteDistRaySegment.h
      // It returns the min distance between the ray and the segment
      // defined by v0 and v1
      // It can also set two optional targets :
      // - The closest point on the ray
      // - The closest point on the segment

      _segCenter.copy(v0).add(v1).multiplyScalar(0.5);
      _segDir.copy(v1).sub(v0).normalize();
      _diff.copy(this.origin).sub(_segCenter);

      const segExtent = v0.distanceTo(v1) * 0.5;
      const a01 = -this.direction.dot(_segDir);
      const b0 = _diff.dot(this.direction);
      const b1 = -_diff.dot(_segDir);
      const c = _diff.lengthSq();
      const det = Math.abs(1 - a01 * a01);
      let s0, s1, sqrDist, extDet;

      if (det > 0) {
        // The ray and segment are not parallel.

        s0 = a01 * b1 - b0;
        s1 = a01 * b0 - b1;
        extDet = segExtent * det;

        if (s0 >= 0) {
          if (s1 >= -extDet) {
            if (s1 <= extDet) {
              // region 0
              // Minimum at interior points of ray and segment.

              const invDet = 1 / det;
              s0 *= invDet;
              s1 *= invDet;
              sqrDist =
                s0 * (s0 + a01 * s1 + 2 * b0) +
                s1 * (a01 * s0 + s1 + 2 * b1) +
                c;
            } else {
              // region 1

              s1 = segExtent;
              s0 = Math.max(0, -(a01 * s1 + b0));
              sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
            }
          } else {
            // region 5

            s1 = -segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          if (s1 <= -extDet) {
            // region 4

            s0 = Math.max(0, -(-a01 * segExtent + b0));
            s1 =
              s0 > 0
                ? -segExtent
                : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          } else if (s1 <= extDet) {
            // region 3

            s0 = 0;
            s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = s1 * (s1 + 2 * b1) + c;
          } else {
            // region 2

            s0 = Math.max(0, -(a01 * segExtent + b0));
            s1 =
              s0 > 0
                ? segExtent
                : Math.min(Math.max(-segExtent, -b1), segExtent);
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        }
      } else {
        // Ray and segment are parallel.

        s1 = a01 > 0 ? -segExtent : segExtent;
        s0 = Math.max(0, -(a01 * s1 + b0));
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }

      if (optionalPointOnRay) {
        optionalPointOnRay
          .copy(this.origin)
          .addScaledVector(this.direction, s0);
      }

      if (optionalPointOnSegment) {
        optionalPointOnSegment.copy(_segCenter).addScaledVector(_segDir, s1);
      }

      return sqrDist;
    }

    intersectSphere(sphere, target) {
      _vector$9.subVectors(sphere.center, this.origin);
      const tca = _vector$9.dot(this.direction);
      const d2 = _vector$9.dot(_vector$9) - tca * tca;
      const radius2 = sphere.radius * sphere.radius;

      if (d2 > radius2) return null;

      const thc = Math.sqrt(radius2 - d2);

      // t0 = first intersect point - entrance on front of sphere
      const t0 = tca - thc;

      // t1 = second intersect point - exit point on back of sphere
      const t1 = tca + thc;

      // test to see if t1 is behind the ray - if so, return null
      if (t1 < 0) return null;

      // test to see if t0 is behind the ray:
      // if it is, the ray is inside the sphere, so return the second exit point scaled by t1,
      // in order to always return an intersect point that is in front of the ray.
      if (t0 < 0) return this.at(t1, target);

      // else t0 is in front of the ray, so return the first collision point scaled by t0
      return this.at(t0, target);
    }

    intersectsSphere(sphere) {
      return (
        this.distanceSqToPoint(sphere.center) <= sphere.radius * sphere.radius
      );
    }

    distanceToPlane(plane) {
      const denominator = plane.normal.dot(this.direction);

      if (denominator === 0) {
        // line is coplanar, return origin
        if (plane.distanceToPoint(this.origin) === 0) {
          return 0;
        }

        // Null is preferable to undefined since undefined means.... it is undefined

        return null;
      }

      const t = -(this.origin.dot(plane.normal) + plane.constant) / denominator;

      // Return if the ray never intersects the plane

      return t >= 0 ? t : null;
    }

    intersectPlane(plane, target) {
      const t = this.distanceToPlane(plane);

      if (t === null) {
        return null;
      }

      return this.at(t, target);
    }

    intersectsPlane(plane) {
      // check if the ray lies on the plane first

      const distToPoint = plane.distanceToPoint(this.origin);

      if (distToPoint === 0) {
        return true;
      }

      const denominator = plane.normal.dot(this.direction);

      if (denominator * distToPoint < 0) {
        return true;
      }

      // ray origin is behind the plane (and is pointing behind it)

      return false;
    }

    intersectBox(box, target) {
      let tmin, tmax, tymin, tymax, tzmin, tzmax;

      const invdirx = 1 / this.direction.x,
        invdiry = 1 / this.direction.y,
        invdirz = 1 / this.direction.z;

      const origin = this.origin;

      if (invdirx >= 0) {
        tmin = (box.min.x - origin.x) * invdirx;
        tmax = (box.max.x - origin.x) * invdirx;
      } else {
        tmin = (box.max.x - origin.x) * invdirx;
        tmax = (box.min.x - origin.x) * invdirx;
      }

      if (invdiry >= 0) {
        tymin = (box.min.y - origin.y) * invdiry;
        tymax = (box.max.y - origin.y) * invdiry;
      } else {
        tymin = (box.max.y - origin.y) * invdiry;
        tymax = (box.min.y - origin.y) * invdiry;
      }

      if (tmin > tymax || tymin > tmax) return null;

      if (tymin > tmin || isNaN(tmin)) tmin = tymin;

      if (tymax < tmax || isNaN(tmax)) tmax = tymax;

      if (invdirz >= 0) {
        tzmin = (box.min.z - origin.z) * invdirz;
        tzmax = (box.max.z - origin.z) * invdirz;
      } else {
        tzmin = (box.max.z - origin.z) * invdirz;
        tzmax = (box.min.z - origin.z) * invdirz;
      }

      if (tmin > tzmax || tzmin > tmax) return null;

      if (tzmin > tmin || tmin !== tmin) tmin = tzmin;

      if (tzmax < tmax || tmax !== tmax) tmax = tzmax;

      //return point closest to the ray (positive side)

      if (tmax < 0) return null;

      return this.at(tmin >= 0 ? tmin : tmax, target);
    }

    intersectsBox(box) {
      return this.intersectBox(box, _vector$9) !== null;
    }

    intersectTriangle(a, b, c, backfaceCulling, target) {
      // Compute the offset origin, edges, and normal.

      // from https://github.com/pmjoniak/GeometricTools/blob/master/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h

      _edge1.subVectors(b, a);
      _edge2.subVectors(c, a);
      _normal$1.crossVectors(_edge1, _edge2);

      // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
      // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
      //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
      //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
      //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
      let DdN = this.direction.dot(_normal$1);
      let sign;

      if (DdN > 0) {
        if (backfaceCulling) return null;
        sign = 1;
      } else if (DdN < 0) {
        sign = -1;
        DdN = -DdN;
      } else {
        return null;
      }

      _diff.subVectors(this.origin, a);
      const DdQxE2 =
        sign * this.direction.dot(_edge2.crossVectors(_diff, _edge2));

      // b1 < 0, no intersection
      if (DdQxE2 < 0) {
        return null;
      }

      const DdE1xQ = sign * this.direction.dot(_edge1.cross(_diff));

      // b2 < 0, no intersection
      if (DdE1xQ < 0) {
        return null;
      }

      // b1+b2 > 1, no intersection
      if (DdQxE2 + DdE1xQ > DdN) {
        return null;
      }

      // Line intersects triangle, check if ray does.
      const QdN = -sign * _diff.dot(_normal$1);

      // t < 0, no intersection
      if (QdN < 0) {
        return null;
      }

      // Ray intersects triangle.
      return this.at(QdN / DdN, target);
    }

    applyMatrix4(matrix4) {
      this.origin.applyMatrix4(matrix4);
      this.direction.transformDirection(matrix4);

      return this;
    }

    equals(ray) {
      return (
        ray.origin.equals(this.origin) && ray.direction.equals(this.direction)
      );
    }

    clone() {
      return new this.constructor().copy(this);
    }
  }

  class Matrix4 {
    constructor(
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44
    ) {
      Matrix4.prototype.isMatrix4 = true;

      this.elements = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

      if (n11 !== undefined) {
        this.set(
          n11,
          n12,
          n13,
          n14,
          n21,
          n22,
          n23,
          n24,
          n31,
          n32,
          n33,
          n34,
          n41,
          n42,
          n43,
          n44
        );
      }
    }

    set(
      n11,
      n12,
      n13,
      n14,
      n21,
      n22,
      n23,
      n24,
      n31,
      n32,
      n33,
      n34,
      n41,
      n42,
      n43,
      n44
    ) {
      const te = this.elements;

      te[0] = n11;
      te[4] = n12;
      te[8] = n13;
      te[12] = n14;
      te[1] = n21;
      te[5] = n22;
      te[9] = n23;
      te[13] = n24;
      te[2] = n31;
      te[6] = n32;
      te[10] = n33;
      te[14] = n34;
      te[3] = n41;
      te[7] = n42;
      te[11] = n43;
      te[15] = n44;

      return this;
    }

    identity() {
      this.set(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      return this;
    }

    clone() {
      return new Matrix4().fromArray(this.elements);
    }

    copy(m) {
      const te = this.elements;
      const me = m.elements;

      te[0] = me[0];
      te[1] = me[1];
      te[2] = me[2];
      te[3] = me[3];
      te[4] = me[4];
      te[5] = me[5];
      te[6] = me[6];
      te[7] = me[7];
      te[8] = me[8];
      te[9] = me[9];
      te[10] = me[10];
      te[11] = me[11];
      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];
      te[15] = me[15];

      return this;
    }

    copyPosition(m) {
      const te = this.elements,
        me = m.elements;

      te[12] = me[12];
      te[13] = me[13];
      te[14] = me[14];

      return this;
    }

    setFromMatrix3(m) {
      const me = m.elements;

      this.set(
        me[0],
        me[3],
        me[6],
        0,
        me[1],
        me[4],
        me[7],
        0,
        me[2],
        me[5],
        me[8],
        0,
        0,
        0,
        0,
        1
      );

      return this;
    }

    extractBasis(xAxis, yAxis, zAxis) {
      xAxis.setFromMatrixColumn(this, 0);
      yAxis.setFromMatrixColumn(this, 1);
      zAxis.setFromMatrixColumn(this, 2);

      return this;
    }

    makeBasis(xAxis, yAxis, zAxis) {
      this.set(
        xAxis.x,
        yAxis.x,
        zAxis.x,
        0,
        xAxis.y,
        yAxis.y,
        zAxis.y,
        0,
        xAxis.z,
        yAxis.z,
        zAxis.z,
        0,
        0,
        0,
        0,
        1
      );

      return this;
    }

    extractRotation(m) {
      // this method does not support reflection matrices

      const te = this.elements;
      const me = m.elements;

      const scaleX = 1 / _v1$5.setFromMatrixColumn(m, 0).length();
      const scaleY = 1 / _v1$5.setFromMatrixColumn(m, 1).length();
      const scaleZ = 1 / _v1$5.setFromMatrixColumn(m, 2).length();

      te[0] = me[0] * scaleX;
      te[1] = me[1] * scaleX;
      te[2] = me[2] * scaleX;
      te[3] = 0;

      te[4] = me[4] * scaleY;
      te[5] = me[5] * scaleY;
      te[6] = me[6] * scaleY;
      te[7] = 0;

      te[8] = me[8] * scaleZ;
      te[9] = me[9] * scaleZ;
      te[10] = me[10] * scaleZ;
      te[11] = 0;

      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;

      return this;
    }

    makeRotationFromEuler(euler) {
      const te = this.elements;

      const x = euler.x,
        y = euler.y,
        z = euler.z;
      const a = Math.cos(x),
        b = Math.sin(x);
      const c = Math.cos(y),
        d = Math.sin(y);
      const e = Math.cos(z),
        f = Math.sin(z);

      if (euler.order === "XYZ") {
        const ae = a * e,
          af = a * f,
          be = b * e,
          bf = b * f;

        te[0] = c * e;
        te[4] = -c * f;
        te[8] = d;

        te[1] = af + be * d;
        te[5] = ae - bf * d;
        te[9] = -b * c;

        te[2] = bf - ae * d;
        te[6] = be + af * d;
        te[10] = a * c;
      } else if (euler.order === "YXZ") {
        const ce = c * e,
          cf = c * f,
          de = d * e,
          df = d * f;

        te[0] = ce + df * b;
        te[4] = de * b - cf;
        te[8] = a * d;

        te[1] = a * f;
        te[5] = a * e;
        te[9] = -b;

        te[2] = cf * b - de;
        te[6] = df + ce * b;
        te[10] = a * c;
      } else if (euler.order === "ZXY") {
        const ce = c * e,
          cf = c * f,
          de = d * e,
          df = d * f;

        te[0] = ce - df * b;
        te[4] = -a * f;
        te[8] = de + cf * b;

        te[1] = cf + de * b;
        te[5] = a * e;
        te[9] = df - ce * b;

        te[2] = -a * d;
        te[6] = b;
        te[10] = a * c;
      } else if (euler.order === "ZYX") {
        const ae = a * e,
          af = a * f,
          be = b * e,
          bf = b * f;

        te[0] = c * e;
        te[4] = be * d - af;
        te[8] = ae * d + bf;

        te[1] = c * f;
        te[5] = bf * d + ae;
        te[9] = af * d - be;

        te[2] = -d;
        te[6] = b * c;
        te[10] = a * c;
      } else if (euler.order === "YZX") {
        const ac = a * c,
          ad = a * d,
          bc = b * c,
          bd = b * d;

        te[0] = c * e;
        te[4] = bd - ac * f;
        te[8] = bc * f + ad;

        te[1] = f;
        te[5] = a * e;
        te[9] = -b * e;

        te[2] = -d * e;
        te[6] = ad * f + bc;
        te[10] = ac - bd * f;
      } else if (euler.order === "XZY") {
        const ac = a * c,
          ad = a * d,
          bc = b * c,
          bd = b * d;

        te[0] = c * e;
        te[4] = -f;
        te[8] = d * e;

        te[1] = ac * f + bd;
        te[5] = a * e;
        te[9] = ad * f - bc;

        te[2] = bc * f - ad;
        te[6] = b * e;
        te[10] = bd * f + ac;
      }

      // bottom row
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;

      // last column
      te[12] = 0;
      te[13] = 0;
      te[14] = 0;
      te[15] = 1;

      return this;
    }

    makeRotationFromQuaternion(q) {
      return this.compose(_zero, q, _one);
    }

    lookAt(eye, target, up) {
      const te = this.elements;

      _z.subVectors(eye, target);

      if (_z.lengthSq() === 0) {
        // eye and target are in the same position

        _z.z = 1;
      }

      _z.normalize();
      _x.crossVectors(up, _z);

      if (_x.lengthSq() === 0) {
        // up and z are parallel

        if (Math.abs(up.z) === 1) {
          _z.x += 0.0001;
        } else {
          _z.z += 0.0001;
        }

        _z.normalize();
        _x.crossVectors(up, _z);
      }

      _x.normalize();
      _y.crossVectors(_z, _x);

      te[0] = _x.x;
      te[4] = _y.x;
      te[8] = _z.x;
      te[1] = _x.y;
      te[5] = _y.y;
      te[9] = _z.y;
      te[2] = _x.z;
      te[6] = _y.z;
      te[10] = _z.z;

      return this;
    }

    multiply(m) {
      return this.multiplyMatrices(this, m);
    }

    premultiply(m) {
      return this.multiplyMatrices(m, this);
    }

    multiplyMatrices(a, b) {
      const ae = a.elements;
      const be = b.elements;
      const te = this.elements;

      const a11 = ae[0],
        a12 = ae[4],
        a13 = ae[8],
        a14 = ae[12];
      const a21 = ae[1],
        a22 = ae[5],
        a23 = ae[9],
        a24 = ae[13];
      const a31 = ae[2],
        a32 = ae[6],
        a33 = ae[10],
        a34 = ae[14];
      const a41 = ae[3],
        a42 = ae[7],
        a43 = ae[11],
        a44 = ae[15];

      const b11 = be[0],
        b12 = be[4],
        b13 = be[8],
        b14 = be[12];
      const b21 = be[1],
        b22 = be[5],
        b23 = be[9],
        b24 = be[13];
      const b31 = be[2],
        b32 = be[6],
        b33 = be[10],
        b34 = be[14];
      const b41 = be[3],
        b42 = be[7],
        b43 = be[11],
        b44 = be[15];

      te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
      te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
      te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
      te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

      te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
      te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
      te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
      te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

      te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
      te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
      te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
      te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

      te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
      te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
      te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
      te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

      return this;
    }

    multiplyScalar(s) {
      const te = this.elements;

      te[0] *= s;
      te[4] *= s;
      te[8] *= s;
      te[12] *= s;
      te[1] *= s;
      te[5] *= s;
      te[9] *= s;
      te[13] *= s;
      te[2] *= s;
      te[6] *= s;
      te[10] *= s;
      te[14] *= s;
      te[3] *= s;
      te[7] *= s;
      te[11] *= s;
      te[15] *= s;

      return this;
    }

    determinant() {
      const te = this.elements;

      const n11 = te[0],
        n12 = te[4],
        n13 = te[8],
        n14 = te[12];
      const n21 = te[1],
        n22 = te[5],
        n23 = te[9],
        n24 = te[13];
      const n31 = te[2],
        n32 = te[6],
        n33 = te[10],
        n34 = te[14];
      const n41 = te[3],
        n42 = te[7],
        n43 = te[11],
        n44 = te[15];

      //TODO: make this more efficient
      //( based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm )

      return (
        n41 *
          (+n14 * n23 * n32 -
            n13 * n24 * n32 -
            n14 * n22 * n33 +
            n12 * n24 * n33 +
            n13 * n22 * n34 -
            n12 * n23 * n34) +
        n42 *
          (+n11 * n23 * n34 -
            n11 * n24 * n33 +
            n14 * n21 * n33 -
            n13 * n21 * n34 +
            n13 * n24 * n31 -
            n14 * n23 * n31) +
        n43 *
          (+n11 * n24 * n32 -
            n11 * n22 * n34 -
            n14 * n21 * n32 +
            n12 * n21 * n34 +
            n14 * n22 * n31 -
            n12 * n24 * n31) +
        n44 *
          (-n13 * n22 * n31 -
            n11 * n23 * n32 +
            n11 * n22 * n33 +
            n13 * n21 * n32 -
            n12 * n21 * n33 +
            n12 * n23 * n31)
      );
    }

    transpose() {
      const te = this.elements;
      let tmp;

      tmp = te[1];
      te[1] = te[4];
      te[4] = tmp;
      tmp = te[2];
      te[2] = te[8];
      te[8] = tmp;
      tmp = te[6];
      te[6] = te[9];
      te[9] = tmp;

      tmp = te[3];
      te[3] = te[12];
      te[12] = tmp;
      tmp = te[7];
      te[7] = te[13];
      te[13] = tmp;
      tmp = te[11];
      te[11] = te[14];
      te[14] = tmp;

      return this;
    }

    setPosition(x, y, z) {
      const te = this.elements;

      if (x.isVector3) {
        te[12] = x.x;
        te[13] = x.y;
        te[14] = x.z;
      } else {
        te[12] = x;
        te[13] = y;
        te[14] = z;
      }

      return this;
    }

    invert() {
      // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
      const te = this.elements,
        n11 = te[0],
        n21 = te[1],
        n31 = te[2],
        n41 = te[3],
        n12 = te[4],
        n22 = te[5],
        n32 = te[6],
        n42 = te[7],
        n13 = te[8],
        n23 = te[9],
        n33 = te[10],
        n43 = te[11],
        n14 = te[12],
        n24 = te[13],
        n34 = te[14],
        n44 = te[15],
        t11 =
          n23 * n34 * n42 -
          n24 * n33 * n42 +
          n24 * n32 * n43 -
          n22 * n34 * n43 -
          n23 * n32 * n44 +
          n22 * n33 * n44,
        t12 =
          n14 * n33 * n42 -
          n13 * n34 * n42 -
          n14 * n32 * n43 +
          n12 * n34 * n43 +
          n13 * n32 * n44 -
          n12 * n33 * n44,
        t13 =
          n13 * n24 * n42 -
          n14 * n23 * n42 +
          n14 * n22 * n43 -
          n12 * n24 * n43 -
          n13 * n22 * n44 +
          n12 * n23 * n44,
        t14 =
          n14 * n23 * n32 -
          n13 * n24 * n32 -
          n14 * n22 * n33 +
          n12 * n24 * n33 +
          n13 * n22 * n34 -
          n12 * n23 * n34;

      const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

      if (det === 0)
        return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

      const detInv = 1 / det;

      te[0] = t11 * detInv;
      te[1] =
        (n24 * n33 * n41 -
          n23 * n34 * n41 -
          n24 * n31 * n43 +
          n21 * n34 * n43 +
          n23 * n31 * n44 -
          n21 * n33 * n44) *
        detInv;
      te[2] =
        (n22 * n34 * n41 -
          n24 * n32 * n41 +
          n24 * n31 * n42 -
          n21 * n34 * n42 -
          n22 * n31 * n44 +
          n21 * n32 * n44) *
        detInv;
      te[3] =
        (n23 * n32 * n41 -
          n22 * n33 * n41 -
          n23 * n31 * n42 +
          n21 * n33 * n42 +
          n22 * n31 * n43 -
          n21 * n32 * n43) *
        detInv;

      te[4] = t12 * detInv;
      te[5] =
        (n13 * n34 * n41 -
          n14 * n33 * n41 +
          n14 * n31 * n43 -
          n11 * n34 * n43 -
          n13 * n31 * n44 +
          n11 * n33 * n44) *
        detInv;
      te[6] =
        (n14 * n32 * n41 -
          n12 * n34 * n41 -
          n14 * n31 * n42 +
          n11 * n34 * n42 +
          n12 * n31 * n44 -
          n11 * n32 * n44) *
        detInv;
      te[7] =
        (n12 * n33 * n41 -
          n13 * n32 * n41 +
          n13 * n31 * n42 -
          n11 * n33 * n42 -
          n12 * n31 * n43 +
          n11 * n32 * n43) *
        detInv;

      te[8] = t13 * detInv;
      te[9] =
        (n14 * n23 * n41 -
          n13 * n24 * n41 -
          n14 * n21 * n43 +
          n11 * n24 * n43 +
          n13 * n21 * n44 -
          n11 * n23 * n44) *
        detInv;
      te[10] =
        (n12 * n24 * n41 -
          n14 * n22 * n41 +
          n14 * n21 * n42 -
          n11 * n24 * n42 -
          n12 * n21 * n44 +
          n11 * n22 * n44) *
        detInv;
      te[11] =
        (n13 * n22 * n41 -
          n12 * n23 * n41 -
          n13 * n21 * n42 +
          n11 * n23 * n42 +
          n12 * n21 * n43 -
          n11 * n22 * n43) *
        detInv;

      te[12] = t14 * detInv;
      te[13] =
        (n13 * n24 * n31 -
          n14 * n23 * n31 +
          n14 * n21 * n33 -
          n11 * n24 * n33 -
          n13 * n21 * n34 +
          n11 * n23 * n34) *
        detInv;
      te[14] =
        (n14 * n22 * n31 -
          n12 * n24 * n31 -
          n14 * n21 * n32 +
          n11 * n24 * n32 +
          n12 * n21 * n34 -
          n11 * n22 * n34) *
        detInv;
      te[15] =
        (n12 * n23 * n31 -
          n13 * n22 * n31 +
          n13 * n21 * n32 -
          n11 * n23 * n32 -
          n12 * n21 * n33 +
          n11 * n22 * n33) *
        detInv;

      return this;
    }

    scale(v) {
      const te = this.elements;
      const x = v.x,
        y = v.y,
        z = v.z;

      te[0] *= x;
      te[4] *= y;
      te[8] *= z;
      te[1] *= x;
      te[5] *= y;
      te[9] *= z;
      te[2] *= x;
      te[6] *= y;
      te[10] *= z;
      te[3] *= x;
      te[7] *= y;
      te[11] *= z;

      return this;
    }

    getMaxScaleOnAxis() {
      const te = this.elements;

      const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
      const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
      const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

      return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
    }

    makeTranslation(x, y, z) {
      if (x.isVector3) {
        this.set(1, 0, 0, x.x, 0, 1, 0, x.y, 0, 0, 1, x.z, 0, 0, 0, 1);
      } else {
        this.set(1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1);
      }

      return this;
    }

    makeRotationX(theta) {
      const c = Math.cos(theta),
        s = Math.sin(theta);

      this.set(1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1);

      return this;
    }

    makeRotationY(theta) {
      const c = Math.cos(theta),
        s = Math.sin(theta);

      this.set(c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1);

      return this;
    }

    makeRotationZ(theta) {
      const c = Math.cos(theta),
        s = Math.sin(theta);

      this.set(c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);

      return this;
    }

    makeRotationAxis(axis, angle) {
      // Based on http://www.gamedev.net/reference/articles/article1199.asp

      const c = Math.cos(angle);
      const s = Math.sin(angle);
      const t = 1 - c;
      const x = axis.x,
        y = axis.y,
        z = axis.z;
      const tx = t * x,
        ty = t * y;

      this.set(
        tx * x + c,
        tx * y - s * z,
        tx * z + s * y,
        0,
        tx * y + s * z,
        ty * y + c,
        ty * z - s * x,
        0,
        tx * z - s * y,
        ty * z + s * x,
        t * z * z + c,
        0,
        0,
        0,
        0,
        1
      );

      return this;
    }

    makeScale(x, y, z) {
      this.set(x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1);

      return this;
    }

    makeShear(xy, xz, yx, yz, zx, zy) {
      this.set(1, yx, zx, 0, xy, 1, zy, 0, xz, yz, 1, 0, 0, 0, 0, 1);

      return this;
    }

    compose(position, quaternion, scale) {
      const te = this.elements;

      const x = quaternion._x,
        y = quaternion._y,
        z = quaternion._z,
        w = quaternion._w;
      const x2 = x + x,
        y2 = y + y,
        z2 = z + z;
      const xx = x * x2,
        xy = x * y2,
        xz = x * z2;
      const yy = y * y2,
        yz = y * z2,
        zz = z * z2;
      const wx = w * x2,
        wy = w * y2,
        wz = w * z2;

      const sx = scale.x,
        sy = scale.y,
        sz = scale.z;

      te[0] = (1 - (yy + zz)) * sx;
      te[1] = (xy + wz) * sx;
      te[2] = (xz - wy) * sx;
      te[3] = 0;

      te[4] = (xy - wz) * sy;
      te[5] = (1 - (xx + zz)) * sy;
      te[6] = (yz + wx) * sy;
      te[7] = 0;

      te[8] = (xz + wy) * sz;
      te[9] = (yz - wx) * sz;
      te[10] = (1 - (xx + yy)) * sz;
      te[11] = 0;

      te[12] = position.x;
      te[13] = position.y;
      te[14] = position.z;
      te[15] = 1;

      return this;
    }

    decompose(position, quaternion, scale) {
      const te = this.elements;

      let sx = _v1$5.set(te[0], te[1], te[2]).length();
      const sy = _v1$5.set(te[4], te[5], te[6]).length();
      const sz = _v1$5.set(te[8], te[9], te[10]).length();

      // if determine is negative, we need to invert one scale
      const det = this.determinant();
      if (det < 0) sx = -sx;

      position.x = te[12];
      position.y = te[13];
      position.z = te[14];

      // scale the rotation part
      _m1$2.copy(this);

      const invSX = 1 / sx;
      const invSY = 1 / sy;
      const invSZ = 1 / sz;

      _m1$2.elements[0] *= invSX;
      _m1$2.elements[1] *= invSX;
      _m1$2.elements[2] *= invSX;

      _m1$2.elements[4] *= invSY;
      _m1$2.elements[5] *= invSY;
      _m1$2.elements[6] *= invSY;

      _m1$2.elements[8] *= invSZ;
      _m1$2.elements[9] *= invSZ;
      _m1$2.elements[10] *= invSZ;

      quaternion.setFromRotationMatrix(_m1$2);

      scale.x = sx;
      scale.y = sy;
      scale.z = sz;

      return this;
    }

    makePerspective(
      left,
      right,
      top,
      bottom,
      near,
      far,
      coordinateSystem = WebGLCoordinateSystem
    ) {
      const te = this.elements;
      const x = (2 * near) / (right - left);
      const y = (2 * near) / (top - bottom);

      const a = (right + left) / (right - left);
      const b = (top + bottom) / (top - bottom);

      let c, d;

      if (coordinateSystem === WebGLCoordinateSystem) {
        c = -(far + near) / (far - near);
        d = (-2 * far * near) / (far - near);
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        c = -far / (far - near);
        d = (-far * near) / (far - near);
      } else {
        throw new Error(
          "THREE.Matrix4.makePerspective(): Invalid coordinate system: " +
            coordinateSystem
        );
      }

      te[0] = x;
      te[4] = 0;
      te[8] = a;
      te[12] = 0;
      te[1] = 0;
      te[5] = y;
      te[9] = b;
      te[13] = 0;
      te[2] = 0;
      te[6] = 0;
      te[10] = c;
      te[14] = d;
      te[3] = 0;
      te[7] = 0;
      te[11] = -1;
      te[15] = 0;

      return this;
    }

    makeOrthographic(
      left,
      right,
      top,
      bottom,
      near,
      far,
      coordinateSystem = WebGLCoordinateSystem
    ) {
      const te = this.elements;
      const w = 1.0 / (right - left);
      const h = 1.0 / (top - bottom);
      const p = 1.0 / (far - near);

      const x = (right + left) * w;
      const y = (top + bottom) * h;

      let z, zInv;

      if (coordinateSystem === WebGLCoordinateSystem) {
        z = (far + near) * p;
        zInv = -2 * p;
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        z = near * p;
        zInv = -1 * p;
      } else {
        throw new Error(
          "THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " +
            coordinateSystem
        );
      }

      te[0] = 2 * w;
      te[4] = 0;
      te[8] = 0;
      te[12] = -x;
      te[1] = 0;
      te[5] = 2 * h;
      te[9] = 0;
      te[13] = -y;
      te[2] = 0;
      te[6] = 0;
      te[10] = zInv;
      te[14] = -z;
      te[3] = 0;
      te[7] = 0;
      te[11] = 0;
      te[15] = 1;

      return this;
    }

    equals(matrix) {
      const te = this.elements;
      const me = matrix.elements;

      for (let i = 0; i < 16; i++) {
        if (te[i] !== me[i]) return false;
      }

      return true;
    }

    fromArray(array, offset = 0) {
      for (let i = 0; i < 16; i++) {
        this.elements[i] = array[i + offset];
      }

      return this;
    }

    toArray(array = [], offset = 0) {
      const te = this.elements;

      array[offset] = te[0];
      array[offset + 1] = te[1];
      array[offset + 2] = te[2];
      array[offset + 3] = te[3];

      array[offset + 4] = te[4];
      array[offset + 5] = te[5];
      array[offset + 6] = te[6];
      array[offset + 7] = te[7];

      array[offset + 8] = te[8];
      array[offset + 9] = te[9];
      array[offset + 10] = te[10];
      array[offset + 11] = te[11];

      array[offset + 12] = te[12];
      array[offset + 13] = te[13];
      array[offset + 14] = te[14];
      array[offset + 15] = te[15];

      return array;
    }
  }

  const _v1$5 = /*@__PURE__*/ new Vector3();
  const _m1$2 = /*@__PURE__*/ new Matrix4();
  const _zero = /*@__PURE__*/ new Vector3(0, 0, 0);
  const _one = /*@__PURE__*/ new Vector3(1, 1, 1);
  const _x = /*@__PURE__*/ new Vector3();
  const _y = /*@__PURE__*/ new Vector3();
  const _z = /*@__PURE__*/ new Vector3();

  const _matrix = /*@__PURE__*/ new Matrix4();
  const _quaternion$3 = /*@__PURE__*/ new Quaternion();

  class Euler {
    constructor(x = 0, y = 0, z = 0, order = Euler.DEFAULT_ORDER) {
      this.isEuler = true;

      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;
    }

    get x() {
      return this._x;
    }

    set x(value) {
      this._x = value;
      this._onChangeCallback();
    }

    get y() {
      return this._y;
    }

    set y(value) {
      this._y = value;
      this._onChangeCallback();
    }

    get z() {
      return this._z;
    }

    set z(value) {
      this._z = value;
      this._onChangeCallback();
    }

    get order() {
      return this._order;
    }

    set order(value) {
      this._order = value;
      this._onChangeCallback();
    }

    set(x, y, z, order = this._order) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._order = order;

      this._onChangeCallback();

      return this;
    }

    clone() {
      return new this.constructor(this._x, this._y, this._z, this._order);
    }

    copy(euler) {
      this._x = euler._x;
      this._y = euler._y;
      this._z = euler._z;
      this._order = euler._order;

      this._onChangeCallback();

      return this;
    }

    setFromRotationMatrix(m, order = this._order, update = true) {
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

      const te = m.elements;
      const m11 = te[0],
        m12 = te[4],
        m13 = te[8];
      const m21 = te[1],
        m22 = te[5],
        m23 = te[9];
      const m31 = te[2],
        m32 = te[6],
        m33 = te[10];

      switch (order) {
        case "XYZ":
          this._y = Math.asin(clamp(m13, -1, 1));

          if (Math.abs(m13) < 0.9999999) {
            this._x = Math.atan2(-m23, m33);
            this._z = Math.atan2(-m12, m11);
          } else {
            this._x = Math.atan2(m32, m22);
            this._z = 0;
          }

          break;

        case "YXZ":
          this._x = Math.asin(-clamp(m23, -1, 1));

          if (Math.abs(m23) < 0.9999999) {
            this._y = Math.atan2(m13, m33);
            this._z = Math.atan2(m21, m22);
          } else {
            this._y = Math.atan2(-m31, m11);
            this._z = 0;
          }

          break;

        case "ZXY":
          this._x = Math.asin(clamp(m32, -1, 1));

          if (Math.abs(m32) < 0.9999999) {
            this._y = Math.atan2(-m31, m33);
            this._z = Math.atan2(-m12, m22);
          } else {
            this._y = 0;
            this._z = Math.atan2(m21, m11);
          }

          break;

        case "ZYX":
          this._y = Math.asin(-clamp(m31, -1, 1));

          if (Math.abs(m31) < 0.9999999) {
            this._x = Math.atan2(m32, m33);
            this._z = Math.atan2(m21, m11);
          } else {
            this._x = 0;
            this._z = Math.atan2(-m12, m22);
          }

          break;

        case "YZX":
          this._z = Math.asin(clamp(m21, -1, 1));

          if (Math.abs(m21) < 0.9999999) {
            this._x = Math.atan2(-m23, m22);
            this._y = Math.atan2(-m31, m11);
          } else {
            this._x = 0;
            this._y = Math.atan2(m13, m33);
          }

          break;

        case "XZY":
          this._z = Math.asin(-clamp(m12, -1, 1));

          if (Math.abs(m12) < 0.9999999) {
            this._x = Math.atan2(m32, m22);
            this._y = Math.atan2(m13, m11);
          } else {
            this._x = Math.atan2(-m23, m33);
            this._y = 0;
          }

          break;

        default:
          console.warn(
            "THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " +
              order
          );
      }

      this._order = order;

      if (update === true) this._onChangeCallback();

      return this;
    }

    setFromQuaternion(q, order, update) {
      _matrix.makeRotationFromQuaternion(q);

      return this.setFromRotationMatrix(_matrix, order, update);
    }

    setFromVector3(v, order = this._order) {
      return this.set(v.x, v.y, v.z, order);
    }

    reorder(newOrder) {
      // WARNING: this discards revolution information -bhouston

      _quaternion$3.setFromEuler(this);

      return this.setFromQuaternion(_quaternion$3, newOrder);
    }

    equals(euler) {
      return (
        euler._x === this._x &&
        euler._y === this._y &&
        euler._z === this._z &&
        euler._order === this._order
      );
    }

    fromArray(array) {
      this._x = array[0];
      this._y = array[1];
      this._z = array[2];
      if (array[3] !== undefined) this._order = array[3];

      this._onChangeCallback();

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this._x;
      array[offset + 1] = this._y;
      array[offset + 2] = this._z;
      array[offset + 3] = this._order;

      return array;
    }

    _onChange(callback) {
      this._onChangeCallback = callback;

      return this;
    }

    _onChangeCallback() {}

    *[Symbol.iterator]() {
      yield this._x;
      yield this._y;
      yield this._z;
      yield this._order;
    }
  }

  Euler.DEFAULT_ORDER = "XYZ";

  class Layers {
    constructor() {
      this.mask = 1 | 0;
    }

    set(channel) {
      this.mask = ((1 << channel) | 0) >>> 0;
    }

    enable(channel) {
      this.mask |= (1 << channel) | 0;
    }

    enableAll() {
      this.mask = 0xffffffff | 0;
    }

    toggle(channel) {
      this.mask ^= (1 << channel) | 0;
    }

    disable(channel) {
      this.mask &= ~((1 << channel) | 0);
    }

    disableAll() {
      this.mask = 0;
    }

    test(layers) {
      return (this.mask & layers.mask) !== 0;
    }

    isEnabled(channel) {
      return (this.mask & ((1 << channel) | 0)) !== 0;
    }
  }

  let _object3DId = 0;

  const _v1$4 = /*@__PURE__*/ new Vector3();
  const _q1 = /*@__PURE__*/ new Quaternion();
  const _m1$1 = /*@__PURE__*/ new Matrix4();
  const _target = /*@__PURE__*/ new Vector3();

  const _position$3 = /*@__PURE__*/ new Vector3();
  const _scale$2 = /*@__PURE__*/ new Vector3();
  const _quaternion$2 = /*@__PURE__*/ new Quaternion();

  const _xAxis = /*@__PURE__*/ new Vector3(1, 0, 0);
  const _yAxis = /*@__PURE__*/ new Vector3(0, 1, 0);
  const _zAxis = /*@__PURE__*/ new Vector3(0, 0, 1);

  const _addedEvent = { type: "added" };
  const _removedEvent = { type: "removed" };

  class Object3D extends EventDispatcher {
    constructor() {
      super();

      this.isObject3D = true;

      Object.defineProperty(this, "id", { value: _object3DId++ });

      this.uuid = generateUUID();

      this.name = "";
      this.type = "Object3D";

      this.parent = null;
      this.children = [];

      this.up = Object3D.DEFAULT_UP.clone();

      const position = new Vector3();
      const rotation = new Euler();
      const quaternion = new Quaternion();
      const scale = new Vector3(1, 1, 1);

      function onRotationChange() {
        quaternion.setFromEuler(rotation, false);
      }

      function onQuaternionChange() {
        rotation.setFromQuaternion(quaternion, undefined, false);
      }

      rotation._onChange(onRotationChange);
      quaternion._onChange(onQuaternionChange);

      Object.defineProperties(this, {
        position: {
          configurable: true,
          enumerable: true,
          value: position,
        },
        rotation: {
          configurable: true,
          enumerable: true,
          value: rotation,
        },
        quaternion: {
          configurable: true,
          enumerable: true,
          value: quaternion,
        },
        scale: {
          configurable: true,
          enumerable: true,
          value: scale,
        },
        modelViewMatrix: {
          value: new Matrix4(),
        },
        normalMatrix: {
          value: new Matrix3(),
        },
      });

      this.matrix = new Matrix4();
      this.matrixWorld = new Matrix4();

      this.matrixAutoUpdate = Object3D.DEFAULT_MATRIX_AUTO_UPDATE;
      this.matrixWorldNeedsUpdate = false;

      this.matrixWorldAutoUpdate = Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE; // checked by the renderer

      this.layers = new Layers();
      this.visible = true;

      this.castShadow = false;
      this.receiveShadow = false;

      this.frustumCulled = true;
      this.renderOrder = 0;

      this.animations = [];

      this.userData = {};
    }

    onBeforeRender(/* renderer, scene, camera, geometry, material, group */) {}

    onAfterRender(/* renderer, scene, camera, geometry, material, group */) {}

    applyMatrix4(matrix) {
      if (this.matrixAutoUpdate) this.updateMatrix();

      this.matrix.premultiply(matrix);

      this.matrix.decompose(this.position, this.quaternion, this.scale);
    }

    applyQuaternion(q) {
      this.quaternion.premultiply(q);

      return this;
    }

    setRotationFromAxisAngle(axis, angle) {
      // assumes axis is normalized

      this.quaternion.setFromAxisAngle(axis, angle);
    }

    setRotationFromEuler(euler) {
      this.quaternion.setFromEuler(euler, true);
    }

    setRotationFromMatrix(m) {
      // assumes the upper 3x3 of m is a pure rotation matrix (i.e, unscaled)

      this.quaternion.setFromRotationMatrix(m);
    }

    setRotationFromQuaternion(q) {
      // assumes q is normalized

      this.quaternion.copy(q);
    }

    rotateOnAxis(axis, angle) {
      // rotate object on axis in object space
      // axis is assumed to be normalized

      _q1.setFromAxisAngle(axis, angle);

      this.quaternion.multiply(_q1);

      return this;
    }

    rotateOnWorldAxis(axis, angle) {
      // rotate object on axis in world space
      // axis is assumed to be normalized
      // method assumes no rotated parent

      _q1.setFromAxisAngle(axis, angle);

      this.quaternion.premultiply(_q1);

      return this;
    }

    rotateX(angle) {
      return this.rotateOnAxis(_xAxis, angle);
    }

    rotateY(angle) {
      return this.rotateOnAxis(_yAxis, angle);
    }

    rotateZ(angle) {
      return this.rotateOnAxis(_zAxis, angle);
    }

    translateOnAxis(axis, distance) {
      // translate object by distance along axis in object space
      // axis is assumed to be normalized

      _v1$4.copy(axis).applyQuaternion(this.quaternion);

      this.position.add(_v1$4.multiplyScalar(distance));

      return this;
    }

    translateX(distance) {
      return this.translateOnAxis(_xAxis, distance);
    }

    translateY(distance) {
      return this.translateOnAxis(_yAxis, distance);
    }

    translateZ(distance) {
      return this.translateOnAxis(_zAxis, distance);
    }

    localToWorld(vector) {
      this.updateWorldMatrix(true, false);

      return vector.applyMatrix4(this.matrixWorld);
    }

    worldToLocal(vector) {
      this.updateWorldMatrix(true, false);

      return vector.applyMatrix4(_m1$1.copy(this.matrixWorld).invert());
    }

    lookAt(x, y, z) {
      // This method does not support objects having non-uniformly-scaled parent(s)

      if (x.isVector3) {
        _target.copy(x);
      } else {
        _target.set(x, y, z);
      }

      const parent = this.parent;

      this.updateWorldMatrix(true, false);

      _position$3.setFromMatrixPosition(this.matrixWorld);

      if (this.isCamera || this.isLight) {
        _m1$1.lookAt(_position$3, _target, this.up);
      } else {
        _m1$1.lookAt(_target, _position$3, this.up);
      }

      this.quaternion.setFromRotationMatrix(_m1$1);

      if (parent) {
        _m1$1.extractRotation(parent.matrixWorld);
        _q1.setFromRotationMatrix(_m1$1);
        this.quaternion.premultiply(_q1.invert());
      }
    }

    add(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.add(arguments[i]);
        }

        return this;
      }

      if (object === this) {
        console.error(
          "THREE.Object3D.add: object can't be added as a child of itself.",
          object
        );
        return this;
      }

      if (object && object.isObject3D) {
        if (object.parent !== null) {
          object.parent.remove(object);
        }

        object.parent = this;
        this.children.push(object);

        object.dispatchEvent(_addedEvent);
      } else {
        console.error(
          "THREE.Object3D.add: object not an instance of THREE.Object3D.",
          object
        );
      }

      return this;
    }

    remove(object) {
      if (arguments.length > 1) {
        for (let i = 0; i < arguments.length; i++) {
          this.remove(arguments[i]);
        }

        return this;
      }

      const index = this.children.indexOf(object);

      if (index !== -1) {
        object.parent = null;
        this.children.splice(index, 1);

        object.dispatchEvent(_removedEvent);
      }

      return this;
    }

    removeFromParent() {
      const parent = this.parent;

      if (parent !== null) {
        parent.remove(this);
      }

      return this;
    }

    clear() {
      for (let i = 0; i < this.children.length; i++) {
        const object = this.children[i];

        object.parent = null;

        object.dispatchEvent(_removedEvent);
      }

      this.children.length = 0;

      return this;
    }

    attach(object) {
      // adds object as a child of this, while maintaining the object's world transform

      // Note: This method does not support scene graphs having non-uniformly-scaled nodes(s)

      this.updateWorldMatrix(true, false);

      _m1$1.copy(this.matrixWorld).invert();

      if (object.parent !== null) {
        object.parent.updateWorldMatrix(true, false);

        _m1$1.multiply(object.parent.matrixWorld);
      }

      object.applyMatrix4(_m1$1);

      this.add(object);

      object.updateWorldMatrix(false, true);

      return this;
    }

    getObjectById(id) {
      return this.getObjectByProperty("id", id);
    }

    getObjectByName(name) {
      return this.getObjectByProperty("name", name);
    }

    getObjectByProperty(name, value) {
      if (this[name] === value) return this;

      for (let i = 0, l = this.children.length; i < l; i++) {
        const child = this.children[i];
        const object = child.getObjectByProperty(name, value);

        if (object !== undefined) {
          return object;
        }
      }

      return undefined;
    }

    getObjectsByProperty(name, value) {
      let result = [];

      if (this[name] === value) result.push(this);

      for (let i = 0, l = this.children.length; i < l; i++) {
        const childResult = this.children[i].getObjectsByProperty(name, value);

        if (childResult.length > 0) {
          result = result.concat(childResult);
        }
      }

      return result;
    }

    getWorldPosition(target) {
      this.updateWorldMatrix(true, false);

      return target.setFromMatrixPosition(this.matrixWorld);
    }

    getWorldQuaternion(target) {
      this.updateWorldMatrix(true, false);

      this.matrixWorld.decompose(_position$3, target, _scale$2);

      return target;
    }

    getWorldScale(target) {
      this.updateWorldMatrix(true, false);

      this.matrixWorld.decompose(_position$3, _quaternion$2, target);

      return target;
    }

    getWorldDirection(target) {
      this.updateWorldMatrix(true, false);

      const e = this.matrixWorld.elements;

      return target.set(e[8], e[9], e[10]).normalize();
    }

    raycast(/* raycaster, intersects */) {}

    traverse(callback) {
      callback(this);

      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverse(callback);
      }
    }

    traverseVisible(callback) {
      if (this.visible === false) return;

      callback(this);

      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        children[i].traverseVisible(callback);
      }
    }

    traverseAncestors(callback) {
      const parent = this.parent;

      if (parent !== null) {
        callback(parent);

        parent.traverseAncestors(callback);
      }
    }

    updateMatrix() {
      this.matrix.compose(this.position, this.quaternion, this.scale);

      this.matrixWorldNeedsUpdate = true;
    }

    updateMatrixWorld(force) {
      if (this.matrixAutoUpdate) this.updateMatrix();

      if (this.matrixWorldNeedsUpdate || force) {
        if (this.parent === null) {
          this.matrixWorld.copy(this.matrix);
        } else {
          this.matrixWorld.multiplyMatrices(
            this.parent.matrixWorld,
            this.matrix
          );
        }

        this.matrixWorldNeedsUpdate = false;

        force = true;
      }

      // update children

      const children = this.children;

      for (let i = 0, l = children.length; i < l; i++) {
        const child = children[i];

        if (child.matrixWorldAutoUpdate === true || force === true) {
          child.updateMatrixWorld(force);
        }
      }
    }

    updateWorldMatrix(updateParents, updateChildren) {
      const parent = this.parent;

      if (
        updateParents === true &&
        parent !== null &&
        parent.matrixWorldAutoUpdate === true
      ) {
        parent.updateWorldMatrix(true, false);
      }

      if (this.matrixAutoUpdate) this.updateMatrix();

      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix);
      }

      // update children

      if (updateChildren === true) {
        const children = this.children;

        for (let i = 0, l = children.length; i < l; i++) {
          const child = children[i];

          if (child.matrixWorldAutoUpdate === true) {
            child.updateWorldMatrix(false, true);
          }
        }
      }
    }

    toJSON(meta) {
      // meta is a string when called from JSON.stringify
      const isRootObject = meta === undefined || typeof meta === "string";

      const output = {};

      // meta is a hash used to collect geometries, materials.
      // not providing it implies that this is the root object
      // being serialized.
      if (isRootObject) {
        // initialize meta obj
        meta = {
          geometries: {},
          materials: {},
          textures: {},
          images: {},
          shapes: {},
          skeletons: {},
          animations: {},
          nodes: {},
        };

        output.metadata = {
          version: 4.6,
          type: "Object",
          generator: "Object3D.toJSON",
        };
      }

      // standard Object3D serialization

      const object = {};

      object.uuid = this.uuid;
      object.type = this.type;

      if (this.name !== "") object.name = this.name;
      if (this.castShadow === true) object.castShadow = true;
      if (this.receiveShadow === true) object.receiveShadow = true;
      if (this.visible === false) object.visible = false;
      if (this.frustumCulled === false) object.frustumCulled = false;
      if (this.renderOrder !== 0) object.renderOrder = this.renderOrder;
      if (Object.keys(this.userData).length > 0)
        object.userData = this.userData;

      object.layers = this.layers.mask;
      object.matrix = this.matrix.toArray();
      object.up = this.up.toArray();

      if (this.matrixAutoUpdate === false) object.matrixAutoUpdate = false;

      // object specific properties

      if (this.isInstancedMesh) {
        object.type = "InstancedMesh";
        object.count = this.count;
        object.instanceMatrix = this.instanceMatrix.toJSON();
        if (this.instanceColor !== null)
          object.instanceColor = this.instanceColor.toJSON();
      }

      //

      function serialize(library, element) {
        if (library[element.uuid] === undefined) {
          library[element.uuid] = element.toJSON(meta);
        }

        return element.uuid;
      }

      if (this.isScene) {
        if (this.background) {
          if (this.background.isColor) {
            object.background = this.background.toJSON();
          } else if (this.background.isTexture) {
            object.background = this.background.toJSON(meta).uuid;
          }
        }

        if (
          this.environment &&
          this.environment.isTexture &&
          this.environment.isRenderTargetTexture !== true
        ) {
          object.environment = this.environment.toJSON(meta).uuid;
        }
      } else if (this.isMesh || this.isLine || this.isPoints) {
        object.geometry = serialize(meta.geometries, this.geometry);

        const parameters = this.geometry.parameters;

        if (parameters !== undefined && parameters.shapes !== undefined) {
          const shapes = parameters.shapes;

          if (Array.isArray(shapes)) {
            for (let i = 0, l = shapes.length; i < l; i++) {
              const shape = shapes[i];

              serialize(meta.shapes, shape);
            }
          } else {
            serialize(meta.shapes, shapes);
          }
        }
      }

      if (this.isSkinnedMesh) {
        object.bindMode = this.bindMode;
        object.bindMatrix = this.bindMatrix.toArray();

        if (this.skeleton !== undefined) {
          serialize(meta.skeletons, this.skeleton);

          object.skeleton = this.skeleton.uuid;
        }
      }

      if (this.material !== undefined) {
        if (Array.isArray(this.material)) {
          const uuids = [];

          for (let i = 0, l = this.material.length; i < l; i++) {
            uuids.push(serialize(meta.materials, this.material[i]));
          }

          object.material = uuids;
        } else {
          object.material = serialize(meta.materials, this.material);
        }
      }

      //

      if (this.children.length > 0) {
        object.children = [];

        for (let i = 0; i < this.children.length; i++) {
          object.children.push(this.children[i].toJSON(meta).object);
        }
      }

      //

      if (this.animations.length > 0) {
        object.animations = [];

        for (let i = 0; i < this.animations.length; i++) {
          const animation = this.animations[i];

          object.animations.push(serialize(meta.animations, animation));
        }
      }

      if (isRootObject) {
        const geometries = extractFromCache(meta.geometries);
        const materials = extractFromCache(meta.materials);
        const textures = extractFromCache(meta.textures);
        const images = extractFromCache(meta.images);
        const shapes = extractFromCache(meta.shapes);
        const skeletons = extractFromCache(meta.skeletons);
        const animations = extractFromCache(meta.animations);
        const nodes = extractFromCache(meta.nodes);

        if (geometries.length > 0) output.geometries = geometries;
        if (materials.length > 0) output.materials = materials;
        if (textures.length > 0) output.textures = textures;
        if (images.length > 0) output.images = images;
        if (shapes.length > 0) output.shapes = shapes;
        if (skeletons.length > 0) output.skeletons = skeletons;
        if (animations.length > 0) output.animations = animations;
        if (nodes.length > 0) output.nodes = nodes;
      }

      output.object = object;

      return output;

      // extract data from the cache hash
      // remove metadata on each item
      // and return as array
      function extractFromCache(cache) {
        const values = [];
        for (const key in cache) {
          const data = cache[key];
          delete data.metadata;
          values.push(data);
        }

        return values;
      }
    }

    clone(recursive) {
      return new this.constructor().copy(this, recursive);
    }

    copy(source, recursive = true) {
      this.name = source.name;

      this.up.copy(source.up);

      this.position.copy(source.position);
      this.rotation.order = source.rotation.order;
      this.quaternion.copy(source.quaternion);
      this.scale.copy(source.scale);

      this.matrix.copy(source.matrix);
      this.matrixWorld.copy(source.matrixWorld);

      this.matrixAutoUpdate = source.matrixAutoUpdate;
      this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

      this.matrixWorldAutoUpdate = source.matrixWorldAutoUpdate;

      this.layers.mask = source.layers.mask;
      this.visible = source.visible;

      this.castShadow = source.castShadow;
      this.receiveShadow = source.receiveShadow;

      this.frustumCulled = source.frustumCulled;
      this.renderOrder = source.renderOrder;

      this.animations = source.animations.slice();

      this.userData = JSON.parse(JSON.stringify(source.userData));

      if (recursive === true) {
        for (let i = 0; i < source.children.length; i++) {
          const child = source.children[i];
          this.add(child.clone());
        }
      }

      return this;
    }
  }

  Object3D.DEFAULT_UP = /*@__PURE__*/ new Vector3(0, 1, 0);
  Object3D.DEFAULT_MATRIX_AUTO_UPDATE = true;
  Object3D.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = true;

  const _v0$1 = /*@__PURE__*/ new Vector3();
  const _v1$3 = /*@__PURE__*/ new Vector3();
  const _v2$2 = /*@__PURE__*/ new Vector3();
  const _v3$1 = /*@__PURE__*/ new Vector3();

  const _vab = /*@__PURE__*/ new Vector3();
  const _vac = /*@__PURE__*/ new Vector3();
  const _vbc = /*@__PURE__*/ new Vector3();
  const _vap = /*@__PURE__*/ new Vector3();
  const _vbp = /*@__PURE__*/ new Vector3();
  const _vcp = /*@__PURE__*/ new Vector3();

  let warnedGetUV = false;

  class Triangle {
    constructor(a = new Vector3(), b = new Vector3(), c = new Vector3()) {
      this.a = a;
      this.b = b;
      this.c = c;
    }

    static getNormal(a, b, c, target) {
      target.subVectors(c, b);
      _v0$1.subVectors(a, b);
      target.cross(_v0$1);

      const targetLengthSq = target.lengthSq();
      if (targetLengthSq > 0) {
        return target.multiplyScalar(1 / Math.sqrt(targetLengthSq));
      }

      return target.set(0, 0, 0);
    }

    // static/instance method to calculate barycentric coordinates
    // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
    static getBarycoord(point, a, b, c, target) {
      _v0$1.subVectors(c, a);
      _v1$3.subVectors(b, a);
      _v2$2.subVectors(point, a);

      const dot00 = _v0$1.dot(_v0$1);
      const dot01 = _v0$1.dot(_v1$3);
      const dot02 = _v0$1.dot(_v2$2);
      const dot11 = _v1$3.dot(_v1$3);
      const dot12 = _v1$3.dot(_v2$2);

      const denom = dot00 * dot11 - dot01 * dot01;

      // collinear or singular triangle
      if (denom === 0) {
        // arbitrary location outside of triangle?
        // not sure if this is the best idea, maybe should be returning undefined
        return target.set(-2, -1, -1);
      }

      const invDenom = 1 / denom;
      const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
      const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

      // barycentric coordinates must always sum to 1
      return target.set(1 - u - v, v, u);
    }

    static containsPoint(point, a, b, c) {
      this.getBarycoord(point, a, b, c, _v3$1);

      return _v3$1.x >= 0 && _v3$1.y >= 0 && _v3$1.x + _v3$1.y <= 1;
    }

    static getUV(point, p1, p2, p3, uv1, uv2, uv3, target) {
      // @deprecated, r151

      if (warnedGetUV === false) {
        console.warn(
          "THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."
        );

        warnedGetUV = true;
      }

      return this.getInterpolation(point, p1, p2, p3, uv1, uv2, uv3, target);
    }

    static getInterpolation(point, p1, p2, p3, v1, v2, v3, target) {
      this.getBarycoord(point, p1, p2, p3, _v3$1);

      target.setScalar(0);
      target.addScaledVector(v1, _v3$1.x);
      target.addScaledVector(v2, _v3$1.y);
      target.addScaledVector(v3, _v3$1.z);

      return target;
    }

    static isFrontFacing(a, b, c, direction) {
      _v0$1.subVectors(c, b);
      _v1$3.subVectors(a, b);

      // strictly front facing
      return _v0$1.cross(_v1$3).dot(direction) < 0 ? true : false;
    }

    set(a, b, c) {
      this.a.copy(a);
      this.b.copy(b);
      this.c.copy(c);

      return this;
    }

    setFromPointsAndIndices(points, i0, i1, i2) {
      this.a.copy(points[i0]);
      this.b.copy(points[i1]);
      this.c.copy(points[i2]);

      return this;
    }

    setFromAttributeAndIndices(attribute, i0, i1, i2) {
      this.a.fromBufferAttribute(attribute, i0);
      this.b.fromBufferAttribute(attribute, i1);
      this.c.fromBufferAttribute(attribute, i2);

      return this;
    }

    clone() {
      return new this.constructor().copy(this);
    }

    copy(triangle) {
      this.a.copy(triangle.a);
      this.b.copy(triangle.b);
      this.c.copy(triangle.c);

      return this;
    }

    getArea() {
      _v0$1.subVectors(this.c, this.b);
      _v1$3.subVectors(this.a, this.b);

      return _v0$1.cross(_v1$3).length() * 0.5;
    }

    getMidpoint(target) {
      return target
        .addVectors(this.a, this.b)
        .add(this.c)
        .multiplyScalar(1 / 3);
    }

    getNormal(target) {
      return Triangle.getNormal(this.a, this.b, this.c, target);
    }

    getPlane(target) {
      return target.setFromCoplanarPoints(this.a, this.b, this.c);
    }

    getBarycoord(point, target) {
      return Triangle.getBarycoord(point, this.a, this.b, this.c, target);
    }

    getUV(point, uv1, uv2, uv3, target) {
      // @deprecated, r151

      if (warnedGetUV === false) {
        console.warn(
          "THREE.Triangle.getUV() has been renamed to THREE.Triangle.getInterpolation()."
        );

        warnedGetUV = true;
      }

      return Triangle.getInterpolation(
        point,
        this.a,
        this.b,
        this.c,
        uv1,
        uv2,
        uv3,
        target
      );
    }

    getInterpolation(point, v1, v2, v3, target) {
      return Triangle.getInterpolation(
        point,
        this.a,
        this.b,
        this.c,
        v1,
        v2,
        v3,
        target
      );
    }

    containsPoint(point) {
      return Triangle.containsPoint(point, this.a, this.b, this.c);
    }

    isFrontFacing(direction) {
      return Triangle.isFrontFacing(this.a, this.b, this.c, direction);
    }

    intersectsBox(box) {
      return box.intersectsTriangle(this);
    }

    closestPointToPoint(p, target) {
      const a = this.a,
        b = this.b,
        c = this.c;
      let v, w;

      // algorithm thanks to Real-Time Collision Detection by Christer Ericson,
      // published by Morgan Kaufmann Publishers, (c) 2005 Elsevier Inc.,
      // under the accompanying license; see chapter 5.1.5 for detailed explanation.
      // basically, we're distinguishing which of the voronoi regions of the triangle
      // the point lies in with the minimum amount of redundant computation.

      _vab.subVectors(b, a);
      _vac.subVectors(c, a);
      _vap.subVectors(p, a);
      const d1 = _vab.dot(_vap);
      const d2 = _vac.dot(_vap);
      if (d1 <= 0 && d2 <= 0) {
        // vertex region of A; barycentric coords (1, 0, 0)
        return target.copy(a);
      }

      _vbp.subVectors(p, b);
      const d3 = _vab.dot(_vbp);
      const d4 = _vac.dot(_vbp);
      if (d3 >= 0 && d4 <= d3) {
        // vertex region of B; barycentric coords (0, 1, 0)
        return target.copy(b);
      }

      const vc = d1 * d4 - d3 * d2;
      if (vc <= 0 && d1 >= 0 && d3 <= 0) {
        v = d1 / (d1 - d3);
        // edge region of AB; barycentric coords (1-v, v, 0)
        return target.copy(a).addScaledVector(_vab, v);
      }

      _vcp.subVectors(p, c);
      const d5 = _vab.dot(_vcp);
      const d6 = _vac.dot(_vcp);
      if (d6 >= 0 && d5 <= d6) {
        // vertex region of C; barycentric coords (0, 0, 1)
        return target.copy(c);
      }

      const vb = d5 * d2 - d1 * d6;
      if (vb <= 0 && d2 >= 0 && d6 <= 0) {
        w = d2 / (d2 - d6);
        // edge region of AC; barycentric coords (1-w, 0, w)
        return target.copy(a).addScaledVector(_vac, w);
      }

      const va = d3 * d6 - d5 * d4;
      if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) {
        _vbc.subVectors(c, b);
        w = (d4 - d3) / (d4 - d3 + (d5 - d6));
        // edge region of BC; barycentric coords (0, 1-w, w)
        return target.copy(b).addScaledVector(_vbc, w); // edge region of BC
      }

      // face region
      const denom = 1 / (va + vb + vc);
      // u = va * denom
      v = vb * denom;
      w = vc * denom;

      return target.copy(a).addScaledVector(_vab, v).addScaledVector(_vac, w);
    }

    equals(triangle) {
      return (
        triangle.a.equals(this.a) &&
        triangle.b.equals(this.b) &&
        triangle.c.equals(this.c)
      );
    }
  }

  let materialId = 0;

  class Material extends EventDispatcher {
    constructor() {
      super();

      this.isMaterial = true;

      Object.defineProperty(this, "id", { value: materialId++ });

      this.uuid = generateUUID();

      this.name = "";
      this.type = "Material";

      this.blending = NormalBlending;
      this.side = FrontSide;
      this.vertexColors = false;

      this.opacity = 1;
      this.transparent = false;
      this.alphaHash = false;

      this.blendSrc = SrcAlphaFactor;
      this.blendDst = OneMinusSrcAlphaFactor;
      this.blendEquation = AddEquation;
      this.blendSrcAlpha = null;
      this.blendDstAlpha = null;
      this.blendEquationAlpha = null;

      this.depthFunc = LessEqualDepth;
      this.depthTest = true;
      this.depthWrite = true;

      this.stencilWriteMask = 0xff;
      this.stencilFunc = AlwaysStencilFunc;
      this.stencilRef = 0;
      this.stencilFuncMask = 0xff;
      this.stencilFail = KeepStencilOp;
      this.stencilZFail = KeepStencilOp;
      this.stencilZPass = KeepStencilOp;
      this.stencilWrite = false;

      this.clippingPlanes = null;
      this.clipIntersection = false;
      this.clipShadows = false;

      this.shadowSide = null;

      this.colorWrite = true;

      this.precision = null; // override the renderer's default precision for this material

      this.polygonOffset = false;
      this.polygonOffsetFactor = 0;
      this.polygonOffsetUnits = 0;

      this.dithering = false;

      this.alphaToCoverage = false;
      this.premultipliedAlpha = false;
      this.forceSinglePass = false;

      this.visible = true;

      this.toneMapped = true;

      this.userData = {};

      this.version = 0;

      this._alphaTest = 0;
    }

    get alphaTest() {
      return this._alphaTest;
    }

    set alphaTest(value) {
      if (this._alphaTest > 0 !== value > 0) {
        this.version++;
      }

      this._alphaTest = value;
    }

    onBuild(/* shaderobject, renderer */) {}

    onBeforeRender(/* renderer, scene, camera, geometry, object, group */) {}

    onBeforeCompile(/* shaderobject, renderer */) {}

    customProgramCacheKey() {
      return this.onBeforeCompile.toString();
    }

    setValues(values) {
      if (values === undefined) return;

      for (const key in values) {
        const newValue = values[key];

        if (newValue === undefined) {
          console.warn(
            `THREE.Material: parameter '${key}' has value of undefined.`
          );
          continue;
        }

        const currentValue = this[key];

        if (currentValue === undefined) {
          console.warn(
            `THREE.Material: '${key}' is not a property of THREE.${this.type}.`
          );
          continue;
        }

        if (currentValue && currentValue.isColor) {
          currentValue.set(newValue);
        } else if (
          currentValue &&
          currentValue.isVector3 &&
          newValue &&
          newValue.isVector3
        ) {
          currentValue.copy(newValue);
        } else {
          this[key] = newValue;
        }
      }
    }

    toJSON(meta) {
      const isRootObject = meta === undefined || typeof meta === "string";

      if (isRootObject) {
        meta = {
          textures: {},
          images: {},
        };
      }

      const data = {
        metadata: {
          version: 4.6,
          type: "Material",
          generator: "Material.toJSON",
        },
      };

      // standard Material serialization
      data.uuid = this.uuid;
      data.type = this.type;

      if (this.name !== "") data.name = this.name;

      if (this.color && this.color.isColor) data.color = this.color.getHex();

      if (this.roughness !== undefined) data.roughness = this.roughness;
      if (this.metalness !== undefined) data.metalness = this.metalness;

      if (this.sheen !== undefined) data.sheen = this.sheen;
      if (this.sheenColor && this.sheenColor.isColor)
        data.sheenColor = this.sheenColor.getHex();
      if (this.sheenRoughness !== undefined)
        data.sheenRoughness = this.sheenRoughness;
      if (this.emissive && this.emissive.isColor)
        data.emissive = this.emissive.getHex();
      if (this.emissiveIntensity && this.emissiveIntensity !== 1)
        data.emissiveIntensity = this.emissiveIntensity;

      if (this.specular && this.specular.isColor)
        data.specular = this.specular.getHex();
      if (this.specularIntensity !== undefined)
        data.specularIntensity = this.specularIntensity;
      if (this.specularColor && this.specularColor.isColor)
        data.specularColor = this.specularColor.getHex();
      if (this.shininess !== undefined) data.shininess = this.shininess;
      if (this.clearcoat !== undefined) data.clearcoat = this.clearcoat;
      if (this.clearcoatRoughness !== undefined)
        data.clearcoatRoughness = this.clearcoatRoughness;

      if (this.clearcoatMap && this.clearcoatMap.isTexture) {
        data.clearcoatMap = this.clearcoatMap.toJSON(meta).uuid;
      }

      if (this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture) {
        data.clearcoatRoughnessMap =
          this.clearcoatRoughnessMap.toJSON(meta).uuid;
      }

      if (this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture) {
        data.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(meta).uuid;
        data.clearcoatNormalScale = this.clearcoatNormalScale.toArray();
      }

      if (this.iridescence !== undefined) data.iridescence = this.iridescence;
      if (this.iridescenceIOR !== undefined)
        data.iridescenceIOR = this.iridescenceIOR;
      if (this.iridescenceThicknessRange !== undefined)
        data.iridescenceThicknessRange = this.iridescenceThicknessRange;

      if (this.iridescenceMap && this.iridescenceMap.isTexture) {
        data.iridescenceMap = this.iridescenceMap.toJSON(meta).uuid;
      }

      if (
        this.iridescenceThicknessMap &&
        this.iridescenceThicknessMap.isTexture
      ) {
        data.iridescenceThicknessMap =
          this.iridescenceThicknessMap.toJSON(meta).uuid;
      }

      if (this.anisotropy !== undefined) data.anisotropy = this.anisotropy;
      if (this.anisotropyRotation !== undefined)
        data.anisotropyRotation = this.anisotropyRotation;

      if (this.anisotropyMap && this.anisotropyMap.isTexture) {
        data.anisotropyMap = this.anisotropyMap.toJSON(meta).uuid;
      }

      if (this.map && this.map.isTexture) data.map = this.map.toJSON(meta).uuid;
      if (this.matcap && this.matcap.isTexture)
        data.matcap = this.matcap.toJSON(meta).uuid;
      if (this.alphaMap && this.alphaMap.isTexture)
        data.alphaMap = this.alphaMap.toJSON(meta).uuid;

      if (this.lightMap && this.lightMap.isTexture) {
        data.lightMap = this.lightMap.toJSON(meta).uuid;
        data.lightMapIntensity = this.lightMapIntensity;
      }

      if (this.aoMap && this.aoMap.isTexture) {
        data.aoMap = this.aoMap.toJSON(meta).uuid;
        data.aoMapIntensity = this.aoMapIntensity;
      }

      if (this.bumpMap && this.bumpMap.isTexture) {
        data.bumpMap = this.bumpMap.toJSON(meta).uuid;
        data.bumpScale = this.bumpScale;
      }

      if (this.normalMap && this.normalMap.isTexture) {
        data.normalMap = this.normalMap.toJSON(meta).uuid;
        data.normalMapType = this.normalMapType;
        data.normalScale = this.normalScale.toArray();
      }

      if (this.displacementMap && this.displacementMap.isTexture) {
        data.displacementMap = this.displacementMap.toJSON(meta).uuid;
        data.displacementScale = this.displacementScale;
        data.displacementBias = this.displacementBias;
      }

      if (this.roughnessMap && this.roughnessMap.isTexture)
        data.roughnessMap = this.roughnessMap.toJSON(meta).uuid;
      if (this.metalnessMap && this.metalnessMap.isTexture)
        data.metalnessMap = this.metalnessMap.toJSON(meta).uuid;

      if (this.emissiveMap && this.emissiveMap.isTexture)
        data.emissiveMap = this.emissiveMap.toJSON(meta).uuid;
      if (this.specularMap && this.specularMap.isTexture)
        data.specularMap = this.specularMap.toJSON(meta).uuid;
      if (this.specularIntensityMap && this.specularIntensityMap.isTexture)
        data.specularIntensityMap = this.specularIntensityMap.toJSON(meta).uuid;
      if (this.specularColorMap && this.specularColorMap.isTexture)
        data.specularColorMap = this.specularColorMap.toJSON(meta).uuid;

      if (this.envMap && this.envMap.isTexture) {
        data.envMap = this.envMap.toJSON(meta).uuid;

        if (this.combine !== undefined) data.combine = this.combine;
      }

      if (this.envMapIntensity !== undefined)
        data.envMapIntensity = this.envMapIntensity;
      if (this.reflectivity !== undefined)
        data.reflectivity = this.reflectivity;
      if (this.refractionRatio !== undefined)
        data.refractionRatio = this.refractionRatio;

      if (this.gradientMap && this.gradientMap.isTexture) {
        data.gradientMap = this.gradientMap.toJSON(meta).uuid;
      }

      if (this.transmission !== undefined)
        data.transmission = this.transmission;
      if (this.transmissionMap && this.transmissionMap.isTexture)
        data.transmissionMap = this.transmissionMap.toJSON(meta).uuid;
      if (this.thickness !== undefined) data.thickness = this.thickness;
      if (this.thicknessMap && this.thicknessMap.isTexture)
        data.thicknessMap = this.thicknessMap.toJSON(meta).uuid;
      if (
        this.attenuationDistance !== undefined &&
        this.attenuationDistance !== Infinity
      )
        data.attenuationDistance = this.attenuationDistance;
      if (this.attenuationColor !== undefined)
        data.attenuationColor = this.attenuationColor.getHex();

      if (this.size !== undefined) data.size = this.size;
      if (this.shadowSide !== null) data.shadowSide = this.shadowSide;
      if (this.sizeAttenuation !== undefined)
        data.sizeAttenuation = this.sizeAttenuation;

      if (this.blending !== NormalBlending) data.blending = this.blending;
      if (this.side !== FrontSide) data.side = this.side;
      if (this.vertexColors) data.vertexColors = true;

      if (this.opacity < 1) data.opacity = this.opacity;
      if (this.transparent === true) data.transparent = this.transparent;

      data.depthFunc = this.depthFunc;
      data.depthTest = this.depthTest;
      data.depthWrite = this.depthWrite;
      data.colorWrite = this.colorWrite;

      data.stencilWrite = this.stencilWrite;
      data.stencilWriteMask = this.stencilWriteMask;
      data.stencilFunc = this.stencilFunc;
      data.stencilRef = this.stencilRef;
      data.stencilFuncMask = this.stencilFuncMask;
      data.stencilFail = this.stencilFail;
      data.stencilZFail = this.stencilZFail;
      data.stencilZPass = this.stencilZPass;

      // rotation (SpriteMaterial)
      if (this.rotation !== undefined && this.rotation !== 0)
        data.rotation = this.rotation;

      if (this.polygonOffset === true) data.polygonOffset = true;
      if (this.polygonOffsetFactor !== 0)
        data.polygonOffsetFactor = this.polygonOffsetFactor;
      if (this.polygonOffsetUnits !== 0)
        data.polygonOffsetUnits = this.polygonOffsetUnits;

      if (this.linewidth !== undefined && this.linewidth !== 1)
        data.linewidth = this.linewidth;
      if (this.dashSize !== undefined) data.dashSize = this.dashSize;
      if (this.gapSize !== undefined) data.gapSize = this.gapSize;
      if (this.scale !== undefined) data.scale = this.scale;

      if (this.dithering === true) data.dithering = true;

      if (this.alphaTest > 0) data.alphaTest = this.alphaTest;
      if (this.alphaHash === true) data.alphaHash = this.alphaHash;
      if (this.alphaToCoverage === true)
        data.alphaToCoverage = this.alphaToCoverage;
      if (this.premultipliedAlpha === true)
        data.premultipliedAlpha = this.premultipliedAlpha;
      if (this.forceSinglePass === true)
        data.forceSinglePass = this.forceSinglePass;

      if (this.wireframe === true) data.wireframe = this.wireframe;
      if (this.wireframeLinewidth > 1)
        data.wireframeLinewidth = this.wireframeLinewidth;
      if (this.wireframeLinecap !== "round")
        data.wireframeLinecap = this.wireframeLinecap;
      if (this.wireframeLinejoin !== "round")
        data.wireframeLinejoin = this.wireframeLinejoin;

      if (this.flatShading === true) data.flatShading = this.flatShading;

      if (this.visible === false) data.visible = false;

      if (this.toneMapped === false) data.toneMapped = false;

      if (this.fog === false) data.fog = false;

      if (Object.keys(this.userData).length > 0) data.userData = this.userData;

      // TODO: Copied from Object3D.toJSON

      function extractFromCache(cache) {
        const values = [];

        for (const key in cache) {
          const data = cache[key];
          delete data.metadata;
          values.push(data);
        }

        return values;
      }

      if (isRootObject) {
        const textures = extractFromCache(meta.textures);
        const images = extractFromCache(meta.images);

        if (textures.length > 0) data.textures = textures;
        if (images.length > 0) data.images = images;
      }

      return data;
    }

    clone() {
      return new this.constructor().copy(this);
    }

    copy(source) {
      this.name = source.name;

      this.blending = source.blending;
      this.side = source.side;
      this.vertexColors = source.vertexColors;

      this.opacity = source.opacity;
      this.transparent = source.transparent;

      this.blendSrc = source.blendSrc;
      this.blendDst = source.blendDst;
      this.blendEquation = source.blendEquation;
      this.blendSrcAlpha = source.blendSrcAlpha;
      this.blendDstAlpha = source.blendDstAlpha;
      this.blendEquationAlpha = source.blendEquationAlpha;

      this.depthFunc = source.depthFunc;
      this.depthTest = source.depthTest;
      this.depthWrite = source.depthWrite;

      this.stencilWriteMask = source.stencilWriteMask;
      this.stencilFunc = source.stencilFunc;
      this.stencilRef = source.stencilRef;
      this.stencilFuncMask = source.stencilFuncMask;
      this.stencilFail = source.stencilFail;
      this.stencilZFail = source.stencilZFail;
      this.stencilZPass = source.stencilZPass;
      this.stencilWrite = source.stencilWrite;

      const srcPlanes = source.clippingPlanes;
      let dstPlanes = null;

      if (srcPlanes !== null) {
        const n = srcPlanes.length;
        dstPlanes = new Array(n);

        for (let i = 0; i !== n; ++i) {
          dstPlanes[i] = srcPlanes[i].clone();
        }
      }

      this.clippingPlanes = dstPlanes;
      this.clipIntersection = source.clipIntersection;
      this.clipShadows = source.clipShadows;

      this.shadowSide = source.shadowSide;

      this.colorWrite = source.colorWrite;

      this.precision = source.precision;

      this.polygonOffset = source.polygonOffset;
      this.polygonOffsetFactor = source.polygonOffsetFactor;
      this.polygonOffsetUnits = source.polygonOffsetUnits;

      this.dithering = source.dithering;

      this.alphaTest = source.alphaTest;
      this.alphaHash = source.alphaHash;
      this.alphaToCoverage = source.alphaToCoverage;
      this.premultipliedAlpha = source.premultipliedAlpha;
      this.forceSinglePass = source.forceSinglePass;

      this.visible = source.visible;

      this.toneMapped = source.toneMapped;

      this.userData = JSON.parse(JSON.stringify(source.userData));

      return this;
    }

    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }

    set needsUpdate(value) {
      if (value === true) this.version++;
    }
  }

  const _colorKeywords = {
    aliceblue: 0xf0f8ff,
    antiquewhite: 0xfaebd7,
    aqua: 0x00ffff,
    aquamarine: 0x7fffd4,
    azure: 0xf0ffff,
    beige: 0xf5f5dc,
    bisque: 0xffe4c4,
    black: 0x000000,
    blanchedalmond: 0xffebcd,
    blue: 0x0000ff,
    blueviolet: 0x8a2be2,
    brown: 0xa52a2a,
    burlywood: 0xdeb887,
    cadetblue: 0x5f9ea0,
    chartreuse: 0x7fff00,
    chocolate: 0xd2691e,
    coral: 0xff7f50,
    cornflowerblue: 0x6495ed,
    cornsilk: 0xfff8dc,
    crimson: 0xdc143c,
    cyan: 0x00ffff,
    darkblue: 0x00008b,
    darkcyan: 0x008b8b,
    darkgoldenrod: 0xb8860b,
    darkgray: 0xa9a9a9,
    darkgreen: 0x006400,
    darkgrey: 0xa9a9a9,
    darkkhaki: 0xbdb76b,
    darkmagenta: 0x8b008b,
    darkolivegreen: 0x556b2f,
    darkorange: 0xff8c00,
    darkorchid: 0x9932cc,
    darkred: 0x8b0000,
    darksalmon: 0xe9967a,
    darkseagreen: 0x8fbc8f,
    darkslateblue: 0x483d8b,
    darkslategray: 0x2f4f4f,
    darkslategrey: 0x2f4f4f,
    darkturquoise: 0x00ced1,
    darkviolet: 0x9400d3,
    deeppink: 0xff1493,
    deepskyblue: 0x00bfff,
    dimgray: 0x696969,
    dimgrey: 0x696969,
    dodgerblue: 0x1e90ff,
    firebrick: 0xb22222,
    floralwhite: 0xfffaf0,
    forestgreen: 0x228b22,
    fuchsia: 0xff00ff,
    gainsboro: 0xdcdcdc,
    ghostwhite: 0xf8f8ff,
    gold: 0xffd700,
    goldenrod: 0xdaa520,
    gray: 0x808080,
    green: 0x008000,
    greenyellow: 0xadff2f,
    grey: 0x808080,
    honeydew: 0xf0fff0,
    hotpink: 0xff69b4,
    indianred: 0xcd5c5c,
    indigo: 0x4b0082,
    ivory: 0xfffff0,
    khaki: 0xf0e68c,
    lavender: 0xe6e6fa,
    lavenderblush: 0xfff0f5,
    lawngreen: 0x7cfc00,
    lemonchiffon: 0xfffacd,
    lightblue: 0xadd8e6,
    lightcoral: 0xf08080,
    lightcyan: 0xe0ffff,
    lightgoldenrodyellow: 0xfafad2,
    lightgray: 0xd3d3d3,
    lightgreen: 0x90ee90,
    lightgrey: 0xd3d3d3,
    lightpink: 0xffb6c1,
    lightsalmon: 0xffa07a,
    lightseagreen: 0x20b2aa,
    lightskyblue: 0x87cefa,
    lightslategray: 0x778899,
    lightslategrey: 0x778899,
    lightsteelblue: 0xb0c4de,
    lightyellow: 0xffffe0,
    lime: 0x00ff00,
    limegreen: 0x32cd32,
    linen: 0xfaf0e6,
    magenta: 0xff00ff,
    maroon: 0x800000,
    mediumaquamarine: 0x66cdaa,
    mediumblue: 0x0000cd,
    mediumorchid: 0xba55d3,
    mediumpurple: 0x9370db,
    mediumseagreen: 0x3cb371,
    mediumslateblue: 0x7b68ee,
    mediumspringgreen: 0x00fa9a,
    mediumturquoise: 0x48d1cc,
    mediumvioletred: 0xc71585,
    midnightblue: 0x191970,
    mintcream: 0xf5fffa,
    mistyrose: 0xffe4e1,
    moccasin: 0xffe4b5,
    navajowhite: 0xffdead,
    navy: 0x000080,
    oldlace: 0xfdf5e6,
    olive: 0x808000,
    olivedrab: 0x6b8e23,
    orange: 0xffa500,
    orangered: 0xff4500,
    orchid: 0xda70d6,
    palegoldenrod: 0xeee8aa,
    palegreen: 0x98fb98,
    paleturquoise: 0xafeeee,
    palevioletred: 0xdb7093,
    papayawhip: 0xffefd5,
    peachpuff: 0xffdab9,
    peru: 0xcd853f,
    pink: 0xffc0cb,
    plum: 0xdda0dd,
    powderblue: 0xb0e0e6,
    purple: 0x800080,
    rebeccapurple: 0x663399,
    red: 0xff0000,
    rosybrown: 0xbc8f8f,
    royalblue: 0x4169e1,
    saddlebrown: 0x8b4513,
    salmon: 0xfa8072,
    sandybrown: 0xf4a460,
    seagreen: 0x2e8b57,
    seashell: 0xfff5ee,
    sienna: 0xa0522d,
    silver: 0xc0c0c0,
    skyblue: 0x87ceeb,
    slateblue: 0x6a5acd,
    slategray: 0x708090,
    slategrey: 0x708090,
    snow: 0xfffafa,
    springgreen: 0x00ff7f,
    steelblue: 0x4682b4,
    tan: 0xd2b48c,
    teal: 0x008080,
    thistle: 0xd8bfd8,
    tomato: 0xff6347,
    turquoise: 0x40e0d0,
    violet: 0xee82ee,
    wheat: 0xf5deb3,
    white: 0xffffff,
    whitesmoke: 0xf5f5f5,
    yellow: 0xffff00,
    yellowgreen: 0x9acd32,
  };

  const _hslA = { h: 0, s: 0, l: 0 };
  const _hslB = { h: 0, s: 0, l: 0 };

  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * 6 * (2 / 3 - t);
    return p;
  }

  class Color {
    constructor(r, g, b) {
      this.isColor = true;

      this.r = 1;
      this.g = 1;
      this.b = 1;

      return this.set(r, g, b);
    }

    set(r, g, b) {
      if (g === undefined && b === undefined) {
        // r is THREE.Color, hex or string

        const value = r;

        if (value && value.isColor) {
          this.copy(value);
        } else if (typeof value === "number") {
          this.setHex(value);
        } else if (typeof value === "string") {
          this.setStyle(value);
        }
      } else {
        this.setRGB(r, g, b);
      }

      return this;
    }

    setScalar(scalar) {
      this.r = scalar;
      this.g = scalar;
      this.b = scalar;

      return this;
    }

    setHex(hex, colorSpace = SRGBColorSpace) {
      hex = Math.floor(hex);

      this.r = ((hex >> 16) & 255) / 255;
      this.g = ((hex >> 8) & 255) / 255;
      this.b = (hex & 255) / 255;

      ColorManagement.toWorkingColorSpace(this, colorSpace);

      return this;
    }

    setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
      this.r = r;
      this.g = g;
      this.b = b;

      ColorManagement.toWorkingColorSpace(this, colorSpace);

      return this;
    }

    setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
      // h,s,l ranges are in 0.0 - 1.0
      h = euclideanModulo(h, 1);
      s = clamp(s, 0, 1);
      l = clamp(l, 0, 1);

      if (s === 0) {
        this.r = this.g = this.b = l;
      } else {
        const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
        const q = 2 * l - p;

        this.r = hue2rgb(q, p, h + 1 / 3);
        this.g = hue2rgb(q, p, h);
        this.b = hue2rgb(q, p, h - 1 / 3);
      }

      ColorManagement.toWorkingColorSpace(this, colorSpace);

      return this;
    }

    setStyle(style, colorSpace = SRGBColorSpace) {
      function handleAlpha(string) {
        if (string === undefined) return;

        if (parseFloat(string) < 1) {
          console.warn(
            "THREE.Color: Alpha component of " + style + " will be ignored."
          );
        }
      }

      let m;

      if ((m = /^(\w+)\(([^\)]*)\)/.exec(style))) {
        // rgb / hsl

        let color;
        const name = m[1];
        const components = m[2];

        switch (name) {
          case "rgb":
          case "rgba":
            if (
              (color =
                /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  components
                ))
            ) {
              // rgb(255,0,0) rgba(255,0,0,0.5)

              handleAlpha(color[4]);

              return this.setRGB(
                Math.min(255, parseInt(color[1], 10)) / 255,
                Math.min(255, parseInt(color[2], 10)) / 255,
                Math.min(255, parseInt(color[3], 10)) / 255,
                colorSpace
              );
            }

            if (
              (color =
                /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  components
                ))
            ) {
              // rgb(100%,0%,0%) rgba(100%,0%,0%,0.5)

              handleAlpha(color[4]);

              return this.setRGB(
                Math.min(100, parseInt(color[1], 10)) / 100,
                Math.min(100, parseInt(color[2], 10)) / 100,
                Math.min(100, parseInt(color[3], 10)) / 100,
                colorSpace
              );
            }

            break;

          case "hsl":
          case "hsla":
            if (
              (color =
                /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(
                  components
                ))
            ) {
              // hsl(120,50%,50%) hsla(120,50%,50%,0.5)

              handleAlpha(color[4]);

              return this.setHSL(
                parseFloat(color[1]) / 360,
                parseFloat(color[2]) / 100,
                parseFloat(color[3]) / 100,
                colorSpace
              );
            }

            break;

          default:
            console.warn("THREE.Color: Unknown color model " + style);
        }
      } else if ((m = /^\#([A-Fa-f\d]+)$/.exec(style))) {
        // hex color

        const hex = m[1];
        const size = hex.length;

        if (size === 3) {
          // #ff0
          return this.setRGB(
            parseInt(hex.charAt(0), 16) / 15,
            parseInt(hex.charAt(1), 16) / 15,
            parseInt(hex.charAt(2), 16) / 15,
            colorSpace
          );
        } else if (size === 6) {
          // #ff0000
          return this.setHex(parseInt(hex, 16), colorSpace);
        } else {
          console.warn("THREE.Color: Invalid hex color " + style);
        }
      } else if (style && style.length > 0) {
        return this.setColorName(style, colorSpace);
      }

      return this;
    }

    setColorName(style, colorSpace = SRGBColorSpace) {
      // color keywords
      const hex = _colorKeywords[style.toLowerCase()];

      if (hex !== undefined) {
        // red
        this.setHex(hex, colorSpace);
      } else {
        // unknown color
        console.warn("THREE.Color: Unknown color " + style);
      }

      return this;
    }

    clone() {
      return new this.constructor(this.r, this.g, this.b);
    }

    copy(color) {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;

      return this;
    }

    copySRGBToLinear(color) {
      this.r = SRGBToLinear(color.r);
      this.g = SRGBToLinear(color.g);
      this.b = SRGBToLinear(color.b);

      return this;
    }

    copyLinearToSRGB(color) {
      this.r = LinearToSRGB(color.r);
      this.g = LinearToSRGB(color.g);
      this.b = LinearToSRGB(color.b);

      return this;
    }

    convertSRGBToLinear() {
      this.copySRGBToLinear(this);

      return this;
    }

    convertLinearToSRGB() {
      this.copyLinearToSRGB(this);

      return this;
    }

    getHex(colorSpace = SRGBColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

      return (
        Math.round(clamp(_color.r * 255, 0, 255)) * 65536 +
        Math.round(clamp(_color.g * 255, 0, 255)) * 256 +
        Math.round(clamp(_color.b * 255, 0, 255))
      );
    }

    getHexString(colorSpace = SRGBColorSpace) {
      return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
    }

    getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
      // h,s,l ranges are in 0.0 - 1.0

      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

      const r = _color.r,
        g = _color.g,
        b = _color.b;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);

      let hue, saturation;
      const lightness = (min + max) / 2.0;

      if (min === max) {
        hue = 0;
        saturation = 0;
      } else {
        const delta = max - min;

        saturation =
          lightness <= 0.5 ? delta / (max + min) : delta / (2 - max - min);

        switch (max) {
          case r:
            hue = (g - b) / delta + (g < b ? 6 : 0);
            break;
          case g:
            hue = (b - r) / delta + 2;
            break;
          case b:
            hue = (r - g) / delta + 4;
            break;
        }

        hue /= 6;
      }

      target.h = hue;
      target.s = saturation;
      target.l = lightness;

      return target;
    }

    getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

      target.r = _color.r;
      target.g = _color.g;
      target.b = _color.b;

      return target;
    }

    getStyle(colorSpace = SRGBColorSpace) {
      ColorManagement.fromWorkingColorSpace(_color.copy(this), colorSpace);

      const r = _color.r,
        g = _color.g,
        b = _color.b;

      if (colorSpace !== SRGBColorSpace) {
        // Requires CSS Color Module Level 4 (https://www.w3.org/TR/css-color-4/).
        return `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(
          3
        )})`;
      }

      return `rgb(${Math.round(
        r * 255
      )},${Math.round(g * 255)},${Math.round(b * 255)})`;
    }

    offsetHSL(h, s, l) {
      this.getHSL(_hslA);

      _hslA.h += h;
      _hslA.s += s;
      _hslA.l += l;

      this.setHSL(_hslA.h, _hslA.s, _hslA.l);

      return this;
    }

    add(color) {
      this.r += color.r;
      this.g += color.g;
      this.b += color.b;

      return this;
    }

    addColors(color1, color2) {
      this.r = color1.r + color2.r;
      this.g = color1.g + color2.g;
      this.b = color1.b + color2.b;

      return this;
    }

    addScalar(s) {
      this.r += s;
      this.g += s;
      this.b += s;

      return this;
    }

    sub(color) {
      this.r = Math.max(0, this.r - color.r);
      this.g = Math.max(0, this.g - color.g);
      this.b = Math.max(0, this.b - color.b);

      return this;
    }

    multiply(color) {
      this.r *= color.r;
      this.g *= color.g;
      this.b *= color.b;

      return this;
    }

    multiplyScalar(s) {
      this.r *= s;
      this.g *= s;
      this.b *= s;

      return this;
    }

    lerp(color, alpha) {
      this.r += (color.r - this.r) * alpha;
      this.g += (color.g - this.g) * alpha;
      this.b += (color.b - this.b) * alpha;

      return this;
    }

    lerpColors(color1, color2, alpha) {
      this.r = color1.r + (color2.r - color1.r) * alpha;
      this.g = color1.g + (color2.g - color1.g) * alpha;
      this.b = color1.b + (color2.b - color1.b) * alpha;

      return this;
    }

    lerpHSL(color, alpha) {
      this.getHSL(_hslA);
      color.getHSL(_hslB);

      const h = lerp(_hslA.h, _hslB.h, alpha);
      const s = lerp(_hslA.s, _hslB.s, alpha);
      const l = lerp(_hslA.l, _hslB.l, alpha);

      this.setHSL(h, s, l);

      return this;
    }

    setFromVector3(v) {
      this.r = v.x;
      this.g = v.y;
      this.b = v.z;

      return this;
    }

    applyMatrix3(m) {
      const r = this.r,
        g = this.g,
        b = this.b;
      const e = m.elements;

      this.r = e[0] * r + e[3] * g + e[6] * b;
      this.g = e[1] * r + e[4] * g + e[7] * b;
      this.b = e[2] * r + e[5] * g + e[8] * b;

      return this;
    }

    equals(c) {
      return c.r === this.r && c.g === this.g && c.b === this.b;
    }

    fromArray(array, offset = 0) {
      this.r = array[offset];
      this.g = array[offset + 1];
      this.b = array[offset + 2];

      return this;
    }

    toArray(array = [], offset = 0) {
      array[offset] = this.r;
      array[offset + 1] = this.g;
      array[offset + 2] = this.b;

      return array;
    }

    fromBufferAttribute(attribute, index) {
      this.r = attribute.getX(index);
      this.g = attribute.getY(index);
      this.b = attribute.getZ(index);

      return this;
    }

    toJSON() {
      return this.getHex();
    }

    *[Symbol.iterator]() {
      yield this.r;
      yield this.g;
      yield this.b;
    }
  }

  const _color = /*@__PURE__*/ new Color();

  Color.NAMES = _colorKeywords;

  class MeshBasicMaterial extends Material {
    constructor(parameters) {
      super();

      this.isMeshBasicMaterial = true;

      this.type = "MeshBasicMaterial";

      this.color = new Color(0xffffff); // emissive

      this.map = null;

      this.lightMap = null;
      this.lightMapIntensity = 1.0;

      this.aoMap = null;
      this.aoMapIntensity = 1.0;

      this.specularMap = null;

      this.alphaMap = null;

      this.envMap = null;
      this.combine = MultiplyOperation;
      this.reflectivity = 1;
      this.refractionRatio = 0.98;

      this.wireframe = false;
      this.wireframeLinewidth = 1;
      this.wireframeLinecap = "round";
      this.wireframeLinejoin = "round";

      this.fog = true;

      this.setValues(parameters);
    }

    copy(source) {
      super.copy(source);

      this.color.copy(source.color);

      this.map = source.map;

      this.lightMap = source.lightMap;
      this.lightMapIntensity = source.lightMapIntensity;

      this.aoMap = source.aoMap;
      this.aoMapIntensity = source.aoMapIntensity;

      this.specularMap = source.specularMap;

      this.alphaMap = source.alphaMap;

      this.envMap = source.envMap;
      this.combine = source.combine;
      this.reflectivity = source.reflectivity;
      this.refractionRatio = source.refractionRatio;

      this.wireframe = source.wireframe;
      this.wireframeLinewidth = source.wireframeLinewidth;
      this.wireframeLinecap = source.wireframeLinecap;
      this.wireframeLinejoin = source.wireframeLinejoin;

      this.fog = source.fog;

      return this;
    }
  }

  const _vector$8 = /*@__PURE__*/ new Vector3();
  const _vector2$1 = /*@__PURE__*/ new Vector2();

  class BufferAttribute {
    constructor(array, itemSize, normalized = false) {
      if (Array.isArray(array)) {
        throw new TypeError(
          "THREE.BufferAttribute: array should be a Typed Array."
        );
      }

      this.isBufferAttribute = true;

      this.name = "";

      this.array = array;
      this.itemSize = itemSize;
      this.count = array !== undefined ? array.length / itemSize : 0;
      this.normalized = normalized;

      this.usage = StaticDrawUsage;
      this.updateRange = { offset: 0, count: -1 };
      this.gpuType = FloatType;

      this.version = 0;
    }

    onUploadCallback() {}

    set needsUpdate(value) {
      if (value === true) this.version++;
    }

    setUsage(value) {
      this.usage = value;

      return this;
    }

    copy(source) {
      this.name = source.name;
      this.array = new source.array.constructor(source.array);
      this.itemSize = source.itemSize;
      this.count = source.count;
      this.normalized = source.normalized;

      this.usage = source.usage;
      this.gpuType = source.gpuType;

      return this;
    }

    copyAt(index1, attribute, index2) {
      index1 *= this.itemSize;
      index2 *= attribute.itemSize;

      for (let i = 0, l = this.itemSize; i < l; i++) {
        this.array[index1 + i] = attribute.array[index2 + i];
      }

      return this;
    }

    copyArray(array) {
      this.array.set(array);

      return this;
    }

    applyMatrix3(m) {
      if (this.itemSize === 2) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector2$1.fromBufferAttribute(this, i);
          _vector2$1.applyMatrix3(m);

          this.setXY(i, _vector2$1.x, _vector2$1.y);
        }
      } else if (this.itemSize === 3) {
        for (let i = 0, l = this.count; i < l; i++) {
          _vector$8.fromBufferAttribute(this, i);
          _vector$8.applyMatrix3(m);

          this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
        }
      }

      return this;
    }

    applyMatrix4(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$8.fromBufferAttribute(this, i);

        _vector$8.applyMatrix4(m);

        this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
      }

      return this;
    }

    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$8.fromBufferAttribute(this, i);

        _vector$8.applyNormalMatrix(m);

        this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
      }

      return this;
    }

    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$8.fromBufferAttribute(this, i);

        _vector$8.transformDirection(m);

        this.setXYZ(i, _vector$8.x, _vector$8.y, _vector$8.z);
      }

      return this;
    }

    set(value, offset = 0) {
      // Matching BufferAttribute constructor, do not normalize the array.
      this.array.set(value, offset);

      return this;
    }

    getComponent(index, component) {
      let value = this.array[index * this.itemSize + component];

      if (this.normalized) value = denormalize(value, this.array);

      return value;
    }

    setComponent(index, component, value) {
      if (this.normalized) value = normalize(value, this.array);

      this.array[index * this.itemSize + component] = value;

      return this;
    }

    getX(index) {
      let x = this.array[index * this.itemSize];

      if (this.normalized) x = denormalize(x, this.array);

      return x;
    }

    setX(index, x) {
      if (this.normalized) x = normalize(x, this.array);

      this.array[index * this.itemSize] = x;

      return this;
    }

    getY(index) {
      let y = this.array[index * this.itemSize + 1];

      if (this.normalized) y = denormalize(y, this.array);

      return y;
    }

    setY(index, y) {
      if (this.normalized) y = normalize(y, this.array);

      this.array[index * this.itemSize + 1] = y;

      return this;
    }

    getZ(index) {
      let z = this.array[index * this.itemSize + 2];

      if (this.normalized) z = denormalize(z, this.array);

      return z;
    }

    setZ(index, z) {
      if (this.normalized) z = normalize(z, this.array);

      this.array[index * this.itemSize + 2] = z;

      return this;
    }

    getW(index) {
      let w = this.array[index * this.itemSize + 3];

      if (this.normalized) w = denormalize(w, this.array);

      return w;
    }

    setW(index, w) {
      if (this.normalized) w = normalize(w, this.array);

      this.array[index * this.itemSize + 3] = w;

      return this;
    }

    setXY(index, x, y) {
      index *= this.itemSize;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
      }

      this.array[index + 0] = x;
      this.array[index + 1] = y;

      return this;
    }

    setXYZ(index, x, y, z) {
      index *= this.itemSize;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
      }

      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;

      return this;
    }

    setXYZW(index, x, y, z, w) {
      index *= this.itemSize;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
        w = normalize(w, this.array);
      }

      this.array[index + 0] = x;
      this.array[index + 1] = y;
      this.array[index + 2] = z;
      this.array[index + 3] = w;

      return this;
    }

    onUpload(callback) {
      this.onUploadCallback = callback;

      return this;
    }

    clone() {
      return new this.constructor(this.array, this.itemSize).copy(this);
    }

    toJSON() {
      const data = {
        itemSize: this.itemSize,
        type: this.array.constructor.name,
        array: Array.from(this.array),
        normalized: this.normalized,
      };

      if (this.name !== "") data.name = this.name;
      if (this.usage !== StaticDrawUsage) data.usage = this.usage;
      if (this.updateRange.offset !== 0 || this.updateRange.count !== -1)
        data.updateRange = this.updateRange;

      return data;
    }
  }

  class Uint16BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint16Array(array), itemSize, normalized);
    }
  }

  class Uint32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Uint32Array(array), itemSize, normalized);
    }
  }

  class Float32BufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized) {
      super(new Float32Array(array), itemSize, normalized);
    }
  }

  let _id$1 = 0;

  const _m1 = /*@__PURE__*/ new Matrix4();
  const _obj = /*@__PURE__*/ new Object3D();
  const _offset = /*@__PURE__*/ new Vector3();
  const _box$1 = /*@__PURE__*/ new Box3();
  const _boxMorphTargets = /*@__PURE__*/ new Box3();
  const _vector$7 = /*@__PURE__*/ new Vector3();

  class BufferGeometry extends EventDispatcher {
    constructor() {
      super();

      this.isBufferGeometry = true;

      Object.defineProperty(this, "id", { value: _id$1++ });

      this.uuid = generateUUID();

      this.name = "";
      this.type = "BufferGeometry";

      this.index = null;
      this.attributes = {};

      this.morphAttributes = {};
      this.morphTargetsRelative = false;

      this.groups = [];

      this.boundingBox = null;
      this.boundingSphere = null;

      this.drawRange = { start: 0, count: Infinity };

      this.userData = {};
    }

    getIndex() {
      return this.index;
    }

    setIndex(index) {
      if (Array.isArray(index)) {
        this.index = new (
          arrayNeedsUint32(index)
            ? Uint32BufferAttribute
            : Uint16BufferAttribute
        )(index, 1);
      } else {
        this.index = index;
      }

      return this;
    }

    getAttribute(name) {
      return this.attributes[name];
    }

    setAttribute(name, attribute) {
      this.attributes[name] = attribute;

      return this;
    }

    deleteAttribute(name) {
      delete this.attributes[name];

      return this;
    }

    hasAttribute(name) {
      return this.attributes[name] !== undefined;
    }

    addGroup(start, count, materialIndex = 0) {
      this.groups.push({
        start: start,
        count: count,
        materialIndex: materialIndex,
      });
    }

    clearGroups() {
      this.groups = [];
    }

    setDrawRange(start, count) {
      this.drawRange.start = start;
      this.drawRange.count = count;
    }

    applyMatrix4(matrix) {
      const position = this.attributes.position;

      if (position !== undefined) {
        position.applyMatrix4(matrix);

        position.needsUpdate = true;
      }

      const normal = this.attributes.normal;

      if (normal !== undefined) {
        const normalMatrix = new Matrix3().getNormalMatrix(matrix);

        normal.applyNormalMatrix(normalMatrix);

        normal.needsUpdate = true;
      }

      const tangent = this.attributes.tangent;

      if (tangent !== undefined) {
        tangent.transformDirection(matrix);

        tangent.needsUpdate = true;
      }

      if (this.boundingBox !== null) {
        this.computeBoundingBox();
      }

      if (this.boundingSphere !== null) {
        this.computeBoundingSphere();
      }

      return this;
    }

    applyQuaternion(q) {
      _m1.makeRotationFromQuaternion(q);

      this.applyMatrix4(_m1);

      return this;
    }

    rotateX(angle) {
      // rotate geometry around world x-axis

      _m1.makeRotationX(angle);

      this.applyMatrix4(_m1);

      return this;
    }

    rotateY(angle) {
      // rotate geometry around world y-axis

      _m1.makeRotationY(angle);

      this.applyMatrix4(_m1);

      return this;
    }

    rotateZ(angle) {
      // rotate geometry around world z-axis

      _m1.makeRotationZ(angle);

      this.applyMatrix4(_m1);

      return this;
    }

    translate(x, y, z) {
      // translate geometry

      _m1.makeTranslation(x, y, z);

      this.applyMatrix4(_m1);

      return this;
    }

    scale(x, y, z) {
      // scale geometry

      _m1.makeScale(x, y, z);

      this.applyMatrix4(_m1);

      return this;
    }

    lookAt(vector) {
      _obj.lookAt(vector);

      _obj.updateMatrix();

      this.applyMatrix4(_obj.matrix);

      return this;
    }

    center() {
      this.computeBoundingBox();

      this.boundingBox.getCenter(_offset).negate();

      this.translate(_offset.x, _offset.y, _offset.z);

      return this;
    }

    setFromPoints(points) {
      const position = [];

      for (let i = 0, l = points.length; i < l; i++) {
        const point = points[i];
        position.push(point.x, point.y, point.z || 0);
      }

      this.setAttribute("position", new Float32BufferAttribute(position, 3));

      return this;
    }

    computeBoundingBox() {
      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }

      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;

      if (position && position.isGLBufferAttribute) {
        console.error(
          'THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box. Alternatively set "mesh.frustumCulled" to "false".',
          this
        );

        this.boundingBox.set(
          new Vector3(-Infinity, -Infinity, -Infinity),
          new Vector3(+Infinity, +Infinity, +Infinity)
        );

        return;
      }

      if (position !== undefined) {
        this.boundingBox.setFromBufferAttribute(position);

        // process morph attributes if present

        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _box$1.setFromBufferAttribute(morphAttribute);

            if (this.morphTargetsRelative) {
              _vector$7.addVectors(this.boundingBox.min, _box$1.min);
              this.boundingBox.expandByPoint(_vector$7);

              _vector$7.addVectors(this.boundingBox.max, _box$1.max);
              this.boundingBox.expandByPoint(_vector$7);
            } else {
              this.boundingBox.expandByPoint(_box$1.min);
              this.boundingBox.expandByPoint(_box$1.max);
            }
          }
        }
      } else {
        this.boundingBox.makeEmpty();
      }

      if (
        isNaN(this.boundingBox.min.x) ||
        isNaN(this.boundingBox.min.y) ||
        isNaN(this.boundingBox.min.z)
      ) {
        console.error(
          'THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',
          this
        );
      }
    }

    computeBoundingSphere() {
      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }

      const position = this.attributes.position;
      const morphAttributesPosition = this.morphAttributes.position;

      if (position && position.isGLBufferAttribute) {
        console.error(
          'THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere. Alternatively set "mesh.frustumCulled" to "false".',
          this
        );

        this.boundingSphere.set(new Vector3(), Infinity);

        return;
      }

      if (position) {
        // first, find the center of the bounding sphere

        const center = this.boundingSphere.center;

        _box$1.setFromBufferAttribute(position);

        // process morph attributes if present

        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            _boxMorphTargets.setFromBufferAttribute(morphAttribute);

            if (this.morphTargetsRelative) {
              _vector$7.addVectors(_box$1.min, _boxMorphTargets.min);
              _box$1.expandByPoint(_vector$7);

              _vector$7.addVectors(_box$1.max, _boxMorphTargets.max);
              _box$1.expandByPoint(_vector$7);
            } else {
              _box$1.expandByPoint(_boxMorphTargets.min);
              _box$1.expandByPoint(_boxMorphTargets.max);
            }
          }
        }

        _box$1.getCenter(center);

        // second, try to find a boundingSphere with a radius smaller than the
        // boundingSphere of the boundingBox: sqrt(3) smaller in the best case

        let maxRadiusSq = 0;

        for (let i = 0, il = position.count; i < il; i++) {
          _vector$7.fromBufferAttribute(position, i);

          maxRadiusSq = Math.max(
            maxRadiusSq,
            center.distanceToSquared(_vector$7)
          );
        }

        // process morph attributes if present

        if (morphAttributesPosition) {
          for (let i = 0, il = morphAttributesPosition.length; i < il; i++) {
            const morphAttribute = morphAttributesPosition[i];
            const morphTargetsRelative = this.morphTargetsRelative;

            for (let j = 0, jl = morphAttribute.count; j < jl; j++) {
              _vector$7.fromBufferAttribute(morphAttribute, j);

              if (morphTargetsRelative) {
                _offset.fromBufferAttribute(position, j);
                _vector$7.add(_offset);
              }

              maxRadiusSq = Math.max(
                maxRadiusSq,
                center.distanceToSquared(_vector$7)
              );
            }
          }
        }

        this.boundingSphere.radius = Math.sqrt(maxRadiusSq);

        if (isNaN(this.boundingSphere.radius)) {
          console.error(
            'THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',
            this
          );
        }
      }
    }

    computeTangents() {
      const index = this.index;
      const attributes = this.attributes;

      // based on http://www.terathon.com/code/tangent.html
      // (per vertex tangents)

      if (
        index === null ||
        attributes.position === undefined ||
        attributes.normal === undefined ||
        attributes.uv === undefined
      ) {
        console.error(
          "THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)"
        );
        return;
      }

      const indices = index.array;
      const positions = attributes.position.array;
      const normals = attributes.normal.array;
      const uvs = attributes.uv.array;

      const nVertices = positions.length / 3;

      if (this.hasAttribute("tangent") === false) {
        this.setAttribute(
          "tangent",
          new BufferAttribute(new Float32Array(4 * nVertices), 4)
        );
      }

      const tangents = this.getAttribute("tangent").array;

      const tan1 = [],
        tan2 = [];

      for (let i = 0; i < nVertices; i++) {
        tan1[i] = new Vector3();
        tan2[i] = new Vector3();
      }

      const vA = new Vector3(),
        vB = new Vector3(),
        vC = new Vector3(),
        uvA = new Vector2(),
        uvB = new Vector2(),
        uvC = new Vector2(),
        sdir = new Vector3(),
        tdir = new Vector3();

      function handleTriangle(a, b, c) {
        vA.fromArray(positions, a * 3);
        vB.fromArray(positions, b * 3);
        vC.fromArray(positions, c * 3);

        uvA.fromArray(uvs, a * 2);
        uvB.fromArray(uvs, b * 2);
        uvC.fromArray(uvs, c * 2);

        vB.sub(vA);
        vC.sub(vA);

        uvB.sub(uvA);
        uvC.sub(uvA);

        const r = 1.0 / (uvB.x * uvC.y - uvC.x * uvB.y);

        // silently ignore degenerate uv triangles having coincident or colinear vertices

        if (!isFinite(r)) return;

        sdir
          .copy(vB)
          .multiplyScalar(uvC.y)
          .addScaledVector(vC, -uvB.y)
          .multiplyScalar(r);
        tdir
          .copy(vC)
          .multiplyScalar(uvB.x)
          .addScaledVector(vB, -uvC.x)
          .multiplyScalar(r);

        tan1[a].add(sdir);
        tan1[b].add(sdir);
        tan1[c].add(sdir);

        tan2[a].add(tdir);
        tan2[b].add(tdir);
        tan2[c].add(tdir);
      }

      let groups = this.groups;

      if (groups.length === 0) {
        groups = [
          {
            start: 0,
            count: indices.length,
          },
        ];
      }

      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];

        const start = group.start;
        const count = group.count;

        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleTriangle(indices[j + 0], indices[j + 1], indices[j + 2]);
        }
      }

      const tmp = new Vector3(),
        tmp2 = new Vector3();
      const n = new Vector3(),
        n2 = new Vector3();

      function handleVertex(v) {
        n.fromArray(normals, v * 3);
        n2.copy(n);

        const t = tan1[v];

        // Gram-Schmidt orthogonalize

        tmp.copy(t);
        tmp.sub(n.multiplyScalar(n.dot(t))).normalize();

        // Calculate handedness

        tmp2.crossVectors(n2, t);
        const test = tmp2.dot(tan2[v]);
        const w = test < 0.0 ? -1.0 : 1.0;

        tangents[v * 4] = tmp.x;
        tangents[v * 4 + 1] = tmp.y;
        tangents[v * 4 + 2] = tmp.z;
        tangents[v * 4 + 3] = w;
      }

      for (let i = 0, il = groups.length; i < il; ++i) {
        const group = groups[i];

        const start = group.start;
        const count = group.count;

        for (let j = start, jl = start + count; j < jl; j += 3) {
          handleVertex(indices[j + 0]);
          handleVertex(indices[j + 1]);
          handleVertex(indices[j + 2]);
        }
      }
    }

    computeVertexNormals() {
      const index = this.index;
      const positionAttribute = this.getAttribute("position");

      if (positionAttribute !== undefined) {
        let normalAttribute = this.getAttribute("normal");

        if (normalAttribute === undefined) {
          normalAttribute = new BufferAttribute(
            new Float32Array(positionAttribute.count * 3),
            3
          );
          this.setAttribute("normal", normalAttribute);
        } else {
          // reset existing normals to zero

          for (let i = 0, il = normalAttribute.count; i < il; i++) {
            normalAttribute.setXYZ(i, 0, 0, 0);
          }
        }

        const pA = new Vector3(),
          pB = new Vector3(),
          pC = new Vector3();
        const nA = new Vector3(),
          nB = new Vector3(),
          nC = new Vector3();
        const cb = new Vector3(),
          ab = new Vector3();

        // indexed elements

        if (index) {
          for (let i = 0, il = index.count; i < il; i += 3) {
            const vA = index.getX(i + 0);
            const vB = index.getX(i + 1);
            const vC = index.getX(i + 2);

            pA.fromBufferAttribute(positionAttribute, vA);
            pB.fromBufferAttribute(positionAttribute, vB);
            pC.fromBufferAttribute(positionAttribute, vC);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            nA.fromBufferAttribute(normalAttribute, vA);
            nB.fromBufferAttribute(normalAttribute, vB);
            nC.fromBufferAttribute(normalAttribute, vC);

            nA.add(cb);
            nB.add(cb);
            nC.add(cb);

            normalAttribute.setXYZ(vA, nA.x, nA.y, nA.z);
            normalAttribute.setXYZ(vB, nB.x, nB.y, nB.z);
            normalAttribute.setXYZ(vC, nC.x, nC.y, nC.z);
          }
        } else {
          // non-indexed elements (unconnected triangle soup)

          for (let i = 0, il = positionAttribute.count; i < il; i += 3) {
            pA.fromBufferAttribute(positionAttribute, i + 0);
            pB.fromBufferAttribute(positionAttribute, i + 1);
            pC.fromBufferAttribute(positionAttribute, i + 2);

            cb.subVectors(pC, pB);
            ab.subVectors(pA, pB);
            cb.cross(ab);

            normalAttribute.setXYZ(i + 0, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 1, cb.x, cb.y, cb.z);
            normalAttribute.setXYZ(i + 2, cb.x, cb.y, cb.z);
          }
        }

        this.normalizeNormals();

        normalAttribute.needsUpdate = true;
      }
    }

    normalizeNormals() {
      const normals = this.attributes.normal;

      for (let i = 0, il = normals.count; i < il; i++) {
        _vector$7.fromBufferAttribute(normals, i);

        _vector$7.normalize();

        normals.setXYZ(i, _vector$7.x, _vector$7.y, _vector$7.z);
      }
    }

    toNonIndexed() {
      function convertBufferAttribute(attribute, indices) {
        const array = attribute.array;
        const itemSize = attribute.itemSize;
        const normalized = attribute.normalized;

        const array2 = new array.constructor(indices.length * itemSize);

        let index = 0,
          index2 = 0;

        for (let i = 0, l = indices.length; i < l; i++) {
          if (attribute.isInterleavedBufferAttribute) {
            index = indices[i] * attribute.data.stride + attribute.offset;
          } else {
            index = indices[i] * itemSize;
          }

          for (let j = 0; j < itemSize; j++) {
            array2[index2++] = array[index++];
          }
        }

        return new BufferAttribute(array2, itemSize, normalized);
      }

      //

      if (this.index === null) {
        console.warn(
          "THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."
        );
        return this;
      }

      const geometry2 = new BufferGeometry();

      const indices = this.index.array;
      const attributes = this.attributes;

      // attributes

      for (const name in attributes) {
        const attribute = attributes[name];

        const newAttribute = convertBufferAttribute(attribute, indices);

        geometry2.setAttribute(name, newAttribute);
      }

      // morph attributes

      const morphAttributes = this.morphAttributes;

      for (const name in morphAttributes) {
        const morphArray = [];
        const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

        for (let i = 0, il = morphAttribute.length; i < il; i++) {
          const attribute = morphAttribute[i];

          const newAttribute = convertBufferAttribute(attribute, indices);

          morphArray.push(newAttribute);
        }

        geometry2.morphAttributes[name] = morphArray;
      }

      geometry2.morphTargetsRelative = this.morphTargetsRelative;

      // groups

      const groups = this.groups;

      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        geometry2.addGroup(group.start, group.count, group.materialIndex);
      }

      return geometry2;
    }

    toJSON() {
      const data = {
        metadata: {
          version: 4.6,
          type: "BufferGeometry",
          generator: "BufferGeometry.toJSON",
        },
      };

      // standard BufferGeometry serialization

      data.uuid = this.uuid;
      data.type = this.type;
      if (this.name !== "") data.name = this.name;
      if (Object.keys(this.userData).length > 0) data.userData = this.userData;

      if (this.parameters !== undefined) {
        const parameters = this.parameters;

        for (const key in parameters) {
          if (parameters[key] !== undefined) data[key] = parameters[key];
        }

        return data;
      }

      // for simplicity the code assumes attributes are not shared across geometries, see #15811

      data.data = { attributes: {} };

      const index = this.index;

      if (index !== null) {
        data.data.index = {
          type: index.array.constructor.name,
          array: Array.prototype.slice.call(index.array),
        };
      }

      const attributes = this.attributes;

      for (const key in attributes) {
        const attribute = attributes[key];

        data.data.attributes[key] = attribute.toJSON(data.data);
      }

      const morphAttributes = {};
      let hasMorphAttributes = false;

      for (const key in this.morphAttributes) {
        const attributeArray = this.morphAttributes[key];

        const array = [];

        for (let i = 0, il = attributeArray.length; i < il; i++) {
          const attribute = attributeArray[i];

          array.push(attribute.toJSON(data.data));
        }

        if (array.length > 0) {
          morphAttributes[key] = array;

          hasMorphAttributes = true;
        }
      }

      if (hasMorphAttributes) {
        data.data.morphAttributes = morphAttributes;
        data.data.morphTargetsRelative = this.morphTargetsRelative;
      }

      const groups = this.groups;

      if (groups.length > 0) {
        data.data.groups = JSON.parse(JSON.stringify(groups));
      }

      const boundingSphere = this.boundingSphere;

      if (boundingSphere !== null) {
        data.data.boundingSphere = {
          center: boundingSphere.center.toArray(),
          radius: boundingSphere.radius,
        };
      }

      return data;
    }

    clone() {
      return new this.constructor().copy(this);
    }

    copy(source) {
      // reset

      this.index = null;
      this.attributes = {};
      this.morphAttributes = {};
      this.groups = [];
      this.boundingBox = null;
      this.boundingSphere = null;

      // used for storing cloned, shared data

      const data = {};

      // name

      this.name = source.name;

      // index

      const index = source.index;

      if (index !== null) {
        this.setIndex(index.clone(data));
      }

      // attributes

      const attributes = source.attributes;

      for (const name in attributes) {
        const attribute = attributes[name];
        this.setAttribute(name, attribute.clone(data));
      }

      // morph attributes

      const morphAttributes = source.morphAttributes;

      for (const name in morphAttributes) {
        const array = [];
        const morphAttribute = morphAttributes[name]; // morphAttribute: array of Float32BufferAttributes

        for (let i = 0, l = morphAttribute.length; i < l; i++) {
          array.push(morphAttribute[i].clone(data));
        }

        this.morphAttributes[name] = array;
      }

      this.morphTargetsRelative = source.morphTargetsRelative;

      // groups

      const groups = source.groups;

      for (let i = 0, l = groups.length; i < l; i++) {
        const group = groups[i];
        this.addGroup(group.start, group.count, group.materialIndex);
      }

      // bounding box

      const boundingBox = source.boundingBox;

      if (boundingBox !== null) {
        this.boundingBox = boundingBox.clone();
      }

      // bounding sphere

      const boundingSphere = source.boundingSphere;

      if (boundingSphere !== null) {
        this.boundingSphere = boundingSphere.clone();
      }

      // draw range

      this.drawRange.start = source.drawRange.start;
      this.drawRange.count = source.drawRange.count;

      // user data

      this.userData = source.userData;

      return this;
    }

    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }

  const _inverseMatrix$3 = /*@__PURE__*/ new Matrix4();
  const _ray$3 = /*@__PURE__*/ new Ray();
  const _sphere$5 = /*@__PURE__*/ new Sphere();
  const _sphereHitAt = /*@__PURE__*/ new Vector3();

  const _vA$1 = /*@__PURE__*/ new Vector3();
  const _vB$1 = /*@__PURE__*/ new Vector3();
  const _vC$1 = /*@__PURE__*/ new Vector3();

  const _tempA = /*@__PURE__*/ new Vector3();
  const _morphA = /*@__PURE__*/ new Vector3();

  const _uvA$1 = /*@__PURE__*/ new Vector2();
  const _uvB$1 = /*@__PURE__*/ new Vector2();
  const _uvC$1 = /*@__PURE__*/ new Vector2();

  const _normalA = /*@__PURE__*/ new Vector3();
  const _normalB = /*@__PURE__*/ new Vector3();
  const _normalC = /*@__PURE__*/ new Vector3();

  const _intersectionPoint = /*@__PURE__*/ new Vector3();
  const _intersectionPointWorld = /*@__PURE__*/ new Vector3();

  class Mesh extends Object3D {
    constructor(
      geometry = new BufferGeometry(),
      material = new MeshBasicMaterial()
    ) {
      super();

      this.isMesh = true;

      this.type = "Mesh";

      this.geometry = geometry;
      this.material = material;

      this.updateMorphTargets();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      if (source.morphTargetInfluences !== undefined) {
        this.morphTargetInfluences = source.morphTargetInfluences.slice();
      }

      if (source.morphTargetDictionary !== undefined) {
        this.morphTargetDictionary = Object.assign(
          {},
          source.morphTargetDictionary
        );
      }

      this.material = source.material;
      this.geometry = source.geometry;

      return this;
    }

    updateMorphTargets() {
      const geometry = this.geometry;

      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);

      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];

        if (morphAttribute !== undefined) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};

          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);

            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }

    getVertexPosition(index, target) {
      const geometry = this.geometry;
      const position = geometry.attributes.position;
      const morphPosition = geometry.morphAttributes.position;
      const morphTargetsRelative = geometry.morphTargetsRelative;

      target.fromBufferAttribute(position, index);

      const morphInfluences = this.morphTargetInfluences;

      if (morphPosition && morphInfluences) {
        _morphA.set(0, 0, 0);

        for (let i = 0, il = morphPosition.length; i < il; i++) {
          const influence = morphInfluences[i];
          const morphAttribute = morphPosition[i];

          if (influence === 0) continue;

          _tempA.fromBufferAttribute(morphAttribute, index);

          if (morphTargetsRelative) {
            _morphA.addScaledVector(_tempA, influence);
          } else {
            _morphA.addScaledVector(_tempA.sub(target), influence);
          }
        }

        target.add(_morphA);
      }

      return target;
    }

    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const material = this.material;
      const matrixWorld = this.matrixWorld;

      if (material === undefined) return;

      // test with bounding sphere in world space

      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

      _sphere$5.copy(geometry.boundingSphere);
      _sphere$5.applyMatrix4(matrixWorld);

      // check distance from ray origin to bounding sphere

      _ray$3.copy(raycaster.ray).recast(raycaster.near);

      if (_sphere$5.containsPoint(_ray$3.origin) === false) {
        if (_ray$3.intersectSphere(_sphere$5, _sphereHitAt) === null) return;

        if (
          _ray$3.origin.distanceToSquared(_sphereHitAt) >
          (raycaster.far - raycaster.near) ** 2
        )
          return;
      }

      // convert ray to local space of mesh

      _inverseMatrix$3.copy(matrixWorld).invert();
      _ray$3.copy(raycaster.ray).applyMatrix4(_inverseMatrix$3);

      // test with bounding box in local space

      if (geometry.boundingBox !== null) {
        if (_ray$3.intersectsBox(geometry.boundingBox) === false) return;
      }

      // test for intersections with geometry

      this._computeIntersections(raycaster, intersects, _ray$3);
    }

    _computeIntersections(raycaster, intersects, rayLocalSpace) {
      let intersection;

      const geometry = this.geometry;
      const material = this.material;

      const index = geometry.index;
      const position = geometry.attributes.position;
      const uv = geometry.attributes.uv;
      const uv1 = geometry.attributes.uv1;
      const normal = geometry.attributes.normal;
      const groups = geometry.groups;
      const drawRange = geometry.drawRange;

      if (index !== null) {
        // indexed buffer geometry

        if (Array.isArray(material)) {
          for (let i = 0, il = groups.length; i < il; i++) {
            const group = groups[i];
            const groupMaterial = material[group.materialIndex];

            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(
              index.count,
              Math.min(
                group.start + group.count,
                drawRange.start + drawRange.count
              )
            );

            for (let j = start, jl = end; j < jl; j += 3) {
              const a = index.getX(j);
              const b = index.getX(j + 1);
              const c = index.getX(j + 2);

              intersection = checkGeometryIntersection(
                this,
                groupMaterial,
                raycaster,
                rayLocalSpace,
                uv,
                uv1,
                normal,
                a,
                b,
                c
              );

              if (intersection) {
                intersection.faceIndex = Math.floor(j / 3); // triangle number in indexed buffer semantics
                intersection.face.materialIndex = group.materialIndex;
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end = Math.min(index.count, drawRange.start + drawRange.count);

          for (let i = start, il = end; i < il; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);

            intersection = checkGeometryIntersection(
              this,
              material,
              raycaster,
              rayLocalSpace,
              uv,
              uv1,
              normal,
              a,
              b,
              c
            );

            if (intersection) {
              intersection.faceIndex = Math.floor(i / 3); // triangle number in indexed buffer semantics
              intersects.push(intersection);
            }
          }
        }
      } else if (position !== undefined) {
        // non-indexed buffer geometry

        if (Array.isArray(material)) {
          for (let i = 0, il = groups.length; i < il; i++) {
            const group = groups[i];
            const groupMaterial = material[group.materialIndex];

            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(
              position.count,
              Math.min(
                group.start + group.count,
                drawRange.start + drawRange.count
              )
            );

            for (let j = start, jl = end; j < jl; j += 3) {
              const a = j;
              const b = j + 1;
              const c = j + 2;

              intersection = checkGeometryIntersection(
                this,
                groupMaterial,
                raycaster,
                rayLocalSpace,
                uv,
                uv1,
                normal,
                a,
                b,
                c
              );

              if (intersection) {
                intersection.faceIndex = Math.floor(j / 3); // triangle number in non-indexed buffer semantics
                intersection.face.materialIndex = group.materialIndex;
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end = Math.min(
            position.count,
            drawRange.start + drawRange.count
          );

          for (let i = start, il = end; i < il; i += 3) {
            const a = i;
            const b = i + 1;
            const c = i + 2;

            intersection = checkGeometryIntersection(
              this,
              material,
              raycaster,
              rayLocalSpace,
              uv,
              uv1,
              normal,
              a,
              b,
              c
            );

            if (intersection) {
              intersection.faceIndex = Math.floor(i / 3); // triangle number in non-indexed buffer semantics
              intersects.push(intersection);
            }
          }
        }
      }
    }
  }

  function checkIntersection(
    object,
    material,
    raycaster,
    ray,
    pA,
    pB,
    pC,
    point
  ) {
    let intersect;

    if (material.side === BackSide) {
      intersect = ray.intersectTriangle(pC, pB, pA, true, point);
    } else {
      intersect = ray.intersectTriangle(
        pA,
        pB,
        pC,
        material.side === FrontSide,
        point
      );
    }

    if (intersect === null) return null;

    _intersectionPointWorld.copy(point);
    _intersectionPointWorld.applyMatrix4(object.matrixWorld);

    const distance = raycaster.ray.origin.distanceTo(_intersectionPointWorld);

    if (distance < raycaster.near || distance > raycaster.far) return null;

    return {
      distance: distance,
      point: _intersectionPointWorld.clone(),
      object: object,
    };
  }

  function checkGeometryIntersection(
    object,
    material,
    raycaster,
    ray,
    uv,
    uv1,
    normal,
    a,
    b,
    c
  ) {
    object.getVertexPosition(a, _vA$1);
    object.getVertexPosition(b, _vB$1);
    object.getVertexPosition(c, _vC$1);

    const intersection = checkIntersection(
      object,
      material,
      raycaster,
      ray,
      _vA$1,
      _vB$1,
      _vC$1,
      _intersectionPoint
    );

    if (intersection) {
      if (uv) {
        _uvA$1.fromBufferAttribute(uv, a);
        _uvB$1.fromBufferAttribute(uv, b);
        _uvC$1.fromBufferAttribute(uv, c);

        intersection.uv = Triangle.getInterpolation(
          _intersectionPoint,
          _vA$1,
          _vB$1,
          _vC$1,
          _uvA$1,
          _uvB$1,
          _uvC$1,
          new Vector2()
        );
      }

      if (uv1) {
        _uvA$1.fromBufferAttribute(uv1, a);
        _uvB$1.fromBufferAttribute(uv1, b);
        _uvC$1.fromBufferAttribute(uv1, c);

        intersection.uv1 = Triangle.getInterpolation(
          _intersectionPoint,
          _vA$1,
          _vB$1,
          _vC$1,
          _uvA$1,
          _uvB$1,
          _uvC$1,
          new Vector2()
        );
        intersection.uv2 = intersection.uv1; // @deprecated, r152
      }

      if (normal) {
        _normalA.fromBufferAttribute(normal, a);
        _normalB.fromBufferAttribute(normal, b);
        _normalC.fromBufferAttribute(normal, c);

        intersection.normal = Triangle.getInterpolation(
          _intersectionPoint,
          _vA$1,
          _vB$1,
          _vC$1,
          _normalA,
          _normalB,
          _normalC,
          new Vector3()
        );

        if (intersection.normal.dot(ray.direction) > 0) {
          intersection.normal.multiplyScalar(-1);
        }
      }

      const face = {
        a: a,
        b: b,
        c: c,
        normal: new Vector3(),
        materialIndex: 0,
      };

      Triangle.getNormal(_vA$1, _vB$1, _vC$1, face.normal);

      intersection.face = face;
    }

    return intersection;
  }

  class Camera extends Object3D {
    constructor() {
      super();

      this.isCamera = true;

      this.type = "Camera";

      this.matrixWorldInverse = new Matrix4();

      this.projectionMatrix = new Matrix4();
      this.projectionMatrixInverse = new Matrix4();

      this.coordinateSystem = WebGLCoordinateSystem;
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.matrixWorldInverse.copy(source.matrixWorldInverse);

      this.projectionMatrix.copy(source.projectionMatrix);
      this.projectionMatrixInverse.copy(source.projectionMatrixInverse);

      this.coordinateSystem = source.coordinateSystem;

      return this;
    }

    getWorldDirection(target) {
      this.updateWorldMatrix(true, false);

      const e = this.matrixWorld.elements;

      return target.set(-e[8], -e[9], -e[10]).normalize();
    }

    updateMatrixWorld(force) {
      super.updateMatrixWorld(force);

      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }

    updateWorldMatrix(updateParents, updateChildren) {
      super.updateWorldMatrix(updateParents, updateChildren);

      this.matrixWorldInverse.copy(this.matrixWorld).invert();
    }

    clone() {
      return new this.constructor().copy(this);
    }
  }

  class PerspectiveCamera extends Camera {
    constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
      super();

      this.isPerspectiveCamera = true;

      this.type = "PerspectiveCamera";

      this.fov = fov;
      this.zoom = 1;

      this.near = near;
      this.far = far;
      this.focus = 10;

      this.aspect = aspect;
      this.view = null;

      this.filmGauge = 35; // width of the film (default in millimeters)
      this.filmOffset = 0; // horizontal film offset (same unit as gauge)

      this.updateProjectionMatrix();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.fov = source.fov;
      this.zoom = source.zoom;

      this.near = source.near;
      this.far = source.far;
      this.focus = source.focus;

      this.aspect = source.aspect;
      this.view = source.view === null ? null : Object.assign({}, source.view);

      this.filmGauge = source.filmGauge;
      this.filmOffset = source.filmOffset;

      return this;
    }

    /**
     * Sets the FOV by focal length in respect to the current .filmGauge.
     *
     * The default film gauge is 35, so that the focal length can be specified for
     * a 35mm (full frame) camera.
     *
     * Values for focal length and film gauge must have the same unit.
     */
    setFocalLength(focalLength) {
      /** see {@link http://www.bobatkins.com/photography/technical/field_of_view.html} */
      const vExtentSlope = (0.5 * this.getFilmHeight()) / focalLength;

      this.fov = RAD2DEG * 2 * Math.atan(vExtentSlope);
      this.updateProjectionMatrix();
    }

    /**
     * Calculates the focal length from the current .fov and .filmGauge.
     */
    getFocalLength() {
      const vExtentSlope = Math.tan(DEG2RAD * 0.5 * this.fov);

      return (0.5 * this.getFilmHeight()) / vExtentSlope;
    }

    getEffectiveFOV() {
      return (
        RAD2DEG * 2 * Math.atan(Math.tan(DEG2RAD * 0.5 * this.fov) / this.zoom)
      );
    }

    getFilmWidth() {
      // film not completely covered in portrait format (aspect < 1)
      return this.filmGauge * Math.min(this.aspect, 1);
    }

    getFilmHeight() {
      // film not completely covered in landscape format (aspect > 1)
      return this.filmGauge / Math.max(this.aspect, 1);
    }

    /**
     * Sets an offset in a larger frustum. This is useful for multi-window or
     * multi-monitor/multi-machine setups.
     *
     * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
     * the monitors are in grid like this
     *
     *   +---+---+---+
     *   | A | B | C |
     *   +---+---+---+
     *   | D | E | F |
     *   +---+---+---+
     *
     * then for each monitor you would call it like this
     *
     *   const w = 1920;
     *   const h = 1080;
     *   const fullWidth = w * 3;
     *   const fullHeight = h * 2;
     *
     *   --A--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
     *   --B--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
     *   --C--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
     *   --D--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
     *   --E--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
     *   --F--
     *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
     *
     *   Note there is no reason monitors have to be the same size or in a grid.
     */
    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      this.aspect = fullWidth / fullHeight;

      if (this.view === null) {
        this.view = {
          enabled: true,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        };
      }

      this.view.enabled = true;
      this.view.fullWidth = fullWidth;
      this.view.fullHeight = fullHeight;
      this.view.offsetX = x;
      this.view.offsetY = y;
      this.view.width = width;
      this.view.height = height;

      this.updateProjectionMatrix();
    }

    clearViewOffset() {
      if (this.view !== null) {
        this.view.enabled = false;
      }

      this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
      const near = this.near;
      let top = (near * Math.tan(DEG2RAD * 0.5 * this.fov)) / this.zoom;
      let height = 2 * top;
      let width = this.aspect * height;
      let left = -0.5 * width;
      const view = this.view;

      if (this.view !== null && this.view.enabled) {
        const fullWidth = view.fullWidth,
          fullHeight = view.fullHeight;

        left += (view.offsetX * width) / fullWidth;
        top -= (view.offsetY * height) / fullHeight;
        width *= view.width / fullWidth;
        height *= view.height / fullHeight;
      }

      const skew = this.filmOffset;
      if (skew !== 0) left += (near * skew) / this.getFilmWidth();

      this.projectionMatrix.makePerspective(
        left,
        left + width,
        top,
        top - height,
        near,
        this.far,
        this.coordinateSystem
      );

      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }

    toJSON(meta) {
      const data = super.toJSON(meta);

      data.object.fov = this.fov;
      data.object.zoom = this.zoom;

      data.object.near = this.near;
      data.object.far = this.far;
      data.object.focus = this.focus;

      data.object.aspect = this.aspect;

      if (this.view !== null) data.object.view = Object.assign({}, this.view);

      data.object.filmGauge = this.filmGauge;
      data.object.filmOffset = this.filmOffset;

      return data;
    }
  }

  const _vector1 = /*@__PURE__*/ new Vector3();
  const _vector2 = /*@__PURE__*/ new Vector3();
  const _normalMatrix = /*@__PURE__*/ new Matrix3();

  class Plane {
    constructor(normal = new Vector3(1, 0, 0), constant = 0) {
      this.isPlane = true;

      // normal is assumed to be normalized

      this.normal = normal;
      this.constant = constant;
    }

    set(normal, constant) {
      this.normal.copy(normal);
      this.constant = constant;

      return this;
    }

    setComponents(x, y, z, w) {
      this.normal.set(x, y, z);
      this.constant = w;

      return this;
    }

    setFromNormalAndCoplanarPoint(normal, point) {
      this.normal.copy(normal);
      this.constant = -point.dot(this.normal);

      return this;
    }

    setFromCoplanarPoints(a, b, c) {
      const normal = _vector1
        .subVectors(c, b)
        .cross(_vector2.subVectors(a, b))
        .normalize();

      // Q: should an error be thrown if normal is zero (e.g. degenerate plane)?

      this.setFromNormalAndCoplanarPoint(normal, a);

      return this;
    }

    copy(plane) {
      this.normal.copy(plane.normal);
      this.constant = plane.constant;

      return this;
    }

    normalize() {
      // Note: will lead to a divide by zero if the plane is invalid.

      const inverseNormalLength = 1.0 / this.normal.length();
      this.normal.multiplyScalar(inverseNormalLength);
      this.constant *= inverseNormalLength;

      return this;
    }

    negate() {
      this.constant *= -1;
      this.normal.negate();

      return this;
    }

    distanceToPoint(point) {
      return this.normal.dot(point) + this.constant;
    }

    distanceToSphere(sphere) {
      return this.distanceToPoint(sphere.center) - sphere.radius;
    }

    projectPoint(point, target) {
      return target
        .copy(point)
        .addScaledVector(this.normal, -this.distanceToPoint(point));
    }

    intersectLine(line, target) {
      const direction = line.delta(_vector1);

      const denominator = this.normal.dot(direction);

      if (denominator === 0) {
        // line is coplanar, return origin
        if (this.distanceToPoint(line.start) === 0) {
          return target.copy(line.start);
        }

        // Unsure if this is the correct method to handle this case.
        return null;
      }

      const t = -(line.start.dot(this.normal) + this.constant) / denominator;

      if (t < 0 || t > 1) {
        return null;
      }

      return target.copy(line.start).addScaledVector(direction, t);
    }

    intersectsLine(line) {
      // Note: this tests if a line intersects the plane, not whether it (or its end-points) are coplanar with it.

      const startSign = this.distanceToPoint(line.start);
      const endSign = this.distanceToPoint(line.end);

      return (startSign < 0 && endSign > 0) || (endSign < 0 && startSign > 0);
    }

    intersectsBox(box) {
      return box.intersectsPlane(this);
    }

    intersectsSphere(sphere) {
      return sphere.intersectsPlane(this);
    }

    coplanarPoint(target) {
      return target.copy(this.normal).multiplyScalar(-this.constant);
    }

    applyMatrix4(matrix, optionalNormalMatrix) {
      const normalMatrix =
        optionalNormalMatrix || _normalMatrix.getNormalMatrix(matrix);

      const referencePoint = this.coplanarPoint(_vector1).applyMatrix4(matrix);

      const normal = this.normal.applyMatrix3(normalMatrix).normalize();

      this.constant = -referencePoint.dot(normal);

      return this;
    }

    translate(offset) {
      this.constant -= offset.dot(this.normal);

      return this;
    }

    equals(plane) {
      return (
        plane.normal.equals(this.normal) && plane.constant === this.constant
      );
    }

    clone() {
      return new this.constructor().copy(this);
    }
  }

  const _sphere$4 = /*@__PURE__*/ new Sphere();
  const _vector$6 = /*@__PURE__*/ new Vector3();

  class Frustum {
    constructor(
      p0 = new Plane(),
      p1 = new Plane(),
      p2 = new Plane(),
      p3 = new Plane(),
      p4 = new Plane(),
      p5 = new Plane()
    ) {
      this.planes = [p0, p1, p2, p3, p4, p5];
    }

    set(p0, p1, p2, p3, p4, p5) {
      const planes = this.planes;

      planes[0].copy(p0);
      planes[1].copy(p1);
      planes[2].copy(p2);
      planes[3].copy(p3);
      planes[4].copy(p4);
      planes[5].copy(p5);

      return this;
    }

    copy(frustum) {
      const planes = this.planes;

      for (let i = 0; i < 6; i++) {
        planes[i].copy(frustum.planes[i]);
      }

      return this;
    }

    setFromProjectionMatrix(m, coordinateSystem = WebGLCoordinateSystem) {
      const planes = this.planes;
      const me = m.elements;
      const me0 = me[0],
        me1 = me[1],
        me2 = me[2],
        me3 = me[3];
      const me4 = me[4],
        me5 = me[5],
        me6 = me[6],
        me7 = me[7];
      const me8 = me[8],
        me9 = me[9],
        me10 = me[10],
        me11 = me[11];
      const me12 = me[12],
        me13 = me[13],
        me14 = me[14],
        me15 = me[15];

      planes[0]
        .setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12)
        .normalize();
      planes[1]
        .setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12)
        .normalize();
      planes[2]
        .setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13)
        .normalize();
      planes[3]
        .setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13)
        .normalize();
      planes[4]
        .setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14)
        .normalize();

      if (coordinateSystem === WebGLCoordinateSystem) {
        planes[5]
          .setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14)
          .normalize();
      } else if (coordinateSystem === WebGPUCoordinateSystem) {
        planes[5].setComponents(me2, me6, me10, me14).normalize();
      } else {
        throw new Error(
          "THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " +
            coordinateSystem
        );
      }

      return this;
    }

    intersectsObject(object) {
      if (object.boundingSphere !== undefined) {
        if (object.boundingSphere === null) object.computeBoundingSphere();

        _sphere$4.copy(object.boundingSphere).applyMatrix4(object.matrixWorld);
      } else {
        const geometry = object.geometry;

        if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

        _sphere$4
          .copy(geometry.boundingSphere)
          .applyMatrix4(object.matrixWorld);
      }

      return this.intersectsSphere(_sphere$4);
    }

    intersectsSprite(sprite) {
      _sphere$4.center.set(0, 0, 0);
      _sphere$4.radius = 0.7071067811865476;
      _sphere$4.applyMatrix4(sprite.matrixWorld);

      return this.intersectsSphere(_sphere$4);
    }

    intersectsSphere(sphere) {
      const planes = this.planes;
      const center = sphere.center;
      const negRadius = -sphere.radius;

      for (let i = 0; i < 6; i++) {
        const distance = planes[i].distanceToPoint(center);

        if (distance < negRadius) {
          return false;
        }
      }

      return true;
    }

    intersectsBox(box) {
      const planes = this.planes;

      for (let i = 0; i < 6; i++) {
        const plane = planes[i];

        // corner at max distance

        _vector$6.x = plane.normal.x > 0 ? box.max.x : box.min.x;
        _vector$6.y = plane.normal.y > 0 ? box.max.y : box.min.y;
        _vector$6.z = plane.normal.z > 0 ? box.max.z : box.min.z;

        if (plane.distanceToPoint(_vector$6) < 0) {
          return false;
        }
      }

      return true;
    }

    containsPoint(point) {
      const planes = this.planes;

      for (let i = 0; i < 6; i++) {
        if (planes[i].distanceToPoint(point) < 0) {
          return false;
        }
      }

      return true;
    }

    clone() {
      return new this.constructor().copy(this);
    }
  }

  class OrthographicCamera extends Camera {
    constructor(
      left = -1,
      right = 1,
      top = 1,
      bottom = -1,
      near = 0.1,
      far = 2000
    ) {
      super();

      this.isOrthographicCamera = true;

      this.type = "OrthographicCamera";

      this.zoom = 1;
      this.view = null;

      this.left = left;
      this.right = right;
      this.top = top;
      this.bottom = bottom;

      this.near = near;
      this.far = far;

      this.updateProjectionMatrix();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.left = source.left;
      this.right = source.right;
      this.top = source.top;
      this.bottom = source.bottom;
      this.near = source.near;
      this.far = source.far;

      this.zoom = source.zoom;
      this.view = source.view === null ? null : Object.assign({}, source.view);

      return this;
    }

    setViewOffset(fullWidth, fullHeight, x, y, width, height) {
      if (this.view === null) {
        this.view = {
          enabled: true,
          fullWidth: 1,
          fullHeight: 1,
          offsetX: 0,
          offsetY: 0,
          width: 1,
          height: 1,
        };
      }

      this.view.enabled = true;
      this.view.fullWidth = fullWidth;
      this.view.fullHeight = fullHeight;
      this.view.offsetX = x;
      this.view.offsetY = y;
      this.view.width = width;
      this.view.height = height;

      this.updateProjectionMatrix();
    }

    clearViewOffset() {
      if (this.view !== null) {
        this.view.enabled = false;
      }

      this.updateProjectionMatrix();
    }

    updateProjectionMatrix() {
      const dx = (this.right - this.left) / (2 * this.zoom);
      const dy = (this.top - this.bottom) / (2 * this.zoom);
      const cx = (this.right + this.left) / 2;
      const cy = (this.top + this.bottom) / 2;

      let left = cx - dx;
      let right = cx + dx;
      let top = cy + dy;
      let bottom = cy - dy;

      if (this.view !== null && this.view.enabled) {
        const scaleW =
          (this.right - this.left) / this.view.fullWidth / this.zoom;
        const scaleH =
          (this.top - this.bottom) / this.view.fullHeight / this.zoom;

        left += scaleW * this.view.offsetX;
        right = left + scaleW * this.view.width;
        top -= scaleH * this.view.offsetY;
        bottom = top - scaleH * this.view.height;
      }

      this.projectionMatrix.makeOrthographic(
        left,
        right,
        top,
        bottom,
        this.near,
        this.far,
        this.coordinateSystem
      );

      this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
    }

    toJSON(meta) {
      const data = super.toJSON(meta);

      data.object.zoom = this.zoom;
      data.object.left = this.left;
      data.object.right = this.right;
      data.object.top = this.top;
      data.object.bottom = this.bottom;
      data.object.near = this.near;
      data.object.far = this.far;

      if (this.view !== null) data.object.view = Object.assign({}, this.view);

      return data;
    }
  }

  class Group extends Object3D {
    constructor() {
      super();

      this.isGroup = true;

      this.type = "Group";
    }
  }

  class InterleavedBuffer {
    constructor(array, stride) {
      this.isInterleavedBuffer = true;

      this.array = array;
      this.stride = stride;
      this.count = array !== undefined ? array.length / stride : 0;

      this.usage = StaticDrawUsage;
      this.updateRange = { offset: 0, count: -1 };

      this.version = 0;

      this.uuid = generateUUID();
    }

    onUploadCallback() {}

    set needsUpdate(value) {
      if (value === true) this.version++;
    }

    setUsage(value) {
      this.usage = value;

      return this;
    }

    copy(source) {
      this.array = new source.array.constructor(source.array);
      this.count = source.count;
      this.stride = source.stride;
      this.usage = source.usage;

      return this;
    }

    copyAt(index1, attribute, index2) {
      index1 *= this.stride;
      index2 *= attribute.stride;

      for (let i = 0, l = this.stride; i < l; i++) {
        this.array[index1 + i] = attribute.array[index2 + i];
      }

      return this;
    }

    set(value, offset = 0) {
      this.array.set(value, offset);

      return this;
    }

    clone(data) {
      if (data.arrayBuffers === undefined) {
        data.arrayBuffers = {};
      }

      if (this.array.buffer._uuid === undefined) {
        this.array.buffer._uuid = generateUUID();
      }

      if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {
        data.arrayBuffers[this.array.buffer._uuid] = this.array.slice(0).buffer;
      }

      const array = new this.array.constructor(
        data.arrayBuffers[this.array.buffer._uuid]
      );

      const ib = new this.constructor(array, this.stride);
      ib.setUsage(this.usage);

      return ib;
    }

    onUpload(callback) {
      this.onUploadCallback = callback;

      return this;
    }

    toJSON(data) {
      if (data.arrayBuffers === undefined) {
        data.arrayBuffers = {};
      }

      // generate UUID for array buffer if necessary

      if (this.array.buffer._uuid === undefined) {
        this.array.buffer._uuid = generateUUID();
      }

      if (data.arrayBuffers[this.array.buffer._uuid] === undefined) {
        data.arrayBuffers[this.array.buffer._uuid] = Array.from(
          new Uint32Array(this.array.buffer)
        );
      }

      //

      return {
        uuid: this.uuid,
        buffer: this.array.buffer._uuid,
        type: this.array.constructor.name,
        stride: this.stride,
      };
    }
  }

  const _vector$5 = /*@__PURE__*/ new Vector3();

  class InterleavedBufferAttribute {
    constructor(interleavedBuffer, itemSize, offset, normalized = false) {
      this.isInterleavedBufferAttribute = true;

      this.name = "";

      this.data = interleavedBuffer;
      this.itemSize = itemSize;
      this.offset = offset;

      this.normalized = normalized;
    }

    get count() {
      return this.data.count;
    }

    get array() {
      return this.data.array;
    }

    set needsUpdate(value) {
      this.data.needsUpdate = value;
    }

    applyMatrix4(m) {
      for (let i = 0, l = this.data.count; i < l; i++) {
        _vector$5.fromBufferAttribute(this, i);

        _vector$5.applyMatrix4(m);

        this.setXYZ(i, _vector$5.x, _vector$5.y, _vector$5.z);
      }

      return this;
    }

    applyNormalMatrix(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$5.fromBufferAttribute(this, i);

        _vector$5.applyNormalMatrix(m);

        this.setXYZ(i, _vector$5.x, _vector$5.y, _vector$5.z);
      }

      return this;
    }

    transformDirection(m) {
      for (let i = 0, l = this.count; i < l; i++) {
        _vector$5.fromBufferAttribute(this, i);

        _vector$5.transformDirection(m);

        this.setXYZ(i, _vector$5.x, _vector$5.y, _vector$5.z);
      }

      return this;
    }

    setX(index, x) {
      if (this.normalized) x = normalize(x, this.array);

      this.data.array[index * this.data.stride + this.offset] = x;

      return this;
    }

    setY(index, y) {
      if (this.normalized) y = normalize(y, this.array);

      this.data.array[index * this.data.stride + this.offset + 1] = y;

      return this;
    }

    setZ(index, z) {
      if (this.normalized) z = normalize(z, this.array);

      this.data.array[index * this.data.stride + this.offset + 2] = z;

      return this;
    }

    setW(index, w) {
      if (this.normalized) w = normalize(w, this.array);

      this.data.array[index * this.data.stride + this.offset + 3] = w;

      return this;
    }

    getX(index) {
      let x = this.data.array[index * this.data.stride + this.offset];

      if (this.normalized) x = denormalize(x, this.array);

      return x;
    }

    getY(index) {
      let y = this.data.array[index * this.data.stride + this.offset + 1];

      if (this.normalized) y = denormalize(y, this.array);

      return y;
    }

    getZ(index) {
      let z = this.data.array[index * this.data.stride + this.offset + 2];

      if (this.normalized) z = denormalize(z, this.array);

      return z;
    }

    getW(index) {
      let w = this.data.array[index * this.data.stride + this.offset + 3];

      if (this.normalized) w = denormalize(w, this.array);

      return w;
    }

    setXY(index, x, y) {
      index = index * this.data.stride + this.offset;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
      }

      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;

      return this;
    }

    setXYZ(index, x, y, z) {
      index = index * this.data.stride + this.offset;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
      }

      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;
      this.data.array[index + 2] = z;

      return this;
    }

    setXYZW(index, x, y, z, w) {
      index = index * this.data.stride + this.offset;

      if (this.normalized) {
        x = normalize(x, this.array);
        y = normalize(y, this.array);
        z = normalize(z, this.array);
        w = normalize(w, this.array);
      }

      this.data.array[index + 0] = x;
      this.data.array[index + 1] = y;
      this.data.array[index + 2] = z;
      this.data.array[index + 3] = w;

      return this;
    }

    clone(data) {
      if (data === undefined) {
        console.log(
          "THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data."
        );

        const array = [];

        for (let i = 0; i < this.count; i++) {
          const index = i * this.data.stride + this.offset;

          for (let j = 0; j < this.itemSize; j++) {
            array.push(this.data.array[index + j]);
          }
        }

        return new BufferAttribute(
          new this.array.constructor(array),
          this.itemSize,
          this.normalized
        );
      } else {
        if (data.interleavedBuffers === undefined) {
          data.interleavedBuffers = {};
        }

        if (data.interleavedBuffers[this.data.uuid] === undefined) {
          data.interleavedBuffers[this.data.uuid] = this.data.clone(data);
        }

        return new InterleavedBufferAttribute(
          data.interleavedBuffers[this.data.uuid],
          this.itemSize,
          this.offset,
          this.normalized
        );
      }
    }

    toJSON(data) {
      if (data === undefined) {
        console.log(
          "THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data."
        );

        const array = [];

        for (let i = 0; i < this.count; i++) {
          const index = i * this.data.stride + this.offset;

          for (let j = 0; j < this.itemSize; j++) {
            array.push(this.data.array[index + j]);
          }
        }

        // de-interleave data and save it as an ordinary buffer attribute for now

        return {
          itemSize: this.itemSize,
          type: this.array.constructor.name,
          array: array,
          normalized: this.normalized,
        };
      } else {
        // save as true interleaved attribute

        if (data.interleavedBuffers === undefined) {
          data.interleavedBuffers = {};
        }

        if (data.interleavedBuffers[this.data.uuid] === undefined) {
          data.interleavedBuffers[this.data.uuid] = this.data.toJSON(data);
        }

        return {
          isInterleavedBufferAttribute: true,
          itemSize: this.itemSize,
          data: this.data.uuid,
          offset: this.offset,
          normalized: this.normalized,
        };
      }
    }
  }

  const _basePosition = /*@__PURE__*/ new Vector3();

  const _skinIndex = /*@__PURE__*/ new Vector4();
  const _skinWeight = /*@__PURE__*/ new Vector4();

  const _vector3 = /*@__PURE__*/ new Vector3();
  const _matrix4 = /*@__PURE__*/ new Matrix4();
  const _vertex = /*@__PURE__*/ new Vector3();

  const _sphere$3 = /*@__PURE__*/ new Sphere();
  const _inverseMatrix$2 = /*@__PURE__*/ new Matrix4();
  const _ray$2 = /*@__PURE__*/ new Ray();

  class SkinnedMesh extends Mesh {
    constructor(geometry, material) {
      super(geometry, material);

      this.isSkinnedMesh = true;

      this.type = "SkinnedMesh";

      this.bindMode = "attached";
      this.bindMatrix = new Matrix4();
      this.bindMatrixInverse = new Matrix4();

      this.boundingBox = null;
      this.boundingSphere = null;
    }

    computeBoundingBox() {
      const geometry = this.geometry;

      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }

      this.boundingBox.makeEmpty();

      const positionAttribute = geometry.getAttribute("position");

      for (let i = 0; i < positionAttribute.count; i++) {
        _vertex.fromBufferAttribute(positionAttribute, i);
        this.applyBoneTransform(i, _vertex);
        this.boundingBox.expandByPoint(_vertex);
      }
    }

    computeBoundingSphere() {
      const geometry = this.geometry;

      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }

      this.boundingSphere.makeEmpty();

      const positionAttribute = geometry.getAttribute("position");

      for (let i = 0; i < positionAttribute.count; i++) {
        _vertex.fromBufferAttribute(positionAttribute, i);
        this.applyBoneTransform(i, _vertex);
        this.boundingSphere.expandByPoint(_vertex);
      }
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.bindMode = source.bindMode;
      this.bindMatrix.copy(source.bindMatrix);
      this.bindMatrixInverse.copy(source.bindMatrixInverse);

      this.skeleton = source.skeleton;

      if (source.boundingBox !== null)
        this.boundingBox = source.boundingBox.clone();
      if (source.boundingSphere !== null)
        this.boundingSphere = source.boundingSphere.clone();

      return this;
    }

    raycast(raycaster, intersects) {
      const material = this.material;
      const matrixWorld = this.matrixWorld;

      if (material === undefined) return;

      // test with bounding sphere in world space

      if (this.boundingSphere === null) this.computeBoundingSphere();

      _sphere$3.copy(this.boundingSphere);
      _sphere$3.applyMatrix4(matrixWorld);

      if (raycaster.ray.intersectsSphere(_sphere$3) === false) return;

      // convert ray to local space of skinned mesh

      _inverseMatrix$2.copy(matrixWorld).invert();
      _ray$2.copy(raycaster.ray).applyMatrix4(_inverseMatrix$2);

      // test with bounding box in local space

      if (this.boundingBox !== null) {
        if (_ray$2.intersectsBox(this.boundingBox) === false) return;
      }

      // test for intersections with geometry

      this._computeIntersections(raycaster, intersects, _ray$2);
    }

    getVertexPosition(index, target) {
      super.getVertexPosition(index, target);

      this.applyBoneTransform(index, target);

      return target;
    }

    bind(skeleton, bindMatrix) {
      this.skeleton = skeleton;

      if (bindMatrix === undefined) {
        this.updateMatrixWorld(true);

        this.skeleton.calculateInverses();

        bindMatrix = this.matrixWorld;
      }

      this.bindMatrix.copy(bindMatrix);
      this.bindMatrixInverse.copy(bindMatrix).invert();
    }

    pose() {
      this.skeleton.pose();
    }

    normalizeSkinWeights() {
      const vector = new Vector4();

      const skinWeight = this.geometry.attributes.skinWeight;

      for (let i = 0, l = skinWeight.count; i < l; i++) {
        vector.fromBufferAttribute(skinWeight, i);

        const scale = 1.0 / vector.manhattanLength();

        if (scale !== Infinity) {
          vector.multiplyScalar(scale);
        } else {
          vector.set(1, 0, 0, 0); // do something reasonable
        }

        skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
      }
    }

    updateMatrixWorld(force) {
      super.updateMatrixWorld(force);

      if (this.bindMode === "attached") {
        this.bindMatrixInverse.copy(this.matrixWorld).invert();
      } else if (this.bindMode === "detached") {
        this.bindMatrixInverse.copy(this.bindMatrix).invert();
      } else {
        console.warn(
          "THREE.SkinnedMesh: Unrecognized bindMode: " + this.bindMode
        );
      }
    }

    applyBoneTransform(index, vector) {
      const skeleton = this.skeleton;
      const geometry = this.geometry;

      _skinIndex.fromBufferAttribute(geometry.attributes.skinIndex, index);
      _skinWeight.fromBufferAttribute(geometry.attributes.skinWeight, index);

      _basePosition.copy(vector).applyMatrix4(this.bindMatrix);

      vector.set(0, 0, 0);

      for (let i = 0; i < 4; i++) {
        const weight = _skinWeight.getComponent(i);

        if (weight !== 0) {
          const boneIndex = _skinIndex.getComponent(i);

          _matrix4.multiplyMatrices(
            skeleton.bones[boneIndex].matrixWorld,
            skeleton.boneInverses[boneIndex]
          );

          vector.addScaledVector(
            _vector3.copy(_basePosition).applyMatrix4(_matrix4),
            weight
          );
        }
      }

      return vector.applyMatrix4(this.bindMatrixInverse);
    }

    boneTransform(index, vector) {
      // @deprecated, r151

      console.warn(
        "THREE.SkinnedMesh: .boneTransform() was renamed to .applyBoneTransform() in r151."
      );
      return this.applyBoneTransform(index, vector);
    }
  }

  class Bone extends Object3D {
    constructor() {
      super();

      this.isBone = true;

      this.type = "Bone";
    }
  }

  class DataTexture extends Texture {
    constructor(
      data = null,
      width = 1,
      height = 1,
      format,
      type,
      mapping,
      wrapS,
      wrapT,
      magFilter = NearestFilter,
      minFilter = NearestFilter,
      anisotropy,
      colorSpace
    ) {
      super(
        null,
        mapping,
        wrapS,
        wrapT,
        magFilter,
        minFilter,
        format,
        type,
        anisotropy,
        colorSpace
      );

      this.isDataTexture = true;

      this.image = { data: data, width: width, height: height };

      this.generateMipmaps = false;
      this.flipY = false;
      this.unpackAlignment = 1;
    }
  }

  const _offsetMatrix = /*@__PURE__*/ new Matrix4();
  const _identityMatrix$1 = /*@__PURE__*/ new Matrix4();

  class Skeleton {
    constructor(bones = [], boneInverses = []) {
      this.uuid = generateUUID();

      this.bones = bones.slice(0);
      this.boneInverses = boneInverses;
      this.boneMatrices = null;

      this.boneTexture = null;
      this.boneTextureSize = 0;

      this.init();
    }

    init() {
      const bones = this.bones;
      const boneInverses = this.boneInverses;

      this.boneMatrices = new Float32Array(bones.length * 16);

      // calculate inverse bone matrices if necessary

      if (boneInverses.length === 0) {
        this.calculateInverses();
      } else {
        // handle special case

        if (bones.length !== boneInverses.length) {
          console.warn(
            "THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."
          );

          this.boneInverses = [];

          for (let i = 0, il = this.bones.length; i < il; i++) {
            this.boneInverses.push(new Matrix4());
          }
        }
      }
    }

    calculateInverses() {
      this.boneInverses.length = 0;

      for (let i = 0, il = this.bones.length; i < il; i++) {
        const inverse = new Matrix4();

        if (this.bones[i]) {
          inverse.copy(this.bones[i].matrixWorld).invert();
        }

        this.boneInverses.push(inverse);
      }
    }

    pose() {
      // recover the bind-time world matrices

      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];

        if (bone) {
          bone.matrixWorld.copy(this.boneInverses[i]).invert();
        }
      }

      // compute the local matrices, positions, rotations and scales

      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];

        if (bone) {
          if (bone.parent && bone.parent.isBone) {
            bone.matrix.copy(bone.parent.matrixWorld).invert();
            bone.matrix.multiply(bone.matrixWorld);
          } else {
            bone.matrix.copy(bone.matrixWorld);
          }

          bone.matrix.decompose(bone.position, bone.quaternion, bone.scale);
        }
      }
    }

    update() {
      const bones = this.bones;
      const boneInverses = this.boneInverses;
      const boneMatrices = this.boneMatrices;
      const boneTexture = this.boneTexture;

      // flatten bone matrices to array

      for (let i = 0, il = bones.length; i < il; i++) {
        // compute the offset between the current and the original transform

        const matrix = bones[i] ? bones[i].matrixWorld : _identityMatrix$1;

        _offsetMatrix.multiplyMatrices(matrix, boneInverses[i]);
        _offsetMatrix.toArray(boneMatrices, i * 16);
      }

      if (boneTexture !== null) {
        boneTexture.needsUpdate = true;
      }
    }

    clone() {
      return new Skeleton(this.bones, this.boneInverses);
    }

    computeBoneTexture() {
      // layout (1 matrix = 4 pixels)
      //      RGBA RGBA RGBA RGBA (=> column1, column2, column3, column4)
      //  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
      //       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
      //       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
      //       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)

      let size = Math.sqrt(this.bones.length * 4); // 4 pixels needed for 1 matrix
      size = ceilPowerOfTwo(size);
      size = Math.max(size, 4);

      const boneMatrices = new Float32Array(size * size * 4); // 4 floats per RGBA pixel
      boneMatrices.set(this.boneMatrices); // copy current values

      const boneTexture = new DataTexture(
        boneMatrices,
        size,
        size,
        RGBAFormat,
        FloatType
      );
      boneTexture.needsUpdate = true;

      this.boneMatrices = boneMatrices;
      this.boneTexture = boneTexture;
      this.boneTextureSize = size;

      return this;
    }

    getBoneByName(name) {
      for (let i = 0, il = this.bones.length; i < il; i++) {
        const bone = this.bones[i];

        if (bone.name === name) {
          return bone;
        }
      }

      return undefined;
    }

    dispose() {
      if (this.boneTexture !== null) {
        this.boneTexture.dispose();

        this.boneTexture = null;
      }
    }

    fromJSON(json, bones) {
      this.uuid = json.uuid;

      for (let i = 0, l = json.bones.length; i < l; i++) {
        const uuid = json.bones[i];
        let bone = bones[uuid];

        if (bone === undefined) {
          console.warn("THREE.Skeleton: No bone found with UUID:", uuid);
          bone = new Bone();
        }

        this.bones.push(bone);
        this.boneInverses.push(new Matrix4().fromArray(json.boneInverses[i]));
      }

      this.init();

      return this;
    }

    toJSON() {
      const data = {
        metadata: {
          version: 4.6,
          type: "Skeleton",
          generator: "Skeleton.toJSON",
        },
        bones: [],
        boneInverses: [],
      };

      data.uuid = this.uuid;

      const bones = this.bones;
      const boneInverses = this.boneInverses;

      for (let i = 0, l = bones.length; i < l; i++) {
        const bone = bones[i];
        data.bones.push(bone.uuid);

        const boneInverse = boneInverses[i];
        data.boneInverses.push(boneInverse.toArray());
      }

      return data;
    }
  }

  class InstancedBufferAttribute extends BufferAttribute {
    constructor(array, itemSize, normalized, meshPerAttribute = 1) {
      super(array, itemSize, normalized);

      this.isInstancedBufferAttribute = true;

      this.meshPerAttribute = meshPerAttribute;
    }

    copy(source) {
      super.copy(source);

      this.meshPerAttribute = source.meshPerAttribute;

      return this;
    }

    toJSON() {
      const data = super.toJSON();

      data.meshPerAttribute = this.meshPerAttribute;

      data.isInstancedBufferAttribute = true;

      return data;
    }
  }

  const _instanceLocalMatrix = /*@__PURE__*/ new Matrix4();
  const _instanceWorldMatrix = /*@__PURE__*/ new Matrix4();

  const _instanceIntersects = [];

  const _box3 = /*@__PURE__*/ new Box3();
  const _identity = /*@__PURE__*/ new Matrix4();
  const _mesh = /*@__PURE__*/ new Mesh();
  const _sphere$2 = /*@__PURE__*/ new Sphere();

  class InstancedMesh extends Mesh {
    constructor(geometry, material, count) {
      super(geometry, material);

      this.isInstancedMesh = true;

      this.instanceMatrix = new InstancedBufferAttribute(
        new Float32Array(count * 16),
        16
      );
      this.instanceColor = null;

      this.count = count;

      this.boundingBox = null;
      this.boundingSphere = null;

      for (let i = 0; i < count; i++) {
        this.setMatrixAt(i, _identity);
      }
    }

    computeBoundingBox() {
      const geometry = this.geometry;
      const count = this.count;

      if (this.boundingBox === null) {
        this.boundingBox = new Box3();
      }

      if (geometry.boundingBox === null) {
        geometry.computeBoundingBox();
      }

      this.boundingBox.makeEmpty();

      for (let i = 0; i < count; i++) {
        this.getMatrixAt(i, _instanceLocalMatrix);

        _box3.copy(geometry.boundingBox).applyMatrix4(_instanceLocalMatrix);

        this.boundingBox.union(_box3);
      }
    }

    computeBoundingSphere() {
      const geometry = this.geometry;
      const count = this.count;

      if (this.boundingSphere === null) {
        this.boundingSphere = new Sphere();
      }

      if (geometry.boundingSphere === null) {
        geometry.computeBoundingSphere();
      }

      this.boundingSphere.makeEmpty();

      for (let i = 0; i < count; i++) {
        this.getMatrixAt(i, _instanceLocalMatrix);

        _sphere$2
          .copy(geometry.boundingSphere)
          .applyMatrix4(_instanceLocalMatrix);

        this.boundingSphere.union(_sphere$2);
      }
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.instanceMatrix.copy(source.instanceMatrix);

      if (source.instanceColor !== null)
        this.instanceColor = source.instanceColor.clone();

      this.count = source.count;

      if (source.boundingBox !== null)
        this.boundingBox = source.boundingBox.clone();
      if (source.boundingSphere !== null)
        this.boundingSphere = source.boundingSphere.clone();

      return this;
    }

    getColorAt(index, color) {
      color.fromArray(this.instanceColor.array, index * 3);
    }

    getMatrixAt(index, matrix) {
      matrix.fromArray(this.instanceMatrix.array, index * 16);
    }

    raycast(raycaster, intersects) {
      const matrixWorld = this.matrixWorld;
      const raycastTimes = this.count;

      _mesh.geometry = this.geometry;
      _mesh.material = this.material;

      if (_mesh.material === undefined) return;

      // test with bounding sphere first

      if (this.boundingSphere === null) this.computeBoundingSphere();

      _sphere$2.copy(this.boundingSphere);
      _sphere$2.applyMatrix4(matrixWorld);

      if (raycaster.ray.intersectsSphere(_sphere$2) === false) return;

      // now test each instance

      for (let instanceId = 0; instanceId < raycastTimes; instanceId++) {
        // calculate the world matrix for each instance

        this.getMatrixAt(instanceId, _instanceLocalMatrix);

        _instanceWorldMatrix.multiplyMatrices(
          matrixWorld,
          _instanceLocalMatrix
        );

        // the mesh represents this single instance

        _mesh.matrixWorld = _instanceWorldMatrix;

        _mesh.raycast(raycaster, _instanceIntersects);

        // process the result of raycast

        for (let i = 0, l = _instanceIntersects.length; i < l; i++) {
          const intersect = _instanceIntersects[i];
          intersect.instanceId = instanceId;
          intersect.object = this;
          intersects.push(intersect);
        }

        _instanceIntersects.length = 0;
      }
    }

    setColorAt(index, color) {
      if (this.instanceColor === null) {
        this.instanceColor = new InstancedBufferAttribute(
          new Float32Array(this.instanceMatrix.count * 3),
          3
        );
      }

      color.toArray(this.instanceColor.array, index * 3);
    }

    setMatrixAt(index, matrix) {
      matrix.toArray(this.instanceMatrix.array, index * 16);
    }

    updateMorphTargets() {}

    dispose() {
      this.dispatchEvent({ type: "dispose" });
    }
  }

  class LineBasicMaterial extends Material {
    constructor(parameters) {
      super();

      this.isLineBasicMaterial = true;

      this.type = "LineBasicMaterial";

      this.color = new Color(0xffffff);

      this.map = null;

      this.linewidth = 1;
      this.linecap = "round";
      this.linejoin = "round";

      this.fog = true;

      this.setValues(parameters);
    }

    copy(source) {
      super.copy(source);

      this.color.copy(source.color);

      this.map = source.map;

      this.linewidth = source.linewidth;
      this.linecap = source.linecap;
      this.linejoin = source.linejoin;

      this.fog = source.fog;

      return this;
    }
  }

  const _start$1 = /*@__PURE__*/ new Vector3();
  const _end$1 = /*@__PURE__*/ new Vector3();
  const _inverseMatrix$1 = /*@__PURE__*/ new Matrix4();
  const _ray$1 = /*@__PURE__*/ new Ray();
  const _sphere$1 = /*@__PURE__*/ new Sphere();

  class Line extends Object3D {
    constructor(
      geometry = new BufferGeometry(),
      material = new LineBasicMaterial()
    ) {
      super();

      this.isLine = true;

      this.type = "Line";

      this.geometry = geometry;
      this.material = material;

      this.updateMorphTargets();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.material = source.material;
      this.geometry = source.geometry;

      return this;
    }

    computeLineDistances() {
      const geometry = this.geometry;

      // we assume non-indexed geometry

      if (geometry.index === null) {
        const positionAttribute = geometry.attributes.position;
        const lineDistances = [0];

        for (let i = 1, l = positionAttribute.count; i < l; i++) {
          _start$1.fromBufferAttribute(positionAttribute, i - 1);
          _end$1.fromBufferAttribute(positionAttribute, i);

          lineDistances[i] = lineDistances[i - 1];
          lineDistances[i] += _start$1.distanceTo(_end$1);
        }

        geometry.setAttribute(
          "lineDistance",
          new Float32BufferAttribute(lineDistances, 1)
        );
      } else {
        console.warn(
          "THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
        );
      }

      return this;
    }

    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const matrixWorld = this.matrixWorld;
      const threshold = raycaster.params.Line.threshold;
      const drawRange = geometry.drawRange;

      // Checking boundingSphere distance to ray

      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

      _sphere$1.copy(geometry.boundingSphere);
      _sphere$1.applyMatrix4(matrixWorld);
      _sphere$1.radius += threshold;

      if (raycaster.ray.intersectsSphere(_sphere$1) === false) return;

      //

      _inverseMatrix$1.copy(matrixWorld).invert();
      _ray$1.copy(raycaster.ray).applyMatrix4(_inverseMatrix$1);

      const localThreshold =
        threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
      const localThresholdSq = localThreshold * localThreshold;

      const vStart = new Vector3();
      const vEnd = new Vector3();
      const interSegment = new Vector3();
      const interRay = new Vector3();
      const step = this.isLineSegments ? 2 : 1;

      const index = geometry.index;
      const attributes = geometry.attributes;
      const positionAttribute = attributes.position;

      if (index !== null) {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(index.count, drawRange.start + drawRange.count);

        for (let i = start, l = end - 1; i < l; i += step) {
          const a = index.getX(i);
          const b = index.getX(i + 1);

          vStart.fromBufferAttribute(positionAttribute, a);
          vEnd.fromBufferAttribute(positionAttribute, b);

          const distSq = _ray$1.distanceSqToSegment(
            vStart,
            vEnd,
            interRay,
            interSegment
          );

          if (distSq > localThresholdSq) continue;

          interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

          const distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this,
          });
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(
          positionAttribute.count,
          drawRange.start + drawRange.count
        );

        for (let i = start, l = end - 1; i < l; i += step) {
          vStart.fromBufferAttribute(positionAttribute, i);
          vEnd.fromBufferAttribute(positionAttribute, i + 1);

          const distSq = _ray$1.distanceSqToSegment(
            vStart,
            vEnd,
            interRay,
            interSegment
          );

          if (distSq > localThresholdSq) continue;

          interRay.applyMatrix4(this.matrixWorld); //Move back to world space for distance calculation

          const distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this,
          });
        }
      }
    }

    updateMorphTargets() {
      const geometry = this.geometry;

      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);

      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];

        if (morphAttribute !== undefined) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};

          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);

            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
  }

  const _start = /*@__PURE__*/ new Vector3();
  const _end = /*@__PURE__*/ new Vector3();

  class LineSegments extends Line {
    constructor(geometry, material) {
      super(geometry, material);

      this.isLineSegments = true;

      this.type = "LineSegments";
    }

    computeLineDistances() {
      const geometry = this.geometry;

      // we assume non-indexed geometry

      if (geometry.index === null) {
        const positionAttribute = geometry.attributes.position;
        const lineDistances = [];

        for (let i = 0, l = positionAttribute.count; i < l; i += 2) {
          _start.fromBufferAttribute(positionAttribute, i);
          _end.fromBufferAttribute(positionAttribute, i + 1);

          lineDistances[i] = i === 0 ? 0 : lineDistances[i - 1];
          lineDistances[i + 1] = lineDistances[i] + _start.distanceTo(_end);
        }

        geometry.setAttribute(
          "lineDistance",
          new Float32BufferAttribute(lineDistances, 1)
        );
      } else {
        console.warn(
          "THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry."
        );
      }

      return this;
    }
  }

  class LineLoop extends Line {
    constructor(geometry, material) {
      super(geometry, material);

      this.isLineLoop = true;

      this.type = "LineLoop";
    }
  }

  class PointsMaterial extends Material {
    constructor(parameters) {
      super();

      this.isPointsMaterial = true;

      this.type = "PointsMaterial";

      this.color = new Color(0xffffff);

      this.map = null;

      this.alphaMap = null;

      this.size = 1;
      this.sizeAttenuation = true;

      this.fog = true;

      this.setValues(parameters);
    }

    copy(source) {
      super.copy(source);

      this.color.copy(source.color);

      this.map = source.map;

      this.alphaMap = source.alphaMap;

      this.size = source.size;
      this.sizeAttenuation = source.sizeAttenuation;

      this.fog = source.fog;

      return this;
    }
  }

  const _inverseMatrix = /*@__PURE__*/ new Matrix4();
  const _ray = /*@__PURE__*/ new Ray();
  const _sphere = /*@__PURE__*/ new Sphere();
  const _position$2 = /*@__PURE__*/ new Vector3();

  class Points extends Object3D {
    constructor(
      geometry = new BufferGeometry(),
      material = new PointsMaterial()
    ) {
      super();

      this.isPoints = true;

      this.type = "Points";

      this.geometry = geometry;
      this.material = material;

      this.updateMorphTargets();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.material = source.material;
      this.geometry = source.geometry;

      return this;
    }

    raycast(raycaster, intersects) {
      const geometry = this.geometry;
      const matrixWorld = this.matrixWorld;
      const threshold = raycaster.params.Points.threshold;
      const drawRange = geometry.drawRange;

      // Checking boundingSphere distance to ray

      if (geometry.boundingSphere === null) geometry.computeBoundingSphere();

      _sphere.copy(geometry.boundingSphere);
      _sphere.applyMatrix4(matrixWorld);
      _sphere.radius += threshold;

      if (raycaster.ray.intersectsSphere(_sphere) === false) return;

      //

      _inverseMatrix.copy(matrixWorld).invert();
      _ray.copy(raycaster.ray).applyMatrix4(_inverseMatrix);

      const localThreshold =
        threshold / ((this.scale.x + this.scale.y + this.scale.z) / 3);
      const localThresholdSq = localThreshold * localThreshold;

      const index = geometry.index;
      const attributes = geometry.attributes;
      const positionAttribute = attributes.position;

      if (index !== null) {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(index.count, drawRange.start + drawRange.count);

        for (let i = start, il = end; i < il; i++) {
          const a = index.getX(i);

          _position$2.fromBufferAttribute(positionAttribute, a);

          testPoint(
            _position$2,
            a,
            localThresholdSq,
            matrixWorld,
            raycaster,
            intersects,
            this
          );
        }
      } else {
        const start = Math.max(0, drawRange.start);
        const end = Math.min(
          positionAttribute.count,
          drawRange.start + drawRange.count
        );

        for (let i = start, l = end; i < l; i++) {
          _position$2.fromBufferAttribute(positionAttribute, i);

          testPoint(
            _position$2,
            i,
            localThresholdSq,
            matrixWorld,
            raycaster,
            intersects,
            this
          );
        }
      }
    }

    updateMorphTargets() {
      const geometry = this.geometry;

      const morphAttributes = geometry.morphAttributes;
      const keys = Object.keys(morphAttributes);

      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];

        if (morphAttribute !== undefined) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};

          for (let m = 0, ml = morphAttribute.length; m < ml; m++) {
            const name = morphAttribute[m].name || String(m);

            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
  }

  function testPoint(
    point,
    index,
    localThresholdSq,
    matrixWorld,
    raycaster,
    intersects,
    object
  ) {
    const rayPointDistanceSq = _ray.distanceSqToPoint(point);

    if (rayPointDistanceSq < localThresholdSq) {
      const intersectPoint = new Vector3();

      _ray.closestPointToPoint(point, intersectPoint);
      intersectPoint.applyMatrix4(matrixWorld);

      const distance = raycaster.ray.origin.distanceTo(intersectPoint);

      if (distance < raycaster.near || distance > raycaster.far) return;

      intersects.push({
        distance: distance,
        distanceToRay: Math.sqrt(rayPointDistanceSq),
        point: intersectPoint,
        index: index,
        face: null,
        object: object,
      });
    }
  }

  class MeshStandardMaterial extends Material {
    constructor(parameters) {
      super();

      this.isMeshStandardMaterial = true;

      this.defines = { STANDARD: "" };

      this.type = "MeshStandardMaterial";

      this.color = new Color(0xffffff); // diffuse
      this.roughness = 1.0;
      this.metalness = 0.0;

      this.map = null;

      this.lightMap = null;
      this.lightMapIntensity = 1.0;

      this.aoMap = null;
      this.aoMapIntensity = 1.0;

      this.emissive = new Color(0x000000);
      this.emissiveIntensity = 1.0;
      this.emissiveMap = null;

      this.bumpMap = null;
      this.bumpScale = 1;

      this.normalMap = null;
      this.normalMapType = TangentSpaceNormalMap;
      this.normalScale = new Vector2(1, 1);

      this.displacementMap = null;
      this.displacementScale = 1;
      this.displacementBias = 0;

      this.roughnessMap = null;

      this.metalnessMap = null;

      this.alphaMap = null;

      this.envMap = null;
      this.envMapIntensity = 1.0;

      this.wireframe = false;
      this.wireframeLinewidth = 1;
      this.wireframeLinecap = "round";
      this.wireframeLinejoin = "round";

      this.flatShading = false;

      this.fog = true;

      this.setValues(parameters);
    }

    copy(source) {
      super.copy(source);

      this.defines = { STANDARD: "" };

      this.color.copy(source.color);
      this.roughness = source.roughness;
      this.metalness = source.metalness;

      this.map = source.map;

      this.lightMap = source.lightMap;
      this.lightMapIntensity = source.lightMapIntensity;

      this.aoMap = source.aoMap;
      this.aoMapIntensity = source.aoMapIntensity;

      this.emissive.copy(source.emissive);
      this.emissiveMap = source.emissiveMap;
      this.emissiveIntensity = source.emissiveIntensity;

      this.bumpMap = source.bumpMap;
      this.bumpScale = source.bumpScale;

      this.normalMap = source.normalMap;
      this.normalMapType = source.normalMapType;
      this.normalScale.copy(source.normalScale);

      this.displacementMap = source.displacementMap;
      this.displacementScale = source.displacementScale;
      this.displacementBias = source.displacementBias;

      this.roughnessMap = source.roughnessMap;

      this.metalnessMap = source.metalnessMap;

      this.alphaMap = source.alphaMap;

      this.envMap = source.envMap;
      this.envMapIntensity = source.envMapIntensity;

      this.wireframe = source.wireframe;
      this.wireframeLinewidth = source.wireframeLinewidth;
      this.wireframeLinecap = source.wireframeLinecap;
      this.wireframeLinejoin = source.wireframeLinejoin;

      this.flatShading = source.flatShading;

      this.fog = source.fog;

      return this;
    }
  }

  class MeshPhysicalMaterial extends MeshStandardMaterial {
    constructor(parameters) {
      super();

      this.isMeshPhysicalMaterial = true;

      this.defines = {
        STANDARD: "",
        PHYSICAL: "",
      };

      this.type = "MeshPhysicalMaterial";

      this.anisotropyRotation = 0;
      this.anisotropyMap = null;

      this.clearcoatMap = null;
      this.clearcoatRoughness = 0.0;
      this.clearcoatRoughnessMap = null;
      this.clearcoatNormalScale = new Vector2(1, 1);
      this.clearcoatNormalMap = null;

      this.ior = 1.5;

      Object.defineProperty(this, "reflectivity", {
        get: function () {
          return clamp((2.5 * (this.ior - 1)) / (this.ior + 1), 0, 1);
        },
        set: function (reflectivity) {
          this.ior = (1 + 0.4 * reflectivity) / (1 - 0.4 * reflectivity);
        },
      });

      this.iridescenceMap = null;
      this.iridescenceIOR = 1.3;
      this.iridescenceThicknessRange = [100, 400];
      this.iridescenceThicknessMap = null;

      this.sheenColor = new Color(0x000000);
      this.sheenColorMap = null;
      this.sheenRoughness = 1.0;
      this.sheenRoughnessMap = null;

      this.transmissionMap = null;

      this.thickness = 0;
      this.thicknessMap = null;
      this.attenuationDistance = Infinity;
      this.attenuationColor = new Color(1, 1, 1);

      this.specularIntensity = 1.0;
      this.specularIntensityMap = null;
      this.specularColor = new Color(1, 1, 1);
      this.specularColorMap = null;

      this._anisotropy = 0;
      this._clearcoat = 0;
      this._iridescence = 0;
      this._sheen = 0.0;
      this._transmission = 0;

      this.setValues(parameters);
    }

    get anisotropy() {
      return this._anisotropy;
    }

    set anisotropy(value) {
      if (this._anisotropy > 0 !== value > 0) {
        this.version++;
      }

      this._anisotropy = value;
    }

    get clearcoat() {
      return this._clearcoat;
    }

    set clearcoat(value) {
      if (this._clearcoat > 0 !== value > 0) {
        this.version++;
      }

      this._clearcoat = value;
    }

    get iridescence() {
      return this._iridescence;
    }

    set iridescence(value) {
      if (this._iridescence > 0 !== value > 0) {
        this.version++;
      }

      this._iridescence = value;
    }

    get sheen() {
      return this._sheen;
    }

    set sheen(value) {
      if (this._sheen > 0 !== value > 0) {
        this.version++;
      }

      this._sheen = value;
    }

    get transmission() {
      return this._transmission;
    }

    set transmission(value) {
      if (this._transmission > 0 !== value > 0) {
        this.version++;
      }

      this._transmission = value;
    }

    copy(source) {
      super.copy(source);

      this.defines = {
        STANDARD: "",
        PHYSICAL: "",
      };

      this.anisotropy = source.anisotropy;
      this.anisotropyRotation = source.anisotropyRotation;
      this.anisotropyMap = source.anisotropyMap;

      this.clearcoat = source.clearcoat;
      this.clearcoatMap = source.clearcoatMap;
      this.clearcoatRoughness = source.clearcoatRoughness;
      this.clearcoatRoughnessMap = source.clearcoatRoughnessMap;
      this.clearcoatNormalMap = source.clearcoatNormalMap;
      this.clearcoatNormalScale.copy(source.clearcoatNormalScale);

      this.ior = source.ior;

      this.iridescence = source.iridescence;
      this.iridescenceMap = source.iridescenceMap;
      this.iridescenceIOR = source.iridescenceIOR;
      this.iridescenceThicknessRange = [...source.iridescenceThicknessRange];
      this.iridescenceThicknessMap = source.iridescenceThicknessMap;

      this.sheen = source.sheen;
      this.sheenColor.copy(source.sheenColor);
      this.sheenColorMap = source.sheenColorMap;
      this.sheenRoughness = source.sheenRoughness;
      this.sheenRoughnessMap = source.sheenRoughnessMap;

      this.transmission = source.transmission;
      this.transmissionMap = source.transmissionMap;

      this.thickness = source.thickness;
      this.thicknessMap = source.thicknessMap;
      this.attenuationDistance = source.attenuationDistance;
      this.attenuationColor.copy(source.attenuationColor);

      this.specularIntensity = source.specularIntensity;
      this.specularIntensityMap = source.specularIntensityMap;
      this.specularColor.copy(source.specularColor);
      this.specularColorMap = source.specularColorMap;

      return this;
    }
  }

  // same as Array.prototype.slice, but also works on typed arrays
  function arraySlice(array, from, to) {
    if (isTypedArray(array)) {
      // in ios9 array.subarray(from, undefined) will return empty array
      // but array.subarray(from) or array.subarray(from, len) is correct
      return new array.constructor(
        array.subarray(from, to !== undefined ? to : array.length)
      );
    }

    return array.slice(from, to);
  }

  // converts an array to a specific type
  function convertArray(array, type, forceClone) {
    if (
      !array || // let 'undefined' and 'null' pass
      (!forceClone && array.constructor === type)
    )
      return array;

    if (typeof type.BYTES_PER_ELEMENT === "number") {
      return new type(array); // create typed array
    }

    return Array.prototype.slice.call(array); // create Array
  }

  function isTypedArray(object) {
    return ArrayBuffer.isView(object) && !(object instanceof DataView);
  }

  // returns an array by which times and values can be sorted
  function getKeyframeOrder(times) {
    function compareTime(i, j) {
      return times[i] - times[j];
    }

    const n = times.length;
    const result = new Array(n);
    for (let i = 0; i !== n; ++i) result[i] = i;

    result.sort(compareTime);

    return result;
  }

  // uses the array previously returned by 'getKeyframeOrder' to sort data
  function sortedArray(values, stride, order) {
    const nValues = values.length;
    const result = new values.constructor(nValues);

    for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++i) {
      const srcOffset = order[i] * stride;

      for (let j = 0; j !== stride; ++j) {
        result[dstOffset++] = values[srcOffset + j];
      }
    }

    return result;
  }

  // function for parsing AOS keyframe formats
  function flattenJSON(jsonKeys, times, values, valuePropertyName) {
    let i = 1,
      key = jsonKeys[0];

    while (key !== undefined && key[valuePropertyName] === undefined) {
      key = jsonKeys[i++];
    }

    if (key === undefined) return; // no data

    let value = key[valuePropertyName];
    if (value === undefined) return; // no data

    if (Array.isArray(value)) {
      do {
        value = key[valuePropertyName];

        if (value !== undefined) {
          times.push(key.time);
          values.push.apply(values, value); // push all elements
        }

        key = jsonKeys[i++];
      } while (key !== undefined);
    } else if (value.toArray !== undefined) {
      // ...assume THREE.Math-ish

      do {
        value = key[valuePropertyName];

        if (value !== undefined) {
          times.push(key.time);
          value.toArray(values, values.length);
        }

        key = jsonKeys[i++];
      } while (key !== undefined);
    } else {
      // otherwise push as-is

      do {
        value = key[valuePropertyName];

        if (value !== undefined) {
          times.push(key.time);
          values.push(value);
        }

        key = jsonKeys[i++];
      } while (key !== undefined);
    }
  }

  /**
   * Abstract base class of interpolants over parametric samples.
   *
   * The parameter domain is one dimensional, typically the time or a path
   * along a curve defined by the data.
   *
   * The sample values can have any dimensionality and derived classes may
   * apply special interpretations to the data.
   *
   * This class provides the interval seek in a Template Method, deferring
   * the actual interpolation to derived classes.
   *
   * Time complexity is O(1) for linear access crossing at most two points
   * and O(log N) for random access, where N is the number of positions.
   *
   * References:
   *
   * 		http://www.oodesign.com/template-method-pattern.html
   *
   */

  class Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      this.parameterPositions = parameterPositions;
      this._cachedIndex = 0;

      this.resultBuffer =
        resultBuffer !== undefined
          ? resultBuffer
          : new sampleValues.constructor(sampleSize);
      this.sampleValues = sampleValues;
      this.valueSize = sampleSize;

      this.settings = null;
      this.DefaultSettings_ = {};
    }

    evaluate(t) {
      const pp = this.parameterPositions;
      let i1 = this._cachedIndex,
        t1 = pp[i1],
        t0 = pp[i1 - 1];

      validate_interval: {
        seek: {
          let right;

          linear_scan: {
            //- See http://jsperf.com/comparison-to-undefined/3
            //- slower code:
            //-
            //- 				if ( t >= t1 || t1 === undefined ) {
            forward_scan: if (!(t < t1)) {
              for (let giveUpAt = i1 + 2; ; ) {
                if (t1 === undefined) {
                  if (t < t0) break forward_scan;

                  // after end

                  i1 = pp.length;
                  this._cachedIndex = i1;
                  return this.copySampleValue_(i1 - 1);
                }

                if (i1 === giveUpAt) break; // this loop

                t0 = t1;
                t1 = pp[++i1];

                if (t < t1) {
                  // we have arrived at the sought interval
                  break seek;
                }
              }

              // prepare binary search on the right side of the index
              right = pp.length;
              break linear_scan;
            }

            //- slower code:
            //-					if ( t < t0 || t0 === undefined ) {
            if (!(t >= t0)) {
              // looping?

              const t1global = pp[1];

              if (t < t1global) {
                i1 = 2; // + 1, using the scan for the details
                t0 = t1global;
              }

              // linear reverse scan

              for (let giveUpAt = i1 - 2; ; ) {
                if (t0 === undefined) {
                  // before start

                  this._cachedIndex = 0;
                  return this.copySampleValue_(0);
                }

                if (i1 === giveUpAt) break; // this loop

                t1 = t0;
                t0 = pp[--i1 - 1];

                if (t >= t0) {
                  // we have arrived at the sought interval
                  break seek;
                }
              }

              // prepare binary search on the left side of the index
              right = i1;
              i1 = 0;
              break linear_scan;
            }

            // the interval is valid

            break validate_interval;
          } // linear scan

          // binary search

          while (i1 < right) {
            const mid = (i1 + right) >>> 1;

            if (t < pp[mid]) {
              right = mid;
            } else {
              i1 = mid + 1;
            }
          }

          t1 = pp[i1];
          t0 = pp[i1 - 1];

          // check boundary cases, again

          if (t0 === undefined) {
            this._cachedIndex = 0;
            return this.copySampleValue_(0);
          }

          if (t1 === undefined) {
            i1 = pp.length;
            this._cachedIndex = i1;
            return this.copySampleValue_(i1 - 1);
          }
        } // seek

        this._cachedIndex = i1;

        this.intervalChanged_(i1, t0, t1);
      } // validate_interval

      return this.interpolate_(i1, t0, t, t1);
    }

    getSettings_() {
      return this.settings || this.DefaultSettings_;
    }

    copySampleValue_(index) {
      // copies a sample value to the result buffer

      const result = this.resultBuffer,
        values = this.sampleValues,
        stride = this.valueSize,
        offset = index * stride;

      for (let i = 0; i !== stride; ++i) {
        result[i] = values[offset + i];
      }

      return result;
    }

    // Template methods for derived classes:

    interpolate_(/* i1, t0, t, t1 */) {
      throw new Error("call to abstract method");
      // implementations shall return this.resultBuffer
    }

    intervalChanged_(/* i1, t0, t1 */) {
      // empty
    }
  }

  /**
   * Fast and simple cubic spline interpolant.
   *
   * It was derived from a Hermitian construction setting the first derivative
   * at each sample position to the linear slope between neighboring positions
   * over their parameter interval.
   */

  class CubicInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);

      this._weightPrev = -0;
      this._offsetPrev = -0;
      this._weightNext = -0;
      this._offsetNext = -0;

      this.DefaultSettings_ = {
        endingStart: ZeroCurvatureEnding,
        endingEnd: ZeroCurvatureEnding,
      };
    }

    intervalChanged_(i1, t0, t1) {
      const pp = this.parameterPositions;
      let iPrev = i1 - 2,
        iNext = i1 + 1,
        tPrev = pp[iPrev],
        tNext = pp[iNext];

      if (tPrev === undefined) {
        switch (this.getSettings_().endingStart) {
          case ZeroSlopeEnding:
            // f'(t0) = 0
            iPrev = i1;
            tPrev = 2 * t0 - t1;

            break;

          case WrapAroundEnding:
            // use the other end of the curve
            iPrev = pp.length - 2;
            tPrev = t0 + pp[iPrev] - pp[iPrev + 1];

            break;

          default: // ZeroCurvatureEnding
            // f''(t0) = 0 a.k.a. Natural Spline
            iPrev = i1;
            tPrev = t1;
        }
      }

      if (tNext === undefined) {
        switch (this.getSettings_().endingEnd) {
          case ZeroSlopeEnding:
            // f'(tN) = 0
            iNext = i1;
            tNext = 2 * t1 - t0;

            break;

          case WrapAroundEnding:
            // use the other end of the curve
            iNext = 1;
            tNext = t1 + pp[1] - pp[0];

            break;

          default: // ZeroCurvatureEnding
            // f''(tN) = 0, a.k.a. Natural Spline
            iNext = i1 - 1;
            tNext = t0;
        }
      }

      const halfDt = (t1 - t0) * 0.5,
        stride = this.valueSize;

      this._weightPrev = halfDt / (t0 - tPrev);
      this._weightNext = halfDt / (tNext - t1);
      this._offsetPrev = iPrev * stride;
      this._offsetNext = iNext * stride;
    }

    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer,
        values = this.sampleValues,
        stride = this.valueSize,
        o1 = i1 * stride,
        o0 = o1 - stride,
        oP = this._offsetPrev,
        oN = this._offsetNext,
        wP = this._weightPrev,
        wN = this._weightNext,
        p = (t - t0) / (t1 - t0),
        pp = p * p,
        ppp = pp * p;

      // evaluate polynomials

      const sP = -wP * ppp + 2 * wP * pp - wP * p;
      const s0 = (1 + wP) * ppp + (-1.5 - 2 * wP) * pp + (-0.5 + wP) * p + 1;
      const s1 = (-1 - wN) * ppp + (1.5 + wN) * pp + 0.5 * p;
      const sN = wN * ppp - wN * pp;

      // combine data linearly

      for (let i = 0; i !== stride; ++i) {
        result[i] =
          sP * values[oP + i] +
          s0 * values[o0 + i] +
          s1 * values[o1 + i] +
          sN * values[oN + i];
      }

      return result;
    }
  }

  class LinearInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }

    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer,
        values = this.sampleValues,
        stride = this.valueSize,
        offset1 = i1 * stride,
        offset0 = offset1 - stride,
        weight1 = (t - t0) / (t1 - t0),
        weight0 = 1 - weight1;

      for (let i = 0; i !== stride; ++i) {
        result[i] =
          values[offset0 + i] * weight0 + values[offset1 + i] * weight1;
      }

      return result;
    }
  }

  /**
   *
   * Interpolant that evaluates to the sample value at the position preceding
   * the parameter.
   */

  class DiscreteInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }

    interpolate_(i1 /*, t0, t, t1 */) {
      return this.copySampleValue_(i1 - 1);
    }
  }

  class KeyframeTrack {
    constructor(name, times, values, interpolation) {
      if (name === undefined)
        throw new Error("THREE.KeyframeTrack: track name is undefined");
      if (times === undefined || times.length === 0)
        throw new Error(
          "THREE.KeyframeTrack: no keyframes in track named " + name
        );

      this.name = name;

      this.times = convertArray(times, this.TimeBufferType);
      this.values = convertArray(values, this.ValueBufferType);

      this.setInterpolation(interpolation || this.DefaultInterpolation);
    }

    // Serialization (in static context, because of constructor invocation
    // and automatic invocation of .toJSON):

    static toJSON(track) {
      const trackType = track.constructor;

      let json;

      // derived classes can define a static toJSON method
      if (trackType.toJSON !== this.toJSON) {
        json = trackType.toJSON(track);
      } else {
        // by default, we assume the data can be serialized as-is
        json = {
          name: track.name,
          times: convertArray(track.times, Array),
          values: convertArray(track.values, Array),
        };

        const interpolation = track.getInterpolation();

        if (interpolation !== track.DefaultInterpolation) {
          json.interpolation = interpolation;
        }
      }

      json.type = track.ValueTypeName; // mandatory

      return json;
    }

    InterpolantFactoryMethodDiscrete(result) {
      return new DiscreteInterpolant(
        this.times,
        this.values,
        this.getValueSize(),
        result
      );
    }

    InterpolantFactoryMethodLinear(result) {
      return new LinearInterpolant(
        this.times,
        this.values,
        this.getValueSize(),
        result
      );
    }

    InterpolantFactoryMethodSmooth(result) {
      return new CubicInterpolant(
        this.times,
        this.values,
        this.getValueSize(),
        result
      );
    }

    setInterpolation(interpolation) {
      let factoryMethod;

      switch (interpolation) {
        case InterpolateDiscrete:
          factoryMethod = this.InterpolantFactoryMethodDiscrete;

          break;

        case InterpolateLinear:
          factoryMethod = this.InterpolantFactoryMethodLinear;

          break;

        case InterpolateSmooth:
          factoryMethod = this.InterpolantFactoryMethodSmooth;

          break;
      }

      if (factoryMethod === undefined) {
        const message =
          "unsupported interpolation for " +
          this.ValueTypeName +
          " keyframe track named " +
          this.name;

        if (this.createInterpolant === undefined) {
          // fall back to default, unless the default itself is messed up
          if (interpolation !== this.DefaultInterpolation) {
            this.setInterpolation(this.DefaultInterpolation);
          } else {
            throw new Error(message); // fatal, in this case
          }
        }

        console.warn("THREE.KeyframeTrack:", message);
        return this;
      }

      this.createInterpolant = factoryMethod;

      return this;
    }

    getInterpolation() {
      switch (this.createInterpolant) {
        case this.InterpolantFactoryMethodDiscrete:
          return InterpolateDiscrete;

        case this.InterpolantFactoryMethodLinear:
          return InterpolateLinear;

        case this.InterpolantFactoryMethodSmooth:
          return InterpolateSmooth;
      }
    }

    getValueSize() {
      return this.values.length / this.times.length;
    }

    // move all keyframes either forwards or backwards in time
    shift(timeOffset) {
      if (timeOffset !== 0.0) {
        const times = this.times;

        for (let i = 0, n = times.length; i !== n; ++i) {
          times[i] += timeOffset;
        }
      }

      return this;
    }

    // scale all keyframe times by a factor (useful for frame <-> seconds conversions)
    scale(timeScale) {
      if (timeScale !== 1.0) {
        const times = this.times;

        for (let i = 0, n = times.length; i !== n; ++i) {
          times[i] *= timeScale;
        }
      }

      return this;
    }

    // removes keyframes before and after animation without changing any values within the range [startTime, endTime].
    // IMPORTANT: We do not shift around keys to the start of the track time, because for interpolated keys this will change their values
    trim(startTime, endTime) {
      const times = this.times,
        nKeys = times.length;

      let from = 0,
        to = nKeys - 1;

      while (from !== nKeys && times[from] < startTime) {
        ++from;
      }

      while (to !== -1 && times[to] > endTime) {
        --to;
      }

      ++to; // inclusive -> exclusive bound

      if (from !== 0 || to !== nKeys) {
        // empty tracks are forbidden, so keep at least one keyframe
        if (from >= to) {
          to = Math.max(to, 1);
          from = to - 1;
        }

        const stride = this.getValueSize();
        this.times = arraySlice(times, from, to);
        this.values = arraySlice(this.values, from * stride, to * stride);
      }

      return this;
    }

    // ensure we do not get a GarbageInGarbageOut situation, make sure tracks are at least minimally viable
    validate() {
      let valid = true;

      const valueSize = this.getValueSize();
      if (valueSize - Math.floor(valueSize) !== 0) {
        console.error(
          "THREE.KeyframeTrack: Invalid value size in track.",
          this
        );
        valid = false;
      }

      const times = this.times,
        values = this.values,
        nKeys = times.length;

      if (nKeys === 0) {
        console.error("THREE.KeyframeTrack: Track is empty.", this);
        valid = false;
      }

      let prevTime = null;

      for (let i = 0; i !== nKeys; i++) {
        const currTime = times[i];

        if (typeof currTime === "number" && isNaN(currTime)) {
          console.error(
            "THREE.KeyframeTrack: Time is not a valid number.",
            this,
            i,
            currTime
          );
          valid = false;
          break;
        }

        if (prevTime !== null && prevTime > currTime) {
          console.error(
            "THREE.KeyframeTrack: Out of order keys.",
            this,
            i,
            currTime,
            prevTime
          );
          valid = false;
          break;
        }

        prevTime = currTime;
      }

      if (values !== undefined) {
        if (isTypedArray(values)) {
          for (let i = 0, n = values.length; i !== n; ++i) {
            const value = values[i];

            if (isNaN(value)) {
              console.error(
                "THREE.KeyframeTrack: Value is not a valid number.",
                this,
                i,
                value
              );
              valid = false;
              break;
            }
          }
        }
      }

      return valid;
    }

    // removes equivalent sequential keys as common in morph target sequences
    // (0,0,0,0,1,1,1,0,0,0,0,0,0,0) --> (0,0,1,1,0,0)
    optimize() {
      // times or values may be shared with other tracks, so overwriting is unsafe
      const times = arraySlice(this.times),
        values = arraySlice(this.values),
        stride = this.getValueSize(),
        smoothInterpolation = this.getInterpolation() === InterpolateSmooth,
        lastIndex = times.length - 1;

      let writeIndex = 1;

      for (let i = 1; i < lastIndex; ++i) {
        let keep = false;

        const time = times[i];
        const timeNext = times[i + 1];

        // remove adjacent keyframes scheduled at the same time

        if (time !== timeNext && (i !== 1 || time !== times[0])) {
          if (!smoothInterpolation) {
            // remove unnecessary keyframes same as their neighbors

            const offset = i * stride,
              offsetP = offset - stride,
              offsetN = offset + stride;

            for (let j = 0; j !== stride; ++j) {
              const value = values[offset + j];

              if (
                value !== values[offsetP + j] ||
                value !== values[offsetN + j]
              ) {
                keep = true;
                break;
              }
            }
          } else {
            keep = true;
          }
        }

        // in-place compaction

        if (keep) {
          if (i !== writeIndex) {
            times[writeIndex] = times[i];

            const readOffset = i * stride,
              writeOffset = writeIndex * stride;

            for (let j = 0; j !== stride; ++j) {
              values[writeOffset + j] = values[readOffset + j];
            }
          }

          ++writeIndex;
        }
      }

      // flush last keyframe (compaction looks ahead)

      if (lastIndex > 0) {
        times[writeIndex] = times[lastIndex];

        for (
          let readOffset = lastIndex * stride,
            writeOffset = writeIndex * stride,
            j = 0;
          j !== stride;
          ++j
        ) {
          values[writeOffset + j] = values[readOffset + j];
        }

        ++writeIndex;
      }

      if (writeIndex !== times.length) {
        this.times = arraySlice(times, 0, writeIndex);
        this.values = arraySlice(values, 0, writeIndex * stride);
      } else {
        this.times = times;
        this.values = values;
      }

      return this;
    }

    clone() {
      const times = arraySlice(this.times, 0);
      const values = arraySlice(this.values, 0);

      const TypedKeyframeTrack = this.constructor;
      const track = new TypedKeyframeTrack(this.name, times, values);

      // Interpolant argument to constructor is not saved, so copy the factory method directly.
      track.createInterpolant = this.createInterpolant;

      return track;
    }
  }

  KeyframeTrack.prototype.TimeBufferType = Float32Array;
  KeyframeTrack.prototype.ValueBufferType = Float32Array;
  KeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;

  /**
   * A Track of Boolean keyframe values.
   */
  class BooleanKeyframeTrack extends KeyframeTrack {}

  BooleanKeyframeTrack.prototype.ValueTypeName = "bool";
  BooleanKeyframeTrack.prototype.ValueBufferType = Array;
  BooleanKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
  BooleanKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

  /**
   * A Track of keyframe values that represent color.
   */
  class ColorKeyframeTrack extends KeyframeTrack {}

  ColorKeyframeTrack.prototype.ValueTypeName = "color";

  /**
   * A Track of numeric keyframe values.
   */
  class NumberKeyframeTrack extends KeyframeTrack {}

  NumberKeyframeTrack.prototype.ValueTypeName = "number";

  /**
   * Spherical linear unit quaternion interpolant.
   */

  class QuaternionLinearInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }

    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer,
        values = this.sampleValues,
        stride = this.valueSize,
        alpha = (t - t0) / (t1 - t0);

      let offset = i1 * stride;

      for (let end = offset + stride; offset !== end; offset += 4) {
        Quaternion.slerpFlat(
          result,
          0,
          values,
          offset - stride,
          values,
          offset,
          alpha
        );
      }

      return result;
    }
  }

  /**
   * A Track of quaternion keyframe values.
   */
  class QuaternionKeyframeTrack extends KeyframeTrack {
    InterpolantFactoryMethodLinear(result) {
      return new QuaternionLinearInterpolant(
        this.times,
        this.values,
        this.getValueSize(),
        result
      );
    }
  }

  QuaternionKeyframeTrack.prototype.ValueTypeName = "quaternion";
  // ValueBufferType is inherited
  QuaternionKeyframeTrack.prototype.DefaultInterpolation = InterpolateLinear;
  QuaternionKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

  /**
   * A Track that interpolates Strings
   */
  class StringKeyframeTrack extends KeyframeTrack {}

  StringKeyframeTrack.prototype.ValueTypeName = "string";
  StringKeyframeTrack.prototype.ValueBufferType = Array;
  StringKeyframeTrack.prototype.DefaultInterpolation = InterpolateDiscrete;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodLinear = undefined;
  StringKeyframeTrack.prototype.InterpolantFactoryMethodSmooth = undefined;

  /**
   * A Track of vectored keyframe values.
   */
  class VectorKeyframeTrack extends KeyframeTrack {}

  VectorKeyframeTrack.prototype.ValueTypeName = "vector";

  class AnimationClip {
    constructor(
      name,
      duration = -1,
      tracks,
      blendMode = NormalAnimationBlendMode
    ) {
      this.name = name;
      this.tracks = tracks;
      this.duration = duration;
      this.blendMode = blendMode;

      this.uuid = generateUUID();

      // this means it should figure out its duration by scanning the tracks
      if (this.duration < 0) {
        this.resetDuration();
      }
    }

    static parse(json) {
      const tracks = [],
        jsonTracks = json.tracks,
        frameTime = 1.0 / (json.fps || 1.0);

      for (let i = 0, n = jsonTracks.length; i !== n; ++i) {
        tracks.push(parseKeyframeTrack(jsonTracks[i]).scale(frameTime));
      }

      const clip = new this(json.name, json.duration, tracks, json.blendMode);
      clip.uuid = json.uuid;

      return clip;
    }

    static toJSON(clip) {
      const tracks = [],
        clipTracks = clip.tracks;

      const json = {
        name: clip.name,
        duration: clip.duration,
        tracks: tracks,
        uuid: clip.uuid,
        blendMode: clip.blendMode,
      };

      for (let i = 0, n = clipTracks.length; i !== n; ++i) {
        tracks.push(KeyframeTrack.toJSON(clipTracks[i]));
      }

      return json;
    }

    static CreateFromMorphTargetSequence(
      name,
      morphTargetSequence,
      fps,
      noLoop
    ) {
      const numMorphTargets = morphTargetSequence.length;
      const tracks = [];

      for (let i = 0; i < numMorphTargets; i++) {
        let times = [];
        let values = [];

        times.push(
          (i + numMorphTargets - 1) % numMorphTargets,
          i,
          (i + 1) % numMorphTargets
        );

        values.push(0, 1, 0);

        const order = getKeyframeOrder(times);
        times = sortedArray(times, 1, order);
        values = sortedArray(values, 1, order);

        // if there is a key at the first frame, duplicate it as the
        // last frame as well for perfect loop.
        if (!noLoop && times[0] === 0) {
          times.push(numMorphTargets);
          values.push(values[0]);
        }

        tracks.push(
          new NumberKeyframeTrack(
            ".morphTargetInfluences[" + morphTargetSequence[i].name + "]",
            times,
            values
          ).scale(1.0 / fps)
        );
      }

      return new this(name, -1, tracks);
    }

    static findByName(objectOrClipArray, name) {
      let clipArray = objectOrClipArray;

      if (!Array.isArray(objectOrClipArray)) {
        const o = objectOrClipArray;
        clipArray = (o.geometry && o.geometry.animations) || o.animations;
      }

      for (let i = 0; i < clipArray.length; i++) {
        if (clipArray[i].name === name) {
          return clipArray[i];
        }
      }

      return null;
    }

    static CreateClipsFromMorphTargetSequences(morphTargets, fps, noLoop) {
      const animationToMorphTargets = {};

      // tested with https://regex101.com/ on trick sequences
      // such flamingo_flyA_003, flamingo_run1_003, crdeath0059
      const pattern = /^([\w-]*?)([\d]+)$/;

      // sort morph target names into animation groups based
      // patterns like Walk_001, Walk_002, Run_001, Run_002
      for (let i = 0, il = morphTargets.length; i < il; i++) {
        const morphTarget = morphTargets[i];
        const parts = morphTarget.name.match(pattern);

        if (parts && parts.length > 1) {
          const name = parts[1];

          let animationMorphTargets = animationToMorphTargets[name];

          if (!animationMorphTargets) {
            animationToMorphTargets[name] = animationMorphTargets = [];
          }

          animationMorphTargets.push(morphTarget);
        }
      }

      const clips = [];

      for (const name in animationToMorphTargets) {
        clips.push(
          this.CreateFromMorphTargetSequence(
            name,
            animationToMorphTargets[name],
            fps,
            noLoop
          )
        );
      }

      return clips;
    }

    // parse the animation.hierarchy format
    static parseAnimation(animation, bones) {
      if (!animation) {
        console.error("THREE.AnimationClip: No animation in JSONLoader data.");
        return null;
      }

      const addNonemptyTrack = function (
        trackType,
        trackName,
        animationKeys,
        propertyName,
        destTracks
      ) {
        // only return track if there are actually keys.
        if (animationKeys.length !== 0) {
          const times = [];
          const values = [];

          flattenJSON(animationKeys, times, values, propertyName);

          // empty keys are filtered out, so check again
          if (times.length !== 0) {
            destTracks.push(new trackType(trackName, times, values));
          }
        }
      };

      const tracks = [];

      const clipName = animation.name || "default";
      const fps = animation.fps || 30;
      const blendMode = animation.blendMode;

      // automatic length determination in AnimationClip.
      let duration = animation.length || -1;

      const hierarchyTracks = animation.hierarchy || [];

      for (let h = 0; h < hierarchyTracks.length; h++) {
        const animationKeys = hierarchyTracks[h].keys;

        // skip empty tracks
        if (!animationKeys || animationKeys.length === 0) continue;

        // process morph targets
        if (animationKeys[0].morphTargets) {
          // figure out all morph targets used in this track
          const morphTargetNames = {};

          let k;

          for (k = 0; k < animationKeys.length; k++) {
            if (animationKeys[k].morphTargets) {
              for (let m = 0; m < animationKeys[k].morphTargets.length; m++) {
                morphTargetNames[animationKeys[k].morphTargets[m]] = -1;
              }
            }
          }

          // create a track for each morph target with all zero
          // morphTargetInfluences except for the keys in which
          // the morphTarget is named.
          for (const morphTargetName in morphTargetNames) {
            const times = [];
            const values = [];

            for (let m = 0; m !== animationKeys[k].morphTargets.length; ++m) {
              const animationKey = animationKeys[k];

              times.push(animationKey.time);
              values.push(animationKey.morphTarget === morphTargetName ? 1 : 0);
            }

            tracks.push(
              new NumberKeyframeTrack(
                ".morphTargetInfluence[" + morphTargetName + "]",
                times,
                values
              )
            );
          }

          duration = morphTargetNames.length * fps;
        } else {
          // ...assume skeletal animation

          const boneName = ".bones[" + bones[h].name + "]";

          addNonemptyTrack(
            VectorKeyframeTrack,
            boneName + ".position",
            animationKeys,
            "pos",
            tracks
          );

          addNonemptyTrack(
            QuaternionKeyframeTrack,
            boneName + ".quaternion",
            animationKeys,
            "rot",
            tracks
          );

          addNonemptyTrack(
            VectorKeyframeTrack,
            boneName + ".scale",
            animationKeys,
            "scl",
            tracks
          );
        }
      }

      if (tracks.length === 0) {
        return null;
      }

      const clip = new this(clipName, duration, tracks, blendMode);

      return clip;
    }

    resetDuration() {
      const tracks = this.tracks;
      let duration = 0;

      for (let i = 0, n = tracks.length; i !== n; ++i) {
        const track = this.tracks[i];

        duration = Math.max(duration, track.times[track.times.length - 1]);
      }

      this.duration = duration;

      return this;
    }

    trim() {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].trim(0, this.duration);
      }

      return this;
    }

    validate() {
      let valid = true;

      for (let i = 0; i < this.tracks.length; i++) {
        valid = valid && this.tracks[i].validate();
      }

      return valid;
    }

    optimize() {
      for (let i = 0; i < this.tracks.length; i++) {
        this.tracks[i].optimize();
      }

      return this;
    }

    clone() {
      const tracks = [];

      for (let i = 0; i < this.tracks.length; i++) {
        tracks.push(this.tracks[i].clone());
      }

      return new this.constructor(
        this.name,
        this.duration,
        tracks,
        this.blendMode
      );
    }

    toJSON() {
      return this.constructor.toJSON(this);
    }
  }

  function getTrackTypeForValueTypeName(typeName) {
    switch (typeName.toLowerCase()) {
      case "scalar":
      case "double":
      case "float":
      case "number":
      case "integer":
        return NumberKeyframeTrack;

      case "vector":
      case "vector2":
      case "vector3":
      case "vector4":
        return VectorKeyframeTrack;

      case "color":
        return ColorKeyframeTrack;

      case "quaternion":
        return QuaternionKeyframeTrack;

      case "bool":
      case "boolean":
        return BooleanKeyframeTrack;

      case "string":
        return StringKeyframeTrack;
    }

    throw new Error("THREE.KeyframeTrack: Unsupported typeName: " + typeName);
  }

  function parseKeyframeTrack(json) {
    if (json.type === undefined) {
      throw new Error(
        "THREE.KeyframeTrack: track type undefined, can not parse"
      );
    }

    const trackType = getTrackTypeForValueTypeName(json.type);

    if (json.times === undefined) {
      const times = [],
        values = [];

      flattenJSON(json.keys, times, values, "value");

      json.times = times;
      json.values = values;
    }

    // derived classes can define a static parse method
    if (trackType.parse !== undefined) {
      return trackType.parse(json);
    } else {
      // by default, we assume a constructor compatible with the base
      return new trackType(
        json.name,
        json.times,
        json.values,
        json.interpolation
      );
    }
  }

  const Cache = {
    enabled: false,

    files: {},

    add: function (key, file) {
      if (this.enabled === false) return;

      // console.log( 'THREE.Cache', 'Adding key:', key );

      this.files[key] = file;
    },

    get: function (key) {
      if (this.enabled === false) return;

      // console.log( 'THREE.Cache', 'Checking key:', key );

      return this.files[key];
    },

    remove: function (key) {
      delete this.files[key];
    },

    clear: function () {
      this.files = {};
    },
  };

  class LoadingManager {
    constructor(onLoad, onProgress, onError) {
      const scope = this;

      let isLoading = false;
      let itemsLoaded = 0;
      let itemsTotal = 0;
      let urlModifier = undefined;
      const handlers = [];

      // Refer to #5689 for the reason why we don't set .onStart
      // in the constructor

      this.onStart = undefined;
      this.onLoad = onLoad;
      this.onProgress = onProgress;
      this.onError = onError;

      this.itemStart = function (url) {
        itemsTotal++;

        if (isLoading === false) {
          if (scope.onStart !== undefined) {
            scope.onStart(url, itemsLoaded, itemsTotal);
          }
        }

        isLoading = true;
      };

      this.itemEnd = function (url) {
        itemsLoaded++;

        if (scope.onProgress !== undefined) {
          scope.onProgress(url, itemsLoaded, itemsTotal);
        }

        if (itemsLoaded === itemsTotal) {
          isLoading = false;

          if (scope.onLoad !== undefined) {
            scope.onLoad();
          }
        }
      };

      this.itemError = function (url) {
        if (scope.onError !== undefined) {
          scope.onError(url);
        }
      };

      this.resolveURL = function (url) {
        if (urlModifier) {
          return urlModifier(url);
        }

        return url;
      };

      this.setURLModifier = function (transform) {
        urlModifier = transform;

        return this;
      };

      this.addHandler = function (regex, loader) {
        handlers.push(regex, loader);

        return this;
      };

      this.removeHandler = function (regex) {
        const index = handlers.indexOf(regex);

        if (index !== -1) {
          handlers.splice(index, 2);
        }

        return this;
      };

      this.getHandler = function (file) {
        for (let i = 0, l = handlers.length; i < l; i += 2) {
          const regex = handlers[i];
          const loader = handlers[i + 1];

          if (regex.global) regex.lastIndex = 0; // see #17920

          if (regex.test(file)) {
            return loader;
          }
        }

        return null;
      };
    }
  }

  const DefaultLoadingManager = /*@__PURE__*/ new LoadingManager();

  class Loader {
    constructor(manager) {
      this.manager = manager !== undefined ? manager : DefaultLoadingManager;

      this.crossOrigin = "anonymous";
      this.withCredentials = false;
      this.path = "";
      this.resourcePath = "";
      this.requestHeader = {};
    }

    load(/* url, onLoad, onProgress, onError */) {}

    loadAsync(url, onProgress) {
      const scope = this;

      return new Promise(function (resolve, reject) {
        scope.load(url, resolve, onProgress, reject);
      });
    }

    parse(/* data */) {}

    setCrossOrigin(crossOrigin) {
      this.crossOrigin = crossOrigin;
      return this;
    }

    setWithCredentials(value) {
      this.withCredentials = value;
      return this;
    }

    setPath(path) {
      this.path = path;
      return this;
    }

    setResourcePath(resourcePath) {
      this.resourcePath = resourcePath;
      return this;
    }

    setRequestHeader(requestHeader) {
      this.requestHeader = requestHeader;
      return this;
    }
  }

  Loader.DEFAULT_MATERIAL_NAME = "__DEFAULT";

  const loading = {};

  class HttpError extends Error {
    constructor(message, response) {
      super(message);
      this.response = response;
    }
  }

  class FileLoader extends Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      if (url === undefined) url = "";

      if (this.path !== undefined) url = this.path + url;

      url = this.manager.resolveURL(url);

      const cached = Cache.get(url);

      if (cached !== undefined) {
        this.manager.itemStart(url);

        setTimeout(() => {
          if (onLoad) onLoad(cached);

          this.manager.itemEnd(url);
        }, 0);

        return cached;
      }

      // Check if request is duplicate

      if (loading[url] !== undefined) {
        loading[url].push({
          onLoad: onLoad,
          onProgress: onProgress,
          onError: onError,
        });

        return;
      }

      // Initialise array for duplicate requests
      loading[url] = [];

      loading[url].push({
        onLoad: onLoad,
        onProgress: onProgress,
        onError: onError,
      });

      // create request
      const req = new Request(url, {
        headers: new Headers(this.requestHeader),
        credentials: this.withCredentials ? "include" : "same-origin",
        // An abort controller could be added within a future PR
      });

      // record states ( avoid data race )
      const mimeType = this.mimeType;
      const responseType = this.responseType;

      // start the fetch
      fetch(req)
        .then((response) => {
          if (response.status === 200 || response.status === 0) {
            // Some browsers return HTTP Status 0 when using non-http protocol
            // e.g. 'file://' or 'data://'. Handle as success.

            if (response.status === 0) {
              console.warn("THREE.FileLoader: HTTP Status 0 received.");
            }

            // Workaround: Checking if response.body === undefined for Alipay browser #23548

            if (
              typeof ReadableStream === "undefined" ||
              response.body === undefined ||
              response.body.getReader === undefined
            ) {
              return response;
            }

            const callbacks = loading[url];
            const reader = response.body.getReader();

            // Nginx needs X-File-Size check
            // https://serverfault.com/questions/482875/why-does-nginx-remove-content-length-header-for-chunked-content
            const contentLength =
              response.headers.get("Content-Length") ||
              response.headers.get("X-File-Size");
            const total = contentLength ? parseInt(contentLength) : 0;
            const lengthComputable = total !== 0;
            let loaded = 0;

            // periodically read data into the new stream tracking while download progress
            const stream = new ReadableStream({
              start(controller) {
                readData();

                function readData() {
                  reader.read().then(({ done, value }) => {
                    if (done) {
                      controller.close();
                    } else {
                      loaded += value.byteLength;

                      const event = new ProgressEvent("progress", {
                        lengthComputable,
                        loaded,
                        total,
                      });
                      for (let i = 0, il = callbacks.length; i < il; i++) {
                        const callback = callbacks[i];
                        if (callback.onProgress) callback.onProgress(event);
                      }

                      controller.enqueue(value);
                      readData();
                    }
                  });
                }
              },
            });

            return new Response(stream);
          } else {
            throw new HttpError(
              `fetch for "${response.url}" responded with ${response.status}: ${response.statusText}`,
              response
            );
          }
        })
        .then((response) => {
          switch (responseType) {
            case "arraybuffer":
              return response.arrayBuffer();

            case "blob":
              return response.blob();

            case "document":
              return response.text().then((text) => {
                const parser = new DOMParser();
                return parser.parseFromString(text, mimeType);
              });

            case "json":
              return response.json();

            default:
              if (mimeType === undefined) {
                return response.text();
              } else {
                // sniff encoding
                const re = /charset="?([^;"\s]*)"?/i;
                const exec = re.exec(mimeType);
                const label =
                  exec && exec[1] ? exec[1].toLowerCase() : undefined;
                const decoder = new TextDecoder(label);
                return response.arrayBuffer().then((ab) => decoder.decode(ab));
              }
          }
        })
        .then((data) => {
          // Add to cache only on HTTP success, so that we do not cache
          // error response bodies as proper responses to requests.
          Cache.add(url, data);

          const callbacks = loading[url];
          delete loading[url];

          for (let i = 0, il = callbacks.length; i < il; i++) {
            const callback = callbacks[i];
            if (callback.onLoad) callback.onLoad(data);
          }
        })
        .catch((err) => {
          // Abort errors and other errors are handled the same

          const callbacks = loading[url];

          if (callbacks === undefined) {
            // When onLoad was called and url was deleted in `loading`
            this.manager.itemError(url);
            throw err;
          }

          delete loading[url];

          for (let i = 0, il = callbacks.length; i < il; i++) {
            const callback = callbacks[i];
            if (callback.onError) callback.onError(err);
          }

          this.manager.itemError(url);
        })
        .finally(() => {
          this.manager.itemEnd(url);
        });

      this.manager.itemStart(url);
    }

    setResponseType(value) {
      this.responseType = value;
      return this;
    }

    setMimeType(value) {
      this.mimeType = value;
      return this;
    }
  }

  class ImageLoader extends Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      if (this.path !== undefined) url = this.path + url;

      url = this.manager.resolveURL(url);

      const scope = this;

      const cached = Cache.get(url);

      if (cached !== undefined) {
        scope.manager.itemStart(url);

        setTimeout(function () {
          if (onLoad) onLoad(cached);

          scope.manager.itemEnd(url);
        }, 0);

        return cached;
      }

      const image = createElementNS("img");

      function onImageLoad() {
        removeEventListeners();

        Cache.add(url, this);

        if (onLoad) onLoad(this);

        scope.manager.itemEnd(url);
      }

      function onImageError(event) {
        removeEventListeners();

        if (onError) onError(event);

        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      }

      function removeEventListeners() {
        image.removeEventListener("load", onImageLoad, false);
        image.removeEventListener("error", onImageError, false);
      }

      image.addEventListener("load", onImageLoad, false);
      image.addEventListener("error", onImageError, false);

      if (url.slice(0, 5) !== "data:") {
        if (this.crossOrigin !== undefined)
          image.crossOrigin = this.crossOrigin;
      }

      scope.manager.itemStart(url);

      image.src = url;

      return image;
    }
  }

  class TextureLoader extends Loader {
    constructor(manager) {
      super(manager);
    }

    load(url, onLoad, onProgress, onError) {
      const texture = new Texture();

      const loader = new ImageLoader(this.manager);
      loader.setCrossOrigin(this.crossOrigin);
      loader.setPath(this.path);

      loader.load(
        url,
        function (image) {
          texture.image = image;
          texture.needsUpdate = true;

          if (onLoad !== undefined) {
            onLoad(texture);
          }
        },
        onProgress,
        onError
      );

      return texture;
    }
  }

  class Light extends Object3D {
    constructor(color, intensity = 1) {
      super();

      this.isLight = true;

      this.type = "Light";

      this.color = new Color(color);
      this.intensity = intensity;
    }

    dispose() {
      // Empty here in base class; some subclasses override.
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.color.copy(source.color);
      this.intensity = source.intensity;

      return this;
    }

    toJSON(meta) {
      const data = super.toJSON(meta);

      data.object.color = this.color.getHex();
      data.object.intensity = this.intensity;

      if (this.groundColor !== undefined)
        data.object.groundColor = this.groundColor.getHex();

      if (this.distance !== undefined) data.object.distance = this.distance;
      if (this.angle !== undefined) data.object.angle = this.angle;
      if (this.decay !== undefined) data.object.decay = this.decay;
      if (this.penumbra !== undefined) data.object.penumbra = this.penumbra;

      if (this.shadow !== undefined) data.object.shadow = this.shadow.toJSON();

      return data;
    }
  }

  const _projScreenMatrix$1 = /*@__PURE__*/ new Matrix4();
  const _lightPositionWorld$1 = /*@__PURE__*/ new Vector3();
  const _lookTarget$1 = /*@__PURE__*/ new Vector3();

  class LightShadow {
    constructor(camera) {
      this.camera = camera;

      this.bias = 0;
      this.normalBias = 0;
      this.radius = 1;
      this.blurSamples = 8;

      this.mapSize = new Vector2(512, 512);

      this.map = null;
      this.mapPass = null;
      this.matrix = new Matrix4();

      this.autoUpdate = true;
      this.needsUpdate = false;

      this._frustum = new Frustum();
      this._frameExtents = new Vector2(1, 1);

      this._viewportCount = 1;

      this._viewports = [new Vector4(0, 0, 1, 1)];
    }

    getViewportCount() {
      return this._viewportCount;
    }

    getFrustum() {
      return this._frustum;
    }

    updateMatrices(light) {
      const shadowCamera = this.camera;
      const shadowMatrix = this.matrix;

      _lightPositionWorld$1.setFromMatrixPosition(light.matrixWorld);
      shadowCamera.position.copy(_lightPositionWorld$1);

      _lookTarget$1.setFromMatrixPosition(light.target.matrixWorld);
      shadowCamera.lookAt(_lookTarget$1);
      shadowCamera.updateMatrixWorld();

      _projScreenMatrix$1.multiplyMatrices(
        shadowCamera.projectionMatrix,
        shadowCamera.matrixWorldInverse
      );
      this._frustum.setFromProjectionMatrix(_projScreenMatrix$1);

      shadowMatrix.set(
        0.5,
        0.0,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.5,
        0.0,
        0.0,
        0.5,
        0.5,
        0.0,
        0.0,
        0.0,
        1.0
      );

      shadowMatrix.multiply(_projScreenMatrix$1);
    }

    getViewport(viewportIndex) {
      return this._viewports[viewportIndex];
    }

    getFrameExtents() {
      return this._frameExtents;
    }

    dispose() {
      if (this.map) {
        this.map.dispose();
      }

      if (this.mapPass) {
        this.mapPass.dispose();
      }
    }

    copy(source) {
      this.camera = source.camera.clone();

      this.bias = source.bias;
      this.radius = source.radius;

      this.mapSize.copy(source.mapSize);

      return this;
    }

    clone() {
      return new this.constructor().copy(this);
    }

    toJSON() {
      const object = {};

      if (this.bias !== 0) object.bias = this.bias;
      if (this.normalBias !== 0) object.normalBias = this.normalBias;
      if (this.radius !== 1) object.radius = this.radius;
      if (this.mapSize.x !== 512 || this.mapSize.y !== 512)
        object.mapSize = this.mapSize.toArray();

      object.camera = this.camera.toJSON(false).object;
      delete object.camera.matrix;

      return object;
    }
  }

  class SpotLightShadow extends LightShadow {
    constructor() {
      super(new PerspectiveCamera(50, 1, 0.5, 500));

      this.isSpotLightShadow = true;

      this.focus = 1;
    }

    updateMatrices(light) {
      const camera = this.camera;

      const fov = RAD2DEG * 2 * light.angle * this.focus;
      const aspect = this.mapSize.width / this.mapSize.height;
      const far = light.distance || camera.far;

      if (
        fov !== camera.fov ||
        aspect !== camera.aspect ||
        far !== camera.far
      ) {
        camera.fov = fov;
        camera.aspect = aspect;
        camera.far = far;
        camera.updateProjectionMatrix();
      }

      super.updateMatrices(light);
    }

    copy(source) {
      super.copy(source);

      this.focus = source.focus;

      return this;
    }
  }

  class SpotLight extends Light {
    constructor(
      color,
      intensity,
      distance = 0,
      angle = Math.PI / 3,
      penumbra = 0,
      decay = 2
    ) {
      super(color, intensity);

      this.isSpotLight = true;

      this.type = "SpotLight";

      this.position.copy(Object3D.DEFAULT_UP);
      this.updateMatrix();

      this.target = new Object3D();

      this.distance = distance;
      this.angle = angle;
      this.penumbra = penumbra;
      this.decay = decay;

      this.map = null;

      this.shadow = new SpotLightShadow();
    }

    get power() {
      // compute the light's luminous power (in lumens) from its intensity (in candela)
      // by convention for a spotlight, luminous power (lm) = π * luminous intensity (cd)
      return this.intensity * Math.PI;
    }

    set power(power) {
      // set the light's intensity (in candela) from the desired luminous power (in lumens)
      this.intensity = power / Math.PI;
    }

    dispose() {
      this.shadow.dispose();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.distance = source.distance;
      this.angle = source.angle;
      this.penumbra = source.penumbra;
      this.decay = source.decay;

      this.target = source.target.clone();

      this.shadow = source.shadow.clone();

      return this;
    }
  }

  const _projScreenMatrix = /*@__PURE__*/ new Matrix4();
  const _lightPositionWorld = /*@__PURE__*/ new Vector3();
  const _lookTarget = /*@__PURE__*/ new Vector3();

  class PointLightShadow extends LightShadow {
    constructor() {
      super(new PerspectiveCamera(90, 1, 0.5, 500));

      this.isPointLightShadow = true;

      this._frameExtents = new Vector2(4, 2);

      this._viewportCount = 6;

      this._viewports = [
        // These viewports map a cube-map onto a 2D texture with the
        // following orientation:
        //
        //  xzXZ
        //   y Y
        //
        // X - Positive x direction
        // x - Negative x direction
        // Y - Positive y direction
        // y - Negative y direction
        // Z - Positive z direction
        // z - Negative z direction

        // positive X
        new Vector4(2, 1, 1, 1),
        // negative X
        new Vector4(0, 1, 1, 1),
        // positive Z
        new Vector4(3, 1, 1, 1),
        // negative Z
        new Vector4(1, 1, 1, 1),
        // positive Y
        new Vector4(3, 0, 1, 1),
        // negative Y
        new Vector4(1, 0, 1, 1),
      ];

      this._cubeDirections = [
        new Vector3(1, 0, 0),
        new Vector3(-1, 0, 0),
        new Vector3(0, 0, 1),
        new Vector3(0, 0, -1),
        new Vector3(0, 1, 0),
        new Vector3(0, -1, 0),
      ];

      this._cubeUps = [
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 1, 0),
        new Vector3(0, 0, 1),
        new Vector3(0, 0, -1),
      ];
    }

    updateMatrices(light, viewportIndex = 0) {
      const camera = this.camera;
      const shadowMatrix = this.matrix;

      const far = light.distance || camera.far;

      if (far !== camera.far) {
        camera.far = far;
        camera.updateProjectionMatrix();
      }

      _lightPositionWorld.setFromMatrixPosition(light.matrixWorld);
      camera.position.copy(_lightPositionWorld);

      _lookTarget.copy(camera.position);
      _lookTarget.add(this._cubeDirections[viewportIndex]);
      camera.up.copy(this._cubeUps[viewportIndex]);
      camera.lookAt(_lookTarget);
      camera.updateMatrixWorld();

      shadowMatrix.makeTranslation(
        -_lightPositionWorld.x,
        -_lightPositionWorld.y,
        -_lightPositionWorld.z
      );

      _projScreenMatrix.multiplyMatrices(
        camera.projectionMatrix,
        camera.matrixWorldInverse
      );
      this._frustum.setFromProjectionMatrix(_projScreenMatrix);
    }
  }

  class PointLight extends Light {
    constructor(color, intensity, distance = 0, decay = 2) {
      super(color, intensity);

      this.isPointLight = true;

      this.type = "PointLight";

      this.distance = distance;
      this.decay = decay;

      this.shadow = new PointLightShadow();
    }

    get power() {
      // compute the light's luminous power (in lumens) from its intensity (in candela)
      // for an isotropic light source, luminous power (lm) = 4 π luminous intensity (cd)
      return this.intensity * 4 * Math.PI;
    }

    set power(power) {
      // set the light's intensity (in candela) from the desired luminous power (in lumens)
      this.intensity = power / (4 * Math.PI);
    }

    dispose() {
      this.shadow.dispose();
    }

    copy(source, recursive) {
      super.copy(source, recursive);

      this.distance = source.distance;
      this.decay = source.decay;

      this.shadow = source.shadow.clone();

      return this;
    }
  }

  class DirectionalLightShadow extends LightShadow {
    constructor() {
      super(new OrthographicCamera(-5, 5, 5, -5, 0.5, 500));

      this.isDirectionalLightShadow = true;
    }
  }

  class DirectionalLight extends Light {
    constructor(color, intensity) {
      super(color, intensity);

      this.isDirectionalLight = true;

      this.type = "DirectionalLight";

      this.position.copy(Object3D.DEFAULT_UP);
      this.updateMatrix();

      this.target = new Object3D();

      this.shadow = new DirectionalLightShadow();
    }

    dispose() {
      this.shadow.dispose();
    }

    copy(source) {
      super.copy(source);

      this.target = source.target.clone();
      this.shadow = source.shadow.clone();

      return this;
    }
  }

  class LoaderUtils {
    static decodeText(array) {
      if (typeof TextDecoder !== "undefined") {
        return new TextDecoder().decode(array);
      }

      // Avoid the String.fromCharCode.apply(null, array) shortcut, which
      // throws a "maximum call stack size exceeded" error for large arrays.

      let s = "";

      for (let i = 0, il = array.length; i < il; i++) {
        // Implicitly assumes little-endian.
        s += String.fromCharCode(array[i]);
      }

      try {
        // merges multi-byte utf-8 characters.

        return decodeURIComponent(escape(s));
      } catch (e) {
        // see #16358

        return s;
      }
    }

    static extractUrlBase(url) {
      const index = url.lastIndexOf("/");

      if (index === -1) return "./";

      return url.slice(0, index + 1);
    }

    static resolveURL(url, path) {
      // Invalid URL
      if (typeof url !== "string" || url === "") return "";

      // Host Relative URL
      if (/^https?:\/\//i.test(path) && /^\//.test(url)) {
        path = path.replace(/(^https?:\/\/[^\/]+).*/i, "$1");
      }

      // Absolute URL http://,https://,//
      if (/^(https?:)?\/\//i.test(url)) return url;

      // Data URI
      if (/^data:.*,.*$/i.test(url)) return url;

      // Blob URL
      if (/^blob:.*$/i.test(url)) return url;

      // Relative URL
      return path + url;
    }
  }

  class ImageBitmapLoader extends Loader {
    constructor(manager) {
      super(manager);

      this.isImageBitmapLoader = true;

      if (typeof createImageBitmap === "undefined") {
        console.warn(
          "THREE.ImageBitmapLoader: createImageBitmap() not supported."
        );
      }

      if (typeof fetch === "undefined") {
        console.warn("THREE.ImageBitmapLoader: fetch() not supported.");
      }

      this.options = { premultiplyAlpha: "none" };
    }

    setOptions(options) {
      this.options = options;

      return this;
    }

    load(url, onLoad, onProgress, onError) {
      if (url === undefined) url = "";

      if (this.path !== undefined) url = this.path + url;

      url = this.manager.resolveURL(url);

      const scope = this;

      const cached = Cache.get(url);

      if (cached !== undefined) {
        scope.manager.itemStart(url);

        setTimeout(function () {
          if (onLoad) onLoad(cached);

          scope.manager.itemEnd(url);
        }, 0);

        return cached;
      }

      const fetchOptions = {};
      fetchOptions.credentials =
        this.crossOrigin === "anonymous" ? "same-origin" : "include";
      fetchOptions.headers = this.requestHeader;

      fetch(url, fetchOptions)
        .then(function (res) {
          return res.blob();
        })
        .then(function (blob) {
          return createImageBitmap(
            blob,
            Object.assign(scope.options, { colorSpaceConversion: "none" })
          );
        })
        .then(function (imageBitmap) {
          Cache.add(url, imageBitmap);

          if (onLoad) onLoad(imageBitmap);

          scope.manager.itemEnd(url);
        })
        .catch(function (e) {
          if (onError) onError(e);

          scope.manager.itemError(url);
          scope.manager.itemEnd(url);
        });

      scope.manager.itemStart(url);
    }
  }

  // Characters [].:/ are reserved for track binding syntax.
  const _RESERVED_CHARS_RE = "\\[\\]\\.:\\/";
  const _reservedRe = new RegExp("[" + _RESERVED_CHARS_RE + "]", "g");

  // Attempts to allow node names from any language. ES5's `\w` regexp matches
  // only latin characters, and the unicode \p{L} is not yet supported. So
  // instead, we exclude reserved characters and match everything else.
  const _wordChar = "[^" + _RESERVED_CHARS_RE + "]";
  const _wordCharOrDot = "[^" + _RESERVED_CHARS_RE.replace("\\.", "") + "]";

  // Parent directories, delimited by '/' or ':'. Currently unused, but must
  // be matched to parse the rest of the track name.
  const _directoryRe = /*@__PURE__*/ /((?:WC+[\/:])*)/.source.replace(
    "WC",
    _wordChar
  );

  // Target node. May contain word characters (a-zA-Z0-9_) and '.' or '-'.
  const _nodeRe = /*@__PURE__*/ /(WCOD+)?/.source.replace(
    "WCOD",
    _wordCharOrDot
  );

  // Object on target node, and accessor. May not contain reserved
  // characters. Accessor may contain any character except closing bracket.
  const _objectRe = /*@__PURE__*/ /(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace(
    "WC",
    _wordChar
  );

  // Property and accessor. May not contain reserved characters. Accessor may
  // contain any non-bracket characters.
  const _propertyRe = /*@__PURE__*/ /\.(WC+)(?:\[(.+)\])?/.source.replace(
    "WC",
    _wordChar
  );

  const _trackRe = new RegExp(
    "" + "^" + _directoryRe + _nodeRe + _objectRe + _propertyRe + "$"
  );

  const _supportedObjectNames = ["material", "materials", "bones", "map"];

  class Composite {
    constructor(targetGroup, path, optionalParsedPath) {
      const parsedPath =
        optionalParsedPath || PropertyBinding.parseTrackName(path);

      this._targetGroup = targetGroup;
      this._bindings = targetGroup.subscribe_(path, parsedPath);
    }

    getValue(array, offset) {
      this.bind(); // bind all binding

      const firstValidIndex = this._targetGroup.nCachedObjects_,
        binding = this._bindings[firstValidIndex];

      // and only call .getValue on the first
      if (binding !== undefined) binding.getValue(array, offset);
    }

    setValue(array, offset) {
      const bindings = this._bindings;

      for (
        let i = this._targetGroup.nCachedObjects_, n = bindings.length;
        i !== n;
        ++i
      ) {
        bindings[i].setValue(array, offset);
      }
    }

    bind() {
      const bindings = this._bindings;

      for (
        let i = this._targetGroup.nCachedObjects_, n = bindings.length;
        i !== n;
        ++i
      ) {
        bindings[i].bind();
      }
    }

    unbind() {
      const bindings = this._bindings;

      for (
        let i = this._targetGroup.nCachedObjects_, n = bindings.length;
        i !== n;
        ++i
      ) {
        bindings[i].unbind();
      }
    }
  }

  // Note: This class uses a State pattern on a per-method basis:
  // 'bind' sets 'this.getValue' / 'setValue' and shadows the
  // prototype version of these methods with one that represents
  // the bound state. When the property is not found, the methods
  // become no-ops.
  class PropertyBinding {
    constructor(rootNode, path, parsedPath) {
      this.path = path;
      this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);

      this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName);

      this.rootNode = rootNode;

      // initial state of these methods that calls 'bind'
      this.getValue = this._getValue_unbound;
      this.setValue = this._setValue_unbound;
    }

    static create(root, path, parsedPath) {
      if (!(root && root.isAnimationObjectGroup)) {
        return new PropertyBinding(root, path, parsedPath);
      } else {
        return new PropertyBinding.Composite(root, path, parsedPath);
      }
    }

    /**
     * Replaces spaces with underscores and removes unsupported characters from
     * node names, to ensure compatibility with parseTrackName().
     *
     * @param {string} name Node name to be sanitized.
     * @return {string}
     */
    static sanitizeNodeName(name) {
      return name.replace(/\s/g, "_").replace(_reservedRe, "");
    }

    static parseTrackName(trackName) {
      const matches = _trackRe.exec(trackName);

      if (matches === null) {
        throw new Error(
          "PropertyBinding: Cannot parse trackName: " + trackName
        );
      }

      const results = {
        // directoryName: matches[ 1 ], // (tschw) currently unused
        nodeName: matches[2],
        objectName: matches[3],
        objectIndex: matches[4],
        propertyName: matches[5], // required
        propertyIndex: matches[6],
      };

      const lastDot = results.nodeName && results.nodeName.lastIndexOf(".");

      if (lastDot !== undefined && lastDot !== -1) {
        const objectName = results.nodeName.substring(lastDot + 1);

        // Object names must be checked against an allowlist. Otherwise, there
        // is no way to parse 'foo.bar.baz': 'baz' must be a property, but
        // 'bar' could be the objectName, or part of a nodeName (which can
        // include '.' characters).
        if (_supportedObjectNames.indexOf(objectName) !== -1) {
          results.nodeName = results.nodeName.substring(0, lastDot);
          results.objectName = objectName;
        }
      }

      if (results.propertyName === null || results.propertyName.length === 0) {
        throw new Error(
          "PropertyBinding: can not parse propertyName from trackName: " +
            trackName
        );
      }

      return results;
    }

    static findNode(root, nodeName) {
      if (
        nodeName === undefined ||
        nodeName === "" ||
        nodeName === "." ||
        nodeName === -1 ||
        nodeName === root.name ||
        nodeName === root.uuid
      ) {
        return root;
      }

      // search into skeleton bones.
      if (root.skeleton) {
        const bone = root.skeleton.getBoneByName(nodeName);

        if (bone !== undefined) {
          return bone;
        }
      }

      // search into node subtree.
      if (root.children) {
        const searchNodeSubtree = function (children) {
          for (let i = 0; i < children.length; i++) {
            const childNode = children[i];

            if (childNode.name === nodeName || childNode.uuid === nodeName) {
              return childNode;
            }

            const result = searchNodeSubtree(childNode.children);

            if (result) return result;
          }

          return null;
        };

        const subTreeNode = searchNodeSubtree(root.children);

        if (subTreeNode) {
          return subTreeNode;
        }
      }

      return null;
    }

    // these are used to "bind" a nonexistent property
    _getValue_unavailable() {}
    _setValue_unavailable() {}

    // Getters

    _getValue_direct(buffer, offset) {
      buffer[offset] = this.targetObject[this.propertyName];
    }

    _getValue_array(buffer, offset) {
      const source = this.resolvedProperty;

      for (let i = 0, n = source.length; i !== n; ++i) {
        buffer[offset++] = source[i];
      }
    }

    _getValue_arrayElement(buffer, offset) {
      buffer[offset] = this.resolvedProperty[this.propertyIndex];
    }

    _getValue_toArray(buffer, offset) {
      this.resolvedProperty.toArray(buffer, offset);
    }

    // Direct

    _setValue_direct(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
    }

    _setValue_direct_setNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
      this.targetObject.needsUpdate = true;
    }

    _setValue_direct_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.targetObject[this.propertyName] = buffer[offset];
      this.targetObject.matrixWorldNeedsUpdate = true;
    }

    // EntireArray

    _setValue_array(buffer, offset) {
      const dest = this.resolvedProperty;

      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }
    }

    _setValue_array_setNeedsUpdate(buffer, offset) {
      const dest = this.resolvedProperty;

      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }

      this.targetObject.needsUpdate = true;
    }

    _setValue_array_setMatrixWorldNeedsUpdate(buffer, offset) {
      const dest = this.resolvedProperty;

      for (let i = 0, n = dest.length; i !== n; ++i) {
        dest[i] = buffer[offset++];
      }

      this.targetObject.matrixWorldNeedsUpdate = true;
    }

    // ArrayElement

    _setValue_arrayElement(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
    }

    _setValue_arrayElement_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
      this.targetObject.needsUpdate = true;
    }

    _setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty[this.propertyIndex] = buffer[offset];
      this.targetObject.matrixWorldNeedsUpdate = true;
    }

    // HasToFromArray

    _setValue_fromArray(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
    }

    _setValue_fromArray_setNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
      this.targetObject.needsUpdate = true;
    }

    _setValue_fromArray_setMatrixWorldNeedsUpdate(buffer, offset) {
      this.resolvedProperty.fromArray(buffer, offset);
      this.targetObject.matrixWorldNeedsUpdate = true;
    }

    _getValue_unbound(targetArray, offset) {
      this.bind();
      this.getValue(targetArray, offset);
    }

    _setValue_unbound(sourceArray, offset) {
      this.bind();
      this.setValue(sourceArray, offset);
    }

    // create getter / setter pair for a property in the scene graph
    bind() {
      let targetObject = this.node;
      const parsedPath = this.parsedPath;

      const objectName = parsedPath.objectName;
      const propertyName = parsedPath.propertyName;
      let propertyIndex = parsedPath.propertyIndex;

      if (!targetObject) {
        targetObject = PropertyBinding.findNode(
          this.rootNode,
          parsedPath.nodeName
        );

        this.node = targetObject;
      }

      // set fail state so we can just 'return' on error
      this.getValue = this._getValue_unavailable;
      this.setValue = this._setValue_unavailable;

      // ensure there is a value node
      if (!targetObject) {
        console.warn(
          "THREE.PropertyBinding: No target node found for track: " +
            this.path +
            "."
        );
        return;
      }

      if (objectName) {
        let objectIndex = parsedPath.objectIndex;

        // special cases were we need to reach deeper into the hierarchy to get the face materials....
        switch (objectName) {
          case "materials":
            if (!targetObject.material) {
              console.error(
                "THREE.PropertyBinding: Can not bind to material as node does not have a material.",
                this
              );
              return;
            }

            if (!targetObject.material.materials) {
              console.error(
                "THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",
                this
              );
              return;
            }

            targetObject = targetObject.material.materials;

            break;

          case "bones":
            if (!targetObject.skeleton) {
              console.error(
                "THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",
                this
              );
              return;
            }

            // potential future optimization: skip this if propertyIndex is already an integer
            // and convert the integer string to a true integer.

            targetObject = targetObject.skeleton.bones;

            // support resolving morphTarget names into indices.
            for (let i = 0; i < targetObject.length; i++) {
              if (targetObject[i].name === objectIndex) {
                objectIndex = i;
                break;
              }
            }

            break;

          case "map":
            if ("map" in targetObject) {
              targetObject = targetObject.map;
              break;
            }

            if (!targetObject.material) {
              console.error(
                "THREE.PropertyBinding: Can not bind to material as node does not have a material.",
                this
              );
              return;
            }

            if (!targetObject.material.map) {
              console.error(
                "THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",
                this
              );
              return;
            }

            targetObject = targetObject.material.map;
            break;

          default:
            if (targetObject[objectName] === undefined) {
              console.error(
                "THREE.PropertyBinding: Can not bind to objectName of node undefined.",
                this
              );
              return;
            }

            targetObject = targetObject[objectName];
        }

        if (objectIndex !== undefined) {
          if (targetObject[objectIndex] === undefined) {
            console.error(
              "THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",
              this,
              targetObject
            );
            return;
          }

          targetObject = targetObject[objectIndex];
        }
      }

      // resolve property
      const nodeProperty = targetObject[propertyName];

      if (nodeProperty === undefined) {
        const nodeName = parsedPath.nodeName;

        console.error(
          "THREE.PropertyBinding: Trying to update property for track: " +
            nodeName +
            "." +
            propertyName +
            " but it wasn't found.",
          targetObject
        );
        return;
      }

      // determine versioning scheme
      let versioning = this.Versioning.None;

      this.targetObject = targetObject;

      if (targetObject.needsUpdate !== undefined) {
        // material

        versioning = this.Versioning.NeedsUpdate;
      } else if (targetObject.matrixWorldNeedsUpdate !== undefined) {
        // node transform

        versioning = this.Versioning.MatrixWorldNeedsUpdate;
      }

      // determine how the property gets bound
      let bindingType = this.BindingType.Direct;

      if (propertyIndex !== undefined) {
        // access a sub element of the property array (only primitives are supported right now)

        if (propertyName === "morphTargetInfluences") {
          // potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.

          // support resolving morphTarget names into indices.
          if (!targetObject.geometry) {
            console.error(
              "THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",
              this
            );
            return;
          }

          if (!targetObject.geometry.morphAttributes) {
            console.error(
              "THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",
              this
            );
            return;
          }

          if (targetObject.morphTargetDictionary[propertyIndex] !== undefined) {
            propertyIndex = targetObject.morphTargetDictionary[propertyIndex];
          }
        }

        bindingType = this.BindingType.ArrayElement;

        this.resolvedProperty = nodeProperty;
        this.propertyIndex = propertyIndex;
      } else if (
        nodeProperty.fromArray !== undefined &&
        nodeProperty.toArray !== undefined
      ) {
        // must use copy for Object3D.Euler/Quaternion

        bindingType = this.BindingType.HasFromToArray;

        this.resolvedProperty = nodeProperty;
      } else if (Array.isArray(nodeProperty)) {
        bindingType = this.BindingType.EntireArray;

        this.resolvedProperty = nodeProperty;
      } else {
        this.propertyName = propertyName;
      }

      // select getter / setter
      this.getValue = this.GetterByBindingType[bindingType];
      this.setValue =
        this.SetterByBindingTypeAndVersioning[bindingType][versioning];
    }

    unbind() {
      this.node = null;

      // back to the prototype version of getValue / setValue
      // note: avoiding to mutate the shape of 'this' via 'delete'
      this.getValue = this._getValue_unbound;
      this.setValue = this._setValue_unbound;
    }
  }

  PropertyBinding.Composite = Composite;

  PropertyBinding.prototype.BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3,
  };

  PropertyBinding.prototype.Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2,
  };

  PropertyBinding.prototype.GetterByBindingType = [
    PropertyBinding.prototype._getValue_direct,
    PropertyBinding.prototype._getValue_array,
    PropertyBinding.prototype._getValue_arrayElement,
    PropertyBinding.prototype._getValue_toArray,
  ];

  PropertyBinding.prototype.SetterByBindingTypeAndVersioning = [
    [
      // Direct
      PropertyBinding.prototype._setValue_direct,
      PropertyBinding.prototype._setValue_direct_setNeedsUpdate,
      PropertyBinding.prototype._setValue_direct_setMatrixWorldNeedsUpdate,
    ],
    [
      // EntireArray

      PropertyBinding.prototype._setValue_array,
      PropertyBinding.prototype._setValue_array_setNeedsUpdate,
      PropertyBinding.prototype._setValue_array_setMatrixWorldNeedsUpdate,
    ],
    [
      // ArrayElement
      PropertyBinding.prototype._setValue_arrayElement,
      PropertyBinding.prototype._setValue_arrayElement_setNeedsUpdate,
      PropertyBinding.prototype
        ._setValue_arrayElement_setMatrixWorldNeedsUpdate,
    ],
    [
      // HasToFromArray
      PropertyBinding.prototype._setValue_fromArray,
      PropertyBinding.prototype._setValue_fromArray_setNeedsUpdate,
      PropertyBinding.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate,
    ],
  ];

  if (typeof __THREE_DEVTOOLS__ !== "undefined") {
    __THREE_DEVTOOLS__.dispatchEvent(
      new CustomEvent("register", {
        detail: {
          revision: REVISION,
        },
      })
    );
  }

  if (typeof window !== "undefined") {
    if (window.__THREE__) {
      console.warn("WARNING: Multiple instances of Three.js being imported.");
    } else {
      window.__THREE__ = REVISION;
    }
  }

  const three_module = /*#__PURE__*/ Object.freeze(
    /*#__PURE__*/ Object.defineProperty(
      {
        __proto__: null,
        AddEquation,
        AlwaysStencilFunc,
        AnimationClip,
        BackSide,
        Bone,
        BooleanKeyframeTrack,
        Box3,
        BufferAttribute,
        BufferGeometry,
        Cache,
        Camera,
        ClampToEdgeWrapping,
        Color,
        ColorKeyframeTrack,
        ColorManagement,
        CubicInterpolant,
        DataTexture,
        DefaultLoadingManager,
        DirectionalLight,
        DiscreteInterpolant,
        DisplayP3ColorSpace,
        DoubleSide,
        Euler,
        EventDispatcher,
        FileLoader,
        Float32BufferAttribute,
        FloatType,
        FrontSide,
        Frustum,
        Group,
        ImageBitmapLoader,
        ImageLoader,
        ImageUtils,
        InstancedBufferAttribute,
        InstancedMesh,
        InterleavedBuffer,
        InterleavedBufferAttribute,
        Interpolant,
        InterpolateDiscrete,
        InterpolateLinear,
        InterpolateSmooth,
        KeepStencilOp,
        KeyframeTrack,
        Layers,
        LessEqualDepth,
        Light,
        Line,
        LineBasicMaterial,
        LineLoop,
        LineSegments,
        LinearEncoding,
        LinearFilter,
        LinearInterpolant,
        LinearMipmapLinearFilter,
        LinearMipmapNearestFilter,
        LinearSRGBColorSpace,
        Loader,
        LoaderUtils,
        LoadingManager,
        Material,
        MathUtils,
        Matrix3,
        Matrix4,
        Mesh,
        MeshBasicMaterial,
        MeshPhysicalMaterial,
        MeshStandardMaterial,
        MirroredRepeatWrapping,
        MultiplyOperation,
        NearestFilter,
        NearestMipmapLinearFilter,
        NearestMipmapNearestFilter,
        NoColorSpace,
        NormalAnimationBlendMode,
        NormalBlending,
        NumberKeyframeTrack,
        Object3D,
        OneMinusSrcAlphaFactor,
        OrthographicCamera,
        PerspectiveCamera,
        Plane,
        PointLight,
        Points,
        PointsMaterial,
        PropertyBinding,
        Quaternion,
        QuaternionKeyframeTrack,
        QuaternionLinearInterpolant,
        REVISION,
        RGBAFormat,
        Ray,
        RepeatWrapping,
        SRGBColorSpace,
        Skeleton,
        SkinnedMesh,
        Source,
        Sphere,
        SpotLight,
        SrcAlphaFactor,
        StaticDrawUsage,
        StringKeyframeTrack,
        TangentSpaceNormalMap,
        Texture,
        TextureLoader,
        Triangle,
        TriangleFanDrawMode,
        TriangleStripDrawMode,
        TrianglesDrawMode,
        UVMapping,
        Uint16BufferAttribute,
        Uint32BufferAttribute,
        UnsignedByteType,
        Vector2,
        Vector3,
        Vector4,
        VectorKeyframeTrack,
        WebGLCoordinateSystem,
        WebGPUCoordinateSystem,
        WrapAroundEnding,
        ZeroCurvatureEnding,
        ZeroSlopeEnding,
        sRGBEncoding,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  );

  /**
   * @param {BufferGeometry} geometry
   * @param {number} drawMode
   * @return {BufferGeometry}
   */
  function toTrianglesDrawMode(geometry, drawMode) {
    if (drawMode === TrianglesDrawMode) {
      console.warn(
        "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."
      );
      return geometry;
    }

    if (
      drawMode === TriangleFanDrawMode ||
      drawMode === TriangleStripDrawMode
    ) {
      let index = geometry.getIndex();

      // generate index if not present

      if (index === null) {
        const indices = [];

        const position = geometry.getAttribute("position");

        if (position !== undefined) {
          for (let i = 0; i < position.count; i++) {
            indices.push(i);
          }

          geometry.setIndex(indices);
          index = geometry.getIndex();
        } else {
          console.error(
            "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."
          );
          return geometry;
        }
      }

      //

      const numberOfTriangles = index.count - 2;
      const newIndices = [];

      if (drawMode === TriangleFanDrawMode) {
        // gl.TRIANGLE_FAN

        for (let i = 1; i <= numberOfTriangles; i++) {
          newIndices.push(index.getX(0));
          newIndices.push(index.getX(i));
          newIndices.push(index.getX(i + 1));
        }
      } else {
        // gl.TRIANGLE_STRIP

        for (let i = 0; i < numberOfTriangles; i++) {
          if (i % 2 === 0) {
            newIndices.push(index.getX(i));
            newIndices.push(index.getX(i + 1));
            newIndices.push(index.getX(i + 2));
          } else {
            newIndices.push(index.getX(i + 2));
            newIndices.push(index.getX(i + 1));
            newIndices.push(index.getX(i));
          }
        }
      }

      if (newIndices.length / 3 !== numberOfTriangles) {
        console.error(
          "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."
        );
      }

      // build final geometry

      const newGeometry = geometry.clone();
      newGeometry.setIndex(newIndices);
      newGeometry.clearGroups();

      return newGeometry;
    } else {
      console.error(
        "THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",
        drawMode
      );
      return geometry;
    }
  }

  class GLTFLoader extends Loader {
    constructor(manager) {
      super(manager);

      this.dracoLoader = null;
      this.ktx2Loader = null;
      this.meshoptDecoder = null;

      this.pluginCallbacks = [];

      this.register(function (parser) {
        return new GLTFMaterialsClearcoatExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFTextureBasisUExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFTextureWebPExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFTextureAVIFExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsSheenExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsTransmissionExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsVolumeExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsIorExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsEmissiveStrengthExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsSpecularExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsIridescenceExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMaterialsAnisotropyExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFLightsExtension(parser);
      });

      this.register(function (parser) {
        return new GLTFMeshoptCompression(parser);
      });

      this.register(function (parser) {
        return new GLTFMeshGpuInstancing(parser);
      });
    }

    load(url, onLoad, onProgress, onError) {
      const scope = this;

      let resourcePath;

      if (this.resourcePath !== "") {
        resourcePath = this.resourcePath;
      } else if (this.path !== "") {
        resourcePath = this.path;
      } else {
        resourcePath = LoaderUtils.extractUrlBase(url);
      }

      // Tells the LoadingManager to track an extra item, which resolves after
      // the model is fully loaded. This means the count of items loaded will
      // be incorrect, but ensures manager.onLoad() does not fire early.
      this.manager.itemStart(url);

      const _onError = function (e) {
        if (onError) {
          onError(e);
        } else {
          console.error(e);
        }

        scope.manager.itemError(url);
        scope.manager.itemEnd(url);
      };

      const loader = new FileLoader(this.manager);

      loader.setPath(this.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);

      loader.load(
        url,
        function (data) {
          try {
            scope.parse(
              data,
              resourcePath,
              function (gltf) {
                onLoad(gltf);

                scope.manager.itemEnd(url);
              },
              _onError
            );
          } catch (e) {
            _onError(e);
          }
        },
        onProgress,
        _onError
      );
    }

    setDRACOLoader(dracoLoader) {
      this.dracoLoader = dracoLoader;
      return this;
    }

    setDDSLoader() {
      throw new Error(
        'THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".'
      );
    }

    setKTX2Loader(ktx2Loader) {
      this.ktx2Loader = ktx2Loader;
      return this;
    }

    setMeshoptDecoder(meshoptDecoder) {
      this.meshoptDecoder = meshoptDecoder;
      return this;
    }

    register(callback) {
      if (this.pluginCallbacks.indexOf(callback) === -1) {
        this.pluginCallbacks.push(callback);
      }

      return this;
    }

    unregister(callback) {
      if (this.pluginCallbacks.indexOf(callback) !== -1) {
        this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(callback), 1);
      }

      return this;
    }

    parse(data, path, onLoad, onError) {
      let json;
      const extensions = {};
      const plugins = {};
      const textDecoder = new TextDecoder();

      if (typeof data === "string") {
        json = JSON.parse(data);
      } else if (data instanceof ArrayBuffer) {
        const magic = textDecoder.decode(new Uint8Array(data, 0, 4));

        if (magic === BINARY_EXTENSION_HEADER_MAGIC) {
          try {
            extensions[EXTENSIONS.KHR_BINARY_GLTF] = new GLTFBinaryExtension(
              data
            );
          } catch (error) {
            if (onError) onError(error);
            return;
          }

          json = JSON.parse(extensions[EXTENSIONS.KHR_BINARY_GLTF].content);
        } else {
          json = JSON.parse(textDecoder.decode(data));
        }
      } else {
        json = data;
      }

      if (json.asset === undefined || json.asset.version[0] < 2) {
        if (onError)
          onError(
            new Error(
              "THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."
            )
          );
        return;
      }

      const parser = new GLTFParser(json, {
        path: path || this.resourcePath || "",
        crossOrigin: this.crossOrigin,
        requestHeader: this.requestHeader,
        manager: this.manager,
        ktx2Loader: this.ktx2Loader,
        meshoptDecoder: this.meshoptDecoder,
      });

      parser.fileLoader.setRequestHeader(this.requestHeader);

      for (let i = 0; i < this.pluginCallbacks.length; i++) {
        const plugin = this.pluginCallbacks[i](parser);
        plugins[plugin.name] = plugin;

        // Workaround to avoid determining as unknown extension
        // in addUnknownExtensionsToUserData().
        // Remove this workaround if we move all the existing
        // extension handlers to plugin system
        extensions[plugin.name] = true;
      }

      if (json.extensionsUsed) {
        for (let i = 0; i < json.extensionsUsed.length; ++i) {
          const extensionName = json.extensionsUsed[i];
          const extensionsRequired = json.extensionsRequired || [];

          switch (extensionName) {
            case EXTENSIONS.KHR_MATERIALS_UNLIT:
              extensions[extensionName] = new GLTFMaterialsUnlitExtension();
              break;

            case EXTENSIONS.KHR_DRACO_MESH_COMPRESSION:
              extensions[extensionName] = new GLTFDracoMeshCompressionExtension(
                json,
                this.dracoLoader
              );
              break;

            case EXTENSIONS.KHR_TEXTURE_TRANSFORM:
              extensions[extensionName] = new GLTFTextureTransformExtension();
              break;

            case EXTENSIONS.KHR_MESH_QUANTIZATION:
              extensions[extensionName] = new GLTFMeshQuantizationExtension();
              break;

            default:
              if (
                extensionsRequired.indexOf(extensionName) >= 0 &&
                plugins[extensionName] === undefined
              ) {
                console.warn(
                  'THREE.GLTFLoader: Unknown extension "' + extensionName + '".'
                );
              }
          }
        }
      }

      parser.setExtensions(extensions);
      parser.setPlugins(plugins);
      parser.parse(onLoad, onError);
    }

    parseAsync(data, path) {
      const scope = this;

      return new Promise(function (resolve, reject) {
        scope.parse(data, path, resolve, reject);
      });
    }
  }

  /* GLTFREGISTRY */

  function GLTFRegistry() {
    let objects = {};

    return {
      get: function (key) {
        return objects[key];
      },

      add: function (key, object) {
        objects[key] = object;
      },

      remove: function (key) {
        delete objects[key];
      },

      removeAll: function () {
        objects = {};
      },
    };
  }

  /*********************************/
  /********** EXTENSIONS ***********/
  /*********************************/

  const EXTENSIONS = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS_PUNCTUAL: "KHR_lights_punctual",
    KHR_MATERIALS_CLEARCOAT: "KHR_materials_clearcoat",
    KHR_MATERIALS_IOR: "KHR_materials_ior",
    KHR_MATERIALS_SHEEN: "KHR_materials_sheen",
    KHR_MATERIALS_SPECULAR: "KHR_materials_specular",
    KHR_MATERIALS_TRANSMISSION: "KHR_materials_transmission",
    KHR_MATERIALS_IRIDESCENCE: "KHR_materials_iridescence",
    KHR_MATERIALS_ANISOTROPY: "KHR_materials_anisotropy",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit",
    KHR_MATERIALS_VOLUME: "KHR_materials_volume",
    KHR_TEXTURE_BASISU: "KHR_texture_basisu",
    KHR_TEXTURE_TRANSFORM: "KHR_texture_transform",
    KHR_MESH_QUANTIZATION: "KHR_mesh_quantization",
    KHR_MATERIALS_EMISSIVE_STRENGTH: "KHR_materials_emissive_strength",
    EXT_TEXTURE_WEBP: "EXT_texture_webp",
    EXT_TEXTURE_AVIF: "EXT_texture_avif",
    EXT_MESHOPT_COMPRESSION: "EXT_meshopt_compression",
    EXT_MESH_GPU_INSTANCING: "EXT_mesh_gpu_instancing",
  };

  /**
   * Punctual Lights Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_lights_punctual
   */
  class GLTFLightsExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_LIGHTS_PUNCTUAL;

      // Object3D instance caches
      this.cache = { refs: {}, uses: {} };
    }

    _markDefs() {
      const parser = this.parser;
      const nodeDefs = this.parser.json.nodes || [];

      for (
        let nodeIndex = 0, nodeLength = nodeDefs.length;
        nodeIndex < nodeLength;
        nodeIndex++
      ) {
        const nodeDef = nodeDefs[nodeIndex];

        if (
          nodeDef.extensions &&
          nodeDef.extensions[this.name] &&
          nodeDef.extensions[this.name].light !== undefined
        ) {
          parser._addNodeRef(this.cache, nodeDef.extensions[this.name].light);
        }
      }
    }

    _loadLight(lightIndex) {
      const parser = this.parser;
      const cacheKey = "light:" + lightIndex;
      let dependency = parser.cache.get(cacheKey);

      if (dependency) return dependency;

      const json = parser.json;
      const extensions = (json.extensions && json.extensions[this.name]) || {};
      const lightDefs = extensions.lights || [];
      const lightDef = lightDefs[lightIndex];
      let lightNode;

      const color = new Color(0xffffff);

      if (lightDef.color !== undefined) color.fromArray(lightDef.color);

      const range = lightDef.range !== undefined ? lightDef.range : 0;

      switch (lightDef.type) {
        case "directional":
          lightNode = new DirectionalLight(color);
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;

        case "point":
          lightNode = new PointLight(color);
          lightNode.distance = range;
          break;

        case "spot":
          lightNode = new SpotLight(color);
          lightNode.distance = range;
          // Handle spotlight properties.
          lightDef.spot = lightDef.spot || {};
          lightDef.spot.innerConeAngle =
            lightDef.spot.innerConeAngle !== undefined
              ? lightDef.spot.innerConeAngle
              : 0;
          lightDef.spot.outerConeAngle =
            lightDef.spot.outerConeAngle !== undefined
              ? lightDef.spot.outerConeAngle
              : Math.PI / 4.0;
          lightNode.angle = lightDef.spot.outerConeAngle;
          lightNode.penumbra =
            1.0 - lightDef.spot.innerConeAngle / lightDef.spot.outerConeAngle;
          lightNode.target.position.set(0, 0, -1);
          lightNode.add(lightNode.target);
          break;

        default:
          throw new Error(
            "THREE.GLTFLoader: Unexpected light type: " + lightDef.type
          );
      }

      // Some lights (e.g. spot) default to a position other than the origin. Reset the position
      // here, because node-level parsing will only override position if explicitly specified.
      lightNode.position.set(0, 0, 0);

      lightNode.decay = 2;

      assignExtrasToUserData(lightNode, lightDef);

      if (lightDef.intensity !== undefined)
        lightNode.intensity = lightDef.intensity;

      lightNode.name = parser.createUniqueName(
        lightDef.name || "light_" + lightIndex
      );

      dependency = Promise.resolve(lightNode);

      parser.cache.add(cacheKey, dependency);

      return dependency;
    }

    getDependency(type, index) {
      if (type !== "light") return;

      return this._loadLight(index);
    }

    createNodeAttachment(nodeIndex) {
      const self = this;
      const parser = this.parser;
      const json = parser.json;
      const nodeDef = json.nodes[nodeIndex];
      const lightDef =
        (nodeDef.extensions && nodeDef.extensions[this.name]) || {};
      const lightIndex = lightDef.light;

      if (lightIndex === undefined) return null;

      return this._loadLight(lightIndex).then(function (light) {
        return parser._getNodeRef(self.cache, lightIndex, light);
      });
    }
  }

  /**
   * Unlit Materials Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_unlit
   */
  class GLTFMaterialsUnlitExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_MATERIALS_UNLIT;
    }

    getMaterialType() {
      return MeshBasicMaterial;
    }

    extendParams(materialParams, materialDef, parser) {
      const pending = [];

      materialParams.color = new Color(1.0, 1.0, 1.0);
      materialParams.opacity = 1.0;

      const metallicRoughness = materialDef.pbrMetallicRoughness;

      if (metallicRoughness) {
        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          const array = metallicRoughness.baseColorFactor;

          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];
        }

        if (metallicRoughness.baseColorTexture !== undefined) {
          pending.push(
            parser.assignTexture(
              materialParams,
              "map",
              metallicRoughness.baseColorTexture,
              SRGBColorSpace
            )
          );
        }
      }

      return Promise.all(pending);
    }
  }

  /**
   * Materials Emissive Strength Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/blob/5768b3ce0ef32bc39cdf1bef10b948586635ead3/extensions/2.0/Khronos/KHR_materials_emissive_strength/README.md
   */
  class GLTFMaterialsEmissiveStrengthExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_EMISSIVE_STRENGTH;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const emissiveStrength =
        materialDef.extensions[this.name].emissiveStrength;

      if (emissiveStrength !== undefined) {
        materialParams.emissiveIntensity = emissiveStrength;
      }

      return Promise.resolve();
    }
  }

  /**
   * Clearcoat Materials Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_clearcoat
   */
  class GLTFMaterialsClearcoatExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_CLEARCOAT;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      if (extension.clearcoatFactor !== undefined) {
        materialParams.clearcoat = extension.clearcoatFactor;
      }

      if (extension.clearcoatTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "clearcoatMap",
            extension.clearcoatTexture
          )
        );
      }

      if (extension.clearcoatRoughnessFactor !== undefined) {
        materialParams.clearcoatRoughness = extension.clearcoatRoughnessFactor;
      }

      if (extension.clearcoatRoughnessTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "clearcoatRoughnessMap",
            extension.clearcoatRoughnessTexture
          )
        );
      }

      if (extension.clearcoatNormalTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "clearcoatNormalMap",
            extension.clearcoatNormalTexture
          )
        );

        if (extension.clearcoatNormalTexture.scale !== undefined) {
          const scale = extension.clearcoatNormalTexture.scale;

          materialParams.clearcoatNormalScale = new Vector2(scale, scale);
        }
      }

      return Promise.all(pending);
    }
  }

  /**
   * Iridescence Materials Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_iridescence
   */
  class GLTFMaterialsIridescenceExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_IRIDESCENCE;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      if (extension.iridescenceFactor !== undefined) {
        materialParams.iridescence = extension.iridescenceFactor;
      }

      if (extension.iridescenceTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "iridescenceMap",
            extension.iridescenceTexture
          )
        );
      }

      if (extension.iridescenceIor !== undefined) {
        materialParams.iridescenceIOR = extension.iridescenceIor;
      }

      if (materialParams.iridescenceThicknessRange === undefined) {
        materialParams.iridescenceThicknessRange = [100, 400];
      }

      if (extension.iridescenceThicknessMinimum !== undefined) {
        materialParams.iridescenceThicknessRange[0] =
          extension.iridescenceThicknessMinimum;
      }

      if (extension.iridescenceThicknessMaximum !== undefined) {
        materialParams.iridescenceThicknessRange[1] =
          extension.iridescenceThicknessMaximum;
      }

      if (extension.iridescenceThicknessTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "iridescenceThicknessMap",
            extension.iridescenceThicknessTexture
          )
        );
      }

      return Promise.all(pending);
    }
  }

  /**
   * Sheen Materials Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/main/extensions/2.0/Khronos/KHR_materials_sheen
   */
  class GLTFMaterialsSheenExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_SHEEN;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      materialParams.sheenColor = new Color(0, 0, 0);
      materialParams.sheenRoughness = 0;
      materialParams.sheen = 1;

      const extension = materialDef.extensions[this.name];

      if (extension.sheenColorFactor !== undefined) {
        materialParams.sheenColor.fromArray(extension.sheenColorFactor);
      }

      if (extension.sheenRoughnessFactor !== undefined) {
        materialParams.sheenRoughness = extension.sheenRoughnessFactor;
      }

      if (extension.sheenColorTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "sheenColorMap",
            extension.sheenColorTexture,
            SRGBColorSpace
          )
        );
      }

      if (extension.sheenRoughnessTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "sheenRoughnessMap",
            extension.sheenRoughnessTexture
          )
        );
      }

      return Promise.all(pending);
    }
  }

  /**
   * Transmission Materials Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_transmission
   * Draft: https://github.com/KhronosGroup/glTF/pull/1698
   */
  class GLTFMaterialsTransmissionExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_TRANSMISSION;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      if (extension.transmissionFactor !== undefined) {
        materialParams.transmission = extension.transmissionFactor;
      }

      if (extension.transmissionTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "transmissionMap",
            extension.transmissionTexture
          )
        );
      }

      return Promise.all(pending);
    }
  }

  /**
   * Materials Volume Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_volume
   */
  class GLTFMaterialsVolumeExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_VOLUME;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      materialParams.thickness =
        extension.thicknessFactor !== undefined ? extension.thicknessFactor : 0;

      if (extension.thicknessTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "thicknessMap",
            extension.thicknessTexture
          )
        );
      }

      materialParams.attenuationDistance =
        extension.attenuationDistance || Infinity;

      const colorArray = extension.attenuationColor || [1, 1, 1];
      materialParams.attenuationColor = new Color(
        colorArray[0],
        colorArray[1],
        colorArray[2]
      );

      return Promise.all(pending);
    }
  }

  /**
   * Materials ior Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_ior
   */
  class GLTFMaterialsIorExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_IOR;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const extension = materialDef.extensions[this.name];

      materialParams.ior = extension.ior !== undefined ? extension.ior : 1.5;

      return Promise.resolve();
    }
  }

  /**
   * Materials specular Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_specular
   */
  class GLTFMaterialsSpecularExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_SPECULAR;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      materialParams.specularIntensity =
        extension.specularFactor !== undefined ? extension.specularFactor : 1.0;

      if (extension.specularTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "specularIntensityMap",
            extension.specularTexture
          )
        );
      }

      const colorArray = extension.specularColorFactor || [1, 1, 1];
      materialParams.specularColor = new Color(
        colorArray[0],
        colorArray[1],
        colorArray[2]
      );

      if (extension.specularColorTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "specularColorMap",
            extension.specularColorTexture,
            SRGBColorSpace
          )
        );
      }

      return Promise.all(pending);
    }
  }

  /**
   * Materials anisotropy Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_materials_anisotropy
   */
  class GLTFMaterialsAnisotropyExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_MATERIALS_ANISOTROPY;
    }

    getMaterialType(materialIndex) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name])
        return null;

      return MeshPhysicalMaterial;
    }

    extendMaterialParams(materialIndex, materialParams) {
      const parser = this.parser;
      const materialDef = parser.json.materials[materialIndex];

      if (!materialDef.extensions || !materialDef.extensions[this.name]) {
        return Promise.resolve();
      }

      const pending = [];

      const extension = materialDef.extensions[this.name];

      if (extension.anisotropyStrength !== undefined) {
        materialParams.anisotropy = extension.anisotropyStrength;
      }

      if (extension.anisotropyRotation !== undefined) {
        materialParams.anisotropyRotation = extension.anisotropyRotation;
      }

      if (extension.anisotropyTexture !== undefined) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "anisotropyMap",
            extension.anisotropyTexture
          )
        );
      }

      return Promise.all(pending);
    }
  }

  /**
   * BasisU Texture Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_basisu
   */
  class GLTFTextureBasisUExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.KHR_TEXTURE_BASISU;
    }

    loadTexture(textureIndex) {
      const parser = this.parser;
      const json = parser.json;

      const textureDef = json.textures[textureIndex];

      if (!textureDef.extensions || !textureDef.extensions[this.name]) {
        return null;
      }

      const extension = textureDef.extensions[this.name];
      const loader = parser.options.ktx2Loader;

      if (!loader) {
        if (
          json.extensionsRequired &&
          json.extensionsRequired.indexOf(this.name) >= 0
        ) {
          throw new Error(
            "THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures"
          );
        } else {
          // Assumes that the extension is optional and that a fallback texture is present
          return null;
        }
      }

      return parser.loadTextureImage(textureIndex, extension.source, loader);
    }
  }

  /**
   * WebP Texture Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_webp
   */
  class GLTFTextureWebPExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.EXT_TEXTURE_WEBP;
      this.isSupported = null;
    }

    loadTexture(textureIndex) {
      const name = this.name;
      const parser = this.parser;
      const json = parser.json;

      const textureDef = json.textures[textureIndex];

      if (!textureDef.extensions || !textureDef.extensions[name]) {
        return null;
      }

      const extension = textureDef.extensions[name];
      const source = json.images[extension.source];

      let loader = parser.textureLoader;
      if (source.uri) {
        const handler = parser.options.manager.getHandler(source.uri);
        if (handler !== null) loader = handler;
      }

      return this.detectSupport().then(function (isSupported) {
        if (isSupported)
          return parser.loadTextureImage(
            textureIndex,
            extension.source,
            loader
          );

        if (
          json.extensionsRequired &&
          json.extensionsRequired.indexOf(name) >= 0
        ) {
          throw new Error(
            "THREE.GLTFLoader: WebP required by asset but unsupported."
          );
        }

        // Fall back to PNG or JPEG.
        return parser.loadTexture(textureIndex);
      });
    }

    detectSupport() {
      if (!this.isSupported) {
        this.isSupported = new Promise(function (resolve) {
          const image = new Image();

          // Lossy test image. Support for lossy images doesn't guarantee support for all
          // WebP images, unfortunately.
          image.src =
            "data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA";

          image.onload = image.onerror = function () {
            resolve(image.height === 1);
          };
        });
      }

      return this.isSupported;
    }
  }

  /**
   * AVIF Texture Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_texture_avif
   */
  class GLTFTextureAVIFExtension {
    constructor(parser) {
      this.parser = parser;
      this.name = EXTENSIONS.EXT_TEXTURE_AVIF;
      this.isSupported = null;
    }

    loadTexture(textureIndex) {
      const name = this.name;
      const parser = this.parser;
      const json = parser.json;

      const textureDef = json.textures[textureIndex];

      if (!textureDef.extensions || !textureDef.extensions[name]) {
        return null;
      }

      const extension = textureDef.extensions[name];
      const source = json.images[extension.source];

      let loader = parser.textureLoader;
      if (source.uri) {
        const handler = parser.options.manager.getHandler(source.uri);
        if (handler !== null) loader = handler;
      }

      return this.detectSupport().then(function (isSupported) {
        if (isSupported)
          return parser.loadTextureImage(
            textureIndex,
            extension.source,
            loader
          );

        if (
          json.extensionsRequired &&
          json.extensionsRequired.indexOf(name) >= 0
        ) {
          throw new Error(
            "THREE.GLTFLoader: AVIF required by asset but unsupported."
          );
        }

        // Fall back to PNG or JPEG.
        return parser.loadTexture(textureIndex);
      });
    }

    detectSupport() {
      if (!this.isSupported) {
        this.isSupported = new Promise(function (resolve) {
          const image = new Image();

          // Lossy test image.
          image.src =
            "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=";
          image.onload = image.onerror = function () {
            resolve(image.height === 1);
          };
        });
      }

      return this.isSupported;
    }
  }

  /**
   * meshopt BufferView Compression Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_meshopt_compression
   */
  class GLTFMeshoptCompression {
    constructor(parser) {
      this.name = EXTENSIONS.EXT_MESHOPT_COMPRESSION;
      this.parser = parser;
    }

    loadBufferView(index) {
      const json = this.parser.json;
      const bufferView = json.bufferViews[index];

      if (bufferView.extensions && bufferView.extensions[this.name]) {
        const extensionDef = bufferView.extensions[this.name];

        const buffer = this.parser.getDependency("buffer", extensionDef.buffer);
        const decoder = this.parser.options.meshoptDecoder;

        if (!decoder || !decoder.supported) {
          if (
            json.extensionsRequired &&
            json.extensionsRequired.indexOf(this.name) >= 0
          ) {
            throw new Error(
              "THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files"
            );
          } else {
            // Assumes that the extension is optional and that fallback buffer data is present
            return null;
          }
        }

        return buffer.then(function (res) {
          const byteOffset = extensionDef.byteOffset || 0;
          const byteLength = extensionDef.byteLength || 0;

          const count = extensionDef.count;
          const stride = extensionDef.byteStride;

          const source = new Uint8Array(res, byteOffset, byteLength);

          if (decoder.decodeGltfBufferAsync) {
            return decoder
              .decodeGltfBufferAsync(
                count,
                stride,
                source,
                extensionDef.mode,
                extensionDef.filter
              )
              .then(function (res) {
                return res.buffer;
              });
          } else {
            // Support for MeshoptDecoder 0.18 or earlier, without decodeGltfBufferAsync
            return decoder.ready.then(function () {
              const result = new ArrayBuffer(count * stride);
              decoder.decodeGltfBuffer(
                new Uint8Array(result),
                count,
                stride,
                source,
                extensionDef.mode,
                extensionDef.filter
              );
              return result;
            });
          }
        });
      } else {
        return null;
      }
    }
  }

  /**
   * GPU Instancing Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Vendor/EXT_mesh_gpu_instancing
   *
   */
  class GLTFMeshGpuInstancing {
    constructor(parser) {
      this.name = EXTENSIONS.EXT_MESH_GPU_INSTANCING;
      this.parser = parser;
    }

    createNodeMesh(nodeIndex) {
      const json = this.parser.json;
      const nodeDef = json.nodes[nodeIndex];

      if (
        !nodeDef.extensions ||
        !nodeDef.extensions[this.name] ||
        nodeDef.mesh === undefined
      ) {
        return null;
      }

      const meshDef = json.meshes[nodeDef.mesh];

      // No Points or Lines + Instancing support yet

      for (const primitive of meshDef.primitives) {
        if (
          primitive.mode !== WEBGL_CONSTANTS.TRIANGLES &&
          primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_STRIP &&
          primitive.mode !== WEBGL_CONSTANTS.TRIANGLE_FAN &&
          primitive.mode !== undefined
        ) {
          return null;
        }
      }

      const extensionDef = nodeDef.extensions[this.name];
      const attributesDef = extensionDef.attributes;

      // @TODO: Can we support InstancedMesh + SkinnedMesh?

      const pending = [];
      const attributes = {};

      for (const key in attributesDef) {
        pending.push(
          this.parser
            .getDependency("accessor", attributesDef[key])
            .then((accessor) => {
              attributes[key] = accessor;
              return attributes[key];
            })
        );
      }

      if (pending.length < 1) {
        return null;
      }

      pending.push(this.parser.createNodeMesh(nodeIndex));

      return Promise.all(pending).then((results) => {
        const nodeObject = results.pop();
        const meshes = nodeObject.isGroup ? nodeObject.children : [nodeObject];
        const count = results[0].count; // All attribute counts should be same
        const instancedMeshes = [];

        for (const mesh of meshes) {
          // Temporal variables
          const m = new Matrix4();
          const p = new Vector3();
          const q = new Quaternion();
          const s = new Vector3(1, 1, 1);

          const instancedMesh = new InstancedMesh(
            mesh.geometry,
            mesh.material,
            count
          );

          for (let i = 0; i < count; i++) {
            if (attributes.TRANSLATION) {
              p.fromBufferAttribute(attributes.TRANSLATION, i);
            }

            if (attributes.ROTATION) {
              q.fromBufferAttribute(attributes.ROTATION, i);
            }

            if (attributes.SCALE) {
              s.fromBufferAttribute(attributes.SCALE, i);
            }

            instancedMesh.setMatrixAt(i, m.compose(p, q, s));
          }

          // Add instance attributes to the geometry, excluding TRS.
          for (const attributeName in attributes) {
            if (
              attributeName !== "TRANSLATION" &&
              attributeName !== "ROTATION" &&
              attributeName !== "SCALE"
            ) {
              mesh.geometry.setAttribute(
                attributeName,
                attributes[attributeName]
              );
            }
          }

          // Just in case
          Object3D.prototype.copy.call(instancedMesh, mesh);

          this.parser.assignFinalMaterial(instancedMesh);

          instancedMeshes.push(instancedMesh);
        }

        if (nodeObject.isGroup) {
          nodeObject.clear();

          nodeObject.add(...instancedMeshes);

          return nodeObject;
        }

        return instancedMeshes[0];
      });
    }
  }

  /* BINARY EXTENSION */
  const BINARY_EXTENSION_HEADER_MAGIC = "glTF";
  const BINARY_EXTENSION_HEADER_LENGTH = 12;
  const BINARY_EXTENSION_CHUNK_TYPES = { JSON: 0x4e4f534a, BIN: 0x004e4942 };

  class GLTFBinaryExtension {
    constructor(data) {
      this.name = EXTENSIONS.KHR_BINARY_GLTF;
      this.content = null;
      this.body = null;

      const headerView = new DataView(data, 0, BINARY_EXTENSION_HEADER_LENGTH);
      const textDecoder = new TextDecoder();

      this.header = {
        magic: textDecoder.decode(new Uint8Array(data.slice(0, 4))),
        version: headerView.getUint32(4, true),
        length: headerView.getUint32(8, true),
      };

      if (this.header.magic !== BINARY_EXTENSION_HEADER_MAGIC) {
        throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
      } else if (this.header.version < 2.0) {
        throw new Error("THREE.GLTFLoader: Legacy binary file detected.");
      }

      const chunkContentsLength =
        this.header.length - BINARY_EXTENSION_HEADER_LENGTH;
      const chunkView = new DataView(data, BINARY_EXTENSION_HEADER_LENGTH);
      let chunkIndex = 0;

      while (chunkIndex < chunkContentsLength) {
        const chunkLength = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        const chunkType = chunkView.getUint32(chunkIndex, true);
        chunkIndex += 4;

        if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.JSON) {
          const contentArray = new Uint8Array(
            data,
            BINARY_EXTENSION_HEADER_LENGTH + chunkIndex,
            chunkLength
          );
          this.content = textDecoder.decode(contentArray);
        } else if (chunkType === BINARY_EXTENSION_CHUNK_TYPES.BIN) {
          const byteOffset = BINARY_EXTENSION_HEADER_LENGTH + chunkIndex;
          this.body = data.slice(byteOffset, byteOffset + chunkLength);
        }

        // Clients must ignore chunks with unknown types.

        chunkIndex += chunkLength;
      }

      if (this.content === null) {
        throw new Error("THREE.GLTFLoader: JSON content not found.");
      }
    }
  }

  /**
   * DRACO Mesh Compression Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_draco_mesh_compression
   */
  class GLTFDracoMeshCompressionExtension {
    constructor(json, dracoLoader) {
      if (!dracoLoader) {
        throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
      }

      this.name = EXTENSIONS.KHR_DRACO_MESH_COMPRESSION;
      this.json = json;
      this.dracoLoader = dracoLoader;
      this.dracoLoader.preload();
    }

    decodePrimitive(primitive, parser) {
      const json = this.json;
      const dracoLoader = this.dracoLoader;
      const bufferViewIndex = primitive.extensions[this.name].bufferView;
      const gltfAttributeMap = primitive.extensions[this.name].attributes;
      const threeAttributeMap = {};
      const attributeNormalizedMap = {};
      const attributeTypeMap = {};

      for (const attributeName in gltfAttributeMap) {
        const threeAttributeName =
          ATTRIBUTES[attributeName] || attributeName.toLowerCase();

        threeAttributeMap[threeAttributeName] = gltfAttributeMap[attributeName];
      }

      for (const attributeName in primitive.attributes) {
        const threeAttributeName =
          ATTRIBUTES[attributeName] || attributeName.toLowerCase();

        if (gltfAttributeMap[attributeName] !== undefined) {
          const accessorDef =
            json.accessors[primitive.attributes[attributeName]];
          const componentType =
            WEBGL_COMPONENT_TYPES[accessorDef.componentType];

          attributeTypeMap[threeAttributeName] = componentType.name;
          attributeNormalizedMap[threeAttributeName] =
            accessorDef.normalized === true;
        }
      }

      return parser
        .getDependency("bufferView", bufferViewIndex)
        .then(function (bufferView) {
          return new Promise(function (resolve) {
            dracoLoader.decodeDracoFile(
              bufferView,
              function (geometry) {
                for (const attributeName in geometry.attributes) {
                  const attribute = geometry.attributes[attributeName];
                  const normalized = attributeNormalizedMap[attributeName];

                  if (normalized !== undefined)
                    attribute.normalized = normalized;
                }

                resolve(geometry);
              },
              threeAttributeMap,
              attributeTypeMap
            );
          });
        });
    }
  }

  /**
   * Texture Transform Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_texture_transform
   */
  class GLTFTextureTransformExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_TEXTURE_TRANSFORM;
    }

    extendTexture(texture, transform) {
      if (
        (transform.texCoord === undefined ||
          transform.texCoord === texture.channel) &&
        transform.offset === undefined &&
        transform.rotation === undefined &&
        transform.scale === undefined
      ) {
        // See https://github.com/mrdoob/three.js/issues/21819.
        return texture;
      }

      texture = texture.clone();

      if (transform.texCoord !== undefined) {
        texture.channel = transform.texCoord;
      }

      if (transform.offset !== undefined) {
        texture.offset.fromArray(transform.offset);
      }

      if (transform.rotation !== undefined) {
        texture.rotation = transform.rotation;
      }

      if (transform.scale !== undefined) {
        texture.repeat.fromArray(transform.scale);
      }

      texture.needsUpdate = true;

      return texture;
    }
  }

  /**
   * Mesh Quantization Extension
   *
   * Specification: https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization
   */
  class GLTFMeshQuantizationExtension {
    constructor() {
      this.name = EXTENSIONS.KHR_MESH_QUANTIZATION;
    }
  }

  /*********************************/
  /********** INTERPOLATION ********/
  /*********************************/

  // Spline Interpolation
  // Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#appendix-c-spline-interpolation
  class GLTFCubicSplineInterpolant extends Interpolant {
    constructor(parameterPositions, sampleValues, sampleSize, resultBuffer) {
      super(parameterPositions, sampleValues, sampleSize, resultBuffer);
    }

    copySampleValue_(index) {
      // Copies a sample value to the result buffer. See description of glTF
      // CUBICSPLINE values layout in interpolate_() function below.

      const result = this.resultBuffer,
        values = this.sampleValues,
        valueSize = this.valueSize,
        offset = index * valueSize * 3 + valueSize;

      for (let i = 0; i !== valueSize; i++) {
        result[i] = values[offset + i];
      }

      return result;
    }

    interpolate_(i1, t0, t, t1) {
      const result = this.resultBuffer;
      const values = this.sampleValues;
      const stride = this.valueSize;

      const stride2 = stride * 2;
      const stride3 = stride * 3;

      const td = t1 - t0;

      const p = (t - t0) / td;
      const pp = p * p;
      const ppp = pp * p;

      const offset1 = i1 * stride3;
      const offset0 = offset1 - stride3;

      const s2 = -2 * ppp + 3 * pp;
      const s3 = ppp - pp;
      const s0 = 1 - s2;
      const s1 = s3 - pp + p;

      // Layout of keyframe output values for CUBICSPLINE animations:
      //   [ inTangent_1, splineVertex_1, outTangent_1, inTangent_2, splineVertex_2, ... ]
      for (let i = 0; i !== stride; i++) {
        const p0 = values[offset0 + i + stride]; // splineVertex_k
        const m0 = values[offset0 + i + stride2] * td; // outTangent_k * (t_k+1 - t_k)
        const p1 = values[offset1 + i + stride]; // splineVertex_k+1
        const m1 = values[offset1 + i] * td; // inTangent_k+1 * (t_k+1 - t_k)

        result[i] = s0 * p0 + s1 * m0 + s2 * p1 + s3 * m1;
      }

      return result;
    }
  }

  const _q = new Quaternion();

  class GLTFCubicSplineQuaternionInterpolant extends GLTFCubicSplineInterpolant {
    interpolate_(i1, t0, t, t1) {
      const result = super.interpolate_(i1, t0, t, t1);

      _q.fromArray(result).normalize().toArray(result);

      return result;
    }
  }

  /*********************************/
  /********** INTERNALS ************/
  /*********************************/

  /* CONSTANTS */

  const WEBGL_CONSTANTS = {
    FLOAT: 5126,
    //FLOAT_MAT2: 35674,
    FLOAT_MAT3: 35675,
    FLOAT_MAT4: 35676,
    FLOAT_VEC2: 35664,
    FLOAT_VEC3: 35665,
    FLOAT_VEC4: 35666,
    LINEAR: 9729,
    REPEAT: 10497,
    SAMPLER_2D: 35678,
    POINTS: 0,
    LINES: 1,
    LINE_LOOP: 2,
    LINE_STRIP: 3,
    TRIANGLES: 4,
    TRIANGLE_STRIP: 5,
    TRIANGLE_FAN: 6,
    UNSIGNED_BYTE: 5121,
    UNSIGNED_SHORT: 5123,
  };

  const WEBGL_COMPONENT_TYPES = {
    5120: Int8Array,
    5121: Uint8Array,
    5122: Int16Array,
    5123: Uint16Array,
    5125: Uint32Array,
    5126: Float32Array,
  };

  const WEBGL_FILTERS = {
    9728: NearestFilter,
    9729: LinearFilter,
    9984: NearestMipmapNearestFilter,
    9985: LinearMipmapNearestFilter,
    9986: NearestMipmapLinearFilter,
    9987: LinearMipmapLinearFilter,
  };

  const WEBGL_WRAPPINGS = {
    33071: ClampToEdgeWrapping,
    33648: MirroredRepeatWrapping,
    10497: RepeatWrapping,
  };

  const WEBGL_TYPE_SIZES = {
    SCALAR: 1,
    VEC2: 2,
    VEC3: 3,
    VEC4: 4,
    MAT2: 4,
    MAT3: 9,
    MAT4: 16,
  };

  const ATTRIBUTES = {
    POSITION: "position",
    NORMAL: "normal",
    TANGENT: "tangent",
    TEXCOORD_0: "uv",
    TEXCOORD_1: "uv1",
    TEXCOORD_2: "uv2",
    TEXCOORD_3: "uv3",
    COLOR_0: "color",
    WEIGHTS_0: "skinWeight",
    JOINTS_0: "skinIndex",
  };

  const PATH_PROPERTIES = {
    scale: "scale",
    translation: "position",
    rotation: "quaternion",
    weights: "morphTargetInfluences",
  };

  const INTERPOLATION = {
    CUBICSPLINE: undefined, // We use a custom interpolant (GLTFCubicSplineInterpolation) for CUBICSPLINE tracks. Each
    // keyframe track will be initialized with a default interpolation type, then modified.
    LINEAR: InterpolateLinear,
    STEP: InterpolateDiscrete,
  };

  const ALPHA_MODES = {
    OPAQUE: "OPAQUE",
    MASK: "MASK",
    BLEND: "BLEND",
  };

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#default-material
   */
  function createDefaultMaterial(cache) {
    if (cache["DefaultMaterial"] === undefined) {
      cache["DefaultMaterial"] = new MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x000000,
        metalness: 1,
        roughness: 1,
        transparent: false,
        depthTest: true,
        side: FrontSide,
      });
    }

    return cache["DefaultMaterial"];
  }

  function addUnknownExtensionsToUserData(knownExtensions, object, objectDef) {
    // Add unknown glTF extensions to an object's userData.

    for (const name in objectDef.extensions) {
      if (knownExtensions[name] === undefined) {
        object.userData.gltfExtensions = object.userData.gltfExtensions || {};
        object.userData.gltfExtensions[name] = objectDef.extensions[name];
      }
    }
  }

  /**
   * @param {Object3D|Material|BufferGeometry} object
   * @param {GLTF.definition} gltfDef
   */
  function assignExtrasToUserData(object, gltfDef) {
    if (gltfDef.extras !== undefined) {
      if (typeof gltfDef.extras === "object") {
        Object.assign(object.userData, gltfDef.extras);
      } else {
        console.warn(
          "THREE.GLTFLoader: Ignoring primitive type .extras, " + gltfDef.extras
        );
      }
    }
  }

  /**
   * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#morph-targets
   *
   * @param {BufferGeometry} geometry
   * @param {Array<GLTF.Target>} targets
   * @param {GLTFParser} parser
   * @return {Promise<BufferGeometry>}
   */
  function addMorphTargets(geometry, targets, parser) {
    let hasMorphPosition = false;
    let hasMorphNormal = false;
    let hasMorphColor = false;

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];

      if (target.POSITION !== undefined) hasMorphPosition = true;
      if (target.NORMAL !== undefined) hasMorphNormal = true;
      if (target.COLOR_0 !== undefined) hasMorphColor = true;

      if (hasMorphPosition && hasMorphNormal && hasMorphColor) break;
    }

    if (!hasMorphPosition && !hasMorphNormal && !hasMorphColor)
      return Promise.resolve(geometry);

    const pendingPositionAccessors = [];
    const pendingNormalAccessors = [];
    const pendingColorAccessors = [];

    for (let i = 0, il = targets.length; i < il; i++) {
      const target = targets[i];

      if (hasMorphPosition) {
        const pendingAccessor =
          target.POSITION !== undefined
            ? parser.getDependency("accessor", target.POSITION)
            : geometry.attributes.position;

        pendingPositionAccessors.push(pendingAccessor);
      }

      if (hasMorphNormal) {
        const pendingAccessor =
          target.NORMAL !== undefined
            ? parser.getDependency("accessor", target.NORMAL)
            : geometry.attributes.normal;

        pendingNormalAccessors.push(pendingAccessor);
      }

      if (hasMorphColor) {
        const pendingAccessor =
          target.COLOR_0 !== undefined
            ? parser.getDependency("accessor", target.COLOR_0)
            : geometry.attributes.color;

        pendingColorAccessors.push(pendingAccessor);
      }
    }

    return Promise.all([
      Promise.all(pendingPositionAccessors),
      Promise.all(pendingNormalAccessors),
      Promise.all(pendingColorAccessors),
    ]).then(function (accessors) {
      const morphPositions = accessors[0];
      const morphNormals = accessors[1];
      const morphColors = accessors[2];

      if (hasMorphPosition) geometry.morphAttributes.position = morphPositions;
      if (hasMorphNormal) geometry.morphAttributes.normal = morphNormals;
      if (hasMorphColor) geometry.morphAttributes.color = morphColors;
      geometry.morphTargetsRelative = true;

      return geometry;
    });
  }

  /**
   * @param {Mesh} mesh
   * @param {GLTF.Mesh} meshDef
   */
  function updateMorphTargets(mesh, meshDef) {
    mesh.updateMorphTargets();

    if (meshDef.weights !== undefined) {
      for (let i = 0, il = meshDef.weights.length; i < il; i++) {
        mesh.morphTargetInfluences[i] = meshDef.weights[i];
      }
    }

    // .extras has user-defined data, so check that .extras.targetNames is an array.
    if (meshDef.extras && Array.isArray(meshDef.extras.targetNames)) {
      const targetNames = meshDef.extras.targetNames;

      if (mesh.morphTargetInfluences.length === targetNames.length) {
        mesh.morphTargetDictionary = {};

        for (let i = 0, il = targetNames.length; i < il; i++) {
          mesh.morphTargetDictionary[targetNames[i]] = i;
        }
      } else {
        console.warn(
          "THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names."
        );
      }
    }
  }

  function createPrimitiveKey(primitiveDef) {
    let geometryKey;

    const dracoExtension =
      primitiveDef.extensions &&
      primitiveDef.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION];

    if (dracoExtension) {
      geometryKey =
        "draco:" +
        dracoExtension.bufferView +
        ":" +
        dracoExtension.indices +
        ":" +
        createAttributesKey(dracoExtension.attributes);
    } else {
      geometryKey =
        primitiveDef.indices +
        ":" +
        createAttributesKey(primitiveDef.attributes) +
        ":" +
        primitiveDef.mode;
    }

    if (primitiveDef.targets !== undefined) {
      for (let i = 0, il = primitiveDef.targets.length; i < il; i++) {
        geometryKey += ":" + createAttributesKey(primitiveDef.targets[i]);
      }
    }

    return geometryKey;
  }

  function createAttributesKey(attributes) {
    let attributesKey = "";

    const keys = Object.keys(attributes).sort();

    for (let i = 0, il = keys.length; i < il; i++) {
      attributesKey += keys[i] + ":" + attributes[keys[i]] + ";";
    }

    return attributesKey;
  }

  function getNormalizedComponentScale(constructor) {
    // Reference:
    // https://github.com/KhronosGroup/glTF/tree/master/extensions/2.0/Khronos/KHR_mesh_quantization#encoding-quantized-data

    switch (constructor) {
      case Int8Array:
        return 1 / 127;

      case Uint8Array:
        return 1 / 255;

      case Int16Array:
        return 1 / 32767;

      case Uint16Array:
        return 1 / 65535;

      default:
        throw new Error(
          "THREE.GLTFLoader: Unsupported normalized accessor component type."
        );
    }
  }

  function getImageURIMimeType(uri) {
    if (
      uri.search(/\.jpe?g($|\?)/i) > 0 ||
      uri.search(/^data\:image\/jpeg/) === 0
    )
      return "image/jpeg";
    if (
      uri.search(/\.webp($|\?)/i) > 0 ||
      uri.search(/^data\:image\/webp/) === 0
    )
      return "image/webp";

    return "image/png";
  }

  const _identityMatrix = new Matrix4();

  /* GLTF PARSER */

  class GLTFParser {
    constructor(json = {}, options = {}) {
      this.json = json;
      this.extensions = {};
      this.plugins = {};
      this.options = options;

      // loader object cache
      this.cache = new GLTFRegistry();

      // associations between Three.js objects and glTF elements
      this.associations = new Map();

      // BufferGeometry caching
      this.primitiveCache = {};

      // Node cache
      this.nodeCache = {};

      // Object3D instance caches
      this.meshCache = { refs: {}, uses: {} };
      this.cameraCache = { refs: {}, uses: {} };
      this.lightCache = { refs: {}, uses: {} };

      this.sourceCache = {};
      this.textureCache = {};

      // Track node names, to ensure no duplicates
      this.nodeNamesUsed = {};

      // Use an ImageBitmapLoader if imageBitmaps are supported. Moves much of the
      // expensive work of uploading a texture to the GPU off the main thread.

      let isSafari = false;
      let isFirefox = false;
      let firefoxVersion = -1;

      if (typeof navigator !== "undefined") {
        isSafari =
          /^((?!chrome|android).)*safari/i.test(navigator.userAgent) === true;
        isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        firefoxVersion = isFirefox
          ? navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]
          : -1;
      }

      if (
        typeof createImageBitmap === "undefined" ||
        isSafari ||
        (isFirefox && firefoxVersion < 98)
      ) {
        this.textureLoader = new TextureLoader(this.options.manager);
      } else {
        this.textureLoader = new ImageBitmapLoader(this.options.manager);
      }

      this.textureLoader.setCrossOrigin(this.options.crossOrigin);
      this.textureLoader.setRequestHeader(this.options.requestHeader);

      this.fileLoader = new FileLoader(this.options.manager);
      this.fileLoader.setResponseType("arraybuffer");

      if (this.options.crossOrigin === "use-credentials") {
        this.fileLoader.setWithCredentials(true);
      }
    }

    setExtensions(extensions) {
      this.extensions = extensions;
    }

    setPlugins(plugins) {
      this.plugins = plugins;
    }

    parse(onLoad, onError) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;

      // Clear the loader cache
      this.cache.removeAll();
      this.nodeCache = {};

      // Mark the special nodes/meshes in json for efficient parse
      this._invokeAll(function (ext) {
        return ext._markDefs && ext._markDefs();
      });

      Promise.all(
        this._invokeAll(function (ext) {
          return ext.beforeRoot && ext.beforeRoot();
        })
      )
        .then(function () {
          return Promise.all([
            parser.getDependencies("scene"),
            parser.getDependencies("animation"),
            parser.getDependencies("camera"),
          ]);
        })
        .then(function (dependencies) {
          const result = {
            scene: dependencies[0][json.scene || 0],
            scenes: dependencies[0],
            animations: dependencies[1],
            cameras: dependencies[2],
            asset: json.asset,
            parser: parser,
            userData: {},
          };

          addUnknownExtensionsToUserData(extensions, result, json);

          assignExtrasToUserData(result, json);

          Promise.all(
            parser._invokeAll(function (ext) {
              return ext.afterRoot && ext.afterRoot(result);
            })
          ).then(function () {
            onLoad(result);
          });
        })
        .catch(onError);
    }

    /**
     * Marks the special nodes/meshes in json for efficient parse.
     */
    _markDefs() {
      const nodeDefs = this.json.nodes || [];
      const skinDefs = this.json.skins || [];
      const meshDefs = this.json.meshes || [];

      // Nothing in the node definition indicates whether it is a Bone or an
      // Object3D. Use the skins' joint references to mark bones.
      for (
        let skinIndex = 0, skinLength = skinDefs.length;
        skinIndex < skinLength;
        skinIndex++
      ) {
        const joints = skinDefs[skinIndex].joints;

        for (let i = 0, il = joints.length; i < il; i++) {
          nodeDefs[joints[i]].isBone = true;
        }
      }

      // Iterate over all nodes, marking references to shared resources,
      // as well as skeleton joints.
      for (
        let nodeIndex = 0, nodeLength = nodeDefs.length;
        nodeIndex < nodeLength;
        nodeIndex++
      ) {
        const nodeDef = nodeDefs[nodeIndex];

        if (nodeDef.mesh !== undefined) {
          this._addNodeRef(this.meshCache, nodeDef.mesh);

          // Nothing in the mesh definition indicates whether it is
          // a SkinnedMesh or Mesh. Use the node's mesh reference
          // to mark SkinnedMesh if node has skin.
          if (nodeDef.skin !== undefined) {
            meshDefs[nodeDef.mesh].isSkinnedMesh = true;
          }
        }

        if (nodeDef.camera !== undefined) {
          this._addNodeRef(this.cameraCache, nodeDef.camera);
        }
      }
    }

    /**
     * Counts references to shared node / Object3D resources. These resources
     * can be reused, or "instantiated", at multiple nodes in the scene
     * hierarchy. Mesh, Camera, and Light instances are instantiated and must
     * be marked. Non-scenegraph resources (like Materials, Geometries, and
     * Textures) can be reused directly and are not marked here.
     *
     * Example: CesiumMilkTruck sample model reuses "Wheel" meshes.
     */
    _addNodeRef(cache, index) {
      if (index === undefined) return;

      if (cache.refs[index] === undefined) {
        cache.refs[index] = cache.uses[index] = 0;
      }

      cache.refs[index]++;
    }

    /** Returns a reference to a shared resource, cloning it if necessary. */
    _getNodeRef(cache, index, object) {
      if (cache.refs[index] <= 1) return object;

      const ref = object.clone();

      // Propagates mappings to the cloned object, prevents mappings on the
      // original object from being lost.
      const updateMappings = (original, clone) => {
        const mappings = this.associations.get(original);
        if (mappings != null) {
          this.associations.set(clone, mappings);
        }

        for (const [i, child] of original.children.entries()) {
          updateMappings(child, clone.children[i]);
        }
      };

      updateMappings(object, ref);

      ref.name += "_instance_" + cache.uses[index]++;

      return ref;
    }

    _invokeOne(func) {
      const extensions = Object.values(this.plugins);
      extensions.push(this);

      for (let i = 0; i < extensions.length; i++) {
        const result = func(extensions[i]);

        if (result) return result;
      }

      return null;
    }

    _invokeAll(func) {
      const extensions = Object.values(this.plugins);
      extensions.unshift(this);

      const pending = [];

      for (let i = 0; i < extensions.length; i++) {
        const result = func(extensions[i]);

        if (result) pending.push(result);
      }

      return pending;
    }

    /**
     * Requests the specified dependency asynchronously, with caching.
     * @param {string} type
     * @param {number} index
     * @return {Promise<Object3D|Material|THREE.Texture|AnimationClip|ArrayBuffer|Object>}
     */
    getDependency(type, index) {
      const cacheKey = type + ":" + index;
      let dependency = this.cache.get(cacheKey);

      if (!dependency) {
        switch (type) {
          case "scene":
            dependency = this.loadScene(index);
            break;

          case "node":
            dependency = this._invokeOne(function (ext) {
              return ext.loadNode && ext.loadNode(index);
            });
            break;

          case "mesh":
            dependency = this._invokeOne(function (ext) {
              return ext.loadMesh && ext.loadMesh(index);
            });
            break;

          case "accessor":
            dependency = this.loadAccessor(index);
            break;

          case "bufferView":
            dependency = this._invokeOne(function (ext) {
              return ext.loadBufferView && ext.loadBufferView(index);
            });
            break;

          case "buffer":
            dependency = this.loadBuffer(index);
            break;

          case "material":
            dependency = this._invokeOne(function (ext) {
              return ext.loadMaterial && ext.loadMaterial(index);
            });
            break;

          case "texture":
            dependency = this._invokeOne(function (ext) {
              return ext.loadTexture && ext.loadTexture(index);
            });
            break;

          case "skin":
            dependency = this.loadSkin(index);
            break;

          case "animation":
            dependency = this._invokeOne(function (ext) {
              return ext.loadAnimation && ext.loadAnimation(index);
            });
            break;

          case "camera":
            dependency = this.loadCamera(index);
            break;

          default:
            dependency = this._invokeOne(function (ext) {
              return (
                ext != this &&
                ext.getDependency &&
                ext.getDependency(type, index)
              );
            });

            if (!dependency) {
              throw new Error("Unknown type: " + type);
            }

            break;
        }

        this.cache.add(cacheKey, dependency);
      }

      return dependency;
    }

    /**
     * Requests all dependencies of the specified type asynchronously, with caching.
     * @param {string} type
     * @return {Promise<Array<Object>>}
     */
    getDependencies(type) {
      let dependencies = this.cache.get(type);

      if (!dependencies) {
        const parser = this;
        const defs = this.json[type + (type === "mesh" ? "es" : "s")] || [];

        dependencies = Promise.all(
          defs.map(function (def, index) {
            return parser.getDependency(type, index);
          })
        );

        this.cache.add(type, dependencies);
      }

      return dependencies;
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBuffer(bufferIndex) {
      const bufferDef = this.json.buffers[bufferIndex];
      const loader = this.fileLoader;

      if (bufferDef.type && bufferDef.type !== "arraybuffer") {
        throw new Error(
          "THREE.GLTFLoader: " +
            bufferDef.type +
            " buffer type is not supported."
        );
      }

      // If present, GLB container is required to be the first buffer.
      if (bufferDef.uri === undefined && bufferIndex === 0) {
        return Promise.resolve(
          this.extensions[EXTENSIONS.KHR_BINARY_GLTF].body
        );
      }

      const options = this.options;

      return new Promise(function (resolve, reject) {
        loader.load(
          LoaderUtils.resolveURL(bufferDef.uri, options.path),
          resolve,
          undefined,
          function () {
            reject(
              new Error(
                'THREE.GLTFLoader: Failed to load buffer "' +
                  bufferDef.uri +
                  '".'
              )
            );
          }
        );
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#buffers-and-buffer-views
     * @param {number} bufferViewIndex
     * @return {Promise<ArrayBuffer>}
     */
    loadBufferView(bufferViewIndex) {
      const bufferViewDef = this.json.bufferViews[bufferViewIndex];

      return this.getDependency("buffer", bufferViewDef.buffer).then(function (
        buffer
      ) {
        const byteLength = bufferViewDef.byteLength || 0;
        const byteOffset = bufferViewDef.byteOffset || 0;
        return buffer.slice(byteOffset, byteOffset + byteLength);
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#accessors
     * @param {number} accessorIndex
     * @return {Promise<BufferAttribute|InterleavedBufferAttribute>}
     */
    loadAccessor(accessorIndex) {
      const parser = this;
      const json = this.json;

      const accessorDef = this.json.accessors[accessorIndex];

      if (
        accessorDef.bufferView === undefined &&
        accessorDef.sparse === undefined
      ) {
        const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];
        const normalized = accessorDef.normalized === true;

        const array = new TypedArray(accessorDef.count * itemSize);
        return Promise.resolve(
          new BufferAttribute(array, itemSize, normalized)
        );
      }

      const pendingBufferViews = [];

      if (accessorDef.bufferView !== undefined) {
        pendingBufferViews.push(
          this.getDependency("bufferView", accessorDef.bufferView)
        );
      } else {
        pendingBufferViews.push(null);
      }

      if (accessorDef.sparse !== undefined) {
        pendingBufferViews.push(
          this.getDependency(
            "bufferView",
            accessorDef.sparse.indices.bufferView
          )
        );
        pendingBufferViews.push(
          this.getDependency("bufferView", accessorDef.sparse.values.bufferView)
        );
      }

      return Promise.all(pendingBufferViews).then(function (bufferViews) {
        const bufferView = bufferViews[0];

        const itemSize = WEBGL_TYPE_SIZES[accessorDef.type];
        const TypedArray = WEBGL_COMPONENT_TYPES[accessorDef.componentType];

        // For VEC3: itemSize is 3, elementBytes is 4, itemBytes is 12.
        const elementBytes = TypedArray.BYTES_PER_ELEMENT;
        const itemBytes = elementBytes * itemSize;
        const byteOffset = accessorDef.byteOffset || 0;
        const byteStride =
          accessorDef.bufferView !== undefined
            ? json.bufferViews[accessorDef.bufferView].byteStride
            : undefined;
        const normalized = accessorDef.normalized === true;
        let array, bufferAttribute;

        // The buffer is not interleaved if the stride is the item size in bytes.
        if (byteStride && byteStride !== itemBytes) {
          // Each "slice" of the buffer, as defined by 'count' elements of 'byteStride' bytes, gets its own InterleavedBuffer
          // This makes sure that IBA.count reflects accessor.count properly
          const ibSlice = Math.floor(byteOffset / byteStride);
          const ibCacheKey =
            "InterleavedBuffer:" +
            accessorDef.bufferView +
            ":" +
            accessorDef.componentType +
            ":" +
            ibSlice +
            ":" +
            accessorDef.count;
          let ib = parser.cache.get(ibCacheKey);

          if (!ib) {
            array = new TypedArray(
              bufferView,
              ibSlice * byteStride,
              (accessorDef.count * byteStride) / elementBytes
            );

            // Integer parameters to IB/IBA are in array elements, not bytes.
            ib = new InterleavedBuffer(array, byteStride / elementBytes);

            parser.cache.add(ibCacheKey, ib);
          }

          bufferAttribute = new InterleavedBufferAttribute(
            ib,
            itemSize,
            (byteOffset % byteStride) / elementBytes,
            normalized
          );
        } else {
          if (bufferView === null) {
            array = new TypedArray(accessorDef.count * itemSize);
          } else {
            array = new TypedArray(
              bufferView,
              byteOffset,
              accessorDef.count * itemSize
            );
          }

          bufferAttribute = new BufferAttribute(array, itemSize, normalized);
        }

        // https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#sparse-accessors
        if (accessorDef.sparse !== undefined) {
          const itemSizeIndices = WEBGL_TYPE_SIZES.SCALAR;
          const TypedArrayIndices =
            WEBGL_COMPONENT_TYPES[accessorDef.sparse.indices.componentType];

          const byteOffsetIndices = accessorDef.sparse.indices.byteOffset || 0;
          const byteOffsetValues = accessorDef.sparse.values.byteOffset || 0;

          const sparseIndices = new TypedArrayIndices(
            bufferViews[1],
            byteOffsetIndices,
            accessorDef.sparse.count * itemSizeIndices
          );
          const sparseValues = new TypedArray(
            bufferViews[2],
            byteOffsetValues,
            accessorDef.sparse.count * itemSize
          );

          if (bufferView !== null) {
            // Avoid modifying the original ArrayBuffer, if the bufferView wasn't initialized with zeroes.
            bufferAttribute = new BufferAttribute(
              bufferAttribute.array.slice(),
              bufferAttribute.itemSize,
              bufferAttribute.normalized
            );
          }

          for (let i = 0, il = sparseIndices.length; i < il; i++) {
            const index = sparseIndices[i];

            bufferAttribute.setX(index, sparseValues[i * itemSize]);
            if (itemSize >= 2)
              bufferAttribute.setY(index, sparseValues[i * itemSize + 1]);
            if (itemSize >= 3)
              bufferAttribute.setZ(index, sparseValues[i * itemSize + 2]);
            if (itemSize >= 4)
              bufferAttribute.setW(index, sparseValues[i * itemSize + 3]);
            if (itemSize >= 5)
              throw new Error(
                "THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute."
              );
          }
        }

        return bufferAttribute;
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#textures
     * @param {number} textureIndex
     * @return {Promise<THREE.Texture|null>}
     */
    loadTexture(textureIndex) {
      const json = this.json;
      const options = this.options;
      const textureDef = json.textures[textureIndex];
      const sourceIndex = textureDef.source;
      const sourceDef = json.images[sourceIndex];

      let loader = this.textureLoader;

      if (sourceDef.uri) {
        const handler = options.manager.getHandler(sourceDef.uri);
        if (handler !== null) loader = handler;
      }

      return this.loadTextureImage(textureIndex, sourceIndex, loader);
    }

    loadTextureImage(textureIndex, sourceIndex, loader) {
      const parser = this;
      const json = this.json;

      const textureDef = json.textures[textureIndex];
      const sourceDef = json.images[sourceIndex];

      const cacheKey =
        (sourceDef.uri || sourceDef.bufferView) + ":" + textureDef.sampler;

      if (this.textureCache[cacheKey]) {
        // See https://github.com/mrdoob/three.js/issues/21559.
        return this.textureCache[cacheKey];
      }

      const promise = this.loadImageSource(sourceIndex, loader)
        .then(function (texture) {
          texture.flipY = false;

          texture.name = textureDef.name || sourceDef.name || "";

          if (
            texture.name === "" &&
            typeof sourceDef.uri === "string" &&
            sourceDef.uri.startsWith("data:image/") === false
          ) {
            texture.name = sourceDef.uri;
          }

          const samplers = json.samplers || {};
          const sampler = samplers[textureDef.sampler] || {};

          texture.magFilter = WEBGL_FILTERS[sampler.magFilter] || LinearFilter;
          texture.minFilter =
            WEBGL_FILTERS[sampler.minFilter] || LinearMipmapLinearFilter;
          texture.wrapS = WEBGL_WRAPPINGS[sampler.wrapS] || RepeatWrapping;
          texture.wrapT = WEBGL_WRAPPINGS[sampler.wrapT] || RepeatWrapping;

          parser.associations.set(texture, { textures: textureIndex });

          return texture;
        })
        .catch(function () {
          return null;
        });

      this.textureCache[cacheKey] = promise;

      return promise;
    }

    loadImageSource(sourceIndex, loader) {
      const parser = this;
      const json = this.json;
      const options = this.options;

      if (this.sourceCache[sourceIndex] !== undefined) {
        return this.sourceCache[sourceIndex].then((texture) => texture.clone());
      }

      const sourceDef = json.images[sourceIndex];

      const URL = self.URL || self.webkitURL;

      let sourceURI = sourceDef.uri || "";
      let isObjectURL = false;

      if (sourceDef.bufferView !== undefined) {
        // Load binary image data from bufferView, if provided.

        sourceURI = parser
          .getDependency("bufferView", sourceDef.bufferView)
          .then(function (bufferView) {
            isObjectURL = true;
            const blob = new Blob([bufferView], { type: sourceDef.mimeType });
            sourceURI = URL.createObjectURL(blob);
            return sourceURI;
          });
      } else if (sourceDef.uri === undefined) {
        throw new Error(
          "THREE.GLTFLoader: Image " +
            sourceIndex +
            " is missing URI and bufferView"
        );
      }

      const promise = Promise.resolve(sourceURI)
        .then(function (sourceURI) {
          return new Promise(function (resolve, reject) {
            let onLoad = resolve;

            if (loader.isImageBitmapLoader === true) {
              onLoad = function (imageBitmap) {
                const texture = new Texture(imageBitmap);
                texture.needsUpdate = true;

                resolve(texture);
              };
            }

            loader.load(
              LoaderUtils.resolveURL(sourceURI, options.path),
              onLoad,
              undefined,
              reject
            );
          });
        })
        .then(function (texture) {
          // Clean up resources and configure Texture.

          if (isObjectURL === true) {
            URL.revokeObjectURL(sourceURI);
          }

          texture.userData.mimeType =
            sourceDef.mimeType || getImageURIMimeType(sourceDef.uri);

          return texture;
        })
        .catch(function (error) {
          console.error("THREE.GLTFLoader: Couldn't load texture", sourceURI);
          throw error;
        });

      this.sourceCache[sourceIndex] = promise;
      return promise;
    }

    /**
     * Asynchronously assigns a texture to the given material parameters.
     * @param {Object} materialParams
     * @param {string} mapName
     * @param {Object} mapDef
     * @return {Promise<Texture>}
     */
    assignTexture(materialParams, mapName, mapDef, colorSpace) {
      const parser = this;

      return this.getDependency("texture", mapDef.index).then(function (
        texture
      ) {
        if (!texture) return null;

        if (mapDef.texCoord !== undefined && mapDef.texCoord > 0) {
          texture = texture.clone();
          texture.channel = mapDef.texCoord;
        }

        if (parser.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]) {
          const transform =
            mapDef.extensions !== undefined
              ? mapDef.extensions[EXTENSIONS.KHR_TEXTURE_TRANSFORM]
              : undefined;

          if (transform) {
            const gltfReference = parser.associations.get(texture);
            texture = parser.extensions[
              EXTENSIONS.KHR_TEXTURE_TRANSFORM
            ].extendTexture(texture, transform);
            parser.associations.set(texture, gltfReference);
          }
        }

        if (colorSpace !== undefined) {
          texture.colorSpace = colorSpace;
        }

        materialParams[mapName] = texture;

        return texture;
      });
    }

    /**
     * Assigns final material to a Mesh, Line, or Points instance. The instance
     * already has a material (generated from the glTF material options alone)
     * but reuse of the same glTF material may require multiple threejs materials
     * to accommodate different primitive types, defines, etc. New materials will
     * be created if necessary, and reused from a cache.
     * @param  {Object3D} mesh Mesh, Line, or Points instance.
     */
    assignFinalMaterial(mesh) {
      const geometry = mesh.geometry;
      let material = mesh.material;

      const useDerivativeTangents = geometry.attributes.tangent === undefined;
      const useVertexColors = geometry.attributes.color !== undefined;
      const useFlatShading = geometry.attributes.normal === undefined;

      if (mesh.isPoints) {
        const cacheKey = "PointsMaterial:" + material.uuid;

        let pointsMaterial = this.cache.get(cacheKey);

        if (!pointsMaterial) {
          pointsMaterial = new PointsMaterial();
          Material.prototype.copy.call(pointsMaterial, material);
          pointsMaterial.color.copy(material.color);
          pointsMaterial.map = material.map;
          pointsMaterial.sizeAttenuation = false; // glTF spec says points should be 1px

          this.cache.add(cacheKey, pointsMaterial);
        }

        material = pointsMaterial;
      } else if (mesh.isLine) {
        const cacheKey = "LineBasicMaterial:" + material.uuid;

        let lineMaterial = this.cache.get(cacheKey);

        if (!lineMaterial) {
          lineMaterial = new LineBasicMaterial();
          Material.prototype.copy.call(lineMaterial, material);
          lineMaterial.color.copy(material.color);
          lineMaterial.map = material.map;

          this.cache.add(cacheKey, lineMaterial);
        }

        material = lineMaterial;
      }

      // Clone the material if it will be modified
      if (useDerivativeTangents || useVertexColors || useFlatShading) {
        let cacheKey = "ClonedMaterial:" + material.uuid + ":";

        if (useDerivativeTangents) cacheKey += "derivative-tangents:";
        if (useVertexColors) cacheKey += "vertex-colors:";
        if (useFlatShading) cacheKey += "flat-shading:";

        let cachedMaterial = this.cache.get(cacheKey);

        if (!cachedMaterial) {
          cachedMaterial = material.clone();

          if (useVertexColors) cachedMaterial.vertexColors = true;
          if (useFlatShading) cachedMaterial.flatShading = true;

          if (useDerivativeTangents) {
            // https://github.com/mrdoob/three.js/issues/11438#issuecomment-507003995
            if (cachedMaterial.normalScale) cachedMaterial.normalScale.y *= -1;
            if (cachedMaterial.clearcoatNormalScale)
              cachedMaterial.clearcoatNormalScale.y *= -1;
          }

          this.cache.add(cacheKey, cachedMaterial);

          this.associations.set(
            cachedMaterial,
            this.associations.get(material)
          );
        }

        material = cachedMaterial;
      }

      mesh.material = material;
    }

    getMaterialType(/* materialIndex */) {
      return MeshStandardMaterial;
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#materials
     * @param {number} materialIndex
     * @return {Promise<Material>}
     */
    loadMaterial(materialIndex) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;
      const materialDef = json.materials[materialIndex];

      let materialType;
      const materialParams = {};
      const materialExtensions = materialDef.extensions || {};

      const pending = [];

      if (materialExtensions[EXTENSIONS.KHR_MATERIALS_UNLIT]) {
        const kmuExtension = extensions[EXTENSIONS.KHR_MATERIALS_UNLIT];
        materialType = kmuExtension.getMaterialType();
        pending.push(
          kmuExtension.extendParams(materialParams, materialDef, parser)
        );
      } else {
        // Specification:
        // https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#metallic-roughness-material

        const metallicRoughness = materialDef.pbrMetallicRoughness || {};

        materialParams.color = new Color(1.0, 1.0, 1.0);
        materialParams.opacity = 1.0;

        if (Array.isArray(metallicRoughness.baseColorFactor)) {
          const array = metallicRoughness.baseColorFactor;

          materialParams.color.fromArray(array);
          materialParams.opacity = array[3];
        }

        if (metallicRoughness.baseColorTexture !== undefined) {
          pending.push(
            parser.assignTexture(
              materialParams,
              "map",
              metallicRoughness.baseColorTexture,
              SRGBColorSpace
            )
          );
        }

        materialParams.metalness =
          metallicRoughness.metallicFactor !== undefined
            ? metallicRoughness.metallicFactor
            : 1.0;
        materialParams.roughness =
          metallicRoughness.roughnessFactor !== undefined
            ? metallicRoughness.roughnessFactor
            : 1.0;

        if (metallicRoughness.metallicRoughnessTexture !== undefined) {
          pending.push(
            parser.assignTexture(
              materialParams,
              "metalnessMap",
              metallicRoughness.metallicRoughnessTexture
            )
          );
          pending.push(
            parser.assignTexture(
              materialParams,
              "roughnessMap",
              metallicRoughness.metallicRoughnessTexture
            )
          );
        }

        materialType = this._invokeOne(function (ext) {
          return ext.getMaterialType && ext.getMaterialType(materialIndex);
        });

        pending.push(
          Promise.all(
            this._invokeAll(function (ext) {
              return (
                ext.extendMaterialParams &&
                ext.extendMaterialParams(materialIndex, materialParams)
              );
            })
          )
        );
      }

      if (materialDef.doubleSided === true) {
        materialParams.side = DoubleSide;
      }

      const alphaMode = materialDef.alphaMode || ALPHA_MODES.OPAQUE;

      if (alphaMode === ALPHA_MODES.BLEND) {
        materialParams.transparent = true;

        // See: https://github.com/mrdoob/three.js/issues/17706
        materialParams.depthWrite = false;
      } else {
        materialParams.transparent = false;

        if (alphaMode === ALPHA_MODES.MASK) {
          materialParams.alphaTest =
            materialDef.alphaCutoff !== undefined
              ? materialDef.alphaCutoff
              : 0.5;
        }
      }

      if (
        materialDef.normalTexture !== undefined &&
        materialType !== MeshBasicMaterial
      ) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "normalMap",
            materialDef.normalTexture
          )
        );

        materialParams.normalScale = new Vector2(1, 1);

        if (materialDef.normalTexture.scale !== undefined) {
          const scale = materialDef.normalTexture.scale;

          materialParams.normalScale.set(scale, scale);
        }
      }

      if (
        materialDef.occlusionTexture !== undefined &&
        materialType !== MeshBasicMaterial
      ) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "aoMap",
            materialDef.occlusionTexture
          )
        );

        if (materialDef.occlusionTexture.strength !== undefined) {
          materialParams.aoMapIntensity = materialDef.occlusionTexture.strength;
        }
      }

      if (
        materialDef.emissiveFactor !== undefined &&
        materialType !== MeshBasicMaterial
      ) {
        materialParams.emissive = new Color().fromArray(
          materialDef.emissiveFactor
        );
      }

      if (
        materialDef.emissiveTexture !== undefined &&
        materialType !== MeshBasicMaterial
      ) {
        pending.push(
          parser.assignTexture(
            materialParams,
            "emissiveMap",
            materialDef.emissiveTexture,
            SRGBColorSpace
          )
        );
      }

      return Promise.all(pending).then(function () {
        const material = new materialType(materialParams);

        if (materialDef.name) material.name = materialDef.name;

        assignExtrasToUserData(material, materialDef);

        parser.associations.set(material, { materials: materialIndex });

        if (materialDef.extensions)
          addUnknownExtensionsToUserData(extensions, material, materialDef);

        return material;
      });
    }

    /** When Object3D instances are targeted by animation, they need unique names. */
    createUniqueName(originalName) {
      const sanitizedName = PropertyBinding.sanitizeNodeName(
        originalName || ""
      );

      if (sanitizedName in this.nodeNamesUsed) {
        return sanitizedName + "_" + ++this.nodeNamesUsed[sanitizedName];
      } else {
        this.nodeNamesUsed[sanitizedName] = 0;

        return sanitizedName;
      }
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#geometry
     *
     * Creates BufferGeometries from primitives.
     *
     * @param {Array<GLTF.Primitive>} primitives
     * @return {Promise<Array<BufferGeometry>>}
     */
    loadGeometries(primitives) {
      const parser = this;
      const extensions = this.extensions;
      const cache = this.primitiveCache;

      function createDracoPrimitive(primitive) {
        return extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
          .decodePrimitive(primitive, parser)
          .then(function (geometry) {
            return addPrimitiveAttributes(geometry, primitive, parser);
          });
      }

      const pending = [];

      for (let i = 0, il = primitives.length; i < il; i++) {
        const primitive = primitives[i];
        const cacheKey = createPrimitiveKey(primitive);

        // See if we've already created this geometry
        const cached = cache[cacheKey];

        if (cached) {
          // Use the cached geometry if it exists
          pending.push(cached.promise);
        } else {
          let geometryPromise;

          if (
            primitive.extensions &&
            primitive.extensions[EXTENSIONS.KHR_DRACO_MESH_COMPRESSION]
          ) {
            // Use DRACO geometry if available
            geometryPromise = createDracoPrimitive(primitive);
          } else {
            // Otherwise create a new geometry
            geometryPromise = addPrimitiveAttributes(
              new BufferGeometry(),
              primitive,
              parser
            );
          }

          // Cache this geometry
          cache[cacheKey] = { primitive: primitive, promise: geometryPromise };

          pending.push(geometryPromise);
        }
      }

      return Promise.all(pending);
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/blob/master/specification/2.0/README.md#meshes
     * @param {number} meshIndex
     * @return {Promise<Group|Mesh|SkinnedMesh>}
     */
    loadMesh(meshIndex) {
      const parser = this;
      const json = this.json;
      const extensions = this.extensions;

      const meshDef = json.meshes[meshIndex];
      const primitives = meshDef.primitives;

      const pending = [];

      for (let i = 0, il = primitives.length; i < il; i++) {
        const material =
          primitives[i].material === undefined
            ? createDefaultMaterial(this.cache)
            : this.getDependency("material", primitives[i].material);

        pending.push(material);
      }

      pending.push(parser.loadGeometries(primitives));

      return Promise.all(pending).then(function (results) {
        const materials = results.slice(0, results.length - 1);
        const geometries = results[results.length - 1];

        const meshes = [];

        for (let i = 0, il = geometries.length; i < il; i++) {
          const geometry = geometries[i];
          const primitive = primitives[i];

          // 1. create Mesh

          let mesh;

          const material = materials[i];

          if (
            primitive.mode === WEBGL_CONSTANTS.TRIANGLES ||
            primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP ||
            primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN ||
            primitive.mode === undefined
          ) {
            // .isSkinnedMesh isn't in glTF spec. See ._markDefs()
            mesh =
              meshDef.isSkinnedMesh === true
                ? new SkinnedMesh(geometry, material)
                : new Mesh(geometry, material);

            if (mesh.isSkinnedMesh === true) {
              // normalize skin weights to fix malformed assets (see #15319)
              mesh.normalizeSkinWeights();
            }

            if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_STRIP) {
              mesh.geometry = toTrianglesDrawMode(
                mesh.geometry,
                TriangleStripDrawMode
              );
            } else if (primitive.mode === WEBGL_CONSTANTS.TRIANGLE_FAN) {
              mesh.geometry = toTrianglesDrawMode(
                mesh.geometry,
                TriangleFanDrawMode
              );
            }
          } else if (primitive.mode === WEBGL_CONSTANTS.LINES) {
            mesh = new LineSegments(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.LINE_STRIP) {
            mesh = new Line(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.LINE_LOOP) {
            mesh = new LineLoop(geometry, material);
          } else if (primitive.mode === WEBGL_CONSTANTS.POINTS) {
            mesh = new Points(geometry, material);
          } else {
            throw new Error(
              "THREE.GLTFLoader: Primitive mode unsupported: " + primitive.mode
            );
          }

          if (Object.keys(mesh.geometry.morphAttributes).length > 0) {
            updateMorphTargets(mesh, meshDef);
          }

          mesh.name = parser.createUniqueName(
            meshDef.name || "mesh_" + meshIndex
          );

          assignExtrasToUserData(mesh, meshDef);

          if (primitive.extensions)
            addUnknownExtensionsToUserData(extensions, mesh, primitive);

          parser.assignFinalMaterial(mesh);

          meshes.push(mesh);
        }

        for (let i = 0, il = meshes.length; i < il; i++) {
          parser.associations.set(meshes[i], {
            meshes: meshIndex,
            primitives: i,
          });
        }

        if (meshes.length === 1) {
          if (meshDef.extensions)
            addUnknownExtensionsToUserData(extensions, meshes[0], meshDef);

          return meshes[0];
        }

        const group = new Group();

        if (meshDef.extensions)
          addUnknownExtensionsToUserData(extensions, group, meshDef);

        parser.associations.set(group, { meshes: meshIndex });

        for (let i = 0, il = meshes.length; i < il; i++) {
          group.add(meshes[i]);
        }

        return group;
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#cameras
     * @param {number} cameraIndex
     * @return {Promise<THREE.Camera>}
     */
    loadCamera(cameraIndex) {
      let camera;
      const cameraDef = this.json.cameras[cameraIndex];
      const params = cameraDef[cameraDef.type];

      if (!params) {
        console.warn("THREE.GLTFLoader: Missing camera parameters.");
        return;
      }

      if (cameraDef.type === "perspective") {
        camera = new PerspectiveCamera(
          MathUtils.radToDeg(params.yfov),
          params.aspectRatio || 1,
          params.znear || 1,
          params.zfar || 2e6
        );
      } else if (cameraDef.type === "orthographic") {
        camera = new OrthographicCamera(
          -params.xmag,
          params.xmag,
          params.ymag,
          -params.ymag,
          params.znear,
          params.zfar
        );
      }

      if (cameraDef.name) camera.name = this.createUniqueName(cameraDef.name);

      assignExtrasToUserData(camera, cameraDef);

      return Promise.resolve(camera);
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#skins
     * @param {number} skinIndex
     * @return {Promise<Skeleton>}
     */
    loadSkin(skinIndex) {
      const skinDef = this.json.skins[skinIndex];

      const pending = [];

      for (let i = 0, il = skinDef.joints.length; i < il; i++) {
        pending.push(this._loadNodeShallow(skinDef.joints[i]));
      }

      if (skinDef.inverseBindMatrices !== undefined) {
        pending.push(
          this.getDependency("accessor", skinDef.inverseBindMatrices)
        );
      } else {
        pending.push(null);
      }

      return Promise.all(pending).then(function (results) {
        const inverseBindMatrices = results.pop();
        const jointNodes = results;

        // Note that bones (joint nodes) may or may not be in the
        // scene graph at this time.

        const bones = [];
        const boneInverses = [];

        for (let i = 0, il = jointNodes.length; i < il; i++) {
          const jointNode = jointNodes[i];

          if (jointNode) {
            bones.push(jointNode);

            const mat = new Matrix4();

            if (inverseBindMatrices !== null) {
              mat.fromArray(inverseBindMatrices.array, i * 16);
            }

            boneInverses.push(mat);
          } else {
            console.warn(
              'THREE.GLTFLoader: Joint "%s" could not be found.',
              skinDef.joints[i]
            );
          }
        }

        return new Skeleton(bones, boneInverses);
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#animations
     * @param {number} animationIndex
     * @return {Promise<AnimationClip>}
     */
    loadAnimation(animationIndex) {
      const json = this.json;
      const parser = this;

      const animationDef = json.animations[animationIndex];
      const animationName = animationDef.name
        ? animationDef.name
        : "animation_" + animationIndex;

      const pendingNodes = [];
      const pendingInputAccessors = [];
      const pendingOutputAccessors = [];
      const pendingSamplers = [];
      const pendingTargets = [];

      for (let i = 0, il = animationDef.channels.length; i < il; i++) {
        const channel = animationDef.channels[i];
        const sampler = animationDef.samplers[channel.sampler];
        const target = channel.target;
        const name = target.node;
        const input =
          animationDef.parameters !== undefined
            ? animationDef.parameters[sampler.input]
            : sampler.input;
        const output =
          animationDef.parameters !== undefined
            ? animationDef.parameters[sampler.output]
            : sampler.output;

        if (target.node === undefined) continue;

        pendingNodes.push(this.getDependency("node", name));
        pendingInputAccessors.push(this.getDependency("accessor", input));
        pendingOutputAccessors.push(this.getDependency("accessor", output));
        pendingSamplers.push(sampler);
        pendingTargets.push(target);
      }

      return Promise.all([
        Promise.all(pendingNodes),
        Promise.all(pendingInputAccessors),
        Promise.all(pendingOutputAccessors),
        Promise.all(pendingSamplers),
        Promise.all(pendingTargets),
      ]).then(function (dependencies) {
        const nodes = dependencies[0];
        const inputAccessors = dependencies[1];
        const outputAccessors = dependencies[2];
        const samplers = dependencies[3];
        const targets = dependencies[4];

        const tracks = [];

        for (let i = 0, il = nodes.length; i < il; i++) {
          const node = nodes[i];
          const inputAccessor = inputAccessors[i];
          const outputAccessor = outputAccessors[i];
          const sampler = samplers[i];
          const target = targets[i];

          if (node === undefined) continue;

          if (node.updateMatrix) {
            node.updateMatrix();
          }

          const createdTracks = parser._createAnimationTracks(
            node,
            inputAccessor,
            outputAccessor,
            sampler,
            target
          );

          if (createdTracks) {
            for (let k = 0; k < createdTracks.length; k++) {
              tracks.push(createdTracks[k]);
            }
          }
        }

        return new AnimationClip(animationName, undefined, tracks);
      });
    }

    createNodeMesh(nodeIndex) {
      const json = this.json;
      const parser = this;
      const nodeDef = json.nodes[nodeIndex];

      if (nodeDef.mesh === undefined) return null;

      return parser.getDependency("mesh", nodeDef.mesh).then(function (mesh) {
        const node = parser._getNodeRef(parser.meshCache, nodeDef.mesh, mesh);

        // if weights are provided on the node, override weights on the mesh.
        if (nodeDef.weights !== undefined) {
          node.traverse(function (o) {
            if (!o.isMesh) return;

            for (let i = 0, il = nodeDef.weights.length; i < il; i++) {
              o.morphTargetInfluences[i] = nodeDef.weights[i];
            }
          });
        }

        return node;
      });
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#nodes-and-hierarchy
     * @param {number} nodeIndex
     * @return {Promise<Object3D>}
     */
    loadNode(nodeIndex) {
      const json = this.json;
      const parser = this;

      const nodeDef = json.nodes[nodeIndex];

      const nodePending = parser._loadNodeShallow(nodeIndex);

      const childPending = [];
      const childrenDef = nodeDef.children || [];

      for (let i = 0, il = childrenDef.length; i < il; i++) {
        childPending.push(parser.getDependency("node", childrenDef[i]));
      }

      const skeletonPending =
        nodeDef.skin === undefined
          ? Promise.resolve(null)
          : parser.getDependency("skin", nodeDef.skin);

      return Promise.all([
        nodePending,
        Promise.all(childPending),
        skeletonPending,
      ]).then(function (results) {
        const node = results[0];
        const children = results[1];
        const skeleton = results[2];

        if (skeleton !== null) {
          // This full traverse should be fine because
          // child glTF nodes have not been added to this node yet.
          node.traverse(function (mesh) {
            if (!mesh.isSkinnedMesh) return;

            mesh.bind(skeleton, _identityMatrix);
          });
        }

        for (let i = 0, il = children.length; i < il; i++) {
          node.add(children[i]);
        }

        return node;
      });
    }

    // ._loadNodeShallow() parses a single node.
    // skin and child nodes are created and added in .loadNode() (no '_' prefix).
    _loadNodeShallow(nodeIndex) {
      const json = this.json;
      const extensions = this.extensions;
      const parser = this;

      // This method is called from .loadNode() and .loadSkin().
      // Cache a node to avoid duplication.

      if (this.nodeCache[nodeIndex] !== undefined) {
        return this.nodeCache[nodeIndex];
      }

      const nodeDef = json.nodes[nodeIndex];

      // reserve node's name before its dependencies, so the root has the intended name.
      const nodeName = nodeDef.name
        ? parser.createUniqueName(nodeDef.name)
        : "";

      const pending = [];

      const meshPromise = parser._invokeOne(function (ext) {
        return ext.createNodeMesh && ext.createNodeMesh(nodeIndex);
      });

      if (meshPromise) {
        pending.push(meshPromise);
      }

      if (nodeDef.camera !== undefined) {
        pending.push(
          parser
            .getDependency("camera", nodeDef.camera)
            .then(function (camera) {
              return parser._getNodeRef(
                parser.cameraCache,
                nodeDef.camera,
                camera
              );
            })
        );
      }

      parser
        ._invokeAll(function (ext) {
          return (
            ext.createNodeAttachment && ext.createNodeAttachment(nodeIndex)
          );
        })
        .forEach(function (promise) {
          pending.push(promise);
        });

      this.nodeCache[nodeIndex] = Promise.all(pending).then(function (objects) {
        let node;

        // .isBone isn't in glTF spec. See ._markDefs
        if (nodeDef.isBone === true) {
          node = new Bone();
        } else if (objects.length > 1) {
          node = new Group();
        } else if (objects.length === 1) {
          node = objects[0];
        } else {
          node = new Object3D();
        }

        if (node !== objects[0]) {
          for (let i = 0, il = objects.length; i < il; i++) {
            node.add(objects[i]);
          }
        }

        if (nodeDef.name) {
          node.userData.name = nodeDef.name;
          node.name = nodeName;
        }

        assignExtrasToUserData(node, nodeDef);

        if (nodeDef.extensions)
          addUnknownExtensionsToUserData(extensions, node, nodeDef);

        if (nodeDef.matrix !== undefined) {
          const matrix = new Matrix4();
          matrix.fromArray(nodeDef.matrix);
          node.applyMatrix4(matrix);
        } else {
          if (nodeDef.translation !== undefined) {
            node.position.fromArray(nodeDef.translation);
          }

          if (nodeDef.rotation !== undefined) {
            node.quaternion.fromArray(nodeDef.rotation);
          }

          if (nodeDef.scale !== undefined) {
            node.scale.fromArray(nodeDef.scale);
          }
        }

        if (!parser.associations.has(node)) {
          parser.associations.set(node, {});
        }

        parser.associations.get(node).nodes = nodeIndex;

        return node;
      });

      return this.nodeCache[nodeIndex];
    }

    /**
     * Specification: https://github.com/KhronosGroup/glTF/tree/master/specification/2.0#scenes
     * @param {number} sceneIndex
     * @return {Promise<Group>}
     */
    loadScene(sceneIndex) {
      const extensions = this.extensions;
      const sceneDef = this.json.scenes[sceneIndex];
      const parser = this;

      // Loader returns Group, not Scene.
      // See: https://github.com/mrdoob/three.js/issues/18342#issuecomment-578981172
      const scene = new Group();
      if (sceneDef.name) scene.name = parser.createUniqueName(sceneDef.name);

      assignExtrasToUserData(scene, sceneDef);

      if (sceneDef.extensions)
        addUnknownExtensionsToUserData(extensions, scene, sceneDef);

      const nodeIds = sceneDef.nodes || [];

      const pending = [];

      for (let i = 0, il = nodeIds.length; i < il; i++) {
        pending.push(parser.getDependency("node", nodeIds[i]));
      }

      return Promise.all(pending).then(function (nodes) {
        for (let i = 0, il = nodes.length; i < il; i++) {
          scene.add(nodes[i]);
        }

        // Removes dangling associations, associations that reference a node that
        // didn't make it into the scene.
        const reduceAssociations = (node) => {
          const reducedAssociations = new Map();

          for (const [key, value] of parser.associations) {
            if (key instanceof Material || key instanceof Texture) {
              reducedAssociations.set(key, value);
            }
          }

          node.traverse((node) => {
            const mappings = parser.associations.get(node);

            if (mappings != null) {
              reducedAssociations.set(node, mappings);
            }
          });

          return reducedAssociations;
        };

        parser.associations = reduceAssociations(scene);

        return scene;
      });
    }

    _createAnimationTracks(
      node,
      inputAccessor,
      outputAccessor,
      sampler,
      target
    ) {
      const tracks = [];

      const targetName = node.name ? node.name : node.uuid;
      const targetNames = [];

      if (PATH_PROPERTIES[target.path] === PATH_PROPERTIES.weights) {
        node.traverse(function (object) {
          if (object.morphTargetInfluences) {
            targetNames.push(object.name ? object.name : object.uuid);
          }
        });
      } else {
        targetNames.push(targetName);
      }

      let TypedKeyframeTrack;

      switch (PATH_PROPERTIES[target.path]) {
        case PATH_PROPERTIES.weights:
          TypedKeyframeTrack = NumberKeyframeTrack;
          break;

        case PATH_PROPERTIES.rotation:
          TypedKeyframeTrack = QuaternionKeyframeTrack;
          break;

        case PATH_PROPERTIES.position:
        case PATH_PROPERTIES.scale:
          TypedKeyframeTrack = VectorKeyframeTrack;
          break;

        default:
          switch (outputAccessor.itemSize) {
            case 1:
              TypedKeyframeTrack = NumberKeyframeTrack;
              break;
            case 2:
            case 3:
            default:
              TypedKeyframeTrack = VectorKeyframeTrack;
              break;
          }

          break;
      }

      const interpolation =
        sampler.interpolation !== undefined
          ? INTERPOLATION[sampler.interpolation]
          : InterpolateLinear;

      const outputArray = this._getArrayFromAccessor(outputAccessor);

      for (let j = 0, jl = targetNames.length; j < jl; j++) {
        const track = new TypedKeyframeTrack(
          targetNames[j] + "." + PATH_PROPERTIES[target.path],
          inputAccessor.array,
          outputArray,
          interpolation
        );

        // Override interpolation with custom factory method.
        if (sampler.interpolation === "CUBICSPLINE") {
          this._createCubicSplineTrackInterpolant(track);
        }

        tracks.push(track);
      }

      return tracks;
    }

    _getArrayFromAccessor(accessor) {
      let outputArray = accessor.array;

      if (accessor.normalized) {
        const scale = getNormalizedComponentScale(outputArray.constructor);
        const scaled = new Float32Array(outputArray.length);

        for (let j = 0, jl = outputArray.length; j < jl; j++) {
          scaled[j] = outputArray[j] * scale;
        }

        outputArray = scaled;
      }

      return outputArray;
    }

    _createCubicSplineTrackInterpolant(track) {
      track.createInterpolant =
        function InterpolantFactoryMethodGLTFCubicSpline(result) {
          // A CUBICSPLINE keyframe in glTF has three output values for each input value,
          // representing inTangent, splineVertex, and outTangent. As a result, track.getValueSize()
          // must be divided by three to get the interpolant's sampleSize argument.

          const interpolantType =
            this instanceof QuaternionKeyframeTrack
              ? GLTFCubicSplineQuaternionInterpolant
              : GLTFCubicSplineInterpolant;

          return new interpolantType(
            this.times,
            this.values,
            this.getValueSize() / 3,
            result
          );
        };

      // Mark as CUBICSPLINE. `track.getInterpolation()` doesn't support custom interpolants.
      track.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = true;
    }
  }

  /**
   * @param {BufferGeometry} geometry
   * @param {GLTF.Primitive} primitiveDef
   * @param {GLTFParser} parser
   */
  function computeBounds(geometry, primitiveDef, parser) {
    const attributes = primitiveDef.attributes;

    const box = new Box3();

    if (attributes.POSITION !== undefined) {
      const accessor = parser.json.accessors[attributes.POSITION];

      const min = accessor.min;
      const max = accessor.max;

      // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

      if (min !== undefined && max !== undefined) {
        box.set(
          new Vector3(min[0], min[1], min[2]),
          new Vector3(max[0], max[1], max[2])
        );

        if (accessor.normalized) {
          const boxScale = getNormalizedComponentScale(
            WEBGL_COMPONENT_TYPES[accessor.componentType]
          );
          box.min.multiplyScalar(boxScale);
          box.max.multiplyScalar(boxScale);
        }
      } else {
        console.warn(
          "THREE.GLTFLoader: Missing min/max properties for accessor POSITION."
        );

        return;
      }
    } else {
      return;
    }

    const targets = primitiveDef.targets;

    if (targets !== undefined) {
      const maxDisplacement = new Vector3();
      const vector = new Vector3();

      for (let i = 0, il = targets.length; i < il; i++) {
        const target = targets[i];

        if (target.POSITION !== undefined) {
          const accessor = parser.json.accessors[target.POSITION];
          const min = accessor.min;
          const max = accessor.max;

          // glTF requires 'min' and 'max', but VRM (which extends glTF) currently ignores that requirement.

          if (min !== undefined && max !== undefined) {
            // we need to get max of absolute components because target weight is [-1,1]
            vector.setX(Math.max(Math.abs(min[0]), Math.abs(max[0])));
            vector.setY(Math.max(Math.abs(min[1]), Math.abs(max[1])));
            vector.setZ(Math.max(Math.abs(min[2]), Math.abs(max[2])));

            if (accessor.normalized) {
              const boxScale = getNormalizedComponentScale(
                WEBGL_COMPONENT_TYPES[accessor.componentType]
              );
              vector.multiplyScalar(boxScale);
            }

            // Note: this assumes that the sum of all weights is at most 1. This isn't quite correct - it's more conservative
            // to assume that each target can have a max weight of 1. However, for some use cases - notably, when morph targets
            // are used to implement key-frame animations and as such only two are active at a time - this results in very large
            // boxes. So for now we make a box that's sometimes a touch too small but is hopefully mostly of reasonable size.
            maxDisplacement.max(vector);
          } else {
            console.warn(
              "THREE.GLTFLoader: Missing min/max properties for accessor POSITION."
            );
          }
        }
      }

      // As per comment above this box isn't conservative, but has a reasonable size for a very large number of morph targets.
      box.expandByVector(maxDisplacement);
    }

    geometry.boundingBox = box;

    const sphere = new Sphere();

    box.getCenter(sphere.center);
    sphere.radius = box.min.distanceTo(box.max) / 2;

    geometry.boundingSphere = sphere;
  }

  /**
   * @param {BufferGeometry} geometry
   * @param {GLTF.Primitive} primitiveDef
   * @param {GLTFParser} parser
   * @return {Promise<BufferGeometry>}
   */
  function addPrimitiveAttributes(geometry, primitiveDef, parser) {
    const attributes = primitiveDef.attributes;

    const pending = [];

    function assignAttributeAccessor(accessorIndex, attributeName) {
      return parser
        .getDependency("accessor", accessorIndex)
        .then(function (accessor) {
          geometry.setAttribute(attributeName, accessor);
        });
    }

    for (const gltfAttributeName in attributes) {
      const threeAttributeName =
        ATTRIBUTES[gltfAttributeName] || gltfAttributeName.toLowerCase();

      // Skip attributes already provided by e.g. Draco extension.
      if (threeAttributeName in geometry.attributes) continue;

      pending.push(
        assignAttributeAccessor(
          attributes[gltfAttributeName],
          threeAttributeName
        )
      );
    }

    if (primitiveDef.indices !== undefined && !geometry.index) {
      const accessor = parser
        .getDependency("accessor", primitiveDef.indices)
        .then(function (accessor) {
          geometry.setIndex(accessor);
        });

      pending.push(accessor);
    }

    assignExtrasToUserData(geometry, primitiveDef);

    computeBounds(geometry, primitiveDef, parser);

    return Promise.all(pending).then(function () {
      return primitiveDef.targets !== undefined
        ? addMorphTargets(geometry, primitiveDef.targets, parser)
        : geometry;
    });
  }

  const GLTFLoader$1 = /*#__PURE__*/ Object.freeze(
    /*#__PURE__*/ Object.defineProperty(
      {
        __proto__: null,
        GLTFLoader,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  );

  const _taskCache = new WeakMap();

  class DRACOLoader extends Loader {
    constructor(manager) {
      super(manager);

      this.decoderPath = "";
      this.decoderConfig = {};
      this.decoderBinary = null;
      this.decoderPending = null;

      this.workerLimit = 4;
      this.workerPool = [];
      this.workerNextTaskID = 1;
      this.workerSourceURL = "";

      this.defaultAttributeIDs = {
        position: "POSITION",
        normal: "NORMAL",
        color: "COLOR",
        uv: "TEX_COORD",
      };
      this.defaultAttributeTypes = {
        position: "Float32Array",
        normal: "Float32Array",
        color: "Float32Array",
        uv: "Float32Array",
      };
    }

    setDecoderPath(path) {
      this.decoderPath = path;

      return this;
    }

    setDecoderConfig(config) {
      this.decoderConfig = config;

      return this;
    }

    setWorkerLimit(workerLimit) {
      this.workerLimit = workerLimit;

      return this;
    }

    load(url, onLoad, onProgress, onError) {
      const loader = new FileLoader(this.manager);

      loader.setPath(this.path);
      loader.setResponseType("arraybuffer");
      loader.setRequestHeader(this.requestHeader);
      loader.setWithCredentials(this.withCredentials);

      loader.load(
        url,
        (buffer) => {
          this.parse(buffer, onLoad, onError);
        },
        onProgress,
        onError
      );
    }

    parse(buffer, onLoad, onError) {
      this.decodeDracoFile(buffer, onLoad, null, null, SRGBColorSpace).catch(
        onError
      );
    }

    decodeDracoFile(
      buffer,
      callback,
      attributeIDs,
      attributeTypes,
      vertexColorSpace = LinearSRGBColorSpace
    ) {
      const taskConfig = {
        attributeIDs: attributeIDs || this.defaultAttributeIDs,
        attributeTypes: attributeTypes || this.defaultAttributeTypes,
        useUniqueIDs: !!attributeIDs,
        vertexColorSpace: vertexColorSpace,
      };

      return this.decodeGeometry(buffer, taskConfig).then(callback);
    }

    decodeGeometry(buffer, taskConfig) {
      const taskKey = JSON.stringify(taskConfig);

      // Check for an existing task using this buffer. A transferred buffer cannot be transferred
      // again from this thread.
      if (_taskCache.has(buffer)) {
        const cachedTask = _taskCache.get(buffer);

        if (cachedTask.key === taskKey) {
          return cachedTask.promise;
        } else if (buffer.byteLength === 0) {
          // Technically, it would be possible to wait for the previous task to complete,
          // transfer the buffer back, and decode again with the second configuration. That
          // is complex, and I don't know of any reason to decode a Draco buffer twice in
          // different ways, so this is left unimplemented.
          throw new Error(
            "THREE.DRACOLoader: Unable to re-decode a buffer with different " +
              "settings. Buffer has already been transferred."
          );
        }
      }

      //

      let worker;
      const taskID = this.workerNextTaskID++;
      const taskCost = buffer.byteLength;

      // Obtain a worker and assign a task, and construct a geometry instance
      // when the task completes.
      const geometryPending = this._getWorker(taskID, taskCost)
        .then((_worker) => {
          worker = _worker;

          return new Promise((resolve, reject) => {
            worker._callbacks[taskID] = { resolve, reject };

            worker.postMessage(
              { type: "decode", id: taskID, taskConfig, buffer },
              [buffer]
            );

            // this.debug();
          });
        })
        .then((message) => this._createGeometry(message.geometry));

      // Remove task from the task list.
      // Note: replaced '.finally()' with '.catch().then()' block - iOS 11 support (#19416)
      geometryPending
        .catch(() => true)
        .then(() => {
          if (worker && taskID) {
            this._releaseTask(worker, taskID);

            // this.debug();
          }
        });

      // Cache the task result.
      _taskCache.set(buffer, {
        key: taskKey,
        promise: geometryPending,
      });

      return geometryPending;
    }

    _createGeometry(geometryData) {
      const geometry = new BufferGeometry();

      if (geometryData.index) {
        geometry.setIndex(new BufferAttribute(geometryData.index.array, 1));
      }

      for (let i = 0; i < geometryData.attributes.length; i++) {
        const result = geometryData.attributes[i];
        const name = result.name;
        const array = result.array;
        const itemSize = result.itemSize;

        const attribute = new BufferAttribute(array, itemSize);

        if (name === "color") {
          this._assignVertexColorSpace(attribute, result.vertexColorSpace);

          attribute.normalized = array instanceof Float32Array === false;
        }

        geometry.setAttribute(name, attribute);
      }

      return geometry;
    }

    _assignVertexColorSpace(attribute, inputColorSpace) {
      // While .drc files do not specify colorspace, the only 'official' tooling
      // is PLY and OBJ converters, which use sRGB. We'll assume sRGB when a .drc
      // file is passed into .load() or .parse(). GLTFLoader uses internal APIs
      // to decode geometry, and vertex colors are already Linear-sRGB in there.

      if (inputColorSpace !== SRGBColorSpace) return;

      const _color = new Color();

      for (let i = 0, il = attribute.count; i < il; i++) {
        _color.fromBufferAttribute(attribute, i).convertSRGBToLinear();
        attribute.setXYZ(i, _color.r, _color.g, _color.b);
      }
    }

    _loadLibrary(url, responseType) {
      const loader = new FileLoader(this.manager);
      loader.setPath(this.decoderPath);
      loader.setResponseType(responseType);
      loader.setWithCredentials(this.withCredentials);

      return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject);
      });
    }

    preload() {
      this._initDecoder();

      return this;
    }

    _initDecoder() {
      if (this.decoderPending) return this.decoderPending;

      const useJS =
        typeof WebAssembly !== "object" || this.decoderConfig.type === "js";
      const librariesPending = [];

      if (useJS) {
        librariesPending.push(this._loadLibrary("draco_decoder.js", "text"));
      } else {
        librariesPending.push(
          this._loadLibrary("draco_wasm_wrapper.js", "text")
        );
        librariesPending.push(
          this._loadLibrary("draco_decoder.wasm", "arraybuffer")
        );
      }

      this.decoderPending = Promise.all(librariesPending).then((libraries) => {
        const jsContent = libraries[0];

        if (!useJS) {
          this.decoderConfig.wasmBinary = libraries[1];
        }

        const fn = DRACOWorker.toString();

        const body = [
          "/* draco decoder */",
          jsContent,
          "",
          "/* worker */",
          fn.substring(fn.indexOf("{") + 1, fn.lastIndexOf("}")),
        ].join("\n");

        this.workerSourceURL = URL.createObjectURL(new Blob([body]));
      });

      return this.decoderPending;
    }

    _getWorker(taskID, taskCost) {
      return this._initDecoder().then(() => {
        if (this.workerPool.length < this.workerLimit) {
          const worker = new Worker(this.workerSourceURL);

          worker._callbacks = {};
          worker._taskCosts = {};
          worker._taskLoad = 0;

          worker.postMessage({
            type: "init",
            decoderConfig: this.decoderConfig,
          });

          worker.onmessage = function (e) {
            const message = e.data;

            switch (message.type) {
              case "decode":
                worker._callbacks[message.id].resolve(message);
                break;

              case "error":
                worker._callbacks[message.id].reject(message);
                break;

              default:
                console.error(
                  'THREE.DRACOLoader: Unexpected message, "' +
                    message.type +
                    '"'
                );
            }
          };

          this.workerPool.push(worker);
        } else {
          this.workerPool.sort(function (a, b) {
            return a._taskLoad > b._taskLoad ? -1 : 1;
          });
        }

        const worker = this.workerPool[this.workerPool.length - 1];
        worker._taskCosts[taskID] = taskCost;
        worker._taskLoad += taskCost;
        return worker;
      });
    }

    _releaseTask(worker, taskID) {
      worker._taskLoad -= worker._taskCosts[taskID];
      delete worker._callbacks[taskID];
      delete worker._taskCosts[taskID];
    }

    debug() {
      console.log(
        "Task load: ",
        this.workerPool.map((worker) => worker._taskLoad)
      );
    }

    dispose() {
      for (let i = 0; i < this.workerPool.length; ++i) {
        this.workerPool[i].terminate();
      }

      this.workerPool.length = 0;

      if (this.workerSourceURL !== "") {
        URL.revokeObjectURL(this.workerSourceURL);
      }

      return this;
    }
  }

  /* WEB WORKER */

  function DRACOWorker() {
    let decoderConfig;
    let decoderPending;

    onmessage = function (e) {
      const message = e.data;

      switch (message.type) {
        case "init":
          decoderConfig = message.decoderConfig;
          decoderPending = new Promise(function (resolve /*, reject*/) {
            decoderConfig.onModuleLoaded = function (draco) {
              // Module is Promise-like. Wrap before resolving to avoid loop.
              resolve({ draco: draco });
            };

            DracoDecoderModule(decoderConfig); // eslint-disable-line no-undef
          });
          break;

        case "decode":
          const buffer = message.buffer;
          const taskConfig = message.taskConfig;
          decoderPending.then((module) => {
            const draco = module.draco;
            const decoder = new draco.Decoder();

            try {
              const geometry = decodeGeometry(
                draco,
                decoder,
                new Int8Array(buffer),
                taskConfig
              );

              const buffers = geometry.attributes.map(
                (attr) => attr.array.buffer
              );

              if (geometry.index) buffers.push(geometry.index.array.buffer);

              self.postMessage(
                { type: "decode", id: message.id, geometry },
                buffers
              );
            } catch (error) {
              console.error(error);

              self.postMessage({
                type: "error",
                id: message.id,
                error: error.message,
              });
            } finally {
              draco.destroy(decoder);
            }
          });
          break;
      }
    };

    function decodeGeometry(draco, decoder, array, taskConfig) {
      const attributeIDs = taskConfig.attributeIDs;
      const attributeTypes = taskConfig.attributeTypes;

      let dracoGeometry;
      let decodingStatus;

      const geometryType = decoder.GetEncodedGeometryType(array);

      if (geometryType === draco.TRIANGULAR_MESH) {
        dracoGeometry = new draco.Mesh();
        decodingStatus = decoder.DecodeArrayToMesh(
          array,
          array.byteLength,
          dracoGeometry
        );
      } else if (geometryType === draco.POINT_CLOUD) {
        dracoGeometry = new draco.PointCloud();
        decodingStatus = decoder.DecodeArrayToPointCloud(
          array,
          array.byteLength,
          dracoGeometry
        );
      } else {
        throw new Error("THREE.DRACOLoader: Unexpected geometry type.");
      }

      if (!decodingStatus.ok() || dracoGeometry.ptr === 0) {
        throw new Error(
          "THREE.DRACOLoader: Decoding failed: " + decodingStatus.error_msg()
        );
      }

      const geometry = { index: null, attributes: [] };

      // Gather all vertex attributes.
      for (const attributeName in attributeIDs) {
        const attributeType = self[attributeTypes[attributeName]];

        let attribute;
        let attributeID;

        // A Draco file may be created with default vertex attributes, whose attribute IDs
        // are mapped 1:1 from their semantic name (POSITION, NORMAL, ...). Alternatively,
        // a Draco file may contain a custom set of attributes, identified by known unique
        // IDs. glTF files always do the latter, and `.drc` files typically do the former.
        if (taskConfig.useUniqueIDs) {
          attributeID = attributeIDs[attributeName];
          attribute = decoder.GetAttributeByUniqueId(
            dracoGeometry,
            attributeID
          );
        } else {
          attributeID = decoder.GetAttributeId(
            dracoGeometry,
            draco[attributeIDs[attributeName]]
          );

          if (attributeID === -1) continue;

          attribute = decoder.GetAttribute(dracoGeometry, attributeID);
        }

        const attributeResult = decodeAttribute(
          draco,
          decoder,
          dracoGeometry,
          attributeName,
          attributeType,
          attribute
        );

        if (attributeName === "color") {
          attributeResult.vertexColorSpace = taskConfig.vertexColorSpace;
        }

        geometry.attributes.push(attributeResult);
      }

      // Add index.
      if (geometryType === draco.TRIANGULAR_MESH) {
        geometry.index = decodeIndex(draco, decoder, dracoGeometry);
      }

      draco.destroy(dracoGeometry);

      return geometry;
    }

    function decodeIndex(draco, decoder, dracoGeometry) {
      const numFaces = dracoGeometry.num_faces();
      const numIndices = numFaces * 3;
      const byteLength = numIndices * 4;

      const ptr = draco._malloc(byteLength);
      decoder.GetTrianglesUInt32Array(dracoGeometry, byteLength, ptr);
      const index = new Uint32Array(
        draco.HEAPF32.buffer,
        ptr,
        numIndices
      ).slice();
      draco._free(ptr);

      return { array: index, itemSize: 1 };
    }

    function decodeAttribute(
      draco,
      decoder,
      dracoGeometry,
      attributeName,
      attributeType,
      attribute
    ) {
      const numComponents = attribute.num_components();
      const numPoints = dracoGeometry.num_points();
      const numValues = numPoints * numComponents;
      const byteLength = numValues * attributeType.BYTES_PER_ELEMENT;
      const dataType = getDracoDataType(draco, attributeType);

      const ptr = draco._malloc(byteLength);
      decoder.GetAttributeDataArrayForAllPoints(
        dracoGeometry,
        attribute,
        dataType,
        byteLength,
        ptr
      );
      const array = new attributeType(
        draco.HEAPF32.buffer,
        ptr,
        numValues
      ).slice();
      draco._free(ptr);

      return {
        name: attributeName,
        array: array,
        itemSize: numComponents,
      };
    }

    function getDracoDataType(draco, attributeType) {
      switch (attributeType) {
        case Float32Array:
          return draco.DT_FLOAT32;
        case Int8Array:
          return draco.DT_INT8;
        case Int16Array:
          return draco.DT_INT16;
        case Int32Array:
          return draco.DT_INT32;
        case Uint8Array:
          return draco.DT_UINT8;
        case Uint16Array:
          return draco.DT_UINT16;
        case Uint32Array:
          return draco.DT_UINT32;
      }
    }
  }

  const DRACOLoader$1 = /*#__PURE__*/ Object.freeze(
    /*#__PURE__*/ Object.defineProperty(
      {
        __proto__: null,
        DRACOLoader,
      },
      Symbol.toStringTag,
      { value: "Module" }
    )
  );

  exports.linkIntoEngine = linkIntoEngine;
  exports.makeShadeupEngine = makeShadeupEngine;

  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
});

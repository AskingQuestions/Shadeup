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
  clear(immediate = false, color = "auto") {
  }
  draw() {
  }
  init() {
  }
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
    if (!listeners)
      return;
    const index = listeners.indexOf(callback);
    if (index === -1)
      return;
    listeners.splice(index, 1);
  }
  triggerEvent(name, ...args) {
    const listeners = this.listeners.get(name);
    if (!listeners)
      return;
    for (const listener of listeners) {
      listener(...args);
    }
  }
  dispatch(dispatch, options = {
    depthTest: true
  }) {
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
  drawImage(image, x, y, width, height) {
  }
  async downloadImage() {
    return new Float32Array(0);
  }
  uploadImage(data) {
  }
  setViewport(width, height) {
    this.viewportSize = [width, height];
  }
  getOrCreateShader(instance, type, config) {
    return new GenericShader("", "vertex");
  }
  createShader(code, type) {
    return new GenericShader("", "vertex");
  }
  unbindTexture(texture) {
  }
  dispose() {
  }
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
const perf = typeof performance === 'object' &&
    performance &&
    typeof performance.now === 'function'
    ? performance
    : Date;
const warned = new Set();
/* c8 ignore start */
const PROCESS = (typeof process === 'object' && !!process ? process : {});
/* c8 ignore start */
const emitWarning = (msg, type, code, fn) => {
    typeof PROCESS.emitWarning === 'function'
        ? PROCESS.emitWarning(msg, type, code, fn)
        : console.error(`[${code}] ${type}: ${msg}`);
};
let AC = globalThis.AbortController;
let AS = globalThis.AbortSignal;
/* c8 ignore start */
if (typeof AC === 'undefined') {
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
            if (this.signal.aborted)
                return;
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
    let printACPolyfillWarning = PROCESS.env?.LRU_CACHE_IGNORE_AC_WARNING !== '1';
    const warnACPolyfill = () => {
        if (!printACPolyfillWarning)
            return;
        printACPolyfillWarning = false;
        emitWarning('AbortController is not defined. If using lru-cache in ' +
            'node 14, load an AbortController polyfill from the ' +
            '`node-abort-controller` package. A minimal polyfill is ' +
            'provided for use by LRUCache.fetch(), but it should not be ' +
            'relied upon in other contexts (eg, passing it to other APIs that ' +
            'use AbortController/AbortSignal might have undesirable effects). ' +
            'You may disable this with LRU_CACHE_IGNORE_AC_WARNING=1 in the env.', 'NO_ABORT_CONTROLLER', 'ENOTSUP', warnACPolyfill);
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
const getUintArray = (max) => !isPosInt(max)
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
        if (!HeapCls)
            return [];
        Stack.#constructing = true;
        const s = new Stack(max, HeapCls);
        Stack.#constructing = false;
        return s;
    }
    constructor(max, HeapCls) {
        /* c8 ignore start */
        if (!Stack.#constructing) {
            throw new TypeError('instantiate Stack using Stack.create(n)');
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
            backgroundFetch: (k, index, options, context) => c.#backgroundFetch(k, index, options, context),
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
        const { max = 0, ttl, ttlResolution = 1, ttlAutopurge, updateAgeOnGet, updateAgeOnHas, allowStale, dispose, disposeAfter, noDisposeOnSet, noUpdateTTL, maxSize = 0, maxEntrySize = 0, sizeCalculation, fetchMethod, noDeleteOnFetchRejection, noDeleteOnStaleGet, allowStaleOnFetchRejection, allowStaleOnFetchAbort, ignoreFetchAbort, } = options;
        if (max !== 0 && !isPosInt(max)) {
            throw new TypeError('max option must be a nonnegative integer');
        }
        const UintArray = max ? getUintArray(max) : Array;
        if (!UintArray) {
            throw new Error('invalid max value: ' + max);
        }
        this.#max = max;
        this.#maxSize = maxSize;
        this.maxEntrySize = maxEntrySize || this.#maxSize;
        this.sizeCalculation = sizeCalculation;
        if (this.sizeCalculation) {
            if (!this.#maxSize && !this.maxEntrySize) {
                throw new TypeError('cannot set sizeCalculation without setting maxSize or maxEntrySize');
            }
            if (typeof this.sizeCalculation !== 'function') {
                throw new TypeError('sizeCalculation set to non-function');
            }
        }
        if (fetchMethod !== undefined &&
            typeof fetchMethod !== 'function') {
            throw new TypeError('fetchMethod must be a function if specified');
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
        if (typeof dispose === 'function') {
            this.#dispose = dispose;
        }
        if (typeof disposeAfter === 'function') {
            this.#disposeAfter = disposeAfter;
            this.#disposed = [];
        }
        else {
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
                    throw new TypeError('maxSize must be a positive integer if specified');
                }
            }
            if (!isPosInt(this.maxEntrySize)) {
                throw new TypeError('maxEntrySize must be a positive integer if specified');
            }
            this.#initializeSizeTracking();
        }
        this.allowStale = !!allowStale;
        this.noDeleteOnStaleGet = !!noDeleteOnStaleGet;
        this.updateAgeOnGet = !!updateAgeOnGet;
        this.updateAgeOnHas = !!updateAgeOnHas;
        this.ttlResolution =
            isPosInt(ttlResolution) || ttlResolution === 0
                ? ttlResolution
                : 1;
        this.ttlAutopurge = !!ttlAutopurge;
        this.ttl = ttl || 0;
        if (this.ttl) {
            if (!isPosInt(this.ttl)) {
                throw new TypeError('ttl must be a positive integer if specified');
            }
            this.#initializeTTLTracking();
        }
        // do not allow completely unbounded caches
        if (this.#max === 0 && this.ttl === 0 && this.#maxSize === 0) {
            throw new TypeError('At least one of max, maxSize, or ttl is required');
        }
        if (!this.ttlAutopurge && !this.#max && !this.#maxSize) {
            const code = 'LRU_CACHE_UNBOUNDED';
            if (shouldWarn(code)) {
                warned.add(code);
                const msg = 'TTL caching without ttlAutopurge, max, or maxSize can ' +
                    'result in unbounded memory consumption.';
                emitWarning(msg, 'UnboundedCacheWarning', code, LRUCache);
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
        this.#updateItemAge = index => {
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
        this.getRemainingTTL = key => {
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
        this.#isStale = index => {
            return (ttls[index] !== 0 &&
                starts[index] !== 0 &&
                (cachedNow || getNow()) - starts[index] > ttls[index]);
        };
    }
    // conditionally set private methods related to TTL
    #updateItemAge = () => { };
    #statusTTL = () => { };
    #setItemTTL = () => { };
    /* c8 ignore stop */
    #isStale = () => false;
    #initializeSizeTracking() {
        const sizes = new ZeroArray(this.#max);
        this.#calculatedSize = 0;
        this.#sizes = sizes;
        this.#removeItemSize = index => {
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
                    if (typeof sizeCalculation !== 'function') {
                        throw new TypeError('sizeCalculation must be a function');
                    }
                    size = sizeCalculation(v, k);
                    if (!isPosInt(size)) {
                        throw new TypeError('sizeCalculation return invalid (expect positive integer)');
                    }
                }
                else {
                    throw new TypeError('invalid size value (must be positive integer). ' +
                        'When maxSize or maxEntrySize is used, sizeCalculation ' +
                        'or size must be set.');
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
    #removeItemSize = _i => { };
    #addItemSize = (_i, _s, _st) => { };
    #requireSize = (_k, _v, size, sizeCalculation) => {
        if (size || sizeCalculation) {
            throw new TypeError('cannot set size without setting maxSize or maxEntrySize on cache');
        }
        return 0;
    };
    *#indexes({ allowStale = this.allowStale } = {}) {
        if (this.#size) {
            for (let i = this.#tail; true;) {
                if (!this.#isValidIndex(i)) {
                    break;
                }
                if (allowStale || !this.#isStale(i)) {
                    yield i;
                }
                if (i === this.#head) {
                    break;
                }
                else {
                    i = this.#prev[i];
                }
            }
        }
    }
    *#rindexes({ allowStale = this.allowStale } = {}) {
        if (this.#size) {
            for (let i = this.#head; true;) {
                if (!this.#isValidIndex(i)) {
                    break;
                }
                if (allowStale || !this.#isStale(i)) {
                    yield i;
                }
                if (i === this.#tail) {
                    break;
                }
                else {
                    i = this.#next[i];
                }
            }
        }
    }
    #isValidIndex(index) {
        return (index !== undefined &&
            this.#keyMap.get(this.#keyList[index]) === index);
    }
    /**
     * Return a generator yielding `[key, value]` pairs,
     * in order from most recently used to least recently used.
     */
    *entries() {
        for (const i of this.#indexes()) {
            if (this.#valList[i] !== undefined &&
                this.#keyList[i] !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            if (this.#valList[i] !== undefined &&
                this.#keyList[i] !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            if (k !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            if (k !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            if (v !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            if (v !== undefined &&
                !this.#isBackgroundFetch(this.#valList[i])) {
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
            const value = this.#isBackgroundFetch(v)
                ? v.__staleWhileFetching
                : v;
            if (value === undefined)
                continue;
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
            const value = this.#isBackgroundFetch(v)
                ? v.__staleWhileFetching
                : v;
            if (value === undefined)
                continue;
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
            const value = this.#isBackgroundFetch(v)
                ? v.__staleWhileFetching
                : v;
            if (value === undefined)
                continue;
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
            const value = this.#isBackgroundFetch(v)
                ? v.__staleWhileFetching
                : v;
            if (value === undefined || key === undefined)
                continue;
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
        const { ttl = this.ttl, start, noDisposeOnSet = this.noDisposeOnSet, sizeCalculation = this.sizeCalculation, status, } = setOptions;
        let { noUpdateTTL = this.noUpdateTTL } = setOptions;
        const size = this.#requireSize(k, v, setOptions.size || 0, sizeCalculation);
        // if the item doesn't fit, don't do anything
        // NB: maxEntrySize set to maxSize by default
        if (this.maxEntrySize && size > this.maxEntrySize) {
            if (status) {
                status.set = 'miss';
                status.maxEntrySizeExceeded = true;
            }
            // have to delete, in case something is there already.
            this.delete(k);
            return this;
        }
        let index = this.#size === 0 ? undefined : this.#keyMap.get(k);
        if (index === undefined) {
            // addition
            index = (this.#size === 0
                ? this.#tail
                : this.#free.length !== 0
                    ? this.#free.pop()
                    : this.#size === this.#max
                        ? this.#evict(false)
                        : this.#size);
            this.#keyList[index] = k;
            this.#valList[index] = v;
            this.#keyMap.set(k, index);
            this.#next[this.#tail] = index;
            this.#prev[index] = this.#tail;
            this.#tail = index;
            this.#size++;
            this.#addItemSize(index, size, status);
            if (status)
                status.set = 'add';
            noUpdateTTL = false;
        }
        else {
            // update
            this.#moveToTail(index);
            const oldVal = this.#valList[index];
            if (v !== oldVal) {
                if (this.#hasFetchMethod && this.#isBackgroundFetch(oldVal)) {
                    oldVal.__abortController.abort(new Error('replaced'));
                }
                else if (!noDisposeOnSet) {
                    if (this.#hasDispose) {
                        this.#dispose?.(oldVal, k, 'set');
                    }
                    if (this.#hasDisposeAfter) {
                        this.#disposed?.push([oldVal, k, 'set']);
                    }
                }
                this.#removeItemSize(index);
                this.#addItemSize(index, size, status);
                this.#valList[index] = v;
                if (status) {
                    status.set = 'replace';
                    const oldValue = oldVal && this.#isBackgroundFetch(oldVal)
                        ? oldVal.__staleWhileFetching
                        : oldVal;
                    if (oldValue !== undefined)
                        status.oldValue = oldValue;
                }
            }
            else if (status) {
                status.set = 'update';
            }
        }
        if (ttl !== 0 && !this.#ttls) {
            this.#initializeTTLTracking();
        }
        if (this.#ttls) {
            if (!noUpdateTTL) {
                this.#setItemTTL(index, ttl, start);
            }
            if (status)
                this.#statusTTL(status, index);
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
                }
                else if (val !== undefined) {
                    return val;
                }
            }
        }
        finally {
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
            v.__abortController.abort(new Error('evicted'));
        }
        else if (this.#hasDispose || this.#hasDisposeAfter) {
            if (this.#hasDispose) {
                this.#dispose?.(v, k, 'evict');
            }
            if (this.#hasDisposeAfter) {
                this.#disposed?.push([v, k, 'evict']);
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
        }
        else {
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
            if (this.#isBackgroundFetch(v) &&
                v.__staleWhileFetching === undefined) {
                return false;
            }
            if (!this.#isStale(index)) {
                if (updateAgeOnHas) {
                    this.#updateItemAge(index);
                }
                if (status) {
                    status.has = 'hit';
                    this.#statusTTL(status, index);
                }
                return true;
            }
            else if (status) {
                status.has = 'stale';
                this.#statusTTL(status, index);
            }
        }
        else if (status) {
            status.has = 'miss';
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
        if (index !== undefined &&
            (allowStale || !this.#isStale(index))) {
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
        signal?.addEventListener('abort', () => ac.abort(signal.reason), {
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
                    if (ignoreAbort)
                        options.status.fetchAbortIgnored = true;
                }
                else {
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
                    }
                    else {
                        this.delete(k);
                    }
                }
                else {
                    if (options.status)
                        options.status.fetchUpdated = true;
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
            const allowStale = allowStaleAborted || options.allowStaleOnFetchRejection;
            const noDelete = allowStale || options.noDeleteOnFetchRejection;
            const bf = p;
            if (this.#valList[index] === p) {
                // if we allow stale on fetch rejections, then we need to ensure that
                // the stale value is not removed from the cache when the fetch fails.
                const del = !noDelete || bf.__staleWhileFetching === undefined;
                if (del) {
                    this.delete(k);
                }
                else if (!allowStaleAborted) {
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
            }
            else if (bf.__returned === bf) {
                throw er;
            }
        };
        const pcall = (res, rej) => {
            const fmp = this.#fetchMethod?.(k, v, fetchOpts);
            if (fmp && fmp instanceof Promise) {
                fmp.then(v => res(v === undefined ? undefined : v), rej);
            }
            // ignored, we go until we finish, regardless.
            // defer check until we are actually aborting,
            // so fetchMethod can override.
            ac.signal.addEventListener('abort', () => {
                if (!options.ignoreFetchAbort ||
                    options.allowStaleOnFetchAbort) {
                    res(undefined);
                    // when it eventually resolves, update the cache.
                    if (options.allowStaleOnFetchAbort) {
                        res = v => cb(v, true);
                    }
                }
            });
        };
        if (options.status)
            options.status.fetchDispatched = true;
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
        }
        else {
            this.#valList[index] = bf;
        }
        return bf;
    }
    #isBackgroundFetch(p) {
        if (!this.#hasFetchMethod)
            return false;
        const b = p;
        return (!!b &&
            b instanceof Promise &&
            b.hasOwnProperty('__staleWhileFetching') &&
            b.__abortController instanceof AC);
    }
    async fetch(k, fetchOptions = {}) {
        const { 
        // get options
        allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, 
        // set options
        ttl = this.ttl, noDisposeOnSet = this.noDisposeOnSet, size = 0, sizeCalculation = this.sizeCalculation, noUpdateTTL = this.noUpdateTTL, 
        // fetch exclusive options
        noDeleteOnFetchRejection = this.noDeleteOnFetchRejection, allowStaleOnFetchRejection = this.allowStaleOnFetchRejection, ignoreFetchAbort = this.ignoreFetchAbort, allowStaleOnFetchAbort = this.allowStaleOnFetchAbort, context, forceRefresh = false, status, signal, } = fetchOptions;
        if (!this.#hasFetchMethod) {
            if (status)
                status.fetch = 'get';
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
            if (status)
                status.fetch = 'miss';
            const p = this.#backgroundFetch(k, index, options, context);
            return (p.__returned = p);
        }
        else {
            // in cache, maybe already fetching
            const v = this.#valList[index];
            if (this.#isBackgroundFetch(v)) {
                const stale = allowStale && v.__staleWhileFetching !== undefined;
                if (status) {
                    status.fetch = 'inflight';
                    if (stale)
                        status.returnedStale = true;
                }
                return stale ? v.__staleWhileFetching : (v.__returned = v);
            }
            // if we force a refresh, that means do NOT serve the cached value,
            // unless we are already in the process of refreshing the cache.
            const isStale = this.#isStale(index);
            if (!forceRefresh && !isStale) {
                if (status)
                    status.fetch = 'hit';
                this.#moveToTail(index);
                if (updateAgeOnGet) {
                    this.#updateItemAge(index);
                }
                if (status)
                    this.#statusTTL(status, index);
                return v;
            }
            // ok, it is stale or a forced refresh, and not already fetching.
            // refresh the cache.
            const p = this.#backgroundFetch(k, index, options, context);
            const hasStale = p.__staleWhileFetching !== undefined;
            const staleVal = hasStale && allowStale;
            if (status) {
                status.fetch = isStale ? 'stale' : 'refresh';
                if (staleVal && isStale)
                    status.returnedStale = true;
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
        const { allowStale = this.allowStale, updateAgeOnGet = this.updateAgeOnGet, noDeleteOnStaleGet = this.noDeleteOnStaleGet, status, } = getOptions;
        const index = this.#keyMap.get(k);
        if (index !== undefined) {
            const value = this.#valList[index];
            const fetching = this.#isBackgroundFetch(value);
            if (status)
                this.#statusTTL(status, index);
            if (this.#isStale(index)) {
                if (status)
                    status.get = 'stale';
                // delete only if not an in-flight background fetch
                if (!fetching) {
                    if (!noDeleteOnStaleGet) {
                        this.delete(k);
                    }
                    if (status && allowStale)
                        status.returnedStale = true;
                    return allowStale ? value : undefined;
                }
                else {
                    if (status &&
                        allowStale &&
                        value.__staleWhileFetching !== undefined) {
                        status.returnedStale = true;
                    }
                    return allowStale ? value.__staleWhileFetching : undefined;
                }
            }
            else {
                if (status)
                    status.get = 'hit';
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
        }
        else if (status) {
            status.get = 'miss';
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
            }
            else {
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
                }
                else {
                    this.#removeItemSize(index);
                    const v = this.#valList[index];
                    if (this.#isBackgroundFetch(v)) {
                        v.__abortController.abort(new Error('deleted'));
                    }
                    else if (this.#hasDispose || this.#hasDisposeAfter) {
                        if (this.#hasDispose) {
                            this.#dispose?.(v, k, 'delete');
                        }
                        if (this.#hasDisposeAfter) {
                            this.#disposed?.push([v, k, 'delete']);
                        }
                    }
                    this.#keyMap.delete(k);
                    this.#keyList[index] = undefined;
                    this.#valList[index] = undefined;
                    if (index === this.#tail) {
                        this.#tail = this.#prev[index];
                    }
                    else if (index === this.#head) {
                        this.#head = this.#next[index];
                    }
                    else {
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
                v.__abortController.abort(new Error('deleted'));
            }
            else {
                const k = this.#keyList[index];
                if (this.#hasDispose) {
                    this.#dispose?.(v, k, 'delete');
                }
                if (this.#hasDisposeAfter) {
                    this.#disposed?.push([v, k, 'delete']);
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
    sampleTypes: ["float", "unfilterable-float"]
  },
  r8snorm: {
    blendable: false,
    sampleTypes: ["float", "unfilterable-float"]
  },
  r8uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  r8sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rg8unorm: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rg8snorm: {
    blendable: false,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rg8uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rg8sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rgba8unorm: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  "rgba8unorm-srgb": {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rgba8snorm: {
    blendable: false,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rgba8uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rgba8sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  bgra8unorm: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  "bgra8unorm-srgb": {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  r16uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  r16sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  r16float: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rg16uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rg16sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rg16float: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rgba16uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rgba16sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rgba16float: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  r32uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  r32sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  r32float: {
    blendable: false,
    sampleTypes: [
      "unfilterable-float",
      "float",
      "float32-filterable",
      "float",
      "float32-filterable"
    ]
  },
  rg32uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rg32sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rg32float: {
    blendable: false,
    sampleTypes: [
      "unfilterable-float",
      "float",
      "float32-filterable",
      "float",
      "float32-filterable"
    ]
  },
  rgba32uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rgba32sint: {
    blendable: false,
    sampleTypes: ["sint"]
  },
  rgba32float: {
    blendable: false,
    sampleTypes: [
      "unfilterable-float",
      "float",
      "float32-filterable",
      "float",
      "float32-filterable"
    ]
  },
  rgb10a2uint: {
    blendable: false,
    sampleTypes: ["uint"]
  },
  rgb10a2unorm: {
    blendable: true,
    sampleTypes: ["float", "unfilterable-float"]
  },
  rg11b10ufloat: {
    blendable: false,
    sampleTypes: ["float", "unfilterable-float"]
  }
};
class WebGPUMeshData {
  sourceMesh;
  vertexBuffer;
  indexBuffer;
  vertexCount;
  indexCount;
  constructor(sourceMesh, vertexBuffer, indexBuffer, vertexCount, indexCount) {
    this.sourceMesh = sourceMesh;
    this.vertexBuffer = vertexBuffer;
    this.indexBuffer = indexBuffer;
    this.vertexCount = vertexCount;
    this.indexCount = indexCount;
  }
}
const lruCacheOptions = {
  max: 500
};
let lruUniformOptions = {
  max: 128
};
const vertexLayout = [
  {
    // Position
    arrayStride: (3 + // Position
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
        format: "float32x3"
      },
      {
        shaderLocation: 1,
        offset: 3 * 4,
        format: "float32x3"
      },
      {
        shaderLocation: 2,
        offset: (3 + 3) * 4,
        format: "float32x3"
      },
      {
        shaderLocation: 3,
        offset: (3 + 3 + 3) * 4,
        format: "float32x3"
      },
      {
        shaderLocation: 4,
        offset: (3 + 3 + 3 + 3) * 4,
        format: "float32x2"
      },
      {
        shaderLocation: 5,
        offset: (3 + 3 + 3 + 3 + 2) * 4,
        format: "float32x4"
      }
    ]
  }
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
  pipelineCache = new LRUCache(
    lruCacheOptions
  );
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
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    });
    if (this.headless) {
      if (this.headlessDimensions == 2) {
        this.startDispatch();
        this.texture = this.device.createTexture({
          size: {
            width: this.headlessWidth,
            height: this.headlessHeight
          },
          format: this.gpuTextureFormat,
          dimension: "2d",
          viewFormats: [this.gpuTextureFormat],
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
        });
        this.endDispatch();
      } else {
        this.startDispatch();
        this.texture = this.device.createTexture({
          size: {
            width: this.headlessWidth,
            height: this.headlessHeight,
            depthOrArrayLayers: this.headlessDepth
          },
          format: this.gpuTextureFormat,
          dimension: "3d",
          usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
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
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
      });
    }
    if (this.canvas) {
      this.startDispatch();
      this.depthTexture = this.device.createTexture({
        size: {
          width: this.canvas.width,
          height: this.canvas.height
        },
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
      });
      this.endDispatch();
    }
    this.ready = true;
  }
  startDispatch() {
    if (!this.device)
      return;
    if (this.catchGPUErrors) {
      this.device.pushErrorScope("validation");
      this.device.pushErrorScope("internal");
      this.device.pushErrorScope("out-of-memory");
    }
  }
  endDispatch() {
    if (!this.device)
      return;
    let handler = (e) => {
      if (!e)
        return;
      let ignore = e.message.includes("[Invalid ShaderModule] is invalid.") || e.message.includes("[Invalid BindGroup] is invalid.") || e.message.includes("[Invalid ComputePipeline") || e.message.includes("[Invalid RenderPipeline");
      if (ignore)
        return;
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
  trace(id, data) {
  }
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
    return GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;
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
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
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
        device.queue.writeBuffer(nativeBuffer, 0, new Uint8Array(buf.arrayBuffer));
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
    let stride = parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
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
      bytesPerRow += alignment - bytesPerRow % alignment;
      alignmentPad = bytesPerRow - oldBytes;
      neededAlignment = true;
    }
    let buffer = device.createBuffer({
      size: bytesPerRow * texture.height,
      usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
    });
    encoder.copyTextureToBuffer({ texture }, { buffer, bytesPerRow }, texture);
    let commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
    await buffer.mapAsync(GPUMapMode.READ);
    let arr;
    let buf = new Uint8Array(buffer.getMappedRange());
    if (neededAlignment) {
      let oldBytes = bytesPerRow - alignmentPad;
      let newData = new Uint8Array(oldBytes * texture.height);
      for (let i = 0; i < texture.height; i++) {
        newData.set(new Uint8Array(buf.buffer, i * bytesPerRow, oldBytes), i * oldBytes);
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
    let stride = parseInt(this.textureFormat[this.textureFormat.length - 1]) || 1;
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
      bytesPerRow += alignment - bytesPerRow % alignment;
      let newData = new Uint8Array(bytesPerRow * texture.height);
      for (let i = 0; i < texture.height; i++) {
        newData.set(new Uint8Array(data.buffer, i * oldBytes, oldBytes), i * bytesPerRow);
      }
      data = newData;
    }
    let buffer = device.createBuffer({
      size: data.byteLength,
      usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
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
      device: this.device
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
        height
      },
      format: "depth24plus",
      usage: GPUTextureUsage.RENDER_ATTACHMENT
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
        base = base.replace(`%${param}_size%`, instance.parent.arraySizes[param]);
      }
      if (instance.parent.params.webgpu.globals.length == 0 && instance.parent.params.webgpu.locals.length == 0) {
        base = base.replace(`/*SHADEUP_UNIFORM_STRUCT_START*/`, "");
      }
      if (instance) {
        for (let key2 of Object.keys(instance.bindings)) {
          let value = instance.bindings[key2];
          let isArrayTex = false;
          if (value instanceof ShadeupTexture2d || Array.isArray(value) && value.length > 0 && value[0] instanceof ShadeupTexture2d) {
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
                `var ${key2}_texture: texture_2d${isArrayTex ? "_array" : ""}<${value.innerType.startsWith("float") ? "f32" : value.innerType.startsWith("int") ? "i32" : "u32"}>`,
                `var ${key2}_texture: texture_depth_2d${isArrayTex ? "_array" : ""}`
              );
              let startIndexes = base.matchAll(new RegExp(`textureLoad\\(${key2}_texture, `, "g"));
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
                    base = base.substring(0, i + 1) + base.substring(i + 3, base.length);
                    break;
                  }
                }
              }
              startIndexes = base.matchAll(new RegExp(`textureSample\\(${key2}_texture, `, "g"));
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
        base = base.replace("/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/", ``.replace(/\t\n/g, ""));
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
        base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `_VertexShaderOutput`);
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
        base = base.replace(`/*__SHADEUP_TEMPLATE_OUTPUT*/`, `_VertexShaderOutput`);
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
          config?.attachments ? `_ShaderFragmentOutput` : `@location(0) vec4<f32>`
        );
        base = base.replace(
          `/*__SHADEUP_TEMPLATE_INPUT*/`,
          `
				_frag_in: _VertexShaderOutput
				`.replace(/\t\n/g, "")
        );
        let writeCustoms = instance.parent.params.webgpu.attributeInput.split("@location").length;
        let extra = "";
        if (writeCustoms >= 2) {
          for (let i = 0; i < writeCustoms - 1; i++) {
            extra += `_i_in.custom${i} = _frag_in.custom${i};
`;
          }
        }
        base = base.replace(
          "/*__SHADEUP_TEMPLATE_INSERT_MAIN_START__*/",
          `var _i_out: ${config?.attachments ? "_ShaderFragmentOutput" : "ShaderOutput"};
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
          `return ${config?.attachments ? "_i_out" : "_i_out.color"};`.replace(/\t\n/g, "")
        );
      }
      this.startDispatch();
      let shader = device.createShaderModule({
        code: base
      });
      this.endDispatch();
      if (!shader)
        throw new Error("Failed to create shader");
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
      code: code.webgpu
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
      if (!this.depthTexture)
        return;
      const textureView = this.getTexture().createView();
      if (this.gpuTextureFormat == "depth24plus" || this.gpuTextureFormat == "depth32float") {
        const clearPassDesc = {
          colorAttachments: [],
          depthStencilAttachment: {
            view: this.getTexture().createView(),
            depthClearValue: typeof color === "number" ? color : 1,
            depthLoadOp: "clear",
            depthStoreOp: "store"
          }
        };
        const passEncoder = encoder.beginRenderPass(clearPassDesc);
        passEncoder.end();
      } else {
        const clearPassDesc = {
          colorAttachments: [
            {
              view: textureView,
              clearValue: Array.isArray(color) ? { r: color[0], g: color[1], b: color[2], a: color[3] } : { r: 0, g: 0, b: 0, a: 0 },
              storeOp: "store",
              loadOp: "clear"
            }
          ],
          depthStencilAttachment: {
            view: this.depthTexture.createView(),
            depthClearValue: 1,
            depthLoadOp: "clear",
            depthStoreOp: "store"
          }
        };
        const passEncoder = encoder.beginRenderPass(clearPassDesc);
        passEncoder.end();
      }
    }, immediate);
  }
  fill(color, immediate = false) {
    this.enqueueCommand((encoder) => {
      this.getGPU();
      if (!this.depthTexture)
        return;
      const textureView = this.getTexture().createView({
        format: this.gpuTextureFormat
      });
      const clearPassDesc = {
        colorAttachments: [
          {
            view: textureView,
            clearValue: { r: color[0], g: color[1], b: color[2], a: color[3] },
            storeOp: "store",
            loadOp: "clear"
          }
        ],
        depthStencilAttachment: {
          view: this.depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: "clear",
          depthStoreOp: "store"
        }
      };
      const passEncoder = encoder.beginRenderPass(clearPassDesc);
      passEncoder.end();
    }, immediate);
  }
  unbindTexture(texture) {
  }
  getOrCreateMeshData(mesh) {
    const { device } = this.getGPU();
    if (mesh.symbol == null)
      mesh.symbol = Symbol();
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
      let vertexData = new Float32Array(vertexCount * (3 + 3 + 3 + 3 + 2 + 4));
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
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST
      });
      let indexBuffer = device.createBuffer({
        size: indexData.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST
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
      BUFFER: 1241253932
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
          let filterMode = texInner == "uint8" ? "filtering" : "non-filtering";
          if (s.access == "sample_write") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 2, KEY_TYPES.MARK);
          } else if (s.access == "write") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 1, gpuFormat, KEY_TYPES.MARK);
          } else if (s.access == "sample" || s.access == "read") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
          }
        } else if (s.type == "sampler2DArray") {
          if (!s.value?.textures[0])
            continue;
          let firstTexture = s.value?.textures[0];
          let gpuFormat = firstTexture.adapter.gpuTextureFormat;
          let texInner = firstTexture.innerType ?? "float4";
          let filterMode = texInner == "uint8" ? "filtering" : "non-filtering";
          if (s.access == "sample_write") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 2, KEY_TYPES.MARK);
          } else if (s.access == "write") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index + 1, gpuFormat, KEY_TYPES.MARK);
          } else if (s.access == "sample" || s.access == "read") {
            key.push(KEY_TYPES.BINDING, KEY_TYPES.TEXTURE, s.index, gpuFormat, KEY_TYPES.MARK);
            key.push(KEY_TYPES.BINDING, KEY_TYPES.SAMPLER, s.index + 1, filterMode, KEY_TYPES.MARK);
          }
          key.push("len", s.value.textures.length);
        } else if (s.type == "array") {
          key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 3623, KEY_TYPES.MARK);
        } else if (s.type == "atomic") {
          key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 124, KEY_TYPES.MARK);
        } else if (s.type == "buffer") {
          key.push(KEY_TYPES.BINDING, KEY_TYPES.BUFFER, s.index, 111, s.access, KEY_TYPES.MARK);
        }
      }
    return key;
  }
  bindGroupLayoutCounter = 0;
  buildUniformsForPipeline(shader, generatedUniforms, baseUniformBuffer, stage) {
    let key = this.buildUniformKey(generatedUniforms).join("|");
    const { device } = this.getGPU();
    let commands = [];
    if (generatedUniforms.special) {
      for (let s of generatedUniforms.special) {
        if (s.type == "sampler2D") {
          commands.push((encoder) => {
            if (s.value && "texture" in s.value) {
              if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
                if (s.value.texture.adapter.storageDirty) {
                  this.trace("copyWritableTextureToReadable", { texture: s.value.texture });
                  encoder.copyTextureToTexture(
                    { texture: s.value.texture.adapter.getStorageTexture() },
                    { texture: s.value.texture.adapter.getTexture() },
                    { width: s.value.texture.size[0], height: s.value.texture.size[1] }
                  );
                  s.value.texture.adapter.storageDirty = false;
                  s.value.texture.cpuReadDirty = true;
                }
              }
              s.value?.texture.flush(false);
            }
          });
          s.value?.texture?.innerType ?? "float4";
          if (s.access == "sample_write") ; else if (s.access == "write") {
            if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
              s.value.texture.adapter.pendingWrites++;
            }
            commands.push((encoder) => {
              if (s.value && "texture" in s.value) {
                if (s.value?.texture.adapter && s.value.texture.adapter instanceof WebGPUAdapter) {
                  this.trace("markWritableTextureDirty", { texture: s.value.texture });
                  s.value.texture.adapter.storageDirty = true;
                  s.value.texture.adapter.pendingWrites--;
                }
              }
            });
          } else if (s.access == "sample" || s.access == "read") ;
        } else if (s.type == "sampler2DArray") {
          let needsNewTexture = false;
          if (s.value && "textures" in s.value) {
            if (!s.value?.textures.$arrTexture) {
              needsNewTexture = true;
            } else {
              if (s.value.textures[0].adapter.getTexture().usage != s.value.textures.$arrTexture.usage) {
                needsNewTexture = true;
              }
              if (s.value.textures[0].adapter.getTexture().format != s.value.textures.$arrTexture.format) {
                needsNewTexture = true;
              }
              if (s.value.textures[0].adapter.getTexture().width != s.value.textures.$arrTexture.width) {
                needsNewTexture = true;
              }
              if (s.value.textures[0].adapter.getTexture().height != s.value.textures.$arrTexture.height) {
                needsNewTexture = true;
              }
              if (s.value.textures.length != s.value.textures.$arrTexture.depthOrArrayLayers) {
                needsNewTexture = true;
              }
            }
            if (needsNewTexture) {
              if (s.value.textures.$arrTexture) {
                let oldTex = s.value.textures.$arrTexture;
                this.enqueueCleanupCommand(() => {
                  this.trace("destroyMissizedArrayTexture", { texture: oldTex });
                  oldTex.destroy();
                });
              }
              s.value.textures.$arrTexture = device.createTexture({
                size: [
                  s.value.textures[0].size[0],
                  s.value.textures[0].size[1],
                  s.value.textures.length
                ],
                format: s.value.textures[0].adapter.gpuTextureFormat,
                usage: s.value.textures[0].adapter.getTexture().usage
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
                if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
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
                this.trace("copyToArrayTexture", { texture: s.value.textures.$arrTexture });
                for (let [i, texture] of s.value.textures.entries()) {
                  encoder.copyTextureToTexture(
                    {
                      texture: texture.adapter.getTexture()
                    },
                    {
                      texture: s.value.textures.$arrTexture,
                      origin: [0, 0, i]
                    },
                    {
                      width: texture.size[0],
                      height: texture.size[1],
                      depthOrArrayLayers: 1
                    }
                  );
                }
              }
            }
          });
          if (s.value && "textures" in s.value) {
            for (let texture of s.value.textures) {
              texture.innerType ?? "float4";
              if (s.access == "sample_write") ; else if (s.access == "write") {
                if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
                  texture.adapter.pendingWrites++;
                }
                commands.push((encoder) => {
                  if (texture.adapter && texture.adapter instanceof WebGPUAdapter) {
                    this.trace("markWritableTextureDirty", { texture });
                    texture.adapter.storageDirty = true;
                    texture.adapter.pendingWrites--;
                  }
                });
              } else if (s.access == "sample" || s.access == "read") ;
            }
          }
        } else if (s.type == "array") ; else if (s.type == "atomic") ; else if (s.type == "buffer") {
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
        }
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
              minBindingSize: 0
            }
          },
          ...generatedUniforms.size > 0 ? [
            {
              binding: 1,
              visibility: stage,
              buffer: {
                minBindingSize: 0
              }
            }
          ] : [],
          ...generatedUniforms.special.map((s) => {
            if (s.type == "sampler2D") {
              let sampleType = (t) => {
                let gpuFormat = (s.value?.texture.adapter).gpuTextureFormat;
                if (gpuFormat == "depth24plus" || gpuFormat == "depth32float") {
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
              let filterMode = texInner == "uint8" ? "filtering" : "non-filtering";
              let sampleTypeGPU = sampleType(s.value?.texture?.innerType ?? "float4");
              if (s.access == "sample_write") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleType(texInner),
                      viewDimension: "2d",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    sampler: {
                      type: filterMode
                    }
                  },
                  {
                    binding: s.index + 2,
                    visibility: stage,
                    storageTexture: {
                      format: (s.value?.texture.adapter).gpuTextureFormat,
                      access: "write-only",
                      viewDimension: "2d"
                    }
                  }
                ];
              } else if (s.access == "write") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleTypeGPU,
                      viewDimension: "2d",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    storageTexture: {
                      format: (s.value?.texture.adapter).gpuTextureFormat,
                      access: "write-only",
                      viewDimension: "2d"
                    }
                  }
                ];
              } else if (s.access == "sample" || s.access == "read") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleTypeGPU,
                      viewDimension: "2d",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    sampler: {
                      type: filterMode
                    }
                  }
                ];
              }
            } else if (s.type == "sampler2DArray") {
              if (!s.value?.textures[0])
                return [];
              let firstTexture = s.value?.textures[0];
              let sampleType = (t) => {
                let gpuFormat = firstTexture.adapter.gpuTextureFormat;
                if (gpuFormat == "depth24plus" || gpuFormat == "depth32float") {
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
              let filterMode = texInner == "uint8" ? "filtering" : "non-filtering";
              let sampleTypeGPU = sampleType(firstTexture.innerType ?? "float4");
              if (s.access == "sample_write") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleType(texInner),
                      viewDimension: "2d-array",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    sampler: {
                      type: filterMode
                    }
                  },
                  {
                    binding: s.index + 2,
                    visibility: stage,
                    storageTexture: {
                      format: firstTexture.adapter.gpuTextureFormat,
                      access: "write-only",
                      viewDimension: "2d-array"
                    }
                  }
                ];
              } else if (s.access == "write") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleTypeGPU,
                      viewDimension: "2d-array",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    storageTexture: {
                      format: firstTexture.adapter.gpuTextureFormat,
                      access: "write-only",
                      viewDimension: "2d-array"
                    }
                  }
                ];
              } else if (s.access == "sample" || s.access == "read") {
                return [
                  {
                    binding: s.index,
                    visibility: stage,
                    texture: {
                      sampleType: sampleTypeGPU,
                      viewDimension: "2d-array",
                      multisampled: false
                    }
                  },
                  {
                    binding: s.index + 1,
                    visibility: stage,
                    sampler: {
                      type: filterMode
                    }
                  }
                ];
              }
            } else if (s.type == "array") {
              return [
                {
                  binding: s.index,
                  visibility: stage,
                  buffer: { type: "read-only-storage" }
                }
              ];
            } else if (s.type == "atomic") {
              return [
                {
                  binding: s.index,
                  visibility: stage,
                  buffer: { type: "storage" }
                }
              ];
            } else if (s.type == "buffer") {
              return [
                {
                  binding: s.index,
                  visibility: stage,
                  buffer: { type: s.access == "read" ? "read-only-storage" : "storage" }
                }
              ];
            }
          }).flat()
        ]
      });
      bindGroupLayout.$__gpuKey = this.bindGroupLayoutCounter++;
      this.endDispatch();
    }
    let outUniformBuffer = cache?.uniformBuffer;
    let outSpecialBuffers = cache?.specialBuffers;
    if (cache) {
      if (cache.cachedUniforms) {
        let matches = generatedUniforms.data.byteLength == cache.cachedUniforms.byteLength;
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
        if (!special.value || !("texture" in special.value))
          continue;
        let tex = special.value.texture;
        if (tex.image) {
          let texture;
          if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
            let texCtx = tex.adapter.getTexture();
            texture = texCtx;
            if (!texture)
              continue;
            specialsKey.push(5623462, special.index, tex.symbol, tex.innerType, special.access);
          }
        } else {
          return;
        }
      } else if (special.type == "sampler2DArray") {
        if (!special.value || !("textures" in special.value))
          continue;
        let tex = special.value.textures[0];
        if (tex) {
          if (tex.image) {
            let texture;
            if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
              let texCtx = tex.adapter.getTexture();
              texture = texCtx;
              if (!texture)
                continue;
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
        specialsKey.push(1253462, special.index, special.access, special.value.symbol);
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
    if (!bindGroup || !outUniformBuffer || !outSpecialBuffers || !specialEntries) {
      let outEntries = [
        { binding: 0, resource: { buffer: baseUniformBuffer } }
      ];
      if (!outSpecialBuffers || !specialEntries) {
        outSpecialBuffers = [];
        specialEntries = [];
        for (let special of generatedUniforms.special) {
          if (special.type == "sampler2D") {
            if (!special.value || !("texture" in special.value))
              continue;
            let tex = special.value.texture;
            if (tex.image) {
              let texture;
              if (tex.adapter instanceof WebGPUAdapter && tex.adapter.texture) {
                let texCtx = tex.adapter.getTexture();
                texture = texCtx;
                if (!texture)
                  continue;
                let filterable = tex.innerType == "uint8";
                if (special.access == "sample_write") {
                  const sampler = device.createSampler(
                    filterable ? {
                      magFilter: "linear",
                      minFilter: "linear"
                    } : {}
                  );
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: sampler
                  });
                  specialEntries.push({
                    binding: special.index + 2,
                    resource: tex.adapter.getStorageTexture().createView()
                  });
                } else if (special.access == "write") {
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: tex.adapter.getStorageTexture().createView()
                  });
                } else if (special.access == "read" || special.access == "sample") {
                  const sampler = device.createSampler(
                    filterable ? {
                      magFilter: "linear",
                      minFilter: "linear"
                    } : {}
                  );
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: sampler
                  });
                }
              }
            } else {
              return;
            }
          } else if (special.type == "sampler2DArray") {
            if (!special.value || !("textures" in special.value))
              continue;
            if (special.value.textures.$arrTexture) {
              if (special.value.textures.$arrTexture instanceof GPUTexture) {
                let tex = special.value.textures[0];
                if (!tex)
                  return;
                let texture = special.value.textures.$arrTexture;
                let filterable = tex.innerType == "uint8";
                if (special.access == "sample_write") {
                  const sampler = device.createSampler(
                    filterable ? {
                      magFilter: "linear",
                      minFilter: "linear"
                    } : {}
                  );
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: sampler
                  });
                  specialEntries.push({
                    binding: special.index + 2,
                    resource: tex.adapter.getStorageTexture().createView()
                  });
                  throw new Error("Writing to texture arrays is not supported yet");
                } else if (special.access == "write") {
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: tex.adapter.getStorageTexture().createView()
                  });
                  throw new Error("Writing to texture arrays is not supported yet");
                } else if (special.access == "read" || special.access == "sample") {
                  const sampler = device.createSampler(
                    filterable ? {
                      magFilter: "linear",
                      minFilter: "linear"
                    } : {}
                  );
                  specialEntries.push({
                    binding: special.index,
                    resource: texture.createView({
                      format: tex.adapter.gpuTextureFormat,
                      arrayLayerCount: special.value.textures.length,
                      baseArrayLayer: 0,
                      dimension: "2d-array"
                    })
                  });
                  specialEntries.push({
                    binding: special.index + 1,
                    resource: sampler
                  });
                }
              }
            }
          } else if (special.type == "array" && special.value) {
            let buffer = device.createBuffer({
              size: special.value.size,
              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });
            outSpecialBuffers.push(buffer);
            specialEntries.push({
              binding: special.index,
              resource: { buffer }
            });
          } else if (special.type == "buffer" && special.value) {
            let buf = this.getOrCreateBuffer(special.value, this.genericBufferFlags());
            outSpecialBuffers.push(buf);
            specialEntries.push({
              binding: special.index,
              resource: { buffer: buf }
            });
          } else if (special.type == "atomic" && special.value) {
            let buf = device.createBuffer({
              size: 4,
              usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
            });
            outSpecialBuffers.push(buf);
            specialEntries.push({
              binding: special.index,
              resource: {
                buffer: buf
              }
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
          usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });
        needsUniformWrite = true;
      }
      if (generatedUniforms.size > 0) {
        outEntries.push({ binding: 1, resource: { buffer: outUniformBuffer } });
        if (needsUniformWrite)
          device.queue.writeBuffer(outUniformBuffer, 0, generatedUniforms.data);
      }
      for (let i = 0; i < specialEntries.length; i++) {
        outEntries.push(specialEntries[i]);
      }
      let bufCounter = 0;
      for (let i = 0; i < generatedUniforms.special.length; i++) {
        let special = generatedUniforms.special[i];
        if (special.type == "array" && special.value) {
          device.queue.writeBuffer(outSpecialBuffers[bufCounter++], 0, special.value.buffer);
        }
      }
      bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: outEntries
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
        specialEntries
      });
    }
    return {
      bindGroupLayout,
      bindGroup,
      uniformBuffer: outUniformBuffer,
      specialBuffers: outSpecialBuffers,
      commands
    };
  }
  writeStructuredBuffer(structure, raw, buffer, offset = 0) {
    let rootObj = {
      val: raw
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
          arr.push(this.readStructuredBuffer(structure.element, buffer, offset));
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
        return [uview[offset], uview[offset + 1], uview[offset + 2], uview[offset + 3]];
      } else if (structure.name == "int4") {
        return [iview[offset], iview[offset + 1], iview[offset + 2], iview[offset + 3]];
      } else if (structure.name == "float4") {
        return [fview[offset], fview[offset + 1], fview[offset + 2], fview[offset + 3]];
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
          [fview[offset + 2], fview[offset + 3]]
        ]);
      } else if (structure.name == "float3x3") {
        return window.applyMatrix3x3Methods([
          [fview[offset], fview[offset + 1], fview[offset + 2]],
          [fview[offset + 3], fview[offset + 4], fview[offset + 5]],
          [fview[offset + 6], fview[offset + 7], fview[offset + 8]]
        ]);
      } else if (structure.name == "float4x4") {
        return window.applyMatrix4x4Methods([
          [fview[offset], fview[offset + 1], fview[offset + 2], fview[offset + 3]],
          [fview[offset + 4], fview[offset + 5], fview[offset + 6], fview[offset + 7]],
          [fview[offset + 8], fview[offset + 9], fview[offset + 10], fview[offset + 11]],
          [fview[offset + 12], fview[offset + 13], fview[offset + 14], fview[offset + 15]]
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
        out[field[0]] = this.readStructuredBuffer(field[1], buffer, offset / 4);
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
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
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
      bindGroupLayouts: [compute.bindGroupLayout]
    });
    this.startDispatch();
    let pipeline = device.createComputePipeline({
      label: "compute pipeline",
      layout: pipelineLayout,
      compute: {
        module: shader.payload,
        entryPoint: "main"
      }
    });
    this.endDispatch();
    return {
      pipeline,
      bindGroup: compute.bindGroup,
      baseUniformBuffer,
      uniformBuffer: compute.uniformBuffer,
      specialBuffers: compute.specialBuffers,
      commands
    };
  }
  cachedPipelines = /* @__PURE__ */ new Map();
  cachedPipelineLayouts = /* @__PURE__ */ new Map();
  setupDrawPipeline(shaders, fragmentUniform, vertexUniform, options, ignoreVertexLayout = false) {
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
        bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout]
      });
      this.cachedPipelineLayouts.set(pipelineLayoutKey, pipelineLayout);
    }
    if (!this.depthTexture) {
      throw new Error("Depth texture not initialized");
    }
    let pipelineKey = pipelineLayoutKey + this.depthTexture.format + options.depthTest + options.depthFormat + options.depthOnly + options.backfaceCulling + options.depthCompare + options.attachments?.length;
    let pipeline;
    if (this.cachedPipelines.has(pipelineKey)) {
      pipeline = this.cachedPipelines.get(pipelineKey);
    } else {
      const generateTarget = (adap) => {
        return {
          format: adap.headless ? adap.gpuTextureFormat : "rgba8unorm",
          blend: FormatCapabilities[adap.gpuTextureFormat].blendable ? {
            alpha: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add"
            },
            color: {
              srcFactor: "src-alpha",
              dstFactor: "one-minus-src-alpha",
              operation: "add"
            }
          } : void 0
        };
      };
      const pipelineDescriptor = {
        vertex: {
          module: shaders.vertex.payload,
          entryPoint: "main",
          buffers: ignoreVertexLayout ? [] : vertexLayout
        },
        ...options.depthOnly ? {} : {
          fragment: {
            module: shaders.fragment.payload,
            entryPoint: "main",
            targets: options.attachments && options.attachments.length > 0 ? options.attachments.map((att) => generateTarget(att.adapter)) : [generateTarget(this)]
          }
        },
        primitive: {
          topology: "triangle-list",
          cullMode: options.backfaceCulling ? "back" : "none"
        },
        ...options.depthTest ? {
          depthStencil: {
            depthWriteEnabled: true,
            depthCompare: options.depthCompare ?? "less",
            format: options.depthFormat ?? "depth24plus"
          }
        } : {},
        layout: pipelineLayout
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
      commands
    };
    return drawData;
  }
  buildDrawPipeline(shaders, fragmentUniform, vertexUniform, options, ignoreVertexLayout = false) {
    const { device } = this.getGPU();
    let commands = [];
    this.baseUniformValues;
    const baseUniformBufferSize = this.baseUniformBufferSize;
    const baseUniformBuffer = device.createBuffer({
      size: baseUniformBufferSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
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
      bindGroupLayouts: [fragment.bindGroupLayout, vertex.bindGroupLayout]
    });
    if (!this.depthTexture) {
      throw new Error("Depth texture not initialized");
    }
    const generateTarget = (adap) => {
      return {
        format: adap.headless ? adap.gpuTextureFormat : "rgba8unorm",
        blend: FormatCapabilities[adap.gpuTextureFormat].blendable ? {
          alpha: {
            srcFactor: "src-alpha",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          },
          color: {
            srcFactor: "src-alpha",
            dstFactor: "one-minus-src-alpha",
            operation: "add"
          }
        } : void 0
      };
    };
    const pipelineDescriptor = {
      vertex: {
        module: shaders.vertex.payload,
        entryPoint: "main",
        buffers: ignoreVertexLayout ? [] : vertexLayout
      },
      ...options.depthOnly ? {} : {
        fragment: {
          module: shaders.fragment.payload,
          entryPoint: "main",
          targets: options.attachments && options.attachments.length > 0 ? options.attachments.map((att) => generateTarget(att.adapter)) : [generateTarget(this)]
        }
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back"
      },
      ...options.depthTest ? {
        depthStencil: {
          depthWriteEnabled: true,
          depthCompare: "less",
          format: options.depthFormat ?? "depth24plus"
        }
      } : {},
      layout: pipelineLayout
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
      commands
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
          height: this.headlessHeight
        },
        format: this.gpuTextureFormat,
        dimension: "2d",
        viewFormats: [this.gpuTextureFormat],
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
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
    const computeUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.computeShader);
    let output = this.buildComputePipeline(dispatch.computeShader, computeUniform);
    this.enqueueCommand((encoder) => {
      if (output)
        for (let command of output.commands) {
          command(encoder);
        }
      const pass = encoder.beginComputePass({ label: "compute builtin pass" });
      let baseUniformValues = this.baseUniformValues;
      this.baseUniformBufferSize;
      baseUniformValues.set([0, 0], 0);
      let computeData;
      {
        if (!output)
          return;
        computeData = output;
      }
      let { pipeline, bindGroup, baseUniformBuffer, uniformBuffer, specialBuffers } = computeData;
      device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
      device.queue.writeBuffer(uniformBuffer, 0, computeUniform.data);
      let bufCounter = 0;
      for (let i = 0; i < computeUniform.special.length; i++) {
        let special = computeUniform.special[i];
        if (special.type == "array" && special.value) {
          this.trace("writeArray", { special });
          device.queue.writeBuffer(specialBuffers[bufCounter++], 0, special.value.buffer);
        }
      }
      pass.setPipeline(pipeline);
      pass.setBindGroup(0, bindGroup);
      if (dispatch.indirectBuffer) {
        pass.dispatchWorkgroupsIndirect(
          this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
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
        if (!this.depthTexture)
          return;
        const textureView = this.getTexture().createView();
        if (this.gpuTextureFormat == "depth24plus" || this.gpuTextureFormat == "depth32float") {
          const clearPassDesc = {
            colorAttachments: [],
            depthStencilAttachment: {
              view: textureView,
              depthClearValue: 1,
              depthLoadOp: "clear",
              depthStoreOp: "store"
            }
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
                loadOp: "clear"
              }
            ],
            depthStencilAttachment: {
              view: this.depthTexture.createView(),
              depthClearValue: 1,
              depthLoadOp: "clear",
              depthStoreOp: "store"
            }
          };
          const passEncoder = encoder.beginRenderPass(clearPassDesc);
          passEncoder.end();
        }
        this.clearEnqueued = false;
      });
      this.clearEnqueued = true;
    }
  }
  dispatchDraw(dispatch, options = {
    depthTest: true
  }) {
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
    const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
    const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
    `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
    let depthTex = dispatch.overrideDepth ? dispatch.overrideDepth.adapter.getTexture() : this.depthTexture;
    let output = this.setupDrawPipeline(
      {
        fragment,
        vertex
      },
      fragmentUniform,
      vertexUniform,
      {
        ...options,
        depthFormat: depthTex.format,
        depthOnly: dispatch.depthOnly,
        attachments: dispatch.attachments ?? [],
        depthCompare: dispatch.depthCompare == "auto" ? "less" : dispatch.depthCompare,
        backfaceCulling: dispatch.backfaceCulling
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
            loadOp: "load"
          });
        } else {
          for (let attachment of dispatch.attachments) {
            if (attachment.adapter instanceof WebGPUAdapter) {
              let view = attachment.adapter.getTexture().createView();
              attachments.push({
                view,
                storeOp: "store",
                loadOp: "load"
              });
            }
          }
        }
      }
      let passDescriptor = {
        colorAttachments: attachments,
        ...options.depthTest ? {
          depthStencilAttachment: {
            view: depthTex.createView(),
            depthClearValue: 1,
            depthLoadOp: "load",
            depthStoreOp: "store"
          }
        } : {}
      };
      const pass = encoder.beginRenderPass(passDescriptor);
      let myTex = this.getTexture();
      let baseUniformValues = this.baseUniformValues;
      this.baseUniformBufferSize;
      baseUniformValues.set([myTex.width, myTex.height], 0);
      let drawData;
      if (!output)
        return;
      drawData = output;
      let {
        pipeline,
        bindGroupFragment,
        bindGroupVertex,
        baseUniformBuffer,
        vertexUniformBuffer,
        fragmentUniformBuffer,
        specialBuffersFragment,
        specialBuffersVertex
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
              this.getOrCreateBuffer(dispatch.indexBuffer, GPUBufferUsage.INDEX),
              "uint32"
            );
          }
          if (dispatch.indirectBuffer.elementCount % 5 != 0) {
            throw new Error(
              "Indirect buffer needs to be a multiple of 5 (must be at least 5 elements for indexedIndirect)"
            );
          }
          pass.drawIndexedIndirect(
            this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
            dispatch.indirectOffset
          );
        } else {
          if (dispatch.indirectBuffer.elementCount % 4 != 0) {
            throw new Error(
              "Indirect buffer needs to be a multiple of 4 (must be at least 4 elements for indirect)"
            );
          }
          pass.drawIndirect(
            this.getOrCreateBuffer(dispatch.indirectBuffer, GPUBufferUsage.INDIRECT),
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
      return () => {
      };
    });
  }
  dispatchDrawIndexed(dispatch, options = {
    depthTest: true
  }) {
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
    const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
    const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
    `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
    let output = this.buildDrawPipeline(
      {
        fragment,
        vertex
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
            loadOp: "load"
          }
        ],
        depthStencilAttachment: {
          view: this.depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: "load",
          depthStoreOp: "store"
        }
      };
      const pass = encoder.beginRenderPass(passDescriptor);
      let baseUniformValues = this.baseUniformValues;
      this.baseUniformBufferSize;
      let myTex = this.getTexture();
      baseUniformValues.set([myTex.width, myTex.height], 0);
      let drawData;
      {
        if (!output)
          return;
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
        specialBuffersVertex
      } = drawData;
      pass.setPipeline(pipeline);
      device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
      device.queue.writeBuffer(fragmentUniformBuffer, 0, fragmentUniform.data);
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
          device.queue.writeBuffer(specialBuffersVertex[bufCounterVert++], 0, special.value.buffer);
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
  dispatchDrawCount(dispatch, options = {
    depthTest: true
  }) {
    const { device } = this.getGPU();
    if (!dispatch.vertexShader || !dispatch.fragmentShader) {
      throw new Error("Dispatch is missing vertex or fragment shader");
    }
    this.startDispatch();
    let fragment = dispatch.fragmentShader;
    let vertex = dispatch.vertexShader;
    `${dispatch.fragmentShader.uniqueSourceKey}|${dispatch.vertexShader.uniqueSourceKey}|${options.depthTest}`;
    const fragmentUniform = generateUniforms(dispatch.fragmentUniforms, dispatch.fragmentShader);
    const vertexUniform = generateUniforms(dispatch.vertexUniforms, dispatch.vertexShader);
    let output = this.buildDrawPipeline(
      {
        fragment,
        vertex
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
            loadOp: "load"
          }
        ],
        depthStencilAttachment: {
          view: this.depthTexture.createView(),
          depthClearValue: 1,
          depthLoadOp: "load",
          depthStoreOp: "store"
        }
      };
      const pass = encoder.beginRenderPass(passDescriptor);
      let baseUniformValues = this.baseUniformValues;
      this.baseUniformBufferSize;
      let myTex = this.getTexture();
      baseUniformValues.set([myTex.width, myTex.height], 0);
      let drawData;
      {
        if (!output)
          return;
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
        specialBuffersVertex
      } = drawData;
      pass.setPipeline(pipeline);
      device.queue.writeBuffer(baseUniformBuffer, 0, baseUniformValues);
      device.queue.writeBuffer(fragmentUniformBuffer, 0, fragmentUniform.data);
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
          device.queue.writeBuffer(specialBuffersVertex[bufCounterVert++], 0, special.value.buffer);
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
          texture: { sampleType: "unfilterable-float" }
        },
        {
          binding: 1,
          visibility: GPUShaderStage.FRAGMENT,
          sampler: { type: "non-filtering" }
        }
      ]
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
        software: () => {
        }
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
        software: () => {
        }
      },
      "fragment"
    );
    const pipelineLayout = device.createPipelineLayout({
      bindGroupLayouts: [bindGroupLayout]
    });
    const pipelineDescriptor = {
      vertex: {
        module: vertexShader.payload,
        entryPoint: "main",
        buffers: vertexLayout
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
                operation: "add"
              },
              color: {
                srcFactor: "one",
                dstFactor: "one-minus-src-alpha",
                operation: "add"
              }
            }
          }
        ]
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back"
      },
      layout: pipelineLayout
    };
    const pipeline = device.createRenderPipeline(pipelineDescriptor);
    let geo = {
      vertices: [
        [0, 0, 0],
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
      ],
      uvs: [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0]
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
      symbol: Symbol()
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
            loadOp: "load"
          }
        ]
      });
      const sampler = device.createSampler({});
      passEncoder.setPipeline(pipeline);
      const bindGroup = device.createBindGroup({
        layout: bindGroupLayout,
        entries: [
          {
            binding: 0,
            resource: texture2.createView()
          },
          {
            binding: 1,
            resource: sampler
          }
        ]
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
    if (!ctx)
      throw new Error("Could not get webgpu context");
    ctx.configure({
      device,
      format: "rgba8unorm",
      alphaMode: "premultiplied",
      usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
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
    if (this.headless && this.texture && (this.textureFormat.endsWith("4") || this.textureFormat == "uint8")) {
      if (!this.ctx) {
        this.ctx = this.canvas.getContext("webgpu");
        if (!this.ctx)
          throw new Error("Could not get webgpu context");
        this.ctx.configure({
          device,
          format: "rgba8unorm",
          alphaMode: "premultiplied",
          usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_SRC | GPUTextureUsage.COPY_DST
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
  dispatch(dispatch, options = {
    depthTest: true
  }) {
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
      usage: flags
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
  int4: [16, 0]
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
        throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
      }
      totalSize += s[0] + s[1];
    }
  } else if (val.type == "array") {
    let elementSize = getValueSize(val.element);
    if (typeof val.staticSize !== "undefined") {
      totalSize += val.staticSize * elementSize;
    } else {
      throw new Error(`Cannot calculate size of struct with unknown size type ${val.element}`);
    }
  }
  return totalSize;
}
function generateArrayBuffer(rootVt, rawData, data, offset) {
  if (rootVt.type != "array") {
    throw new Error(`Cannot generate array buffer for non-array type ${rootVt.type}`);
  }
  let totalSize = 0;
  let vsize = getValueSize(rootVt.element);
  totalSize += vsize * rawData.value.len();
  if (totalSize == 0) {
    totalSize = 4 * 4;
  }
  if (!data)
    data = new ArrayBuffer(totalSize);
  let floatView = new Float32Array(data);
  let uintView = new Uint32Array(data);
  let intView = new Int32Array(data);
  if (!offset)
    offset = 0;
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
        throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
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
    buffer: data
  };
}
function generateUniforms(fragmentUniforms, fragmentShader) {
  if (fragmentShader.parent == null) {
    return {
      size: 0,
      special: [],
      data: new ArrayBuffer(0)
    };
  }
  let orderedUniforms = [
    ...fragmentShader.parent.params.webgpu.locals.map((l) => {
      return ["_ext_uniform_local_" + l[0], l[1]];
    }),
    ...fragmentShader.parent.params.webgpu.globals.map((g) => {
      return ["_ext_uniform_global_" + g[0], g[1].structure];
    })
  ];
  let special = [];
  let specialCounter = 2;
  let totalSize = 0;
  let lastFieldPadding = 0;
  for (let uniform of orderedUniforms) {
    let vt = uniform[1];
    if (vt.type == "primitive" && (vt.name == "texture2d" || vt.name == "rwtexture2d")) {
      let texPayload = fragmentUniforms.uniforms.get(uniform[0]);
      special.push({
        index: specialCounter,
        type: "sampler2D",
        valueType: vt,
        value: {
          texture: texPayload.value
        },
        access: vt.access
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
            textures: texPayload.value
          },
          access: vt.element.access
        });
        specialCounter += 2;
        lastFieldPadding = 8;
        totalSize += 8 + lastFieldPadding;
      } else {
        special.push({
          index: specialCounter,
          type: "array",
          valueType: vt,
          value: generateArrayBuffer(vt, fragmentUniforms.uniforms.get(uniform[0]))
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
        value: fragmentUniforms.uniforms.get(uniform[0])?.value
      });
      specialCounter++;
      lastFieldPadding = 12;
      totalSize += 4 + lastFieldPadding;
    } else if (vt.type == "primitive" && vt.name == "atomic") {
      special.push({
        type: "atomic",
        valueType: vt,
        index: specialCounter,
        value: fragmentUniforms.uniforms.get(uniform[0])?.value
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
    data
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
        throw new Error(`Cannot calculate size of struct with unknown size type ${n}`);
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
      [1, 0, 0]
    ],
    uvs: [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 0]
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
    symbol: Symbol()
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
  constructor() {
  }
  /** @shadeup=glsl(!texture($self$, $0$)) */
  __index(index) {
    return [0, 0, 0, 0];
  }
  __index_assign(index, value) {
  }
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
    if (!this.adapter)
      return;
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
    if (!this.cpuData)
      return [0, 0, 0, 0];
    return this.getFast(index);
  }
  getFast;
  setFast;
  init() {
    this.dataIndexStride = parseInt(this.innerType[this.innerType.length - 1]) || 1;
    if (this.innerType == "uint8") {
      this.dataIndexStride = 4;
    }
    let width = this.size[0];
    if (this.innerType == "uint8") {
      this.getFast = (index) => {
        let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
        return [
          this.cpuData[i] / 255,
          this.cpuData[i + 1] / 255,
          this.cpuData[i + 2] / 255,
          this.cpuData[i + 3] / 255
        ];
      };
    } else {
      if (this.dataIndexStride == 4) {
        this.getFast = (index) => {
          let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          return [
            this.cpuData[i],
            this.cpuData[i + 1],
            this.cpuData[i + 2],
            this.cpuData[i + 3]
          ];
        };
      } else if (this.dataIndexStride == 3) {
        this.getFast = (index) => {
          let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          return [this.cpuData[i], this.cpuData[i + 1], this.cpuData[i + 2]];
        };
      } else if (this.dataIndexStride == 2) {
        this.getFast = (index) => {
          let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          return [this.cpuData[i], this.cpuData[i + 1]];
        };
      } else if (this.dataIndexStride == 1) {
        this.getFast = (index) => {
          let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          return this.cpuData[i];
        };
      }
    }
    if (this.dataIndexStride == 1) {
      this.setFast = (index, val) => {
        let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
        this.cpuWriteDirty = true;
        this.cpuData[i] = val;
      };
    } else {
      if (this.innerType == "uint8") {
        this.setFast = (index, value) => {
          let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
          this.cpuWriteDirty = true;
          this.cpuData[i] = value[2] * 255;
          this.cpuData[i + 1] = value[1] * 255;
          this.cpuData[i + 2] = value[0] * 255;
          this.cpuData[i + 3] = value[3] * 255;
        };
      } else {
        if (this.dataIndexStride == 4) {
          this.setFast = (index, value) => {
            let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            this.cpuWriteDirty = true;
            this.cpuData[i] = value[0];
            this.cpuData[i + 1] = value[1];
            this.cpuData[i + 2] = value[2];
            this.cpuData[i + 3] = value[3];
          };
        } else if (this.dataIndexStride == 3) {
          this.setFast = (index, value) => {
            let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            this.cpuWriteDirty = true;
            this.cpuData[i] = value[0];
            this.cpuData[i + 1] = value[1];
            this.cpuData[i + 2] = value[2];
          };
        } else if (this.dataIndexStride == 2) {
          this.setFast = (index, value) => {
            let i = ((index[1] | 0) * width + (index[0] | 0)) * this.dataIndexStride;
            this.cpuWriteDirty = true;
            this.cpuData[i] = value[0];
            this.cpuData[i + 1] = value[1];
          };
        }
      }
    }
  }
  __index_assign(index, value) {
    if (!this.cpuData)
      this.fillCpuData();
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
    if (!this.adapter)
      return;
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
      attachments: config.attachments ? config.attachments.map((a) => a.innerType) : void 0
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
      depthTest: config.depthTest ?? true
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
    if (!this.adapter)
      return;
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
          software: () => {
          }
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
          name: "float2"
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
      depthTest: false
    });
  }
  _draw_geometry(geometry, vertexShaderInst, pixelShaderInst) {
    this.dirty = true;
    this.cpuReadDirty = true;
    this.cpuFlush();
    this.version++;
    if (!this.adapter)
      return;
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "geometry";
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
    if (!this.adapter)
      return;
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "indexed";
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
    if (!this.adapter)
      return;
    this.adapter.clear(false, color);
  }
  drawCount(count, vertexShaderInst, pixelShaderInst) {
    this.dirty = true;
    this.cpuReadDirty = true;
    this.cpuFlush();
    this.version++;
    if (!this.adapter)
      return;
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "count";
    drawCall.drawCount = count;
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
          name: "float2"
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
  "depth-32-uint4": "depth32float"
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
  max: 16
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
    compute: -1
  };
  programCache = /* @__PURE__ */ new Map();
  init() {
    this.index = webglCounter++;
    console.log("Creating gl with index", this.index);
    this.gl = this.canvas.getContext("webgl2", {
      preserveDrawingBuffer: true
    });
    if (!this.gl) {
      throw new Error("WebGL is not supported");
    }
    this.GL_SHADER_TYPES = {
      vertex: this.gl.VERTEX_SHADER,
      fragment: this.gl.FRAGMENT_SHADER,
      "vertex-indexed": this.gl.VERTEX_SHADER,
      compute: -1
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
    if (!program)
      throw new Error("Could not create program");
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
    if (!program)
      throw new Error("Could not create program");
    let positionLocation = gl.getAttribLocation(program, "a_position");
    let texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
    gl.getUniformLocation(program, "u_matrix");
    let textureLocation = gl.getUniformLocation(program, "u_texture");
    let positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    let positions = [-1, -1, -1, 1, 1, -1, 1, -1];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    let texcoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    let texcoords = [0, 0, 0, 1, 1, 0, 1, 0];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);
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
          if (instance.bindings[param].length > instance.parent.arraySizes[param]) {
            instance.parent.arraySizes[param] = instance.bindings[param].length;
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
        base = base.replace(`%${param}_size%`, instance.parent.arraySizes[param]);
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
        base = base.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
        base = base.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
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
        base = base.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
        base = base.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
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
					_i_in.screen = vec2(gl_FragCoord.x, _vtex_canvas.y - gl_FragCoord.y);`.replace(/\t\n/g, "")
        );
        base = base.replace(
          "/*__SHADEUP_TEMPLATE_INSERT_MAIN_END__*/",
          "_i_gl_out_pixel = _i_out.color;"
        );
        base = base.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
        base = base.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
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
        window.bubbleError("Shader compile error " + gl.getShaderInfoLog(shader));
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
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  }
  getProgramVertexPixel(vertexShaderKey, vertexShader, pixelShaderKey, pixelShader) {
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
      if (!program)
        throw new Error("Program is null");
      if (uniformCache.has(path)) {
        return uniformCache.get(path) ?? null;
      }
      let loc = gl.getUniformLocation(program, path);
      if (!loc) ; else {
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
          version: texture.version
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
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, useImage);
      } else {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture);
      }
      boundTextures.set(unit, texture);
      if (texture instanceof ShadeupTexture2d) {
        texture.isBound = true;
        texture.payload.unit = unit;
        boundTexturesCache.set(texture.payload.unit, [texture.payload.unit, texture]);
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
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, useImage);
          texture.payload.version = texture.version;
        }
        boundTexturesCache.set(texture.payload.unit, [
          texture.payload.unit,
          texture.payload.texture
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
      if (expandedType.name == "texture2d" || expandedType.name == "rwtexture2d") {
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
          if (val.length == 4) ; else if (val.length == 9) ; else if (val.length == 16) ;
          gl[methodName](loc, false, val);
        } else {
          gl[methodName](loc, val);
        }
      }
    } else if (expandedType.type == "buffer") ; else if (expandedType.type == "struct") {
      for (let field of Object.keys(expandedType.fields)) {
        if (!val) {
          throw new Error(
            `Found null value for ${path}.${field} while passing to shader (nulls are not allowed)`
          );
        }
        setUniform(program, `${path}.${field}`, val[field], expandedType.fields[field], shaderKind);
      }
    }
  }
  dispatchDraw(dispatch, options = {
    depthTest: true
  }) {
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
      if (!val)
        continue;
      k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
      k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
      this.setUniform(program, k, val.value, val.valueType, "vertex");
    }
    for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
      let val = dispatch.fragmentUniforms.uniforms.get(k);
      if (!val)
        continue;
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
          for (let j = 0; j < size; j++)
            arr.push(0);
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
        new Float32Array(generateEmptyData(geometry.getNormals().flat(), 3, tris.length)),
        gl.STATIC_DRAW
      );
      tangentBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, tangentBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(generateEmptyData(geometry.getTangents().flat(), 3, tris.length)),
        gl.STATIC_DRAW
      );
      bitangentBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, bitangentBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(generateEmptyData(geometry.getBitangents().flat(), 3, tris.length)),
        gl.STATIC_DRAW
      );
      uvBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(generateEmptyData(geometry.getUVs().flat(), 2, tris.length)),
        gl.STATIC_DRAW
      );
      colorBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(generateEmptyData(geometry.getColors().flat(), 4, tris.length)),
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
        indexBuffer
      };
    }
    let positionAttr = gl.getAttribLocation(program, "a_position");
    let normalAttr = gl.getAttribLocation(program, "a_normal");
    let tangentAttr = gl.getAttribLocation(program, "a_tangent");
    let bitangentAttr = gl.getAttribLocation(program, "a_bitangent");
    let uvAttr = gl.getAttribLocation(program, "a_uv");
    let colorAttr = gl.getAttribLocation(program, "a_color");
    gl.enable(gl.BLEND);
    if (options.depthTest)
      gl.enable(gl.DEPTH_TEST);
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
    gl.drawElements(gl.TRIANGLES, geometry.getTriangles().length, gl.UNSIGNED_SHORT, 0);
    gl.deleteVertexArray(vao);
  }
  dispatchDrawIndexed(dispatch, options = {
    depthTest: true
  }) {
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
      if (!val)
        continue;
      k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
      k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
      this.setUniform(program, k, val.value, val.valueType, "vertex");
    }
    for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
      let val = dispatch.fragmentUniforms.uniforms.get(k);
      if (!val)
        continue;
      k = k.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
      k = k.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
      this.setUniform(program, k, val.value, val.valueType, "pixel");
    }
    const indexBuffer = dispatch.indexBuffer;
    if (!indexBuffer) {
      return;
    }
    gl.enable(gl.BLEND);
    if (options.depthTest)
      gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.drawArrays(gl.TRIANGLES, 0, indexBuffer.len());
  }
  dispatchDrawCount(dispatch, options = {
    depthTest: true
  }) {
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
      if (!val)
        continue;
      k = k.replaceAll("_ext_uniform_global_", "_vertex_ext_uniform_global_");
      k = k.replaceAll("_ext_uniform_local_", "_vertex_ext_uniform_local_");
      this.setUniform(program, k, val.value, val.valueType, "vertex");
    }
    for (let k of dispatch.fragmentUniforms.uniforms.keys()) {
      let val = dispatch.fragmentUniforms.uniforms.get(k);
      if (!val)
        continue;
      k = k.replaceAll("_ext_uniform_global_", "_pixel_ext_uniform_global_");
      k = k.replaceAll("_ext_uniform_local_", "_pixel_ext_uniform_local_");
      this.setUniform(program, k, val.value, val.valueType, "pixel");
    }
    gl.enable(gl.BLEND);
    if (options.depthTest)
      gl.enable(gl.DEPTH_TEST);
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
    if (buf.structured) ; else {
      gl.bufferData(
        binding,
        buf.uintArray ?? buf.floatArray ?? buf.intArray ?? new Uint8Array(0),
        gl.STATIC_DRAW
      );
    }
    buf.platformPayload = buffer;
    return buffer;
  }
  dispatch(dispatch, options = {
    depthTest: true
  }) {
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
    code: "Backspace"
  },
  {
    name: "tab",
    which: "9",
    key: "Tab",
    code: "Tab"
  },
  {
    name: "enter",
    which: "13",
    key: "Enter",
    code: "Enter"
  },
  {
    name: "shift(left)",
    which: "16",
    key: "Shift",
    code: "ShiftLeft"
  },
  {
    name: "shift(right)",
    which: "16",
    key: "Shift",
    code: "ShiftRight"
  },
  {
    name: "ctrl(left)",
    which: "17",
    key: "Control",
    code: "ControlLeft"
  },
  {
    name: "ctrl(right)",
    which: "17",
    key: "Control",
    code: "ControlRight"
  },
  {
    name: "alt(left)",
    which: "18",
    key: "Alt",
    code: "AltLeft"
  },
  {
    name: "alt(right)",
    which: "18",
    key: "Alt",
    code: "AltRight"
  },
  {
    name: "pause/break",
    which: "19",
    key: "Pause",
    code: "Pause"
  },
  {
    name: "caps lock",
    which: "20",
    key: "CapsLock",
    code: "CapsLock"
  },
  {
    name: "escape",
    which: "27",
    key: "Escape",
    code: "Escape"
  },
  {
    name: "space",
    which: "32",
    key: "",
    code: "Space"
  },
  {
    name: "page up",
    which: "33",
    key: "PageUp",
    code: "PageUp"
  },
  {
    name: "page down",
    which: "34",
    key: "PageDown",
    code: "PageDown"
  },
  {
    name: "end",
    which: "35",
    key: "End",
    code: "End"
  },
  {
    name: "home",
    which: "36",
    key: "Home",
    code: "Home"
  },
  {
    name: "left arrow",
    which: "37",
    key: "ArrowLeft",
    code: "ArrowLeft"
  },
  {
    name: "up arrow",
    which: "38",
    key: "ArrowUp",
    code: "ArrowUp"
  },
  {
    name: "right arrow",
    which: "39",
    key: "ArrowRight",
    code: "ArrowRight"
  },
  {
    name: "down arrow",
    which: "40",
    key: "ArrowDown",
    code: "ArrowDown"
  },
  {
    name: "print screen",
    which: "44",
    key: "PrintScreen",
    code: "PrintScreen"
  },
  {
    name: "insert",
    which: "45",
    key: "Insert",
    code: "Insert"
  },
  {
    name: "delete",
    which: "46",
    key: "Delete",
    code: "Delete"
  },
  {
    name: "0",
    which: "48",
    key: "0",
    code: "Digit0"
  },
  {
    name: "1",
    which: "49",
    key: "1",
    code: "Digit1"
  },
  {
    name: "2",
    which: "50",
    key: "2",
    code: "Digit2"
  },
  {
    name: "3",
    which: "51",
    key: "3",
    code: "Digit3"
  },
  {
    name: "#",
    which: "51",
    key: "#",
    code: "Digit3"
  },
  {
    name: "4",
    which: "52",
    key: "4",
    code: "Digit4"
  },
  {
    name: "5",
    which: "53",
    key: "5",
    code: "Digit5"
  },
  {
    name: "6",
    which: "54",
    key: "6",
    code: "Digit6"
  },
  {
    name: "7",
    which: "55",
    key: "7",
    code: "Digit7"
  },
  {
    name: "8",
    which: "56",
    key: "8",
    code: "Digit8"
  },
  {
    name: "9",
    which: "57",
    key: "9",
    code: "Digit9"
  },
  {
    name: "a",
    which: "65",
    key: "a",
    code: "KeyA"
  },
  {
    name: "b",
    which: "66",
    key: "b",
    code: "KeyB"
  },
  {
    name: "c",
    which: "67",
    key: "c",
    code: "KeyC"
  },
  {
    name: "d",
    which: "68",
    key: "d",
    code: "KeyD"
  },
  {
    name: "e",
    which: "69",
    key: "e",
    code: "KeyE"
  },
  {
    name: "f",
    which: "70",
    key: "f",
    code: "KeyF"
  },
  {
    name: "g",
    which: "71",
    key: "g",
    code: "KeyG"
  },
  {
    name: "h",
    which: "72",
    key: "h",
    code: "KeyH"
  },
  {
    name: "i",
    which: "73",
    key: "i",
    code: "KeyI"
  },
  {
    name: "j",
    which: "74",
    key: "j",
    code: "KeyJ"
  },
  {
    name: "k",
    which: "75",
    key: "k",
    code: "KeyK"
  },
  {
    name: "l",
    which: "76",
    key: "l",
    code: "KeyL"
  },
  {
    name: "m",
    which: "77",
    key: "m",
    code: "KeyM"
  },
  {
    name: "n",
    which: "78",
    key: "n",
    code: "KeyN"
  },
  {
    name: "o",
    which: "79",
    key: "o",
    code: "KeyO"
  },
  {
    name: "p",
    which: "80",
    key: "p",
    code: "KeyP"
  },
  {
    name: "q",
    which: "81",
    key: "q",
    code: "KeyQ"
  },
  {
    name: "r",
    which: "82",
    key: "r",
    code: "KeyR"
  },
  {
    name: "s",
    which: "83",
    key: "s",
    code: "KeyS"
  },
  {
    name: "t",
    which: "84",
    key: "t",
    code: "KeyT"
  },
  {
    name: "u",
    which: "85",
    key: "u",
    code: "KeyU"
  },
  {
    name: "v",
    which: "86",
    key: "v",
    code: "KeyV"
  },
  {
    name: "w",
    which: "87",
    key: "w",
    code: "KeyW"
  },
  {
    name: "x",
    which: "88",
    key: "x",
    code: "KeyX"
  },
  {
    name: "y",
    which: "89",
    key: "y",
    code: "KeyY"
  },
  {
    name: "z",
    which: "90",
    key: "z",
    code: "KeyZ"
  },
  {
    name: "left window key",
    which: "91",
    key: "Meta",
    code: "MetaLeft"
  },
  {
    name: "right window key",
    which: "92",
    key: "Meta",
    code: "MetaRight"
  },
  {
    name: "select key (Context Menu)",
    which: "93",
    key: "ContextMenu",
    code: "ContextMenu"
  },
  {
    name: "numpad 0",
    which: "96",
    key: "0",
    code: "Numpad0"
  },
  {
    name: "numpad 1",
    which: "97",
    key: "1",
    code: "Numpad1"
  },
  {
    name: "numpad 2",
    which: "98",
    key: "2",
    code: "Numpad2"
  },
  {
    name: "numpad 3",
    which: "99",
    key: "3",
    code: "Numpad3"
  },
  {
    name: "numpad 4",
    which: "100",
    key: "4",
    code: "Numpad4"
  },
  {
    name: "numpad 5",
    which: "101",
    key: "5",
    code: "Numpad5"
  },
  {
    name: "numpad 6",
    which: "102",
    key: "6",
    code: "Numpad6"
  },
  {
    name: "numpad 7",
    which: "103",
    key: "7",
    code: "Numpad7"
  },
  {
    name: "numpad 8",
    which: "104",
    key: "8",
    code: "Numpad8"
  },
  {
    name: "numpad 9",
    which: "105",
    key: "9",
    code: "Numpad9"
  },
  {
    name: "multiply",
    which: "106",
    key: "*",
    code: "NumpadMultiply"
  },
  {
    name: "add",
    which: "107",
    key: "+",
    code: "NumpadAdd"
  },
  {
    name: "subtract",
    which: "109",
    key: "-",
    code: "NumpadSubtract"
  },
  {
    name: "decimal point",
    which: "110",
    key: ".",
    code: "NumpadDecimal"
  },
  {
    name: "divide",
    which: "111",
    key: "/",
    code: "NumpadDivide"
  },
  {
    name: "f1",
    which: "112",
    key: "F1",
    code: "F1"
  },
  {
    name: "f2",
    which: "113",
    key: "F2",
    code: "F2"
  },
  {
    name: "f3",
    which: "114",
    key: "F3",
    code: "F3"
  },
  {
    name: "f4",
    which: "115",
    key: "F4",
    code: "F4"
  },
  {
    name: "f5",
    which: "116",
    key: "F5",
    code: "F5"
  },
  {
    name: "f6",
    which: "117",
    key: "F6",
    code: "F6"
  },
  {
    name: "f7",
    which: "118",
    key: "F7",
    code: "F7"
  },
  {
    name: "f8",
    which: "119",
    key: "F8",
    code: "F8"
  },
  {
    name: "f9",
    which: "120",
    key: "F9",
    code: "F9"
  },
  {
    name: "f10",
    which: "121",
    key: "F10",
    code: "F10"
  },
  {
    name: "f11",
    which: "122",
    key: "F11",
    code: "F11"
  },
  {
    name: "f12",
    which: "123",
    key: "F12",
    code: "F12"
  },
  {
    name: "num lock",
    which: "144",
    key: "NumLock",
    code: "NumLock"
  },
  {
    name: "scroll lock",
    which: "145",
    key: "ScrollLock",
    code: "ScrollLock"
  },
  {
    name: "audio volume mute",
    which: "173",
    key: "AudioVolumeMute",
    code: ""
  },
  {
    name: "audio volume down",
    which: "174",
    key: "AudioVolumeDown",
    code: ""
  },
  {
    name: "audio volume up",
    which: "175",
    key: "AudioVolumeUp",
    code: ""
  },
  {
    name: "media player",
    which: "181",
    key: "LaunchMediaPlayer",
    code: ""
  },
  {
    name: "launch application 1",
    which: "182",
    key: "LaunchApplication1",
    code: ""
  },
  {
    name: "launch application 2",
    which: "183",
    key: "LaunchApplication2",
    code: ""
  },
  {
    name: "semi-colon",
    which: "186",
    key: ";",
    code: "Semicolon"
  },
  {
    name: "equal sign",
    which: "187",
    key: "=",
    code: "Equal"
  },
  {
    name: "comma",
    which: "188",
    key: ",",
    code: "Comma"
  },
  {
    name: "dash",
    which: "189",
    key: "-",
    code: "Minus"
  },
  {
    name: "period",
    which: "190",
    key: ".",
    code: "Period"
  },
  {
    name: "forward slash",
    which: "191",
    key: "/",
    code: "Slash"
  },
  {
    name: "Backquote/Grave accent",
    which: "192",
    key: "`",
    code: "Backquote"
  },
  {
    name: "open bracket",
    which: "219",
    key: "[",
    code: "BracketLeft"
  },
  {
    name: "back slash",
    which: "220",
    key: "\\",
    code: "Backslash"
  },
  {
    name: "close bracket",
    which: "221",
    key: "]",
    code: "BracketRight"
  },
  {
    name: "single quote",
    which: "222",
    key: "'",
    code: "Quote"
  }
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
  const hasUiContainer = document.querySelector(".ui-container") !== null;
  window.addEventListener("mousedown", (e) => {
    if (e.target && (!hasUiContainer || e.target.closest(".ui-container"))) {
      mouseState.button[e.button] = true;
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
    if (e.target && (!hasUiContainer || e.target.closest(".ui-container"))) {
      mouseState.clicked[e.button] = true;
    }
  });
  window.addEventListener("mousemove", (e) => {
    mouseState.screen = [
      (e.clientX - offsetLeft) * window.devicePixelRatio,
      (e.clientY - offsetTop) * window.devicePixelRatio
    ];
    mouseState.uv = [
      (e.clientX - offsetLeft) * window.devicePixelRatio / canvas.width,
      (e.clientY - offsetTop) * window.devicePixelRatio / canvas.height
    ];
    if (mouseState.dragging) {
      mouseState.deltaScreen = [
        mouseState.screen[0] - mouseState.startScreen[0],
        mouseState.screen[1] - mouseState.startScreen[1]
      ];
      mouseState.deltaUv = [
        mouseState.uv[0] - mouseState.startUv[0],
        mouseState.uv[1] - mouseState.startUv[1]
      ];
    }
  });
  window.addEventListener("touchstart", (e) => {
    if (e.target && (!hasUiContainer || e.target.closest(".ui-container"))) {
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
      (e.touches[0].clientY - offsetTop) * window.devicePixelRatio
    ];
    mouseState.uv = [
      (e.touches[0].clientX - offsetLeft) * window.devicePixelRatio / canvas.width,
      (e.touches[0].clientY - offsetTop) * window.devicePixelRatio / canvas.height
    ];
    if (mouseState.dragging) {
      mouseState.deltaScreen = [
        mouseState.screen[0] - mouseState.startScreen[0],
        mouseState.screen[1] - mouseState.startScreen[1]
      ];
      mouseState.deltaUv = [
        mouseState.uv[0] - mouseState.startUv[0],
        mouseState.uv[1] - mouseState.startUv[1]
      ];
    }
  });
  window.addEventListener(
    "wheel",
    (e) => {
      if (e.target.matches("canvas") || e.target.matches(".ui-container") || e.target == document.body) {
        e.preventDefault();
        mouseState.wheel += normalizeWheel(e).pixelY * -0.01;
      }
    },
    { passive: false }
  );
  window.addEventListener("scroll", (e) => {
    if (e.target.matches("canvas") || e.target.matches(".ui-container") || e.target == document.body) {
      e.preventDefault();
    }
  });
  document.addEventListener("scroll", (e) => {
  });
  let getKeyboardState = () => {
    let keys = {};
    for (let key of keyboardKeys) {
      if (!key.code)
        continue;
      let realKey = key.code[0].toLowerCase() + key.code.slice(1);
      keys[realKey] = keyboardSink.has(key.code);
      keys["pressed" + key.code] = frameKeySink.has(key.code);
    }
    let vec = [0, 0];
    if (keys.keyW)
      vec[1] -= 1;
    if (keys.keyS)
      vec[1] += 1;
    if (keys.keyA)
      vec[0] -= 1;
    if (keys.keyD)
      vec[0] += 1;
    if (keys.arrowUp)
      vec[1] -= 1;
    if (keys.arrowDown)
      vec[1] += 1;
    if (keys.arrowLeft)
      vec[0] -= 1;
    if (keys.arrowRight)
      vec[0] += 1;
    keys.arrowVector = [vec[0], vec[1]];
    frameKeySink.clear();
    return keys;
  };
  return {
    getKeyboardState
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
  arrowVector: [0, 0]
};
for (let key of keyboardKeys) {
  if (!key.code)
    continue;
  blankKeyboardState[key.code] = false;
  blankKeyboardState["pressed" + key.code] = false;
}
var PIXEL_STEP = 10;
var LINE_HEIGHT = 40;
var PAGE_HEIGHT = 800;
function normalizeWheel(event) {
  var sX = 0, sY = 0, pX = 0, pY = 0;
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
  const realUiContainer = document.querySelector(".ui-container") ?? engine.canvas;
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
    orbitMaxPitch: Math.PI / 2 - 1e-3
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
    let camera = engine.env.camera;
    let currentDist = cameraConfig.orbitDistance;
    let currentCameraPos = camera.position;
    let rotation = camera.rotation;
    let quatMulled = quaternionMul(rotation, [0, 0, 1]);
    let targetForward = [quatMulled[0], quatMulled[1], quatMulled[2]];
    cameraConfig.orbitTarget = [
      currentCameraPos[0] - targetForward[0] * currentDist,
      currentCameraPos[1] - targetForward[1] * currentDist,
      currentCameraPos[2] - targetForward[2] * currentDist
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
        if (cameraConfig.mode == "orbit-free" || cameraConfig.mode == "free") {
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
    if (e.target == realUiContainer || e.target == document.body || e.target == canvas) {
      if (e.button == 2) {
        e.preventDefault();
        if (cameraConfig.mode == "orbit-free" || cameraConfig.mode == "free") {
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
    if (e.target == document.body || e.target == realUiContainer || e.target == canvas) {
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
        let camera = engine.env.camera;
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
            let camera = engine.env.camera;
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
              let cameraSpeed2 = 0.6 * (Math.sqrt(cameraConfig.orbitDistance) / 20);
              let cameraTarget = cameraConfig.orbitTarget;
              if (e.shiftKey) {
                cameraSpeed2 = 0.01;
              }
              if (e.ctrlKey) {
                cameraSpeed2 = 1;
              }
              cameraTarget[0] += cameraRight[0] * e.movementX * cameraSpeed2 * -1;
              cameraTarget[1] += cameraRight[1] * e.movementX * cameraSpeed2 * -1;
              cameraTarget[2] += cameraRight[2] * e.movementX * cameraSpeed2 * -1;
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
      iz * qw + iw * -qz + ix * -qy - iy * -qx
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
      iw * qw - ix * -qx - iy * -qy - iz * -qz
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
    e: 0
  };
  let movementReal = {
    w: 0,
    a: 0,
    s: 0,
    d: 0,
    q: 0,
    e: 0
  };
  let fovDirection = 0;
  window.addEventListener("keydown", (e) => {
    if (e.target instanceof Element && (e.target.closest("input") || e.target.closest("textarea")))
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
    if (e.target == document.body || e.target == realUiContainer || e.target == engine.canvas) {
      if (e.deltaY > 0) {
        cameraSpeed = cameraSpeed / 1.2;
      } else if (e.deltaY < 0) {
        cameraSpeed = cameraSpeed * 1.2;
      }
      let wheel = normalizeWheel(e);
      if (cameraConfig.mode.startsWith("orbit")) {
        targetOrbitDistance = Math.max(0.1, targetOrbitDistance - wheel.spinY * -100);
      }
      let camera2d = engine.env.camera2d;
      if (camera2d) {
        let mousePos = [engine.env.mouse.screen[0], engine.env.mouse.screen[1]];
        let cameraPos = camera2d.position;
        let cameraZoom = camera2d.zoom;
        let zoomDelta = wheel.spinY * 0.1;
        let newZoom = Math.max(0.01, cameraZoom + zoomDelta * cameraZoom);
        let mouseWorldPos = [
          (mousePos[0] - cameraPos[0]) / cameraZoom,
          (mousePos[1] - cameraPos[1]) / cameraZoom
        ];
        let mouseWorldPos2 = [
          (mousePos[0] - cameraPos[0]) / newZoom,
          (mousePos[1] - cameraPos[1]) / newZoom
        ];
        let mouseWorldDelta = [
          mouseWorldPos2[0] - mouseWorldPos[0],
          mouseWorldPos2[1] - mouseWorldPos[1]
        ];
        camera2d.position = [
          cameraPos[0] - mouseWorldDelta[0] * cameraZoom,
          cameraPos[1] - mouseWorldDelta[1] * cameraZoom
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
      c1 * c2 * c3 - s1 * s2 * s3
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
      engine.env.camera = engine.env.camera ?? (window._makeCamera ? new window._makeCamera({}) : null);
      engine.env.camera2d = engine.env.camera2d ?? (window._makeCamera2d ? new window._makeCamera2d({}) : null);
      if (!engine.env.camera || !engine.env.camera2d) {
        return;
      }
      let now = Date.now();
      let dt = now - lastFrameMovement;
      lastFrameMovement = now;
      if (cameraConfig.mode == "orbit-free" || cameraConfig.mode == "free") {
        if (!flying) {
          if (engine.env.camera) {
            engine.env.camera.fov = lerp(engine.env.camera.fov, 90, dt * 0.01);
          }
        }
      }
      if (engine.env.camera.width != engine.canvas.width || engine.env.camera.height != engine.canvas.height) {
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
          Math.sin(phi) * Math.cos(theta) * cameraConfig.orbitDistance + orbitTarget[0],
          Math.cos(phi) * cameraConfig.orbitDistance + orbitTarget[1],
          Math.sin(phi) * Math.sin(theta) * cameraConfig.orbitDistance + orbitTarget[2]
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
                cameraPosition[2] - orbitTarget[2]
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
          e: lerp(movementReal.e, movement.e, dt / damping)
        };
        let camera = engine.env.camera;
        let up = [0, 1, 0];
        if (camera) {
          cameraRotY = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, cameraRotY));
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
          camera.position[2] + movementVector[2] * dt * cameraSpeed
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
    }
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
      if (!engine.playing)
        return;
      if (blank.width != engine.canvas.width || blank.height != engine.canvas.height) {
        blank.width = engine.canvas.width;
        blank.height = engine.canvas.height;
      }
      for (let i = screenshotQueue.length - 1; i >= 0; i--) {
        let item = screenshotQueue[i];
        let doCapture = false;
        if ("frame" in item && typeof item.frame == "number") {
          if (item.frame <= engine.env.frame - 1 || engine.timeMultiplier != 1 && engine.env.frame - 1 > item.frame) {
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
            let blankData = ctx?.getImageData(0, 0, blank.width, blank.height);
            if (cacheScreenshotItem.$tries && cacheScreenshotItem.$tries > 100 && blankData) {
              blankData.data[0] = 1;
            }
            if (!blankData?.data.some((v) => v != 0)) {
              console.log("Blank screenshot, retrying", screenshotQueue);
              if (!cacheScreenshotItem.$tries)
                cacheScreenshotItem.$tries = 0;
              cacheScreenshotItem.$tries++;
              screenshotQueue.push(cacheScreenshotItem);
            } else {
              performance.mark("end to url");
              console.log("Screenshot captured, sending to parent");
              screenshotQueueResults.push({
                options: item,
                image: data
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
    }
  };
};

class PaintingContext {
  constructor(canvas, gl) {
    this.markDirtyCallback = () => {
    };
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
    if (!gl)
      return;
    this.__gl = gl;
    this.__canvas = canvas;
    this.__offscreen_canvas = document.createElement("canvas");
    this.__offscreen_canvas.width = canvas.width;
    this.__offscreen_canvas.height = canvas.height;
    this.__ctx = this.__offscreen_canvas.getContext("2d", {
      willReadFrequently: true
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
    if (!this.__gl)
      return;
    if (!this.__canvas)
      return;
    if (!this.__offscreen_canvas)
      return;
    if (!this.stagedChanges)
      return;
    if (this.fastPoints)
      this.flushPoints();
    this.__gl.drawImage(this.__offscreen_canvas);
    this.stagedChanges = false;
    if (this.__offscreen_canvas.width != this.__canvas.width || this.__offscreen_canvas.height != this.__canvas.height) {
      this.__offscreen_canvas.width = this.__canvas.width;
      this.__offscreen_canvas.height = this.__canvas.height;
    }
    this.pointsCounter = 0;
  }
  __beforeDraw() {
    if (!this.__offscreen_canvas)
      return;
    if (!this.__ctx)
      return;
    if (!this.__canvas)
      return;
    this.markDirtyCallback();
    this.__gl?.activatePaintContext();
    if (!this.stagedChanges) {
      this.__ctx.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
      this.__ctx.drawImage(this.__canvas, 0, 0);
      let color = this.__currentColor;
      this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
      this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
    }
  }
  __afterDraw() {
    this.__gl;
    this.dirty = true;
    this.stagedChanges = true;
  }
  __setColor(color) {
    if (!this.__ctx || !color)
      return;
    if (this.__currentColor && this.__currentColor[0] == color[0] && this.__currentColor[1] == color[1] && this.__currentColor[2] == color[2] && this.__currentColor[3] == color[3])
      return;
    this.__ctx.strokeStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
    this.__ctx.fillStyle = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
    this.__currentColor = [color[0], color[1], color[2], color[3]];
  }
  fillRect(pos, size, color) {
    if (!this.__ctx)
      return;
    this.flushPoints();
    this.__beforeDraw();
    this.__setColor(color);
    this.__ctx.fillRect(pos[0], pos[1], size[0], size[1]);
    this.__afterDraw();
    this.pointsCounter = 0;
  }
  fillCircle(pos, radius, color) {
    if (!this.__ctx)
      return;
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
    if (!this.__ctx)
      return;
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
    if (!this.__ctx)
      return;
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
    if (!this.__ctx)
      return;
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
    if (!this.__ctx)
      return;
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
    if (!this.__ctx)
      return;
    this.flushPoints();
    this.__beforeDraw();
    this.__setColor(color);
    this.__ctx.fillText(text, pos[0], pos[1]);
    this.__afterDraw();
    this.pointsCounter = 0;
  }
  startPath(pos) {
    if (!this.__ctx)
      return;
    this.flushPoints();
    this.__beforeDraw();
    this.__ctx.beginPath();
    this.__ctx.moveTo(pos[0], pos[1]);
  }
  lineTo(pos) {
    if (!this.__ctx)
      return;
    this.__ctx.lineTo(pos[0], pos[1]);
  }
  strokePath(color, width = 1) {
    if (!this.__ctx)
      return;
    this.__ctx.lineWidth = width;
    this.__setColor(color);
    this.__ctx.stroke();
    this.__afterDraw();
    this.pointsCounter = 0;
  }
  fillPath(color) {
    if (!this.__ctx)
      return;
    this.__setColor(color);
    this.__ctx.fill();
    this.__afterDraw();
    this.pointsCounter = 0;
  }
  setStrokeWidth(width) {
    if (!this.__ctx)
      return;
    this.__ctx.lineWidth = width;
  }
  setFont(font) {
    if (!this.__ctx)
      return;
    this.__ctx.font = font;
  }
  setFontSize(size) {
    if (!this.__ctx)
      return;
    this.__ctx.font = `${size}px ${this.__ctx.font.split(" ").slice(1).join(" ")}`;
  }
  setTextAlign(align) {
    if (!this.__ctx)
      return;
    this.__ctx.textAlign = align;
  }
  setTextBaseline(baseline) {
    if (!this.__ctx)
      return;
    this.__ctx.textBaseline = baseline;
  }
  setLineCap(cap) {
    if (!this.__ctx)
      return;
    this.__ctx.lineCap = cap;
  }
  setLineJoin(join) {
    if (!this.__ctx)
      return;
    this.__ctx.lineJoin = join;
  }
  setMiterLimit(limit) {
    if (!this.__ctx)
      return;
    this.__ctx.miterLimit = limit;
  }
  setShadowColor(color) {
    if (!this.__ctx)
      return;
    this.__ctx.shadowColor = `rgba(${color[0] * 255}, ${color[1] * 255}, ${color[2] * 255}, ${color[3]})`;
  }
  setShadowBlur(blur) {
    if (!this.__ctx)
      return;
    this.__ctx.shadowBlur = blur;
  }
  setShadowOffset(offset) {
    if (!this.__ctx)
      return;
    this.__ctx.shadowOffsetX = offset[0];
    this.__ctx.shadowOffsetY = offset[1];
  }
  setGlobalAlpha(alpha) {
    if (!this.__ctx)
      return;
    this.__ctx.globalAlpha = alpha;
  }
  setGlobalCompositeOperation(op) {
    if (!this.__ctx)
      return;
    this.__ctx.globalCompositeOperation = op;
  }
  setImageSmoothingEnabled(enabled) {
    if (!this.__ctx)
      return;
    this.__ctx.imageSmoothingEnabled = enabled;
  }
  setImageSmoothingQuality(quality) {
    if (!this.__ctx)
      return;
    this.__ctx.imageSmoothingQuality = quality;
  }
  setLineDash(dash) {
    if (!this.__ctx)
      return;
    this.__ctx.setLineDash(dash);
  }
  setLineDashOffset(offset) {
    if (!this.__ctx)
      return;
    this.__ctx.lineDashOffset = offset;
  }
  setTransform(a, b, c, d, e, f) {
    if (!this.__ctx)
      return;
    this.__ctx.setTransform(a, b, c, d, e, f);
  }
  resetTransform() {
    if (!this.__ctx)
      return;
    this.__ctx.resetTransform();
  }
  scale(v) {
    if (!this.__ctx)
      return;
    this.__ctx.scale(v[0], v[1]);
  }
  rotate(angle) {
    if (!this.__ctx)
      return;
    this.__ctx.rotate(angle);
  }
  translate(v) {
    if (!this.__ctx)
      return;
    this.__ctx.translate(v[0], v[1]);
  }
  flushPoints() {
    if (!this.__ctx)
      return;
    if (!this.fastPoints)
      return;
    if (!this.fastPointsBuffer)
      return;
    this.__ctx.putImageData(this.fastPointsBuffer, 0, 0);
    this.fastPoints = false;
    this.fastPointsBuffer = null;
    this.pointsCounter = 0;
  }
  point(pos, color) {
    if (!this.__ctx)
      return;
    this.pointsCounter++;
    this.__beforeDraw();
    if (this.pointsCounter > 10) {
      if (!this.fastPoints) {
        this.fastPoints = true;
        this.cacheSize = [this.__offscreen_canvas.width, this.__offscreen_canvas.height];
        this.fastPointsBuffer = this.__ctx.getImageData(0, 0, this.cacheSize[0], this.cacheSize[1]);
      }
      if (!this.fastPointsBuffer)
        return;
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
      this.fastPointsBuffer.data[index] = color[0] * 255 * color[3] + oldColorx * 255 * (1 - color[3]);
      this.fastPointsBuffer.data[index + 1] = color[1] * 255 * color[3] + oldColory * 255 * (1 - color[3]);
      this.fastPointsBuffer.data[index + 2] = color[2] * 255 * color[3] + oldColorz * 255 * (1 - color[3]);
      this.fastPointsBuffer.data[index + 3] = color[3] * 255 + oldColora * 255 * (1 - color[3]);
    } else {
      this.__setColor(color);
      this.__ctx.fillRect(pos[0], pos[1], 1, 1);
    }
    this.__afterDraw();
  }
  vector(pos, dir, color = [0.9803921568627451, 0.8, 0.08235294117647059, 1], width = 4) {
    if (!this.__ctx || dir[0] == 0 && dir[1] == 0)
      return;
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
      Math.sin(dirAngle + arrowAngle) * arrowSize
    ];
    let arrow2 = [
      Math.cos(dirAngle - arrowAngle) * arrowSize,
      Math.sin(dirAngle - arrowAngle) * arrowSize
    ];
    this.__ctx.lineTo(pos[0] + dir[0] + arrow1[0], pos[1] + dir[1] + arrow1[1]);
    this.__ctx.moveTo(pos[0] + dir[0], pos[1] + dir[1]);
    this.__ctx.lineTo(pos[0] + dir[0] + arrow2[0], pos[1] + dir[1] + arrow2[1]);
    this.__ctx.stroke();
    this.__afterDraw();
    this.pointsCounter = 0;
  }
  grid(center, count, gap, color = [0.1607843137254902, 0.1450980392156863, 0.1411764705882353, 1], width = 2) {
    if (!this.__ctx)
      return;
    this.__beforeDraw();
    this.__setColor(color);
    this.__ctx.beginPath();
    this.setStrokeWidth(width);
    let start = [
      center[0] - count[0] / 2 * gap[0],
      center[1] - count[1] / 2 * gap[1]
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
      window.RAPIER_2D = await import('https://cdn.skypack.dev/@dimforge/rapier2d-compat');
      console.log("Loaded rapier2d");
      await window.RAPIER_2D.init();
      console.log("Initialized rapier2d");
    } else if (name == "rapier3d") {
      window.RAPIER_3D = await import('https://cdn.skypack.dev/@dimforge/rapier3d-compat');
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
          if (key.startsWith("http")) {
            baseUrl = "";
          }
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
                if (ctx)
                  ctx.drawImage(img, 0, 0);
                this.loadedAssets.set(key, canvas);
                let tex = this.engine.shadeupMakeTextureInternal(
                  [canvas.width, canvas.height],
                  "8bit",
                  "uint8"
                );
                tex.adapter?.drawImage(canvas, 0, 0, canvas.width, canvas.height);
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
              await raw.then((res) => res.arrayBuffer()).then((res) => {
                this.loadedAssets.set(key, res);
              });
            } else if (type == "text") {
              await raw.then((res) => res.text()).then((res) => {
                this.loadedAssets.set(key, res);
              });
            } else if (type == "model") {
              await raw.then((res) => res.arrayBuffer()).then(async (res) => {
                const { GLTFLoader } = await import('./GLTFLoader-94b38cf6.js');
                const { Vector3, Mesh: THREEMesh, MeshStandardMaterial } = await import('./three.module-c8091b37.js');
                const { DRACOLoader } = await import('./DRACOLoader-4fcd2f44.js');
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
                    for (let i = 0; i < mesh.geometry.attributes.position.array.length; i += 3) {
                      positions.push([
                        mesh.geometry.attributes.position.array[i],
                        mesh.geometry.attributes.position.array[i + 1],
                        mesh.geometry.attributes.position.array[i + 2]
                      ]);
                    }
                  }
                  if (mesh.geometry.attributes.normal) {
                    for (let i = 0; i < mesh.geometry.attributes.normal.array.length; i += 3) {
                      normals.push([
                        mesh.geometry.attributes.normal.array[i],
                        mesh.geometry.attributes.normal.array[i + 1],
                        mesh.geometry.attributes.normal.array[i + 2]
                      ]);
                    }
                  }
                  if (mesh.geometry.attributes.tangent) {
                    for (let i = 0; i < mesh.geometry.attributes.tangent.array.length; i += 4) {
                      tangents.push([
                        mesh.geometry.attributes.tangent.array[i],
                        mesh.geometry.attributes.tangent.array[i + 1],
                        mesh.geometry.attributes.tangent.array[i + 2]
                      ]);
                    }
                  }
                  if (mesh.geometry.attributes.bitangent) {
                    for (let i = 0; i < mesh.geometry.attributes.bitangent.array.length; i += 3) {
                      bitangents.push([
                        mesh.geometry.attributes.bitangent.array[i],
                        mesh.geometry.attributes.bitangent.array[i + 1],
                        mesh.geometry.attributes.bitangent.array[i + 2]
                      ]);
                    }
                  }
                  if (mesh.geometry.attributes.uv) {
                    for (let i = 0; i < mesh.geometry.attributes.uv.array.length; i += 2) {
                      uvs.push([
                        mesh.geometry.attributes.uv.array[i],
                        mesh.geometry.attributes.uv.array[i + 1]
                      ]);
                    }
                  }
                  if (mesh.geometry.attributes.color) {
                    for (let i = 0; i < mesh.geometry.attributes.color.array.length; i += 4) {
                      colors.push([
                        mesh.geometry.attributes.color.array[i],
                        mesh.geometry.attributes.color.array[i + 1],
                        mesh.geometry.attributes.color.array[i + 2],
                        mesh.geometry.attributes.color.array[i + 3]
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
                  let t = that.engine.shadeupMakeTextureFromImageLike(map.source.data);
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
                        shdMat.baseColor = [mat.color.r, mat.color.g, mat.color.b, 1];
                        if (mat.normalMap) {
                          shdMat.normal = convertTexMap(mat.normalMap);
                          shdMat.normalScale = [mat.normalScale.x, mat.normalScale.y];
                        }
                        if (mat.map) {
                          shdMat.color = convertTexMap(mat.map);
                        }
                        if (mat.metalnessMap) {
                          shdMat.metallic = convertTexMap(mat.metalnessMap);
                        }
                        if (mat.roughnessMap) {
                          shdMat.roughness = convertTexMap(mat.roughnessMap);
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
  frameFunc = async () => {
  };
  env = {
    camera: window?.env?.camera ?? (window._makeCamera ? new window._makeCamera({}) : null),
    camera2d: window?.env?.camera2d ?? (window._makeCamera2d ? new window._makeCamera2d({}) : null),
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
      focused: false
    },
    configureCamera(options) {
    },
    input(key, defaultValue) {
      return defaultValue;
    },
    output(key, value) {
    }
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
  _SHADEUP_UI_PUCK = () => {
  };
  _SHADEUP_UI_SLIDER = () => {
  };
  _SHADEUP_UI_CONTROL = () => {
  };
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
    let tex = this.shadeupMakeTextureInternal([img.width, img.height], "8bit", "uint8");
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
  loadTextureFromImageLike(img) {
    let tex = this.shadeupMakeTextureFromImageLike(img);
    return tex;
  }
  async loadTexture2dFromURL(url) {
    let orig = this.assetLoader.registeredLoads;
    this.assetLoader.registeredLoads = [[url, "image"]];
    await this.assetLoader.loadAssets();
    this.assetLoader.registeredLoads = orig;
    return this.assetLoader.primedTextureAssets.get(url);
  }
  async loadModelFromURL(urlGltf) {
    let orig = this.assetLoader.registeredLoads;
    this.assetLoader.registeredLoads.push([urlGltf, "model"]);
    await this.assetLoader.loadAssets();
    this.assetLoader.registeredLoads = orig;
    return this.assetLoader.loadedAssets.get(urlGltf);
  }
  addCoreHook() {
    let lastFrame = performance.now();
    let timeCounter = 0;
    let frameCount = 0;
    this.hooks.push({
      beforeFrame: () => {
        if (!this.playing)
          return;
        if (this.canvas.width != this.adapter.viewportSize[0] || this.canvas.height != this.adapter.viewportSize[1]) {
          this.adapter.setViewport(this.canvas.width, this.canvas.height);
        }
        if (this.canvas.width != this.paint.__offscreen_canvas.width || this.canvas.height != this.paint.__offscreen_canvas.height) {
          this.paint.__offscreen_canvas.width = this.canvas.width;
          this.paint.__offscreen_canvas.height = this.canvas.height;
        }
        let delta = performance.now() - lastFrame;
        lastFrame = performance.now();
        timeCounter += delta / 1e3 * this.timeMultiplier;
        frameCount += 1 * this.timeMultiplier;
        this.env.deltaTime = delta / 1e3 * this.timeMultiplier;
        this.env.time = timeCounter;
        this.env.frame = frameCount;
        this.env.screenSize = [this.canvas.width, this.canvas.height];
      },
      reset: () => {
        lastFrame = performance.now();
        timeCounter = 0;
        frameCount = 0;
      }
    });
  }
  __shadeup_print(...args) {
  }
  __shadeup_stat(name, value) {
  }
  __shadeup_statGraph(name, value, sampleRate = 1) {
  }
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
          if (window.bubbleError)
            window.bubbleError(e.toString() + e.stack);
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
          this.statsGraphMark.set(statKey, this.statsGraphMark.get(statKey) - 1);
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
  shadeupGetGraphicsAdapter() {
    return this.adapter;
  }
  __shadeup_gen_shader(key, params, code, indexMapping) {
    this.registeredShaders.set(key, new ShadeupShaderSource(params, code, indexMapping));
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
      initialDispatch: shaderInst
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
  __shadeup_dispatch_compute_indirect(indirectBuffer, indirectOffset, shaderInst) {
    let computeCall = new ShaderDispatch("compute");
    computeCall.indirectBuffer = indirectBuffer;
    computeCall.indirectOffset = indirectOffset;
    let compShader = shaderInst.get(this.adapter, "compute", {
      initialDispatch: shaderInst
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
      attachments: config.attachments ? config.attachments.map((a) => a.innerType) : void 0
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
      depthTest: config.depthTest ?? true
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
          software: () => {
          }
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
          name: "float2"
        },
        [this.canvas.width, this.canvas.height]
      )
    );
    drawCall.setVertexShader(this.fullscreenVertexShader);
    let fragShader = pixelShaderInst.get(this.adapter, "fragment", {
      initialDispatch: pixelShaderInst
    });
    if (!fragShader) {
      throw new Error("Fragment shader not found");
    }
    drawCall.setFragmentShader(fragShader);
    pixelShaderInst.bindUniforms(drawCall.fragmentUniforms);
    drawCall.setGeometry(fullscreenGeo);
    this.adapter.dispatch(drawCall, {
      depthTest: false
    });
  }
  PLATFORM_WEBGL = this.preferredAdapter == "webgl";
  PLATFORM_WEBGPU = this.preferredAdapter == "webgpu";
  __shadeup_dispatch_draw_geometry(geometry, vertexShaderInst, pixelShaderInst) {
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "geometry";
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
  __shadeup_dispatch_draw_indexed(indexBuffer, vertexShaderInst, pixelShaderInst) {
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "indexed";
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
  __shadeup_dispatch_draw_instanced_indexed(indexBuffer, instanceCount, vertexShaderInst, pixelShaderInst) {
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "indexed";
    drawCall.instanceCount = instanceCount;
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
  __shadeup_dispatch_draw_instanced(mesh, instanceCount, vertexShaderInst, pixelShaderInst) {
    let drawCall = new ShaderDispatch("draw");
    drawCall.drawType = "geometry";
    drawCall.instanceCount = instanceCount;
    drawCall.setVertexUniform(
      "_vtex_canvas",
      makePrimitiveUniform(
        {
          type: "primitive",
          name: "float2"
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
          name: "float2"
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
    if (!this.__shadeup_structs)
      this.__shadeup_structs = {};
    return this.__shadeup_structs[name];
  }
  __shadeup_register_struct(fields, cls) {
    if (!this.__shadeup_structs)
      this.__shadeup_structs = {};
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
        if (this.adapter instanceof WebGPUAdapter) ;
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
    focused: false
  };
  let { getKeyboardState } = initInput(engine.canvas, mouseState, keyboardSink);
  return {
    beforeFrame(delta) {
      if (!engine.playing)
        return;
      let lastFramePos = lastFrameMousePosition;
      mouseState.frameDeltaScreen = [
        mouseState.screen[0] - lastFramePos[0],
        mouseState.screen[1] - lastFramePos[1]
      ];
      let lastFramePosUv = [
        lastFramePos[0] / engine.canvas.width,
        lastFramePos[1] / engine.canvas.height
      ];
      mouseState.frameDeltaUv = [
        mouseState.uv[0] - lastFramePosUv[0],
        mouseState.uv[1] - lastFramePosUv[1]
      ];
      mouseState.velocity = Math.sqrt(
        mouseState.frameDeltaScreen[0] ** 2 + mouseState.frameDeltaScreen[1] ** 2
      );
      lastFrameMousePosition = [...mouseState.screen];
      engine.env.keyboard = getKeyboardState();
      engine.env.mouse = {
        ...mouseState
      };
    },
    afterFrame() {
      mouseState.clicked[0] = false;
      mouseState.clicked[1] = false;
      mouseState.clicked[2] = false;
    }
  };
};

function isAbsolute(pathname) {
  return pathname.charAt(0) === '/';
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
  if (from === undefined) from = '';

  var toParts = (to && to.split('/')) || [];
  var fromParts = (from && from.split('/')) || [];

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

  if (!fromParts.length) return '/';

  var hasTrailingSlash;
  if (fromParts.length) {
    var last = fromParts[fromParts.length - 1];
    hasTrailingSlash = last === '.' || last === '..' || last === '';
  } else {
    hasTrailingSlash = false;
  }

  var up = 0;
  for (var i = fromParts.length; i >= 0; i--) {
    var part = fromParts[i];

    if (part === '.') {
      spliceOne(fromParts, i);
    } else if (part === '..') {
      spliceOne(fromParts, i);
      up++;
    } else if (up) {
      spliceOne(fromParts, i);
      up--;
    }
  }

  if (!mustEndAbs) for (; up--; up) fromParts.unshift('..');

  if (
    mustEndAbs &&
    fromParts[0] !== '' &&
    (!fromParts[0] || !isAbsolute(fromParts[0]))
  )
    fromParts.unshift('');

  var result = fromParts.join('/');

  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';

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
      callback
    };
  }
  globalDefine.amd = {
    require: {
      deps: [],
      callback: function() {
        return globalRequire;
      }
    },
    exports: {
      deps: [],
      callback: function() {
        return {};
      }
    }
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

const makeShadeupEngine = async (canvas, options) => {
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
  if (preferredAdapter == "webgpu" && !window.shadeupWebGPUAdapter) {
    if (navigator.gpu) {
      window.shadeupWebGPUAdapter = await navigator.gpu.requestAdapter({
        powerPreference: "high-performance"
      });
      if (!window.shadeupWebGPUAdapter) {
        throw new Error("WebGPU not supported");
      }
      console.log(
        "Using WebGPU adapter",
        await window.shadeupWebGPUAdapter.requestAdapterInfo()
      );
      let supported = await window.shadeupWebGPUAdapter.limits;
      let requiredLimits = {
        maxStorageBufferBindingSize: Math.min(
          1024 * 1024 * 1024,
          supported.maxStorageBufferBindingSize
        ),
        // 1GB
        maxBufferSize: Math.min(1024 * 1024 * 1024, supported.maxBufferSize),
        // 1GB
        maxColorAttachmentBytesPerSample: Math.min(64, supported.maxColorAttachmentBytesPerSample),
        // 64 bytes
        maxComputeWorkgroupSizeX: Math.min(1024, supported.maxComputeWorkgroupSizeX),
        maxComputeWorkgroupSizeY: Math.min(1024, supported.maxComputeWorkgroupSizeY),
        maxComputeWorkgroupSizeZ: Math.min(64, supported.maxComputeWorkgroupSizeZ),
        maxComputeInvocationsPerWorkgroup: Math.min(
          1024,
          supported.maxComputeInvocationsPerWorkgroup
        )
      };
      console.log("WebGPU limits", requiredLimits);
      window.shadeupWebGPUDevice = await window.shadeupWebGPUAdapter.requestDevice({
        // requiredLimits: (window as any).shadeupWebGPUAdapter.limits
        requiredLimits
      });
      window.shadeupWebGPUDevice.addEventListener("uncapturederror", (e) => {
        console.error("Uncaught WebGPU", e);
        window.bubbleError(e.error.message);
      });
    }
  }
  graphicsAdapter.init();
  const engine = new ShadeupEngine(canvas, graphicsAdapter);
  engine.start();
  const inputHook = addInputHook(engine);
  engine.hooks.push(inputHook);
  const { screenshotQueue, screenshotQueueResults, ...captureHook } = addCaptureHook(engine);
  engine.hooks.push(captureHook);
  const cameraHook = addCameraHook(engine);
  engine.hooks.push(cameraHook);
  engine.enableUI = async () => {
    const { addUIHook } = await import('./ui-37189365.js');
    const cssLink = await import('./host-f3c963cd.js');
    let style = document.createElement("style");
    style.innerHTML = cssLink.default;
    document.head.appendChild(style);
    const uiHook = addUIHook(engine);
    engine.hooks.push(uiHook);
    let parent = canvas.parentElement;
    let uiContainer = document.createElement("div");
    uiContainer.style.position = "absolute";
    uiContainer.classList.add("render-container");
    uiContainer.style.top = "0";
    uiContainer.style.right = "0";
    parent.appendChild(uiContainer);
    let stater = document.createElement("div");
    stater.classList.add("stater");
    stater.style.position = "absolute";
    stater.style.pointerEvents = "none";
    stater.style.top = "0";
    stater.style.right = "0";
    stater.style.width = "100%";
    stater.style.display = "flex";
    stater.style.flexDirection = "column";
    stater.style.alignItems = "flex-end";
    stater.style.paddingRight = "10px";
    stater.style.paddingTop = "10px";
    stater.style.fontFamily = "monospace";
    stater.style.color = "white";
    stater.style.zIndex = "1001";
    if (uiContainer) {
      uiContainer.appendChild(stater);
    }
    function splitNumberPlaces(num) {
      let parts = "";
      let decimalCount = 5;
      if (num > 100) {
        decimalCount = 2;
      }
      let str = num.toFixed(decimalCount);
      if (num > 100) {
        str = str.replace(/\.?0+$/, "");
      }
      let hitDecimal = !str.includes(".");
      let counter = 0;
      for (let i = str.length - 1; i >= 0; i--) {
        if (hitDecimal) {
          if (counter == 3) {
            parts = str[i] + "," + parts;
            counter = 0;
          } else {
            parts = str[i] + parts;
          }
          counter++;
        } else {
          parts = str[i] + parts;
        }
        if (str[i] == ".") {
          hitDecimal = true;
        }
      }
      return parts;
    }
    function serializeValueToHtml(value) {
      let placesColoring = ["#9abcff", "#aadfaa", "#f0ff76", "#aeaeae"];
      let displayValue = value.toString();
      if (typeof value == "number") {
        displayValue = `<span style="color: ${placesColoring[0]}">${splitNumberPlaces(
          value
        )}</span>`;
      } else if (typeof value == "object") {
        if (Array.isArray(value)) {
          if (value.length == 0) {
            displayValue = `<span style="color: #a1a1a1">[]</span>`;
          } else {
            let numeric = true;
            for (let v of value) {
              if (typeof v != "number") {
                numeric = false;
              }
            }
            if (numeric) {
              displayValue = value.map((v, i) => {
                let index = i % 4;
                return `<span style="color: ${placesColoring[index]}">${splitNumberPlaces(
                  v
                )}</span>`;
              }).join(" ");
            } else {
              displayValue = `[ ${value.map(serializeValueToHtml).join(",")} ]`;
            }
          }
        } else if (typeof value == "boolean") {
          if (value) {
            displayValue = `<span style="color: #66ffab">true</span>`;
          } else {
            displayValue = `<span style="color: #ff6666">false</span>`;
          }
        } else if (typeof value == "string") {
          displayValue = `<span style="color: #fabb20">${value}</span>`;
        } else {
          displayValue = JSON.stringify(value);
        }
      }
      return displayValue;
    }
    const statTimeout = 144;
    engine.__shadeup_stat = (name, value) => {
      if (!engine.stats.has(name)) {
        let el2 = document.createElement("div");
        el2.style.display = "inline-flex";
        el2.style.alignItems = "center";
        el2.style.backdropFilter = "blur(1px)";
        el2.style.borderRadius = "20px";
        el2.style.padding = "2px 4px";
        el2.style.background = "rgba(0,0,0,0.5)";
        el2.style.fontSize = "12px";
        el2.style.lineHeight = "12px";
        el2.style.flexShrink = "0";
        el2.style.marginBottom = "2px";
        engine.stats.set(name, el2);
        stater.appendChild(el2);
      }
      engine.statsMark.set(name, statTimeout);
      let el = engine.stats.get(name);
      if (!el)
        return;
      let htm = `<i>${name}</i> <span style="margin-left: 8px;">${serializeValueToHtml(
        value
      )}</span>`;
      if (el.innerHTML != htm) {
        el.innerHTML = htm;
      }
    };
    function lerp(a, b, t) {
      return a + (b - a) * t;
    }
    engine.__shadeup_statGraph = (name, value, sampleRate = 1) => {
      if (!engine.statsGraph.has(name)) {
        let el = document.createElement("div");
        el.style.display = "inline-flex";
        el.style.alignItems = "center";
        el.style.backdropFilter = "blur(1px)";
        el.style.borderRadius = "20px";
        el.style.padding = "2px 4px";
        let text = document.createElement("span");
        text.style.marginLeft = "8px";
        text.innerText = name;
        el.appendChild(text);
        el.style.background = "rgba(0,0,0,0.5)";
        el.style.fontSize = "12px";
        el.style.lineHeight = "12px";
        el.style.flexShrink = "0";
        el.style.marginBottom = "2px";
        let canvas2 = document.createElement("canvas");
        canvas2.width = 100;
        canvas2.height = 20;
        canvas2.style.marginLeft = "8px";
        canvas2.style.borderRadius = "4px";
        canvas2.style.background = "rgba(0,0,0,0.3)";
        el.appendChild(canvas2);
        let ctx2 = canvas2.getContext("2d");
        let num = document.createElement("span");
        num.style.marginLeft = "8px";
        el.appendChild(num);
        engine.statsGraph.set(name, {
          ctx: ctx2,
          graph: canvas2,
          num,
          min: value,
          max: value,
          index: 0,
          counter: 0,
          history: new Array(canvas2.width).fill(0)
        });
        stater.appendChild(el);
      }
      let statData = engine.statsGraph.get(name);
      statData.counter++;
      let histMax = lerp(statData.max, value, 0.1);
      let histMin = lerp(statData.min, value, 0.1);
      for (let subVal of statData.history) {
        if (subVal < histMin)
          histMin = subVal;
        if (subVal > histMax)
          histMax = subVal;
      }
      statData.max = histMax;
      statData.min = histMin;
      if (statData.counter % sampleRate == 0) {
        statData.history[statData.index] = value;
        statData.index = (statData.index + 1) % statData.history.length;
      }
      let width = statData.graph.width;
      let histwidth = width;
      let height = statData.graph.height;
      let ctx = statData.ctx;
      ctx.fillStyle = "white";
      ctx.clearRect(0, 0, width, height);
      ctx?.beginPath();
      for (let j = 0; j < statData.history.length; j++) {
        let rev = statData.index - j;
        let i = rev < 0 ? statData.history.length + rev : rev;
        let x = (1 - j / statData.history.length) * histwidth;
        let drawHeight = height;
        let valPercent = Math.min(1, (statData.history[i] - histMin) / (histMax - histMin));
        let top = height - drawHeight * valPercent;
        if (isNaN(top)) {
          top = height;
        }
        if (isNaN(x)) {
          x = 0;
        }
        if (j == 0) {
          ctx?.moveTo(x, top);
        }
        ctx.lineTo(x, top);
      }
      ctx.lineTo(0, height);
      ctx.lineTo(width, height);
      ctx.fill();
      engine.statsGraphMark.set(name, statTimeout);
      statData.history[statData.index];
      let htm = `${serializeValueToHtml(value)}`;
      if (statData.num.innerHTML != htm) {
        statData.num.innerHTML = htm;
      }
    };
  };
  return engine;
};
const linkIntoEngine = async (engine, fn) => {
  const resolver = makeAMDResolver();
  fn(resolver.globalDefine);
  resolver.globalRequire(["/_std/mesh.js"])[0];
  await engine.assetLoader.loadAssets();
  await engine.assetLoader.loadLibs();
  try {
    const meta = resolver.globalRequire(["/__meta.js"])[0];
    let outs = resolver.globalRequire(["/" + meta.files[0] + ".js"])[0];
    if (typeof outs.main === "function") {
      engine.frameFunc = outs.main;
      engine.hasLoadedCode = true;
    }
    engine.files = {};
    for (let i = 0; i < meta.files.length; i++) {
      const file = meta.files[i];
      engine.files[file] = i == 0 ? outs : resolver.globalRequire(["/" + file + ".js"])[0];
    }
  } catch (e) {
    console.error(e);
    result = e.message;
  }
  engine.frameFunc;
};

export { linkIntoEngine, makeShadeupEngine };

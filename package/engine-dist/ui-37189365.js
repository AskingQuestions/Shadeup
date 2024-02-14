function noop() { }
const identity = x => x;
function assign(tar, src) {
    // @ts-ignore
    for (const k in src)
        tar[k] = src[k];
    return tar;
}
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function is_function(thing) {
    return typeof thing === 'function';
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}
function is_empty(obj) {
    return Object.keys(obj).length === 0;
}
function subscribe(store, ...callbacks) {
    if (store == null) {
        return noop;
    }
    const unsub = store.subscribe(...callbacks);
    return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function component_subscribe(component, store, callback) {
    component.$$.on_destroy.push(subscribe(store, callback));
}
function action_destroyer(action_result) {
    return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
}

const is_client = typeof window !== 'undefined';
let now = is_client
    ? () => window.performance.now()
    : () => Date.now();
let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

const tasks = new Set();
function run_tasks(now) {
    tasks.forEach(task => {
        if (!task.c(now)) {
            tasks.delete(task);
            task.f();
        }
    });
    if (tasks.size !== 0)
        raf(run_tasks);
}
/**
 * Creates a new task that runs on each raf frame
 * until it returns a falsy value or is aborted
 */
function loop(callback) {
    let task;
    if (tasks.size === 0)
        raf(run_tasks);
    return {
        promise: new Promise(fulfill => {
            tasks.add(task = { c: callback, f: fulfill });
        }),
        abort() {
            tasks.delete(task);
        }
    };
}

const globals = (typeof window !== 'undefined'
    ? window
    : typeof globalThis !== 'undefined'
        ? globalThis
        : global);
function append(target, node) {
    target.appendChild(node);
}
function get_root_for_style(node) {
    if (!node)
        return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
        return root;
    }
    return node.ownerDocument;
}
function append_empty_stylesheet(node) {
    const style_element = element('style');
    append_stylesheet(get_root_for_style(node), style_element);
    return style_element.sheet;
}
function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
}
function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
}
function detach(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
        if (iterations[i])
            iterations[i].d(detaching);
    }
}
function element(name) {
    return document.createElement(name);
}
function svg_element(name) {
    return document.createElementNS('http://www.w3.org/2000/svg', name);
}
function text(data) {
    return document.createTextNode(data);
}
function space() {
    return text(' ');
}
function empty() {
    return text('');
}
function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
}
function attr(node, attribute, value) {
    if (value == null)
        node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
        node.setAttribute(attribute, value);
}
function children(element) {
    return Array.from(element.childNodes);
}
function set_data(text, data) {
    data = '' + data;
    if (text.data === data)
        return;
    text.data = data;
}
function set_style(node, key, value, important) {
    if (value == null) {
        node.style.removeProperty(key);
    }
    else {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
}
function toggle_class(element, name, toggle) {
    element.classList[toggle ? 'add' : 'remove'](name);
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
    const e = document.createEvent('CustomEvent');
    e.initCustomEvent(type, bubbles, cancelable, detail);
    return e;
}
class HtmlTag {
    constructor(is_svg = false) {
        this.is_svg = false;
        this.is_svg = is_svg;
        this.e = this.n = null;
    }
    c(html) {
        this.h(html);
    }
    m(html, target, anchor = null) {
        if (!this.e) {
            if (this.is_svg)
                this.e = svg_element(target.nodeName);
            /** #7364  target for <template> may be provided as #document-fragment(11) */
            else
                this.e = element((target.nodeType === 11 ? 'TEMPLATE' : target.nodeName));
            this.t = target.tagName !== 'TEMPLATE' ? target : target.content;
            this.c(html);
        }
        this.i(anchor);
    }
    h(html) {
        this.e.innerHTML = html;
        this.n = Array.from(this.e.nodeName === 'TEMPLATE' ? this.e.content.childNodes : this.e.childNodes);
    }
    i(anchor) {
        for (let i = 0; i < this.n.length; i += 1) {
            insert(this.t, this.n[i], anchor);
        }
    }
    p(html) {
        this.d();
        this.h(html);
        this.i(this.a);
    }
    d() {
        this.n.forEach(detach);
    }
}
function construct_svelte_component(component, props) {
    return new component(props);
}

// we need to store the information for multiple documents because a Svelte application could also contain iframes
// https://github.com/sveltejs/svelte/issues/3624
const managed_styles = new Map();
let active = 0;
// https://github.com/darkskyapp/string-hash/blob/master/index.js
function hash(str) {
    let hash = 5381;
    let i = str.length;
    while (i--)
        hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
    return hash >>> 0;
}
function create_style_information(doc, node) {
    const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
    managed_styles.set(doc, info);
    return info;
}
function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
    const step = 16.666 / duration;
    let keyframes = '{\n';
    for (let p = 0; p <= 1; p += step) {
        const t = a + (b - a) * ease(p);
        keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
    }
    const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
    const name = `__svelte_${hash(rule)}_${uid}`;
    const doc = get_root_for_style(node);
    const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
    if (!rules[name]) {
        rules[name] = true;
        stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
    }
    const animation = node.style.animation || '';
    node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
    active += 1;
    return name;
}
function delete_rule(node, name) {
    const previous = (node.style.animation || '').split(', ');
    const next = previous.filter(name
        ? anim => anim.indexOf(name) < 0 // remove specific animation
        : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
    );
    const deleted = previous.length - next.length;
    if (deleted) {
        node.style.animation = next.join(', ');
        active -= deleted;
        if (!active)
            clear_rules();
    }
}
function clear_rules() {
    raf(() => {
        if (active)
            return;
        managed_styles.forEach(info => {
            const { ownerNode } = info.stylesheet;
            // there is no ownerNode if it runs on jsdom.
            if (ownerNode)
                detach(ownerNode);
        });
        managed_styles.clear();
    });
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error('Function called outside component initialization');
    return current_component;
}
/**
 * The `onMount` function schedules a callback to run as soon as the component has been mounted to the DOM.
 * It must be called during the component's initialisation (but doesn't need to live *inside* the component;
 * it can be called from an external module).
 *
 * `onMount` does not run inside a [server-side component](/docs#run-time-server-side-component-api).
 *
 * https://svelte.dev/docs#run-time-svelte-onmount
 */
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}

const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
    if (!update_scheduled) {
        update_scheduled = true;
        resolved_promise.then(flush);
    }
}
function add_render_callback(fn) {
    render_callbacks.push(fn);
}
// flush() calls callbacks in this order:
// 1. All beforeUpdate callbacks, in order: parents before children
// 2. All bind:this callbacks, in reverse order: children before parents.
// 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
//    for afterUpdates called during the initial onMount, which are called in
//    reverse order: children before parents.
// Since callbacks might update component values, which could trigger another
// call to flush(), the following steps guard against this:
// 1. During beforeUpdate, any updated components will be added to the
//    dirty_components array and will cause a reentrant call to flush(). Because
//    the flush index is kept outside the function, the reentrant call will pick
//    up where the earlier call left off and go through all dirty components. The
//    current_component value is saved and restored so that the reentrant call will
//    not interfere with the "parent" flush() call.
// 2. bind:this callbacks cannot trigger new flush() calls.
// 3. During afterUpdate, any updated components will NOT have their afterUpdate
//    callback called a second time; the seen_callbacks set, outside the flush()
//    function, guarantees this behavior.
const seen_callbacks = new Set();
let flushidx = 0; // Do *not* move this inside the flush() function
function flush() {
    // Do not reenter flush while dirty components are updated, as this can
    // result in an infinite loop. Instead, let the inner flush handle it.
    // Reentrancy is ok afterwards for bindings etc.
    if (flushidx !== 0) {
        return;
    }
    const saved_component = current_component;
    do {
        // first, call beforeUpdate functions
        // and update components
        try {
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
        }
        catch (e) {
            // reset dirty state to not end up in a deadlocked state and then rethrow
            dirty_components.length = 0;
            flushidx = 0;
            throw e;
        }
        set_current_component(null);
        dirty_components.length = 0;
        flushidx = 0;
        while (binding_callbacks.length)
            binding_callbacks.pop()();
        // then, once components are updated, call
        // afterUpdate functions. This may cause
        // subsequent updates...
        for (let i = 0; i < render_callbacks.length; i += 1) {
            const callback = render_callbacks[i];
            if (!seen_callbacks.has(callback)) {
                // ...so guard against infinite loops
                seen_callbacks.add(callback);
                callback();
            }
        }
        render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
        flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
}
function update($$) {
    if ($$.fragment !== null) {
        $$.update();
        run_all($$.before_update);
        const dirty = $$.dirty;
        $$.dirty = [-1];
        $$.fragment && $$.fragment.p($$.ctx, dirty);
        $$.after_update.forEach(add_render_callback);
    }
}
/**
 * Useful for example to execute remaining `afterUpdate` callbacks before executing `destroy`.
 */
function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
}

let promise;
function wait() {
    if (!promise) {
        promise = Promise.resolve();
        promise.then(() => {
            promise = null;
        });
    }
    return promise;
}
function dispatch(node, direction, kind) {
    node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
}
const outroing = new Set();
let outros;
function group_outros() {
    outros = {
        r: 0,
        c: [],
        p: outros // parent group
    };
}
function check_outros() {
    if (!outros.r) {
        run_all(outros.c);
    }
    outros = outros.p;
}
function transition_in(block, local) {
    if (block && block.i) {
        outroing.delete(block);
        block.i(local);
    }
}
function transition_out(block, local, detach, callback) {
    if (block && block.o) {
        if (outroing.has(block))
            return;
        outroing.add(block);
        outros.c.push(() => {
            outroing.delete(block);
            if (callback) {
                if (detach)
                    block.d(1);
                callback();
            }
        });
        block.o(local);
    }
    else if (callback) {
        callback();
    }
}
const null_transition = { duration: 0 };
function create_bidirectional_transition(node, fn, params, intro) {
    const options = { direction: 'both' };
    let config = fn(node, params, options);
    let t = intro ? 0 : 1;
    let running_program = null;
    let pending_program = null;
    let animation_name = null;
    function clear_animation() {
        if (animation_name)
            delete_rule(node, animation_name);
    }
    function init(program, duration) {
        const d = (program.b - t);
        duration *= Math.abs(d);
        return {
            a: t,
            b: program.b,
            d,
            duration,
            start: program.start,
            end: program.start + duration,
            group: program.group
        };
    }
    function go(b) {
        const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
        const program = {
            start: now() + delay,
            b
        };
        if (!b) {
            // @ts-ignore todo: improve typings
            program.group = outros;
            outros.r += 1;
        }
        if (running_program || pending_program) {
            pending_program = program;
        }
        else {
            // if this is an intro, and there's a delay, we need to do
            // an initial tick and/or apply CSS animation immediately
            if (css) {
                clear_animation();
                animation_name = create_rule(node, t, b, duration, delay, easing, css);
            }
            if (b)
                tick(0, 1);
            running_program = init(program, duration);
            add_render_callback(() => dispatch(node, b, 'start'));
            loop(now => {
                if (pending_program && now > pending_program.start) {
                    running_program = init(pending_program, duration);
                    pending_program = null;
                    dispatch(node, running_program.b, 'start');
                    if (css) {
                        clear_animation();
                        animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                    }
                }
                if (running_program) {
                    if (now >= running_program.end) {
                        tick(t = running_program.b, 1 - t);
                        dispatch(node, running_program.b, 'end');
                        if (!pending_program) {
                            // we're done
                            if (running_program.b) {
                                // intro — we can tidy up immediately
                                clear_animation();
                            }
                            else {
                                // outro — needs to be coordinated
                                if (!--running_program.group.r)
                                    run_all(running_program.group.c);
                            }
                        }
                        running_program = null;
                    }
                    else if (now >= running_program.start) {
                        const p = now - running_program.start;
                        t = running_program.a + running_program.d * easing(p / running_program.duration);
                        tick(t, 1 - t);
                    }
                }
                return !!(running_program || pending_program);
            });
        }
    }
    return {
        run(b) {
            if (is_function(config)) {
                wait().then(() => {
                    // @ts-ignore
                    config = config(options);
                    go(b);
                });
            }
            else {
                go(b);
            }
        },
        end() {
            clear_animation();
            running_program = pending_program = null;
        }
    };
}

function get_spread_update(levels, updates) {
    const update = {};
    const to_null_out = {};
    const accounted_for = { $$scope: 1 };
    let i = levels.length;
    while (i--) {
        const o = levels[i];
        const n = updates[i];
        if (n) {
            for (const key in o) {
                if (!(key in n))
                    to_null_out[key] = 1;
            }
            for (const key in n) {
                if (!accounted_for[key]) {
                    update[key] = n[key];
                    accounted_for[key] = 1;
                }
            }
            levels[i] = n;
        }
        else {
            for (const key in o) {
                accounted_for[key] = 1;
            }
        }
    }
    for (const key in to_null_out) {
        if (!(key in update))
            update[key] = undefined;
    }
    return update;
}
function get_spread_object(spread_props) {
    return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
}
function create_component(block) {
    block && block.c();
}
function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
            // if the component was destroyed immediately
            // it will update the `$$.on_destroy` reference to `null`.
            // the destructured on_destroy may still reference to the old array
            if (component.$$.on_destroy) {
                component.$$.on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
    }
    after_update.forEach(add_render_callback);
}
function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
        flush_render_callbacks($$.after_update);
        run_all($$.on_destroy);
        $$.fragment && $$.fragment.d(detaching);
        // TODO null out other refs, including component.$$ (but need to
        // preserve final state?)
        $$.on_destroy = $$.fragment = null;
        $$.ctx = [];
    }
}
function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
        dirty_components.push(component);
        schedule_update();
        component.$$.dirty.fill(0);
    }
    component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
}
function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
        fragment: null,
        ctx: [],
        // state
        props,
        update: noop,
        not_equal,
        bound: blank_object(),
        // lifecycle
        on_mount: [],
        on_destroy: [],
        on_disconnect: [],
        before_update: [],
        after_update: [],
        context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
        // everything else
        callbacks: blank_object(),
        dirty,
        skip_bound: false,
        root: options.target || parent_component.$$.root
    };
    append_styles && append_styles($$.root);
    let ready = false;
    $$.ctx = instance
        ? instance(component, options.props || {}, (i, ret, ...rest) => {
            const value = rest.length ? rest[0] : ret;
            if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                if (!$$.skip_bound && $$.bound[i])
                    $$.bound[i](value);
                if (ready)
                    make_dirty(component, i);
            }
            return ret;
        })
        : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    // `false` as a special case of no DOM component
    $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
    if (options.target) {
        if (options.hydrate) {
            const nodes = children(options.target);
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.l(nodes);
            nodes.forEach(detach);
        }
        else {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            $$.fragment && $$.fragment.c();
        }
        if (options.intro)
            transition_in(component.$$.fragment);
        mount_component(component, options.target, options.anchor, options.customElement);
        flush();
    }
    set_current_component(parent_component);
}
/**
 * Base class for Svelte components. Used when dev=false.
 */
class SvelteComponent {
    $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
    }
    $on(type, callback) {
        if (!is_function(callback)) {
            return noop;
        }
        const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
        callbacks.push(callback);
        return () => {
            const index = callbacks.indexOf(callback);
            if (index !== -1)
                callbacks.splice(index, 1);
        };
    }
    $set($$props) {
        if (this.$$set && !is_empty($$props)) {
            this.$$.skip_bound = true;
            this.$$set($$props);
            this.$$.skip_bound = false;
        }
    }
}

/* ui/components/Slider.svelte generated by Svelte v3.59.2 */

function create_fragment$8(ctx) {
	let div3;
	let div2;
	let div0;
	let t0;
	let div1;
	let t1;
	let input0;
	let input0_value_value;
	let t2;
	let input1;
	let mounted;
	let dispose;

	return {
		c() {
			div3 = element("div");
			div2 = element("div");
			div0 = element("div");
			t0 = space();
			div1 = element("div");
			t1 = space();
			input0 = element("input");
			t2 = space();
			input1 = element("input");
			attr(div0, "class", "absolute rounded-full bg-gray-600 w-full h-1");
			attr(div1, "class", "handle absolute w-[6px] h-[14px] rounded-full bg-purple-600 cursor-pointer");
			set_style(div1, "left", "calc(100% * " + (/*value*/ ctx[0] - /*min*/ ctx[1]) + " / " + (/*max*/ ctx[2] - /*min*/ ctx[1]) + " - 3px)");
			attr(div2, "class", "track w-full h-4 relative flex items-center");
			attr(input0, "class", "bg-black bg-opacity-10 p-0 rounded-sm w-5 h-4 text-sm outline-none border-none ml-2 text-right");
			set_style(input0, "font-size", "10px");
			attr(input0, "type", "text");
			input0.value = input0_value_value = /*value*/ ctx[0].toFixed(1).replace(/\.0$/, '');
			attr(input0, "min", /*min*/ ctx[1]);
			attr(input0, "max", /*max*/ ctx[2]);
			input1.hidden = true;
			attr(input1, "type", "range");
			attr(input1, "min", /*min*/ ctx[1]);
			attr(input1, "max", /*max*/ ctx[2]);
			input1.value = /*value*/ ctx[0];
			attr(div3, "class", "px-3 pt-0 pb-1 flex flex-row items-center");
		},
		m(target, anchor) {
			insert(target, div3, anchor);
			append(div3, div2);
			append(div2, div0);
			append(div2, t0);
			append(div2, div1);
			/*div2_binding*/ ctx[8](div2);
			append(div3, t1);
			append(div3, input0);
			append(div3, t2);
			append(div3, input1);

			if (!mounted) {
				dispose = [
					listen(window, "mouseup", /*mouseup_handler*/ ctx[7]),
					listen(window, "mousemove", /*handleMove*/ ctx[6]),
					listen(div2, "mousedown", /*mousedown_handler*/ ctx[9]),
					listen(input0, "input", /*input_handler*/ ctx[10]),
					listen(input1, "input", /*input_handler_1*/ ctx[11])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*value, min, max*/ 7) {
				set_style(div1, "left", "calc(100% * " + (/*value*/ ctx[0] - /*min*/ ctx[1]) + " / " + (/*max*/ ctx[2] - /*min*/ ctx[1]) + " - 3px)");
			}

			if (dirty & /*value*/ 1 && input0_value_value !== (input0_value_value = /*value*/ ctx[0].toFixed(1).replace(/\.0$/, '')) && input0.value !== input0_value_value) {
				input0.value = input0_value_value;
			}

			if (dirty & /*min*/ 2) {
				attr(input0, "min", /*min*/ ctx[1]);
			}

			if (dirty & /*max*/ 4) {
				attr(input0, "max", /*max*/ ctx[2]);
			}

			if (dirty & /*min*/ 2) {
				attr(input1, "min", /*min*/ ctx[1]);
			}

			if (dirty & /*max*/ 4) {
				attr(input1, "max", /*max*/ ctx[2]);
			}

			if (dirty & /*value*/ 1) {
				input1.value = /*value*/ ctx[0];
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div3);
			/*div2_binding*/ ctx[8](null);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$8($$self, $$props, $$invalidate) {
	let { value } = $$props;
	let { min } = $$props;
	let { max } = $$props;

	let { setValue = () => {
		
	} } = $$props;

	let dragging = false;
	let selfElement;

	function handleMove(e) {
		if (dragging) {
			const rect = selfElement.getBoundingClientRect();
			const x = e.clientX - rect.left;
			const percent = x / rect.width;
			let newValue = min + (max - min) * percent;
			newValue = Math.max(min, Math.min(max, newValue));
			setValue(newValue);
			$$invalidate(0, value = newValue);
		}
	}

	const mouseup_handler = () => $$invalidate(4, dragging = false);

	function div2_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			selfElement = $$value;
			$$invalidate(5, selfElement);
		});
	}

	const mousedown_handler = event => {
		$$invalidate(4, dragging = true);
		handleMove(event);
	};

	const input_handler = e => {
		setValue(parseFloat(e.target.value));
		$$invalidate(0, value = parseFloat(e.target.value));
	};

	const input_handler_1 = e => {
		setValue(parseFloat(e.target.value));
		$$invalidate(0, value = parseFloat(e.target.value));
	};

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('min' in $$props) $$invalidate(1, min = $$props.min);
		if ('max' in $$props) $$invalidate(2, max = $$props.max);
		if ('setValue' in $$props) $$invalidate(3, setValue = $$props.setValue);
	};

	return [
		value,
		min,
		max,
		setValue,
		dragging,
		selfElement,
		handleMove,
		mouseup_handler,
		div2_binding,
		mousedown_handler,
		input_handler,
		input_handler_1
	];
}

class Slider extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$8, create_fragment$8, safe_not_equal, { value: 0, min: 1, max: 2, setValue: 3 });
	}
}

/* ui/components/Combo.svelte generated by Svelte v3.59.2 */

function get_each_context$3(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[4] = list[i];
	return child_ctx;
}

// (14:2) {#if typeof options == 'object' && Array.isArray(options)}
function create_if_block$2(ctx) {
	let each_1_anchor;
	let each_value = /*options*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	return {
		c() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},
		m(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(target, anchor);
				}
			}

			insert(target, each_1_anchor, anchor);
		},
		p(ctx, dirty) {
			if (dirty & /*value, options*/ 3) {
				each_value = /*options*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}

				each_blocks.length = each_value.length;
			}
		},
		d(detaching) {
			destroy_each(each_blocks, detaching);
			if (detaching) detach(each_1_anchor);
		}
	};
}

// (15:3) {#each options as option}
function create_each_block$3(ctx) {
	let option;
	let t_value = /*option*/ ctx[4] + "";
	let t;
	let option_selected_value;
	let option_value_value;

	return {
		c() {
			option = element("option");
			t = text(t_value);
			attr(option, "class", "bg-gray-800");
			option.selected = option_selected_value = /*value*/ ctx[0] == /*option*/ ctx[4];
			option.__value = option_value_value = /*option*/ ctx[4];
			option.value = option.__value;
		},
		m(target, anchor) {
			insert(target, option, anchor);
			append(option, t);
		},
		p(ctx, dirty) {
			if (dirty & /*options*/ 2 && t_value !== (t_value = /*option*/ ctx[4] + "")) set_data(t, t_value);

			if (dirty & /*value, options*/ 3 && option_selected_value !== (option_selected_value = /*value*/ ctx[0] == /*option*/ ctx[4])) {
				option.selected = option_selected_value;
			}

			if (dirty & /*options*/ 2 && option_value_value !== (option_value_value = /*option*/ ctx[4])) {
				option.__value = option_value_value;
				option.value = option.__value;
			}
		},
		d(detaching) {
			if (detaching) detach(option);
		}
	};
}

function create_fragment$7(ctx) {
	let div;
	let select;
	let show_if = typeof /*options*/ ctx[1] == 'object' && Array.isArray(/*options*/ ctx[1]);
	let mounted;
	let dispose;
	let if_block = show_if && create_if_block$2(ctx);

	return {
		c() {
			div = element("div");
			select = element("select");
			if (if_block) if_block.c();
			attr(select, "class", "border border-gray-600 outline-none rounded-md text-sm p-0.5 px-1 bg-gray-800 bg-opacity-30 w-full");
			attr(div, "class", "px-3 pt-0 pb-1 flex flex-row items-center justify-end");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, select);
			if (if_block) if_block.m(select, null);

			if (!mounted) {
				dispose = listen(select, "input", /*input_handler*/ ctx[3]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*options*/ 2) show_if = typeof /*options*/ ctx[1] == 'object' && Array.isArray(/*options*/ ctx[1]);

			if (show_if) {
				if (if_block) {
					if_block.p(ctx, dirty);
				} else {
					if_block = create_if_block$2(ctx);
					if_block.c();
					if_block.m(select, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
			mounted = false;
			dispose();
		}
	};
}

function instance$7($$self, $$props, $$invalidate) {
	let { value } = $$props;
	let { options } = $$props;

	let { setValue = () => {
		
	} } = $$props;

	const input_handler = e => {
		setValue(e.target.value);
		$$invalidate(0, value = e.target.value);
	};

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('options' in $$props) $$invalidate(1, options = $$props.options);
		if ('setValue' in $$props) $$invalidate(2, setValue = $$props.setValue);
	};

	return [value, options, setValue, input_handler];
}

class Combo extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$7, create_fragment$7, safe_not_equal, { value: 0, options: 1, setValue: 2 });
	}
}

/* ui/components/Label.svelte generated by Svelte v3.59.2 */

function create_fragment$6(ctx) {
	let div;
	let t;

	return {
		c() {
			div = element("div");
			t = text(/*value*/ ctx[0]);
			attr(div, "class", "px-3 pb-0.5 text-xs text-white text-opacity-50 pt-2");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, t);
		},
		p(ctx, [dirty]) {
			if (dirty & /*value*/ 1) set_data(t, /*value*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function instance$6($$self, $$props, $$invalidate) {
	let { value } = $$props;

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
	};

	return [value];
}

class Label extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$6, create_fragment$6, safe_not_equal, { value: 0 });
	}
}

function cubicOut(t) {
    const f = t - 1.0;
    return f * f * f + 1.0;
}

function slide(node, { delay = 0, duration = 400, easing = cubicOut, axis = 'y' } = {}) {
    const style = getComputedStyle(node);
    const opacity = +style.opacity;
    const primary_property = axis === 'y' ? 'height' : 'width';
    const primary_property_value = parseFloat(style[primary_property]);
    const secondary_properties = axis === 'y' ? ['top', 'bottom'] : ['left', 'right'];
    const capitalized_secondary_properties = secondary_properties.map((e) => `${e[0].toUpperCase()}${e.slice(1)}`);
    const padding_start_value = parseFloat(style[`padding${capitalized_secondary_properties[0]}`]);
    const padding_end_value = parseFloat(style[`padding${capitalized_secondary_properties[1]}`]);
    const margin_start_value = parseFloat(style[`margin${capitalized_secondary_properties[0]}`]);
    const margin_end_value = parseFloat(style[`margin${capitalized_secondary_properties[1]}`]);
    const border_width_start_value = parseFloat(style[`border${capitalized_secondary_properties[0]}Width`]);
    const border_width_end_value = parseFloat(style[`border${capitalized_secondary_properties[1]}Width`]);
    return {
        delay,
        duration,
        easing,
        css: t => 'overflow: hidden;' +
            `opacity: ${Math.min(t * 20, 1) * opacity};` +
            `${primary_property}: ${t * primary_property_value}px;` +
            `padding-${secondary_properties[0]}: ${t * padding_start_value}px;` +
            `padding-${secondary_properties[1]}: ${t * padding_end_value}px;` +
            `margin-${secondary_properties[0]}: ${t * margin_start_value}px;` +
            `margin-${secondary_properties[1]}: ${t * margin_end_value}px;` +
            `border-${secondary_properties[0]}-width: ${t * border_width_start_value}px;` +
            `border-${secondary_properties[1]}-width: ${t * border_width_end_value}px;`
    };
}

function measureElement(node, options) {
  const { height, width, top, left } = options;
  const resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const { height: h, width: w, top: t, left: l } = entry.target.getBoundingClientRect();
      height?.set(h);
      width?.set(w);
      top?.set(t);
      left?.set(l);
    }
  });
  resizeObserver.observe(node);
  return {
    destroy() {
      resizeObserver.disconnect();
    }
  };
}

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=} start
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = new Set();
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (const subscriber of subscribers) {
                    subscriber[1]();
                    subscriber_queue.push(subscriber, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.add(subscriber);
        if (subscribers.size === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            subscribers.delete(subscriber);
            if (subscribers.size === 0 && stop) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const FloatingPanel_svelte_svelte_type_style_lang = '';

/* ui/components/FloatingPanel.svelte generated by Svelte v3.59.2 */

const { window: window_1 } = globals;

function get_each_context$2(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[10] = list[i];
	return child_ctx;
}

// (28:0) {#if children.length > 0}
function create_if_block$1(ctx) {
	let div1;
	let div0;
	let t;
	let current_block_type_index;
	let if_block;
	let current;
	let mounted;
	let dispose;
	let each_value = /*children*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const if_block_creators = [create_if_block_1, create_else_block];
	const if_blocks = [];

	function select_block_type(ctx, dirty) {
		if (/*isFullscreen*/ ctx[2]) return 0;
		return 1;
	}

	current_block_type_index = select_block_type(ctx);
	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	return {
		c() {
			div1 = element("div");
			div0 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if_block.c();
			attr(div0, "class", "floating-panel scrollbar bg-gray-800 over border border-gray-800 rounded-lg shadow-lg flex flex-col overflow-x-hidden backdrop-blur-sm bg-opacity-20 transition-all duration-300 svelte-1lm5wxt");
			set_style(div0, "max-height", "calc(100vh - 64px - 16px)");
			set_style(div0, "overflow-y", "overlay");
			toggle_class(div0, "w-0", !/*open*/ ctx[1]);
			toggle_class(div0, "w-[200px]", /*open*/ ctx[1]);
			toggle_class(div0, "mr-4", !/*open*/ ctx[1]);
			attr(div1, "class", "z-40 absolute flex flex-col items-end justify-start");
			toggle_class(div1, "right-2", !/*isFullscreen*/ ctx[2] || /*isFullscreen*/ ctx[2] && !/*open*/ ctx[1]);
			toggle_class(div1, "top-10", !/*isFullscreen*/ ctx[2]);
			toggle_class(div1, "right-8", /*isFullscreen*/ ctx[2] && /*open*/ ctx[1]);
			toggle_class(div1, "top-8", /*isFullscreen*/ ctx[2]);
		},
		m(target, anchor) {
			insert(target, div1, anchor);
			append(div1, div0);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div0, null);
				}
			}

			append(div1, t);
			if_blocks[current_block_type_index].m(div1, null);
			current = true;

			if (!mounted) {
				dispose = action_destroyer(measureElement.call(null, div0, { height: /*panelHeight*/ ctx[5] }));
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (dirty & /*children*/ 1) {
				each_value = /*children*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$2(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$2(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div0, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*open*/ 2) {
				toggle_class(div0, "w-0", !/*open*/ ctx[1]);
			}

			if (!current || dirty & /*open*/ 2) {
				toggle_class(div0, "w-[200px]", /*open*/ ctx[1]);
			}

			if (!current || dirty & /*open*/ 2) {
				toggle_class(div0, "mr-4", !/*open*/ ctx[1]);
			}

			let previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type(ctx);

			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(ctx, dirty);
			} else {
				group_outros();

				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});

				check_outros();
				if_block = if_blocks[current_block_type_index];

				if (!if_block) {
					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block.c();
				} else {
					if_block.p(ctx, dirty);
				}

				transition_in(if_block, 1);
				if_block.m(div1, null);
			}

			if (!current || dirty & /*isFullscreen, open*/ 6) {
				toggle_class(div1, "right-2", !/*isFullscreen*/ ctx[2] || /*isFullscreen*/ ctx[2] && !/*open*/ ctx[1]);
			}

			if (!current || dirty & /*isFullscreen*/ 4) {
				toggle_class(div1, "top-10", !/*isFullscreen*/ ctx[2]);
			}

			if (!current || dirty & /*isFullscreen, open*/ 6) {
				toggle_class(div1, "right-8", /*isFullscreen*/ ctx[2] && /*open*/ ctx[1]);
			}

			if (!current || dirty & /*isFullscreen*/ 4) {
				toggle_class(div1, "top-8", /*isFullscreen*/ ctx[2]);
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			transition_in(if_block);
			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div1);
			destroy_each(each_blocks, detaching);
			if_blocks[current_block_type_index].d();
			mounted = false;
			dispose();
		}
	};
}

// (44:3) {#each children as child}
function create_each_block$2(ctx) {
	let div;
	let switch_instance;
	let t;
	let div_class_value;
	let current;

	const switch_instance_spread_levels = [
		{ value: /*child*/ ctx[10].value },
		{ setValue: /*child*/ ctx[10].setValue },
		{ children: /*child*/ ctx[10].children },
		/*child*/ ctx[10].options
	];

	var switch_value = /*child*/ ctx[10].type;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props());
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t = space();
			attr(div, "class", div_class_value = "min-w-[200px] control-" + /*child*/ ctx[10].name + " svelte-1lm5wxt");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (switch_instance) mount_component(switch_instance, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*children*/ 1)
			? get_spread_update(switch_instance_spread_levels, [
					{ value: /*child*/ ctx[10].value },
					{ setValue: /*child*/ ctx[10].setValue },
					{ children: /*child*/ ctx[10].children },
					get_spread_object(/*child*/ ctx[10].options)
				])
			: {};

			if (dirty & /*children*/ 1 && switch_value !== (switch_value = /*child*/ ctx[10].type)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, t);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}

			if (!current || dirty & /*children*/ 1 && div_class_value !== (div_class_value = "min-w-[200px] control-" + /*child*/ ctx[10].name + " svelte-1lm5wxt")) {
				attr(div, "class", div_class_value);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

// (80:2) {:else}
function create_else_block(ctx) {
	let button;
	let svg;
	let path0;
	let path1;
	let button_transition;
	let current;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			svg = svg_element("svg");
			path0 = svg_element("path");
			path1 = svg_element("path");
			attr(path0, "d", "M0 0h24v24H0V0z");
			attr(path0, "fill", "none");
			attr(path1, "d", "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z");
			attr(svg, "class", "transition-all duration-300 transform max-w-[16px]");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "height", "24px");
			attr(svg, "viewBox", "0 0 24 24");
			attr(svg, "width", "24px");
			attr(svg, "fill", "#fff");
			toggle_class(svg, "rotate-180", !/*open*/ ctx[1]);
			attr(button, "class", "bg-gray-700 rounded-r-md shadow-lg backdrop-blur-sm bg-opacity-30 w-4 h-4 flex items-center justify-center transition-all duration-300");
			set_style(button, "margin-top", (/*open*/ ctx[1] ? 2 : -(/*$panelHeight*/ ctx[4] / 2 + 8)) + "px");
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, svg);
			append(svg, path0);
			append(svg, path1);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler_1*/ ctx[9]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (!current || dirty & /*open*/ 2) {
				toggle_class(svg, "rotate-180", !/*open*/ ctx[1]);
			}

			if (!current || dirty & /*open, $panelHeight*/ 18) {
				set_style(button, "margin-top", (/*open*/ ctx[1] ? 2 : -(/*$panelHeight*/ ctx[4] / 2 + 8)) + "px");
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (!current) return;
				if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, true);
				button_transition.run(1);
			});

			current = true;
		},
		o(local) {
			if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, false);
			button_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (detaching && button_transition) button_transition.end();
			mounted = false;
			dispose();
		}
	};
}

// (57:2) {#if isFullscreen}
function create_if_block_1(ctx) {
	let button;
	let svg;
	let path0;
	let path1;
	let button_transition;
	let current;
	let mounted;
	let dispose;

	return {
		c() {
			button = element("button");
			svg = svg_element("svg");
			path0 = svg_element("path");
			path1 = svg_element("path");
			attr(path0, "d", "M0 0h24v24H0V0z");
			attr(path0, "fill", "none");
			attr(path1, "d", "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z");
			attr(svg, "class", "transition-all duration-300 transform max-w-[16px]");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "height", "24px");
			attr(svg, "viewBox", "0 0 24 24");
			attr(svg, "width", "24px");
			attr(svg, "fill", "#fff");
			toggle_class(svg, "rotate-180", !/*open*/ ctx[1]);
			attr(button, "class", "bg-gray-700 rounded-md shadow-lg backdrop-blur-sm bg-opacity-30 w-4 h-4 flex items-center justify-center transition-all duration-300");
			set_style(button, "margin-top", (/*open*/ ctx[1] ? 2 : -(/*$panelHeight*/ ctx[4] + 8)) + "px");
			toggle_class(button, "mr-4", !/*open*/ ctx[1]);
		},
		m(target, anchor) {
			insert(target, button, anchor);
			append(button, svg);
			append(svg, path0);
			append(svg, path1);
			current = true;

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[8]);
				mounted = true;
			}
		},
		p(ctx, dirty) {
			if (!current || dirty & /*open*/ 2) {
				toggle_class(svg, "rotate-180", !/*open*/ ctx[1]);
			}

			if (!current || dirty & /*open, $panelHeight*/ 18) {
				set_style(button, "margin-top", (/*open*/ ctx[1] ? 2 : -(/*$panelHeight*/ ctx[4] + 8)) + "px");
			}

			if (!current || dirty & /*open*/ 2) {
				toggle_class(button, "mr-4", !/*open*/ ctx[1]);
			}
		},
		i(local) {
			if (current) return;

			add_render_callback(() => {
				if (!current) return;
				if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, true);
				button_transition.run(1);
			});

			current = true;
		},
		o(local) {
			if (!button_transition) button_transition = create_bidirectional_transition(button, slide, {}, false);
			button_transition.run(0);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(button);
			if (detaching && button_transition) button_transition.end();
			mounted = false;
			dispose();
		}
	};
}

function create_fragment$5(ctx) {
	let html_tag;
	let t;
	let if_block_anchor;
	let current;
	let mounted;
	let dispose;
	let if_block = /*children*/ ctx[0].length > 0 && create_if_block$1(ctx);

	return {
		c() {
			html_tag = new HtmlTag(false);
			t = space();
			if (if_block) if_block.c();
			if_block_anchor = empty();
			html_tag.a = t;
		},
		m(target, anchor) {
			html_tag.m(/*styleStr*/ ctx[3], target, anchor);
			insert(target, t, anchor);
			if (if_block) if_block.m(target, anchor);
			insert(target, if_block_anchor, anchor);
			current = true;

			if (!mounted) {
				dispose = listen(window_1, "resize", /*resize_handler*/ ctx[7]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*styleStr*/ 8) html_tag.p(/*styleStr*/ ctx[3]);

			if (/*children*/ ctx[0].length > 0) {
				if (if_block) {
					if_block.p(ctx, dirty);

					if (dirty & /*children*/ 1) {
						transition_in(if_block, 1);
					}
				} else {
					if_block = create_if_block$1(ctx);
					if_block.c();
					transition_in(if_block, 1);
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				group_outros();

				transition_out(if_block, 1, 1, () => {
					if_block = null;
				});

				check_outros();
			}
		},
		i(local) {
			if (current) return;
			transition_in(if_block);
			current = true;
		},
		o(local) {
			transition_out(if_block);
			current = false;
		},
		d(detaching) {
			if (detaching) html_tag.d();
			if (detaching) detach(t);
			if (if_block) if_block.d(detaching);
			if (detaching) detach(if_block_anchor);
			mounted = false;
			dispose();
		}
	};
}

function instance$5($$self, $$props, $$invalidate) {
	let shouldPush;
	let styleStr;
	let $panelHeight;
	let { children = [] } = $$props;
	let panelHeight = writable(0);
	component_subscribe($$self, panelHeight, value => $$invalidate(4, $panelHeight = value));
	let open = true;
	let isFullscreen = false;

	onMount(() => {
		$$invalidate(2, isFullscreen = window.innerHeight >= screen.height);
	});

	const resize_handler = () => {
		$$invalidate(2, isFullscreen = window.innerHeight >= screen.height);
	};

	const click_handler = () => {
		$$invalidate(1, open = !open);
	};

	const click_handler_1 = () => {
		$$invalidate(1, open = !open);
	};

	$$self.$$set = $$props => {
		if ('children' in $$props) $$invalidate(0, children = $$props.children);
	};

	$$self.$$.update = () => {
		if ($$self.$$.dirty & /*open, children*/ 3) {
			$$invalidate(6, shouldPush = open && children && children.length > 0);
		}

		if ($$self.$$.dirty & /*shouldPush*/ 64) {
			$$invalidate(3, styleStr = `<style> .stater {
		transition: 0.2s all;
		
		margin-right: ${shouldPush ? '186px;' : '0px'}
		margin-top: ${shouldPush ? '4px;' : '0px'}
	}</style>`);
		}
	};

	return [
		children,
		open,
		isFullscreen,
		styleStr,
		$panelHeight,
		panelHeight,
		shouldPush,
		resize_handler,
		click_handler,
		click_handler_1
	];
}

class FloatingPanel extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$5, create_fragment$5, safe_not_equal, { children: 0 });
	}
}

const host = '';

/* ui/components/Host.svelte generated by Svelte v3.59.2 */

function get_each_context$1(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[1] = list[i];
	return child_ctx;
}

// (7:1) {#each children as child}
function create_each_block$1(ctx) {
	let switch_instance;
	let switch_instance_anchor;
	let current;

	const switch_instance_spread_levels = [
		{ value: /*child*/ ctx[1].value },
		{ setValue: /*child*/ ctx[1].setValue },
		{ children: /*child*/ ctx[1].children },
		/*child*/ ctx[1].options
	];

	var switch_value = /*child*/ ctx[1].type;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props());
	}

	return {
		c() {
			if (switch_instance) create_component(switch_instance.$$.fragment);
			switch_instance_anchor = empty();
		},
		m(target, anchor) {
			if (switch_instance) mount_component(switch_instance, target, anchor);
			insert(target, switch_instance_anchor, anchor);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*children*/ 1)
			? get_spread_update(switch_instance_spread_levels, [
					{ value: /*child*/ ctx[1].value },
					{ setValue: /*child*/ ctx[1].setValue },
					{ children: /*child*/ ctx[1].children },
					get_spread_object(/*child*/ ctx[1].options)
				])
			: {};

			if (dirty & /*children*/ 1 && switch_value !== (switch_value = /*child*/ ctx[1].type)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(switch_instance_anchor);
			if (switch_instance) destroy_component(switch_instance, detaching);
		}
	};
}

function create_fragment$4(ctx) {
	let div;
	let current;
	let each_value = /*children*/ ctx[0];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(div, "class", "host");
		},
		m(target, anchor) {
			insert(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div, null);
				}
			}

			current = true;
		},
		p(ctx, [dirty]) {
			if (dirty & /*children*/ 1) {
				each_value = /*children*/ ctx[0];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			destroy_each(each_blocks, detaching);
		}
	};
}

function instance$4($$self, $$props, $$invalidate) {
	let { children } = $$props;

	$$self.$$set = $$props => {
		if ('children' in $$props) $$invalidate(0, children = $$props.children);
	};

	return [children];
}

class Host extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$4, create_fragment$4, safe_not_equal, { children: 0 });
	}
}

/* ui/components/Group.svelte generated by Svelte v3.59.2 */

function get_each_context(ctx, list, i) {
	const child_ctx = ctx.slice();
	child_ctx[6] = list[i];
	child_ctx[8] = i;
	return child_ctx;
}

// (43:2) {#each children as child, i}
function create_each_block(ctx) {
	let div;
	let switch_instance;
	let t;
	let div_class_value;
	let current;

	const switch_instance_spread_levels = [
		{ value: /*child*/ ctx[6].value },
		{ setValue: /*child*/ ctx[6].setValue },
		{ children: /*child*/ ctx[6].children },
		/*child*/ ctx[6].options
	];

	var switch_value = /*child*/ ctx[6].type;

	function switch_props(ctx) {
		let switch_instance_props = {};

		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
		}

		return { props: switch_instance_props };
	}

	if (switch_value) {
		switch_instance = construct_svelte_component(switch_value, switch_props());
	}

	return {
		c() {
			div = element("div");
			if (switch_instance) create_component(switch_instance.$$.fragment);
			t = space();
			attr(div, "class", div_class_value = "min-w-[200px - 16px] bg-gray-500 bg-opacity-5 control-" + /*child*/ ctx[6].name);
			toggle_class(div, "rounded-b-md", /*i*/ ctx[8] === /*children*/ ctx[1].length - 1);
		},
		m(target, anchor) {
			insert(target, div, anchor);
			if (switch_instance) mount_component(switch_instance, div, null);
			append(div, t);
			current = true;
		},
		p(ctx, dirty) {
			const switch_instance_changes = (dirty & /*children*/ 2)
			? get_spread_update(switch_instance_spread_levels, [
					{ value: /*child*/ ctx[6].value },
					{ setValue: /*child*/ ctx[6].setValue },
					{ children: /*child*/ ctx[6].children },
					get_spread_object(/*child*/ ctx[6].options)
				])
			: {};

			if (dirty & /*children*/ 2 && switch_value !== (switch_value = /*child*/ ctx[6].type)) {
				if (switch_instance) {
					group_outros();
					const old_component = switch_instance;

					transition_out(old_component.$$.fragment, 1, 0, () => {
						destroy_component(old_component, 1);
					});

					check_outros();
				}

				if (switch_value) {
					switch_instance = construct_svelte_component(switch_value, switch_props());
					create_component(switch_instance.$$.fragment);
					transition_in(switch_instance.$$.fragment, 1);
					mount_component(switch_instance, div, t);
				} else {
					switch_instance = null;
				}
			} else if (switch_value) {
				switch_instance.$set(switch_instance_changes);
			}

			if (!current || dirty & /*children*/ 2 && div_class_value !== (div_class_value = "min-w-[200px - 16px] bg-gray-500 bg-opacity-5 control-" + /*child*/ ctx[6].name)) {
				attr(div, "class", div_class_value);
			}

			if (!current || dirty & /*children, children*/ 2) {
				toggle_class(div, "rounded-b-md", /*i*/ ctx[8] === /*children*/ ctx[1].length - 1);
			}
		},
		i(local) {
			if (current) return;
			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
			current = true;
		},
		o(local) {
			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
			current = false;
		},
		d(detaching) {
			if (detaching) detach(div);
			if (switch_instance) destroy_component(switch_instance);
		}
	};
}

function create_fragment$3(ctx) {
	let div0;
	let button;
	let span0;
	let svg;
	let path0;
	let path1;
	let t0;
	let span1;
	let t1;
	let t2;
	let t3;
	let t4;
	let div2;
	let div1;
	let current;
	let mounted;
	let dispose;
	let each_value = /*children*/ ctx[1];
	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	return {
		c() {
			div0 = element("div");
			button = element("button");
			span0 = element("span");
			svg = svg_element("svg");
			path0 = svg_element("path");
			path1 = svg_element("path");
			t0 = space();
			span1 = element("span");
			t1 = text(/*value*/ ctx[0]);
			t2 = space();
			t3 = text(/*$height*/ ctx[3]);
			t4 = space();
			div2 = element("div");
			div1 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			attr(path0, "d", "M0 0h24v24H0V0z");
			attr(path0, "fill", "none");
			attr(path1, "d", "M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6-6-6z");
			attr(svg, "class", "transition-all duration-300 transform max-w-[16px]");
			attr(svg, "xmlns", "http://www.w3.org/2000/svg");
			attr(svg, "height", "24px");
			attr(svg, "viewBox", "0 0 24 24");
			attr(svg, "width", "24px");
			attr(svg, "fill", "#fff");
			toggle_class(svg, "rotate-90", /*open*/ ctx[2]);
			attr(span0, "class", "w-4 h-4 ml-1 opacity-50 flex items-center justify-center rounded-md");
			attr(span1, "class", "flex-1 ml-2 text-left text-sm text-white text-opacity-75");
			attr(button, "class", "flex flex-row items-center mx-1 bg-gray-500 bg-opacity-5");
			toggle_class(button, "rounded-md", !/*open*/ ctx[2]);
			toggle_class(button, "rounded-t-md", /*open*/ ctx[2]);
			attr(div0, "class", "flex flex-col");
			attr(div1, "class", "flex flex-col mx-1");
			attr(div2, "class", "transition-all mb-1 flex flex-col");
			set_style(div2, "max-height", (/*open*/ ctx[2] ? /*$height*/ ctx[3] : 0) + "px");
			set_style(div2, "overflow", "hidden");
		},
		m(target, anchor) {
			insert(target, div0, anchor);
			append(div0, button);
			append(button, span0);
			append(span0, svg);
			append(svg, path0);
			append(svg, path1);
			append(button, t0);
			append(button, span1);
			append(span1, t1);
			append(span1, t2);
			append(span1, t3);
			insert(target, t4, anchor);
			insert(target, div2, anchor);
			append(div2, div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				if (each_blocks[i]) {
					each_blocks[i].m(div1, null);
				}
			}

			current = true;

			if (!mounted) {
				dispose = [
					listen(button, "click", /*click_handler*/ ctx[5]),
					action_destroyer(measureElement.call(null, div1, { height: /*height*/ ctx[4] }))
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (!current || dirty & /*open*/ 4) {
				toggle_class(svg, "rotate-90", /*open*/ ctx[2]);
			}

			if (!current || dirty & /*value*/ 1) set_data(t1, /*value*/ ctx[0]);
			if (!current || dirty & /*$height*/ 8) set_data(t3, /*$height*/ ctx[3]);

			if (!current || dirty & /*open*/ 4) {
				toggle_class(button, "rounded-md", !/*open*/ ctx[2]);
			}

			if (!current || dirty & /*open*/ 4) {
				toggle_class(button, "rounded-t-md", /*open*/ ctx[2]);
			}

			if (dirty & /*children*/ 2) {
				each_value = /*children*/ ctx[1];
				let i;

				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(child_ctx, dirty);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div1, null);
					}
				}

				group_outros();

				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}

				check_outros();
			}

			if (!current || dirty & /*open, $height*/ 12) {
				set_style(div2, "max-height", (/*open*/ ctx[2] ? /*$height*/ ctx[3] : 0) + "px");
			}
		},
		i(local) {
			if (current) return;

			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},
		o(local) {
			each_blocks = each_blocks.filter(Boolean);

			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},
		d(detaching) {
			if (detaching) detach(div0);
			if (detaching) detach(t4);
			if (detaching) detach(div2);
			destroy_each(each_blocks, detaching);
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$3($$self, $$props, $$invalidate) {
	let $height;
	let { value } = $$props;
	let { children } = $$props;
	let open = true;
	let height = writable(0);
	component_subscribe($$self, height, value => $$invalidate(3, $height = value));

	const click_handler = () => {
		$$invalidate(2, open = !open);
	};

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('children' in $$props) $$invalidate(1, children = $$props.children);
	};

	return [value, children, open, $height, height, click_handler];
}

class Group extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$3, create_fragment$3, safe_not_equal, { value: 0, children: 1 });
	}
}

const Checkbox_svelte_svelte_type_style_lang = '';

/* ui/components/Checkbox.svelte generated by Svelte v3.59.2 */

function create_if_block(ctx) {
	let div;

	return {
		c() {
			div = element("div");
			attr(div, "class", "w-2 h-2 rounded-sm bg-purple-600 ");
		},
		m(target, anchor) {
			insert(target, div, anchor);
		},
		d(detaching) {
			if (detaching) detach(div);
		}
	};
}

function create_fragment$2(ctx) {
	let div;
	let button;
	let t;
	let input;
	let mounted;
	let dispose;
	let if_block = /*value*/ ctx[0] && create_if_block();

	return {
		c() {
			div = element("div");
			button = element("button");
			if (if_block) if_block.c();
			t = space();
			input = element("input");
			attr(button, "class", "rounded-md border border-gray-600 bg-gray-900 w-4 h-4 cursor-pointer flex items-center justify-center");
			set_style(input, "display", "none");
			input.hidden = true;
			attr(input, "type", "checkbox");
			input.checked = /*value*/ ctx[0];
			attr(div, "class", "px-3 pt-0 pb-1 flex flex-row items-center justify-end");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);
			if (if_block) if_block.m(button, null);
			append(div, t);
			append(div, input);

			if (!mounted) {
				dispose = [
					listen(button, "click", /*click_handler*/ ctx[2]),
					listen(input, "input", /*input_handler*/ ctx[3])
				];

				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (/*value*/ ctx[0]) {
				if (if_block) ; else {
					if_block = create_if_block();
					if_block.c();
					if_block.m(button, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if (dirty & /*value*/ 1) {
				input.checked = /*value*/ ctx[0];
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			if (if_block) if_block.d();
			mounted = false;
			run_all(dispose);
		}
	};
}

function instance$2($$self, $$props, $$invalidate) {
	let { value } = $$props;

	let { setValue = () => {
		
	} } = $$props;

	const click_handler = event => {
		$$invalidate(0, value = !value);
		setValue(value);
	};

	const input_handler = e => {
		setValue(e.target.checked);
		$$invalidate(0, value = e.target.checked);
	};

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('setValue' in $$props) $$invalidate(1, setValue = $$props.setValue);
	};

	return [value, setValue, click_handler, input_handler];
}

class Checkbox extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$2, create_fragment$2, safe_not_equal, { value: 0, setValue: 1 });
	}
}

/* ui/components/Button.svelte generated by Svelte v3.59.2 */

function create_fragment$1(ctx) {
	let div;
	let button;
	let t;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			button = element("button");
			t = text(/*text*/ ctx[0]);
			attr(button, "class", "rounded-md hover:border-purple-600 border border-gray-600 bg-gray-900 w-full cursor-pointer flex items-center justify-center");
			attr(div, "class", "px-3 pt-0 pb-1 flex");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, button);
			append(button, t);

			if (!mounted) {
				dispose = listen(button, "click", /*click_handler*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*text*/ 1) set_data(t, /*text*/ ctx[0]);
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function instance$1($$self, $$props, $$invalidate) {
	let { text } = $$props;

	let { setValue = () => {
		
	} } = $$props;

	const click_handler = event => {
		setValue(true);
	};

	$$self.$$set = $$props => {
		if ('text' in $$props) $$invalidate(0, text = $$props.text);
		if ('setValue' in $$props) $$invalidate(1, setValue = $$props.setValue);
	};

	return [text, setValue, click_handler];
}

class Button extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance$1, create_fragment$1, safe_not_equal, { text: 0, setValue: 1 });
	}
}

/* ui/components/Text.svelte generated by Svelte v3.59.2 */

function create_fragment(ctx) {
	let div;
	let input;
	let mounted;
	let dispose;

	return {
		c() {
			div = element("div");
			input = element("input");
			attr(input, "class", "outline-none border border-gray-600 bg-gray-800 bg-opacity-30 p-0.5 px-1 text-sm w-full rounded-md");
			attr(input, "type", "text");
			input.value = /*value*/ ctx[0];
			attr(div, "class", "px-3 pt-0 pb-1");
		},
		m(target, anchor) {
			insert(target, div, anchor);
			append(div, input);

			if (!mounted) {
				dispose = listen(input, "input", /*input_handler*/ ctx[2]);
				mounted = true;
			}
		},
		p(ctx, [dirty]) {
			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
				input.value = /*value*/ ctx[0];
			}
		},
		i: noop,
		o: noop,
		d(detaching) {
			if (detaching) detach(div);
			mounted = false;
			dispose();
		}
	};
}

function instance($$self, $$props, $$invalidate) {
	let { value } = $$props;

	let { setValue = () => {
		
	} } = $$props;

	const input_handler = e => {
		setValue(e.target.value);
		$$invalidate(0, value = e.target.value);
	};

	$$self.$$set = $$props => {
		if ('value' in $$props) $$invalidate(0, value = $$props.value);
		if ('setValue' in $$props) $$invalidate(1, setValue = $$props.setValue);
	};

	return [value, setValue, input_handler];
}

class Text extends SvelteComponent {
	constructor(options) {
		super();
		init(this, options, instance, create_fragment, safe_not_equal, { value: 0, setValue: 1 });
	}
}

function initPuck(canvas) {
  let uiContainer = document.querySelector(".ui-container");
  let puckDown = false;
  let puckId = "";
  let pucks = {};
  function blankUISink() {
    return {
      knob: /* @__PURE__ */ new Map(),
      knobCounter: 0,
      button: /* @__PURE__ */ new Map(),
      buttonCounter: 0,
      switch: /* @__PURE__ */ new Map(),
      switchCounter: 0,
      slider: /* @__PURE__ */ new Map(),
      sliderCounter: 0,
      puck: /* @__PURE__ */ new Map(),
      puckCounter: 0
    };
  }
  let uiSink = blankUISink();
  let uiSinkLastFrame = blankUISink();
  window.addEventListener("mousedown", (e) => {
    if (e.target.closest(".puck")) {
      let p = e.target.closest(".puck");
      p.dataset.down = true;
      let mp = getPosRelativeToCanvas([e.clientX, e.clientY]);
      let rect = p.getBoundingClientRect();
      let pmp = getPosRelativeToCanvas([rect.left + rect.width / 2, rect.top + rect.height / 2]);
      p.dataset.offsetX = pmp[0] - mp[0];
      p.dataset.offsetY = pmp[1] - mp[1];
      puckId = p.dataset.id;
      puckDown = true;
      lastPuckPos = [...pmp];
      updateDocumentCursor();
    }
  });
  function updateDocumentCursor() {
    if (puckDown) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "default";
    }
  }
  window.addEventListener("mouseup", (e) => {
    puckDown = false;
    updateDocumentCursor();
    for (let el of [...document.querySelectorAll(".puck")]) {
      let p = el;
      if (p.dataset.down == "true") {
        p.dataset.down = "false";
      }
    }
  });
  function getPosRelativeToCanvas(pos) {
    let rect = canvas.getBoundingClientRect();
    return [
      (pos[0] - rect.left) / rect.width * canvas.width,
      (pos[1] - rect.top) / rect.height * canvas.height
    ];
  }
  const host = new Host({
    target: document.body,
    props: {
      children: []
    }
  });
  host.$on("init", (e) => {
  });
  let lastPuckPos = [0, 0];
  window.addEventListener("mousemove", (e) => {
    if (!puckDown)
      return;
    let puck = document.querySelector(`.puck[data-id="${puckId}"]`);
    if (!puck)
      return;
    let [x, y] = getPosRelativeToCanvas([e.clientX, e.clientY]);
    let velocityX = x - lastPuckPos[0];
    let velocityY = y - lastPuckPos[1];
    let vectorLength = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
    let angle = Math.atan2(velocityY, velocityX);
    let oldVel = parseFloat(puck.dataset.velocity ?? "0");
    puck.dataset.velocity = (oldVel + vectorLength).toString();
    let oldAngle = parseFloat(puck.dataset.angle ?? "0");
    let oldDirVelX = oldVel * Math.cos(oldAngle);
    let oldDirVelY = oldVel * Math.sin(oldAngle);
    let newDirVelX = vectorLength * Math.cos(angle);
    let newDirVelY = vectorLength * Math.sin(angle);
    puck.dataset.angle = Math.atan2(oldDirVelY + newDirVelY, oldDirVelX + newDirVelX).toString();
    lastPuckPos = [x, y];
    puck.dataset.oldX = puck.offsetLeft.toString();
    puck.dataset.oldY = puck.offsetTop.toString();
    x += parseInt(puck.dataset.offsetX ?? "0");
    y += parseInt(puck.dataset.offsetY ?? "0");
    uiSinkLastFrame.puck.set(puckId, { vec: [x, y] });
  });
  setInterval(() => {
    for (let el of [...document.querySelectorAll(".puck")]) {
      let p = el;
      let maxSpeed = 105;
      let restitution = 0.75;
      p.dataset.velocity = Math.max(
        Math.min(parseFloat(p.dataset.velocity ?? "0") * restitution, maxSpeed),
        -maxSpeed
      ).toString();
      let angle = parseFloat(p.dataset.angle ?? "0");
      let velocity = parseFloat(p.dataset.velocity ?? "0") / 5;
      if (p.dataset.down == "true")
        continue;
      {
        if (uiSink.puck.has(p.dataset.id) && velocity > 1) {
          let { vec } = uiSink.puck.get(p.dataset.id);
          uiSinkLastFrame.puck.set(p.dataset.id, {
            vec: [vec[0] + Math.cos(angle) * velocity, vec[1] + Math.sin(angle) * velocity]
          });
        }
      }
    }
  }, 1e3 / 60);
  const SIMPLE_MATH = {
    clamp(a, min, max) {
      return Math.min(Math.max(a, min), max);
    },
    clamp2(a, min, max) {
      return [this.clamp(a[0], min[0], max[0]), this.clamp(a[1], min[1], max[1])];
    }
  };
  function _SHADEUP_UI_PUCK(vec, radius = 10, invisible = false) {
    let id = uiSink.puckCounter++;
    uiSink.puck.set(id.toString(), {
      vec: [...vec]
    });
    addPuck(id.toString(), vec, radius, invisible);
    if (uiSinkLastFrame.puck.has(id.toString())) {
      return SIMPLE_MATH.clamp2(
        uiSinkLastFrame.puck.get(id.toString()).vec,
        [0, 0],
        [canvas.width, canvas.height]
      );
    } else {
      return [...vec];
    }
  }
  function addPuck(name, puck, radius = 10, invisible = false) {
    puck = [puck[0] / canvas.width, puck[1] / canvas.height];
    if (pucks[name]) {
      pucks[name].div.style.left = `calc(${puck[0] * 100}% - ${radius}px)`;
      pucks[name].div.style.top = `calc(${puck[1] * 100}% - ${radius}px)`;
      pucks[name].div.style.opacity = invisible ? "0" : "1";
      pucks[name].div.style.width = `${radius * 2}px`;
      pucks[name].div.style.height = `${radius * 2}px`;
      return;
    }
    let div = document.createElement("div");
    div.className = "puck";
    div.dataset.id = name;
    div.innerHTML = `<span><svg style="width: 10px" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path fill="#505050" d="M128 136c0-22.1-17.9-40-40-40L40 96C17.9 96 0 113.9 0 136l0 48c0 22.1 17.9 40 40 40H88c22.1 0 40-17.9 40-40l0-48zm0 192c0-22.1-17.9-40-40-40H40c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40H88c22.1 0 40-17.9 40-40V328zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V136c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM288 328c0-22.1-17.9-40-40-40H200c-22.1 0-40 17.9-40 40l0 48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V328zm32-192v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V136c0-22.1-17.9-40-40-40l-48 0c-22.1 0-40 17.9-40 40zM448 328c0-22.1-17.9-40-40-40H360c-22.1 0-40 17.9-40 40v48c0 22.1 17.9 40 40 40h48c22.1 0 40-17.9 40-40V328z"/></svg></span>`;
    div.style.width = `${radius * 2}px`;
    div.style.height = `${radius * 2}px`;
    div.style.opacity = invisible ? "0" : "1";
    uiContainer.appendChild(div);
    pucks[name] = {
      div,
      puck
    };
  }
  let hostChildren = [];
  let childrenCrumbs = [];
  let rootChild;
  let preFrameHandlers = [];
  let postFrameHandlers = [];
  function createImmediateModeUIElement(type, component, canHaveChildren = false) {
    let els = /* @__PURE__ */ new Map();
    function blankUISink2() {
      return {
        map: /* @__PURE__ */ new Map(),
        counter: 0
      };
    }
    let uiSink2 = blankUISink2();
    let uiSinkLastFrame2 = blankUISink2();
    preFrameHandlers.push(() => {
      uiSink2 = blankUISink2();
    });
    postFrameHandlers.push(() => {
      for (let name of els.keys()) {
        if (!uiSink2.map.has(name)) ;
      }
      uiSinkLastFrame2 = blankUISink2();
    });
    function invoke(value, options = {}) {
      let id = uiSink2.counter++;
      uiSink2.map.set(id.toString(), {
        value,
        options
      });
      addControl(
        id.toString(),
        {
          value,
          options
        },
        canHaveChildren
      );
      if (uiSinkLastFrame2.map.has(id.toString())) {
        return uiSinkLastFrame2.map.get(id.toString()).value;
      } else {
        return value;
      }
    }
    function addControl(name, v, canHaveChildren2 = false) {
      if (els.has(name)) {
        els.get(name).$set({
          value: v.value,
          ...v.options
        });
        return;
      }
      function setValue(v2) {
        uiSinkLastFrame2.map.set(name, {
          value: v2
        });
      }
      rootChild.children?.push({
        type: component,
        value: v.value,
        options: v.options,
        children: canHaveChildren2 ? [] : void 0,
        setValue,
        name: type
      });
      if (canHaveChildren2) {
        childrenCrumbs.push(rootChild);
        rootChild = rootChild.children[rootChild.children.length - 1];
      }
    }
    return invoke;
  }
  let slider = createImmediateModeUIElement("slider", Slider);
  let label = createImmediateModeUIElement("label", Label);
  let group = createImmediateModeUIElement("group", Group, true);
  let checkbox = createImmediateModeUIElement("checkbox", Checkbox);
  let textbox = createImmediateModeUIElement("textbox", Text);
  let combo = createImmediateModeUIElement("combo", Combo);
  let button = createImmediateModeUIElement("button", Button);
  function preFrame() {
    hostChildren = [];
    rootChild = {
      type: FloatingPanel,
      value: null,
      children: [],
      options: {},
      setValue: () => {
      },
      name: "root"
    };
    hostChildren.push(rootChild);
    childrenCrumbs = [rootChild];
    for (let handler of preFrameHandlers) {
      handler();
    }
    uiSink = blankUISink();
  }
  return {
    frame() {
      for (let name in pucks) {
        if (!uiSink.puck.has(name)) {
          pucks[name].div.remove();
          delete pucks[name];
        }
      }
      for (let post of postFrameHandlers) {
        post();
      }
      uiSinkLastFrame = blankUISink();
      host.$set({
        children: hostChildren
      });
    },
    preFrame,
    puck: _SHADEUP_UI_PUCK,
    slider,
    controls: {
      label,
      group,
      checkbox,
      textbox,
      combo,
      button,
      pop() {
        childrenCrumbs.pop();
        rootChild = childrenCrumbs[childrenCrumbs.length - 1];
      }
    }
  };
}

function initUI(canvas) {
  let { frame, puck, preFrame, slider, controls } = initPuck(canvas);
  return {
    frame() {
      frame();
    },
    preFrame() {
      preFrame();
    },
    puck,
    slider,
    controls
    // controls: host
  };
}

const addUIHook = (engine) => {
  let { frame: uiFrame, puck, slider, preFrame: uiPreFrame, controls } = initUI(engine.canvas);
  engine._SHADEUP_UI_PUCK = puck;
  engine._SHADEUP_UI_SLIDER = slider;
  engine._SHADEUP_UI_CONTROL = (name, ...args) => {
    return controls[name](...args);
  };
  return {
    beforeFrame() {
      uiPreFrame();
    },
    afterFrame() {
      uiFrame();
    }
  };
};

export { addUIHook };

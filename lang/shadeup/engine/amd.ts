import resolvePathname from 'resolve-pathname';
// AMD loader

// This is a very simple AMD loader that is only intended to be used in the
// context of the editor. It is not intended to be used in production.

export function globalDefine(name: string, deps: string[], callback: Function): void {
	if (typeof name !== 'string') {
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
			deps = ['require'];
		} else if (callback.length === 2) {
			deps = ['require', 'exports'];
		} else {
			deps = ['require', 'exports', 'module'];
		}
	}
	globalDefine.amd[name] = {
		deps: deps,
		callback: callback
	};
}

globalDefine.amd = {
	require: {
		deps: [],
		callback: function () {
			return globalRequire;
		}
	},
	exports: {
		deps: [],
		callback: function () {
			return {};
		}
	}
};

export function globalRequire(deps: string[]): any {
	let result = [];
	for (let i = 0; i < deps.length; i++) {
		let dep = deps[i];
		if (dep !== 'require' && dep !== 'exports' && dep !== 'module') {
			dep = resolvePathname(dep, '/');

			if (!(dep in globalDefine.amd)) {
				if (!dep.endsWith('.js')) {
					dep += '.js';
				}
			}
		}

		if (dep in globalDefine.amd) {
			let deps = globalDefine.amd[dep].deps;
			let depsResults = [];
			for (let d of deps) {
				depsResults.push(globalRequire([d])[0]);
			}

			let callback = globalDefine.amd[dep].callback;

			let exports = callback.apply(null, depsResults);
			if (deps.indexOf('exports') !== -1) {
				exports = depsResults[deps.indexOf('exports')];
			}
			result.push(exports);
		} else {
			throw new Error(`Cannot find module '${dep}'`);
		}
	}
	return result;
}

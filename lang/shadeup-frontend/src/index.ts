if (typeof process === 'undefined') {
	(global as any).process = { env: {} };
}

export { ShadeupEnvironment } from '../lib/environment/ShadeupEnvironment';

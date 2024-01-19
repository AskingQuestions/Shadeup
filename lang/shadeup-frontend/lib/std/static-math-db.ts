export const simpleFunctions = [
	['add', '+'],
	['sub', '-'],
	['div', '/'],
	['mul', '*'],
	['mod', '%'],
	['bitand', '&'],
	['bitor', '|'],
	['bitxor', '^'],
	['lshift', '<<'],
	['rshift', '>>']
];

export const singleFunctions = [
	['bitnot', (a) => `~${a}`],
	['negate', (a) => `-${a}`],
	['positive', 'Math.abs'],
	['abs', 'Math.abs'],
	['floor', 'Math.floor'],
	['ceil', 'Math.ceil'],
	['round', 'Math.round'],
	['sign', 'Math.sign'],
	['cos', 'Math.cos'],
	['sin', 'Math.sin'],
	['tan', 'Math.tan'],
	['acos', 'Math.acos'],
	['asin', 'Math.asin'],
	['atan', 'Math.atan'],
	['cosh', 'Math.cosh'],
	['sinh', 'Math.sinh'],
	['tanh', 'Math.tanh'],
	['acosh', 'Math.acosh'],
	['asinh', 'Math.asinh'],
	['atanh', 'Math.atanh'],
	['exp', 'Math.exp'],
	['log', 'Math.log'],
	['log2', 'Math.log2'],
	['log10', 'Math.log10'],
	['sqrt', 'Math.sqrt']
];

export const makeVectors = [
	['int', '|0'],
	['float', ''],
	['uint', '>>>0']
];

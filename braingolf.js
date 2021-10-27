const process = require('process');
const fs = require('fs');

const _safe = '!';
const _reverse = '~';
const _silent = '$';
const _greedy = '&';
const _modifiers = [_safe, _reverse, _silent, _greedy];
const _processInString = ['\\', '"'];

class BGMods {
	constructor() {
		this.reset();
	}

	add(m) { this[m] = true; }
	rem(m) { this[m] = false; }
	has(m) { return this[m]; }

	reset() {
		this[_safe] = false;
		this[_reverse] = false;
		this[_silent] = false;
		this[_greedy] = false;
	}

	toString() {
		return '['
			+ (this[_safe] ? _safe + ', ' : '')
			+ (this[_reverse] ? _reverse + ', ' : '')
			+ (this[_silent] ? _silent + ', ' : '')
			+ (this[_greedy] ? _greedy : '')
			+ ']';
	}
}

class BGStack {
	constructor(initialValue) {
		this.value = initialValue || [];
	}

	push(vals, start) {
		if (typeof(vals) === 'string') {
			let tmp = vals;
			vals = [];
			for (let i = 0; i < tmp.length; i++) {
				vals.push(tmp.charCodeAt(i));
			}
		} else if (typeof(vals) === "number") vals = [vals];
		else if (!Array.isArray(vals)) throw Error(`Can't add '${vals}' to stack! Value must be string, array, or number, but got ${typeof(vals)}`);

		if (start) this.value = vals.concat(this.value);
		else this.value = this.value.concat(vals);
	}

	pop(start, count) {
		let result = [];
		for (let i = 0; i < count; i++) {
			let v = start ? this.value.shift() : this.value.pop();
			result.push(v);
		}
		return result;
	}
	peek(start, count) {
		let result = [];
		for (let i = 0; i < count; i++) {
			let v = start ? this.value[i] : this.value[this.value.length-(i+1)];
			result.push(v);
		}
		return result;
	}

	give(vals) {
		let start = state.mods.has(_reverse);
		this.push(vals, start);
	}
	take(count = 1) {
		let start = state.mods.has(_reverse);
		let safe = state.mods.has(_safe);
		if (state.mods.has(_greedy)) count = this.value.length;
		return safe
			? this.peek(start, count)
			: this.pop(start, count);
	}
}

var state = {
	debug: false,
	debugIndent: 0,
	source: undefined,
	ip: 0,
	exit: false,
	stacks: [],
	sp: 0,
	mainStack: 0,
	loopStack: [],
	conditions: [],
	mods: new BGMods,
	resetMods: false,
	inString: false,
	string: '',
	escaped: false,
	advance: true,
	printOnExit: true,
};

var ops = {
	'\\': () => {
		if (!state.inString) return;
		state.resetMods = false;
		if (state.escaped) string += '\\';
		else state.escaped = true;
	},
	'#': (i) => {
		if (i + 1 >= state.source.length) return;
		let val = state.source.charCodeAt(i + 1);
		vprint(`Next char is ${state.source[i + 1]} (${val})`);
		state.stacks[state.sp].give(val);
		state.ip++;
	},
	'"': () => {
		state.resetMods = false;
		if (!state.inString) { vprint("Beginning string"); state.inString = true; }
		else if (state.escaped) string += '"';
		else {
			vprint("String complete:");
			vprint(state.string, 1);
			state.inString = false;
			state.stacks[state.sp].give(state.string);
			state.string = '';
			state.resetMods = true;
		}
	},
	'@': (i) => {
		let countArg = '', j = 1, count = 1;
		while (i + j < state.source.length && state.source[i + j].match(/[0-9]/)) {
			countArg += state.source[i + j];
			j++;
		}
		state.advance = false;
		state.ip = i + j;
		if (countArg.length > 0) {
			let count = parseInt(countArg);
			if (Number.isNaN(count)) throw Error(`Not a valid number! '${countArg}'`);
		}
		let vals = state.stacks[state.sp].take(undefined, count);
		let str = String.fromCharCode.apply(null, vals);
		print(str);
	},
	'_': () => {
		let val = state.stacks[state.sp].take();
		if (val.length > 1) val = `[${val}]\n`;
		else val = `${val[0]}`;
		print(val);
	},
	'=': () => {
		if (state.mods.has(_greedy)) {
			print(`[${state.stacks.map(s=>'['+s.value.join(',')+']').join(',\n')}]`)
		} else {
			print(`[${state.stacks[state.sp].value}]\n`);
		}
	},
	';': () => {
		state.resetMods = false;
		state.printOnExit = false;
	},
	'+': () => runOperator(2,
		() => {
			vprint('Niladic plus, pushing 20 to stack.');
			state.stacks[state.sp].give(20);
		},
		(a) => {
			vprint(`Monadic plus, doubling ${a}.`);
			state.stacks[state.sp].give(a + a);
		},
		(vals) => {
			let result = vals.reduce((a, b) => a + b);
			vprint(`Pushing ${vals.join(" + ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'-': () => runOperator(2,
		() => {
			vprint('Niladic minus, pushing -1 to stack.');
			state.stacks[state.sp].give(-1);
		},
		(a) => {
			vprint(`Monadic minus, subtracting ${a} from itself.`);
			state.stacks[state.sp].give(a - a);
		},
		(vals) => {
			let result = vals.reverse().reduce((a, b) => a - b);
			vprint(`Pushing ${vals.join(" - ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'*': () => runOperator(2,
		() => {
			vprint('Niladic multiply, pushing 1000 to stack.');
			state.stacks[state.sp].give(1000);
		},
		(a) => {
			vprint(`Monadic multiply, squaring ${a}.`);
			state.stacks[state.sp].give(a * a);
		},
		(vals) => {
			let result = vals.reduce((a, b) => a * b);
			vprint(`Pushing ${vals.join(" * ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'/': () => runOperator(2,
		() => {
			vprint('Niladic divide, pushing 5 to stack.');
			state.stacks[state.sp].give(5);
		},
		(a) => {
			vprint(`Monadic divide, dividing ${a} by itself.`);
			state.stacks[state.sp].give(a / a);
		},
		(vals) => {
			let result = vals.reverse().reduce((a, b) => Math.floor(a / b));
			vprint(`Pushing ${vals.join(" / ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'^': () => runOperator(2,
		() => {
			vprint('Niladic exponent, pushing 1000000 to stack.');
			state.stacks[state.sp].give(1000000);
		},
		(a) => {
			vprint(`Monadic exponent, raising ${a} by itself.`);
			state.stacks[state.sp].give(a ** a);
		},
		(vals) => {
			let result = vals.reverse().reduce((a, b) => Math.floor(a ** b));
			vprint(`Pushing ${vals.join(" ^ ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'%': () => runOperator(2,
		() => {
			vprint('Niladic modulus, pushing 100 to stack.');
			state.stacks[state.sp].give(100);
		},
		(a) => {
			vprint(`Monadic modulus, moduloing ${a} by itself.`);
			state.stacks[state.sp].give(a % a);
		},
		(vals) => {
			let result = vals.reverse().reduce((a, b) => Math.floor(a % b));
			vprint(`Pushing ${vals.join(" % ")} = ${result} to stack.`);
			state.stacks[state.sp].give(result);
		}
	),
	'>': () => {
		state.resetMods = false;
		let val = state.stacks[state.sp].take();
		vprint(`Moving ${val} to start of stack.`);
		state.stacks[state.sp].value.unshift(val);
	},
	'<': () => {
		state.resetMods = false;
		let val = state.stacks[state.sp].value.shift();
		vprint(`Moving ${val} to end of stack.`);
		state.stacks[state.sp].value.push(val);
	},
	'.': () => {
		state.mods.add(_safe);
		let val = state.stacks[state.sp].take();
		vprint(`Duplicating ${val} on stack.`);
		state.stacks[state.sp].give(val);
	},
	',': () => {
		let [a, b] = state.stacks[state.sp].take(2);
		if (a === undefined || b === undefined) {
			vprint('Less than 2 items on stack, ignoring operator.');
			return;
		}
		vprint(`Swapping ${a} and ${b}`);
		state.stacks[state.sp].give([a, b]);
	},
	'0': () => state.stacks[state.sp].give(0),
	'1': () => state.stacks[state.sp].give(1),
	'2': () => state.stacks[state.sp].give(2),
	'3': () => state.stacks[state.sp].give(3),
	'4': () => state.stacks[state.sp].give(4),
	'5': () => state.stacks[state.sp].give(5),
	'6': () => state.stacks[state.sp].give(6),
	'7': () => state.stacks[state.sp].give(7),
	'8': () => state.stacks[state.sp].give(8),
	'9': () => state.stacks[state.sp].give(9),
	'l': () => {
		let len = state.stacks[state.sp].value.length;
		vprint(`Pushing length of stack, ${len}, to stack.`);
		state.stacks[state.sp].give(len);
	},
	'd': () => runOperator(1,
		() => {
			vprint('Niladic digit separation, pushing 0 to stack.');
			state.stacks[state.sp].give(0);
		},
		null,
		(vals) => {
			state.stacks[state.sp].give(vals.map(v => {
				let digits = v.toString().split('');
				vprint(`Splitting ${v} into [${digits}]`);
				return digits.map(d => parseInt(d));
			}).reduce((a, b) => a.concat(b)));
		}
	),
	'D': () => {
		let stack = state.stacks[state.sp].value;
		let permutations = permute(stack).reverse().slice(1)
			.map(p => new BGStack(p));
		state.stacks = state.stacks.concat(permutations);
	},
	's': () => runOperator(1,
		null, null,
		(vals) => {
			state.stacks[state.sp].give(vals.map(v => {
				vprint(`Sign of ${v} is ${Math.sign(v)}.`);
				return Math.sign(v);
			}));
		}
	),
	'r': () => runOperator(1,
		null, null,
		(vals) => {
			state.stacks[state.sp].give(vals.map(v => {
				let rand = Math.floor(Math.random() * v);
				vprint(`Generated random number ${rand} between 0 and ${v}.`);
				return rand;
			}));
		}
	),
	'V': () => {
		let newStack = new BGStack();
		let reverse = state.mods.has(_reverse);
		let index = reverse ? 0 : state.stacks.length;
		if (reverse) {
			state.stacks = [newStack].concat(state.stacks);
			state.mainStack++;
		}
		else state.stacks.push(newStack);
		vprint(`Created new stack at index ${index}`);
		state.sp = index;
	},
	'v': () => {
		let reverse = state.mods.has(_reverse);
		let newIndex = state.sp + (reverse ? -1 : 1);
		if (newIndex < 0) newIndex = state.stacks.length - 1;
		if (newIndex >= state.stacks.length) newIndex = 0;
		vprint(`Switching to stack ${newIndex}`);
		state.sp = newIndex;
	},
	'c': () => {
		let greedy = state.mods.has(_greedy);
		if (!greedy) {
			if (state.sp === state.mainStack) {
				vprint('Already on main stack, no-op');
				return;
			}
			vprint(`Merging stack ${state.sp} into main stack`);
			let stack = state.stacks[state.sp].value;
			state.stacks.splice(state.sp, 1);
			if (state.sp < state.mainStack) state.mainStack--;
			state.stacks[state.mainStack].give(stack);
			state.sp = state.mainStack;
		} else {
			vprint('Merging all stacks into main stack');
			let mainStack = state.stacks[state.mainStack].value;
			let stacks = state.stacks.map((s, i) => (i !== state.mainStack) ? s.value : []).reduce((a, b) => a.concat(b));
			state.stacks = [new BGStack(mainStack.concat(stacks))];
			state.sp = state.mainStack = 0;
		}
	},
	'm': () => {
		state.mods.rem(_greedy);
		let val = state.stacks[state.sp].take(1);
		let newIndex = state.sp - 1;
		if (newIndex < 0) newIndex = state.stacks.length - 1;
		state.stacks[newIndex].give(val);
	},
	'M': () => {
		state.mods.rem(_greedy);
		let val = state.stacks[state.sp].take(1);
		let newIndex = state.sp + 1;
		if (newIndex >= state.stacks.length) newIndex = 0;
		state.stacks[newIndex].give(val);
	},
	'R': () => {
		state.resetMods = false;
		state.sp = state.mainStack;
	},
	'P': () => {
		let vals = state.stacks[state.sp].value.slice();
		let rev = vals.slice().reverse();
		vprint('Comparing');
		vprint(`[${vals}]`);
		vprint('and');
		vprint(`[${rev}]`);
		let result = (arrayEquals(vals, rev)) ? 1 : 0;
		vprint(`Pushing ${result} to stack.`);
		state.stacks[state.sp].give(result);
	},
	'p': () => runOperator(1,
		null, null,
		(vals) => {
			state.stacks[state.sp].give(vals.map(primeFactors)
				.reduce((a, b) => a.concat(b)));
		}
	),
	'u': () => {
		state.resetMods = false;
		let newStack = new BGStack();
		let stack = state.stacks[state.sp].value.slice();
		for (let i = 0; i < stack.length; i++) {
			if (stack.indexOf(stack[i]) < i) continue;
			newStack.give(stack[i]);
		}
		state.stacks[state.sp] = newStack;
	},
	'U': () => {
		state.mods.rem(_greedy);
		let vals = state.stacks[state.sp].take(2).filter(v => v !== undefined);
		let [a, b] = [0, 10];
		if (vals.length === 2) {
			[a, b] = vals;
		} else if (vals.length === 1) {
			[b] = vals;
		}

		state.stacks[state.sp].give(range(a, b));
	},
	'[': (i) => {
		state.resetMods = false;
		vprint(`Loop started at ${i}`);
		let j = 1, loopCount = 0;
		while (i + j < state.source.length) {
			let c = state.source[i + j];
			if (c === '[') {
				loopCount++;
			} else if (c === ']') {
				if (loopCount > 0) loopCount--;
				else {
					let loop = {
						start: i,
						end: i + j,
					};
					vprint(`Loop end found at ${i + j}`);
					state.loopStack.push(loop);
					break;
				}
			}
			j++;
		}
	},
	']': () => {
		state.resetMods = false;
		let first = state.stacks[state.sp].peek(true, 1);
		vprint(`Loop counter is ${first}`);
		if (first === undefined || first <= 0) {
			vprint(`Loop complete`);
			state.loopStack.pop();
		} else {
			vprint(`Looping`);
			let loop = state.loopStack[state.loopStack.length - 1];
			state.ip = loop.start;
		}
	},
	'?': (i) => {
		runConditional(i, () => {
			let [val] = state.stacks[state.sp].take();
			return val !== undefined && val > 0;
		});
	},
	'e': (i) => {
		runConditional(i, () => {
			let [a, b] = state.stacks[state.sp].take(2);
			return a !== undefined && b !== undefined && a == b;
		});
	},
	'E': (i) => {
		runConditional(i, () => {
			let stackIndexA = state.sp;
			let stackIndexB = state.sp + 1;
			if (stackIndexB >= state.stacks.length) stackIndexB = 0;
			if (stackIndexA === stackIndexB) return true;
			let stackA = state.stacks[stackIndexA].value.slice();
			let stackB = state.stacks[stackIndexB].value.slice();
			if (stackA.length !== stackB.length) return false;
			for (let j = 0; j < stackA.length; j++) {
				if (stackA[j] !== stackB[j]) return false;
			}
			return true;
		});
	},
	':': (i) => {
		let [cond] = state.conditions.filter(c => c.else === i);
		if (cond === undefined) return;
		vprint('Found else');
		if (cond.result) {
			vprint('Condition was true, skipping else clause');
			state.ip = cond.end;
		}
	}
};

function runOperator(count, nilad, monad, polyad) {
	let vals = state.stacks[state.sp].take(count).filter(n => n !== undefined);
	if (nilad && !state.mods.has(_greedy) && vals.length === 0) nilad();
	else if (monad && !state.mods.has(_greedy) && vals.length === 1) monad(vals[0]);
	else polyad(vals);
}

function runConditional(i, condition) {
	let elsePos, endPos;
	let j = 1, condCount = 0;
	while (i + j < state.source.length) {
		let c = state.source[i + j];
		if (c === '?' || c === 'e' || c === 'E') {
			condCount++;
		} else if (c === '|') {
			if (condCount > 0) condCount--;
			else {
				endPos = i + j;
				break;
			}
		} else if (c === ':' && condCount === 0) {
			elsePos = i + j;
		}
		j++;
	}

	let cond = {
		start: i,
		else: (elsePos !== undefined) ? elsePos : undefined,
		end: endPos,
		result: condition()
	};
	state.conditions.push(cond);

	vprint(`Condition starts at ${i}`
		+ ((cond.else !== undefined) ? `, has else at ${cond.else}` : '')
		+ ` and ends at ${cond.end}`);
	vprint(`Condition is ${cond.result}`
		+ (!cond.result ? `, skipping to ${(cond.else !== undefined ? 'else' : 'end')}` : ''));

	if (!cond.result) {
		state.ip = cond.else !== undefined ? cond.else : cond.end;
	}
}

function vprint(str, extraIndent = 0, prefix = true) {
	if (!state.debug) return;
	if (str === undefined) str = '';
	process.stderr.write((prefix ? '[DBG]> ' : '')
		+ '    '.repeat(state.debugIndent + extraIndent)
		+ `${str}\n`
	);
}
function print(str) {
	if (state.resetMods && state.mods.has(_silent)) return;
	process.stdout.write(str);
}

function arrayEquals(a, b) {
	if (a.length !== b.length) return false;
	for (let i = 0; i < a.length; i++) {
		if (a[i] !== b[i]) return false;
	}
	return true;
}

function range(from, to) {
    return [...Array(to - from).keys()].map(i => i + from);
}

function primeFactors(n) {
	let i = 2;
	let factors = [];
	while (i * i <= n) {
		if (n % i) i++;
		else {
			n = Math.floor(n / i);
			factors.push(i);
		}
	}
	if (n > 1) factors.push(n);
	return factors;
}

function permute(permutation) {
	var length = permutation.length,
		result = [permutation.slice()],
		c = new Array(length).fill(0),
		i = 1, k, p;
  
	while (i < length) {
		if (c[i] < i) {
			k = i % 2 && c[i];
			p = permutation[i];
			permutation[i] = permutation[k];
			permutation[k] = p;
			++c[i];
			i = 1;
			result.push(permutation.slice());
		} else {
			c[i] = 0;
			++i;
		}
	}
	return result;
}

function parse() {
	vprint("Running...");
	vprint("Source:");
	vprint(`\n${state.source}\n`, 0, false);
	vprint(`Initial stack count: ${state.stacks.length}`);
	vprint();

	while (!state.exit) {
		let c = state.source[state.ip];
		state.debugIndent = 0;
		vprint(`IP: ${state.ip}, c: ${c} (${c.charCodeAt(0)})`);
		state.debugIndent = 1;
		parseChar(c);
		
		vprint(`Stack is [${state.stacks[state.sp].value}]`)
		if (state.ip < 0 || state.ip >= state.source.length) state.exit = true;
	}
	
	state.debugIndent = 0;
	if (state.printOnExit && state.stacks[state.sp].value.length > 0) {
		state.mods.reset();
		let last = state.stacks[state.sp].take().toString();
		vprint(`Last value is '${last}'`);
		print(last);
	} else {
		vprint('Print on exit disabled');
	}
	print('\n');
	vprint("Execution complete!");
}

function parseChar(c) {
	state.advance = true;
	state.resetMods = false;

	if (state.inString && !_processInString.includes(c)) {
		state.string += c;
	} else if (_modifiers.includes(c)) {
		vprint(`Adding modifier ${c}`);
		state.mods.add(c);
		vprint(`Modifiers: [${state.mods}]`);
	} else {
		state.resetMods = true;
		runChar(c, state.ip);
	}

	if (state.resetMods) {
		state.mods.reset();
	}

	if (state.advance) state.ip++;
}

function runChar(c, i) {
	op = ops[c];
	if (op !== undefined) op(i);
}

function parseArgs(args) {
	let stackCount = 3;
	let inputArgs = [];

	for (let arg of args) {
		switch (arg.substring(0, 2)) {
			case '-v':
				state.debug = true;
				break;
			case '-s':
				stackCount = parseInt(arg.substring(2));
				if (Number.isNaN(stackCount)) throw Error(`Invalid stack count: '${arg.substring(2)}'`);
				break;
			default:
				inputArgs.push(arg);
				break;
		}
	}

	while (state.stacks.length < stackCount) state.stacks.push(new BGStack());

	let inputStack = 0;
	for (let arg of inputArgs) {
		if (arg.match(/^[0-9 ]+$/)) {
			let vals = arg.split(' ').filter(a => a.length).map(a => parseInt(a));
			state.stacks[inputStack++].give(vals);
		} else {
			let vals = arg.split('').filter(a => a.length).map(a => a.charCodeAt(0));
			state.stacks[inputStack++].give(vals);
		}
	}
}

var source = `

`;
source = source.substring(1, source.length - 1);

function usageError() {
	throw Error(`Invalid Args!
Correct usage:
	${process.argv[1]} <filename> [options] - Runs braingolf code contained in <filename>
	${process.argv[1]} -i <code> [options]  - Runs braingolf code directly from the command-line
Options:
	-v	verbose, prints additional debug output as the interpreter runs
	-s#	stacks, begins execution with # stacks. Defaults to 3 if not provided`);
	process.exit(1);
}

if (process.argv.length < 3 && source.length === 0) {
	usageError();
}

if (process.argv.length >= 3) {
	if (process.argv[2] === "-f") {
		if (process.argv.length < 4) usageError();
		let fileName = process.argv[3];
		source = fs.readFileSync(fileName, 'utf-8');
		parseArgs(process.argv.slice(4));
	} else if (process.argv[2] === "-i") {
		source = process.argv[3];
		parseArgs(process.argv.slice(4));
	} else if (source.length === 0) {
		source = undefined;
	} else {
		parseArgs(process.argv.slice(2));
	}

	if (source === undefined) {
		throw Error(`Could not read source!`);
	}
} else {
	parseArgs([]);
}

state.source = source;
parse(source);

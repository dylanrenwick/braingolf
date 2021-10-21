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
		this.value = [];
	}

	add(m) { if (!this.has(m)) this.value.push(m); }
	reset() { this.value = []; }
	has(m) { return this.value.includes(m); }
}

class BGStack {
	constructor(initialValue) {
		this.value = initialValue || [];
	}

	push(vals, end = true) {
		if (typeof(vals) === 'string') {
			let tmp = vals;
			vals = [];
			for (let i = 0; i < tmp.length; i++) {
				vals.push(tmp.charCodeAt(i));
			}
		} else if (typeof(vals) === "number") vals = [vals];
		else throw Error(`Can't add '${vals}' to stack!`);

		if (end) this.value = this.value.concat(vals);
		else this.value = vals.concat(this.value);
	}

	pop(def, end = true, count = 1) {
		let result = [];
		for (let i = 0; i < count; i++) {
			let v = end ? this.value.pop() : this.value.shift();
			result.push((v !== undefined) ? v : def);
		}
		return result;
	}
	peek(def, end = true, count = 1) {
		let result = [];
		for (let i = 0; i < count; i++) {
			let v = end ? this.value[this.value.length-(i+1)] : this.value[i];
			result.push((v !== undefined) ? v : def);
		}
		return result;
	}

	give(vals) {
		let end = state.mods.has(_reverse);
		this.push(vals, end);
	}
	take(def, count = 1) {
		let end = state.mods.has(_reverse);
		let safe = state.mods.has(_safe);
		if (state.mods.has(_greedy)) count = this.value.length;
		return safe
			? this.peek(def, end, count)
			: this.pop(def, end, count);
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
		let countArg = '', j = 1;
		while (i + j < state.source.length && state.source[i + j].match(/[0-9]/)) {
			countArg += state.source[i + j];
			j++;
		}
		state.advance = false;
		state.ip = i + j;
		if (countArg.length > 0) {
			let count = parseInt(countArg);
			if (Number.isNaN(count)) throw Error(`Not a valid number! '${countArg}'`);
		} else count = 1;
		let vals = state.stacks[state.sp].take(undefined, count);
		let str = String.fromCharCode.apply(null, vals);
		print(str);
	},
	'=': () => {
		print(`[${state.stacks[state.sp].value}]\n`);
	},
	';': () => {
		state.printOnExit = false;
	}
};

function vprint(str, extraIndent = 0, prefix = true) {
	if (!state.debug) return;
	if (str === undefined) str = '';
	process.stderr.write((prefix ? '[DBG]> ' : '')
		+ '    '.repeat(state.debugIndent + extraIndent)
		+ `${str}\n`
	);
}
function print(str) {
	process.stdout.write(str);
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
		
		if (state.ip < 0 || state.ip >= state.source.length) state.exit = true;
	}
	
	if (state.printOnExit && state.stacks[state.sp].value.length > 0) {
		print(state.stacks[state.sp].pop());
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
		vprint(`Modifiers: [${state.mods.value}]`);
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

	for (let arg of args) {
		switch (arg.substring(0, 2)) {
			case '-v':
				state.debug = true;
				break;
			case '-s':
				stackCount = parseInt(arg.substring(2));
				if (Number.isNaN(stackCount)) throw Error(`Invalid stack count: '${arg.substring(2)}'`);
				break;
		}
	}

	while (state.stacks.length < stackCount) state.stacks.push(new BGStack());
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
	if (process.argv[2] === "-i") {
		if (process.argv.length < 4) usageError();
		let fileName = process.argv[3];
		source = fs.readFileSync(fileName);
		parseArgs(process.argv.slice(4));
	} else if (source.length === 0) {
		source = process.argv[2];
		parseArgs(process.argv.slice(3));
	} else {
		parseArgs(process.argv.slice(2));
	}

	if (source === undefined) {
		throw Error(`Could not read source!`);
	}
}

state.source = source;
parse(source);

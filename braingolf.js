class codeStream {
	constructor(code) {
		this.code = code;
		this.index = 0;
	}

	next() {
		return this.code[this.index++];
	}

	peek() {
		return this.code[this.index + 1];
	}

	seek(i) {
		this.index = i;
	}

	end() {
		return this.index == this.code.length;
	}
}

var symbols = {
	'+': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'sum' },
			{ action: 'push' }
		];

		return ast;
	},
	'-': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'sub' },
			{ action: 'push' }
		];

		return ast;
	},
	'/': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'div' },
			{ action: 'push' }
		];

		return ast;
	},
	'*': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'mul' },
			{ action: 'push' }
		];

		return ast;
	},
	'%': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'mod' },
			{ action: 'push' }
		];

		return ast;
	},
	'_': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'print' },
		];

		return ast;
	},
	'_': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'print' },
		];

		return ast;
	},
	'=': function(stream) {
		var ast = [
			{ action: 'pop', reverse: false, safe: true, arg: 'all' },
			{ action: 'printlist' }
		];

		return ast;
	},
	'@': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');
		var count = 1;

		if (!greedy && !isNaN(stream.peek())) {
			var numStr = '';
			while (!isNaN(stream.peek())) {
				numStr += stream.next();
			}

			count = parseInt(numStr);
		}

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : count) },
			{ action: 'printtext' }
		];

		return ast;
	},
	';': function(stream) {
		var ast = [
			{ action: 'preventout' }
		];

		return ast;
	},
	'<': function(stream) {
		var ast = [
			{ action: 'shift', dir: 'left' }
		];

		return ast;
	},
	'>': function(stream) {
		var ast = [
			{ action: 'shift', dir: 'right' }
		];

		return ast;
	},
	'.': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: true, arg: 1 },
			{ action: 'push' }
		];

		return ast;
	},
	',': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: false, arg: (greedy ? 'all' : 2) },
			{ action: 'flip' },
			{ action: 'push' }
		];

		return ast;
	},
	'#': function(stream, modifierStr = '') {
		var ast = [
			{ action: 'create', value: stream.next().charCodeAt(0) },
			{ action: 'push' }
		];

		return ast;
	},
	'"': function(stream, modifierStr = '') {
		var ast = [];
		while (stream.peek() !== '"') {
			ast.push({ action: 'create', value: stream.next().charCodeAt(0) });
		}
		stream.next();

		ast.push({ action: 'push' });

		return ast;
	},
	'0': () => [{ action: 'create', value: 0 },{ action: 'push' }],
	'1': () => [{ action: 'create', value: 1 },{ action: 'push' }],
	'2': () => [{ action: 'create', value: 2 },{ action: 'push' }],
	'3': () => [{ action: 'create', value: 3 },{ action: 'push' }],
	'4': () => [{ action: 'create', value: 4 },{ action: 'push' }],
	'5': () => [{ action: 'create', value: 5 },{ action: 'push' }],
	'6': () => [{ action: 'create', value: 6 },{ action: 'push' }],
	'7': () => [{ action: 'create', value: 7 },{ action: 'push' }],
	'8': () => [{ action: 'create', value: 8 },{ action: 'push' }],
	'9': () => [{ action: 'create', value: 9 },{ action: 'push' }],
	'l': function(stream) {
		var ast = [
			{ action: 'count' },
			{ action: 'push' }
		];

		return ast;
	},
	'd': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 1) },
			{ action: 'split' },
			{ action: 'push' }
		];

		return ast;
	},
	's': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 1) },
			{ action: 'sign' },
			{ action: 'push' }
		];

		return ast;
	},
	'g': function(stream, modifierStr = '') {
		var reverse = modifierStr.includes('~');
		var safe = modifierStr.includes('!');
		var greedy = modifierStr.includes('&');

		var ast = [
			{ action: 'pop', reverse: reverse, safe: safe, arg: (greedy ? 'all' : 2) },
			{ action: 'concat' },
			{ action: 'push' }
		];

		return ast;
	}
};

function astFromSymbol(symbol, stream) {
	if (opts.verbose) console.log('Parsing ' + symbol);
	if (symbols[symbol]) {
		return symbols[symbol](stream);
	}
}

function parse(code) {
	if (opts.verbose) console.log(code);
	var stream = new codeStream(code);
	var ast = [];

	if (opts.verbose) console.log('Beginning Parse');
	while(!stream.end()) {
		var symbolAst = astFromSymbol(stream.next(), stream);
		ast = ast.concat(symbolAst);
	}

	if (opts.verbose) console.log('\nResulting AST is: \n');
	return ast;
}

function formatAst(ast) {
	var astStr = '';

	for(var i = 0; i < ast.length; i++) {
		astStr += ast[i].action.toUpperCase();
		switch(ast[i].action) {
			case 'pop':
				astStr += ' ' + (ast[i].reverse ? '1' : '0');
				astStr += ' ' + (ast[i].safe ? '1' : '0' );
				astStr += ' ' + ast[i].arg;
				break;
			case 'create':
				astStr += ' ' + ast[i].value;
				break;
			case 'shift':
				astStr += ' ' + (ast[i].dir == 'left' ? '0' : '1');
				break;
			default:
				break;

		}
		astStr += '\n';
	}

	return astStr;
}

function runBSM(code) {
	var lines = code.split('\n');

	var output = true;
	var stacks = [[]];
	var index = 0;
	var workplace = [];

	for(var i = 0; i < lines.length; i++) {
		if (lines[i] == '') continue;
		var parts = lines[i].split(' ');
		switch(parts[0].toLowerCase()) {
			case 'preventout':
				output = false;
				break;
			case 'pop':
				if (parts[3] == 'all') {
					workplace = stacks[index];
					if (parts[2] == 0) stacks[index] = [];
				} else {
					if (parts[1] == 1) stacks[index].reverse();
					for(var j = 0; j < parts[3]; j++) {
						if (parts[2] == 0) {
							workplace.push(stacks[index].pop());
						} else {
							workplace.push(stacks[index][stacks[index].length - (1 + j)]);
						}
					}
					if (parts[1] == 1) stacks[index].reverse();
				}
				break;
			case 'push':
				stacks[index] = stacks[index].concat(workplace);
				workplace = [];
				break;
			case 'create':
				workplace.push(parseInt(parts[1]));
				break;
			case 'sum':
				if (workplace.length > 0) workplace = workplace.reduce((a,b) => a + b);
				else workplace.push(20);
				break;
			case 'sub':
				if (workplace.length > 0) workplace = workplace.reduce((a,b) => a - b);
				else workplace.push(20);
				break;
			case 'div':
				if (workplace.length > 0) workplace = workplace.reduce((a,b) => a / b);
				else workplace.push(20);
				break;
			case 'mul':
				if (workplace.length > 0) workplace = workplace.reduce((a,b) => a * b);
				else workplace.push(20);
				break;
			case 'mod':
				if (workplace.length > 0) workplace = workplace.reduce((a,b) => a % b);
				else workplace.push(20);
				break;
			case 'print':
				console.log(workplace.join(''));
				break;
			case 'printlist':
				console.log('['+workplace.join(', ')+']');
				break;
			case 'printtext':
				console.log(workplace.map(a=>String.fromCharCode(a)).join(''));
				break;
			case 'flip':
				workplace.reverse();
				break;
			case 'shift':
				if (parts[1] == 1) stacks[index] = stacks[index].slice(1).push(stacks[index][0]);
				else stacks[index] = [stacks[index][stacks[index].length - 1]].concat(stacks[index].slice(0, stacks[index].length - 2));
				break;
			case 'concat':
				workplace = [workplace.join('')];
				break;
			default:
				console.log('ERROR: Unrecognized symbol ' + parts[0] + ' at line ' + (i + 1));
				return;
		}
	}

	if (output) {
		console.log(stacks[index][stacks[index].length - 1]);
	}
}

function processArgs() {
	var verbose = false;
	var type = 'full';

	var flags = process.argv[2];
	if (flags.includes('v')) verbose = true;
	if (flags.includes('m')) type = 'bsm';
	if (flags.includes('x')) type = 'transpile';

	return { verbose: verbose, type: type };
}

if (process.argv[2][0] == '-') {
	var opts = processArgs();
	var code = process.argv[3];
} else {
	var opts = { verbose: false, type: 'full' };
	var code = process.argv[2];
}

if (opts.type == 'transpile') {
	console.log(formatAst(parse(code)));
} else if (opts.type == 'bsm') {
	runBSM(code);
} else if (opts.type == 'full') {
	var bsm = formatAst(parse(code));
	runBSM(bsm);
}

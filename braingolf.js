var newCon = (function(oldCon) {
    return {
        log: function(text, mods) {
            if (!mods['$']) {
                process.stdout.write(text.toString());
            }
        },
        info: oldCon.info,
        warn: oldCon.warn,
        error: oldCon.error
    };
}(console));

var ip = 0;
var stacks = [[]];
var currStack = 0;
var end = false;

function streamReader(str) {
    this.stream = str;
    this.eof = function() {
        return ip == this.stream.length;
    }
    this.next = function() {
        var nxt = this.stream[ip++];
        if (program.verbose) console.log('  Reading ' + nxt + ' from code');
        return nxt;
    }
    this.peek = function() {
        return this.stream[ip];
    }
}

function tokenStream(streamRead) {
    this.stream = streamRead;
    this.eof = function() { return this.stream.eof(); }
    this.next = function() {
        if (this.cache === '') {
            this.cache = this.peek();
        }
        ret = this.cache;
        this.cache = '';
        if (program.verbose) console.log('  Reading ' + ret + ' from stream');
        return ret;
    }
    this.cache = '';
    this.peek = function() {
        if (this.cache === '') {
            token = this.stream.next();
            if (program.verbose) console.log('    Token starting at ' + token);
            if (modifiers.includes(token)) {
                if (program.verbose) console.log('    Token start is modifier');
                while (this.stream.peek() in modifiers) {
                    token += this.stream.next();
                    if (program.verbose) console.log('    Next char ' + token[token.length - 1] + ' is modifier');
                }
                token += this.stream.next();
            } else if (token === '#') {
                token += this.stream.next();
            } else if (token === '"') {
                while (!this.eof()) {
                    if (this.stream.peek() === '"' && token[token.length - 1] !== "\\") {
                        break;
                    } else {
                        token += this.stream.next();
                    }
                }
                this.stream.next();
            }
            this.cache = token;
            return token;
        } else {
            return this.cache;
        }
    }
}

function getValue(stack, mods) {
    if (mods['!']) {
        return stack[stack.length-1];
    } else {
        return stack.pop();
    }
}

function getValues(stack, mods, amt) {
    values = [];
    while(amt--) {
        if (stack.length > 0) {
            values.push(getValue(stack, mods));
        } else {
            values.push(values[values.length - 1]);
        }
    }
    return values.reverse();
}

function getValuesOrGreedy(stack, mods, amt) {
    if (mods['&']) {
        values = stack.slice(0);
        if (!mods['!']) stack.length = 0;
        return values;
    } else {
        return getValues(stack, mods, amt);
    }
}

function operatorReduce(stack, mods, operator) {
    var vals = getValuesOrGreedy(stack, mods, 2);
    stack.push(vals.reduce(operator));
}

function pushString(stack, string) {
    for(i = 0; i < string.length; i++) {
        stack.push(string.charCodeAt(i));
    }
}

var modifiers = ['&', '$', '!', '~'];
var operators = {
    '+': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return a + b; }); },
    '-': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return a - b; }); },
    '*': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return a * b; }); },
    '/': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return Math.floor(a / b); }); },
    '^': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return Math.pow(a, b); }); },
    '%': function(stack, mods) { operatorReduce(stack, mods, function(a, b) { return a % b; }); },
    '=': function(stack, mods) { newCon.log(JSON.stringify(stack) + "\n", mods); },
    '_': function(stack, mods) { newCon.log(getValue(stack, mods), mods); },
    '@': function(stack, mods) { var strArr = getValuesOrGreedy(stack, mods, 1); var str = ''; for(i = 0; i < strArr.length; i++) { str += String.fromCharCode(strArr[i] % 1114111); } newCon.log(str, mods); },
    ';': function(stack, mods) { end = true; },
    '#': function(stack, mods) { stack.push(arguments[2]); },
    '"': function(stack, mods) { pushString(stack, arguments[2]); },
    ',': function(stack, mods) { var x = stack[stack.length - 1], y = stack[stack.length - 2]; stack[stack.length - 2] = x; stack[stack.length - 1] = y; },
    '.': function(stack, mods) { stack.push(stack[stack.length - 1]); },
    '<': function(stack, mods) { stack.push(stack.shift()); },
    '>': function(stack, mods) { stack.unshift(stack.pop()); },
    'l': function(stack, mods) { stack.push(stack.length); },
    's': function(stack, mods) { var arr = getValuesOrGreedy(stack, mods, 1); arr.forEach(function(x) { stack.push(x > 0 ? 1 : (x < 0 ? -1 : 0)); }); },
    'r': function(stack, mods) { var val = getValue(stack, mods); stack.push(Math.random() * val); },
    'H': function(stack, mods) { var str = getValuesOrGreedy(stack, mods, stack.length).join(''); if (program.verbose) { console.log("    Comparing " + str + " with " + stack.reverse().join('')); stack.reverse(); } stack.push(str === stack.reverse().join('') ? 1 : 0); },
    '[': function(stack, mods) {  }

};

function beginLoop(stack, mods) {
    
}

function parseTok(tok) {
    if (program.verbose) console.log('Parsing: ' + tok);
    mods = [];
    for(i = 0; i < modifiers.length; i++) {
        mods[modifiers[i]] = tok.includes(modifiers[i]);
    }
    operator = '#"'.includes(tok[0])?tok[0]:tok[tok.length - 1];
    if (operator in operators) {
        if ('#"'.includes(operator)) {
            operators[operator](stacks[currStack], mods, operator === '#'?tok[1].charCodeAt(0):tok.slice(1));
        } else {
            operators[operator](stacks[currStack], mods);
        }
    } else if ('0123456789'.includes(operator)) {
        stacks[currStack].push(parseInt(operator));
    }
}

function parse(tokStream) {
    while(!tokStream.eof()) {
        parseTok(tokStream.next());
    }
    if (stacks[currStack].length > 0 && !end) {
        console.log(stacks[currStack][stacks[currStack].length - 1]);
    }
}

var program = require('commander');

function readFile(val) {
    fs = require('fs');
    if (fs.existsSync(val)) {
        return fs.readFileSync(val, 'utf8');
    } else {
        return '';
    }
}

program
    .version('Braingolf v1.0.0')
    .option('-c, --code <n>', 'The code to execute')
    .option('-f, --file <n>', 'A file containing the code to execute', readFile) 
    .option('-v, --verbose', 'Display debug info during execution')
    .option('-t, --transpile', 'Transpile code between braingolf and brainbose')
    .option('-b, --brainbose', 'Parse code as brainbose, instead of braingolf')
    .parse(process.argv);

var verbose = program.verbose;
var transpile = program.transpile;
var brainbose = program.brainbose;
var code = (!program.file || program.file === '')?program.code:program.file;

if (!code) {
    console.log('Please provide valid braingolf code!');
    console.log(code);
    process.exit();
}
if (program.verbose) console.log('Parsing verbosely');
parse(new tokenStream(new streamReader(code)));

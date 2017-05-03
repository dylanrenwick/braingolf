# BrainGolf

## Examples

### Hello World

Download `hello-world.bg` and run the following:

    python3 braingolf.py -f hello-world.bg

Or run it directly from the command line:

    python3 braingolf.py -c "Hello World"@11

**More examples coming soon(ish)**

## How to use

**Coming soon(ish)**

Braingolf is a simple, symbol-based language.

Every symbol in Braingolf is either an operator, a modifier, or a literal.

### The basics

Braingolf only accepts input from the command line, it cannot accept additional input at runtime.

Braingolf will, by default, output the final element of the stack when the program terminates, unless the stack is empty upon termination.

Operators:

    +,-,/,*,^,%  - Pops the last 2 elements from the stack and applies the corresponding operator to them, adding it to the end of the stack
    _            - Pops the last element from the stack and prints it
    =            - Prints the stack in full
    @            - Pops the last element of the stack, and attempts to parse it as a charcode to a char, printing the char
    ;            - Prevents the program from outputting the end of the stack upon termination
    <            - Rotates the stack 1 index to the left (takes the first element and moves it to the end of the stack)
    >            - Rotates the stack 1 index to the right (takes the final element and moves it to the start of the stack)
    
Modifiers:

    !            - "Safe" - Prevents the next operator from consuming data from the stack (it may still read, but will not pop)
    ~            - "Reverse" - Causes the next operator to read/pop from the beginning of the stack, rather than the end
    ,            - "Flip" - Causes the next diadic operator to swap it's 2 values. (Eg 2 / 4 becomes 4 / 2)
    $            - "Silent" - Prevents the next operator from outputting to the console
    #            - Adds the charcode of the next char to the end of the stack
    "            - Causes all following characters to be treated as character literals (as though preceeded by the `#` operator) until another `"` is found

Flow Control:

    ?            - Begins an if block. Will skip all code after this character until the next : or | characters if the last item of the stack is <= 0
    :            - Begins an else block. Will skip all code after this character until the next | character if the previous if block was run (ie the last item was > 0)
    |            - Ends an if or else block
    [            - Begins a while loop. Will repeat all code after this character until the next ] character while the first item of the stack is > 0
    ]            - Ends a while loop

Literals:
    
    0-9          - Treated as one digit literals, added directly to the end of the stack
    #char        - Treated as one char literal, see # modifier
    "text"       - Treated as multi-char literal, see " modifier

Exceptions:

    0-9 will not be treated as literals if placed directly after the @ operator, in which case they will be parsed to a number, and the @ will pop and print that many characters




# BrainGolf

## Examples

### Hello World

Download `hello-world.bg` and run the following:

    python3 braingolf.py -f hello-world.bg

**More examples coming soon(ish)**

## How to use

**Coming soon(ish)**

Braingolf is a simple, symbol-based language.

Every symbol in Braingolf is either an operator, a modifier, or a literal.

### The basics

Braingolf only accepts input from the command line, it cannot accept additional input at runtime.

Braingolf will, by default, output the final element of the stack when the program terminates

Basic operators:

    +,-,/,*,^    - Pops the last 2 elements from the stack and applies the corresponding operator to them, both printing the output and adding it to the end of the stack
    _            - Pops the last element from the stack and prints it
    =            - Prints the stack in full
    #            - Adds the charcode of the next char to the end of the stack
    @            - Pops the last element of the stack, and attempts to parse it as a charcode to a char, printing the char
    ;            - Prevents the program from outputting the end of the stack upon termination
    <            - Rotates the stack 1 index to the left (takes the first element and moves it to the end of the stack)
    >            - Rotates the stack 1 index to the right (takes the final element and moves it to the start of the stack)
    
Basic modifiers:

    !            - Prevents the next operator from consuming data from the stack (it may still read, but will not pop)
    ~            - Causes the next operator to read/pop from the beginning of the stack, rather than the end
    "            - Causes all following characters to be treated as character literals (as though preceeded by the `#` operator) until another `"` is found

Literals:
    
    0-9          - Treated as one digit literals, added directly to the end of the stack
    #char        - Treated as one char literal, see # operator
    "text"       - Treated as multi-char literal, see " modifier

Exceptions:

    0-9 will not be treated as literals if placed directly after the @ operator, in which case they will be parsed to a number, and the @ will pop and print that many characters




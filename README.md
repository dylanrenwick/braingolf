# Braingolf

## Examples

### Hello World

Download `hello-world.bg` and run the following:

    python3 braingolf.py -f hello-world.bg

Or run it directly from the command line:

    python3 braingolf.py -c "Hello World"&@

**More examples coming soon(ish)**

## How to use

Braingolf is a simple, symbol-based language.

Every symbol in Braingolf is either an operator, a modifier, or a literal.

### The basics

Braingolf only accepts input from the command line, it cannot accept additional input at runtime.

Braingolf will, by default, output the final element of the stack when the program terminates, unless the stack is empty upon termination.

Operators:

    +            - Pops the last 2 elements from the stack and pushes the sum to the stack
    -            - Pops the last 2 elements from the stack and pushes a - b (sub) where a is the 2nd to last item and b is the last
    /            - Pops the last 2 elements from the stack and pushes a // b (floordiv) where a is the 2nd to last item and b is the last
    *            - Pops the last 2 elements from the stack and pushes a * b (mul) to the stack
    %            - Pops the last 2 elements from the stack and pushes a % b (mod) where a is the 2nd to last item and b is the last
    ^            - Pops the last 2 elements from the stack and pushes a ^ b (pow) where a is the 2nd to last item and b is the last
    _            - Pops the last element from the stack and prints it
    =            - Prints the stack in full
    @            - Pops the last element of the stack, and attempts to parse it as a charcode to a char, printing the char
    ;            - Prevents the program from outputting the end of the stack upon termination
    <            - Rotates the stack 1 index to the left (takes the first element and moves it to the end of the stack)
    >            - Rotates the stack 1 index to the right (takes the final element and moves it to the start of the stack)
    .            - Duplicates the last element in the stack
    ,            - Switches the position of the last 2 elements in the stack, does nothing if stack length < 2

Functions are essentially fancy operators that do slightly more complex things, but I like to give them a different name so they can be special snowflakes

Functions:

    l            - Pushes the length of the stack to the end of the stack.
                   This will push the length of the stack *before* the length has been pushed
                   Meaning, for example with a stack of [4,5,6], l will push 3 to the end of the stack
    d            - Pops the last element of the stack, splits it into it's individual digits, and pushes each digit back to the stack
    D            - Pops the stack, creates a stack for every permuation of the popped stack
    s            - Pops the last element of the stack, pushes 1 if the element is positive, -1 if it's negative, and 0 if it's 0
    r            - Pops the last element of the stack and pushes a random number between 0 and the popped element. Pushes 0 if stack is empty
    V            - Creates a new stack and switches to it
    v            - Switches to the next stack in the list, can be used with the ~ modifier to switch to the previous stack. Wraps.
    c            - Collapses the current stack into the master-stack (the 0th stack) by appending the contents of the current stack to it
                   then removing the current stack. The master-stack (the 0th stack) cannot be collapsed, calling c when on the master-stack
                   will have no effect.
    M            - Pop the last element of the current stack and push it to the next stack
    m            - Pop the last element of the current stack and push it to the previous stack
    R            - Switch to the master-stack (the 0th stack)
    P            - Pop the last element of the current stack, push 1 if it is palindromic, and 0 otherwise
    p            - Pop the last element of the current stack and push its prime factors
    u            - Keep only the first occurance of each unique element in the current stack
    X            - Push the largest element in the stack to the stack
    x            - Push the smallest element in the stack to the stack
    T            - Pops the last element of the current stack and pushes tan(x)
    S            - Pops the last element of the current stack and pushes sin(x)
    C            - Pops the last element of the current stack and pushes cos(x)
    J            - Pops the last element of the current stack and pushes 1 if it is a vowel (aeiouAEIOU) and 0 otherwise
    N            - Loops through the current stack, replacing each element with a 1 if it is a Python3 truthy value, and 0 otherwise
    n            - Loops through the current stack, replacing each element with a 0 if it is a Python3 truthy value, and 1 otherwise
    H            - Pops the entire stack, pushes 1 if the stack is Palindromic, and 0 otherwise
                   NOTE: Soon to be removed/replaced as duplicate of P
    i            - Reads input from STDIN and appends each char's charcode to the stack, if no input is given, appends -1
    a            - Creates a new stack containing every lowercase letter of the alphabet, in order
    t            - Pops the last element of the current stack and pushes the char values of the scientific notation equivalent
                   For example for stack value 410 would push the string "4.1E+2"
    K            - Sorts the stack in ascending numerical order
    k            - Sorts the stack in descending numerical order
    y            - Copies the current stack, storing it to be pasted later
    Y            - Pastes the currently copied stack, appending it to the end of the current stack
    G            - Pops top of stack, pushes each run of digits in the popped value, IE 1112233455 becomes [111,22,33,4,55]
    g            - Pops the top 2 items and concatenates them, IE [11,222] becomes 11222
    f            - Pops the stack, pushes the absolute deltas of the stack
     

Modifiers:

    !            - "Safe" - Prevents the next operator from consuming data from the stack (it may still read, but will not pop)
    ~            - "Reverse" - Causes the next operator to read/pop from the beginning of the stack, rather than the end
    $            - "Silent" - Prevents the next operator from outputting to the console
    &            - "Greedy" - Causes the next operator to apply to the entire stack
    #            - Adds the charcode of the next char to the end of the stack
    "            - Causes all following characters to be treated as character literals (as though preceeded by the `#` operator) until another `"` is found

Flow Control:

    ?            - Begins an if block. Will skip all code after this character until the next : or | characters if the last item of the stack is <= 0
    e            - Begins an if block. Will skip all code after this character until the next : or | characters if the last 2 items of the stack are not equal
    E            - Begins an if block. Will skip all code after this character until the next : or | characters if the current stack is not equal to the next stack
    :            - Begins an else block. Will skip all code after this character until the next | character if the previous if block was run (ie the last item was > 0)
    |            - Ends an if or else block
    [            - Begins a while loop. Will repeat all code after this character until the next ] character while the first item of the stack is > 0
    ]            - Ends a while loop
    {            - Begins a foreach loop. Each iteration will rotate the stack so that the next element is last, then run the containing code
    }            - Ends a foreach loop
    (            - Special foreach loop, for each iteration, pops the last element from the stack and moves it to a special sandboxed stack
                   Runs the code within the loop on that sandboxed environment, then prepends the last item from the sandbox stack to the main stack
    )            - End a special foreach loop

Literals:

    0-9          - Treated as one digit literals, added directly to the end of the stack
    #char        - Treated as one char literal, see # modifier
    "text"       - Treated as multi-char literal, see " modifier

Exceptions:

    0-9 will not be treated as literals if placed directly after the @ operator, in which case they will be parsed to a number, and the @ will pop and print that many characters

When a Braingolf program first starts, 3 stacks are created.

Detailed run-through of an example:

This code takes an integer input, and will output a birthday cake with that many candles. If the input is 0 or less it will instead say "Congratulations on your new baby! :D"

    !?# @.1,-<["$ "@2]"
     "@2.1-<["{ ">1+<@2]"
    -"@2.1-<["--"@2]"
    ~"@2.1-<["~~"@2]"
    -"@2 1-["--"@2]:"..."&@|

    Initial stack: [3] - The stack will initially contain the input given

    !?                          [3] - This is a conditional check whether the last item in the stack is > 0, the ! prevents the item from being consumed
      #<space>                  [3, 32] - 32 is the charcode for a space
        @                       [3] - We popped the 32 and printed it as a character
         .                      [3, 3] - Duplicate last element
          1                     [3, 3, 1] - Push a 1
           -                    [3, 2] - Subtract the last element from the 2nd to last
            <                   [2, 3] - Shift the stack 1 to the left
             ["$ "@2]           [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
              "$ "              [2, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                  @2            [2, 3] - Pop the last 2 elements and print as chars
                    ]           [1, 3] - End of loop, decrement 0th item
             [                  [1, 3] - And return to the start of the loop
              "$ "              [1, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                  @2            [1, 3] - Pop the last 2 elements and print as chars
                    ]           [0, 3] - End of loop, decrement 0th item
             [                  [0, 3] - And return to the start of the loop
              "$ "              [0, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                  @2            [0, 3] - Pop the last 2 elements and print as chars
                    ]           [3] - End of loop, 0th item is already 0, pop it and exit loop
                     "
     "                          [3, 10, 32] - Push the charcodes of string literal "<newline> " to the stack
      @2                        [2, 3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          -                     [3, 2] - Subtract the last element from the 2nd to last
           <                    [2, 3] - Shift the stack 1 to the left
            [                   [2, 3] - New loop, same as before
             "{ "               [2, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                 >              [32, 2, 3, 123] - Shift to the right
                  1             [32, 2, 3, 123, 1] - Push 1
                   +            [32, 2, 3, 124] - Add last 2 items together
                    <           [2, 3, 124, 32] - Voila!
                     @2         [2, 3] - Pop the last 2 elements and print as chars
                       ]        [1, 3] - End of loop, decrement 0th item
            [                   [1, 3] - New loop, same as before
             "{ "               [1, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                 >              [32, 1, 3, 123] - Shift to the right
                  1             [32, 1, 3, 123, 1] - Push 1
                   +            [32, 1, 3, 124] - Add last 2 items together
                    <           [1, 3, 124, 32] - Voila!
                     @2         [1, 3] - Pop the last 2 elements and print as chars
                       ]        [0, 3] - End of loop, decrement 0th item
            [                   [0, 3] - New loop, same as before
             "{ "               [0, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                 >              [32, 0, 3, 123] - Shift to the right
                  1             [32, 0, 3, 123, 1] - Push 1
                   +            [32, 0, 3, 124] - Add last 2 items together
                    <           [0, 3, 124, 32] - Voila!
                     @2         [0, 3] - Pop the last 2 elements and print as chars
                       ]        [3] - End of loop, 0th item is already 0, pop it and exit loop
                        "
    -"                          [3, 10, 45] - Push the charcodes of string literal "<newline>-" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          -                     [3, 2] - Subtract the last element from the 2nd to last
           <                    [2, 3] - Shift the stack 1 to the left
            ["--"@2]            [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
             "--"               [2, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [2, 3] - Pop the last 2 elements and print as chars
                   ]            [1, 3] - End of loop, decrement 0th item
            [                   [1, 3] - And return to the start of the loop
             "--"               [1, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [1, 3] - Pop the last 2 elements and print as chars
                   ]            [0, 3] - End of loop, decrement 0th item
            [                   [0, 3] - And return to the start of the loop
             "--"               [0, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [0, 3] - Pop the last 2 elements and print as chars
                   ]            [3] - End of loop, 0th item is already 0, pop it and exit loop
                    "
    ~"                          [3, 10, 126] - Push the charcodes of string literal "<newline>~" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          -                     [3, 2] - Subtract the last element from the 2nd to last
           <                    [2, 3] - Shift the stack 1 to the left
            ["~~"@2]            [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
             "~~"               [2, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                 @2             [2, 3] - Pop the last 2 elements and print as chars
                   ]            [1, 3] - End of loop, decrement 0th item
            [                   [1, 3] - And return to the start of the loop
             "~~"               [1, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                 @2             [1, 3] - Pop the last 2 elements and print as chars
                   ]            [0, 3] - End of loop, decrement 0th item
            [                   [0, 3] - And return to the start of the loop
             "~~"               [0, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                 @2             [0, 3] - Pop the last 2 elements and print as chars
                   ]            [3] - End of loop, 0th item is already 0, pop it and exit loop
                    "
    -"                          [3, 10, 45] - Push the charcodes of string literal "<newline>-" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
         1                      [3, 1] - Push a 1
          -                     [2] - Subtract the last element from the 2nd to last
           ["--"@2]             [2] - Things get tricky here, this is a while loop that decrements the first element in the stack
            "--"                [2, 45, 45] - Push the charcodes of string literal "--" to the stack
                @2              [2] - Pop the last 2 elements and print as chars
                  ]             [1] - End of loop, decrement 0th item
           [                    [1] - And return to the start of the loop
            "--"                [1, 45, 45] - Push the charcodes of string literal "--" to the stack
                @2              [1] - Pop the last 2 elements and print as chars
                  ]             [0] - End of loop, decrement 0th item
           [                    [0] - And return to the start of the loop
            "--"                [0, 45, 45] - Push the charcodes of string literal "--" to the stack
                @2              [0] - Pop the last 2 elements and print as chars
                  ]             [] - End of loop, 0th item is already 0, pop it and exit loop
                   :            [] - Else, if the input was 0 or less than 0 only code after this point would run
                    "..."&@     [] - This would push the string seen to the stack, then pop and print it (the & on the @ causes it to pop the entire stack)
                           |    [] - End if



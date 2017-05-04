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
    .            - Duplicates the last element in the stack
    {            - Reads input from STDIN and appends each char's charcode to the stack, if no input is given, appends -1

Modifiers:

    !            - "Safe" - Prevents the next operator from consuming data from the stack (it may still read, but will not pop)
    ~            - "Reverse" - Causes the next operator to read/pop from the beginning of the stack, rather than the end
    ,            - "Flip" - Causes the next diadic operator to swap its 2 values. (Eg 2 / 4 becomes 4 / 2)
    $            - "Silent" - Prevents the next operator from outputting to the console
    &            - "Greedy" - Causes the next operator to apply to the entire stack
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

Detailed run-through of an example:

This code takes an integer input, and will output a birthday cake with that many candles. If the input is 0 or less it will instead say "Congratulations on your new baby! :D"

    Initial stack: [3] - The stack will initially contain the input given

    !?                          [3] - This is a conditional check whether the last item in the stack is > 0, the ! prevents the item from being consumed
      #<space>                  [3, 32] - 32 is the charcode for a space
        @                       [3] - We popped the 32 and printed it as a character
         .                      [3, 3] - Duplicate last element
          1                     [3, 3, 1] - Push a 1
           ,-                   [3, 2] - Subtract the last element from the 2nd to last
             <                  [2, 3] - Shift the stack 1 to the left
              ["$ "@2]          [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
               "$ "             [2, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                   @2           [2, 3] - Pop the last 2 elements and print as chars
                     ]          [1, 3] - End of loop, decrement 0th item
              [                 [1, 3] - And return to the start of the loop
               "$ "             [1, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                   @2           [1, 3] - Pop the last 2 elements and print as chars
                     ]          [0, 3] - End of loop, decrement 0th item
              [                 [0, 3] - And return to the start of the loop
               "$ "             [0, 3, 36, 32] - Push the charcodes of string literal "$ " to the stack
                   @2           [0, 3] - Pop the last 2 elements and print as chars
                     ]          [3] - End of loop, 0th item is already 0, pop it and exit loop
                      "
     "                          [3, 10, 32] - Push the charcodes of string literal "<newline> " to the stack
      @2                        [2, 3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          ,-                    [3, 2] - Subtract the last element from the 2nd to last
            <                   [2, 3] - Shift the stack 1 to the left
             [                  [2, 3] - New loop, same as before
              "{ "              [2, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                  >             [32, 2, 3, 123] - Shift to the right
                   1            [32, 2, 3, 123, 1] - Push 1
                    +           [32, 2, 3, 124] - Add last 2 items together
                     <          [2, 3, 124, 32] - Voila!
                      @2        [2, 3] - Pop the last 2 elements and print as chars
                        ]       [1, 3] - End of loop, decrement 0th item
             [                  [1, 3] - New loop, same as before
              "{ "              [1, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                  >             [32, 1, 3, 123] - Shift to the right
                   1            [32, 1, 3, 123, 1] - Push 1
                    +           [32, 1, 3, 124] - Add last 2 items together
                     <          [1, 3, 124, 32] - Voila!
                      @2        [1, 3] - Pop the last 2 elements and print as chars
                        ]       [0, 3] - End of loop, decrement 0th item
             [                  [0, 3] - New loop, same as before
              "{ "              [0, 3, 123, 32] - This is a little tricky, we can't use the pipe character as, even in a string, it will end the if, so we use open brace and add 1
                  >             [32, 0, 3, 123] - Shift to the right
                   1            [32, 0, 3, 123, 1] - Push 1
                    +           [32, 0, 3, 124] - Add last 2 items together
                     <          [0, 3, 124, 32] - Voila!
                      @2        [0, 3] - Pop the last 2 elements and print as chars
                        ]       [3] - End of loop, 0th item is already 0, pop it and exit loop
                         "
    -"                          [3, 10, 45] - Push the charcodes of string literal "<newline>-" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          ,-                    [3, 2] - Subtract the last element from the 2nd to last
            <                   [2, 3] - Shift the stack 1 to the left
              ["--"@2]          [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
               "--"             [2, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                   @2           [2, 3] - Pop the last 2 elements and print as chars
                     ]          [1, 3] - End of loop, decrement 0th item
              [                 [1, 3] - And return to the start of the loop
               "--"             [1, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                   @2           [1, 3] - Pop the last 2 elements and print as chars
                     ]          [0, 3] - End of loop, decrement 0th item
              [                 [0, 3] - And return to the start of the loop
               "--"             [0, 3, 45, 45] - Push the charcodes of string literal "--" to the stack
                   @2           [0, 3] - Pop the last 2 elements and print as chars
                     ]          [3] - End of loop, 0th item is already 0, pop it and exit loop
                         "
    ~"                          [3, 10, 126] - Push the charcodes of string literal "<newline>~" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
        .                       [3, 3] - Duplicate last element
         1                      [3, 3, 1] - Push a 1
          ,-                    [3, 2] - Subtract the last element from the 2nd to last
            <                   [2, 3] - Shift the stack 1 to the left
              ["~~"@2]          [2, 3] - Things get tricky here, this is a while loop that decrements the first element in the stack
               "~~"             [2, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                   @2           [2, 3] - Pop the last 2 elements and print as chars
                     ]          [1, 3] - End of loop, decrement 0th item
              [                 [1, 3] - And return to the start of the loop
               "~~"             [1, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                   @2           [1, 3] - Pop the last 2 elements and print as chars
                     ]          [0, 3] - End of loop, decrement 0th item
              [                 [0, 3] - And return to the start of the loop
               "~~"             [0, 3, 126, 126] - Push the charcodes of string literal "~~" to the stack
                   @2           [0, 3] - Pop the last 2 elements and print as chars
                     ]          [3] - End of loop, 0th item is already 0, pop it and exit loop
                         "
    -"                          [3, 10, 45] - Push the charcodes of string literal "<newline>-" to the stack
      @2                        [3] - Pop the last 2 elements and print as chars
         1                      [3, 1] - Push a 1
          ,-                    [2] - Subtract the last element from the 2nd to last
            ["--"@2]            [2] - Things get tricky here, this is a while loop that decrements the first element in the stack
             "--"               [2, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [2] - Pop the last 2 elements and print as chars
                   ]            [1] - End of loop, decrement 0th item
            [                   [1] - And return to the start of the loop
             "--"               [1, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [1] - Pop the last 2 elements and print as chars
                   ]            [0] - End of loop, decrement 0th item
            [                   [0] - And return to the start of the loop
             "--"               [0, 45, 45] - Push the charcodes of string literal "--" to the stack
                 @2             [0] - Pop the last 2 elements and print as chars
                   ]            [] - End of loop, 0th item is already 0, pop it and exit loop
                    :           [] - Else, if the input was 0 or less than 0 only code after this point would run
                     "..."&@    [] - This would push the string seen to the stack, then pop and print it (the & on the @ causes it to pop the entire stack)
                            |   [] - End if


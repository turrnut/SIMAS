
# The SIMAS Programming Language
*Created by: Turrnut*<br>
**Current Version v0.0.1**<br>
**SIMAS**, which is an acronym for **SIM**ple **AS**sembly, is a dynamically typed, compiled,
high level, procedural programming language with a syntax that is inspired
by the Assembly programming language. In SIMAS, each line starts with an instruction,
optionally followed by one or more operands, just like Assembly.<br>

SIMAS is designed to be minimal. The run function contains all of the code you need to run
a SIMAS program. the parameter, inputText, is your SIMAS code.<br>

The instruction and its operands are separated a space character. Also, lines of code are separated
by semicolons, as new lines are ignored. 

To run a SIMAS program, compile it first using the `simasc` compiler, it should generate a `.csa` file,
then run the `.csa` file with `simas`

**Troubleshooting**
If you're on a UNIX system(MacOS, Linux) and can't run the `simasc`, try running `chmod +x ./simasc`,
same thing applies to `simas`

## DOCUMENTATION 
### DATA TYPES 
#### - bool : a boolean value.
####        0 is false, all other numbers are true
####        an empty string is false, all other strings are true
#### - num  : a number, can be an integer or a decimal
#### - str  : a string of characters
## INSTRUCTIONS
#### - add
* add the value of OPERAND 2 and 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first addend, optionally being a variable name
* OPERAND 3: the second addend, optionally being a variable name

#### - call
* call the function
* OPERAND 1: the name of the function

#### - cmt
* same as the `comment` instruction
* until a semicolon is seen, the rest of the line is ignored.

#### - comment
* same as the `cmt` instruction
* until a semicolon is seen, the rest of the line is ignored.

#### - copy
* copy a variable's value to another
* OPERAND 1: the name of the variable copying from
* OPERAND 2: the name of the variable copying to

#### - div
* performs operation of OPERAND 2 divide OPERAND 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the dividend, optionally being a variable name
* OPERAND 3: the divisor, optionally being a variable name

#### - end
* marking the end of a function, conditional, or loop
* OPERAND 1: as of now can only handle functions, so the only possible value is `fun`

#### - fun
* define a function
* OPERAND 1: name of the function
* OPERAND 2: number of parameters the function would accept

#### - mul
* performs operation of OPERAND 2 multiply OPERAND 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first factor, optionally being a variable name
* OPERAND 3: the second factor, optionally being a variable name

#### - print
* print something to the console.
* OPERAND 1: The name of the variable which the information is stored

#### - printc
* print a constant to the console.
* OPERAND 1: The constant being printed

#### - println
* print a new line

#### - ret
* signal the end of the execution of function. **IT IS VERY IMPORTANT** to include this at the end of every function(before `end fun;`) because otherwise the function will be stuck in an infinite loop

#### - set
* assign a value to a variable.
* OPERAND 1: the type of value. If the operand here is "in", then the value of the user input will be stored at this variable	
* OPERAND 2: the name of the variable
* OPERAND 3: the value you wish to assign

#### - start
* initializes the program and the memory.

#### - sub
* performs operation of OPERAND 2 minus OPERAND 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the subtrahend, optionally being a variable name
* OPERAND 3: the minuend, optionally being a variable name


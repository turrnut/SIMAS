
![SIMAS BANNER](/images/simasbanner.png)
# The SIMAS Programming Language
*Created by: Turrnut*<br>
**Current Version v0.9**<br>
**SIMAS**, which is an acronym for **SIM**ple **AS**sembly, is a dynamically typed, compiled,
high level, procedural programming language with a syntax that is inspired
by the Assembly programming language. In SIMAS, each line starts with an instruction,
optionally followed by one or more operands, just like Assembly.<br>

The instruction and its operands are separated a space character and one space only. If there are
multiple spaces, the program might enter unexpected behavior. Also, lines of code are separated by semicolons, as new lines are ignored. <br>

SIMAS is case-sensitive, although instructions and data types are not. <br>

To run a SIMAS program, compile it first using the `simasc` compiler, it should generate a `.csa` file,
then run the `.csa` file with `simas`

**Additional Notes** <br>
To access arguments within a function, use `$` followed by a number. For example, `$0` is the first argument, `$1` is the second argument, and so on.<br>
All occurences of `\s` is replaced with `;`, and `\\` is replaced with `\`, in a SIMAS program<br>
If you want to be polite to SIMAS, you can add `PLEASE` (case-insensitive) and a space character
in front of any instruction. However, SIMAS will ignore your politeness by ignoring `PLEASE`. <br>
For example, `PLEASE PRINTC Hello!;` and `PRINTC Hello!;` does the same thing

**Troubleshooting** <br>
If you're on a UNIX system(MacOS, Linux) and can't run the `simasc`, try running `chmod +x ./simasc`,
same thing applies to `simas`

## DOCUMENTATION 
### DATA TYPES 
#### - bool : a boolean value.
#### - num  : a number, can be an integer or a decimal
#### - str  : a string of characters
## INSTRUCTIONS
#### - @
* all code after @ is ignored, until a semicolon is seen. this is a comment feature

#### - add
* add the value of OPERAND 2 and 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first addend, optionally being a variable name
* OPERAND 3: the second addend, optionally being a variable name

#### - call
* call the function
* OPERAND 1: the name of the function

#### - conv
* Convert to a different data type
* OPERAND 1: name of variable
* OPERAND 2: target data type

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

#### - eqc
* equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* ATTENTION: please use this ONLY when OPERAND 2 is a variable name and OPERAND 3 is a constant
* OPERAND 1: data type of OPERANDS 2 and 3
* OPERAND 2: name of first variable
* OPERAND 3: a constant

#### - eqv
* equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* ATTENTION: please use this ONLY whend dealing with two variables
* OPERAND 1: data type of OPERANDS 2 and 3
* OPERAND 2: name of first variable
* OPERAND 3: name of second variable

#### - fun
* define a function
* OPERAND 1: name of the function
* OPERAND 2: number of parameters the function would accept

#### - gt
* greater than comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first value, optionally being a variable name
* OPERAND 3: the second value, optionally being a variable name

#### - gte
* greater than or equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first value, optionally being a variable name
* OPERAND 3: the second value, optionally being a variable name

#### - jump
* jump to a label. this is an unconditional jump
* OPERAND 1: name of the label

#### - jumpv
* jump to a label. this is a conditional jump
* OPERAND 1: name of the label
* OPERAND 2: name of a variable. if true, will jump to the label

#### - label
* define a label
* labels MUST be defined in a line prior to the line in which it is used
* OPERAND 1: name of the label

#### - mul
* performs operation of OPERAND 2 multiply OPERAND 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first factor, optionally being a variable name
* OPERAND 3: the second factor, optionally being a variable name

#### - neqc
* not equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* ATTENTION: please use this ONLY when OPERAND 2 is a variable name and OPERAND 3 is a constant
* OPERAND 1: data type of OPERANDS 2 and 3
* OPERAND 2: name of first variable
* OPERAND 3: a constant

#### - neqv
* not equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* ATTENTION: please use this ONLY whend dealing with two variables
* OPERAND 1: data type of OPERANDS 2 and 3
* OPERAND 2: name of first variable
* OPERAND 3: name of second variable

#### - print
* print something to the console.
* OPERAND 1: The name of the variable which the information is stored

#### - printc
* print a constant to the console.
* OPERAND 1: The constant being printed

#### - println
* print a new line

#### - prints
* print a space

#### - quit
* quits the program

#### - ret
* signal the end of the execution of function. **IT IS VERY IMPORTANT** to include this at the end of every function(before `end fun;`) because otherwise the function will be stuck in an infinite loop

#### - set
* assign a value to a variable.
* OPERAND 1: the type of value. If the operand here is "in", then the value of the user input will be stored at this variable, with `str` type
* OPERAND 2: the name of the variable
* OPERAND 3: the value you wish to assign

#### - st
* smaller than comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first value, optionally being a variable name
* OPERAND 3: the second value, optionally being a variable name

#### - ste
* smaller than or equal to comparison operator. value will be assigned to the variable at OPERAND 1, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the first value, optionally being a variable name
* OPERAND 3: the second value, optionally being a variable name

#### - sub
* performs operation of OPERAND 2 minus OPERAND 3 (as of now can only handle num) the value will be assigned to OPERAND 2, if it is a variable name
* OPERAND 1: the data type of both OPERAND 2 and 3
* OPERAND 2: the subtrahend, optionally being a variable name
* OPERAND 3: the minuend, optionally being a variable name


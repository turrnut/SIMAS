// todo:
// convert: convert data type

const readline = require("readline-sync");

function run(inputText, isRun){
    let instructions = [];
    let boxes = [];
    let BOX_SIZE = 255;
    let current_ln;
    let inFunction = false;
    let execFunction = false;

    // iterating index, starting at 0
    let lnIdx;

    let functions = [];
    let lines = [];
    let returnTo = 0;

    // assigned in the dispatcher function
    let firstInsIdx;
    
    // initialize the boxes, or the memory of the program
    function initBoxes() {
      let boxI = 0;
      while (boxI < BOX_SIZE) {
        boxes.push(0);
        boxI ++;
      }
    }
    
    // processes the text
    function filterText() {
      let newText = "";
      for (let currentCharIndex = 0; currentCharIndex < inputText.length; currentCharIndex++) {
        let currentChar = inputText[currentCharIndex];
        let lastChar = currentCharIndex == 0 ? "" : inputText[currentCharIndex-1];
        
        switch(currentChar) {
          case "" : continue;
          case "\r" : continue;
          case "\n" : continue;
        }
        newText += currentChar;
      }
      return newText.split(";");
    }
    
    // compiling the raw text into executable sequences
    function compile() {
      lines = filterText();
      for(let a = 0; a < lines.length; a ++) {
        if (lines[a] == "") {
          lines.splice(a, 1);
        }
      }
      
      for(let b = 0; b < lines.length; b ++) {
        instructions.push(lines[b].split(" "));
      }
      instructions = instructions.map(subArray => subArray.filter(item => item !== ''));
    }
    
    // ******** INSTRUCTION FUNCTIONS **********
    
    // instruction ADD
    function ins_add(dataType, op1, op2) {
      if (dataType == "num") {
        // if first addend is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] += Number(op2);
        // if both addends are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] += Number(boxes[op2]);
        }
      }
    }

    // instruction CALL
    function ins_call(funName) {
      for(let funIdx = 0; funIdx < functions.length; funIdx ++) {
        if (functions[funIdx][0] != funName) {
          continue;
        }

        let callFunction = functions[funIdx];
        returnTo = lnIdx;
        lnIdx = callFunction[2];
        inFunction = true;
        execFunction = true;
      }
    }
    
    // instruction CMT or COMMENT
    function ins_comment() {
      return;
    }

    // instruction DIV
    function ins_div(dataType, op1, op2) {
      if (dataType == "num") {
        // if first NUMBER is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] /= Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] /= Number(boxes[op2]);
        }
      }
    }

    // instruction END
    function ins_end (endWhat) {
      if (endWhat == "fun") {
        inFunction = false;
        execFunction = false;
      }
    }
    
    // instruction FUN
    function ins_fun(funName, argCnt) {
      functions[functions.length] = [funName, Number(argCnt), lnIdx];
      inFunction = true;
      execFunction = false;
    }
    
    // instruction MUL
    function ins_mul(dataType, op1, op2) {
      if (dataType == "num") {
        // if first number is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] *= Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] *= Number(boxes[op2]);
        }
      }
    }
        
    // instruction PRINT
    function ins_print(boxIdx) {
      process.stdout.write(String(boxes[boxIdx]));
    }
    
    // instruction PRINTLN
    function ins_println() {
      console.log("");
    }

    // instruction PRINTC
    function ins_printc(a_thing) {
      let the_thing = a_thing;
      for(let i = firstInsIdx + 2; i < current_ln.length; i ++) {
        the_thing += " " + current_ln[i];
      }
      process.stdout.write(the_thing);
    }
    
    // instruction COPY
    function ins_copy (from, to) {
      boxes[to] = boxes[from];
    }
    
    // instruction RET
    function ins_ret() {
      inFunction = false;
      execFunction = false;
      lnIdx = returnTo;
      // returnTo = 0;
    }

    // instruction SET
    function ins_set(dataType, boxIdx, newValue) {
      switch(dataType) {
        case "in": boxes[boxIdx] = readline.question(); break;
        case "num": boxes[boxIdx] = Number(newValue); break;
        case "bool":
          boxes[boxIdx] = newValue === "true" ? true : false;
          break;
        case "str":
          let strValue = newValue;
          for(let i = firstInsIdx + 4; i < current_ln.length; i ++) {
            strValue += " " + current_ln[i];
          }
          boxes[boxIdx] = strValue;
          break;
      }
    }
    
    // instruction START
    function ins_start() {
      initBoxes();
    }
      // instruction ADD
    function ins_sub(dataType, op1, op2) {
      if (dataType == "num") {
        // if minuend is a variable name but subtrahend is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] -= Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] -= Number(boxes[op2]);
        }
      }
    }
    
    // ****************************************
  
    // instruction dispatcher SWITCH statement
    function dispatcher(firstInsIdx) {
      // First Instruction
      let fi = current_ln[firstInsIdx];
      
      // first, second operand, etc...
      let o1 = current_ln[firstInsIdx + 1];
      let o2 = current_ln[firstInsIdx + 2];
      let o3 = current_ln[firstInsIdx + 3];
      
      switch (fi) {
        case "add"    : ins_add(o1, o2, o3); break;
        case "call"   : ins_call(o1);        break;
        // case "cmp"    : ins_cmp(o1, o2);     break;
        case "comment": ins_comment();       break;
        case "cmt"    : ins_comment();       break;
        case "copy"   : ins_copy(o1, o2);    break;
        case "div"    : ins_div(o1, o2, o3); break;
        case "end"    : ins_end(o1);         break;
        case "fun"    : ins_fun(o1, o2);     break;
        case "mul"    : ins_mul(o1, o2, o3); break;
        case "print"  : ins_print(o1);       break;
        case "printc" : ins_printc(o1);      break;
        case "println": ins_println();       break;
        case "ret"    : ins_ret();           break;
        case "set"    : ins_set(o1, o2, o3); break;
        case "start"  : ins_start();         break;
        case "sub"    : ins_sub(o1, o2, o3); break;
        
        case undefined: return;
        default: return;
      }
    }

    // purely compiling
    if(!isRun) {
      compile();
      return instructions;
    }
    // executing
    else {
      instructions = inputText;
    }

    // iterate lines
    for(lnIdx = 0; lnIdx < instructions.length; lnIdx ++) {

      // the current line with instruction and operands
      current_ln = instructions[lnIdx];
      
      // where is the first instruction in the line
      firstInsIdx = 0;
      
      while (current_ln[firstInsIdx] == "") {
        firstInsIdx ++;
      }
      
      if ((inFunction) && (!execFunction) && (current_ln[firstInsIdx] != "end")) continue;
      
      dispatcher(firstInsIdx);
      
    }
    // Uncomment to see compiled instructions
    // console.log(instructions);
  }
  
module.exports = {run};
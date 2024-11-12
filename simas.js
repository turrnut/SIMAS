// todo:
// convert: convert data type
// print should not have new line
// input should be console input

const readline = require("readline-sync");

function run(inputText){
    var instructions = [];
    var boxes = [];
    var BOX_SIZE = 255;
    var current_ln;
    var lines = [];
    
    // initialize the boxes, or the memory of the program
    function initBoxes() {
      var boxI = 0;
      while (boxI < BOX_SIZE) {
        boxes.push(0);
        boxI ++;
      }
    }
    
    // processes the text
    function filterText() {
      var newText = "";
      for (var currentCharIndex = 0; currentCharIndex < inputText.length; currentCharIndex++) {
        var currentChar = inputText[currentCharIndex];
        var lastChar = currentCharIndex == 0 ? "" : inputText[currentCharIndex-1];
        
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
      for(var a = 0; a < lines.length; a ++) {
        if (lines[a] == "") {
          lines.splice(a, 1);
        }
      }
      
      for(var b = 0; b < lines.length; b ++) {
        instructions.push(lines[b].split(" "));
      }
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
          boxes[op1] += boxes[op2];
        }
      }
    }
    
    // instruction COMMENT
    function ins_comment() {
      return;
    }
    
    // instruction PRINT
    function ins_print(boxIdx) {
      process.stdout.write(boxes[boxIdx]);
    }
    
    // instruction PRINTLN
    function ins_println() {
      console.log("");
    }

    // instruction PRINTC
    function ins_printc(a_thing) {
      var the_thing = a_thing;
      for(var i = firstInsIdx + 2; i < current_ln.length; i ++) {
        the_thing += " " + current_ln[i];
      }
      process.stdout.write(the_thing);
    }
    
    // instruction COPY
    function ins_copy (from, to) {
      boxes[to] = boxes[from];
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
          var strValue = newValue;
          for(var i = firstInsIdx + 4; i < current_ln.length; i ++) {
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
          boxes[op1] -= boxes[op2];
        }
      }
    }
    
    // ****************************************
  
    // instruction dispatcher SWITCH statement
    function dispatcher(firstInsIdx) {
      // First Instruction
      var fi = current_ln[firstInsIdx];
      
      // first, second operand, etc...
      var o1 = current_ln[firstInsIdx + 1];
      var o2 = current_ln[firstInsIdx + 2];
      var o3 = current_ln[firstInsIdx + 3];
      
      switch (fi) {
        case "add"    : ins_add(o1, o2, o3); break;
        case "comment": ins_comment();       break;
        case "copy"   : ins_copy(o1, o2);    break;
        case "print"  : ins_print(o1);       break;
        case "printc" : ins_printc(o1);      break;
        case "println": ins_println();       break;
        case "set"    : ins_set(o1, o2, o3); break;
        case "start"  : ins_start();         break;
        case "sub"    : ins_sub(o1, o2, o3); break;
        
        case undefined: return;
        default: return;
      }
    }
    
    compile();
    
    // iterate lines
    for(var c = 0; c < instructions.length; c ++) {
      
      // the current line with instruction and operands
      current_ln = instructions[c];
      
      // where is the first instruction in the line
      var firstInsIdx = 0;
      
      while (current_ln[firstInsIdx] == "") {
        firstInsIdx ++;
      }
      
      dispatcher(firstInsIdx);
      
    }
    // Uncomment to see compiled instructions
    // console.log(instructions);
  }
  
module.exports = {run};
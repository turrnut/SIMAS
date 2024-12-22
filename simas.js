const readline = require("readline-sync");
const error = require("./error");

// Input text: Code text
// isRun     : compile if false, run if true
// fileName  : name of the file
function run(inputText, isRun, fileName){
    let instructions = [];
    let boxes = [];
    let current_ln;
    let inFunction = false;
    let execFunction = false;

    // iterating index, starting at 0
    let lnIdx;

    let functions = [];
    let current_function = "";
    let labels = [];
    let lines = [];
    let returnTo = 0;
    
    // assigned in the dispatcher function
    let firstInsIdx;
    
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
      return newText.replace(/\\\\s/g, ';').replace(/\\\\/g, '\\').split(";");
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
      // double space elimination?
      // instructions = instructions.map(subArray => subArray.filter(item => item !== ''));
    }
    
    // ******** INSTRUCTION FUNCTIONS **********
    
    // instruction ADD
    function ins_add(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
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
        // get args
        let mode = "v";
        let argList = []
        for (let index = 0; index < (callFunction[1] * 2) + 1; index++) {
          if (mode != "c" && mode != "v" && mode != "b") {
            error.error(`Incorrect mode \"${mode}\", can only be \"c\", \"v\" or \"b\".`);
          }

          let currentThing = current_ln[firstInsIdx + 1 + index];
          if (currentThing.toLowerCase() == "v" || currentThing.toLowerCase() == "c" || currentThing.toLowerCase() == "b" || (firstInsIdx + 1 + index) % 2 == 0) {
            mode = currentThing.toLowerCase();
            continue;
          }
          
          if (mode == "v") {
            argList.push(boxes[currentThing]);
          }
          else if (mode == "b") {
            if (currentThing == "true") argList.push(true);
            else if (currentThing == "false") argList.push(false);
            else error.error(`Argument "${currentThing}" is not a Boolean constant.`);
          }
          else if (mode == "c") {
            argList.push(currentThing);
          }
        }
        for (let index = 0; index < argList.length; index++) {
          const argument = argList[index];
          let argIdx = String(index-1);
          boxes["$" + argIdx] = argument;
          if ((!isNaN(Number(argument))) && argument !== true && argument !== false) {
            boxes["$" + argIdx] = Number(argument);
          }
        }

        returnTo = lnIdx;
        lnIdx = callFunction[2];
        inFunction = true;
        execFunction = true;
        current_function = funName;
        return;
      }
      error.error("Function " + funName + " is not defined.");
    }
    
    // instruction CMT or COMMENT
    function ins_comment() {
      return;
    }

    function ins_conv(varName, dType) {
      switch(dType.toLowerCase()) {
        default: error.error(`Cannot convert the variable ${varName} to data type "${dType}, which is a non-existent data type.`);
        case "bool":
          boxes[varName] = Boolean(boxes[varName]); break;
          case "num":
            boxes[varName] = Number(boxes[varName]);
            if (isNaN(boxes[varName])) {
              error.error(`Cannot convert the variable ${varName} to data type "${dType}.`);
            }
          break;
        case "str":
          boxes[varName]  = String(boxes[varName]); break;
      }
    }

    // instruction DIV
    function ins_div(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if first NUMBER is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {

          if (Number(op2) == 0) error.error("Division by 0.");
          boxes[op1] /= Number(op2);

          // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {

          if (Number(boxes[op2]) == 0) error.error("Division by 0.");
          boxes[op1] /= Number(boxes[op2]);
        }
      }
    }

    // instruction END
    function ins_end (endWhat) {
      if (endWhat.toLowerCase() == "fun") {
        inFunction = false;
        execFunction = false;
      } else {
        error.error("Illegal syntax.");
      }
    }
    
    
      // instruction EQC
      function ins_eqc(dataType, op1, op2) {
        if (dataType.toLowerCase() == "num") {
          boxes[op1] = Number(boxes[op1]) === Number(op2);

        } else if (dataType.toLowerCase() == "str") {
          boxes[op1] = String(boxes[op1]) === String(op2);
        }
        if (dataType.toLowerCase() == "bool") {
            boxes[op1] = Boolean(boxes[op1]) === Boolean(op2);
        }
      }
  
      // instruction EQV
      function ins_eqv(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        boxes[op1] = Number(boxes[op1]) === Number(boxes[op2]);
      } else if (dataType.toLowerCase() == "str") {
        boxes[op1] = String(boxes[op1]) === String(boxes[op2]); 
      }
      if (dataType.toLowerCase() == "bool") {
        boxes[op1] = Boolean(boxes[op1]) === Boolean(boxes[op2]);
      }
    }

      // instruction NEQC
      function ins_neqc(dataType, op1, op2) {
        if (dataType.toLowerCase() == "num") {
          boxes[op1] = Number(boxes[op1]) !== Number(op2);

        } else if (dataType.toLowerCase() == "str") {
          boxes[op1] = String(boxes[op1]) !== String(op2);
        }
        if (dataType.toLowerCase() == "bool") {
            boxes[op1] = Boolean(boxes[op1]) !== Boolean(op2);
        }
      }
  
      // instruction NEQV
      function ins_neqv(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        boxes[op1] = Number(boxes[op1]) !== Number(boxes[op2]);
      } else if (dataType.toLowerCase() == "str") {
        boxes[op1] = String(boxes[op1]) !== String(boxes[op2]); 
      }
      if (dataType.toLowerCase() == "bool") {
        boxes[op1] = Boolean(boxes[op1]) !== Boolean(boxes[op2]);
      }
    }

    // instruction FUN
    function ins_fun(funName, argCnt) {
      functions.unshift([funName, Number(argCnt), lnIdx]);
      inFunction = true;
      execFunction = false;
    }

     // instruction GT
     function ins_gt(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if first number is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] = Number(boxes[op1]) > Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] = Number(boxes[op1]) > Number(boxes[op2]);
        }
        return;
      }
      error.error("Invalid data types.");
    }
    
    // instruction GTE
    function ins_gte(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if first number is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] = Number(boxes[op1]) >= Number(op2);
          // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] = Number(boxes[op1]) >= Number(boxes[op2]);
        }
        return;
      }
      error.error("Invalid data types.");
    }

    // instruction JUMP
    function ins_jump(label_name) {
      for(let lblidx = 0; lblidx < labels.length; lblidx ++) {
        if (labels[lblidx][0] != label_name) {
          continue;
        }

        let callLabel = labels[lblidx];
        lnIdx = callLabel[1];
        return;
      }
      error.error("Label \"" + label_name + "\" is not defined.");
    }
    // instruction JUMPV
    function ins_jumpv(label_name, boolvar) {
      for(let lblidx = 0; lblidx < labels.length; lblidx ++) {
        if (labels[lblidx][0] != label_name) {
          continue;
        }

        // untrue. do not jump.
        if (Boolean(boxes[boolvar]) !== true) return;

        let callLabel = labels[lblidx];
        lnIdx = callLabel[1];
        return;
      }
      error.error("Label " + label_name + " is not defined.");
    }
    
    // instruction LABEL
    function ins_label(label_name) {
      for (let index = 0; index < labels.length; index++) {
        const current_label = labels[index];
        if (current_label[0] == label_name) {
          error.error("Redefinition of the label \"" + label_name + "\".");
        }
      }
      labels.unshift([label_name, lnIdx]);
    }
    
    // instruction MUL
    function ins_mul(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
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
    
    
    // instruction PRINTC
    function ins_printc(a_thing) {
      let the_thing = a_thing;
      for(let i = firstInsIdx + 2; i < current_ln.length; i ++) {
        the_thing += " " + current_ln[i];
      }
      process.stdout.write(the_thing);
    }
    // instruction PRINTLN
    function ins_println() {
      console.log("");
    }
    
    // instruction PRINTS
    function ins_prints() {
      process.stdout.write(" ");
    }
    function ins_quit() {
      process.exit(0);
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
      returnTo = 0;
      if(Number(current_ln.length - firstInsIdx) < 2){
        return;
      }
      // TODO: ret space c/v/b space semicolon????
      if (Number(current_ln.length-firstInsIdx) < 3) {
        error.error(`A return value is not specified.`);
      }
      
      switch (current_ln[firstInsIdx + 1].toLowerCase()) {
        case "c":
          boxes[`$${current_function}`] = current_ln[firstInsIdx + 2];
          if ((!isNaN(Number(current_ln[firstInsIdx + 2])))) {
            boxes[`$${current_function}`] = Number(current_ln[firstInsIdx + 2]);
          }

        break;
        case "v":
          boxes[`$${current_function}`] = boxes[current_ln[firstInsIdx + 2]];

        break;
        case "b":
          if (current_ln[firstInsIdx + 2] == "true") boxes[`$${current_function}`] = true;
          else if (current_ln[firstInsIdx + 2] == "false") boxes[`$${current_function}`] = false;
          else error.error(`Argument "${current_ln[firstInsIdx + 2]}" is not a Boolean constant.`);

        break;

        case "": break;

        default:
          error.error(`Invalid return mode \"${current_ln[firstInsIdx + 1]}\".`);
        break;
      }
      current_function = "";
    }

    // instruction SET
    function ins_set(dataType, boxIdx, newValue) {
      switch(dataType.toLowerCase()) {
        default: error.error("Unknown Data Type \""+dataType+"\".");
        case "in": boxes[boxIdx] = readline.question(); break;
        case "num": boxes[boxIdx] = Number(newValue); break;
        case "bool":
          boxes[boxIdx] = newValue.toLowerCase() === "true" ? true : false;
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
      // instruction ST
      function ins_st(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if first number is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] = Number(boxes[op1]) < Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] = Number(boxes[op1]) < Number(boxes[op2]);
        }
        return;
      }
      error.error("Invalid data types.");
    }
    
    // instruction STE
    function ins_ste(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if first number is a variable name but second number is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] = Number(boxes[op1]) <= Number(op2);
          // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] = Number(boxes[op1]) <= Number(boxes[op2]);
        }
        return;
      }
      error.error("Invalid data types.");
    }
      // instruction ADD
    function ins_sub(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
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
  
    function predispatcher(firstInsIdx) {
      // First Instruction
      let fi = current_ln[firstInsIdx];

      // first, second operand, etc...
      let o1 = current_ln[firstInsIdx + 1];
      let o2 = current_ln[firstInsIdx + 2];
      let o3 = current_ln[firstInsIdx + 3];
      
      // Check if comment
      if (fi.startsWith("@")) return;

      switch (fi.toLowerCase()) {
        case "label"  : ins_label(o1);       break;
        default: return;
      }
    }
    // instruction dispatcher SWITCH statement
    function dispatcher(firstInsIdx) {
      // First Instruction
      let fi = current_ln[firstInsIdx];
      
      // first, second operand, etc...
      let o1 = current_ln[firstInsIdx + 1];
      let o2 = current_ln[firstInsIdx + 2];
      let o3 = current_ln[firstInsIdx + 3];
      
      // Check if comment
      if (fi.startsWith("@")) return;

      switch (fi.toLowerCase()) {
        case "add"    : ins_add(o1, o2, o3); break;
        case "call"   : ins_call(o1);        break;
        case "@"      : ins_comment();       break;
        case "conv"   : ins_conv(o1, o2);    break;
        case "copy"   : ins_copy(o1, o2);    break;
        case "div"    : ins_div(o1, o2, o3); break;
        case "end"    : ins_end(o1);         break;
        case "eqc"    : ins_eqc(o1,o2,o3);   break;
        case "eqv"    : ins_eqv(o1,o2,o3);   break;
        case "fun"    : ins_fun(o1, o2);     break;
        case "gt"     : ins_gt(o1, o2, o3);  break;
        case "gte"    : ins_gte(o1, o2, o3); break;
        case "jump"   : ins_jump(o1);        break;
        case "jumpv"  : ins_jumpv(o1, o2);   break;
        case "label"  :                      break;
        case "mul"    : ins_mul(o1, o2, o3); break;
        case "neqc"   : ins_neqc(o1,o2,o3);  break;
        case "neqv"   : ins_neqv(o1,o2,o3);  break;
        case "print"  : ins_print(o1);       break;
        case "printc" : ins_printc(o1);      break;
        case "println": ins_println();       break;
        case "prints" : ins_prints();        break;
        case "quit"   : ins_quit();          break;
        case "ret"    : ins_ret();           break;
        case "set"    : ins_set(o1, o2, o3); break;
        case "st"     : ins_st(o1, o2, o3);  break;
        case "ste"    : ins_ste(o1, o2, o3); break;
        case "sub"    : ins_sub(o1, o2, o3); break;
        
        default: error.error("Unknown instruction: " + fi);
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

    error.setCurrentFile(fileName);

    // preiterate lines
    for(lnIdx = 0; lnIdx < instructions.length; lnIdx ++) {
      current_ln = instructions[lnIdx];
      error.setCurrentLine(current_ln);
      firstInsIdx = 0;
      while (current_ln[firstInsIdx] == "" || current_ln[firstInsIdx].toLowerCase() == "please") {
        firstInsIdx ++;
      }
      if ((inFunction) && (!execFunction) && (current_ln[firstInsIdx].toLowerCase() != "end")) continue;
      
      predispatcher(firstInsIdx);
      
    }

    // iterate lines
    for(lnIdx = 0; lnIdx < instructions.length; lnIdx ++) {

      // the current line with instruction and operands
      current_ln = instructions[lnIdx];
      
      // make sure to know what line to report in case of error
      error.setCurrentLine(current_ln);

      // where is the first instruction in the line
      firstInsIdx = 0;
      
      while (current_ln[firstInsIdx] == "" || current_ln[firstInsIdx].toLowerCase() == "please") {
        firstInsIdx ++;
      }
      
      if (inFunction && !execFunction && current_ln[firstInsIdx].toLowerCase() == "label") {
        ins_label(current_ln[firstInsIdx+1]);
        continue;
      }
      if ((inFunction) && (!execFunction) && (current_ln[firstInsIdx].toLowerCase() != "end")) continue;
      
      dispatcher(firstInsIdx);
      
    }
    // Uncomment to see compiled instructions
    // console.log(instructions);
  }
  
module.exports = {run};
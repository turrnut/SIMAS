const readline = require("readline-sync");
const fs = require("fs");
const path = require("path");
const http = require("http");

const error = require("./error");
const common = require("./common");

let boxes = [];
let labels = [];
let functions = [];

// Input text: Code text
// isRun         : compile if false, run if true
// fileName      : name of the file
// importedFiles : files imported
function run(inputText, isRun, fileName, importedFiles, repl=false){
  let instructions = [];
  let current_ln;
  let inFunction = false;
  let execFunction = false;
  let port;    
  
  importedFiles.unshift(path.resolve(path.join(path.dirname(fileName), path.basename(fileName, path.extname(fileName)) + ".simas")));
  
  error.setCurrentFile(fileName);
  error.set_repl(repl);
  // iterating index, starting at 0
  let lnIdx;
  
  let current_function = "";
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
    return newText.replace(/\\n/g, '\n').replace(/\\\\/g, '\\').split(";");
    // return newText.split(";");
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
      return;
    }
    error.error(`Illegal type \"${dataType}\" when performing ADD.`);
  }

  // instruction AND
  function ins_and(dataType, op1, op2) {
    if (dataType.toLowerCase() == "bool") {
      // if op1 is a variable name but op2 is a boolean
      if ((op1 != "true" && op1 != "false") && (op2 == "true" || op2 == "false")) {
        if(op2 == "true") op2 = true;
        else op2 = false;
        boxes[op1] = (boxes[op1] && op2);
      }
      // if both operands are variable names
      else if ((op1 != "true" && op1 != "false") && (op2 != "true" && op2 != "false")) {
      boxes[op1] = (boxes[op1] && boxes[op2]);
    }
    return;
    }
    error.error(`Illegal type \"${dataType}\" when performing AND.`);
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
      return;
    }
    error.error(`Illegal type \"${dataType}\" when performing DIV.`);
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
      } else if (dataType.toLowerCase() == "bool") {
          boxes[op1] = Boolean(boxes[op1]) === Boolean(op2);
      } else {
        error.error(`Illegal type \"${dataType}\" when performing EQC.`);
      }
    }

    // instruction EQV
    function ins_eqv(dataType, op1, op2) {
    if (dataType.toLowerCase() == "num") {
      boxes[op1] = Number(boxes[op1]) === Number(boxes[op2]);
    } else if (dataType.toLowerCase() == "str") {
      boxes[op1] = String(boxes[op1]) === String(boxes[op2]); 
    }
    else if (dataType.toLowerCase() == "bool") {
      boxes[op1] = Boolean(boxes[op1]) === Boolean(boxes[op2]);
    } else {
      error.error(`Illegal type \"${dataType}\" when performing EQV.`);
    }
  }

    // instruction NEQC
    function ins_neqc(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        boxes[op1] = Number(boxes[op1]) !== Number(op2);

      } else if (dataType.toLowerCase() == "str") {
        boxes[op1] = String(boxes[op1]) !== String(op2);
      }
      else if (dataType.toLowerCase() == "bool") {
          boxes[op1] = Boolean(boxes[op1]) !== Boolean(op2);
      } else {
        error.error(`Illegal type \"${dataType}\" when performing NEQC.`);
      }
    }

    // instruction NEQV
    function ins_neqv(dataType, op1, op2) {
    if (dataType.toLowerCase() == "num") {
      boxes[op1] = Number(boxes[op1]) !== Number(boxes[op2]);
    } else if (dataType.toLowerCase() == "str") {
      boxes[op1] = String(boxes[op1]) !== String(boxes[op2]); 
    }
    else if (dataType.toLowerCase() == "bool") {
      boxes[op1] = Boolean(boxes[op1]) !== Boolean(boxes[op2]);
    } else {
      error.error(`Illegal type \"${dataType}\" when performing NEQV.`);
    }
  }

  // instruction NOT
  function ins_not(varName) {
    if (boxes[varName] !== true && boxes[varName] !== false) {
      error.error(`Variable ${varName} is not a Boolean variable.`);
    }
    boxes[varName] = !boxes[varName];
  }

  // instruction OR
  function ins_or(dataType, op1, op2) {
    if (dataType.toLowerCase() == "bool") {
        // if op1 is a variable name but op2 is a boolean
      if ((op1 != "true" && op1 != "false") && (op2 == "true" || op2 == "false")) {
          if(op2 == "true") op2 = true;
          else op2 = false;
          boxes[op1] = (boxes[op1] || op2);
        }
        // if both operands are variable names
        else if ((op1 != "true" && op1 != "false") && (op2 != "true" && op2 != "false")) {
        boxes[op1] = (boxes[op1] || boxes[op2]);
      }
      return;
    }
    error.error(`Illegal type \"${dataType}\" when performing OR.`);
  }

  function ins_server(p, d) {
    port = Number(p);
    const DIRECTORY = path.resolve(d);
    
    const server = http.createServer((req, res) => {
      const filePath = path.join(DIRECTORY, req.url === '/' ? '/index.html' : req.url);
      const extname = path.extname(filePath);
      const contentType = {
          '.html': 'text/html',
          '.css': 'text/css',
          '.js': 'application/javascript',
          '.json': 'application/json',
          '.png': 'image/png',
          '.jpg': 'image/jpeg',
          '.gif': 'image/gif',
          '.svg': 'image/svg+xml',
      }[extname] || 'application/octet-stream';
  
      fs.readFile(filePath, (err, content) => {
          if (err) {
              if (err.code === 'ENOENT') {
                  // Serve 404.html if it exists
                  const notFoundPage = path.join(DIRECTORY, '404.html');
                  fs.readFile(notFoundPage, (notFoundErr, notFoundContent) => {
                      if (notFoundErr) {
                          res.writeHead(404, { 'Content-Type': 'text/plain' });
                          res.end('404 Not Found');
                      } else {
                          res.writeHead(404, { 'Content-Type': 'text/html' });
                          res.end(notFoundContent, 'utf-8');
                      }
                  });
              } else {
                  // Serve 500.html if it exists
                  const errorPage = path.join(DIRECTORY, '500.html');
                  fs.readFile(errorPage, (errorPageErr, errorPageContent) => {
                      if (errorPageErr) {
                          res.writeHead(500, { 'Content-Type': 'text/plain' });
                          res.end('500 Internal Server Error');
                      } else {
                          res.writeHead(500, { 'Content-Type': 'text/html' });
                          res.end(errorPageContent, 'utf-8');
                      }
                  });
              }
          } else {
              res.writeHead(200, { 'Content-Type': contentType });
              res.end(content, 'utf-8');
          }
      });
  });

    server.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
    });
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
      error.error(`Illegal type \"${dataType}\" when performing GT.`);
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
      error.error(`Illegal type \"${dataType}\" when performing GTE.`);
    }

    function ins_import(file) {
      if (importedFiles.includes(path.resolve(file))) {
        return;
      }
      importedFiles.unshift(path.resolve(file));

      
      try {
        const data = fs.readFileSync(path.resolve(file), 'utf8');
        run(run(data, false, path.resolve(file), importedFiles), true, path.resolve(file), importedFiles);
      } catch (err) {
          error.error("Unknown error in file " + path.resolve(file) + " while trying to import. Please make sure that the file exists.");
      }
    
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
        return;
      }
      error.error(`Illegal type \"${dataType}\" when performing MUL.`);
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

    // instruction QUIT
    function ins_quit() {
      process.exit(0);
    }

    // instruction READ
    function ins_read(file_name, variable){
      try {
        boxes[variable] = fs.readFileSync(path.resolve(file_name), 'utf8');
      } catch (err) {
          error.error("Error while trying reading file \"" + path.resolve(file_name) + "\"");
      }
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
      error.error(`Illegal type \"${dataType}\" when performing ST.`);
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
      error.error(`Illegal type \"${dataType}\" when performing STE.`);
    }
      // instruction SUB
    function ins_sub(dataType, op1, op2) {
      if (dataType.toLowerCase() == "num") {
        // if minuend is a variable name but subtrahend is a number
        if (isNaN(Number(op1)) && !isNaN(Number(op2))) {
          boxes[op1] -= Number(op2);
        // if both numbers are variable names
        } else if ((isNaN(Number(op1))) && (isNaN(Number(op2)))) {
          boxes[op1] -= Number(boxes[op2]);
        }
        return;
      }
      error.error(`Illegal type \"${dataType}\" when performing SUB.`);
    }

    // instruction WRITE
    function ins_write(file_name, contents) {
      let the_thing = contents;
      for(let i = firstInsIdx + 3; i < current_ln.length; i ++) {
        the_thing += " " + current_ln[i];
      }

      try {
        fs.writeFileSync(path.resolve(file_name), the_thing);
      } catch (err) {
        error.error(`Error writing to file \"${file_name}\"`);
      }
    }

    // instruction WRITEV
    function ins_writev(file_name, variable) {
      try {
        fs.writeFileSync(path.resolve(file_name), String(boxes[variable]));
      } catch (err) {
        error.error(`Error writing to file \"${file_name}\"`);
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
        case "import" : ins_import(o1);      break;
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
        case "and"    : ins_and(o1, o2, o3); break;
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
        case "import" :                      break;
        case "jump"   : ins_jump(o1);        break;
        case "jumpv"  : ins_jumpv(o1, o2);   break;
        case "label"  :                      break;
        case "mul"    : ins_mul(o1, o2, o3); break;
        case "neqc"   : ins_neqc(o1,o2,o3);  break;
        case "neqv"   : ins_neqv(o1,o2,o3);  break;
        case "not"    : ins_not(o1);         break;
        case "or"     : ins_or(o1, o2, o3);  break;
        case "print"  : ins_print(o1);       break;
        case "printc" : ins_printc(o1);      break;
        case "println": ins_println();       break;
        case "prints" : ins_prints();        break;
        case "quit"   : ins_quit();          break;
        case "read"   : ins_read(o1, o2);    break;
        case "ret"    : ins_ret();           break;
        case "server" : ins_server(o1,o2);   break;
        case "set"    : ins_set(o1, o2, o3); break;
        case "st"     : ins_st(o1, o2, o3);  break;
        case "ste"    : ins_ste(o1, o2, o3); break;
        case "sub"    : ins_sub(o1, o2, o3); break;
        case "write"  : ins_write(o1, o2);   break;
        case "writev" : ins_writev(o1, o2);  break;
        
        default: error.error("Unknown instruction: " + fi);
      }
    }

    if(repl) {
      console.log(`SIMAS Programming Language Shell v${common.version} ${common.copyright}`);
      console.log(`Type !help for more information.`)
      console.log();
      try {
        while(true) {
          process.stdout.write("$ ");
          inputText = readline.question();

          if (inputText == ";") {
            continue;
          }
          else if (inputText.toLowerCase() == "!quit") {
            process.exit(0);
          }
          else if (inputText.toLowerCase() == "!clear") {
            console.clear();
            continue;
          }

          else if (inputText.toLowerCase() == "!simas") {
            console.log("life is like a door ");
            console.log("never trust a cat");
            console.log("because the moon can\'t swim");
            console.log("");
            console.log("but they live in your house ");
            console.log("even though they don\'t like breathing in");
            console.log("dead oxygen that\'s out of warranty");
            console.log("");
            console.log("when the gods turn to glass");
            console.log("you'll be drinking lager out of urns");
            console.log("and eating peanut butter with mud");
            console.log("");
            console.log("bananas wear socks in the basement");
            console.log("because time can\'t tie its own shoes");
            console.log("and the dead spiders are unionizing");
            console.log("");
            console.log("and a microwave is just a haunted suitcase");
            console.log("henceforth gravity owes me twenty bucks");
            console.log("because the couch is plotting against the fridge");
            console.log("");
            console.log("when pickles dream in binary");
            console.log("the mountan dew solidifies");
            console.log("into a 2007 toyota corrola");
            continue;
          }

          else if (inputText.toLowerCase() == "!help") {
            console.log("This is the SIMAS shell, where you can execute SIMAS code line-by-line.");
            console.log("Useful commands:");
            console.log("");
            console.log("!clear -> clear the console");
            console.log("!quit -> exit the shell");
            console.log("!help -> to display this message");
            console.log("!simas -> to display a poem");
            console.log("");
            console.log("For information on how to use the SIMAS Runtime, leave this shell and use the -h flag.");
            console.log("If you have no idea what this is, visit https://github.com/turrnut/simas for more information.");
            console.log("Have fun!");
            console.log("");
            continue;
          }
          compile();
          interpret();
          inputText = "";
          instructions = [];
        }
      } catch(err) {
        error.error("Something went wrong.");
        process.exit(1);
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

    function interpret(){
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
        
        
        if ((inFunction) && (!execFunction) && (current_ln[firstInsIdx].toLowerCase() != "end")) continue;
        
        dispatcher(firstInsIdx);
        
      }
      // Uncomment to see compiled instructions
      // console.log(instructions);
    }
    interpret();
  }
  
module.exports = {run};

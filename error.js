let current_ln_str = [];
let current_file;
function setCurrentFile(currentfile) {
    current_file = currentfile;
}

function setCurrentLine(current_ln) {
    current_ln_str = "";
    for (let i = 0; i < current_ln.length; i ++) {
        current_ln_str += current_ln[i];
        current_ln_str += " ";
    }
}

function error(message) {
    console.log();
    console.log(`RUNTIME ERROR:\n  \"${current_ln_str}\"\n  At file ${current_file}\n${message}`);
    process.exit(1);
}

module.exports = {error, setCurrentLine, setCurrentFile};
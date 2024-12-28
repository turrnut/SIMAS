// a file that is included in both compiler.js and program.js

const version = "1.1"
const compiler_information = "SIMAS Programming Language Compiler v" + version + "\nCopyright (c) 2024 Turrnut\n\n" + "Usage: \n  simasc [path to file]\n    to compile a file\n\n  simasc -h\n    to display this message\n\n";
const runtime_information = "SIMAS Programming Language v" + version + "\nCopyright (c) 2024 Turrnut\n\n"           +  "Usage: \n  simas [path to file]\n    to run a file\n\n  simas -h\n    to display this message\n\n" + "\n  simas init [project name]\n    to inititalize a project\n\n";
const xkey = 71;
function xString(inputStr) {
    return Array.from(inputStr)
      .map(char => String.fromCharCode(char.charCodeAt(0) ^ xkey))
      .join('');
}

module.exports = {xkey, xString, runtime_information, compiler_information};

// a file that is included in both compiler.js and program.js

const version = "0.0.2"
const compiler_information = "SIMAS Programming Language Compiler v" + version + "\nCopyright (c) 2024 Turrnut\n";
const runtime_information = "SIMAS Programming Language v" + version + "\nCopyright (c) 2024 Turrnut\n";
const xkey = 71;
function xString(inputStr) {
    return Array.from(inputStr)
      .map(char => String.fromCharCode(char.charCodeAt(0) ^ xkey))
      .join('');
}

module.exports = {xkey, xString, runtime_information, compiler_information};

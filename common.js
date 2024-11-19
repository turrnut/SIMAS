// a file that is included in both compiler.js and program.js

const xkey = 71;
function xString(inputStr) {
    return Array.from(inputStr)
      .map(char => String.fromCharCode(char.charCodeAt(0) ^ xkey))
      .join('');
}

module.exports = {xkey, xString};

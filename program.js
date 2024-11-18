var fs = require('fs');
var simas = require('./simas');

if (process.argv[2] == "-i") {
    process.stdout.write("SIMAS Programming Language v0.0.1\nCopyright (c) 2024 Turrnut");
} else {
    
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        simas.run(data);
    });
}
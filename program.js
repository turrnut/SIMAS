var fs = require('fs');
var simas = require('./simas');

if (process.argv[2] == "-i") {
    process.stdout.write("SIMAS Programming Language v0.0.1\nCopyright (c) 2024 Turrnut\n");
} else {
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file:\n" + err + "\n");
            process.exit(1);
        }
        simas.run(data);
    });
}

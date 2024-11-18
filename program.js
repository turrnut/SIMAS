var fs = require('fs');
var simas = require('./simas');

if (process.argv[2] == "-i") {
    process.stdout.write("SIMAS Programming Language v0.0.1\nCopyright (c) 2024 Turrnut\n");
} else {
<<<<<<< HEAD
    
=======
>>>>>>> 0d14aa796039726407ca89b42e5a630d05cdb711
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file:\n" + err + "\n");
            process.exit(1);
        }
        simas.run(data);
    });
}

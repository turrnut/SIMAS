let fs = require('fs');
let simas = require('./simas');
let common = require('./common');

if (process.argv[2] == "-i") {
    process.stdout.write(common.runtime_information);
} else {
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file: " + err.path + "\n");
            process.exit(1);
        }
        simas.run(JSON.parse(common.xString(data)), true);
    });
}

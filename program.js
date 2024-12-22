let fs = require('fs');
let simas = require('./simas');
let common = require('./common');

if(!process.argv[2]) {
    process.stderr.write("Error: Please provide an input file to run.\n");
    process.exit(1);
}

if (process.argv[2] == "-h") {
    process.stdout.write(common.runtime_information);
} else {
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file: " + err.path + "\n");
            process.exit(1);
        }
        try {
        simas.run(JSON.parse(common.xString(data)), true, process.argv[2]);
        } catch(err) {
            // console.log("Something went wrong.");
            console.log(err);
        }
    });
}

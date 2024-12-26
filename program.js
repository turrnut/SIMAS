let fs = require('fs');
let path = require("path");
let simas = require('./simas');
let common = require('./common');
let tools = require("./util/tools");

if(!process.argv[2]) {
    process.stderr.write("Error: Please provide an input file to run.\nUse the flag -h for help.\n");
    process.exit(1);
}

if (process.argv[2].toLowerCase() == "-h") {
    process.stdout.write(common.runtime_information);
} else if (process.argv[2].toLowerCase() == "init") {
    if(process.argv.length < 4) {
        process.stderr.write("Error: Please provide a name for your project.\n");
        process.exit(1);
    }
    tools.createProjectFolder(process.argv[3]);
} else {
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file: " + err.path + "\n");
            process.exit(1);
        }
        try {
        simas.run(JSON.parse(common.xString(data)), true, process.argv[2], []);
        } catch(err) {
            console.log("Something went wrong.");
            // console.log(err);
        }
    });
}

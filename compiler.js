let fs = require('fs');
let simas = require('./simas');
let common = require('./common');

// Compiled Simple Assembly
const compiledFileExtension = ".csa";

if(!process.argv[2]) {
    process.stderr.write("Error: Please provide an input file to compile.\n");
    process.exit(1);
}

if (process.argv[2] == "-i") {
    process.stdout.write(common.compiler_information);
} else {
    var ins = "";
    fs.readFile(process.argv[2], 'utf8', function (err, data) {
        if (err) {
            process.stderr.write("Error opening file: " + err.path + "\n");
            process.exit(1);
        }
        ins = JSON.stringify(simas.run(data, false, process.argv[2]), null, 0); // last argument could be 4

        let target;
        if (process.argv[2]) {
            target = process.argv[2].replace(/\.[^/.]+$/, compiledFileExtension);
        }
    
        fs.writeFile(target, common.xString(ins), 'utf8', (err) => {
            if (err) {
                process.stderr.write('Error compiling to file:' + err.path + "\n");
                return;
            }
    
            process.stdout.write('Compiled file: ' + process.argv[2] + ' to ' + target);
        }); 
    });
}
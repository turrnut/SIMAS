npm install -g pkg
mkdir bin
cd bin
mkdir compiler
mkdir runtime
cd compiler
pkg ../../compiler.js && cd ..
cd runtime
pkg ../../program.js
cd ../..

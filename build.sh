sudo apt-get install nodejs
npm install -g typescript
npm install -g rcedit
npm install -g pkg
cd util
tsc
cd ..
mkdir bin
cd bin
mkdir win
mkdir macos
mkdir linux
cd win
pkg -t node18-win-x64 -o simasc.exe ../../compiler.js
pkg -t node18-win-x64 -o simas.exe ../../program.js
cd ..
cd macos
pkg -t node18-macos-x64 -o simasc  ../../compiler.js
pkg -t node18-macos-x64 -o simas ../../program.js
chmod +x ./simasc
chmod +x ./simas
cd linux
pkg -t node18-linux-x64 -o simasc  ../../compiler.js
pkg -t node18-linux-x64 -o simas ../../program.js
chmod +x ./simasc
chmod +x ./simas
cd ../..

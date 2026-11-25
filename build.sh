sudo apt-get update
sudo apt-get install nodejs
sudo npm install -g typescript
sudo npm install -g pkg
cd util
tsc
cd ..
mkdir bin
cd bin
mkdir windows
mkdir macos
mkdir linux
cd windows
pkg -t node18-win-x64 -o simasc.exe ../../compiler.js
pkg -t node18-win-x64 -o simas.exe ../../program.js
cd ..
cd macos
pkg -t node18-macos-x64 -o simasc  ../../compiler.js
pkg -t node18-macos-x64 -o simas ../../program.js
chmod +x ./simasc
chmod +x ./simas
cd ..
cd linux
pkg -t node18-linux-x64 -o simasc  ../../compiler.js
pkg -t node18-linux-x64 -o simas ../../program.js
chmod +x ./simasc
chmod +x ./simas
cd ../..

@echo off

REM Install global npm packages
echo SIMAS:  Installing TypeScript...
call npm install typescript
call npm install --save-dev @types/node
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to install TypeScript
    exit /b %errorlevel%
)

echo SIMAS:  Installing pkg...
call npm install -g pkg
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to install pkg
    exit /b %errorlevel%
)

REM Change to the util directory and run TypeScript compiler
echo SIMAS:  Changing to util directory...
cd util
if not %errorlevel%==0 (
    echo SIMAS:  Failed to change directory to util
    exit /b %errorlevel%
)

echo SIMAS:  Running TypeScript Compiler...
call node ../node_modules/typescript/lib/tsc.js
if %errorlevel% neq 0 (
    echo SIMAS:  TypeScript compilation failed
    exit /b %errorlevel%
)
cd ..

REM Create bin directory structure
echo SIMAS:  Creating directory structure...
mkdir bin
cd bin
mkdir windows
mkdir macos
mkdir linux

REM Build for Windows
echo SIMAS:  Building for Windows...
cd windows
call pkg -t node18-win-x64 -o simasc.exe ..\..\compiler.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simasc.exe for Windows
    exit /b %errorlevel%
)
call pkg -t node18-win-x64 -o simas.exe ..\..\program.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simas.exe for Windows
    exit /b %errorlevel%
)

cd ..

REM Build for macOS
echo SIMAS:  Building for macOS...
cd macos
call pkg -t node18-macos-x64 -o simasc ..\..\compiler.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simasc for macOS
    exit /b %errorlevel%
)
call pkg -t node18-macos-x64 -o simas ..\..\program.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simas for macOS
    exit /b %errorlevel%
)
cd ..

REM Build for Linux
echo SIMAS:  Building for Linux...
cd linux
call pkg -t node18-linux-x64 -o simasc ..\..\compiler.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simasc for Linux
    exit /b %errorlevel%
)
call pkg -t node18-linux-x64 -o simas ..\..\program.js
if %errorlevel% neq 0 (
    echo SIMAS:  Failed to build simas for Linux
    exit /b %errorlevel%
)
cd ..

cd ..

echo SIMAS:  Script completed.

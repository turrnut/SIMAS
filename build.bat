@echo off

REM Install global npm packages
echo Installing TypeScript...
call npm install -g typescript
if %errorlevel% neq 0 (
    echo Failed to install TypeScript
    exit /b %errorlevel%
)

echo Installing pkg...
call npm install -g pkg
if %errorlevel% neq 0 (
    echo Failed to install pkg
    exit /b %errorlevel%
)

REM Change to the util directory and run TypeScript compiler
echo Changing to util directory...
cd util
if not %errorlevel%==0 (
    echo Failed to change directory to util
    exit /b %errorlevel%
)

echo Running TypeScript Compiler...
call tsc
if %errorlevel% neq 0 (
    echo TypeScript compilation failed
    exit /b %errorlevel%
)
cd ..

REM Create bin directory structure
echo Creating directory structure...
mkdir bin
cd bin
mkdir win
mkdir macos
mkdir linux

REM Build for Windows
echo Building for Windows...
cd win
call pkg -t node18-win-x64 -o simasc.exe ..\..\compiler.js
if %errorlevel% neq 0 (
    echo Failed to build simasc.exe for Windows
    exit /b %errorlevel%
)
call pkg -t node18-win-x64 -o simas.exe ..\..\program.js
if %errorlevel% neq 0 (
    echo Failed to build simas.exe for Windows
    exit /b %errorlevel%
)

cd ..

REM Build for macOS
echo Building for macOS...
cd macos
call pkg -t node18-macos-x64 -o simasc ..\..\compiler.js
if %errorlevel% neq 0 (
    echo Failed to build simasc for macOS
    exit /b %errorlevel%
)
call pkg -t node18-macos-x64 -o simas ..\..\program.js
if %errorlevel% neq 0 (
    echo Failed to build simas for macOS
    exit /b %errorlevel%
)
cd ..

REM Build for Linux
echo Building for Linux...
cd linux
call pkg -t node18-linux-x64 -o simasc ..\..\compiler.js
if %errorlevel% neq 0 (
    echo Failed to build simasc for Linux
    exit /b %errorlevel%
)
call pkg -t node18-linux-x64 -o simas ..\..\program.js
if %errorlevel% neq 0 (
    echo Failed to build simas for Linux
    exit /b %errorlevel%
)
cd ..

cd ..

echo Script completed.

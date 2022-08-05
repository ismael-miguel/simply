@echo off
setlocal EnableDelayedExpansion

REM https://ss64.com/nt/errorlevel.html <-- recommends .cmd instead of .bat

set "ROOT=%~dp0"

REM Fetches the first line of the command, if it is successful
set "PYPATH="
for /f "tokens=* usebackq" %%p in (`where python`) do (set "PYPATH=%%p" & goto :next)
:next


REM Handles errors when running `where python`
IF ERRORLEVEL 1 (
	echo [31mError ^(%ERRORLEVEL%^):[0m Failed obtaining the Python path.
	echo Please make sure that the command 'where python' returns the correct path.
	exit /b 255
) ELSE IF "!PYPATH!" EQU "" (
	echo [31mError:[0m No Python installation found.
	echo Please make sure that the command 'where python' returns the correct path.
	exit /b 255
)


"!PYPATH!" "!ROOT!server.py"

IF ERRORLEVEL 1 (
	echo [31mError ^(%ERRORLEVEL%^):[0m Failed starting the server.
	exit /b %ERRORLEVEL%
) ELSE (
	exit /b 0
)

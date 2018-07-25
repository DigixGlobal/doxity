@SET PWD=%~dp0

@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe" "%PWD%\lib\bin\doxity.js" %*
) ELSE (
  @SETLOCAL
  @SET PATHEXT=%PATHEXT:;.JS;=;%
  node "%PWD%\lib\bin\doxity.js" %*
)

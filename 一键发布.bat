@echo off
chcp 65001 >nul
setlocal

REM === 你的仓库目录（如果你把 publish.bat 放在 static 目录里，这行不用改）===
cd /d "%~dp0"

echo.
echo ====== 一键发布开始 ======
echo 当前目录：%cd%
echo.

REM 1) 确认是 git 仓库
if not exist ".git" (
  echo [错误] 当前目录没有 .git，说明这里不是仓库根目录。
  echo 你需要把 publish.bat 放到 git 仓库根目录（static 目录里如果就是仓库根就没问题）。
  pause
  exit /b 1
)

REM 2) 查看是否有改动
git status --porcelain >nul 2>&1
if errorlevel 1 (
  echo [错误] git 命令不可用或仓库异常。请确认已安装 Git。
  pause
  exit /b 1
)

for /f %%A in ('git status --porcelain ^| find /c /v ""') do set CHANGED=%%A
if "%CHANGED%"=="0" (
  echo [提示] 没有任何改动（nothing to commit）。
  pause
  exit /b 0
)

REM 3) add
echo [1/3] git add .
git add .
if errorlevel 1 (
  echo [错误] git add 失败
  pause
  exit /b 1
)

REM 4) commit（支持传入自定义说明：publish.bat "更新首页"）
set MSG=%*
if "%MSG%"=="" (
  for /f "tokens=1-2 delims=:" %%a in ("%time%") do set T=%%a%%b
  set MSG=update %date% %T%
)

echo [2/3] git commit -m "%MSG%"
git commit -m "%MSG%"
if errorlevel 1 (
  echo [提示] commit 可能失败（比如没有改动或未配置用户名邮箱）。
  echo 你可以先运行：
  echo   git config --global user.name "你的名字"
  echo   git config --global user.email "你的邮箱"
  pause
  exit /b 1
)

REM 5) push
echo [3/3] git push
git push
if errorlevel 1 (
  echo.
  echo [错误] push 失败。常见原因：网络/权限/remote 配置。
  echo 你可以运行：git remote -v 检查是否是 SSH（git@github.com:...）
  pause
  exit /b 1
)

echo.
echo ✅ 发布完成！等待 30~90 秒刷新你的网站即可。
pause
endlocal

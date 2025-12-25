# 修复 Prisma 权限问题的脚本
# 停止所有 Node 进程（除了 Cursor 的），然后重新生成 Prisma Client

Write-Host "正在停止 Node 进程..." -ForegroundColor Yellow

# 停止所有 Node 进程（排除 Cursor）
Get-Process node -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -notlike "*cursor*" -and $_.Path -notlike "*Cursor*"
} | ForEach-Object {
    Write-Host "停止进程: $($_.Id) - $($_.ProcessName)" -ForegroundColor Gray
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 2

Write-Host "`n正在删除 Prisma Client..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "正在重新生成 Prisma Client..." -ForegroundColor Yellow
npx prisma generate

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Prisma Client 生成成功！" -ForegroundColor Green
} else {
    Write-Host "`n✗ 生成失败，请检查错误信息" -ForegroundColor Red
}


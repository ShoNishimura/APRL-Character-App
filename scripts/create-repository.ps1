param(
  [ValidateSet('public','private')]
  [string]$Visibility
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  throw 'GitHub CLI (gh) が必要です。https://cli.github.com/ からインストールしてください。'
}

gh auth status

if (-not $Visibility) {
  $Visibility = Read-Host 'Repository visibility (public/private)'
  if ($Visibility -notin @('public','private')) { throw 'public または private を指定してください。' }
}

if (-not (Test-Path .git)) { git init -b main }
git add .
git commit -m 'Create APRL Character App MVP v0.1'
gh repo create ShoNishimura/APRL-Character-App --$Visibility --source . --remote origin --push

Write-Host 'Created: https://github.com/ShoNishimura/APRL-Character-App'

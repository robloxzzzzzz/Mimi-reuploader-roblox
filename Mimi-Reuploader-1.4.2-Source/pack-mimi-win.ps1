param(
  [Parameter(Mandatory = $true)][string]$ElectronDirectory,
  [Parameter(Mandatory = $true)][string]$StagingDirectory
)
$ErrorActionPreference = 'Stop'
$project = $PSScriptRoot
$staging = (New-Item -ItemType Directory -Force -Path $StagingDirectory).FullName
$electron = (Resolve-Path -LiteralPath $ElectronDirectory).Path
$unpacked = Join-Path $staging 'app'
$resources = Join-Path $electron 'resources'

function Copy-ApplicationFiles($source, $destination) {
  $target = Join-Path $unpacked $destination
  New-Item -ItemType Directory -Path (Split-Path $target -Parent) -Force | Out-Null
  Copy-Item -LiteralPath (Join-Path $project $source) -Destination $target -Recurse
}

Copy-ApplicationFiles 'dist-main/app.js' 'dist-main/app.js'
Copy-ApplicationFiles 'src/assets' 'src/assets'
Copy-ApplicationFiles 'src/preload' 'src/preload'
Copy-ApplicationFiles 'src/renderer-react/dist' 'src/renderer-react/dist'
Copy-ApplicationFiles 'LICENSE' 'LICENSE'
Copy-ApplicationFiles 'NOTICE.md' 'NOTICE.md'
Copy-ApplicationFiles 'node_modules/keytar/package.json' 'node_modules/keytar/package.json'
Copy-ApplicationFiles 'node_modules/keytar/LICENSE.md' 'node_modules/keytar/LICENSE.md'
Copy-ApplicationFiles 'node_modules/keytar/lib' 'node_modules/keytar/lib'
Copy-ApplicationFiles 'node_modules/keytar/build/Release/keytar.node' 'node_modules/keytar/build/Release/keytar.node'
Copy-ApplicationFiles 'node_modules/luaparse' 'node_modules/luaparse'

$manifest = Get-Content (Join-Path $project 'package.json') -Raw | ConvertFrom-Json
$runtimeManifest = [ordered]@{
  name = $manifest.name; productName = 'Mimi Reuploader'
  version = $manifest.version; main = $manifest.main; license = $manifest.license
}
$runtimeManifest | ConvertTo-Json | Set-Content (Join-Path $unpacked 'package.json') -Encoding utf8
$asarCli = Join-Path $project 'node_modules/@electron/asar/bin/asar.js'
node $asarCli pack $unpacked (Join-Path $resources 'app.asar') --unpack '*.node' --unpack-dir 'src/assets'
if ($LASTEXITCODE -ne 0) { throw 'Application packing failed' }

$defaultApp = Join-Path $resources 'default_app.asar'
if (Test-Path -LiteralPath $defaultApp) { Remove-Item -LiteralPath $defaultApp }
Rename-Item -LiteralPath (Join-Path $electron 'electron.exe') -NewName 'Mimi Reuploader.exe'


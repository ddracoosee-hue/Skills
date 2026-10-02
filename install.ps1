# Links this repo's skills/ folder to ~/.agents/skills so Muse loads it in every project.
# A junction needs no admin rights. If ~/.agents/skills already exists and is not a link, it is
# left alone and the script stops, so nothing is overwritten.
$ErrorActionPreference = 'Stop'
$source = Join-Path $PSScriptRoot 'skills'
$agents = Join-Path $HOME '.agents'
$target = Join-Path $agents 'skills'

New-Item -ItemType Directory -Force -Path $agents | Out-Null

if (Test-Path $target) {
    $item = Get-Item $target -Force
    if ($item.LinkType -eq 'Junction' -or $item.LinkType -eq 'SymbolicLink') {
        Write-Host "Already linked: $target -> $($item.Target)"
        exit 0
    }
    Write-Error "$target exists and is a real folder. Move its skills into $source, delete it, then rerun."
}

New-Item -ItemType Junction -Path $target -Target $source | Out-Null
Write-Host "Linked $target -> $source. Restart Muse and run /skills."

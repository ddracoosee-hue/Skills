# Links each skill in this repo into the Muse user-skills folder, one junction per skill, and turns on
# the repo's pre-commit secret scan. Muse runs natively in PowerShell on this PC.
#
#   powershell -ExecutionPolicy Bypass -File install.ps1 [-Target <folder>] [-WhatIf]
#
# Target defaults to $HOME\.agents\skills. VERIFIED.md #4 records which folder `muse skills list`
# actually reads on this PC; pass -Target if it differs.
# Safe by design: a real folder or a link that points elsewhere is never replaced; only junctions
# that point into this repo are created or removed. Removing a junction never deletes its contents.
[CmdletBinding(SupportsShouldProcess)]
param([string]$Target = (Join-Path $HOME '.agents\skills'))
$ErrorActionPreference = 'Stop'
$repoSkills = (Resolve-Path (Join-Path $PSScriptRoot 'skills')).Path

# The first version of this script linked the whole folder. Replace that single link with a real folder.
if (Test-Path $Target) {
    $t = Get-Item $Target -Force
    if ($t.LinkType) {
        $dest = [string]($t.Target | Select-Object -First 1)
        if ($dest -ine $repoSkills) { throw "$Target is a link to $dest, not to this repo. Resolve it by hand." }
        if ($PSCmdlet.ShouldProcess($Target, 'replace whole-folder junction with a real folder')) { $t.Delete() }
        Write-Host "Replaced the old whole-folder link at $Target"
    }
}
New-Item -ItemType Directory -Force -Path $Target | Out-Null

# Remove junctions this repo created whose skill no longer exists (renamed or retired skills).
Get-ChildItem -Path $Target -Force | Where-Object { $_.LinkType -eq 'Junction' } | ForEach-Object {
    $dest = [string]($_.Target | Select-Object -First 1)
    if ($dest.StartsWith($repoSkills, [StringComparison]::OrdinalIgnoreCase) -and -not (Test-Path $dest)) {
        if ($PSCmdlet.ShouldProcess($_.FullName, 'remove dangling junction')) { $_.Delete() }
        Write-Host "Removed dangling link $($_.Name)"
    }
}

$linked = 0
# Skills are grouped by function in the repo (skills\<category>\<skill>); Muse gets one flat list.
Get-ChildItem -Path $repoSkills -Directory | Get-ChildItem -Directory |
    Where-Object { Test-Path (Join-Path $_.FullName 'SKILL.md') } | ForEach-Object {
    $link = Join-Path $Target $_.Name
    if (Test-Path $link) {
        $item = Get-Item $link -Force
        $dest = [string]($item.Target | Select-Object -First 1)
        if ($item.LinkType -and $dest -ieq $_.FullName) { $linked++; return }
        Write-Warning "Skipped $($_.Name): $link already exists and is not this repo's link."
        return
    }
    if ($PSCmdlet.ShouldProcess($link, "junction to $($_.FullName)")) {
        New-Item -ItemType Junction -Path $link -Target $_.FullName | Out-Null
        $linked++
    }
}

git -C $PSScriptRoot config core.hooksPath .githooks
Write-Host "$linked skill(s) linked into $Target. Pre-commit scan enabled. Restart Muse, then run: muse skills list"

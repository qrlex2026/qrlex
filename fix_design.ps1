$enc = [System.Text.Encoding]::UTF8
$f = 'c:\Users\gebze\Desktop\qrlex\app\panel\design\page.tsx'
$lines = [IO.File]::ReadAllLines($f, $enc)
Write-Host "Before: $($lines.Length)"

# Keep:
# - Lines 0..979 (header section of sub-panel ends, inclusive)
# - Lines 1771..1866 (sub-panel close + Mini AI Input + RIGHT PANEL header section)  
# - Lines 2155..end (RIGHT PANEL close + outer closes)
# Skip:
# - Lines 980..1770 (sub-panel: themes/welcome/position/general/font/bottomnav/detail/search/drawer sections)
# - Lines 1867..2154 (RIGHT PANEL: themes/welcome/... sections)

$result = [System.Collections.Generic.List[string]]::new()
for ($i = 0; $i -lt $lines.Length; $i++) {
    $skip = ($i -ge 980 -and $i -le 1770) -or ($i -ge 1867 -and $i -le 2154)
    if (-not $skip) {
        $result.Add($lines[$i])
    }
}

Write-Host "After: $($result.Count)"
[IO.File]::WriteAllLines($f, $result.ToArray(), $enc)
Write-Host "Done!"

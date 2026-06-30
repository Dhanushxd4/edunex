Set-Location 'C:\Users\admin\Downloads\edunex\frontend'
$src = 'frontend-kppmjj3f5-dhanushxd4s-projects.vercel.app'

Write-Output '=== Remove broken alias ==='
vercel alias rm edunexapp.vercel.app --yes 2>&1

$candidates = @(
    'edunex-portal.vercel.app',
    'edunex-school.vercel.app',
    'edunex-platform.vercel.app',
    'edunexplatform.vercel.app',
    'edunexschool.vercel.app'
)

foreach ($alias in $candidates) {
    Write-Output ("=== Trying $alias ===")
    $result = vercel alias set $src $alias 2>&1
    Write-Output $result
    if ($result -match 'Success') {
        Write-Output ("WINNER: $alias")
        break
    }
}
Write-Output 'DONE'

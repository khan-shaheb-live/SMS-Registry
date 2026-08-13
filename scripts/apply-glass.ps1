$files = @(
  'app\staff\assessments\page.tsx',
  'app\staff\submissions\page.tsx',
  'app\staff\results\page.tsx',
  'app\staff\students\[id]\page.tsx',
  'app\staff\programmes\page.tsx'
)

foreach ($file in $files) {
  if (-not (Test-Path $file)) { Write-Host "SKIP: $file"; continue }
  $content = Get-Content $file -Raw
  
  # Glass table containers
  $content = $content -replace 'bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm', 'bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.07)]'
  $content = $content -replace 'bg-white border border-slate-200 rounded-xl p-6 shadow-sm', 'bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] p-6 shadow-[0_4px_24px_rgba(15,23,42,0.07)]'
  $content = $content -replace 'bg-white border border-slate-200 rounded-lg overflow-hidden', 'bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.07)]'
  $content = $content -replace 'bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden', 'bg-white/70 backdrop-blur-[20px] border border-white/65 rounded-[20px] overflow-hidden shadow-[0_4px_24px_rgba(15,23,42,0.07)]'
  
  # Row hover
  $content = $content -replace 'hover:bg-slate-50/50 transition-colors', 'hover:bg-indigo-50/20 transition-colors duration-100'
  $content = $content -replace '"hover:bg-slate-50 transition-colors"', '"hover:bg-indigo-50/20 transition-colors duration-100"'
  
  Set-Content $file $content -NoNewline
  Write-Host "Updated: $file"
}

Write-Host "Done"

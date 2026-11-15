# Génère les fichiers audio locaux (MP3) avec les voix Windows (SAPI) + ffmpeg.
# Usage : npm run audio   (nécessite Windows, une voix anglaise et une voix française, et ffmpeg)
# Les fichiers existants ne sont pas regénérés. Les MP3 sont versionnés dans public/audio.
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
npx vite-node scripts/audio-list.ts
$list = Get-Content scripts/.audio-list.json -Raw -Encoding UTF8 | ConvertFrom-Json
Add-Type -AssemblyName System.Speech
$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voices = $synth.GetInstalledVoices() | ForEach-Object { $_.VoiceInfo }
$en = ($voices | Where-Object { $_.Culture.Name -like 'en-*' } | Select-Object -First 1).Name
$fr = ($voices | Where-Object { $_.Culture.Name -like 'fr-*' } | Select-Object -First 1).Name
if (-not $en -or -not $fr) { throw "Voix anglaise ou française introuvable (en=$en, fr=$fr)" }
$tmp = Join-Path $env:TEMP 'nova-audio'
New-Item -ItemType Directory -Force $tmp | Out-Null
$done = 0
foreach ($it in $list) {
  $out = Join-Path 'public/audio' ($it.key + '.mp3')
  if (Test-Path $out) { continue }
  New-Item -ItemType Directory -Force (Split-Path $out -Parent) | Out-Null
  $wav = Join-Path $tmp 'clip.wav'
  $synth.SelectVoice($(if ($it.lang -eq 'en') { $en } else { $fr }))
  $synth.Rate = $(if ($it.lang -eq 'en') { -2 } else { -1 })
  $synth.SetOutputToWaveFile($wav)
  $synth.Speak($it.text)
  $synth.SetOutputToNull()
  & ffmpeg -loglevel error -y -i $wav -ac 1 -ar 22050 -b:a 40k $out
  $done++
}
$keys = $list | ForEach-Object { $_.key } | Sort-Object
[IO.File]::WriteAllText((Join-Path (Get-Location) "public/audio/manifest.json"), (ConvertTo-Json @($keys) -Compress), (New-Object System.Text.UTF8Encoding($false)))
Write-Host "$done nouveaux fichiers audio ; $($keys.Count) au total."

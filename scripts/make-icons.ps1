# Génère les icônes PNG de la PWA (192 et 512 px) avec System.Drawing.
Add-Type -AssemblyName System.Drawing
foreach ($size in 192, 512) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.Clear([System.Drawing.Color]::FromArgb(255, 20, 18, 58))
  $s = $size / 64.0
  $bg = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 45, 43, 125))
  $g.FillEllipse($bg, 6 * $s, 6 * $s, 52 * $s, 52 * $s)
  $pts = @(@(32,12),@(36.5,27.5),@(52,32),@(36.5,36.5),@(32,52),@(27.5,36.5),@(12,32),@(27.5,27.5)) | ForEach-Object { New-Object System.Drawing.PointF ($_[0] * $s), ($_[1] * $s) }
  $rect = New-Object System.Drawing.RectangleF (12 * $s), (12 * $s), (40 * $s), (40 * $s)
  $br = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromArgb(255,255,201,74)), ([System.Drawing.Color]::FromArgb(255,255,107,139)), 45
  $g.FillPolygon($br, $pts)
  $dot = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 79, 214, 200))
  $g.FillEllipse($dot, 44 * $s, 13 * $s, 6 * $s, 6 * $s)
  $bmp.Save((Join-Path (Get-Location) "public/icons/icon-$size.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose(); $bmp.Dispose()
}

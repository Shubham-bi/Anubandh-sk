Add-Type -AssemblyName System.Drawing

function Draw-AnubandhIcon {
    param(
        [int]$size,
        [string]$outPath,
        [bool]$isMaskable = $false
    )

    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = "AntiAlias"
    $g.TextRenderingHint = "AntiAliasGridFit"
    $g.InterpolationMode = "HighQualityBicubic"
    $g.PixelOffsetMode = "HighQuality"

    # Scale factor
    # For maskable icons, scale down to 82% to fit Android's safe zone
    $contentScale = if ($isMaskable) { 0.82 } else { 1.0 }
    $scale = ($size / 512.0) * $contentScale
    $offsetShift = if ($isMaskable) { ($size * (1.0 - $contentScale)) / 2.0 } else { 0.0 }

    # 1. Background Fill
    if ($isMaskable) {
        # Full bleed background for adaptive icons
        $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
            (New-Object System.Drawing.PointF 0, 0),
            (New-Object System.Drawing.PointF $size, $size),
            [System.Drawing.Color]::FromArgb(255, 136, 19, 55),
            [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
        )
        $colorBlend = New-Object System.Drawing.Drawing2D.ColorBlend 3
        $colorBlend.Colors = @(
            [System.Drawing.Color]::FromArgb(255, 136, 19, 55),
            [System.Drawing.Color]::FromArgb(255, 190, 18, 60),
            [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
        )
        $colorBlend.Positions = @(0.0, 0.5, 1.0)
        $bgBrush.InterpolationColors = $colorBlend
        $g.FillRectangle($bgBrush, 0, 0, $size, $size)
    } else {
        # Squircle rounded rect background
        $gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
            (New-Object System.Drawing.PointF 0, 0),
            (New-Object System.Drawing.PointF $size, $size),
            [System.Drawing.Color]::FromArgb(255, 136, 19, 55),
            [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
        )
        $colorBlend = New-Object System.Drawing.Drawing2D.ColorBlend 3
        $colorBlend.Colors = @(
            [System.Drawing.Color]::FromArgb(255, 136, 19, 55),
            [System.Drawing.Color]::FromArgb(255, 190, 18, 60),
            [System.Drawing.Color]::FromArgb(255, 225, 29, 72)
        )
        $colorBlend.Positions = @(0.0, 0.5, 1.0)
        $gradBrush.InterpolationColors = $colorBlend

        $r = 115.0 * ($size / 512.0)
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $path.AddArc((New-Object System.Drawing.RectangleF 0, 0, ($r * 2), ($r * 2)), 180, 90)
        $path.AddArc((New-Object System.Drawing.RectangleF ($size - $r * 2), 0, ($r * 2), ($r * 2)), 270, 90)
        $path.AddArc((New-Object System.Drawing.RectangleF ($size - $r * 2), ($size - $r * 2), ($r * 2), ($r * 2)), 0, 90)
        $path.AddArc((New-Object System.Drawing.RectangleF 0, ($size - $r * 2), ($r * 2), ($r * 2)), 90, 90)
        $path.CloseFigure()
        $g.FillPath($gradBrush, $path)
    }

    # Helper coordinate transformer
    $tx = { param($x) ($x * $scale) + $offsetShift }
    $ty = { param($y) ($y * $scale) + $offsetShift }

    # 2. Gold Decorative Ring
    $goldBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush (
        (New-Object System.Drawing.PointF (& $tx 256), (& $ty 41)),
        (New-Object System.Drawing.PointF (& $tx 256), (& $ty 471)),
        [System.Drawing.Color]::FromArgb(230, 254, 240, 138),
        [System.Drawing.Color]::FromArgb(230, 245, 158, 11)
    )
    $goldPen = New-Object System.Drawing.Pen $goldBrush, (10.0 * $scale)
    $g.DrawEllipse($goldPen, (New-Object System.Drawing.RectangleF (& $tx 41), (& $ty 41), (430 * $scale), (430 * $scale)))

    # 3. Dashed White Ring
    $dashPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(160, 255, 255, 255)), (2.0 * $scale)
    $dashPen.DashPattern = @(4.0, 4.0)
    $g.DrawEllipse($dashPen, (New-Object System.Drawing.RectangleF (& $tx 61), (& $ty 61), (390 * $scale), (390 * $scale)))

    # 4. Two Interlocked Golden Rings (Reshim Bandh) at bottom
    $knotPen = New-Object System.Drawing.Pen $goldBrush, (12.0 * $scale)
    $g.DrawEllipse($knotPen, (New-Object System.Drawing.RectangleF (& $tx 173), (& $ty 338), (84 * $scale), (84 * $scale)))
    $g.DrawEllipse($knotPen, (New-Object System.Drawing.RectangleF (& $tx 255), (& $ty 338), (84 * $scale), (84 * $scale)))

    # 5. Devanagari character 'अ'
    $font = New-Object System.Drawing.Font "Nirmala UI", (175.0 * $scale), "Bold", "Pixel"

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = "Center"
    $sf.LineAlignment = "Center"

    # Soft drop shadow below 'अ'
    $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(110, 0, 0, 0))
    $g.DrawString("अ", $font, $shadowBrush, [float](& $tx 256), [float]((& $ty 230) + 7 * $scale), $sf)

    # Crisp white 'अ'
    $whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $g.DrawString("अ", $font, $whiteBrush, [float](& $tx 256), [float](& $ty 230), $sf)

    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Host "✓ Generated $outPath ($size x $size)"
}

Write-Host "Generating pixel-perfect Anubandh launcher and splash icons..."

# 1. Android PWA Icons
Draw-AnubandhIcon 512 "public\pwa-512x512.png" $false
Draw-AnubandhIcon 192 "public\pwa-192x192.png" $false
Draw-AnubandhIcon 512 "public\pwa-maskable-512.png" $true
Draw-AnubandhIcon 192 "public\pwa-maskable-192.png" $true

# 2. iOS Home Screen / Touch Icon
Draw-AnubandhIcon 180 "public\apple-touch-icon.png" $false

# 3. Desktop / Browser Favicon
Draw-AnubandhIcon 64 "public\favicon.ico" $false

Write-Host "All icons generated successfully!"

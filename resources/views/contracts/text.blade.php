<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Contrato</title>
    <style>
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 12px;
            line-height: 1.6;
            padding: 20px;
        }
        .signature-section {
            margin-top: 50px;
            page-break-inside: avoid;
        }
        .signature-box {
            display: inline-block;
            width: 45%;
            margin: 20px 2%;
            vertical-align: top;
        }
        .signature-line {
            border-top: 2px solid #000;
            margin-top: 80px;
            padding-top: 5px;
            text-align: center;
        }
        .signature-image {
            max-width: 200px;
            max-height: 80px;
        }
    </style>
</head>
<body>
    <div class="contract-content">
        {!! $content !!}
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <div class="signature-line">
                @if($signature->installer_signature)
                    <img src="{{ $signature->installer_signature }}" class="signature-image" alt="Firma Instalador" />
                @else
                    <div style="height: 80px;"></div>
                @endif
                <p><strong>Firma del Instalador</strong></p>
                @if($signature->installer_signed_at)
                    <p>{{ $signature->installer_signed_at->format('d/m/Y H:i') }}</p>
                @endif
            </div>
        </div>

        <div class="signature-box">
            <div class="signature-line">
                @if($signature->client_signature)
                    <img src="{{ $signature->client_signature }}" class="signature-image" alt="Firma Cliente" />
                @else
                    <div style="height: 80px;"></div>
                @endif
                <p><strong>Firma del Cliente</strong></p>
                @if($signature->client_signed_at)
                    <p>{{ $signature->client_signed_at->format('d/m/Y H:i') }}</p>
                @endif
            </div>
        </div>
    </div>
</body>
</html>


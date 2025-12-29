<?php

namespace App\Models\Central;

use Illuminate\Database\Eloquent\Model;

class PdfTemplate extends Model
{
    protected $fillable = [
        'company_id',
        'name',
        'type',
        'html_content',
        'variables',
        'logo',
        'colors',
        'styles',
        'is_default',
        'is_active',
        'order',
    ];

    protected $casts = [
        'variables' => 'array',
        'colors' => 'array',
        'styles' => 'array',
        'is_default' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function render(array $data)
    {
        $html = $this->html_content;

        // Reemplazar variables
        foreach ($data as $key => $value) {
            $html = str_replace("{{" . $key . "}}", $value, $html);
        }

        // Aplicar colores personalizados
        if ($this->colors) {
            foreach ($this->colors as $key => $value) {
                $html = str_replace("{{color_" . $key . "}}", $value, $html);
            }
        }

        return $html;
    }

    public static function getAvailableVariables()
    {
        return [
            'empresa_nombre' => 'Nombre de la empresa',
            'empresa_logo' => 'Logo de la empresa',
            'empresa_direccion' => 'Dirección de la empresa',
            'empresa_telefono' => 'Teléfono de la empresa',
            'empresa_email' => 'Email de la empresa',
            'empresa_web' => 'Web de la empresa',
            'cliente_nombre' => 'Nombre del cliente',
            'cliente_empresa' => 'Empresa del cliente',
            'cliente_email' => 'Email del cliente',
            'cliente_telefono' => 'Teléfono del cliente',
            'cliente_direccion' => 'Dirección del cliente',
            'fecha' => 'Fecha del documento',
            'numero_presupuesto' => 'Número de presupuesto',
            'numero_factura' => 'Número de factura',
            'productos_tabla' => 'Tabla de productos',
            'subtotal' => 'Subtotal',
            'iva' => 'IVA',
            'total' => 'Total',
            'descuento' => 'Descuento',
            'condiciones_pago' => 'Condiciones de pago',
            'validez' => 'Validez de la oferta',
            'firma_comercial' => 'Firma del comercial',
            'firma_cliente' => 'Firma del cliente',
            'observaciones' => 'Observaciones',
        ];
    }
}

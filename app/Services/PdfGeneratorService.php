<?php

namespace App\Services;

use App\Models\Central\Product;
use Illuminate\Support\Facades\Storage;

class PdfGeneratorService
{
    /**
     * Genera la ficha técnica HTML de un producto
     *
     * @param Product $product
     * @return string HTML de la ficha técnica
     */
    public static function getProductTechSheet(Product $product): string
    {
        // Obtener imágenes del producto
        $images = $product->getFilesData(1); // Tipo 1 = imágenes
        $mainImage = $images[0] ?? null;

        // Obtener atributos técnicos
        $attributes = $product->attributes ?? [];

        // Construir HTML de la ficha técnica
        $html = '
        <div class="product-tech-sheet" style="page-break-inside: avoid; margin-bottom: 30px;">
            <div style="border: 2px solid #3B82F6; border-radius: 8px; padding: 20px; background: #F8FAFC;">
                <!-- Cabecera del producto -->
                <div style="display: flex; align-items: center; margin-bottom: 20px; border-bottom: 2px solid #3B82F6; padding-bottom: 15px;">
                    <div style="flex: 1;">
                        <h2 style="margin: 0; color: #1E293B; font-size: 24px; font-weight: bold;">
                            ' . htmlspecialchars($product->name) . '
                        </h2>
                        <p style="margin: 5px 0 0 0; color: #64748B; font-size: 14px;">
                            Modelo: <strong>' . htmlspecialchars($product->model ?? 'N/A') . '</strong>
                        </p>
                    </div>
                    ' . ($mainImage ? '
                    <div style="width: 150px; height: 150px; border-radius: 8px; overflow: hidden; border: 1px solid #E2E8F0;">
                        <img src="' . $mainImage['url'] . '" style="width: 100%; height: 100%; object-fit: cover;" alt="' . htmlspecialchars($product->name) . '">
                    </div>
                    ' : '') . '
                </div>

                <!-- Descripción -->
                ' . ($product->description ? '
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #3B82F6; font-size: 16px; margin-bottom: 10px; font-weight: 600;">Descripción</h3>
                    <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">
                        ' . nl2br(htmlspecialchars($product->description)) . '
                    </p>
                </div>
                ' : '') . '

                <!-- Especificaciones Técnicas -->
                ' . (!empty($attributes) ? '
                <div style="margin-bottom: 20px;">
                    <h3 style="color: #3B82F6; font-size: 16px; margin-bottom: 10px; font-weight: 600;">Especificaciones Técnicas</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tbody>
                        ' . self::buildAttributesTable($attributes) . '
                        </tbody>
                    </table>
                </div>
                ' : '') . '

                <!-- Características destacadas -->
                ' . self::buildHighlights($product) . '

                <!-- Precio -->
                ' . ($product->price ? '
                <div style="text-align: right; margin-top: 20px; padding-top: 15px; border-top: 2px solid #3B82F6;">
                    <span style="font-size: 14px; color: #64748B;">Precio:</span>
                    <span style="font-size: 24px; color: #3B82F6; font-weight: bold; margin-left: 10px;">
                        ' . number_format($product->price, 2, ',', '.') . ' €
                    </span>
                </div>
                ' : '') . '
            </div>
        </div>';

        return $html;
    }

    /**
     * Construye la tabla de atributos técnicos
     */
    private static function buildAttributesTable(array $attributes): string
    {
        $html = '';
        $count = 0;

        foreach ($attributes as $key => $value) {
            if (empty($value)) continue;

            $bgColor = ($count % 2 === 0) ? '#FFFFFF' : '#F1F5F9';
            $html .= '
                <tr style="background-color: ' . $bgColor . ';">
                    <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; font-weight: 600; color: #475569; width: 40%;">
                        ' . htmlspecialchars(ucfirst(str_replace('_', ' ', $key))) . '
                    </td>
                    <td style="padding: 10px; border-bottom: 1px solid #E2E8F0; color: #64748B;">
                        ' . htmlspecialchars($value) . '
                    </td>
                </tr>';
            $count++;
        }

        return $html;
    }

    /**
     * Construye sección de características destacadas
     */
    private static function buildHighlights(Product $product): string
    {
        $highlights = [];

        // Buscar características en los atributos
        $keywords = ['destacado', 'highlight', 'feature', 'ventaja', 'beneficio'];
        $attributes = $product->attributes ?? [];

        foreach ($attributes as $key => $value) {
            foreach ($keywords as $keyword) {
                if (stripos($key, $keyword) !== false && !empty($value)) {
                    $highlights[] = $value;
                }
            }
        }

        if (empty($highlights)) {
            return '';
        }

        $html = '
        <div style="margin-bottom: 20px;">
            <h3 style="color: #3B82F6; font-size: 16px; margin-bottom: 10px; font-weight: 600;">✨ Características Destacadas</h3>
            <ul style="color: #475569; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">';

        foreach ($highlights as $highlight) {
            $html .= '<li style="margin-bottom: 5px;">' . htmlspecialchars($highlight) . '</li>';
        }

        $html .= '</ul></div>';

        return $html;
    }

    /**
     * Genera HTML completo de presupuesto con productos
     *
     * @param $budget Objeto de presupuesto
     * @param array $products Array de productos
     * @param array $options Opciones adicionales
     * @return string HTML completo
     */
    public static function generateBudgetPdf($budget, array $products, array $options = []): string
    {
        $companyLogo = $options['company_logo'] ?? null;
        $companyName = $options['company_name'] ?? 'WaterCRM';
        $companyAddress = $options['company_address'] ?? '';
        $companyPhone = $options['company_phone'] ?? '';
        $companyEmail = $options['company_email'] ?? '';

        $clientName = $budget->client->name ?? 'Cliente';
        $clientEmail = $budget->client->email ?? '';
        $clientPhone = $budget->client->phone ?? '';
        $clientAddress = $budget->client->address ?? '';

        $budgetNumber = $budget->id ?? 'N/A';
        $budgetDate = $budget->created_at ? $budget->created_at->format('d/m/Y') : date('d/m/Y');

        // Construir HTML completo
        $html = '
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Presupuesto ' . $budgetNumber . '</title>
            <style>
                @page {
                    margin: 20mm;
                }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                    font-size: 12px;
                    line-height: 1.5;
                    color: #333;
                }
                .page-break {
                    page-break-after: always;
                }
                .header {
                    border-bottom: 4px solid #3B82F6;
                    padding-bottom: 20px;
                    margin-bottom: 30px;
                }
                .logo {
                    max-width: 200px;
                    max-height: 80px;
                }
                .budget-info {
                    background: #F8FAFC;
                    padding: 15px;
                    border-radius: 8px;
                    margin-bottom: 30px;
                }
                .section-title {
                    color: #3B82F6;
                    font-size: 18px;
                    font-weight: bold;
                    margin-top: 30px;
                    margin-bottom: 15px;
                    padding-bottom: 10px;
                    border-bottom: 2px solid #3B82F6;
                }
                .products-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 30px;
                }
                .products-table th {
                    background: #3B82F6;
                    color: white;
                    padding: 12px;
                    text-align: left;
                    font-weight: 600;
                }
                .products-table td {
                    padding: 10px;
                    border-bottom: 1px solid #E2E8F0;
                }
                .totals {
                    text-align: right;
                    margin-top: 20px;
                }
                .total-line {
                    padding: 8px 0;
                    font-size: 14px;
                }
                .total-final {
                    font-size: 20px;
                    font-weight: bold;
                    color: #3B82F6;
                    padding-top: 15px;
                    border-top: 2px solid #3B82F6;
                }
                .footer {
                    margin-top: 50px;
                    padding-top: 20px;
                    border-top: 1px solid #E2E8F0;
                    text-align: center;
                    color: #64748B;
                    font-size: 11px;
                }
            </style>
        </head>
        <body>';

        // Cabecera
        $html .= '
        <div class="header">
            <table style="width: 100%;">
                <tr>
                    <td style="width: 50%; vertical-align: top;">
                        ' . ($companyLogo ? '<img src="' . $companyLogo . '" class="logo" alt="Logo">' : '') . '
                        <h1 style="margin: 10px 0 5px 0; color: #1E293B; font-size: 28px;">' . htmlspecialchars($companyName) . '</h1>
                        <p style="margin: 0; color: #64748B;">
                            ' . htmlspecialchars($companyAddress) . '<br>
                            Tel: ' . htmlspecialchars($companyPhone) . '<br>
                            Email: ' . htmlspecialchars($companyEmail) . '
                        </p>
                    </td>
                    <td style="width: 50%; text-align: right; vertical-align: top;">
                        <h2 style="margin: 0; color: #3B82F6; font-size: 32px;">PRESUPUESTO</h2>
                        <p style="margin: 5px 0; font-size: 16px; color: #64748B;">
                            Nº ' . htmlspecialchars($budgetNumber) . '
                        </p>
                        <p style="margin: 5px 0; color: #64748B;">
                            Fecha: ' . $budgetDate . '
                        </p>
                    </td>
                </tr>
            </table>
        </div>';

        // Información del cliente
        $html .= '
        <div class="budget-info">
            <h3 style="margin: 0 0 10px 0; color: #1E293B;">Cliente</h3>
            <p style="margin: 0;">
                <strong>' . htmlspecialchars($clientName) . '</strong><br>
                ' . ($clientAddress ? htmlspecialchars($clientAddress) . '<br>' : '') . '
                ' . ($clientPhone ? 'Tel: ' . htmlspecialchars($clientPhone) . '<br>' : '') . '
                ' . ($clientEmail ? 'Email: ' . htmlspecialchars($clientEmail) : '') . '
            </p>
        </div>';

        // Resumen de productos
        $html .= '
        <h2 class="section-title">Resumen de Productos</h2>
        <table class="products-table">
            <thead>
                <tr>
                    <th>Producto</th>
                    <th style="text-align: center; width: 100px;">Cantidad</th>
                    <th style="text-align: right; width: 120px;">Precio Unit.</th>
                    <th style="text-align: right; width: 120px;">Total</th>
                </tr>
            </thead>
            <tbody>';

        $subtotal = 0;
        foreach ($products as $item) {
            $quantity = $item['quantity'] ?? 1;
            $price = $item['price'] ?? 0;
            $total = $quantity * $price;
            $subtotal += $total;

            $html .= '
                <tr>
                    <td>
                        <strong>' . htmlspecialchars($item['name']) . '</strong><br>
                        <small style="color: #64748B;">' . htmlspecialchars($item['model'] ?? '') . '</small>
                    </td>
                    <td style="text-align: center;">' . $quantity . '</td>
                    <td style="text-align: right;">' . number_format($price, 2, ',', '.') . ' €</td>
                    <td style="text-align: right;"><strong>' . number_format($total, 2, ',', '.') . ' €</strong></td>
                </tr>';
        }

        $html .= '
            </tbody>
        </table>';

        // Totales
        $iva = $subtotal * 0.21;
        $total = $subtotal + $iva;

        $html .= '
        <div class="totals">
            <div class="total-line">
                <span>Subtotal:</span>
                <span style="margin-left: 20px; font-weight: 600;">' . number_format($subtotal, 2, ',', '.') . ' €</span>
            </div>
            <div class="total-line">
                <span>IVA (21%):</span>
                <span style="margin-left: 20px; font-weight: 600;">' . number_format($iva, 2, ',', '.') . ' €</span>
            </div>
            <div class="total-final">
                <span>TOTAL:</span>
                <span style="margin-left: 20px;">' . number_format($total, 2, ',', '.') . ' €</span>
            </div>
        </div>';

        // Página nueva para fichas técnicas
        if (!empty($products)) {
            $html .= '<div class="page-break"></div>';
            $html .= '<h2 class="section-title">Fichas Técnicas de Productos</h2>';

            foreach ($products as $item) {
                if (isset($item['product'])) {
                    $html .= self::getProductTechSheet($item['product']);
                }
            }
        }

        // Footer
        $html .= '
        <div class="footer">
            <p>Este presupuesto tiene una validez de 30 días desde la fecha de emisión.</p>
            <p>' . htmlspecialchars($companyName) . ' - ' . htmlspecialchars($companyEmail) . ' - ' . htmlspecialchars($companyPhone) . '</p>
        </div>';

        $html .= '</body></html>';

        return $html;
    }
}

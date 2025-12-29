<?php

namespace App\Services;

/**
 * Service to render block-based PDF templates into HTML
 */
class BlockRendererService
{
    /**
     * Render blocks array into HTML
     */
    public static function render(array $blocks, array $data = [], array $settings = []): string
    {
        $html = self::getDocumentHeader($settings);

        foreach ($blocks as $block) {
            $html .= self::renderBlock($block, $data);
        }

        $html .= self::getDocumentFooter();

        return $html;
    }

    /**
     * Render a single block
     */
    private static function renderBlock(array $block, array $data): string
    {
        $type = $block['type'] ?? 'text';
        $content = $block['content'] ?? [];

        switch ($type) {
            case 'header':
                return self::renderHeader($content, $data);
            case 'client_info':
                return self::renderClientInfo($content, $data);
            case 'budget_info':
                return self::renderBudgetInfo($content, $data);
            case 'products_table':
                return self::renderProductsTable($content, $data);
            case 'products_details':
                return self::renderProductsDetails($content, $data);
            case 'totals':
                return self::renderTotals($content, $data);
            case 'text':
                return self::renderText($content, $data);
            case 'spacer':
                return self::renderSpacer($content);
            case 'page_break':
                return self::renderPageBreak();
            default:
                return '';
        }
    }

    /**
     * Render header block
     */
    private static function renderHeader(array $content, array $data): string
    {
        $showLogo = $content['show_logo'] ?? true;
        $showCompanyName = $content['company_name'] ?? true;
        $showCompanyInfo = $content['company_info'] ?? true;
        $bgColor = $content['background_color'] ?? '#3B82F6';
        $textColor = $content['text_color'] ?? '#FFFFFF';

        $html = '<div style="background-color: ' . $bgColor . '; color: ' . $textColor . '; padding: 20px; margin-bottom: 20px;">';
        $html .= '<table width="100%" cellpadding="0" cellspacing="0">';
        $html .= '<tr>';

        if ($showLogo && !empty($data['company_logo'])) {
            $html .= '<td width="150px" valign="top">';
            $html .= '<img src="' . $data['company_logo'] . '" style="max-width: 120px; max-height: 80px;" />';
            $html .= '</td>';
        }

        $html .= '<td valign="top">';
        if ($showCompanyName) {
            $html .= '<h1 style="margin: 0 0 10px 0; font-size: 24px;">' . ($data['company_name'] ?? 'Empresa') . '</h1>';
        }
        if ($showCompanyInfo) {
            $html .= '<p style="margin: 0; font-size: 12px;">';
            if (!empty($data['company_address'])) $html .= $data['company_address'] . '<br>';
            if (!empty($data['company_phone'])) $html .= 'Tel: ' . $data['company_phone'] . '<br>';
            if (!empty($data['company_email'])) $html .= 'Email: ' . $data['company_email'];
            $html .= '</p>';
        }
        $html .= '</td>';
        $html .= '</tr></table>';
        $html .= '</div>';

        return $html;
    }

    /**
     * Render client info block
     */
    private static function renderClientInfo(array $content, array $data): string
    {
        $layout = $content['layout'] ?? 'detailed';
        $bgColor = $content['background_color'] ?? '#F3F4F6';

        $html = '<div style="background-color: ' . $bgColor . '; padding: 15px; margin-bottom: 20px; border-radius: 5px;">';
        $html .= '<h3 style="margin: 0 0 10px 0; font-size: 16px; color: #1F2937;">Datos del Cliente</h3>';

        if ($layout === 'detailed') {
            $html .= '<table width="100%" cellpadding="5" cellspacing="0" style="font-size: 12px;">';
            if (!empty($data['client_name'])) {
                $html .= '<tr><td width="30%" style="font-weight: bold;">Nombre:</td><td>' . $data['client_name'] . '</td></tr>';
            }
            if (!empty($data['client_email'])) {
                $html .= '<tr><td style="font-weight: bold;">Email:</td><td>' . $data['client_email'] . '</td></tr>';
            }
            if (!empty($data['client_phone'])) {
                $html .= '<tr><td style="font-weight: bold;">Teléfono:</td><td>' . $data['client_phone'] . '</td></tr>';
            }
            if (!empty($data['client_address'])) {
                $html .= '<tr><td style="font-weight: bold;">Dirección:</td><td>' . $data['client_address'] . '</td></tr>';
            }
            if (!empty($data['client_dni'])) {
                $html .= '<tr><td style="font-weight: bold;">DNI/CIF:</td><td>' . $data['client_dni'] . '</td></tr>';
            }
            $html .= '</table>';
        } else {
            $html .= '<p style="margin: 5px 0; font-size: 12px;">';
            $html .= '<strong>' . ($data['client_name'] ?? '') . '</strong><br>';
            if (!empty($data['client_address'])) $html .= $data['client_address'] . '<br>';
            if (!empty($data['client_phone'])) $html .= 'Tel: ' . $data['client_phone'];
            $html .= '</p>';
        }

        $html .= '</div>';

        return $html;
    }

    /**
     * Render budget info block
     */
    private static function renderBudgetInfo(array $content, array $data): string
    {
        $bgColor = $content['background_color'] ?? '#FFFFFF';

        $html = '<div style="background-color: ' . $bgColor . '; padding: 15px; margin-bottom: 20px; border: 1px solid #E5E7EB; border-radius: 5px;">';
        $html .= '<table width="100%" cellpadding="5" cellspacing="0" style="font-size: 12px;">';

        if (!empty($data['budget_number'])) {
            $html .= '<tr><td width="30%" style="font-weight: bold;">Nº Presupuesto:</td><td>' . $data['budget_number'] . '</td></tr>';
        }
        if (!empty($data['budget_date'])) {
            $html .= '<tr><td style="font-weight: bold;">Fecha:</td><td>' . $data['budget_date'] . '</td></tr>';
        }
        if (!empty($data['budget_valid_until'])) {
            $html .= '<tr><td style="font-weight: bold;">Válido hasta:</td><td>' . $data['budget_valid_until'] . '</td></tr>';
        }
        if (!empty($data['installation_address'])) {
            $html .= '<tr><td style="font-weight: bold;">Dirección de instalación:</td><td>' . $data['installation_address'] . '</td></tr>';
        }

        $html .= '</table>';
        $html .= '</div>';

        return $html;
    }

    /**
     * Render products table block
     */
    private static function renderProductsTable(array $content, array $data): string
    {
        $showImages = $content['show_images'] ?? false;
        $showRef = $content['show_ref'] ?? true;
        $showDescription = $content['show_description'] ?? true;

        $products = $data['products'] ?? [];

        $html = '<table width="100%" cellpadding="8" cellspacing="0" style="border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">';
        $html .= '<thead>';
        $html .= '<tr style="background-color: #3B82F6; color: white;">';

        if ($showImages) $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Imagen</th>';
        if ($showRef) $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Ref.</th>';
        $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>';
        if ($showDescription) $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Descripción</th>';
        $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: center;">Cant.</th>';
        $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Precio</th>';
        $html .= '<th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>';

        $html .= '</tr>';
        $html .= '</thead>';
        $html .= '<tbody>';

        foreach ($products as $product) {
            $html .= '<tr>';

            if ($showImages) {
                $html .= '<td style="border: 1px solid #ddd; padding: 8px;">';
                if (!empty($product['image'])) {
                    $html .= '<img src="' . $product['image'] . '" style="width: 50px; height: 50px; object-fit: cover;" />';
                }
                $html .= '</td>';
            }

            if ($showRef) {
                $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . ($product['ref'] ?? '-') . '</td>';
            }

            $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . ($product['name'] ?? '') . '</td>';

            if ($showDescription) {
                $html .= '<td style="border: 1px solid #ddd; padding: 8px;">' . ($product['description'] ?? '') . '</td>';
            }

            $html .= '<td style="border: 1px solid #ddd; padding: 8px; text-align: center;">' . ($product['quantity'] ?? 1) . '</td>';
            $html .= '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">' . number_format($product['price'] ?? 0, 2) . '€</td>';
            $html .= '<td style="border: 1px solid #ddd; padding: 8px; text-align: right;">' . number_format(($product['quantity'] ?? 1) * ($product['price'] ?? 0), 2) . '€</td>';

            $html .= '</tr>';
        }

        $html .= '</tbody>';
        $html .= '</table>';

        return $html;
    }

    /**
     * Render products details (tech sheets) block
     */
    private static function renderProductsDetails(array $content, array $data): string
    {
        $showImages = $content['show_images'] ?? true;
        $showAttributes = $content['show_attributes'] ?? true;
        $layout = $content['layout'] ?? 'detailed';
        $products = $data['products'] ?? [];

        $html = '';

        // If we have product objects with tech sheet data
        if (!empty($data['product_tech_sheets'])) {
            foreach ($data['product_tech_sheets'] as $techSheet) {
                $html .= $techSheet;
            }
        } else {
            // Fallback: render basic product info
            foreach ($products as $product) {
                $html .= '<div style="page-break-inside: avoid; margin-bottom: 30px; border: 2px solid #3B82F6; border-radius: 8px; padding: 20px;">';
                $html .= '<h3 style="color: #3B82F6; margin-top: 0;">' . ($product['name'] ?? 'Producto') . '</h3>';

                if ($showImages && !empty($product['image'])) {
                    $html .= '<div style="margin: 15px 0;"><img src="' . $product['image'] . '" style="max-width: 300px; border-radius: 5px;" /></div>';
                }

                if (!empty($product['description'])) {
                    $html .= '<p style="margin: 10px 0; color: #4B5563;">' . $product['description'] . '</p>';
                }

                if ($showAttributes && !empty($product['attributes'])) {
                    $html .= '<h4 style="color: #1F2937; margin: 15px 0 10px 0;">Características Técnicas</h4>';
                    $html .= '<table width="100%" cellpadding="5" style="font-size: 12px;">';
                    foreach ($product['attributes'] as $key => $value) {
                        $html .= '<tr><td width="40%" style="font-weight: bold; color: #6B7280;">' . $key . ':</td><td>' . $value . '</td></tr>';
                    }
                    $html .= '</table>';
                }

                $html .= '</div>';
            }
        }

        return $html;
    }

    /**
     * Render totals block
     */
    private static function renderTotals(array $content, array $data): string
    {
        $showSubtotal = $content['show_subtotal'] ?? true;
        $showTax = $content['show_tax'] ?? true;
        $showDiscount = $content['show_discount'] ?? false;
        $taxRate = $content['tax_rate'] ?? 21;
        $bgColor = $content['background_color'] ?? '#F9FAFB';

        $subtotal = $data['subtotal'] ?? 0;
        $discount = $data['discount'] ?? 0;
        $tax = $data['tax_amount'] ?? ($subtotal * ($taxRate / 100));
        $total = $data['total_amount'] ?? ($subtotal - $discount + $tax);

        $html = '<div style="margin-top: 30px;">';
        $html .= '<table width="100%" cellpadding="8" style="font-size: 14px;">';
        $html .= '<tr><td width="70%"></td><td width="30%">';

        $html .= '<table width="100%" cellpadding="5" style="background-color: ' . $bgColor . '; border-radius: 5px;">';

        if ($showSubtotal) {
            $html .= '<tr><td style="font-weight: bold;">Subtotal:</td><td style="text-align: right;">' . number_format($subtotal, 2) . '€</td></tr>';
        }

        if ($showDiscount && $discount > 0) {
            $html .= '<tr><td style="font-weight: bold; color: #10B981;">Descuento:</td><td style="text-align: right; color: #10B981;">-' . number_format($discount, 2) . '€</td></tr>';
        }

        if ($showTax) {
            $html .= '<tr><td style="font-weight: bold;">IVA (' . $taxRate . '%):</td><td style="text-align: right;">' . number_format($tax, 2) . '€</td></tr>';
        }

        $html .= '<tr style="border-top: 2px solid #3B82F6;"><td style="font-weight: bold; font-size: 16px; padding-top: 10px;">TOTAL:</td><td style="text-align: right; font-weight: bold; font-size: 16px; padding-top: 10px;">' . number_format($total, 2) . '€</td></tr>';

        $html .= '</table>';
        $html .= '</td></tr></table>';
        $html .= '</div>';

        return $html;
    }

    /**
     * Render text block
     */
    private static function renderText(array $content, array $data): string
    {
        $text = $content['text'] ?? '';
        $fontSize = $content['font_size'] ?? 12;
        $textAlign = $content['text_align'] ?? 'left';
        $textColor = $content['text_color'] ?? '#000000';

        // Replace variables
        $text = self::replaceVariables($text, $data);

        return '<div style="font-size: ' . $fontSize . 'px; text-align: ' . $textAlign . '; color: ' . $textColor . '; margin-bottom: 15px;">' . nl2br($text) . '</div>';
    }

    /**
     * Render spacer block
     */
    private static function renderSpacer(array $content): string
    {
        $height = $content['height'] ?? 20;
        return '<div style="height: ' . $height . 'px;"></div>';
    }

    /**
     * Render page break block
     */
    private static function renderPageBreak(): string
    {
        return '<div style="page-break-after: always;"></div>';
    }

    /**
     * Get document header HTML
     */
    private static function getDocumentHeader(array $settings): string
    {
        $pageSize = $settings['page_size'] ?? 'A4';
        $marginTop = $settings['margin_top'] ?? 20;
        $marginRight = $settings['margin_right'] ?? 20;
        $marginBottom = $settings['margin_bottom'] ?? 20;
        $marginLeft = $settings['margin_left'] ?? 20;

        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: ' . $pageSize . ';
            margin: ' . $marginTop . 'mm ' . $marginRight . 'mm ' . $marginBottom . 'mm ' . $marginLeft . 'mm;
        }
        body {
            font-family: Arial, Helvetica, sans-serif;
            color: #1F2937;
            line-height: 1.6;
        }
        * {
            box-sizing: border-box;
        }
    </style>
</head>
<body>
';
    }

    /**
     * Get document footer HTML
     */
    private static function getDocumentFooter(): string
    {
        return '
</body>
</html>
';
    }

    /**
     * Replace variables in text
     */
    private static function replaceVariables(string $text, array $data): string
    {
        foreach ($data as $key => $value) {
            if (is_string($value) || is_numeric($value)) {
                $text = str_replace('{{' . $key . '}}', $value, $text);
            }
        }
        return $text;
    }
}

# WaterCRM Product Catalog - WordPress Plugin

Display WaterCRM products on your WordPress site with customizable layouts and filters.

## Features

- **Product Grid Display**: Show products in responsive grid layouts (2, 3, or 4 columns)
- **Featured Products**: Highlight your best products
- **Product Categories**: Filter products by category
- **Single Product Pages**: Display detailed product information
- **SEO Optimized**: Includes SEO fields for better search engine visibility
- **Responsive Design**: Works perfectly on all devices
- **Caching**: Built-in caching for optimal performance
- **Easy Integration**: Simple shortcodes for quick setup

## Installation

1. Download the plugin ZIP file
2. Go to WordPress Admin > Plugins > Add New
3. Click "Upload Plugin" and select the ZIP file
4. Click "Install Now" and then "Activate"
5. Go to WaterCRM > Settings to configure API credentials

## Configuration

### API Settings

1. Navigate to **WaterCRM > Settings** in WordPress admin
2. Enter your WaterCRM API URL (e.g., `https://your-watercrm.com/api`)
3. Enter your WaterCRM API Key
4. Set cache duration (default: 3600 seconds / 1 hour)
5. Click "Save Changes"
6. Test the connection using the "Test API Connection" button

## Shortcodes

### Products Grid

Display a grid of products:

```
[watercrm_products]
```

**Parameters:**
- `category`: Filter by category name
- `columns`: Number of columns (default: 3)
- `limit`: Maximum number of products (default: 12)
- `order_by`: Sort field (default: order_web)
- `order_dir`: Sort direction - asc or desc (default: asc)

**Examples:**

```
[watercrm_products category="Filters" columns="4" limit="8"]
[watercrm_products columns="2" limit="6"]
```

### Featured Products

Display only featured products:

```
[watercrm_featured]
```

**Parameters:**
- `columns`: Number of columns (default: 4)
- `limit`: Maximum number of products (default: 8)

**Examples:**

```
[watercrm_featured columns="3" limit="6"]
```

### Single Product

Display a specific product:

```
[watercrm_product id="123"]
```

**Parameters:**
- `id`: Product ID (required)

### Categories List

Display a list of product categories:

```
[watercrm_categories]
```

## Customization

### Custom Styling

You can override the default styles by adding custom CSS to your theme:

```css
/* Customize product cards */
.watercrm-product-inner {
    border-radius: 12px;
    /* your custom styles */
}

/* Customize buttons */
.watercrm-btn-primary {
    background: #your-color;
}
```

### Template Overrides

Copy template files from `watercrm-catalog/templates/` to your theme directory under `watercrm-catalog/` to customize the HTML structure.

## Cache Management

The plugin caches product data to improve performance. You can:

- Clear cache manually: **WaterCRM > Settings** > "Clear Product Cache" button
- Adjust cache duration in settings
- Cache is automatically cleared when you deactivate the plugin

## Requirements

- WordPress 5.0 or higher
- PHP 7.4 or higher
- Active WaterCRM installation with API access

## Support

For support and documentation, visit [watercrm.com](https://watercrm.com)

## Changelog

### 1.0.0
- Initial release
- Product grid display
- Featured products
- Single product pages
- Category filtering
- Caching system
- Admin settings panel

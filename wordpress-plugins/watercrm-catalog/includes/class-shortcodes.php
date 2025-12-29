<?php
/**
 * WaterCRM Shortcodes
 * Provides shortcodes for displaying products
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Shortcodes {

    private static $instance = null;
    private $api_client;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->api_client = WaterCRM_API_Client::get_instance();
        $this->init_hooks();
    }

    private function init_hooks() {
        add_shortcode('watercrm_products', array($this, 'products_shortcode'));
        add_shortcode('watercrm_product', array($this, 'single_product_shortcode'));
        add_shortcode('watercrm_categories', array($this, 'categories_shortcode'));
        add_shortcode('watercrm_featured', array($this, 'featured_products_shortcode'));
    }

    /**
     * Products grid shortcode
     * Usage: [watercrm_products category="Category Name" columns="3" limit="12"]
     */
    public function products_shortcode($atts) {
        $atts = shortcode_atts(array(
            'category' => '',
            'columns' => '3',
            'limit' => '12',
            'order_by' => 'order_web',
            'order_dir' => 'asc',
        ), $atts, 'watercrm_products');

        $args = array(
            'order_by' => $atts['order_by'],
            'order_dir' => $atts['order_dir'],
        );

        if (!empty($atts['category'])) {
            $args['category'] = $atts['category'];
        }

        $products = $this->api_client->get_products($args);

        if (empty($products)) {
            return '<p class="watercrm-no-products">' . __('No products found', 'watercrm-catalog') . '</p>';
        }

        // Limit results
        if ($atts['limit'] > 0) {
            $products = array_slice($products, 0, intval($atts['limit']));
        }

        ob_start();
        include WATERCRM_CATALOG_PLUGIN_DIR . 'templates/products-grid.php';
        return ob_get_clean();
    }

    /**
     * Single product shortcode
     * Usage: [watercrm_product id="123"]
     */
    public function single_product_shortcode($atts) {
        $atts = shortcode_atts(array(
            'id' => 0,
        ), $atts, 'watercrm_product');

        if (empty($atts['id'])) {
            return '<p class="watercrm-error">' . __('Product ID is required', 'watercrm-catalog') . '</p>';
        }

        $product = $this->api_client->get_product($atts['id']);

        if (empty($product)) {
            return '<p class="watercrm-no-products">' . __('Product not found', 'watercrm-catalog') . '</p>';
        }

        ob_start();
        include WATERCRM_CATALOG_PLUGIN_DIR . 'templates/single-product.php';
        return ob_get_clean();
    }

    /**
     * Categories list shortcode
     * Usage: [watercrm_categories]
     */
    public function categories_shortcode($atts) {
        $atts = shortcode_atts(array(
            'show_count' => 'no',
        ), $atts, 'watercrm_categories');

        $categories = $this->api_client->get_categories();

        if (empty($categories)) {
            return '<p class="watercrm-no-categories">' . __('No categories found', 'watercrm-catalog') . '</p>';
        }

        $show_count = $atts['show_count'] === 'yes';

        ob_start();
        include WATERCRM_CATALOG_PLUGIN_DIR . 'templates/categories-list.php';
        return ob_get_clean();
    }

    /**
     * Featured products shortcode
     * Usage: [watercrm_featured columns="4" limit="8"]
     */
    public function featured_products_shortcode($atts) {
        $atts = shortcode_atts(array(
            'columns' => '4',
            'limit' => '8',
        ), $atts, 'watercrm_featured');

        $args = array(
            'featured_only' => true,
            'order_by' => 'order_web',
            'order_dir' => 'asc',
        );

        $products = $this->api_client->get_products($args);

        if (empty($products)) {
            return '<p class="watercrm-no-products">' . __('No featured products found', 'watercrm-catalog') . '</p>';
        }

        // Limit results
        if ($atts['limit'] > 0) {
            $products = array_slice($products, 0, intval($atts['limit']));
        }

        ob_start();
        include WATERCRM_CATALOG_PLUGIN_DIR . 'templates/products-grid.php';
        return ob_get_clean();
    }
}

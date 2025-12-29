<?php
/**
 * WaterCRM API Client
 * Handles communication with WaterCRM API
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_API_Client {

    private static $instance = null;
    private $api_url;
    private $api_key;
    private $cache_duration;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->api_url = get_option('watercrm_api_url');
        $this->api_key = get_option('watercrm_api_key');
        $this->cache_duration = get_option('watercrm_cache_duration', 3600);
    }

    /**
     * Make API request
     */
    private function make_request($endpoint, $params = array()) {
        if (empty($this->api_url) || empty($this->api_key)) {
            return new WP_Error('missing_credentials', __('WaterCRM API credentials not configured', 'watercrm-catalog'));
        }

        $url = trailingslashit($this->api_url) . ltrim($endpoint, '/');

        if (!empty($params)) {
            $url = add_query_arg($params, $url);
        }

        $args = array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Accept' => 'application/json',
            ),
            'timeout' => 15,
        );

        $response = wp_remote_get($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_Error('json_error', __('Invalid JSON response from API', 'watercrm-catalog'));
        }

        return $data;
    }

    /**
     * Get all web-visible products
     */
    public function get_products($args = array()) {
        $cache_key = 'watercrm_products_' . md5(serialize($args));
        $cached = get_transient($cache_key);

        if (false !== $cached && !isset($args['no_cache'])) {
            return $cached;
        }

        $params = array();

        if (isset($args['category'])) {
            $params['category'] = $args['category'];
        }

        if (isset($args['featured_only']) && $args['featured_only']) {
            $params['featured_only'] = 1;
        }

        if (isset($args['order_by'])) {
            $params['order_by'] = $args['order_by'];
        }

        if (isset($args['order_dir'])) {
            $params['order_dir'] = $args['order_dir'];
        }

        $data = $this->make_request('products/web/list', $params);

        if (!is_wp_error($data) && isset($data['success']) && $data['success']) {
            $products = $data['products'];
            set_transient($cache_key, $products, $this->cache_duration);
            return $products;
        }

        return array();
    }

    /**
     * Get product categories
     */
    public function get_categories() {
        $cached = get_transient('watercrm_categories');

        if (false !== $cached) {
            return $cached;
        }

        $data = $this->make_request('products/web/categories');

        if (!is_wp_error($data) && isset($data['success']) && $data['success']) {
            $categories = $data['categories'];
            set_transient('watercrm_categories', $categories, $this->cache_duration);
            return $categories;
        }

        return array();
    }

    /**
     * Get single product by ID
     */
    public function get_product($product_id) {
        $products = $this->get_products();

        foreach ($products as $product) {
            if ($product['id'] == $product_id) {
                return $product;
            }
        }

        return null;
    }

    /**
     * Clear cache
     */
    public function clear_cache() {
        delete_transient('watercrm_products');
        delete_transient('watercrm_categories');

        // Clear all product cache variations
        global $wpdb;
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_watercrm_products_%'");
        $wpdb->query("DELETE FROM {$wpdb->options} WHERE option_name LIKE '_transient_timeout_watercrm_products_%'");
    }

    /**
     * Test API connection
     */
    public function test_connection() {
        $result = $this->make_request('products/web/categories');

        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message()
            );
        }

        if (isset($result['success']) && $result['success']) {
            return array(
                'success' => true,
                'message' => __('Connection successful', 'watercrm-catalog')
            );
        }

        return array(
            'success' => false,
            'message' => __('Unexpected API response', 'watercrm-catalog')
        );
    }
}

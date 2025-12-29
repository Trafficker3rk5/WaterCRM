<?php
/**
 * Plugin Name: WaterCRM Product Catalog
 * Plugin URI: https://watercrm.com/plugins/catalog
 * Description: Display WaterCRM products on your WordPress site with customizable layouts and filters. Integrates seamlessly with WaterCRM API.
 * Version: 1.0.0
 * Author: WaterCRM
 * Author URI: https://watercrm.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: watercrm-catalog
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WATERCRM_CATALOG_VERSION', '1.0.0');
define('WATERCRM_CATALOG_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WATERCRM_CATALOG_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once WATERCRM_CATALOG_PLUGIN_DIR . 'includes/class-api-client.php';
require_once WATERCRM_CATALOG_PLUGIN_DIR . 'includes/class-shortcodes.php';
require_once WATERCRM_CATALOG_PLUGIN_DIR . 'includes/class-admin.php';

class WaterCRM_Catalog {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action('plugins_loaded', array($this, 'load_textdomain'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));

        // Initialize components
        WaterCRM_API_Client::get_instance();
        WaterCRM_Shortcodes::get_instance();

        if (is_admin()) {
            WaterCRM_Admin::get_instance();
        }
    }

    public function load_textdomain() {
        load_plugin_textdomain('watercrm-catalog', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function enqueue_scripts() {
        wp_enqueue_style(
            'watercrm-catalog-style',
            WATERCRM_CATALOG_PLUGIN_URL . 'assets/css/catalog.css',
            array(),
            WATERCRM_CATALOG_VERSION
        );

        wp_enqueue_script(
            'watercrm-catalog-script',
            WATERCRM_CATALOG_PLUGIN_URL . 'assets/js/catalog.js',
            array('jquery'),
            WATERCRM_CATALOG_VERSION,
            true
        );

        wp_localize_script('watercrm-catalog-script', 'watercrmCatalog', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('watercrm_catalog_nonce')
        ));
    }
}

// Initialize plugin
function watercrm_catalog_init() {
    return WaterCRM_Catalog::get_instance();
}

// Start the plugin
watercrm_catalog_init();

// Activation hook
register_activation_hook(__FILE__, 'watercrm_catalog_activate');
function watercrm_catalog_activate() {
    // Set default options
    if (!get_option('watercrm_api_url')) {
        add_option('watercrm_api_url', '');
    }
    if (!get_option('watercrm_api_key')) {
        add_option('watercrm_api_key', '');
    }
    if (!get_option('watercrm_cache_duration')) {
        add_option('watercrm_cache_duration', 3600);
    }
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'watercrm_catalog_deactivate');
function watercrm_catalog_deactivate() {
    // Clear cache
    delete_transient('watercrm_products');
    delete_transient('watercrm_categories');
}

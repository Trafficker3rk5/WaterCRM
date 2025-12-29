<?php
/**
 * Plugin Name: WaterCRM Lead Capture
 * Plugin URI: https://watercrm.com/plugins/leads
 * Description: Create beautiful lead capture forms and send leads directly to your WaterCRM system. Includes customizable forms, spam protection, and email notifications.
 * Version: 1.0.0
 * Author: WaterCRM
 * Author URI: https://watercrm.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: watercrm-leads
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('WATERCRM_LEADS_VERSION', '1.0.0');
define('WATERCRM_LEADS_PLUGIN_DIR', plugin_dir_path(__FILE__));
define('WATERCRM_LEADS_PLUGIN_URL', plugin_dir_url(__FILE__));

// Include required files
require_once WATERCRM_LEADS_PLUGIN_DIR . 'includes/class-api-client.php';
require_once WATERCRM_LEADS_PLUGIN_DIR . 'includes/class-form-handler.php';
require_once WATERCRM_LEADS_PLUGIN_DIR . 'includes/class-shortcodes.php';
require_once WATERCRM_LEADS_PLUGIN_DIR . 'includes/class-admin.php';

class WaterCRM_Leads {

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
        add_action('init', array($this, 'create_leads_table'));

        // Initialize components
        WaterCRM_Leads_API_Client::get_instance();
        WaterCRM_Leads_Form_Handler::get_instance();
        WaterCRM_Leads_Shortcodes::get_instance();

        if (is_admin()) {
            WaterCRM_Leads_Admin::get_instance();
        }
    }

    public function load_textdomain() {
        load_plugin_textdomain('watercrm-leads', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }

    public function enqueue_scripts() {
        wp_enqueue_style(
            'watercrm-leads-style',
            WATERCRM_LEADS_PLUGIN_URL . 'assets/css/forms.css',
            array(),
            WATERCRM_LEADS_VERSION
        );

        wp_enqueue_script(
            'watercrm-leads-script',
            WATERCRM_LEADS_PLUGIN_URL . 'assets/js/forms.js',
            array('jquery'),
            WATERCRM_LEADS_VERSION,
            true
        );

        wp_localize_script('watercrm-leads-script', 'watercrmLeads', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('watercrm_leads_nonce'),
            'strings' => array(
                'sending' => __('Sending...', 'watercrm-leads'),
                'success' => __('Thank you! Your message has been sent successfully.', 'watercrm-leads'),
                'error' => __('An error occurred. Please try again.', 'watercrm-leads'),
            )
        ));
    }

    public function create_leads_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'watercrm_leads';
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE IF NOT EXISTS $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            form_id varchar(50) NOT NULL,
            name varchar(255) NOT NULL,
            email varchar(255) NOT NULL,
            phone varchar(50) DEFAULT NULL,
            company varchar(255) DEFAULT NULL,
            message text DEFAULT NULL,
            product_interest varchar(255) DEFAULT NULL,
            form_data longtext DEFAULT NULL,
            ip_address varchar(45) DEFAULT NULL,
            user_agent text DEFAULT NULL,
            status varchar(20) DEFAULT 'pending',
            sent_to_crm tinyint(1) DEFAULT 0,
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY form_id (form_id),
            KEY status (status),
            KEY created_at (created_at)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

// Initialize plugin
function watercrm_leads_init() {
    return WaterCRM_Leads::get_instance();
}

// Start the plugin
watercrm_leads_init();

// Activation hook
register_activation_hook(__FILE__, 'watercrm_leads_activate');
function watercrm_leads_activate() {
    // Set default options
    if (!get_option('watercrm_leads_api_url')) {
        add_option('watercrm_leads_api_url', '');
    }
    if (!get_option('watercrm_leads_api_key')) {
        add_option('watercrm_leads_api_key', '');
    }
    if (!get_option('watercrm_leads_enable_recaptcha')) {
        add_option('watercrm_leads_enable_recaptcha', 0);
    }
    if (!get_option('watercrm_leads_notification_email')) {
        add_option('watercrm_leads_notification_email', get_option('admin_email'));
    }

    // Create table
    $plugin = WaterCRM_Leads::get_instance();
    $plugin->create_leads_table();
}

// Deactivation hook
register_deactivation_hook(__FILE__, 'watercrm_leads_deactivate');
function watercrm_leads_deactivate() {
    // Cleanup (optional - keep leads data)
}

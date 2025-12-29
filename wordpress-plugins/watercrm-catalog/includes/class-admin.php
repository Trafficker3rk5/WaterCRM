<?php
/**
 * WaterCRM Admin
 * Handles admin settings and pages
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Admin {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('admin_init', array($this, 'register_settings'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_scripts'));
        add_action('wp_ajax_watercrm_test_connection', array($this, 'ajax_test_connection'));
        add_action('wp_ajax_watercrm_clear_cache', array($this, 'ajax_clear_cache'));
    }

    public function add_admin_menu() {
        add_menu_page(
            __('WaterCRM Catalog', 'watercrm-catalog'),
            __('WaterCRM', 'watercrm-catalog'),
            'manage_options',
            'watercrm-catalog',
            array($this, 'settings_page'),
            'dashicons-products',
            58
        );

        add_submenu_page(
            'watercrm-catalog',
            __('Settings', 'watercrm-catalog'),
            __('Settings', 'watercrm-catalog'),
            'manage_options',
            'watercrm-catalog',
            array($this, 'settings_page')
        );

        add_submenu_page(
            'watercrm-catalog',
            __('Shortcode Guide', 'watercrm-catalog'),
            __('Shortcode Guide', 'watercrm-catalog'),
            'manage_options',
            'watercrm-catalog-guide',
            array($this, 'guide_page')
        );
    }

    public function register_settings() {
        register_setting('watercrm_catalog_settings', 'watercrm_api_url', array(
            'type' => 'string',
            'sanitize_callback' => 'esc_url_raw',
        ));

        register_setting('watercrm_catalog_settings', 'watercrm_api_key', array(
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
        ));

        register_setting('watercrm_catalog_settings', 'watercrm_cache_duration', array(
            'type' => 'integer',
            'default' => 3600,
            'sanitize_callback' => 'absint',
        ));
    }

    public function enqueue_admin_scripts($hook) {
        if (strpos($hook, 'watercrm-catalog') === false) {
            return;
        }

        wp_enqueue_style(
            'watercrm-admin-style',
            WATERCRM_CATALOG_PLUGIN_URL . 'assets/css/admin.css',
            array(),
            WATERCRM_CATALOG_VERSION
        );

        wp_enqueue_script(
            'watercrm-admin-script',
            WATERCRM_CATALOG_PLUGIN_URL . 'assets/js/admin.js',
            array('jquery'),
            WATERCRM_CATALOG_VERSION,
            true
        );

        wp_localize_script('watercrm-admin-script', 'watercrmAdmin', array(
            'ajaxurl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('watercrm_admin_nonce'),
            'strings' => array(
                'testing' => __('Testing connection...', 'watercrm-catalog'),
                'clearing' => __('Clearing cache...', 'watercrm-catalog'),
            )
        ));
    }

    public function settings_page() {
        ?>
        <div class="wrap watercrm-settings">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('watercrm_catalog_settings');
                ?>

                <table class="form-table">
                    <tr>
                        <th scope="row">
                            <label for="watercrm_api_url"><?php _e('API URL', 'watercrm-catalog'); ?></label>
                        </th>
                        <td>
                            <input type="url"
                                   id="watercrm_api_url"
                                   name="watercrm_api_url"
                                   value="<?php echo esc_attr(get_option('watercrm_api_url')); ?>"
                                   class="regular-text"
                                   placeholder="https://your-watercrm.com/api" />
                            <p class="description">
                                <?php _e('Enter your WaterCRM API URL', 'watercrm-catalog'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="watercrm_api_key"><?php _e('API Key', 'watercrm-catalog'); ?></label>
                        </th>
                        <td>
                            <input type="password"
                                   id="watercrm_api_key"
                                   name="watercrm_api_key"
                                   value="<?php echo esc_attr(get_option('watercrm_api_key')); ?>"
                                   class="regular-text" />
                            <p class="description">
                                <?php _e('Enter your WaterCRM API key', 'watercrm-catalog'); ?>
                            </p>
                        </td>
                    </tr>

                    <tr>
                        <th scope="row">
                            <label for="watercrm_cache_duration"><?php _e('Cache Duration (seconds)', 'watercrm-catalog'); ?></label>
                        </th>
                        <td>
                            <input type="number"
                                   id="watercrm_cache_duration"
                                   name="watercrm_cache_duration"
                                   value="<?php echo esc_attr(get_option('watercrm_cache_duration', 3600)); ?>"
                                   min="0"
                                   step="60"
                                   class="small-text" />
                            <p class="description">
                                <?php _e('How long to cache product data (default: 3600 seconds / 1 hour)', 'watercrm-catalog'); ?>
                            </p>
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>

            <hr>

            <h2><?php _e('Connection Test', 'watercrm-catalog'); ?></h2>
            <p>
                <button type="button" id="watercrm-test-connection" class="button">
                    <?php _e('Test API Connection', 'watercrm-catalog'); ?>
                </button>
                <span id="watercrm-test-result"></span>
            </p>

            <h2><?php _e('Cache Management', 'watercrm-catalog'); ?></h2>
            <p>
                <button type="button" id="watercrm-clear-cache" class="button">
                    <?php _e('Clear Product Cache', 'watercrm-catalog'); ?>
                </button>
                <span id="watercrm-cache-result"></span>
            </p>
        </div>
        <?php
    }

    public function guide_page() {
        ?>
        <div class="wrap watercrm-guide">
            <h1><?php _e('Shortcode Guide', 'watercrm-catalog'); ?></h1>

            <div class="card">
                <h2><?php _e('Products Grid', 'watercrm-catalog'); ?></h2>
                <p><?php _e('Display a grid of products:', 'watercrm-catalog'); ?></p>
                <code>[watercrm_products]</code>

                <h3><?php _e('Parameters:', 'watercrm-catalog'); ?></h3>
                <ul>
                    <li><strong>category</strong>: <?php _e('Filter by category name', 'watercrm-catalog'); ?></li>
                    <li><strong>columns</strong>: <?php _e('Number of columns (default: 3)', 'watercrm-catalog'); ?></li>
                    <li><strong>limit</strong>: <?php _e('Maximum number of products (default: 12)', 'watercrm-catalog'); ?></li>
                </ul>

                <h3><?php _e('Examples:', 'watercrm-catalog'); ?></h3>
                <code>[watercrm_products category="Filtros" columns="4" limit="8"]</code>
            </div>

            <div class="card">
                <h2><?php _e('Featured Products', 'watercrm-catalog'); ?></h2>
                <p><?php _e('Display only featured products:', 'watercrm-catalog'); ?></p>
                <code>[watercrm_featured]</code>

                <h3><?php _e('Parameters:', 'watercrm-catalog'); ?></h3>
                <ul>
                    <li><strong>columns</strong>: <?php _e('Number of columns (default: 4)', 'watercrm-catalog'); ?></li>
                    <li><strong>limit</strong>: <?php _e('Maximum number of products (default: 8)', 'watercrm-catalog'); ?></li>
                </ul>
            </div>

            <div class="card">
                <h2><?php _e('Single Product', 'watercrm-catalog'); ?></h2>
                <p><?php _e('Display a specific product:', 'watercrm-catalog'); ?></p>
                <code>[watercrm_product id="123"]</code>
            </div>

            <div class="card">
                <h2><?php _e('Categories List', 'watercrm-catalog'); ?></h2>
                <p><?php _e('Display a list of product categories:', 'watercrm-catalog'); ?></p>
                <code>[watercrm_categories]</code>
            </div>
        </div>
        <?php
    }

    public function ajax_test_connection() {
        check_ajax_referer('watercrm_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'watercrm-catalog')));
        }

        $api_client = WaterCRM_API_Client::get_instance();
        $result = $api_client->test_connection();

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    public function ajax_clear_cache() {
        check_ajax_referer('watercrm_admin_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'watercrm-catalog')));
        }

        $api_client = WaterCRM_API_Client::get_instance();
        $api_client->clear_cache();

        wp_send_json_success(array('message' => __('Cache cleared successfully', 'watercrm-catalog')));
    }
}

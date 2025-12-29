<?php
/**
 * WaterCRM Leads Admin
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Leads_Admin {

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
    }

    public function add_admin_menu() {
        add_menu_page(
            __('WaterCRM Leads', 'watercrm-leads'),
            __('WaterCRM Leads', 'watercrm-leads'),
            'manage_options',
            'watercrm-leads',
            array($this, 'leads_page'),
            'dashicons-email',
            59
        );

        add_submenu_page(
            'watercrm-leads',
            __('All Leads', 'watercrm-leads'),
            __('All Leads', 'watercrm-leads'),
            'manage_options',
            'watercrm-leads',
            array($this, 'leads_page')
        );

        add_submenu_page(
            'watercrm-leads',
            __('Settings', 'watercrm-leads'),
            __('Settings', 'watercrm-leads'),
            'manage_options',
            'watercrm-leads-settings',
            array($this, 'settings_page')
        );
    }

    public function register_settings() {
        register_setting('watercrm_leads_settings', 'watercrm_leads_api_url');
        register_setting('watercrm_leads_settings', 'watercrm_leads_api_key');
        register_setting('watercrm_leads_settings', 'watercrm_leads_notification_email');
        register_setting('watercrm_leads_settings', 'watercrm_leads_enable_recaptcha');
    }

    public function leads_page() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'watercrm_leads';
        $leads = $wpdb->get_results("SELECT * FROM $table_name ORDER BY created_at DESC LIMIT 100");

        ?>
        <div class="wrap">
            <h1><?php _e('All Leads', 'watercrm-leads'); ?></h1>
            <table class="wp-list-table widefat fixed striped">
                <thead>
                    <tr>
                        <th><?php _e('ID', 'watercrm-leads'); ?></th>
                        <th><?php _e('Name', 'watercrm-leads'); ?></th>
                        <th><?php _e('Email', 'watercrm-leads'); ?></th>
                        <th><?php _e('Phone', 'watercrm-leads'); ?></th>
                        <th><?php _e('Company', 'watercrm-leads'); ?></th>
                        <th><?php _e('Status', 'watercrm-leads'); ?></th>
                        <th><?php _e('Date', 'watercrm-leads'); ?></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($leads as $lead) : ?>
                        <tr>
                            <td><?php echo esc_html($lead->id); ?></td>
                            <td><?php echo esc_html($lead->name); ?></td>
                            <td><?php echo esc_html($lead->email); ?></td>
                            <td><?php echo esc_html($lead->phone); ?></td>
                            <td><?php echo esc_html($lead->company); ?></td>
                            <td>
                                <span class="status-<?php echo esc_attr($lead->status); ?>">
                                    <?php echo esc_html($lead->status); ?>
                                </span>
                                <?php if ($lead->sent_to_crm) : ?>
                                    <span class="dashicons dashicons-yes-alt" title="<?php _e('Sent to CRM', 'watercrm-leads'); ?>"></span>
                                <?php endif; ?>
                            </td>
                            <td><?php echo esc_html($lead->created_at); ?></td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php
    }

    public function settings_page() {
        ?>
        <div class="wrap">
            <h1><?php _e('WaterCRM Leads Settings', 'watercrm-leads'); ?></h1>

            <form method="post" action="options.php">
                <?php settings_fields('watercrm_leads_settings'); ?>

                <table class="form-table">
                    <tr>
                        <th><label for="watercrm_leads_api_url"><?php _e('API URL', 'watercrm-leads'); ?></label></th>
                        <td>
                            <input type="url" id="watercrm_leads_api_url" name="watercrm_leads_api_url"
                                   value="<?php echo esc_attr(get_option('watercrm_leads_api_url')); ?>"
                                   class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="watercrm_leads_api_key"><?php _e('API Key', 'watercrm-leads'); ?></label></th>
                        <td>
                            <input type="password" id="watercrm_leads_api_key" name="watercrm_leads_api_key"
                                   value="<?php echo esc_attr(get_option('watercrm_leads_api_key')); ?>"
                                   class="regular-text" />
                        </td>
                    </tr>
                    <tr>
                        <th><label for="watercrm_leads_notification_email"><?php _e('Notification Email', 'watercrm-leads'); ?></label></th>
                        <td>
                            <input type="email" id="watercrm_leads_notification_email" name="watercrm_leads_notification_email"
                                   value="<?php echo esc_attr(get_option('watercrm_leads_notification_email', get_option('admin_email'))); ?>"
                                   class="regular-text" />
                        </td>
                    </tr>
                </table>

                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
}

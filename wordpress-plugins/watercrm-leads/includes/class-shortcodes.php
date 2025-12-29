<?php
/**
 * WaterCRM Leads Shortcodes
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Leads_Shortcodes {

    private static $instance = null;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        add_shortcode('watercrm_lead_form', array($this, 'lead_form_shortcode'));
        add_shortcode('watercrm_contact_form', array($this, 'contact_form_shortcode'));
        add_shortcode('watercrm_quick_form', array($this, 'quick_form_shortcode'));
    }

    /**
     * Full lead form
     * Usage: [watercrm_lead_form]
     */
    public function lead_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'form_id' => 'lead_form',
            'title' => __('Request Information', 'watercrm-leads'),
            'submit_text' => __('Send', 'watercrm-leads'),
        ), $atts);

        ob_start();
        include WATERCRM_LEADS_PLUGIN_DIR . 'templates/lead-form.php';
        return ob_get_clean();
    }

    /**
     * Contact form
     * Usage: [watercrm_contact_form]
     */
    public function contact_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'form_id' => 'contact_form',
            'title' => __('Contact Us', 'watercrm-leads'),
            'submit_text' => __('Send Message', 'watercrm-leads'),
        ), $atts);

        ob_start();
        include WATERCRM_LEADS_PLUGIN_DIR . 'templates/contact-form.php';
        return ob_get_clean();
    }

    /**
     * Quick form (minimal fields)
     * Usage: [watercrm_quick_form]
     */
    public function quick_form_shortcode($atts) {
        $atts = shortcode_atts(array(
            'form_id' => 'quick_form',
            'title' => __('Quick Contact', 'watercrm-leads'),
            'submit_text' => __('Submit', 'watercrm-leads'),
        ), $atts);

        ob_start();
        include WATERCRM_LEADS_PLUGIN_DIR . 'templates/quick-form.php';
        return ob_get_clean();
    }
}

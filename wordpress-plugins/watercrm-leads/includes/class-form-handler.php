<?php
/**
 * WaterCRM Form Handler
 * Processes lead form submissions
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Leads_Form_Handler {

    private static $instance = null;
    private $api_client;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->api_client = WaterCRM_Leads_API_Client::get_instance();
        $this->init_hooks();
    }

    private function init_hooks() {
        add_action('wp_ajax_watercrm_submit_lead', array($this, 'ajax_submit_lead'));
        add_action('wp_ajax_nopriv_watercrm_submit_lead', array($this, 'ajax_submit_lead'));
    }

    /**
     * Handle AJAX form submission
     */
    public function ajax_submit_lead() {
        check_ajax_referer('watercrm_leads_nonce', 'nonce');

        $form_data = $_POST;
        unset($form_data['action'], $form_data['nonce']);

        // Validate required fields
        $validation = $this->validate_form($form_data);
        if (is_wp_error($validation)) {
            wp_send_json_error(array(
                'message' => $validation->get_error_message()
            ));
        }

        // Sanitize data
        $sanitized_data = $this->sanitize_form_data($form_data);

        // Check for spam
        if ($this->is_spam($sanitized_data)) {
            wp_send_json_error(array(
                'message' => __('Your submission was flagged as spam', 'watercrm-leads')
            ));
        }

        // Save to local database
        $lead_id = $this->save_lead($sanitized_data);

        if (!$lead_id) {
            wp_send_json_error(array(
                'message' => __('Failed to save lead', 'watercrm-leads')
            ));
        }

        // Send to WaterCRM
        $result = $this->api_client->submit_lead($sanitized_data);

        if (is_wp_error($result)) {
            // Update lead status
            $this->update_lead_status($lead_id, 'failed');

            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }

        // Update lead status
        $this->update_lead_status($lead_id, 'sent', true);

        // Send notification email
        $this->send_notification_email($sanitized_data);

        wp_send_json_success(array(
            'message' => __('Thank you! Your message has been sent successfully.', 'watercrm-leads'),
            'lead_id' => $lead_id
        ));
    }

    /**
     * Validate form data
     */
    private function validate_form($data) {
        if (empty($data['name'])) {
            return new WP_Error('missing_name', __('Name is required', 'watercrm-leads'));
        }

        if (empty($data['email'])) {
            return new WP_Error('missing_email', __('Email is required', 'watercrm-leads'));
        }

        if (!is_email($data['email'])) {
            return new WP_Error('invalid_email', __('Please enter a valid email address', 'watercrm-leads'));
        }

        return true;
    }

    /**
     * Sanitize form data
     */
    private function sanitize_form_data($data) {
        return array(
            'form_id' => isset($data['form_id']) ? sanitize_text_field($data['form_id']) : 'default',
            'name' => sanitize_text_field($data['name']),
            'email' => sanitize_email($data['email']),
            'phone' => isset($data['phone']) ? sanitize_text_field($data['phone']) : '',
            'company' => isset($data['company']) ? sanitize_text_field($data['company']) : '',
            'message' => isset($data['message']) ? sanitize_textarea_field($data['message']) : '',
            'product_interest' => isset($data['product_interest']) ? sanitize_text_field($data['product_interest']) : '',
            'form_data' => json_encode($data),
            'ip_address' => $this->get_client_ip(),
            'user_agent' => isset($_SERVER['HTTP_USER_AGENT']) ? sanitize_text_field($_SERVER['HTTP_USER_AGENT']) : '',
        );
    }

    /**
     * Basic spam check
     */
    private function is_spam($data) {
        // Check honeypot field
        if (!empty($data['honeypot'])) {
            return true;
        }

        // Check for suspicious patterns
        $message = strtolower($data['message']);
        $spam_keywords = array('viagra', 'cialis', 'casino', 'lottery', 'prize');

        foreach ($spam_keywords as $keyword) {
            if (strpos($message, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }

    /**
     * Save lead to database
     */
    private function save_lead($data) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'watercrm_leads';

        $result = $wpdb->insert(
            $table_name,
            array(
                'form_id' => $data['form_id'],
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'],
                'company' => $data['company'],
                'message' => $data['message'],
                'product_interest' => $data['product_interest'],
                'form_data' => $data['form_data'],
                'ip_address' => $data['ip_address'],
                'user_agent' => $data['user_agent'],
                'status' => 'pending',
                'sent_to_crm' => 0,
            ),
            array('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%d')
        );

        if ($result === false) {
            return false;
        }

        return $wpdb->insert_id;
    }

    /**
     * Update lead status
     */
    private function update_lead_status($lead_id, $status, $sent_to_crm = false) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'watercrm_leads';

        $wpdb->update(
            $table_name,
            array(
                'status' => $status,
                'sent_to_crm' => $sent_to_crm ? 1 : 0,
            ),
            array('id' => $lead_id),
            array('%s', '%d'),
            array('%d')
        );
    }

    /**
     * Send notification email
     */
    private function send_notification_email($data) {
        $to = get_option('watercrm_leads_notification_email', get_option('admin_email'));
        $subject = sprintf(__('New lead from %s', 'watercrm-leads'), get_bloginfo('name'));

        $message = sprintf(
            __("You have received a new lead:\n\nName: %s\nEmail: %s\nPhone: %s\nCompany: %s\n\nMessage:\n%s", 'watercrm-leads'),
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['company'],
            $data['message']
        );

        wp_mail($to, $subject, $message);
    }

    /**
     * Get client IP address
     */
    private function get_client_ip() {
        $ip = '';

        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            $ip = $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            $ip = $_SERVER['REMOTE_ADDR'];
        }

        return sanitize_text_field($ip);
    }
}

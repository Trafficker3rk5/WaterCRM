<?php
/**
 * WaterCRM Leads API Client
 * Handles communication with WaterCRM API for lead submission
 */

if (!defined('ABSPATH')) {
    exit;
}

class WaterCRM_Leads_API_Client {

    private static $instance = null;
    private $api_url;
    private $api_key;

    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->api_url = get_option('watercrm_leads_api_url');
        $this->api_key = get_option('watercrm_leads_api_key');
    }

    /**
     * Submit lead to WaterCRM
     */
    public function submit_lead($lead_data) {
        if (empty($this->api_url) || empty($this->api_key)) {
            return new WP_Error('missing_credentials', __('WaterCRM API credentials not configured', 'watercrm-leads'));
        }

        $url = trailingslashit($this->api_url) . 'leads/submit';

        $args = array(
            'headers' => array(
                'Authorization' => 'Bearer ' . $this->api_key,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ),
            'body' => json_encode($lead_data),
            'timeout' => 15,
            'method' => 'POST',
        );

        $response = wp_remote_post($url, $args);

        if (is_wp_error($response)) {
            return $response;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);

        if ($code >= 200 && $code < 300) {
            return array(
                'success' => true,
                'data' => $data,
                'message' => __('Lead submitted successfully', 'watercrm-leads')
            );
        }

        return new WP_Error(
            'api_error',
            isset($data['message']) ? $data['message'] : __('Failed to submit lead', 'watercrm-leads'),
            array('status' => $code)
        );
    }

    /**
     * Test API connection
     */
    public function test_connection() {
        if (empty($this->api_url) || empty($this->api_key)) {
            return array(
                'success' => false,
                'message' => __('API credentials not configured', 'watercrm-leads')
            );
        }

        // Try to submit a test lead (you might want to have a test endpoint instead)
        $test_data = array(
            'name' => 'Test Connection',
            'email' => 'test@watercrm.com',
            'message' => 'API connection test',
            'test' => true,
        );

        $result = $this->submit_lead($test_data);

        if (is_wp_error($result)) {
            return array(
                'success' => false,
                'message' => $result->get_error_message()
            );
        }

        return array(
            'success' => true,
            'message' => __('Connection successful', 'watercrm-leads')
        );
    }
}

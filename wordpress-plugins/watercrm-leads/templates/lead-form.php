<?php if (!defined('ABSPATH')) exit; ?>

<div class="watercrm-lead-form-wrapper">
    <?php if (!empty($atts['title'])) : ?>
        <h3 class="watercrm-form-title"><?php echo esc_html($atts['title']); ?></h3>
    <?php endif; ?>

    <form class="watercrm-lead-form" data-form-id="<?php echo esc_attr($atts['form_id']); ?>">
        <div class="watercrm-form-row">
            <label for="wcrm_name"><?php _e('Name', 'watercrm-leads'); ?> <span class="required">*</span></label>
            <input type="text" id="wcrm_name" name="name" required />
        </div>

        <div class="watercrm-form-row">
            <label for="wcrm_email"><?php _e('Email', 'watercrm-leads'); ?> <span class="required">*</span></label>
            <input type="email" id="wcrm_email" name="email" required />
        </div>

        <div class="watercrm-form-row">
            <label for="wcrm_phone"><?php _e('Phone', 'watercrm-leads'); ?></label>
            <input type="tel" id="wcrm_phone" name="phone" />
        </div>

        <div class="watercrm-form-row">
            <label for="wcrm_company"><?php _e('Company', 'watercrm-leads'); ?></label>
            <input type="text" id="wcrm_company" name="company" />
        </div>

        <div class="watercrm-form-row">
            <label for="wcrm_product"><?php _e('Product Interest', 'watercrm-leads'); ?></label>
            <input type="text" id="wcrm_product" name="product_interest" />
        </div>

        <div class="watercrm-form-row">
            <label for="wcrm_message"><?php _e('Message', 'watercrm-leads'); ?></label>
            <textarea id="wcrm_message" name="message" rows="5"></textarea>
        </div>

        <input type="hidden" name="form_id" value="<?php echo esc_attr($atts['form_id']); ?>" />
        <input type="text" name="honeypot" class="watercrm-honeypot" />

        <div class="watercrm-form-row">
            <button type="submit" class="watercrm-submit-btn">
                <?php echo esc_html($atts['submit_text']); ?>
            </button>
        </div>

        <div class="watercrm-form-message"></div>
    </form>
</div>

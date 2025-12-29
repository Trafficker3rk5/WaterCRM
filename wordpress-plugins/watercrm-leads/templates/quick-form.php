<?php if (!defined('ABSPATH')) exit; ?>

<div class="watercrm-lead-form-wrapper watercrm-quick-form">
    <?php if (!empty($atts['title'])) : ?>
        <h3 class="watercrm-form-title"><?php echo esc_html($atts['title']); ?></h3>
    <?php endif; ?>

    <form class="watercrm-lead-form" data-form-id="<?php echo esc_attr($atts['form_id']); ?>">
        <div class="watercrm-form-inline">
            <input type="text" name="name" placeholder="<?php esc_attr_e('Your Name', 'watercrm-leads'); ?>" required />
            <input type="email" name="email" placeholder="<?php esc_attr_e('Your Email', 'watercrm-leads'); ?>" required />
            <button type="submit" class="watercrm-submit-btn"><?php echo esc_html($atts['submit_text']); ?></button>
        </div>

        <input type="hidden" name="form_id" value="<?php echo esc_attr($atts['form_id']); ?>" />
        <input type="text" name="honeypot" class="watercrm-honeypot" />

        <div class="watercrm-form-message"></div>
    </form>
</div>

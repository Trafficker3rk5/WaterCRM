/**
 * WaterCRM Lead Forms Scripts
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        $('.watercrm-lead-form').on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $submitBtn = $form.find('.watercrm-submit-btn');
            var $message = $form.find('.watercrm-form-message');
            var formData = $form.serialize();

            // Disable submit button
            $submitBtn.prop('disabled', true).text(watercrmLeads.strings.sending);

            // Hide previous messages
            $message.removeClass('success error').hide();

            // Submit via AJAX
            $.ajax({
                url: watercrmLeads.ajaxurl,
                type: 'POST',
                data: {
                    action: 'watercrm_submit_lead',
                    nonce: watercrmLeads.nonce,
                    ...Object.fromEntries(new URLSearchParams(formData))
                },
                success: function(response) {
                    if (response.success) {
                        $message.addClass('success')
                            .text(response.data.message)
                            .show();

                        // Reset form
                        $form[0].reset();

                        // Hide message after 5 seconds
                        setTimeout(function() {
                            $message.fadeOut();
                        }, 5000);
                    } else {
                        $message.addClass('error')
                            .text(response.data.message || watercrmLeads.strings.error)
                            .show();
                    }

                    // Re-enable submit button
                    $submitBtn.prop('disabled', false)
                        .text($form.data('submit-text') || watercrmLeads.strings.send);
                },
                error: function() {
                    $message.addClass('error')
                        .text(watercrmLeads.strings.error)
                        .show();

                    $submitBtn.prop('disabled', false)
                        .text($form.data('submit-text') || watercrmLeads.strings.send);
                }
            });
        });

        // Store original submit button text
        $('.watercrm-lead-form').each(function() {
            var $form = $(this);
            var submitText = $form.find('.watercrm-submit-btn').text();
            $form.data('submit-text', submitText);
        });
    });

})(jQuery);

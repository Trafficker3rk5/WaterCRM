/**
 * WaterCRM Catalog Admin Scripts
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Test API connection
        $('#watercrm-test-connection').on('click', function(e) {
            e.preventDefault();

            var $button = $(this);
            var $result = $('#watercrm-test-result');

            $button.prop('disabled', true);
            $result.removeClass('success error').addClass('loading')
                .text(watercrmAdmin.strings.testing);

            $.ajax({
                url: watercrmAdmin.ajaxurl,
                type: 'POST',
                data: {
                    action: 'watercrm_test_connection',
                    nonce: watercrmAdmin.nonce
                },
                success: function(response) {
                    $button.prop('disabled', false);

                    if (response.success) {
                        $result.removeClass('loading error').addClass('success')
                            .text(response.data.message);
                    } else {
                        $result.removeClass('loading success').addClass('error')
                            .text(response.data.message);
                    }

                    setTimeout(function() {
                        $result.removeClass('success error loading').text('');
                    }, 5000);
                },
                error: function() {
                    $button.prop('disabled', false);
                    $result.removeClass('loading success').addClass('error')
                        .text('Connection test failed');

                    setTimeout(function() {
                        $result.removeClass('success error loading').text('');
                    }, 5000);
                }
            });
        });

        // Clear cache
        $('#watercrm-clear-cache').on('click', function(e) {
            e.preventDefault();

            var $button = $(this);
            var $result = $('#watercrm-cache-result');

            $button.prop('disabled', true);
            $result.removeClass('success error').addClass('loading')
                .text(watercrmAdmin.strings.clearing);

            $.ajax({
                url: watercrmAdmin.ajaxurl,
                type: 'POST',
                data: {
                    action: 'watercrm_clear_cache',
                    nonce: watercrmAdmin.nonce
                },
                success: function(response) {
                    $button.prop('disabled', false);

                    if (response.success) {
                        $result.removeClass('loading error').addClass('success')
                            .text(response.data.message);
                    } else {
                        $result.removeClass('loading success').addClass('error')
                            .text(response.data.message);
                    }

                    setTimeout(function() {
                        $result.removeClass('success error loading').text('');
                    }, 5000);
                },
                error: function() {
                    $button.prop('disabled', false);
                    $result.removeClass('loading success').addClass('error')
                        .text('Cache clearing failed');

                    setTimeout(function() {
                        $result.removeClass('success error loading').text('');
                    }, 5000);
                }
            });
        });
    });

})(jQuery);

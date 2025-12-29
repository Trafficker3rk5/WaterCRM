/**
 * WaterCRM Catalog Frontend Scripts
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Thumbnail image gallery
        $('.watercrm-thumbnail').on('click', function() {
            var newSrc = $(this).attr('src');
            $(this).closest('.watercrm-product-gallery').find('.watercrm-main-image img').attr('src', newSrc);
            $('.watercrm-thumbnail').removeClass('active');
            $(this).addClass('active');
        });

        // View product details (example - customize as needed)
        $('.watercrm-view-product').on('click', function(e) {
            e.preventDefault();
            var productId = $(this).data('product-id');
            // You can implement modal or redirect to product page
            console.log('View product:', productId);
        });

        // Category filter (example - customize as needed)
        $('.watercrm-category-link').on('click', function(e) {
            e.preventDefault();
            var category = $(this).data('category');
            // Implement filtering logic
            console.log('Filter by category:', category);
        });
    });

})(jQuery);

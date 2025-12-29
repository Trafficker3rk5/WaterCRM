<?php
/**
 * Template: Single Product
 * Displays a single product with full details
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="watercrm-single-product">
    <div class="watercrm-product-gallery">
        <?php if (!empty($product['images'])) : ?>
            <div class="watercrm-main-image">
                <img src="<?php echo esc_url($product['images'][0]['url'] ?? ''); ?>"
                     alt="<?php echo esc_attr($product['name']); ?>" />
            </div>
            <?php if (count($product['images']) > 1) : ?>
                <div class="watercrm-thumbnails">
                    <?php foreach ($product['images'] as $image) : ?>
                        <img src="<?php echo esc_url($image['url'] ?? ''); ?>"
                             alt="<?php echo esc_attr($product['name']); ?>"
                             class="watercrm-thumbnail" />
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>
        <?php endif; ?>
    </div>

    <div class="watercrm-product-details">
        <h1 class="watercrm-product-title">
            <?php echo esc_html($product['name']); ?>
            <?php if ($product['featured']) : ?>
                <span class="watercrm-badge watercrm-badge-featured">
                    <?php _e('Featured', 'watercrm-catalog'); ?>
                </span>
            <?php endif; ?>
        </h1>

        <?php if (!empty($product['model'])) : ?>
            <p class="watercrm-product-model">
                <strong><?php _e('Model:', 'watercrm-catalog'); ?></strong>
                <?php echo esc_html($product['model']); ?>
            </p>
        <?php endif; ?>

        <?php if (!empty($product['category_web'])) : ?>
            <p class="watercrm-product-category">
                <strong><?php _e('Category:', 'watercrm-catalog'); ?></strong>
                <span class="watercrm-category-badge">
                    <?php echo esc_html($product['category_web']); ?>
                </span>
            </p>
        <?php endif; ?>

        <?php if (!empty($product['description'])) : ?>
            <div class="watercrm-product-description">
                <h3><?php _e('Description', 'watercrm-catalog'); ?></h3>
                <?php echo wp_kses_post($product['description']); ?>
            </div>
        <?php endif; ?>

        <?php if (!empty($product['attributes'])) : ?>
            <div class="watercrm-product-attributes">
                <h3><?php _e('Features', 'watercrm-catalog'); ?></h3>
                <ul class="watercrm-attributes-list">
                    <?php foreach ($product['attributes'] as $attr) : ?>
                        <li><?php echo esc_html($attr['text'] ?? ''); ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>

        <?php if (!empty($product['documents'])) : ?>
            <div class="watercrm-product-documents">
                <h3><?php _e('Downloads', 'watercrm-catalog'); ?></h3>
                <ul class="watercrm-documents-list">
                    <?php foreach ($product['documents'] as $doc) : ?>
                        <li>
                            <a href="<?php echo esc_url($doc['url'] ?? ''); ?>"
                               target="_blank"
                               class="watercrm-doc-link">
                                <?php echo esc_html($doc['title'] ?? __('Download', 'watercrm-catalog')); ?>
                            </a>
                        </li>
                    <?php endforeach; ?>
                </ul>
            </div>
        <?php endif; ?>
    </div>
</div>

<?php
/**
 * Template: Products Grid
 * Displays products in a grid layout
 */

if (!defined('ABSPATH')) {
    exit;
}

$columns = isset($atts['columns']) ? intval($atts['columns']) : 3;
$column_class = 'watercrm-col-' . $columns;
?>

<div class="watercrm-products-grid watercrm-columns-<?php echo esc_attr($columns); ?>">
    <?php foreach ($products as $product) : ?>
        <div class="watercrm-product-item <?php echo esc_attr($column_class); ?>">
            <div class="watercrm-product-inner">
                <?php if (!empty($product['images']) && isset($product['images'][0])) : ?>
                    <div class="watercrm-product-image">
                        <img src="<?php echo esc_url($product['images'][0]['url'] ?? ''); ?>"
                             alt="<?php echo esc_attr($product['name']); ?>"
                             loading="lazy" />
                        <?php if ($product['featured']) : ?>
                            <span class="watercrm-badge watercrm-badge-featured">
                                <?php _e('Featured', 'watercrm-catalog'); ?>
                            </span>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>

                <div class="watercrm-product-content">
                    <h3 class="watercrm-product-title">
                        <?php echo esc_html($product['name']); ?>
                    </h3>

                    <?php if (!empty($product['model'])) : ?>
                        <p class="watercrm-product-model">
                            <strong><?php _e('Model:', 'watercrm-catalog'); ?></strong>
                            <?php echo esc_html($product['model']); ?>
                        </p>
                    <?php endif; ?>

                    <?php if (!empty($product['category_web'])) : ?>
                        <p class="watercrm-product-category">
                            <span class="watercrm-category-badge">
                                <?php echo esc_html($product['category_web']); ?>
                            </span>
                        </p>
                    <?php endif; ?>

                    <?php if (!empty($product['description'])) : ?>
                        <div class="watercrm-product-description">
                            <?php echo wp_kses_post(wp_trim_words($product['description'], 20)); ?>
                        </div>
                    <?php endif; ?>

                    <?php if (!empty($product['attributes'])) : ?>
                        <div class="watercrm-product-attributes">
                            <?php foreach (array_slice($product['attributes'], 0, 3) as $attr) : ?>
                                <span class="watercrm-attribute-tag">
                                    <?php echo esc_html($attr['text'] ?? ''); ?>
                                </span>
                            <?php endforeach; ?>
                        </div>
                    <?php endif; ?>

                    <div class="watercrm-product-actions">
                        <a href="#" class="watercrm-btn watercrm-btn-primary watercrm-view-product"
                           data-product-id="<?php echo esc_attr($product['id']); ?>">
                            <?php _e('View Details', 'watercrm-catalog'); ?>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    <?php endforeach; ?>
</div>

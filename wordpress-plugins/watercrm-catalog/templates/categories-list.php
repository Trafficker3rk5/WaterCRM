<?php
/**
 * Template: Categories List
 * Displays a list of product categories
 */

if (!defined('ABSPATH')) {
    exit;
}
?>

<div class="watercrm-categories-list">
    <ul class="watercrm-category-items">
        <?php foreach ($categories as $category) : ?>
            <li class="watercrm-category-item">
                <a href="#" class="watercrm-category-link"
                   data-category="<?php echo esc_attr($category); ?>">
                    <?php echo esc_html($category); ?>
                </a>
            </li>
        <?php endforeach; ?>
    </ul>
</div>

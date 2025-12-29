<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('visible_in_web')->default(false)->after('is_extra');
            $table->string('category_web')->nullable()->after('visible_in_web');
            $table->boolean('featured')->default(false)->after('category_web');
            $table->integer('order_web')->default(0)->after('featured');
            $table->text('seo_title')->nullable()->after('order_web');
            $table->text('seo_description')->nullable()->after('seo_title');
            $table->string('seo_keywords')->nullable()->after('seo_description');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'visible_in_web',
                'category_web',
                'featured',
                'order_web',
                'seo_title',
                'seo_description',
                'seo_keywords'
            ]);
        });
    }
};

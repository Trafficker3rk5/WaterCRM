<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->boolean('has_extras')->default(false)->after('category_id');
        });

        Schema::table('admin_catalogs', function (Blueprint $table) {
            $table->boolean('has_extras')->default(false)->after('order');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('has_extras');
        });

        Schema::table('admin_catalogs', function (Blueprint $table) {
            $table->dropColumn('has_extras');
        });
    }
};

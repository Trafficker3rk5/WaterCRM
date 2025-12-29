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
        //Schema::dropIfExists('admin_catalogs');
        //Schema::dropIfExists('companies');
        Schema::dropIfExists('product_attrs');
        //Schema::dropIfExists('product_files');
        Schema::dropIfExists('products');
        Schema::dropIfExists('spare_part_others');
        Schema::dropIfExists('spare_parts');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};

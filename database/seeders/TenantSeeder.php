<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Tenant\Catalog;
use Illuminate\Database\Seeder;

class TenantSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        Catalog::create(['name' => 'Puerta Fria', 'type' => 1]);
        Catalog::create(['name' => 'Referido', 'type' => 1]);
        Catalog::create(['name' => 'Feria', 'type' => 1]);
        Catalog::create(['name' => 'Llamada', 'type' => 1]);
        Catalog::create(['name' => 'Web', 'type' => 1]);

        Catalog::create(['name' => 'Activo', 'type' => 2, 'extra_1' => 0]);
        Catalog::create(['name' => 'Inactivo', 'type' => 2, 'extra_1' => 1]);
        Catalog::create(['name' => 'En Gestion', 'type' => 2, 'extra_1' => 0]);
        Catalog::create(['name' => 'Esperando Respuesta', 'type' => 2, 'extra_1' => 0]);
        Catalog::create(['name' => 'Venta Perdida', 'type' => 2, 'extra_1' => 1]);

        Catalog::create(['name' => 'Activo', 'type' => 3, 'extra_1' => 0]);
        Catalog::create(['name' => 'Inactivo', 'type' => 3, 'extra_1' => 1]);
        Catalog::create(['name' => 'En Gestion', 'type' => 3, 'extra_1' => 0]);
        Catalog::create(['name' => 'Esperando Respuesta', 'type' => 3, 'extra_1' => 0]);
        Catalog::create(['name' => 'Venta Perdida', 'type' => 3, 'extra_1' => 1]);
    }
}

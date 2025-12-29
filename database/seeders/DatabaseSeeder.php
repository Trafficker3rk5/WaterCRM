<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create default Admin user
        \App\Models\User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@watercrm.com',
            'password' => bcrypt('Mario.:123'),
            'rol_id' => 0, // Admin role
        ]);
    }
}

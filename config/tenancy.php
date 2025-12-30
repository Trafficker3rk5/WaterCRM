<?php

declare(strict_types=1);

use App\Models\Main\Tenant;
use Stancl\Tenancy\Middleware;

return [

    /*
    |--------------------------------------------------------------------------
    | Tenancy Model
    |--------------------------------------------------------------------------
    |
    | This is the model that represents tenants in your application. It should
    | extend the Stancl\Tenancy\Database\Models\Tenant model.
    |
    */

    'tenant_model' => Tenant::class,

    /*
    |--------------------------------------------------------------------------
    | Central Domains
    |--------------------------------------------------------------------------
    |
    | These domains are considered central domains and will not be associated
    | with any tenant. Requests to these domains will operate in central mode.
    |
    */

    'central_domains' => [
        'localhost',
        'localhost:8000',
        'crm-prueba.test',
    ],

    /*
    |--------------------------------------------------------------------------
    | Domain Model
    |--------------------------------------------------------------------------
    |
    | The model used to store and manage tenant domains.
    |
    */

    'domain_model' => \Stancl\Tenancy\Database\Models\Domain::class,

    /*
    |--------------------------------------------------------------------------
    | Database Prefix
    |--------------------------------------------------------------------------
    |
    | A prefix that will be used for the database names of tenants.
    |
    */

    'database_prefix' => 'tenant_',

    /*
    |--------------------------------------------------------------------------
    | Middleware
    |--------------------------------------------------------------------------
    |
    | The list of middleware to use for tenancy identification.
    |
    */

    'middleware' => [
        'web' => [
            Middleware\InitializeTenancyByDomain::class,
            Middleware\InitializeTenancyBySubdomain::class,
            Middleware\InitializeTenancyByDomainOrSubdomain::class,
            Middleware\InitializeTenancyByPath::class,
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Migration Paths
    |--------------------------------------------------------------------------
    |
    | Paths where migration files for tenants are located.
    |
    */

    'migration_paths' => [
        base_path('database/migrations/tenant'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Seeding Paths
    |--------------------------------------------------------------------------
    |
    | Paths where seeder files for tenants are located.
    |
    */

    'seeder_paths' => [
        base_path('database/seeders'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Bootstrap Tenancy
    |--------------------------------------------------------------------------
    |
    | Register services or configurations that should be executed when tenancy
    | is initialized.
    |
    */

    'bootstrap' => [
        \Stancl\Tenancy\Bootstrappers\CacheBootstrapper::class,
        \Stancl\Tenancy\Bootstrappers\DatabaseBootstrapper::class,
        \Stancl\Tenancy\Bootstrappers\FilesystemBootstrapper::class,
        // \Stancl\Tenancy\Bootstrappers\QueueBootstrapper::class,
    ],

    /*
    |--------------------------------------------------------------------------
    | Alter Base Path
    |--------------------------------------------------------------------------
    |
    | Allows you to alter the base path used for tenant-related operations.
    |
    */

    'alter_base_path' => null,

];

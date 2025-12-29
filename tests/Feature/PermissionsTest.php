<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Central\Company;
use App\Models\User;
use App\Models\Central\RoleModulePermission;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $company;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a test company
        $this->company = Company::factory()->create();

        // Create an admin user
        $this->admin = User::factory()->create([
            'company_id' => $this->company->id,
            'role' => 0, // Super Admin
        ]);
    }

    /** @test */
    public function it_can_display_permissions_page()
    {
        $response = $this->actingAs($this->admin)
            ->get('/permissions');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Central/Permissions/Index')
            ->has('auth.user')
            ->has('roles')
            ->has('modules')
        );
    }

    /** @test */
    public function it_can_create_permission()
    {
        $data = [
            'company_id' => $this->company->id,
            'role_id' => 2, // Commercial
            'module' => 'budgets',
            'can_view' => true,
            'can_create' => true,
            'can_edit' => false,
            'can_delete' => false,
            'can_approve' => false,
        ];

        $response = $this->actingAs($this->admin)
            ->post('/permissions', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('role_module_permissions', [
            'company_id' => $this->company->id,
            'role_id' => 2,
            'module' => 'budgets',
            'can_view' => true,
            'can_create' => true,
        ]);
    }

    /** @test */
    public function it_can_bulk_update_permissions()
    {
        $data = [
            'company_id' => $this->company->id,
            'role_id' => 2,
            'permissions' => [
                [
                    'module' => 'budgets',
                    'can_view' => true,
                    'can_create' => true,
                    'can_edit' => true,
                    'can_delete' => false,
                    'can_approve' => false,
                ],
                [
                    'module' => 'clients',
                    'can_view' => true,
                    'can_create' => true,
                    'can_edit' => true,
                    'can_delete' => true,
                    'can_approve' => false,
                ]
            ]
        ];

        $response = $this->actingAs($this->admin)
            ->post('/permissions/bulk', $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('role_module_permissions', [
            'module' => 'budgets',
            'can_create' => true,
        ]);
        $this->assertDatabaseHas('role_module_permissions', [
            'module' => 'clients',
            'can_delete' => true,
        ]);
    }

    /** @test */
    public function it_checks_permission_correctly()
    {
        RoleModulePermission::create([
            'company_id' => $this->company->id,
            'role_id' => 2,
            'module' => 'budgets',
            'can_view' => true,
            'can_create' => false,
            'can_edit' => false,
            'can_delete' => false,
            'can_approve' => false,
        ]);

        $hasView = RoleModulePermission::hasPermission(
            $this->company->id,
            2,
            'budgets',
            'view'
        );

        $hasCreate = RoleModulePermission::hasPermission(
            $this->company->id,
            2,
            'budgets',
            'create'
        );

        $this->assertTrue($hasView);
        $this->assertFalse($hasCreate);
    }

    /** @test */
    public function it_returns_default_permissions_when_none_set()
    {
        // Admin role should have all permissions by default
        $hasView = RoleModulePermission::hasPermission(
            $this->company->id,
            1, // Admin
            'budgets',
            'view'
        );

        $this->assertTrue($hasView);
    }

    /** @test */
    public function it_can_get_available_modules()
    {
        $response = $this->actingAs($this->admin)
            ->get('/permissions/modules');

        $response->assertStatus(200);
        $response->assertJsonStructure(['modules']);
    }

    /** @test */
    public function it_can_get_available_roles()
    {
        $response = $this->actingAs($this->admin)
            ->get('/permissions/roles');

        $response->assertStatus(200);
        $response->assertJsonStructure(['roles']);
    }
}

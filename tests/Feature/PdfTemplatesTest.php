<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\Central\Company;
use App\Models\User;
use App\Models\Central\PdfTemplate;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PdfTemplatesTest extends TestCase
{
    use RefreshDatabase;

    protected $admin;
    protected $company;

    protected function setUp(): void
    {
        parent::setUp();

        $this->company = Company::factory()->create();
        $this->admin = User::factory()->create([
            'company_id' => $this->company->id,
            'role' => 0,
        ]);
    }

    /** @test */
    public function it_can_display_pdf_templates_page()
    {
        $response = $this->actingAs($this->admin)
            ->get('/pdf-templates');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Central/PdfTemplates/Index')
            ->has('templates')
        );
    }

    /** @test */
    public function it_can_create_pdf_template()
    {
        $data = [
            'company_id' => $this->company->id,
            'name' => 'Presupuesto Estándar',
            'type' => 'budget',
            'html_content' => '<h1>{{company_name}}</h1><p>{{client_name}}</p>',
            'is_active' => true,
            'is_default' => false,
            'order' => 1,
        ];

        $response = $this->actingAs($this->admin)
            ->post('/pdf-templates', $data);

        $response->assertStatus(201);
        $this->assertDatabaseHas('pdf_templates', [
            'name' => 'Presupuesto Estándar',
            'type' => 'budget',
        ]);
    }

    /** @test */
    public function it_can_update_pdf_template()
    {
        $template = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Template Original',
        ]);

        $data = [
            'name' => 'Template Actualizada',
            'html_content' => '<h1>Nuevo contenido</h1>',
        ];

        $response = $this->actingAs($this->admin)
            ->put("/pdf-templates/{$template->id}", $data);

        $response->assertStatus(200);
        $this->assertDatabaseHas('pdf_templates', [
            'id' => $template->id,
            'name' => 'Template Actualizada',
        ]);
    }

    /** @test */
    public function it_can_delete_pdf_template()
    {
        $template = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
        ]);

        $response = $this->actingAs($this->admin)
            ->delete("/pdf-templates/{$template->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('pdf_templates', [
            'id' => $template->id,
        ]);
    }

    /** @test */
    public function it_can_duplicate_pdf_template()
    {
        $template = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
            'name' => 'Template Original',
        ]);

        $response = $this->actingAs($this->admin)
            ->post("/pdf-templates/{$template->id}/duplicate");

        $response->assertStatus(201);
        $this->assertDatabaseHas('pdf_templates', [
            'name' => 'Template Original (Copia)',
        ]);
    }

    /** @test */
    public function it_can_preview_pdf_template()
    {
        $template = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
            'html_content' => '<h1>{{company_name}}</h1>',
        ]);

        $data = [
            'data' => [
                'company_name' => 'Test Company',
            ],
        ];

        $response = $this->actingAs($this->admin)
            ->post("/pdf-templates/{$template->id}/preview", $data);

        $response->assertStatus(200);
        $response->assertJsonStructure(['html']);
        $response->assertJson([
            'html' => '<h1>Test Company</h1>',
        ]);
    }

    /** @test */
    public function it_sets_only_one_default_per_type()
    {
        // Create first default template
        $template1 = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
            'type' => 'budget',
            'is_default' => true,
        ]);

        // Create second template of same type as default
        $data = [
            'company_id' => $this->company->id,
            'name' => 'Nueva Plantilla',
            'type' => 'budget',
            'html_content' => '<h1>Test</h1>',
            'is_default' => true,
            'is_active' => true,
        ];

        $response = $this->actingAs($this->admin)
            ->post('/pdf-templates', $data);

        $response->assertStatus(201);

        // First template should no longer be default
        $template1->refresh();
        $this->assertFalse($template1->is_default);
    }

    /** @test */
    public function it_renders_template_with_variables()
    {
        $template = PdfTemplate::factory()->create([
            'company_id' => $this->company->id,
            'html_content' => '<h1>{{company_name}}</h1><p>Cliente: {{client_name}}</p>',
        ]);

        $data = [
            'company_name' => 'WaterCRM',
            'client_name' => 'Juan Pérez',
        ];

        $rendered = $template->render($data);

        $this->assertStringContainsString('WaterCRM', $rendered);
        $this->assertStringContainsString('Juan Pérez', $rendered);
        $this->assertStringNotContainsString('{{', $rendered);
    }
}

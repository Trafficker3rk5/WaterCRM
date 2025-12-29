<?php

use App\Http\Controllers\Central\AdminCatalogController;
use App\Http\Controllers\Central\CampaignController;
use App\Http\Controllers\Central\CompanyController;
use App\Http\Controllers\Central\CompanyUsageStatController;
use App\Http\Controllers\Central\DashboardController;
use App\Http\Controllers\Central\FileController;
use App\Http\Controllers\Central\PdfTemplateController;
use App\Http\Controllers\Central\ProductsController;
use App\Http\Controllers\Central\RoleModulePermissionController;
use App\Http\Controllers\Central\SparePartsController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->to('/central-dashboard');
})->name('central.home');
Route::get('/central-dashboard', [DashboardController::class, 'index'])->name('dashboard');

Route::get('/testMail', [DashboardController::class, 'testMail'])->name('testMail');

///Catalogs
Route::get('/catalog/attributes/{id}', [AdminCatalogController::class, 'getAttributes'])->name('catalog.attributes');
Route::get('/catalog/{type}', [AdminCatalogController::class, 'index'])->name('catalog.index');
Route::post('/catalog/{type}/list', [AdminCatalogController::class, 'list'])->name('catalog.list');
Route::post('/catalog/{type}/store', [AdminCatalogController::class, 'store'])->name('catalog.store');
Route::delete('/catalog/{adminCatalog}', [AdminCatalogController::class, 'destroy'])->name('catalog.destroy');
Route::get('/catalog/{type}/{id}', [AdminCatalogController::class, 'get'])->name('catalog.get');
Route::post('/catalog/{type}/updateOrder', [AdminCatalogController::class, 'updateOrder'])->name('catalog.updateOrder');

///Products
Route::resource('/products', ProductsController::class, ['names' => ['index' => 'products']]);
Route::post('/products/list', [ProductsController::class, 'list'])->name('products.list');
Route::get('/products/pdf/{pid}', [ProductsController::class, 'pdf'])->name('products.central.pdf');
Route::post('/products/sync-all', [ProductsController::class, 'syncAllProductsToTenants'])->middleware(['auth:sanctum', 'auth'])->name('products.sync.all');

// Product Web Visibility
Route::get('/products/web-visibility', [ProductsController::class, 'webVisibility'])->name('products.web.visibility.index');
Route::post('/products/{id}/web-visibility', [ProductsController::class, 'updateWebVisibility'])->name('products.web.visibility');
Route::get('/products/web/list', [ProductsController::class, 'getWebProducts'])->name('products.web.list');
Route::get('/products/web/categories', [ProductsController::class, 'getWebCategories'])->name('products.web.categories');
Route::post('/products/{id}/toggle-visibility', [ProductsController::class, 'toggleWebVisibility'])->name('products.toggle.visibility');
Route::post('/products/{id}/toggle-featured', [ProductsController::class, 'toggleFeatured'])->name('products.toggle.featured');
Route::post('/products/bulk-visibility', [ProductsController::class, 'bulkUpdateWebVisibility'])->name('products.bulk.visibility');
Route::post('/products/web/reorder', [ProductsController::class, 'reorderWebProducts'])->name('products.web.reorder');

///Spare Parts
Route::resource('/spare-parts', SparePartsController::class, 
    ['names' => ['index' => 'parts', 'create' => 'parts.create', 'edit' => 'parts.edit', 'store' => 'parts.store', 'destroy' => 'parts.destroy']]);
Route::post('/spare-parts/list', [SparePartsController::class, 'list'])->name('parts.list');

///Companies
Route::resource('/companies', CompanyController::class, ['names' => ['index' => 'companies']]);
Route::post('/companies/list', [CompanyController::class, 'list'])->name('companies.list');
Route::post('/companies/changeStatus/{cid}', [CompanyController::class, 'changeStatus'])->name('companies.change.status');

///TMP files
Route::post('/uploads/tmp/{type}', [FileController::class, 'uploadFile'])->name('upload.tmp');

///Role Module Permissions
Route::get('/permissions', [RoleModulePermissionController::class, 'index'])->name('permissions.index');
Route::get('/permissions/role/{roleId}', [RoleModulePermissionController::class, 'getRolePermissions'])->name('permissions.role');
Route::post('/permissions', [RoleModulePermissionController::class, 'store'])->name('permissions.store');
Route::post('/permissions/bulk', [RoleModulePermissionController::class, 'bulkUpdate'])->name('permissions.bulk');
Route::post('/permissions/check', [RoleModulePermissionController::class, 'checkPermission'])->name('permissions.check');
Route::delete('/permissions/{id}', [RoleModulePermissionController::class, 'destroy'])->name('permissions.destroy');
Route::get('/permissions/modules', [RoleModulePermissionController::class, 'getAvailableModules'])->name('permissions.modules');
Route::get('/permissions/roles', [RoleModulePermissionController::class, 'getRoles'])->name('permissions.roles');

///Company Usage Stats
Route::get('/usage-stats', [CompanyUsageStatController::class, 'index'])->name('usage.stats.index');
Route::get('/usage-stats/company/{companyId}', [CompanyUsageStatController::class, 'getCompanyStats'])->name('usage.stats.company');
Route::get('/usage-stats/company/{companyId}/current', [CompanyUsageStatController::class, 'getCurrentStats'])->name('usage.stats.current');
Route::post('/usage-stats/record', [CompanyUsageStatController::class, 'recordUsage'])->name('usage.stats.record');
Route::post('/usage-stats/{id}/calculate', [CompanyUsageStatController::class, 'calculateCost'])->name('usage.stats.calculate');
Route::get('/usage-stats/billing/summary', [CompanyUsageStatController::class, 'getBillingSummary'])->name('usage.stats.billing');
Route::get('/usage-stats/company/{companyId}/trends', [CompanyUsageStatController::class, 'getTrends'])->name('usage.stats.trends');
Route::get('/usage-stats/export', [CompanyUsageStatController::class, 'exportCsv'])->name('usage.stats.export');
Route::post('/usage-stats/company/{companyId}/collect', [CompanyUsageStatController::class, 'collectUsage'])->name('usage.stats.collect');

///PDF Templates
Route::get('/pdf-templates', [PdfTemplateController::class, 'index'])->name('pdf.templates.index');

// Specific routes MUST come before dynamic {id} routes
Route::get('/pdf-templates/variables/list', [PdfTemplateController::class, 'getAvailableVariables'])->name('pdf.templates.variables');
Route::get('/pdf-templates/default/{type}', [PdfTemplateController::class, 'getDefault'])->name('pdf.templates.default');
Route::post('/pdf-templates/reorder', [PdfTemplateController::class, 'reorder'])->name('pdf.templates.reorder');

// Advanced PDF Editor Routes (specific routes before {id})
Route::get('/pdf-templates/advanced/create', [PdfTemplateController::class, 'advancedCreate'])->name('pdf.templates.advanced.create');
Route::get('/pdf-templates/advanced/{id}/edit', [PdfTemplateController::class, 'advancedEdit'])->name('pdf.templates.advanced.edit');
Route::post('/pdf-templates/advanced', [PdfTemplateController::class, 'storeAdvanced'])->name('pdf.templates.advanced.store');
Route::put('/pdf-templates/advanced/{id}', [PdfTemplateController::class, 'updateAdvanced'])->name('pdf.templates.advanced.update');
Route::post('/pdf-templates/blocks/preview', [PdfTemplateController::class, 'previewFromBlocks'])->name('pdf.templates.blocks.preview');
Route::post('/pdf-templates/blocks/generate', [PdfTemplateController::class, 'generatePdfFromBlocks'])->name('pdf.templates.blocks.generate');

// Dynamic {id} routes come LAST
Route::get('/pdf-templates/{id}', [PdfTemplateController::class, 'show'])->name('pdf.templates.show');
Route::post('/pdf-templates', [PdfTemplateController::class, 'store'])->name('pdf.templates.store');
Route::put('/pdf-templates/{id}', [PdfTemplateController::class, 'update'])->name('pdf.templates.update');
Route::delete('/pdf-templates/{id}', [PdfTemplateController::class, 'destroy'])->name('pdf.templates.destroy');
Route::post('/pdf-templates/{id}/duplicate', [PdfTemplateController::class, 'duplicate'])->name('pdf.templates.duplicate');
Route::post('/pdf-templates/{id}/preview', [PdfTemplateController::class, 'preview'])->name('pdf.templates.preview');
Route::post('/pdf-templates/{id}/generate', [PdfTemplateController::class, 'generatePdf'])->name('pdf.templates.generate');
Route::post('/pdf-templates/{id}/save', [PdfTemplateController::class, 'savePdf'])->name('pdf.templates.save');

///Email Campaigns
Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');
Route::get('/campaigns/create', [CampaignController::class, 'create'])->name('campaigns.create');
Route::get('/campaigns/{id}/edit', [CampaignController::class, 'edit'])->name('campaigns.edit');
Route::post('/campaigns', [CampaignController::class, 'store'])->name('campaigns.store');
Route::put('/campaigns/{id}', [CampaignController::class, 'update'])->name('campaigns.update');
Route::delete('/campaigns/{id}', [CampaignController::class, 'destroy'])->name('campaigns.destroy');
Route::post('/campaigns/{id}/send', [CampaignController::class, 'send'])->name('campaigns.send');
Route::post('/campaigns/{id}/duplicate', [CampaignController::class, 'duplicate'])->name('campaigns.duplicate');
Route::get('/campaigns/{id}/stats', [CampaignController::class, 'stats'])->name('campaigns.stats');
Route::post('/campaigns/preview-recipients', [CampaignController::class, 'previewRecipients'])->name('campaigns.preview.recipients');

// Campaign Tracking Routes (public, no auth)
Route::get('/campaigns/track/open/{token}', [CampaignController::class, 'trackOpen'])->name('campaigns.track.open')->withoutMiddleware(['auth']);
Route::get('/campaigns/track/click/{token}', [CampaignController::class, 'trackClick'])->name('campaigns.track.click')->withoutMiddleware(['auth']);
Route::get('/campaigns/unsubscribe/{token}', [CampaignController::class, 'unsubscribe'])->name('campaigns.unsubscribe')->withoutMiddleware(['auth']);

Route::get('/test2', [ProfileController::class, 'edit'])->name('test2');
Route::get('/test3', [ProfileController::class, 'edit'])->name('test3');


Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');


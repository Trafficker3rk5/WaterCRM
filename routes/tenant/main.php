<?php
use App\Helpers\Lerph;
use App\Http\Controllers\Tenant\AddressController;
use App\Http\Controllers\Tenant\BudgetController;
use App\Http\Controllers\Tenant\CalendarController;
use App\Http\Controllers\Tenant\CatalogController;
use App\Http\Controllers\Tenant\ClientController;
use App\Http\Controllers\Tenant\CommonNoteController;
use App\Http\Controllers\Tenant\CompanyController;
use App\Http\Controllers\Tenant\DashboardController;
use App\Http\Controllers\Tenant\FileController;
use App\Http\Controllers\Tenant\InstallationController;
use App\Http\Controllers\Tenant\InstallationNoteController;
use App\Http\Controllers\Tenant\MaterialController;
use App\Http\Controllers\Tenant\HorecaController;
use App\Http\Controllers\Tenant\ProductController;
use App\Http\Controllers\Tenant\TaskController;
use App\Http\Controllers\Tenant\UserController;
use App\Http\Controllers\Tenant\VariableController;
use App\Http\Controllers\Tenant\ContractController;
use App\Http\Controllers\Tenant\SavingCalculatorController;
use App\Http\Controllers\Tenant\WalletController;
use App\Http\Controllers\Tenant\IncidentController;
use App\Http\Controllers\Tenant\InternalMessageController;
use App\Http\Controllers\Tenant\ExpenseController;
use App\Http\Controllers\Tenant\WarehouseController;
use App\Http\Controllers\Tenant\LoadingOrderController;
use App\Http\Controllers\Tenant\SalesGoalController;
use App\Http\Controllers\Tenant\TelemarketingController;
use Illuminate\Support\Facades\Route;

///Public Access
Route::middleware('check-permission:0,1,2,3,4,5,6')->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard.index');
    Route::post('/dashboard/stats', [DashboardController::class, 'stats'])->name('dashboard.stats');

    ///Oreca
    Route::post('/horeca/calculate', [HorecaController::class, 'calculate'])->name('horeca.calculate');
    Route::get('/horeca/variables', [HorecaController::class, 'getData'])->name('horeca.variables');
    Route::post('/budgets/store/horeca', [BudgetController::class, 'horecaStore'])->name('budgets.store.horeca');
    Route::get('/calculator', [SavingCalculatorController::class, 'index'])->name('saving.calculator');
    Route::post('/calculator/calculate', [SavingCalculatorController::class, 'calculate'])->name('saving.calculator.calculate');

    ///TMP files
    Route::post('/tenant/uploads/tmp/{type}', [FileController::class, 'uploadFile'])->name('tenant.upload.tmp');
    
    ///Tasks
    Route::resource('/tasks', TaskController::class, ['names' => ['index' => 'tasks']]);
    Route::post('/tasks/list', [TaskController::class, 'list'])->name('tasks.list');
    Route::post('/tasks/status/{id}', [TaskController::class, 'changeStatus'])->name('tasks.status');

    ///Calendar
    Route::get('/calendar', [CalendarController::class, 'index'])->name('calendar');
    Route::post('/calendar/list', [CalendarController::class, 'list'])->name('calendar.list');

    ///Common Notes
    Route::get('/notes/list/{type}/{tid}', [CommonNoteController::class, 'list'])->name('notes.list');
    Route::post('/notes/store', [CommonNoteController::class, 'store'])->name('notes.store');
    Route::delete('/notes/{notes}', [CommonNoteController::class, 'destroy'])->name('notes.destroy');
});

///Admin Access
Route::middleware('check-permission:0,1')->group(function () {
    ///Companies
    Route::resource('/company', CompanyController::class, ['names' => ['index' => 'company']]);

    ///Catalogs
    Route::get('/catalogs/{type}', [CatalogController::class, 'index'])->name('catalogs.index');
    Route::post('/catalogs/{type}/list', [CatalogController::class, 'list'])->name('catalogs.list');
    Route::post('/catalogs/{type}/store', [CatalogController::class, 'store'])->name('catalogs.store');
    Route::delete('/catalogs/{adminCatalog}', [CatalogController::class, 'destroy'])->name('catalogs.destroy');
    Route::get('/catalogs/{type}/{id}', [CatalogController::class, 'get'])->name('catalogs.get');

    ///Users
    Route::resource('/users', UserController::class, ['names' => ['index' => 'users']]);
    Route::post('/users/list', [UserController::class, 'list'])->name('users.list');
    Route::get('/profile', [UserController::class, 'profile'])->name('users.profile');
    Route::post('/profile', [UserController::class, 'profileStore'])->name('users.profile.store');

    ///Materials
    Route::resource('/materials', MaterialController::class, ['names' => ['index' => 'materials']]);
    Route::post('/materials/list', [MaterialController::class, 'list'])->name('materials.list');
    Route::post('/materials/changeStatus/{cid}', [MaterialController::class, 'changeStatus'])->name('materials.change.status');

    ///Products
    Route::resource('/prs', ProductController::class, ['names' => ['index' => 'prs']]);
    Route::post('/prs/list', [ProductController::class, 'list'])->name('prs.list');
    Route::post('/prs/changeStatus/{cid}', [ProductController::class, 'changeStatus'])->name('prs.change.status');
    

    ///Oreca
    Route::get('/variables', [VariableController::class, 'index'])->name('variables');
    Route::post('/variables', [VariableController::class, 'save'])->name('variables.store');

    ///Warehouses
    Route::get('/warehouses', [WarehouseController::class, 'index'])->name('warehouses.index');
    Route::get('/warehouses/create', [WarehouseController::class, 'create'])->name('warehouses.create');
    Route::post('/warehouses', [WarehouseController::class, 'store'])->name('warehouses.store');
    Route::get('/warehouses/{id}/edit', [WarehouseController::class, 'edit'])->name('warehouses.edit');
    Route::post('/warehouses/{id}', [WarehouseController::class, 'update'])->name('warehouses.update');
    Route::delete('/warehouses/{id}', [WarehouseController::class, 'destroy'])->name('warehouses.destroy');
    Route::get('/warehouses/{id}/stock', [WarehouseController::class, 'stock'])->name('warehouses.stock');
    Route::post('/warehouses/{id}/stock', [WarehouseController::class, 'updateStock'])->name('warehouses.stock.update');
    Route::get('/warehouses/{id}/orders', [WarehouseController::class, 'orders'])->name('warehouses.orders');
    Route::post('/warehouses/{id}/orders', [WarehouseController::class, 'createOrder'])->name('warehouses.orders.create');
    Route::post('/warehouses/orders/{orderId}/receive', [WarehouseController::class, 'receiveOrder'])->name('warehouses.orders.receive');
    Route::post('/warehouses/{id}/check-automatic-orders', [WarehouseController::class, 'checkAutomaticOrders'])->name('warehouses.check.automatic.orders');
});



///Comercial Access
Route::middleware('check-permission:0,1,2,4,6')->group(function () {
    ///Clients
    Route::get('/clients/opportunities', [ClientController::class, 'opportunities'])->name('clients.opportunities');
    Route::resource('/clients', ClientController::class, ['names' => ['index' => 'clients']]);
    Route::post('/clients/list', [ClientController::class, 'list'])->name('clients.list');
    Route::get('/clients/addresses/{cid}', [ClientController::class, 'getAddresses'])->name('clients.addresses');
    Route::post('/clients/board/updateStatus/{cid}', [ClientController::class, 'updateStatus'])->name('clients.board.updateStatus');

    ///Contactos
    Route::get('/contacts/opportunities', [ClientController::class, 'opportunities'])->name('contacts.opportunities');
    Route::resource('/contacts', ClientController::class, ['names' => ['index' => 'contacts']]);
    Route::post('/contacts/list', [ClientController::class, 'list'])->name('contacts.list');
    Route::post('/contacts/client/{cid}', [ClientController::class, 'convertClient'])->name('contacts.convert');

    ///Addresses
    Route::post('/address/validate', [AddressController::class, 'validateForm'])->name('address.validate');
    Route::post('/address/store', [AddressController::class, 'store'])->name('address.store');

    ///Budgets
    Route::get('/budgets/{cid}', [BudgetController::class, 'index'])->name('budgets.index');
    Route::get('/budgets/{cid}/get/{id}', [BudgetController::class, 'get'])->name('budgets.get');
    Route::post('/budgets/{cid}/list', [BudgetController::class, 'list'])->name('budgets.list');
    Route::post('/budgets/{cid}/store', [BudgetController::class, 'store'])->name('budgets.store');
    Route::delete('/budgets/{bid}', [BudgetController::class, 'destroy'])->name('budgets.destroy');
    Route::get('/budgets/{cid}/create', [BudgetController::class, 'create'])->name('budgets.create');
    Route::get('/budgets/{cid}/{id}', [BudgetController::class, 'edit'])->name('budgets.edit');
    Route::post('/budgets/details/validate', [BudgetController::class, 'validateDetailsForm'])->name('budgets.details.validate');
    Route::get('/budgets/pdf/download/{id}', [BudgetController::class, 'downloadBudget'])->name('budgets.pdf');
    Route::get('/budgets/pdf/download-advanced/{id}', [BudgetController::class, 'downloadBudgetAdvanced'])->name('budgets.pdf.advanced');

    Route::post('/budgets/reject/{id}', [BudgetController::class, 'reject'])->name('budgets.reject');
    Route::post('/budgets/accept/{id}', [BudgetController::class, 'accept'])->name('budgets.accept');

    ///Contracts
    Route::get('/contracts/{cid}', [ContractController::class, 'index'])->name('contracts.index');
    Route::get('/contracts/{cid}/create', [ContractController::class, 'create'])->name('contracts.create');
    Route::get('/contracts/{cid}/{id}/edit', [ContractController::class, 'edit'])->name('contracts.edit');
    Route::post('/contracts/{cid}/store', [ContractController::class, 'store'])->name('contracts.store');
    Route::post('/contracts/{cid}/{id}/update', [ContractController::class, 'update'])->name('contracts.update');
    Route::delete('/contracts/{cid}/{id}', [ContractController::class, 'destroy'])->name('contracts.destroy');
    Route::get('/contracts/{cid}/budget/{bid}', [ContractController::class, 'showForBudget'])->name('contracts.show.budget');
    Route::post('/contracts/{cid}/budget/{bid}/sign', [ContractController::class, 'saveSignatures'])->name('contracts.sign');
    Route::get('/contracts/{cid}/budget/{bid}/download/{id}', [ContractController::class, 'download'])->name('contracts.download');

    ///Sales Goals
    Route::get('/sales-goals', [SalesGoalController::class, 'index'])->name('sales-goals.index');
    Route::post('/sales-goals', [SalesGoalController::class, 'store'])->name('sales-goals.store');
    Route::post('/sales-goals/{id}', [SalesGoalController::class, 'update'])->name('sales-goals.update');
    Route::delete('/sales-goals/{id}', [SalesGoalController::class, 'destroy'])->name('sales-goals.destroy');
    Route::post('/sales-goals/{id}/update-progress', [SalesGoalController::class, 'updateProgress'])->name('sales-goals.update-progress');
    Route::post('/sales-goals/update-all-progress', [SalesGoalController::class, 'updateAllProgress'])->name('sales-goals.update-all-progress');

    ///Sales Rankings & Dashboard
    Route::get('/sales-rankings', [SalesGoalController::class, 'salesRankings'])->name('sales-rankings');
    Route::get('/my-progress', [SalesGoalController::class, 'myProgress'])->name('my-progress');
});

///Tecnic Access
Route::middleware('check-permission:0,1,3,5')->group(function () {
    ///Instalations
    Route::get('/installations/pending', [InstallationController::class, 'pending'])->name('installations.pending');
    Route::get('/installations/all', [InstallationController::class, 'allData'])->name('installations.all');
    Route::resource('/installations', InstallationController::class, ['names' => ['index' => 'installations']]);
    Route::post('/installations/list', [InstallationController::class, 'list'])->name('installations.list');
    Route::post('/installations/create', [InstallationController::class, 'create'])->name('installations.create');
    Route::post('/installations/assign', [InstallationController::class, 'assign'])->name('installations.assign');

    ///Installation Notes
    Route::get('/installations/{iid}/notes', [InstallationNoteController::class, 'list'])->name('installations.notes');
    Route::post('/installations/{iid}/notes/store', [InstallationNoteController::class, 'store'])->name('installations.notes.store');
    Route::delete('/installations/notes/{notes}', [InstallationNoteController::class, 'destroy'])->name('installations.notes.destroy');

    ///Maintences
    Route::get('/maintenances/pending', [InstallationController::class, 'pending'])->name('maintenances.pendings');
    Route::get('/maintenances/all', [InstallationController::class, 'allData'])->name('maintenances.all');
    Route::resource('/maintenances', InstallationController::class, ['names' => ['index' => 'maintenances']]);
    Route::post('/maintenances/list', [InstallationController::class, 'list'])->name('maintenances.list');
    Route::post('/maintenances/create', [InstallationController::class, 'create'])->name('maintenances.create');
    Route::post('/maintenances/assign', [InstallationController::class, 'assign'])->name('maintenances.assign');

    ///Wallet
    Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
    Route::post('/wallet/transaction', [WalletController::class, 'store'])->name('wallet.transaction');
    Route::get('/wallet/transactions', [WalletController::class, 'transactions'])->name('wallet.transactions');
    Route::get('/wallet/admin', [WalletController::class, 'adminIndex'])->name('wallet.admin')->middleware('check-permission:0,1,2,3');

    ///Incidents
    Route::resource('/incidents', IncidentController::class);
    Route::post('/incidents/{id}/resolve', [IncidentController::class, 'resolve'])->name('incidents.resolve');
    Route::post('/incidents/{id}/update-status', [IncidentController::class, 'updateStatus'])->name('incidents.update-status');
    Route::get('/incidents/unread/count', [IncidentController::class, 'unread'])->name('incidents.unread');

    ///Internal Messages
    Route::get('/messages', [InternalMessageController::class, 'index'])->name('messages.index');
    Route::get('/messages/sent', [InternalMessageController::class, 'sent'])->name('messages.sent');
    Route::post('/messages', [InternalMessageController::class, 'store'])->name('messages.store');
    Route::get('/messages/{message}', [InternalMessageController::class, 'show'])->name('messages.show');
    Route::post('/messages/{message}/read', [InternalMessageController::class, 'markAsRead'])->name('messages.read');
    Route::get('/messages/unread/count', [InternalMessageController::class, 'unreadCount'])->name('messages.unread');

    ///Expenses
    Route::get('/expenses', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/expenses', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::post('/expenses/{expense}/approve', [ExpenseController::class, 'approve'])->name('expenses.approve')->middleware('check-permission:0,1,2,3');
    Route::post('/expenses/{expense}/reject', [ExpenseController::class, 'reject'])->name('expenses.reject')->middleware('check-permission:0,1,2,3');
    Route::get('/expenses/summary', [ExpenseController::class, 'summary'])->name('expenses.summary');

    ///Loading Orders
    Route::get('/loading-orders', [LoadingOrderController::class, 'index'])->name('loading-orders.index');
    Route::get('/loading-orders/create', [LoadingOrderController::class, 'create'])->name('loading-orders.create');
    Route::post('/loading-orders', [LoadingOrderController::class, 'store'])->name('loading-orders.store');
    Route::get('/loading-orders/{id}', [LoadingOrderController::class, 'show'])->name('loading-orders.show');
    Route::post('/loading-orders/{id}/validate', [LoadingOrderController::class, 'validateOrder'])->name('loading-orders.validate');
    Route::post('/loading-orders/{id}/mark-loaded', [LoadingOrderController::class, 'markAsLoaded'])->name('loading-orders.mark-loaded');
    Route::post('/loading-orders/{id}/cancel', [LoadingOrderController::class, 'cancel'])->name('loading-orders.cancel');
    Route::get('/loading-orders/pending/validation', [LoadingOrderController::class, 'pendingValidation'])->name('loading-orders.pending-validation');

    ///Installer Warehouses (Vans)
    Route::get('/installer-warehouses', [LoadingOrderController::class, 'installerWarehouses'])->name('installer-warehouses.index');
    Route::post('/installer-warehouses', [LoadingOrderController::class, 'storeInstallerWarehouse'])->name('installer-warehouses.store');
    Route::post('/installer-warehouses/{id}', [LoadingOrderController::class, 'updateInstallerWarehouse'])->name('installer-warehouses.update');
});

///Telemarketing (TMK) Access
Route::middleware('check-permission:0,1,6,7')->group(function () {
    ///Dashboard TMK
    Route::get('/telemarketing/dashboard', [TelemarketingController::class, 'dashboard'])->name('telemarketing.dashboard');

    ///My Calls (TMK Agent)
    Route::get('/telemarketing/my-calls', [TelemarketingController::class, 'myCalls'])->name('telemarketing.my-calls');
    Route::get('/telemarketing/calls/{id}', [TelemarketingController::class, 'showCall'])->name('telemarketing.call.show');
    Route::post('/telemarketing/calls/{id}/log', [TelemarketingController::class, 'logCall'])->name('telemarketing.call.log');
    Route::post('/telemarketing/calls/{id}/convert', [TelemarketingController::class, 'convertCall'])->name('telemarketing.call.convert');

    ///Call Lists
    Route::get('/telemarketing/lists', [TelemarketingController::class, 'callLists'])->name('telemarketing.lists');
    Route::post('/telemarketing/lists/upload', [TelemarketingController::class, 'uploadList'])->name('telemarketing.lists.upload')->middleware('check-permission:0,1,6');

    ///Call Scripts
    Route::get('/telemarketing/scripts', [TelemarketingController::class, 'scripts'])->name('telemarketing.scripts');
    Route::post('/telemarketing/scripts', [TelemarketingController::class, 'storeScript'])->name('telemarketing.scripts.store')->middleware('check-permission:0,1,6');
    Route::post('/telemarketing/scripts/{id}', [TelemarketingController::class, 'updateScript'])->name('telemarketing.scripts.update')->middleware('check-permission:0,1,6');
    Route::delete('/telemarketing/scripts/{id}', [TelemarketingController::class, 'destroyScript'])->name('telemarketing.scripts.destroy')->middleware('check-permission:0,1,6');

    ///Team Performance (Jefe TMK only)
    Route::get('/telemarketing/team-performance', [TelemarketingController::class, 'teamPerformance'])->name('telemarketing.team-performance')->middleware('check-permission:0,1,6');
});
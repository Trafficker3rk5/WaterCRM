<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Tenant\Wallet;
use App\Models\Tenant\WalletTransaction;
use Illuminate\Foundation\Testing\RefreshDatabase;

class WalletTest extends TestCase
{
    use RefreshDatabase;

    protected $user;
    protected $wallet;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create(['role' => 3]); // Installer
        $this->wallet = Wallet::factory()->create([
            'user_id' => $this->user->id,
            'balance' => 1000.00,
        ]);
    }

    /** @test */
    public function it_can_display_wallet_page()
    {
        $response = $this->actingAs($this->user)
            ->get('/wallet');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Tenant/Wallet/Index')
            ->has('wallet')
            ->has('transactions')
        );
    }

    /** @test */
    public function it_can_add_income_transaction()
    {
        $data = [
            'type' => 'income',
            'amount' => 500.00,
            'payment_method' => 'cash',
            'concept' => 'deposit',
            'description' => 'Pago de cliente',
        ];

        $initialBalance = $this->wallet->balance;

        $response = $this->actingAs($this->user)
            ->post('/wallet/transaction', $data);

        $response->assertRedirect();

        $this->wallet->refresh();
        $this->assertEquals($initialBalance + 500, $this->wallet->balance);

        $this->assertDatabaseHas('wallet_transactions', [
            'wallet_id' => $this->wallet->id,
            'type' => 'income',
            'amount' => 500.00,
        ]);
    }

    /** @test */
    public function it_can_add_outcome_transaction()
    {
        $data = [
            'type' => 'outcome',
            'amount' => 200.00,
            'payment_method' => 'card',
            'concept' => 'payment',
            'description' => 'Gasto de materiales',
        ];

        $initialBalance = $this->wallet->balance;

        $response = $this->actingAs($this->user)
            ->post('/wallet/transaction', $data);

        $response->assertRedirect();

        $this->wallet->refresh();
        $this->assertEquals($initialBalance - 200, $this->wallet->balance);
    }

    /** @test */
    public function it_prevents_negative_balance_on_outcome()
    {
        $this->wallet->update(['balance' => 100.00]);

        $data = [
            'type' => 'outcome',
            'amount' => 200.00,
            'payment_method' => 'cash',
            'concept' => 'payment',
        ];

        $response = $this->actingAs($this->user)
            ->post('/wallet/transaction', $data);

        $response->assertRedirect();
        $response->assertSessionHasErrors();

        $this->wallet->refresh();
        $this->assertEquals(100, $this->wallet->balance);
    }

    /** @test */
    public function it_calculates_totals_correctly()
    {
        // Add income transactions
        $this->wallet->addFunds(500, 'cash', 'deposit', 'Test 1', $this->user->id);
        $this->wallet->addFunds(300, 'card', 'deposit', 'Test 2', $this->user->id);

        // Add outcome transactions
        $this->wallet->withdrawFunds(200, 'cash', 'payment', 'Test 3', $this->user->id);

        $this->wallet->refresh();

        $this->assertEquals(800, $this->wallet->total_income);
        $this->assertEquals(200, $this->wallet->total_outcome);
        $this->assertEquals(1000 + 800 - 200, $this->wallet->balance);
    }

    /** @test */
    public function admin_can_view_all_wallets()
    {
        $admin = User::factory()->create(['role' => 1]);

        // Create multiple wallets
        Wallet::factory()->count(5)->create();

        $response = $this->actingAs($admin)
            ->get('/wallet/admin');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Tenant/Wallet/AdminIndex')
            ->has('wallets', 6) // 5 + the one created in setUp
        );
    }

    /** @test */
    public function it_records_transaction_creator()
    {
        $transaction = $this->wallet->addFunds(
            100,
            'cash',
            'deposit',
            'Test',
            $this->user->id
        );

        $this->assertEquals($this->user->id, $transaction->created_by);
    }

    /** @test */
    public function it_can_link_transaction_to_budget()
    {
        $budgetId = 123;

        $transaction = $this->wallet->addFunds(
            500,
            'cash',
            'payment',
            'Pago de presupuesto',
            $this->user->id,
            $budgetId
        );

        $this->assertEquals($budgetId, $transaction->budget_id);
    }

    /** @test */
    public function it_filters_transactions_by_type()
    {
        $this->wallet->addFunds(100, 'cash', 'deposit', 'Income 1', $this->user->id);
        $this->wallet->addFunds(200, 'cash', 'deposit', 'Income 2', $this->user->id);
        $this->wallet->withdrawFunds(50, 'cash', 'payment', 'Outcome 1', $this->user->id);

        $response = $this->actingAs($this->user)
            ->get('/wallet/transactions?type=income');

        $response->assertStatus(200);
        $data = $response->json();

        $this->assertCount(2, $data['data']); // Only income transactions
    }
}

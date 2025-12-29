<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Wallet;
use App\Models\Tenant\WalletTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;

class WalletController extends Controller
{
    public function index()
    {
        $user = auth()->user();
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        $transactions = $wallet->transactions()
            ->with(['creator', 'budget'])
            ->latest()
            ->get();

        return Inertia::render('Tenant/Wallet/Index', [
            'auth' => ['user' => $user],
            'wallet' => [
                'balance' => $wallet->balance,
                'total_income' => $wallet->total_income,
                'total_outcome' => $wallet->total_outcome,
            ],
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,outcome',
            'amount' => 'required|numeric|min:0.01',
            'payment_method' => 'required|in:cash,card,transfer',
            'concept' => 'required|in:deposit,payment,delivery',
            'description' => 'nullable|string',
            'budget_id' => 'nullable|exists:budgets,id',
        ]);

        $user = auth()->user();
        $wallet = Wallet::firstOrCreate(
            ['user_id' => $user->id],
            ['balance' => 0]
        );

        try {
            if ($validated['type'] === 'income') {
                $transaction = $wallet->addFunds(
                    $validated['amount'],
                    $validated['payment_method'],
                    $validated['concept'],
                    $validated['description'] ?? null,
                    $user->id,
                    $validated['budget_id'] ?? null
                );
            } else {
                $transaction = $wallet->withdrawFunds(
                    $validated['amount'],
                    $validated['payment_method'],
                    $validated['concept'],
                    $validated['description'] ?? null,
                    $user->id,
                    $validated['budget_id'] ?? null
                );
            }

            return redirect()->back()->with('success', 'Transaction completed successfully');
        } catch (\Exception $e) {
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }

    public function transactions(Request $request)
    {
        $wallet = Wallet::where('user_id', auth()->id())->first();

        if (!$wallet) {
            return response()->json(['transactions' => []]);
        }

        $query = $wallet->transactions()->with(['creator', 'budget']);

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('concept')) {
            $query->where('concept', $request->concept);
        }

        $transactions = $query->latest()->paginate(50);

        return response()->json($transactions);
    }

    public function adminIndex()
    {
        $wallets = Wallet::with('user')
            ->withSum('transactions as total_income', 'amount')
            ->get();

        return Inertia::render('Tenant/Wallet/AdminIndex', [
            'wallets' => $wallets,
        ]);
    }
}

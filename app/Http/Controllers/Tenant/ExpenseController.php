<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\Expense;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $query = Expense::with(['user', 'approver']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->byType($request->type);
        }

        if (auth()->user()->rol_id >= 4) {
            $query->where('user_id', auth()->id());
        }

        $expenses = $query->latest()->paginate(20);

        return Inertia::render('Tenant/Expenses/Index', [
            'expenses' => $expenses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:food,fuel,hotel,parts,other',
            'amount' => 'required|numeric|min:0.01',
            'supplier' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'receipt_image' => 'required|image|max:5120',
            'expense_date' => 'required|date',
        ]);

        if ($request->hasFile('receipt_image')) {
            $manager = new ImageManager(new Driver());
            $image = $manager->read($request->file('receipt_image'));
            
            $image->scaleDown(width: 1200);
            
            $filename = 'expenses/' . uniqid() . '.jpg';
            Storage::disk('public')->put($filename, $image->toJpeg(quality: 85));
            $validated['receipt_image'] = $filename;
        }

        $expense = Expense::create([
            ...$validated,
            'user_id' => auth()->id(),
            'status' => 'pending',
        ]);

        return redirect()->back()->with('success', 'Expense submitted successfully');
    }

    public function approve(Expense $expense)
    {
        if (auth()->user()->rol_id > 3) {
            abort(403);
        }

        $expense->approve();

        return redirect()->back()->with('success', 'Expense approved');
    }

    public function reject(Expense $expense)
    {
        if (auth()->user()->rol_id > 3) {
            abort(403);
        }

        $expense->reject();

        return redirect()->back()->with('success', 'Expense rejected');
    }

    public function summary()
    {
        $userId = auth()->id();
        
        $totalExpenses = Expense::where('user_id', $userId)
            ->approved()
            ->sum('amount');

        $pendingExpenses = Expense::where('user_id', $userId)
            ->pending()
            ->sum('amount');

        $byType = Expense::where('user_id', $userId)
            ->approved()
            ->selectRaw('type, SUM(amount) as total')
            ->groupBy('type')
            ->get();

        return response()->json([
            'total' => $totalExpenses,
            'pending' => $pendingExpenses,
            'by_type' => $byType,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Models\Tenant\InternalMessage;
use App\Models\Tenant\TenantUser;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InternalMessageController extends Controller
{
    public function index()
    {
        $messages = InternalMessage::forUser(auth()->id())
            ->with(['sender', 'client'])
            ->latest()
            ->paginate(20);

        $unreadCount = InternalMessage::forUser(auth()->id())
            ->unread()
            ->count();

        $users = TenantUser::select('id', 'name', 'last_name', 'email')
            ->where('id', '!=', auth()->id())
            ->get();

        return Inertia::render('Tenant/Messages/Index', [
            'messages' => $messages,
            'unreadCount' => $unreadCount,
            'users' => $users,
        ]);
    }

    public function sent()
    {
        $messages = InternalMessage::where('from_user_id', auth()->id())
            ->with(['recipient', 'client'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Tenant/Messages/Sent', [
            'messages' => $messages,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'to_user_id' => 'required|exists:users,id',
            'subject' => 'required|string|max:255',
            'body' => 'required|string',
            'client_id' => 'nullable|exists:clients,id',
        ]);

        $message = InternalMessage::create([
            ...$validated,
            'from_user_id' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Message sent successfully');
    }

    public function show(InternalMessage $message)
    {
        if ($message->to_user_id !== auth()->id() && $message->from_user_id !== auth()->id()) {
            abort(403);
        }

        if ($message->to_user_id === auth()->id() && !$message->is_read) {
            $message->markAsRead();
        }

        $message->load(['sender', 'recipient', 'client']);

        return Inertia::render('Tenant/Messages/Show', [
            'message' => $message,
        ]);
    }

    public function markAsRead(InternalMessage $message)
    {
        if ($message->to_user_id !== auth()->id()) {
            abort(403);
        }

        $message->markAsRead();

        return response()->json(['success' => true]);
    }

    public function unreadCount()
    {
        $count = InternalMessage::forUser(auth()->id())
            ->unread()
            ->count();

        return response()->json(['count' => $count]);
    }
}

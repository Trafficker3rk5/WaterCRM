<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Storage;

class Client extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'is_client',
        'external_id',
        'company_name',
        'logo',
        'contact_name',
        'contact_lastname',
        'email',
        'phone',
        'notes',
        'origin_id',
        'status_id',
        'responsible',
        'is_client',
        'activity_id',
        'business_name',
        'assigned_to',
        'family_id',
        'product_id'
    ];

    protected $appends = [
        'full_name', 
        'logo_url'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::created(function ($client) {
            $client->histories()->create([
                'type' => 1,
                'type_id' => $client->id
            ]);
        });

        static::updated(function ($client) {
            if ($client->isDirty('status_id') || $client->isDirty('is_client')){
                $client->histories()->create([
                    'type' => $client->isDirty('status_id') ? 2 : 6,
                    'type_id' => $client->id,
                    'extra' => $client->status_id ?? 0
                ]);
            }
        });
    }

    public function addresses()
    {
        return $this->belongsToMany(Address::class, 'client_addresses')->withPivot('address_id');
    }

    public function mainAddress()
    {
        return $this->addresses()->orderBy('principal', 'desc')->first();
    }

    public function origin()
    {
        return $this->belongsTo(Catalog::class);
    }

    public function status()
    {
        return $this->belongsTo(Catalog::class);
    }

    public function getImage()
    {
        return !empty($this->logo) ? Storage::disk('clients')->url(tenant('id').'/'.$this->logo) : 'https://ui-avatars.com/api/?name='.$this->company_name.'&color=7F9CF5&background=EBF4FF';
    }

    public function getFullNameAttribute()
    {
        return $this->contact_name.' '.$this->contact_lastname;
    }

    public function getLogoUrlAttribute()
    {
        return $this->getImage();
    }

    public function comments()
    {
        return $this->hasMany(CommonNote::class, 'type_id')->where('type', 1);
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    public function assigned()
    {
        return $this->belongsTo(TenantUser::class, 'assigned_to');
    }

    public function activity()
    {
        return $this->belongsTo(Catalog::class);
    }

    public function histories()
    {
        return $this->hasMany(ClientHistory::class)->orderBy('created_at', 'asc');
    }

    public function isExpired(){
        return $this->created_at->diffInDays() <= 30 ? 0 : ($this->created_at->diffInDays() <= 60 ? 1 : 2);
    }

    public function budgetsLigths()
    {
        $p = $this->budgets->where('status', 0)->count();
        $a = $this->budgets->where('status', 1)->count();
        $r = $this->budgets->where('status', 2)->count();
        return [
            'pendings' => $p,
            'approved' => $a,
            'rejected' => $r,
            'total' => $p + $a + $r
        ];
    }

    public function tasksLights()
    {
        $p = $this->tasks->where('status', 0)->count();
        $a = $this->tasks->where('status', 1)->count();
        $r = $this->tasks->where('status', 2)->count();
        return [
            'pendings' => $p,
            'approved' => $a,
            'rejected' => $r,
            'total' => $p + $a + $r
        ];
    }

    public function getLastChangeStatusAttribute()
    {
        $x = $this->histories->where('type', 2)->last();
        if (!$x) $x = $this->histories->where('type', 1)->last();
        return $x;
    }

    /**
     * Get full address string for the client
     */
    public function getFullAddress()
    {
        $mainAddress = $this->mainAddress();

        if (!$mainAddress) {
            return '';
        }

        $parts = array_filter([
            $mainAddress->address ?? null,
            $mainAddress->city ?? null,
            $mainAddress->province ?? null,
            $mainAddress->postal_code ?? null,
        ]);

        return implode(', ', $parts);
    }
}

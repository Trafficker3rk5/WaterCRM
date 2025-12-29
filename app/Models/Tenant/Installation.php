<?php

namespace App\Models\Tenant;

use App\Models\Central\Product;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Installation extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'budget_detail_id',
        'client_id',
        'address_id',
        'product_id',
        'assigned_to',
        'installation_date',
        'hours',
        'notes',
        'installation_notes',
        'client_name',
        'client_dni',
        'client_sign',
        'serial_number',
        'finished',
        'finished_reason',
        'next_maintenance',
        'is_maintenance',
        'status',           /// 0: Pendiente, 1: Realizado; 2: Canceled
    ];

    public function budgetDetail()
    {
        return $this->belongsTo(BudgetDetail::class);
    }

    public function assigned()
    {
        return $this->belongsTo(TenantUser::class, 'assigned_to');
    }

    public function address()
    {
        return $this->belongsTo(Address::class);
    }

    public function product()
    {
        return $this->belongsTo(Product::class);
    }

    public function getStatus()
    {
        return ['Pendiente', 'Realizado', 'Cancelado'][$this->status];
    }

    public function files()
    {
        return $this->hasMany(InstallationFile::class, 'installation_id');
    } 

    public function files0()
    {
        return $this->hasMany(InstallationFile::class, 'installation_id')->where('type', 0);
    }

    public function files1()
    {
        return $this->hasMany(InstallationFile::class, 'installation_id')->where('type', 1);
    }

    public function files2()
    {
        return $this->hasMany(InstallationFile::class, 'installation_id')->where('type', 2);
    }

    public function files3()
    {
        return $this->hasMany(InstallationFile::class, 'installation_id')->where('type', 3);
    }

    public function materials()
    {
        return $this->hasMany(InstallationMaterial::class);
    }

    public function parts()
    {
        return $this->hasMany(InstallationPart::class);
    }

    public function notes()
    {
        return $this->hasMany(InstallationNote::class);
    }

    public function client(){
        return $this->belongsTo(Client::class);
    }

    public function getFilesData($t)
    {
        $files = $this->files()->where('type', $t)->get();
        $data = [];
        foreach ($files as $file) {
            $data[] = [
                'id' => $file->id,
                'title' => $file->title,
                'file' => $file->file,
                'size' => $file->size,
                'order' => $file->order,
                'img' => $file->url,
                'type' => $t == 1 ? 'image' : ($t == 2 ? 'video' : 'file'),
                'image_type' => $file->image_type ?? '0'
            ];
        }
        return $data;
    }

    public function isEnabled(){
        return in_array($this->status, [0,3]) && Carbon::parse($this->installation_date)->format('Y-m-d') == Carbon::now()->format('Y-m-d') 
            //&& $this->assigned_to == auth()->user()->id
            ;
    }
}

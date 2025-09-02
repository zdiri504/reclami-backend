<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Complaint extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference_id',
        'user_id',
        'type',
        'subject',
        'description',
        'contact_info',
        'status',
        'priority',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function responses()
    {
        return $this->hasMany(Response::class);
    }

    public function statusHistory()
    {
        return $this->hasMany(StatusHistory::class);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($complaint) {
            // Generate unique reference ID
            $prefix = 'TT-';
            $lastComplaint = Complaint::where('reference_id', 'like', $prefix . '%')->orderBy('id', 'desc')->first();
            
            if ($lastComplaint) {
                $lastId = intval(substr($lastComplaint->reference_id, strlen($prefix)));
                $complaint->reference_id = $prefix . ($lastId + 1);
            } else {
                $complaint->reference_id = $prefix . '1001';
            }
        });
    }
}

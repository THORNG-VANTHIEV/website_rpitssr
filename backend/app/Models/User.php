<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'username',
        'email',
        'password',
        'role',
        'status',
        'studentId',
        'fullName',
        'khmerName',
        'latinName',
        'gender',
        'dob',
        'phone',
        'avatarUrl',
        'className',
        'semester',
        'academicYear',
        'generation',
        'shift',
        'room',
        'degreeLevel',
        'faculty',
        'totalCredits',
        'completedCredits',
        'scholarshipType',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected static function booted(): void
    {
        static::updated(function (User $user): void {
            if ($user->wasChanged(['password', 'role', 'status'])) {
                $user->tokens()->delete();
            }
        });

        static::deleting(function (User $user): void {
            $user->tokens()->delete();
        });
    }

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'dob' => 'date:Y-m-d',
            'totalCredits' => 'integer',
            'completedCredits' => 'integer',
        ];
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function isRejected(): bool
    {
        return $this->status === 'rejected';
    }

    public function isSubAdmin(): bool
    {
        return $this->role === 'sub_admin' || $this->role === 'admin';
    }

    public function isStudent(): bool
    {
        return $this->role === 'student';
    }

    public function blogPosts()
    {
        return $this->hasMany(BlogPost::class, 'authorId');
    }

    public function examResults()
    {
        return $this->hasMany(ExamResult::class, 'createdById');
    }
}

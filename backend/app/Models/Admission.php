<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Admission extends Model
{
    use HasFactory;

    protected $table = 'admissions';

    const CREATED_AT = 'createdAt';

    const UPDATED_AT = 'updatedAt';

    protected $fillable = [
        'trackingCode',
        'khmerName',
        'latinName',
        'gender',
        'dob',
        'idCardNumber',
        'studentCardNo',
        'nationality',
        'ethnicity',
        'religion',
        'pob',
        'phone',
        'telegram',
        'email',
        'currentAddress',
        'permanentAddress',
        'distanceKm',
        'familyMembersCount',
        'maritalStatus',
        'commuteMethod',
        'guardianName',
        'guardianRelation',
        'guardianPhone',
        'guardianEmail',
        'guardianAddress',
        'courseType',
        'studyType',
        'academicYear',
        'degreeLevel',
        'major',
        'shift',
        'educationLevel',
        'isStudyingGeneral',
        'previousSchool',
        'schoolGraduationYear',
        'previousTraining',
        'employmentStatus',
        'jobTitle',
        'incomeType',
        'personalIncome',
        'familyIncome',
        'employmentType',
        'workObstacle',
        'hasDisability',
        'disabilityType',
        'disabilityTiming',
        'isIndigenous',
        'indigenousGroup',
        'isOrphan',
        'hasEquityCard',
        'equityCardNumber',
        'equityCardType',
        'photoUrl',
        'certificateUrl',
        'idCardUrl',
        'familyBookUrl',
        'birthCertificateUrl',
        'equityCardUrl',
        'status',
        'adminNotes',
        'enrolledStudentId',
        'enrolledUserId',
    ];

    protected $casts = [
        'dob' => 'date',
        'distanceKm' => 'float',
        'familyMembersCount' => 'integer',
        'isStudyingGeneral' => 'boolean',
        'hasDisability' => 'boolean',
        'isIndigenous' => 'boolean',
        'isOrphan' => 'boolean',
        'hasEquityCard' => 'boolean',
    ];

    /**
     * Helpers for course type
     */
    public function isLongTerm(): bool
    {
        return $this->courseType === 'long_term' || in_array($this->degreeLevel, ['bachelor', 'higher_diploma']);
    }

    public function isShortTerm(): bool
    {
        return $this->courseType === 'short_term' || in_array($this->degreeLevel, ['tvet_short', 'short_course']);
    }

    /**
     * Relationship to enrolled User
     */
    public function enrolledUser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'enrolledUserId');
    }

    /**
     * Check status helpers
     */
    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isEnrolled(): bool
    {
        return $this->status === 'enrolled';
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * Add official RPITSSR/ETO/PR01/FR02 standard admission form fields
     */
    public function up(): void
    {
        if (Schema::hasTable('admissions')) {
            Schema::table('admissions', function (Blueprint $table) {
                // Program & Study Intent
                if (! Schema::hasColumn('admissions', 'studyType')) {
                    $table->string('studyType', 50)->default('scholarship')->after('courseType'); // scholarship | paying
                }
                if (! Schema::hasColumn('admissions', 'academicYear')) {
                    $table->string('academicYear', 50)->default('2026-2027')->after('studyType');
                }

                // Section A: Student Biography
                if (! Schema::hasColumn('admissions', 'idCardNumber')) {
                    $table->string('idCardNumber', 50)->nullable()->after('dob');
                }
                if (! Schema::hasColumn('admissions', 'studentCardNo')) {
                    $table->string('studentCardNo', 50)->nullable()->after('idCardNumber');
                }
                if (! Schema::hasColumn('admissions', 'nationality')) {
                    $table->string('nationality', 50)->default('កម្ពុជា')->after('studentCardNo');
                }
                if (! Schema::hasColumn('admissions', 'ethnicity')) {
                    $table->string('ethnicity', 50)->default('ខ្មែរ')->after('nationality');
                }
                if (! Schema::hasColumn('admissions', 'religion')) {
                    $table->string('religion', 50)->default('ព្រះពុទ្ធ')->after('ethnicity');
                }
                if (! Schema::hasColumn('admissions', 'pob')) {
                    $table->text('pob')->nullable()->after('religion'); // Place of Birth
                }
                if (! Schema::hasColumn('admissions', 'permanentAddress')) {
                    $table->text('permanentAddress')->nullable()->after('currentAddress');
                }
                if (! Schema::hasColumn('admissions', 'distanceKm')) {
                    $table->decimal('distanceKm', 6, 2)->nullable()->after('permanentAddress');
                }
                if (! Schema::hasColumn('admissions', 'familyMembersCount')) {
                    $table->integer('familyMembersCount')->nullable()->after('distanceKm');
                }
                if (! Schema::hasColumn('admissions', 'maritalStatus')) {
                    $table->string('maritalStatus', 50)->default('single')->after('familyMembersCount'); // single, married, divorced, widowed
                }
                if (! Schema::hasColumn('admissions', 'commuteMethod')) {
                    $table->string('commuteMethod', 100)->nullable()->after('maritalStatus');
                }

                // Guardian / Family Contact
                if (! Schema::hasColumn('admissions', 'guardianName')) {
                    $table->string('guardianName', 255)->nullable()->after('commuteMethod');
                }
                if (! Schema::hasColumn('admissions', 'guardianRelation')) {
                    $table->string('guardianRelation', 100)->nullable()->after('guardianName');
                }
                if (! Schema::hasColumn('admissions', 'guardianPhone')) {
                    $table->string('guardianPhone', 50)->nullable()->after('guardianRelation');
                }
                if (! Schema::hasColumn('admissions', 'guardianEmail')) {
                    $table->string('guardianEmail', 255)->nullable()->after('guardianPhone');
                }
                if (! Schema::hasColumn('admissions', 'guardianAddress')) {
                    $table->text('guardianAddress')->nullable()->after('guardianEmail');
                }

                // Section B: General Education
                if (! Schema::hasColumn('admissions', 'educationLevel')) {
                    $table->string('educationLevel', 100)->nullable()->after('guardianAddress');
                }
                if (! Schema::hasColumn('admissions', 'isStudyingGeneral')) {
                    $table->boolean('isStudyingGeneral')->default(false)->after('educationLevel');
                }
                if (! Schema::hasColumn('admissions', 'previousSchool')) {
                    $table->string('previousSchool', 255)->nullable()->after('isStudyingGeneral');
                }
                if (! Schema::hasColumn('admissions', 'schoolGraduationYear')) {
                    $table->string('schoolGraduationYear', 20)->nullable()->after('previousSchool');
                }

                // Section C: TVET & Previous Training
                if (! Schema::hasColumn('admissions', 'previousTraining')) {
                    $table->text('previousTraining')->nullable()->after('schoolGraduationYear');
                }

                // Section D: Employment Information (TVET MIS indicators)
                if (! Schema::hasColumn('admissions', 'employmentStatus')) {
                    $table->string('employmentStatus', 100)->nullable()->after('previousTraining'); // unemployed, employed_full_time, contract, other
                }
                if (! Schema::hasColumn('admissions', 'jobTitle')) {
                    $table->string('jobTitle', 255)->nullable()->after('employmentStatus');
                }
                if (! Schema::hasColumn('admissions', 'incomeType')) {
                    $table->string('incomeType', 100)->nullable()->after('jobTitle');
                }
                if (! Schema::hasColumn('admissions', 'personalIncome')) {
                    $table->string('personalIncome', 100)->nullable()->after('incomeType');
                }
                if (! Schema::hasColumn('admissions', 'familyIncome')) {
                    $table->string('familyIncome', 100)->nullable()->after('personalIncome');
                }
                if (! Schema::hasColumn('admissions', 'employmentType')) {
                    $table->string('employmentType', 100)->nullable()->after('familyIncome');
                }

                // Section E: Voluntary & Special Needs / Equity
                if (! Schema::hasColumn('admissions', 'workObstacle')) {
                    $table->string('workObstacle', 255)->nullable()->after('employmentType');
                }
                if (! Schema::hasColumn('admissions', 'hasDisability')) {
                    $table->boolean('hasDisability')->default(false)->after('workObstacle');
                }
                if (! Schema::hasColumn('admissions', 'disabilityType')) {
                    $table->string('disabilityType', 100)->nullable()->after('hasDisability');
                }
                if (! Schema::hasColumn('admissions', 'disabilityTiming')) {
                    $table->string('disabilityTiming', 50)->nullable()->after('disabilityType'); // birth, after
                }
                if (! Schema::hasColumn('admissions', 'isIndigenous')) {
                    $table->boolean('isIndigenous')->default(false)->after('disabilityTiming');
                }
                if (! Schema::hasColumn('admissions', 'indigenousGroup')) {
                    $table->string('indigenousGroup', 100)->nullable()->after('isIndigenous');
                }
                if (! Schema::hasColumn('admissions', 'isOrphan')) {
                    $table->boolean('isOrphan')->default(false)->after('indigenousGroup');
                }
                if (! Schema::hasColumn('admissions', 'hasEquityCard')) {
                    $table->boolean('hasEquityCard')->default(false)->after('isOrphan');
                }
                if (! Schema::hasColumn('admissions', 'equityCardNumber')) {
                    $table->string('equityCardNumber', 100)->nullable()->after('hasEquityCard');
                }
                if (! Schema::hasColumn('admissions', 'equityCardType')) {
                    $table->string('equityCardType', 50)->nullable()->after('equityCardNumber');
                }

                // Additional Attached Documents
                if (! Schema::hasColumn('admissions', 'familyBookUrl')) {
                    $table->string('familyBookUrl', 500)->nullable()->after('idCardUrl');
                }
                if (! Schema::hasColumn('admissions', 'birthCertificateUrl')) {
                    $table->string('birthCertificateUrl', 500)->nullable()->after('familyBookUrl');
                }
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('admissions')) {
            Schema::table('admissions', function (Blueprint $table) {
                $columns = [
                    'studyType', 'academicYear', 'idCardNumber', 'studentCardNo', 'nationality',
                    'ethnicity', 'religion', 'pob', 'permanentAddress', 'distanceKm',
                    'familyMembersCount', 'maritalStatus', 'commuteMethod',
                    'guardianName', 'guardianRelation', 'guardianPhone', 'guardianEmail', 'guardianAddress',
                    'educationLevel', 'isStudyingGeneral', 'previousSchool', 'schoolGraduationYear',
                    'previousTraining', 'employmentStatus', 'jobTitle', 'incomeType',
                    'personalIncome', 'familyIncome', 'employmentType',
                    'workObstacle', 'hasDisability', 'disabilityType', 'disabilityTiming',
                    'isIndigenous', 'indigenousGroup', 'isOrphan',
                    'hasEquityCard', 'equityCardNumber', 'equityCardType',
                    'familyBookUrl', 'birthCertificateUrl',
                ];

                foreach ($columns as $column) {
                    if (Schema::hasColumn('admissions', $column)) {
                        $table->dropColumn($column);
                    }
                }
            });
        }
    }
};

<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminSettingsController extends Controller
{
    public function getSettings(): JsonResponse
    {
        $setting = Setting::first();

        if (! $setting) {
            $setting = Setting::create([
                'siteName' => 'RPITSSR',
                'siteDescription' => 'Regional Polytechnic Institute Techo Sen Siem Reap',
            ]);
        }

        return response()->json([
            'success' => true,
            'data' => $setting,
        ], 200);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $currentUser = $request->user();

        // Security: Only super administrators can update institutional settings
        if (! $currentUser || ! $currentUser->isAdmin()) {
            return response()->json([
                'error' => 'Unauthorized. Only super administrators can modify institutional settings.',
            ], 403);
        }

        $validated = $request->validate([
            'siteName' => 'sometimes|required|string|max:255',
            'siteDescription' => 'nullable|string|max:1000',
            'siteUrl' => 'nullable|url|max:255',
            'contactEmail' => 'nullable|email|max:255',
            'contactPhone' => 'nullable|string|max:50',
            'address' => 'nullable|string|max:500',
            'logoUrl' => 'nullable|string|max:500',
            'metaTitle' => 'nullable|string|max:255',
            'metaDescription' => 'nullable|string|max:1000',
            'metaKeywords' => 'nullable|string|max:500',
            'facebookUrl' => 'nullable|string|max:500',
            'twitterUrl' => 'nullable|string|max:500',
            'linkedinUrl' => 'nullable|string|max:500',
            'instagramUrl' => 'nullable|string|max:500',
            'youtubeUrl' => 'nullable|string|max:500',
            'enableRegistration' => 'nullable|boolean',
            'enableComments' => 'nullable|boolean',
            'primaryColor' => 'nullable|string|max:50',
            'secondaryColor' => 'nullable|string|max:50',
            'academicYear' => 'nullable|string|max:50',
            'defaultLanguage' => 'nullable|string|max:10',
        ]);

        $setting = Setting::first();

        if (! $setting) {
            $setting = new Setting;
        }

        $validated['updatedById'] = $currentUser->id;
        $validated['lastUpdated'] = now();

        $setting->fill($validated);
        $setting->save();

        return response()->json([
            'success' => true,
            'data' => $setting,
            'message' => 'Settings updated successfully',
        ], 200);
    }
}

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

        if (!$setting) {
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
        $setting = Setting::first();

        if (!$setting) {
            $setting = new Setting();
        }

        $data = $request->all();
        $data['updatedById'] = $request->user()->id;
        $data['lastUpdated'] = now();

        $setting->fill($data);
        $setting->save();

        return response()->json([
            'success' => true,
            'data' => $setting,
            'message' => 'Settings updated successfully',
        ], 200);
    }
}

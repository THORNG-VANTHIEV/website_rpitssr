<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScrollingBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ScrollingBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = ScrollingBanner::where('is_active', true)
            ->orderBy('order_index', 'asc')
            ->get();

        return response()->json($banners, 200);
    }
}

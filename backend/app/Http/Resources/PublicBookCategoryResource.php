<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicBookCategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name_km' => $this->name_km,
            'name_en' => $this->name_en,
            'code' => $this->code,
            'shelf_location' => $this->shelf_location,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'books_count' => $this->whenCounted('books'),
        ];
    }
}

<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicBookResource extends JsonResource
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
            'title_km' => $this->title_km,
            'title_en' => $this->title_en,
            'author' => $this->author,
            'isbn' => $this->isbn,
            'call_number' => $this->call_number,
            'category_id' => $this->category_id,
            'publisher' => $this->publisher,
            'publish_year' => $this->publish_year,
            'edition' => $this->edition,
            'language' => $this->language,
            'total_copies' => $this->total_copies,
            'available_copies' => $this->available_copies,
            'shelf_location' => $this->shelf_location,
            'cover_image' => $this->cover_image,
            'file_url' => $this->file_url,
            'is_ebook' => $this->is_ebook,
            'is_featured' => $this->is_featured,
            'status' => $this->status,
            'description' => $this->description,
            'category' => new PublicBookCategoryResource($this->whenLoaded('category')),
        ];
    }
}

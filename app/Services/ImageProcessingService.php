<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\ImageManager;

class ImageProcessingService
{
    protected $manager;
    protected $maxImageSize;
    protected $maxLogoSize;
    protected $allowedTypes;

    public function __construct()
    {
        $this->manager = new ImageManager(new Driver());
        $this->maxImageSize = config('app.max_image_size', 2048);
        $this->maxLogoSize = config('app.max_logo_size', 512);
        $this->allowedTypes = explode(',', config('app.allowed_image_types', 'jpg,jpeg,png,webp'));
    }

    /**
     * Process and save an image with automatic resizing
     */
    public function processImage(UploadedFile $file, string $path, int $maxWidth = null, int $quality = 85): string
    {
        $maxWidth = $maxWidth ?? $this->maxImageSize;
        
        $image = $this->manager->read($file);
        
        if ($image->width() > $maxWidth || $image->height() > $maxWidth) {
            $image->scaleDown(width: $maxWidth);
        }
        
        $extension = $this->getExtension($file);
        $filename = $path . '/' . uniqid() . '.' . $extension;
        
        $encoded = match($extension) {
            'png' => $image->toPng(),
            'webp' => $image->toWebp(quality: $quality),
            default => $image->toJpeg(quality: $quality),
        };
        
        Storage::disk('public')->put($filename, $encoded);
        
        return $filename;
    }

    /**
     * Process logo with square crop and resize
     */
    public function processLogo(UploadedFile $file, string $path): string
    {
        $image = $this->manager->read($file);
        
        $size = min($image->width(), $image->height());
        $image->cover($size, $size);
        
        $image->scaleDown(width: $this->maxLogoSize);
        
        $filename = $path . '/' . uniqid() . '.png';
        Storage::disk('public')->put($filename, $image->toPng());
        
        return $filename;
    }

    /**
     * Validate image file
     */
    public function validateImage(UploadedFile $file, bool $isLogo = false): bool
    {
        $extension = strtolower($file->getClientOriginalExtension());
        
        if (!in_array($extension, $this->allowedTypes)) {
            throw new \Exception('Invalid image type. Allowed types: ' . implode(', ', $this->allowedTypes));
        }
        
        $maxSize = $isLogo ? $this->maxLogoSize * 1024 : $this->maxImageSize * 1024;
        
        if ($file->getSize() > $maxSize * 2) {
            throw new \Exception('Image file too large');
        }
        
        return true;
    }

    /**
     * Create thumbnail
     */
    public function createThumbnail(string $imagePath, int $width = 200): string
    {
        $image = $this->manager->read(Storage::disk('public')->path($imagePath));
        
        $image->scaleDown(width: $width);
        
        $pathInfo = pathinfo($imagePath);
        $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
        
        Storage::disk('public')->put($thumbnailPath, $image->toJpeg(quality: 75));
        
        return $thumbnailPath;
    }

    /**
     * Get safe extension
     */
    protected function getExtension(UploadedFile $file): string
    {
        $extension = strtolower($file->getClientOriginalExtension());
        return in_array($extension, $this->allowedTypes) ? $extension : 'jpg';
    }

    /**
     * Delete image and its thumbnail
     */
    public function deleteImage(string $imagePath): bool
    {
        $pathInfo = pathinfo($imagePath);
        $thumbnailPath = $pathInfo['dirname'] . '/thumb_' . $pathInfo['basename'];
        
        Storage::disk('public')->delete($imagePath);
        Storage::disk('public')->delete($thumbnailPath);
        
        return true;
    }
}

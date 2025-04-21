'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

interface ImageSliderProps {
  images: string[];
  mainImageClassName?: string;
  thumbnailClassName?: string;
  aspectRatio?: 'square' | 'video' | 'portrait';
}

export default function ImageSlider({ 
  images, 
  mainImageClassName = '',
  thumbnailClassName = '',
  aspectRatio = 'square'
}: ImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  }, [images.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  }, [images.length]);

  const goToIndex = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const aspectRatioClasses = {
    square: 'aspect-square',
    video: 'aspect-video',
    portrait: 'aspect-[3/4]'
  };

  if (!images.length) return null;

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className={`relative ${aspectRatioClasses[aspectRatio]} w-full h-75 group`}>
        <Image
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          fill
          className={`object-contain rounded-md ${mainImageClassName}`}
          priority={currentIndex === 0}
        />
        
        {images.length > 1 && (
          <>
            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-800 p-2 cursor-pointer"
              aria-label="Previous image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-800 p-2 cursor-pointer"
              aria-label="Next image"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1 md:hidden">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToIndex(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 cursor-pointer ${
                    index === currentIndex 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-6 gap-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToIndex(index)}
              className={`relative aspect-square w-full rounded-md overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                index === currentIndex 
                  ? 'border-sky-600 opacity-100' 
                  : 'border-transparent opacity-50 hover:opacity-100'
              } ${thumbnailClassName}`}
            >
              <Image
                src={image}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 
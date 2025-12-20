'use client';

import { Box } from '@mantine/core';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { IconChevronLeft, IconChevronRight } from '@tabler/icons-react';
import classes from './ImageCarousel.module.css';

interface ImageCarouselProps {
  images: string[];
  autoPlay?: boolean;
  interval?: number;
}

export function ImageCarousel({ 
  images, 
  autoPlay = true, 
  interval = 5000 
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [autoPlay, interval, images.length]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (images.length === 0) return null;

  return (
    <Box className={classes.carouselWrapper}>
      <Box className={classes.carouselContainer}>
        {images.map((image, index) => (
          <Box
            key={index}
            className={`${classes.carouselSlide} ${
              index === currentIndex ? classes.active : ''
            }`}
          >
            <Image
              src={image}
              alt={`Slide ${index + 1}`}
              fill
              className={classes.carouselImage}
              quality={90}
              priority={index === 0}
            />
          </Box>
        ))}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              className={classes.carouselArrowLeft}
              onClick={goToPrevious}
              aria-label="Previous slide"
            >
              <IconChevronLeft size={32} stroke={2} />
            </button>
            <button
              className={classes.carouselArrowRight}
              onClick={goToNext}
              aria-label="Next slide"
            >
              <IconChevronRight size={32} stroke={2} />
            </button>
          </>
        )}

        {/* Dots Indicator */}
        {images.length > 1 && (
          <Box className={classes.carouselDots}>
            {images.map((_, index) => (
              <button
                key={index}
                className={`${classes.carouselDot} ${
                  index === currentIndex ? classes.active : ''
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

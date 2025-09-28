'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface Slide {
  id: number
  image: string
  title: string
  subtitle: string
  ctaText: string
  ctaLink: string
  ctaSecondary?: string
  ctaSecondaryLink?: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/hero1.jpg',
    title: 'Supporting Our Church Business Community',
    subtitle: 'Discover and support faith-based businesses owned by church members. Build community, share values, and grow together in faith and commerce.',
    ctaText: 'Shop Now',
    ctaLink: '/marketplace',
    ctaSecondary: 'Become a Vendor',
    ctaSecondaryLink: '/auth/vendor-apply'
  },
  {
    id: 2,
    image: '/hero2.jpg',
    title: 'Faith-Based Quality Products',
    subtitle: 'From handmade crafts to professional services, discover unique products backed by Christian values and community trust.',
    ctaText: 'Explore Products',
    ctaLink: '/marketplace',
    ctaSecondary: 'Learn More',
    ctaSecondaryLink: '/about'
  },
  {
    id: 3,
    image: '/hero1.jpg',
    title: 'Join Our Vendor Community',
    subtitle: 'Share your talents and grow your faith-based business with the support of our church community marketplace.',
    ctaText: 'Apply Now',
    ctaLink: '/auth/vendor-apply',
    ctaSecondary: 'View Success Stories',
    ctaSecondaryLink: '/testimonials'
  }
]

// Fallback images in case local images don't load
const fallbackImages = [
  'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80', 
  'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80'
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({})
  const [imageError, setImageError] = useState<{ [key: number]: boolean }>({})

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000) // Change slide every 5 seconds

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  // Preload images
  useEffect(() => {
    slides.forEach((slide, index) => {
      const img = new Image()
      img.onload = () => {
        console.log(`Preloaded image ${slide.id}:`, slide.image)
        setImageLoaded(prev => ({ ...prev, [slide.id]: true }))
      }
      img.onerror = () => {
        console.log(`Failed to preload image ${slide.id}:`, slide.image)
        setImageError(prev => ({ ...prev, [slide.id]: true }))
      }
      img.src = slide.image
    })
  }, [])

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
    setIsAutoPlaying(false) // Stop auto-play when user interacts
  }

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
    setIsAutoPlaying(false)
  }

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
    setIsAutoPlaying(false)
  }

  return (
    <section className="relative w-full h-[400px] md:h-[600px] overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            {/* Background Image */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(147, 51, 234, 0.8), rgba(37, 99, 235, 0.8)), url(${slide.image})`
              }}
            >
              {/* If CSS background fails, show regular img as fallback */}
              <img
                key={`${slide.id}-${slide.image}`}
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover opacity-0"
                style={{
                  opacity: imageLoaded[slide.id] ? 0 : 0
                }}
                onError={(e) => {
                  console.log('Image failed to load:', slide.image)
                  // Try fallback image
                  const fallbackSrc = fallbackImages[index] || fallbackImages[0]
                  if (e.currentTarget.src !== fallbackSrc) {
                    console.log('Trying fallback:', fallbackSrc)
                    e.currentTarget.src = fallbackSrc
                  }
                }}
                onLoad={(e) => {
                  console.log('Image loaded successfully:', slide.image)
                  setImageLoaded(prev => ({ ...prev, [slide.id]: true }))
                }}
              />
            </div>

            {/* Content */}
            <div className="relative z-10 flex items-center justify-center h-full">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 max-w-3xl mx-auto leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" asChild className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700">
                    <Link href={slide.ctaLink}>{slide.ctaText}</Link>
                  </Button>
                  {slide.ctaSecondary && slide.ctaSecondaryLink && (
                    <Button 
                      size="lg" 
                      variant="outline" 
                      asChild 
                      className="w-full sm:w-auto border-white text-white hover:bg-white hover:text-gray-900"
                    >
                      <Link href={slide.ctaSecondaryLink}>{slide.ctaSecondary}</Link>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="sm"
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 p-0"
      >
        <ChevronLeft className="w-6 h-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white rounded-full w-12 h-12 p-0"
      >
        <ChevronRight className="w-6 h-6" />
      </Button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentSlide
                ? 'bg-white scale-110'
                : 'bg-white/50 hover:bg-white/75'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
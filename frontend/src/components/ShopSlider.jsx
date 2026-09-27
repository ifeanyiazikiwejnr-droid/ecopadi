import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api';
import { resolveImageUrl } from '../imageUrl';

const AUTOPLAY_MS = 5500;

export default function ShopSlider() {
  const [slides, setSlides] = useState([]);
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    api.bannerSlides().then(setSlides).catch(() => {});
  }, []);

  const goTo = useCallback((i, total) => {
    const n = total ?? slides.length;
    if (n === 0) return;
    setIndex(((i % n) + n) % n);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    timerRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [slides.length]);

  if (slides.length === 0) return null;

  function handleSlideClick(slide) {
    if (!slide.link_url) return;
    const isExternal = /^https?:\/\//i.test(slide.link_url);
    if (isExternal) {
      window.open(slide.link_url, '_blank', 'noopener,noreferrer');
    } else {
      window.location.href = slide.link_url;
    }
  }

  return (
    <div className="shop-slider" aria-roledescription="carousel">
      <div className="shop-slider-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((slide) => (
          <button
            key={slide.id}
            type="button"
            className={`shop-slide ${slide.link_url ? 'is-clickable' : ''}`}
            onClick={() => handleSlideClick(slide)}
            aria-label={slide.title || 'Promotional slide'}
          >
            <img src={resolveImageUrl(slide.image_url)} alt={slide.title || ''} />
            {slide.title && <span className="shop-slide-caption">{slide.title}</span>}
          </button>
        ))}
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            className="shop-slider-nav shop-slider-prev"
            aria-label="Previous slide"
            onClick={() => goTo(index - 1)}
          >
            ‹
          </button>
          <button
            type="button"
            className="shop-slider-nav shop-slider-next"
            aria-label="Next slide"
            onClick={() => goTo(index + 1)}
          >
            ›
          </button>
          <div className="shop-slider-dots">
            {slides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                className={`shop-slider-dot ${i === index ? 'active' : ''}`}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

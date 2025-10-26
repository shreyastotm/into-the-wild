import React, { useEffect, useRef, useState } from "react";

import { GalleryCard } from "./GalleryCard";

interface HorizontalTrekScrollProps {
  treks: Array<{
    trek_id: number;
    name: string;
    description?: string | null;
    location?: string | null;
    start_datetime: string;
    difficulty?: string | null;
    duration?: string | null;
    cost?: number;
    base_price?: number;
    max_participants?: number;
    participant_count?: number | null;
    image_url?: string | null;
    images?: string[];
    category?: string | null;
  }>;
  onTrekClick?: (trekId: number) => void;
  showProgress?: boolean;
  type?: "event" | "gallery";
}

export const HorizontalTrekScroll: React.FC<HorizontalTrekScrollProps> = ({
  treks,
  onTrekClick,
  showProgress = true,
  type = "event",
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollLeft = container.scrollLeft;
      const cardWidth = 320 + 16; // card width + gap
      const index = Math.round(scrollLeft / cardWidth);
      setActiveIndex(index);
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Horizontal scroll container */}
      <div ref={scrollContainerRef} className="mobile-horizontal-scroll">
        <div className="mobile-cards-horizontal">
          {treks.map((trek) => (
            <GalleryCard key={trek.trek_id} trek={trek} onClick={onTrekClick} />
          ))}
        </div>
      </div>

      {/* Scroll indicators */}
      {treks.length > 1 && (
        <div className="mobile-scroll-indicators">
          {treks.map((_, index) => (
            <div
              key={index}
              className={`mobile-scroll-indicator ${
                index === activeIndex ? "mobile-scroll-indicator-active" : ""
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HorizontalTrekScroll;

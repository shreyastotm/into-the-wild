import { motion } from "framer-motion";
import React from "react";

interface FloatingElementsProps {
  count?: number;
  theme?: "landing" | "gallery" | "events" | "details";
}

const FloatingElements: React.FC<FloatingElementsProps> = ({
  count = 25,
  theme = "landing",
}) => {
  const getThemeColors = () => {
    switch (theme) {
      case "landing":
        return {
          primary: "rgba(147, 51, 234, 0.4)", // Purple
          secondary: "rgba(244, 164, 96, 0.3)", // Orange
          accent: "rgba(8, 145, 178, 0.2)", // Teal
        };
      case "gallery":
        return {
          primary: "rgba(244, 164, 96, 0.4)", // Orange
          secondary: "rgba(233, 116, 81, 0.3)", // Coral
          accent: "rgba(8, 145, 178, 0.2)", // Teal
        };
      case "events":
        return {
          primary: "rgba(34, 197, 94, 0.4)", // Green
          secondary: "rgba(8, 145, 178, 0.3)", // Teal
          accent: "rgba(244, 164, 96, 0.2)", // Orange
        };
      case "details":
        return {
          primary: "rgba(59, 130, 246, 0.4)", // Blue
          secondary: "rgba(124, 58, 237, 0.3)", // Purple
          accent: "rgba(34, 197, 94, 0.2)", // Green
        };
      default:
        return {
          primary: "rgba(147, 51, 234, 0.4)",
          secondary: "rgba(244, 164, 96, 0.3)",
          accent: "rgba(8, 145, 178, 0.2)",
        };
    }
  };

  const colors = getThemeColors();

  const generateElements = () => {
    return Array.from({ length: count }, (_, i) => {
      const size = Math.random() * 8 + 4; // 4-12px
      const x = Math.random() * 100; // 0-100%
      const y = Math.random() * 100; // 0-100%
      const duration = Math.random() * 20 + 15; // 15-35s
      const delay = Math.random() * 10; // 0-10s
      const opacity = Math.random() * 0.6 + 0.2; // 0.2-0.8

      // Choose color based on distribution
      let color;
      const colorChoice = Math.random();
      if (colorChoice < 0.5) {
        color = colors.primary;
      } else if (colorChoice < 0.8) {
        color = colors.secondary;
      } else {
        color = colors.accent;
      }

      // Choose shape
      const shapes = ["circle", "diamond", "star", "triangle"];
      const shape = shapes[Math.floor(Math.random() * shapes.length)];

      return {
        id: i,
        size,
        x,
        y,
        duration,
        delay,
        opacity,
        color,
        shape,
      };
    });
  };

  const elements = generateElements();

  const getShapeStyles = (shape: string, size: number) => {
    const baseStyles = {
      position: "absolute" as const,
      width: `${size}px`,
      height: `${size}px`,
    };

    switch (shape) {
      case "circle":
        return {
          ...baseStyles,
          borderRadius: "50%",
        };
      case "diamond":
        return {
          ...baseStyles,
          transform: "rotate(45deg)",
          borderRadius: "2px",
        };
      case "star":
        return {
          ...baseStyles,
          clipPath:
            "polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)",
        };
      case "triangle":
        return {
          ...baseStyles,
          clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)",
        };
      default:
        return {
          ...baseStyles,
          borderRadius: "50%",
        };
    }
  };

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute"
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            ...getShapeStyles(element.shape, element.size),
            backgroundColor: element.color,
            opacity: element.opacity,
          }}
          animate={{
            y: [0, -30, 0],
            x: [0, Math.random() * 20 - 10, 0],
            rotate: [0, 360],
            scale: [1, 1.2, 1],
            opacity: [element.opacity, element.opacity * 0.5, element.opacity],
          }}
          transition={{
            duration: element.duration,
            delay: element.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Additional sparkle effects for landing theme */}
      {theme === "landing" && (
        <>
          {Array.from({ length: 8 }, (_, i) => (
            <motion.div
              key={`sparkle-${i}`}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 3,
              }}
            />
          ))}
        </>
      )}
    </div>
  );
};

export default FloatingElements;

import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Camera,
  Clock,
  Compass,
  Heart,
  IndianRupee,
  MapPin,
  MessageCircle,
  Mountain,
  Play,
  Shield,
  Sparkles,
  Star,
  Target,
  TreePine,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import React, { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import FloatingElements from "@/components/animations/FloatingElements";
import CommunityPreview from "@/components/landing/CommunityPreview";
import EventCardsPreview from "@/components/landing/EventCardsPreview";
import GalleryPreview from "@/components/landing/GalleryPreview";
import { OrigamiHamburger } from "@/components/navigation/OrigamiHamburger";
import { cn } from "@/lib/utils";

const GlassMorphismLandingTrial: React.FC = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  // Apply minimal scrollbar styling to html/body
  useEffect(() => {
    document.documentElement.classList.add("glass-theme-active");
    document.body.classList.add("glass-theme-active");
    return () => {
      document.documentElement.classList.remove("glass-theme-active");
      document.body.classList.remove("glass-theme-active");
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-black glass-landing-theme scrollbar-nature scrollbar-landing overflow-x-hidden"
    >
      {/* SVG Filters for Sketch Effects */}
      <svg xmlns="http://www.w3.org/2000/svg" className="absolute w-0 h-0">
        <filter id="sketch-filter">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.9"
            numOctaves="4"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="1.5"
            xChannelSelector="R"
            yChannelSelector="G"
          />
          <feGaussianBlur stdDeviation="0.5" result="blur" />
        </filter>
        <filter id="anime-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </svg>

      {/* Origami Hamburger Menu */}
      <OrigamiHamburger />
      {/* Section 1: Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background with Parallax */}
        <motion.div
          className="absolute inset-0 -z-10"
          style={{ y: backgroundY }}
        >
          <img
            src="/itw_new_BG.jpg"
            alt="Karnataka Western Ghats mountain landscape"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              filter: "blur(0px) brightness(0.4) saturate(1.3)",
              objectPosition: "50% 40%",
            }}
          />
          {/* Enhanced gradient overlay for glass morphism theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-orange-800/40 to-teal-900/50" />
          <div
            className="absolute inset-0 sketchy-texture"
            style={{ background: "var(--glass-bg-overlay)" }}
          />
        </motion.div>

        {/* Floating Elements */}
        <FloatingElements count={25} theme="landing" />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 w-full text-center max-w-4xl mx-auto px-4 sm:px-6"
          style={{ y: textY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="w-full"
          >
            <motion.h1
              className="text-5xl sm:text-6xl md:text-8xl font-bold text-white mb-6 anime-sketch-text anime-bloom"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.2 }}
            >
              Into The{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                Wild
              </span>
            </motion.h1>

            <motion.p
              className="text-lg sm:text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed px-2"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              From Bengaluru to the Western Ghats and beyond. Discover
              Karnataka's hidden gems and India's incredible wilderness with
              friends. Create memories that last a lifetime.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Gloss/Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center">
                  Start Your Adventure
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/gallery")}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold text-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                {/* Gloss/Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center">
                  <Play className="inline-block mr-2 w-5 h-5" />
                  Explore Gallery
                </span>
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
          >
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
              <motion.div
                animate={{ y: [0, 12, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="w-1 h-3 bg-white/70 rounded-full mt-2"
              />
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Section 2: USP 1 - Nature Events with Friends */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-orange-400 uppercase tracking-wider">
                  Connect & Explore
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Explore Karnataka's{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                  Natural Wonders
                </span>
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Join curated treks across Karnataka's Western Ghats - from
                Coorg's misty hills to Kudremukh's rolling peaks, Gokarna's
                pristine beaches, and Chikmagalur's coffee plantations. Weekend
                getaways designed for Bengaluru adventurers.
              </p>

              {/* Feature Points */}
              <div className="space-y-4">
                {[
                  {
                    icon: Mountain,
                    text: "Western Ghats expeditions (Coorg, Chikmagalur, Kudremukh)",
                    color: "text-blue-400",
                  },
                  {
                    icon: Calendar,
                    text: "Weekend trips + Every Sunday day treks from Bengaluru",
                    color: "text-purple-400",
                  },
                  {
                    icon: Shield,
                    text: "Safety-first approach with experienced guides",
                    color: "text-green-400",
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <feature.icon className={cn("w-5 h-5", feature.color)} />
                    <span className="text-white/90">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-green-400/30 rounded-full text-white hover:bg-green-400/20 transition-all duration-300 anime-sketch-card"
              >
                Explore Events
                <ArrowRight className="inline-block ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Visual Side - Interactive Event Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <EventCardsPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 2A: Local Adventures - Sunday Day Treks & Camping */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-amber-400 uppercase tracking-wider">
                  Local Adventures
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Adventures Around{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  Bengaluru
                </span>
              </h2>

              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                Perfect for friends looking for quick escapes. Every Sunday day
                treks and weekend camping events - all within 2 hours from
                Bengaluru. Adventure that fits your schedule and brings friends
                together.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Sunday Day Treks */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl anime-sketch-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Every Sunday Day Treks
                </h3>
              </div>

              <p className="text-white/80 mb-6 leading-relaxed">
                Start your week with adventure! Quick escapes from Bengaluru -
                perfect for groups of friends. Early morning start, evening
                return. Gather your friends and make every Sunday special. No
                overnight stays needed.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Nandi Hills - Sunrise views and heritage sites",
                  "Savandurga - Asia's largest monolith",
                  "Anthargange - Cave exploration and night camping",
                  "Skandagiri - Night trek for experienced groups",
                  "Makalidurga - Fort ruins and scenic trails",
                ].map((trek, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="text-white/90 text-sm">{trek}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>6-8 hours</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>2-hour radius</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>Groups welcome</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-amber-400/30 rounded-full text-white hover:bg-amber-400/20 transition-all duration-300 anime-sketch-card"
              >
                View Sunday Treks
                <ArrowRight className="inline-block ml-2 w-4 h-4" />
              </motion.button>
            </motion.div>

            {/* Camping Events */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl anime-sketch-card"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Camping Experiences
                </h3>
              </div>

              <p className="text-white/80 mb-6 leading-relaxed">
                Overnight camping events combining adventure, community, and
                nature. Gather your friends for multi-activity formats perfect
                for groups. Connect under the stars and create lasting memories
                together.
              </p>

              <div className="space-y-3 mb-6">
                {[
                  "Multi-activity camping near Bengaluru",
                  "Perfect for friend groups and solo travelers",
                  "Stargazing and bonfire experiences",
                  "Community-focused adventure",
                  "Combine with Jam Yard workshops",
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    <span className="text-white/90 text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 text-sm text-white/70 mb-6">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-purple-400" />
                  <span>1-2 nights</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-orange-400" />
                  <span>Near Bengaluru</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-green-400" />
                  <span>Group activities</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="w-full px-6 py-3 bg-white/10 backdrop-blur-sm border border-indigo-400/30 rounded-full text-white hover:bg-indigo-400/20 transition-all duration-300 anime-sketch-card"
              >
                Explore Camping
                <Target className="inline-block ml-2 w-4 h-4" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 3: USP 2 - Share Memories & Achievements */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Visual Side - Gallery Preview */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <GalleryPreview />
            </motion.div>

            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-orange-400 to-pink-500 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-orange-400 uppercase tracking-wider">
                  Capture & Share
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Every Moment{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-400">
                  Matters
                </span>
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Create a visual diary of your adventures with friends. Share
                photos, tag your adventure buddies, and build a collection of
                memories together. Every moment is better when shared.
              </p>

              {/* Achievement Badges */}
              <div className="flex flex-wrap gap-3 mt-6">
                {[
                  {
                    icon: Trophy,
                    label: "Peak Conqueror",
                    color: "from-yellow-400 to-orange-500",
                  },
                  {
                    icon: Star,
                    label: "Nature Photographer",
                    color: "from-purple-400 to-pink-500",
                  },
                  {
                    icon: Compass,
                    label: "Trail Blazer",
                    color: "from-green-400 to-teal-500",
                  },
                ].map((badge, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium",
                      `bg-gradient-to-r ${badge.color}`,
                    )}
                  >
                    <badge.icon className="w-4 h-4" />
                    {badge.label}
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/gallery")}
                className="group mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-full text-white hover:bg-orange-400/20 transition-all duration-300 anime-sketch-card"
              >
                View Gallery
                <Camera className="inline-block ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 4: USP 3 - Effortless Group Management */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-blue-400 uppercase tracking-wider">
                  Seamless Experience
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                Easy Group Planning from{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Bengaluru
                </span>
              </h2>

              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                Start your adventure right from Bengaluru. Convenient pickup
                points, smart route planning, and seamless group coordination.
                We handle logistics so you can focus on the adventure ahead.
              </p>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Bengaluru-Based Groups",
                description:
                  "Connect with local adventurers from Bengaluru and plan treks together",
                color: "from-green-400 to-teal-500",
              },
              {
                icon: Calendar,
                title: "Weekend Escapes",
                description:
                  "Perfect 2-3 day trips designed for working professionals",
                color: "from-blue-400 to-indigo-500",
              },
              {
                icon: MapPin,
                title: "Smart Pickup Points",
                description:
                  "Multiple pickup locations across Bengaluru for your convenience",
                color: "from-orange-400 to-red-500",
              },
              {
                icon: IndianRupee,
                title: "Transparent Pricing",
                description:
                  "Clear cost breakdowns with GST included. Split payments made easy",
                color: "from-purple-400 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300 anime-sketch-card"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform",
                    `bg-gradient-to-r ${feature.color}`,
                  )}
                >
                  <feature.icon className="w-6 h-6 text-white" />
                </motion.div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-white/70 text-sm leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                  <div
                    className={cn(
                      "absolute inset-0 rounded-2xl",
                      `bg-gradient-to-r ${feature.color} opacity-10`,
                    )}
                  />
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/glass-events")}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 overflow-hidden"
            >
              {/* Gloss/Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              <span className="relative z-10 flex items-center">
                Try It Now
                <Zap className="inline-block ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
              </span>
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Section 5: USP 4 - Exclusive Communities */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Content Side */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-teal-400 to-green-500 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-teal-400 uppercase tracking-wider">
                  Community First
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white leading-tight">
                Join Karnataka's Largest{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                  Adventure Community
                </span>
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Connect with thousands of adventure enthusiasts across Karnataka
                and India. Share tips, plan expeditions with friends to Western
                Ghats, Himalayas, and beyond. Be part of India's growing outdoor
                community.
              </p>

              {/* Community Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                {[
                  { number: "50+", label: "Communities", icon: Users },
                  { number: "10k+", label: "Members", icon: Heart },
                  { number: "24/7", label: "Active", icon: MessageCircle },
                ].map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl anime-sketch-card"
                  >
                    <stat.icon className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                      {stat.number}
                    </div>
                    <div className="text-xs text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* Jam Yard Exclusive Access */}
              <div className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-400/30 rounded-2xl anime-sketch-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">
                    Exclusive Jam Yard Access
                  </h3>
                </div>
                <p className="text-white/90 mb-4 text-sm leading-relaxed">
                  Join our community to access exclusive partner-led workshops
                  and activities designed to complement your adventures with
                  friends.
                </p>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[
                    "Stick Workshop",
                    "Parkour Training",
                    "Breathwork Sessions",
                    "Yoga & Dance",
                    "Fitness Workshops",
                    "Mindfulness",
                  ].map((activity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                      className="px-3 py-2 bg-white/5 backdrop-blur-sm border border-purple-400/20 rounded-lg text-white/90 text-xs text-center"
                    >
                      {activity}
                    </motion.div>
                  ))}
                </div>
                <p className="text-white/70 text-xs">
                  Perfect for groups - combine with treks and camping for
                  complete adventure experiences.
                </p>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group mt-6 px-6 py-3 bg-white/10 backdrop-blur-sm border border-teal-400/30 rounded-full text-white hover:bg-teal-400/20 transition-all duration-300 anime-sketch-card"
              >
                Join Communities
                <Users className="inline-block ml-2 w-4 h-4 group-hover:scale-110 transition-transform" />
              </motion.button>
            </motion.div>

            {/* Visual Side - Community Preview */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <CommunityPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA - Start Your Journey */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Ready to Explore{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-teal-400">
                Karnataka & Beyond?
              </span>
            </h2>

            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              From the Western Ghats to the Himalayas, join thousands of
              adventurers from Bengaluru and across India who've discovered the
              joy of exploring nature with friends. Adventure is always better
              together.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/50 transition-all duration-300 overflow-hidden"
              >
                {/* Gloss/Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center">
                  Start Exploring
                  <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/gallery")}
                className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/30 rounded-full text-white font-semibold text-lg hover:bg-white/20 hover:border-white/40 transition-all duration-300 overflow-hidden"
              >
                {/* Gloss/Shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative z-10 flex items-center">
                  <Play className="inline-block mr-2 w-5 h-5" />
                  Watch Demo
                </span>
              </motion.button>
            </div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              {[
                {
                  number: "500+",
                  label: "Karnataka Treks Completed",
                  icon: Mountain,
                },
                { number: "5k+", label: "Bengaluru Adventurers", icon: Users },
                { number: "4.9★", label: "Average Rating", icon: Star },
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <stat.icon className="w-8 h-8 text-white/60 mx-auto mb-3" />
                  <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-purple-400">
                    {stat.number}
                  </div>
                  <div className="text-white/70 mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default GlassMorphismLandingTrial;

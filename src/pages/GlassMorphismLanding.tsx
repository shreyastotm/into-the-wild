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

const GlassMorphismLanding: React.FC = () => {
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
      {/* Origami Hamburger Menu */}
      <OrigamiHamburger />
      {/* Section 1: Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Dynamic Background with Parallax */}
        <motion.div className="absolute inset-0" style={{ y: backgroundY }}>
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80"
            alt="Mountain landscape"
            className="w-full h-[120%] object-cover"
            style={{ filter: "blur(8px) brightness(0.7) saturate(1.2)" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-orange-800/30 to-teal-900/40" />
          <div
            className="absolute inset-0"
            style={{ background: "var(--glass-bg-overlay)" }}
          />
        </motion.div>

        {/* Floating Elements */}
        <FloatingElements count={25} theme="landing" />

        {/* Hero Content */}
        <motion.div
          className="relative z-10 text-center max-w-4xl mx-auto px-6"
          style={{ y: textY }}
        >
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <motion.h1
              className="text-6xl md:text-8xl font-bold text-white mb-6"
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
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              Discover nature's wonders with friends. Create memories that last
              a lifetime.
            </motion.p>

            {/* Primary CTA */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group relative px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Start Your Adventure
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-gallery")}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <Play className="inline-block mr-2 w-5 h-5" />
                Explore Gallery
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
                Adventure is Better with{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-400">
                  Friends
                </span>
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Join curated nature events designed for groups. From sunrise
                treks to stargazing camps, every adventure is crafted to bring
                people together in the heart of nature.
              </p>

              {/* Feature Points */}
              <div className="space-y-4">
                {[
                  {
                    icon: Mountain,
                    text: "Curated adventure experiences",
                    color: "text-blue-400",
                  },
                  {
                    icon: Calendar,
                    text: "Flexible scheduling for groups",
                    color: "text-purple-400",
                  },
                  {
                    icon: Shield,
                    text: "Safety-first approach",
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
                className="group mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-green-400/30 rounded-full text-white hover:bg-green-400/20 transition-all duration-300"
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
                Create a visual diary of your adventures. Share photos, tag
                friends, and build a collection of memories that showcase your
                journey into the wild.
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
                onClick={() => navigate("/glass-gallery")}
                className="group mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-orange-400/30 rounded-full text-white hover:bg-orange-400/20 transition-all duration-300"
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
                Group Activities Made{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                  Simple
                </span>
              </h2>

              <p className="text-lg text-white/80 max-w-2xl mx-auto leading-relaxed">
                From finding the perfect group to handling payments, we've
                streamlined every aspect of group adventure planning so you can
                focus on what matters most.
              </p>
            </motion.div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Users,
                title: "Smart Matching",
                description:
                  "Find groups that match your adventure style and schedule",
                color: "from-green-400 to-teal-500",
              },
              {
                icon: Calendar,
                title: "Easy Booking",
                description: "One-click registration with instant confirmation",
                color: "from-blue-400 to-indigo-500",
              },
              {
                icon: MapPin,
                title: "Smart Logistics",
                description: "Automated pickup points and route optimization",
                color: "from-orange-400 to-red-500",
              },
              {
                icon: IndianRupee,
                title: "Split Payments",
                description:
                  "Transparent cost splitting with instant settlements",
                color: "from-purple-400 to-pink-500",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl hover:bg-white/10 transition-all duration-300"
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
              className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transition-all duration-300"
            >
              Try It Now
              <Zap className="inline-block ml-2 w-5 h-5 group-hover:scale-110 transition-transform" />
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
                Join Exclusive{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                  Communities
                </span>
              </h2>

              <p className="text-lg text-white/80 leading-relaxed">
                Connect with like-minded adventurers in specialized communities.
                Share tips, plan private expeditions, and be part of something
                bigger than yourself.
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
                    className="text-center p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl"
                  >
                    <stat.icon className="w-6 h-6 text-teal-400 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-green-400">
                      {stat.number}
                    </div>
                    <div className="text-xs text-white/70">{stat.label}</div>
                  </motion.div>
                ))}
              </div>

              {/* CTA */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-teal-400/30 rounded-full text-white hover:bg-teal-400/20 transition-all duration-300"
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
              Ready for Your Next{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-purple-400 to-teal-400">
                Adventure?
              </span>
            </h2>

            <p className="text-xl text-white/80 mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of adventurers who've discovered the joy of
              exploring nature with friends.
            </p>

            {/* Dual CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-events")}
                className="group px-8 py-4 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full text-white font-semibold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300"
              >
                Start Exploring
                <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate("/glass-gallery")}
                className="group px-8 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white font-semibold text-lg hover:bg-white/20 transition-all duration-300"
              >
                <Play className="inline-block mr-2 w-5 h-5" />
                Watch Demo
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
                  number: "10k+",
                  label: "Adventures Completed",
                  icon: Mountain,
                },
                { number: "50k+", label: "Happy Adventurers", icon: Users },
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

export default GlassMorphismLanding;

import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ProfileHeader() {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "flex justify-between items-center mb-6 p-4 rounded-3xl",
        "bg-white/8 dark:bg-gray-900/8",
        "backdrop-blur-xl backdrop-saturate-150",
        "border border-amber-400/30 dark:border-amber-400/20",
        "ring-0 ring-amber-400/0",
        "hover:ring-2 hover:ring-amber-400/40 hover:ring-offset-2 hover:ring-offset-amber-100/20",
        "shadow-lg shadow-black/5 hover:shadow-2xl hover:shadow-amber-500/20",
        "transition-all duration-500 ease-out",
      )}
    >
      <h1 className="text-3xl font-bold text-white/95">Your Profile</h1>
      <Button
        variant="outline"
        onClick={handleSignOut}
        className={cn(
          "bg-white/10 hover:bg-white/20",
          "backdrop-blur-sm border-amber-400/40",
          "text-white hover:text-white",
          "transition-all duration-300",
        )}
      >
        Sign Out
      </Button>
    </motion.div>
  );
}

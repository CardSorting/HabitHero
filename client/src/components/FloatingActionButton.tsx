import React from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <motion.button
      className="add-btn fixed bottom-24 right-6 md:right-12 lg:bottom-12 lg:right-16 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ 
        type: "spring", 
        stiffness: 260, 
        damping: 20,
        delay: 0.3
      }}
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
};

export default FloatingActionButton;

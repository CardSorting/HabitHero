import React from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { DiaryCardContainer } from "../features/dbt-diary";

/**
 * DiaryCard Page
 * 
 * This component has been refactored to use a clean architecture approach following
 * SOLID principles, Domain-Driven Design, Clean Architecture, and CQRS patterns.
 * 
 * The implementation details have been moved to specialized components within
 * the features/dbt-diary directory, which is organized into the following layers:
 * 
 * - Domain: Core business entities and repository interfaces
 * - Application: Application services (commands and queries)
 * - Infrastructure: Repository implementations
 * - Presentation: UI components
 */
const DiaryCard: React.FC = () => {
  // Hardcoded user ID for demo purposes
  // In a real application, this would come from an authentication context
  const userId = 1;
  
  return (
    <>
      <Header title="DBT Diary Card" />
      <motion.main 
        className="flex-1 overflow-y-auto pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <DiaryCardContainer userId={userId} />
      </motion.main>
    </>
  );
};

export default DiaryCard;
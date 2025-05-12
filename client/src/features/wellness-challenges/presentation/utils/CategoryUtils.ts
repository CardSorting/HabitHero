/**
 * Utility functions for working with challenge categories
 */
import { ChallengeCategory } from "../../domain/models";

export interface CategoryMetadata {
  id: ChallengeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
}

export const getCategoryMetadata = (category: ChallengeCategory): CategoryMetadata => {
  switch (category) {
    case ChallengeCategory.EMOTIONS:
      return {
        id: category,
        name: "Emotions",
        description: "Track and manage emotions through guided exercises",
        icon: "Heart", // Lucide icon name
        color: "text-pink-500"
      };
    case ChallengeCategory.MEDITATION:
      return {
        id: category,
        name: "Meditation",
        description: "Develop mindfulness through various meditation techniques",
        icon: "CloudMoon", // Lucide icon name
        color: "text-indigo-500"
      };
    case ChallengeCategory.JOURNALING:
      return {
        id: category,
        name: "Journaling",
        description: "Process emotions and thoughts through writing exercises",
        icon: "BookOpen", // Lucide icon name
        color: "text-yellow-600"
      };
    case ChallengeCategory.ACTIVITY:
      return {
        id: category,
        name: "Activity",
        description: "Engage in activities that promote overall wellness",
        icon: "Activity", // Lucide icon name
        color: "text-green-500"
      };
    case ChallengeCategory.MINDFULNESS:
      return {
        id: category,
        name: "Mindfulness",
        description: "Develop awareness of the present moment without judgment",
        icon: "Feather", // Lucide icon name
        color: "text-teal-500"
      };
    case ChallengeCategory.DISTRESS_TOLERANCE:
      return {
        id: category,
        name: "Distress Tolerance",
        description: "Develop skills for coping with intense emotions and difficult situations",
        icon: "Shield", // Lucide icon name
        color: "text-red-500"
      };
    case ChallengeCategory.EMOTION_REGULATION:
      return {
        id: category,
        name: "Emotion Regulation",
        description: "Learn to identify and manage emotions effectively",
        icon: "Gauge", // Lucide icon name
        color: "text-purple-500"
      };
    case ChallengeCategory.INTERPERSONAL_EFFECTIVENESS:
      return {
        id: category,
        name: "Interpersonal Effectiveness",
        description: "Build skills for healthy relationships and effective communication",
        icon: "Users", // Lucide icon name
        color: "text-blue-500"
      };
    default:
      return {
        id: category,
        name: "Unknown Category",
        description: "Category description not available",
        icon: "HelpCircle", // Lucide icon name
        color: "text-gray-500"
      };
  }
};

export const getAllCategoryMetadata = (): CategoryMetadata[] => {
  return [
    getCategoryMetadata(ChallengeCategory.EMOTIONS),
    getCategoryMetadata(ChallengeCategory.MEDITATION),
    getCategoryMetadata(ChallengeCategory.JOURNALING),
    getCategoryMetadata(ChallengeCategory.ACTIVITY),
    getCategoryMetadata(ChallengeCategory.MINDFULNESS),
    getCategoryMetadata(ChallengeCategory.DISTRESS_TOLERANCE),
    getCategoryMetadata(ChallengeCategory.EMOTION_REGULATION),
    getCategoryMetadata(ChallengeCategory.INTERPERSONAL_EFFECTIVENESS)
  ];
};
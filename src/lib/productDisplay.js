export const CATEGORY_COLORS = {
  water: "bg-blue-100 text-blue-800",
  food: "bg-green-100 text-green-800",
  medical: "bg-red-100 text-red-800",
  tools: "bg-gray-100 text-gray-800",
  clothing: "bg-purple-100 text-purple-800",
  documents: "bg-yellow-100 text-yellow-800",
  communication: "bg-indigo-100 text-indigo-800",
  hygiene: "bg-pink-100 text-pink-800",
  safety_equipment: "bg-orange-100 text-orange-800",
  other: "bg-gray-100 text-gray-800",
};

export const CACHE_TYPE_LABELS = {
  go_bag: "Go Bag",
  automobile: "Automobile",
  barn: "Barn / Livestock",
  general: "General",
};

export function getStoreName(url) {
  if (!url) return "Buy Now";
  try {
    const domain = new URL(url).hostname.toLowerCase();
    if (domain.includes("amazon") || domain.includes("amzn")) return "Amazon";
    if (domain.includes("target")) return "Target";
    if (domain.includes("walmart")) return "Walmart";
    if (domain.includes("rei")) return "REI";
    if (domain.includes("homedepot")) return "Home Depot";
    if (domain.includes("lowes")) return "Lowe's";
    if (domain.includes("costco")) return "Costco";
    if (domain.includes("chewy")) return "Chewy";
    if (domain.includes("petco")) return "Petco";
    if (domain.includes("petsmart")) return "PetSmart";
    return "Partner Site";
  } catch {
    return "Buy Now";
  }
}
export const BRAND = {
  colors: {
    teal: "#026D69",
    tealLight: "#038A85",
    tealBg: "#E5F5F5",
    tealDeep: "#01524F",
    lime: "#86B940",
    gold: "#A8872C",
    blue: "#1A5276",
  },
  font: "Tajawal",
  department: "إدارة التطوير والتأهيل",
  ministry: "وزارة البلديات والإسكان",
} as const;

export const STATUS_COLORS: Record<string, string> = {
  "مكتمل": "#86B940",
  "جاري": "#038A85",
  "جاري الطرح": "#A8872C",
  "في التصميم": "#1A5276",
  "دراسة أولية": "#7f8c8d",
  "لم يبدأ": "#95a5a6",
  "متوقف": "#c0392b",
  "طور الترسية": "#A8872C",
  "نشط": "#038A85",
  "متأخر": "#c0392b",
  "معلق": "#7f8c8d",
};

export const CATEGORY_COLORS: Record<string, string> = {
  "استراتيجي": "#1A5276",
  "تنفيذي": "#A8872C",
};

export function progressColor(pct: number): string {
  if (pct >= 100) return "#86B940";
  if (pct >= 60) return "#038A85";
  if (pct >= 30) return "#A8872C";
  return "#c0392b";
}

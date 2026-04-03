/** Arabic labels — single source of truth for all UI text */
export const AR = {
  // Navigation
  nav: {
    dashboard: "لوحة المعلومات",
    goals: "الأهداف",
    initiatives: "خطة التطوير",
    achievements: "المنجزات",
    reports: "التقارير",
    archive: "الأرشيف",
    notes: "الملاحظات",
    settings: "الإعدادات",
  },

  // Common actions
  actions: {
    add: "إضافة",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    filter: "تصفية",
    export: "تصدير",
    print: "طباعة",
    generate: "إنشاء",
    close: "إغلاق",
    back: "رجوع",
    confirm: "تأكيد",
  },

  // Status labels
  status: {
    active: "نشط",
    completed: "مكتمل",
    delayed: "متأخر",
    onHold: "معلق",
    inProgress: "جاري",
    inDesign: "في التصميم",
    preliminary: "دراسة أولية",
    notStarted: "لم يبدأ",
    stopped: "متوقف",
    draft: "مسودة",
    approved: "معتمد",
    highlighted: "مميز",
    published: "منشور",
    open: "مفتوح",
    closed: "مغلق",
  },

  // Categories
  category: {
    strategic: "استراتيجي",
    operational: "تنفيذي",
  },

  // Report types
  reportType: {
    monthly: "شهري",
    quarterly: "ربع سنوي",
    annual: "سنوي",
    executiveSummary: "ملخص تنفيذي",
  },

  // Note types
  noteType: {
    general: "عام",
    strategic: "استراتيجي",
    challenge: "تحدي",
    opportunity: "فرصة",
    future: "مستقبلي",
    reportNote: "ملاحظة تقرير",
  },

  // Empty states
  empty: {
    goals: "لم تتم إضافة أهداف بعد",
    initiatives: "لم تتم إضافة مبادرات تطوير بعد",
    achievements: "لم تتم إضافة منجزات بعد",
    reports: "لم يتم إنشاء تقارير بعد",
    notes: "لم تتم إضافة ملاحظات بعد",
    attachments: "لم يتم رفع مرفقات بعد",
  },

  // Dashboard
  dashboard: {
    totalGoals: "الأهداف",
    totalInitiatives: "المبادرات",
    totalAchievements: "المنجزات",
    pendingReports: "تقارير معلقة",
    recentAchievements: "أحدث المنجزات",
    goalProgress: "تقدم الأهداف",
    reportReadiness: "جاهزية التقارير",
  },

  // Months
  months: [
    "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
  ],
} as const;

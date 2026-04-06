"use client";

import { useState, useCallback } from "react";
import {
  Upload, FileSpreadsheet, CheckCircle2, AlertCircle,
  Loader2, Database, Trash2, ClipboardPaste,
} from "lucide-react";
import {
  bulkImportAchievements,
  bulkImportInitiatives,
  bulkImportGoals,
  parseAndImportAchievements,
  type BulkAchievementRow,
  type BulkInitiativeRow,
  type BulkGoalRow,
} from "@/lib/actions/bulk-import";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────

type ImportTarget = "achievements" | "initiatives" | "goals";
type ImportMethod = "json" | "paste";

type ResultState = {
  success: boolean;
  inserted: number;
  skipped: number;
  errors: string[];
} | null;

// ── Sample Templates ───────────────────────────────────

const SAMPLE_JSON: Record<ImportTarget, string> = {
  achievements: JSON.stringify([
    {
      title: "إنجاز مشروع التحول الرقمي",
      achievement_date: "2026-04-01",
      category: "استراتيجي",
      description: "وصف المنجز هنا",
      impact: "الأثر المتحقق",
      goal_code: "g1",
    },
    {
      title: "تسليم الدراسات الهندسية",
      achievement_date: "2026-04-10",
      category: "تنفيذي",
      description: "وصف المنجز",
      impact: "الأثر",
      goal_code: "g3",
    },
  ], null, 2),

  initiatives: JSON.stringify([
    {
      title: "مشروع جديد",
      pillar: "مسار تطوير مبنى ديوان الوزارة",
      status: "جاري",
      progress_percentage: 50,
      goal_code: "g3",
    },
  ], null, 2),

  goals: JSON.stringify([
    {
      code: "g5",
      title: "هدف جديد",
      strategic_theme: "وصف الموضوع الاستراتيجي",
      color: "026D69",
      status: "نشط",
      progress_percentage: 0,
    },
  ], null, 2),
};

const TSV_TEMPLATE = `العنوان\tالتاريخ\tالتصنيف\tالوصف\tالأثر\tرمز الهدف
إنجاز مشروع التحول الرقمي\t2026-04-01\tاستراتيجي\tوصف المنجز\tالأثر المتحقق\tg1
تسليم الدراسات الهندسية\t2026-04-10\tتنفيذي\tوصف المنجز\tالأثر\tg3`;

// ── Tab Labels ─────────────────────────────────────────

const TARGET_LABELS: Record<ImportTarget, { label: string; icon: any }> = {
  achievements: { label: "المنجزات", icon: CheckCircle2 },
  initiatives: { label: "المبادرات", icon: Database },
  goals: { label: "الأهداف", icon: Database },
};

// ── Component ──────────────────────────────────────────

export function BulkImportPanel() {
  const [target, setTarget] = useState<ImportTarget>("achievements");
  const [method, setMethod] = useState<ImportMethod>("json");
  const [jsonInput, setJsonInput] = useState(SAMPLE_JSON.achievements);
  const [pasteInput, setPasteInput] = useState(TSV_TEMPLATE);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ResultState>(null);

  // Switch target → update sample
  const handleTargetChange = useCallback((t: ImportTarget) => {
    setTarget(t);
    setJsonInput(SAMPLE_JSON[t]);
    setResult(null);
  }, []);

  // ── Execute Import ─────────────────────────────────

  const handleImport = async () => {
    setLoading(true);
    setResult(null);

    try {
      if (method === "paste" && target === "achievements") {
        const res = await parseAndImportAchievements(pasteInput);
        setResult(res);
      } else if (method === "json") {
        const parsed = JSON.parse(jsonInput);
        if (!Array.isArray(parsed)) throw new Error("البيانات يجب أن تكون مصفوفة []");

        let res;
        switch (target) {
          case "achievements":
            res = await bulkImportAchievements(parsed as BulkAchievementRow[]);
            break;
          case "initiatives":
            res = await bulkImportInitiatives(parsed as BulkInitiativeRow[]);
            break;
          case "goals":
            res = await bulkImportGoals(parsed as BulkGoalRow[]);
            break;
        }
        setResult(res);
      }
    } catch (err: any) {
      setResult({
        success: false,
        inserted: 0,
        skipped: 0,
        errors: [err.message || "خطأ غير متوقع"],
      });
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">استيراد البيانات</h1>
          <p className="text-sm text-gray-500 mt-1">
            تغذية المنصة بالبيانات دفعة واحدة — JSON أو لصق من Excel
          </p>
        </div>
        <Upload className="w-8 h-8 text-brand-teal" />
      </div>

      {/* Target Tabs */}
      <div className="flex gap-2">
        {(Object.entries(TARGET_LABELS) as [ImportTarget, typeof TARGET_LABELS[ImportTarget]][]).map(
          ([key, { label, icon: Icon }]) => (
            <button
              key={key}
              onClick={() => handleTargetChange(key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                target === key
                  ? "bg-brand-teal text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          )
        )}
      </div>

      {/* Method Toggle */}
      <div className="flex gap-2 border-b pb-3">
        <button
          onClick={() => { setMethod("json"); setResult(null); }}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            method === "json"
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "text-gray-500 hover:text-gray-700"
          )}
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          JSON
        </button>
        {target === "achievements" && (
          <button
            onClick={() => { setMethod("paste"); setResult(null); }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              method === "paste"
                ? "bg-blue-50 text-blue-700 border border-blue-200"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <ClipboardPaste className="w-3.5 h-3.5" />
            لصق من Excel
          </button>
        )}
      </div>

      {/* Input Area */}
      <div className="relative">
        <textarea
          dir="ltr"
          className="w-full h-72 p-4 bg-gray-50 border border-gray-200 rounded-xl font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-teal/30 focus:border-brand-teal"
          value={method === "json" ? jsonInput : pasteInput}
          onChange={(e) =>
            method === "json"
              ? setJsonInput(e.target.value)
              : setPasteInput(e.target.value)
          }
          placeholder={
            method === "json"
              ? "الصق بيانات JSON هنا..."
              : "الصق البيانات من Excel هنا (Tab-separated)..."
          }
        />
        <button
          onClick={() => {
            if (method === "json") setJsonInput("");
            else setPasteInput("");
            setResult(null);
          }}
          className="absolute top-3 left-3 p-1.5 rounded-lg bg-white shadow-sm border border-gray-200 text-gray-400 hover:text-red-500 transition-colors"
          title="مسح"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-2">ملاحظات الاستيراد:</p>
        <ul className="space-y-1 text-blue-700 text-xs list-disc list-inside">
          <li>
            رمز الهدف (<code className="bg-blue-100 px-1 rounded">goal_code</code>) يربط
            البيانات بالأهداف الاستراتيجية (مثل: g1, g2, g3, g4)
          </li>
          <li>التاريخ بصيغة <code className="bg-blue-100 px-1 rounded">YYYY-MM-DD</code></li>
          <li>الاستيراد يتم على دفعات (50 سجل في كل دفعة) لتجنب حدود الخادم</li>
          <li>السجلات الناقصة يتم تخطيها مع عرض السبب</li>
        </ul>
      </div>

      {/* Import Button */}
      <button
        onClick={handleImport}
        disabled={loading}
        className={cn(
          "w-full flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl font-medium text-white transition-all",
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-brand-teal hover:bg-brand-teal/90 shadow-sm hover:shadow"
        )}
      >
        {loading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري الاستيراد...
          </>
        ) : (
          <>
            <Upload className="w-5 h-5" />
            استيراد {TARGET_LABELS[target].label}
          </>
        )}
      </button>

      {/* Result */}
      {result && (
        <div
          className={cn(
            "rounded-xl p-5 border",
            result.success
              ? "bg-green-50 border-green-200"
              : result.inserted > 0
              ? "bg-yellow-50 border-yellow-200"
              : "bg-red-50 border-red-200"
          )}
        >
          <div className="flex items-center gap-3 mb-3">
            {result.success ? (
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            ) : (
              <AlertCircle className="w-6 h-6 text-red-500" />
            )}
            <h3 className="font-bold text-lg">
              {result.success
                ? "تم الاستيراد بنجاح"
                : result.inserted > 0
                ? "استيراد جزئي"
                : "فشل الاستيراد"}
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-green-600">{result.inserted}</div>
              <div className="text-xs text-gray-500">تم إدخالها</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{result.skipped}</div>
              <div className="text-xs text-gray-500">تم تخطيها</div>
            </div>
            <div className="text-center p-3 bg-white rounded-lg">
              <div className="text-2xl font-bold text-red-600">{result.errors.length}</div>
              <div className="text-xs text-gray-500">أخطاء</div>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-white rounded-lg p-3 max-h-40 overflow-y-auto">
              <p className="text-xs font-medium text-red-700 mb-2">تفاصيل الأخطاء:</p>
              {result.errors.map((err, i) => (
                <p key={i} className="text-xs text-red-600 py-0.5">
                  {err}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

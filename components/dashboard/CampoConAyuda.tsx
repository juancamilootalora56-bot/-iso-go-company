"use client";

export default function CampoConAyuda({
  label,
  value,
  onChange,
  ayuda,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  ayuda: string;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <div className="grid sm:grid-cols-3 gap-4 items-start">
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-[#FAFAFA] border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-[#1A1A1A] placeholder-gray-400 focus:outline-none focus:border-[#F5A623] transition-colors resize-y"
        />
      </div>
      <div className="bg-[#FFF6E5] border border-[#F5A623]/20 rounded-xl p-3.5 text-xs text-gray-600 leading-relaxed sm:mt-6">
        {ayuda}
      </div>
    </div>
  );
}

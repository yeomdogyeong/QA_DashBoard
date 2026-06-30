import React from "react";
import { Settings, Sliders, CheckSquare, Plus, Trash2 } from "lucide-react";
import { ReleaseCriteria } from "../types";

interface ReportSettingsProps {
  appTitle: string;
  setAppTitle: (val: string) => void;
  appVersion: string;
  setAppVersion: (val: string) => void;
  criteria: ReleaseCriteria;
  setCriteria: (c: ReleaseCriteria) => void;
  checklist: { id: string; text: string; checked: boolean }[];
  setChecklist: React.Dispatch<React.SetStateAction<{ id: string; text: string; checked: boolean }[]>>;
}

export default function ReportSettings({
  appTitle,
  setAppTitle,
  appVersion,
  setAppVersion,
  criteria,
  setCriteria,
  checklist,
  setChecklist
}: ReportSettingsProps) {
  
  const handlePassRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria({ ...criteria, minPassRate: Number(e.target.value) });
  };

  const handleCriticalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria({ ...criteria, maxCriticalBugs: Number(e.target.value) });
  };

  const handleHighChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria({ ...criteria, maxHighBugs: Number(e.target.value) });
  };

  const handleBlockedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCriteria({ ...criteria, blockedAllowed: e.target.checked });
  };

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const [newItemText, setNewItemText] = React.useState("");

  const addChecklistItem = () => {
    if (!newItemText.trim()) return;
    setChecklist([
      ...checklist,
      { id: Date.now().toString(), text: newItemText.trim(), checked: false }
    ]);
    setNewItemText("");
  };

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter(item => item.id !== id));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 no-print">
      {/* 1. Report Properties */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Settings className="w-4 h-4 text-indigo-600" />
          보고서 메타정보 설정
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-1.5">대상 프로그램 / 시스템명</label>
            <input
              type="text"
              value={appTitle}
              onChange={(e) => setAppTitle(e.target.value)}
              placeholder="예: Web Portal v3.2"
              className="w-full text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 font-mono uppercase tracking-wider mb-1.5">대상 버전 (Target Version)</label>
            <input
              type="text"
              value={appVersion}
              onChange={(e) => setAppVersion(e.target.value)}
              placeholder="예: 1.0.0"
              className="w-full text-xs p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 font-mono"
            />
          </div>
        </div>
      </div>

      {/* 2. Release Gate Standards */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <Sliders className="w-4 h-4 text-indigo-600" />
          배포 가능 기준 (Quality Gate)
        </h3>

        <div className="space-y-4 text-xs text-slate-600">
          <div>
            <div className="flex justify-between font-bold text-slate-500 mb-1">
              <span>최소 합격 기준 통과율 (%)</span>
              <span className="font-mono text-indigo-600 font-bold">{criteria.minPassRate}%</span>
            </div>
            <input
              type="range"
              min="50"
              max="100"
              value={criteria.minPassRate}
              onChange={handlePassRateChange}
              className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-500 mb-1">허용 최대 Critical 결함수</label>
              <input
                type="number"
                min="0"
                value={criteria.maxCriticalBugs}
                onChange={handleCriticalChange}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-center focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-1">허용 최대 High 결함수</label>
              <input
                type="number"
                min="0"
                value={criteria.maxHighBugs}
                onChange={handleHighChange}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-mono text-center focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 outline-none font-bold"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/80 mt-2">
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-slate-700">Blocked 상태 허용</span>
              <span className="text-[10px] text-slate-400 leading-none font-semibold">차단되거나 미완료된 테스트 케이스의 배포 허가 여부</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={criteria.blockedAllowed}
                onChange={handleBlockedToggle}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Manual Checklist Management */}
      <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 font-display mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          추가 정성적 검증 체크리스트
        </h3>

        <div className="space-y-3">
          <div className="flex gap-1">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="예: 보안 모의 침투테스트 승인"
              className="flex-1 text-xs p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-600 focus:border-indigo-600 font-semibold"
              onKeyDown={(e) => e.key === "Enter" && addChecklistItem()}
            />
            <button
              onClick={addChecklistItem}
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-40 overflow-y-auto space-y-2 pr-1">
            {checklist.length > 0 ? (
              checklist.map(item => (
                <div key={item.id} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 transition">
                  <div className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={item.checked}
                      onChange={() => toggleChecklistItem(item.id)}
                      className="rounded border-slate-300 text-indigo-600 bg-transparent focus:ring-0 cursor-pointer"
                    />
                    <span className={`font-semibold ${item.checked ? "line-through text-slate-400" : "text-slate-600"}`}>
                      {item.text}
                    </span>
                  </div>
                  <button
                    onClick={() => removeChecklistItem(item.id)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-md transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-[11px] text-slate-400 py-6 font-medium">추가 검증 항목이 비어 있습니다.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

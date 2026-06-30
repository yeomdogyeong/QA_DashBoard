import React, { useState, useRef } from "react";
import Papa from "papaparse";
import { Upload, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import { sampleDatasets, SampleDataset } from "../mockData";
import { QARecord } from "../types";

interface CsvUploaderProps {
  onDataLoaded: (records: QARecord[], fileName: string, type: "tests" | "defects") => void;
  currentFileName: string | null;
}

export default function CsvUploader({ onDataLoaded, currentFileName }: CsvUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError(null);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const files = e.target.files;
    if (files && files.length > 0) {
      processFile(files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setError("CSV 파일만 지원됩니다. (*.csv)");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          // Detect dataset type based on columns
          const keys = Object.keys(results.data[0]);
          const isDefects = keys.some(k => k.toLowerCase().includes("bug") || k.toLowerCase().includes("defect") || k.toLowerCase().includes("severity"));
          onDataLoaded(results.data as QARecord[], file.name, isDefects ? "defects" : "tests");
        } else {
          setError("CSV 파일에 데이터가 없습니다.");
        }
      },
      error: (err) => {
        setError(`CSV 파싱 오류: ${err.message}`);
      }
    });
  };

  const loadSample = (sample: SampleDataset) => {
    setError(null);
    Papa.parse(sample.csvContent, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.data && results.data.length > 0) {
          onDataLoaded(results.data as QARecord[], `샘플: ${sample.name}`, sample.type);
        } else {
          setError("샘플 데이터를 파싱하는 도중 오류가 발생했습니다.");
        }
      },
      error: (err) => {
        setError(`샘플 파싱 오류: ${err.message}`);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 mb-8 no-print">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-800 font-display mb-1 flex items-center gap-2">
          <Upload className="w-5 h-5 text-indigo-600" />
          QA 데이터 파일 로드
        </h2>
        <p className="text-sm text-slate-500">
          테스트 실행 결과 또는 버그/결함 대장을 담은 CSV 파일을 업로드하거나, 아래 엄선된 포트폴리오용 샘플 데이터를 선택해 보세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Drag and Drop Zone */}
        <div className="lg:col-span-2">
          <div
            id="csv-drag-zone"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
              isDragging
                ? "border-indigo-500 bg-indigo-50 scale-[0.99]"
                : currentFileName
                ? "border-emerald-200 bg-emerald-50/50 hover:border-emerald-300"
                : "border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50/50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".csv"
              className="hidden"
            />
            {currentFileName ? (
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100/50 border border-emerald-200 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-sm font-semibold text-slate-800 font-display mb-1">
                  로드 완료: {currentFileName}
                </p>
                <p className="text-xs text-slate-500">
                  다른 파일을 업로드하려면 영역을 클릭하거나 드래그하세요.
                </p>
              </div>
            ) : (
              <div className="text-center p-4">
                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                  <FileText className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-sm font-semibold text-slate-700 mb-1">
                  여기로 CSV 파일을 드래그하거나 클릭하여 선택하세요
                </p>
                <p className="text-xs text-slate-400">
                  지원 규격: UTF-8 인코딩된 .csv 파일
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="mt-3 p-3 bg-rose-50 border border-rose-100 rounded-lg flex items-center gap-2 text-rose-600 text-xs font-semibold">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>

        {/* Sample Datasets selection */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 font-mono">
              포트폴리오 프리셋 데이터
            </h3>
            <div className="space-y-2">
              {sampleDatasets.map((sample) => (
                <button
                  key={sample.id}
                  id={`sample-btn-${sample.id}`}
                  onClick={() => loadSample(sample)}
                  className="w-full text-left p-2.5 bg-white rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition text-xs flex flex-col gap-0.5 text-slate-700"
                >
                  <span className="font-bold text-slate-800 font-display flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${sample.type === "tests" ? "bg-indigo-500" : "bg-rose-500"}`} />
                    {sample.name.split(" ")[0]} ...
                  </span>
                  <span className="text-slate-400 line-clamp-1 text-[11px] font-medium">{sample.description}</span>
                </button>
              ))}
            </div>
          </div>
          <p className="text-[10px] text-slate-400 mt-4 leading-normal font-medium">
            💡 CSV 파일 업로드 시 컬럼 헤더명(Status, Priority, Severity 등)을 자동 인지해 똑똑하게 분류합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  FileText, 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Pill, 
  User, 
  Calendar, 
  Stethoscope,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, Type } from "@google/genai";
import { cn } from './lib/utils';

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface AnalysisResult {
  patientName?: string;
  date?: string;
  doctorName?: string;
  medicines: Medicine[];
}


export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleAnalyze = async () => {
    if (!file) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Try to get the key from multiple sources for reliability
      const apiKey = process.env.GEMINI_API_KEY1 || (import.meta as any).env?.VITE_GEMINI_API_KEY1;
      
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY1" || apiKey.trim() === "") {
        console.error("Gemini API key is missing or invalid in the frontend environment.");
        throw new Error("Gemini API key is not configured. Please ensure GEMINI_API_KEY1 is set in the AI Studio Secrets panel and restart the app.");
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Convert file to base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are a professional medical prescription analyzer. 
                Extract all relevant information from this prescription image.
                Identify:
                1. Patient name (if visible)
                2. Date of prescription
                3. List of medicines with:
                   - Name
                   - Dosage (e.g., 500mg)
                   - Frequency (e.g., twice a day)
                   - Duration (e.g., 5 days)
                   - Instructions (e.g., after food)
                4. Doctor/Clinic name (if visible)
                
                Return the data in a structured JSON format.`,

              },
              {
                inlineData: {
                  data: base64Data,
                  mimeType: file.type,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              patientName: { type: Type.STRING },
              date: { type: Type.STRING },
              doctorName: { type: Type.STRING },
              medicines: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    dosage: { type: Type.STRING },
                    frequency: { type: Type.STRING },
                    duration: { type: Type.STRING },
                    instructions: { type: Type.STRING },
                  },
                  required: ["name"],
                },
              },
            },
          },
        },
      });

      const resultData = JSON.parse(response.text || "{}");
      setResult(resultData);
    } catch (err: any) {
      console.error("Analysis error:", err);
      setError(err.message || "Failed to process prescription");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen font-sans selection:bg-cyan-500/30">
      {/* Centered Title Section */}
      <div className="pt-20 pb-12 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-5xl font-extrabold text-white tracking-tight"
        >
          Prescription <span className="accent-text">AI</span> Scanner
        </motion.h1>
      </div>


      <main className="max-w-4xl mx-auto px-4 pb-20">
        <div className="grid grid-cols-1 gap-12">
          
          {/* Main Card */}
          <div className="space-y-8">
            <section className="neon-card p-10 border border-white/5">
              <div className="mb-8">
                <h2 className="text-xl font-bold text-white mb-2">Upload Prescription</h2>
                <p className="text-slate-400 text-sm">
                  Upload a clear image of your handwritten prescription. MediScan AI will extract the medicine and determine the urgency.
                </p>
              </div>
              
              <div 
                {...getRootProps()} 
                className={cn(
                  "upload-zone relative group",
                  isDragActive ? "border-cyan-500 bg-cyan-500/5" : "",
                  preview ? "py-6" : "py-20"
                )}
              >
                <input {...getInputProps()} />
                {preview ? (
                  <div className="relative">
                    <img 
                      src={preview} 
                      alt="Prescription preview" 
                      className="max-h-80 mx-auto rounded-2xl shadow-2xl object-contain border border-white/10"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                      <p className="text-white text-sm font-bold bg-cyan-500/20 px-4 py-2 rounded-full backdrop-blur-md border border-cyan-500/50">
                        Click to change image
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="w-16 h-16 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto border border-cyan-500/20">
                      <Upload className="accent-text w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">
                        Click to browse <span className="font-normal text-slate-400">or drag & drop</span>
                      </p>
                      <p className="text-slate-500 mt-2">High-quality JPEG, PNG or PDF</p>
                    </div>
                  </div>
                )}
              </div>

              {file && !isAnalyzing && (
                <div className="mt-6 flex items-center gap-2 text-emerald-400 font-medium">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Selected file: {file.name}</span>
                </div>
              )}

              <div className="flex justify-end mt-10">
                <button
                  onClick={handleAnalyze}
                  disabled={!file || isAnalyzing}
                  className={cn(
                    "neon-button flex items-center gap-3",
                    (!file || isAnalyzing) && "opacity-50 grayscale cursor-not-allowed shadow-none scale-100"
                  )}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Process Document
                      <div className="w-2 h-2 bg-slate-900 rounded-full animate-pulse shadow-[0_0_8px_rgba(0,0,0,0.5)]" />
                    </>
                  )}
                </button>
              </div>
            </section>


            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl flex items-start gap-3"
              >
                <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Analysis Error</p>
                  <p className="text-sm opacity-90">{error}</p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Results Area */}
          <div className="w-full">
            <AnimatePresence mode="wait">
              {!result && !isAnalyzing ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="h-full min-h-[300px] border border-white/5 rounded-[2rem] flex flex-col items-center justify-center text-slate-500 p-12 text-center bg-white/5"
                >
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
                    <Activity className="w-8 h-8 text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest">Waiting for Scan</h3>
                </motion.div>
              ) : isAnalyzing ? (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full min-h-[300px] neon-card p-12 flex flex-col items-center justify-center text-center"
                >
                  <div className="relative mb-8">
                    <div className="w-20 h-20 border-4 border-cyan-500/10 border-t-cyan-500 rounded-full animate-spin" />
                    <Activity className="absolute inset-0 m-auto accent-text w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">AI Vision Processing</h3>
                  <p className="text-slate-400 mt-2">Extracting medical data from document...</p>
                </motion.div>

              ) : (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  {/* Summary Card */}
                  <div className="neon-card p-8 mb-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-bold flex items-center gap-3 text-white">
                        <CheckCircle2 className="text-emerald-400 w-7 h-7" />
                        Analysis Complete
                      </h2>
                      <span className="text-[10px] font-black accent-text bg-cyan-500/10 px-4 py-1.5 rounded-full uppercase tracking-[0.2em] border border-cyan-500/20">
                        AI Verified
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                          <User className="w-3 h-3" /> Patient
                        </div>
                        <p className="font-bold text-white text-lg">{result?.patientName || 'Not identified'}</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                          <Calendar className="w-3 h-3" /> Date
                        </div>
                        <p className="font-bold text-white text-lg">{result?.date || 'Not identified'}</p>
                      </div>
                      <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">
                          <Stethoscope className="w-3 h-3" /> Doctor
                        </div>
                        <p className="font-bold text-white text-lg">{result?.doctorName || 'Not identified'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="neon-card overflow-hidden">
                    <div className="p-8 border-b border-white/5 bg-white/5">
                      <h3 className="font-bold text-white text-xl flex items-center gap-3">
                        <Pill className="w-6 h-6 accent-text" />
                        Prescribed Medicines
                      </h3>
                    </div>
                    <div className="divide-y divide-white/5">
                      {result?.medicines.map((med, idx) => (
                        <div key={idx} className="p-8 hover:bg-white/5 transition-colors group">
                          <div className="flex items-start justify-between">
                            <div className="space-y-3">
                              <h4 className="text-xl font-bold text-white group-hover:text-[#00f2ff] transition-colors">
                                {med.name}
                              </h4>
                              <div className="flex flex-wrap gap-3">
                                {med.dosage && (
                                  <span className="text-sm font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                    {med.dosage}
                                  </span>
                                )}
                                {med.frequency && (
                                  <span className="text-sm font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-lg">
                                    {med.frequency}
                                  </span>
                                )}
                                {med.duration && (
                                  <span className="text-sm font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-lg">
                                    {med.duration}
                                  </span>
                                )}
                              </div>
                              {med.instructions && (
                                <p className="text-slate-400 flex items-center gap-2 italic">
                                  <ChevronRight className="w-4 h-4 accent-text" />
                                  {med.instructions}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>



                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-white/5 py-12 bg-[#020617]">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-500 font-medium">
            © 2026 MediScan AI. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

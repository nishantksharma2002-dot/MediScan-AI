import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { useNavigate } from 'react-router-dom';
import {
  CloudUpload,
  CheckCircle2,
  Pill,
  User,
  Activity,
  AlertCircle,
  Stethoscope,
  ChevronRight,
  Send,
  Lock,
  Scan,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './lib/utils';
import { api } from './lib/api';

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
  priority_level?: string;
}

interface AnalysisResult {
  patientName?: string;
  date?: string;
  doctorName?: string;
  medicines: Medicine[];
  notes?: string;
  warnings?: string[];
}

type WorkflowStep = 'UPLOAD' | 'ANALYZING' | 'REVIEW' | 'TRANSFERRING' | 'DONE';

const PROCESSING_PHASES = [
  "Connecting to Neural Link...",
  "Neural Prescription Parsing...",
  "Semantic Entity Parsing...",
  "Running Safety Protocols...",
  "Compiling Results..."
];

export default function AIScannerPro() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<WorkflowStep>('UPLOAD');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [transferState, setTransferState] = useState<'IDLE' | 'PROCESSING' | 'CONFIRMED'>('IDLE');
  const [pollingIds, setPollingIds] = useState<number[]>([]);
  const [approvedCount, setApprovedCount] = useState(0);

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  useEffect(() => {
    let interval: any;
    if ((step === 'ANALYZING' || step === 'TRANSFERRING') && phaseIndex < PROCESSING_PHASES.length - 1) {
      interval = setInterval(() => {
        setPhaseIndex(p => Math.min(p + 1, PROCESSING_PHASES.length - 1));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [step, phaseIndex]);

  useEffect(() => {
    if (pollingIds.length === 0) return;

    const interval = setInterval(async () => {
      try {
        const json = await api.getPrescriptionStatus(pollingIds);
        const statuses = json.data;
        
        const approved = statuses.filter(s => s.delivery_status === 'Accepted').length;
        setApprovedCount(approved);

        if (approved === pollingIds.length) {
          clearInterval(interval);
          setPollingIds([]);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [pollingIds]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    }
  }, []);

  const handleCancel = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    setStep('UPLOAD');
    setSelectedIndices([]);
    setPhaseIndex(0);
    setTransferState('IDLE');
  };

  const toggleMedicine = (index: number) => {
    setSelectedIndices(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const handleAnalyze = async () => {
    if (!file) return;

    setStep('ANALYZING');
    setError(null);
    setPhaseIndex(0);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      reader.readAsDataURL(file);
      const base64Data = await base64Promise;

      const resultData = await api.analyzePrescription(base64Data, file.type) as AnalysisResult;
      setResult(resultData);

      if (resultData.medicines) {
        setSelectedIndices(resultData.medicines.map((_, i) => i));
      }

      await sleep(1000); // Visual pause
      setStep('REVIEW');
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Neural node unavailable. Please retry.");
      setStep('UPLOAD');
    }
  };

  const handleConfirmTransfer = async () => {
    if (!result || selectedIndices.length === 0 || transferState !== 'IDLE') return;
    setTransferState('PROCESSING');
    setError(null);

    try {
      const savedIds: number[] = [];
      for (const index of selectedIndices) {
        const med = result.medicines[index];
        const payload = {
          user_id: 1,
          medicine_name: med.name,
          dosage: med.dosage || "N/A",
          frequency: med.frequency || "N/A",
          duration: med.duration || "N/A",
          extracted_text: JSON.stringify(result),
          priority_level: med.priority_level || "Regular"
        };

        const data = await api.savePrescription(payload);
        if (data.id) savedIds.push(data.id);
        await sleep(500);
      }

      setTransferState('CONFIRMED');
      setPollingIds(savedIds);
      
      // Removed automatic alert to allow polling UI to show progress
    } catch (err: any) {
      console.error(err);
      setError("Secure transfer failed. Please retry.");
      setTransferState('IDLE');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 min-h-[calc(100vh-80px)]">

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-500 dark:from-white dark:to-slate-400 tracking-tight">
          Prescription <span className="text-cyan-500 dark:text-cyan-400" style={{ textShadow: '0 0 30px rgba(34,211,238,0.5)' }}>AI</span>
        </h1>
      </motion.div>

      <div className="w-full max-w-4xl relative">
        <AnimatePresence mode="wait">

          {/* ----- UPLOAD STEP ----- */}
          {step === 'UPLOAD' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98, filter: 'blur(5px)' }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl rounded-[32px] p-6 md:p-10 shadow-2xl border border-slate-200 dark:border-white/5"
            >
              <div className="flex items-center justify-center gap-3 mb-8">
                <Scan className="text-cyan-500 dark:text-cyan-400" size={24} />
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">AI Prescription Scanner</h2>
              </div>

              <div
                {...getRootProps()}
                className={cn(
                  "relative group h-64 md:h-80 rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer",
                  !preview && isDragActive ? "bg-cyan-50 dark:bg-cyan-500/10" : "bg-slate-50 dark:bg-black/40",
                  "border-2",
                  isDragActive ? "border-cyan-500 dark:border-cyan-400 border-dashed" : preview ? "border-cyan-300 dark:border-cyan-500/30 border-solid" : "border-slate-300 dark:border-slate-800 border-dashed hover:border-slate-400 dark:hover:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-900/60"
                )}
              >
                <input {...getInputProps()} />

                {preview ? (
                  // Custom Image Preview Look
                  <>
                    <img src={preview} alt="Prescription" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen transition-opacity duration-500 group-hover:opacity-30" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent pointer-events-none" />

                    {/* Hover State to Change image */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <RefreshCw size={40} className="text-white mb-2" />
                      <p className="text-white font-bold tracking-wider">Change Image</p>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-10 px-4 py-2 bg-slate-950/60 backdrop-blur-md rounded-xl border border-white/10">
                      <span className="text-cyan-300 font-medium truncate text-sm flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-cyan-400" /> {file?.name}
                      </span>
                    </div>
                  </>
                ) : (
                  // Standard empty Dropzone
                  <>
                    <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="h-full flex flex-col items-center justify-center gap-4 relative z-10">
                      <motion.div animate={isDragActive ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }} className={cn("p-5 rounded-3xl", isDragActive ? "bg-cyan-400/20 text-cyan-300" : "bg-slate-800 text-slate-400")}>
                        <CloudUpload size={40} strokeWidth={1.5} />
                      </motion.div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-slate-900 dark:text-white">Click or Drop Image</p>
                        <p className="text-slate-500 mt-1 text-sm font-medium">JPEG, PNG</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-center w-full">
                <button
                  onClick={handleAnalyze}
                  disabled={!file}
                  className={cn(
                    "w-full md:w-auto px-10 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all group relative overflow-hidden",
                    !file ? "bg-slate-800/50 text-slate-600 cursor-not-allowed hidden" : "bg-cyan-400 text-slate-950 hover:bg-cyan-300 shadow-[0_0_30px_rgba(34,211,238,0.2)] hover:shadow-[0_0_40px_rgba(34,211,238,0.4)]"
                  )}
                >
                  <span className="relative z-10 flex items-center gap-2">Initialize Analysis <ChevronRight size={18} strokeWidth={3} /></span>
                </button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex gap-3 text-red-400 text-sm font-medium">
                  <AlertCircle size={18} className="shrink-0" /> {error}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ----- ANALYZING STEP ----- */}
          {step === 'ANALYZING' && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-cyan-500/20 shadow-2xl rounded-[32px] overflow-hidden flex flex-col items-center justify-center min-h-[450px] relative w-full"
            >
              {/* Dynamic Scanning Background Image */}
              {preview && (
                <div className="absolute inset-0 opacity-40 mix-blend-luminosity">
                  <img src={preview} alt="Scanning" className="w-full h-full object-cover blur-[2px] scale-105 saturate-0" />
                  <motion.div
                    className="absolute left-0 right-0 h-64 bg-gradient-to-b from-transparent via-cyan-400/10 to-cyan-400/80 border-b-[3px] border-cyan-400 shadow-[0_10px_50px_rgba(34,211,238,0.8)]"
                    animate={{ y: [-300, 600] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              )}

              <div className="relative z-10 bg-white/80 dark:bg-slate-950/60 backdrop-blur-xl p-8 rounded-3xl border border-slate-200 dark:border-white/5 flex flex-col items-center">
                <div className="relative w-24 h-24 mb-6">
                  <motion.svg className="absolute inset-0 w-full h-full text-slate-800" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="5 5" />
                  </motion.svg>
                  <motion.svg
                    className="absolute inset-0 w-full h-full text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.8)]"
                    viewBox="0 0 100 100"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  >
                    <circle cx="50" cy="50" r="45" fill="none" stroke="#22d3ee" strokeWidth="3" strokeDasharray="80 200" strokeLinecap="round" />
                  </motion.svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    {step === 'ANALYZING' ? <Scan size={28} className="text-cyan-300 animate-pulse" /> : <Lock size={28} className="text-cyan-300 animate-pulse" />}
                  </div>
                </div>

                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
                  Processing Image Core
                </h3>

                <div className="h-6 flex items-center justify-center overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={phaseIndex}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.2 }}
                      className="text-cyan-400 font-mono text-xs tracking-widest uppercase"
                    >
                      {PROCESSING_PHASES[phaseIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}

          {/* ----- REVIEW STEP ----- */}
          {step === 'REVIEW' && result && (
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Doctor / Patient Meta */}
              <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-6 w-full">
                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                      <Stethoscope size={20} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Doctor</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{result.doctorName || 'Identified Record'}</p>
                    </div>
                  </div>

                  <div className="w-px h-10 bg-slate-200 dark:bg-white/10 hidden sm:block" />

                  <div className="flex flex-1 items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 flex items-center justify-center border border-purple-500/20">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Patient</p>
                      <p className="text-slate-900 dark:text-white font-bold text-sm">{result.patientName || 'Medical File'}</p>
                    </div>
                  </div>
                </div>

                <button onClick={handleCancel} className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all uppercase whitespace-nowrap border border-slate-200 dark:border-white/5">
                  Rescan
                </button>
              </div>

              {/* Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="text-cyan-500 dark:text-cyan-400" size={20} /> Verify Medications
                  </h3>
                  <span className="text-cyan-400 text-xs font-bold bg-cyan-400/10 px-3 py-1 rounded-full">{selectedIndices.length} Selected</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {result.medicines.map((med, idx) => {
                    const isSelected = selectedIndices.includes(idx);
                    return (
                      <motion.div
                        key={idx}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => toggleMedicine(idx)}
                        className="cursor-pointer"
                      >
                        <div className={cn(
                          "h-full p-5 rounded-2xl flex flex-col gap-3 transition-colors border",
                          isSelected ? "bg-white dark:bg-slate-900 border-cyan-400 dark:border-cyan-500/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]" : "bg-slate-50 dark:bg-black/40 border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/10 hover:bg-slate-100 dark:hover:bg-slate-900/50"
                        )}>

                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                                isSelected ? "bg-cyan-400 border-cyan-400 text-slate-950" : "border-slate-400 dark:border-slate-600"
                              )}>
                                {isSelected && <CheckCircle2 size={12} strokeWidth={3} />}
                              </div>
                              <h4 className={cn("text-lg font-bold", isSelected ? "text-slate-900 dark:text-cyan-50" : "text-slate-700 dark:text-slate-200")}>{med.name}</h4>
                            </div>
                            <Pill size={16} className={isSelected ? "text-cyan-500 dark:text-cyan-400" : "text-slate-400 dark:text-slate-600"} />
                          </div>

                          <div className="flex flex-wrap gap-2 mt-auto pt-1 ml-8">
                            {med.dosage && <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-0.5 rounded text-[11px] font-semibold border border-slate-200 dark:border-white/5">{med.dosage}</span>}
                            {med.frequency && <span className="bg-cyan-500/10 text-cyan-300 px-2.5 py-0.5 rounded text-[11px] font-semibold border border-cyan-500/20">{med.frequency}</span>}
                            {med.duration && <span className="bg-purple-500/10 text-purple-300 px-2.5 py-0.5 rounded text-[11px] font-semibold border border-purple-500/20">{med.duration}</span>}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  {result.medicines.length === 0 && (
                    <div className="col-span-full py-12 text-center bg-slate-50 dark:bg-black/20 rounded-3xl border border-dashed border-slate-200 dark:border-white/10">
                      <Pill size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
                      <p className="text-slate-500 dark:text-slate-400 font-bold">No medications identified in this scan.</p>
                      <p className="text-slate-400 dark:text-slate-600 text-xs mt-1">Please try again with a clearer image.</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 pb-2 flex flex-col sm:flex-row justify-end items-center gap-4">
                {/* STEP 1: Processing Button */}
                {transferState === 'IDLE' && selectedIndices.length > 0 && (
                  <button
                    onClick={handleConfirmTransfer}
                    className="px-8 py-3.5 w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-all shadow-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                  >
                    <CheckCircle2 size={18} /> Confirm
                  </button>
                )}



                {/* STEP 2: Polling & Confirm Button */}
                {transferState === 'CONFIRMED' && (
                  <div className="flex flex-col w-full gap-4">
                    {pollingIds.length > 0 && (
                      <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex flex-col items-center gap-3">
                        <div className="flex items-center gap-3 text-cyan-400">
                          <RefreshCw size={18} className="animate-spin" />
                          <span className="text-sm font-bold uppercase tracking-widest">Awaiting Pharmacy Hub Approval</span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <motion.div 
                            className="bg-cyan-400 h-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${(approvedCount / pollingIds.length) * 100}%` }}
                          />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold">{approvedCount} of {pollingIds.length} Medicines Approved</p>
                      </div>
                    )}

                    {approvedCount === pollingIds.length && approvedCount > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400"
                      >
                        <CheckCircle2 size={20} />
                        <span className="text-sm font-bold">All medications approved by Pharmacy Hub!</span>
                      </motion.div>
                    )}

                    <div className="flex flex-col sm:flex-row w-full gap-3">
                      <button
                        onClick={handleCancel}
                        className="px-6 py-3 border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl transition-all"
                      >
                        New Scan
                      </button>
                      <button
                        onClick={() => navigate('/pharmacy')}
                        className="px-8 py-3.5 flex-1 inline-flex items-center justify-center gap-2 rounded-xl font-bold bg-cyan-400 text-slate-950 hover:bg-cyan-300 hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all"
                      >
                        <Activity size={18} /> View Pharmacy Hub
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ----- SUCCESS STEP ----- */}
          {step === 'DONE' && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-slate-200 dark:border-white/5 rounded-[32px] p-12 text-center shadow-xl"
            >
              <div className="w-20 h-20 mx-auto bg-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(34,211,238,0.5)] mb-6">
                <CheckCircle2 size={40} className="text-slate-950" strokeWidth={2.5} />
              </div>

              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Verified & Sent</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-10">
                Prescription data transmitted to Pharmacy Hub.
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-3">
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl transition-all text-sm"
                >
                  New Scan
                </button>
                <button
                  onClick={() => window.location.href = '/pharmacy'}
                  className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(34,211,238,0.3)]"
                >
                  Enter Pharmacy Hub
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}

import { MEDICINES_SEED } from './mockData';

// Helper to get from localStorage
const getFromStorage = (key: string, defaultValue: any) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
};

// Helper to save to localStorage
const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const api = {
  // AI Analysis (Simulated)
  analyzePrescription: async (base64Data: string, mimeType: string) => {
    console.log("Simulating prescription analysis (Frontend-only)...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      patientName: "",
      date: new Date().toISOString().split('T')[0],
      doctorName: "",
      medicines: [],
      notes: "Analysis complete. No medicines identified.",
      warnings: []
    };
  },

  // Medicines
  getMedicines: async (search: string = "", category: string = "") => {
    let results = MEDICINES_SEED;
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      results = results.filter(m => 
        m.name.toLowerCase().includes(lowerSearch) || 
        m.generic_name.toLowerCase().includes(lowerSearch) || 
        m.description.toLowerCase().includes(lowerSearch)
      );
    }
    
    if (category && category !== 'All') {
      results = results.filter(m => m.category === category);
    }
    
    return { data: results };
  },

  getMedicineById: async (id: number) => {
    const med = MEDICINES_SEED.find(m => m.id === id);
    if (!med) throw new Error("Medicine not found");
    return med;
  },

  getCategories: async () => {
    const categories = Array.from(new Set(MEDICINES_SEED.map(m => m.category))).sort();
    return { data: categories };
  },

  // Prescriptions (LocalStorage)
  getPrescriptions: async () => {
    const prescriptions = getFromStorage('mediscan_prescriptions', []);
    // Sort by priority similar to backend
    const priorityMap: Record<string, number> = {
      'Critical': 1,
      'High Priority': 2,
      'Urgent': 3,
      'Regular': 4
    };
    
    const sorted = [...prescriptions].sort((a, b) => {
      const pa = priorityMap[a.priority_level] || 5;
      const pb = priorityMap[b.priority_level] || 5;
      if (pa !== pb) return pa - pb;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return { data: sorted };
  },

  savePrescription: async (payload: any) => {
    const prescriptions = getFromStorage('mediscan_prescriptions', []);
    const newId = Date.now() + Math.floor(Math.random() * 1000);
    const newPrescription = {
      ...payload,
      id: newId,
      delivery_status: 'Pending',
      created_at: new Date().toISOString()
    };
    
    prescriptions.push(newPrescription);
    saveToStorage('mediscan_prescriptions', prescriptions);
    
    // Update stats
    const stats = getFromStorage('mediscan_stats', { wellness_score: 92, total_savings: 1240.50, active_prescriptions: 0 });
    stats.active_prescriptions += 1;
    saveToStorage('mediscan_stats', stats);
    
    return { message: "Prescription Saved", id: newId };
  },

  updatePrescriptionStatus: async (id: number, status: string) => {
    const prescriptions = getFromStorage('mediscan_prescriptions', []);
    const updated = prescriptions.map((p: any) => p.id === id ? { ...p, delivery_status: status } : p);
    saveToStorage('mediscan_prescriptions', updated);
    return { message: "Status updated successfully" };
  },

  getPrescriptionStatus: async (ids: number[]) => {
    const prescriptions = getFromStorage('mediscan_prescriptions', []);
    const results = prescriptions
      .filter((p: any) => ids.includes(p.id))
      .map((p: any) => ({ id: p.id, delivery_status: p.delivery_status }));
    return { data: results };
  },

  clearAllPrescriptions: async () => {
    const prescriptions = getFromStorage('mediscan_prescriptions', []);
    const updated = prescriptions.map((p: any) => p.delivery_status === 'Pending' ? { ...p, delivery_status: 'Cleared' } : p);
    saveToStorage('mediscan_prescriptions', updated);
    return { message: "All prescriptions cleared" };
  },

  // User Stats
  getUserStats: async (id: number) => {
    return getFromStorage('mediscan_stats', { wellness_score: 92, total_savings: 1240.50, active_prescriptions: 0 });
  }
};

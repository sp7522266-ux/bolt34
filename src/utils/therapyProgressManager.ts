interface TherapyModule {
  id: string;
  name: string;
  totalSessions: number;
  completedSessions: number;
  lastCompletedDate?: string;
  category: string;
}

interface PatientTherapyProgress {
  userId: string;
  modules: TherapyModule[];
  totalCompletedSessions: number;
  overallProgress: number;
  lastUpdated: string;
  streakDays: number;
}

const THERAPY_MODULES = [
  { id: 'cbt', name: 'CBT Journaling', category: 'cognitive', totalSessions: 30 },
  { id: 'mindfulness', name: 'Mindfulness', category: 'mindfulness', totalSessions: 30 },
  { id: 'stress', name: 'Stress Management', category: 'stress', totalSessions: 30 },
  { id: 'gratitude', name: 'Gratitude Journal', category: 'positive', totalSessions: 30 },
  { id: 'music', name: 'Relaxation Music', category: 'relaxation', totalSessions: 30 },
  { id: 'tetris', name: 'Tetris Therapy', category: 'gamified', totalSessions: 30 },
  { id: 'art', name: 'Art Therapy', category: 'creative', totalSessions: 30 },
  { id: 'exposure', name: 'Exposure Therapy', category: 'behavioral', totalSessions: 30 },
  { id: 'video', name: 'Video Therapy', category: 'educational', totalSessions: 30 },
  { id: 'act', name: 'ACT', category: 'acceptance', totalSessions: 30 },
  { id: 'mood', name: 'Mood Tracking', category: 'monitoring', totalSessions: 30 },
  { id: 'sleep', name: 'Sleep Therapy', category: 'wellness', totalSessions: 30 }
];

export const initializePatientProgress = (userId: string): PatientTherapyProgress => {
  const modules = THERAPY_MODULES.map(module => ({
    id: module.id,
    name: module.name,
    totalSessions: module.totalSessions,
    completedSessions: 0,
    category: module.category
  }));

  return {
    userId,
    modules,
    totalCompletedSessions: 0,
    overallProgress: 0,
    lastUpdated: new Date().toISOString(),
    streakDays: 0
  };
};

export const getPatientProgress = (userId: string): PatientTherapyProgress => {
  const saved = localStorage.getItem(`mindcare_therapy_progress_${userId}`);
  if (saved) {
    return JSON.parse(saved);
  }
  
  // Initialize progress for new user
  const initialProgress = initializePatientProgress(userId);
  savePatientProgress(initialProgress);
  return initialProgress;
};

export const updateTherapyCompletion = (userId: string, moduleId: string): PatientTherapyProgress => {
  const progress = getPatientProgress(userId);
  const today = new Date().toISOString().split('T')[0];
  
  // Find and update the specific module
  const moduleIndex = progress.modules.findIndex(m => m.id === moduleId);
  if (moduleIndex !== -1) {
    const module = progress.modules[moduleIndex];
    
    // Increment completed sessions (max 30)
    if (module.completedSessions < module.totalSessions) {
      module.completedSessions += 1;
      module.lastCompletedDate = today;
      
      // Update overall progress
      progress.totalCompletedSessions += 1;
      progress.overallProgress = Math.round(
        (progress.modules.reduce((sum, m) => sum + m.completedSessions, 0) / 
         progress.modules.reduce((sum, m) => sum + m.totalSessions, 0)) * 100
      );
      
      // Update streak if this is a new day
      if (progress.lastUpdated.split('T')[0] !== today) {
        const lastDate = new Date(progress.lastUpdated.split('T')[0]);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          progress.streakDays += 1;
        } else if (daysDiff > 1) {
          progress.streakDays = 1;
        }
      }
      
      progress.lastUpdated = new Date().toISOString();
      
      // Save updated progress
      savePatientProgress(progress);
      
      // Send progress to therapist analytics
      sendProgressToTherapist(progress);
      
      return progress;
    }
  }
  
  return progress;
};

export const savePatientProgress = (progress: PatientTherapyProgress): void => {
  localStorage.setItem(`mindcare_therapy_progress_${progress.userId}`, JSON.stringify(progress));
  
  // Also save to global progress tracking for therapist access
  const allProgress = JSON.parse(localStorage.getItem('mindcare_all_patient_progress') || '{}');
  allProgress[progress.userId] = progress;
  localStorage.setItem('mindcare_all_patient_progress', JSON.stringify(allProgress));
  
  // Dispatch event for real-time updates
  window.dispatchEvent(new CustomEvent('mindcare-therapy-progress-updated', { 
    detail: { userId: progress.userId, progress } 
  }));
};

export const sendProgressToTherapist = (progress: PatientTherapyProgress): void => {
  // Get patient's current therapist from bookings
  const bookings = JSON.parse(localStorage.getItem('mindcare_bookings') || '[]');
  const patientBookings = bookings.filter((b: any) => b.patientId === progress.userId);
  
  if (patientBookings.length > 0) {
    // Get the most recent therapist
    const latestBooking = patientBookings.sort((a: any, b: any) => 
      new Date(b.date || b.createdAt).getTime() - new Date(a.date || a.createdAt).getTime()
    )[0];
    
    const therapistId = latestBooking.therapistId || latestBooking.therapistName;
    
    // Create progress summary for therapist
    const progressSummary = {
      id: Date.now().toString(),
      patientId: progress.userId,
      patientName: latestBooking.patientName,
      therapistId: therapistId,
      timestamp: new Date().toISOString(),
      summary: {
        totalCompletedSessions: progress.totalCompletedSessions,
        overallProgress: progress.overallProgress,
        streakDays: progress.streakDays,
        moduleBreakdown: progress.modules.map(m => ({
          name: m.name,
          completed: m.completedSessions,
          total: m.totalSessions,
          progress: Math.round((m.completedSessions / m.totalSessions) * 100),
          lastCompleted: m.lastCompletedDate
        })),
        recentActivity: progress.modules
          .filter(m => m.lastCompletedDate)
          .sort((a, b) => new Date(b.lastCompletedDate!).getTime() - new Date(a.lastCompletedDate!).getTime())
          .slice(0, 5)
      }
    };
    
    // Save to therapist progress reports
    const therapistReports = JSON.parse(localStorage.getItem('mindcare_therapist_progress_reports') || '[]');
    therapistReports.push(progressSummary);
    
    // Keep only last 100 reports to prevent storage overflow
    if (therapistReports.length > 100) {
      therapistReports.splice(0, therapistReports.length - 100);
    }
    
    localStorage.setItem('mindcare_therapist_progress_reports', JSON.stringify(therapistReports));
    
    // Dispatch event for therapist dashboard updates
    window.dispatchEvent(new CustomEvent('mindcare-patient-progress-update', { 
      detail: { therapistId, progressSummary } 
    }));
  }
};

export const getAllPatientProgress = (): Record<string, PatientTherapyProgress> => {
  return JSON.parse(localStorage.getItem('mindcare_all_patient_progress') || '{}');
};

export const getTherapistProgressReports = (therapistId: string): any[] => {
  const allReports = JSON.parse(localStorage.getItem('mindcare_therapist_progress_reports') || '[]');
  return allReports.filter((report: any) => 
    report.therapistId === therapistId || report.therapistId === therapistId
  );
};

export const getModuleCompletionStats = (userId: string, moduleId: string): { completed: number; total: number; percentage: number } => {
  const progress = getPatientProgress(userId);
  const module = progress.modules.find(m => m.id === moduleId);
  
  if (module) {
    return {
      completed: module.completedSessions,
      total: module.totalSessions,
      percentage: Math.round((module.completedSessions / module.totalSessions) * 100)
    };
  }
  
  return { completed: 0, total: 30, percentage: 0 };
};
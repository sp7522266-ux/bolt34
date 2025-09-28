import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  X, BarChart3, TrendingUp, Heart, Brain, Target, 
  Calendar, Clock, Star, Award, Activity, Smile, 
  Meh, Frown, Download, Filter
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';
import { getPatientProgress } from '../utils/therapyProgressManager';

interface PatientAnalyticsModalProps {
  patient: any;
  isOpen: boolean;
  onClose: () => void;
}

interface PatientData {
  moodEntries: any[];
  cbtRecords: any[];
  gratitudeEntries: any[];
  stressLogs: any[];
  exposureSessions: any[];
  videoProgress: any[];
  artSessions: any[];
  mindfulnessSessions: any[];
  tetrisSessions: any[];
  musicSessions: any[];
  actValues: any[];
  sleepLogs: any[];
}

function PatientAnalyticsModal({ patient, isOpen, onClose }: PatientAnalyticsModalProps) {
  const { theme } = useTheme();
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && patient) {
      loadPatientData();
    }
  }, [isOpen, patient]);

  const loadPatientData = () => {
    setLoading(true);
    
    // Load therapy progress from new system
    const therapyProgress = getPatientProgress(patient.id);
    
    // Load all patient activity data from localStorage
    const moodEntries = JSON.parse(localStorage.getItem('mindcare_mood_entries') || '[]')
      .filter((entry: any) => entry.userId === patient.id || (!entry.userId && patient.id === '1')); // Include demo data for demo patient
    
    const cbtRecords = JSON.parse(localStorage.getItem('mindcare_cbt_records') || '[]')
      .filter((record: any) => record.userId === patient.id || (!record.userId && patient.id === '1'));
    
    const gratitudeEntries = JSON.parse(localStorage.getItem('mindcare_gratitude_entries') || '[]')
      .filter((entry: any) => entry.userId === patient.id || (!entry.userId && patient.id === '1'));
    
    const stressLogs = JSON.parse(localStorage.getItem('mindcare_stress_logs') || '[]')
      .filter((log: any) => log.userId === patient.id || (!log.userId && patient.id === '1'));
    
    const exposureSessions = JSON.parse(localStorage.getItem('mindcare_exposure_sessions') || '[]')
      .filter((session: any) => session.userId === patient.id || (!session.userId && patient.id === '1'));
    
    const videoProgress = JSON.parse(localStorage.getItem('mindcare_video_progress') || '[]')
      .filter((progress: any) => progress.userId === patient.id || (!progress.userId && patient.id === '1'));
    
    const artSessions = JSON.parse(localStorage.getItem('mindcare_art_sessions') || '[]')
      .filter((session: any) => session.userId === patient.id || (!session.userId && patient.id === '1'));
    
    const mindfulnessSessions = JSON.parse(localStorage.getItem('mindcare_mindfulness_sessions') || '[]')
      .filter((session: any) => session.userId === patient.id || (!session.userId && patient.id === '1'));
    
    const tetrisSessions = JSON.parse(localStorage.getItem('mindcare_tetris_sessions') || '[]')
      .filter((session: any) => session.userId === patient.id || (!session.userId && patient.id === '1'));
    
    const musicSessions = JSON.parse(localStorage.getItem('mindcare_music_sessions') || '[]')
      .filter((session: any) => session.userId === patient.id || (!session.userId && patient.id === '1'));
    
    const actValues = JSON.parse(localStorage.getItem('mindcare_act_values') || '[]')
      .filter((value: any) => value.userId === patient.id || (!value.userId && patient.id === '1'));
    
    const sleepLogs = JSON.parse(localStorage.getItem('mindcare_sleep_logs') || '[]')
      .filter((log: any) => log.userId === patient.id || (!log.userId && patient.id === '1'));

    setPatientData({
      moodEntries,
      cbtRecords,
      gratitudeEntries,
      stressLogs,
      exposureSessions,
      videoProgress,
      artSessions,
      mindfulnessSessions,
      tetrisSessions,
      musicSessions,
      actValues,
      sleepLogs
    });
    
    // Add therapy progress data
    setPatientData(prev => ({
      ...prev,
      therapyProgress: therapyProgress.modules
    }));
    
    setLoading(false);
  };

  const filterDataByTimeframe = (data: any[], timeframe: string) => {
    const now = new Date();
    let cutoffDate = new Date();

    switch (timeframe) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      default:
        cutoffDate.setDate(now.getDate() - 30);
    }

    return data.filter((item: any) => {
      const itemDate = new Date(item.date || item.timestamp);
      return itemDate >= cutoffDate;
    });
  };

  const generateMoodTrendData = () => {
    if (!patientData?.moodEntries) return [];
    
    const filteredEntries = filterDataByTimeframe(patientData.moodEntries, selectedTimeframe);
    return filteredEntries.map((entry: any) => ({
      date: entry.date,
      mood: (entry.moodIntensity || 5) / 2, // Convert 1-10 scale to 1-5
      energy: entry.energyLevel === 'High' ? 4 : entry.energyLevel === 'Medium' ? 3 : 2,
      stress: entry.stressLevel === 'Low' ? 2 : entry.stressLevel === 'Medium' ? 3 : 4
    }));
  };

  const generateActivityData = () => {
    if (!patientData) return [];

    const activities = [
      { name: 'Mood Tracking', count: patientData.moodEntries.length, color: '#8B5CF6' },
      { name: 'CBT Journaling', count: patientData.cbtRecords.length, color: '#3B82F6' },
      { name: 'Gratitude Practice', count: patientData.gratitudeEntries.length, color: '#10B981' },
      { name: 'Stress Management', count: patientData.stressLogs.length, color: '#F59E0B' },
      { name: 'Exposure Therapy', count: patientData.exposureSessions.length, color: '#EF4444' },
      { name: 'Video Sessions', count: patientData.videoProgress.length, color: '#EC4899' },
      { name: 'Art Therapy', count: patientData.artSessions.length, color: '#14B8A6' },
      { name: 'Mindfulness', count: patientData.mindfulnessSessions.length, color: '#F97316' }
    ].filter(activity => activity.count > 0);

    return activities;
  };

  const generateMoodDistribution = () => {
    if (!patientData?.moodEntries || patientData.moodEntries.length === 0) {
      return [
        { name: 'No Data', value: 100, color: '#6B7280' }
      ];
    }

    const moodCounts = { excellent: 0, good: 0, neutral: 0, sad: 0, verySad: 0 };
    patientData.moodEntries.forEach((entry: any) => {
      const mood = entry.moodIntensity || 5;
      if (mood >= 9) moodCounts.excellent++;
      else if (mood >= 7) moodCounts.good++;
      else if (mood >= 5) moodCounts.neutral++;
      else if (mood >= 3) moodCounts.sad++;
      else moodCounts.verySad++;
    });

    const total = patientData.moodEntries.length;
    return [
      { name: 'Excellent', value: Math.round((moodCounts.excellent / total) * 100), color: '#10B981' },
      { name: 'Good', value: Math.round((moodCounts.good / total) * 100), color: '#3B82F6' },
      { name: 'Neutral', value: Math.round((moodCounts.neutral / total) * 100), color: '#F59E0B' },
      { name: 'Sad', value: Math.round((moodCounts.sad / total) * 100), color: '#EF4444' },
      { name: 'Very Sad', value: Math.round((moodCounts.verySad / total) * 100), color: '#DC2626' }
    ].filter(item => item.value > 0);
  };

  const calculateOverallProgress = () => {
    if (!patientData) return 0;
    
    const totalActivities = Object.values(patientData).reduce((sum, activities) => 
      sum + (Array.isArray(activities) ? activities.length : 0), 0
    );
    
    // Calculate progress based on activity diversity and frequency
    const moduleTypes = Object.entries(patientData).filter(([_, activities]) => 
      Array.isArray(activities) && activities.length > 0
    ).length;
    
    const diversityScore = (moduleTypes / 12) * 50; // 50% for trying different modules
    const activityScore = Math.min(50, totalActivities * 2); // 50% for activity frequency
    
    return Math.round(diversityScore + activityScore);
  };

  const exportPatientData = () => {
    if (!patientData) return;

    const exportData = {
      patient: {
        name: patient.name,
        email: patient.email,
        id: patient.id
      },
      exportDate: new Date().toISOString(),
      timeframe: selectedTimeframe,
      summary: {
        totalActivities: Object.values(patientData).reduce((sum, activities) => 
          sum + (Array.isArray(activities) ? activities.length : 0), 0
        ),
        overallProgress: calculateOverallProgress(),
        currentMood: patientData.moodEntries.length > 0 
          ? patientData.moodEntries[patientData.moodEntries.length - 1].moodIntensity / 2 
          : 'No data',
        totalSessions: patient.totalSessions
      },
      detailedData: patientData,
      moodTrends: generateMoodTrendData(),
      activityBreakdown: generateActivityData(),
      moodDistribution: generateMoodDistribution()
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${patient.name.replace(/\s+/g, '-').toLowerCase()}-analytics-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success(`${patient.name}'s analytics data exported successfully!`);
  };

  if (!isOpen) return null;

  const moodTrendData = generateMoodTrendData();
  const activityData = generateActivityData();
  const moodDistribution = generateMoodDistribution();
  const overallProgress = calculateOverallProgress();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`max-w-6xl w-full max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`sticky top-0 p-6 border-b ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        } rounded-t-2xl`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className={`text-2xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                {patient.name} - Progress Analytics
              </h2>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Comprehensive mental health progress tracking and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={selectedTimeframe}
                onChange={(e) => setSelectedTimeframe(e.target.value)}
                className={`px-3 py-2 rounded-lg border text-sm ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'bg-white border-gray-300 text-gray-900'
                } focus:outline-none focus:ring-2 focus:ring-purple-500`}
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 3 Months</option>
              </select>
              <button
                onClick={exportPatientData}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className={`text-lg ${
              theme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}>
              Loading patient analytics...
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                {
                  title: 'Overall Progress',
                  value: `${overallProgress}%`,
                  icon: TrendingUp,
                  color: 'from-green-500 to-teal-500',
                  description: 'Based on activity diversity and frequency'
                },
                {
                  title: 'Current Mood',
                  value: patientData?.moodEntries.length > 0 
                    ? `${((patientData.moodEntries[patientData.moodEntries.length - 1]?.moodIntensity || 5) / 2).toFixed(1)}/5`
                    : 'No data',
                  icon: Heart,
                  color: 'from-pink-500 to-rose-500',
                  description: 'Latest mood entry'
                },
                {
                  title: 'Total Activities',
                  value: patientData ? Object.values(patientData).reduce((sum, activities) => 
                    sum + (Array.isArray(activities) ? activities.length : 0), 0
                  ).toString() : '0',
                  icon: Activity,
                  color: 'from-blue-500 to-cyan-500',
                  description: 'All therapy modules combined'
                },
                {
                  title: 'Active Modules',
                  value: patientData ? Object.entries(patientData).filter(([_, activities]) => 
                    Array.isArray(activities) && activities.length > 0
                  ).length.toString() : '0',
                  icon: Brain,
                  color: 'from-purple-500 to-pink-500',
                  description: 'Different therapy types used'
                }
              ].map((metric, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 rounded-xl shadow-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className={`text-sm font-medium ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {metric.title}
                      </h3>
                      <p className={`text-xl font-bold ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {metric.value}
                      </p>
                    </div>
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${metric.color} flex items-center justify-center`}>
                      <metric.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                  }`}>
                    {metric.description}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mood Trends */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Mood Trends ({selectedTimeframe})
                </h3>
                {moodTrendData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={moodTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="date" 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        fontSize={12}
                        tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        fontSize={12}
                        domain={[1, 5]}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          color: theme === 'dark' ? '#FFFFFF' : '#000000'
                        }}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="mood" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        name="Mood"
                        dot={{ fill: '#8B5CF6', strokeWidth: 1, r: 4 }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="energy" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        name="Energy"
                        dot={{ fill: '#10B981', strokeWidth: 1, r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Heart className={`w-12 h-12 mx-auto mb-4 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No mood data available
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Patient hasn't started mood tracking yet
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Activity Breakdown */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Therapy Module Usage
                </h3>
                {activityData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={activityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#E5E7EB'} />
                      <XAxis 
                        dataKey="name" 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        fontSize={10}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis 
                        stroke={theme === 'dark' ? '#9CA3AF' : '#6B7280'}
                        fontSize={12}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          border: 'none',
                          borderRadius: '8px',
                          color: theme === 'dark' ? '#FFFFFF' : '#000000'
                        }}
                      />
                      <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-64 flex items-center justify-center">
                    <div className="text-center">
                      <Brain className={`w-12 h-12 mx-auto mb-4 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-lg ${
                        theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        No therapy activities yet
                      </p>
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                      }`}>
                        Patient hasn't started any therapy modules
                      </p>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Mood Distribution & Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Mood Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Mood Distribution
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={moodDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        color: theme === 'dark' ? '#FFFFFF' : '#000000'
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>

              {/* Recent Activity Timeline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className={`p-4 rounded-xl shadow-lg ${
                  theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                }`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  Recent Activity Timeline
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {patientData && (() => {
                    // Combine all activities with timestamps
                    const allActivities = [
                      ...patientData.moodEntries.map((entry: any) => ({
                        type: 'Mood Tracking',
                        date: entry.date,
                        icon: Heart,
                        color: 'text-pink-500',
                        details: `Mood: ${(entry.moodIntensity / 2).toFixed(1)}/5`
                      })),
                      ...patientData.cbtRecords.map((record: any) => ({
                        type: 'CBT Journaling',
                        date: record.date,
                        icon: Brain,
                        color: 'text-blue-500',
                        details: `Thought record completed`
                      })),
                      ...patientData.gratitudeEntries.map((entry: any) => ({
                        type: 'Gratitude Practice',
                        date: entry.date,
                        icon: Star,
                        color: 'text-yellow-500',
                        details: `${entry.entries?.length || 1} gratitude entries`
                      })),
                      ...patientData.stressLogs.map((log: any) => ({
                        type: 'Stress Management',
                        date: log.date,
                        icon: Target,
                        color: 'text-orange-500',
                        details: `Stress level: ${log.stressLevel}/10`
                      })),
                      ...patientData.exposureSessions.map((session: any) => ({
                        type: 'Exposure Therapy',
                        date: session.date,
                        icon: Award,
                        color: 'text-red-500',
                        details: `Anxiety reduced by ${session.anxietyBefore - session.anxietyAfter} points`
                      })),
                      ...patientData.videoProgress.map((progress: any) => ({
                        type: 'Video Therapy',
                        date: new Date(progress.timestamp || Date.now()).toISOString().split('T')[0],
                        icon: BarChart3,
                        color: 'text-purple-500',
                        details: 'Video session completed'
                      }))
                    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                     .slice(0, 8);

                    return allActivities.length > 0 ? allActivities.map((activity, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.1 }}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-600 flex items-center justify-center`}>
                          <activity.icon className={`w-4 h-4 ${activity.color}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {activity.type}
                          </p>
                          <p className={`text-sm ${
                            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                          }`}>
                            {activity.details}
                          </p>
                        </div>
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          {new Date(activity.date).toLocaleDateString()}
                        </span>
                      </motion.div>
                    )) : (
                      <div className="text-center py-8">
                        <Activity className={`w-12 h-12 mx-auto mb-4 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`} />
                        <p className={`text-lg ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          No recent activity
                        </p>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-500' : 'text-gray-500'
                        }`}>
                          Patient hasn't been active recently
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </motion.div>
            </div>

            {/* Detailed Module Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Therapy Module Progress (0/30 Sessions Each)
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patientData?.therapyProgress && patientData.therapyProgress.map((module: any, index: number) => {
                  const progress = Math.min(100, (module.completedSessions / module.totalSessions) * 100);
                  const moduleIcons: any = {
                    'CBT Journaling': Brain,
                    'Mindfulness': Heart,
                    'Stress Management': Target,
                    'Gratitude Journal': Star,
                    'Relaxation Music': BarChart3,
                    'Tetris Therapy': Award,
                    'Art Therapy': Heart,
                    'Exposure Therapy': Target,
                    'Video Therapy': BarChart3,
                    'ACT': Brain,
                    'Mood Tracking': Heart,
                    'Sleep Therapy': BarChart3
                  };
                  const moduleColors: any = {
                    'CBT Journaling': 'from-blue-500 to-cyan-500',
                    'Mindfulness': 'from-purple-500 to-pink-500',
                    'Stress Management': 'from-orange-500 to-red-500',
                    'Gratitude Journal': 'from-yellow-500 to-orange-500',
                    'Relaxation Music': 'from-green-500 to-teal-500',
                    'Tetris Therapy': 'from-cyan-500 to-blue-500',
                    'Art Therapy': 'from-pink-500 to-purple-500',
                    'Exposure Therapy': 'from-red-500 to-pink-500',
                    'Video Therapy': 'from-purple-500 to-pink-500',
                    'ACT': 'from-teal-500 to-cyan-500',
                    'Mood Tracking': 'from-pink-500 to-rose-500',
                    'Sleep Therapy': 'from-indigo-500 to-purple-500'
                  };
                  const ModuleIcon = moduleIcons[module.name] || Heart;
                  const moduleColor = moduleColors[module.name] || 'from-gray-500 to-gray-600';
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                      className={`p-4 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${moduleColor} flex items-center justify-center`}>
                            <ModuleIcon className="w-4 h-4 text-white" />
                          </div>
                          <h4 className={`font-medium ${
                            theme === 'dark' ? 'text-white' : 'text-gray-800'
                          }`}>
                            {module.name}
                          </h4>
                        </div>
                        <span className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {module.completedSessions}/{module.totalSessions}
                        </span>
                      </div>
                      <div className={`w-full h-2 rounded-full ${
                        theme === 'dark' ? 'bg-gray-600' : 'bg-gray-200'
                      }`}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${moduleColor} transition-all duration-500`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {progress.toFixed(1)}% complete
                        </span>
                        {progress === 100 && (
                          <div className="flex items-center space-x-1 text-green-500">
                            <Award className="w-3 h-3" />
                            <span className="text-xs font-medium">Completed</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                }) || <p className="text-gray-500">No therapy progress data available</p>}
              </div>
            </motion.div>

            {/* Insights & Recommendations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className={`p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
              }`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                Clinical Insights & Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-green-900/20 border border-green-800' : 'bg-green-50 border border-green-200'
                }`}>
                  <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">Positive Patterns</h4>
                  <ul className="space-y-1 text-sm">
                    {patientData?.moodEntries.length > 0 && (
                      <li className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        • Consistent mood tracking shows self-awareness
                      </li>
                    )}
                    {patientData?.gratitudeEntries.length > 0 && (
                      <li className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        • Regular gratitude practice indicates positive mindset
                      </li>
                    )}
                    {patientData?.cbtRecords.length > 0 && (
                      <li className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        • Engaging with CBT shows commitment to cognitive change
                      </li>
                    )}
                    {overallProgress > 50 && (
                      <li className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'}`}>
                        • High engagement across multiple therapy modules
                      </li>
                    )}
                  </ul>
                </div>
                <div className={`p-4 rounded-lg ${
                  theme === 'dark' ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'
                }`}>
                  <h4 className="font-semibold text-blue-600 dark:text-blue-400 mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm">
                    {patientData?.moodEntries.length === 0 && (
                      <li className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        • Encourage daily mood tracking for better insights
                      </li>
                    )}
                    {patientData?.stressLogs.length === 0 && (
                      <li className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        • Consider introducing stress management techniques
                      </li>
                    )}
                    {overallProgress < 30 && (
                      <li className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        • Explore barriers to therapy engagement
                      </li>
                    )}
                    {patient.totalSessions < 3 && (
                      <li className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'}`}>
                        • Schedule more frequent sessions for better support
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default PatientAnalyticsModal;
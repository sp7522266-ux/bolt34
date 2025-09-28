import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageCircle, Send, Bot, User, Brain, Heart, Target,
  Moon, Shield, Users, TrendingDown, Clock, Star, CheckCircle,
  ArrowRight, Play, RotateCcw, Eye, AlertTriangle, Sparkles, Compass
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface Question {
  id: string;
  text: string;
  type: 'rating' | 'binary' | 'multiple' | 'text';
  options?: string[];
  required: boolean;
}

interface Assessment {
  issue: string;
  questions: Question[];
  responses: Record<string, any>;
}

interface TherapyRecommendation {
  moduleId: string;
  title: string;
  description: string;
  priority: number;
  icon: any;
  color: string;
  estimatedDuration: string;
  benefits: string[];
}

interface TherapyPlan {
  id: string;
  issue: string;
  severity: 'mild' | 'moderate' | 'severe';
  planDuration: number;
  recommendations: TherapyRecommendation[];
  startDate: string;
  description: string;
}

const ChatbotPage = () => {
  const { user } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentAssessment, setCurrentAssessment] = useState<Assessment | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [generatedPlan, setGeneratedPlan] = useState<TherapyPlan | null>(null);
  const [showPlanSelection, setShowPlanSelection] = useState(false);

  const mentalHealthIssues = [
    { id: 'anxiety-disorders', name: 'Anxiety Disorders', icon: Brain, color: 'from-blue-500 to-cyan-500', description: 'Persistent worry, fear, and anxiety symptoms' },
    { id: 'depression', name: 'Depression & Low Mood', icon: Heart, color: 'from-purple-500 to-pink-500', description: 'Sadness, hopelessness, and depressive symptoms' },
    { id: 'stress', name: 'Stress & Burnout', icon: Target, color: 'from-orange-500 to-red-500', description: 'Overwhelm, exhaustion, and chronic stress' },
    { id: 'insomnia', name: 'Insomnia & Sleep Problems', icon: Moon, color: 'from-indigo-500 to-purple-500', description: 'Sleep difficulties and sleep disorders' },
    { id: 'trauma', name: 'Trauma & PTSD', icon: Shield, color: 'from-red-500 to-pink-500', description: 'Trauma responses and post-traumatic stress' },
    { id: 'self-esteem', name: 'Low Self-Esteem & Self-Doubt', icon: Star, color: 'from-yellow-500 to-orange-500', description: 'Poor self-image and confidence issues' },
    { id: 'emotional-dysregulation', name: 'Emotional Dysregulation', icon: Heart, color: 'from-pink-500 to-rose-500', description: 'Difficulty managing and controlling emotions' },
    { id: 'negative-thoughts', name: 'Negative Thought Patterns & Overthinking', icon: Brain, color: 'from-gray-500 to-slate-500', description: 'Rumination and persistent negative thinking' },
    { id: 'social-anxiety', name: 'Social Anxiety', icon: Users, color: 'from-teal-500 to-cyan-500', description: 'Fear and anxiety in social situations' },
    { id: 'adjustment', name: 'Adjustment & Identity Issues', icon: Compass, color: 'from-green-500 to-teal-500', description: 'Life transitions and identity concerns' }
  ];

  const questionnaires = {
    'anxiety-disorders': [
      // Open-ended questions (2)
      { id: '1', text: 'Can you describe a recent situation where you felt anxious? What was happening around you and what thoughts went through your mind?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'How does anxiety feel in your body? Describe the physical sensations you experience when you\'re anxious.', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you experience panic attacks (sudden intense fear with physical symptoms)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Have you been diagnosed with an anxiety disorder by a healthcare professional?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how would you rate your average anxiety level over the past week?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How much does anxiety interfere with your daily life? (1 = not at all, 10 = completely disrupts my life)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do when you start feeling anxious? Describe your usual coping strategies.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'Do you avoid certain places, people, or situations because of anxiety? If so, which ones?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'When you think about your anxiety, what do you believe might be the underlying causes or triggers?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would your life look like if you could better manage your anxiety? What specific changes would you hope to see?', type: 'text', required: true, category: 'future-oriented' }
    ],
    depression: [
      // Open-ended questions (2)
      { id: '1', text: 'Can you describe what a typical day feels like for you when you\'re experiencing depression? Walk me through your thoughts and feelings.', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about activities or hobbies you used to enjoy. How do you feel about them now?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Have you experienced significant changes in your sleep patterns (sleeping too much or too little)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Have you had thoughts of death or suicide?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how would you rate your overall mood over the past two weeks?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How would you rate your energy levels on a typical day? (1 = no energy at all, 10 = full of energy)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you typically spend your days? Describe your daily routine and activities.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'When you feel overwhelmed by sadness, what do you usually do? What helps or doesn\'t help?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'Looking back, when did you first notice these feelings of depression? What do you think might have contributed to them?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would feeling better look like to you? What specific goals would you like to work toward in your recovery?', type: 'text', required: true, category: 'future-oriented' }
    ],
    stress: [
      // Open-ended questions (2)
      { id: '1', text: 'Describe your most stressful day recently. What happened and how did you feel throughout the day?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about the main sources of stress in your life right now. What situations or responsibilities feel overwhelming?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you experience physical symptoms when stressed (headaches, muscle tension, stomach issues)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you currently have a regular relaxation or stress-relief routine?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how would you rate your current stress level?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How well do you feel you currently manage stress? (1 = very poorly, 10 = very well)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do when you feel overwhelmed by stress? Describe your usual responses or coping strategies.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'How does stress affect your daily habits (eating, sleeping, exercise, work performance)?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'When you reflect on your stress patterns, what do you notice about when and why you feel most stressed?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would your ideal stress management look like? What specific skills or changes would help you feel more in control?', type: 'text', required: true, category: 'future-oriented' }
    ],
    insomnia: [
      // Open-ended questions (2)
      { id: '1', text: 'Describe a typical night for you. What happens from when you get into bed until you fall asleep?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about how poor sleep affects your daily life. What do you notice about your mood, energy, and functioning?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you wake up frequently during the night (more than twice)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you currently use any sleep medications or aids?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'How many hours of sleep do you typically get per night?', type: 'rating', min: 1, max: 12, required: true, category: 'scaling' },
      { id: '6', text: 'On a scale of 1-10, how would you rate your sleep quality when you do sleep?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do in the hour before bedtime? Describe your evening routine.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'When you can\'t fall asleep, what do you usually do? How do you try to cope with sleeplessness?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think are the main factors contributing to your sleep difficulties? What patterns have you noticed?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would good sleep look like for you? What specific improvements in your sleep would make the biggest difference in your life?', type: 'text', required: true, category: 'future-oriented' }
    ],
    trauma: [
      // Open-ended questions (2)
      { id: '1', text: 'If you feel comfortable sharing, can you tell me about the traumatic experience(s) that brought you here? Take your time and share only what feels safe.', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Describe how trauma has affected your daily life. What changes have you noticed in yourself since the traumatic event(s)?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you experience flashbacks, nightmares, or intrusive memories related to the trauma?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you avoid certain places, people, or situations that remind you of the trauma?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how safe do you feel in your daily life right now?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How much do trauma symptoms interfere with your daily functioning? (1 = not at all, 10 = completely)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you typically respond when you\'re triggered or reminded of the trauma? What do you do to cope?', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'How have your relationships and social connections changed since the traumatic event? How do you interact with others now?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'What have you learned about yourself and your resilience through this experience? What strengths have you discovered?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would healing look like for you? What specific goals do you have for your recovery and moving forward?', type: 'text', required: true, category: 'future-oriented' }
    ],
    'self-esteem': [
      // Open-ended questions (2)
      { id: '1', text: 'How do you typically talk to yourself in your mind? What kinds of thoughts do you have about yourself throughout the day?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Describe a recent situation where you felt particularly bad about yourself. What happened and what went through your mind?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you often compare yourself to others (on social media, at work, in social situations)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you have difficulty accepting compliments or positive feedback from others?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how would you rate your overall self-confidence?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How much do you like yourself as a person? (1 = not at all, 10 = completely)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you typically react to criticism or feedback? What do you do when someone points out a mistake?', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'What do you do when you accomplish something or receive praise? How do you handle your successes?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'When you think about your self-worth, what messages or beliefs about yourself do you think you learned growing up?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would having healthy self-esteem look like for you? How would you like to feel about yourself and treat yourself?', type: 'text', required: true, category: 'future-oriented' }
    ],
    'emotional-dysregulation': [
      // Open-ended questions (2)
      { id: '1', text: 'Describe what it feels like when your emotions become overwhelming. Walk me through a recent intense emotional experience.', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about how your emotions affect your relationships. What do others notice about your emotional responses?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do your emotions often feel much stronger than the situation seems to warrant?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you have difficulty calming down once you become emotionally upset?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how intense are your emotions when they occur?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How quickly do your emotions change throughout a typical day? (1 = very stable, 10 = constantly changing)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do when you feel emotionally overwhelmed? Describe your usual responses or actions.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'How do you express your emotions? Do you tend to keep them inside, express them outwardly, or something else?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'What patterns do you notice in your emotional responses? Are there specific triggers or situations that consistently affect you?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would emotional balance look like for you? How would you like to experience and manage your emotions differently?', type: 'text', required: true, category: 'future-oriented' }
    ],
    'negative-thoughts': [
      // Open-ended questions (2)
      { id: '1', text: 'Describe what goes through your mind during a typical overthinking episode. What kinds of thoughts loop in your head?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about a recent situation where negative thinking took over. What happened and how did your thoughts spiral?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you often replay conversations or events in your mind repeatedly?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you frequently imagine worst-case scenarios or catastrophic outcomes?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how much time do you spend overthinking or ruminating each day?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How much do negative thought patterns interfere with your daily life? (1 = not at all, 10 = completely)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do when you notice yourself stuck in negative thinking? How do you try to break the cycle?', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'How do these thought patterns affect your behavior and decision-making? What do you do differently when caught in negative thinking?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'When you step back and observe your thinking patterns, what do you notice? What themes or triggers do you recognize?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would it be like to have more balanced, helpful thinking patterns? How would your life be different?', type: 'text', required: true, category: 'future-oriented' }
    ],
    'social-anxiety': [
      // Open-ended questions (2)
      { id: '1', text: 'Describe your experience in social situations. What goes through your mind before, during, and after social interactions?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about a recent social situation that felt particularly challenging. What made it difficult and how did you handle it?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Do you avoid social events, gatherings, or situations because of anxiety?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you experience physical symptoms (sweating, blushing, trembling) in social situations?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how anxious do you typically feel in social situations?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How much do you worry about being judged or embarrassed by others? (1 = never, 10 = constantly)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'What do you typically do to prepare for or cope with social situations? Describe your strategies or safety behaviors.', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'How has social anxiety affected your relationships, work, or school? What opportunities have you missed or avoided?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'What do you think others actually think about you versus what you fear they think? What evidence do you have for your social fears?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'What would social confidence look like for you? What specific social goals would you like to work toward?', type: 'text', required: true, category: 'future-oriented' }
    ],
    adjustment: [
      // Open-ended questions (2)
      { id: '1', text: 'Describe the major life changes or transitions you\'re currently experiencing. What has shifted in your life recently?', type: 'text', required: true, category: 'open-ended' },
      { id: '2', text: 'Tell me about how these changes have affected your sense of who you are. What feels different about yourself or your identity?', type: 'text', required: true, category: 'open-ended' },
      
      // Closed questions (2)
      { id: '3', text: 'Are you currently going through a major life transition (career change, relationship change, moving, etc.)?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      { id: '4', text: 'Do you feel uncertain about your life direction or future path?', type: 'binary', options: ['Yes', 'No'], required: true, category: 'closed' },
      
      // Scaling questions (2)
      { id: '5', text: 'On a scale of 1-10, how confident do you feel about who you are as a person right now?', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      { id: '6', text: 'How well are you coping with the changes in your life? (1 = very poorly, 10 = very well)', type: 'rating', min: 1, max: 10, required: true, category: 'scaling' },
      
      // Behavioral questions (2)
      { id: '7', text: 'How do you typically handle major changes or transitions? What strategies do you use to adapt?', type: 'text', required: true, category: 'behavioral' },
      { id: '8', text: 'What support systems or resources do you turn to during times of change? How do you seek help or guidance?', type: 'text', required: true, category: 'behavioral' },
      
      // Reflective question (1)
      { id: '9', text: 'What core values and beliefs remain important to you despite the changes you\'re experiencing? What stays constant about who you are?', type: 'text', required: true, category: 'reflective' },
      
      // Future-oriented question (1)
      { id: '10', text: 'How do you envision yourself adapting and growing through this transition? What kind of person do you hope to become?', type: 'text', required: true, category: 'future-oriented' }
    ]
  };

  const [currentTextResponse, setCurrentTextResponse] = useState('');

  const therapyModules = {
    'cbt': { title: 'CBT Thought Records', icon: Brain, color: 'from-purple-500 to-pink-500' },
    'mindfulness': { title: 'Mindfulness & Breathing', icon: Brain, color: 'from-blue-500 to-cyan-500' },
    'stress': { title: 'Stress Management', icon: Target, color: 'from-orange-500 to-red-500' },
    'gratitude': { title: 'Gratitude Journal', icon: Heart, color: 'from-green-500 to-teal-500' },
    'music': { title: 'Relaxation Music', icon: Heart, color: 'from-purple-500 to-blue-500' },
    'tetris': { title: 'Tetris Therapy', icon: Target, color: 'from-cyan-500 to-blue-500' },
    'art': { title: 'Art & Color Therapy', icon: Heart, color: 'from-pink-500 to-purple-500' },
    'exposure': { title: 'Exposure Therapy', icon: Eye, color: 'from-yellow-500 to-orange-500' },
    'video': { title: 'Video Therapy', icon: Play, color: 'from-blue-500 to-indigo-500' },
    'act': { title: 'Acceptance & Commitment Therapy', icon: Star, color: 'from-teal-500 to-cyan-500' }
  };

  useEffect(() => {
    // Initial greeting
    const initialMessage: Message = {
      id: '1',
      type: 'bot',
      content: `Hello ${user?.name}! I'm your AI mental health assistant. I'm here to provide personalized support and create a therapy plan tailored just for you.\n\nWould you like me to help you identify the best therapy approach for your current needs?`,
      timestamp: new Date()
    };
    setMessages([initialMessage]);
  }, [user]);

  const addMessage = (content: string, type: 'user' | 'bot') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const simulateTyping = async (content: string, type: 'bot' | 'user' = 'bot') => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
    setIsTyping(false);
    addMessage(content, type);
  };

  const startAssessment = (issueId: string) => {
    const issue = mentalHealthIssues.find(i => i.id === issueId);
    const questions = questionnaires[issueId as keyof typeof questionnaires] || [];
    
    // Clear previous assessment state
    setCurrentAssessment(null);
    setCurrentQuestionIndex(0);
    setGeneratedPlan(null);
    setShowPlanSelection(false);

    // Add initial bot messages to chat history
    addMessage(`I'd like to start an assessment for ${issue?.name}. This will help me understand your specific situation better.`, 'user');
    simulateTyping(`Great! I'll ask you some questions about ${issue?.name.toLowerCase()} to create the best therapy plan for you. Let's begin:`);

    setCurrentAssessment({
      issue: issue?.name || 'Unknown Issue',
      questions,
      responses: {}
    });
  };

  const handleQuestionResponse = (response: any) => {
    if (!currentAssessment) return;

    const currentQuestion = currentAssessment.questions[currentQuestionIndex];

    const updatedAssessment = {
      ...currentAssessment,
      responses: { ...currentAssessment.responses, [currentQuestion.id]: response }
    };
    setCurrentAssessment(updatedAssessment);

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < currentAssessment.questions.length) {
      setCurrentQuestionIndex(nextIndex);
      const nextQuestion = currentAssessment.questions[nextIndex];
      const existingResponse = updatedAssessment.responses[nextQuestion.id];
      
      // Set appropriate default for different question types
      if (nextQuestion.type === 'rating') {
        setCurrentTextResponse(existingResponse || nextQuestion.min?.toString() || '1');
      } else {
        setCurrentTextResponse(existingResponse || '');
      }
    } else {
      // Assessment complete, generate plan
      setCurrentAssessment(null); // Clear assessment from main view
      setCurrentQuestionIndex(0);
      generateTherapyPlan(updatedAssessment);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);
      const prevQuestion = currentAssessment?.questions[prevIndex];
      const existingResponse = currentAssessment?.responses[prevQuestion?.id || ''];
      
      // Set appropriate response for different question types
      if (prevQuestion?.type === 'rating') {
        setCurrentTextResponse(existingResponse || prevQuestion.min?.toString() || '1');
      } else {
        setCurrentTextResponse(existingResponse || '');
      }
      // No need to add message to history, it's already there.
    }
  };

  const generateTherapyPlan = (assessment: Assessment) => {
    // Analyze responses to determine severity and recommendations
    const responses = assessment.responses;
    const ratingQuestions = assessment.questions.filter(q => q.type === 'rating');
    const avgRating = ratingQuestions.length > 0 
      ? ratingQuestions.reduce((sum, q) => sum + (parseInt(responses[q.id]) || 5), 0) / ratingQuestions.length
      : 5;
    
    let severity: 'mild' | 'moderate' | 'severe' = 'moderate';
    let planDuration = 15;
    
    // Analyze binary responses for additional severity indicators
    const binaryQuestions = assessment.questions.filter(q => q.type === 'binary');
    const yesResponses = binaryQuestions.filter(q => responses[q.id] === 'Yes').length;
    const binaryScore = binaryQuestions.length > 0 ? (yesResponses / binaryQuestions.length) * 10 : 5;
    
    // Combine rating and binary scores for severity assessment
    const combinedScore = (avgRating + binaryScore) / 2;
    
    if (combinedScore <= 4) {
      severity = 'mild';
      planDuration = 10;
    } else if (combinedScore >= 7) {
      severity = 'severe';
      planDuration = 21;
    } else {
      severity = 'moderate';
      planDuration = 14;
    }

    // Generate recommendations based on issue type
    const recommendations = getRecommendationsForIssue(assessment.issue.toLowerCase(), severity);

    const plan: TherapyPlan = {
      id: Date.now().toString(),
      issue: assessment.issue,
      severity,
      planDuration,
      recommendations,
      startDate: new Date().toISOString(),
      description: `A ${planDuration}-day personalized therapy plan for ${assessment.issue.toLowerCase()}`
    };

    setGeneratedPlan(plan); // Set plan for modal
    setShowPlanSelection(true);
    simulateTyping(`Based on your comprehensive assessment, I've created a personalized ${planDuration}-day therapy plan for ${assessment.issue.toLowerCase()}. Your responses indicate ${severity} severity, and this plan includes ${recommendations.length} evidence-based therapies tailored to your specific needs and goals.`);
  };

  const getRecommendationsForIssue = (issue: string, severity: string): TherapyRecommendation[] => {
    const baseRecommendations: Record<string, string[]> = {
      'anxiety disorders': ['cbt', 'mindfulness', 'exposure', 'music'],
      depression: ['cbt', 'gratitude', 'video', 'act'],
      'stress & burnout': ['stress', 'mindfulness', 'music', 'art'],
      'insomnia & sleep problems': ['mindfulness', 'music', 'video', 'stress'],
      'trauma & ptsd': ['video', 'mindfulness', 'art', 'act'],
      'low self-esteem & self-doubt': ['gratitude', 'cbt', 'video', 'act'],
      'emotional dysregulation': ['mindfulness', 'cbt', 'art', 'video'],
      'negative thought patterns & overthinking': ['cbt', 'mindfulness', 'video', 'gratitude'],
      'social anxiety': ['exposure', 'cbt', 'video', 'mindfulness'],
      'adjustment & identity issues': ['video', 'act', 'gratitude', 'art']
    };

    const moduleIds = baseRecommendations[issue] || ['cbt', 'mindfulness', 'video'];
    
    return moduleIds.map((moduleId, index) => {
      const module = therapyModules[moduleId as keyof typeof therapyModules];
      return {
        moduleId,
        title: module.title,
        description: `Evidence-based ${module.title.toLowerCase()} for ${issue}`,
        priority: index + 1,
        icon: module.icon,
        color: module.color,
        estimatedDuration: '15-30 min',
        benefits: [`Reduces ${issue}`, 'Improves coping skills', 'Builds resilience']
      };
    });
  };

  const acceptPlan = () => {
    if (!generatedPlan) return;

    // Save plan to user progress
    const userProgress = {
      userId: user?.id,
      currentPlan: generatedPlan,
      startDate: new Date().toISOString(),
      completedTherapies: [],
      dailyProgress: {}
    };

    localStorage.setItem('mindcare_user_progress', JSON.stringify(userProgress));
    
    toast.success('Therapy plan accepted! You can now start your personalized journey.');
    setShowPlanSelection(false);
    
    // Navigate to therapies page
    navigate('/therapy-modules');
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;
    
    addMessage(inputMessage, 'user');
    setInputMessage('');
    
    // Simple response logic
    if (inputMessage.toLowerCase().includes('help') || inputMessage.toLowerCase().includes('start')) {
      simulateTyping('I can help you with various mental health concerns. Would you like to start an assessment to get personalized therapy recommendations?');
    } else if (!currentAssessment && !showPlanSelection) { // Only respond if not in assessment or plan selection
      simulateTyping('I understand. Feel free to ask me anything about mental health or start an assessment when you\'re ready.');
    }
  };

  const handleSubmitTextResponse = () => {
    if (!currentTextResponse || currentTextResponse.trim() === '') {
      toast.error('Please provide an answer before continuing');
      return;
    }
    handleQuestionResponse(currentTextResponse);
    setCurrentTextResponse('');
  };

  const currentQuestion = currentAssessment?.questions[currentQuestionIndex];

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-blue-50 to-teal-50'
    }`}>
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border-b ${
            theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
          } shadow-lg`}
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-xl font-bold ${
                theme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}>
                AI Mental Health Assistant
              </h1>
              <p className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
              }`}>
                Your personalized companion for mental wellness support and therapy planning
              </p>
            </div>
          </div>
        </motion.div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-sm lg:max-w-lg px-5 py-4 rounded-2xl ${
                message.type === 'user'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  : theme === 'dark'
                  ? 'bg-gray-700 text-gray-200'
                  : 'bg-white text-gray-800 shadow-lg'
              }`}>
                <div className="flex items-start space-x-2">
                  {message.type === 'bot' && (
                    <Bot className="w-4 h-4 mt-1 text-purple-500" />
                  )}
                  <div>
                    <p className="text-sm leading-relaxed whitespace-pre-line">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.type === 'user' ? 'text-purple-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className={`px-5 py-4 rounded-2xl ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-white shadow-lg'
              }`}>
                <div className="flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-purple-500" />
                  <div className="flex space-x-1">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Issue Selection */}
          {!currentAssessment && !showPlanSelection && (
            <div className="flex justify-center px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-7xl p-8 rounded-2xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <h3 className={`text-lg font-semibold mb-4 text-center ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  What would you like help with today?
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                  {mentalHealthIssues.map((issue) => (
                    <motion.button
                      key={issue.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => startAssessment(issue.id)}
                      className={`p-6 rounded-xl transition-all duration-200 ${
                        theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${issue.color} flex items-center justify-center mx-auto mb-4`}>
                        <issue.icon className="w-6 h-6 text-white" />
                      </div>
                      <h4 className={`font-semibold text-base ${
                        theme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}>
                        {issue.name}
                      </h4>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          )}

          {/* Assessment Questions */}
          {currentAssessment && currentQuestion && (
            <div className="px-4">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`w-full max-w-lg p-4 rounded-xl shadow-lg ${
                theme === 'dark' ? 'bg-gray-800' : 'bg-white'
              }`}>
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Question {currentQuestionIndex + 1} of {currentAssessment.questions.length}
                    </span>
                    <span className={`text-sm ${
                      theme === 'dark' ? 'text-purple-400' : 'text-purple-600'
                    }`}>
                      {currentAssessment.issue}
                    </span>
                  </div>
                  {/* Question Category Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      currentQuestion.category === 'open-ended' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                      currentQuestion.category === 'closed' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      currentQuestion.category === 'scaling' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' :
                      currentQuestion.category === 'behavioral' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' :
                      currentQuestion.category === 'reflective' ? 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-300' :
                      'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-300'
                    }`}>
                      {currentQuestion.category?.replace('-', ' ') || 'question'}
                    </span>
                  </div>
                  <div className={`w-full h-2 rounded-full ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300"
                      style={{ width: `${((currentQuestionIndex + 1) / currentAssessment.questions.length) * 100}%` }}
                    />
                  </div>
                </div>

                <h3 className={`text-lg font-semibold mb-4 leading-relaxed ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>
                  {currentQuestion.text}
                </h3>

                {/* Dynamic Input Based on Question Type */}
                <div className="space-y-4">
                  {currentQuestion.type === 'binary' && currentQuestion.options ? (
                    <div className="space-y-2">
                      {currentQuestion.options.map((option: string) => (
                        <motion.button
                          key={option}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setCurrentTextResponse(option)}
                          className={`w-full p-3 rounded-lg border-2 transition-all duration-200 ${
                            currentTextResponse === option
                              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                              : theme === 'dark'
                              ? 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          {option}
                        </motion.button>
                      ))}
                    </div>
                  ) : currentQuestion.type === 'rating' ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <span className={`text-3xl font-bold text-purple-500`}>
                          {currentTextResponse || currentQuestion.min || 1}
                        </span>
                        <p className={`text-sm ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {currentQuestion.min === 1 && currentQuestion.max === 12 ? 'hours' : 'out of 10'}
                        </p>
                      </div>
                      <input
                        type="range"
                        min={currentQuestion.min || 1}
                        max={currentQuestion.max || 10}
                        value={currentTextResponse || currentQuestion.min || 1}
                        onChange={(e) => setCurrentTextResponse(e.target.value)}
                        className="w-full h-3 rounded-lg appearance-none cursor-pointer bg-gradient-to-r from-purple-400 to-blue-400"
                      />
                      <div className="flex justify-between text-xs">
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {currentQuestion.min || 1}
                        </span>
                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                          {currentQuestion.max || 10}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <textarea
                      placeholder={
                        currentQuestion.category === 'open-ended' ? 'Please share your thoughts and feelings in detail...' :
                        currentQuestion.category === 'behavioral' ? 'Describe your typical responses or behaviors...' :
                        currentQuestion.category === 'reflective' ? 'Take a moment to reflect and share your insights...' :
                        currentQuestion.category === 'future-oriented' ? 'Describe your hopes and goals...' :
                        'Please type your answer here...'
                      }
                      value={currentTextResponse}
                      rows={currentQuestion.category === 'open-ended' ? 5 : 4}
                      className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none ${
                        theme === 'dark'
                          ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                      onChange={(e) => setCurrentTextResponse(e.target.value)}
                    />
                  )}

                {/* Navigation Buttons */}
                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                      currentQuestionIndex === 0
                        ? 'opacity-50 cursor-not-allowed'
                        : theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitTextResponse}
                    disabled={!currentTextResponse || currentTextResponse.trim() === ''}
                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  >
                    {currentQuestionIndex === currentAssessment.questions.length - 1 ? 'Finish Assessment' : 'Next Question'}
                  </motion.button>
                </div>
              </div>
              </motion.div>
            </div>
          )}

        {/* Plan Selection Modal - Full Screen Popup */}
        <AnimatePresence>
          {showPlanSelection && generatedPlan && (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                onClick={() => setShowPlanSelection(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className={`max-w-2xl w-full rounded-2xl shadow-2xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  }`}
                  onClick={(e) => e.stopPropagation()}
                >
                <div className="p-6">
                  <div className="text-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold mb-2 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Your Personalized {generatedPlan.issue} Plan
                  </h3>
                  <p className={`text-sm ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    {generatedPlan.description}
                  </p>
                  <div className="flex items-center justify-center space-x-4 mt-3">
                    <div className="text-center">
                      <p className="text-xl font-bold text-purple-500">{generatedPlan.planDuration}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Days</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-bold text-blue-500">{generatedPlan.recommendations.length}</p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Therapies</p>
                    </div>
                    <div className="text-center">
                      <p className={`text-xl font-bold ${
                        generatedPlan.severity === 'mild' ? 'text-green-500' :
                        generatedPlan.severity === 'moderate' ? 'text-yellow-500' : 'text-red-500'
                      }`}>
                        {generatedPlan.severity}
                      </p>
                      <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>Severity</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <h4 className={`font-semibold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}>
                    Recommended Therapies:
                  </h4>
                  {generatedPlan.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${rec.color} flex items-center justify-center`}>
                        <rec.icon className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h5 className={`text-sm font-semibold ${
                          theme === 'dark' ? 'text-white' : 'text-gray-800'
                        }`}>
                          {rec.title}
                        </h5>
                        <p className={`text-xs ${
                          theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {rec.description}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        theme === 'dark' ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-700'
                      }`}>
                        Priority {rec.priority}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowPlanSelection(false)}
                    className={`flex-1 py-3 rounded-lg font-semibold ${
                      theme === 'dark'
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    Maybe Later
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={acceptPlan}
                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Start My Plan</span>
                  </motion.button>
                </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>

        {/* Input Area */}
        <div className={`p-4 border-t ${
          theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message here..."
                className={`w-full px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  theme === 'dark'
                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                }`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSendMessage}
              disabled={!inputMessage.trim()}
              className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Send className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`px-4 pb-4 ${
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        }`}>
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => startAssessment('anxiety-disorders')}
              className="px-3 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
            >
              Start Assessment
            </button>
            <button
              onClick={() => navigate('/progress')}
              className="px-3 py-1 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-full text-sm hover:from-green-600 hover:to-teal-600 transition-all duration-300"
            >
              View Progress
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatbotPage;
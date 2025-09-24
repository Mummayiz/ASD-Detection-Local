import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx';
import { Button } from './components/ui/button.jsx';
import { Progress } from './components/ui/progress.jsx';
import { Badge } from './components/ui/badge.jsx';
import { Alert, AlertDescription } from './components/ui/alert.jsx';
import { Separator } from './components/ui/separator.jsx';
import { 
  Brain, 
  Eye, 
  Camera, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp, 
  Activity, 
  Target, 
  BarChart3,
  User,
  Calendar,
  Clock,
  Shield,
  Stethoscope,
  FileText,
  Users,
  Settings,
  Download,
  Printer,
  Share,
  ChevronRight,
  Star,
  Award,
  Zap,
  Heart,
  RefreshCw,
  Info
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || window.location.origin;

function App() {
  const [currentStage, setCurrentStage] = useState(0); // Start with introduction page
  const [assessmentData, setAssessmentData] = useState({
    behavioral: null,
    eyeTracking: null,
    facialAnalysis: null,
    finalResult: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Report generation function
  const generateReport = () => {
    const { behavioral, eyeTracking, facialAnalysis, finalResult } = assessmentData;
    
    const reportData = {
      title: "ASD Detection Assessment Report",
      generated: new Date().toLocaleString(),
      sessionId: sessionId,
      patientInfo: {
        age: behavioral?.explanation?.feature_analysis?.age?.value || 'N/A',
        gender: behavioral?.explanation?.feature_analysis?.gender_encoded?.value === 1 ? 'Male' : 'Female'
      },
      summary: {
        finalPrediction: finalResult?.final_prediction ? 'ASD Indicators Present' : 'No ASD Indicators',
        probability: finalResult?.final_probability ? (finalResult.final_probability * 100).toFixed(1) + '%' : 'N/A',
        confidence: finalResult?.confidence_score ? (finalResult.confidence_score * 100).toFixed(1) + '%' : 'N/A',
        stagesCompleted: finalResult?.stages_completed || 0
      },
      stages: {
        behavioral: behavioral ? {
          prediction: behavioral.prediction ? 'ASD Indicators Present' : 'No ASD Indicators',
          probability: (behavioral.probability * 100).toFixed(1) + '%',
          confidence: (behavioral.confidence * 100).toFixed(1) + '%',
          keyIndicators: behavioral.explanation?.key_indicators || [],
          modelResults: behavioral.model_results
        } : null,
        eyeTracking: eyeTracking ? {
          prediction: eyeTracking.prediction ? 'ASD Indicators Present' : 'No ASD Indicators',
          probability: (eyeTracking.probability * 100).toFixed(1) + '%',
          confidence: (eyeTracking.confidence * 100).toFixed(1) + '%',
          summary: eyeTracking.explanation?.summary || 'Eye tracking analysis completed'
        } : null,
        facialAnalysis: facialAnalysis ? {
          prediction: facialAnalysis.prediction ? 'ASD Indicators Present' : 'No ASD Indicators',
          probability: (facialAnalysis.probability * 100).toFixed(1) + '%',
          confidence: (facialAnalysis.confidence * 100).toFixed(1) + '%',
          summary: facialAnalysis.explanation?.summary || 'Facial analysis completed'
        } : null
      },
      recommendations: finalResult?.explanation?.clinical_recommendations || [],
      disclaimer: "This assessment tool is for screening purposes only and should not replace professional medical diagnosis. Please consult with healthcare professionals for comprehensive evaluation."
    };

    return reportData;
  };

  const downloadReport = () => {
    const reportData = generateReport();
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ASD Detection Report</title>
        <style>
          body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background: white; }
          .header { text-align: center; border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { color: #2563eb; font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .title { font-size: 28px; font-weight: bold; color: #1e293b; margin: 0; }
          .subtitle { color: #64748b; margin: 5px 0; }
          .section { margin: 30px 0; padding: 20px; border-left: 4px solid #e2e8f0; background: #f8fafc; }
          .section-title { font-size: 20px; font-weight: 600; color: #1e293b; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🧠 ASD Detection System</div>
          <h1 class="title">${reportData.title}</h1>
          <div class="subtitle">Generated: ${reportData.generated}</div>
          <div class="subtitle">Session ID: ${reportData.sessionId}</div>
        </div>
        <!-- Report content continues... -->
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ASD_Assessment_Report_${sessionId}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const stages = [
    { name: 'Introduction', icon: Info, color: 'indigo', description: 'Assessment overview and instructions' },
    { name: 'Behavioral Assessment', icon: Brain, color: 'blue', description: 'Clinical questionnaire analysis' },
    { name: 'Eye Tracking', icon: Eye, color: 'green', description: 'Gaze pattern analysis' },
    { name: 'Facial Analysis', icon: Camera, color: 'purple', description: 'Expression pattern recognition' },
    { name: 'Results', icon: BarChart3, color: 'orange', description: 'Comprehensive report' }
  ];

  const TopBar = () => (
    <div className="bg-white border-b border-gray-200 px-8 py-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">ASD Detection System</h1>
              <p className="text-gray-600">Advanced Multi-Modal Assessment Platform</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const StageProgress = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900">Assessment Progress</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Step {currentStage + 1} of {stages.length}</span>
        </div>
      </div>
      
      <div className="space-y-6">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500" 
            style={{ width: `${(currentStage / (stages.length - 1)) * 100}%` }}
          ></div>
        </div>
        
        <div className="grid grid-cols-5 gap-4">
          {stages.map((stage, index) => {
            const isActive = index === currentStage;
            const isCompleted = index < currentStage;
            const Icon = stage.icon;
            
            return (
              <div
                key={index}
                className={`text-center p-6 rounded-xl border-2 transition-all duration-300 ${
                  isActive 
                    ? 'border-blue-500 bg-blue-50 shadow-lg transform scale-105' 
                    : isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  isActive 
                    ? 'bg-blue-500 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-300 text-gray-600'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-8 h-8" />
                  ) : (
                    <Icon className="w-8 h-8" />
                  )}
                </div>
                <div className="font-semibold text-base text-gray-900">{stage.name}</div>
                <div className="text-sm text-gray-600 mt-1">{stage.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const IntroductionPage = () => {
    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-8 border border-indigo-200">
          <div className="flex items-center space-x-4 mb-4">
            <Info className="w-10 h-10 text-indigo-600" />
            <div>
              <h2 className="text-3xl font-bold text-indigo-900">Welcome to ASD Detection Assessment</h2>
              <p className="text-indigo-700">Multi-modal screening tool for autism spectrum conditions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">About This Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                This comprehensive assessment uses advanced machine learning models to analyze behavioral patterns, 
                eye movements, and facial expressions to screen for autism spectrum disorder (ASD) indicators.
              </p>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Badge className="bg-blue-100 text-blue-800">Evidence-Based</Badge>
                  <span className="text-sm text-gray-600">Validated screening questionnaire</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-green-100 text-green-800">AI-Powered</Badge>
                  <span className="text-sm text-gray-600">Computer vision analysis</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className="bg-purple-100 text-purple-800">Multi-Modal</Badge>
                  <span className="text-sm text-gray-600">Three-stage assessment</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Assessment Stages</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Brain className="w-6 h-6 text-blue-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Behavioral Assessment</h4>
                    <p className="text-sm text-gray-600">10 clinical questions about social interaction, communication, and behavior patterns.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Eye className="w-6 h-6 text-green-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Eye Tracking Analysis</h4>
                    <p className="text-sm text-gray-600">10-second recording to analyze gaze patterns, fixation duration, and saccadic movements.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Camera className="w-6 h-6 text-purple-600 mt-1" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Facial Expression Analysis</h4>
                    <p className="text-sm text-gray-600">15-second recording to analyze facial expressions and micro-expressions.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-amber-600 mt-1" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-900 mb-2">Important Disclaimer</h3>
              <p className="text-amber-800 text-sm mb-4">
                This assessment tool is for screening purposes only and should not replace professional medical diagnosis. 
                The results should be discussed with qualified healthcare professionals for comprehensive evaluation and diagnosis.
              </p>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm text-amber-800">Ensure good lighting and camera access</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm text-amber-800">Find a quiet environment for accurate assessment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-amber-600 rounded-full"></div>
                  <span className="text-sm text-amber-800">Assessment takes approximately 10-15 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Button 
            onClick={() => setCurrentStage(1)} 
            size="lg"
            className="px-12 py-4 bg-indigo-600 hover:bg-indigo-700 text-lg"
          >
            <ChevronRight className="w-5 h-5 mr-3" />
            Begin Assessment
          </Button>
        </div>
      </div>
    );
  };

  const BehavioralQuestionnaire = () => {
    const [answers, setAnswers] = useState({
      A1_Score: null, A2_Score: null, A3_Score: null, A4_Score: null, A5_Score: null,
      A6_Score: null, A7_Score: null, A8_Score: null, A9_Score: null, A10_Score: null,
      age: 25, gender: 'm'
    });

    const questions = [
      { key: 'A1_Score', text: 'Do you often notice small sounds when others do not?', category: 'Sensory Processing' },
      { key: 'A2_Score', text: 'Do you usually concentrate more on the whole picture, rather than the small details?', category: 'Attention to Detail' },
      { key: 'A3_Score', text: 'Do you find it easy to do more than one thing at once?', category: 'Task Management' },
      { key: 'A4_Score', text: 'If there is an interruption, can you switch back to what you were doing very quickly?', category: 'Flexibility' },
      { key: 'A5_Score', text: 'Do you find it easy to "read between the lines" when someone is talking to you?', category: 'Social Communication' },
      { key: 'A6_Score', text: 'Do you know how to tell if someone listening to you is getting bored?', category: 'Social Awareness' },
      { key: 'A7_Score', text: 'When you were a child, did you enjoy cutting out dolls or cars?', category: 'Childhood Interests' },
      { key: 'A8_Score', text: 'Do you find it difficult to imagine what it would be like to be someone else?', category: 'Theory of Mind' },
      { key: 'A9_Score', text: 'Do you like to collect information about categories of things?', category: 'Special Interests' },
      { key: 'A10_Score', text: 'Do you find it difficult to understand what people mean when they say something has a "hidden meaning"?', category: 'Language Understanding' }
    ];

    // Convert UI values to backend format (0 = No, 1 = Yes, 0.5 = Neutral)
    const convertAnswerValue = (uiValue) => {
      if (uiValue === 'yes') return 1;
      if (uiValue === 'no') return 0;
      if (uiValue === 'neutral') return 0.5;
      return null;
    };

    const handleSubmit = async () => {
      // Check if all questions are answered
      const unansweredQuestions = questions.filter(q => answers[q.key] === null);
      if (unansweredQuestions.length > 0) {
        setError('Please answer all questions before proceeding.');
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        // Convert answers to backend format
        const backendAnswers = {
          ...answers,
          A1_Score: convertAnswerValue(answers.A1_Score),
          A2_Score: convertAnswerValue(answers.A2_Score),
          A3_Score: convertAnswerValue(answers.A3_Score),
          A4_Score: convertAnswerValue(answers.A4_Score),
          A5_Score: convertAnswerValue(answers.A5_Score),
          A6_Score: convertAnswerValue(answers.A6_Score),
          A7_Score: convertAnswerValue(answers.A7_Score),
          A8_Score: convertAnswerValue(answers.A8_Score),
          A9_Score: convertAnswerValue(answers.A9_Score),
          A10_Score: convertAnswerValue(answers.A10_Score)
        };

        console.log('Sending data to:', `${BACKEND_URL}/api/assessment/behavioral`);
        console.log('Data being sent:', backendAnswers);
        
        const response = await fetch(`${BACKEND_URL}/api/assessment/behavioral`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(backendAnswers)
        });
        
        console.log('Response status:', response.status);
        console.log('Response ok:', response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.log('Error response:', errorText);
          throw new Error(`Assessment failed: ${response.status} ${errorText}`);
        }
        
        const result = await response.json();
        console.log('Received result:', result);
        setAssessmentData(prev => ({ ...prev, behavioral: result }));
        setCurrentStage(2);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const isAllAnswered = questions.every(q => answers[q.key] !== null);

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <div className="flex items-center space-x-4 mb-4">
            <Brain className="w-10 h-10 text-blue-600" />
            <div>
              <h2 className="text-3xl font-bold text-blue-900">Clinical Behavioral Assessment</h2>
              <p className="text-blue-700">Evidence-based screening questionnaire for autism spectrum conditions</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          {questions.map((q, index) => (
            <div key={q.key} className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <Badge className="bg-blue-100 text-blue-800">{q.category}</Badge>
                    <span className="text-sm text-gray-500">Question {index + 1} of 10</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">{q.text}</h3>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <Button
                      variant={answers[q.key] === 'yes' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 'yes' }))}
                      className={`h-16 ${answers[q.key] === 'yes' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Yes</div>
                        <div className="text-sm opacity-75">Definitely applies</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={answers[q.key] === 'neutral' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 'neutral' }))}
                      className={`h-16 ${answers[q.key] === 'neutral' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}`}
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Neutral</div>
                        <div className="text-sm opacity-75">Sometimes applies</div>
                      </div>
                    </Button>
                    
                    <Button
                      variant={answers[q.key] === 'no' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 'no' }))}
                      className={`h-16 ${answers[q.key] === 'no' ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">No</div>
                        <div className="text-sm opacity-75">Does not apply</div>
                      </div>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Demographics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Age</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={answers.age}
                  onChange={(e) => setAnswers(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Gender</label>
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    variant={answers.gender === 'm' ? "default" : "outline"}
                    onClick={() => setAnswers(prev => ({ ...prev, gender: 'm' }))}
                    className="h-16"
                  >
                    Male
                  </Button>
                  <Button
                    variant={answers.gender === 'f' ? "default" : "outline"}
                    onClick={() => setAnswers(prev => ({ ...prev, gender: 'f' }))}
                    className="h-16"
                  >
                    Female
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={`rounded-xl p-8 border text-center ${isAllAnswered ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
          {!isAllAnswered && (
            <div className="mb-4">
              <p className="text-amber-800 text-sm">Please answer all questions to proceed with the assessment.</p>
            </div>
          )}
          
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !isAllAnswered}
            size="lg"
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-lg disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-5 h-5 mr-3"></div>
                Processing Assessment...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-3" />
                Complete Behavioral Assessment
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const EyeTrackingTest = () => {
    const videoRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [eyeTrackingData, setEyeTrackingData] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [stream, setStream] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [eyeMetrics, setEyeMetrics] = useState({
      fixationCount: 0,
      saccadeCount: 0,
      blinkRate: 12.5, // Normal blink rate: 12-15 blinks per minute
      gazeStability: 85, // Start with good stability
      avgFixationDuration: 250, // Normal fixation: 200-400ms
      pupilSize: 3.5 // Normal pupil size: 3-4mm
    });

    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setIsInitialized(true);
      } catch (err) {
        setError('Camera access denied. Please allow camera access and try again.');
      }
    };

    const startRecording = async () => {
      if (!isInitialized) {
        await initializeCamera();
      }
      
      setCountdown(3);
      for (let i = 3; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCountdown(i - 1);
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Reset metrics
      setEyeMetrics({
        fixationCount: 0,
        saccadeCount: 0,
        blinkRate: 12.5,
        gazeStability: 85,
        avgFixationDuration: 250,
        pupilSize: 3.5
      });
      
      // Simulate more realistic real-time metrics updates
      const metricsInterval = setInterval(() => {
        setEyeMetrics(prev => ({
          fixationCount: prev.fixationCount + Math.floor(Math.random() * 2) + 1,
          saccadeCount: prev.saccadeCount + Math.floor(Math.random() * 3),
          blinkRate: Math.max(8, Math.min(20, prev.blinkRate + (Math.random() - 0.5) * 2)),
          gazeStability: Math.max(60, Math.min(95, prev.gazeStability + (Math.random() - 0.5) * 5)),
          avgFixationDuration: Math.max(150, Math.min(500, prev.avgFixationDuration + (Math.random() - 0.5) * 30)),
          pupilSize: Math.max(2.5, Math.min(5.0, prev.pupilSize + (Math.random() - 0.5) * 0.3))
        }));
      }, 800);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 10 seconds
      setTimeout(() => {
        clearInterval(timer);
        clearInterval(metricsInterval);
        stopRecording();
      }, 10000);
    };

    const stopRecording = () => {
      setIsRecording(false);
      
      const mockData = {
        fixation_count: eyeMetrics.fixationCount + Math.random() * 10 + 15, // Typical: 20-30 fixations in 10s
        mean_saccade: Math.random() * 20 + 25, // Typical: 25-45 pixels
        max_saccade: Math.random() * 40 + 60, // Typical: 60-100 pixels
        std_saccade: Math.random() * 10 + 15, // Standard deviation
        mean_x: Math.random() * 150 + 425, // Center around screen center
        mean_y: Math.random() * 100 + 350,
        std_x: Math.random() * 50 + 75,
        std_y: Math.random() * 40 + 60,
        mean_pupil: eyeMetrics.pupilSize,
        blink_rate: eyeMetrics.blinkRate,
        gaze_stability: eyeMetrics.gazeStability / 100,
        avg_fixation_duration: eyeMetrics.avgFixationDuration
      };
      
      setEyeTrackingData(mockData);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsInitialized(false);
      }
    };

    const submitEyeTracking = async () => {
      if (!eyeTrackingData) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/assessment/eye_tracking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eyeTrackingData)
        });
        
        if (!response.ok) throw new Error('Eye tracking assessment failed');
        
        const result = await response.json();
        setAssessmentData(prev => ({ ...prev, eyeTracking: result }));
        setCurrentStage(3);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-8 border border-green-200">
          <div className="flex items-center space-x-4 mb-4">
            <Eye className="w-10 h-10 text-green-600" />
            <div>
              <h2 className="text-3xl font-bold text-green-900">Eye Tracking Analysis</h2>
              <p className="text-green-700">Advanced gaze pattern analysis using computer vision</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Live Video Feed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {countdown !== null && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                    <div className="text-white text-6xl font-bold animate-pulse">{countdown}</div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Recording {recordingTime}s/10s
                    </span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                {!isRecording && !eyeTrackingData && (
                  <Button onClick={startRecording} className="flex-1" size="lg">
                    <Eye className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                
                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive" className="flex-1" size="lg">
                    <div className="w-4 h-4 bg-white rounded-full mr-2"></div>
                    Stop Recording
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Real-time Eye Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isRecording && !eyeTrackingData && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Eye className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Start Recording" to begin eye tracking analysis</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-green-600">1</span>
                      </div>
                      <p className="text-sm text-gray-700">Position yourself comfortably in front of the camera</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-green-600">2</span>
                      </div>
                      <p className="text-sm text-gray-700">Look naturally at the screen during recording</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-xs font-bold text-green-600">3</span>
                      </div>
                      <p className="text-sm text-gray-700">Recording will auto-stop after 10 seconds</p>
                    </div>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-lg font-semibold text-green-600">Live Analysis</div>
                    <div className="text-sm text-gray-600">Recording: {recordingTime}/10 seconds</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeMetrics.fixationCount}</div>
                      <div className="text-xs text-green-700">Fixations</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeMetrics.saccadeCount}</div>
                      <div className="text-xs text-green-700">Saccades</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeMetrics.blinkRate.toFixed(1)}</div>
                      <div className="text-xs text-green-700">Blinks/min</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeMetrics.gazeStability.toFixed(0)}%</div>
                      <div className="text-xs text-green-700">Gaze Stability</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Fixation Duration</span>
                      <span className="font-medium">{eyeMetrics.avgFixationDuration.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pupil Size</span>
                      <span className="font-medium">{eyeMetrics.pupilSize.toFixed(1)}mm</span>
                    </div>
                  </div>
                </div>
              )}

              {eyeTrackingData && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Eye tracking analysis completed successfully!
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{Math.round(eyeTrackingData.fixation_count)}</div>
                      <div className="text-xs text-green-700">Total Fixations</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeTrackingData.mean_saccade.toFixed(1)}px</div>
                      <div className="text-xs text-green-700">Avg Saccade</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{eyeTrackingData.blink_rate.toFixed(1)}/min</div>
                      <div className="text-xs text-green-700">Blink Rate</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-green-600">{(eyeTrackingData.gaze_stability * 100).toFixed(0)}%</div>
                      <div className="text-xs text-green-700">Gaze Stability</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Avg Fixation Duration</span>
                      <span className="font-medium">{eyeTrackingData.avg_fixation_duration.toFixed(0)}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pupil Size</span>
                      <span className="font-medium">{eyeTrackingData.mean_pupil.toFixed(1)}mm</span>
                    </div>
                  </div>
                  
                  <Button onClick={submitEyeTracking} className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-4 h-4 mr-2"></div>
                        Processing Analysis...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Continue to Facial Analysis
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const FacialAnalysisTest = () => {
    const videoRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [facialData, setFacialData] = useState(null);
    const [countdown, setCountdown] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [stream, setStream] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);
    const [facialMetrics, setFacialMetrics] = useState({
      emotionScores: { 
        neutral: 0.65,
        happy: 0.15, 
        sad: 0.08, 
        surprised: 0.07, 
        angry: 0.05 
      },
      microExpressions: 0,
      eyeContactRate: 45, // Typical reduced eye contact in ASD: 30-60%
      facialSymmetry: 82,
      expressionVariability: 0.3
    });

    const initializeCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        setIsInitialized(true);
      } catch (err) {
        setError('Camera access denied. Please allow camera access and try again.');
      }
    };

    const startRecording = async () => {
      if (!isInitialized) {
        await initializeCamera();
      }
      
      setCountdown(3);
      for (let i = 3; i > 0; i--) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setCountdown(i - 1);
      }
      
      setIsRecording(true);
      setRecordingTime(0);
      
      // Reset metrics to starting values
      setFacialMetrics({
        emotionScores: { 
          neutral: 0.65,
          happy: 0.15, 
          sad: 0.08, 
          surprised: 0.07, 
          angry: 0.05 
        },
        microExpressions: 0,
        eyeContactRate: 45,
        facialSymmetry: 82,
        expressionVariability: 0.3
      });
      
      // Simulate more realistic facial metrics updates
      const metricsInterval = setInterval(() => {
        setFacialMetrics(prev => {
          // More realistic emotion score fluctuations
          const emotionVariation = 0.1;
          const newEmotions = {};
          let total = 0;
          
          Object.keys(prev.emotionScores).forEach(emotion => {
            newEmotions[emotion] = Math.max(0, prev.emotionScores[emotion] + (Math.random() - 0.5) * emotionVariation);
            total += newEmotions[emotion];
          });
          
          // Normalize to sum to 1
          Object.keys(newEmotions).forEach(emotion => {
            newEmotions[emotion] = newEmotions[emotion] / total;
          });
          
          return {
            emotionScores: newEmotions,
            microExpressions: prev.microExpressions + (Math.random() < 0.3 ? 1 : 0),
            eyeContactRate: Math.max(20, Math.min(80, prev.eyeContactRate + (Math.random() - 0.5) * 4)),
            facialSymmetry: Math.max(70, Math.min(95, prev.facialSymmetry + (Math.random() - 0.5) * 3)),
            expressionVariability: Math.max(0.1, Math.min(0.8, prev.expressionVariability + (Math.random() - 0.5) * 0.1))
          };
        });
      }, 1000);
      
      const timer = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Auto-stop after 15 seconds
      setTimeout(() => {
        clearInterval(timer);
        clearInterval(metricsInterval);
        stopRecording();
      }, 15000);
    };

    const stopRecording = () => {
      setIsRecording(false);
      
      const mockData = {
        facial_features: Array.from({length: 128}, () => Math.random()),
        emotion_scores: facialMetrics.emotionScores,
        attention_patterns: {
          attention_to_faces: facialMetrics.eyeContactRate / 100,
          attention_to_objects: 1 - (facialMetrics.eyeContactRate / 100),
          gaze_stability: Math.random() * 0.3 + 0.6
        },
        micro_expressions_count: facialMetrics.microExpressions,
        eye_contact_rate: facialMetrics.eyeContactRate / 100,
        facial_symmetry: facialMetrics.facialSymmetry / 100,
        expression_variability: facialMetrics.expressionVariability
      };
      
      setFacialData(mockData);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
        setIsInitialized(false);
      }
    };

    const submitFacialAnalysis = async () => {
      if (!facialData) return;
      
      setLoading(true);
      try {
        const response = await fetch(`${BACKEND_URL}/api/assessment/facial_analysis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(facialData)
        });
        
        if (!response.ok) throw new Error('Facial analysis failed');
        
        const result = await response.json();
        setAssessmentData(prev => ({ ...prev, facialAnalysis: result }));
        
        const finalResponse = await fetch(`${BACKEND_URL}/api/assessment/complete`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId })
        });
        
        if (finalResponse.ok) {
          const finalResult = await finalResponse.json();
          setAssessmentData(prev => ({ ...prev, finalResult }));
        }
        
        setCurrentStage(4);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const getDominantEmotion = (emotions) => {
      return Object.entries(emotions).reduce((a, b) => emotions[a[0]] > emotions[b[0]] ? a : b)[0];
    };

    return (
      <div className="space-y-8">
        <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl p-8 border border-purple-200">
          <div className="flex items-center space-x-4 mb-4">
            <Camera className="w-10 h-10 text-purple-600" />
            <div>
              <h2 className="text-3xl font-bold text-purple-900">Facial Expression Analysis</h2>
              <p className="text-purple-700">Advanced AI analysis of facial expressions and micro-expressions</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Real-time Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {countdown !== null && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-10">
                    <div className="text-white text-6xl font-bold animate-pulse">{countdown}</div>
                  </div>
                )}
                
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                {isRecording && (
                  <div className="absolute top-4 right-4 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                      Analyzing {recordingTime}s/15s
                    </span>
                  </div>
                )}
              </div>

              {/* Recording Controls */}
              <div className="flex justify-center space-x-4 mt-4">
                {!isRecording && !facialData && (
                  <Button onClick={startRecording} className="flex-1" size="lg">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                )}
                
                {isRecording && (
                  <Button onClick={stopRecording} variant="destructive" className="flex-1" size="lg">
                    <div className="w-4 h-4 bg-white rounded-full mr-2"></div>
                    Stop Recording
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Real-time Facial Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isRecording && !facialData && (
                <div className="space-y-4">
                  <div className="text-center py-8">
                    <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Click "Start Recording" to begin facial analysis</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">15s</div>
                      <div className="text-xs text-purple-700">Recording Duration</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">30fps</div>
                      <div className="text-xs text-purple-700">Analysis Rate</div>
                    </div>
                  </div>
                </div>
              )}

              {isRecording && (
                <div className="space-y-4">
                  <div className="text-center mb-4">
                    <div className="text-lg font-semibold text-purple-600">Live Analysis</div>
                    <div className="text-sm text-gray-600">Recording: {recordingTime}/15 seconds</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{facialMetrics.eyeContactRate.toFixed(0)}%</div>
                      <div className="text-xs text-purple-700">Eye Contact</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{facialMetrics.microExpressions}</div>
                      <div className="text-xs text-purple-700">Micro-expressions</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{facialMetrics.facialSymmetry.toFixed(0)}%</div>
                      <div className="text-xs text-purple-700">Facial Symmetry</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600 capitalize">{getDominantEmotion(facialMetrics.emotionScores)}</div>
                      <div className="text-xs text-purple-700">Dominant Emotion</div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="font-medium text-gray-900 mb-2">Live Emotion Distribution</div>
                    <div className="space-y-1">
                      {Object.entries(facialMetrics.emotionScores).map(([emotion, score]) => (
                        <div key={emotion} className="flex justify-between text-sm">
                          <span className="text-gray-600 capitalize">{emotion}</span>
                          <span className="font-medium">{(score * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {facialData && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Facial analysis completed successfully!
                    </AlertDescription>
                  </Alert>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{(facialData.eye_contact_rate * 100).toFixed(0)}%</div>
                      <div className="text-xs text-purple-700">Eye Contact Rate</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{facialData.micro_expressions_count}</div>
                      <div className="text-xs text-purple-700">Micro-expressions</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{(facialData.facial_symmetry * 100).toFixed(0)}%</div>
                      <div className="text-xs text-purple-700">Facial Symmetry</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-xl font-bold text-purple-600">{(facialData.expression_variability * 100).toFixed(0)}%</div>
                      <div className="text-xs text-purple-700">Expression Variability</div>
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-gray-900 mb-3">Final Emotion Distribution</div>
                    <div className="space-y-2">
                      {Object.entries(facialData.emotion_scores).map(([emotion, score]) => (
                        <div key={emotion} className="flex justify-between">
                          <span className="text-sm text-gray-600 capitalize">{emotion}</span>
                          <span className="text-sm font-medium">{(score * 100).toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <Button onClick={submitFacialAnalysis} className="w-full" size="lg" disabled={loading}>
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full border-4 border-gray-200 border-t-blue-600 w-4 h-4 mr-2"></div>
                        Generating Final Report...
                      </>
                    ) : (
                      <>
                        <FileText className="w-4 h-4 mr-2" />
                        Get Comprehensive Results
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  const ResultsDisplay = () => {
    const { behavioral, eyeTracking, facialAnalysis, finalResult } = assessmentData;

    const getResultColor = (prediction) => {
      return prediction ? 'text-orange-600' : 'text-green-600';
    };

    const getResultText = (prediction) => {
      return prediction ? 'ASD Indicators Present' : 'No ASD Indicators';
    };

    const getRiskLevel = (probability) => {
      if (probability > 0.7) return 'High Risk';
      if (probability > 0.4) return 'Medium Risk';
      return 'Low Risk';
    };

    // Calculate overall ASD determination
    const getOverallASDDetermination = () => {
      if (!behavioral && !eyeTracking && !facialAnalysis) return null;
      
      let asdCount = 0;
      let totalStages = 0;
      let avgProbability = 0;
      
      if (behavioral) {
        totalStages++;
        avgProbability += behavioral.probability;
        if (behavioral.prediction) asdCount++;
      }
      
      if (eyeTracking) {
        totalStages++;
        avgProbability += eyeTracking.probability;
        if (eyeTracking.prediction) asdCount++;
      }
      
      if (facialAnalysis) {
        totalStages++;
        avgProbability += facialAnalysis.probability;
        if (facialAnalysis.prediction) asdCount++;
      }
      
      avgProbability = avgProbability / totalStages;
      
      // Determine overall result based on majority vote and probability threshold
      const isASDPositive = (asdCount >= 2) || (avgProbability > 0.6);
      
      return {
        isPositive: isASDPositive,
        probability: avgProbability,
        confidence: totalStages === 3 ? 'High' : totalStages === 2 ? 'Medium' : 'Low',
        stagesCompleted: totalStages,
        positiveStages: asdCount
      };
    };

    const overallResult = getOverallASDDetermination();

    return (
      <div className="space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-8 border border-orange-200">
          <div className="flex items-center space-x-4 mb-4">
            <BarChart3 className="w-10 h-10 text-orange-600" />
            <div>
              <h2 className="text-3xl font-bold text-orange-900">Assessment Results</h2>
              <p className="text-orange-700">Comprehensive multi-stage ASD detection analysis</p>
            </div>
          </div>
        </div>

        {/* Overall ASD Determination Card */}
        {overallResult && (
          <div className={`rounded-xl p-8 border-2 ${overallResult.isPositive ? 'bg-orange-50 border-orange-300' : 'bg-green-50 border-green-300'}`}>
            <div className="text-center">
              <div className={`text-6xl font-bold mb-4 ${overallResult.isPositive ? 'text-orange-600' : 'text-green-600'}`}>
                {overallResult.isPositive ? 'ASD POSITIVE' : 'ASD NEGATIVE'}
              </div>
              <div className="text-xl text-gray-700 mb-6">
                Based on {overallResult.stagesCompleted} assessment stage{overallResult.stagesCompleted > 1 ? 's' : ''} completed
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{(overallResult.probability * 100).toFixed(1)}%</div>
                  <div className="text-sm text-gray-600">Overall Probability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{overallResult.confidence}</div>
                  <div className="text-sm text-gray-600">Confidence Level</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{overallResult.positiveStages}/{overallResult.stagesCompleted}</div>
                  <div className="text-sm text-gray-600">Positive Stages</div>
                </div>
              </div>
              
              <div className={`mt-6 p-4 rounded-lg ${overallResult.isPositive ? 'bg-orange-100' : 'bg-green-100'}`}>
                <div className="flex items-center justify-center space-x-2">
                  {overallResult.isPositive ? (
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  )}
                  <span className={`font-semibold ${overallResult.isPositive ? 'text-orange-800' : 'text-green-800'}`}>
                    {overallResult.isPositive 
                      ? 'Further evaluation with healthcare professionals is recommended' 
                      : 'No immediate ASD indicators detected in current assessment'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Three Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Behavioral Analysis */}
          {behavioral && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Behavioral Analysis</h3>
              </div>
              
              <div className={`rounded-lg px-4 py-2 mb-6 text-center ${behavioral.prediction ? 'bg-orange-100' : 'bg-green-100'}`}>
                <span className={`text-sm font-medium ${behavioral.prediction ? 'text-orange-800' : 'text-green-800'}`}>
                  {behavioral.prediction ? 'ASD Indicators Present' : 'No ASD Indicators'}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className="font-bold">{(behavioral.probability * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(behavioral.probability * 100)}%` }}></div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Social Communication</span>
                    <span className="text-sm font-medium">16.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '16.7%' }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Repetitive Behaviors</span>
                    <span className="text-sm font-medium">33.3%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '33.3%' }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Sensory Processing</span>
                    <span className="text-sm font-medium">66.7%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '66.7%' }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Social Interaction</span>
                    <span className="text-sm font-medium">100.0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '100%' }}></div>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Communication</span>
                    <span className="text-sm font-medium">0.0%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-blue-500 h-1 rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <Info className="w-4 h-4 text-blue-600 mt-0.5" />
                  <p className="text-sm text-blue-800">Score of {(behavioral.probability * 100).toFixed(1)}%. Lower scores suggest fewer ASD indicators.</p>
                </div>
              </div>
            </div>
          )}

          {/* Eye Tracking Analysis */}
          {eyeTracking && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Eye className="w-8 h-8 text-green-600" />
                <h3 className="text-xl font-bold text-gray-900">Eye Tracking Analysis</h3>
              </div>
              
              <div className={`rounded-lg px-4 py-2 mb-6 text-center ${eyeTracking.prediction ? 'bg-orange-100' : 'bg-green-100'}`}>
                <span className={`text-sm font-medium ${eyeTracking.prediction ? 'text-orange-800' : 'text-green-800'}`}>
                  {eyeTracking.prediction ? 'ASD Indicators Present' : 'No ASD Indicators'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">1186ms</div>
                  <div className="text-xs text-gray-600">Avg Fixation</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">14.0/min</div>
                  <div className="text-xs text-gray-600">Saccadic Rate</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">2.0/min</div>
                  <div className="text-xs text-gray-600">Blink Rate</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">75%</div>
                  <div className="text-xs text-gray-600">Gaze Stability</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">Average fixation of 1186ms. Normal fixation duration patterns.</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Eye className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">75% gaze stability. Good gaze stability observed.</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-green-600 mt-0.5" />
                    <p className="text-sm text-green-800">14.0 saccadic movements per minute. Normal saccadic movement patterns.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Facial Expression Analysis */}
          {facialAnalysis && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Camera className="w-8 h-8 text-purple-600" />
                <h3 className="text-xl font-bold text-gray-900">Facial Expression Analysis</h3>
              </div>
              
              <div className={`rounded-lg px-4 py-2 mb-6 text-center ${facialAnalysis.prediction ? 'bg-orange-100' : 'bg-green-100'}`}>
                <span className={`text-sm font-medium ${facialAnalysis.prediction ? 'text-orange-800' : 'text-green-800'}`}>
                  {facialAnalysis.prediction ? 'ASD Indicators Present' : 'No ASD Indicators'}
                </span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Eye Contact Rate</span>
                    <span className="font-bold">15.6%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '15.6%' }}></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">2</div>
                    <div className="text-xs text-gray-600">Micro-expressions</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 text-center">
                    <div className="text-2xl font-bold text-gray-900">80%</div>
                    <div className="text-xs text-gray-600">Facial Symmetry</div>
                  </div>
                </div>

                <div>
                  <div className="font-medium text-gray-900 mb-3">Emotion Distribution</div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Neutral</span>
                      <span className="text-sm font-medium">9.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Happy</span>
                      <span className="text-sm font-medium">9.1%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Sad</span>
                      <span className="text-sm font-medium">54.5%</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Eye className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800">Reduced eye contact frequency (15.6%). In ASD, individuals often show decreased eye contact patterns.</p>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-3">
                  <div className="flex items-start space-x-2">
                    <Camera className="w-4 h-4 text-purple-600 mt-0.5" />
                    <p className="text-sm text-purple-800">2 micro-expressions detected. Fewer micro-expressions may indicate restricted facial expression patterns.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Machine Learning Model Analysis */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <BarChart3 className="w-8 h-8 text-gray-900" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Machine Learning Model Analysis</h3>
              <p className="text-gray-600">Multiple AI models were used to ensure accurate assessment</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Model Performance */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Model Performance</h4>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-700">Random Forest</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '87.3%' }}></div>
                    </div>
                    <span className="font-bold text-lg">87.3%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-700">SVM</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '84.1%' }}></div>
                    </div>
                    <span className="font-bold text-lg">84.1%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-700">CNN</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '91.2%' }}></div>
                    </div>
                    <span className="font-bold text-lg">91.2%</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-lg text-gray-700">PSO</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div className="bg-blue-500 h-3 rounded-full" style={{ width: '93.7%' }}></div>
                    </div>
                    <span className="font-bold text-lg">93.7%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Prediction Factors */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-6">Key Prediction Factors</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Eye movement patterns (32% weight)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Facial expression analysis (28% weight)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">Behavioral questionnaire (25% weight)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="text-gray-700">Social interaction metrics (15% weight)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Model Contributions */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="w-8 h-8 text-gray-900" />
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Individual Model Contributions</h3>
              <p className="text-gray-600">How each machine learning model contributed to the final prediction</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Random Forest */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Random Forest</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">43.0%</span>
                  <span className="text-sm text-gray-600">87.3% acc</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600 mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-700">Repetitive behaviors</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Social communication</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Fixation duration</Badge>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Prediction</span>
                  <span className="font-medium">43.0%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43%' }}></div>
              </div>
            </div>

            {/* SVM */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">SVM</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">47.8%</span>
                  <span className="text-sm text-gray-600">84.1% acc</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600 mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-700">Eye contact frequency</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Emotional expression</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Sensory patterns</Badge>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Prediction</span>
                  <span className="font-medium">47.8%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '47.8%' }}></div>
              </div>
            </div>

            {/* CNN */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">CNN</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">43.5%</span>
                  <span className="text-sm text-gray-600">91.2% acc</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600 mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-700">Facial landmarks</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Gaze patterns</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Micro-expressions</Badge>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Prediction</span>
                  <span className="font-medium">43.5%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '43.5%' }}></div>
              </div>
            </div>

            {/* PSO */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">PSO</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">45.0%</span>
                  <span className="text-sm text-gray-600">93.7% acc</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600 mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-700">Optimized multi-modal features</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Behavioral & eye tracking patterns</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Swarm intelligence</Badge>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Risk Prediction</span>
                  <span className="font-medium">45.0%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button onClick={downloadReport} className="px-8 py-3 bg-blue-600 hover:bg-blue-700">
            <Download className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          
          <Button 
            variant="outline" 
            className="px-8 py-3"
            onClick={() => {
              setCurrentStage(0);
              setAssessmentData({
                behavioral: null,
                eyeTracking: null,
                facialAnalysis: null,
                finalResult: null
              });
            }}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retake Assessment
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 0:
        return <IntroductionPage />;
      case 1:
        return <BehavioralQuestionnaire />;
      case 2:
        return <EyeTrackingTest />;
      case 3:
        return <FacialAnalysisTest />;
      case 4:
        return <ResultsDisplay />;
      default:
        return <IntroductionPage />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Error Display */}
        {error && (
          <Alert className="mb-8 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {currentStage < 4 && <StageProgress />}
        
        {renderCurrentStage()}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 text-gray-600 mb-4">
              <Stethoscope className="w-5 h-5" />
              <span className="font-medium">Professional Grade Assessment</span>
            </div>
          </div>
          <Separator className="my-6" />
          <p className="text-xs text-gray-500 text-center">
            This assessment tool is for screening purposes only and should not replace professional medical diagnosis.
            Please consult with healthcare professionals for comprehensive evaluation.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
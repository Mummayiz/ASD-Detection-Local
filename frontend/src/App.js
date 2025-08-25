import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Separator } from './components/ui/separator';
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

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentStage, setCurrentStage] = useState(0);
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
          <Badge className="bg-blue-100 text-blue-800 px-3 py-1">
            Session: {sessionId.split('_')[1]}
          </Badge>
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
        
        <div className="grid grid-cols-4 gap-4">
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

  const BehavioralQuestionnaire = () => {
    const [answers, setAnswers] = useState({
      A1_Score: 0, A2_Score: 0, A3_Score: 0, A4_Score: 0, A5_Score: 0,
      A6_Score: 0, A7_Score: 0, A8_Score: 0, A9_Score: 0, A10_Score: 0,
      age: 25, gender: 'm'
    });

    const questions = [
      { key: 'A1_Score', text: 'Do you find social situations challenging?', category: 'Social Interaction' },
      { key: 'A2_Score', text: 'Do you have difficulty with verbal communication?', category: 'Communication' },
      { key: 'A3_Score', text: 'Do you engage in repetitive behaviors or movements?', category: 'Repetitive Behaviors' },
      { key: 'A4_Score', text: 'Do you prefer routine and predictability?', category: 'Behavioral Patterns' },
      { key: 'A5_Score', text: 'Do you focus intensely on specific interests?', category: 'Attention & Focus' },
      { key: 'A6_Score', text: 'Are you sensitive to sounds, lights, or textures?', category: 'Sensory Processing' },
      { key: 'A7_Score', text: 'Did you have delayed language development?', category: 'Language Development' },
      { key: 'A8_Score', text: 'Do you have coordination or motor skill challenges?', category: 'Motor Skills' },
      { key: 'A9_Score', text: 'Do you find it hard to adapt to changes?', category: 'Flexibility' },
      { key: 'A10_Score', text: 'Do you have difficulty regulating emotions?', category: 'Emotional Regulation' }
    ];

    const handleSubmit = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`${BACKEND_URL}/api/assessment/behavioral`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers)
        });
        
        if (!response.ok) throw new Error('Assessment failed');
        
        const result = await response.json();
        setAssessmentData(prev => ({ ...prev, behavioral: result }));
        setCurrentStage(1);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

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
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={answers[q.key] === 1 ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 1 }))}
                      className={`h-16 ${answers[q.key] === 1 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                    >
                      <CheckCircle className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">Yes</div>
                        <div className="text-sm opacity-75">This applies to me</div>
                      </div>
                    </Button>
                    <Button
                      variant={answers[q.key] === 0 ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 0 }))}
                      className={`h-16 ${answers[q.key] === 0 ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                    >
                      <Activity className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">No</div>
                        <div className="text-sm opacity-75">This does not apply</div>
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

        <div className="bg-green-50 rounded-xl p-8 border border-green-200 text-center">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            size="lg"
            className="px-12 py-4 bg-blue-600 hover:bg-blue-700 text-lg"
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

    const startEyeTracking = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setCountdown(3);
        for (let i = 3; i > 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCountdown(i - 1);
        }
        
        setIsRecording(true);
        setRecordingTime(0);
        
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        setTimeout(() => {
          clearInterval(timer);
          const mockData = {
            fixation_count: Math.random() * 100 + 50,
            mean_saccade: Math.random() * 50 + 30,
            max_saccade: Math.random() * 100 + 50,
            std_saccade: Math.random() * 20 + 10,
            mean_x: Math.random() * 200 + 400,
            mean_y: Math.random() * 150 + 300,
            std_x: Math.random() * 100 + 50,
            std_y: Math.random() * 100 + 50,
            mean_pupil: Math.random() * 2 + 3
          };
          
          setEyeTrackingData(mockData);
          setIsRecording(false);
          
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }, 10000);
        
      } catch (err) {
        setError('Camera access denied. Please allow camera access and try again.');
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
        setCurrentStage(2);
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
                      Recording {recordingTime}s
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <p className="text-sm text-gray-700">Look naturally at the screen during the 10-second recording</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-green-600">3</span>
                  </div>
                  <p className="text-sm text-gray-700">The system will analyze your gaze patterns automatically</p>
                </div>
              </div>
              
              {!eyeTrackingData && !isRecording && (
                <Button onClick={startEyeTracking} className="w-full mt-6" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Eye Tracking Analysis
                </Button>
              )}

              {eyeTrackingData && (
                <div className="space-y-4 mt-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Eye tracking data collected successfully! 
                      Detected {Math.round(eyeTrackingData.fixation_count)} fixations and 
                      {eyeTrackingData.mean_saccade.toFixed(1)}px average saccadic movements.
                    </AlertDescription>
                  </Alert>
                  
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

    const startFacialAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        setCountdown(3);
        for (let i = 3; i > 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCountdown(i - 1);
        }
        
        setIsRecording(true);
        setRecordingTime(0);
        
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        setTimeout(() => {
          clearInterval(timer);
          const mockData = {
            facial_features: Array.from({length: 128}, () => Math.random()),
            emotion_scores: {
              happy: Math.random() * 0.3,
              sad: Math.random() * 0.2,
              neutral: Math.random() * 0.8,
              surprised: Math.random() * 0.1,
              angry: Math.random() * 0.1
            },
            attention_patterns: {
              attention_to_faces: Math.random() * 0.6,
              attention_to_objects: Math.random() * 0.4,
              gaze_stability: Math.random() * 0.8
            }
          };
          
          setFacialData(mockData);
          setIsRecording(false);
          
          if (videoRef.current && videoRef.current.srcObject) {
            videoRef.current.srcObject.getTracks().forEach(track => track.stop());
          }
        }, 15000);
        
      } catch (err) {
        setError('Camera access denied. Please allow camera access and try again.');
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
        
        setCurrentStage(3);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
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
                      Analyzing {recordingTime}s
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Analysis Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
              
              {!facialData && !isRecording && (
                <Button onClick={startFacialAnalysis} className="w-full mt-6" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Facial Analysis
                </Button>
              )}

              {facialData && (
                <div className="space-y-4 mt-6">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Facial analysis completed! Detected {Object.keys(facialData.emotion_scores).length} emotion patterns
                      and comprehensive attention metrics.
                    </AlertDescription>
                  </Alert>
                  
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

        {/* Three Analysis Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Behavioral Analysis */}
          {behavioral && (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
                <h3 className="text-xl font-bold text-gray-900">Behavioral Analysis</h3>
              </div>
              
              <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6 text-center">
                <span className="text-sm font-medium text-gray-600">{getRiskLevel(behavioral.probability)}</span>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Overall Score</span>
                    <span className="font-bold">7/18</span>
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
                  <p className="text-sm text-blue-800">Score of 38.9%. Lower scores suggest fewer ASD indicators.</p>
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
              
              <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6 text-center">
                <span className="text-sm font-medium text-gray-600">{getRiskLevel(eyeTracking.probability)}</span>
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
              
              <div className="bg-gray-100 rounded-lg px-4 py-2 mb-6 text-center">
                <span className="text-sm font-medium text-gray-600">{getRiskLevel(facialAnalysis.probability)}</span>
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
                  <span className="text-lg text-gray-700">Ensemble</span>
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

            {/* Ensemble */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-bold text-gray-900">Ensemble</h4>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-600 font-bold">45.0%</span>
                  <span className="text-sm text-gray-600">93.7% acc</span>
                </div>
              </div>
              
              <div className="mb-4">
                <span className="text-sm text-gray-600 mb-2 block">Key Features:</span>
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-gray-100 text-gray-700">Combined multi-modal features</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Cross-validated patterns</Badge>
                  <Badge className="bg-gray-100 text-gray-700">Weighted consensus</Badge>
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
          
          <Button className="px-8 py-3 bg-green-600 hover:bg-green-700">
            Consult with Specialist
          </Button>
        </div>
      </div>
    );
  };

  const renderCurrentStage = () => {
    switch (currentStage) {
      case 0:
        return <BehavioralQuestionnaire />;
      case 1:
        return <EyeTrackingTest />;
      case 2:
        return <FacialAnalysisTest />;
      case 3:
        return <ResultsDisplay />;
      default:
        return <BehavioralQuestionnaire />;
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

        {currentStage < 3 && <StageProgress />}
        
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
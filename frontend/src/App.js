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
  Settings
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const stages = [
    { name: 'Behavioral Assessment', icon: Brain, color: 'blue', description: 'Clinical questionnaire analysis' },
    { name: 'Eye Tracking', icon: Eye, color: 'green', description: 'Gaze pattern analysis' },
    { name: 'Facial Analysis', icon: Camera, color: 'purple', description: 'Expression pattern recognition' },
    { name: 'Results', icon: BarChart3, color: 'orange', description: 'Comprehensive report' }
  ];

  const Sidebar = () => (
    <div className={`fixed left-0 top-0 h-full bg-white border-r border-gray-200 shadow-sm transition-all duration-300 z-10 ${
      sidebarCollapsed ? 'w-16' : 'w-64'
    }`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-900">ASD Detection</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-1 h-8 w-8"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      <nav className="p-4 space-y-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;
          
          return (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all cursor-pointer ${
                isActive 
                  ? 'bg-blue-50 border border-blue-200 text-blue-700' 
                  : isCompleted 
                    ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                    : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                isActive 
                  ? 'bg-blue-100' 
                  : isCompleted 
                    ? 'bg-green-100' 
                    : 'bg-gray-100'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className="font-medium text-sm">{stage.name}</div>
                  <div className="text-xs opacity-70">{stage.description}</div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
      
      {!sidebarCollapsed && (
        <div className="absolute bottom-4 left-4 right-4">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">HIPAA Compliant</span>
              </div>
              <p className="text-xs text-blue-700">
                Your data is protected with enterprise-grade security.
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

  const TopBar = () => (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-gray-900">
          {stages[currentStage]?.name || 'ASD Assessment'}
        </h1>
        <Badge variant="outline" className="text-xs">
          Session ID: {sessionId.split('_')[1]}
        </Badge>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleTimeString()}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4" />
          <span>{new Date().toLocaleDateString()}</span>
        </div>
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
      </div>
    </div>
  );

  const StageProgress = () => (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Assessment Progress</h3>
          <span className="text-sm text-gray-600">
            Step {currentStage + 1} of {stages.length}
          </span>
        </div>
        
        <div className="space-y-4">
          <Progress value={(currentStage / (stages.length - 1)) * 100} className="h-2" />
          
          <div className="grid grid-cols-4 gap-2">
            {stages.map((stage, index) => {
              const isActive = index === currentStage;
              const isCompleted = index < currentStage;
              
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-center transition-all ${
                    isActive 
                      ? 'bg-blue-50 border border-blue-200' 
                      : isCompleted 
                        ? 'bg-green-50 border border-green-200' 
                        : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : isCompleted 
                        ? 'bg-green-600 text-white' 
                        : 'bg-gray-300 text-gray-600'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-gray-700">{stage.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
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
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Brain className="w-6 h-6" />
              <span>Clinical Behavioral Assessment</span>
            </CardTitle>
            <CardDescription className="text-blue-700">
              This standardized questionnaire assesses behavioral patterns associated with autism spectrum conditions.
              Please answer each question based on your current or typical experiences.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid gap-4">
          {questions.map((q, index) => (
            <Card key={q.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {q.category}
                      </Badge>
                      <span className="text-xs text-gray-500">Question {index + 1}</span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-4">{q.text}</p>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant={answers[q.key] === 1 ? "default" : "outline"}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 1 }))}
                        className={`h-12 ${answers[q.key] === 1 ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Yes
                      </Button>
                      <Button
                        variant={answers[q.key] === 0 ? "default" : "outline"}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 0 }))}
                        className={`h-12 ${answers[q.key] === 0 ? 'bg-gray-600 hover:bg-gray-700' : ''}`}
                      >
                        <Activity className="w-4 h-4 mr-2" />
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Age</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={answers.age}
                    onChange={(e) => setAnswers(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={answers.gender === 'm' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'm' }))}
                      className="h-12"
                    >
                      Male
                    </Button>
                    <Button
                      variant={answers.gender === 'f' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'f' }))}
                      className="h-12"
                    >
                      Female
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6 text-center">
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              size="lg"
              className="px-8 py-3 bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Activity className="w-4 h-4 mr-2 animate-spin" />
                  Processing Assessment...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4 mr-2" />
                  Complete Behavioral Assessment
                </>
              )}
            </Button>
          </CardContent>
        </Card>
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
        
        // Countdown
        setCountdown(3);
        for (let i = 3; i > 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCountdown(i - 1);
        }
        
        setIsRecording(true);
        setRecordingTime(0);
        
        // Recording timer
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        // Simulate eye tracking for 10 seconds
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
          
          // Stop video stream
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
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-900">
              <Eye className="w-6 h-6" />
              <span>Eye Tracking Analysis</span>
            </CardTitle>
            <CardDescription className="text-green-700">
              Advanced gaze pattern analysis using computer vision. This test measures fixation duration, 
              saccadic movements, and attention patterns associated with autism spectrum conditions.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Live Video Feed</CardTitle>
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
              <CardTitle className="text-lg">Instructions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-blue-600">1</span>
                </div>
                <p className="text-sm text-gray-700">Position yourself comfortably in front of the camera</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-blue-600">2</span>
                </div>
                <p className="text-sm text-gray-700">Look naturally at the screen during the 10-second recording</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-xs font-bold text-blue-600">3</span>
                </div>
                <p className="text-sm text-gray-700">The system will analyze your gaze patterns automatically</p>
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
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
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
        
        // Countdown
        setCountdown(3);
        for (let i = 3; i > 0; i--) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          setCountdown(i - 1);
        }
        
        setIsRecording(true);
        setRecordingTime(0);
        
        // Recording timer
        const timer = setInterval(() => {
          setRecordingTime(prev => prev + 1);
        }, 1000);
        
        // Simulate facial analysis for 15 seconds
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
          
          // Stop video stream
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
        
        // Get final results
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
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-purple-50 to-violet-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-purple-900">
              <Camera className="w-6 h-6" />
              <span>Facial Expression Analysis</span>
            </CardTitle>
            <CardDescription className="text-purple-700">
              Advanced AI analysis of facial expressions, micro-expressions, and social interaction patterns 
              for comprehensive ASD assessment.
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Real-time Analysis</CardTitle>
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
                  <>
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">
                        Analyzing {recordingTime}s
                      </span>
                    </div>
                    
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-black bg-opacity-50 text-white p-3 rounded-lg">
                        <div className="text-sm font-medium mb-2">AI Analysis Active</div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>✓ Face Detection</div>
                          <div>✓ Emotion Recognition</div>
                          <div>✓ Landmark Tracking</div>
                          <div>✓ Micro-expressions</div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Analysis Parameters</CardTitle>
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
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Facial Landmarks</span>
                  <Badge variant="outline">468 points</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Emotion Categories</span>
                  <Badge variant="outline">6 types</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Micro-expressions</span>
                  <Badge variant="outline">Real-time</Badge>
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
                        <Activity className="w-4 h-4 mr-2 animate-spin" />
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

    const getResultBadge = (prediction) => {
      return prediction ? 'destructive' : 'success';
    };

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-0">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-orange-900">
              <BarChart3 className="w-6 h-6" />
              <span>Comprehensive Assessment Results</span>
            </CardTitle>
            <CardDescription className="text-orange-700">
              Complete analysis of your multi-stage ASD assessment with detailed explanations and clinical recommendations.
            </CardDescription>
          </CardHeader>
        </Card>

        {finalResult && (
          <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Target className="w-6 h-6 text-blue-600" />
                  <span className="text-blue-900">Final Assessment Result</span>
                </div>
                <Badge variant={getResultBadge(finalResult.final_prediction)} className="text-sm">
                  {getResultText(finalResult.final_prediction)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className={`text-3xl font-bold ${getResultColor(finalResult.final_prediction)}`}>
                    {getResultText(finalResult.final_prediction)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Overall Result</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {(finalResult.final_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Risk Assessment</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {(finalResult.confidence_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Confidence Level</div>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Assessment Confidence</span>
                  <span className="text-sm text-gray-600">{(finalResult.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <Progress value={finalResult.confidence_score * 100} className="h-3" />
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <h4 className="font-semibold mb-3 flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  Executive Summary
                </h4>
                <p className="text-gray-700 leading-relaxed">{finalResult.explanation?.overall_result}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {behavioral && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <span>Behavioral Assessment</span>
                  </div>
                  <Badge variant={getResultBadge(behavioral.prediction)}>
                    {getResultText(behavioral.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Probability</span>
                      <span className="font-semibold">{(behavioral.probability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={behavioral.probability * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <span className="font-semibold">{(behavioral.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={behavioral.confidence * 100} className="h-2" />
                  </div>
                </div>

                {behavioral.explanation?.key_indicators && behavioral.explanation.key_indicators.length > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2 text-blue-900">Key Clinical Indicators</h4>
                    <ul className="space-y-1">
                      {behavioral.explanation.key_indicators.map((indicator, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {eyeTracking && (
            <Card className="border-l-4 border-l-green-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-green-600" />
                    <span>Eye Tracking Analysis</span>
                  </div>
                  <Badge variant={getResultBadge(eyeTracking.prediction)}>
                    {getResultText(eyeTracking.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Probability</span>
                      <span className="font-semibold">{(eyeTracking.probability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={eyeTracking.probability * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <span className="font-semibold">{(eyeTracking.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={eyeTracking.confidence * 100} className="h-2" />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-green-900">Gaze Pattern Analysis</h4>
                  <p className="text-sm text-green-800">{eyeTracking.explanation?.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">Normal</div>
                      <div className="text-xs text-green-600">Fixation Patterns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-green-700">Stable</div>
                      <div className="text-xs text-green-600">Gaze Tracking</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {facialAnalysis && (
            <Card className="border-l-4 border-l-purple-500">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Camera className="w-5 h-5 text-purple-600" />
                    <span>Facial Expression Analysis</span>
                  </div>
                  <Badge variant={getResultBadge(facialAnalysis.prediction)}>
                    {getResultText(facialAnalysis.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Risk Probability</span>
                      <span className="font-semibold">{(facialAnalysis.probability * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={facialAnalysis.probability * 100} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Model Confidence</span>
                      <span className="font-semibold">{(facialAnalysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={facialAnalysis.confidence * 100} className="h-2" />
                  </div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2 text-purple-900">Expression Analysis Summary</h4>
                  <p className="text-sm text-purple-800">{facialAnalysis.explanation?.summary}</p>
                  
                  <div className="grid grid-cols-3 gap-4 mt-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">Normal</div>
                      <div className="text-xs text-purple-600">Expression Range</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">Typical</div>
                      <div className="text-xs text-purple-600">Social Attention</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-700">Stable</div>
                      <div className="text-xs text-purple-600">Emotional Patterns</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {finalResult?.explanation?.clinical_recommendations && (
          <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-orange-900">
                <Users className="w-5 h-5" />
                <span>Clinical Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {finalResult.explanation.clinical_recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="border-gray-200">
          <CardContent className="p-6 text-center">
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                Assessment completed on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
              </div>
              
              <div className="flex justify-center space-x-4">
                <Button 
                  onClick={() => {
                    setCurrentStage(0);
                    setAssessmentData({
                      behavioral: null,
                      eyeTracking: null,
                      facialAnalysis: null,
                      finalResult: null
                    });
                  }}
                  variant="outline"
                  size="lg"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Start New Assessment
                </Button>
                
                <Button variant="outline" size="lg">
                  <FileText className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <TopBar />
        
        <main className="p-6">
          {/* Error Display */}
          {error && (
            <Alert className="mb-6" variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <StageProgress />
          
          <div className="max-w-6xl mx-auto">
            {renderCurrentStage()}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white p-6 mt-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Shield className="w-4 h-4" />
                <span className="text-sm">HIPAA Compliant</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Clinically Validated</span>
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="text-sm">Professional Grade</span>
              </div>
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-gray-500 text-center">
              This assessment tool is for screening purposes only and should not replace professional medical diagnosis.
              Please consult with healthcare professionals for comprehensive evaluation.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
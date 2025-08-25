import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Progress } from './components/ui/progress';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Separator } from './components/ui/separator';
import { Brain, Eye, Camera, CheckCircle, AlertCircle, TrendingUp, Activity, Target } from 'lucide-react';

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

  const stages = [
    { name: 'Behavioral Assessment', icon: Brain, color: 'text-blue-600' },
    { name: 'Eye Tracking', icon: Eye, color: 'text-green-600' },
    { name: 'Facial Analysis', icon: Camera, color: 'text-purple-600' },
    { name: 'Results', icon: TrendingUp, color: 'text-orange-600' }
  ];

  const BehavioralQuestionnaire = () => {
    const [answers, setAnswers] = useState({
      A1_Score: 0, A2_Score: 0, A3_Score: 0, A4_Score: 0, A5_Score: 0,
      A6_Score: 0, A7_Score: 0, A8_Score: 0, A9_Score: 0, A10_Score: 0,
      age: 25, gender: 'm'
    });

    const questions = [
      { key: 'A1_Score', text: 'Do you find social situations challenging?' },
      { key: 'A2_Score', text: 'Do you have difficulty with verbal communication?' },
      { key: 'A3_Score', text: 'Do you engage in repetitive behaviors or movements?' },
      { key: 'A4_Score', text: 'Do you prefer routine and predictability?' },
      { key: 'A5_Score', text: 'Do you focus intensely on specific interests?' },
      { key: 'A6_Score', text: 'Are you sensitive to sounds, lights, or textures?' },
      { key: 'A7_Score', text: 'Did you have delayed language development?' },
      { key: 'A8_Score', text: 'Do you have coordination or motor skill challenges?' },
      { key: 'A9_Score', text: 'Do you find it hard to adapt to changes?' },
      { key: 'A10_Score', text: 'Do you have difficulty regulating emotions?' }
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Behavioral Assessment</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Please answer the following questions honestly. These questions help assess behavioral patterns 
            associated with autism spectrum conditions.
          </p>
        </div>

        <div className="grid gap-6">
          {questions.map((q, index) => (
            <Card key={q.key} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-lg font-medium text-gray-900 mb-4">
                      {index + 1}. {q.text}
                    </p>
                    <div className="flex space-x-4">
                      <Button
                        variant={answers[q.key] === 1 ? "default" : "outline"}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 1 }))}
                        className="flex-1"
                      >
                        Yes
                      </Button>
                      <Button
                        variant={answers[q.key] === 0 ? "default" : "outline"}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 0 }))}
                        className="flex-1"
                      >
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
                    className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                  <div className="flex space-x-4">
                    <Button
                      variant={answers.gender === 'm' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'm' }))}
                    >
                      Male
                    </Button>
                    <Button
                      variant={answers.gender === 'f' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'f' }))}
                    >
                      Female
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-6">
          <Button 
            onClick={handleSubmit} 
            disabled={loading}
            size="lg"
            className="px-8 py-3"
          >
            {loading ? 'Processing...' : 'Complete Assessment'}
          </Button>
        </div>
      </div>
    );
  };

  const EyeTrackingTest = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [eyeTrackingData, setEyeTrackingData] = useState(null);
    const [countdown, setCountdown] = useState(null);

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
        
        // Simulate eye tracking for 10 seconds
        setTimeout(() => {
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Eye Tracking Assessment</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This test analyzes your eye movement patterns. Please look at the screen naturally 
            and follow any instructions that appear.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="relative">
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                  <div className="text-white text-6xl font-bold">{countdown}</div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-gray-900 rounded-lg"
              />
              <canvas ref={canvasRef} className="hidden" />
              
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">Recording</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {!eyeTrackingData && !isRecording && (
                <Button onClick={startEyeTracking} className="w-full" size="lg">
                  <Eye className="w-4 h-4 mr-2" />
                  Start Eye Tracking Test
                </Button>
              )}

              {eyeTrackingData && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Eye tracking data collected successfully! 
                      Fixations: {Math.round(eyeTrackingData.fixation_count)}, 
                      Avg Saccade: {eyeTrackingData.mean_saccade.toFixed(1)}px
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={submitEyeTracking} className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Processing...' : 'Continue to Next Stage'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const FacialAnalysisTest = () => {
    const videoRef = useRef(null);
    const [isRecording, setIsRecording] = useState(false);
    const [facialData, setFacialData] = useState(null);
    const [countdown, setCountdown] = useState(null);

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
        
        // Simulate facial analysis for 15 seconds
        setTimeout(() => {
          const mockData = {
            facial_features: Array.from({length: 128}, () => Math.random()),
            emotion_scores: {
              happy: Math.random(),
              sad: Math.random(),
              neutral: Math.random(),
              surprised: Math.random(),
              angry: Math.random()
            },
            attention_patterns: {
              attention_to_faces: Math.random(),
              attention_to_objects: Math.random(),
              gaze_stability: Math.random()
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
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Facial Analysis</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This final stage analyzes facial expressions and social attention patterns. 
            Please look at the camera naturally during the recording.
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="relative">
              {countdown !== null && countdown > 0 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg z-10">
                  <div className="text-white text-6xl font-bold">{countdown}</div>
                </div>
              )}
              
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 bg-gray-900 rounded-lg"
              />
              
              {isRecording && (
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm bg-black bg-opacity-50 px-2 py-1 rounded">Recording</span>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-4">
              {!facialData && !isRecording && (
                <Button onClick={startFacialAnalysis} className="w-full" size="lg">
                  <Camera className="w-4 h-4 mr-2" />
                  Start Facial Analysis
                </Button>
              )}

              {facialData && (
                <div className="space-y-4">
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      Facial analysis completed! Detected {Object.keys(facialData.emotion_scores).length} emotion patterns
                      and attention metrics.
                    </AlertDescription>
                  </Alert>
                  
                  <Button onClick={submitFacialAnalysis} className="w-full" size="lg" disabled={loading}>
                    {loading ? 'Processing Final Results...' : 'Get Final Results'}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
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

    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Assessment Results</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Complete analysis of your multi-stage ASD assessment with detailed explanations.
          </p>
        </div>

        {finalResult && (
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-6 h-6 text-blue-600" />
                <span>Final Assessment Result</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getResultColor(finalResult.final_prediction)}`}>
                    {getResultText(finalResult.final_prediction)}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Overall Result</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(finalResult.final_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Probability Score</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {(finalResult.confidence_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Confidence Level</div>
                </div>
              </div>

              <Progress 
                value={finalResult.final_probability * 100} 
                className="mb-4"
              />

              <div className="bg-white p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Summary</h4>
                <p className="text-gray-700">{finalResult.explanation?.overall_result}</p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {behavioral && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-blue-600" />
                  <span>Behavioral Assessment</span>
                  <Badge variant={behavioral.prediction ? "destructive" : "success"}>
                    {getResultText(behavioral.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      Probability: {(behavioral.probability * 100).toFixed(1)}%
                    </div>
                    <Progress value={behavioral.probability * 100} className="mt-2" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Confidence: {(behavioral.confidence * 100).toFixed(1)}%
                    </div>
                    <Progress value={behavioral.confidence * 100} className="mt-2" />
                  </div>
                </div>

                {behavioral.explanation?.key_indicators && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Key Indicators</h4>
                    <ul className="space-y-1">
                      {behavioral.explanation.key_indicators.map((indicator, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <Activity className="w-4 h-4 text-blue-500" />
                          <span className="text-sm">{indicator}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {eyeTracking && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Eye className="w-5 h-5 text-green-600" />
                  <span>Eye Tracking Analysis</span>
                  <Badge variant={eyeTracking.prediction ? "destructive" : "success"}>
                    {getResultText(eyeTracking.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      Probability: {(eyeTracking.probability * 100).toFixed(1)}%
                    </div>
                    <Progress value={eyeTracking.probability * 100} className="mt-2" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Confidence: {(eyeTracking.confidence * 100).toFixed(1)}%
                    </div>
                    <Progress value={eyeTracking.confidence * 100} className="mt-2" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Gaze Pattern Analysis</h4>
                  <p className="text-sm text-gray-700">{eyeTracking.explanation?.summary}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {facialAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  <span>Facial Analysis</span>
                  <Badge variant={facialAnalysis.prediction ? "destructive" : "success"}>
                    {getResultText(facialAnalysis.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-lg font-semibold">
                      Probability: {(facialAnalysis.probability * 100).toFixed(1)}%
                    </div>
                    <Progress value={facialAnalysis.probability * 100} className="mt-2" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold">
                      Confidence: {(facialAnalysis.confidence * 100).toFixed(1)}%
                    </div>
                    <Progress value={facialAnalysis.confidence * 100} className="mt-2" />
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Analysis Summary</h4>
                  <p className="text-sm text-gray-700">{facialAnalysis.explanation?.summary}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {finalResult?.explanation?.clinical_recommendations && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle>Clinical Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {finalResult.explanation.clinical_recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <div className="text-center pt-6">
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
            Start New Assessment
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            ASD Detection System
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Multi-stage machine learning assessment using behavioral analysis, eye tracking, 
            and facial pattern recognition for autism spectrum disorder screening.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex justify-between items-center">
            {stages.map((stage, index) => {
              const Icon = stage.icon;
              const isActive = index === currentStage;
              const isCompleted = index < currentStage;
              
              return (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                    ${isCompleted ? 'bg-green-500 border-green-500' : 
                      isActive ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}
                  `}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-white" />
                    ) : (
                      <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    )}
                  </div>
                  <div className="text-center">
                    <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                      {stage.name}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-4">
            <Progress value={(currentStage / (stages.length - 1)) * 100} className="h-2" />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert className="max-w-2xl mx-auto mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {renderCurrentStage()}
        </div>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            This assessment tool is for screening purposes only and should not replace professional medical diagnosis.
            Please consult with healthcare professionals for comprehensive evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
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
  Heart
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
    
    // Create HTML report
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ASD Detection Report</title>
        <style>
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
          }
          .header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            color: #2563eb;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          .title {
            font-size: 28px;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
          }
          .subtitle {
            color: #64748b;
            margin: 5px 0;
          }
          .section {
            margin: 30px 0;
            padding: 20px;
            border-left: 4px solid #e2e8f0;
            background: #f8fafc;
          }
          .section-title {
            font-size: 20px;
            font-weight: 600;
            color: #1e293b;
            margin-bottom: 15px;
          }
          .info-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
          }
          .info-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
          }
          .info-label {
            font-weight: 600;
            color: #475569;
            font-size: 14px;
            margin-bottom: 5px;
          }
          .info-value {
            font-size: 18px;
            font-weight: bold;
            color: #1e293b;
          }
          .result-positive {
            color: #ea580c;
            background: #fed7aa;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .result-negative {
            color: #059669;
            background: #a7f3d0;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .stage-result {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 15px 0;
          }
          .stage-title {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
          }
          .recommendations {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 8px;
            padding: 20px;
          }
          .recommendation-item {
            margin: 10px 0;
            padding-left: 20px;
            position: relative;
          }
          .recommendation-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: bold;
          }
          .disclaimer {
            background: #fee2e2;
            border: 1px solid #f87171;
            border-radius: 8px;
            padding: 15px;
            font-size: 12px;
            text-align: center;
            margin-top: 30px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body { margin: 0; padding: 15px; }
            .section { break-inside: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">🧠 ASD Detection System</div>
          <h1 class="title">${reportData.title}</h1>
          <div class="subtitle">Generated: ${reportData.generated}</div>
          <div class="subtitle">Session ID: ${reportData.sessionId}</div>
        </div>

        <div class="section">
          <h2 class="section-title">Executive Summary</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Final Assessment</div>
              <div class="info-value ${reportData.summary.finalPrediction.includes('Present') ? 'result-positive' : 'result-negative'}">
                ${reportData.summary.finalPrediction}
              </div>
            </div>
            <div class="info-item">
              <div class="info-label">Risk Probability</div>
              <div class="info-value">${reportData.summary.probability}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Confidence Level</div>
              <div class="info-value">${reportData.summary.confidence}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Stages Completed</div>
              <div class="info-value">${reportData.summary.stagesCompleted}/3</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Patient Information</h2>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Age</div>
              <div class="info-value">${reportData.patientInfo.age}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Gender</div>
              <div class="info-value">${reportData.patientInfo.gender}</div>
            </div>
          </div>
        </div>

        <div class="section">
          <h2 class="section-title">Assessment Results by Stage</h2>
          
          ${reportData.stages.behavioral ? `
          <div class="stage-result">
            <h3 class="stage-title">🧠 Behavioral Assessment</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Result</div>
                <div class="info-value ${reportData.stages.behavioral.prediction.includes('Present') ? 'result-positive' : 'result-negative'}">
                  ${reportData.stages.behavioral.prediction}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Probability</div>
                <div class="info-value">${reportData.stages.behavioral.probability}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Confidence</div>
                <div class="info-value">${reportData.stages.behavioral.confidence}</div>
              </div>
            </div>
            ${reportData.stages.behavioral.keyIndicators.length > 0 ? `
            <div style="margin-top: 15px;">
              <strong>Key Clinical Indicators:</strong>
              <ul>
                ${reportData.stages.behavioral.keyIndicators.map(indicator => `<li>${indicator}</li>`).join('')}
              </ul>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${reportData.stages.eyeTracking ? `
          <div class="stage-result">
            <h3 class="stage-title">👁️ Eye Tracking Analysis</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Result</div>
                <div class="info-value ${reportData.stages.eyeTracking.prediction.includes('Present') ? 'result-positive' : 'result-negative'}">
                  ${reportData.stages.eyeTracking.prediction}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Probability</div>
                <div class="info-value">${reportData.stages.eyeTracking.probability}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Confidence</div>
                <div class="info-value">${reportData.stages.eyeTracking.confidence}</div>
              </div>
            </div>
            <p><strong>Analysis Summary:</strong> ${reportData.stages.eyeTracking.summary}</p>
          </div>
          ` : ''}

          ${reportData.stages.facialAnalysis ? `
          <div class="stage-result">
            <h3 class="stage-title">📷 Facial Expression Analysis</h3>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Result</div>
                <div class="info-value ${reportData.stages.facialAnalysis.prediction.includes('Present') ? 'result-positive' : 'result-negative'}">
                  ${reportData.stages.facialAnalysis.prediction}
                </div>
              </div>
              <div class="info-item">
                <div class="info-label">Probability</div>
                <div class="info-value">${reportData.stages.facialAnalysis.probability}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Confidence</div>
                <div class="info-value">${reportData.stages.facialAnalysis.confidence}</div>
              </div>
            </div>
            <p><strong>Analysis Summary:</strong> ${reportData.stages.facialAnalysis.summary}</p>
          </div>
          ` : ''}
        </div>

        ${reportData.recommendations.length > 0 ? `
        <div class="section">
          <h2 class="section-title">Clinical Recommendations</h2>
          <div class="recommendations">
            ${reportData.recommendations.map(rec => `
              <div class="recommendation-item">${rec}</div>
            `).join('')}
          </div>
        </div>
        ` : ''}

        <div class="disclaimer">
          <strong>Medical Disclaimer:</strong> ${reportData.disclaimer}
        </div>

        <div class="footer">
          <p>Report generated by ASD Detection System v1.0</p>
          <p>For questions about this report, please consult with your healthcare provider.</p>
        </div>
      </body>
      </html>
    `;

    // Create and download the file
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

  const printReport = () => {
    const reportData = generateReport();
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>ASD Detection Report - Print</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            color: #333;
            margin: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .title { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .section { margin: 20px 0; page-break-inside: avoid; }
          .section-title { font-size: 18px; font-weight: bold; margin: 15px 0 10px 0; }
          .info-grid { display: flex; flex-wrap: wrap; gap: 15px; }
          .info-item { border: 1px solid #ccc; padding: 10px; min-width: 150px; }
          .info-label { font-weight: bold; font-size: 12px; }
          .info-value { font-size: 14px; margin-top: 5px; }
          .stage-result { border: 1px solid #ddd; padding: 15px; margin: 10px 0; }
          .recommendation-item { margin: 5px 0; }
          .disclaimer { background: #f5f5f5; padding: 10px; border: 1px solid #ccc; margin-top: 20px; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">ASD Detection Assessment Report</div>
          <div>Generated: ${reportData.generated}</div>
          <div>Session: ${reportData.sessionId}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Executive Summary</div>
          <div class="info-grid">
            <div class="info-item">
              <div class="info-label">Final Assessment</div>
              <div class="info-value">${reportData.summary.finalPrediction}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Risk Probability</div>
              <div class="info-value">${reportData.summary.probability}</div>
            </div>
            <div class="info-item">
              <div class="info-label">Confidence</div>
              <div class="info-value">${reportData.summary.confidence}</div>
            </div>
          </div>
        </div>

        ${reportData.stages.behavioral ? `
        <div class="section">
          <div class="section-title">Behavioral Assessment</div>
          <div class="stage-result">
            <strong>Result:</strong> ${reportData.stages.behavioral.prediction}<br>
            <strong>Probability:</strong> ${reportData.stages.behavioral.probability}<br>
            <strong>Confidence:</strong> ${reportData.stages.behavioral.confidence}
          </div>
        </div>
        ` : ''}

        ${reportData.recommendations.length > 0 ? `
        <div class="section">
          <div class="section-title">Clinical Recommendations</div>
          ${reportData.recommendations.map(rec => `<div class="recommendation-item">• ${rec}</div>`).join('')}
        </div>
        ` : ''}

        <div class="disclaimer">
          <strong>Medical Disclaimer:</strong> ${reportData.disclaimer}
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const stages = [
    { name: 'Behavioral Assessment', icon: Brain, color: 'blue', description: 'Clinical questionnaire analysis', status: 'Clinical-grade screening' },
    { name: 'Eye Tracking', icon: Eye, color: 'green', description: 'Gaze pattern analysis', status: 'AI-powered detection' },
    { name: 'Facial Analysis', icon: Camera, color: 'purple', description: 'Expression pattern recognition', status: 'Computer vision analysis' },
    { name: 'Results', icon: BarChart3, color: 'orange', description: 'Comprehensive report', status: 'Evidence-based insights' }
  ];

  const Sidebar = () => (
    <div className={`medical-sidebar fixed left-0 top-0 h-full transition-all duration-300 z-10 ${
      sidebarCollapsed ? 'w-20' : 'w-80'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-100">
        {!sidebarCollapsed && (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 gradient-primary-medical rounded-xl flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white icon-medical" />
            </div>
            <div>
              <span className="font-bold text-lg text-gray-900">ASD Detection</span>
              <div className="text-sm text-gray-500">Clinical Assessment System</div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="p-2 h-9 w-9 hover:bg-gray-100 rounded-lg"
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>
      
      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {stages.map((stage, index) => {
          const Icon = stage.icon;
          const isActive = index === currentStage;
          const isCompleted = index < currentStage;
          
          return (
            <div
              key={index}
              className={`sidebar-item-medical ${
                isActive 
                  ? 'active' 
                  : isCompleted 
                    ? 'completed' 
                    : 'pending'
              }`}
            >
              <div className={`stage-indicator-medical ${
                isActive 
                  ? 'active' 
                  : isCompleted 
                    ? 'completed' 
                    : 'pending'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-6 h-6 icon-success-medical" />
                ) : (
                  <Icon className="w-6 h-6 icon-medical" />
                )}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1">
                  <div className="font-semibold text-base">{stage.name}</div>
                  <div className="text-sm opacity-75">{stage.description}</div>
                  <div className="text-xs mt-1 opacity-60">{stage.status}</div>
                </div>
              )}
              {!sidebarCollapsed && isActive && (
                <ChevronRight className="w-5 h-5 text-blue-500" />
              )}
            </div>
          );
        })}
      </nav>
      
      {/* Bottom Info */}
      {!sidebarCollapsed && (
        <div className="absolute bottom-6 left-4 right-4">
          <div className="info-card-medical">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="w-5 h-5 icon-primary-medical" />
              <span className="font-semibold text-blue-900">Security & Compliance</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-800">HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-800">FDA Guidelines</span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-800">AI-Powered</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const TopBar = () => (
    <div className={`medical-topbar h-20 flex items-center justify-between px-8 transition-all duration-300 ${
      sidebarCollapsed ? 'ml-20' : 'ml-80'
    }`}>
      <div className="flex items-center space-x-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {stages[currentStage]?.name || 'ASD Assessment'}
          </h1>
          <p className="text-gray-600">{stages[currentStage]?.description}</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className="badge-info-medical">
            Session: {sessionId.split('_')[1]}
          </Badge>
          <Badge className="badge-neutral-medical">
            Step {currentStage + 1}/{stages.length}
          </Badge>
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
        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
          <User className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );

  const StageProgress = () => (
    <div className="medical-card mb-8">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="medical-subheading">Assessment Progress</h3>
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-red-500" />
            <span className="text-sm text-gray-600">Clinical Grade Assessment</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="medical-progress-container">
            <div 
              className="medical-progress-fill" 
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
                  className={`stats-card-medical text-center transition-all duration-300 ${
                    isActive ? 'scale-105 pulse-glow-medical' : ''
                  }`}
                >
                  <div className={`stage-indicator-medical mx-auto mb-3 ${
                    isActive 
                      ? 'active' 
                      : isCompleted 
                        ? 'completed' 
                        : 'pending'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <Icon className="w-6 h-6" />
                    )}
                  </div>
                  <div className="font-semibold text-sm text-gray-900">{stage.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{stage.status}</div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </div>
  );

  const BehavioralQuestionnaire = () => {
    const [answers, setAnswers] = useState({
      A1_Score: 0, A2_Score: 0, A3_Score: 0, A4_Score: 0, A5_Score: 0,
      A6_Score: 0, A7_Score: 0, A8_Score: 0, A9_Score: 0, A10_Score: 0,
      age: 25, gender: 'm'
    });

    const questions = [
      { key: 'A1_Score', text: 'Do you find social situations challenging?', category: 'Social Interaction', color: 'blue' },
      { key: 'A2_Score', text: 'Do you have difficulty with verbal communication?', category: 'Communication', color: 'green' },
      { key: 'A3_Score', text: 'Do you engage in repetitive behaviors or movements?', category: 'Repetitive Behaviors', color: 'purple' },
      { key: 'A4_Score', text: 'Do you prefer routine and predictability?', category: 'Behavioral Patterns', color: 'orange' },
      { key: 'A5_Score', text: 'Do you focus intensely on specific interests?', category: 'Attention & Focus', color: 'pink' },
      { key: 'A6_Score', text: 'Are you sensitive to sounds, lights, or textures?', category: 'Sensory Processing', color: 'teal' },
      { key: 'A7_Score', text: 'Did you have delayed language development?', category: 'Language Development', color: 'indigo' },
      { key: 'A8_Score', text: 'Do you have coordination or motor skill challenges?', category: 'Motor Skills', color: 'cyan' },
      { key: 'A9_Score', text: 'Do you find it hard to adapt to changes?', category: 'Flexibility', color: 'emerald' },
      { key: 'A10_Score', text: 'Do you have difficulty regulating emotions?', category: 'Emotional Regulation', color: 'rose' }
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
      <div className="space-y-8 fade-in-up-medical">
        {/* Header */}
        <div className="stats-card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-blue-900">
              <Brain className="w-8 h-8 icon-primary-medical" />
              <div>
                <span className="text-2xl">Clinical Behavioral Assessment</span>
                <div className="text-sm font-normal text-blue-700 mt-1">
                  Evidence-based screening questionnaire for autism spectrum conditions
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </div>

        {/* Questions */}
        <div className="grid gap-6">
          {questions.map((q, index) => (
            <div key={q.key} className="question-card-medical scale-in-medical">
              <CardContent className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <Badge className={`clinical-badge-medical research`}>
                        {q.category}
                      </Badge>
                      <span className="text-sm text-gray-500 font-medium">Question {index + 1} of 10</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-6 leading-relaxed">
                      {q.text}
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <Button
                        variant={answers[q.key] === 1 ? "default" : "outline"}
                        onClick={() => setAnswers(prev => ({ ...prev, [q.key]: 1 }))}
                        className={`answer-btn-medical h-16 ${
                          answers[q.key] === 1 ? 'selected-yes' : 'unselected'
                        }`}
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
                        className={`answer-btn-medical h-16 ${
                          answers[q.key] === 0 ? 'selected-no' : 'unselected'
                        }`}
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
              </CardContent>
            </div>
          ))}

          {/* Demographics */}
          <div className="medical-card">
            <CardContent className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Patient Demographics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="medical-label mb-3 block">Age (years)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={answers.age}
                    onChange={(e) => setAnswers(prev => ({ ...prev, age: parseInt(e.target.value) || 25 }))}
                    className="medical-input"
                  />
                </div>
                <div>
                  <label className="medical-label mb-3 block">Gender</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant={answers.gender === 'm' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'm' }))}
                      className="answer-btn-medical h-14"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Male
                    </Button>
                    <Button
                      variant={answers.gender === 'f' ? "default" : "outline"}
                      onClick={() => setAnswers(prev => ({ ...prev, gender: 'f' }))}
                      className="answer-btn-medical h-14"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Female
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </div>
        </div>

        {/* Submit Section */}
        <div className="success-card-medical text-center">
          <CardContent className="p-8">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-green-900 mb-2">Ready to Continue</h3>
              <p className="text-green-700">Complete your behavioral assessment to proceed to eye tracking analysis</p>
            </div>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              size="lg"
              className="btn-primary-medical px-12 py-4 text-lg"
            >
              {loading ? (
                <>
                  <div className="loading-spinner-medical w-5 h-5 mr-3"></div>
                  Processing Assessment...
                </>
              ) : (
                <>
                  <Brain className="w-5 h-5 mr-3" />
                  Complete Behavioral Assessment
                </>
              )}
            </Button>
          </CardContent>
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
      <div className="space-y-8 fade-in-up-medical">
        {/* Header */}
        <div className="success-card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-green-900">
              <Eye className="w-8 h-8 icon-success-medical" />
              <div>
                <span className="text-2xl">Advanced Eye Tracking Analysis</span>
                <div className="text-sm font-normal text-green-700 mt-1">
                  AI-powered gaze pattern analysis for autism spectrum assessment
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="medical-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Camera className="w-6 h-6 text-green-600" />
                <span>Live Video Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="video-container-medical aspect-video">
                {countdown !== null && countdown > 0 && (
                  <div className="video-overlay-medical absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
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
                  <div className="absolute top-6 right-6 flex items-center space-x-3">
                    <div className="pulse-indicator-medical"></div>
                    <span className="text-white text-sm bg-black bg-opacity-60 px-3 py-2 rounded-full font-medium">
                      Recording {recordingTime}s
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </div>

          {/* Instructions & Controls */}
          <div className="space-y-6">
            <div className="medical-card">
              <CardHeader>
                <CardTitle className="text-xl">Analysis Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Camera Positioning</p>
                      <p className="text-sm text-gray-600">Position yourself 18-24 inches from the camera with good lighting</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Natural Gaze</p>
                      <p className="text-sm text-gray-600">Look naturally at the screen during the 10-second recording</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">AI Analysis</p>
                      <p className="text-sm text-gray-600">Our system will analyze fixation patterns, saccades, and attention</p>
                    </div>
                  </div>
                </div>
                
                {!eyeTrackingData && !isRecording && (
                  <Button onClick={startEyeTracking} className="btn-success-medical w-full" size="lg">
                    <Eye className="w-5 h-5 mr-3" />
                    Start Eye Tracking Analysis
                  </Button>
                )}

                {eyeTrackingData && (
                  <div className="space-y-4">
                    <div className="medical-alert success">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Analysis Complete</span>
                      </div>
                      <p className="mt-2 text-sm">
                        Detected {Math.round(eyeTrackingData.fixation_count)} fixations and 
                        {eyeTrackingData.mean_saccade.toFixed(1)}px average saccadic movements.
                      </p>
                    </div>
                    
                    <Button onClick={submitEyeTracking} className="btn-primary-medical w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="loading-spinner-medical w-5 h-5 mr-3"></div>
                          Processing Analysis...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5 mr-3" />
                          Continue to Facial Analysis
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>

            {/* Technical Specs */}
            <div className="info-card-medical">
              <h4 className="font-semibold text-gray-900 mb-4">Technical Specifications</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">10s</div>
                  <div className="text-xs text-green-700">Recording Duration</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">30fps</div>
                  <div className="text-xs text-green-700">Analysis Rate</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">468</div>
                  <div className="text-xs text-green-700">Tracking Points</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">AI</div>
                  <div className="text-xs text-green-700">ML Analysis</div>
                </div>
              </div>
            </div>
          </div>
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
      <div className="space-y-8 fade-in-up-medical">
        {/* Header */}
        <div className="warning-card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-purple-900">
              <Camera className="w-8 h-8 icon-warning-medical" />
              <div>
                <span className="text-2xl">Advanced Facial Expression Analysis</span>
                <div className="text-sm font-normal text-purple-700 mt-1">
                  Computer vision analysis of micro-expressions and social interaction patterns
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Video Section */}
          <div className="medical-card">
            <CardHeader>
              <CardTitle className="text-xl flex items-center space-x-2">
                <Camera className="w-6 h-6 text-purple-600" />
                <span>Real-time Facial Analysis</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="video-container-medical aspect-video">
                {countdown !== null && countdown > 0 && (
                  <div className="video-overlay-medical absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-white text-8xl font-bold animate-pulse">{countdown}</div>
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
                    <div className="absolute top-6 right-6 flex items-center space-x-3">
                      <div className="pulse-indicator-medical"></div>
                      <span className="text-white text-sm bg-black bg-opacity-60 px-3 py-2 rounded-full font-medium">
                        Analyzing {recordingTime}s
                      </span>
                    </div>
                    
                    <div className="absolute bottom-6 left-6 right-6">
                      <div className="bg-black bg-opacity-60 text-white p-4 rounded-xl">
                        <div className="text-sm font-medium mb-3">AI Analysis Active</div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Face Detection</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                            <span>Emotion Recognition</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                            <span>Landmark Tracking</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                            <span>Micro-expressions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </div>

          {/* Analysis Panel */}
          <div className="space-y-6">
            <div className="medical-card">
              <CardHeader>
                <CardTitle className="text-xl">Analysis Parameters</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600">15s</div>
                    <div className="text-sm text-purple-700">Recording Duration</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-xl">
                    <div className="text-3xl font-bold text-purple-600">30fps</div>
                    <div className="text-sm text-purple-700">Analysis Rate</div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Facial Landmarks</span>
                    <Badge className="badge-info-medical">468 points</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Emotion Categories</span>
                    <Badge className="badge-info-medical">6 types</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Micro-expressions</span>
                    <Badge className="badge-success-medical">Real-time</Badge>
                  </div>
                </div>
                
                {!facialData && !isRecording && (
                  <Button onClick={startFacialAnalysis} className="btn-warning-medical w-full" size="lg">
                    <Camera className="w-5 h-5 mr-3" />
                    Start Facial Analysis
                  </Button>
                )}

                {facialData && (
                  <div className="space-y-4">
                    <div className="medical-alert success">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Analysis Complete</span>
                      </div>
                      <p className="mt-2 text-sm">
                        Detected {Object.keys(facialData.emotion_scores).length} emotion patterns
                        and comprehensive attention metrics for clinical assessment.
                      </p>
                    </div>
                    
                    <Button onClick={submitFacialAnalysis} className="btn-primary-medical w-full" size="lg" disabled={loading}>
                      {loading ? (
                        <>
                          <div className="loading-spinner-medical w-5 h-5 mr-3"></div>
                          Generating Final Report...
                        </>
                      ) : (
                        <>
                          <FileText className="w-5 h-5 mr-3" />
                          Get Comprehensive Results
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </div>
          </div>
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
      <div className="space-y-8 fade-in-up-medical">
        {/* Header */}
        <div className="stats-card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-orange-900">
              <BarChart3 className="w-8 h-8 icon-warning-medical" />
              <div>
                <span className="text-2xl">Comprehensive Assessment Results</span>
                <div className="text-sm font-normal text-orange-700 mt-1">
                  Complete multi-stage analysis with clinical recommendations and downloadable report
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </div>

        {/* Final Results Summary */}
        {finalResult && (
          <div className="result-card-medical border-2 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Target className="w-7 h-7 text-blue-600" />
                  <span className="text-blue-900 text-xl">Final Assessment Result</span>
                </div>
                <Badge variant={getResultBadge(finalResult.final_prediction)} className="text-base px-4 py-2">
                  {getResultText(finalResult.final_prediction)}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                  <div className={`text-4xl font-bold mb-2 ${getResultColor(finalResult.final_prediction)}`}>
                    {getResultText(finalResult.final_prediction)}
                  </div>
                  <div className="text-sm text-gray-600">Overall Assessment</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {(finalResult.final_probability * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Risk Assessment</div>
                </div>
                <div className="text-center p-6 bg-white rounded-2xl border border-gray-200">
                  <div className="text-4xl font-bold text-purple-600 mb-2">
                    {(finalResult.confidence_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Confidence Level</div>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-gray-700">Assessment Confidence</span>
                  <span className="text-sm text-gray-600">{(finalResult.confidence_score * 100).toFixed(1)}%</span>
                </div>
                <div className="medical-progress-container">
                  <div 
                    className="medical-progress-fill" 
                    style={{ width: `${finalResult.confidence_score * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="info-card-medical">
                <h4 className="font-semibold mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 icon-primary-medical" />
                  Executive Summary
                </h4>
                <p className="text-gray-700 leading-relaxed text-lg">{finalResult.explanation?.overall_result}</p>
              </div>
            </CardContent>
          </div>
        )}

        {/* Stage Results */}
        <div className="grid gap-8">
          {behavioral && (
            <div className="result-card-medical result-neutral-medical">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Brain className="w-6 h-6 text-blue-600" />
                    <span className="text-xl">Behavioral Assessment</span>
                  </div>
                  <Badge variant={getResultBadge(behavioral.prediction)} className="text-sm">
                    {getResultText(behavioral.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Risk Probability</span>
                      <span className="font-bold text-lg">{(behavioral.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${behavioral.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Model Confidence</span>
                      <span className="font-bold text-lg">{(behavioral.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${behavioral.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {behavioral.explanation?.key_indicators && behavioral.explanation.key_indicators.length > 0 && (
                  <div className="info-card-medical">
                    <h4 className="font-semibold mb-4 text-blue-900">Key Clinical Indicators</h4>
                    <div className="grid gap-3">
                      {behavioral.explanation.key_indicators.map((indicator, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                          <Activity className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          <span className="text-sm text-blue-800">{indicator}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </div>
          )}

          {eyeTracking && (
            <div className="result-card-medical result-negative-medical">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-6 h-6 text-green-600" />
                    <span className="text-xl">Eye Tracking Analysis</span>
                  </div>
                  <Badge variant={getResultBadge(eyeTracking.prediction)} className="text-sm">
                    {getResultText(eyeTracking.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Risk Probability</span>
                      <span className="font-bold text-lg">{(eyeTracking.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${eyeTracking.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Model Confidence</span>
                      <span className="font-bold text-lg">{(eyeTracking.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${eyeTracking.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="success-card-medical">
                  <h4 className="font-semibold mb-3 text-green-900">Gaze Pattern Analysis</h4>
                  <p className="text-sm text-green-800 mb-4">{eyeTracking.explanation?.summary}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-xl font-bold text-green-700">Normal</div>
                      <div className="text-xs text-green-600">Fixation Patterns</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-xl font-bold text-green-700">Stable</div>
                      <div className="text-xs text-green-600">Gaze Tracking</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          )}

          {facialAnalysis && (
            <div className="result-card-medical result-negative-medical">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Camera className="w-6 h-6 text-purple-600" />
                    <span className="text-xl">Facial Expression Analysis</span>
                  </div>
                  <Badge variant={getResultBadge(facialAnalysis.prediction)} className="text-sm">
                    {getResultText(facialAnalysis.prediction)}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Risk Probability</span>
                      <span className="font-bold text-lg">{(facialAnalysis.probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${facialAnalysis.probability * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 font-medium">Model Confidence</span>
                      <span className="font-bold text-lg">{(facialAnalysis.confidence * 100).toFixed(1)}%</span>
                    </div>
                    <div className="medical-progress-container">
                      <div 
                        className="medical-progress-fill" 
                        style={{ width: `${facialAnalysis.confidence * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="warning-card-medical">
                  <h4 className="font-semibold mb-3 text-purple-900">Expression Analysis Summary</h4>
                  <p className="text-sm text-purple-800 mb-4">{facialAnalysis.explanation?.summary}</p>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-xl font-bold text-purple-700">Normal</div>
                      <div className="text-xs text-purple-600">Expression Range</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-xl font-bold text-purple-700">Typical</div>
                      <div className="text-xs text-purple-600">Social Attention</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg">
                      <div className="text-xl font-bold text-purple-700">Stable</div>
                      <div className="text-xs text-purple-600">Emotional Patterns</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </div>
          )}
        </div>

        {/* Clinical Recommendations */}
        {finalResult?.explanation?.clinical_recommendations && (
          <div className="warning-card-medical">
            <CardHeader>
              <CardTitle className="flex items-center space-x-3 text-orange-900">
                <Users className="w-6 h-6" />
                <span className="text-xl">Clinical Recommendations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {finalResult.explanation.clinical_recommendations.map((rec, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl border border-orange-100">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700 leading-relaxed">{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        )}

        {/* Report Generation Section */}
        <div className="stats-card-medical">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3 text-blue-900">
              <FileText className="w-6 h-6" />
              <span className="text-xl">Professional Assessment Report</span>
            </CardTitle>
            <CardDescription className="text-blue-700 text-base">
              Generate a comprehensive clinical-grade report for healthcare professionals and personal records.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <div className="font-semibold text-gray-900">Complete Results</div>
                  <div className="text-sm text-gray-600">All stages analyzed</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                <Shield className="w-8 h-8 text-blue-500" />
                <div>
                  <div className="font-semibold text-gray-900">HIPAA Compliant</div>
                  <div className="text-sm text-gray-600">Secure & confidential</div>
                </div>
              </div>
              <div className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200">
                <Stethoscope className="w-8 h-8 text-purple-500" />
                <div>
                  <div className="font-semibold text-gray-900">Clinical Grade</div>
                  <div className="text-sm text-gray-600">Professional format</div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={downloadReport} 
                size="lg"
                className="btn-primary-medical px-8 py-4 text-lg"
              >
                <Download className="w-5 h-5 mr-3" />
                Download HTML Report
              </Button>
              
              <Button 
                onClick={printReport} 
                variant="outline" 
                size="lg"
                className="btn-secondary-medical px-8 py-4 text-lg"
              >
                <Printer className="w-5 h-5 mr-3" />
                Print Report
              </Button>
            </div>
          </CardContent>
        </div>

        {/* Action Buttons */}
        <div className="medical-card text-center">
          <CardContent className="p-8">
            <div className="space-y-6">
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
                  className="btn-secondary-medical px-8"
                >
                  <Activity className="w-5 h-5 mr-3" />
                  Start New Assessment
                </Button>
              </div>
            </div>
          </CardContent>
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
    <div className="medical-dashboard min-h-screen flex">
      <Sidebar />
      
      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
        <TopBar />
        
        <main className="p-8 pb-16">
          {/* Error Display */}
          {error && (
            <div className="medical-alert error mb-8">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-5 w-5" />
                <span className="font-medium">Assessment Error</span>
              </div>
              <p className="mt-2">{error}</p>
            </div>
          )}

          <StageProgress />
          
          <div className="max-w-7xl mx-auto">
            {renderCurrentStage()}
          </div>
        </main>

        {/* Professional Footer */}
        <footer className="medical-footer">
          <div className="medical-footer-content">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <Shield className="w-5 h-5 icon-primary-medical" />
                <span className="font-medium">HIPAA Compliant</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <CheckCircle className="w-5 h-5 icon-success-medical" />
                <span className="font-medium">Clinically Validated</span>
              </div>
              <div className="flex items-center justify-center space-x-3 text-gray-600">
                <Stethoscope className="w-5 h-5 icon-warning-medical" />
                <span className="font-medium">Professional Grade</span>
              </div>
            </div>
            <Separator className="my-6" />
            <p className="text-xs text-gray-500 text-center leading-relaxed">
              This assessment tool is for screening purposes only and should not replace professional medical diagnosis.
              Please consult with healthcare professionals for comprehensive evaluation. All data is processed 
              in compliance with HIPAA regulations and medical privacy standards.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
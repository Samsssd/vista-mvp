"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, 
  Wand2, 
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Video,
  Check,
  AlertCircle,
  Loader2,
  X
} from "lucide-react";
import { addCreation, updateCreation, CreationStatus } from "@/lib/creations";

// Generation status stages
const STATUS_MESSAGES = {
  uploading: "Upload de l'image...",
  submitting: "Envoi de la requête...",
  IN_QUEUE: "En file d'attente...",
  IN_PROGRESS: "Génération en cours...",
  COMPLETED: "Vidéo prête !",
  FAILED: "Échec de la génération",
};

function TemplateCard({ template, isSelected, onSelect, disabled }) {
  const videoRef = useRef(null);
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = () => {
    setIsHovering(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <button
      onClick={onSelect}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled}
      className={`template-video-card ${isSelected ? "template-selected" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="template-video-wrapper">
        <video
          ref={videoRef}
          src={template.previewUrl}
          muted
          loop
          playsInline
          preload="metadata"
          className="template-video"
        />
        {isSelected && (
          <div className="template-selected-badge">
            <Check size={16} strokeWidth={3} />
          </div>
        )}
        {!isHovering && !isSelected && (
          <div className="template-play-hint">
            <Play size={24} fill="currentColor" />
          </div>
        )}
      </div>
      <span className="template-video-name">{template.name}</span>
    </button>
  );
}

// Max dimensions allowed by fal.ai
const MAX_IMAGE_DIMENSION = 3850;

// Resize image if needed and convert to base64 data URI
async function processImageFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      
      // Check if resizing is needed
      if (width <= MAX_IMAGE_DIMENSION && height <= MAX_IMAGE_DIMENSION) {
        // No resize needed, just convert to data URI
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
        return;
      }
      
      // Calculate new dimensions maintaining aspect ratio
      const ratio = Math.min(MAX_IMAGE_DIMENSION / width, MAX_IMAGE_DIMENSION / height);
      const newWidth = Math.floor(width * ratio);
      const newHeight = Math.floor(height * ratio);
      
      // Create canvas and resize
      const canvas = document.createElement("canvas");
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      // Convert to data URI (JPEG for smaller file size)
      const dataUri = canvas.toDataURL("image/jpeg", 0.9);
      resolve(dataUri);
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

export default function GenerateurPage() {
  // Templates from API
  const [templates, setTemplates] = useState([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(true);
  const [templatesError, setTemplatesError] = useState(null);

  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [currentCreationId, setCurrentCreationId] = useState(null);
  
  const pollingRef = useRef(null);
  const resultVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Fetch templates from API
  useEffect(() => {
    async function fetchTemplates() {
      try {
        const response = await fetch("/api/templates?category=video&active=true");
        if (!response.ok) throw new Error("Failed to fetch templates");
        const data = await response.json();
        setTemplates(data);
      } catch (err) {
        console.error("Error fetching templates:", err);
        setTemplatesError("Impossible de charger les templates");
      } finally {
        setIsLoadingTemplates(false);
      }
    }
    fetchTemplates();
  }, []);

  // Cleanup polling on unmount
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Poll for status
  const pollStatus = useCallback(async (requestId, creationId, modelName) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", requestId, modelName }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setGenerationStatus(data.status);
      setQueuePosition(data.queuePosition);

      // Update creation status in localStorage
      if (creationId) {
        updateCreation(creationId, { status: data.status });
      }

      if (data.status === "COMPLETED") {
        stopPolling();
        // Fetch the result
        const resultResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "result", requestId, modelName }),
        });
        
        const resultData = await resultResponse.json();
        
        if (resultData.error) {
          throw new Error(resultData.error);
        }

        setGeneratedVideo(resultData.video);
        setIsGenerating(false);

        // Save completed video to creation
        if (creationId) {
          updateCreation(creationId, {
            status: CreationStatus.COMPLETED,
            videoUrl: resultData.video.url,
            completedAt: new Date().toISOString(),
          });
        }
      } else if (data.status === "FAILED") {
        stopPolling();
        setError("La génération a échoué. Veuillez réessayer.");
        setIsGenerating(false);

        // Mark creation as failed
        if (creationId) {
          updateCreation(creationId, { status: CreationStatus.FAILED });
        }
      }
    } catch (err) {
      console.error("Polling error:", err);
      stopPolling();
      setError(err.message);
      setIsGenerating(false);

      // Mark creation as failed on error
      if (creationId) {
        updateCreation(creationId, { status: CreationStatus.FAILED });
      }
    }
  }, [stopPolling]);

  // Start generation
  const handleGenerate = async () => {
    if (!uploadedFile || !selectedTemplate) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setGenerationStatus("uploading");

    // Get template name for creation
    const template = templates.find(t => t.id === selectedTemplate);
    const templateName = template?.name || "Template";

    // Create a new creation entry
    const creation = addCreation({
      templateId: selectedTemplate,
      templateName: templateName,
      status: CreationStatus.UPLOADING,
      imagePreview: uploadedImage,
    });
    setCurrentCreationId(creation.id);

    try {
      // Step 1: Process and resize image if needed, convert to data URI
      const imageDataUri = await processImageFile(uploadedFile);

      // Step 2: Upload image to fal storage
      setGenerationStatus("uploading");
      const uploadResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upload",
          imageData: imageDataUri,
        }),
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.error) {
        throw new Error(uploadData.error);
      }

      // Step 3: Submit generation request with uploaded URL
      setGenerationStatus("submitting");
      const submitResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: uploadData.imageUrl,
          templateId: selectedTemplate,
        }),
      });

      const submitData = await submitResponse.json();

      if (submitData.error) {
        throw new Error(submitData.error);
      }

      // Update creation with request ID and modelName
      updateCreation(creation.id, {
        requestId: submitData.requestId,
        modelName: submitData.modelName,
        status: CreationStatus.IN_QUEUE,
      });

      // Start polling for status
      setGenerationStatus("IN_QUEUE");
      pollingRef.current = setInterval(() => {
        pollStatus(submitData.requestId, creation.id, submitData.modelName);
      }, 3000);

    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message);
      setIsGenerating(false);

      // Mark creation as failed
      updateCreation(creation.id, { status: CreationStatus.FAILED });
    }
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      setUploadedImage(URL.createObjectURL(file));
      setError(null);
      setGeneratedVideo(null);
    }
  };

  // Reset upload
  const handleResetUpload = () => {
    setUploadedImage(null);
    setUploadedFile(null);
    setGeneratedVideo(null);
    setError(null);
  };

  // Toggle video playback
  const togglePlayback = () => {
    if (resultVideoRef.current) {
      if (isPlaying) {
        resultVideoRef.current.pause();
      } else {
        resultVideoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  // Download video
  const handleDownload = async () => {
    if (!generatedVideo?.url) return;
    
    try {
      const response = await fetch(generatedVideo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `vista-ia-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // Reset everything for new generation
  const handleNewGeneration = () => {
    stopPolling();
    setUploadedImage(null);
    setUploadedFile(null);
    setSelectedTemplate(null);
    setGeneratedVideo(null);
    setError(null);
    setGenerationStatus(null);
    setQueuePosition(null);
  };

  return (
    <div className="generator-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Générateur de vidéo</h1>
          <p className="page-subtitle">Créez des mèmes vidéo personnalisés avec l'IA</p>
        </div>
      </div>

      <div className="generator-layout">
        {/* Left Panel - Controls */}
        <div className="generator-controls">
          {/* Step 1: Upload */}
          <div className="generator-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3 className="step-title">Uploadez votre photo</h3>
            </div>
            <div className="upload-zone">
              {uploadedImage ? (
                <div className="upload-preview">
                  <img src={uploadedImage} alt="Preview" />
                  <button 
                    className="upload-remove"
                    onClick={handleResetUpload}
                    disabled={isGenerating}
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              ) : (
                <label className="upload-label">
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="upload-input"
                    onChange={handleFileUpload}
                    disabled={isGenerating}
                  />
                  <Upload size={32} strokeWidth={1.5} />
                  <span className="upload-text">Glissez une image ou cliquez</span>
                  <span className="upload-hint">PNG, JPG jusqu'à 10MB</span>
                </label>
              )}
            </div>
          </div>

          {/* Step 2: Choose Template */}
          <div className="generator-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3 className="step-title">Choisissez un template</h3>
            </div>
            <div className="template-video-grid">
              {isLoadingTemplates ? (
                // Skeleton loading
                <>
                  {[1, 2].map((i) => (
                    <div key={i} className="template-skeleton">
                      <div className="skeleton-video" />
                      <div className="skeleton-text" />
                    </div>
                  ))}
                </>
              ) : templatesError ? (
                <div className="templates-error">
                  <AlertCircle size={24} />
                  <span>{templatesError}</span>
                </div>
              ) : (
                templates.map((template) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    isSelected={selectedTemplate === template.id}
                    onSelect={() => setSelectedTemplate(template.id)}
                    disabled={isGenerating}
                  />
                ))
              )}
            </div>
          </div>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="error-message"
              >
                <AlertCircle size={18} />
                <span>{error}</span>
                <button onClick={() => setError(null)}>
                  <X size={16} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: isGenerating ? 1 : 1.02 }}
            whileTap={{ scale: isGenerating ? 1 : 0.98 }}
            onClick={handleGenerate}
            disabled={!uploadedImage || !selectedTemplate || isGenerating}
            className="generate-btn"
          >
            {isGenerating ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Loader2 size={20} />
                </motion.div>
                {STATUS_MESSAGES[generationStatus] || "Génération..."}
                {queuePosition && generationStatus === "IN_QUEUE" && (
                  <span className="queue-position">#{queuePosition}</span>
                )}
              </>
            ) : (
              <>
                <Wand2 size={20} />
                Générer la vidéo
              </>
            )}
          </motion.button>

          {/* Generation Progress */}
          {isGenerating && (
            <div className="generation-progress">
              <div className="progress-bar">
                <motion.div
                  className="progress-fill"
                  initial={{ width: "0%" }}
                  animate={{ 
                    width: generationStatus === "IN_PROGRESS" ? "80%" : 
                           generationStatus === "IN_QUEUE" ? "30%" : "15%" 
                  }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="progress-hint">
                La génération peut prendre 5 à 10 minutes
              </p>
            </div>
          )}
        </div>

        {/* Right Panel - Preview */}
        <div className="generator-preview">
          <div className="preview-container">
            {generatedVideo ? (
              <div className="preview-result">
                <div className="result-video-container">
                  <video
                    ref={resultVideoRef}
                    src={generatedVideo.url}
                    loop
                    playsInline
                    className="result-video"
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                  />
                  <button 
                    className="video-play-overlay"
                    onClick={togglePlayback}
                  >
                    {!isPlaying && <Play size={48} fill="currentColor" />}
                  </button>
                </div>
                <div className="preview-actions">
                  <button 
                    className="preview-action-btn"
                    onClick={togglePlayback}
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    {isPlaying ? "Pause" : "Lire"}
                  </button>
                  <button 
                    className="preview-action-btn primary"
                    onClick={handleDownload}
                  >
                    <Download size={20} />
                    Télécharger
                  </button>
                </div>
                <button 
                  className="new-generation-btn"
                  onClick={handleNewGeneration}
                >
                  <Sparkles size={18} />
                  Nouvelle génération
                </button>
              </div>
            ) : (
              <div className="preview-empty">
                {isGenerating ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={48} strokeWidth={1} />
                    </motion.div>
                    <h3>Génération en cours</h3>
                    <p>{STATUS_MESSAGES[generationStatus] || "Préparation..."}</p>
                  </>
                ) : (
                  <>
                    <ImageIcon size={48} strokeWidth={1} />
                    <h3>Aperçu</h3>
                    <p>Votre vidéo générée apparaîtra ici</p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

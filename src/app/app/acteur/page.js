"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { 
  Upload, 
  Wand2, 
  Download,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Video,
  Check,
  AlertCircle,
  Loader2,
  X,
  Bot
} from "lucide-react";
import { addCreation, updateCreation, CreationStatus } from "@/lib/creations";

// Actor templates with image URLs
const actors = [
  { 
    id: 1, 
    name: "Le M", 
    imageUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/manupromax.jpg"
  },
  { 
    id: 2, 
    name: "Emma", 
    imageUrl: "https://vista-ia.s3.eu-north-1.amazonaws.com/catfish-promax.jpg"
  },
];

// Status messages
const STATUS_MESSAGES = {
  uploading: "Upload de la vidéo...",
  submitting: "Envoi de la requête...",
  IN_QUEUE: "En file d'attente...",
  IN_PROGRESS: "Génération en cours...",
  COMPLETED: "Vidéo prête !",
  FAILED: "Échec de la génération",
};

// Actor card component
function ActorCard({ actor, isSelected, onSelect, disabled }) {
  return (
    <button
      onClick={onSelect}
      disabled={disabled}
      className={`actor-template-card ${isSelected ? "actor-selected" : ""} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <div className="actor-image-wrapper">
        <Image
          src={actor.imageUrl}
          alt={actor.name}
          fill
          className="actor-image"
          sizes="(max-width: 768px) 50vw, 200px"
        />
        {isSelected && (
          <div className="actor-selected-badge">
            <Check size={16} strokeWidth={3} />
          </div>
        )}
      </div>
      <span className="actor-name">{actor.name}</span>
    </button>
  );
}

// Max video duration (30 seconds as per fal.ai limit for motion control)
const MAX_VIDEO_SIZE_MB = 100;
const MAX_VIDEO_DURATION = 30;

// Convert file to base64 data URI
async function fileToDataUri(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function ActeurPage() {
  const [selectedActor, setSelectedActor] = useState(null);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState(null);
  const [generatedVideo, setGeneratedVideo] = useState(null);
  const [error, setError] = useState(null);
  const [queuePosition, setQueuePosition] = useState(null);
  const [currentCreationId, setCurrentCreationId] = useState(null);
  
  const pollingRef = useRef(null);
  const resultVideoRef = useRef(null);
  const uploadedVideoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);

  // Cleanup polling on unmount
  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, []);

  // Poll for status
  const pollStatus = useCallback(async (requestId, creationId) => {
    try {
      const response = await fetch("/api/actor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "status", requestId }),
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
        const resultResponse = await fetch("/api/actor", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "result", requestId }),
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
    if (!uploadedFile || !selectedActor) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedVideo(null);
    setGenerationStatus("uploading");

    // Get actor name for creation
    const actor = actors.find(a => a.id === selectedActor);
    const actorName = actor?.name || "Acteur";

    // Create a new creation entry
    const creation = addCreation({
      type: "actor",
      actorId: selectedActor,
      templateName: `Acteur IA - ${actorName}`,
      status: CreationStatus.UPLOADING,
    });
    setCurrentCreationId(creation.id);

    try {
      // Step 1: Upload video using FormData (handles large files better)
      setGenerationStatus("uploading");
      const formData = new FormData();
      formData.append("file", uploadedFile);

      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadResponse.json();

      if (uploadData.error) {
        throw new Error(uploadData.error);
      }

      // Step 2: Submit generation request with uploaded URL
      setGenerationStatus("submitting");
      const submitResponse = await fetch("/api/actor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoUrl: uploadData.url,
          actorId: selectedActor,
        }),
      });

      const submitData = await submitResponse.json();

      if (submitData.error) {
        throw new Error(submitData.error);
      }

      // Update creation with request ID
      updateCreation(creation.id, {
        requestId: submitData.requestId,
        status: CreationStatus.IN_QUEUE,
      });

      // Start polling for status
      setGenerationStatus("IN_QUEUE");
      pollingRef.current = setInterval(() => {
        pollStatus(submitData.requestId, creation.id);
      }, 3000);

    } catch (err) {
      console.error("Generation error:", err);
      setError(err.message);
      setIsGenerating(false);

      // Mark creation as failed
      updateCreation(creation.id, { status: CreationStatus.FAILED });
    }
  };

  // Handle video upload
  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size
      const sizeMB = file.size / (1024 * 1024);
      if (sizeMB > MAX_VIDEO_SIZE_MB) {
        setError(`La vidéo est trop volumineuse. Maximum ${MAX_VIDEO_SIZE_MB}MB.`);
        return;
      }

      setUploadedFile(file);
      setUploadedVideo(URL.createObjectURL(file));
      setError(null);
      setGeneratedVideo(null);
    }
  };

  // Reset upload
  const handleResetUpload = () => {
    setUploadedVideo(null);
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

  // Toggle preview playback
  const togglePreviewPlayback = () => {
    if (uploadedVideoRef.current) {
      if (isPreviewPlaying) {
        uploadedVideoRef.current.pause();
      } else {
        uploadedVideoRef.current.play();
      }
      setIsPreviewPlaying(!isPreviewPlaying);
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
      a.download = `vista-ia-actor-${Date.now()}.mp4`;
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
    setUploadedVideo(null);
    setUploadedFile(null);
    setSelectedActor(null);
    setGeneratedVideo(null);
    setError(null);
    setGenerationStatus(null);
    setQueuePosition(null);
  };

  return (
    <div className="actor-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Acteur IA</h1>
          <p className="page-subtitle">Faites danser nos avatars sur votre vidéo</p>
        </div>
      </div>

      <div className="generator-layout">
        {/* Left Panel - Controls */}
        <div className="generator-controls">
          {/* Step 1: Upload Video */}
          <div className="generator-step">
            <div className="step-header">
              <span className="step-number">1</span>
              <h3 className="step-title">Uploadez votre vidéo</h3>
            </div>
            <div className="upload-zone">
              {uploadedVideo ? (
                <div className="video-upload-preview">
                  <video
                    ref={uploadedVideoRef}
                    src={uploadedVideo}
                    className="uploaded-video"
                    loop
                    muted
                    playsInline
                    onPlay={() => setIsPreviewPlaying(true)}
                    onPause={() => setIsPreviewPlaying(false)}
                  />
                  <div className="video-overlay-controls">
                    <button 
                      className="video-play-btn"
                      onClick={togglePreviewPlayback}
                    >
                      {isPreviewPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                  </div>
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
                    accept="video/*" 
                    className="upload-input"
                    onChange={handleVideoUpload}
                    disabled={isGenerating}
                  />
                  <Video size={32} strokeWidth={1.5} />
                  <span className="upload-text">Glissez une vidéo ou cliquez</span>
                  <span className="upload-hint">MP4, MOV jusqu'à {MAX_VIDEO_SIZE_MB}MB • Max 30 secondes</span>
                </label>
              )}
            </div>
          </div>

          {/* Step 2: Choose Actor */}
          <div className="generator-step">
            <div className="step-header">
              <span className="step-number">2</span>
              <h3 className="step-title">Choisissez un acteur</h3>
            </div>
            <div className="actor-grid">
              {actors.map((actor) => (
                <ActorCard
                  key={actor.id}
                  actor={actor}
                  isSelected={selectedActor === actor.id}
                  onSelect={() => setSelectedActor(actor.id)}
                  disabled={isGenerating}
                />
              ))}
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
            disabled={!uploadedVideo || !selectedActor || isGenerating}
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
                    <Bot size={48} strokeWidth={1} />
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

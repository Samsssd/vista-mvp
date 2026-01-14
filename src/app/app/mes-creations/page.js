"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Play,
  Pause,
  Download,
  Trash2,
  RefreshCw,
  Video,
  Sparkles,
  Volume2,
  VolumeX,
  Maximize,
} from "lucide-react";
import Link from "next/link";
import {
  getCreations,
  updateCreation,
  deleteCreation,
  CreationStatus,
} from "@/lib/creations";

// Status badge component
function StatusBadge({ status }) {
  const statusConfig = {
    [CreationStatus.PENDING]: {
      icon: Clock,
      label: "En attente",
      className: "status-pending",
    },
    [CreationStatus.UPLOADING]: {
      icon: Loader2,
      label: "Upload...",
      className: "status-uploading",
    },
    [CreationStatus.IN_QUEUE]: {
      icon: Clock,
      label: "En file",
      className: "status-queue",
    },
    [CreationStatus.IN_PROGRESS]: {
      icon: Loader2,
      label: "Génération...",
      className: "status-progress",
    },
    [CreationStatus.COMPLETED]: {
      icon: CheckCircle,
      label: "Terminé",
      className: "status-completed",
    },
    [CreationStatus.FAILED]: {
      icon: XCircle,
      label: "Échoué",
      className: "status-failed",
    },
  };

  const config = statusConfig[status] || statusConfig[CreationStatus.PENDING];
  const Icon = config.icon;
  const isAnimated =
    status === CreationStatus.UPLOADING ||
    status === CreationStatus.IN_PROGRESS;

  return (
    <span className={`creation-status-badge ${config.className}`}>
      {isAnimated ? (
        <motion.span
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <Icon size={14} />
        </motion.span>
      ) : (
        <Icon size={14} />
      )}
      {config.label}
    </span>
  );
}

// Creation card component
function CreationCard({ creation, onRefresh, onDelete }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleRefresh = async () => {
    if (!creation.requestId) return;
    setIsRefreshing(true);

    try {
      // Check status
      const statusResponse = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "status",
          requestId: creation.requestId,
        }),
      });

      const statusData = await statusResponse.json();

      if (statusData.status === "COMPLETED") {
        // Get result
        const resultResponse = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "result",
            requestId: creation.requestId,
          }),
        });

        const resultData = await resultResponse.json();

        if (resultData.video) {
          updateCreation(creation.id, {
            status: CreationStatus.COMPLETED,
            videoUrl: resultData.video.url,
            completedAt: new Date().toISOString(),
          });
        }
      } else if (statusData.status === "FAILED") {
        updateCreation(creation.id, {
          status: CreationStatus.FAILED,
        });
      } else {
        updateCreation(creation.id, {
          status: statusData.status,
        });
      }

      onRefresh();
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = () => {
    if (!creation.videoUrl) return;
    // Open video directly - browser will prompt to download or play
    window.open(creation.videoUrl, "_blank");
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  const handleDelete = () => {
    if (confirm("Supprimer cette création ?")) {
      deleteCreation(creation.id);
      onDelete();
    }
  };

  const isPending =
    creation.status !== CreationStatus.COMPLETED &&
    creation.status !== CreationStatus.FAILED;

  const creationDate = new Date(creation.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="creation-card"
    >
      {/* Preview */}
      <div className="creation-preview">
        {creation.status === CreationStatus.COMPLETED && creation.videoUrl ? (
          <div className="creation-video-container">
            <video
              ref={videoRef}
              src={creation.videoUrl}
              loop
              playsInline
              muted={isMuted}
              className="creation-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />
            {/* Video Controls Overlay */}
            <div className="creation-video-controls">
              <button className="video-control-btn" onClick={togglePlayback}>
                {isPlaying ? (
                  <Pause size={20} fill="currentColor" />
                ) : (
                  <Play size={20} fill="currentColor" />
                )}
              </button>
              <button className="video-control-btn" onClick={toggleMute}>
                {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </button>
              <button className="video-control-btn" onClick={handleFullscreen}>
                <Maximize size={18} />
              </button>
            </div>
          </div>
        ) : (
          <div className="creation-placeholder">
            {isPending ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles size={32} />
              </motion.div>
            ) : (
              <Video size={32} />
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="creation-info">
        <div className="creation-header">
          <span className="creation-template">{creation.templateName || "Template"}</span>
          <span className="creation-date">{creationDate}</span>
        </div>

        <StatusBadge status={creation.status} />

        {/* Actions */}
        <div className="creation-actions">
          {isPending && creation.requestId && (
            <button
              className="creation-action-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
              Actualiser
            </button>
          )}

          {creation.status === CreationStatus.COMPLETED && creation.videoUrl && (
            <button 
              className="creation-action-btn primary" 
              onClick={handleDownload}
            >
              <Download size={16} />
              Télécharger
            </button>
          )}

          <button className="creation-action-btn danger" onClick={handleDelete}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function MesCreationsPage() {
  const [creations, setCreations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCreations = useCallback(() => {
    const data = getCreations();
    setCreations(data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadCreations();
  }, [loadCreations]);

  // Auto-refresh pending creations
  useEffect(() => {
    const pendingCreations = creations.filter(
      (c) =>
        c.status === CreationStatus.IN_QUEUE ||
        c.status === CreationStatus.IN_PROGRESS
    );

    if (pendingCreations.length === 0) return;

    const interval = setInterval(() => {
      loadCreations();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [creations, loadCreations]);

  return (
    <div className="creations-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Mes Créations</h1>
          <p className="page-subtitle">Retrouvez toutes vos vidéos générées</p>
        </div>
      </div>

      {/* Creations Grid */}
      {isLoading ? (
        <div className="creations-loading">
          <Loader2 size={32} className="animate-spin" />
          <p>Chargement...</p>
        </div>
      ) : creations.length === 0 ? (
        <div className="creations-empty">
          <Video size={48} strokeWidth={1} />
          <h3>Aucune création</h3>
          <p>Vos vidéos générées apparaîtront ici</p>
          <Link href="/app/generateur" className="create-first-btn">
            <Sparkles size={18} />
            Créer ma première vidéo
          </Link>
        </div>
      ) : (
        <div className="creations-grid">
          <AnimatePresence>
            {creations.map((creation) => (
              <CreationCard
                key={creation.id}
                creation={creation}
                onRefresh={loadCreations}
                onDelete={loadCreations}
              />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

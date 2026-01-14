"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Heart,
  Play,
  Filter
} from "lucide-react";

// Sample meme templates data
const memeTemplates = [
  {
    id: 1,
    title: "Drake Approving",
    category: "Réaction",
    views: "2.3M",
    likes: 45200,
    thumbnail: "/images/vista-avatar.png"
  },
  {
    id: 2,
    title: "Distracted Boyfriend",
    category: "Classique",
    views: "5.1M",
    likes: 89300,
    thumbnail: "/images/vista-avatar.png"
  },
  {
    id: 3,
    title: "Woman Yelling at Cat",
    category: "Viral",
    views: "3.8M",
    likes: 67400,
    thumbnail: "/images/vista-avatar.png"
  },
  {
    id: 4,
    title: "This is Fine",
    category: "Réaction",
    views: "1.9M",
    likes: 34100,
    thumbnail: "/images/vista-avatar.png"
  },
  {
    id: 5,
    title: "Surprised Pikachu",
    category: "Gaming",
    views: "4.2M",
    likes: 71200,
    thumbnail: "/images/vista-avatar.png"
  },
  {
    id: 6,
    title: "Success Kid",
    category: "Classique",
    views: "2.7M",
    likes: 52800,
    thumbnail: "/images/vista-avatar.png"
  }
];

const categories = ["Tous", "Tendance", "Classique", "Réaction", "Gaming", "Viral"];

export default function ExplorerPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("Tous");

  const filteredMemes = memeTemplates.filter(meme => {
    const matchesSearch = meme.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "Tous" || meme.category === activeCategory || 
      (activeCategory === "Tendance" && parseInt(meme.views) > 3);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="explorer-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-content">
          <h1 className="page-title">Explorer</h1>
          <p className="page-subtitle">Découvrez les mèmes les plus populaires</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="explorer-toolbar">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un mème..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        <button className="filter-btn">
          <Filter size={18} />
          <span>Filtres</span>
        </button>
      </div>

      {/* Categories */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            className={`category-tab ${activeCategory === category ? "category-tab-active" : ""}`}
          >
            {category === "Tendance" && <TrendingUp size={16} />}
            {category}
          </button>
        ))}
      </div>

      {/* Meme Grid */}
      <div className="meme-grid">
        {filteredMemes.map((meme, index) => (
          <motion.div
            key={meme.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="meme-card"
          >
            <div className="meme-thumbnail">
              <img 
                src={meme.thumbnail} 
                alt={meme.title}
                className="meme-image"
              />
              <div className="meme-overlay">
                <button className="meme-play-btn">
                  <Play size={24} fill="currentColor" />
                </button>
              </div>
              <span className="meme-category-badge">{meme.category}</span>
            </div>
            <div className="meme-info">
              <h3 className="meme-title">{meme.title}</h3>
              <div className="meme-stats">
                <span className="meme-stat">
                  <Clock size={14} />
                  {meme.views} vues
                </span>
                <span className="meme-stat">
                  <Heart size={14} />
                  {(meme.likes / 1000).toFixed(1)}K
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredMemes.length === 0 && (
        <div className="empty-state">
          <Search size={48} strokeWidth={1} />
          <h3>Aucun résultat</h3>
          <p>Essayez avec d'autres termes de recherche</p>
        </div>
      )}
    </div>
  );
}

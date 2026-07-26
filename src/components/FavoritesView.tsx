"use client";

import { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Heart,
  ExternalLink,
  Sparkles,
  X,
} from "lucide-react";
import {
  getImageUrl,
  getFragranticaUrl,
  type Perfume,
  type Gender,
} from "@/lib/perfumes";

const genderStyles: Record<Gender, string> = {
  Dama: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  Caballero: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Unisex: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

const genderIcons: Record<Gender, string> = {
  Dama: "♀",
  Caballero: "♂",
  Unisex: "⚥",
};

interface FavoritesViewProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: number[];
  onRemoveFavorite: (perfumeId: number) => void;
  allPerfumes: Perfume[];
}

export default function FavoritesView({
  isOpen,
  onClose,
  favorites,
  onRemoveFavorite,
  allPerfumes,
}: FavoritesViewProps) {
  // Map perfume IDs to full perfume data using allPerfumes (includes DB-only perfumes)
  const favoritePerfumes = useMemo(() => {
    if (!isOpen) return [];
    return favorites
      .map((id) => allPerfumes.find((p) => p.id === id))
      .filter(Boolean) as Perfume[];
  }, [favorites, isOpen, allPerfumes]);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="bg-[#111111] border-[rgba(212,175,55,0.2)] text-white sm:max-w-lg p-0 max-h-[90vh] overflow-hidden flex flex-col"
        showCloseButton
      >
        {/* Header */}
        <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#111111] px-6 pt-6 pb-4">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent" />
          <DialogHeader>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Heart className="w-5 h-5 text-red-400 fill-red-400" />
            </div>
            <DialogTitle className="text-center font-[family-name:var(--font-playfair)] text-xl">
              Mis Favoritos
            </DialogTitle>
            <DialogDescription className="text-center text-white/40 font-[family-name:var(--font-inter)] text-xs">
              {favorites.length}{" "}
              {favorites.length === 1
                ? "fragancia guardada"
                : "fragancias guardadas"}
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Favorites List */}
        <div className="px-6 pb-6 flex-1 overflow-y-auto min-h-0">
          {favoritePerfumes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-12 h-12 text-[#d4af37]/20 mx-auto mb-4" />
              </motion.div>
              <p className="text-white/40 font-[family-name:var(--font-playfair)] text-lg mb-2">
                Sin favoritos aún
              </p>
              <p className="text-white/20 font-[family-name:var(--font-inter)] text-xs">
                Explora el catálogo y guarda las fragancias que más te gusten
              </p>
            </motion.div>
          ) : (
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-2 pr-2">
                <AnimatePresence>
                  {favoritePerfumes.map((perfume, index) => (
                    <motion.div
                      key={perfume.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50, height: 0, marginBottom: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex items-center gap-3 p-3 rounded-xl border border-[rgba(212,175,55,0.08)] bg-[#0a0a0a] hover:border-[rgba(212,175,55,0.2)] transition-all duration-300"
                    >
                      {/* Image */}
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-[#080808] flex-shrink-0 border border-[rgba(212,175,55,0.1)] flex items-center justify-center">
                        <img
                          src={getImageUrl(perfume.fragranticaId)}
                          alt={perfume.name}
                          className="w-full h-full object-contain p-1"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = `https://fimgs.net/mdimg/perfume/${perfume.fragranticaId}.jpg`;
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#d4af37]/70 font-semibold tracking-[0.08em] uppercase font-[family-name:var(--font-inter)] truncate">
                          {perfume.brand}
                        </p>
                        <p className="text-sm text-white/90 font-[family-name:var(--font-playfair)] truncate">
                          {perfume.name}
                        </p>
                        <span
                          className={`inline-flex items-center gap-1 text-[9px] px-1.5 py-0.5 rounded-full border mt-1 ${genderStyles[perfume.gender as Gender] || genderStyles.Unisex}`}
                        >
                          <span>{genderIcons[perfume.gender as Gender] || "⚥"}</span>
                          {perfume.gender}
                        </span>
                      </div>

                      {/* Price */}
                      {perfume.price !== undefined && perfume.price > 0 && (
                        <div className="text-sm font-bold text-[#d4af37] font-[family-name:var(--font-inter)] flex-shrink-0">
                          ${perfume.price.toFixed(2)}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <a
                          href={getFragranticaUrl(perfume)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-lg text-[#d4af37]/50 hover:text-[#d4af37] hover:bg-[#d4af37]/10 transition-all duration-200"
                          title="Ver en Fragrantica"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveFavorite(perfume.id)}
                          className="p-2 rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
                          title="Quitar de favoritos"
                        >
                          <X className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

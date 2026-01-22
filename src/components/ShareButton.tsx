"use client";

import { useEffect, useRef, useState } from "react";
import { Share2, Link as LinkIcon, Facebook, Instagram, MessageCircle } from "lucide-react";
import type { Work } from "@/types/work";

type ShareButtonProps = {
  work: Work;
  className?: string;
};

const buildUrl = (work: Work) => {
  if (work?.src) {
    const u = encodeURIComponent(work.src);
    const t = encodeURIComponent(work?.title || "");
    return `/api/preview?url=${u}&title=${t}`;
  }
  return typeof window !== "undefined" ? window.location.href : "";
};

export default function ShareButton({ work, className }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnId = `share-${work.id}`;
  const canonicalUrl = buildUrl(work);
  const text = work.story ? `${work.title} — ${work.story}` : work.title;

  // close on outside / ESC
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const handleNativeShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: work.title, text, url: canonicalUrl });
        setOpen(false);
        return;
      }
      window.open(canonicalUrl, "_blank");
      setOpen(false);
    } catch (err) {
      console.error("share error", err);
      setOpen(false);
    }
  };

  const copyLink = async (msg?: string) => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      if (msg) console.info(msg);
    } catch (err) {
      console.error("copy error", err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(canonicalUrl)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}%20${encodeURIComponent(canonicalUrl)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
      canonicalUrl
    )}&media=${encodeURIComponent(canonicalUrl)}&description=${encodeURIComponent(text)}`,
    instagram: "https://www.instagram.com/",
  };

  const openLink = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  return (
    <div className={`relative ${className || ""}`} ref={menuRef}>
      <button
        id={btnId}
        aria-label="Partager"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="h-8 w-8 rounded-full flex items-center justify-center text-sm bg-black/60 border border-white/15 text-white hover:scale-105 transition"
        title="Partager"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {open && (
        <div
          role="menu"
          aria-labelledby={btnId}
          className="absolute bottom-10 right-0 z-50 w-52 rounded-xl bg-neutral-900/95 border border-white/10 shadow-xl p-2 backdrop-blur"
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNativeShare();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <Share2 className="h-4 w-4" />
            <span>Partager (natif)</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLink(shareLinks.facebook);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <Facebook className="h-4 w-4" />
            <span>Facebook</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyLink("Lien copié pour Instagram");
              openLink(shareLinks.instagram);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <Instagram className="h-4 w-4" />
            <span>Instagram (copie lien)</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLink(shareLinks.pinterest);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <Share2 className="h-4 w-4 rotate-45" />
            <span>Pinterest</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              openLink(shareLinks.whatsapp);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <MessageCircle className="h-4 w-4" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              copyLink("Lien copié");
              setOpen(false);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm text-neutral-100"
            role="menuitem"
          >
            <LinkIcon className="h-4 w-4" />
            <span>{copied ? "Lien copié" : "Copier le lien"}</span>
          </button>
        </div>
      )}
    </div>
  );
}

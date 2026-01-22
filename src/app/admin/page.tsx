
"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/getCroppedImg";
import convertToPNG, { detectFormat } from "@/utils/convertToPNG";
import type { Work } from "@/types/work";
import { DEFAULT_PRICES } from "@/utils/getDefaultPrices";



/* ─────────────────────────────
   Thème “signature” (ambré doux)
   ───────────────────────────── */
const SIG_ACCENT_BG = "bg-amber-500 hover:bg-amber-400";
const SIG_ACCENT_TEXT = "text-amber-300";

type Tab = "works" | "pages" | "pricing";

/* ─────────────────────────────
   Formatage paragraphe côté front
   ───────────────────────────── */
function formatContent(raw: string) {
  if (!raw) return "";

  const trimmed = raw.trim();

  // ✅ Si ça ressemble déjà à du HTML avec <p>, on ne touche à rien
  if (/^<p[\s>]/i.test(trimmed) || /<\/p>/i.test(trimmed)) {
    return trimmed;
  }

  // Sinon : on transforme le texte brut en paragraphes
  return trimmed
    .split(/\n{2,}|\r+/) // coupe sur doubles sauts de ligne
    .map((p) => p.trim())
    .filter((p) => p.length > 0)
    .map((p) => `<p>${p}</p>`)
    .join("\n\n");
}


/* ╭────────────────────────────────────────────────────────╮
   │                 Admin Root (3 onglets)                 │
   ╰────────────────────────────────────────────────────────╯ */
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("works");

  // 🔐 Vérification via API Route
  const handleLogin = async () => {
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (data.success) {
        setIsAuth(true);
        setAuthError("");
      } else {
        setAuthError(data.message || "❌ Mot de passe incorrect.");
      }
    } catch (err) {
      console.error(err);
      setAuthError("⚠️ Erreur serveur, réessaie plus tard.");
    }
  };

  /* ─────────────────────────────
     Écran de connexion admin
     ───────────────────────────── */
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-light mb-2">Espace administrateur</h1>
        <p className={`text-sm mb-6 ${SIG_ACCENT_TEXT}`}>MMG Images</p>
        {authError && (
          <p className="text-red-400 text-sm mb-3">{authError}</p>
        )}
        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded bg-neutral-900 border border-neutral-800 w-full max-w-xs text-center outline-none focus:border-neutral-600"
        />
        <button
          onClick={handleLogin}
          className={`${SIG_ACCENT_BG} text-black px-5 py-2 rounded mt-4 font-medium transition-colors`}
        >
          Entrer
        </button>
      </div>
    );
  }

  /* ─────────────────────────────
     Interface principale admin
     ───────────────────────────── */
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-4 py-8 sm:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-light">
          Panneau d’administration{" "}
          <span className={SIG_ACCENT_TEXT}>MMG Images</span>
        </h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-neutral-800 mb-8">
        <TabButton
          active={tab === "works"}
          onClick={() => setTab("works")}
          label="📸 Œuvres"
        />
        <TabButton
          active={tab === "pages"}
          onClick={() => setTab("pages")}
          label="📄 Pages"
        />
      </div>

      {tab === "works" && <WorksAdmin />}
      {tab === "pages" && <PagesAdmin />}
    </main>
  );
}

/* ─────────────────────────────
   Bouton d’onglet stylisé
   ───────────────────────────── */
function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-t transition-colors ${
        active ? "bg-neutral-900" : "hover:bg-neutral-900/40"
      }`}
    >
      {label}
    </button>
  );
}

/* ╭────────────────────────────────────────────────────────╮
   │                       Œ U V R E S                      │
   ╰────────────────────────────────────────────────────────╯ */
function WorksAdmin() {
  const [form, setForm] = useState({
    title: "",
    location: "",
    category: "",
    prices: "",
    alt: "",
    story: "",
    format1: "",
    price1: "",
    format2: "",
    price2: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [formError, setFormError] = useState("");
  const [works, setWorks] = useState<Work[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [deleteStatus, setDeleteStatus] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const DRAFT_KEY = "adminFormDraft";

  const normalizeCategory = (value: string) => {
    const trimmed = value?.trim();
    if (!trimmed) return "";
    const lower = trimmed.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  };

  // Recadrage
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);
  const [aspect, setAspect] = useState<number | undefined>(4 / 3); // 4/3 par défaut (paysage classique)

  const fetchWorks = async () => {
    const res = await fetch("/api/works", { cache: "no-store" });
    const data = (await res.json()) as Work[];
    const normalized = data.map((w) => ({
      ...w,
      category: normalizeCategory(w.category || ""),
    }));
    setWorks(normalized);
    const cats = Array.from(
      new Map(
        normalized.map((w) => [w.category.toLowerCase(), w.category])
      ).values()
    ).sort();
    setCategories(
      cats.length ? cats : ["Renards", "Cerfs", "Oiseaux", "Écureuils", "Autres"]
    );
  };

  useEffect(() => {
    fetchWorks();
  }, []);

  // Charger le brouillon local au premier rendu
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const draft = JSON.parse(raw);
        if (draft.form) setForm((prev) => ({ ...prev, ...draft.form }));
        if (draft.newCategory) setNewCategory(draft.newCategory);
        if (draft.aspect !== undefined) setAspect(draft.aspect);
      }
    } catch (err) {
      console.error("Erreur chargement brouillon admin:", err);
    }
  }, []);

  // Sauvegarde du brouillon à chaque changement de form
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const payload = { form, newCategory, aspect };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error("Erreur sauvegarde brouillon admin:", err);
    }
  }, [form, newCategory, aspect]);

  // Auto-complétion prix (fusion KV + local)
  useEffect(() => {
    (async () => {
      if (!form.category) return;

      try {
        const res = await fetch("/api/pricing", { cache: "no-store" });
        const data = await res.json();

        const mergedPrices = { ...DEFAULT_PRICES, ...data };

        if (mergedPrices[form.category]) {
          const auto = mergedPrices[form.category]
            .map((p: any) => `${p.label} - ${p.amount}`)
            .join("\n");
          setForm((prev) => ({ ...prev, prices: auto }));
        }
      } catch {
        if (DEFAULT_PRICES[form.category]) {
          const auto = DEFAULT_PRICES[form.category]
            .map((p) => `${p.label} - ${p.amount}`)
            .join("\n");
          setForm((prev) => ({ ...prev, prices: auto }));
        }
      }
    })();
  }, [form.category]);

  // ─────────────────────────────
  // Upload fichier (JXL compris)
  // ─────────────────────────────
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;

    setStatus("⏳ Chargement de l'image...");
    setFormError("");

    try {
      const format = await detectFormat(f);
      console.log(`📸 Format détecté : ${format} | MIME : ${f.type}`);

      if (format === "image/jxl") {
        // Navigateur ne peut pas le prévisualiser
        setStatus("🎨 Image JXL détectée - sera convertie à l'upload.");
        setFile(f);
        setPreview(null);
        return;
      }

      setFile(f);
      setPreview(URL.createObjectURL(f));
      setStatus("");
    } catch (err) {
      console.error("Erreur onFile :", err);
      setFormError("❌ Erreur lors du chargement de l'image.");
      setStatus("");
    }
  };


  // ─────────────────────────────
  // Submit (conversion + crop + optimisation > 3 Mo)
  // ─────────────────────────────



const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError("");
  setStatus("");

  if (!form.title || !form.alt) {
    setFormError("⚠️ Titre et Alt sont requis.");
    return;
  }

  if (!file && !editingId) {
    setFormError("⚠️ Une image est requise pour créer une œuvre.");
    return;
  }

  const rawCategory =
    form.category === "__new__" && newCategory.trim()
      ? newCategory.trim()
      : form.category;
  const categoryToSave = normalizeCategory(rawCategory);

  if (!categoryToSave) {
    setFormError("⚠️ La catégorie est requise.");
    return;
  }

  try {
    setStatus("⏳ Préparation de l’image…");

    // ✅ 1. CRÉATION DE L'IMAGE CROPPÉE RÉELLE (si nouvelle image)
    let fileToUpload: File | null = file;

    if (fileToUpload && file && preview && croppedPixels) {
      const croppedBlob = await getCroppedImg(preview, croppedPixels, 2000);

      fileToUpload = new File(
        [croppedBlob],
        file.name.replace(/\.[^/.]+$/, ".webp"),
        { type: "image/webp" }
      );
    }

    let finalSrc: string | undefined = undefined;

    if (fileToUpload) {
      setStatus("⏳ Upload sécurisé vers Vercel…");
      const blob = await upload(fileToUpload.name, fileToUpload, {
        access: "public",
        handleUploadUrl: "/api/blob-upload",
      });
      finalSrc = blob.url;
      console.log("✅ Upload Blob OK :", blob.url);
    } else if (editingId) {
      const existing = works.find((w) => w.id === editingId);
      finalSrc = existing?.src;
    }

    setStatus("⏳ Enregistrement des données…");

    const pricesField = [
      form.format1 && form.price1
        ? `${form.format1} - ${Number(form.price1) * 100}`
        : null,
      form.format2 && form.price2
        ? `${form.format2} - ${Number(form.price2) * 100}`
        : null,
    ]
      .filter(Boolean)
      .join("\n");

    if (editingId) {
      const res = await fetch("/api/works", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title: form.title,
          location: form.location,
          category: categoryToSave,
          alt: form.alt,
          story: form.story,
          prices: pricesField,
          src: finalSrc,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result?.success) {
        throw new Error(result?.error || "Erreur serveur");
      }
      setStatus("✅ Œuvre mise à jour !");
      if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    } else {
      const fd = new FormData();
      fd.append("fileUrl", finalSrc || "");
      fd.append("title", form.title);
      fd.append("location", form.location);
      fd.append("category", categoryToSave);
      fd.append("alt", form.alt);
      fd.append("story", form.story);
      fd.append("prices", pricesField);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const result = await res.json();

      if (!res.ok || !result?.success) {
        throw new Error(result?.error || "Erreur serveur");
      }

      setStatus("✅ Œuvre ajoutée avec succès !");
      if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
    }

    // ✅ 4. RESET COMPLET FORMULAIRE
    setForm({
      title: "",
      location: "",
      category: "",
      prices: "",
      alt: "",
      story: "",
      format1: "",
      price1: "",
      format2: "",
      price2: "",
    });

    setFile(null);
    setPreview(null);
    setZoom(1);
    setNewCategory("");
    setEditingId(null);
    fetchWorks();
  } catch (err: any) {
    console.error("❌ ERROR SUBMIT:", err);
    setStatus("❌ Échec de l’envoi");
    setFormError(err.message || "Erreur inconnue");
  }
};





  const remove = async (id: string) => {
    setDeleteStatus("");
    setDeletingId(id);
    try {
      const res = await fetch(`/api/delete?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      setDeleteStatus(data.success ? "Œuvre supprimée." : `Erreur : ${data.error}`);
      fetchWorks();
    } catch (err: any) {
      console.error("❌ ERROR DELETE:", err);
      setDeleteStatus("Erreur lors de la suppression.");
    } finally {
      setDeletingId(null);
      setConfirmId(null);
    }
  };

  return (
    <>
      <section className="mb-12 flex flex-col gap-6 items-center">
        <h2 className="text-xl font-light mb-2">Ajouter une œuvre</h2>
        <p className={`text-sm mb-6 ${SIG_ACCENT_TEXT}`}>
          WebP optimisé & watermark appliqué côté serveur.
        </p>

        {formError && (
          <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-2 rounded mb-4">
            {formError}
          </div>
        )}

        <form
          onSubmit={submit}
          className="max-w-3xl space-y-4"
          encType="multipart/form-data"
        >
          {/* Upload en premier */}
          <label className="block w-full text-center border-2 border-dashed border-neutral-700 p-6 rounded-lg cursor-pointer hover:bg-neutral-900/40 transition">
            <span className="text-sm text-neutral-400">
              {file
                ? "Image sélectionnée ✅"
                : "📷 Choisir une image ou prendre une photo"}
            </span>
            <input
              type="file"
              accept="image/*,.jxl"
              className="hidden"
              onChange={onFile}
            />
          </label>

          {/* Choix des ratios juste sous l'upload */}
          <div className="flex flex-wrap gap-2 text-xs text-neutral-300 mb-2">
            <span className="text-neutral-500 mr-2">Format :</span>

            <button
              type="button"
              onClick={() => setAspect(4 / 3)}
              className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-900/60"
            >
              4 / 3
            </button>
            <button
              type="button"
              onClick={() => setAspect(16 / 9)}
              className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-900/60"
            >
              16 / 9
            </button>
            <button
              type="button"
              onClick={() => setAspect(16 / 10)}
              className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-900/60"
            >
              16 / 10
            </button>
            <button
              type="button"
              onClick={() => setAspect(3 / 4)}
              className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-900/60"
            >
              3 / 4
            </button>
            <button
              type="button"
              onClick={() => setAspect(1)}
              className="px-3 py-1 rounded border border-neutral-700 hover:bg-neutral-900/60"
            >
              1 / 1
            </button>
            <button
              type="button"
              onClick={() => setAspect(undefined)}
              className="px-3 py-1 rounded border border-amber-500 text-amber-300 hover:bg-neutral-900/60"
            >
              Libre
            </button>
          </div>
          {preview && (
            <div className="relative w-full h-72 border border-neutral-800 rounded-lg overflow-hidden">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
              />
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full absolute bottom-2 left-2 right-2"
              />
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              placeholder="Titre *"
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
            <input
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              placeholder="Lieu / Date"
              value={form.location}
              onChange={(e) =>
                setForm({ ...form, location: e.target.value })
              }
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4 items-center">
            <select
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              value={form.category}
              onChange={(e) => {
                const value = e.target.value;
                if (value === "__new__") {
                  setForm({ ...form, category: "__new__" });
                } else {
                  setForm({ ...form, category: value });
                  setNewCategory("");
                }
              }}
            >
              <option value="">— Choisir une catégorie —</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
              <option value="__new__">➕ Nouvelle catégorie…</option>
            </select>

            {form.category === "__new__" && (
              <input
                className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
                placeholder="Nom de la nouvelle catégorie"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
            )}

            <input
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              placeholder="Texte alternatif (SEO) *"
              value={form.alt}
              onChange={(e) =>
                setForm({ ...form, alt: e.target.value })
              }
            />
          </div>

          <textarea
            className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600 h-24"
            placeholder="Petite histoire (facultatif)"
            value={form.story}
            onChange={(e) =>
              setForm({ ...form, story: e.target.value })
            }
          />

          {/* Choix des ratios */}
          <div className="space-y-2">
            <label className="block text-sm text-neutral-400">
              Formats & prix (remplis les montants uniquement)
            </label>

            <div className="grid sm:grid-cols-2 gap-2">
              <input
                type="text"
                className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
                placeholder="Ex : Tirage Fine Art A2"
                value={form.format1 || ""}
                onChange={(e) =>
                  setForm({ ...form, format1: e.target.value })
                }
              />
              <input
                type="number"
                className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
                placeholder="Prix (en €)"
                value={form.price1 || ""}
                onChange={(e) =>
                  setForm({ ...form, price1: e.target.value })
                }
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-2">
              <input
                type="text"
                className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
                placeholder="Ex : Téléchargement HD"
                value={form.format2 || ""}
                onChange={(e) =>
                  setForm({ ...form, format2: e.target.value })
                }
              />
              <input
                type="number"
                className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
                placeholder="Prix (en €)"
                value={form.price2 || ""}
                onChange={(e) =>
                  setForm({ ...form, price2: e.target.value })
                }
              />
            </div>
          </div>

            <button
              type="submit"
              className={`${SIG_ACCENT_BG} text-black px-5 py-2 rounded font-medium transition-colors items-center justify-center flex mx-auto`}
            >
            {editingId ? "Mettre à jour" : "Ajouter l’œuvre"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setForm({
                    title: "",
                    location: "",
                    category: "",
                    prices: "",
                    alt: "",
                    story: "",
                    format1: "",
                    price1: "",
                    format2: "",
                    price2: "",
                  });
                  setFile(null);
                  setPreview(null);
                  setNewCategory("");
                  setStatus("");
                  setFormError("");
                  if (typeof window !== "undefined") localStorage.removeItem(DRAFT_KEY);
                }}
                className="mt-2 text-sm text-neutral-400 hover:text-white mx-auto block"
              >
                Annuler la modification
              </button>
            )}

          {status && (
            <p className="text-sm mt-2 text-neutral-400">{status}</p>
          )}
        </form>
      </section>

      {/* Liste */}
      <section className="border-t border-neutral-800 pt-8">
        <h3 className="text-xl md:text-2xl 2xl:text-3xl font-light mb-4">
          Œuvres existantes
        </h3>
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <label className="text-sm text-neutral-400">Filtrer par catégorie :</label>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="p-2 rounded bg-neutral-900 border border-neutral-800 text-sm md:text-base outline-none focus:border-neutral-600"
          >
            <option value="all">Toutes</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        {works.length === 0 ? (
          <p className="text-neutral-500 text-sm">
            Aucune œuvre enregistrée.
          </p>
        ) : (
          <>
            {deleteStatus && (
              <p className="text-sm md:text-base 2xl:text-lg text-neutral-300 mb-4">
                {deleteStatus}
              </p>
            )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 2xl:gap-10">
            {works
              .filter((w) =>
                filterCategory === "all"
                  ? true
                  : w.category === filterCategory
              )
              .map((w) => (
              <div
                key={w.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors"
              >
                <div className="relative w-full bg-neutral-900 aspect-[4/3]">
                  <img
                    src={w.src}
                    alt={w.alt}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="p-4 space-y-1.5">
                  <div className="text-base md:text-lg 2xl:text-xl text-white leading-snug">
                    {w.title}
                  </div>
                  <div
                    className={`text-xs md:text-sm 2xl:text-base ${SIG_ACCENT_TEXT}`}
                  >
                    {w.category}
                  </div>
                  {w.story && (
                    <div className="text-xs md:text-sm 2xl:text-base text-neutral-400 mt-1 line-clamp-2">
                      {w.story}
                    </div>
                  )}
                  <div className="mt-4 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setEditingId(w.id);
                        setForm({
                          title: w.title || "",
                          location: w.location || "",
                          category: w.category || "",
                          prices: "",
                          alt: w.alt || "",
                          story: w.story || "",
                          format1: w.prices?.[0]?.label || "",
                          price1: w.prices?.[0]?.amount
                            ? String(w.prices[0].amount / 100)
                            : "",
                          format2: w.prices?.[1]?.label || "",
                          price2: w.prices?.[1]?.amount
                            ? String(w.prices[1].amount / 100)
                            : "",
                        });
                        setPreview(w.src || null);
                        setFile(null);
                        setNewCategory("");
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded text-sm md:text-base text-white"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => {
                        if (confirmId === w.id) {
                          remove(w.id);
                        } else {
                          setConfirmId(w.id);
                        }
                      }}
                      className="bg-red-600 hover:bg-red-500 px-3 py-1.5 rounded text-sm md:text-base text-white"
                      disabled={deletingId === w.id}
                    >
                      {deletingId === w.id
                        ? "Suppression…"
                        : confirmId === w.id
                        ? "Confirmer la suppression"
                        : "Supprimer"}
                    </button>
                    {confirmId === w.id && deletingId !== w.id && (
                      <button
                        onClick={() => setConfirmId(null)}
                        className="px-3 py-1.5 rounded text-sm md:text-base border border-neutral-700 text-neutral-200 hover:border-neutral-500"
                      >
                        Annuler
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          </>
        )}
      </section>
    </>
  );
}


/* ╭────────────────────────────────────────────────────────╮
   │                         P A G E S                      │
   ╰────────────────────────────────────────────────────────╯ */
function PagesAdmin() {
  const [pages, setPages] = useState<any[]>([]);
  const [form, setForm] = useState({
    slug: "",
    title: "",
    image: "",
    alt: "",
    content: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<boolean>(false);

  // Recadrage images
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);

  const load = async () => {
    const res = await fetch("/api/pages", { cache: "no-store" });
    const data = await res.json();
    setPages(data);
  };

  useEffect(() => {
    load();
  }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const resetForm = () => {
    setForm({ slug: "", title: "", image: "", alt: "", content: "" });
    setFile(null);
    setPreview(null);
    setZoom(1);
    setCroppedPixels(null);
    setEditing(false);
    setStatus("");
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.slug.trim() || !form.title.trim()) {
      setStatus("⚠️ Slug et titre sont obligatoires.");
      return;
    }

    // Petit contrôle côté front : slug déjà existant en création
    if (!editing) {
      const exists = pages.some((p) => p.slug === form.slug.trim());
      if (exists) {
        setStatus("⚠️ Ce slug existe déjà, choisis-en un autre.");
        return;
      }
    }

    setStatus(editing ? "⏳ Mise à jour…" : "⏳ Enregistrement…");

    try {
      let imageUrl = form.image;

      // 1️⃣ Si une image est choisie, on la recadre + convertit en WebP, puis upload via Vercel Blob
      if (file) {
        let uploadFile: File = file;

        if (preview && croppedPixels) {
          const blob = await getCroppedImg(preview, croppedPixels, 2000);
          uploadFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ".webp"),
            { type: "image/webp" }
          );
        }

        const blobUpload = await upload(uploadFile.name, uploadFile, {
          access: "public",
          handleUploadUrl: "/api/blob-upload",
        });

        imageUrl = blobUpload.url;
      }

      const payload = {
        slug: form.slug.trim(),
        title: form.title.trim(),
        image: imageUrl,
        alt: form.alt || "",
        content: form.content, // on envoie brut, formaté côté API ou côté front
      };

      const method = editing ? "PUT" : "POST";
      const res = await fetch("/api/pages", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      setStatus(editing ? "✅ Page mise à jour !" : "✅ Page enregistrée !");
      await load();
      resetForm();
    } catch (err) {
      console.error(err);
      setStatus("❌ Erreur lors de la sauvegarde.");
    }
  };

  const del = async (slug: string) => {
    if (!confirm("Supprimer cette page ?")) return;
    const res = await fetch(`/api/pages/${slug}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.success ? "✅ Supprimée" : `❌ ${data.error}`);
    load();
  };

  const edit = (p: any) => {
    setForm({
      slug: p.slug,
      title: p.title,
      image: p.image || "",
      alt: p.alt || "",
      content: p.content || "",
    });
    setPreview(p.image || null);
    setFile(null);
    setEditing(true);
    setStatus("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    resetForm();
  };

  return (
    <>
      <h2 className="text-xl font-light mb-2">Pages libres / Articles</h2>
      <p className="text-sm text-amber-300 mb-6">
        “À propos” doit avoir le slug{" "}
        <code className="text-neutral-300">a-propos</code> pour apparaître
        dans la Navbar. Les autres pages peuvent servir de pages statiques
        ou d’articles de blog et s’affichent dans le Footer ou un listing.
      </p>

      {/* Formulaire création / édition */}
      <form
        onSubmit={save}
        className="max-w-3xl space-y-4 mb-10"
        encType="multipart/form-data"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            placeholder="Slug (ex: a-propos, mentions-legales, renards-en-hiver)"
            value={form.slug}
            onChange={(e) =>
              setForm({ ...form, slug: e.target.value })
            }
            disabled={editing} // slug figé pendant édition
          />
          <input
            className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            placeholder="Titre de la page / article"
            value={form.title}
            onChange={(e) =>
              setForm({ ...form, title: e.target.value })
            }
          />
        </div>

        <label className="block w-full text-center border-2 border-dashed border-neutral-700 p-6 rounded-lg cursor-pointer hover:bg-neutral-900/40 transition">
          <span className="text-sm text-neutral-400">
            {file
              ? "Image sélectionnée ✅"
              : preview
              ? "Image déjà enregistrée – choisir un fichier pour la remplacer"
              : "📷 Choisir une image de couverture"}
          </span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </label>

        <input
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
          placeholder="Texte alternatif (SEO) = mots clés de la page / article"
          value={form.alt || ""}
          onChange={(e) =>
            setForm({ ...form, alt: e.target.value })
          }
        />

        {preview && (
          <div className="relative w-full h-80 border border-neutral-800 rounded-lg overflow-hidden">
            <Cropper
              image={preview}
              crop={crop}
              zoom={zoom}
              aspect={4 / 3}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
            />
            <div className="absolute bottom-3 left-0 right-0 px-4">
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        )}

        <textarea
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600 h-40"
          placeholder="Contenu (texte brut : ce sera rendu comme un article avec des paragraphes séparés par une ligne vide)"
          value={form.content}
          onChange={(e) =>
            setForm({ ...form, content: e.target.value })
          }
        />

        <div className="flex gap-3 items-center">
          <button className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded font-medium transition-colors flex items-center justify-center mx-auto">
            {editing ? "Mettre à jour la page" : "Enregistrer"}
          </button>

          {editing && (
            <button
              type="button"
              onClick={cancelEdit}
              className="px-4 py-2 rounded border border-neutral-700 hover:bg-neutral-900/40 transition-colors"
            >
              Annuler
            </button>
          )}
        </div>

        {status && (
          <p className="text-sm mt-2 text-neutral-400">{status}</p>
        )}
      </form>

      {/* Liste des pages */}
      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-xl font-light mb-4">
          Pages / Articles existants
        </h3>
        {pages.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucune page.</p>
        ) : (
          <div className="space-y-3">
            {pages.map((p: any) => (
              <div
                key={p.slug}
                className="flex items-center justify-between border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 transition-colors"
              >
                <div>
                  <div className="text-white text-sm">{p.title}</div>
                  <div className="text-amber-300 text-xs">
                    /{p.slug}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => edit(p)}
                    className="bg-neutral-700 hover:bg-neutral-600 px-3 py-1 rounded text-sm text-white"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => del(p.slug)}
                    className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm text-white"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

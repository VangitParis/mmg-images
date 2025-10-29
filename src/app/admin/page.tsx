"use client";

import { useEffect, useState } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/utils/getCroppedImg";
import type { Work, Price } from "@/types/work";
import { getDefaultPrices, DEFAULT_PRICES } from "@/utils/getDefaultPrices";

/* ─────────────────────────────
   Thème “signature” (ambré doux)
   ───────────────────────────── */
const SIG_ACCENT_BG = "bg-amber-500 hover:bg-amber-400";
const SIG_ACCENT_TEXT = "text-amber-300";
const SIG_ACCENT_BADGE = "border-amber-500 text-amber-300";


type Tab = "works" | "pages" | "pricing";

/* ╭────────────────────────────────────────────────────────╮
   │                 Admin Root (3 onglets)                 │
   ╰────────────────────────────────────────────────────────╯ */
export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [authError, setAuthError] = useState("");
  const [tab, setTab] = useState<Tab>("works");

  // 🔐 Vérification sécurisée via API Route
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
        {authError && <p className="text-red-400 text-sm mb-3">{authError}</p>}
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
          Panneau d’administration <span className={SIG_ACCENT_TEXT}>MMG Images</span>
        </h1>
      </div>

      {/* Onglets */}
      <div className="flex gap-2 border-b border-neutral-800 mb-8">
  <TabButton active={tab === "works"} onClick={() => setTab("works")} label="📸 Œuvres" />
  <TabButton active={tab === "pages"} onClick={() => setTab("pages")} label="📄 Pages" />
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
      className={`px-4 py-2 rounded-t transition-colors
        ${active ? "bg-neutral-900" : "hover:bg-neutral-900/40"}`}
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

  // Recadrage
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);

  const fetchWorks = async () => {
    const res = await fetch("/api/works", { cache: "no-store" });
    const data = (await res.json()) as Work[];
    setWorks(data);
    const cats = Array.from(new Set(data.map((w) => w.category))).sort();
    setCategories(cats.length ? cats : ["Renards", "Cerfs", "Oiseaux", "Écureuils", "Autres"]);
  };

  useEffect(() => {
    fetchWorks();
  }, []);

// Auto-complétion prix (fusion KV + local)
useEffect(() => {
  (async () => {
    if (!form.category) return;

    try {
      const res = await fetch("/api/pricing", { cache: "no-store" });
      const data = await res.json();

      // On fusionne KV + valeurs locales
      const mergedPrices = { ...DEFAULT_PRICES, ...data };

      if (mergedPrices[form.category]) {
        const auto = mergedPrices[form.category]
          .map((p: any) => `${p.label} - ${p.amount}`)
          .join("\n");
        setForm((prev) => ({ ...prev, prices: auto }));
      }
    } catch {
      // si KV ne répond pas → on se rabat sur les prix par défaut
      if (DEFAULT_PRICES[form.category]) {
        const auto = DEFAULT_PRICES[form.category]
          .map((p) => `${p.label} - ${p.amount}`)
          .join("\n");
        setForm((prev) => ({ ...prev, prices: auto }));
      }
    }
  })();
}, [form.category]);


  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setFormError("");
  setStatus("");

  if (!form.title || !form.alt || !file) {
    setFormError("⚠️ Titre, Alt et Image sont requis.");
    return;
  }

  const categoryToSave =
    form.category === "__new__" && newCategory.trim()
      ? newCategory.trim()
      : form.category;

  if (!categoryToSave) {
    setFormError("⚠️ La catégorie est requise.");
    return;
  }

  setStatus("⏳ Téléversement en cours…");

  try {
    // ⚡ Sur mobile : certaines images ne passent pas sans conversion
    let uploadFile = file;
    if (preview && croppedPixels) {
      const blob = await getCroppedImg(preview, croppedPixels);
      if (!blob || blob.size === 0) throw new Error("Image vide après recadrage");
      uploadFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
        type: "image/webp",
      });
    }

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

    const fd = new FormData();
    fd.append("file", uploadFile);
    fd.append("title", form.title);
    fd.append("location", form.location);
    fd.append("category", categoryToSave);
    fd.append("prices", pricesField);
    fd.append("alt", form.alt);
    fd.append("story", form.story);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: fd,
    });

    const result = await res.json();
    if (!res.ok || !result.success) {
      console.error("Erreur upload (serveur):", result.error);
      throw new Error(result.error || "Upload KO");
    }

    setStatus("✅ Ajouté avec succès !");
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
    fetchWorks();
  } catch (err: any) {
    console.error("Erreur d’envoi:", err.message);
    setStatus("❌ Erreur d’envoi (image non valide sur mobile ?).");
  }
};


  const remove = async (id: string) => {
    if (!confirm("Supprimer cette œuvre ?")) return;
    const res = await fetch(`/api/delete?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    alert(data.success ? "✅ Supprimée" : `❌ ${data.error}`);
    fetchWorks();
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

        <form onSubmit={submit} className="max-w-3xl space-y-4" encType="multipart/form-data">
          <div className="grid sm:grid-cols-2 gap-4">
            <input
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              placeholder="Titre *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <input
              className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
              placeholder="Lieu / Date"
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
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
        setNewCategory(""); // reset
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
    onChange={(e) => setForm({ ...form, alt: e.target.value })}
  />
</div>

        

          <textarea
            className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600 h-24"
            placeholder="Petite histoire (facultatif)"
            value={form.story}
            onChange={(e) => setForm({ ...form, story: e.target.value })}
          />

          {/* Upload */}
          <label className="block w-full text-center border-2 border-dashed border-neutral-700 p-6 rounded-lg cursor-pointer hover:bg-neutral-900/40 transition">
            <span className="text-sm text-neutral-400">
              {file ? "Image sélectionnée ✅" : "📷 Choisir une image ou prendre une photo"}
            </span>
            <input
              type="file"
              accept="image/*"
              // capture="environment"
              className="hidden"
              onChange={onFile}
            />
          </label>

          {preview && (
            <div className="relative w-full h-96 border border-neutral-800 rounded-lg overflow-hidden">
              <Cropper
                image={preview}
                crop={crop}
                zoom={zoom}
                aspect={4 / 3}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
              />
            </div>
          )}

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
      onChange={(e) => setForm({ ...form, format1: e.target.value })}
    />
    <input
      type="number"
      className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
      placeholder="Prix (en €)"
      value={form.price1 || ""}
      onChange={(e) => setForm({ ...form, price1: e.target.value })}
    />
  </div>

  <div className="grid sm:grid-cols-2 gap-2">
    <input
      type="text"
      className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
      placeholder="Ex : Téléchargement HD"
      value={form.format2 || ""}
      onChange={(e) => setForm({ ...form, format2: e.target.value })}
    />
    <input
      type="number"
      className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
      placeholder="Prix (en €)"
      value={form.price2 || ""}
      onChange={(e) => setForm({ ...form, price2: e.target.value })}
    />
  </div>
</div>


          <button
            type="submit"
            className={`${SIG_ACCENT_BG} text-black px-5 py-2 rounded font-medium transition-colors items-center justify-center flex mx-auto   `}
          >
            Ajouter l’œuvre
          </button>

          {status && <p className="text-sm mt-2 text-neutral-400">{status}</p>}
        </form>
      </section>

      {/* Liste */}
      <section className="border-t border-neutral-800 pt-8">
        <h3 className="text-xl font-light mb-4">Œuvres existantes</h3>
        {works.length === 0 ? (
          <p className="text-neutral-500 text-sm">Aucune œuvre enregistrée.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {works.map((w) => (
              <div
                key={w.id}
                className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors"
              >
                <img src={w.src} alt={w.alt} className="w-full h-48 object-cover" />
                <div className="p-3">
                  <div className="text-sm text-white">{w.title}</div>
                  <div className={`text-xs ${SIG_ACCENT_TEXT}`}>{w.category}</div>
                  {w.story && (
                    <div className="text-xs text-neutral-400 mt-1 line-clamp-2">{w.story}</div>
                  )}
                  <button
                    onClick={() => remove(w.id)}
                    className="mt-3 bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm text-white"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
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
  const [form, setForm] = useState({ slug: "", title: "", image: "", alt: "", content: "" });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [editing, setEditing] = useState<boolean>(false); // 👈 édition active ou non
  /* ─────────────────────────────
   Recadrage images
   ───────────────────────────── */
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<any>(null);

  const load = async () => {
    const res = await fetch("/api/pages", { cache: "no-store" });
    const data = await res.json();
    setPages(data);
  };
  useEffect(() => { load(); }, []);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

 const save = async (e: React.FormEvent) => {
  e.preventDefault();
  setStatus(editing ? "⏳ Mise à jour…" : "⏳ Enregistrement…");

  try {
    let imageUrl = form.image;

    // 🔁 Gestion du recadrage (avant l'upload)
    let uploadFile = file;
    if (file && preview && croppedPixels) {
      const blob = await getCroppedImg(preview, croppedPixels);
      uploadFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
        type: "image/webp",
      });
    }

    // 🧠 upload du fichier recadré si présent
    if (uploadFile) {
      const fd = new FormData();
      fd.append("file", uploadFile);
      const upload = await fetch("/api/uploadPageImage", { method: "POST", body: fd });
      const { url } = await upload.json();
      imageUrl = url;
    }
    

    const payload = {
      slug: form.slug,
      title: form.title,
      image: imageUrl,
      alt: form.alt || "",
      content: form.content,
    };

    const method = editing ? "PUT" : "POST";
    const res = await fetch("/api/pages", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error("Erreur serveur");

    setStatus(editing ? "✅ Page mise à jour !" : "✅ Page enregistrée !");
    setForm({ slug: "", title: "", image: "", alt: "", content: "" });
    setFile(null);
    setPreview(null);
    setZoom(1);
    setEditing(false);
    load();
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
    setForm({ slug: p.slug, title: p.title, image: p.image , alt: p.alt || "", content: p.content || "" });
    setPreview(p.image || null);
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditing(false);
    setForm({ slug: "", title: "", image: "", alt: "", content: "" });
    setPreview(null);
    setFile(null);
    setStatus("");
  };

  return (
    <>
      <h2 className="text-xl font-light mb-2">Pages libres</h2>
      <p className="text-sm text-amber-300 mb-6">
        “À propos” doit avoir le slug <code className="text-neutral-300">about</code> pour apparaître
        dans la Navbar. Les autres pages s’affichent automatiquement dans le Footer.
      </p>

      {/* Formulaire création / édition */}
      <form onSubmit={save} className="max-w-3xl space-y-4 mb-10" encType="multipart/form-data">
        <div className="grid sm:grid-cols-2 gap-4">
          <input
            className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            placeholder="Slug (ex: about, mentions-legales)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            disabled={editing} // 👈 slug figé pendant édition
          />
          <input
            className="p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
            placeholder="Titre de la page"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <label className="block w-full text-center border-2 border-dashed border-neutral-700 p-6 rounded-lg cursor-pointer hover:bg-neutral-900/40 transition">
          <span className="text-sm text-neutral-400">
            {file ? "Image sélectionnée ✅" : "📷 Choisir une image ou prendre une photo"}
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={onFile} />
        </label>
<input
  className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
  placeholder="Texte alternatif (SEO) = mots clés"
  value={form.alt || ""}
  onChange={(e) => setForm({ ...form, alt: e.target.value })}
/>
        {preview && (
  <div className="relative w-full h-80 border border-neutral-800 rounded-lg overflow-hidden">
    <Cropper
      image={preview}
      crop={crop}
      zoom={zoom}
      aspect={4 / 3} // format page — tu peux mettre 4/3 si tu préfères
      onCropChange={setCrop}
      onZoomChange={setZoom}
      onCropComplete={(_, pixels) => setCroppedPixels(pixels)}
    />
  </div>
)}


        <input
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600"
          placeholder="Ou colle ici une URL d’image"
          value={form.image}
          onChange={(e) => setForm({ ...form, image: e.target.value })}
        />

        <textarea
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 outline-none focus:border-neutral-600 h-40"
          placeholder="Contenu (texte ou Markdown)"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />

        <div className="flex gap-3 items-center">
          <button
            className="bg-amber-500 hover:bg-amber-400 text-black px-5 py-2 rounded font-medium transition-colors flex items-center justify-center mx-auto"
          >
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

        {status && <p className="text-sm mt-2 text-neutral-400">{status}</p>}
      </form>

      {/* Liste des pages */}
      <div className="border-t border-neutral-800 pt-6">
        <h3 className="text-xl font-light mb-4">Pages existantes</h3>
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
                  <div className="text-amber-300 text-xs">/{p.slug}</div>
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

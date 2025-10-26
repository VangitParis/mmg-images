"use client";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("⏳ Envoi en cours...");

    if (!form.name || !form.email || !form.message) {
      setStatus("⚠️ Merci de remplir tous les champs.");
      return;
    }

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur serveur");

      setStatus("✅ Message envoyé avec succès !");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("❌ Échec de l’envoi. Merci de réessayer plus tard.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-light mb-6 border-b border-neutral-800 pb-4">
        Contact
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <input
          type="text"
          placeholder="Nom complet"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800"
        />
        <input
          type="email"
          placeholder="Adresse e-mail"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800"
        />
        <textarea
          placeholder="Ton message..."
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full p-3 rounded bg-neutral-900 border border-neutral-800 h-40"
        />
        <button
          type="submit"
          className="bg-white text-black px-6 py-3 rounded font-medium hover:bg-neutral-200 transition w-full sm:w-auto"
        >
          Envoyer le message
        </button>
        {status && (
          <p
            className={`text-sm mt-3 ${
              status.startsWith("✅")
                ? "text-green-400"
                : status.startsWith("❌")
                ? "text-red-400"
                : "text-neutral-400"
            }`}
          >
            {status}
          </p>
        )}
      </form>
    </div>
  );
}

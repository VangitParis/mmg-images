export default function MentionsLegales() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 px-6 py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-3xl font-light border-b border-neutral-800 pb-4">
          Mentions légales
        </h1>

        <section>
          <h2 className="text-xl font-medium mb-2">1. Éditeur du site</h2>
          <p className="text-neutral-400 leading-relaxed">
            Le site <strong>MMG Images</strong> est édité par :
            <br />
            <br />
            <strong>MMG IMAGES</strong>
            <br />
            Entreprise individuelle – Activité de photographie et vente en ligne
            <br />
            Email : contact@mmgimages.com
            <br />
            Siège social : [adresse à compléter]
            <br />
            Numéro SIREN / SIRET : [à compléter]
            <br />
            Responsable de la publication : [nom à compléter]
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">2. Hébergement</h2>
          <p className="text-neutral-400 leading-relaxed">
            Le site est hébergé par :
            <br />
            <strong>Vercel Inc.</strong>
            <br />
            440 N Barranca Ave #4133, Covina, CA 91723, États-Unis
            <br />
            Site :{" "}
            <a
              href="https://vercel.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline"
            >
              https://vercel.com
            </a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">3. Propriété intellectuelle</h2>
          <p className="text-neutral-400 leading-relaxed">
            L’ensemble du contenu du site, incluant les photographies, textes, logos et
            éléments graphiques, est la propriété exclusive de MMG IMAGES.
            <br />
            Toute reproduction, diffusion ou exploitation sans autorisation écrite
            préalable est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">4. Données personnelles</h2>
          <p className="text-neutral-400 leading-relaxed">
            Le site peut collecter certaines données via les formulaires de contact. Ces
            informations sont strictement confidentielles et ne sont jamais revendues.
            <br />
            Conformément au Règlement Général sur la Protection des Données (RGPD), vous
            pouvez demander la suppression de vos données à tout moment en écrivant à :{" "}
            <a
              href="mailto:contact@mmgimages.com"
              className="text-white underline"
            >
              contact@mmgimages.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">5. Cookies</h2>
          <p className="text-neutral-400 leading-relaxed">
            Le site peut utiliser des cookies uniquement à des fins techniques et
            statistiques anonymisées. Vous pouvez les désactiver dans les paramètres de
            votre navigateur.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-medium mb-2">6. Crédits</h2>
          <p className="text-neutral-400 leading-relaxed">
            Design et développement : MMG IMAGES
            <br />
            Photographies : © MMG IMAGES
          </p>
        </section>
      </div>
    </main>
  );
}

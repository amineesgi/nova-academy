import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';

export default function HelpPage() {
  return (
    <main id="main" className="page">
      <div className="container stack" style={{ maxWidth: 860 }}>
        <Link to="/" className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
          <ArrowLeft size={18} /> Accueil
        </Link>
        <article className="card stack">
          <h1>Aide</h1>
          <h2>Pour les enfants</h2>
          <ul>
            <li>
              Choisis ton parcours sur l’écran d’accueil, puis lance ta <strong>mission du jour</strong>.
            </li>
            <li>Chaque nouvelle notion commence par une petite leçon. Le bouton « Explique-moi autrement » donne une autre explication.</li>
            <li>Tu as droit à deux essais et à des indices. Se tromper fait partie de l’apprentissage !</li>
            <li>Les boutons haut-parleur font écouter les mots anglais, les dictées et les consignes.</li>
          </ul>
          <h2>Pour les adultes</h2>
          <ul>
            <li>L’espace parent est protégé par un code simple : c’est une barrière pour les enfants, pas une sécurité forte.</li>
            <li>
              <strong>Les données restent dans ce navigateur, sur cet ordinateur.</strong> Il n’y a pas de synchronisation automatique entre ordinateurs : utilisez « Exporter une sauvegarde » puis « Importer » sur l’autre poste.
            </li>
            <li>Effacer les données de navigation du site peut supprimer la progression : exportez une sauvegarde régulièrement (par exemple chaque semaine).</li>
            <li>Après une première visite complète, l’application fonctionne sans Internet. Elle peut être installée comme une application (bouton « Installer » du navigateur).</li>
            <li>Aucune publicité, aucun traceur, aucun compte, aucune donnée envoyée sur Internet.</li>
            <li>Les exercices d’oral en anglais proposent d’écouter et de répéter : l’application n’évalue pas la prononciation.</li>
          </ul>
        </article>
      </div>
    </main>
  );
}

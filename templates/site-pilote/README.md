# Template « Site pilote » (custom-SCADA)

Projet FUXA prêt à réutiliser pour un nouveau site de supervision (station de pompage).
Fichier : `site-pilote.fuxap`.

## Contenu

| Page | Contenu |
|---|---|
| **Accueil** (page de démarrage) | Titre du site, 4 zones de texte, 4 cases à cocher (Valider, Marche, Arrêt, Mode automatique), réservoir avec niveau, 3 pompes (grises à l'arrêt, vertes en marche), 2 vannes, débit de refoulement, bâche à eau, voyant et bouton d'alarme, boutons Historique / Courbes / Alarmes |
| **Historique** | Calendrier « Du / Au », bouton Afficher, tableau vide (à relier à PostgreSQL) |
| **Courbes** | Calendrier « Du / Au », bouton Afficher, courbe vide (à relier à PostgreSQL) |
| **Alarmes et événements** | Page d'alarmes intégrée à FUXA (menu et bouton Alarmes) |

Menu latéral : Accueil, Historique, Courbes, Alarmes et événements. Date et heure affichées dans le bandeau.

## Tags provisoires

Tous les tags sont sur l'équipement interne **FUXA Server**. Ils sont **provisoires** : noms et types à remplacer par les tags réels de l'automate.

| Tag | Type | Utilisé par |
|---|---|---|
| `reservoir_niveau` | number | Réservoir, valeur « niveau » (m) |
| `bache_niveau` | number | Bâche à eau |
| `debit_refoulement` | number | Valeur « débit » (L/s) |
| `pompe1_etat`, `pompe2_etat`, `pompe3_etat` | boolean | Couleur des pompes 1 à 3 (0 = gris, 1 = vert) |
| `cmd_valider`, `cmd_marche`, `cmd_arret`, `mode_auto` | boolean | Cases à cocher Valider, Marche, Arrêt, Mode automatique |
| `alarme_generale` | boolean | Voyant d'alarme (0 = vert, 1 = rouge) |
| `texte_1` … `texte_4` | string | Zones de texte 1 à 4 |

## Utiliser le template pour un nouveau site

1. Ouvrir l'éditeur FUXA, menu principal → **Open Project**, choisir `site-pilote.fuxap`.
   Attention : le projet ouvert remplace le projet courant ; enregistrer d'abord le projet courant avec **Save Project As...** si besoin.
2. Modifier le titre « STATION DE POMPAGE - NOM DU SITE » (page Accueil).
3. Ajouter l'équipement réel (automate) dans **Connections**, puis lier chaque objet à son tag réel (clic sur l'objet → **Property**). Les tags provisoires de « FUXA Server » peuvent ensuite être supprimés.
4. Adapter les objets (ajouter des pompes, vannes, tuyaux…) depuis la palette de l'éditeur.
5. Enregistrer le projet du site avec **Save Project As...**.

## Limites connues

- Historique et Courbes sont vides : la liaison avec la base PostgreSQL de l'entreprise est prévue dans une étape suivante (FUXA ne propose pas PostgreSQL pour l'historique en standard).
- Dans l'éditeur, la courbe affiche des données d'exemple tant qu'aucune série n'est configurée.
- FUXA n'a pas d'objet « case à cocher » : les cases sont des interrupteurs (Switch) liés à un tag booléen.
- Le bouton « Alarmes » de la page Accueil ouvre la page d'alarmes grâce à une petite modification du code (`fuxa-view.component.ts`, lien `[alarms]`). Dans la fenêtre Events de l'éditeur, cette destination n'apparaît pas dans la liste des pages.
- Aucune alarme n'est encore définie (seuils à fournir par l'exploitant).

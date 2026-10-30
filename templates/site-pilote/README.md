# Template « Site pilote » (custom-SCADA)

Projet FUXA prêt à réutiliser pour un nouveau site de supervision (station de pompage).
Fichier : `site-pilote.fuxap`.

## Contenu

| Page | Contenu |
|---|---|
| **Accueil** (page de démarrage) | Titre du site, 4 zones de texte, 4 cases à cocher (Valider, Marche, Arrêt, Mode automatique), réservoir avec niveau, 3 pompes (grises à l'arrêt, vertes en marche), 2 vannes, débit de refoulement, bâche à eau, voyant et bouton d'alarme, boutons Historique / Courbes / Alarmes |
| **Historique** | Tableau de l'historique (Date / Heure, Niveau réservoir, Débit) avec choix de la période et export, bouton ⬅ Accueil |
| **Courbes** | Courbe « Tendances » (niveau en bleu, débit en orange) avec choix de la période, bouton ⬅ Accueil |
| **Alarmes et événements** | Page d'alarmes intégrée à FUXA (menu et bouton Alarmes) |

Menu latéral : Accueil, Historique, Courbes, Alarmes et événements. Date et heure affichées dans le bandeau.
Les boutons ⬅ Accueil permettent de revenir au synoptique depuis la fenêtre de test (▶), qui n'a pas de menu.

## Historique et courbes

- Les tags `reservoir_niveau` et `debit_refoulement` sont **enregistrés** par FUXA (toutes les 5 s et à chaque changement) dans sa base intégrée **SQLite**.
- Pour enregistrer un autre tag : **Connections** → tag → activer l'enregistrement (DAQ), puis l'ajouter comme colonne du tableau (Property du tableau) et/ou comme ligne de la courbe (Property de la courbe).
- La base **PostgreSQL** de l'entreprise remplacera SQLite dans une étape suivante.

## Tags provisoires

Tous les tags sont sur l'équipement interne **FUXA Server**. Ils sont **provisoires** : noms et types à remplacer par les tags réels de l'automate.

| Tag | Type | Utilisé par |
|---|---|---|
| `reservoir_niveau` | number | Réservoir, valeur « niveau » (m), historique et courbe (enregistré) |
| `bache_niveau` | number | Bâche à eau |
| `debit_refoulement` | number | Valeur « débit » (L/s), historique et courbe (enregistré) |
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

- L'historique utilise la base SQLite intégrée à FUXA. La liaison avec la base PostgreSQL de l'entreprise est prévue dans une étape suivante (FUXA ne propose pas PostgreSQL pour l'historique en standard).
- Les calendriers « Du / Au » et le bouton « Afficher » ne sont pas encore utilisés : le tableau et la courbe ont leur propre choix de période (fonction FUXA). Ils seront branchés ou retirés lors de la liaison PostgreSQL.
- Dans l'éditeur, la courbe affiche des données d'exemple ; les vraies valeurs apparaissent en exploitation.
- FUXA n'a pas d'objet « case à cocher » : les cases sont des interrupteurs (Switch) liés à un tag booléen.
- Le bouton « Alarmes » de la page Accueil ouvre la page d'alarmes grâce à une petite modification du code (`fuxa-view.component.ts`, lien `[alarms]`). Dans la fenêtre Events de l'éditeur, cette destination n'apparaît pas dans la liste des pages.
- Aucune alarme n'est encore définie (seuils à fournir par l'exploitant).

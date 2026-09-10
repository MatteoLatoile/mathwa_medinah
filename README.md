# Mathwa

Site vitrine et annonces pour la location longue durée à Médine.
Next.js 16 · TypeScript · Tailwind 4 · next-intl (fr / ar / en / ru)

## Démarrer

```bash
npm install
npm run dev
```

Le site tourne sur http://localhost:3000 — `/` redirige vers `/fr`.
Les autres langues : `/ar`, `/en`, `/ru`.

## Avant de lancer

Ouvre `.env.local` et remplace le numéro WhatsApp par le tien,
au format international sans « + » ni espaces :

```
NEXT_PUBLIC_WHATSAPP=966XXXXXXXXX
```

Les variables Supabase restent vides tant que tu n'as pas créé le projet.

## Ce qui est en place

**Page d'accueil** (`src/app/[locale]/page.tsx`)
Hero avec l'arche animée, les cinq engagements, la section étudiants et familles,
le déroulé en trois étapes, l'appel final.

**Page annonces** (`src/app/[locale]/annonces/page.tsx`)
Barre de filtres, bascule liste / carte, état vide avec redirection WhatsApp.
Le tableau `listings` est vide : dès qu'il contient des données, les cartes s'affichent.

**Page admin** (`src/app/[locale]/admin/page.tsx`)
Coquille vide, accessible depuis le lien discret en pied de page.

**Multilingue**
Quatre langues, bascule RTL automatique en arabe. Les textes sont dans
`src/messages/`. Modifier une phrase = modifier le JSON, rien d'autre.

**Détails d'interface**
Curseur personnalisé (désactivé au tactile et si l'utilisateur réduit les animations),
révélation au scroll, une seule animation au chargement.

## Ce qui reste à brancher

- Supabase : table `listings`, requêtes, upload et compression des photos
- Leaflet sur la vue carte (`src/components/ListingsView.tsx`, bloc « Leaflet »)
- Page détail d'une annonce : créer `src/app/[locale]/annonces/[id]/page.tsx`
- Authentification admin et formulaire de création d'annonce

Pour la carte et la compression d'images :

```bash
npm install leaflet react-leaflet browser-image-compression
npm install -D @types/leaflet
```

Pour Supabase :

```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Deux points à corriger de ton côté

1. Les traductions arabe et russe sont à faire relire par des locuteurs natifs
   avant la mise en ligne.
2. Next 16 déprécie `middleware.ts` au profit de `proxy.ts`. Le fichier actuel
   fonctionne mais affiche un avertissement au build. Pour migrer :
   `npx @next/codemod@canary middleware-to-proxy .`

## Structure

```
src/
  app/[locale]/         pages (accueil, annonces, admin)
  components/           Header, Footer, curseur, cartes, filtres
  i18n/                 configuration next-intl
  lib/                  tracés de l'arche, config du site
  messages/             textes des 4 langues
public/                 logo.svg (transparent) et logo-mark.svg (fond vert)
```

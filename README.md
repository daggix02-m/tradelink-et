# TradeLink ET 🇪🇹

Ethiopia-based B2B broker marketplace connecting importers/manufacturers with wholesalers.

## How it works

The platform acts as a **silent broker**. Neither suppliers nor buyers ever see that a commission is being collected:

- **Importers/Manufacturers** list products at their actual raw price
- **Wholesalers** browse the marketplace and see a price that already includes the platform's commission (injected server-side in Convex)
- **Both parties** communicate through masked aliases (e.g. "Supplier-A12B", "Buyer-9F3C") — real identities are never revealed during negotiation
- **Only the Admin** dashboard shows full revenue, commission amounts, and real user identities

## Tech stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite 5 |
| Animations | GSAP 3 (ScrollTrigger, countUp, page transitions) |
| Backend | Convex (real-time DB + serverless functions) |
| Auth | Clerk + Convex Auth integration |
| Styling | Tailwind CSS v3 |
| Fonts | Bricolage Grotesque (headings) + Sora (body) |
| Payments | Chapa / Telebirr (Ethiopia-local) |

## Project structure

```
tradelink-et/
├── convex/
│   ├── schema.ts          # All DB tables (users, products, deals, orders, messages…)
│   ├── lib.ts             # Commission engine + auth helpers + alias generator
│   ├── products.ts        # Product CRUD — rawPrice stripped from wholesaler responses
│   ├── deals.ts           # Deal lifecycle (initiate → negotiate → agree → pay → ship)
│   ├── messages.ts        # Real-time chat with identity masking
│   ├── users.ts           # Onboarding, profiles, notifications
│   ├── admin.ts           # Revenue summary, commission rules management
│   └── auth.config.ts     # Clerk JWT integration
│
└── src/
    ├── animations/
    │   └── gsap.ts        # GSAP utilities: revealStagger, scrollReveal, countUp, transitions
    ├── hooks/
    │   └── useGsapReveal.ts  # React hook for auto-GSAP on mount
    ├── components/
    │   └── layout/
    │       ├── DashboardLayout.tsx   # Sidebar + topbar, role-aware nav
    │       └── ProtectedRoute.tsx    # Auth + role guards
    ├── pages/
    │   ├── OnboardingPage.tsx        # Role selection + profile setup
    │   ├── ChatPage.tsx              # Real-time deal messaging
    │   ├── importer/
    │   │   └── Dashboard.tsx
    │   ├── wholesaler/
    │   └── admin/
    │       └── Revenue.tsx           # Only admin sees real commission data
    ├── App.tsx             # Router + role-based routes
    ├── main.tsx            # Convex + Clerk providers
    └── index.css           # Tailwind + design tokens
```

## Setup

1. **Clone and install**
   ```bash
   npm install
   ```

2. **Set up Convex**
   ```bash
   npx convex dev
   ```
   Copy the deployment URL to `.env.local` as `VITE_CONVEX_URL`

3. **Set up Clerk**
   - Create a project at [clerk.dev](https://clerk.dev)
   - Copy `VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY`
   - Set `CLERK_JWT_ISSUER_DOMAIN` in Convex environment variables

4. **Configure environment**
   ```bash
   cp .env.example .env.local
   # Fill in all values
   ```

5. **Run dev server**
   ```bash
   npm run dev          # React app
   npm run convex:dev   # Convex (separate terminal)
   ```

## Commission mechanics (important)

The commission logic lives entirely in `convex/lib.ts → applyCommission()` and is called inside Convex mutations/queries. It is **never** exposed to the client for non-admin users:

- `products.ts → listProducts` strips `rawPrice` before returning to wholesalers, substituting `displayPrice`
- `deals.ts → makeOffer` injects commission into offer data so the buyer's `offerData.pricePerUnit` already includes it
- `orders.ts` (to be built) will split payment: `supplierPayout` goes to importer, `commissionEarned` is the platform's cut

## Next steps to build

- [ ] `convex/orders.ts` — order creation on payment confirmation
- [ ] Payment integration (Chapa API for Ethiopian Birr)
- [ ] `pages/marketplace/MarketplacePage.tsx` — product grid with filters + GSAP scroll reveals  
- [ ] `pages/wholesaler/Dashboard.tsx` — buyer dashboard
- [ ] `pages/importer/AddListing.tsx` — product listing form
- [ ] `pages/LandingPage.tsx` — marketing landing page with GSAP hero
- [ ] Admin commission rule editor UI
- [ ] SMS notifications via Africa's Talking or similar

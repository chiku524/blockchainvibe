# Subscription Feature (On Hold)

Subscription/billing is implemented in the codebase but **disabled by default**. Enable it when you have an active userbase and are ready to offer Pro plans. Last updated: February 2025.

## What’s in place

- **Backend (Worker)**
  - `subscriptions` table: `user_id`, `plan`, `status`, `stripe_customer_id`, `stripe_subscription_id`, `current_period_end`, timestamps.
  - `GET /api/subscription?userId=...` – returns current plan (or `enabled: false` when feature is off).
  - `POST /api/subscription` – body `{ user_id, plan }` – create/update subscription (returns 503 when feature is off).
  - All subscription logic is gated by `env.SUBSCRIPTION_ENABLED === 'true'`.

- **Frontend**
  - Feature flag: `REACT_APP_SUBSCRIPTION_ENABLED=true` to show subscription UI.
  - `SubscriptionContext`: exposes `plan`, `isPro`, `enabled`, `refetch`, `updatePlan`.
  - `SubscriptionBanner`: upgrade CTA in layout (only when enabled and not Pro).
  - `SubscriptionSettings`: plan display and “Upgrade to Pro” in Settings (only when enabled).
  - When the flag is off, no subscription UI is shown and API returns safe defaults.

## How to enable

1. **Worker (Cloudflare)**
   - Workers & Pages → your worker → Settings → Variables and Secrets.
   - Add: `SUBSCRIPTION_ENABLED` = `true`.
   - Or in `wrangler.toml`: `[vars]` with `SUBSCRIPTION_ENABLED = "true"`.

2. **Frontend (React)**
   - Set `REACT_APP_SUBSCRIPTION_ENABLED=true` in the build environment (e.g. Cloudflare Pages build env or `.env.production`).
   - Rebuild and deploy the frontend.

After enabling, users will see the Subscription section in Settings and the upgrade banner when not on Pro. You can later add Stripe (or another provider) and wire webhooks to update `stripe_*` and `current_period_end`.

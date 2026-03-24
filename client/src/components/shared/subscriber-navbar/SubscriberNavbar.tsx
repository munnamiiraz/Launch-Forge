import { SubNavLogo }            from "./_components/SubNavLogo";
import { SubNavLinks }           from "./_components/SubNavLinks";
import { SubNavActions }         from "./_components/SubNavActions";
import { SubMobileMenu }         from "./_components/SubMobileMenu";
import { SubNavbarClient }       from "./_components/SubNavbarClient";
import { getSubscriberNavState } from "./_lib/subscriber-check";

/**
 * SubscriberNavbar — the public-facing navbar for people who have
 * joined a waitlist. Self-contained Server Component, same pattern
 * as the main Navbar.
 *
 * Use this on:
 *   - /w/[slug]                  (public waitlist page)
 *   - /w/[slug]/leaderboard      (public leaderboard)
 *   - /explore                   (explore page)
 *   - /how-to-earn               (how-to-earn page)
 *   - /invite/[inviteCode]       (invite landing page)
 *
 * Usage:
 *   import { SubscriberNavbar } from "@/app/modules/subscriber-navbar/SubscriberNavbar";
 *   <SubscriberNavbar />
 *
 * Auth is resolved server-side by reading the `subscriberToken` cookie.
 * When the cookie is present and valid, the subscriber sees:
 *   - Their queue position + referral count in the navbar
 *   - A one-click copy-invite-link pill
 *   - A dropdown with their context, leaderboard link, and session actions
 *
 * When no cookie is present (guest), they see:
 *   - "Browse waitlists" ghost button + "Join a waitlist" CTA
 */
export async function SubscriberNavbar() {
  const { isSubscriber, subscriber } = await getSubscriberNavState();

  return (
    <SubNavbarClient>
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">

        {/* Left — logo (links to /explore, not /) */}
        <SubNavLogo />

        {/* Centre — subscriber-specific links */}
        <SubNavLinks />

        {/* Right — subscriber actions or guest CTA */}
        <div className="flex items-center gap-2">
          <SubNavActions
            isSubscriber={isSubscriber}
            subscriber={subscriber}
          />

          {/* Mobile hamburger */}
          <SubMobileMenu
            isSubscriber={isSubscriber}
            subscriber={subscriber}
          />
        </div>

      </div>
    </SubNavbarClient>
  );
}
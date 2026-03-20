import { NavLogo } from "./_components/NavLogo";
import { NavLinks } from "./_components/NavLinks";
import { NavActions } from "./_components/NavActions";
import { MobileMenu } from "./_components/MobileMenu";
import { NavbarClient } from "./_components/NavbarClient";
import { AnnouncementBanner } from "./_components/AnnouncementBanner";
import { getNavAuthState } from "./_lib/auth-check";

/**
 * Navbar — fully autonomous Server Component.
 *
 * Drop this anywhere in your layout:
 *
 *   import { Navbar } from "@/app/modules/navbar/Navbar";
 *   <Navbar showBanner />
 *
 * Auth is resolved server-side via cookie inspection (getNavAuthState).
 * No prop-drilling needed — the navbar is self-contained.
 */
interface NavbarProps {
  /** Show the top announcement / promotional banner */
  showBanner?: boolean;
}

export async function Navbar({ showBanner = false }: NavbarProps) {
  // ── Server-side auth check (reads cookies, no waterfall) ─────
  const { isAuthenticated, user } = await getNavAuthState();

  return (
    <NavbarClient>
      {/* Optional announcement banner */}
      {showBanner && <AnnouncementBanner />}

      {/* Main bar */}
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        {/* Left — logo */}
        <NavLogo />

        {/* Centre — desktop links */}
        <NavLinks />

        {/* Right — auth-aware actions */}
        <div className="flex items-center gap-2">
          <NavActions isAuthenticated={isAuthenticated} user={user} />

          {/* Mobile hamburger */}
          <MobileMenu isAuthenticated={isAuthenticated} user={user} />
        </div>
      </div>
    </NavbarClient>
  );
}

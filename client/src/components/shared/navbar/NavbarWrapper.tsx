"use client";

import { usePathname } from "next/navigation";
import { Navbar } from "@/src/components/shared/navbar";
import { SubscriberNavbar } from "@/src/components/shared/subscriber-navbar/SubscriberNavbar";

const SUBSCRIBER_ROUTES = ["/explore", "/how-to-earn"];

export function NavbarWrapper() {
  const pathname = usePathname();
  
  // Check if current route is for subscribers
  const isSubscriberRoute = SUBSCRIBER_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  return isSubscriberRoute ? <SubscriberNavbar /> : <Navbar showBanner={false} />;
}

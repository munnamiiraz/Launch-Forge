import { headers } from "next/headers";
import { Navbar } from "@/src/components/shared/navbar";

const SUBSCRIBER_ROUTES = ["/explore", "/how-to-earn"];

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the pathname from headers


  return (
    <>
      <Navbar showBanner={false} />
      {children}
    </>
  );
}

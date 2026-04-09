import { Navbar } from "@/src/components/shared/navbar";

export default function CommonLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar showBanner={false} />
      {children}
    </>
  );
}

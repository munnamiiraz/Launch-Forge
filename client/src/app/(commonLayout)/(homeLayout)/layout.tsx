import { Navbar } from "@/src/components/shared/navbar";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar showBanner={false} />
      {children}
    </>
  );
}

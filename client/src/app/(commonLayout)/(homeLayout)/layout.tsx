import { headers } from "next/headers";

const SUBSCRIBER_ROUTES = ["/explore", "/how-to-earn"];

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the pathname from headers


  return (
    <>
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-indigo-500/5 dark:bg-indigo-600/6 blur-[150px]" />
      <div aria-hidden className="pointer-events-none absolute -right-64 top-1/4 h-[400px] w-[500px] rounded-full bg-violet-500/5 dark:bg-violet-600/5 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute -left-64 bottom-1/4 h-[400px] w-[500px] rounded-full bg-cyan-500/5 dark:bg-cyan-600/4 blur-[120px]" />
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.04)_1px,transparent_1px)] bg-size-[72px_72px]" />
      {children}
    </>
  );
}

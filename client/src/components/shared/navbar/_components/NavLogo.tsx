import Link from "next/link";
import { Zap } from "lucide-react";

export function NavLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-indigo-500/30 bg-indigo-500/15 transition-all duration-200 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/22 group-hover:shadow-[0_0_12px_rgba(99,102,241,0.2)]">
        <Zap size={15} className="text-indigo-400 transition-transform duration-200 group-hover:scale-110" />
      </div>
      <span className="text-sm font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-white">
        LaunchForge
      </span>
    </Link>
  );
}

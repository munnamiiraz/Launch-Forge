import Link from "next/link";
import { LogoIcon } from "@/src/components/shared/LogoIcon";

export function NavLogo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5 w-fit">
      <LogoIcon />
      <span className="text-sm font-semibold tracking-tight text-foreground transition-colors duration-200 group-hover:text-indigo-600 dark:group-hover:text-white">
        LaunchForge
      </span>
    </Link>
  );
}

"use client";

import { useState }    from "react";
import { Copy, Check, Share2 } from "lucide-react";
import { cn }          from "@/src/lib/utils";

interface ReferralPillProps {
  inviteUrl:     string;
  referralCount: number;
}

/**
 * Compact copy-to-clipboard pill that lives in the navbar right side.
 * Shows the subscriber's referral count + copies their invite URL on click.
 */
export function ReferralPill({ inviteUrl, referralCount }: ReferralPillProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* fallback — select the URL in a temp input */
      const input = document.createElement("input");
      input.value = inviteUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={handleCopy}
      title="Copy your invite link"
      className={cn(
        "hidden items-center gap-2 rounded-lg border px-3 py-1.5 text-xs transition-all duration-200 md:flex",
        copied
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
          : "border-indigo-500/25 bg-indigo-500/8 text-indigo-400 hover:border-indigo-500/40 hover:bg-indigo-500/15",
      )}
    >
      {copied ? (
        <>
          <Check size={12} className="shrink-0" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Share2 size={12} className="shrink-0" />
          <span className="font-semibold tabular-nums">
            {referralCount}
          </span>
          <span className="text-indigo-500">referrals</span>
          <span className="ml-0.5 text-indigo-600">· Copy link</span>
        </>
      )}
    </button>
  );
}
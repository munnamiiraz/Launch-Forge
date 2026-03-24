                                          }
                                        </p>
                                      )}
                                      {prize.expiresAt && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                          Ends {new Date(prize.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No prizes available for this waitlist.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Category + tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge className="border-indigo-500/25 bg-indigo-500/10 text-xs text-indigo-400">
                      {wl.category}
                    </Badge>
                    {wl.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} className="border-zinc-800 bg-card/60 text-xs text-muted-foreground/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Users   size={14} className="text-indigo-400" />}
                  value={wl.totalSubscribers >= 1000 ? `${(wl.totalSubscribers / 1000).toFixed(1)}k` : wl.totalSubscribers.toLocaleString()}
                  label="in queue"
                />
                <StatPill
                  icon={<Share2  size={14} className="text-violet-400" />}
                  value={wl.referralCount >= 1000 ? `${(wl.referralCount / 1000).toFixed(1)}k` : wl.referralCount.toLocaleString()}
                  label="referrals"
                />
                <StatPill
                  icon={<Zap     size={14} className="text-amber-400"  />}
                  value={`${wl.viralScore}×`}
                  label="viral score"
                />
              </div>

              {/* Expiry notice */}
              {expiryDate && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/6 px-4 py-2.5">
                  <Calendar size={13} className="shrink-0 text-amber-400" />
                  <p className="text-xs text-amber-300">
                    Waitlist closes <span className="font-bold">{expiryDate}</span> — join before it's too late
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">{wl.description}</p>

              {/* Website link */}
              {wl.websiteUrl && (
                <a
                  href={wl.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-2 rounded-xl border border-border/80 bg-card/40 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/90"
                >
                  <ExternalLink size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Visit {wl.websiteUrl.replace(/https?:\/\//, "")}
                </a>
              )}
            </section>

            <Separator className="bg-muted/60" />

            {/* ── Owner message ─────────────────────────── */}
            {wl.ownerMessage && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                    <AvatarFallback className={cn(
                      "rounded-xl bg-gradient-to-br text-xs font-black text-white",
                      wl.logoGradient,
                    )}>
                      {wl.ownerAvatarInitials || wl.logoInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{wl.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground/60">Founder of {wl.name}</p>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-border/60 bg-card/30 px-5 py-4">
                  {/* Quote mark */}
                  <div className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-indigo-500/50">
                    "
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{wl.ownerMessage}</p>
                </div>
              </section>
            )}

            {/* ── Prize pool ────────────────────────────── */}
            {hasPrizes && (
              <>
                <Separator className="bg-muted/60" />
                <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ id: String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))} />
              </>
            )}

            {/* ── Public leaderboard ────────────────────── */}
            <Separator className="bg-muted/60" />
            <PublicLeaderboard
              entries={wl.leaderboard as any}
              prizes={wl.prizes.map((p, i) => ({ id: p.id || String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))}
              waitlistName={wl.name}
            />

          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN — sticky join panel
              ════════════════════════════════════════════════ */}
          <div className="lg:self-start lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/40">

              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/8 blur-3xl" />

              <div className="relative flex flex-col gap-5">
                {/* Panel header */}
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    {wl.isOpen ? "Reserve your spot" : "Waitlist closed"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {wl.isOpen
                      ? "Join now and refer friends to move up the queue."
                      : "This waitlist is no longer accepting signups."}
                  </p>
                </div>

                {/* Prize teaser */}
                {hasPrizes && wl.isOpen && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/6 px-3.5 py-2.5">
                    <Trophy size={14} className="shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-300">Prizes up for grabs</p>
                      <p className="truncate text-[10px] text-muted-foreground/60">
                        {wl.prizes[0].emoji} {wl.prizes[0].title}
                        {wl.prizes.length > 1 && ` + ${wl.prizes.length - 1} more`}
                      </p>
                    </div>
                    <a
                      href="#prizes"
                      className="shrink-0 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View →
                    </a>
                  </div>
                )}

                {/* Join section */}
                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative mt-16 border-t border-border/50 bg-[#070707] px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Powered by{" "}
          <Link href="#" className="font-semibold text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            LaunchForge
          </Link>
          {" "}· The viral waitlist platform for product launches
        </p>
      </footer>
    </div>
  );
}
                  label="viral score"
                />
              </div>

              {/* Expiry notice */}
              {expiryDate && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/6 px-4 py-2.5">
                  <Calendar size={13} className="shrink-0 text-amber-400" />
                  <p className="text-xs text-amber-300">
                    Waitlist closes <span className="font-bold">{expiryDate}</span> — join before it's too late
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">{wl.description}</p>

              {/* Website link */}
              {wl.websiteUrl && (
                <a
                  href={wl.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-2 rounded-xl border border-border/80 bg-card/40 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/90"
                >
                  <ExternalLink size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Visit {wl.websiteUrl.replace(/https?:\/\//, "")}
                </a>
              )}
            </section>

            <Separator className="bg-muted/60" />

            {/* ── Owner message ─────────────────────────── */}
            {wl.ownerMessage && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                    <AvatarFallback className={cn(
                      "rounded-xl bg-gradient-to-br text-xs font-black text-white",
                      wl.logoGradient,
                    )}>
                      {wl.ownerAvatarInitials || wl.logoInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{wl.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground/60">Founder of {wl.name}</p>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-border/60 bg-card/30 px-5 py-4">
                  {/* Quote mark */}
                  <div className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-indigo-500/50">
                    "
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{wl.ownerMessage}</p>
                </div>
              </section>
            )}

            {/* ── Prize pool ────────────────────────────── */}
            {hasPrizes && (
              <>
                <Separator className="bg-muted/60" />
                <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ id: String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))} />
              </>
            )}

            {/* ── Public leaderboard ────────────────────── */}
            <Separator className="bg-muted/60" />
            <PublicLeaderboard
              entries={wl.leaderboard as any}
              prizes={wl.prizes.map((p, i) => ({ id: p.id || String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))}
              waitlistName={wl.name}
            />

          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN — sticky join panel
              ════════════════════════════════════════════════ */}
          <div className="lg:self-start lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/40">

              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/8 blur-3xl" />

              <div className="relative flex flex-col gap-5">
                {/* Panel header */}
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    {wl.isOpen ? "Reserve your spot" : "Waitlist closed"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {wl.isOpen
                      ? "Join now and refer friends to move up the queue."
                      : "This waitlist is no longer accepting signups."}
                  </p>
                </div>

                {/* Prize teaser */}
                {hasPrizes && wl.isOpen && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/6 px-3.5 py-2.5">
                    <Trophy size={14} className="shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-300">Prizes up for grabs</p>
                      <p className="truncate text-[10px] text-muted-foreground/60">
                        {wl.prizes[0].emoji} {wl.prizes[0].title}
                        {wl.prizes.length > 1 && ` + ${wl.prizes.length - 1} more`}
                      </p>
                    </div>
                    <a
                      href="#prizes"
                      className="shrink-0 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View →
                    </a>
                  </div>
                )}

                {/* Join section */}
                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative mt-16 border-t border-border/50 bg-[#070707] px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Powered by{" "}
          <Link href="#" className="font-semibold text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            LaunchForge
          </Link>
          {" "}· The viral waitlist platform for product launches
        </p>
      </footer>
    </div>
  );
} : prize.currency ?? ''}${prize.value.toLocaleString()}`
                                          }
                                        </p>
                                      )}
                                      {prize.expiresAt && (
                                        <p className="text-[10px] text-muted-foreground/60 mt-1">
                                          Ends {new Date(prize.expiresAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">No prizes available for this waitlist.</p>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Category + tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge className="border-indigo-500/25 bg-indigo-500/10 text-xs text-indigo-400">
                      {wl.category}
                    </Badge>
                    {wl.tags.slice(0, 4).map((tag) => (
                      <Badge key={tag} className="border-zinc-800 bg-card/60 text-xs text-muted-foreground/60">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats strip */}
              <div className="grid grid-cols-3 gap-3">
                <StatPill
                  icon={<Users   size={14} className="text-indigo-400" />}
                  value={wl.totalSubscribers >= 1000 ? `${(wl.totalSubscribers / 1000).toFixed(1)}k` : wl.totalSubscribers.toLocaleString()}
                  label="in queue"
                />
                <StatPill
                  icon={<Share2  size={14} className="text-violet-400" />}
                  value={wl.referralCount >= 1000 ? `${(wl.referralCount / 1000).toFixed(1)}k` : wl.referralCount.toLocaleString()}
                  label="referrals"
                />
                <StatPill
                  icon={<Zap     size={14} className="text-amber-400"  />}
                  value={`${wl.viralScore}×`}
                  label="viral score"
                />
              </div>

              {/* Expiry notice */}
              {expiryDate && (
                <div className="flex items-center gap-2 rounded-xl border border-amber-500/15 bg-amber-500/6 px-4 py-2.5">
                  <Calendar size={13} className="shrink-0 text-amber-400" />
                  <p className="text-xs text-amber-300">
                    Waitlist closes <span className="font-bold">{expiryDate}</span> — join before it's too late
                  </p>
                </div>
              )}

              {/* Description */}
              <p className="text-sm leading-relaxed text-muted-foreground">{wl.description}</p>

              {/* Website link */}
              {wl.websiteUrl && (
                <a
                  href={wl.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex w-fit items-center gap-2 rounded-xl border border-border/80 bg-card/40 px-4 py-2.5 text-sm text-muted-foreground transition-all hover:border-zinc-700 hover:bg-muted/60 hover:text-foreground/90"
                >
                  <ExternalLink size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  Visit {wl.websiteUrl.replace(/https?:\/\//, "")}
                </a>
              )}
            </section>

            <Separator className="bg-muted/60" />

            {/* ── Owner message ─────────────────────────── */}
            {wl.ownerMessage && (
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0 rounded-xl">
                    <AvatarFallback className={cn(
                      "rounded-xl bg-gradient-to-br text-xs font-black text-white",
                      wl.logoGradient,
                    )}>
                      {wl.ownerAvatarInitials || wl.logoInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground/90">{wl.ownerName}</p>
                    <p className="text-[11px] text-muted-foreground/60">Founder of {wl.name}</p>
                  </div>
                </div>

                <div className="relative rounded-2xl border border-border/60 bg-card/30 px-5 py-4">
                  {/* Quote mark */}
                  <div className="absolute -left-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-2xl leading-none text-indigo-500/50">
                    "
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{wl.ownerMessage}</p>
                </div>
              </section>
            )}

            {/* ── Prize pool ────────────────────────────── */}
            {hasPrizes && (
              <>
                <Separator className="bg-muted/60" />
                <PrizePoolSection prizes={wl.prizes.map((p, i) => ({ id: String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))} />
              </>
            )}

            {/* ── Public leaderboard ────────────────────── */}
            <Separator className="bg-muted/60" />
            <PublicLeaderboard
              entries={wl.leaderboard as any}
              prizes={wl.prizes.map((p, i) => ({ id: p.id || String(i), rankFrom: p.rankFrom, rankTo: p.rankTo, rankLabel: p.rankLabel, title: p.title, description: p.description, prizeType: p.prizeType as any, value: p.value, currency: p.currency, emoji: p.emoji, expiresAt: p.expiresAt }))}
              waitlistName={wl.name}
            />

          </div>

          {/* ════════════════════════════════════════════════
              RIGHT COLUMN — sticky join panel
              ════════════════════════════════════════════════ */}
          <div className="lg:self-start lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-3xl border border-zinc-800/70 bg-[#0d0d0d] p-6 shadow-2xl shadow-black/40">

              {/* Top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

              {/* Glow */}
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-indigo-500/8 blur-3xl" />

              <div className="relative flex flex-col gap-5">
                {/* Panel header */}
                <div>
                  <h2 className="text-lg font-black tracking-tight text-foreground">
                    {wl.isOpen ? "Reserve your spot" : "Waitlist closed"}
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {wl.isOpen
                      ? "Join now and refer friends to move up the queue."
                      : "This waitlist is no longer accepting signups."}
                  </p>
                </div>

                {/* Prize teaser */}
                {hasPrizes && wl.isOpen && (
                  <div className="flex items-center gap-2.5 rounded-xl border border-amber-500/15 bg-amber-500/6 px-3.5 py-2.5">
                    <Trophy size={14} className="shrink-0 text-amber-400" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-amber-300">Prizes up for grabs</p>
                      <p className="truncate text-[10px] text-muted-foreground/60">
                        {wl.prizes[0].emoji} {wl.prizes[0].title}
                        {wl.prizes.length > 1 && ` + ${wl.prizes.length - 1} more`}
                      </p>
                    </div>
                    <a
                      href="#prizes"
                      className="shrink-0 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
                    >
                      View →
                    </a>
                  </div>
                )}

                {/* Join section */}
                <JoinSection waitlist={wl as unknown as PublicWaitlistData} />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative mt-16 border-t border-border/50 bg-[#070707] px-4 py-8 text-center">
        <p className="text-xs text-muted-foreground/40">
          Powered by{" "}
          <Link href="#" className="font-semibold text-muted-foreground/80 hover:text-muted-foreground transition-colors">
            LaunchForge
          </Link>
          {" "}· The viral waitlist platform for product launches
        </p>
      </footer>
    </div>
  );
}

interface ResultRingProps {
  value: number
}

export function ResultRing({ value }: ResultRingProps) {
  const normalized = Math.max(0, Math.min(100, value))
  const radius = 74
  const stroke = 12
  const size = 180
  const circumference = 2 * Math.PI * radius
  const progress = circumference - (normalized / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90" width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(148,163,184,0.25)"
          strokeWidth={stroke}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#ringGradient)"
          strokeWidth={stroke}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={progress}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
        <defs>
          <linearGradient id="ringGradient" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#4ade80" />
            <stop offset="50%" stopColor="#22d3ee" />
            <stop offset="100%" stopColor="#d946ef" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute text-center">
        <p className="font-display text-4xl font-bold text-white">{normalized}%</p>
        <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Точность</p>
      </div>
    </div>
  )
}

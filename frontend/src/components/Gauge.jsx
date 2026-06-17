export default function Gauge({ score, size = 16 }) {
  const color = score > 70 ? '#22c55e' : score > 40 ? '#f97316' : '#ef4444';
  const r = size * 1.75;
  const circum = 2 * Math.PI * r;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size * 4, height: size * 4 }}>
      <svg className="w-full h-full transform -rotate-90">
        <circle cx={size * 2} cy={size * 2} r={r} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200" />
        <circle cx={size * 2} cy={size * 2} r={r} stroke="currentColor" strokeWidth="4" fill="transparent"
                strokeDasharray={circum} strokeDashoffset={circum - (circum * score) / 100}
                strokeLinecap="round" style={{ color }} />
      </svg>
      <span className="absolute text-sm font-bold">{score}</span>
    </div>
  );
}

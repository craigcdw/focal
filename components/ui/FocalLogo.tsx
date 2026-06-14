export function FocalIcon({ size = 32 }: { size?: number }) {
  const outerR = 14;
  const innerR = 8.5;
  const outerC = 2 * Math.PI * outerR;
  const innerC = 2 * Math.PI * innerR;
  const gap = 0.13;

  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="focal-g" x1="3" y1="29" x2="29" y2="3" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5BAEF5" />
          <stop offset="100%" stopColor="#1E4D8C" />
        </linearGradient>
      </defs>
      <circle
        cx="16" cy="16" r={outerR}
        stroke="url(#focal-g)" strokeWidth="2.8"
        strokeDasharray={`${outerC * (1 - gap)} ${outerC * gap}`}
        strokeLinecap="round"
        transform="rotate(-50 16 16)"
      />
      <circle
        cx="16" cy="16" r={innerR}
        stroke="url(#focal-g)" strokeWidth="2"
        strokeDasharray={`${innerC * (1 - gap)} ${innerC * gap}`}
        strokeLinecap="round"
        transform="rotate(-50 16 16)"
      />
      <circle cx="16" cy="16" r="3.8" fill="white" />
    </svg>
  );
}

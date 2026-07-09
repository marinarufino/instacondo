/**
 * Logo Connexa — "C" em gradiente roxo com nós circulares nas pontas,
 * seguindo a identidade visual oficial.
 */
export function ConnexaMark({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-label="Connexa"
    >
      <defs>
        <linearGradient id="connexa-grad" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      {/* Arco do "C" */}
      <path
        d="M 78 27 A 34 34 0 1 0 78 73"
        stroke="url(#connexa-grad)"
        strokeWidth="16"
        strokeLinecap="round"
      />
      {/* Nós nas pontas do C */}
      <circle cx="78" cy="27" r="11" fill="url(#connexa-grad)" />
      <circle cx="78" cy="27" r="5" fill="white" />
      <circle cx="78" cy="73" r="11" fill="url(#connexa-grad)" />
      <circle cx="78" cy="73" r="5" fill="white" />
      {/* Nó menor à esquerda */}
      <circle cx="16" cy="50" r="8" fill="url(#connexa-grad)" />
      <circle cx="16" cy="50" r="3.5" fill="white" />
    </svg>
  );
}

export function ConnexaWordmark({
  markSize = 34,
  light = false,
}: {
  markSize?: number;
  light?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-2">
      <ConnexaMark size={markSize} />
      <span
        className={`text-2xl font-extrabold tracking-tight ${
          light ? "text-white" : "text-dark"
        }`}
      >
        Connexa
      </span>
    </span>
  );
}

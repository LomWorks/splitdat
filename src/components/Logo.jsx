export default function Logo() {
  return (
    <span className="logo" aria-label="splitdat">
      <span className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 760 240" width="240" height="76" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <style>{`
              .wordmark { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; font-weight: 700; letter-spacing: -1.5px; }
              .tagline { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; }
            `}</style>
          </defs>

          {/* ICON: a bill/coin torn into two equal shares along a jagged "split" seam */}
          <g transform="translate(120,120)">
            {/* left share */}
            <g transform="translate(-6,0)">
              <path
                d="M 0,-68
                   A 68,68 0 0,0 0,68
                   L 14,37
                   L -14,16
                   L 14,-16
                   L -14,-37
                   Z"
                fill="#48667c"
              />
            </g>
            {/* right share */}
            <g transform="translate(6,0)">
              <path
                d="M 0,-68
                   A 68,68 0 0,1 0,68
                   L -14,37
                   L 14,16
                   L -14,-16
                   L 14,-37
                   Z"
                fill="#7394aa"
              />
            </g>
          </g>

          {/* WORDMARK */}
          <text x="228" y="140" className="wordmark" fontSize="76" fill="#18232f">
            split<tspan fill="#5c7c93">dat</tspan>
          </text>

          {/* TAGLINE */}
          <text x="230" y="172" className="tagline" fontSize="18" fontWeight="500" letterSpacing="2.5px" fill="#788995">
            EVEN SPLITS, NO DRAMA
          </text>
        </svg>
      </span>
    </span>
  );
}

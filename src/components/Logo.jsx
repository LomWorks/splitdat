export default function Logo() {
return (
<span className="logo" aria-label="splitdat">
<span className="logo-mark" aria-hidden="true">
<svg viewBox="0 0 40 40" fill="none">
<circle
cx="20"
cy="20"
r="16"
stroke="currentColor"
strokeWidth="3"
/>
<path
d="M20 4v32M20 20l11-11M20 20 9 31"
stroke="currentColor"
strokeWidth="3"
strokeLinecap="round"
/>
<circle cx="20" cy="20" r="4" fill="currentColor" />
</svg>
</span>

<span className="logo-wordmark">
split<strong>dat</strong>
</span>
</span>
);
}




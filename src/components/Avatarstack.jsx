import "../styles/AvatarStack.css";

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getColorForName(name) {
  const colors = [
    "hsl(48, 89%, 60%)", // butter
    "hsl(210, 50%, 60%)", // blue
    "hsl(120, 40%, 55%)", // green
    "hsl(30, 80%, 55%)", // orange
    "hsl(280, 60%, 55%)", // purple
  ];
  const hash = name.charCodeAt(0) + name.charCodeAt(name.length - 1);
  return colors[hash % colors.length];
}

function Avatar({ name, size = "md" }) {
  return (
    <div
      className={`avatar avatar--${size}`}
      style={{ backgroundColor: getColorForName(name) }}
      title={name}
    >
      {getInitials(name)}
    </div>
  );
}

export default function AvatarStack({
  names = [],
  size = "md",
  limit = 3,
  className = "",
}) {
  const displayed = names.slice(0, limit);
  const overflow = Math.max(0, names.length - limit);

  if (names.length === 0) {
    return null;
  }

  return (
    <div className={`avatar-stack avatar-stack--${size} ${className}`}>
      {displayed.map((name) => (
        <Avatar key={name} name={name} size={size} />
      ))}
      {overflow > 0 && (
        <div
          className={`avatar avatar--${size} avatar--overflow`}
          title={`+${overflow} more`}
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}
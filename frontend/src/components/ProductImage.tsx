import { useMemo } from "react";

interface Props {
  nombre: string;
  imagenUrl?: string | null;
  categoria?: { icono?: string | null; nombre?: string } | null;
  className?: string;
  style?: React.CSSProperties;
}

const PALETAS = [
  { bg: "#fde8e6", fg: "#c0392b" },
  { bg: "#e6f4ea", fg: "#1e8449" },
  { bg: "#eaf2fb", fg: "#2874a6" },
  { bg: "#fff3cd", fg: "#9a7d0a" },
  { bg: "#f4e6f0", fg: "#7b3f8f" },
  { bg: "#e8f8f5", fg: "#117a65" },
  { bg: "#fdebd0", fg: "#a04000" },
  { bg: "#ebdef0", fg: "#5b2c6f" },
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function ProductImage({ nombre, imagenUrl, categoria, className, style }: Props) {
  const placeholder = useMemo(() => {
    const paleta = PALETAS[hashStr(categoria?.nombre || nombre) % PALETAS.length];
    const icono = categoria?.icono || "🛒";
    const partes = nombre.split(/\s+/).slice(0, 3).join(" ");

    const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">
  <rect width="400" height="400" fill="${paleta.bg}"/>
  <text x="200" y="190" font-size="140" text-anchor="middle" dominant-baseline="middle">${icono}</text>
  <text x="200" y="320" font-size="22" text-anchor="middle" fill="${paleta.fg}" font-weight="700" font-family="-apple-system, system-ui, sans-serif">${partes}</text>
</svg>`.trim();

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }, [nombre, categoria]);

  return (
    <img
      src={imagenUrl || placeholder}
      alt={nombre}
      className={className}
      style={style}
      onError={(e) => {
        // Si la imagen externa falla, usa el placeholder
        (e.currentTarget as HTMLImageElement).src = placeholder;
      }}
    />
  );
}

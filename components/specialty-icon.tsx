import { specialtyIconModel } from "@/lib/specialty-icons";

export function SpecialtyIcon({
  slug,
  size = 24,
  color,
}: {
  slug?: string | null;
  size?: number;
  color?: string;
}) {
  const model = specialtyIconModel(slug, size);
  const stroke = color || model.color;
  return (
    <svg
      width={model.size}
      height={model.size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
    >
      {model.paths.map((d, index) => (
        <path
          key={`${model.id}-${index}`}
          d={d}
          fill="none"
          stroke={stroke}
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

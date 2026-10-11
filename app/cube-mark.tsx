// A cube drawn as three faces, used in the header and the generated icons.
export function CubeMark({ size, colour = "currentColor" }: { size: number; colour?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={colour} strokeWidth={1.8} strokeLinejoin="round">
      <path d="M12 2.5 21 7.5v9L12 21.5 3 16.5v-9z" />
      <path d="M3 7.5 12 12.5l9-5M12 12.5v9" />
      <path d="M7.5 5 16.5 10M16.5 5 7.5 10" strokeWidth={1.2} opacity={0.7} />
    </svg>
  );
}

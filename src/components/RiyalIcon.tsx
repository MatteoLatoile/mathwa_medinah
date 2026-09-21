type Props = {
  className?: string;
};

export default function RiyalIcon({
  className = "h-[1em] w-[1em]",
}: Props) {
  return (
    <span
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        WebkitMask:
          "url('/riyal-symbol.svg') center / contain no-repeat",
        mask:
          "url('/riyal-symbol.svg') center / contain no-repeat",
      }}
    />
  );
}

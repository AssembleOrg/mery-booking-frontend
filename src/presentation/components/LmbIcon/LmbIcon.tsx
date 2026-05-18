import Image from 'next/image';

interface LmbIconProps {
  size?: number;
}

export function LmbIcon({ size = 16 }: LmbIconProps) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        overflow: 'hidden',
        flexShrink: 0,
        verticalAlign: 'middle',
      }}
    >
      <Image
        src="/chama-mery.png"
        alt="Last Minute Booking"
        width={250}
        height={250}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: '35% center',
          filter: 'drop-shadow(0 0 2px rgba(180, 60, 0, 0.65))',
        }}
      />
    </span>
  );
}

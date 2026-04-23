import Image from 'next/image';

export default function HeroSphere() {
  return (
    <section className="relative w-full">
      <Image
        src="/hero.jpg"
        alt="Original Filter"
        width={1920}
        height={1080}
        className="h-auto w-full"
        priority
      />
    </section>
  );
}

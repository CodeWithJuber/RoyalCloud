import Image from "next/image";

export function Footer() {
  return (
    <footer className="bg-ink px-4 py-12 text-white sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto]">
        <div>
          <Image src="/brand/royalclouds-logo-white.png" alt="Royal Clouds" width={180} height={42} className="h-10 w-auto" />
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Premium SSD web hosting, KVM VPS, managed WordPress, cloud hosting, and dedicated servers redesigned as a custom conversion-focused experience.</p>
        </div>
        <nav className="grid grid-cols-2 gap-4 text-sm font-bold sm:grid-cols-4" aria-label="Footer navigation">
          <a className="focus-ring rounded-full px-3 py-2 hover:bg-white/10" href="#plans">Plans</a>
          <a className="focus-ring rounded-full px-3 py-2 hover:bg-white/10" href="#domains">Domains</a>
          <a className="focus-ring rounded-full px-3 py-2 hover:bg-white/10" href="#support">Support</a>
          <a className="focus-ring rounded-full px-3 py-2 hover:bg-white/10" href="https://my.royalclouds.net/clientarea.php">Login</a>
        </nav>
      </div>
    </footer>
  );
}

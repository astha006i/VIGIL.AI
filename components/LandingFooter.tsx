const FLAG_SRC =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDt2Ylxk-gVfpKJ2cxZKUBUxIalL9qBOzEyPsKdDFI2PpXuX7h1YGlDH67hwF04ZbqOvGwELlaBx1SqI_OcK0nWOeTxg8YbyxFHFdvIOVfFvoUL6WDd00n8qe1P8nub5OsNfToWHSCcDywe8FcLB7TFHbPxtf_Uqnp4Ggj29uaMvHg0_9niOmeTwvV0Q6j0hxKqyQiPSPyz6-550g6wARGrvoAiG-Sq6B88FO3q1ltA8HukxcToOHHQTFEpinCtGF3tMA';

const footerLinks = ['Digital India', 'Transparent India', 'Stronger India'];

export default function LandingFooter() {
  return (
    <footer className="mt-auto border-t border-outline-variant bg-surface-container-low">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
        <div className="flex flex-col items-center gap-4 text-sm text-primary md:flex-row">
          <span>© 2024 Vigil Intelligence Platform. All rights reserved.</span>
          <span className="hidden text-outline-variant md:inline">|</span>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="India flag icon"
              className="h-6 w-6 object-contain"
              src={FLAG_SRC}
            />
            <span>Made for India. Made for Citizens.</span>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm">
          {footerLinks.map((label, index) => (
            <span key={label} className="flex items-center gap-6">
              {index > 0 && <span className="h-1 w-1 rounded-full bg-outline" />}
              <a className="font-medium text-primary transition-colors hover:text-primary" href="#">
                {label}
              </a>
            </span>
          ))}
        </div>
      </div>
    </footer>
  );
}
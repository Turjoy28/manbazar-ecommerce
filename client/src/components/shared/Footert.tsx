import { Globe, Mail, MapPin, Phone } from "lucide-react";
import Logo from "./Logo";

export default function Footer({logo, footerInfo}) {
    return (
      <footer className="bg-tertiary text-(--tertiary-text) mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex justify-between">
            <div className="max-w-xs">
              {/* Logo */}
              <Logo logo={logo} />

              {/* Description */}
              <p className="max-w-2xl mt-5 leading-7">
                {footerInfo?.shortDescription}
              </p>
            </div>

            {/* Contact */}
            <div className={`space-y-5`}>
              <h3 className="underline">Contact information</h3>
              <p className="flex items-center gap-2">
                <Phone /> {footerInfo?.contactInfo?.number}
              </p>

              <p className="flex items-center gap-2">
                <Mail /> {footerInfo?.contactInfo?.email}
              </p>

              <p className="flex items-center gap-2">
                <Globe /> {footerInfo?.contactInfo?.website}
              </p>
            </div>

            <div>
              <h3 className="underline mb-3">Office location</h3>
              <p className="flex items-center gap-2">
                <MapPin /> {footerInfo.location}
              </p>
            </div>
          </div>
          {/* Divider */}
          <div className="border-t border-white/10 my-8" />

          {/* Bottom */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-sm">
              © {new Date().getFullYear()} {footerInfo.copyright}
            </p>

            <p className="text-sm">
              Developed by{" "}
              <a
                href="https://okobiz.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:text-orange-300 transition"
              >
                Okobiz
              </a>
            </p>
          </div>
        </div>
      </footer>
    );
}

import { BinaryText } from "@/components/binary-text"
import { SphericalNetwork } from "@/components/spherical-network"
import { Instagram, Github, Linkedin } from "lucide-react"

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="text-center space-y-6 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Hello, I&apos;m{" "}
            <span className="text-cyan-400">Rakymzhan</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-400">
            I&apos;m a{" "}
            <BinaryText
              text="machine learning and software engineer"
              className="text-cyan-400 font-semibold"
            />
          </p>

          <div className="flex items-center justify-center gap-6 pt-6">
            <a
              href="https://www.instagram.com/qonstan/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-900 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6" />
            </a>
            <a
              href="https://github.com/qonstant"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-900 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              aria-label="GitHub"
            >
              <Github className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/in/rakymzhan/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-900 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-6 h-6" />
            </a>
            <a
              href="https://orcid.org/0009-0006-3107-2412"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-900 hover:bg-cyan-400/20 hover:text-cyan-400 transition-all duration-300 hover:scale-110"
              aria-label="ORCID"
            >
              <svg
                className="w-6 h-6"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zM7.369 4.378c.525 0 .947.431.947.947s-.422.947-.947.947a.95.95 0 0 1-.947-.947c0-.525.422-.947.947-.947zm-.722 3.038h1.444v10.041H6.647V7.416zm3.562 0h3.9c3.712 0 5.344 2.653 5.344 5.025 0 2.578-2.016 5.025-5.325 5.025h-3.919V7.416zm1.444 1.303v7.444h2.297c3.272 0 4.022-2.484 4.022-3.722 0-2.016-1.284-3.722-4.097-3.722h-2.222z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="w-full">
        <SphericalNetwork />
        <p className="text-center text-gray-600 text-sm pb-4">
          © {new Date().getFullYear()} Rakymzhan. All rights reserved.
        </p>
      </div>
    </main>
  )
}

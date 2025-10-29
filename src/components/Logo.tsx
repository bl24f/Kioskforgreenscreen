import { useId, memo } from "react";
import logoImage from "figma:asset/14231ae664bd72bad3a7a1dcc2e44752e5d92675.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export const Logo = memo(function Logo({ size = "md", showText = true, className = "" }: LogoProps) {
  const dimensions = {
    sm: { icon: "w-12 h-12", text: "text-2xl", subtext: "text-sm" },
    md: { icon: "w-16 h-16", text: "text-4xl", subtext: "text-lg" },
    lg: { icon: "w-24 h-24", text: "text-6xl", subtext: "text-xl" },
  };

  const dim = dimensions[size];

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* Logo Icon */}
      <div className="relative animate-in fade-in duration-700">
        <img 
          src={logoImage} 
          alt="Green Screen Pictures Logo" 
          className={`${dim.icon} drop-shadow-lg object-contain`}
        />
      </div>

      {/* Text */}
      {showText && (
        <div className="animate-in slide-in-from-right-4 fade-in duration-700">
          <h1 className={`${dim.text} leading-none`}>
            <span className="text-green-500">Green Screen</span>{" "}
            <span className="text-slate-900">Pictures</span>
          </h1>
          <p className={`${dim.subtext} text-slate-900 mt-1`}>
            Capture pixel-perfect moments 📸
          </p>
        </div>
      )}
    </div>
  );
});
import * as React from "react"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

export interface TextLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string
  showArrow?: boolean
}

export const TextLink = React.forwardRef<HTMLAnchorElement, TextLinkProps>(
  ({ className, href, children, showArrow = true, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        href={href}
        className={cn(
          "group inline-flex items-center gap-[14px] border-b border-[rgba(215,219,202,0.36)] py-[10px] text-[12.5px] font-medium transition-colors",
          className
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <ArrowRight className="h-[14px] w-[14px] transition-transform duration-300 ease-reveal group-hover:translate-x-[2px] group-hover:-translate-y-[2px]" />
        )}
      </Link>
    )
  }
)
TextLink.displayName = "TextLink"

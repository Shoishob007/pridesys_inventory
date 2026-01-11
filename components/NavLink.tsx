import Link, { LinkProps } from "next/link";
import { usePathname } from "next/navigation";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface NavLinkProps extends LinkProps {
  className?: string;
  activeClassName?: string;
  exact?: boolean;
  children: React.ReactNode;
}

const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    { className, activeClassName, exact = false, href, children, ...props },
    ref
  ) => {
    const pathname = usePathname();

    // Check if link is active
    const isActive = exact
      ? pathname === href
      : pathname.startsWith(href as string);

    return (
      <Link
        ref={ref}
        href={href}
        className={cn(className, isActive && activeClassName)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

NavLink.displayName = "NavLink";

export { NavLink };

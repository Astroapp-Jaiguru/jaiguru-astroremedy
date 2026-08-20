/**
 * Static navigation data shared by the desktop NavMenu and the mobile menu.
 * Kept outside the client component module so server components can import
 * the plain value without crossing the client/server boundary.
 */
export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string }[];
}

export const MAIN_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Consultations", href: "/consultations" },
  { label: "Products", href: "/products" },
  { label: "Product List", href: "/products" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/photo-gallery" },
  { label: "Articles", href: "/articles" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

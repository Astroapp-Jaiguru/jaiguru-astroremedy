import {
  LayoutDashboard,
  Package,
  Sparkles,
  FolderTree,
  Home,
  ImageIcon,
  Megaphone,
  Palette,
  UserRound,
  Images,
  Clapperboard,
  SquarePlay,
  MessageSquareQuote,
  Inbox,
  Share2,
  Phone,
  MapPin,
  FileText,
  Search,
  SlidersHorizontal,
  Users,
  KeyRound,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavGroup {
  label: string;
  items: AdminNavItem[];
}

export const adminNav: AdminNavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin", icon: LayoutDashboard }],
  },
  {
    label: "Catalog",
    items: [
      { title: "Products", href: "/admin/products", icon: Package },
      { title: "Services", href: "/admin/services", icon: Sparkles },
      { title: "Categories", href: "/admin/categories", icon: FolderTree },
    ],
  },
  {
    label: "Homepage",
    items: [
      { title: "Homepage Sections", href: "/admin/homepage", icon: Home },
      { title: "Hero Section", href: "/admin/hero", icon: ImageIcon },
      { title: "Announcements", href: "/admin/announcements", icon: Megaphone },
    ],
  },
  {
    label: "Content",
    items: [
      { title: "Logo & Branding", href: "/admin/branding", icon: Palette },
      {
        title: "Astrologer Profile",
        href: "/admin/astrologer",
        icon: UserRound,
      },
      { title: "Photo Gallery", href: "/admin/gallery/photos", icon: Images },
      { title: "Video Gallery", href: "/admin/gallery/videos", icon: Clapperboard },
      { title: "YouTube Gallery", href: "/admin/gallery/youtube", icon: SquarePlay },
      { title: "Testimonials", href: "/admin/testimonials", icon: MessageSquareQuote },
      { title: "Social Media", href: "/admin/social-links", icon: Share2 },
      { title: "Contact Messages", href: "/admin/contact", icon: Inbox },
      { title: "Contact Settings", href: "/admin/contact-settings", icon: Phone },
      { title: "Google Map", href: "/admin/map", icon: MapPin },
      { title: "Legal Pages", href: "/admin/legal-pages", icon: FileText },
      { title: "SEO Settings", href: "/admin/seo", icon: Search },
      { title: "Theme Settings", href: "/admin/theme-settings", icon: SlidersHorizontal },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Admin Users", href: "/admin/users", icon: Users },
      { title: "Change Password", href: "/admin/change-password", icon: KeyRound },
    ],
  },
];

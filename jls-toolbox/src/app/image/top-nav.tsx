"use client";
import React from "react";
import { Minimize2, Scaling } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

const feature_links = [
  {
    label: "image compressor",
    href: "/image/image-compress",
    icon: <Minimize2 className="w-4 h-4" />,
  },
  {
    label: "image resize",
    href: "/image/image-resize",
    icon: <Scaling className="w-4 h-4" />,
  },
];

const TopNav = () => {
  const pathname = usePathname();
  const [activeKey, setActiveKey] = React.useState(pathname);
  return (
    <ul
      className={cn("flex space-x-2 py-2 px-4")}
      onMouseLeave={() => setActiveKey(pathname)}
    >
      {feature_links.map(({ label, href, icon }) => (
        <li
          key={label}
          className="relative py-1 px-2 cursor-pointer rounded-full"
          onMouseEnter={() => {
            setActiveKey(href);
          }}
        >
          <Link
            href={href}
            className="flex items-center gap-2 capitalize w-fit"
          >
            <motion.span
              layout
              className="text-gray-500"
              transition={{ duration: 0.3 }}
            >
              {icon}
            </motion.span>
            <AnimatePresence mode="popLayout">
              {activeKey === href && (
                <motion.span
                  className="text-gray-500 font-bold text-xs whitespace-nowrap"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  layout
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
          {activeKey === href && (
            <motion.div
              className={cn(
                "absolute left-0 top-0 w-full h-full rounded-full bg-gray-200 z-[-1] shadow-inner"
              )}
              layoutId="indicator"
              transition={{ duration: 0.4 }}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

export default TopNav;

"use client";

import type { ReactNode } from "react";
import { PageTransition } from "@/components/motion/page-transition";

interface TemplateProps {
	children: ReactNode;
}

export default function Template({ children }: TemplateProps) {
	return <PageTransition>{children}</PageTransition>;
}

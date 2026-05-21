import { motion } from "framer-motion";
import { ArrowUpRight, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/utils";

export interface AutomationSummary {
	id: string;
	slug: string;
	title: string;
	excerpt?: string | null;
	coverImage?: string | null;
	fileUrl?: string | null;
	tags: Array<{ id: string; name: string; slug: string }>;
}

interface AutomationCardProps {
	automation: AutomationSummary;
	className?: string;
}

export function AutomationCard({ automation, className }: AutomationCardProps) {
	return (
		<motion.article
			className={cn("group relative", className)}
			initial={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.5 }}
			viewport={{ once: true, margin: "-50px" }}
			whileInView={{ opacity: 1, y: 0 }}
		>
			<Link className="block" to={`/automations/${automation.slug}`}>
				<div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
					{automation.coverImage ? (
						<img
							alt={automation.title}
							className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
							src={automation.coverImage}
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200">
							<span className="text-gray-300 text-sm">No image</span>
						</div>
					)}
					{automation.fileUrl && (
						<span className="absolute top-4 left-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 font-medium text-gray-700 text-xs backdrop-blur">
							<Download className="h-3 w-3" /> Files
						</span>
					)}
					<div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white opacity-0 shadow transition-opacity duration-300 group-hover:opacity-100">
						<ArrowUpRight className="h-5 w-5" />
					</div>
				</div>
				<div className="pt-5">
					{automation.tags.length > 0 && (
						<div className="mb-2 flex flex-wrap gap-2">
							{automation.tags.slice(0, 2).map((t) => (
								<span
									className="rounded-full bg-gray-100 px-2.5 py-0.5 font-medium text-gray-600 text-xs"
									key={t.id}
								>
									{t.name}
								</span>
							))}
						</div>
					)}
					<h3 className="font-semibold text-lg leading-tight tracking-tight transition-colors group-hover:text-gray-600">
						{automation.title}
					</h3>
					{automation.excerpt && (
						<p className="mt-2 line-clamp-2 text-gray-500 text-sm leading-relaxed">
							{automation.excerpt}
						</p>
					)}
				</div>
			</Link>
		</motion.article>
	);
}

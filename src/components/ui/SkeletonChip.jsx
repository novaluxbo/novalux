'use client';

import { motion } from 'framer-motion';

export default function SkeletonChip({ widths = [80, 72, 56, 60] }) {
    return (
        <div className="flex gap-2">
            {widths.map((w) => (
                <div
                    key={w}
                    className="h-6 rounded-full bg-emerald-800 border border-emerald-700 animate-pulse"
                    style={{ width: w }}
                />
            ))}
        </div>
    );
}
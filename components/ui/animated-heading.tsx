"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

/**
 * Headline reveal that works in every locale, including Arabic.
 *
 * Why not Shuffle: it splits text into per-CHARACTER spans, which severs
 * Arabic letter joining (كتابة -> ك ت ا ب ة). Our workaround was to disable
 * the effect under RTL entirely, so the Arabic hero had no animation at all.
 *
 * This splits on WORDS instead. Word boundaries are safe in every script —
 * Arabic letters inside a word stay joined — so all 7 locales get the same
 * treatment and no branch is needed.
 *
 * Each word rises, unblurs and settles with a slight overshoot, staggered
 * left-to-right (or right-to-left, following the reading direction).
 */

export type AnimatedHeadingProps = {
  text: string;
  className?: string;
  /** Seconds between consecutive words. */
  stagger?: number;
  /** Delay before the first word, for sequencing against other elements. */
  delay?: number;
  as?: "h1" | "h2" | "h3" | "p";
};

export function AnimatedHeading({
  text,
  className,
  stagger = 0.075,
  delay = 0,
  as: Tag = "h1",
}: AnimatedHeadingProps) {
  const reduced = useReducedMotion();
  const words = useMemo(() => text.split(/(\s+)/).filter((w) => w.trim().length > 0), [text]);

  const MotionTag = motion[Tag];

  // Reduced motion: render the text plainly, no transform, no blur.
  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      // aria-label + aria-hidden children: screen readers announce the whole
      // sentence once instead of reading it word-by-word as separate nodes.
      aria-label={text}
    >
      {words.map((word, i) => (
        // The clip window needs generous bottom padding: Arabic descenders
        // (ي ج ح خ س ش) and the dots of ب/ت reach well below the baseline, and
        // a tight overflow-hidden box sheared them off mid-animation.
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom pb-[0.35em] -mb-[0.35em]" aria-hidden>
          <motion.span
            className="inline-block"
            variants={{
              hidden: { y: "110%", opacity: 0, filter: "blur(8px)", rotate: 2 },
              visible: {
                y: "0%",
                opacity: 1,
                filter: "blur(0px)",
                rotate: 0,
                transition: { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {word}
          </motion.span>
          {/* Real space between words, outside the animated span so the
              overflow-hidden clip never eats it. */}
          {i < words.length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </MotionTag>
  );
}

export default AnimatedHeading;

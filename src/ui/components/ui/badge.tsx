import type { ComponentProps } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils.ts";

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-md border border-transparent px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity] duration-[var(--motion)] ease-[var(--motion-ease)] focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        destructive: "bg-destructive/20 text-destructive",
        outline: "border-border text-foreground",
        ghost: "text-muted-foreground",
        /** State chips share one neutral fill; a dot carries the hue. */
        neutral: "bg-foreground/[0.07] text-muted-foreground",
        new: "bg-foreground/[0.07] text-foreground before:size-1.5 before:rounded-full before:bg-add before:content-['']",
        changed:
          "bg-foreground/[0.07] text-foreground before:size-1.5 before:rounded-full before:bg-primary before:content-['']",
        /** A reference to something on the page: a note letter, a commit in this review. */
        ref: "bg-primary/[0.12] text-primary",
      },
      size: {
        sm: "h-5 rounded-[5px] px-1.5 py-0 text-xs leading-none",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({
  className,
  variant = "default",
  size,
  asChild = false,
  ...props
}: ComponentProps<"span"> & VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };

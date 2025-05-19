"use client"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { cn } from "@/lib/utils"

interface MarkdownProps {
  children: string
  className?: string
}

export function Markdown({ children, className }: MarkdownProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      className={cn("prose prose-invert max-w-none", className)}
      components={{
        h1: ({ className, ...props }) => <h1 className={cn("text-2xl font-bold mt-2 mb-4", className)} {...props} />,
        h2: ({ className, ...props }) => <h2 className={cn("text-xl font-bold mt-2 mb-3", className)} {...props} />,
        h3: ({ className, ...props }) => <h3 className={cn("text-lg font-bold mt-2 mb-3", className)} {...props} />,
        p: ({ className, ...props }) => <p className={cn("mb-3", className)} {...props} />,
        ul: ({ className, ...props }) => <ul className={cn("list-disc pl-6 mb-3", className)} {...props} />,
        ol: ({ className, ...props }) => <ol className={cn("list-decimal pl-6 mb-3", className)} {...props} />,
        li: ({ className, ...props }) => <li className={cn("mb-1", className)} {...props} />,
        a: ({ className, ...props }) => <a className={cn("text-blue-400 hover:underline", className)} {...props} />,
        code: ({ className, ...props }) => (
          <code className={cn("bg-muted px-1 py-0.5 rounded text-sm", className)} {...props} />
        ),
        pre: ({ className, ...props }) => (
          <pre className={cn("bg-muted p-3 rounded-md overflow-auto mb-3", className)} {...props} />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote className={cn("border-l-4 border-muted pl-4 italic", className)} {...props} />
        ),
        table: ({ className, ...props }) => (
          <table className={cn("border-collapse w-full mb-3", className)} {...props} />
        ),
        th: ({ className, ...props }) => (
          <th className={cn("border border-muted px-2 py-1 bg-muted", className)} {...props} />
        ),
        td: ({ className, ...props }) => <td className={cn("border border-muted px-2 py-1", className)} {...props} />,
      }}
    >
      {children}
    </ReactMarkdown>
  )
}

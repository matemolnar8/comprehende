import { padLayer, sizeLabel, type ReviewMeta } from "../api.ts";
import { Button } from "@/components/ui/button.tsx";

export function Overview(props: { meta: ReviewMeta; onOpenLayer: (id: string) => void }) {
  const { meta, onOpenLayer } = props;
  return (
    <div className="mb-8">
      {meta.document.walkthrough !== undefined ? (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">{meta.document.walkthrough}</h1>
      ) : (
        <h1 className="mb-4 font-serif text-[1.75rem] leading-snug text-foreground">Overview</h1>
      )}
      <p className="mb-10 text-muted-foreground">
        {sizeLabel(meta.document.size)} · {meta.files.length} files
      </p>
      <ol className="m-0 list-none p-0">
        {meta.groups.map((group, index) => (
          <li key={group.id} className="mb-2">
            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full min-w-0 items-start justify-start gap-4 rounded-md px-4 py-4 text-left font-normal whitespace-normal"
              onClick={() => onOpenLayer(group.id)}
            >
              <span className="mt-0.5 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                {padLayer(index + 1)}
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block font-medium text-foreground">{group.title}</strong>
                <span className="mt-1 block leading-relaxed text-muted-foreground">{group.summary}</span>
              </span>
            </Button>
          </li>
        ))}
      </ol>
      {meta.commits.length > 0 ? (
        <ul className="mt-12 space-y-2 text-sm text-muted-foreground">
          {meta.commits.map((commit) => (
            <li key={commit.sha}>
              <code className="text-primary">{commit.shortSha}</code> {commit.subject}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

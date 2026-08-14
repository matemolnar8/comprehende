import { useCallback, useEffect, useMemo, useState } from "react";
import {
  fetchBlame,
  fetchFile,
  fetchHunks,
  fetchReview,
  layerIndex,
  padLayer,
  shortSha,
  type LiveHunk,
  type ReviewMeta,
} from "./api.ts";
import { highlightLine } from "./highlight.ts";
import { addedSymbols, hunkContext, lineDelta } from "../schema/hunk-meta.ts";

type Selection = { kind: "overview" } | { kind: "group"; id: string } | { kind: "unassigned" };

type Inspector = {
  path: string;
  mode: "file" | "blame";
  side: "old" | "new";
};

const EFFORT: Record<1 | 2 | 3 | 4 | 5, string> = {
  1: "trivial",
  2: "small",
  3: "medium",
  4: "large",
  5: "very large",
};

export function App() {
  const [meta, setMeta] = useState<ReviewMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [hunks, setHunks] = useState<LiveHunk[]>([]);
  const [hunkError, setHunkError] = useState<string | null>(null);
  const [wrap, setWrap] = useState(false);
  const [activeHunk, setActiveHunk] = useState(0);
  const [inspector, setInspector] = useState<Inspector | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await fetchReview();
      setMeta(next);
      setSelection((current) => current ?? defaultSelection(next));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedKey =
    selection?.kind === "group" ? selection.id : selection?.kind === "unassigned" ? "unassigned" : null;

  useEffect(() => {
    if (selectedKey === null) {
      setHunks([]);
      return;
    }
    let cancelled = false;
    setHunkError(null);
    void fetchHunks(selectedKey)
      .then((payload) => {
        if (!cancelled) {
          setHunks(payload.hunks);
          setActiveHunk(0);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setHunks([]);
          setHunkError(cause instanceof Error ? cause.message : String(cause));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [selectedKey]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "w") {
        setWrap((value) => !value);
      } else if (event.key === "r") {
        void load();
      } else if (event.key === "o") {
        setSelection({ kind: "overview" });
      } else if (event.key === "u") {
        setSelection({ kind: "unassigned" });
      } else if (event.key === "Escape") {
        setInspector(null);
      } else if (event.key === "j") {
        setActiveHunk((value) => Math.min(Math.max(0, hunks.length - 1), value + 1));
      } else if (event.key === "k") {
        setActiveHunk((value) => Math.max(0, value - 1));
      } else if (event.key === "[") {
        shiftSelection(meta, selection, setSelection, -1);
      } else if (event.key === "]") {
        shiftSelection(meta, selection, setSelection, 1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hunks.length, load, meta, selection]);

  useEffect(() => {
    document.querySelector(`[data-hunk="${activeHunk}"]`)?.scrollIntoView({ block: "nearest" });
  }, [activeHunk]);

  const selectedGroup = useMemo(() => {
    if (meta === null || selection?.kind !== "group") {
      return null;
    }
    return meta.groups.find((group) => group.id === selection.id) ?? null;
  }, [meta, selection]);

  if (loading && meta === null) {
    return <div className="boot">Reading git…</div>;
  }
  if (error !== null && meta === null) {
    return <div className="boot error">{error}</div>;
  }
  if (meta === null) {
    return null;
  }

  const coverageRatio = meta.coverage.totalHunks === 0 ? 1 : meta.coverage.assignedHunks / meta.coverage.totalHunks;
  const incomplete = meta.coverage.unassignedCount > 0 || meta.coverage.staleCount > 0;
  const highlightFiles = new Set(selectedGroup?.files ?? (selection?.kind === "unassigned" ? meta.unassigned.files : []));

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <span className="wordmark">Comprehende</span>
          <span className="tagline">diffs from git · groups are interpretation</span>
        </div>
        <div className="range" title={`${meta.resolved.baseSha} ... ${meta.resolved.headSha}`}>
          <code>{meta.resolved.baseRef}</code>
          <span className="dots">...</span>
          <code>{meta.resolved.headRef}</code>
          <span className="shas">
            {shortSha(meta.resolved.baseSha)} → {shortSha(meta.resolved.headSha)}
          </span>
        </div>
        <div className={`coverage ${incomplete ? "warn" : "ok"}`}>
          <span>
            {meta.coverage.assignedHunks}/{meta.coverage.totalHunks} hunks grouped
            {meta.coverage.unassignedCount > 0 ? ` · ${meta.coverage.unassignedCount} unassigned` : ""}
            {meta.coverage.staleCount > 0 ? ` · ${meta.coverage.staleCount} stale` : ""}
          </span>
          <div className="bar">
            <div className="fill" style={{ width: `${Math.round(coverageRatio * 100)}%` }} />
          </div>
        </div>
        <div className="actions">
          <button type="button" className={wrap ? "on" : ""} onClick={() => setWrap((value) => !value)}>
            wrap
          </button>
          <button type="button" onClick={() => void load()}>
            refresh
          </button>
        </div>
      </header>

      <nav className="groups">
        <h2>Stack</h2>
        <ul>
          <li>
            <button
              type="button"
              className={selection?.kind === "overview" ? "active" : ""}
              onClick={() => setSelection({ kind: "overview" })}
            >
              <span className="title">Overview</span>
              <span className="count">{EFFORT[meta.effort.score]}</span>
            </button>
          </li>
        </ul>
        <ul>
          {meta.groups.map((group, index) => (
            <li key={group.id}>
              <button
                type="button"
                className={selection?.kind === "group" && selection.id === group.id ? "active" : ""}
                onClick={() => setSelection({ kind: "group", id: group.id })}
              >
                <span className="layer-index">{padLayer(index + 1)}</span>
                <span className="title">{group.title}</span>
                <span className="count">
                  {group.files.length}f
                  {group.staleCount > 0 ? ` · ${group.staleCount} stale` : ""}
                </span>
              </button>
            </li>
          ))}
          <li>
            <button
              type="button"
              className={`unassigned ${selection?.kind === "unassigned" ? "active" : ""}`}
              onClick={() => setSelection({ kind: "unassigned" })}
            >
              <span className="title">Unassigned</span>
              <span className="count">{meta.unassigned.hunkCount}</span>
            </button>
          </li>
        </ul>
        {meta.document.tickets !== undefined && meta.document.tickets.length > 0 ? (
          <section>
            <h2>Tickets</h2>
            <ul className="tickets">
              {meta.document.tickets.map((ticket) => (
                <li key={ticket.id}>
                  {ticket.url !== undefined ? (
                    <a href={ticket.url} target="_blank" rel="noreferrer">
                      {ticket.id}
                      {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                    </a>
                  ) : (
                    <span>
                      {ticket.id}
                      {ticket.title !== undefined ? ` ${ticket.title}` : ""}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </nav>

      <main className="diff">
        {selection?.kind === "overview" ? (
          <Overview meta={meta} onOpenLayer={(id) => setSelection({ kind: "group", id })} />
        ) : selection?.kind === "unassigned" ? (
          <div className="brief">
            <p className="kicker">Unassigned</p>
            <h1>Not in any layer</h1>
            <p className="intent">
              Live git still has these hunks, and no group points at them. Coverage cannot hide. Fix the review document
              — never the diff.
            </p>
          </div>
        ) : selectedGroup !== null ? (
          <LayerBrief
            group={selectedGroup}
            index={layerIndex(meta.groups, selectedGroup.id)}
            groups={meta.groups}
            onOpenLayer={(id) => setSelection({ kind: "group", id })}
          />
        ) : (
          <h1>Select a layer</h1>
        )}
        {hunkError !== null ? <p className="stale">{hunkError}</p> : null}
        {selection?.kind !== "overview" ? (
          <>
            {hunks.length === 0 && hunkError === null ? <p className="muted">No hunks in this layer.</p> : null}
            <div className={`hunks ${wrap ? "wrap" : ""}`}>
              {hunks.map((hunk, index) => (
                <HunkView
                  key={`${hunk.path}:${hunk.oldStart}:${hunk.newStart}`}
                  hunk={hunk}
                  active={index === activeHunk}
                  index={index}
                  onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
                />
              ))}
            </div>
          </>
        ) : null}
      </main>

      <aside className="files">
        {inspector !== null ? (
          <Inspector inspector={inspector} setInspector={setInspector} onClose={() => setInspector(null)} />
        ) : selection?.kind === "group" && hunks.length > 0 ? (
          <RangeRail hunks={hunks} active={activeHunk} onSelect={setActiveHunk} />
        ) : (
          <FileTree
            files={meta.files}
            skipped={meta.skipped}
            highlight={highlightFiles}
            onOpen={(path) => setInspector({ path, mode: "file", side: "new" })}
          />
        )}
      </aside>
    </div>
  );
}

function defaultSelection(meta: ReviewMeta): Selection {
  if (meta.groups.length > 0) {
    return { kind: "overview" };
  }
  return { kind: "unassigned" };
}

function shiftSelection(
  meta: ReviewMeta | null,
  selection: Selection | null,
  setSelection: (selection: Selection) => void,
  delta: number,
): void {
  if (meta === null) {
    return;
  }
  const ids: Selection[] = [{ kind: "overview" }, ...meta.groups.map((group) => ({ kind: "group" as const, id: group.id }))];
  ids.push({ kind: "unassigned" });
  const current = ids.findIndex((item) => sameSelection(item, selection));
  const next = ids[(current + delta + ids.length) % ids.length];
  if (next !== undefined) {
    setSelection(next);
  }
}

function sameSelection(a: Selection, b: Selection | null): boolean {
  if (b === null) {
    return false;
  }
  if (a.kind === "overview") {
    return b.kind === "overview";
  }
  if (a.kind === "unassigned") {
    return b.kind === "unassigned";
  }
  return b.kind === "group" && b.id === a.id;
}

function Overview(props: { meta: ReviewMeta; onOpenLayer: (id: string) => void }) {
  const { meta, onOpenLayer } = props;
  return (
    <div className="brief overview">
      <p className="kicker">Overview</p>
      <h1>Review stack</h1>
      {meta.document.walkthrough !== undefined ? <p className="intent">{meta.document.walkthrough}</p> : null}
      <p className="effort">
        Review effort {meta.effort.score}/5 · {EFFORT[meta.effort.score]} · {meta.effort.files} files · {meta.effort.hunks}{" "}
        hunks
      </p>
      <h2>Read in this order</h2>
      <ol className="stack-list">
        {meta.groups.map((group, index) => (
          <li key={group.id}>
            <button type="button" onClick={() => onOpenLayer(group.id)}>
              <span className="layer-index">{padLayer(index + 1)}</span>
              <span>
                <strong>{group.title}</strong>
                <span className="muted"> {group.summary}</span>
              </span>
            </button>
          </li>
        ))}
      </ol>
      <h2>Files by layer</h2>
      <table className="file-summary">
        <thead>
          <tr>
            <th>Layer</th>
            <th>Path</th>
            <th>Hunks</th>
          </tr>
        </thead>
        <tbody>
          {meta.groups.flatMap((group, index) =>
            group.files.map((path) => (
              <tr key={`${group.id}:${path}`}>
                <td className="num">{padLayer(index + 1)}</td>
                <td>{path}</td>
                <td className="num">{meta.files.find((file) => file.path === path)?.hunkCount ?? ""}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      {meta.commits.length > 0 ? (
        <>
          <h2>Commits</h2>
          <ul className="commits">
            {meta.commits.map((commit) => (
              <li key={commit.sha}>
                <code>{commit.shortSha}</code> {commit.subject}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

function LayerBrief(props: {
  group: ReviewMeta["groups"][number];
  index: number;
  groups: ReviewMeta["groups"];
  onOpenLayer: (id: string) => void;
}) {
  const { group, index, groups, onOpenLayer } = props;
  return (
    <div className="brief">
      <p className="kicker">
        Layer {padLayer(index)} · {group.files.length} file{group.files.length === 1 ? "" : "s"} · {group.hunkCount} hunk
        {group.hunkCount === 1 ? "" : "s"}
      </p>
      <h1>{group.title}</h1>
      <p className="intent">{group.summary}</p>
      {group.dependsOn.length > 0 ? (
        <p className="depends">
          Depends on{" "}
          {group.dependsOn.map((id, i) => {
            const dep = groups.find((item) => item.id === id);
            const label =
              dep !== undefined ? `${padLayer(layerIndex(groups, id))} ${dep.title}` : id;
            return (
              <span key={id}>
                {i > 0 ? ", " : ""}
                <button type="button" className="link" onClick={() => onOpenLayer(id)}>
                  {label}
                </button>
              </span>
            );
          })}
        </p>
      ) : null}
      {group.lookFor.length > 0 ? (
        <>
          <h2>Look for</h2>
          <ul className="look-for">
            {group.lookFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </>
      ) : null}
      {group.staleCount > 0 ? (
        <p className="stale">
          {group.staleCount} hunk ref{group.staleCount === 1 ? "" : "s"} no longer match live git. Git wins; the pointer is
          flagged, not replaced.
        </p>
      ) : null}
    </div>
  );
}

function RangeRail(props: { hunks: LiveHunk[]; active: number; onSelect: (index: number) => void }) {
  return (
    <>
      <h2>Ranges in this layer</h2>
      <ul className="ranges">
        {props.hunks.map((hunk, index) => {
          const ctx = hunkContext(hunk.header);
          const symbols = addedSymbols(hunk.lines.filter((line) => line.kind === "add").map((line) => line.text));
          const delta = lineDelta(hunk.lines);
          const label = ctx ?? (symbols[0] !== undefined ? symbols[0] : hunk.path);
          return (
            <li key={`${hunk.path}:${hunk.oldStart}:${hunk.newStart}`}>
              <button type="button" className={index === props.active ? "active" : ""} onClick={() => props.onSelect(index)}>
                <span className="name">{label}</span>
                <span className="count">
                  −{delta.removed} +{delta.added}
                </span>
              </button>
              <div className="range-meta">
                {hunk.path}
                {symbols.length > 0 ? ` · ${symbols.join(", ")}` : ""}
              </div>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function HunkView(props: { hunk: LiveHunk; active: boolean; index: number; onOpen: (path: string) => void }) {
  const { hunk, active, index, onOpen } = props;
  const ctx = hunkContext(hunk.header);
  return (
    <article className={`hunk ${active ? "active" : ""}`} data-hunk={index}>
      <header>
        <button type="button" className="path" onClick={() => onOpen(hunk.path)}>
          {hunk.oldPath !== undefined ? `${hunk.oldPath} → ${hunk.path}` : hunk.path}
        </button>
        {ctx !== undefined ? <span className="symbol">{ctx}</span> : null}
        <code className="header">{hunk.header.match(/^@@ [^@]+ @@/)?.[0] ?? hunk.header}</code>
      </header>
      <table>
        <tbody>
          {hunk.lines.map((line, lineIndex) => (
            <tr key={lineIndex} className={line.kind}>
              <td className="num">{line.oldNumber ?? ""}</td>
              <td className="num">{line.newNumber ?? ""}</td>
              <td className="sign">{line.kind === "add" ? "+" : line.kind === "del" ? "-" : " "}</td>
              <td className="code">
                <code dangerouslySetInnerHTML={{ __html: highlightLine(line.text, hunk.language) }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </article>
  );
}

function FileTree(props: {
  files: ReviewMeta["files"];
  skipped: ReviewMeta["skipped"];
  highlight: Set<string>;
  onOpen: (path: string) => void;
}) {
  return (
    <>
      <h2>Files in the live diff</h2>
      <ul>
        {props.files.map((file) => (
          <li key={file.path}>
            <button
              type="button"
              className={props.highlight.has(file.path) ? "in-group" : ""}
              onClick={() => props.onOpen(file.path)}
              disabled={file.binary}
            >
              <span className={`status ${file.status}`}>{file.status[0]?.toUpperCase()}</span>
              <span className="name">
                {file.oldPath !== undefined ? `${file.oldPath} → ${file.path}` : file.path}
              </span>
              <span className="count">{file.binary ? "binary" : file.hunkCount}</span>
            </button>
          </li>
        ))}
      </ul>
      {props.skipped.length > 0 ? <p className="muted">Binary files are skipped in the hunk index.</p> : null}
    </>
  );
}

function Inspector(props: {
  inspector: Inspector;
  setInspector: (inspector: Inspector) => void;
  onClose: () => void;
}) {
  const { inspector, setInspector, onClose } = props;
  const [content, setContent] = useState<string>("");
  const [blame, setBlame] = useState<{ author: string; line: number; text: string; sha: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setError(null);
    if (inspector.mode === "file") {
      void fetchFile(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setContent(payload.content);
            setBlame(null);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
          }
        });
    } else {
      void fetchBlame(inspector.path, inspector.side)
        .then((payload) => {
          if (!cancelled) {
            setBlame(payload.lines);
          }
        })
        .catch((cause: unknown) => {
          if (!cancelled) {
            setError(cause instanceof Error ? cause.message : String(cause));
          }
        });
    }
    return () => {
      cancelled = true;
    };
  }, [inspector]);

  return (
    <div className="inspector">
      <div className="inspector-top">
        <button type="button" onClick={onClose}>
          back
        </button>
        <strong>{inspector.path}</strong>
      </div>
      <div className="inspector-tabs">
        <button
          type="button"
          className={inspector.mode === "file" ? "on" : ""}
          onClick={() => setInspector({ ...inspector, mode: "file" })}
        >
          file
        </button>
        <button
          type="button"
          className={inspector.mode === "blame" ? "on" : ""}
          onClick={() => setInspector({ ...inspector, mode: "blame" })}
        >
          blame
        </button>
        <button
          type="button"
          className={inspector.side === "old" ? "on" : ""}
          onClick={() => setInspector({ ...inspector, side: "old" })}
        >
          old
        </button>
        <button
          type="button"
          className={inspector.side === "new" ? "on" : ""}
          onClick={() => setInspector({ ...inspector, side: "new" })}
        >
          new
        </button>
      </div>
      {error !== null ? <p className="stale">{error}</p> : null}
      {inspector.mode === "file" && error === null ? <pre className="file-body">{content}</pre> : null}
      {inspector.mode === "blame" && blame !== null ? (
        <table className="blame">
          <tbody>
            {blame.map((line) => (
              <tr key={line.line}>
                <td className="num">{line.line}</td>
                <td className="sha">{line.sha.slice(0, 7)}</td>
                <td className="author">{line.author}</td>
                <td className="code">
                  <code>{line.text}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </div>
  );
}

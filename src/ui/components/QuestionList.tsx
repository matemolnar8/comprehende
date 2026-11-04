import { useId, useState } from "react";
import type { Questions } from "../../schema/types.ts";
import { cn } from "@/lib/utils.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { useNarrow } from "../lib/narrow.ts";
import { AskAgent } from "./AskAgent.tsx";
import { InlineMd } from "./InlineMd.tsx";
import {
  BriefField,
  blockGap,
  briefProse,
  briefRows,
  DisclosureToggle,
  labelText,
} from "./Kicker.tsx";

/** On a narrow screen the questions start collapsed, so the code shows sooner. */
export function QuestionList(props: { groupId: string; questions: Questions }) {
  const { groupId, questions } = props;
  const narrow = useNarrow();
  const [open, setOpen] = useState(false);
  const headingId = useId();
  const listId = useId();
  if (questions.length === 0) {
    return null;
  }
  const list = (
    <ul id={listId} className={briefRows}>
      {questions.map((question, i) => (
        <li
          key={i}
          className="flex items-start justify-between gap-3 py-2 first:pt-0 last:pb-0 min-[800px]:gap-4"
        >
          <p className={briefProse}>
            <InlineMd text={question} />
          </p>
          <div className="-mt-1 shrink-0">
            <AskAgent prompt={askAgentPrompt({ group: groupId }, question)} scope="question" />
          </div>
        </li>
      ))}
    </ul>
  );
  if (!narrow) {
    return <BriefField kicker="Questions">{list}</BriefField>;
  }
  return (
    <section className={blockGap} aria-labelledby={headingId}>
      <h2 id={headingId} className={cn(labelText, open && "mb-1")}>
        <DisclosureToggle
          label="Questions"
          count={questions.length}
          open={open}
          controls={listId}
          onToggle={() => setOpen((value) => !value)}
        />
      </h2>
      {open ? list : null}
    </section>
  );
}

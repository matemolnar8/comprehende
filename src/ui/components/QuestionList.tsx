import type { Questions } from "../../schema/types.ts";
import { askAgentPrompt } from "../lib/agent-prompt.ts";
import { CopyPrompt } from "./CopyPrompt.tsx";
import { InlineMd } from "./InlineMd.tsx";
import { BriefField, briefProse, briefRows } from "./Kicker.tsx";

export function QuestionList(props: { groupId: string; questions: Questions }) {
  const { groupId, questions } = props;
  if (questions.length === 0) {
    return null;
  }
  return (
    <BriefField kicker="Questions">
      <ul className={briefRows}>
        {questions.map((question, i) => (
          <li
            key={i}
            className="flex max-w-[calc(68ch+1.5rem)] items-start justify-between gap-3 py-1.5 first:pt-0 last:pb-0"
          >
            <p className={briefProse}>
              <InlineMd text={question} />
            </p>
            <CopyPrompt prompt={askAgentPrompt({ group: groupId }, question)} scope="question" />
          </li>
        ))}
      </ul>
    </BriefField>
  );
}

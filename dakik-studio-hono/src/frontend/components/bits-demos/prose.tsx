import { Prose } from "@/registry/react/components/prose";

export default function Demo() {
  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-6">
      <Prose>
        <h2>Designing with constraints</h2>
        <p>
          Good interfaces are built from a small set of decisions applied{" "}
          <strong>consistently</strong>. Typography is the first of them: a
          measured line length, a calm rhythm, and headings that earn their
          weight.
        </p>
        <blockquote>
          Perfection is achieved not when there is nothing more to add, but
          when there is nothing left to take away.
        </blockquote>
        <h3>What the prose component handles</h3>
        <ul>
          <li>Headings, paragraphs, and spacing between them</li>
          <li>
            Inline elements like <code>code</code>, <a href="#prose">links</a>,
            and <em>emphasis</em>
          </li>
          <li>Lists and blockquotes with sensible margins</li>
        </ul>
        <p>
          Drop rendered markdown inside and it reads like a well-set page — no
          per-element classes required.
        </p>
      </Prose>
    </div>
  );
}

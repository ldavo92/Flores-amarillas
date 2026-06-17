type Props = {
  question: string;
  size?: "md" | "giant";
};

export default function QuestionDisplay({ question, size = "md" }: Props) {
  const giant = size === "giant";
  return (
    <div
      className={`rounded-2xl border border-slate-700 bg-slate-800/70 text-center font-semibold text-white ${
        giant ? "px-6 py-8 text-3xl sm:text-4xl lg:text-5xl" : "px-4 py-4 text-lg"
      }`}
    >
      {question || "—"}
    </div>
  );
}

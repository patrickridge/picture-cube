import Image from "next/image";
import Link from "next/link";

import { CubeSolver } from "@/components/CubeSolver";
import { CubeMark } from "./cube-mark";

const STEPS = [
  { title: "Photograph", text: "Six photos, one per side. The app cuts each into nine tiles." },
  { title: "Sort", text: "It guesses which side each tile belongs to from its colours, and checks the result is a real cube. You fix anything it got wrong." },
  { title: "Preview", text: "It shows your cube solved, made from your own tiles. You turn each centre until its picture lines up." },
  { title: "Solve", text: "Usually 20–40 moves, a few at a time, with a picture after each group so a slip is caught straight away." },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <CubeMark size={18} />
            </span>
            Picture cube solver
          </Link>
          <nav className="flex gap-5 text-sm text-muted-foreground">
            <a href="#how" className="hidden hover:text-foreground sm:inline">
              How it works
            </a>
            <a href="https://github.com/patrickridge/picture-cube" className="hover:text-foreground">
              Source
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-12 px-4 py-10">
        <div className="max-w-2xl space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Solve a picture cube</h1>
          <p className="text-lg text-muted-foreground">
            Rubik&apos;s cubes printed with pictures instead of colours are harder: tiles are hard to tell apart, and even with every piece in place a centre can be turned the wrong way. Photograph yours and this works out the moves, centres included.
          </p>
        </div>

        <CubeSolver />

        <section className="space-y-4 border-t pt-10">
          <h2 className="text-xl font-semibold">The cube that started it</h2>
          <p className="max-w-prose text-sm text-muted-foreground">
            A conference giveaway covered in artwork. Most tiles are pale fragments that could belong to several sides, and with every piece in place the centres were still turned the wrong way. Here it is scrambled, then three of its sides once solved.
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { src: "/cube-before.jpg", label: "Scrambled" },
              { src: "/cube-solved.jpg", label: "Solved: front" },
              { src: "/cube-solved-orange.jpg", label: "Solved: right" },
              { src: "/cube-solved-purple.jpg", label: "Solved: back" },
            ].map(({ src, label }) => (
              <figure key={src} className="space-y-1.5">
                <Image src={src} alt={`The picture cube, ${label.toLowerCase()}`} width={640} height={640} className="rounded-xl" />
                <figcaption className="text-center text-sm text-muted-foreground">{label}</figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-16 space-y-4 border-t pt-10">
          <h2 className="text-xl font-semibold">How it works</h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-xl border bg-card p-4">
                <p className="text-sm text-muted-foreground">{i + 1}</p>
                <p className="font-medium">{s.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </li>
            ))}
          </ol>
          <p className="max-w-prose text-sm text-muted-foreground">
            Moves come from Kociemba&apos;s two-phase algorithm. Each quarter turn of a face also turns its centre, so the app keeps looking for solutions until the turns on each face add up to what its centre needs. Everything runs on your phone; photos are never uploaded.
          </p>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 text-sm text-muted-foreground">Built by Patrick Ridge.</div>
      </footer>
    </div>
  );
}

declare module "cubejs" {
  export default class Cube {
    static initSolver(): void;
    static fromString(facelets: string): Cube;
    move(moves: string): this;
    solve(maxDepth?: number): string;
    isSolved(): boolean;
    asString(): string;
  }
}

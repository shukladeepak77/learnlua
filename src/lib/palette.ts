/**
 * Warm, earthy accent palette (rust, plum, ochre, maroon) matching upnishads.com,
 * used for the numbered "bubble" badges next to each lesson. 13 colors for 13 lessons.
 */
export const bubbleGradients: [string, string][] = [
  ["#c1440e", "#a83a0c"], // rust
  ["#7a2b0a", "#5e2108"], // dark rust
  ["#3b1f47", "#2e1838"], // deep purple
  ["#8a5a1e", "#6e4818"], // mustard ochre
  ["#5c1a1a", "#451313"], // maroon
  ["#9a6b12", "#7d570f"], // golden ochre
  ["#4a1942", "#391433"], // deep plum
  ["#b5451f", "#953a1a"], // brick rust
  ["#2e1f47", "#241938"], // indigo
  ["#6b2d0f", "#54240c"], // brown
  ["#8f2d1f", "#732418"], // brick red
  ["#443366", "#362951"], // purple
  ["#734312", "#5c360f"], // amber brown
];

export function bubbleStyle(index: number): string {
  const [from, to] = bubbleGradients[index % bubbleGradients.length];
  return `background-image: linear-gradient(135deg, ${from} 0%, ${to} 100%);`;
}

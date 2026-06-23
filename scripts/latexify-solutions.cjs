const fs = require('fs');
const path = require('path');

function latexify(text) {
  let s = text;
  // Wrap standalone fractions like 1/45, 7381/2520 in $...$
  s = s.replace(/(?<!\$)(\b\d+\/\d+\b)(?!\$)/g, (m) => `$${m}$`);
  // Convert C(n,k) to $\binom{n}{k}$
  s = s.replace(/C\((\d+),(\d+)\)/g, (_, n, k) => `$\\binom{${n}}{${k}}$`);
  // Convert n^k patterns to $n^{k}$
  s = s.replace(/(?<!\$)(\d+)\^(\d+)(?!\$)/g, (_, base, exp) => `$${base}^{${exp}}$`);
  // Convert sqrt(x) to $\sqrt{x}$
  s = s.replace(/sqrt\(([^)]+)\)/g, (_, x) => `$\\sqrt{${x}}$`);
  // Convert e^{...} patterns
  s = s.replace(/(?<!\$)e\^\{([^}]+)\}(?!\$)/g, (_, x) => `$e^{${x}}$`);
  s = s.replace(/(?<!\$)e\^(-?\d+)(?!\$)/g, (_, x) => `$e^{${x}}$`);
  // Convert H_n (harmonic numbers)
  s = s.replace(/(?<!\$)H_(\d+)(?!\$)/g, (_, n) => `$H_{${n}}$`);
  // Convert pi to $\pi$
  s = s.replace(/(?<!\$)\bpi\b(?!\$)/g, '$\\pi$');
  // Convert inf/infinity to $\infty$
  s = s.replace(/(?<!\$)\binfinity\b(?!\$)/g, '$\\infty$');
  // Convert P(...) to $P(...)$ when it looks like probability
  s = s.replace(/(?<!\$)P\(([^)]{1,60})\)(?!\$)/g, (_, x) => `$P(${x})$`);
  // Convert E[...] to $E[...]$ when it looks like expectation
  s = s.replace(/(?<!\$)E\[([^\]]{1,60})\](?!\$)/g, (_, x) => `$E[${x}]$`);
  // Convert Var(...) 
  s = s.replace(/(?<!\$)Var\(([^)]{1,40})\)(?!\$)/g, (_, x) => `$\\text{Var}(${x})$`);
  // Fix double-wrapped $$ (from nested replacements)
  s = s.replace(/\$\$([^$]+)\$\$/g, (m, inner) => {
    if (inner.includes('\\')) return m; // leave block math alone
    return `$${inner}$`;
  });
  // Clean up $ inside already-wrapped $ (prevent $...$...$$ issues)
  // Simple dedup: collapse adjacent $ pairs
  s = s.replace(/\$\$/g, '$$$$');
  
  return s;
}

// Read existing solutions
const solutionsPath = path.join(__dirname, '..', 'src', 'data', 'quant-solutions.ts');
let content = fs.readFileSync(solutionsPath, 'utf-8');

// Extract all solution strings and latexify them
// Match solution: `...` patterns
content = content.replace(/solution: `([^`]*)`/g, (full, sol) => {
  return `solution: \`${latexify(sol)}\``;
});

// Also latexify answers
content = content.replace(/answer: `([^`]*)`/g, (full, ans) => {
  const latexAns = ans
    .replace(/sqrt\(([^)]+)\)/g, (_, x) => `\\sqrt{${x}}`)
    .replace(/pi\b/g, '\\pi');
  return `answer: \`${latexAns}\``;
});

fs.writeFileSync(solutionsPath, content);
console.log('Solutions latexified successfully');

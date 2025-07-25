import React from 'react';
import { MathJax, MathJaxContext } from 'better-react-mathjax';

const config = {
  loader: { load: ['[tex]/ams'] },
  tex: {
    packages: { '[+]': ['ams'] },
  },
};

const ProblemCard = () => {
  const blocks = [
    { type: 'text', value: 'Tentukan waktu yang dibutuhkan hingga air habis dalam tangki tersebut. Nyatakan dalam:' },
    { type: 'math', value: '\\( A, A_s, h_0, \\text{ dan } g \\)' },
    { type: 'text', value: 'Untuk bagian ini diberikan petunjuk integral:' },
    { type: 'math', value: '\\[ \\int \\sqrt{\\frac{x}{b + x}} \\, dx = 2 \\left( \\sqrt{x} - \\sqrt{b} \\arctan \\left( \\sqrt{\\frac{x}{b}} \\right) \\right) + C \\]' }
  ];

  return (
    <MathJaxContext config={config}>
      <div className="space-y-4 p-4 border rounded-lg bg-white shadow">
        {blocks.map((block, idx) => {
          if (block.type === 'text') {
            return <p key={idx} className="text-gray-800">{block.value}</p>;
          }
          if (block.type === 'math') {
            return <MathJax key={idx}>{block.value}</MathJax>;
          }
          return null;
        })}
      </div>
    </MathJaxContext>
  );
};

export default ProblemCard;

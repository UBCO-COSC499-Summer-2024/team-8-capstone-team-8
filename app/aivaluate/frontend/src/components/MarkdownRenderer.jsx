import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
// import '../MarkdownRenderer.css';
// import 'github-markdown-css/github-markdown.css';

const MarkdownRenderer = ({ markdownText }) => {
  return (
    <div className="markdown-body">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdownText}</ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;

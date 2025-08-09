import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSanitize from 'rehype-sanitize';
import 'highlight.js/styles/github-dark.css';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-content prose prose-slate dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSanitize]}
        components={{
          // Başlıklar için özel stiller
          h1: ({ children }) => (
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-4 mt-6 border-b border-slate-200 dark:border-slate-700 pb-2">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-3 mt-5">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-4">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-3">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-base font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-3">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-2 mt-3">
              {children}
            </h6>
          ),
          
          // Paragraflar için özel stil
          p: ({ children }) => (
            <p className="text-slate-700 dark:text-slate-300 mb-4 leading-relaxed">
              {children}
            </p>
          ),
          
          // Linkler için özel stil
          a: ({ href, children }) => (
            <a 
              href={href} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline decoration-2 underline-offset-2 transition-colors duration-200"
            >
              {children}
            </a>
          ),
          
          // Kod blokları için özel stil
          code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline ? (
              <pre className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto my-4 border border-slate-700">
                <code className={`${className} text-slate-100`} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-slate-100 dark:bg-slate-700 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
          
          // Blockquote için özel stil
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-red-500 pl-4 py-2 my-4 bg-red-50 dark:bg-red-900/10 rounded-r-lg">
              <div className="text-slate-700 dark:text-slate-300 italic">
                {children}
              </div>
            </blockquote>
          ),
          
          // Tablolar için özel stil
          table: ({ children }) => (
            <div className="overflow-x-auto my-4 border border-slate-200 dark:border-slate-700 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-slate-50 dark:bg-slate-800">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors duration-150">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 dark:text-slate-100">
              {children}
            </td>
          ),
          
          // Listeler için özel stil
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 my-4 text-slate-700 dark:text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-slate-700 dark:text-slate-300">
              {children}
            </li>
          ),
          
          // Yatay çizgi için özel stil
          hr: () => (
            <hr className="my-8 border-slate-200 dark:border-slate-700" />
          ),
          
          // Resimler için özel stil
          img: ({ src, alt }) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto rounded-lg shadow-md my-4 border border-slate-200 dark:border-slate-700"
              loading="lazy"
            />
          ),
          
          // Kod blokları için dil etiketi
          pre: ({ children }) => {
            const codeElement = React.Children.toArray(children).find(
              child => React.isValidElement(child) && child.type === 'code'
            ) as React.ReactElement;
            
            const language = codeElement?.props?.className?.match(/language-(\w+)/)?.[1];
            
            return (
              <div className="relative">
                {language && (
                  <div className="absolute top-2 right-2 bg-slate-800 text-slate-200 px-2 py-1 rounded text-xs font-mono">
                    {language}
                  </div>
                )}
                <pre className="bg-slate-900 dark:bg-slate-800 rounded-lg p-4 overflow-x-auto my-4 border border-slate-700">
                  {children}
                </pre>
              </div>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer; 
import React, { useState, useEffect, useRef, useCallback } from 'react';
import MarkdownRenderer from './MarkdownRenderer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  maxLength?: number;
  autoSave?: boolean;
  autoSaveInterval?: number;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  placeholder = 'Markdown formatında yazın...',
  className = '',
  showPreview = true,
  maxLength,
  autoSave = false,
  autoSaveInterval = 30000 // 30 saniye
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Emoji kategorileri
  const emojiCategories = {
    'Yüz İfadeleri': ['😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚'],
    'El İfadeleri': ['👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋', '🖖', '👌'],
    'Hayvanlar': ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆'],
    'Yemek': ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🥑', '🥦', '🥬', '🥒'],
    'Aktiviteler': ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁']
  };

  const insertMarkdown = useCallback((before: string, after: string = '') => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    let insertText = before + selectedText + after;
    
    // Özel durumlar için
    if (before === '**' && !selectedText) {
      insertText = '**metin**';
    } else if (before === '*' && !selectedText) {
      insertText = '*metin*';
    } else if (before === '[' && !selectedText) {
      insertText = '[metin](url)';
    } else if (before === '```\n' && !selectedText) {
      insertText = '```\nkod bloğu\n```';
    }
    
    const newValue = value.substring(0, start) + insertText + value.substring(end);
    onChange(newValue);
    
    // Cursor pozisyonunu ayarla
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      } else {
        const newCursorPos = start + before.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 0);
  }, [value, onChange]);

  // Otomatik kaydetme
  useEffect(() => {
    if (!autoSave || !value) return;

    const interval = setInterval(() => {
      setLastSaved(new Date());
      // Burada localStorage'a kaydetme işlemi yapılabilir
      localStorage.setItem('markdown-draft', value);
    }, autoSaveInterval);

    return () => clearInterval(interval);
  }, [value, autoSave, autoSaveInterval]);

  // Klavye kısayolları
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!textareaRef.current || document.activeElement !== textareaRef.current) return;

      // Ctrl/Cmd + B: Kalın
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**');
      }
      // Ctrl/Cmd + I: İtalik
      else if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*');
      }
      // Ctrl/Cmd + K: Link
      else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        insertMarkdown('[', '](url)');
      }
      // Ctrl/Cmd + Shift + K: Kod bloğu
      else if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'K') {
        e.preventDefault();
        insertMarkdown('```\n', '\n```');
      }
      // Tab: Girinti
      else if (e.key === 'Tab') {
        e.preventDefault();
        insertMarkdown('  ');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [insertMarkdown]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (!maxLength || newValue.length <= maxLength) {
      onChange(newValue);
    }
  };

  const insertEmoji = (emoji: string) => {
    insertMarkdown(emoji);
    setShowEmojiPicker(false);
  };

  const insertTable = () => {
    const tableMarkdown = `| Başlık 1 | Başlık 2 | Başlık 3 |
|----------|----------|----------|
| Hücre 1  | Hücre 2  | Hücre 3  |
| Hücre 4  | Hücre 5  | Hücre 6  |`;
    insertMarkdown(tableMarkdown);
    setShowTableEditor(false);
  };

  const markdownShortcuts = [
    { label: 'B', markdown: '**', tooltip: 'Kalın (Ctrl+B)', onClick: () => insertMarkdown('**') },
    { label: 'I', markdown: '*', tooltip: 'İtalik (Ctrl+I)', onClick: () => insertMarkdown('*') },
    { label: '`', markdown: '`', tooltip: 'Kod', onClick: () => insertMarkdown('`') },
    { label: 'Link', markdown: '[', tooltip: 'Link (Ctrl+K)', onClick: () => insertMarkdown('[', '](url)') },
    { label: 'List', markdown: '-', tooltip: 'Liste', onClick: () => insertMarkdown('- ') },
    { label: 'Quote', markdown: '>', tooltip: 'Alıntı', onClick: () => insertMarkdown('> ') },
    { label: 'Code', markdown: '```', tooltip: 'Kod Bloğu (Ctrl+Shift+K)', onClick: () => insertMarkdown('```\n', '\n```') },
    { label: 'H1', markdown: '#', tooltip: 'Başlık 1', onClick: () => insertMarkdown('# ') },
    { label: 'H2', markdown: '##', tooltip: 'Başlık 2', onClick: () => insertMarkdown('## ') },
    { label: 'H3', markdown: '###', tooltip: 'Başlık 3', onClick: () => insertMarkdown('### ') },
    { label: 'Table', markdown: '⊞', tooltip: 'Tablo', onClick: () => setShowTableEditor(true) },
    { label: 'Image', markdown: '🖼️', tooltip: 'Resim', onClick: () => insertMarkdown('![alt](url)') },
    { label: 'Strike', markdown: '~~', tooltip: 'Üstü Çizili', onClick: () => insertMarkdown('~~') },
  ];

  const characterCount = value.length;
  const isOverLimit = maxLength && characterCount > maxLength;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className={`markdown-editor ${className}`}>
      {/* Toolbar */}
      <div className="markdown-editor-toolbar">
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className={`toolbar-btn ${!isPreview ? 'active' : ''}`}
            onClick={() => setIsPreview(false)}
            title="Düzenle"
          >
            ✏️ Düzenle
          </button>
          {showPreview && (
            <button
              type="button"
              className={`toolbar-btn ${isPreview ? 'active' : ''}`}
              onClick={() => setIsPreview(true)}
              title="Önizleme"
            >
              👁️ Önizleme
            </button>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            className="toolbar-btn"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            title="Emoji Ekle"
          >
            😊
          </button>
          <button
            type="button"
            className="toolbar-btn help-btn"
            onClick={() => setShowHelp(!showHelp)}
            title="Markdown Yardımı"
          >
            ❓
          </button>
        </div>
      </div>

      {/* Markdown Shortcuts */}
      <div className="markdown-shortcuts">
        {markdownShortcuts.map((shortcut, index) => (
          <button
            key={index}
            type="button"
            className="shortcut-btn"
            onClick={shortcut.onClick}
            title={shortcut.tooltip}
          >
            {shortcut.label}
          </button>
        ))}
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Emoji Seçin</h4>
          <div className="space-y-3">
            {Object.entries(emojiCategories).map(([category, emojis]) => (
              <div key={category}>
                <h5 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{category}</h5>
                <div className="grid grid-cols-10 gap-1">
                  {emojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-lg transition-colors duration-200"
                      onClick={() => insertEmoji(emoji)}
                      title={emoji}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table Editor */}
      {showTableEditor && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Tablo Oluştur</h4>
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="text-sm text-slate-700 dark:text-slate-300">
                Satır: <input type="number" min="1" max="10" defaultValue="3" className="w-16 px-2 py-1 border rounded" />
              </label>
              <label className="text-sm text-slate-700 dark:text-slate-300">
                Sütun: <input type="number" min="1" max="10" defaultValue="3" className="w-16 px-2 py-1 border rounded" />
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                type="button"
                className="btn-primary text-sm"
                onClick={insertTable}
              >
                Tablo Ekle
              </button>
              <button
                type="button"
                className="btn-secondary text-sm"
                onClick={() => setShowTableEditor(false)}
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-3">Markdown Kısayolları</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">**metin**</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Kalın metin (Ctrl+B)</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">*metin*</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">İtalik metin (Ctrl+I)</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">`kod`</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Satır içi kod</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">```</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Kod bloğu (Ctrl+Shift+K)</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">[metin](url)</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Link (Ctrl+K)</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">![alt](url)</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Resim</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">- liste</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Liste</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">{'>'} alıntı</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Alıntı</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm"># Başlık</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Başlık</span>
            </div>
            <div className="flex items-center space-x-2">
              <code className="px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded text-sm">~~metin~~</code>
              <span className="text-sm text-slate-600 dark:text-slate-400">Üstü çizili</span>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="markdown-editor-content">
        {!isPreview ? (
          <div className="editor-container">
            <textarea
              ref={textareaRef}
              className="markdown-editor-textarea"
              value={value}
              onChange={handleChange}
              placeholder={placeholder}
              rows={10}
            />
            <div className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
                <span>{wordCount} kelime</span>
                {lastSaved && (
                  <span>Son kayıt: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
              {maxLength && (
                <div className={`character-count ${isOverLimit ? 'over-limit' : ''}`}>
                  {characterCount} / {maxLength} karakter
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="preview-container p-4">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="empty-preview text-center py-8">
                <p className="text-slate-500 dark:text-slate-400">Önizleme için metin yazın...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownEditor; 
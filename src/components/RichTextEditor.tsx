'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Bold, Italic, List, ListOrdered, Heading2, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value || '';
        }
    }, [value]);

    const cleanHTML = (html: string): string => {
        // Remove data-start and data-end attributes
        return html
            .replace(/\s*data-start="[^"]*"/g, '')
            .replace(/\s*data-end="[^"]*"/g, '')
            .trim();
    };

    const handleInput = () => {
        if (editorRef.current) {
            const cleanedHTML = cleanHTML(editorRef.current.innerHTML);
            onChange(cleanedHTML);
        }
    };

    const execCommand = (command: string, value?: string) => {
        // Prevent default behavior
        editorRef.current?.focus();

        // Use execCommand for most commands
        if (command === 'insertUnorderedList' || command === 'insertOrderedList') {
            // Handle lists with execCommand but ensure focus
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                document.execCommand(command, false, value);
                // Force update
                setTimeout(() => handleInput(), 10);
            }
        } else {
            document.execCommand(command, false, value);
            handleInput();
        }
    };

    const formatButtons = [
        { icon: Bold, command: 'bold', title: 'Bold (Ctrl+B)' },
        { icon: Italic, command: 'italic', title: 'Italic (Ctrl+I)' },
        { icon: Heading2, command: 'formatBlock', value: 'h3', title: 'Heading' },
        { icon: List, command: 'insertUnorderedList', title: 'Bullet List' },
        { icon: ListOrdered, command: 'insertOrderedList', title: 'Numbered List' },
        { icon: Undo, command: 'undo', title: 'Undo' },
        { icon: Redo, command: 'redo', title: 'Redo' },
    ];

    return (
        <div className="border rounded-md overflow-hidden">
            {/* Toolbar */}
            <div className="bg-muted/30 border-b p-2 flex flex-wrap gap-1">
                {formatButtons.map(({ icon: Icon, command, value, title }) => (
                    <Button
                        key={command}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand(command, value)}
                        title={title}
                    >
                        <Icon className="h-4 w-4" />
                    </Button>
                ))}
            </div>

            {/* Editor */}
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`min-h-[200px] p-4 outline-none prose prose-sm max-w-none ${!value && !isFocused ? 'text-muted-foreground' : ''
                    }`}
                data-placeholder={placeholder}
                suppressContentEditableWarning
            />

            <style jsx>{`
                [contenteditable]:empty:before {
                    content: attr(data-placeholder);
                    color: hsl(var(--muted-foreground));
                    pointer-events: none;
                }
                
                [contenteditable] ul,
                [contenteditable] ol {
                    margin: 1em 0;
                    padding-left: 2em;
                }
                
                [contenteditable] ul {
                    list-style-type: disc;
                }
                
                [contenteditable] ol {
                    list-style-type: decimal;
                }
                
                [contenteditable] li {
                    margin: 0.5em 0;
                }
                
                [contenteditable] h3 {
                    font-size: 1.25em;
                    font-weight: bold;
                    margin: 1em 0 0.5em 0;
                }
                
                [contenteditable] strong {
                    font-weight: bold;
                }
                
                [contenteditable] em {
                    font-style: italic;
                }
            `}</style>
        </div>
    );
}

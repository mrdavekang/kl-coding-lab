import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, Decoration, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, indentMore, indentLess, undo, redo, temporarilySetTabFocusMode } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { indentUnit, bracketMatching, syntaxHighlighting, HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';

const syntax = HighlightStyle.define([
  { tag: tags.keyword, color: '#c6adff' }, { tag: tags.string, color: '#b9e995' },
  { tag: tags.number, color: '#f5c178' }, { tag: tags.comment, color: '#98a6bf', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: '#8fdcf5' }, { tag: tags.bool, color: '#f5c178' },
  { tag: tags.operator, color: '#d5def2' }, { tag: tags.punctuation, color: '#d5def2' },
]);
const theme = EditorView.theme({
  '&': { color: '#edf2ff', backgroundColor: '#132039', height: '100%', fontSize: '17px' },
  '.cm-scroller': { fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace', lineHeight: '1.85', overflow: 'auto' },
  '.cm-content': { caretColor: '#fff', padding: '18px 0' },
  '.cm-line': { padding: '0 16px 0 10px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#fff' },
  '.cm-gutters': { backgroundColor: '#132039', color: '#7e91b2', border: 'none', paddingRight: '8px' },
  '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '18px', minWidth: '34px' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#1c2c49' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#365890 !important' },
  '.cm-matchingBracket': { backgroundColor: '#365890', outline: '1px solid #92baff' },
  '&.cm-focused': { outline: 'none' },
}, { dark: true });

const idleSyntax = HighlightStyle.define([
  { tag: tags.keyword, color: '#a04000' }, { tag: tags.string, color: '#008000' },
  { tag: tags.comment, color: '#b00000' }, { tag: tags.definition(tags.variableName), color: '#0000cc' },
  { tag: tags.standard(tags.variableName), color: '#800080' },
  { tag: tags.function(tags.variableName), color: '#800080' },
]);
const idleTheme = EditorView.theme({
  '&': { color: '#171717', backgroundColor: '#fff', height: '100%' },
  '.cm-scroller': { fontFamily: '"SFMono-Regular", Consolas, "Liberation Mono", monospace', lineHeight: '1.7', overflow: 'auto' },
  '.cm-content': { caretColor: '#111', padding: '16px 0' },
  '.cm-line': { padding: '0 16px 0 10px' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: '#111' },
  '.cm-gutters': { backgroundColor: '#f7f7f7', color: '#717171', borderRight: '1px solid #e3e3e3', paddingRight: '8px' },
  '.cm-lineNumbers .cm-gutterElement': { paddingLeft: '14px', minWidth: '34px' },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: '#f3f6fa' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': { backgroundColor: '#cce0ff !important' },
  '.cm-matchingBracket': { backgroundColor: '#e4eafb', outline: '1px solid #8f9ccc' },
  '&.cm-focused': { outline: 'none' },
}, { dark: false });

export const Editor = forwardRef(function Editor({ value, onChange, onRun, onCursor, appearance = 'dark', fontSize = 17, readOnly = false, executedLine = null, nextLine = null }, ref) {
  const host = useRef(null), editor = useRef(null), callbacks = useRef({ onChange, onRun, onCursor });
  const font = useRef(new Compartment());
  const access = useRef(new Compartment()), traceLines = useRef(new Compartment());
  callbacks.current = { onChange, onRun, onCursor };
  useImperativeHandle(ref, () => ({
    indent: () => { if (editor.current) { indentMore(editor.current); editor.current.focus(); } },
    outdent: () => { if (editor.current) { indentLess(editor.current); editor.current.focus(); } },
    undo: () => { if (editor.current) { undo(editor.current); editor.current.focus(); } },
    redo: () => { if (editor.current) { redo(editor.current); editor.current.focus(); } },
    focus: () => editor.current?.focus(),
  }), []);
  useEffect(() => {
    editor.current = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: value, extensions: [
        access.current.of([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]), traceLines.current.of([]),
        lineNumbers(), history(), drawSelection(), highlightActiveLine(), highlightActiveLineGutter(),
        python(), indentUnit.of('    '), EditorState.tabSize.of(4), bracketMatching(),
        syntaxHighlighting(appearance === 'idle' ? idleSyntax : syntax), appearance === 'idle' ? idleTheme : theme,
        font.current.of(EditorView.theme({ '&': { fontSize: fontSize + 'px' } })),
        EditorView.contentAttributes.of({ 'aria-label': 'Python code editor', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off', 'data-gramm': 'false' }),
        keymap.of([...(appearance === 'idle' ? [{ key: 'F5', run: () => { callbacks.current.onRun?.(); return true; } }] : []),
          { key: 'Mod-Enter', run: () => { callbacks.current.onRun?.(); return true; } },
          { key: 'Escape', run: temporarilySetTabFocusMode }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of(update => {
          if (update.docChanged) callbacks.current.onChange(update.state.doc.toString());
          if (update.selectionSet || update.docChanged) {
            const position = update.state.selection.main.head, line = update.state.doc.lineAt(position);
            callbacks.current.onCursor?.({ line: line.number, column: position - line.from });
          }
        }),
      ] }),
    });
    return () => { editor.current?.destroy(); editor.current = null; };
  }, []);
  useEffect(() => {
    if (editor.current && editor.current.state.doc.toString() !== value) {
      editor.current.dispatch({ changes: { from: 0, to: editor.current.state.doc.length, insert: value } });
    }
  }, [value]);
  useEffect(() => {
    editor.current?.dispatch({ effects: font.current.reconfigure(EditorView.theme({ '&': { fontSize: fontSize + 'px' } })) });
  }, [fontSize]);
  useEffect(() => {
    editor.current?.dispatch({ effects: access.current.reconfigure([EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)]) });
  }, [readOnly]);
  useEffect(() => {
    editor.current?.dispatch({ effects: traceLines.current.reconfigure(EditorView.decorations.of(view => Decoration.set(
      [...new Set([executedLine, nextLine])].filter(n => n && n <= view.state.doc.lines).sort((a,b) => a-b).map(n => Decoration.line({class: n === nextLine ? 'trace-next-line' : 'trace-done-line'}).range(view.state.doc.line(n).from))
    ))) });
  }, [executedLine, nextLine]);
  return <div className="code-editor" ref={host} />;
});

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { EditorState, Compartment } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab, indentMore, indentLess, undo, temporarilySetTabFocusMode } from '@codemirror/commands';
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

export const Editor = forwardRef(function Editor({ value, onChange, onRun, fontSize = 17 }, ref) {
  const host = useRef(null), editor = useRef(null), callbacks = useRef({ onChange, onRun });
  const font = useRef(new Compartment());
  callbacks.current = { onChange, onRun };
  useImperativeHandle(ref, () => ({
    indent: () => { if (editor.current) { indentMore(editor.current); editor.current.focus(); } },
    outdent: () => { if (editor.current) { indentLess(editor.current); editor.current.focus(); } },
    undo: () => { if (editor.current) { undo(editor.current); editor.current.focus(); } },
    focus: () => editor.current?.focus(),
  }), []);
  useEffect(() => {
    editor.current = new EditorView({
      parent: host.current,
      state: EditorState.create({ doc: value, extensions: [
        lineNumbers(), history(), drawSelection(), highlightActiveLine(), highlightActiveLineGutter(),
        python(), indentUnit.of('    '), EditorState.tabSize.of(4), bracketMatching(), syntaxHighlighting(syntax), theme,
        font.current.of(EditorView.theme({ '&': { fontSize: fontSize + 'px' } })),
        EditorView.contentAttributes.of({ 'aria-label': 'Python code editor', spellcheck: 'false', autocorrect: 'off', autocapitalize: 'off', 'data-gramm': 'false' }),
        keymap.of([{ key: 'Mod-Enter', run: () => { callbacks.current.onRun(); return true; } },
          { key: 'Escape', run: temporarilySetTabFocusMode }, indentWithTab, ...defaultKeymap, ...historyKeymap]),
        EditorView.updateListener.of(update => { if (update.docChanged) callbacks.current.onChange(update.state.doc.toString()); }),
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
  return <div className="code-editor" ref={host} />;
});

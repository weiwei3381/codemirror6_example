import { useEffect, useRef } from "react";
import {
  EditorState,
  Text,
  EditorSelection,
  Compartment,
  StateField,
} from "@codemirror/state";
import { CompletionContext } from "@codemirror/autocomplete";
import { EditorView, basicSetup } from "codemirror";
import { keymap, Tooltip, showTooltip } from "@codemirror/view";
import { defaultKeymap, indentWithTab } from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

function myCompletions(context: CompletionContext) {
  const word = context.matchBefore(/\w*/);
  if (word === null) return null;
  if (word.from == word.to && !context.explicit) return null;
  return {
    from: word.from,
    options: [
      { label: "match", type: "keyword" },
      { label: "hello", type: "variable", info: "(World)" },
      { label: "magic", type: "text", apply: "⠁⭒*.✩.*⭒⠁", detail: "macro" },
    ],
  };
}

const globalMarkdownCompletions = markdownLanguage.data.of({
  autocomplete: myCompletions,
});

function getCursorTooltips(state: EditorState): readonly Tooltip[] {
  return state.selection.ranges
    .filter((range) => range.empty)
    .map((range) => {
      const line = state.doc.lineAt(range.head);
      const text = line.number + ":" + (range.head - line.from);
      return {
        pos: range.head,
        above: true,
        strictSide: true,
        arrow: true,
        create: () => {
          let dom = document.createElement("div");
          dom.className = "cm-tooltip-cursor";
          dom.textContent = text;
          return { dom };
        },
      };
    });
}

const cursorTooltipField = StateField.define<readonly Tooltip[]>({
  create: getCursorTooltips,

  update(tooltips, tr) {
    if (!tr.docChanged && !tr.selection) return tooltips;
    return getCursorTooltips(tr.state);
  },

  provide: (f) => showTooltip.computeN([f], (state) => state.field(f)),
});

const cursorTooltipBaseTheme = EditorView.baseTheme({
  ".cm-tooltip.cm-tooltip-cursor": {
    backgroundColor: "#66b",
    color: "white",
    border: "none",
    padding: "2px 7px",
    borderRadius: "4px",
    "& .cm-tooltip-arrow:before": {
      borderTopColor: "#66b",
    },
    "& .cm-tooltip-arrow:after": {
      borderTopColor: "transparent",
    },
  },
});

export default function Edit({ onChange }) {
  let language = new Compartment(),
    tabSize = new Compartment();
  const editor = useRef();

  const dummyKeymap = (tag: string) => {
    return keymap.of([
      {
        key: "Ctrl-e",
        run() {
          console.log(tag);
          return true;
        },
      },
    ]);
  };

  const onUpdate = EditorView.updateListener.of((v) => {
    if (v.docChanged) {
      onChange(v.state.doc.toString());
    }
  });

  const doc = `
  # 测试markdown效果
  ## 目的
  通过测试，形成良好的*markdown编辑器*。
  `;

  const myTheme = EditorView.theme(
    {
      "&": {
        color: "white",
        backgroundColor: "#034",
      },
      ".cm-content": {
        caretColor: "#0e9",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "#045",
        color: "#ddd",
        border: "none",
      },
    },
    { dark: false }
  );

  useEffect(() => {
    const state = EditorState.create({
      doc: doc,
      extensions: [
        markdown(),
        onUpdate,
        cursorTooltipField,
        basicSetup,
        language.of(markdown()),
        keymap.of([indentWithTab]),
        myTheme,
      ],
    });

    const view = new EditorView({
      state: state,
      parent: editor.current,
    });

    console.log(state.selection.ranges.length); // 2
    let tr = state.update(state.replaceSelection("!"));
    console.log(tr.state.doc.toString()); // "!o!"

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editor}></div>;
}

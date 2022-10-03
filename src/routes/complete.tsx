import { useEffect, useRef } from "react";
import {
  EditorState,
  Text,
  EditorSelection,
  Compartment,
  StateField,
} from "@codemirror/state";
import {
  CompletionContext,
  autocompletion,
  CompletionResult,
  startCompletion,
} from "@codemirror/autocomplete";
import { defaultHighlightStyle } from "@codemirror/language";
import { EditorView, basicSetup } from "codemirror";
import {
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightSpecialChars,
} from "@codemirror/view";
import {
  defaultKeymap,
  indentWithTab,
  insertBlankLine,
  deleteLine,
} from "@codemirror/commands";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";

function myCompletions(context: CompletionContext): CompletionResult | null {
  console.log(context);
  const word = context.matchBefore(/.{2}/);
  console.log(word);
  if (word === null) return null;
  if (word.from == word.to && !context.explicit) return null;
  if (word.text.endsWith("测试")) {
    return {
      from: word.from,
      options: [
        {
          label: `测试效果`,
          type: "keyword",
        },
      ],
    };
  }
  return {
    from: word.from,
    options: [
      { label: "match", type: "keyword" },
      { label: "hello", type: "variable", info: "(World)" },
      {
        label: "magic",
        type: "text",
        apply: "⠁⭒*.✩.*⭒⠁",
        detail: "macro",
        boost: 9,
      },
    ],
  };
}

const myCompletion2 = autocompletion({
  activateOnTyping: true,
  override: [myCompletions],
});

export default function EditorCompletion({ onChange }) {
  let language = new Compartment(),
    tabSize = new Compartment();
  const editor = useRef();

  // 自定义快捷键
  const myKeymap = () => {
    return keymap.of([
      {
        // 使用tab键开启自动联想
        key: "Tab",
        run: startCompletion,
      },
      {
        // 插入新行
        key: "Shift-Enter",
        run: insertBlankLine,
      },
      {
        // 删除整行
        key: "Ctrl-d",
        run: deleteLine,
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

  useEffect(() => {
    const state = EditorState.create({
      doc: doc,
      extensions: [
        basicSetup,
        highlightActiveLine(),
        highlightSpecialChars(),
        lineNumbers(),
        myKeymap(),
        markdown(),
        onUpdate,
        language.of(markdown()),
        myCompletion2,
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

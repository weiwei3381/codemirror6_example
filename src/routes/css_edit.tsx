// codemirror使用css更换编辑器样式

import { useEffect, useRef } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, basicSetup } from "codemirror";
import { keymap } from "@codemirror/view";
import { indentWithTab } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

export default function CSSEdit({ onChange }) {
  const editor = useRef();

  const onUpdate = EditorView.updateListener.of((v) => {
    if (v.docChanged) {
      onChange(v.state.doc.toString());
    }
  });

  // 默认显示文字
  const doc = `
  # 测试markdown效果
  ## 目的
  众所周知，第二次世界大战以前，世界战争史上所有的*战争*、*战役*和**作战手段**尽管千差万别，但基本形式都是先由军队对军队的战场拉开战幕，进而奠定胜负之后，再由政府对政府的外交谈判结束战争。
  `;

  const myTheme = EditorView.theme(
    {
      "&": {
        color: "black",
        backgroundColor: "#f3f3f3",
      },
      ".ͼ7": {
        textDecoration: "none",
      },
      ".cm-content": {
        fontSize: "18px",
        fontFamily:
          "Consolas,'思源黑体 CN Light', '方正屏显雅宋简体', 'Courier New', monospace",
        caretColor: "#0e9",
      },
      "&.cm-focused .cm-cursor": {
        borderLeftColor: "#0e9",
      },
      "&.cm-focused .cm-selectionBackground, ::selection": {
        backgroundColor: "#074",
      },
      ".cm-gutters": {
        backgroundColor: "#cbd0d1",
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
        // 开启换行
        EditorView.lineWrapping,
        markdown(),
        onUpdate,
        basicSetup,
        markdown(),
        keymap.of([indentWithTab]),
        myTheme,
      ],
    });

    const view = new EditorView({
      state: state,
      parent: editor.current,
    });

    return () => {
      view.destroy();
    };
  }, []);

  return <div ref={editor}></div>;
}

import { useEffect, useRef } from "react";
import {
  EditorState,
  Text,
  Compartment,
  SelectionRange,
} from "@codemirror/state";
import {
  CompletionContext,
  autocompletion,
  CompletionResult,
  startCompletion,
  Completion,
} from "@codemirror/autocomplete";
import { EditorView, basicSetup } from "codemirror";
import {
  keymap,
  lineNumbers,
  highlightActiveLine,
  highlightSpecialChars,
} from "@codemirror/view";
import { insertBlankLine, deleteLine } from "@codemirror/commands";
import { markdown } from "@codemirror/lang-markdown";

function myCompletions(context: CompletionContext): CompletionResult | null {
  const para = context.matchBefore(/.+/); // 本段之前的所有内容
  let is_selection = false; // 是否有选择文本，默认不选择
  // 得到当前选中范围:如果from<to，那说明选择了从from到to的文本,反之如果选中范围的from==to，那说明没有选择文本
  const select_range: SelectionRange = context.state.selection.ranges[0];
  if (select_range.from < select_range.to) {
    is_selection = true; // 已选择文本
    // 得到选择的文本内容
    const select_text = context.state.doc
      .slice(select_range.from, select_range.to)
      .toString();
  }
  // 如果选中文本，那么走替换选项的填充方式
  if (is_selection) {
    return {
      from: select_range.to,
      options: [
        {
          label: `效果`,
          type: "keyword",
          apply: (
            view: EditorView,
            completion: Completion,
            from: number,
            to: number
          ) => {
            view.dispatch(view.state.replaceSelection(completion.label));
          },
        },
        {
          label: `饮料`,
          type: "keyword",
          apply: (
            view: EditorView,
            completion: Completion,
            from: number,
            to: number
          ) => {
            view.dispatch(view.state.replaceSelection(completion.label));
          },
        },
      ],
    };
  }
  // 自动补全的文本效果，可以先对para进行分词处理，找到最后2-3组词，搜索之后得到结果
  if (para === null) return null;
  if (para.from == para.to && !context.explicit) return null;
  if (para.text.endsWith("测试")) {
    return {
      from: para.to,
      options: [
        {
          label: `效果`,
          type: "keyword",
        },
        {
          label: `饮料`,
          type: "keyword",
        },
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
  return null;
}

const myCompletion = autocompletion({
  activateOnTyping: true,
  override: [myCompletions],
});

export default function EditorCompletion({ onChange }) {
  const language = new Compartment();
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
        myCompletion,
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

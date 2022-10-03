import { useState, useCallback } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import "@/routes/index.css";

export default function Index() {
  const [count, setCount] = useState(0);
  const onChange = useCallback((value, viewUpdate) => {
    console.log("value:", value);
  }, []);
  return (
    <>
      <p>当前count值为：{count}</p>
      <button onClick={() => setCount(count + 1)}>count值增1</button>
      <CodeMirror
        value="# 一级标题"
        height="200px"
        extensions={[markdown()]}
        onChange={onChange}
      />
    </>
  );
}

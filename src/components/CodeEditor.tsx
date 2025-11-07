import Editor from "@monaco-editor/react";
import { Card } from "@/components/ui/card";

interface CodeEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

export const CodeEditor = ({ value, onChange }: CodeEditorProps) => {
  return (
    <Card className="h-full overflow-hidden border-border bg-code-bg">
      <div className="h-full">
        <Editor
          height="100%"
          defaultLanguage="c"
          value={value}
          onChange={onChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: "on",
          }}
        />
      </div>
    </Card>
  );
};

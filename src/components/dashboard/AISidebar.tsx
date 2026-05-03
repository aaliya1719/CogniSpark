"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Code2, GraduationCap, Send, Bot, User as UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function applyInlineFormatting(s: string) {
  // bold **text**
  return s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}

function renderAssistantHtml(text: string) {
  const escaped = escapeHtml(text);
  const lines = escaped.split(/\r?\n/);
  let out = "";
  let listType: "ul" | "ol" | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const ulMatch = line.match(/^[-*]\s+(.*)/);
    const olMatch = line.match(/^(\d+)\.\s+(.*)/);

    if (ulMatch) {
      if (listType !== "ul") {
        if (listType === "ol") out += "</ol>";
        out += "<ul>";
        listType = "ul";
      }
      out += `<li>${applyInlineFormatting(ulMatch[1])}</li>`;
    } else if (olMatch) {
      if (listType !== "ol") {
        if (listType === "ul") out += "</ul>";
        out += "<ol>";
        listType = "ol";
      }
      out += `<li>${applyInlineFormatting(olMatch[2])}</li>`;
    } else {
      if (listType === "ul") {
        out += "</ul>";
        listType = null;
      } else if (listType === "ol") {
        out += "</ol>";
        listType = null;
      }

      if (line === "") {
        out += "<br/>";
      } else {
        out += `<p>${applyInlineFormatting(line)}</p>`;
      }
    }
  }

  if (listType === "ul") out += "</ul>";
  if (listType === "ol") out += "</ol>";

  return out;
}

export function AISidebar() {
  const [mode, setMode] = useState<"simple" | "code">("simple");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hey! I'm your Engineering Buddy. I can explain complex concepts with analogies or help you debug code. What's on your mind?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, mode }),
      });
      
      const data = await res.json();
      
      if (data.response) {
        setMessages(prev => [...prev, { role: "assistant", content: data.response }]);
      } else {
        throw new Error(data.error || "Failed to get response");
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setMessages(prev => [...prev, { role: "assistant", content: "Error: " + message }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-[calc(100vh-140px)] flex flex-col border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-2 border-b">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            AI Buddy
          </div>
          <div className="flex gap-1 p-1 bg-background/50 rounded-md border">
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-7 px-2 text-[10px]", mode === "simple" && "bg-primary text-primary-foreground")}
              onClick={() => setMode("simple")}
            >
              <GraduationCap className="h-3 w-3 mr-1" />
              Analogies
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("h-7 px-2 text-[10px]", mode === "code" && "bg-primary text-primary-foreground")}
              onClick={() => setMode("code")}
            >
              <Code2 className="h-3 w-3 mr-1" />
              Code Buddy
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full p-4">
          <div className="flex flex-col gap-4">
            {messages.map((m, i) => {
              const isAssistant = m.role === "assistant";
              return (
                <div
                  key={i}
                  className={cn(
                    "flex gap-3 max-w-[85%]",
                    m.role === "user" ? "ml-auto flex-row-reverse" : ""
                  )}
                >
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                    isAssistant ? "bg-primary text-primary-foreground" : "bg-muted"
                  )}>
                    {isAssistant ? <Sparkles className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
                  </div>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    isAssistant ? "bg-muted/50 rounded-tl-none" : "bg-primary text-primary-foreground rounded-tr-none"
                  )}>
                    {isAssistant ? (
                      <div dangerouslySetInnerHTML={{ __html: renderAssistantHtml(m.content) }} />
                    ) : (
                      <div>{escapeHtml(m.content)}</div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-pulse">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="p-3 rounded-2xl text-sm bg-muted/50 rounded-tl-none animate-pulse">
                  Thinking...
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-4 border-t bg-background/30">
        <div className="flex w-full gap-2">
          <Input 
            placeholder={mode === "simple" ? "Ask for an analogy..." : "Paste buggy code..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="bg-background"
          />
          <Button size="icon" onClick={sendMessage} disabled={isLoading}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

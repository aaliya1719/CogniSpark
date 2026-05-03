"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, ChevronLeft, ChevronRight, RefreshCw, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type Flashcard = {
  question: string;
  answer: string;
};

export function Flashcards() {
  const [file, setFile] = useState<File | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([
    { question: "What is the First Law of Thermodynamics?", answer: "Energy cannot be created or destroyed, only transformed." },
    { question: "Define Polymorphism in OOP.", answer: "The ability of different objects to respond to the same message in their own specific way." },
  ]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    setFile(selectedFile);
    setIsUploading(true);
    
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const res = await fetch("/api/flashcards", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.flashcards) {
        setCards(data.flashcards);
        setCurrentIndex(0);
        setIsFlipped(false);
      } else {
        throw new Error(data.error || "Failed to generate");
      }
    } catch (error) {
      console.error(error);
      alert("Error generating flashcards. Check the console.");
    } finally {
      setIsUploading(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + cards.length) % cards.length);
  };

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            AI Flashcards
          </div>
          {file && (
            <span className="text-[10px] text-muted-foreground truncate max-w-[100px]">
              {file.name}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {!file && (
          <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 bg-background/20 transition-colors hover:bg-background/40 relative">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-xs text-muted-foreground text-center">
              Drag & drop your study PDF here to generate 5 smart flashcards
            </p>
            <input 
              type="file" 
              accept=".pdf" 
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUpload}
            />
          </div>
        )}

        {file && isUploading && (
          <div className="h-[200px] flex flex-col items-center justify-center gap-4">
            <RefreshCw className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm font-medium animate-pulse">Gemini is reading your PDF...</p>
          </div>
        )}

        {file && !isUploading && (
          <div className="flex flex-col gap-6">
            <div 
              className="perspective-1000 h-[200px] cursor-pointer"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={cn(
                "relative w-full h-full transition-transform duration-500 preserve-3d",
                isFlipped && "rotate-y-180"
              )}>
                {/* Front */}
                <div className="absolute inset-0 backface-hidden bg-background border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg">
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground absolute top-4">Question</span>
                  <p className="text-base font-semibold leading-tight">{cards[currentIndex].question}</p>
                </div>
                {/* Back */}
                <div className="absolute inset-0 backface-hidden bg-primary text-primary-foreground border rounded-xl p-6 flex flex-col items-center justify-center text-center shadow-lg rotate-y-180">
                  <span className="text-[10px] uppercase tracking-widest text-primary-foreground/60 absolute top-4">Answer</span>
                  <p className="text-base leading-tight">{cards[currentIndex].answer}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <Button variant="outline" size="icon" onClick={prevCard}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} of {cards.length}
              </span>
              <Button variant="outline" size="icon" onClick={nextCard}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setFile(null)}>
              Upload Different PDF
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

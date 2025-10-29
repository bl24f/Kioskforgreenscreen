import { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { X, Check } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ScrollArea } from "./ui/scroll-area";
import technoWizard1 from "figma:asset/51373ff6d14222f8bc93b57c78baaa8d3f5427f2.png";
import technoWizard2 from "figma:asset/8797246c0b6a2d730dab60ff37e942cbb1a3f29a.png";
import technoWizard3 from "figma:asset/b42dd0e7b4dbacf0e11f8458edeeb23f1410cd1d.png";

interface ExtraBackground {
  id: string;
  name: string;
  url: string;
  categories: string[];
  keywords: string[];
}

interface ExtraBackgroundsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectBackground: (background: ExtraBackground) => void;
  selectedBackgroundIds: string[];
}

const extraBackgrounds: ExtraBackground[] = [
  // Techno Wizard of Tallahassee
  {
    id: "custom-21",
    name: "Teaching Tech",
    url: technoWizard1,
    categories: ["techno"],
    keywords: ["presentation", "teaching", "classroom", "tech", "tallahassee", "wizard"],
  },
  {
    id: "custom-22",
    name: "Tech Class",
    url: technoWizard2,
    categories: ["techno"],
    keywords: ["energetic", "teaching", "classroom", "tech", "tallahassee", "wizard"],
  },
  {
    id: "custom-23",
    name: "Phone Lesson",
    url: technoWizard3,
    categories: ["techno"],
    keywords: ["phones", "devices", "tech", "classroom", "tallahassee", "wizard"],
  },
  // Holidays
  {
    id: "custom-1",
    name: "Christmas Tree",
    url: "https://images.unsplash.com/photo-1590843772289-0852de837f05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaHJpc3RtYXMlMjBob2xpZGF5JTIwZGVjb3JhdGlvbnN8ZW58MXx8fHwxNzYxNDA3MTE3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["holidays"],
    keywords: ["christmas", "winter", "snow", "festive", "holiday"],
  },
  {
    id: "custom-2",
    name: "Halloween Pumpkins",
    url: "https://images.unsplash.com/photo-1608590898839-de14c56b7fe5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYWxsb3dlZW4lMjBwdW1wa2lucyUyMHNwb29reXxlbnwxfHx8fDE3NjE0MDcxMTh8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["holidays", "funny"],
    keywords: ["halloween", "pumpkin", "spooky", "october", "scary"],
  },
  {
    id: "custom-3",
    name: "Valentine Hearts",
    url: "https://images.unsplash.com/photo-1610723218618-21948aa529da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2YWxlbnRpbmVzJTIwZGF5JTIwaGVhcnRzfGVufDF8fHx8MTc2MTQwNzExOHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["holidays"],
    keywords: ["valentine", "love", "hearts", "romance", "february"],
  },
  {
    id: "custom-19",
    name: "Easter Eggs",
    url: "https://images.unsplash.com/photo-1620133671434-693cf671d13d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlYXN0ZXIlMjBlZ2dzJTIwc3ByaW5nfGVufDF8fHx8MTc2MTQwNzEyNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["holidays"],
    keywords: ["easter", "spring", "eggs", "bunny", "colorful"],
  },
  {
    id: "custom-20",
    name: "Fourth of July",
    url: "https://images.unsplash.com/photo-1657066910471-533d5bf55e21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3VydGglMjBqdWx5JTIwYW1lcmljYXxlbnwxfHx8fDE3NjE0MDcxMjR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["holidays"],
    keywords: ["july", "america", "independence", "patriotic", "fireworks"],
  },
  // Events
  {
    id: "custom-4",
    name: "Birthday Party",
    url: "https://images.unsplash.com/photo-1619252872371-c82ac4d9e86f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiaXJ0aGRheSUyMHBhcnR5JTIwYmFsbG9vbnN8ZW58MXx8fHwxNzYxMzQyNTA1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["events"],
    keywords: ["birthday", "party", "balloons", "celebration", "cake"],
  },
  {
    id: "custom-5",
    name: "Wedding Day",
    url: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWRkaW5nJTIwY2VsZWJyYXRpb258ZW58MXx8fHwxNzYxMzI1OTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["events", "serious"],
    keywords: ["wedding", "marriage", "bride", "groom", "ceremony"],
  },
  {
    id: "custom-6",
    name: "Graduation Day",
    url: "https://images.unsplash.com/photo-1623461487986-9400110de28e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxncmFkdWF0aW9uJTIwY2VyZW1vbnl8ZW58MXx8fHwxNzYxMzU2NjMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["events", "serious"],
    keywords: ["graduation", "diploma", "cap", "gown", "achievement"],
  },
  {
    id: "custom-18",
    name: "Fireworks Show",
    url: "https://images.unsplash.com/photo-1642498496883-56a096f98e8b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJld29ya3MlMjBjZWxlYnJhdGlvbnxlbnwxfHx8fDE3NjEzOTMyNzF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["events"],
    keywords: ["fireworks", "celebration", "new year", "party", "sparkle"],
  },
  // TV Shows & Movies
  {
    id: "custom-7",
    name: "Superhero",
    url: "https://images.unsplash.com/photo-1658999167159-3f6659cace61?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXBlcmhlcm8lMjBjb21pY3xlbnwxfHx8fDE3NjEzODcxNjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["movies"],
    keywords: ["superhero", "comic", "action", "marvel", "hero"],
  },
  {
    id: "custom-8",
    name: "Outer Space",
    url: "https://images.unsplash.com/photo-1687985826611-80b714011d0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGFjZSUyMHNjaSUyMGZpfGVufDF8fHx8MTc2MTQwNzEyMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["movies"],
    keywords: ["space", "sci-fi", "stars", "galaxy", "futuristic"],
  },
  {
    id: "custom-9",
    name: "Retro 80s",
    url: "https://images.unsplash.com/photo-1567281660907-4e5fd0958b90?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXRybyUyMHZpbnRhZ2UlMjA4MHN8ZW58MXx8fHwxNzYxNDA3MTIwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["movies", "funny"],
    keywords: ["retro", "80s", "vintage", "neon", "nostalgia"],
  },
  {
    id: "custom-10",
    name: "Neon City",
    url: "https://images.unsplash.com/photo-1706245405770-ed9151cad554?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZW9uJTIwY3liZXJwdW5rJTIwY2l0eXxlbnwxfHx8fDE3NjEzMzkzNTZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["movies"],
    keywords: ["cyberpunk", "neon", "city", "futuristic", "tech"],
  },
  // Sports
  {
    id: "custom-11",
    name: "Football Field",
    url: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb290YmFsbCUyMHN0YWRpdW18ZW58MXx8fHwxNzYxMjk2MjExfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["sports"],
    keywords: ["football", "stadium", "nfl", "college", "field"],
  },
  {
    id: "custom-12",
    name: "Basketball Court",
    url: "https://images.unsplash.com/photo-1577416412292-747c6607f055?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNrZXRiYWxsJTIwY291cnR8ZW58MXx8fHwxNzYxMzYyMjIxfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["sports"],
    keywords: ["basketball", "court", "nba", "college", "hoops"],
  },
  {
    id: "custom-13",
    name: "Baseball Stadium",
    url: "https://images.unsplash.com/photo-1623947453126-3652fc16b2b0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYXNlYmFsbCUyMGZpZWxkfGVufDF8fHx8MTc2MTMxNjAyMnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["sports"],
    keywords: ["baseball", "field", "mlb", "college", "diamond"],
  },
  // Funny
  {
    id: "custom-14",
    name: "Cute Puppy",
    url: "https://images.unsplash.com/photo-1626805660992-3c9070e7d854?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmdW5ueSUyMGNhcnRvb24lMjBkb2d8ZW58MXx8fHwxNzYxNTk3MzMwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["funny"],
    keywords: ["funny", "cartoon", "dog", "silly", "cute"],
  },
  {
    id: "custom-15",
    name: "Rainbow Fun",
    url: "https://images.unsplash.com/photo-1664843917235-6eb2f536a51b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzaWxseSUyMGNhcnRvb258ZW58MXx8fHwxNzYxNDA3MTIzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["funny"],
    keywords: ["silly", "cartoon", "fun", "playful", "comic"],
  },
  // Serious/Professional
  {
    id: "custom-16",
    name: "Gold Sparkle",
    url: "https://images.unsplash.com/photo-1603687057020-55470a6fbf45?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwbHV4dXJ5JTIwZ29sZHxlbnwxfHx8fDE3NjE0MDcxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["serious", "logos"],
    keywords: ["luxury", "gold", "elegant", "premium", "sophisticated"],
  },
  {
    id: "custom-17",
    name: "Business Office",
    url: "https://images.unsplash.com/photo-1758520145175-aa3b593b81af?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHByb2Zlc3Npb25hbCUyMG9mZmljZXxlbnwxfHx8fDE3NjEzMDc3Mjd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral",
    categories: ["serious", "logos"],
    keywords: ["business", "professional", "office", "corporate", "formal"],
  },
];

const categories = [
  { id: "all", label: "All", color: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { id: "holidays", label: "Holidays", color: "bg-gradient-to-r from-red-500 to-green-500" },
  { id: "events", label: "Events", color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  { id: "movies", label: "TV/Movies", color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
  { id: "sports", label: "Sports", color: "bg-gradient-to-r from-green-500 to-teal-500" },
  { id: "logos", label: "Logos", color: "bg-gradient-to-r from-indigo-500 to-purple-500" },
  { id: "funny", label: "Funny", color: "bg-gradient-to-r from-pink-500 to-rose-500" },
  { id: "serious", label: "Serious", color: "bg-gradient-to-r from-slate-600 to-slate-800" },
  { id: "techno", label: "Techno Wizard", color: "bg-gradient-to-r from-cyan-500 to-blue-600" },
];

export function ExtraBackgroundsDialog({
  open,
  onOpenChange,
  onSelectBackground,
  selectedBackgroundIds,
}: ExtraBackgroundsDialogProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredBackgrounds = useMemo(() => {
    return extraBackgrounds.filter((bg) => {
      // Filter by category
      return selectedCategory === "all" || bg.categories.includes(selectedCategory);
    });
  }, [selectedCategory]);

  const handleSelectBackground = (bg: ExtraBackground) => {
    onSelectBackground(bg);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] bg-slate-900 border-slate-700 p-0 overflow-hidden flex flex-col">
        <DialogTitle className="sr-only">Extra Backgrounds</DialogTitle>
        <DialogDescription className="sr-only">
          Browse and select extra backgrounds for your photos from various categories including holidays, events, movies, sports, and more. These extra backgrounds are included at no additional cost.
        </DialogDescription>
        
        {/* Header - Fixed */}
        <div className="p-6 border-b border-slate-700 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl text-slate-100" aria-hidden="true">Extra Backgrounds</h2>
              <p className="text-sm text-slate-400 mt-1">Browse and select from our extra background collection (no additional cost)</p>
            </div>
            <Button
              onClick={() => onOpenChange(false)}
              variant="ghost"
              size="icon"
              className="h-10 w-10 text-slate-400 hover:text-slate-100 hover:bg-slate-800"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Category Filters - Fixed */}
        <div className="px-6 py-4 border-b border-slate-700 bg-slate-800/50 shrink-0">
          <div className="overflow-x-auto">
            <div className="flex gap-3">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`h-12 px-6 text-base whitespace-nowrap active:scale-95 transition-all select-none ${
                    selectedCategory === category.id
                      ? `${category.color} text-white shadow-lg`
                      : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                  }`}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Background Grid - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          {filteredBackgrounds.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-xl text-slate-400">No backgrounds found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 pb-4">
              {filteredBackgrounds.map((bg) => {
                const isSelected = selectedBackgroundIds.includes(bg.id);
                
                return (
                  <button
                    key={bg.id}
                    onClick={() => handleSelectBackground(bg)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-4 transition-all active:scale-95 select-none ${
                      isSelected
                        ? "border-green-500 shadow-lg shadow-green-500/30"
                        : "border-transparent hover:border-slate-500"
                    }`}
                  >
                    <ImageWithFallback
                      src={bg.url}
                      alt={bg.name}
                      className="w-full h-full object-cover"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <div className="bg-green-500 rounded-full p-3">
                          <Check className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/85 to-transparent text-white px-2 py-5 text-center">
                      <p className="text-sm leading-tight break-words">{bg.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

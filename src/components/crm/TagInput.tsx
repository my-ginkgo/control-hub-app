
import { useState, useEffect, KeyboardEvent } from 'react';
import { X, Tag as TagIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export const TagInput = ({ tags = [], onChange, placeholder = "Aggiungi tag..." }: TagInputProps) => {
  const [inputValue, setInputValue] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue);
    }
  };
  
  const addTag = (value: string) => {
    const newTag = value.trim().toLowerCase();
    const currentTags = Array.isArray(tags) ? tags : [];
    
    // Skip if tag is empty or already exists
    if (!newTag || currentTags.includes(newTag)) {
      setInputValue('');
      return;
    }
    
    const updatedTags = [...currentTags, newTag];
    onChange(updatedTags);
    setInputValue('');
  };
  
  const removeTag = (tagToRemove: string) => {
    const currentTags = Array.isArray(tags) ? tags : [];
    const updatedTags = currentTags.filter(tag => tag !== tagToRemove);
    onChange(updatedTags);
  };
  
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 mb-2">
        {Array.isArray(tags) && tags.map(tag => (
          <Badge key={tag} variant="secondary" className="flex items-center gap-1 py-1">
            <TagIcon className="h-3 w-3 text-muted-foreground" />
            <span>{tag}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-4 w-4 p-0 ml-1"
              onClick={() => removeTag(tag)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
      </div>
      
      <div className="flex gap-2">
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-grow"
        />
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => addTag(inputValue)}
          disabled={!inputValue.trim()}
        >
          <TagIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

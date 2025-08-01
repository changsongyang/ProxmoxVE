import type { z } from "zod";

import { PlusCircle, Trash2 } from "lucide-react";
import { memo, useCallback, useRef } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertColors } from "@/config/site-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type { Script } from "../_schemas/schemas";

import { ScriptSchema } from "../_schemas/schemas";

const NoteItem = memo(
  ({
    note,
    index,
    updateNote,
    removeNote,
  }: {
    note: Script["notes"][number];
    index: number;
    updateNote: (index: number, key: keyof Script["notes"][number], value: string) => void;
    removeNote: (index: number) => void;
  }) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleTextChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      updateNote(index, "text", e.target.value);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }, [index, updateNote]);

    return (
      <div className="space-y-2 border p-4 rounded">
        <Input
          placeholder="Note Text"
          value={note.text}
          onChange={handleTextChange}
          ref={inputRef}
        />
        <Select
          value={note.type}
          onValueChange={value => updateNote(index, "type", value)}
        >
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            {Object.keys(AlertColors).map(type => (
              <SelectItem key={type} value={type}>
                <span className="flex items-center gap-2">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                  {" "}
                  <div
                    className={cn(
                      "size-4 rounded-full border",
                      AlertColors[type as keyof typeof AlertColors],
                    )}
                  />
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          size="sm"
          variant="destructive"
          type="button"
          onClick={() => removeNote(index)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {" "}
          Remove Note
        </Button>
      </div>
    );
  },
);

type NoteProps = {
  script: Script;
  setScript: (script: Script) => void;
  setIsValid: (isValid: boolean) => void;
  setZodErrors: (zodErrors: z.ZodError | null) => void;
};

function Note({
  script,
  setScript,
  setIsValid,
  setZodErrors,
}: NoteProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const addNote = useCallback(() => {
    setScript({
      ...script,
      notes: [...script.notes, { text: "", type: "" }],
    });
  }, [script, setScript]);

  const updateNote = useCallback((
    index: number,
    key: keyof Script["notes"][number],
    value: string,
  ) => {
    const updated: Script = {
      ...script,
      notes: script.notes.map((note, i) =>
        i === index ? { ...note, [key]: value } : note,
      ),
    };
    const result = ScriptSchema.safeParse(updated);
    setIsValid(result.success);
    setZodErrors(result.success ? null : result.error);
    setScript(updated);
    // Restore focus after state update
    if (key === "text") {
      setTimeout(() => {
        inputRefs.current[index]?.focus();
      }, 0);
    }
  }, [script, setScript, setIsValid, setZodErrors]);

  const removeNote = useCallback((index: number) => {
    setScript({
      ...script,
      notes: script.notes.filter((_, i) => i !== index),
    });
  }, [script, setScript]);

  return (
    <>
      <h3 className="text-xl font-semibold">Notes</h3>
      {script.notes.map((note, index) => (
        <NoteItem key={index} note={note} index={index} updateNote={updateNote} removeNote={removeNote} />
      ))}
      <Button type="button" size="sm" onClick={addNote}>
        <PlusCircle className="mr-2 h-4 w-4" />
        {" "}
        Add Note
      </Button>
    </>
  );
}

NoteItem.displayName = "NoteItem";

export default memo(Note);

import type { ChangeEvent } from "react";

export interface InputProps {
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  error?: string;
  placeholder?: string;
}

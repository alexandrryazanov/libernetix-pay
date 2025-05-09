import type { ChangeEvent, HTMLProps } from "react";

export interface InputProps {
  type?: HTMLProps<HTMLInputElement>["type"];
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  error?: string;
  placeholder?: string;
  disabled?: boolean;
}

"use client";

import { Control } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface FormInputProps {
  control: Control<ProfileFormValues>;
  name: any;
  label: string;
  disabled: boolean;
  placeholder?: string;
  type?: string;
  isTextArea?: boolean;
}

export const FormInput = ({ 
  control, 
  name, 
  label, 
  disabled, 
  placeholder, 
  type = "text", 
  isTextArea = false 
}: FormInputProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            {isTextArea ? (
              <Textarea
                {...field}
                disabled={disabled}
                placeholder={placeholder}
                className="resize-none h-24"
              />
            ) : (
              <Input
                {...field}
                type={type}
                disabled={disabled}
                placeholder={placeholder}
              />
            )}
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
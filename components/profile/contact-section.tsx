"use client";

import { Control } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { FormInput } from "./form-input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface ContactSectionProps {
  control: Control<ProfileFormValues>;
  isEditing: boolean;
}

export const ContactSection = ({ control, isEditing }: ContactSectionProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Contact & Social</CardTitle>
        <CardDescription>Public contact links</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <FormInput control={control} name="contact_info.phone_no" label="Phone" placeholder="+91..." disabled={!isEditing} />
        <FormInput control={control} name="contact_info.whatsapp_no" label="WhatsApp" placeholder="+91..." disabled={!isEditing} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput control={control} name="contact_info.github" label="GitHub" placeholder="username" disabled={!isEditing} />
          <FormInput control={control} name="contact_info.twitter" label="Twitter" placeholder="username" disabled={!isEditing} />
          <FormInput control={control} name="contact_info.linkedin" label="LinkedIn" placeholder="username" disabled={!isEditing} />
          <FormInput control={control} name="contact_info.telegram" label="Telegram" placeholder="username" disabled={!isEditing} />
        </div>

        <FormInput control={control} name="contact_info.website" label="Website" placeholder="https://..." disabled={!isEditing} />
      </CardContent>
    </Card>
  );
};
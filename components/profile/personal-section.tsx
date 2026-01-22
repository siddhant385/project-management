"use client";

import { Control } from "react-hook-form";
import { ProfileFormValues } from "@/schemas/profile";
import { FormInput } from "./form-input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersonalSectionProps {
  control: Control<ProfileFormValues>;
  isEditing: boolean;
  userRole: string;
  userEmail: string;
}

export const PersonalSection = ({ control, isEditing, userRole, userEmail }: PersonalSectionProps) => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Basic profile details</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormInput control={control} name="full_name" label="Full Name" disabled={!isEditing} />
          <FormInput control={control} name="department" label="Department" disabled={!isEditing} />
        </div>

        <FormInput control={control} name="bio" label="Bio" disabled={!isEditing} isTextArea />

        {userRole === "student" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormInput control={control} name="roll_number" label="Roll Number" disabled={!isEditing} />
            <FormInput control={control} name="admission_year" label="Admission Year" type="number" disabled={!isEditing} />
          </div>
        ) : (
          <FormInput control={control} name="skills" label="Skills" disabled={!isEditing} />
        )}

        <div className="pt-4 border-t">
          <Label className="text-muted-foreground mb-2 block">
            Email (Read Only)
          </Label>
          <Input disabled value={userEmail} className="bg-muted text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );
};
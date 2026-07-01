"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateUiData } from "@/services/ui";

interface FooterSettingsProps {
  id: string;
  footer: {
    shortDescription: string;
    contactInfo: {
      number: string;
      email: string;
      website: string;
    };
    location: string;
    copyright: string;
  };
}

export default function Footer({ id, footer }: FooterSettingsProps) {
  const [formData, setFormData] = useState({
    shortDescription: footer.shortDescription,
    number: footer.contactInfo.number,
    email: footer.contactInfo.email,
    website: footer.contactInfo.website,
    location: footer.location,
    copyright: footer.copyright,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleUpdate = async (e: React.FormEvent<HTMLFormElemant>) => {
    e.preventDefault();

    const toastId = toast.loading("Updating footer...");

    try {
      setIsLoading(true);

      await updateUiData(id, {
        footer: {
          shortDescription: formData.shortDescription,

          contactInfo: {
            number: formData.number,
            email: formData.email,
            website: formData.website,
          },

          location: formData.location,
          copyright: formData.copyright,
        },
      });

      toast.success("Footer updated successfully", {
        id: toastId,
      });
    } catch (error) {
      console.error(error);

      toast.error("Failed to update footer", {
        id: toastId,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-5">
      <h2 className="text-2xl font-semibold mb-6">Footer Settings</h2>

      <form onSubmit={handleUpdate} className="space-y-5">
        <div>
          <Label className="font-semibold mb-2">Short Description</Label>

          <Input
            value={formData.shortDescription}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                shortDescription: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="font-semibold mb-2">Phone Number</Label>

          <Input
            value={formData.number}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                number: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="font-semibold mb-2">Email</Label>

          <Input
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                email: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="font-semibold mb-2">Website</Label>

          <Input
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                website: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="font-semibold mb-2">Location</Label>

          <Input
            value={formData.location}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                location: e.target.value,
              }))
            }
          />
        </div>

        <div>
          <Label className="font-semibold mb-2">Copyright</Label>

          <Input
            value={formData.copyright}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                copyright: e.target.value,
              }))
            }
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Updating..." : "Update Footer"}
        </Button>
      </form>
    </div>
  );
}

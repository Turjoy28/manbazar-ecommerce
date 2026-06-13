"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ImageUpload from "@/components/shared/imageUpload";

import { updateUiData } from "@/services/ui";

interface Card {
  image: string;
  title: string;
  description: string;
}

interface WhyWeProps {
  id: string;
  specialty: {
    title: string;
    subTitle: string;
    description: string;
    cards: Card[];
  };
}

export default function WhyWe({ id, specialty }: WhyWeProps) {
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(specialty?.title || "");

  const [subTitle, setSubTitle] = useState(specialty?.subTitle || "");

  const [description, setDescription] = useState(specialty?.description || "");

  const [cards, setCards] = useState<Card[]>(specialty?.cards || []);

  const updateCard = (index: number, key: keyof Card, value: string) => {
    const updated = [...cards];

    updated[index] = {
      ...updated[index],
      [key]: value,
    };

    setCards(updated);
  };

  const handleUpdate = async () => {
    const toastId = toast.loading("Updating specialty section...");

    try {
      setLoading(true);

      await updateUiData(id, {
        specialty: {
          title,
          subTitle,
          description,
          cards,
        },
      });

      toast.success("Updated successfully", {
        id: toastId,
      });
    } catch (error) {
      console.log(error);

      toast.error("Update failed", {
        id: toastId,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl p-5 space-y-6 xl:col-span-3">
      <h2 className="text-2xl font-bold">Why We Section</h2>

      {/* Main Info */}

      <div>
        <Label className="mb-2 font-semibold">Sub Title</Label>

        <Input value={subTitle} onChange={(e) => setSubTitle(e.target.value)} />
      </div>

      <div>
        <Label className="mb-2 font-semibold">Title</Label>

        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>

      <div>
        <Label className="mb-2 font-semibold">Description</Label>

        <Input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* Cards */}

      <div className="space-y-6">
        <h3 className="text-xl font-semibold">Cards</h3>

        <div className="grid xl:grid-cols-3 gap-5">
          {cards.map((card, index) => (
            <div key={index} className="border rounded-xl p-4 space-y-4">
              <h4 className="font-semibold">Card {index + 1}</h4>

              {/* <ImageUpload
                title="Card Image"
                description=""
                value={card.image ? [card.image] : []}
                onChange={(images) =>
                  updateCard(index, "image", images[0] || "")
                }
                maxFiles={1}
              /> */}

              <div>
                <Label className="mb-2 font-semibold">Title</Label>

                <Input
                  value={card.title}
                  onChange={(e) => updateCard(index, "title", e.target.value)}
                />
              </div>

              <div>
                <Label className="mb-2 font-semibold">Description</Label>

                <Input
                  value={card.description}
                  onChange={(e) =>
                    updateCard(index, "description", e.target.value)
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button onClick={handleUpdate} disabled={loading} className="w-full">
        {loading ? "Updating..." : "Update Why We Section"}
      </Button>
    </div>
  );
}

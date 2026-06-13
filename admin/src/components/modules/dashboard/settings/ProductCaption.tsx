"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { updateUiData } from "@/services/ui";

import { toast } from "sonner";

export default function ProductCaption({caption,id}: {caption: {title: string}; id: string}) {

    const [title, setTitle] = useState(caption?.title || "");

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const toastId = toast.loading("Updating...");

        try {

            await updateUiData(
                    id,
                    {
                        "productsCaption.title": title,
                    }
                );

            toast.success(
                "Caption updated",
                {
                    id: toastId,
                }
            );

        } catch (error) {

            console.log(error);

            toast.error("Caption update error", {id: toastId});

        }
    };

    return (
        <div className="border rounded-xl p-4 space-y-5">

            <h4 className="text-2xl mb-5">
                Product Caption
            </h4>

            <form
                onSubmit={handleUpdate}
                className="space-y-3"
            >
                <Label>
                    Product Caption
                </Label>

                <Input
                    value={title}
                    onChange={(e) =>
                        setTitle(
                            e.target.value
                        )
                    }
                    placeholder="Add product section header caption"
                    className="w-full h-14"
                />

                <Button type="submit">
                    Update
                </Button>
            </form>
        </div>
    );
}
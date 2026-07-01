/* ═══════════════════════════════════════════════════════════════════════════════
   IMAGE UPLOAD — Reusable Upload Component
   
   A versatile, reusable image upload component that supports:
   - Single image mode (for thumbnails, logos, banners, etc.)
   - Multiple image mode (for product galleries)
   - Replace/remove functionality per image
   - Drag area with visual feedback
   
   USAGE:
   
   Single image (thumbnail):
     <ImageUpload
       value={thumbnailUrl ? [thumbnailUrl] : []}
       onChange={(urls) => setThumbnailUrl(urls[0] || "")}
       title="Thumbnail"
       description="Upload a single thumbnail image"
     />
   
   Multiple images (gallery):
     <ImageUpload
       value={images}
       onChange={setImages}
       multiple
       maxFiles={6}
       title="Gallery"
       description="Upload up to 6 images"
     />
   ═══════════════════════════════════════════════════════════════════════════════ */
"use client";

import { type ChangeEvent, useRef, useState } from "react";
import Image from "next/image";
import { ImageIcon, Trash2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { uploadImage } from "@/services/uploadImages";

/* Type guard to check if a string is a valid image URL */
const isImageUrl = (image: string | undefined): image is string => Boolean(image);

/* ─── Props Interface ─── */
interface ImageUploadProps {
    /* Array of currently uploaded image URLs */
    value: string[];
    /* Callback when the image array changes (add/remove/replace) */
    onChange: (images: string[]) => void;
    /* If true, allows uploading multiple images at once */
    multiple?: boolean;
    /* Maximum number of images allowed (defaults to 1 for single, 10 for multiple) */
    maxFiles?: number;
    /* Title shown above the upload area */
    title?: string;
    /* Description/hint text shown below the title */
    description?: string;
}

export default function ImageUpload({
    value,
    onChange,
    multiple = false,
    maxFiles,
    title = "Upload Images",
    description = "Select images",
}: ImageUploadProps) {
    /* Ref to the hidden file input so we can trigger it programmatically */
    const inputRef = useRef<HTMLInputElemant>(null);
    /* Tracks whether an upload is currently in progress */
    const [isUploading, setIsUploading] = useState(false);
    /* When non-null, the next upload replaces the image at this index */
    const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
    /* Error message from a failed upload */
    const [error, setError] = useState("");

    /* Calculate the effective file limit */
    const fileLimit = maxFiles ?? (multiple ? 10 : 1);
    /* How many more images can be added before hitting the limit */
    const availableSlots = Math.max(fileLimit - value.length, 0);

    /**
     * openFilePicker — Opens the native file picker dialog.
     * @param index If provided, the selected file will replace the image at this index.
     *              If null, the file is appended (or set as the only file in single mode).
     */
    const openFilePicker = (index: number | null = null) => {
        if (isUploading) return;

        setReplaceIndex(index);
        /* setTimeout ensures the state update propagates before the click */
        window.setTimeout(() => inputRef.current?.click(), 0);
    };

    /**
     * handleSelect — Called when the user selects file(s) from the picker.
     * Uploads the file(s) to the server and updates the value array.
     */
    const handleSelect = async (e: ChangeEvent<HTMLInputElemant>) => {
        const selectedFiles = Array.from(e.target.files || []);
        const isReplacing = replaceIndex !== null;

        /* In replace mode or single mode, only take the first file */
        const files = isReplacing || !multiple
            ? selectedFiles.slice(0, 1)
            : selectedFiles.slice(0, availableSlots);

        if (!files.length) {
            setReplaceIndex(null);
            e.target.value = "";
            return;
        }

        try {
            setIsUploading(true);
            setError("");

            /* Upload to the server — sends as "thumbnail" (single) or "images" (multiple) */
            const data = await uploadImage(
                files,
                multiple && !isReplacing
            );

            /* 
               Extract uploaded URLs from the server response.
               For single/replace: prefer the thumbnail URL, fallback to first image.
               For multiple: use the images array.
            */
            const uploadedImages = multiple && !isReplacing
                ? data.images
                : [data.thumbnail, data.images[0]].filter(isImageUrl).slice(0, 1);

            if (!uploadedImages.length) {
                throw new Error("No image URL returned from upload");
            }

            /* Replace mode: swap the image at the specified index */
            if (isReplacing) {
                onChange(
                    value.map((image, index) =>
                        index === replaceIndex ? uploadedImages[0] : image
                    )
                );
                return;
            }

            /* Append mode (multiple) or set mode (single) */
            if (multiple) {
                onChange([...value, ...uploadedImages].slice(0, fileLimit));
            } else {
                onChange([uploadedImages[0]]);
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : "Image upload failed");
            console.error(error);
        } finally {
            setIsUploading(false);
            setReplaceIndex(null);
            e.target.value = "";
        }
    };

    /**
     * removeImage — Removes an image from the value array by index.
     */
    const removeImage = (index: number) => {
        onChange(
            value.filter((_, i) => i !== index)
        );
    };

    return (
        <Card>
            <CardContent className="p-6">
                <div className="space-y-4">
                    {/* ─── Title and description ─── */}
                    <div>
                        <h3 className="text-xl font-medium">
                            {title}
                        </h3>

                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>

                    {/* ─── Drop zone / Upload trigger ───
                        Only visible when there are available slots */}
                    {value.length < fileLimit && (
                        <div
                            onClick={() => openFilePicker()}
                            className="border-2 border-dashed rounded-xl p-8 cursor-pointer hover:bg-muted/50 transition"
                        >
                            <div className="flex flex-col items-center gap-3">
                                <Upload className="h-8 w-8 text-muted-foreground" />

                                <div className="text-center">
                                    <p className="font-medium">
                                        Click to upload
                                    </p>

                                    <p className="text-sm text-muted-foreground">
                                        PNG, JPG, WEBP
                                    </p>

                                    {/* Show counter only in multiple mode */}
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {value.length}/{fileLimit}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ─── Uploaded image previews ─── */}
                    {value.length > 0 && (
                        <div className={`${value.length > 1 ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : ""}`}>
                            {value.map((image, index) => (
                                <div
                                    key={index}
                                    className="border rounded-xl overflow-hidden">
                                    {/* Image preview */}
                                    <div className="relative h-48 flex items-center justify-center bg-muted/30">
                                        {image && (image.startsWith("/") || image.startsWith("http://") || image.startsWith("https://")) ? (
                                            <Image
                                                src={image}
                                                alt={`image-${index}`}
                                                fill
                                                className="object-cover"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-muted-foreground p-4 text-center">
                                                <ImageIcon className="h-8 w-8 text-muted-foreground/60" />
                                                <span className="text-xs font-semibold truncate max-w-[200px]">{image || "No image"}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Action buttons — Change and Delete */}
                                    <div className="p-2 flex justify-between">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={isUploading}
                                            onClick={() => openFilePicker(index)}
                                        >
                                            <ImageIcon className="h-4 w-4 mr-2" />
                                            Change
                                        </Button>

                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            disabled={isUploading}
                                            onClick={() =>
                                                removeImage(index)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Hidden file input — triggered programmatically */}
                    <input
                        ref={inputRef}
                        hidden
                        type="file"
                        accept="image/*"
                        multiple={multiple && replaceIndex === null}
                        onChange={handleSelect}
                    />

                    {/* Error message */}
                    {error && (
                        <p className="text-sm text-destructive">
                            {error}
                        </p>
                    )}

                    {/* Upload progress indicator */}
                    {isUploading && (
                        <p className="text-sm text-muted-foreground">
                            Uploading...
                        </p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

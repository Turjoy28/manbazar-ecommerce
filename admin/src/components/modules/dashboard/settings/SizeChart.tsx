"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

import { updateUiData } from "@/services/ui";

interface SizeChartProps {
  id: string;

  chart: {
    subTitle: string;
    title: string;
    description: string;

    tableTitle: string;
    tableSubTitle: string;

    chartTable: {
      tableTitle: string[];
      tableProperties: string[][];
    };

    chartMeta: {
      title: string;

      cards: {
        logo: string;
        title: string;
        description: string;
      }[];
    };
  };
}

export default function SizeChart({ id, chart }: SizeChartProps) {
  const [formData, setFormData] = useState(chart);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    const toastId = toast.loading("Updating size chart...");

    try {
      setIsUpdating(true);

      await updateUiData(id, {
        chart: formData,
      });

      toast.success("Size chart updated", {
        id: toastId,
      });
    } catch (error) {
      console.error(error);

      toast.error("Update failed", {
        id: toastId,
      });
    } finally {
      setIsUpdating(false);

      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-8 border rounded-xl p-5 xl:col-span-3">
      <h2 className="text-2xl font-bold text-center">Size Chart</h2>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* BASIC INFO */}
        <div className="space-y-4">
          <h3 className="font-bold text-lg">Section Header</h3>
          <div>
            <Label className="font-semibold mb-2">Subtitle</Label>

            <Input
              value={formData.subTitle}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  subTitle: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label className="font-semibold mb-2">Title</Label>

            <Input
              value={formData.title}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  title: e.target.value,
                })
              }
            />
          </div>

          <div>
            <Label className="font-semibold mb-2">Description</Label>

            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  description: e.target.value,
                })
              }
            />
          </div>
        </div>

        {/* TABLE INFO */}

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Table</h3>

          <Label className="font-semibold mb-2">Table title</Label>
          <Input
            placeholder="Table Title"
            value={formData.tableTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                tableTitle: e.target.value,
              })
            }
          />

          <Label className="font-semibold mb-2">Table Subtitle</Label>
          <Input
            placeholder="Table Subtitle"
            value={formData.tableSubTitle}
            onChange={(e) =>
              setFormData({
                ...formData,
                tableSubTitle: e.target.value,
              })
            }
          />

          <div>
            <Label className="font-semibold mb-2">
              Table Headers (comma separated)
            </Label>

            <Input
              value={formData.chartTable.tableTitle.join(",")}
              onChange={(e) =>
                setFormData({
                  ...formData,

                  chartTable: {
                    ...formData.chartTable,

                    tableTitle: e.target.value
                      .split(",")
                      .map((item) => item.trim()),
                  },
                })
              }
            />
          </div>
        </div>

        {/* TABLE ROWS */}

        <div className="space-y-4">
          <h3 className="font-bold text-lg">Table Rows</h3>

          {formData.chartTable.tableProperties.map((row, rowIndex) => (
            <Input
              key={rowIndex}
              value={row.join(",")}
              onChange={(e) => {
                const updatedRows = [...formData.chartTable.tableProperties];

                updatedRows[rowIndex] = e.target.value
                  .split(",")
                  .map((item) => item.trim());

                setFormData({
                  ...formData,

                  chartTable: {
                    ...formData.chartTable,
                    tableProperties: updatedRows,
                  },
                });
              }}
            />
          ))}
        </div>

        {/* META */}

        <div className="xl:col-span-3">
          <h3 className="font-bold text-lg mb-3">Right Side Cards</h3>

          <Label className="font-semibold mb-2">Title</Label>
          <Input
            placeholder="Meta Title"
            value={formData.chartMeta.title}
            onChange={(e) =>
              setFormData({
                ...formData,

                chartMeta: {
                  ...formData.chartMeta,
                  title: e.target.value,
                },
              })
            }
            className="mb-3"
          />
          <div className="grid xl:grid-cols-3 gap-2">
            {formData.chartMeta.cards.map((card, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <Label className="font-semibold mb-2">Card {index + 1}</Label>
                {/* <Input
                  placeholder="Logo URL"
                  value={card.logo}
                  onChange={(e) => {
                    const cards = [...formData.chartMeta.cards];

                    cards[index].logo = e.target.value;

                    setFormData({
                      ...formData,

                      chartMeta: {
                        ...formData.chartMeta,
                        cards,
                      },
                    });
                  }}
                /> */}

                <label className="mb-2 font-semibold">Title</label>
                <Input
                  placeholder="Card Title"
                  value={card.title}
                  onChange={(e) => {
                    const cards = [...formData.chartMeta.cards];

                    cards[index].title = e.target.value;

                    setFormData({
                      ...formData,

                      chartMeta: {
                        ...formData.chartMeta,
                        cards,
                      },
                    });
                  }}
                />

                <label className="mb-2 font-semibold">Description</label>
                <Textarea
                  placeholder="Description"
                  value={card.description}
                  onChange={(e) => {
                    const cards = [...formData.chartMeta.cards];

                    cards[index].description = e.target.value;

                    setFormData({
                      ...formData,

                      chartMeta: {
                        ...formData.chartMeta,
                        cards,
                      },
                    });
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleUpdate}
        disabled={isUpdating}
        className="w-full"
      >
        {isUpdating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Size Chart"
        )}
      </Button>
    </div>
  );
}

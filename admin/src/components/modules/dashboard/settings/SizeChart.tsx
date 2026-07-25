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



        {/* TABLE EDITOR */}
        <div className="xl:col-span-3 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Table Builder</h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => {
                  const newHeaders = [...formData.chartTable.tableTitle, `Col ${formData.chartTable.tableTitle.length + 1}`];
                  const newRows = formData.chartTable.tableProperties.map(row => [...row, ""]);
                  setFormData({
                    ...formData,
                    chartTable: { tableTitle: newHeaders, tableProperties: newRows }
                  });
                }}
              >
                + Add Column
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                type="button"
                onClick={() => {
                  const newRows = [...formData.chartTable.tableProperties, Array(formData.chartTable.tableTitle.length).fill("")];
                  setFormData({
                    ...formData,
                    chartTable: { ...formData.chartTable, tableProperties: newRows }
                  });
                }}
              >
                + Add Row
              </Button>
            </div>
          </div>

          <div className="border rounded-xl overflow-x-auto bg-card">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50">
                <tr>
                  {formData.chartTable.tableTitle.map((header, colIndex) => (
                    <th key={colIndex} className="p-2 border-b border-r border-border min-w-[150px] relative group align-top pt-4">
                      <Input
                        value={header}
                        className="font-bold bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none h-8 px-2"
                        placeholder="Header"
                        onChange={(e) => {
                          const newHeaders = [...formData.chartTable.tableTitle];
                          newHeaders[colIndex] = e.target.value;
                          setFormData({
                            ...formData,
                            chartTable: { ...formData.chartTable, tableTitle: newHeaders }
                          });
                        }}
                      />
                      {formData.chartTable.tableTitle.length > 1 && (
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-xs font-bold"
                          onClick={() => {
                            const newHeaders = formData.chartTable.tableTitle.filter((_, i) => i !== colIndex);
                            const newRows = formData.chartTable.tableProperties.map(row => row.filter((_, i) => i !== colIndex));
                            setFormData({
                              ...formData,
                              chartTable: { tableTitle: newHeaders, tableProperties: newRows }
                            });
                          }}
                          title="Remove Column"
                        >
                          ×
                        </button>
                      )}
                    </th>
                  ))}
                  <th className="w-10 border-b border-border"></th>
                </tr>
              </thead>
              <tbody>
                {formData.chartTable.tableProperties.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-border last:border-b-0 group transition-colors hover:bg-muted/30">
                    {row.map((cell, colIndex) => (
                      <td key={colIndex} className="p-1 border-r border-border relative">
                        <Input
                          value={cell}
                          placeholder="Value"
                          className="bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-primary shadow-none rounded-sm h-9"
                          onChange={(e) => {
                            const newRows = [...formData.chartTable.tableProperties];
                            newRows[rowIndex][colIndex] = e.target.value;
                            setFormData({
                              ...formData,
                              chartTable: { ...formData.chartTable, tableProperties: newRows }
                            });
                          }}
                        />
                      </td>
                    ))}
                    <td className="w-10 p-2 text-center align-middle">
                      {formData.chartTable.tableProperties.length > 1 && (
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity font-bold text-lg leading-none"
                          onClick={() => {
                            const newRows = formData.chartTable.tableProperties.filter((_, i) => i !== rowIndex);
                            setFormData({
                              ...formData,
                              chartTable: { ...formData.chartTable, tableProperties: newRows }
                            });
                          }}
                          title="Remove Row"
                        >
                          ×
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

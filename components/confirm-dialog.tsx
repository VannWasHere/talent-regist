"use client";

import { useState } from "react";
import { Loader2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AFTER_PERIOD, REQUIREMENTS, SYSTEM_SOW } from "@/lib/content";

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  submitting,
  summary,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  submitting: boolean;
  summary: Record<string, string>;
}) {
  const [agreeSow, setAgreeSow] = useState(false);
  const [agreeReq, setAgreeReq] = useState(false);

  // Reset centang setiap kali modal ditutup, tanpa effect tambahan.
  function handleOpenChange(next: boolean) {
    if (!next) {
      setAgreeSow(false);
      setAgreeReq(false);
    }
    onOpenChange(next);
  }

  const canSubmit = agreeSow && agreeReq && !submitting;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg grid-rows-[auto_1fr_auto] p-0 sm:max-w-lg">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Konfirmasi pendaftaran</DialogTitle>
          <DialogDescription>
            Baca dulu ketentuannya. Dengan mengirim pendaftaran, kamu dianggap
            setuju dengan poin-poin di bawah.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 overflow-y-auto px-4">
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <h4 className="font-heading text-sm font-medium">Sistem &amp; SOW</h4>
              <RuleList items={SYSTEM_SOW} />
            </div>

            <div className="space-y-2">
              <h4 className="font-heading text-sm font-medium">Requirements</h4>
              <RuleList items={REQUIREMENTS} />
            </div>

            <div className="space-y-1 rounded-lg bg-muted/60 p-3">
              <h4 className="font-heading text-sm font-medium">
                📌 Setelah periode
              </h4>
              <p className="text-sm text-muted-foreground">{AFTER_PERIOD}</p>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-heading text-sm font-medium">
                Data yang akan dikirim
              </h4>
              <dl className="grid gap-1 text-sm">
                {Object.entries(summary).map(([key, value]) => (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="truncate font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="space-y-3 pb-2">
              <Label className="group/field-label items-start gap-2.5 font-normal">
                <Checkbox
                  checked={agreeSow}
                  onCheckedChange={(checked) => setAgreeSow(Boolean(checked))}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">
                  Saya sudah membaca dan setuju dengan sistem, SOW, periode 30
                  hari, target 60 jam live &amp; 20 Valid Day, serta skema fee
                  Rp2.000.000 NET yang dibayarkan setelah target terpenuhi.
                </span>
              </Label>

              <Label className="group/field-label items-start gap-2.5 font-normal">
                <Checkbox
                  checked={agreeReq}
                  onCheckedChange={(checked) => setAgreeReq(Boolean(checked))}
                  className="mt-0.5"
                />
                <span className="text-sm leading-snug">
                  Saya menyanggupi requirements (PC/laptop layak streaming,
                  webcam, internet stabil, bisa berinteraksi dengan viewers) dan
                  data yang saya isi benar.
                </span>
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="mx-0 mb-0">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={submitting}
          >
            Kembali
          </Button>
          <Button disabled={!canSubmit} onClick={() => void onConfirm()}>
            {submitting ? (
              <>
                <Loader2Icon className="animate-spin" />
                Mengirim...
              </>
            ) : (
              "Setuju & kirim pendaftaran"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

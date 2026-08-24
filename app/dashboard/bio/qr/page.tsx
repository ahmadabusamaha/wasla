"use client";

import { QRCodeSVG } from "qrcode.react";
import { useParams } from "next/navigation";
import { DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QRPage() {
  const params = useParams<{ username: string }>();
  const url = typeof window !== "undefined"
    ? `${window.location.origin}/${params.username}`
    : "";

  function download() {
    const svg = document.getElementById("bio-qr");
    if (!svg) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svg);
    const blob = new Blob([source], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `wasla-qr-${params.username}.svg`;
    link.click();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">QR Code — صفحتك</h1>
      <Card className="max-w-sm mx-auto">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-sm text-muted-foreground">
            امسح للوصول لصفحتي
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-8">
          <div id="bio-qr" className="rounded-2xl border bg-white p-6">
            {url ? <QRCodeSVG value={url} size={200} /> : null}
          </div>
          <p dir="ltr" className="text-xs text-muted-foreground">{url}</p>
          <Button onClick={download} className="rounded-xl w-full">
            <DownloadIcon className="size-4" />
            تحميل QR Code
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            استخدمه على بطاقاتك، مطبوعاتك، شاشتك في الفيديوهات
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

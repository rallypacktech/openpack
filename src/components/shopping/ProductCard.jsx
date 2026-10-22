import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Star, CheckCircle2, Plus, Heart } from "lucide-react";
import {
  DownloadResourceButton,
  getPrintableResource,
} from "@/components/manuals/PrintableResources";
import { isAllowedAffiliateUrl } from "@/lib/affiliateUrl";
import { isFirstAid } from "@/lib/cacheItems";
import { CATEGORY_COLORS, CACHE_TYPE_LABELS, getStoreName } from "@/lib/productDisplay";

export default function ProductCard({
  rec,
  owned,
  expired,
  onAddToCache,
  onBuy,
}) {
  const linkOk =
    rec.affiliate_link && isAllowedAffiliateUrl(rec.affiliate_link);

  return (
    <Card className={`relative ${owned ? "ring-2 ring-green-400" : ""}`}>
      {rec.is_required && (
        <div className="absolute top-2 left-2 z-10">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-400" />
        </div>
      )}
      {owned && (
        <div className="absolute top-2 right-2 z-10">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
      )}
      <CardContent className="p-4">
        {rec.image_url && (
          <div className="aspect-square w-full mb-3 overflow-hidden rounded-lg bg-secondary">
            <img
              src={rec.image_url}
              alt={rec.item_name}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <h3 className="font-semibold text-foreground mb-2 pr-6">
          {rec.item_name}
        </h3>
        <div className="flex gap-1 mb-2 flex-wrap">
          <Badge className={`text-xs ${CATEGORY_COLORS[rec.category] || CATEGORY_COLORS.other}`}>
            {rec.category}
          </Badge>
          {isFirstAid(rec) && (
            <Badge className="text-xs bg-red-100 text-red-700">
              <Heart className="w-3 h-3 mr-1" />
              First Aid
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {CACHE_TYPE_LABELS[rec.cache_type] || rec.cache_type}
          </Badge>
          {expired && (
            <Badge className="text-xs bg-red-100 text-red-700">Expired</Badge>
          )}
        </div>
        {rec.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {rec.description}
          </p>
        )}
        {rec.price_cents > 0 && (
          <p className="text-xl font-bold text-foreground mb-3">
            ${(rec.price_cents / 100).toFixed(2)}
          </p>
        )}
        <div className="space-y-2">
          {getPrintableResource(rec.item_name) && (
            <DownloadResourceButton itemName={rec.item_name} fullWidth />
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full text-green-700 border-green-300 hover:bg-green-50"
            onClick={() => onAddToCache(rec)}
          >
            <Plus className="w-4 h-4 mr-1" />
            {owned ? "Add to another cache" : "Add to cache"}
          </Button>
          {linkOk && (
            <Button
              size="sm"
              className="w-full bg-crimson hover:bg-crimson/90 text-white"
              onClick={() => onBuy(rec)}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Buy on {getStoreName(rec.affiliate_link)}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
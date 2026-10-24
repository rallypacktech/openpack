import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import SearchOverviewPanel from "@/components/admin/search/SearchOverviewPanel";
import FooterIndexPanel from "@/components/admin/search/FooterIndexPanel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function AdminSearchPerformance() {
  const [authorized, setAuthorized] = useState(null);
  const [sites, setSites] = useState(null);
  const [siteUrl, setSiteUrl] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me();
        if (me?.role !== "admin") {
          setAuthorized(false);
          return;
        }
        setAuthorized(true);

        const res = await base44.functions.invoke("getSearchPerformance", { action: "sites" });
        if (res.data?.error) throw new Error(res.data.error);
        const list = res.data?.sites || [];
        setSites(list);
        if (list.length) setSiteUrl(list[0].site_url);
      } catch (err) {
        setAuthorized(true);
        setSites([]);
        setError(err.message);
      }
    })();
  }, []);

  if (authorized === null) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-24 text-center">
        <h1 className="font-serif text-2xl font-bold text-foreground mb-2">Search Performance</h1>
        <p className="text-sm text-muted-foreground">This page is available to administrators only.</p>
      </div>
    );
  }

  return (
    <div data-no-translate className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Search Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          What Google search is sending to RallyPack — queries, pages, countries — and whether the
          public pages are indexed.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-md border border-amber-300 bg-amber-50 p-4">
          <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-amber-600" />
          <p className="text-xs text-amber-900">{error}</p>
        </div>
      )}

      {sites === null ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : sites.length === 0 ? (
        <Card>
          <CardContent className="py-16 px-6 text-center space-y-3">
            <p className="text-sm font-medium text-foreground">
              No Search Console property is available to this connection.
            </p>
            <p className="text-xs text-muted-foreground max-w-xl mx-auto">
              The Google account connected to Search Console has no verified property. Add and
              verify your site in Search Console with that account, or reconnect the connector
              choosing the account that already manages it — then reload this page.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {sites.length > 1 && (
            <div>
              <label className="text-xs text-muted-foreground">Property</label>
              <Select value={siteUrl} onValueChange={setSiteUrl}>
                <SelectTrigger className="w-full sm:w-96 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((s) => (
                    <SelectItem key={s.site_url} value={s.site_url}>
                      {s.site_url}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <SearchOverviewPanel siteUrl={siteUrl} />
          <FooterIndexPanel siteUrl={siteUrl} />
        </>
      )}
    </div>
  );
}
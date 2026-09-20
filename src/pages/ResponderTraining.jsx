import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import IcsTerminologyPanel from "@/components/business/IcsTerminologyPanel";
import EmergencyManuals from "@/components/manuals/EmergencyManuals";
import FieldReferenceGuides from "@/components/training/FieldReferenceGuides";
import VolunteerOpportunities from "@/components/resources/VolunteerOpportunities";
import { ArrowRight, BookOpen, Compass, Network, Users } from "lucide-react";

export default function ResponderTraining() {
  useEffect(() => {
    document.title = "Responder Training Hub | RallyPack";
  }, []);

  return (
    <div className="min-h-screen bg-cream font-sans">
      {/* Header */}
      <section className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-semibold mb-4">
            Volunteer Corps
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
            Responder Training Hub
          </h1>
          <p className="text-base text-muted-foreground max-w-2xl leading-relaxed">
            Everything a volunteer responder needs before and during a deployment — the incident
            command terminology you'll hear on scene, the emergency manuals worth knowing cold, and
            printable field reference guides for the work itself.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <Tabs defaultValue="ics">
          <TabsList className="flex flex-wrap h-auto justify-start gap-1 p-1">
            <TabsTrigger value="ics" className="gap-2">
              <Network className="w-3.5 h-3.5" aria-hidden="true" />
              ICS Reference
            </TabsTrigger>
            <TabsTrigger value="manuals" className="gap-2">
              <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
              Disaster Manuals
            </TabsTrigger>
            <TabsTrigger value="field" className="gap-2">
              <Compass className="w-3.5 h-3.5" aria-hidden="true" />
              Field Reference Guides
            </TabsTrigger>
            <TabsTrigger value="corps" className="gap-2">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              Volunteer Corps
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ics" className="mt-6">
            <IcsTerminologyPanel />
          </TabsContent>

          <TabsContent value="manuals" className="mt-6">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">
                Disaster Manuals
              </h2>
              <p className="text-muted-foreground font-sans text-sm max-w-2xl">
                Step-by-step guidance for the emergencies you are most likely to meet in the field.
                Every manual prints to PDF for an offline binder or a glovebox copy.
              </p>
            </div>
            <EmergencyManuals />
          </TabsContent>

          <TabsContent value="field" className="mt-6">
            <div className="mb-4">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">
                Field Reference Guides
              </h2>
              <p className="text-muted-foreground font-sans text-sm max-w-2xl">
                Short, printable cards for use on scene — size-up, triage, radio discipline, weather
                stress, deployment kit and animal handling.
              </p>
            </div>
            <FieldReferenceGuides />
          </TabsContent>

          <TabsContent value="corps" className="mt-6">
            <VolunteerOpportunities />
            <div className="mt-6 bg-primary/5 border border-primary/20 rounded p-4">
              <p className="text-sm font-sans text-foreground">
                <strong>Already trained?</strong> The same reference material is bundled for offline
                use in the app — open the Offline page before you deploy so it's available with no
                signal.
              </p>
              <Link
                to="/Offline"
                className="inline-flex items-center gap-2 mt-3 text-xs font-sans font-semibold text-primary hover:underline"
              >
                Go to Offline Mode
                <ArrowRight className="w-3 h-3" aria-hidden="true" />
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
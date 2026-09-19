import React, { useState } from "react";
import { ChevronDown, ChevronUp, Users, Shuffle, Network, ExternalLink } from "lucide-react";

// ICS terminology reference for responder organizations — Strike Teams, Task
// Forces, and the command structure that organizes them. ICS is the standard
// incident management system used by FEMA and adopted by emergency services
// worldwide, so the concepts apply to deployments outside the U.S. as well.
const COMPARISON = [
  {
    id: "strike-team",
    title: "Strike Team",
    icon: Users,
    tagline: "Same resources, working together.",
    body: "A set number of the same kind and type of resource, operating with common communications and a single leader. Fire departments from across a state might send engines and crews that are organized into one Strike Team under a Strike Team Leader, then assigned to a specific incident or structure-protection task.",
    examples: [
      "Five Type 1 engines with crews from different departments",
      "One Strike Team Leader directing the group",
      "Common communications plan across all units",
    ],
  },
  {
    id: "task-force",
    title: "Task Force",
    icon: Shuffle,
    tagline: "Different resources, one common mission.",
    body: "Combines different kinds and/or types of resources under one leader to accomplish a specific assignment. An animal response Task Force might pair handlers, a transport vehicle and driver, a veterinarian, livestock feeding personnel, and a logistics resource — different capabilities organized under one Task Force Leader.",
    examples: [
      "Animal handlers + transport + veterinarian + logistics",
      "Assignment example: conduct animal welfare checks and feeding-in-place within the evacuation area",
      "One Task Force Leader accountable for the mixed group",
    ],
  },
];

const GLOSSARY = [
  { term: "Incident Command System (ICS)", def: "The standardized management structure used to organize people, equipment, and communications at an incident. It lets resources from different agencies arrive at a disaster and be organized into a common structure." },
  { term: "Span of Control", def: "The number of resources one supervisor can effectively manage — generally three to seven, with five as the target. Strike Teams and Task Forces exist so no single supervisor has to directly manage dozens of individual resources." },
  { term: "Resource", def: "Any person or piece of equipment with a defined capability that can be assigned to an incident — a crew, an engine, a veterinarian, a transport trailer." },
  { term: "Division / Group", def: "How an incident is split up geographically (Division) or by function (Group) once it grows beyond what one supervisor can handle directly." },
  { term: "Staging Area", def: "A location where available resources wait for assignment, keeping unassigned units out of the way and ready to deploy." },
  { term: "Demobilization", def: "The structured release of resources when they are no longer needed — including check-out, documentation, and travel home." },
  { term: "After-Action Review", def: "The structured debrief after an incident that captures what worked, what didn't, and what changes before the next deployment." },
];

export default function IcsTerminologyPanel() {
  const [openTerm, setOpenTerm] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">ICS Reference</h2>
        <p className="text-muted-foreground font-sans text-sm max-w-2xl">
          You may hear the terms <strong>Strike Team</strong> and <strong>Task Force</strong> during an
          incident. They sound similar — both organize resources to accomplish an assignment — but they
          mean different things. ICS is the standard used by FEMA and emergency services worldwide.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPARISON.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.id} className="border border-border rounded bg-card p-5">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-sans font-semibold text-foreground text-sm">{item.title}</h3>
                  <p className="text-xs text-primary font-sans font-semibold">{item.tagline}</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground font-sans leading-relaxed mb-3">{item.body}</p>
              <ul className="space-y-1">
                {item.examples.map((e) => (
                  <li key={e} className="flex gap-2 text-xs font-sans text-muted-foreground">
                    <span className="text-muted-foreground shrink-0 mt-0.5">•</span>
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded p-4">
        <p className="text-sm font-sans text-foreground">
          <strong>Quick reference:</strong> Same resources? Think <strong>Strike Team</strong>. Different
          resources with a common mission? Think <strong>Task Force</strong>.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Network className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="font-sans font-semibold text-foreground text-sm uppercase tracking-widest">
            Command structure glossary
          </h3>
        </div>
        <div className="space-y-2">
          {GLOSSARY.map((g) => {
            const isOpen = openTerm === g.term;
            return (
              <div key={g.term} className="border border-border rounded bg-card overflow-hidden">
                <button
                  onClick={() => setOpenTerm(isOpen ? null : g.term)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-secondary/30 transition-colors"
                  aria-expanded={isOpen}
                >
                  <span className="font-sans font-semibold text-foreground text-sm">{g.term}</span>
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />
                    : <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" aria-hidden="true" />}
                </button>
                {isOpen && (
                  <p className="px-4 pb-4 text-sm text-muted-foreground font-sans leading-relaxed border-t border-border pt-3">
                    {g.def}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <a
        href="https://training.fema.gov/is/courseoverview.aspx?code=IS-100.c"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 text-xs font-sans font-semibold text-primary hover:underline"
      >
        Take FEMA IS-100: Introduction to the Incident Command System (free, online)
        <ExternalLink className="w-3 h-3" aria-hidden="true" />
      </a>
    </div>
  );
}
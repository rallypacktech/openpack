import React, { useState } from "react";
import { ExternalLink, BookOpen, Clock, MapPin, Globe, ChevronDown, ChevronUp } from "lucide-react";

const CLASSES = [
  {
    org: "American Red Cross",
    icon: "🔴",
    url: "https://www.redcross.org/take-a-class",
    description: "The Red Cross offers CPR/AED, First Aid, Wilderness & Remote First Aid, Babysitting, and disaster preparedness courses — both in-person and online.",
    courses: [
      { name: "CPR & First Aid", url: "https://www.redcross.org/take-a-class/first-aid/first-aid-training", format: "In-person / Online" },
      { name: "Wilderness & Remote First Aid", url: "https://www.redcross.org/take-a-class/first-aid/wilderness-remote-first-aid-training", format: "In-person" },
      { name: "Disaster Preparedness for Families", url: "https://www.redcross.org/get-help/how-to-prepare-for-emergencies.html", format: "Online / Free" },
      { name: "Community Emergency Response", url: "https://www.redcross.org/volunteer/volunteer-opportunities/community-emergency-response-teams.html", format: "In-person" },
    ],
  },
  {
    org: "REI Co-op",
    icon: "🏔️",
    url: "https://www.rei.com/learn/classes-events",
    description: "REI offers outdoor survival, wilderness first aid, navigation, and emergency preparedness classes at stores nationwide and online.",
    courses: [
      { name: "Wilderness First Aid", url: "https://www.rei.com/learn/classes-events", format: "In-person" },
      { name: "Survival Skills", url: "https://www.rei.com/learn/classes-events", format: "In-person" },
      { name: "Navigation & Map Reading", url: "https://www.rei.com/learn/classes-events", format: "In-person / Online" },
      { name: "Emergency Preparedness Basics", url: "https://www.rei.com/learn/classes-events", format: "In-person" },
    ],
  },
  {
    org: "Code 3 Associates",
    icon: "🐾",
    url: "https://code3associates.org",
    description: "Code 3 Associates specializes in animal emergency response training — including large animal rescue, technical animal rescue, and Incident Command for animals.",
    courses: [
      { name: "Large Animal Emergency Rescue (LAER)", url: "https://code3associates.org/training/", format: "In-person" },
      { name: "Technical Animal Rescue", url: "https://code3associates.org/training/", format: "In-person" },
      { name: "Animal Incident Command", url: "https://code3associates.org/training/", format: "In-person" },
      { name: "Equine Emergency Response", url: "https://code3associates.org/training/", format: "In-person" },
    ],
  },
  {
    org: "FEMA Emergency Management Institute",
    icon: "🏛️",
    url: "https://training.fema.gov/is/",
    description: "FEMA's Independent Study program offers 100+ free online courses on emergency management, incident command (ICS), and community preparedness — all free with a certificate.",
    courses: [
      { name: "IS-100: Intro to Incident Command", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-100.c", format: "Online / Free" },
      { name: "IS-200: Basic Incident Command", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-200.c", format: "Online / Free" },
      { name: "IS-700: National Incident Management", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-700.b", format: "Online / Free" },
      { name: "IS-317: Community Emergency Response Teams", url: "https://training.fema.gov/is/courseoverview.aspx?code=IS-317.a", format: "Online / Free" },
    ],
  },
  {
    org: "DART Command Center",
    icon: "🦺",
    url: "https://dartcc.org",
    description: "DART (Disaster Animal Response Team) Command Center offers specialized training in animal disaster response, shelter operations, and search and rescue.",
    courses: [
      { name: "Animal Shelter Operations", url: "https://dartcc.org/training", format: "In-person / Online" },
      { name: "Animal Search & Rescue", url: "https://dartcc.org/training", format: "In-person" },
      { name: "Disaster Animal Response Team Training", url: "https://dartcc.org/training", format: "In-person" },
    ],
  },
  {
    org: "National Safety Council",
    icon: "🦺",
    url: "https://www.nsc.org/training",
    description: "The NSC provides nationally recognized First Aid, CPR, AED, defensive driving, and workplace safety training.",
    courses: [
      { name: "First Aid, CPR & AED", url: "https://www.nsc.org/training/first-aid", format: "In-person / Online" },
      { name: "Wilderness First Aid", url: "https://www.nsc.org/training", format: "In-person" },
      { name: "Bloodborne Pathogens", url: "https://www.nsc.org/training/workplace-safety/bloodborne-pathogens", format: "Online" },
    ],
  },
  {
    org: "Operation HOPE",
    icon: "🤝",
    url: "https://operationhope.org",
    description: "Operation HOPE offers free financial literacy and disaster financial recovery workshops to help families recover and rebuild after disasters.",
    courses: [
      { name: "Disaster Financial Recovery", url: "https://operationhope.org/programs/hope-disaster-relief/", format: "In-person / Online / Free" },
      { name: "Personal Finance & Resilience", url: "https://operationhope.org/programs/", format: "Online / Free" },
    ],
  },
  {
    org: "National VOAD — Disaster Recovery Training",
    icon: "🌐",
    url: "https://www.nvoad.org/resources/training/",
    description: "National VOAD (Voluntary Organizations Active in Disaster) provides training on long-term disaster recovery, disaster case management, volunteer coordination, donations management, and building Community Organizations Active in Disaster (COAD) chapters.",
    courses: [
      { name: "Long-Term Recovery Groups (LTRG)", url: "https://www.nvoad.org/resources/training/", format: "Online / Free" },
      { name: "Disaster Case Management", url: "https://www.nvoad.org/resources/training/", format: "Online / Free" },
      { name: "Donations Management & Volunteer Coordination", url: "https://www.nvoad.org/resources/training/", format: "Online / Free" },
      { name: "Building a Local COAD", url: "https://www.nvoad.org/local-affiliates/", format: "Online / Free" },
    ],
  },
  {
    org: "NWCG / NIFC Wildland Fire Training",
    icon: "🔥",
    url: "https://www.nwcg.gov/training-courses",
    description: "The National Wildfire Coordinating Group (NWCG), coordinated through NIFC, offers standardized wildland fire training courses — from basic fire behavior and incident command to advanced wildland firefighter qualifications.",
    courses: [
      { name: "S-130: Firefighter Training", url: "https://www.nwcg.gov/training-courses/s-130", format: "In-person / Hybrid" },
      { name: "S-190: Intro to Wildland Fire Behavior", url: "https://www.nwcg.gov/training-courses/s-190", format: "Online / In-person" },
      { name: "ICS-100: Intro to Incident Command (Wildfire)", url: "https://www.nwcg.gov/training-courses/ics-100", format: "Online / Free" },
      { name: "L-180: Human Factors in the Wildland Fire Service", url: "https://www.nwcg.gov/training-courses/l-180", format: "Online / In-person" },
    ],
  },
];

export default function TrainingClasses() {
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-foreground mb-1">Training & Classes</h2>
        <p className="text-muted-foreground font-sans text-sm max-w-2xl">
          Build real skills before disaster strikes. These organizations offer courses in first aid, emergency response, animal rescue, and survival — many are free.
        </p>
      </div>

      <div className="space-y-3">
        {CLASSES.map((org) => {
          const isOpen = expanded === org.org;
          return (
            <div key={org.org} className="border border-border rounded bg-card overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : org.org)}
                className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{org.icon}</span>
                  <div>
                    <p className="font-sans font-semibold text-foreground text-sm">{org.org}</p>
                    <p className="text-xs text-muted-foreground font-sans line-clamp-1">{org.description}</p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-5 pt-4">
                  <p className="text-sm text-muted-foreground font-sans mb-4">{org.description}</p>
                  <div className="space-y-2">
                    {org.courses.map((c) => (
                      <a
                        key={c.name}
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 p-3 rounded border border-border/60 hover:border-primary/40 hover:bg-secondary/20 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                          <span className="text-sm font-sans font-medium text-foreground group-hover:text-primary transition-colors">{c.name}</span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded font-sans">{c.format}</span>
                          <ExternalLink className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </a>
                    ))}
                  </div>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-sans font-semibold text-primary hover:underline"
                  >
                    <Globe className="w-3 h-3" /> View all {org.org} courses
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded p-4">
        <p className="text-sm font-sans text-foreground">
          <strong>💡 Tip:</strong> FEMA's free online courses (IS-100, IS-200, IS-700) take 2–3 hours each and come with official certificates — a great starting point for any household.
        </p>
      </div>
    </div>
  );
}
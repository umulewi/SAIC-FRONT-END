import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { ReactNode } from "react";
import { getSections, getCollection } from "../lib/api";
import type {
  Sections,
  Stat,
  CoreValue,
  Service,
  ImpactArea,
  Program,
  Partner,
  TeamMember,
  SiteApp,
  Story,
  JobOpening,
} from "../types";

interface ContentState {
  sections: Sections | null;
  stats: Stat[];
  coreValues: CoreValue[];
  services: Service[];
  impactAreas: ImpactArea[];
  programs: Program[];
  partners: Partner[];
  team: TeamMember[];
  sitesApps: SiteApp[];
  stories: Story[];
  jobOpenings: JobOpening[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ContentContext = createContext<ContentState | null>(null);

export function ContentProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState<Sections | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [impactAreas, setImpactAreas] = useState<ImpactArea[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [sitesApps, setSitesApps] = useState<SiteApp[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [jobOpenings, setJobOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        sectionsData,
        statsData,
        coreValuesData,
        servicesData,
        impactAreasData,
        programsData,
        partnersData,
        teamData,
        sitesAppsData,
        storiesData,
        jobOpeningsData,
      ] = await Promise.all([
        getSections(),
        getCollection("stats"),
        getCollection("coreValues"),
        getCollection("services"),
        getCollection("impactAreas"),
        getCollection("programs"),
        getCollection("partners"),
        getCollection("team"),
        getCollection("sitesApps"),
        getCollection("stories"),
        getCollection("jobOpenings"),
      ]);
      setSections(sectionsData);
      setStats(statsData);
      setCoreValues(coreValuesData);
      setServices(servicesData);
      setImpactAreas(impactAreasData);
      setPrograms(programsData);
      setPartners(partnersData);
      setTeam(teamData);
      setSitesApps(sitesAppsData);
      setStories(storiesData);
      setJobOpenings(jobOpeningsData);
    } catch {
      setError("We couldn't load site content. Please try again shortly.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <ContentContext.Provider
      value={{
        sections,
        stats,
        coreValues,
        services,
        impactAreas,
        programs,
        partners,
        team,
        sitesApps,
        stories,
        jobOpenings,
        loading,
        error,
        refresh,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
}

export function useContent() {
  const ctx = useContext(ContentContext);
  if (!ctx) throw new Error("useContent must be used within ContentProvider");
  return ctx;
}

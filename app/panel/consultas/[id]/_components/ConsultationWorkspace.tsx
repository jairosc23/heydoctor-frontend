"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { NestConsultation } from "@/lib/services/consultations";
import type { OrdersSubTab } from "./OrdersTab";
import type {
  ActionBarHandlers,
  ActionBarLoading,
} from "@/lib/encounter/action-bar-types";
import { ClinicalSurface } from "@/components/clinical/design";
import type { ActionResult } from "@/lib/services/consultation-actions";
import { useIsMobile } from "@/lib/hooks/useIsMobile";
import {
  EncounterLeftPane,
  type EncounterLeftPaneTab,
} from "./EncounterLeftPane";
import {
  EncounterRightPane,
  type EncounterRightPaneTab,
} from "./EncounterRightPane";
import { MobileConsultationWorkspace } from "./MobileConsultationWorkspace";
import type { PatientContextRailProps } from "./PatientContextRail";
import { ClinicalContextPanels } from "./ClinicalContextPanels";
import type { ClinicalEncounterChartProps } from "./chart/ClinicalEncounterChart";
import { ClinicalNavigationRail } from "./ClinicalNavigationRail";
import { EncounterCarePathOffer } from "./EncounterCarePathOffer";
import {
  ENCOUNTER_CIC_ID,
  ENCOUNTER_HAB_ID,
  ENCOUNTER_OFFER_ID,
  buildClinicalNavigationIntelligence,
  isEncounterCarePathLandmark,
  isEncounterOfferLandmark,
  shouldExpandDisclosureForSectionId,
  type ClinicalNavigationSection,
} from "./clinical-navigation-rail-model";
import { useEncounterSectionNavigation } from "@/hooks/useEncounterSectionNavigation";
import { useEncounterHotPathObservability } from "./useEncounterHotPathObservability";

const EMPTY_NAV_SECTIONS: ClinicalNavigationSection[] = [];

/** Matches Tailwind `xl` — only one chart tree may mount at a time. */
const ENCOUNTER_SPLIT_BREAKPOINT_PX = 1280;

const DESKTOP_MODULE_WIDTH = "mx-auto w-full xl:max-w-[1280px]";

export type WorkspaceTab = "soap" | "orders" | "documents" | "chat";

export type { EncounterLeftPaneTab, EncounterRightPaneTab };

export interface ConsultationWorkspaceProps {
  consultation: NestConsultation;
  consultationId: string;
  clinicId: string | null;
  activeTab: WorkspaceTab;
  onTabChange: (tab: WorkspaceTab) => void;
  leftPaneTab: EncounterLeftPaneTab;
  onLeftPaneTabChange: (tab: EncounterLeftPaneTab) => void;
  rightPaneTab: EncounterRightPaneTab;
  onRightPaneTabChange: (tab: EncounterRightPaneTab) => void;
  ordersSubTab: OrdersSubTab;
  onOrdersSubTabChange: (tab: OrdersSubTab) => void;
  documentHandlers: ActionBarHandlers;
  documentLoading: ActionBarLoading;
  documentDisabled: Partial<Record<string, boolean>>;
  onLegacyInvoiceResult: (label: string, result: ActionResult) => void;
  diagnosisCode?: string;
  patientContext: PatientContextRailProps;
  ordersHighlight?: boolean;
  ordersRefreshKey?: number;
  ordersPanelExpandSignal?: number;
  actionWorkspaceEnabled?: boolean;
  smartWorkspaceEnabled?: boolean;
  encounterChart?: ClinicalEncounterChartProps | null;
}

export type MobileConsultationWorkspaceProps = Omit<
  ConsultationWorkspaceProps,
  | "leftPaneTab"
  | "onLeftPaneTabChange"
  | "rightPaneTab"
  | "onRightPaneTabChange"
  | "patientContext"
>;

export function ConsultationWorkspace({
  patientContext,
  leftPaneTab,
  onLeftPaneTabChange,
  rightPaneTab,
  onRightPaneTabChange,
  ordersHighlight,
  ordersRefreshKey,
  ordersPanelExpandSignal,
  actionWorkspaceEnabled = false,
  smartWorkspaceEnabled = false,
  encounterChart,
  ...props
}: ConsultationWorkspaceProps) {
  const {
    consultation,
    consultationId,
    activeTab,
    onTabChange,
    ordersSubTab,
    onOrdersSubTabChange,
    documentHandlers,
    documentLoading,
    documentDisabled,
    onLegacyInvoiceResult,
    diagnosisCode,
  } = props;
  const navigationIntelligence = useMemo(
    () =>
      encounterChart
        ? buildClinicalNavigationIntelligence(encounterChart)
        : null,
    [encounterChart],
  );
  const navigationSections =
    navigationIntelligence?.sections ?? EMPTY_NAV_SECTIONS;
  const navigationSectionIdKey = useMemo(
    () => navigationSections.map((section) => section.id).join("|"),
    [navigationSections],
  );
  const navigationSectionsRef = useRef(navigationSections);
  navigationSectionsRef.current = navigationSections;
  const [disclosureExpanded, setDisclosureExpanded] = useState(false);
  useEncounterHotPathObservability(Boolean(encounterChart));
  const [offerExpandNonce, setOfferExpandNonce] = useState(0);
  const [offerExpanded, setOfferExpanded] = useState(false);
  const isNarrowViewport = useIsMobile(ENCOUNTER_SPLIT_BREAKPOINT_PX);
  const offerExpandSignal = (ordersPanelExpandSignal ?? 0) + offerExpandNonce;
  const navigationSpySections = useMemo(
    () => [
      ...navigationSections,
      { id: ENCOUNTER_CIC_ID },
      { id: ENCOUNTER_OFFER_ID },
      { id: ENCOUNTER_HAB_ID },
    ],
    [navigationSections],
  );
  const { activeSectionId, navigateToSection } = useEncounterSectionNavigation(
    navigationSpySections,
    { enabled: Boolean(encounterChart) },
  );
  const chartWithDisclosure = useMemo(() => {
    if (!encounterChart) return encounterChart;
    return {
      ...encounterChart,
      disclosureExpanded,
      onDisclosureExpandedChange: setDisclosureExpanded,
      offerExpanded,
    };
  }, [encounterChart, disclosureExpanded, offerExpanded]);
  /**
   * Chart uses Tailwind `hidden` on non-soap tabs (display:none → no client rects).
   * Queue navigation until soap is laid out — never scroll a hidden node.
   */
  const [pendingSectionId, setPendingSectionId] = useState<string | null>(null);

  useEffect(() => {
    if (!navigationSectionIdKey) return;

    const syncDisclosureHash = () => {
      const sectionId = window.location.hash.replace(/^#/, "");
      if (isEncounterOfferLandmark(sectionId)) {
        setOfferExpandNonce((value) => value + 1);
        setPendingSectionId(sectionId);
        return;
      }
      if (isEncounterCarePathLandmark(sectionId)) {
        setPendingSectionId(sectionId);
        return;
      }
      if (
        !shouldExpandDisclosureForSectionId(
          navigationSectionsRef.current,
          sectionId,
        )
      ) {
        return;
      }
      setDisclosureExpanded(true);
      setPendingSectionId(sectionId);
    };

    syncDisclosureHash();
    window.addEventListener("hashchange", syncDisclosureHash);
    return () => window.removeEventListener("hashchange", syncDisclosureHash);
  }, [navigationSectionIdKey]);

  useEffect(() => {
    if (!pendingSectionId) return;
    const offerLandmark = isEncounterOfferLandmark(pendingSectionId);
    if (offerLandmark && isNarrowViewport) {
      if (activeTab !== "orders") return;
    } else if (activeTab !== "soap" || leftPaneTab !== "soap") {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryNavigate = () => {
      if (cancelled) return;
      attempts += 1;
      if (navigateToSection(pendingSectionId)) {
        setPendingSectionId(null);
        return;
      }
      if (attempts >= 12) {
        setPendingSectionId(null);
        return;
      }
      window.requestAnimationFrame(tryNavigate);
    };

    const timer = window.setTimeout(tryNavigate, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [
    activeTab,
    isNarrowViewport,
    leftPaneTab,
    navigateToSection,
    pendingSectionId,
  ]);

  const navigateToEncounterChartSection = useCallback(
    (sectionId: string) => {
      if (shouldExpandDisclosureForSectionId(navigationSections, sectionId)) {
        setDisclosureExpanded(true);
      }
      if (isEncounterOfferLandmark(sectionId)) {
        setOfferExpandNonce((value) => value + 1);
        if (isNarrowViewport) {
          if (activeTab !== "orders") onTabChange("orders");
          setPendingSectionId(sectionId);
          return;
        }
      }
      const needsWorkspaceSoap = activeTab !== "soap";
      const needsLeftSoap = leftPaneTab !== "soap";
      if (needsWorkspaceSoap) onTabChange("soap");
      if (needsLeftSoap) onLeftPaneTabChange("soap");
      if (needsWorkspaceSoap || needsLeftSoap) {
        setPendingSectionId(sectionId);
        return;
      }
      if (!navigateToSection(sectionId)) {
        setPendingSectionId(sectionId);
      }
    },
    [
      activeTab,
      isNarrowViewport,
      leftPaneTab,
      navigationSections,
      navigateToSection,
      onLeftPaneTabChange,
      onTabChange,
    ],
  );
  return (
    <div className="clinical-workspace" data-testid="clinical-workspace">
      {isNarrowViewport ? (
        <MobileConsultationWorkspace
          {...props}
          ordersPanelExpandSignal={offerExpandSignal}
          encounterChart={chartWithDisclosure}
          navigationSections={navigationSections}
          disclosureExpanded={disclosureExpanded}
          onDisclosureExpandedChange={setDisclosureExpanded}
          navigationProgress={navigationIntelligence?.progress}
          activeSectionId={activeSectionId}
          onNavigateSection={navigateToEncounterChartSection}
          ordersHighlight={ordersHighlight}
          ordersRefreshKey={ordersRefreshKey}
          smartWorkspaceEnabled={smartWorkspaceEnabled}
        />
      ) : (
        <div
          className="space-y-hd-4"
          data-testid="encounter-split-layout"
          data-clinical-action-workspace={
            actionWorkspaceEnabled ? "true" : undefined
          }
          data-columns="1"
        >
          <div
            className={`grid gap-hd-3 xl:grid-cols-[minmax(176px,220px)_minmax(0,1fr)] ${DESKTOP_MODULE_WIDTH}`}
          >
            <ClinicalNavigationRail
              sections={navigationSections}
              progress={navigationIntelligence?.progress}
              activeSectionId={activeSectionId}
              onNavigate={navigateToEncounterChartSection}
              disclosureExpanded={disclosureExpanded}
              onDisclosureExpandedChange={setDisclosureExpanded}
            />
            <div className="min-w-0 space-y-hd-4">
              <ClinicalContextPanels
                {...patientContext}
                smartWorkspaceEnabled={smartWorkspaceEnabled}
              />
              <div
                data-smart-workspace={
                  smartWorkspaceEnabled ? "true" : undefined
                }
              >
                <ClinicalSurface
                  depth={3}
                  focusPrimary
                  className="soap-command-center-shell clinical-focus-primary min-w-0 p-hd-3 shadow-hd-3 ring-1 ring-primary/10"
                >
                  <EncounterLeftPane
                    consultation={consultation}
                    consultationId={consultationId}
                    activeTab={leftPaneTab}
                    onTabChange={onLeftPaneTabChange}
                    encounterChart={
                      chartWithDisclosure
                        ? {
                            ...chartWithDisclosure,
                            afterSoap: (
                              <EncounterCarePathOffer
                                expandSignal={offerExpandSignal}
                                onExpandedChange={setOfferExpanded}
                              >
                                <EncounterRightPane
                                  patientId={consultation.patientId}
                                  consultationId={consultationId}
                                  activeTab={rightPaneTab}
                                  onTabChange={onRightPaneTabChange}
                                  ordersSubTab={ordersSubTab}
                                  onOrdersSubTabChange={onOrdersSubTabChange}
                                  diagnosisCode={diagnosisCode}
                                  documentHandlers={documentHandlers}
                                  documentLoading={documentLoading}
                                  documentDisabled={documentDisabled}
                                  onLegacyInvoiceResult={onLegacyInvoiceResult}
                                  ordersHighlight={ordersHighlight}
                                  ordersRefreshKey={ordersRefreshKey}
                                />
                              </EncounterCarePathOffer>
                            ),
                          }
                        : null
                    }
                  />
                </ClinicalSurface>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { create } from "zustand";
import type { BuildingType, ModalId } from "@/types/game";

interface UiState {
  /** Currently selected building on the village board. */
  selected: BuildingType | null;
  /** Stack-free single modal — the game only ever shows one at a time. */
  modal: ModalId | null;
  /** Building the upgrade/info/quest modal is scoped to. */
  modalTarget: BuildingType | null;
  /** Village camera. */
  zoom: number;
  pan: { x: number; y: number };
  /** Onboarding step-8 camera fly-in has finished. */
  introDone: boolean;
  /**
   * True once the player changes zoom themselves — after that the board stops
   * auto-fitting on resize so we never yank the camera out from under them.
   */
  userZoomed: boolean;

  select: (type: BuildingType | null) => void;
  /** Auto-fit applied by the canvas; ignored once `userZoomed` is set. */
  fitZoom: (z: number) => void;
  openModal: (id: ModalId, target?: BuildingType | null) => void;
  closeModal: () => void;
  setZoom: (z: number) => void;
  nudgeZoom: (delta: number) => void;
  setPan: (p: { x: number; y: number }) => void;
  resetCamera: () => void;
  markIntroDone: () => void;
}

export const MIN_ZOOM = 0.5;
export const MAX_ZOOM = 2.4;

export const useUi = create<UiState>((set, get) => ({
  selected: null,
  modal: null,
  modalTarget: null,
  zoom: 1,
  pan: { x: 0, y: 0 },
  introDone: false,
  userZoomed: false,

  select: (type) => set({ selected: type }),

  fitZoom: (z) => {
    if (get().userZoomed) return;
    set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)) });
  },

  /**
   * `target` scopes the modal to one building (the radial menu passes it).
   * Callers that omit it — the bottom HUD, cross-modal links — always get the
   * unscoped view; inheriting the current selection would silently open an
   * empty quest board when a building with no quests happened to be selected.
   */
  openModal: (id, target = null) => set({ modal: id, modalTarget: target }),

  closeModal: () => set({ modal: null, modalTarget: null }),

  setZoom: (z) =>
    set({ zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z)), userZoomed: true }),

  nudgeZoom: (delta) =>
    set({
      zoom: Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, get().zoom + delta)),
      userZoomed: true,
    }),

  setPan: (p) => set({ pan: p }),

  /** Recentre and hand control back to auto-fit. */
  resetCamera: () => set({ pan: { x: 0, y: 0 }, userZoomed: false }),

  markIntroDone: () => set({ introDone: true }),
}));

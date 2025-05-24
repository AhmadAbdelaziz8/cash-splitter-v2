import { useState, useEffect, useCallback } from "react";
import { ReceiptItem, PersonSummary } from "@/types";

export interface BillSplitterState {
  items: ReceiptItem[];
  people: string[];
  activePersonIndex: number;
  newPersonName: string;
  showSplitSummary: boolean;
}

export interface BillSplitterActions {
  setItems: (items: ReceiptItem[]) => void;
  addPerson: () => void;
  setNewPersonName: (name: string) => void;
  setActivePersonIndex: (index: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleSplitSummary: () => void;
  calculateSplitSummary: () => PersonSummary[];
  calculateTotal: () => number;
}

export const useBillSplitter = (initialItems: ReceiptItem[]) => {
  const [state, setState] = useState<BillSplitterState>({
    items: initialItems,
    people: ["You"],
    activePersonIndex: 0,
    newPersonName: "",
    showSplitSummary: false,
  });

  // Sync with external items
  useEffect(() => {
    setState((prev) => ({ ...prev, items: initialItems }));
  }, [initialItems]);

  const setItems = useCallback((items: ReceiptItem[]) => {
    setState((prev) => ({ ...prev, items }));
  }, []);

  const addPerson = useCallback(() => {
    if (
      state.newPersonName.trim() &&
      !state.people.includes(state.newPersonName.trim())
    ) {
      setState((prev) => ({
        ...prev,
        people: [...prev.people, prev.newPersonName.trim()],
        newPersonName: "",
      }));
    }
  }, [state.newPersonName, state.people]);

  const setNewPersonName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, newPersonName: name }));
  }, []);

  const setActivePersonIndex = useCallback((index: number) => {
    setState((prev) => ({ ...prev, activePersonIndex: index }));
  }, []);

  const toggleItemSelection = useCallback(
    (itemId: string) => {
      const currentPerson = state.people[state.activePersonIndex];

      setState((prev) => ({
        ...prev,
        items: prev.items.map((item) => {
          if (item.id === itemId) {
            const isCurrentlyAssigned = item.assignedTo.includes(currentPerson);
            return {
              ...item,
              assignedTo: isCurrentlyAssigned
                ? item.assignedTo.filter((person) => person !== currentPerson)
                : [...item.assignedTo, currentPerson],
            };
          }
          return item;
        }),
      }));
    },
    [state.people, state.activePersonIndex]
  );

  const toggleSplitSummary = useCallback(() => {
    setState((prev) => ({ ...prev, showSplitSummary: !prev.showSplitSummary }));
  }, []);

  const calculateSplitSummary = useCallback((): PersonSummary[] => {
    return state.people.map((person) => {
      const assignedItems = state.items.filter((item) =>
        item.assignedTo.includes(person)
      );

      const amount = assignedItems.reduce((sum, item) => {
        const shareCount = item.assignedTo.length;
        return sum + (shareCount > 0 ? item.price / shareCount : 0);
      }, 0);

      return {
        name: person,
        amount,
        items: assignedItems.map((item) => item.name),
      };
    });
  }, [state.items, state.people]);

  const calculateTotal = useCallback((): number => {
    return state.items.reduce((sum, item) => sum + item.price, 0);
  }, [state.items]);

  const actions: BillSplitterActions = {
    setItems,
    addPerson,
    setNewPersonName,
    setActivePersonIndex,
    toggleItemSelection,
    toggleSplitSummary,
    calculateSplitSummary,
    calculateTotal,
  };

  return {
    state,
    actions,
  };
};

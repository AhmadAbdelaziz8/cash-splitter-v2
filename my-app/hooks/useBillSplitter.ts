import { useState, useEffect, useCallback } from "react";
import { ContextReceiptItem, PersonSummary } from "@/types";

export interface BillSplitterState {
  items: ContextReceiptItem[];
  people: string[];
  activePersonIndex: number;
  newPersonName: string;
  showSplitSummary: boolean;
}

export interface BillSplitterActions {
  setItems: (items: ContextReceiptItem[]) => void;
  addPerson: () => void;
  setNewPersonName: (name: string) => void;
  setActivePersonIndex: (index: number) => void;
  toggleItemSelection: (itemId: string) => void;
  toggleSplitSummary: () => void;
  calculateSplitSummary: (
    tax: string | null,
    service: number | null
  ) => PersonSummary[];
  calculateTotal: () => number;
}

export const useBillSplitter = (initialItems: ContextReceiptItem[]) => {
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

  const setItems = useCallback((items: ContextReceiptItem[]) => {
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
                ? item.assignedTo.filter(
                    (person: string) => person !== currentPerson
                  )
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

  const calculateSplitSummary = useCallback(
    (tax: string | null, service: number | null): PersonSummary[] => {
      // Calculate tax percentage
      const taxPercentage =
        tax && tax.includes("%") ? parseFloat(tax.replace("%", "")) / 100 : 0;
      // Service is divided equally among all people
      const servicePerPerson = service ? service / state.people.length : 0;

      return state.people.map((person) => {
        const assignedItems = state.items.filter((item) =>
          item.assignedTo.includes(person)
        );

        // Calculate subtotal for this person's items
        const personSubtotal = assignedItems.reduce((sum, item) => {
          const shareCount = item.assignedTo.length;
          return (
            sum +
            (shareCount > 0 ? (item.price * item.quantity) / shareCount : 0)
          );
        }, 0);

        // Calculate tax on this person's items (percentage of their subtotal)
        const personTax = personSubtotal * taxPercentage;

        // Total amount = subtotal + tax + equal share of service
        const totalAmount = personSubtotal + personTax + servicePerPerson;

        return {
          name: person,
          amount: totalAmount,
          items: assignedItems.map((item) => item.name),
          subtotal: personSubtotal,
          tax: personTax,
          service: servicePerPerson,
        };
      });
    },
    [state.items, state.people]
  );

  const calculateTotal = useCallback((): number => {
    return state.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
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

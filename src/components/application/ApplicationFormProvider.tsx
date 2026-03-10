"use client";

import { createContext, useContext } from "react";
import { useForm } from "@tanstack/react-form";
import type { NewAnswer } from "../../types/db/answers";

//allow multiples pages to view same form data
const ApplicationFormContext = createContext<unknown>(null);

export const ApplicationFormProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  //create tanstack form and state obj to track form vals
  const form = useForm({
    defaultValues: {} as NewAnswer,
  });

  return (
    //give all components thbat are wrapped access to same form state
    <ApplicationFormContext.Provider value={form}>
      {children}
    </ApplicationFormContext.Provider>
  );
};

//shortcut to access form easier
export const useApplicationForm = () => {
  return useContext(ApplicationFormContext);
};

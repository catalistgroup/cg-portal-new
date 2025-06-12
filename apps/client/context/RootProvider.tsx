"use client";
import { UserType } from "@/lib/types";
import React, { createContext, ReactNode, useContext } from "react";

type Provider = {
  user: UserType;
};

const RootContext = createContext<Provider>({} as Provider);

type Props = {
  user: UserType;
  children: ReactNode;
};

function RootProvider({ user, children }: Props) {
  return (
    <RootContext.Provider value={{ user }}>{children}</RootContext.Provider>
  );
}

export default RootProvider;

export const useRoot = () => useContext(RootContext);

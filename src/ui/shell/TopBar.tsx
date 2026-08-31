import React from "react";
import { VesselHeader, VesselHeaderProps } from "../components/VesselHeader";

export type TopBarProps = VesselHeaderProps;

export function TopBar(props: TopBarProps) {
  return <VesselHeader {...props} />;
}

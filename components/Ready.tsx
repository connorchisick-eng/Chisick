"use client";
import { useEffect } from "react";

export function Ready() {
  useEffect(() => {
    document.body.classList.add("ready");
  }, []);
  return null;
}

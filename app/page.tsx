"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import RightPane from "@/components/RightPane";
import ChatDock from "@/components/ChatDock";
import ResizableLayout from "@/components/ResizableLayout";
import { useAppStore } from "@/lib/store";

export default function Page() {
  const { isGraphMaximized } = useAppStore();

  if (isGraphMaximized) {
    return (
      <main className="fixed inset-0 z-50 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        <Canvas />
      </main>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 min-h-0 p-2">
        <ResizableLayout>
          <Sidebar />
          <section className="card p-0 overflow-hidden h-full">
            <Canvas />
          </section>
          <RightPane />
        </ResizableLayout>
      </div>
      <div className="flex-shrink-0 p-2 pt-0">
        <ChatDock />
      </div>
    </div>
  );
}

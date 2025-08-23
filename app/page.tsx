"use client";
import React from "react";
import Sidebar from "@/components/Sidebar";
import Canvas from "@/components/Canvas";
import RightPane from "@/components/RightPane";
import ChatDock from "@/components/ChatDock";

export default function Page() {
  return (
    <main className="p-2">
      <div className="container-3pane">
        <Sidebar />
        <section className="card p-2">
          <Canvas />
        </section>
        <RightPane />
        <ChatDock />
      </div>
    </main>
  );
}

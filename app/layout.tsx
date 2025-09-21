import "./../styles/globals.css";
import { ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { WorkspaceProvider } from "@/contexts/workspace-context";

export const metadata = {
  title: "Idea ICE - Validate Your Ideas",
  description: "Capture, prioritize, and validate your ideas with ICE scoring methodology",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-dvh bg-background text-foreground">
        <WorkspaceProvider>
          {children}
        </WorkspaceProvider>
        <Toaster />
      </body>
    </html>
  );
}

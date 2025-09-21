"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, MoreHorizontal, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

// Demo data
const demoIdeas = [
  {
    id: "1",
    title: "AI-Powered Customer Support Chatbot",
    description: "Implement an intelligent chatbot to handle common customer inquiries and reduce support ticket volume.",
    impact: 8,
    confidence: 7,
    effort: 6,
    iceScore: 9.33,
    status: "VALIDATED",
    createdAt: "2024-01-15T10:00:00Z"
  },
  {
    id: "2", 
    title: "Mobile App Dark Mode",
    description: "Add dark mode theme option to improve user experience and reduce eye strain during night usage.",
    impact: 6,
    confidence: 9,
    effort: 3,
    iceScore: 18.0,
    status: "VALIDATING",
    createdAt: "2024-01-14T14:30:00Z"
  },
  {
    id: "3",
    title: "Advanced Analytics Dashboard",
    description: "Create comprehensive analytics dashboard with real-time metrics and customizable reports.",
    impact: 9,
    confidence: 6,
    effort: 8,
    iceScore: 6.75,
    status: "PENDING",
    createdAt: "2024-01-13T09:15:00Z"
  },
  {
    id: "4",
    title: "Social Media Integration",
    description: "Allow users to share content directly to social media platforms with one-click posting.",
    impact: 5,
    confidence: 8,
    effort: 4,
    iceScore: 10.0,
    status: "ARCHIVED",
    createdAt: "2024-01-12T16:45:00Z"
  }
];

const getScoreColor = (score: number) => {
  if (score >= 10) return "text-green-600 bg-green-50";
  if (score >= 7) return "text-yellow-600 bg-yellow-50";
  if (score >= 4) return "text-orange-600 bg-orange-50";
  return "text-red-600 bg-red-50";
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "VALIDATED": return "bg-green-100 text-green-800";
    case "VALIDATING": return "bg-blue-100 text-blue-800";
    case "PENDING": return "bg-gray-100 text-gray-800";
    case "ARCHIVED": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "VALIDATED": return <CheckCircle className="h-3 w-3" />;
    case "VALIDATING": return <Clock className="h-3 w-3" />;
    case "PENDING": return <TrendingUp className="h-3 w-3" />;
    default: return null;
  }
};

export default function DemoPage() {
  const [sortField, setSortField] = useState<string>("iceScore");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const sortedIdeas = [...demoIdeas].sort((a, b) => {
    const aValue = a[sortField as keyof typeof a];
    const bValue = b[sortField as keyof typeof b];
    
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc" 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    
    return 0;
  });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Demo Workspace</h1>
                <p className="text-sm text-muted-foreground">Explore the Idea ICE interface</p>
              </div>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Idea
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Ideas ({demoIdeas.length})</h2>
            <p className="text-sm text-muted-foreground">
              This is a demo showing the enhanced idea table with sorting, actions, and visual indicators.
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th 
                    className="text-left py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("title")}
                  >
                    Title {sortField === "title" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("impact")}
                  >
                    Impact {sortField === "impact" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("confidence")}
                  >
                    Confidence {sortField === "confidence" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("effort")}
                  >
                    Effort {sortField === "effort" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("iceScore")}
                  >
                    ICE Score {sortField === "iceScore" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th 
                    className="text-center py-3 px-4 font-medium cursor-pointer hover:bg-gray-50"
                    onClick={() => handleSort("status")}
                  >
                    Status {sortField === "status" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th className="text-center py-3 px-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedIdeas.map((idea) => (
                  <tr key={idea.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium">{idea.title}</div>
                        <div className="text-sm text-muted-foreground mt-1 max-w-md">
                          {idea.description}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-800 text-sm font-medium">
                        {idea.impact}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                        {idea.confidence}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-orange-100 text-orange-800 text-sm font-medium">
                        {idea.effort}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${getScoreColor(idea.iceScore)}`}>
                        {idea.iceScore.toFixed(1)}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Badge className={`${getStatusColor(idea.status)} flex items-center gap-1`}>
                        {getStatusIcon(idea.status)}
                        {idea.status.toLowerCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Demo Features Showcase:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Sortable Columns:</strong> Click any column header to sort</li>
              <li>• <strong>Color-coded Scores:</strong> Impact (blue), Confidence (green), Effort (orange)</li>
              <li>• <strong>ICE Score Highlighting:</strong> Green (high priority), Yellow/Orange (medium/low)</li>
              <li>• <strong>Status Indicators:</strong> Icons and colors for different validation stages</li>
              <li>• <strong>Row Actions:</strong> Three-dot menu for edit, duplicate, delete operations</li>
              <li>• <strong>Responsive Design:</strong> Works on mobile and desktop</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}

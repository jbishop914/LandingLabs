import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Plus,
  Layers,
  Type,
  Image,
  Crown,
  Clock,
  ArrowRight,
  LogOut,
  Settings,
} from "lucide-react";
import type { Project, User } from "@shared/schema";

export default function DashboardPage() {
  const [, navigate] = useLocation();

  const { data: user } = useQuery<User>({
    queryKey: ["/api/auth/me"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/auth/me");
      return res.json();
    },
  });

  const { data: projects, isLoading: loadingProjects } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/projects");
      return res.json();
    },
  });

  const isTrial = user?.subscriptionStatus === "trial";

  return (
    <div className="min-h-screen bg-gray-950" data-testid="dashboard-page">
      {/* Top nav */}
      <header className="border-b border-white/8 bg-gray-950/80 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-white font-semibold text-lg tracking-tight">LandingLabs</span>
          </div>
          <div className="flex items-center gap-4">
            {isTrial && (
              <Badge variant="outline" className="border-amber-500/40 text-amber-400 gap-1.5 py-1">
                <Clock className="w-3 h-3" />
                Trial
              </Badge>
            )}
            <span className="text-white/50 text-sm">{user?.username}</span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white"
              onClick={() => navigate("/settings")}
              data-testid="settings-button"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-white"
              onClick={async () => {
                await apiRequest("POST", "/api/auth/logout");
                navigate("/");
              }}
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome section */}
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-white mb-1">
            Welcome back{user?.username ? `, ${user.username}` : ""}
          </h1>
          <p className="text-white/40 text-sm">
            Build and manage your particle backgrounds
          </p>
        </div>

        {/* Builders grid */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-white mb-4">Builders</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <BuilderCard
              icon={<Layers className="w-6 h-6" />}
              title="Particle Background"
              description="Three.js particle animations with full visual controls"
              available
              onClick={() => navigate("/builder")}
              testId="builder-particle"
            />
            <BuilderCard
              icon={<Type className="w-6 h-6" />}
              title="3D Text"
              description="Animated 3D typography with dissolve, explode, collapse effects"
              available={false}
              testId="builder-text"
            />
            <BuilderCard
              icon={<Image className="w-6 h-6" />}
              title="Image Particles"
              description="Transform images into particle-driven animations"
              available={false}
              testId="builder-image"
            />
            <BuilderCard
              icon={<Crown className="w-6 h-6" />}
              title="Full Page"
              description="Complete landing page with auth card, particles, and code"
              available={false}
              premium
              testId="builder-full"
            />
          </div>
        </div>

        {/* Recent projects */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Your Projects</h2>
            <Button
              size="sm"
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium gap-1.5"
              onClick={() => navigate("/builder")}
              data-testid="new-project-button"
            >
              <Plus className="w-3.5 h-3.5" />
              New project
            </Button>
          </div>

          {loadingProjects ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 rounded-xl bg-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-4">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-white/5 border-white/8 hover:bg-white/8 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/builder?project=${project.id}`)}
                  data-testid={`project-card-${project.id}`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-base font-medium">
                        {project.name}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          project.status === "completed"
                            ? "border-green-500/30 text-green-400"
                            : "border-amber-500/30 text-amber-400"
                        }
                      >
                        {project.status === "completed" ? "Done" : "In progress"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-white/30 text-sm mb-3">
                      {project.sourceUrl ? `Source: ${project.sourceUrl}` : "Custom background"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-white/20 text-xs">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-cyan-400 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 border border-dashed border-white/10 rounded-xl">
              <Layers className="w-10 h-10 text-white/15 mx-auto mb-4" />
              <h3 className="text-white/50 font-medium mb-1">No projects yet</h3>
              <p className="text-white/25 text-sm mb-4">
                Create your first particle background
              </p>
              <Button
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-black font-medium"
                onClick={() => navigate("/builder")}
                data-testid="empty-state-cta"
              >
                Start building
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-20 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <span className="text-white/20 text-xs">LandingLabs</span>
          <a
            href="https://www.perplexity.ai/computer"
            target="_blank"
            rel="noopener noreferrer"
            className="text-white/20 text-xs hover:text-white/40 transition-colors"
          >
            Created with Perplexity Computer
          </a>
        </div>
      </footer>
    </div>
  );
}

function BuilderCard({
  icon,
  title,
  description,
  available,
  premium,
  onClick,
  testId,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  premium?: boolean;
  onClick?: () => void;
  testId: string;
}) {
  return (
    <Card
      className={`border-white/8 transition-all cursor-pointer ${
        available
          ? "bg-white/5 hover:bg-white/8 hover:border-cyan-500/30"
          : "bg-white/2 opacity-60 cursor-not-allowed"
      }`}
      onClick={available ? onClick : undefined}
      data-testid={testId}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-3">
          <div className={available ? "text-cyan-400" : "text-white/25"}>{icon}</div>
          {premium && (
            <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
              Premium
            </Badge>
          )}
          {!available && !premium && (
            <Badge variant="outline" className="border-white/10 text-white/30 text-xs">
              Coming soon
            </Badge>
          )}
        </div>
        <h3 className="text-white font-medium mb-1">{title}</h3>
        <p className="text-white/35 text-sm leading-relaxed">{description}</p>
      </CardContent>
    </Card>
  );
}

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import aiService from "../../services/aiServices";
import toast from "react-hot-toast";
import {
  BookOpen,
  Lightbulb,
  Sparkles,
  ExternalLink,
  Link2,
  FileText,
  Video,
  GraduationCap,
  BookMarked,
  Wrench,
  Code,
  RefreshCw,
} from "lucide-react";
import Modal from "../common/Modal";
import MarkDownRenderer from "../common/MarkDownRenderer";

const RESOURCE_TYPE_CONFIG = {
  article: {
    icon: FileText,
    gradient: "from-blue-500 to-cyan-500",
    bg: "from-blue-50 to-cyan-50",
    border: "border-blue-200/60",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-700",
  },
  video: {
    icon: Video,
    gradient: "from-red-500 to-pink-500",
    bg: "from-red-50 to-pink-50",
    border: "border-red-200/60",
    text: "text-red-700",
    badge: "bg-red-100 text-red-700",
  },
  course: {
    icon: GraduationCap,
    gradient: "from-purple-500 to-violet-500",
    bg: "from-purple-50 to-violet-50",
    border: "border-purple-200/60",
    text: "text-purple-700",
    badge: "bg-purple-100 text-purple-700",
  },
  documentation: {
    icon: Code,
    gradient: "from-emerald-500 to-teal-500",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200/60",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
  },
  tutorial: {
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-500",
    bg: "from-amber-50 to-orange-50",
    border: "border-amber-200/60",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-700",
  },
  book: {
    icon: BookMarked,
    gradient: "from-indigo-500 to-blue-500",
    bg: "from-indigo-50 to-blue-50",
    border: "border-indigo-200/60",
    text: "text-indigo-700",
    badge: "bg-indigo-100 text-indigo-700",
  },
  tool: {
    icon: Wrench,
    gradient: "from-slate-500 to-gray-500",
    bg: "from-slate-50 to-gray-50",
    border: "border-slate-200/60",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-700",
  },
};

function ResourceCard({ resource }) {
  const config =
    RESOURCE_TYPE_CONFIG[resource.type] || RESOURCE_TYPE_CONFIG.article;
  const Icon = config.icon;

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group block p-4 bg-gradient-to-br ${config.bg} rounded-xl border ${config.border} hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-9 h-9 shrink-0 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-4 h-4 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h5 className="text-sm font-semibold text-slate-900 truncate group-hover:text-slate-700 transition-colors">
              {resource.title}
            </h5>
            <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          {resource.description && (
            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-2">
              {resource.description}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${config.badge}`}
            >
              {resource.type}
            </span>
            <span className="text-[11px] text-slate-400 truncate max-w-[200px]">
              {resource.url.replace(/^https?:\/\//, "").split("/")[0]}
            </span>
          </div>
        </div>
      </div>
    </a>
  );
}

function ResourceSkeleton() {
  return (
    <div className="p-4 bg-gradient-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 shrink-0 rounded-lg bg-slate-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-slate-200 rounded w-3/4" />
          <div className="h-3 bg-slate-200 rounded w-full" />
          <div className="h-3 bg-slate-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-4 bg-slate-200 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AiAction() {
  const { id: documentId } = useParams();
  const [loadingAction, setLoadingAction] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [concept, setConcept] = useState("");

  const [resources, setResources] = useState([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [resourcesError, setResourcesError] = useState(null);

  useEffect(() => {
    if (documentId) {
      fetchRelativeResources();
    }
  }, [documentId]);

  const fetchRelativeResources = async () => {
    setResourcesLoading(true);
    setResourcesError(null);
    try {
      const data = await aiService.generateRelative(documentId, 2);
      setResources(data.resources || []);
    } catch (error) {
      console.error(error);
      setResourcesError("Failed to load related resources.");
    } finally {
      setResourcesLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoadingAction("summary");

    try {
      const { summary } = await aiService.generateSummary(documentId);
      setModalTitle("Generated Summary");
      setModalContent(summary);
      setIsModalOpen(true);
    } catch (error) {
      console.log(error);
      toast.error("Failed to generate summary.");
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExplainConcept = async (e) => {
    e.preventDefault();
    if (!concept.trim()) {
      toast.error("Please enter a concept to explain.");
      return;
    }

    setLoadingAction("explain");
    try {
      const { explanation } = await aiService.explainConcept(
        documentId,
        concept,
      );
      setModalTitle(`Explanation of "${concept}"`);
      setModalContent(explanation);
      setIsModalOpen(true);
      setConcept("");
    } catch (error) {
      console.log(error);
      toast.error("Failed to explain concept.");
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <>
      <div className="bg-white-80 backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200/60 bg-linear-to-br from-slate-50/50 to-white/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-linear-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-purple-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                AI Assistant
              </h3>
              <p className="text-xs text-slate-500">Powered by advanced AI</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Generate Summary */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-linear-to-br from-blue-100 to-cyan-100">
                    <BookOpen
                      className="w-4 h-4 text-blue-600"
                      strokeWidth={2}
                    />
                  </div>
                  <h4 className="text-slate-900 font-semibold">
                    Generate Summary
                  </h4>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Get a concise summary of the entire document.
                </p>
              </div>
              <button
                onClick={handleGenerateSummary}
                disabled={loadingAction === "summary"}
                className="h-10 px-5 shrink-0 bg-linear-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-600 text-sm text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loadingAction === "summary" ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </span>
                ) : (
                  "Summarize"
                )}
              </button>
            </div>
          </div>

          {/* Explain concept  */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <form onSubmit={handleExplainConcept}>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-amber-100 to-orange-100 flex items-center justify-center">
                  <Lightbulb
                    className="w-4 h-4 text-amber-600"
                    strokeWidth={2}
                  />
                </div>
                <h4 className="text-slate-900 font-semibold">
                  Explain a Concept
                </h4>
              </div>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed">
                Enter a topic or concept from the document to get a detailed
                explanation.
              </p>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={concept}
                  onChange={(e) => setConcept(e.target.value)}
                  placeholder=""
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:bg-white focus:shadow-lg focus:shadow-purple-500/10"
                  disabled={loadingAction === "explain"}
                />
                <button
                  type="submit"
                  disabled={loadingAction === "explain" || !concept.trim()}
                  className="h-11 shrink-0 px-5 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-600 hover:to-emerald-600 text-sm text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                >
                  {loadingAction === "explain" ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    "Explain"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Related Resources */}
          <div className="group p-5 bg-linear-to-br from-slate-50/50 to-white rounded-xl border border-slate-200/60 hover:border-slate-300/60 hover:shadow-md transition-all duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-100 to-purple-100 flex items-center justify-center">
                  <Link2 className="w-4 h-4 text-violet-600" strokeWidth={2} />
                </div>
                <div>
                  <h4 className="text-slate-900 font-semibold">
                    Related Resources
                  </h4>
                  <p className="text-xs text-slate-500">
                    Curated learning materials for this topic
                  </p>
                </div>
              </div>
              <button
                onClick={fetchRelativeResources}
                disabled={resourcesLoading}
                className="h-9 px-4 shrink-0 flex items-center gap-2 bg-linear-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-xs text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-violet-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${resourcesLoading ? "animate-spin" : ""}`}
                  strokeWidth={2.5}
                />
                {resourcesLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            {/* Resources Grid */}
            {resourcesLoading && resources.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <ResourceSkeleton key={i} />
                ))}
              </div>
            ) : resourcesError ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-3">
                  <Link2 className="w-5 h-5 text-red-500" />
                </div>
                <p className="text-sm text-slate-600 mb-3">{resourcesError}</p>
                <button
                  onClick={fetchRelativeResources}
                  className="text-sm text-violet-600 hover:text-violet-700 font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : resources.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {resources.map((resource, index) => (
                  <ResourceCard key={index} resource={resource} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Link2 className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">
                  No related resources found.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Result Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        <div className="max-h-[60vh] overflow-y-auto prose prose-sm max-w-none prose-slate">
          <MarkDownRenderer content={modalContent} />
        </div>
      </Modal>
    </>
  );
}

import React, { useEffect, useState } from "react";
import documentService from "../../services/documentService";
import aiService from "../../services/aiServices";
import toast from "react-hot-toast";
import Button from "../../components/common/Button";
import {
  FileText,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
  ExternalLink,
  Globe,
  Sparkles,
  FileDown,
  AlertCircle,
} from "lucide-react";
import Spinner from "../../components/common/Spinner";
import DocumentCard from "../../components/documents/DocumentCard";

export default function DocumentListPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState();
  const [deleting, setDeleting] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(false);

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchDocuments = async () => {
    try {
      const data = await documentService.getDocuments();
      setDocuments(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
      setUploadTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle) {
      toast.error("Please provide a title and select a file.");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("title", uploadTitle);

    try {
      await documentService.uploadDocument(formData);
      toast.success("Document uploaded successfully!");
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadTitle("");
      setLoading(true);
      fetchDocuments();
    } catch (error) {
      toast.error(error.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  // --- Search validation & handler ---
  const validateSearch = (value) => {
    const trimmed = value.trim();
    if (!trimmed) {
      setSearchError("");
      return false;
    }
    if (trimmed.length < 2) {
      setSearchError("Please enter at least 2 characters");
      return false;
    }
    if (trimmed.length > 200) {
      setSearchError("Search query is too long (max 200 characters)");
      return false;
    }
    setSearchError("");
    return true;
  };

  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    validateSearch(value);
  };

  const isSearchDisabled =
    !searchQuery.trim() || searchQuery.trim().length < 2 || searching;

  const handleSearchDocument = async (e) => {
    e?.preventDefault();

    if (!validateSearch(searchQuery)) return;

    setSearching(true);
    setSearchResults([]);
    setHasSearched(true);

    try {
      const results = await aiService.searchNewDocument(searchQuery.trim());
      setSearchResults(results || []);
      if (!results || results.length === 0) {
        toast("No documents found. Try a different keyword.", { icon: "📭" });
      }
    } catch (error) {
      toast.error(error.message || "Search failed. Please try again.");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchError("");
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && !isSearchDisabled) {
      handleSearchDocument(e);
    }
  };

  // Extract a readable name from a raw PDF URL/text
  const extractPdfName = (rawText) => {
    const trimmed = rawText.trim();
    // Try to extract URL
    const urlMatch = trimmed.match(/https?:\/\/[^\s)]+/);
    if (urlMatch) {
      const url = urlMatch[0];
      try {
        const pathname = new URL(url).pathname;
        const filename = pathname.split("/").pop();
        if (filename && filename.endsWith(".pdf")) {
          return decodeURIComponent(
            filename.replace(/_/g, " ").replace(/-/g, " "),
          );
        }
      } catch {
        // ignore
      }
      return url;
    }
    return trimmed;
  };

  const extractUrl = (rawText) => {
    const urlMatch = rawText.trim().match(/https?:\/\/[^\s)]+/);
    return urlMatch ? urlMatch[0] : null;
  };

  const handleDeleteRequest = (doc) => {
    setSelectedDoc(doc);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedDoc) return;
    setDeleting(true);
    try {
      await documentService.deleteDocument(selectedDoc._id);
      toast.success(`${selectedDoc.title} deleted.`);
      setIsDeleteModalOpen(false);
      setSelectedDoc(null);
      setDocuments(documents.filter((d) => d._id !== selectedDoc._id));
    } catch (error) {
      toast.error(error.message || "Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner />
        </div>
      );
    }

    if (documents.length === 0) {
      return (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-linear-to-br from-slate-100 to-slate-200 shadow-lg shadow-slate-200/50 mb-6">
              <FileText
                className="text-slate-400 w-10 h-10"
                strokeWidth={1.5}
              />
            </div>
            <h3 className="text-xl font-medium text-slate-900 tracking-tight mb-2">
              No Documents yet
            </h3>
            <p className="text-sm text-slate-500 mb-6">
              Get started by uploading your first PDF document to begin
              learning.
            </p>
            <button
              className="inline-flex items-center gap-2 px-6 py-2 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 active:scale-[0.98]"
              onClick={() => setIsUploadModalOpen(true)}
            >
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {documents?.map((doc) => (
          <DocumentCard
            key={doc._id}
            document={doc}
            onDelete={handleDeleteRequest}
          />
        ))}
      </div>
    );
  };

  // --- Search Results Shimmer ---
  const renderSearchShimmer = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/60 bg-white p-4 animate-pulse"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-100 rounded-md w-full" />
              <div className="h-3 bg-slate-100 rounded-md w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  // --- Search Results Panel ---
  const renderSearchResults = () => {
    if (!hasSearched) return null;

    return (
      <div className="mb-8 animate-in fade-in slide-in-from-top-2 duration-300">
        {/* Results header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md shadow-violet-500/20">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Web Search Results
              </h3>
              {!searching && searchResults.length > 0 && (
                <p className="text-xs text-slate-400">
                  {searchResults.length} document
                  {searchResults.length !== 1 ? "s" : ""} found for "
                  {searchQuery}"
                </p>
              )}
            </div>
          </div>
          {hasSearched && !searching && (
            <button
              onClick={handleClearSearch}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Loading state */}
        {searching && (
          <div>
            <div className="flex items-center gap-2 mt-4 mb-4 px-1">
              <Sparkles className="w-4 h-4 text-violet-500 animate-pulse" />
              <p className="text-sm text-slate-500">
                AI is searching for relevant documents...
              </p>
            </div>
            {renderSearchShimmer()}
          </div>
        )}

        {/* Results */}
        {!searching && searchResults.length > 0 && (
          <div className="space-y-3">
            {searchResults.map((result, index) => {
              const url = extractUrl(result);
              const name = extractPdfName(result);

              if (!url) return null;

              return (
                <a
                  key={index}
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3.5 p-4 rounded-xl border border-slate-200/60 bg-white hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 cursor-pointer"
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-linear-to-br from-red-50 to-orange-50 border border-red-100 flex items-center justify-center group-hover:from-emerald-50 group-hover:to-teal-50 group-hover:border-emerald-200 transition-all duration-300">
                    <FileDown
                      className="w-5 h-5 text-red-400 group-hover:text-emerald-500 transition-colors duration-300"
                      strokeWidth={1.5}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-slate-800 group-hover:text-emerald-700 truncate transition-colors duration-200">
                        {name}
                      </p>
                      <span className="flex-shrink-0 inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-red-50 text-red-400 border border-red-100">
                        PDF
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate">{url}</p>
                  </div>

                  {/* External link icon */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <ExternalLink className="w-4 h-4 text-emerald-500" />
                  </div>
                </a>
              );
            })}
          </div>
        )}

        {/* Empty results */}
        {!searching && hasSearched && searchResults.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 rounded-xl border border-dashed border-slate-200 bg-slate-50/50">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
              <Search className="w-6 h-6 text-slate-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">
              No documents found
            </p>
            <p className="text-xs text-slate-400">
              Try searching with different keywords
            </p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      {/* subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px, transparent_1px)] bg-size-[16px_16px] opacity-30 pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-medium text-slate-900 tracking-tight mb-2">
              My Documents
            </h1>
            <p className="text-slate-500 text-sm">
              Manage and organize your learning materials
            </p>
          </div>
          {documents.length > 0 && (
            <Button onClick={() => setIsUploadModalOpen(true)}>
              <Plus className="w-4 h-4" strokeWidth={2.5} />
              Upload Document
            </Button>
          )}
        </div>

        {/* Search bar */}
        <div className="mb-2">
          <div className="flex items-start gap-3">
            <div className="relative w-full max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />

              <input
                id="title-search"
                type="text"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search PDF documents on the web..."
                className={`
                  w-full
                  pl-10 pr-10 py-2.5
                  rounded-xl
                  border
                  ${searchError ? "border-red-300 focus:ring-red-500/30" : "border-slate-200 focus:ring-emerald-500/50"}
                  bg-white
                  text-sm
                  focus:outline-none
                  focus:ring-2
                  focus:border-transparent
                  transition-all
                  duration-200
                  shadow-sm
                  hover:shadow-md
                `}
              />

              {/* Clear input button */}
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors duration-200"
                >
                  <X className="w-3 h-3 text-slate-400" />
                </button>
              )}
            </div>

            <Button
              onClick={handleSearchDocument}
              disabled={isSearchDisabled}
              className={searching ? "animate-pulse" : ""}
            >
              {searching ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Globe className="w-4 h-4" strokeWidth={2} />
                  Search Web
                </>
              )}
            </Button>
          </div>

          {/* Validation error */}
          {searchError && (
            <div className="flex items-center gap-1.5 mt-2 ml-1">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              <p className="text-xs text-red-500 font-medium">{searchError}</p>
            </div>
          )}
        </div>

        {/* Character count hint */}
        {searchQuery.trim().length > 0 &&
          searchQuery.trim().length < 2 &&
          !searchError && (
            <p className="text-xs text-slate-400 ml-1 mb-6">
              Type at least 2 characters to search
            </p>
          )}

        {!searchQuery && !hasSearched && <div className="mb-8" />}

        {/* Search Results */}
        {renderSearchResults()}

        {renderContent()}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative bg-white/95 w-full max-w-md backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-6">
            {/* Close button */}
            <button
              onClick={() => setIsUploadModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className="mb-6 ">
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                Upload New Document
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Add a PDF document to your library
              </p>
            </div>

            {/* Form */}
            <form noValidate onSubmit={handleUpload} className="space-y-5">
              {/* Title Input */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 uppercase tracking-wide">
                  Document Title
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  required
                  className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl bg-slate-50/50 text-slate-900 placeholder-slate-400 text-sm font-medium focus:bg-white focus:shadow-lg focus:shadow-emerald-500/10 transition-all duration-200 focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., React Interview Prep"
                />
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-medium text-slate-700 uppercase tracking-wide">
                  PDF File
                </label>
                <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-emerald-400 hover:bg-emerald-50/30 transition-all duration-200">
                  <input
                    id="file-upload"
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={handleFileChange}
                    accept=".pdf"
                  />
                  <div className="flex flex-col items-center justify-center py-10 px-6">
                    <div className="w-14 h-14 rounded-xl bg-linear-to-r from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                      <Upload
                        className="w-7 h-7 text-emerald-600"
                        strokeWidth={2}
                      />
                    </div>
                    <p className="text-sm font-medium text-slate-700 mb-1">
                      {uploadFile ? (
                        <span className="text-emerald-600">
                          {uploadFile.name}
                        </span>
                      ) : (
                        <>
                          <span className="text-emerald-600">
                            Click to upload
                          </span>{" "}
                          or drag and drop
                        </>
                      )}
                    </p>
                    <p className="text-xs text-slate-500">PDF up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  disabled={uploading}
                  className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 h-11 px-4 bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    "Upload"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="relative bg-white/95 w-full max-w-md backdrop-blur-xl border border-slate-200/60 rounded-2xl shadow-2xl shadow-slate-900/20 p-6">
            {/* Close button */}
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all duration-200"
            >
              <X className="w-5 h-5" strokeWidth={2} />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <div className="w-12 h-12 rounded-xl bg-to-linear-to-r from-red-100 to-red-200 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-600" strokeWidth={2} />
              </div>
              <h2 className="text-xl font-medium text-slate-900 tracking-tight">
                Confirm Deletion
              </h2>
            </div>

            {/* Content */}
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete the document:{" "}
              <span className="font-semibold text-slate-900">
                {selectedDoc?.title}
              </span>
              ? This action cannot be undone.
            </p>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={deleting}
                className="flex-1 h-11 px-4 border-2 border-slate-200 rounded-xl bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 h-11 px-4 bg-linear-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                {deleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  "Delete"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
